import { NextResponse } from "next/server";
import { adminConfigurado, COOKIE_ADMIN, entrarAdmin, OPCIONES_COOKIE_ADMIN } from "@/lib/admin";

export async function POST(req: Request) {
  if (!adminConfigurado()) return NextResponse.json({ error: "no_disponible" }, { status: 503 });
  let cuerpo: { contrasena?: unknown };
  try { cuerpo = await req.json(); } catch { return NextResponse.json({ error: "datos" }, { status: 400 }); }
  const contrasena = typeof cuerpo.contrasena === "string" ? cuerpo.contrasena : "";
  // Un segundo de espera por intento: suficiente para que probar a fuerza
  // bruta una contraseña larga no sea práctico, sin más infraestructura.
  await new Promise((r) => setTimeout(r, 1000));
  const cookie = entrarAdmin(contrasena);
  if (!cookie) return NextResponse.json({ error: "contrasena" }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_ADMIN, cookie, OPCIONES_COOKIE_ADMIN);
  return res;
}
