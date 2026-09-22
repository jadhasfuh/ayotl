/**
 * La tortuga: un solo trazo, sin relleno, en `currentColor`. Es el mismo
 * dibujo que public/icono.svg; si cambia uno, cambia el otro. Es un
 * placeholder hasta que haya logo definitivo.
 */
export const TRAZO_TORTUGA =
  "M5 37 C9 35 12 33 15 32 C13 16 43 8 48 30 C51 27 56 27 58 30 C63 33 63 40 58 42 C54 44 50 42 48 40 L46 47 L41 47 L42 41 C36 44 28 44 22 41 L21 47 L16 47 L18 40 C14 40 9 40 5 37 Z L15 32 L47 32";

export function Tortuga({ grosor = 3, className, titulo }: { grosor?: number; className?: string; titulo?: string }) {
  return (
    <svg
      viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={grosor}
      strokeLinecap="round" strokeLinejoin="round" className={className}
      role={titulo ? "img" : undefined} aria-hidden={titulo ? undefined : true}
    >
      {titulo && <title>{titulo}</title>}
      <path d={TRAZO_TORTUGA} />
    </svg>
  );
}
