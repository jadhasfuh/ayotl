import { NextResponse } from "next/server";
import { z } from "zod";
import { esAdmin } from "@/lib/admin";
import { ayotl } from "@/lib/supabase-servidor";

const esquema = z.object({ fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() });

/**
 * Correr el cruce diario a mano para una fecha (lo mismo que hace el cron a
 * las 6:00). Idempotente: se puede repetir sin duplicar.
 */
export async function POST(req: Request) {
  if (!(await esAdmin())) return NextResponse.json({ error: "no_autorizado" }, { status: 401 });
  const base = ayotl();
  if (!base) return NextResponse.json({ error: "no_disponible" }, { status: 503 });
  const r = esquema.safeParse(await req.json().catch(() => ({})));
  if (!r.success) return NextResponse.json({ error: "datos" }, { status: 400 });
  const { data, error } = await base.rpc("registrar_dia", r.data.fecha ? { p_fecha: r.data.fecha } : {});
  if (error) { console.error("[admin] registrar", error.message); return NextResponse.json({ error: "generico" }, { status: 500 }); }
  return NextResponse.json({ ok: true, filas: Array.isArray(data) ? data.length : 0 });
}
