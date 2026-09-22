import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { esIdioma, ruta, t, type Idioma, type Pagina } from "./idioma";
import { sitio } from "./sitio";

export async function idiomaDe(params: Promise<{ idioma: string }>): Promise<Idioma> {
  const { idioma } = await params;
  if (!esIdioma(idioma)) notFound();
  return idioma;
}

/**
 * Los metadatos comunes a una página: título, descripción, canónica,
 * hreflang de las dos versiones y tarjeta Open Graph con la tortuga.
 */
export function metadatosDe(pagina: Pagina, idioma: Idioma, titulo: string, descripcion: string): Metadata {
  const x = t(idioma);
  const base = sitio();
  const tituloCompleto = pagina === "inicio" ? `${x("marca")} — ${x("lema")}` : `${titulo} · ${x("marca")}`;
  return {
    title: tituloCompleto,
    description: descripcion,
    alternates: {
      canonical: base + ruta(pagina, idioma),
      languages: {
        es: base + ruta(pagina, "es"),
        en: base + ruta(pagina, "en"),
        "x-default": base + ruta(pagina, "es"),
      },
    },
    openGraph: {
      type: "website",
      siteName: x("marca"),
      locale: idioma === "es" ? "es_MX" : "en_US",
      alternateLocale: idioma === "es" ? "en_US" : "es_MX",
      title: tituloCompleto,
      description: descripcion,
      url: base + ruta(pagina, idioma),
      images: [{ url: `${base}/og/${idioma}`, width: 1200, height: 630, alt: x("marca") }],
    },
    twitter: { card: "summary_large_image", title: tituloCompleto, description: descripcion },
  };
}
