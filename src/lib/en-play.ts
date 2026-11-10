/**
 * ¿Ya es pública la ficha de una app en Google Play? Contesta 404 hasta que
 * Google la publica y 200 desde entonces (basta un HEAD: no hace falta bajar
 * la página). Las fichas de /apps son estáticas y se regeneran cada hora
 * (`revalidate`), así que la insignia sale sola a más tardar una hora después
 * de que Google publique la app, sin desplegar nada (War Zone, 27-oct-2026).
 * Si Google no contesta, se da por no publicada hasta la siguiente vuelta.
 */
export const fichaPlay = (paquete: string) => `https://play.google.com/store/apps/details?id=${paquete}`;

export async function enPlay(paquete: string): Promise<boolean> {
  try {
    const r = await fetch(fichaPlay(paquete), { method: "HEAD", signal: AbortSignal.timeout(4000) });
    return r.ok;
  } catch {
    return false;
  }
}

/**
 * Lo mismo para la App Store (Kazan, aprobada el 29-oct-2026): el lookup de
 * iTunes devuelve la app sólo cuando ya está a la venta; antes, cero
 * resultados. La ficha va sin país: Apple manda a la tienda de quien la abre.
 */
export const fichaAppStore = (id: string) => `https://apps.apple.com/app/id${id}`;

export async function enAppStore(bundle: string, id?: string): Promise<boolean> {
  // con el país: sin él, el lookup dio 0 resultados horas después de que la ficha ya respondía (Kazan, 29-oct-2026).
  // Y en dos países, y si no la ficha misma: mientras Apple publica una versión nueva, el lookup de un país puede
  // contestar 0 un rato, y la página quedaba una hora sin la insignia (ZANEI 1.0.12, 9-nov-2026).
  for (const pais of ["us", "mx"]) {
    try {
      const r = await fetch(`https://itunes.apple.com/lookup?bundleId=${bundle}&country=${pais}`, { signal: AbortSignal.timeout(4000) });
      const d = (await r.json()) as { resultCount?: number };
      if ((d.resultCount ?? 0) > 0) return true;
    } catch {}
  }
  if (id) {
    try {
      const r = await fetch(fichaAppStore(id), { method: "HEAD", signal: AbortSignal.timeout(4000) });
      if (r.ok) return true;
    } catch {}
  }
  return false;
}
