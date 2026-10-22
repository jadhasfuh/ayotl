import { ayotl } from "@/lib/supabase-servidor";

export const dynamic = "force-dynamic";

/**
 * Contador de visitas de toda la casa: ayotl.dev, Daily Challenge (con sus
 * juegos extra), jlptest y Mercadito mandan aquí un beacon por página vista
 * (`src/components/Visitas.tsx` en cada repo, `public/visita.js` en los juegos
 * de Daily) y aquí se suma uno en `ayotl.visitas` / `ayotl.visitantes`. Ver la
 * migración 20261021230000_ayotl_visitas.sql para las consultas.
 *
 * Vive en ayotl.dev porque es el único sitio detrás de Cloudflare: el país lo
 * pone Cloudflare en `cf-ipcountry` y la IP no se mira para nada más que para
 * frenar a quien manda cientos. Nada de lo que llega se guarda tal cual: la
 * ruta se recorta y se le quitan los identificadores, y de dónde se llegó
 * queda sólo como sitio ('google', 'ayotl.dev'…).
 *
 * Siempre contesta 204, pase lo que pase: el beacon no lee la respuesta y a
 * quien prueba a mano no le dice qué se aceptó.
 */

// Qué sitios puede anotar cada origen. Los juegos extra viven dentro de Daily.
const SITIOS: Record<string, string[]> = {
  "ayotl.dev": ["ayotl"],
  "dailychallenge.click": ["dc", "warzone", "kazan", "procesion"],
  "jlptest.org": ["jlptest"],
  "mercadito.cx": ["mercadito"],
};
const EXTRAS = new Set(["warzone", "kazan", "procesion"]);

// Lo que no es una persona con un navegador (los que no corren JS ni llegan aquí).
const BOT = /bot\b|bot\/|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|telegram|curl|wget|python|node-fetch|undici|axios|go-http|java\//i;

// Los sitios de origen con varios dominios se juntan en uno.
const CONOCIDOS: [RegExp, string][] = [
  [/(^|\.)google\.[a-z.]+$|^com\.google\.android\.googlequicksearchbox$/, "google"],
  [/^com\.google\.android\.gm$/, "gmail"],
  [/(^|\.)bing\.com$/, "bing"],
  [/(^|\.)duckduckgo\.com$/, "duckduckgo"],
  [/(^|\.)yahoo\.[a-z.]+$/, "yahoo"],
  [/(^|\.)yandex\.[a-z.]+$/, "yandex"],
  [/(^|\.)ecosia\.org$/, "ecosia"],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$|^com\.facebook\./, "facebook"],
  [/(^|\.)instagram\.com$|^com\.instagram\./, "instagram"],
  [/(^|\.)(t\.co|x\.com|twitter\.com)$/, "x"],
  [/(^|\.)(youtube\.com|youtu\.be)$|^com\.google\.android\.youtube$/, "youtube"],
  [/(^|\.)tiktok\.com$|^com\.zhiliaoapp\./, "tiktok"],
  [/(^|\.)reddit\.com$/, "reddit"],
  [/(^|\.)linkedin\.com$/, "linkedin"],
  [/(^|\.)whatsapp\.(com|net)$|^com\.whatsapp$/, "whatsapp"],
  [/(^|\.)chatgpt\.com$|(^|\.)openai\.com$/, "chatgpt"],
  [/(^|\.)perplexity\.ai$/, "perplexity"],
  [/(^|\.)play\.google\.com$|^com\.android\.vending$/, "google play"],
];

// Freno por IP en memoria: un humano no ve 120 páginas en 10 minutos.
const VENTANA_MS = 10 * 60_000;
const MAX_POR_VENTANA = 120;
const cuentas = new Map<string, { n: number; desde: number }>();

function frenado(ip: string | null): boolean {
  if (!ip) return false;
  const ahora = Date.now();
  if (cuentas.size > 5000) cuentas.clear();
  const c = cuentas.get(ip);
  if (!c || ahora - c.desde > VENTANA_MS) { cuentas.set(ip, { n: 1, desde: ahora }); return false; }
  return ++c.n > MAX_POR_VENTANA;
}

