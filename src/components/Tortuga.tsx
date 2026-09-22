/**
 * El logo: una tortuga de perfil, sólo trazo, en `currentColor`.
 *
 * Es la única fuente del dibujo: el favicon (`public/icono.svg`), los PNG de
 * `/icono/[medida]` y la tarjeta de `/og/[idioma]` salen todos de estos dos
 * `path`. Si cambia el dibujo, cambia también `public/icono.svg` a mano — es
 * el único sitio donde el trazo está duplicado, porque un SVG estático no
 * puede importar de aquí.
 */

/** Caparazón, cabeza, dos patas y cola. */
export const TRAZO_TORTUGA =
  "M6 37 C6 22 15 16 25 16 C36 16 44 23 44 37 Z " +
  "M44 37 L48 31.5 L54 29.5 L59 32 L56 36 L49 37 Z " +
  "M32 37 L33 46 L40 46 L39 37 M13 37 L14 46 L21 46 L20 37 " +
  "M6 35 L3 32";

/** Igual, sin cola: a 32 px o menos el trazo suelto se lee como suciedad. */
export const TRAZO_TORTUGA_MINI =
  "M6 37 C6 22 15 16 25 16 C36 16 44 23 44 37 Z " +
  "M44 37 L48 31.5 L54 29.5 L59 32 L56 36 L49 37 Z " +
  "M32 37 L33 46 L40 46 L39 37 M13 37 L14 46 L21 46 L20 37";

/**
 * Grosor por tamaño: busca unos 2 px aparentes de 20 a 192, con algo más de
 * peso arriba para que en grande siga pareciendo un grabado y no un pelo.
 */
export function grosorTortuga(lado: number): number {
  if (lado <= 24) return 5;
  if (lado <= 32) return 4.25;
  if (lado <= 48) return 3.4;
  if (lado <= 128) return 2.9;
  if (lado <= 256) return 3;
  return 2.6;
}

export function trazoTortuga(lado: number): string {
  return lado <= 32 ? TRAZO_TORTUGA_MINI : TRAZO_TORTUGA;
}

type Props = { lado?: number; grosor?: number; className?: string; titulo?: string };

export function Tortuga({ lado = 34, grosor, className, titulo }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={lado} height={lado}
      fill="none" stroke="currentColor"
      strokeWidth={grosor ?? grosorTortuga(lado)}
      strokeLinecap="round" strokeLinejoin="round"
      className={className}
      role={titulo ? "img" : undefined}
      aria-hidden={titulo ? undefined : true}
    >
      {titulo && <title>{titulo}</title>}
      <path d={trazoTortuga(lado)} />
    </svg>
  );
}
