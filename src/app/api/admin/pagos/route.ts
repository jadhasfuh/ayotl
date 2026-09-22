import { NextResponse } from "next/server";
import { z } from "zod";
import { esAdmin } from "@/lib/admin";
import { ayotl } from "@/lib/supabase-servidor";

const esquema = z.object({
  tester: z.number().int().positive(),
  monto: z.number().int().positive().max(100000),
  medio: z.enum(["codi", "transferencia", "efectivo", "otro"]),
  referencia: z.string().trim().max(120).optional().default(""),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

/** Registrar un pago a un tester. */
export async function POST(req: Request) {
  if (!(await esAdmin())) return NextResponse.json({ error: "no_autorizado" }, { status: 401 });
  const base = ayotl();
  if (!base) return NextResponse.json({ error: "no_disponible" }, { status: 503 });
  const r = esquema.safeParse(await req.json().catch(() => null));
  if (!r.success) return NextResponse.json({ error: "datos" }, { status: 400 });
  const { error } = await base.from("pagos").insert({
    tester: r.data.tester, monto: r.data.monto, medio: r.data.medio,
    referencia: r.data.referencia || null, ...(r.data.fecha ? { fecha: r.data.fecha } : {}),
  });
  if (error) { console.error("[admin] pago", error.message); return NextResponse.json({ error: "generico" }, { status: 500 }); }
  return NextResponse.json({ ok: true });
}
