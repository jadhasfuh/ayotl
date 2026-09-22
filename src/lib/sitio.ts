/**
 * De dónde se sirve el sitio, para las URL absolutas de Open Graph, sitemap,
 * robots y hreflang. Copiado de jlptest, con una diferencia: aquí las páginas
 * se generan estáticas en el build, y el Dockerfile no pasa variables a
 * `npm run build`, así que el valor por defecto es el dominio real y no
 * localhost. Es la marca: no va a cambiar.
 */
export const DOMINIO = "https://ayotl.dev";

export function sitio(): string {
  if (process.env.NODE_ENV !== "production") return "http://localhost:3002";
  return (
    process.env.SITIO_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_SITIO?.replace(/\/$/, "") ||
    DOMINIO
  );
}
