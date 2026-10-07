import localFont from "next/font/local";

/**
 * Las cuatro fuentes del sitio, desde el repo y no desde Google: el build ya
 * no sale a internet (ver LEEME.md). Se declaran una vez aquí y las importan
 * los layouts; `next/font/local` sigue autoalojándolas con su variable CSS,
 * el `size-adjust` del respaldo y el preload.
 */
export const inter = localFont({
  src: "./inter-latin.woff2", weight: "100 900", variable: "--f-inter", display: "swap",
});
export const literata = localFont({
  src: "./literata-500-latin.woff2", weight: "500", variable: "--f-literata", display: "swap",
});
export const mono = localFont({
  src: "./martian-mono-400-latin.woff2", weight: "400", variable: "--f-mono", display: "swap",
});
/** La del vídeo de ttcode; sólo la usan las páginas de reto. */
export const atari = localFont({
  src: "./press-start-2p-latin.woff2", weight: "400", variable: "--f-atari", display: "swap", preload: false,
});

export const fuentesSitio = `${inter.variable} ${literata.variable} ${mono.variable}`;
