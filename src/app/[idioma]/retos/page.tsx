import type { Metadata } from "next";
import Link from "next/link";
import { Cabecera } from "@/components/Cabecera";
import { t } from "@/lib/idioma";
import { idiomaDe, metadatosDe } from "@/lib/paginas";
import { SECCIONES, enlaceReto, publicados, type Reto } from "@/lib/retos";

// Dinámica: cada día aparece el reto que toca (ver `publicados`).
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ idioma: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const idioma = await idiomaDe(params);
  const x = t(idioma);
  return metadatosDe("retos", idioma, x("retosTitulo"), x("retosIntro"));
}

/** El índice, agrupado por sección del canal, el más nuevo primero. */
export default async function Retos({ params }: Props) {
  const idioma = await idiomaDe(params);
  const x = t(idioma);
  const secciones = (Object.keys(SECCIONES) as Reto["seccion"][])
    .map((s) => [s, publicados().filter((r) => r.seccion === s)] as const)
    .filter(([, lista]) => lista.length > 0);

  return (
    <>
      <a href="#contenido" className="salto">{x("irAlContenido")}</a>
      <Cabecera idioma={idioma} pagina="retos" />
      <main id="contenido" className="seccion">
        <div className="contenedor">
          <div className="prosa">
            <h1>{x("retosTitulo")}</h1>
            <p className="grande">{x("retosIntro")}</p>
          </div>

          {secciones.length === 0 && <p className="dato" style={{ marginTop: "2rem" }}>{x("retosPronto")}</p>}

          {secciones.map(([seccion, lista]) => (
            <section key={seccion} aria-labelledby={`s-${seccion}`} className="retos-seccion">
              <h2 id={`s-${seccion}`} className="dato">{SECCIONES[seccion]}</h2>
              <ul className="lista-retos">
                {lista.map((r) => (
                  <li key={r.slug}>
                    <Link href={enlaceReto(r.slug, idioma)}>
                      <span className="lista-retos-titulo">{r.titulo}</span>
                      <span className="dato">
                        {r.dificultad} · {r.codigo.map((c) => c.nombre.toLowerCase()).join(" + ")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
