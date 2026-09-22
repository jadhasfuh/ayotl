import type { App } from "@/lib/apps";

/**
 * Un glifo por producto, de 44 px, del mismo trazo que la tortuga: un QR para
 * Mercadito, un cuadro de kanji para JLPTest y una nave de píxeles para Daily
 * Challenge.
 *
 * Dibujados a mano y no con tipografía ni imagen a propósito: heredan el
 * color del acento de la tarjeta, pesan nada y se ven igual en los dos temas.
 * Sirven para reconocer cada app al vuelo mientras se baja por la página.
 */
export function MarcaApp({ app }: { app: App["id"] }) {
  const comun = {
    viewBox: "0 0 32 32", width: 44, height: 44, fill: "none",
    stroke: "currentColor", strokeWidth: 1.8,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (app === "mercadito") {
    // Un código QR: tres ojos y unos módulos sueltos.
    return (
      <svg {...comun}>
        <rect x="3" y="3" width="9" height="9" rx="1.5" />
        <rect x="20" y="3" width="9" height="9" rx="1.5" />
        <rect x="3" y="20" width="9" height="9" rx="1.5" />
        <path d="M6.5 6.5h2v2h-2z M23.5 6.5h2v2h-2z M6.5 23.5h2v2h-2z" strokeWidth="1.4" />
        <path d="M17 17h3 M24 17h5 M17 21v4 M21 20h1 M25 21h4 M21 25h8" strokeWidth="1.8" />
      </svg>
    );
  }
  if (app === "jlptest") {
    // El cuadro de práctica de kanji: marco y guías cruzadas, con un trazo
    // dentro que sugiere un carácter sin llegar a serlo.
    return (
      <svg {...comun}>
        <rect x="3" y="3" width="26" height="26" rx="2" />
        <path d="M16 5v22 M5 16h22" strokeWidth="0.9" strokeDasharray="2 2.5" />
        <path d="M10 11h12 M16 11v11 M12 22h8" />
      </svg>
    );
  }
  // Daily Challenge: el marciano de Space Invaders, dibujado en píxeles
  // rellenos (2,5 px de lado) porque es pixel art, no línea.
  const MARCIANO = [
    "..X.....X..",
    "...X...X...",
    "..XXXXXXX..",
    ".XX.XXX.XX.",
    "XXXXXXXXXXX",
    "X.XXXXXXX.X",
    "X.X.....X.X",
    "...XX.XX...",
  ];
  const lado = 2.4;
  return (
    <svg {...comun} strokeWidth={0} fill="currentColor">
      {MARCIANO.flatMap((fila, y) =>
        [...fila].map((celda, x) =>
          celda === "X" ? (
            <rect key={`${x}-${y}`} x={2.8 + x * lado} y={6.4 + y * lado} width={lado} height={lado} />
          ) : null,
        ),
      )}
    </svg>
  );
}
