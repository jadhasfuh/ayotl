import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { esquemaEspera } from "@/lib/beta";
import { avisarEspera } from "@/lib/correo";
import { ayotl } from "@/lib/supabase-servidor";
import { verificarTurnstile } from "@/lib/turnstile";

/**
 * Lista de espera: quien llega cuando las 14 plazas ya están ocupadas deja
 * su correo y se le avisa si se abre una o cuando haya otro programa.
 *
 * Mismas defensas que el alta normal (zod, honeypot, Turnstile), pero sin
 * límite por IP: aquí no hay nada que ganar llenándola, y el tope lo pone
 * Turnstile.
 */
export async function POST(req: Request) {
  const base = ayotl();
  if (!base) return NextResponse.json({ error: "no_disponible" }, { status: 503 });

  let cuerpo: unknown;
  try { cuerpo = await req.json(); } catch { return NextResponse.json({ error: "datos" }, { status: 400 }); }
  const r = esquemaEspera.safeParse(cuerpo);
  if (!r.success) return NextResponse.json({ error: "datos" }, { status: 400 });
  const datos = r.data;

  // Honeypot relleno: se contesta que sí sin guardar nada.
  if (datos.sitioweb) return NextResponse.json({ ok: true });

  const ip = req.headers.get("cf-connecting-ip")
    || req.headers.get("x-forwarded-for")?.split(",")[0].trim()
    || null;
  if (!(await verificarTurnstile(datos.turnstile, ip))) {
    return NextResponse.json({ error: "robot" }, { status: 403 });
  }

  const clave = process.env.SUPABASE_SECRET_KEY;
  const ip_hash = ip && clave ? createHmac("sha256", clave).update(ip).digest("hex").slice(0, 32) : null;

  const { error } = await base.from("espera").upsert({
    nombre: datos.nombre, email: datos.email,
    comentario: datos.comentario || null, idioma: datos.idioma, ip_hash,
    actualizado_en: new Date().toISOString(),
  }, { onConflict: "email" });

  if (error) {
    console.error("[espera]", error.code, error.message);
    return NextResponse.json({ error: "generico" }, { status: 500 });
  }
  await avisarEspera(datos.nombre, datos.email, datos.comentario);
  return NextResponse.json({ ok: true });
}
