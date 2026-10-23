import type { Metadata } from "next";
import Link from "next/link";
import { Cabecera } from "@/components/Cabecera";
import { CURSOS, leccionesDe, rutaCurso } from "@/lib/aprende";
import { ruta, t } from "@/lib/idioma";
import { idiomaDe, metadatosDe } from "@/lib/paginas";

type Props = { params: Promise<{ idioma: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const idioma = await idiomaDe(params);
  const x = t(idioma);
  return metadatosDe("aprende", idioma, x("aprendeTitulo"), x("aprendeIntro"));
}

/** Los cursos: uno de estructuras de datos y otro que desarma un juego de Daily Challenge. */
export default async function Aprende({ params }: Props) {
  const idioma = await idiomaDe(params);
  const x = t(idioma);

  return (
    <>
      <a href="#contenido" className="salto">{x("irAlContenido")}</a>
      <Cabecera idioma={idioma} pagina="aprende" />
      <main id="contenido" className="seccion">
        <div className="contenedor">
          <div className="prosa">
            <h1>{x("aprendeTitulo")}</h1>
            <p className="grande">{x("aprendeIntro")}</p>
          </div>

          <ul className="cursos">
            {CURSOS.map((c) => (
              <li key={c.id} className="curso-tarjeta" data-acento={c.acento}>
                <p className="dato">
                  {c.lenguaje} · {c.unidades.length} {x("aprendeUnidades")} · {leccionesDe(c).length} {x("aprendeLecciones")}
                </p>
                <h2><Link href={rutaCurso(c.id, idioma)}>{c.titulo[idioma]}</Link></h2>
                <p>{c.resumen[idioma]}</p>
                <Link href={rutaCurso(c.id, idioma)} className="enlace-flecha">{x("aprendeVerCurso")} →</Link>
              </li>
            ))}
          </ul>

          <p className="dato" style={{ marginTop: "2.5rem" }}>
            <Link href={ruta("retos", idioma)}>{x("navRetos")} →</Link>
          </p>
        </div>
      </main>
    </>
  );
}
