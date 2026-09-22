import "server-only";

/**
 * Cloudflare Turnstile: el "no soy un robot" sin captcha visible.
 *
 * La clave de sitio es pública por diseño (viaja en el HTML) y baja al
 * formulario como prop desde la página, no como NEXT_PUBLIC_: así no depende
 * de que el build la vea. La secreta sólo se usa aquí.
 *
 * Sin claves (desarrollo local) el widget no se pinta y la verificación se
 * salta. Con la de sitio puesta y la secreta ausente, se rechaza todo: es
 * una configuración a medias y más vale enterarse.
 */
export function turnstileSitio(): string | null {
  return process.env.TURNSTILE_SITIO || null;
}

export async function verificarTurnstile(token: string, ip: string | null): Promise<boolean> {
  const secreto = process.env.TURNSTILE_SECRETO;
  if (!turnstileSitio()) return true;
  if (!secreto || !token) return false;

  const cuerpo = new URLSearchParams({ secret: secreto, response: token });
  if (ip) cuerpo.set("remoteip", ip);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: cuerpo,
      signal: AbortSignal.timeout(5000),
    });
    const datos = (await res.json()) as { success?: boolean };
    return datos.success === true;
  } catch {
    return false;
  }
}
