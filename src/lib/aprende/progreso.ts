/**
 * El progreso de cada quien en /aprende, en el localStorage de su navegador:
 * sin cuenta y sin servidor, igual que los favoritos de Mercadito. Si el
 * navegador no deja guardar (ventana privada), el curso funciona igual y sólo
 * se olvida al cerrar.
 *
 * Forma: { lecciones: { "curso/leccion": { xp, fecha } }, dias: ["AAAA-MM-DD", …], abierto: { curso: true } }
 */
export type Progreso = {
  lecciones: Record<string, { xp: number; fecha: string }>;
  dias: string[];                    // días con al menos una lección, para la racha
  abierto: Record<string, boolean>;  // cursos con todo desbloqueado
};

const CLAVE = "ayotl.aprende";
const VACIO: Progreso = { lecciones: {}, dias: [], abierto: {} };

export const hoyLocal = (d = new Date()) => d.toLocaleDateString("en-CA");

export function leerProgreso(): Progreso {
  try {
    const p = JSON.parse(localStorage.getItem(CLAVE) ?? "null");
    if (p && typeof p === "object") return { ...VACIO, ...p };
  } catch {}
  return { ...VACIO, lecciones: {}, dias: [], abierto: {} };
}

function guardar(p: Progreso) {
  try { localStorage.setItem(CLAVE, JSON.stringify(p)); } catch {}
  window.dispatchEvent(new Event("ayotl-aprende"));
}

/** Guarda una lección terminada; si se repite, se queda con la mejor xp. */
export function terminarLeccion(curso: string, leccion: string, xp: number): Progreso {
  const p = leerProgreso();
  const clave = `${curso}/${leccion}`;
  const antes = p.lecciones[clave]?.xp ?? 0;
  p.lecciones[clave] = { xp: Math.max(antes, xp), fecha: hoyLocal() };
  if (!p.dias.includes(hoyLocal())) p.dias = [...p.dias, hoyLocal()].slice(-400);
  guardar(p);
  return p;
}

export function abrirTodo(curso: string, si: boolean) {
  const p = leerProgreso();
  p.abierto[curso] = si;
  guardar(p);
}

export const xpTotal = (p: Progreso) => Object.values(p.lecciones).reduce((s, l) => s + l.xp, 0);

/** Días seguidos con alguna lección, contando hoy o, si hoy aún no, ayer. */
export function racha(p: Progreso): number {
  const dias = new Set(p.dias);
  const d = new Date();
  if (!dias.has(hoyLocal(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (dias.has(hoyLocal(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
