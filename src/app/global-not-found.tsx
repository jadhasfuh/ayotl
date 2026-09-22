import type { Metadata, Viewport } from "next";
import { Inter, Literata, Martian_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Cabecera } from "@/components/Cabecera";
import { Pie } from "@/components/Pie";
import { Tortuga } from "@/components/Tortuga";
import { ruta, t } from "@/lib/idioma";

/**
 * El 404 de todo el sitio. Se sirve directamente cuando la URL no coincide
 * con ninguna ruta, sin pasar por el layout de `[idioma]` (que es el raíz y
 * necesita un idioma), así que trae su propio <html>, estilos y fuente.
 *
 * Bilingüe y estático: no sabemos el idioma de quien llega, y es la página
 * que menos gente ve.
 */
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--f-inter", display: "swap" });
const literata = Literata({ subsets: ["latin"], weight: ["500"], variable: "--f-literata", display: "swap" });
const mono = Martian_Mono({ subsets: ["latin"], weight: ["400"], variable: "--f-mono", display: "swap" });

export const metadata: Metadata = {
  title: "404 · Ayotl",
  robots: { index: false },
  icons: { icon: [{ url: "/icono.svg", type: "image/svg+xml" }] },
};
export const viewport: Viewport = {
  width: "device-width", initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0e1a18" },
    { media: "(prefers-color-scheme: light)", color: "#f6f1e7" },
  ],
};

const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem("ayotl.tema");if(t==="claro"||t==="oscuro")document.documentElement.dataset.tema=t}catch(e){}})()`;

export default function NoEncontrado() {
  const es = t("es");
  const en = t("en");
  return (
    <html lang="es" className={`${inter.variable} ${literata.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body>
        <Cabecera idioma="es" pagina="inicio" />
        <main className="contenedor no-encontrado">
          <Tortuga lado={120} />
          <h1>{es("noEncontradoTitulo")}</h1>
          <p>{es("noEncontradoTexto")}</p>
          <p lang="en" style={{ color: "var(--tinta-2)" }}>{en("noEncontradoTitulo")}. {en("noEncontradoTexto")}</p>
          <p style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href={ruta("inicio", "es")} className="boton">{es("volverInicio")}</Link>
            <Link href={ruta("inicio", "en")} className="boton secundario" lang="en">{en("volverInicio")}</Link>
          </p>
        </main>
        <Pie idioma="es" />
      </body>
    </html>
  );
}
