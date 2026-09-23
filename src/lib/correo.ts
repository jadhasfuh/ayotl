import "server-only";
import type { Registro } from "./beta";

/**
 * Aviso por correo de cada alta del programa Beta, por la API de Resend
 * (la misma cuenta que usa jlptest para sus códigos de acceso).
 *
 * Es best-effort: si falla o no está configurado, el alta ya está guardada y
 * el tester no se entera de nada. Nunca debe tumbar /api/beta.
 *
 * Requiere `RESEND_API_KEY` y que ayotl.dev esté verificado en Resend (SPF,
 * DKIM y el MX de `send`). Ese MX es de un subdominio, así que convive con el
 * Email Routing de Cloudflare, que se queda con el MX de la raíz.
 */
const DE = process.env.CORREO_DE || "Ayotl <avisos@ayotl.dev>";
const PARA = process.env.CORREO_AVISOS || "hola@ayotl.dev";

const PLATAFORMA: Record<string, string> = {
  ios: "iPhone / iPad", android: "Android", web: "Computadora / navegador",
};

function escapar(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

export async function avisarAltaBeta(datos: Registro, esNuevo: boolean): Promise<void> {
  const clave = process.env.RESEND_API_KEY;
  if (!clave) return;

  const filas: [string, string][] = [
    ["Nombre", datos.nombre],
    ["Correo", datos.email],
    ["Correo de Google", datos.email_google || "(el mismo)"],
    ["WhatsApp", datos.telefono || "—"],
    ["Dispositivo", PLATAFORMA[datos.plataforma] ?? datos.plataforma],
    ["Apps", datos.apps.join(", ")],
    ["Idioma", datos.idioma],
    ["Comentario", datos.comentario || "—"],
  ];

  const html = `<div style="font:16px/1.5 system-ui,sans-serif;color:#1c2422">
  <p style="font-size:18px"><b>${esNuevo ? "Alta nueva" : "Datos actualizados"} en el programa Beta</b></p>
  <table cellpadding="6" style="border-collapse:collapse">
    ${filas.map(([k, v]) => `<tr><td style="color:#5b635f">${k}</td><td><b>${escapar(String(v))}</b></td></tr>`).join("")}
  </table>
  <p><a href="https://ayotl.dev/admin/testers">Abrir el panel</a></p>
</div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${clave}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: DE, to: [PARA],
        reply_to: datos.email,
        subject: `Beta: ${esNuevo ? "alta" : "actualización"} de ${datos.nombre}`,
        html,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error("[beta] aviso", res.status, await res.text().catch(() => ""));
  } catch (e) {
    console.error("[beta] aviso", e instanceof Error ? e.message : e);
  }
}

/** Aviso de alguien que se queda en la lista de espera. */
export async function avisarEspera(nombre: string, email: string, comentario: string): Promise<void> {
  const clave = process.env.RESEND_API_KEY;
  if (!clave) return;
  const html = `<div style="font:16px/1.5 system-ui,sans-serif;color:#1c2422">
  <p style="font-size:18px"><b>Lista de espera del programa Beta</b></p>
  <p>${escapar(nombre)} — <b>${escapar(email)}</b></p>
  ${comentario ? `<p style="color:#5b635f">${escapar(comentario)}</p>` : ""}
  <p>Las plazas estaban llenas cuando entró.</p>
</div>`;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${clave}`, "content-type": "application/json" },
      body: JSON.stringify({ from: DE, to: [PARA], reply_to: email, subject: `Beta: lista de espera — ${nombre}`, html }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (e) {
    console.error("[espera] aviso", e instanceof Error ? e.message : e);
  }
}

/** Le manda a un tester su enlace personal de progreso. */
export async function avisarEnlace(email: string, token: string, idioma: "es" | "en"): Promise<void> {
  const clave = process.env.RESEND_API_KEY;
  if (!clave) return;
  const base = (process.env.NEXT_PUBLIC_SITIO || "https://ayotl.dev").replace(/\/$/, "");
  const enlace = `${base}${idioma === "en" ? "/en" : ""}/mi/${token}`;
  const es = idioma === "es";
  const html = `<div style="font:16px/1.5 system-ui,sans-serif;color:#1c2422">
  <p>${es ? "Aquí tienes tu enlace del programa Beta de Ayotl. Ábrelo cuando quieras para ver tus días y lo que llevas ganado:"
          : "Here's your link for Ayotl's Beta program. Open it any time to see your days and what you've earned:"}</p>
  <p><a href="${enlace}">${enlace}</a></p>
  <p style="color:#5b635f">${es ? "Guárdalo: es personal y no hace falta contraseña."
                                : "Keep it: it's personal and needs no password."}</p>
</div>`;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${clave}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: DE, to: [email],
        subject: es ? "Tu enlace del programa Beta de Ayotl" : "Your Ayotl Beta program link",
        html,
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (e) {
    console.error("[enlace] envío", e instanceof Error ? e.message : e);
  }
}
