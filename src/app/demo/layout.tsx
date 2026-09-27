import type { Metadata, Viewport } from "next";
import { Inter, Literata, Martian_Mono } from "next/font/google";
import "./muestra.css";

/**
 * Layout raíz propio para las muestras.
 *
 * No comparte el de `[idioma]` a posta: una muestra tiene que verse como el
 * sitio del negocio, no como Ayotl, así que va sin la cabecera ni el pie del
 * sitio. Lo que sí lleva, y no se quita, es el aviso de que no es oficial.
 */
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--f-inter", display: "swap" });
const literata = Literata({ subsets: ["latin"], weight: ["500"], variable: "--f-literata", display: "swap" });
const mono = Martian_Mono({ subsets: ["latin"], weight: ["400"], variable: "--f-mono", display: "swap" });

export const metadata: Metadata = {
  // Ninguna muestra se indexa: no debe aparecer en una búsqueda del nombre
  // del negocio ni competir con lo suyo.
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 5 };

export default function LayoutMuestra({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${literata.variable} ${mono.variable}`}>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