function hostDe(valor: string | null): string | null {
  if (!valor) return null;
  try { return new URL(valor).hostname.replace(/^www\./, ""); } catch { return null; }
}

/** La ruta sin consulta, sin barra final y sin nada que parezca un identificador o un token. */
function limpiarRuta(r: unknown): string | null {
  if (typeof r !== "string" || !r.startsWith("/")) return null;
  let ruta = r.split(/[?#]/)[0];
  try { ruta = decodeURIComponent(ruta); } catch { /* se queda codificada */ }
  const partes = ruta.split("/");
  for (let i = 1; i < partes.length; i++) {
    const p = partes[i];
    // La mesa de Mercadito lleva un token en la dirección.
    if (partes[i - 1] === "mesa" && p) partes[i] = ":token";
    else if (/^\d{6,}$/.test(p) || /^[0-9a-f]{8}-[0-9a-f-]{20,}$/i.test(p) || (p.length >= 16 && /\d/.test(p) && /^[\w-]+$/.test(p))) partes[i] = ":id";
  }
  ruta = partes.join("/");
  if (ruta.length > 1) ruta = ruta.replace(/\/+$/, "");
  // Ni los paneles ni la API: eso es Adrián trabajando, no visitas.
  if (/^\/(admin|api)(\/|$)/.test(ruta)) return null;
  return ruta.slice(0, 120) || "/";
}

/** De dónde llegó: 'interno', 'directo', 'app', 'dc' (a un juego extra desde Daily) o el sitio. */
function origenDe(o: unknown, primera: boolean, app: boolean, host: string, sitio: string): string {
  if (!primera) return "interno";
  if (typeof o !== "string" || !o) return app ? "app" : "directo";
  let h = o.toLowerCase();
  const desdeApp = h.startsWith("android-app:");
  if (desdeApp) h = h.slice("android-app:".length);
  h = h.replace(/^www\./, "").replace(/^m\./, "").slice(0, 100);
  if (h === host) return EXTRAS.has(sitio) ? "dc" : "interno";
  for (const [re, nombre] of CONOCIDOS) if (re.test(h)) return nombre;
  // Una app de Android que no conocemos: si es la nuestra (TWA), 'app'.
  if (desdeApp) return app ? "app" : "otra app";
  return /^[a-z0-9.-]+$/.test(h) ? h.slice(0, 60) : "otro";
}

const nada = () => new Response(null, { status: 204 });

export async function POST(req: Request) {
  const host = hostDe(req.headers.get("origin")) ?? hostDe(req.headers.get("referer"));
  if (!host || !SITIOS[host]) return nada();
  if (BOT.test(req.headers.get("user-agent") ?? "")) return nada();
  const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || null;
  if (frenado(ip)) return nada();

  const texto = await req.text().catch(() => "");
  if (texto.length > 2000) return nada();
  let c: Record<string, unknown>;
  try { c = JSON.parse(texto); } catch { return nada(); }
  if (!c || typeof c !== "object") return nada();

  const sitio = typeof c.s === "string" && SITIOS[host].includes(c.s) ? c.s : null;
  const ruta = limpiarRuta(c.r);
  if (!sitio || !ruta) return nada();
  const app = c.a === true;
  const primera = c.p === true;
  const pais = (req.headers.get("cf-ipcountry") ?? "").toUpperCase();
  const idioma = typeof c.i === "string" ? c.i.toLowerCase().split("-")[0] : "";

  const base = ayotl();
  if (!base) return nada();
  const { error } = await base.rpc("sumar_visita", {
    p_sitio: sitio,
    p_ruta: ruta,
    p_origen: origenDe(c.o, primera, app, host, sitio),
    p_app: app,
    p_nuevo: c.n === true,
    p_pais: /^[A-Z0-9]{2}$/.test(pais) ? pais : "XX",
    p_idioma: /^[a-z]{2,3}$/.test(idioma) ? idioma : "?",
    p_movil: c.m === true,
  });
  // Si la migración aún no está aplicada, falla en silencio (como /api/practica de Daily).
  if (error) console.warn("visita:", error.message);
  return nada();
}
