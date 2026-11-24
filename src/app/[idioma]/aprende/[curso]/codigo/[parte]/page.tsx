import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { atari } from "@/app/fuentes";
import { JugarPrograma } from "@/components/aprende/JugarPrograma";
import { TextoRico } from "@/components/aprende/TextoRico";
import { Cabecera } from "@/components/Cabecera";
import { EditorReto } from "@/components/EditorReto";
import { cursoPorId, rutaCurso } from "@/lib/aprende";
import { PROGRAMANDO, paraJugar, rutaCodigo, videoDe } from "@/lib/aprende/programando";
import { resaltar } from "@/lib/aprende/resaltar";
import { IDIOMAS, t } from "@/lib/idioma";
import { idiomaDe } from "@/lib/paginas";
import type { Codigo } from "@/lib/retos";
import { sitio } from "@/lib/sitio";

type Props = { params: Promise<{ idioma: string; curso: string; parte: string }> };

export function generateStaticParams() {
  return IDIOMAS.flatMap((i) => PROGRAMANDO.map((p) => ({ idioma: i.id, curso: p.curso, parte: p.id })));
}
export const dynamicParams = false;
// El vídeo aparece a la hora en que deja de ser privado: la página se rehace cada hora.
export const revalidate = 3600;

async function datosDe(params: Props["params"]) {
  const { curso, parte } = await params;
  const idioma = await idiomaDe(params as Promise<{ idioma: string }>);
  const p = PROGRAMANDO.find((q) => q.curso === curso && q.id === parte);
  const c = p && cursoPorId(p.curso);
  if (!p || !c) notFound();
  return { p, c, idioma };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { p, idioma } = await datosDe(params);
  const url = sitio() + rutaCodigo(p, idioma);
  const titulo = `${p.titulo[idioma]}: ${t(idioma)("codigoTitulo").toLowerCase()} · Ayotl`;
  return {
    title: titulo,
    description: p.resumen[idioma],
    alternates: { canonical: url, languages: { es: sitio() + rutaCodigo(p, "es"), en: sitio() + rutaCodigo(p, "en") } },
    openGraph: {
      type: "article", title: titulo, description: p.resumen[idioma], url, siteName: "Ayotl",
      locale: idioma === "es" ? "es_MX" : "en_US",
      images: [{ url: `${sitio()}/og/${idioma}`, width: 1200, height: 630, alt: "Ayotl" }],
    },
    twitter: { card: "summary_large_image", title: titulo, description: p.resumen[idioma] },
  };
}

/** El código de un vídeo de «Programando …»: jugarlo, copiarlo (por archivo o todo en uno) y cómo correrlo. */
export default async function PaginaCodigo({ params }: Props) {
  const { p, c, idioma } = await datosDe(params);
  const x = t(idioma);
  const video = videoDe(p, idioma);
  const pestana = (nombre: string, texto: string, comando: string, salida: string[]): Codigo =>
    ({ lenguaje: nombre, nombre, archivo: nombre, texto, lineas: resaltar(texto), comando, salida, ok: true });
  const codigo = [
    ...p.archivos.map((a) => pestana(a.nombre, a.texto, "npx serve", ["→ http://localhost:3000"])),
    pestana(x("codigoJunto"), p.junto, `open ${p.archivo}`, [x("codigoDobleClic")]),
  ];

  return (
    <>
      <a href="#contenido" className="salto">{x("irAlContenido")}</a>
      <Cabecera idioma={idioma} pagina="aprende" />
      <main id="contenido" className={`seccion ${atari.variable}`}>
        <div className="contenedor reto" data-acento={c.acento}>
          <p className="dato"><Link href={rutaCurso(c.id, idioma)}>← {c.titulo[idioma]}</Link></p>
          <h1>{p.titulo[idioma]}: {x("codigoTitulo").toLowerCase()}</h1>
          <div className="prosa"><TextoRico texto={p.intro[idioma]} /></div>

          {video && (
            <section aria-labelledby="video">
              <h2 id="video">{x("codigoVideo")}</h2>
              <div className="reto-video">
                <iframe src={`https://www.youtube-nocookie.com/embed/${video}`} title={p.titulo[idioma]} loading="lazy" allowFullScreen
                        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" />
              </div>
              <p><a href={`https://www.youtube.com/watch?v=${video}`} target="_blank" rel="noopener">{x("retosVerYoutube")} →</a></p>
            </section>
          )}

          <section aria-labelledby="jugar">
            <h2 id="jugar">{x("codigoJuega")}</h2>
            <JugarPrograma html={paraJugar(p)} titulo={p.titulo[idioma]}
                           textos={{ jugar: x("codigoJugar"), otra: x("codigoOtra"), ayuda: x("codigoAyuda"), arriba: x("codigoArriba"), abajo: x("codigoAbajo"),
                                     izquierda: x("codigoIzquierda"), derecha: x("codigoDerecha") }} />
          </section>

          <section aria-labelledby="copiar">
            <h2 id="copiar">{x("codigoCopia")}</h2>
            <div className="prosa"><TextoRico texto={x("codigoCopiaTexto")} /></div>
            <EditorReto codigo={codigo} textos={{ copiar: x("retosCopiar"), copiado: x("retosCopiado"), salida: x("codigoComo") }} />
          </section>

          <section aria-labelledby="correr">
            <h2 id="correr">{x("codigoComo")}</h2>
            <div className="prosa"><TextoRico texto={x("codigoComoTexto").replaceAll("{archivo}", p.archivo)} /></div>
          </section>

          <p className="dato"><Link href={rutaCurso(c.id, idioma)}>{x("codigoCurso")} →</Link></p>
        </div>
      </main>
    </>
  );
}
