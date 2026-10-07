import type { Metadata } from "next";
import { atari } from "@/app/fuentes";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecera } from "@/components/Cabecera";
import { EditorReto } from "@/components/EditorReto";
import { ruta, t, type Idioma } from "@/lib/idioma";
import { idiomaDe } from "@/lib/paginas";
import { SECCIONES, enlaceReto, publicados, retoPorSlug, type Reto } from "@/lib/retos";
import { sitio } from "@/lib/sitio";


type Props = { params: Promise<{ idioma: string; reto: string }> };

// Dinámica: el reto de mañana ya está en el JSON y tiene que aparecer solo
// mañana (ver `publicados` en lib/retos).
export const dynamic = "force-dynamic";

async function retoDe(params: Props["params"]): Promise<[Reto, Idioma]> {
  const { reto } = await params;
  const idioma = await idiomaDe(params as Promise<{ idioma: string }>);
  const ficha = retoPorSlug(reto);
  if (!ficha) notFound();
  return [ficha, idioma];
}

/** La primera línea del enunciado, sin el ejemplo: la descripción para buscadores. */
const resumen = (r: Reto) => r.enunciado.split("\n")[0];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [reto, idioma] = await retoDe(params);
  const url = sitio() + enlaceReto(reto.slug, idioma);
  const lenguajes = reto.codigo.map((c) => c.nombre.toLowerCase()).join(", ");
  const titulo = `${reto.titulo} (${lenguajes}) · Ayotl`;
  return {
    title: titulo,
    description: resumen(reto),
    alternates: {
      canonical: url,
      languages: { es: sitio() + enlaceReto(reto.slug, "es"), en: sitio() + enlaceReto(reto.slug, "en") },
    },
    openGraph: {
      type: "article", title: titulo, description: resumen(reto), url, siteName: "Ayotl",
      locale: idioma === "es" ? "es_MX" : "en_US",
      images: [{ url: `${sitio()}/og/${idioma}`, width: 1200, height: 630, alt: "Ayotl" }],
    },
    twitter: { card: "summary_large_image", title: titulo, description: resumen(reto) },
  };
}

/**
 * Markdown mínimo para `challenge.md`: párrafos, bloques ``` y, en línea,
 * **negrita** y `código`. Lo escribe ttcode con un formato fijo; meter un
 * intérprete de Markdown entero por esto sería desproporcionado.
 */
function Markdown({ texto }: { texto: string }) {
  const enLinea = (s: string) =>
    s.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) =>
      p.startsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong>
        : p.startsWith("`") ? <code key={i}>{p.slice(1, -1)}</code>
        : p);
  // El título ya va en el <h1>; se quita el «# Título» de la cabeza.
  // Y la línea «**Section:** … · **Tags:** …», que repite la cabecera.
  const trozos = texto.replace(/^# .*\n+/, "").replace(/^\*\*Section:\*\*.*\n+/m, "").split(/(```[\s\S]*?```)/);
  return (
    <>
      {trozos.flatMap((trozo, i) => {
        if (trozo.startsWith("```")) {
          return [<pre key={i} className="reto-ejemplo"><code>{trozo.replace(/^```\w*\n?|```$/g, "").trimEnd()}</code></pre>];
        }
        return trozo.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
          .map((p, j) => <p key={`${i}-${j}`}>{enLinea(p.replace(/\n/g, " "))}</p>);
      })}
    </>
  );
}

export default async function PaginaReto({ params }: Props) {
  const [reto, idioma] = await retoDe(params);
  const x = t(idioma);
  const otros = publicados().filter((r) => r.slug !== reto.slug).slice(0, 3);
  const video = reto.youtube.video ?? reto.youtube.short;

  return (
    <>
      <a href="#contenido" className="salto">{x("irAlContenido")}</a>
      <Cabecera idioma={idioma} pagina="retos" />
      <main id="contenido" className={`seccion ${atari.variable}`}>
        <article className="contenedor reto">
          <p className="dato"><Link href={ruta("retos", idioma)}>← {x("retosVolver")}</Link></p>
          <p className="dato">
            {SECCIONES[reto.seccion]} · {reto.dificultad}
            {reto.etiquetas.length > 0 && <> · {reto.etiquetas.join(", ")}</>}
          </p>
          <h1>{reto.titulo}</h1>

          <section className="prosa" aria-labelledby="enunciado" lang="en">
            <h2 id="enunciado" lang={idioma}>{x("retosEnunciado")}</h2>
            {x("retosEnunciadoIngles") && <p className="reto-aviso" lang={idioma}>{x("retosEnunciadoIngles")}</p>}
            {reto.markdown ? <Markdown texto={reto.markdown} /> : <p className="reto-enunciado">{reto.enunciado}</p>}
          </section>

          <section aria-labelledby="solucion">
            <h2 id="solucion">{x("retosCodigo")}</h2>
            <EditorReto codigo={reto.codigo}
                        textos={{ copiar: x("retosCopiar"), copiado: x("retosCopiado"), salida: x("retosSalida") }} />
          </section>

          {video && (
            <section aria-labelledby="video">
              <h2 id="video">{x("retosVideo")}</h2>
              <div className={reto.youtube.video ? "reto-video" : "reto-video vertical"}>
                <iframe src={`https://www.youtube-nocookie.com/embed/${video}`} title={reto.titulo}
                        loading="lazy" allowFullScreen
                        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" />
              </div>
              <p><a href={`https://www.youtube.com/watch?v=${video}`} target="_blank" rel="noopener">{x("retosVerYoutube")} →</a></p>
            </section>
          )}

          {otros.length > 0 && (
            <nav aria-label={x("retosVolver")} className="prosa">
              <h2>{x("retosMas")}</h2>
              <ul>
                {otros.map((r) => <li key={r.slug}><Link href={enlaceReto(r.slug, idioma)}>{r.titulo}</Link></li>)}
              </ul>
            </nav>
          )}
        </article>
      </main>
    </>
  );
}
