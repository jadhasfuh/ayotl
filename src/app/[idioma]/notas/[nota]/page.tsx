import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecera } from "@/components/Cabecera";
import { APPS } from "@/lib/apps";
import { IDIOMAS, ruta, t, type Idioma } from "@/lib/idioma";
import { NOTAS, notaPorId, type Nota } from "@/lib/notas";
import { idiomaDe } from "@/lib/paginas";
import { sitio } from "@/lib/sitio";
import { fecha } from "../page";

type Props = { params: Promise<{ idioma: string; nota: string }> };

export function generateStaticParams() {
  return IDIOMAS.flatMap((i) => NOTAS.map((n) => ({ idioma: i.id, nota: n.id })));
}
export const dynamicParams = false;

async function notaDe(params: Props["params"]): Promise<[Nota, Idioma]> {
  const { nota } = await params;
  const idioma = await idiomaDe(params as Promise<{ idioma: string }>);
  const ficha = notaPorId(nota);
  if (!ficha) notFound();
  return [ficha, idioma];
}

function enlaceDe(n: Nota, idioma: Idioma): string {
  return `${sitio()}${idioma === "en" ? "/en/notes" : "/notas"}/${n.id}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [nota, idioma] = await notaDe(params);
  return {
    title: `${nota.titulo[idioma]} · Ayotl`,
    description: nota.entradilla[idioma],
    alternates: {
      canonical: enlaceDe(nota, idioma),
      languages: { es: enlaceDe(nota, "es"), en: enlaceDe(nota, "en") },
    },
    openGraph: {
      type: "article", title: nota.titulo[idioma], description: nota.entradilla[idioma],
      url: enlaceDe(nota, idioma), publishedTime: nota.fecha,
    },
  };
}

/** Una nota. Texto, alguna lista y algún trozo de código; nada más. */
export default async function PaginaNota({ params }: Props) {
  const [nota, idioma] = await notaDe(params);
  const x = t(idioma);
  const app = APPS.find((a) => a.id === nota.proyecto);
  const otras = NOTAS.filter((n) => n.id !== nota.id).slice(0, 2);

  return (
    <>
      <a href="#contenido" className="salto">{x("irAlContenido")}</a>
      <Cabecera idioma={idioma} pagina="notas" />
      <main id="contenido" className="seccion">
        <article className="contenedor prosa">
          <p className="dato">
            <Link href={ruta("notas", idioma)}>← {x("notasVolver")}</Link>
          </p>
          <p className="dato">
            {fecha(nota.fecha, idioma)} · {x("notasEn")}{" "}
            {app ? <a href={app.url} target="_blank" rel="noopener">{app.nombre}</a> : "Ayotl"}
          </p>
          <h1>{nota.titulo[idioma]}</h1>
          <p className="grande">{nota.entradilla[idioma]}</p>

          {nota.cuerpo.map((b, i) => {
            if (b.tipo === "p") return <p key={i}>{b.texto[idioma]}</p>;
            if (b.tipo === "lista") {
              return (
                <ul key={i}>
                  {b.puntos[idioma].map((punto) => <li key={punto.slice(0, 20)}>{punto}</li>)}
                </ul>
              );
            }
            return (
              <figure key={i} className="codigo">
                <pre><code>{b.texto}</code></pre>
                {b.pie && <figcaption>{b.pie[idioma]}</figcaption>}
              </figure>
            );
          })}

          <h2>{x("notasVolver")}</h2>
          <ul>
            {otras.map((n) => (
              <li key={n.id}>
                <Link href={`${idioma === "en" ? "/en/notes" : "/notas"}/${n.id}`}>{n.titulo[idioma]}</Link>
              </li>
            ))}
          </ul>
        </article>
      </main>
    </>
  );
}
