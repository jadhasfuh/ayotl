import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { esAdmin } from "@/lib/admin";
import { cruzarMercadito } from "@/lib/mercadito";

/**
 * Cruza los días de prueba de Mercadito. Lo llama `pg_cron` desde Supabase
 * con `pg_net` y la cabecera `X-Cron-Secret` (receta de la casa: el secreto
 * vive en Supabase Vault, no en el comando del cron), y también el botón
 * «Cruzar actividad» del panel, que entra con la cookie de admin.
 *
 * Mercadito no se puede cruzar en SQL como jlptest y Daily Challenge porque
 * está en otra Supabase; por eso hace falta este endpoint.
 */
export const dynamic = "force-dynamic";

function secretoValido(req: Request): boolean {
  // Se recortan los dos lados: pegar el valor en el panel de Railway deja un
  // espacio o un salto con facilidad, y entonces la comparación falla con un
  // 401 que parece un secreto equivocado. La comparación sigue siendo en
  // tiempo constante.
  const esperado = process.env.CRON_SECRETO?.trim();
  const dado = req.headers.get("x-cron-secret")?.trim();
  if (!esperado || !dado) return false;
  const a = Buffer.from(esperado), b = Buffer.from(dado);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function correr(req: Request) {
  if (!secretoValido(req) && !(await esAdmin())) {
    return NextResponse.json({ error: "no_autorizado" }, { status: 401 });
  }
  const url = new URL(req.url);
  const ayer = new Date(Date.now() - 24 * 3600 * 1000)
    .toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
  const fecha = url.searchParams.get("fecha") ?? ayer;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return NextResponse.json({ error: "datos" }, { status: 400 });

  // Quien llama aquí es el cron o el panel, así que el detalle del fallo se
  // devuelve tal cual: es lo que hace falta para depurarlo desde
  // `net._http_response`, donde está la respuesta de verdad del cron.
  try {
    const resultado = await cruzarMercadito(fecha);
    return NextResponse.json({ ok: !resultado.error, fecha, ...resultado });
  } catch (e) {
    const detalle = e instanceof Error ? e.message : String(e);
    console.error("[cron mercadito]", detalle);
    return NextResponse.json({ ok: false, fecha, error: detalle }, { status: 502 });
  }
}

export const GET = correr;
export const POST = correr;
