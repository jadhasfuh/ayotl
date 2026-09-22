import type { MetadataRoute } from "next";
import { PAGINAS, ruta } from "@/lib/idioma";
import { sitio } from "@/lib/sitio";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = sitio();
  return PAGINAS.map((pagina) => ({
    url: base + ruta(pagina, "es"),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: pagina === "inicio" ? 1 : 0.7,
    alternates: {
      languages: { es: base + ruta(pagina, "es"), en: base + ruta(pagina, "en") },
    },
  }));
}
