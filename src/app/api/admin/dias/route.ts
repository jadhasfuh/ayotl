import { NextResponse } from "next/server";
import { z } from "zod";
import { esAdmin } from "@/lib/admin";
import { APPS_BETA } from "@/lib/beta";
import { ayotl } from "@/lib/supabase-servidor";

const esquema = z.object({
  tester: z.number().int().positive(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  app: z.enum(APPS_BETA),
});

/**
 * Marcar o quitar un día a mano. Es la vía para Mercadito (otra base, sin
 * cruce automático) y para corregir lo que el cron no vio.
 */
export async function POST(req: Request) {
  if (!(await esAdmin())) return NextResponse.json({ error: "no_autorizado" }, { status: 401 });
  const base = ayotl();
  if (!base) return NextResponse.json({ error: "no_disponible" }, { status: 503 });
  const r = esquema.safeParse(await req.json().catch(() => null));
  if (!r.success) return NextResponse.json({ error: "datos" }, { status: 400 });
  const { error } = await base.from("dias_prueba").upsert(
    { ...r.data, evidencia: { manual: true } },
    { onConflict: "tester,fecha,app" },
  );
  if (error) { console.error("[admin] dia", error.message); return NextResponse.json({ error: "generico" }, { status: 500 }); }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await esAdmin())) return NextResponse.json({ error: "no_autorizado" }, { status: 401 });
  const base = ayotl();
  if (!base) return NextResponse.json({ error: "no_disponible" }, { status: 503 });
  const r = esquema.safeParse(await req.json().catch(() => null));
  if (!r.success) return NextResponse.json({ error: "datos" }, { status: 400 });
  const { error } = await base.from("dias_prueba").delete().match(r.data);
  if (error) { console.error("[admin] quitar dia", error.message); return NextResponse.json({ error: "generico" }, { status: 500 }); }
  return NextResponse.json({ ok: true });
}
