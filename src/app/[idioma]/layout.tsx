import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Pie } from "@/components/Pie";
import { IDIOMAS } from "@/lib/idioma";
import { idiomaDe } from "@/lib/paginas";
import { sitio } from "@/lib/sitio";

/**
 * Las páginas se generan estáticas para cada idioma; cualquier otro es 404.
 * Va aquí y no re-exportado desde lib: Next sólo lo reconoce como export
 * directo del fichero de ruta (re-exportado, las páginas salían dinámicas).
 */
export function generateStaticParams() {
  return IDIOMAS.map((i) => ({ idioma: i.id }));
}
export const dynamicParams = false;

// Inter autoalojada: el subconjunto latino es pequeño y así no depende de
// Google en tiempo de ejecución.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--fuente-ui",
  display: "swap",
});

export const metadata: Metadata = {
  // Sin `metadataBase` Next deja las URL de Open Graph relativas y quien
  // comparta un enlace no ve tarjeta ninguna.
  metadataBase: new URL(sitio()),
  applicationName: "Ayotl",
  icons: {
    icon: [
      { url: "/icono.svg", type: "image/svg+xml" },
      { url: "/icono/32", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/icono/180", sizes: "180x180", type: "image/png" }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1, maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f1a19" },
    { media: "(prefers-color-scheme: light)", color: "#f6f1e7" },
  ],
};

// Aplica el tema guardado antes de pintar, para que no parpadee. Va inline y
// no en un componente porque tiene que correr antes que React.
const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem("ayotl.tema");if(t==="claro"||t==="oscuro")document.documentElement.dataset.tema=t}catch(e){}})()`;

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ idioma: string }> }) {
  const idioma = await idiomaDe(params);
  return (
    // suppressHydrationWarning: el script de arriba puede haber puesto
    // data-tema antes de que React compare el HTML.
    <html lang={idioma} className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body>
        {children}
        <Pie idioma={idioma} />
      </body>
    </html>
  );
}
