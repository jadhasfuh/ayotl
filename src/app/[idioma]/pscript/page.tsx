import type { Metadata } from "next";
import { Cabecera } from "@/components/Cabecera";
import { EditorPScript } from "@/components/EditorPScript";
import { t } from "@/lib/idioma";
import { idiomaDe, metadatosDe } from "@/lib/paginas";

type Props = { params: Promise<{ idioma: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const idioma = await idiomaDe(params);
  const x = t(idioma);
  return metadatosDe("pscript", idioma, x("psTitulo"), x("psIntro"));
}

/**
 * PScript en la web. Todo el compilador corre en el navegador de quien
 * entra: no hay endpoint que compile código ajeno, que es justo lo que uno
 * no quiere tener abierto en un servidor.
 */
export default async function PScript({ params }: Props) {
  const idioma = await idiomaDe(params);
  const x = t(idioma);

  return (
    <>
      <a href="#contenido" className="salto">{x("irAlContenido")}</a>
      <Cabecera idioma={idioma} pagina="pscript" />
      <main id="contenido" className="seccion">
        <div className="contenedor">
          <div className="prosa">
            <h1>{x("psTitulo")}</h1>
            <p className="grande">{x("psIntro")}</p>
          </div>

          <EditorPScript idioma={idioma} />

          <div className="prosa" style={{ marginTop: "2.5rem" }}>
            <h2>{x("psGramatica")}</h2>
            <figure className="codigo">
              <pre><code>{`programa            el programa empieza aquí
ent  @x;            entero        dec @y;  decimal      cart @c;  carácter
@x = 3 + 4 * 2;     asignación, con la precedencia de siempre
lec @x;             leer          imp @x;               imprimir

si @x > 10 inicio
  imp @x;
fin sino inicio
  imp 0;
fin endif

mientras @x > 0 hacer
inicio
  @x = @x - 1;
fin`}</code></pre>
            </figure>
            <p>{x("psHistoria")}</p>
            <p>{x("psAnecdota")}</p>
            <p>
              <a href="https://github.com/jadhasfuh/PScript" target="_blank" rel="noopener">
                {x("psRepo")} ↗
              </a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
