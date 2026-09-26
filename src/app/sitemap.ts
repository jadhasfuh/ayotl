import type { MetadataRoute } from "next";
import { APPS } from "@/lib/apps";
import { PAGINAS, ruta } from "@/lib/idioma";
import { NOTAS } from "@/lib/notas";
import { sitio } from "@/lib/sitio";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = sitio();
  const apps: MetadataRoute.Sitemap = APPS.map((app) => ({
    url: `${base}/apps/${app.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
    alternates: { languages: { es: `${base}/apps/${app.id}`, en: `${base}/en/apps/${app.id}` } },
  }));
  const paginas: MetadataRoute.Sitemap = PAGINAS.map((pagina) => ({
    url: base + ruta(pagina, "es"),
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: pagina === "inicio" ? 1 : 0.7,
    alternates: {
      languages: { es: base + ruta(pagina, "es"), en: base + ruta(pagina, "en") },
    },
  }));
  const notas: MetadataRoute.Sitemap = NOTAS.map((n) => ({
    url: `${base}/notas/${n.id}`,
    lastModified: new Date(n.fecha),
    changeFrequency: "yearly" as const,
    priority: 0.6,
    alternates: { languages: { es: `${base}/notas/${n.id}`, en: `${base}/en/notes/${n.id}` } },
  }));
  return [...paginas, ...apps, ...notas];
}
