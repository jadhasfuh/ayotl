import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * El panel de administración (/admin/testers) es para una sola persona, así
 * que no hay cuentas: una contraseña en Railway (`ADMIN_SECRETO`) y una
 * cookie httpOnly con un HMAC de esa contraseña. Cambiarla en Railway cierra
 * todas las sesiones.
 *
 * Sin `ADMIN_SECRETO` el panel no existe: entrar devuelve 503.
 */
export const COOKIE_ADMIN = "ayotl.admin";
const UN_MES = 60 * 60 * 24 * 30;

function secreto(): string | null {
  const s = process.env.ADMIN_SECRETO;
  return s && s.length >= 12 ? s : null;
}

function firma(s: string): string {
  return createHmac("sha256", s).update("admin:" + COOKIE_ADMIN).digest("hex");
}

function iguales(a: string, b: string): boolean {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function adminConfigurado(): boolean {
  return secreto() !== null;
}

/** ¿La contraseña es la buena? Devuelve el valor de la cookie a poner. */
export function entrarAdmin(contrasena: string): string | null {
  const s = secreto();
  if (!s || !iguales(contrasena, s)) return null;
  return firma(s);
}

export async function esAdmin(): Promise<boolean> {
  const s = secreto();
  if (!s) return false;
  const valor = (await cookies()).get(COOKIE_ADMIN)?.value;
  return !!valor && iguales(valor, firma(s));
}

export const OPCIONES_COOKIE_ADMIN = {
  httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production",
  path: "/", maxAge: UN_MES,
};
