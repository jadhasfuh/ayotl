import { NextResponse } from "next/server";
import { z } from "zod";
import { avisarEnlace } from "@/lib/correo";
import { ayotl } from "@/lib/supabase-servidor";
import { verificarTurnstile } from "@/lib/turnstile";

const esquema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  idioma: z.enum(["es", "en"]).default("es"),
  turnstile: z.string().max(4096).optional().default(""),
});

/**
 * «Perdí mi enlace»: se manda otra vez al correo con el que se apuntó (o a
 * cualquiera de sus correos).
 *
 * Contesta lo mismo exista o no el correo. Si dijera «ese correo no está
 * apuntado», cualquiera podría averiguar quién es tester probando correos.
 */
export async function POST(req: Request) {
  const base = ayotl();
  if (!base) return NextResponse.json({ error: "no_disponible" }, { status: 503 });

  const r = esquema.safeParse(await req.json().catch(() => null));
  if (!r.success) return NextResponse.json({ error: "datos" }, { status: 400 });

  const ip = req.headers.get("cf-connecting-ip")
    || req.headers.get("x-forwarded-for")?.split(",")[0].trim()
    || null;
  if (!(await verificarTurnstile(r.data.turnstile, ip))) {
    return NextResponse.json({ error: "robot" }, { status: 403 });
  }

  const { data: token } = await base.rpc("token_de", { p_email: r.data.email });
  if (typeof token === "string" && token) await avisarEnlace(r.data.email, token, r.data.idioma);
  return NextResponse.json({ ok: true });
}
