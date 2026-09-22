import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { esquemaRegistro, type ErrorBeta } from "@/lib/beta";
import { avisarAltaBeta } from "@/lib/correo";
import { ayotl } from "@/lib/supabase-servidor";
import { verificarTurnstile } from "@/lib/turnstile";

/**
 * Alta en el programa Beta. Es la única escritura del sitio y pasa por aquí
 * a propósito: la tabla `ayotl.testers` tiene RLS sin políticas para anon,
 * así que nadie puede insertar contra la API de Supabase aunque tenga la
 * llave publicable. El servidor valida, comprueba Turnstile, limita por IP y
 * escribe con la llave secreta.
 *
 * Por email se hace upsert: quien se apunta dos veces actualiza sus datos
 * en vez de duplicarse.
 */
const MAX_POR_IP_Y_HORA = 5;

function error(codigo: ErrorBeta, status: number) {
  return NextResponse.json({ error: codigo }, { status });
}

function ipDe(req: Request): string | null {
  // Cloudflare (si el proxy está activo) pone la real en cf-connecting-ip;
  // Railway, en el primer valor de x-forwarded-for.
  return req.headers.get("cf-connecting-ip")
    || req.headers.get("x-forwarded-for")?.split(",")[0].trim()
    || null;
}

/**
 * La IP no se guarda en claro: sólo hace falta para contar altas por
 * conexión en la última hora. Se guarda un HMAC con la llave secreta de
 * Supabase (ya es un secreto que tenemos; rotarla sólo reinicia la cuenta).
 */
function huella(ip: string | null): string | null {
  const clave = process.env.SUPABASE_SECRET_KEY;
  if (!ip || !clave) return null;
  return createHmac("sha256", clave).update(ip).digest("hex").slice(0, 32);
}

export async function POST(req: Request) {
  const base = ayotl();
  if (!base) return error("no_disponible", 503);

  let cuerpo: unknown;
  try { cuerpo = await req.json(); } catch { return error("datos", 400); }
  const resultado = esquemaRegistro.safeParse(cuerpo);
  if (!resultado.success) return error("datos", 400);
  const datos = resultado.data;

  // El honeypot relleno delata a un bot: se contesta 200 sin guardar nada,
  // para no darle pistas de que lo hemos detectado.
  if (datos.sitioweb) return NextResponse.json({ ok: true });

  const ip = ipDe(req);
  if (!(await verificarTurnstile(datos.turnstile, ip))) return error("robot", 403);

  const ip_hash = huella(ip);
  if (ip_hash) {
    const desde = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: errorCuenta } = await base
      .from("testers").select("id", { count: "exact", head: true })
      .eq("ip_hash", ip_hash).gte("actualizado_en", desde);
    if (errorCuenta) { console.error("[beta] cuenta por ip", errorCuenta.message); return error("generico", 500); }
    if ((count ?? 0) >= MAX_POR_IP_Y_HORA) return error("muchos", 429);
  }

  // ¿Ya existía? Para el asunto del aviso y, sobre todo, para el tope: quien
  // ya está dentro puede corregir sus datos aunque no queden plazas.
  const { data: previo } = await base.from("testers").select("id").eq("email", datos.email).maybeSingle();

  if (!previo) {
    const { data: plazas } = await base.rpc("plazas").maybeSingle();
    if (plazas && (plazas as { libres: number }).libres <= 0) return error("lleno", 409);
  }

  const { error: errorAlta } = await base.from("testers").upsert({
    nombre: datos.nombre,
    email: datos.email,
    plataforma: datos.plataforma,
    apps: Array.from(new Set(datos.apps)),
    comentario: datos.comentario || null,
    email_google: datos.email_google && datos.email_google !== datos.email ? datos.email_google : null,
    telefono: datos.telefono ? datos.telefono.replace(/\s+/g, "") : null,
    idioma: datos.idioma,
    ip_hash,
    actualizado_en: new Date().toISOString(),
  }, { onConflict: "email" });

  if (errorAlta) {
    // 23514 = check violado: la base rechazó algo que zod dejó pasar. Es un
    // error de datos, no del servidor, pero conviene verlo en el log.
    console.error("[beta] alta", errorAlta.code, errorAlta.message);
    return error(errorAlta.code === "23514" ? "datos" : "generico", errorAlta.code === "23514" ? 400 : 500);
  }

  // La cortesía de JLPTest: un mes de acceso completo, por el correo con el
  // que entra a las apps. Va por `public.cortesias`, que jlptest ya consulta.
  if (!previo) {
    const { error: errorCortesia } = await base.rpc("dar_cortesia", {
      p_email: datos.email_google || datos.email,
    });
    if (errorCortesia) console.error("[beta] cortesía", errorCortesia.message);
  }

  // El aviso va después de guardar y sin `await` sobre su resultado para el
  // usuario: si Resend tarda o falla, el alta ya está hecha.
  await avisarAltaBeta(datos, !previo);
  return NextResponse.json({ ok: true });
}
