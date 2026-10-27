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
