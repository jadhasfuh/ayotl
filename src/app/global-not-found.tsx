import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
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
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--fuente-ui", display: "swap" });

export const metadata: Metadata = {
  title: "404 · Ayotl",
  robots: { index: false },
  icons: { icon: [{ url: "/icono.svg", type: "image/svg+xml" }] },
};
export const viewport: Viewport = {
  width: "device-width", initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f1a19" },
    { media: "(prefers-color-scheme: light)", color: "#f6f1e7" },
  ],
};

const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem("ayotl.tema");if(t==="claro"||t==="oscuro")document.documentElement.dataset.tema=t}catch(e){}})()`;

export default function NoEncontrado() {
  const es = t("es");
  const en = t("en");
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body>
        <Cabecera idioma="es" pagina="inicio" />
        <main className="contenedor no-encontrado">
          <Tortuga grosor={1.5} />
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
