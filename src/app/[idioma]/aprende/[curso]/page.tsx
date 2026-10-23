import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Camino } from "@/components/aprende/Camino";
import { Cabecera } from "@/components/Cabecera";
import { CURSOS, cursoPorId, rutaCurso, rutaLeccion } from "@/lib/aprende";
import type { Curso } from "@/lib/aprende/tipos";
import { IDIOMAS, ruta, t, type Idioma } from "@/lib/idioma";
import { idiomaDe } from "@/lib/paginas";
import { sitio } from "@/lib/sitio";

type Props = { params: Promise<{ idioma: string; curso: string }> };

export function generateStaticParams() {
  return IDIOMAS.flatMap((i) => CURSOS.map((c) => ({ idioma: i.id, curso: c.id })));
}
export const dynamicParams = false;

async function cursoDe(params: Props["params"]): Promise<[Curso, Idioma]> {
  const { curso } = await params;
  const idioma = await idiomaDe(params as Promise<{ idioma: string }>);
  const c = cursoPorId(curso);
  if (!c) notFound();
  return [c, idioma];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [c, idioma] = await cursoDe(params);
  const url = sitio() + rutaCurso(c.id, idioma);
  const titulo = `${c.titulo[idioma]} · Ayotl`;
  return {
    title: titulo,
    description: c.resumen[idioma],
    alternates: { canonical: url, languages: { es: sitio() + rutaCurso(c.id, "es"), en: sitio() + rutaCurso(c.id, "en") } },
    openGraph: {
      type: "website", title: titulo, description: c.resumen[idioma], url, siteName: "Ayotl",
      locale: idioma === "es" ? "es_MX" : "en_US",
      images: [{ url: `${sitio()}/og/${idioma}`, width: 1200, height: 630, alt: "Ayotl" }],
    },
    twitter: { card: "summary_large_image", title: titulo, description: c.resumen[idioma] },
  };
}

/** El camino de un curso. El avance de cada quien lo pone el navegador (Camino). */
export default async function PaginaCurso({ params }: Props) {
  const [c, idioma] = await cursoDe(params);
  const x = t(idioma);
  const unidades = c.unidades.map((u) => ({
    id: u.id,
    titulo: u.titulo[idioma],
    lecciones: u.lecciones.map((l) => ({ id: l.id, titulo: l.titulo[idioma], resumen: l.resumen[idioma], href: rutaLeccion(c.id, l.id, idioma) })),
  }));

  return (
    <>
      <a href="#contenido" className="salto">{x("irAlContenido")}</a>
      <Cabecera idioma={idioma} pagina="aprende" />
      <main id="contenido" className="seccion">
        <div className="contenedor" data-acento={c.acento}>
          <p className="dato"><Link href={ruta("aprende", idioma)}>← {x("aprendeTodosCursos")}</Link></p>
          <div className="prosa">
            <h1>{c.titulo[idioma]}</h1>
            <p className="grande">{c.intro[idioma]}</p>
          </div>
          <Camino curso={c.id} unidades={unidades} idioma={idioma} />
        </div>
      </main>
    </>
  );
}
