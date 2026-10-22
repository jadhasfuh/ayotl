"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Cuenta cada página vista en el contador de la casa (ayotl.dev/api/visita;
 * las consultas están en ayotl, supabase/migrations/20261021230000_ayotl_visitas.sql).
 * Hay una copia igual en ayotl, Daily Challenge, jlptest y Mercadito, y una en
 * JS suelto en public/visita.js de Daily para sus juegos extra: lo que se
 * cambie en una va a las demás.
 *
 * Sin cookies y sin nada que identifique a nadie: el navegador sólo recuerda
 * en localStorage el día de su última visita, para que el servidor cuente
 * visitantes además de páginas. Sólo cuenta en el dominio de producción (ni
 * local ni pruebas). `?nocontar` en cualquier dirección deja de contar ese
 * navegador en ese sitio, para no contarnos a nosotros; `?contar` lo deshace.
 */
const DESTINO = "https://ayotl.dev/api/visita";
let primera = true;

export function Visitas({ sitio, host, cookieApp }: {
  sitio: string;
  /** El dominio de producción: en cualquier otro no se cuenta. */
  host: string;
  /** Cookie que deja el sitio cuando se abre desde la app de Play (jlptest: «jlpt.app»). */
  cookieApp?: string;
}) {
  const ruta = usePathname();
  useEffect(() => { contar(sitio, host, cookieApp); }, [sitio, host, cookieApp, ruta]);
  return null;
}

function contar(sitio: string, host: string, cookieApp?: string) {
  if (location.hostname !== host || navigator.webdriver) return;
  const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
  let nuevo = primera;
  try {
    const q = new URLSearchParams(location.search);
    if (q.has("nocontar")) localStorage.setItem("visita.no", "1");
    if (q.has("contar")) localStorage.removeItem("visita.no");
    if (localStorage.getItem("visita.no")) return;
    nuevo = localStorage.getItem(`visita.${sitio}`) !== hoy;
    if (nuevo) localStorage.setItem(`visita.${sitio}`, hoy);
  } catch { /* sin almacenamiento: la primera página de cada carga cuenta como visitante */ }
  // De dónde llegó, sólo el sitio (nunca la dirección completa) y sólo en la primera página.
  let origen = "";
  if (primera && document.referrer) {
    try {
      const u = new URL(document.referrer);
      origen = u.protocol === "android-app:" ? `android-app:${u.host}` : u.hostname;
    } catch { /* referencia rara: directo */ }
  }
  const app = matchMedia("(display-mode: standalone)").matches
    || (!!cookieApp && document.cookie.split("; ").includes(`${cookieApp}=1`));
  const cuerpo = JSON.stringify({
    s: sitio, r: location.pathname, p: primera, o: origen, n: nuevo, a: app,
    m: matchMedia("(pointer: coarse)").matches, i: navigator.language,
  });
  primera = false;
  // Texto plano a propósito: así el beacon a otro dominio no necesita permiso previo (CORS).
  try {
    if (!navigator.sendBeacon(DESTINO, cuerpo)) void fetch(DESTINO, { method: "POST", body: cuerpo, keepalive: true, mode: "no-cors" });
  } catch { /* sin beacon: no se cuenta */ }
}
