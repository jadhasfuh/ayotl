import type { Metadata } from "next";
import { atari } from "@/app/fuentes";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodigoQuieto } from "@/components/aprende/CodigoQuieto";
import { Dibujo } from "@/components/aprende/Dibujo";
import { Leccion } from "@/components/aprende/Leccion";
import { TextoRico } from "@/components/aprende/TextoRico";
import { Cabecera } from "@/components/Cabecera";
import { CURSOS, cursoPorId, leccionPorId, leccionesDe, rutaCurso, rutaLeccion } from "@/lib/aprende";
import { en, urlEn } from "@/lib/aprende/tipos";
import { IDIOMAS, t } from "@/lib/idioma";
import { idiomaDe } from "@/lib/paginas";
import { enlaceReto, publicados } from "@/lib/retos";
import { sitio } from "@/lib/sitio";

type Props = { params: Promise<{ idioma: string; curso: string; leccion: string }> };

export function generateStaticParams() {
  return IDIOMAS.flatMap((i) => CURSOS.flatMap((c) => leccionesDe(c).map((l) => ({ idioma: i.id, curso: c.id, leccion: l.id }))));
}
export const dynamicParams = false;
// Los retos enlazados aparecen el día que se publica su vídeo (ver lib/retos):
// la página se rehace cada hora en vez de quedarse con los del build.
export const revalidate = 3600;

async function datosDe(params: Props["params"]) {
  const { curso, leccion } = await params;
  const idioma = await idiomaDe(params as Promise<{ idioma: string }>);
  const c = cursoPorId(curso);
  const l = c && leccionPorId(c, leccion);
  if (!c || !l) notFound();
  return { c, ...l, idioma };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { c, leccion: l, idioma } = await datosDe(params);
  const url = sitio() + rutaLeccion(c.id, l.id, idioma);
  const titulo = `${l.titulo[idioma]} · ${c.titulo[idioma]} · Ayotl`;
  return {
    title: titulo,
    description: l.resumen[idioma],
    alternates: { canonical: url, languages: { es: sitio() + rutaLeccion(c.id, l.id, "es"), en: sitio() + rutaLeccion(c.id, l.id, "en") } },
    openGraph: {
      type: "article", title: titulo, description: l.resumen[idioma], url, siteName: "Ayotl",
      locale: idioma === "es" ? "es_MX" : "en_US",
      images: [{ url: `${sitio()}/og/${idioma}`, width: 1200, height: 630, alt: "Ayotl" }],
    },
    twitter: { card: "summary_large_image", title: titulo, description: l.resumen[idioma] },
  };
}

/**
 * Una lección. Arriba, el reproductor (una tarjeta a la vez); debajo, plegada,
 * la lección entera de corrido: para quien quiera repasar sin contestar y para
 * los buscadores, que no le dan a «Continuar».
 */
export default async function PaginaLeccion({ params }: Props) {
  const { c, leccion: l, anterior, siguiente, numero, idioma } = await datosDe(params);
  const x = t(idioma);
  const hoy = publicados();
  const retos = (l.retos ?? [])
    .map((slug) => hoy.find((r) => r.slug === slug))
    .filter((r) => r !== undefined)
    .map((r) => ({ href: enlaceReto(r.slug, idioma), titulo: r.titulo }));
  const camino = rutaCurso(c.id, idioma);

  return (
    <>
      <a href="#contenido" className="salto">{x("irAlContenido")}</a>
      <Cabecera idioma={idioma} pagina="aprende" />
      <main id="contenido" className={`seccion seccion-leccion ${atari.variable}`}>
        <div className="contenedor" data-acento={c.acento}>
          <p className="dato">
            <Link href={camino}>← {c.titulo[idioma]}</Link> · {x("aprendeLeccionDe")} {numero}/{leccionesDe(c).length}
          </p>
          <h1 className="leccion-h1">{l.titulo[idioma]}</h1>

          <Leccion curso={c.id} leccion={l} idioma={idioma} camino={camino} retos={retos}
                   siguiente={siguiente && { href: rutaLeccion(c.id, siguiente.id, idioma), titulo: siguiente.titulo[idioma] }} />

          <details className="leccion-entera">
            <summary>{x("aprendeLeerTodo")}</summary>
            {l.pasos.map((p, i) => p.tipo === "explica" && (
              <section key={i}>
                <h2>{p.titulo[idioma]}</h2>
                <div className="prosa"><TextoRico texto={p.texto[idioma]} /></div>
                {p.dibujo && <Dibujo dibujo={p.dibujo} idioma={idioma} />}
                {p.programa && <CodigoQuieto codigo={en(p.programa.codigo, idioma)} />}
                {p.programa?.notas && <div className="prosa leccion-entera-notas"><TextoRico texto={p.programa.notas[idioma]} /></div>}
              </section>
            ))}
            {(l.enlaces?.length || retos.length) ? (
              <section>
                {retos.length > 0 && (<><h2>{x("aprendePractica")}</h2><ul>{retos.map((r) => <li key={r.href}><Link href={r.href}>{r.titulo}</Link></li>)}</ul></>)}
                {l.enlaces && l.enlaces.length > 0 && (
                  <><h2>{x("aprendeLeerMas")}</h2><ul>{l.enlaces.map((e) => <li key={e.url}><a href={urlEn(e.url, idioma)} {...(e.url.startsWith("/") ? {} : { target: "_blank", rel: "noopener" })}>{e.texto[idioma]} {e.url.startsWith("/") ? "→" : "↗"}</a></li>)}</ul></>
                )}
              </section>
            ) : null}
          </details>

          <nav className="leccion-vecinas" aria-label={c.titulo[idioma]}>
            {anterior ? <Link href={rutaLeccion(c.id, anterior.id, idioma)}>← {anterior.titulo[idioma]}</Link> : <span />}
            {siguiente && <Link href={rutaLeccion(c.id, siguiente.id, idioma)}>{siguiente.titulo[idioma]} →</Link>}
          </nav>
        </div>
      </main>
    </>
  );
}

