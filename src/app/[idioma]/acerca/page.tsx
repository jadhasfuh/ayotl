import type { Metadata } from "next";
import { Cabecera } from "@/components/Cabecera";
import { Tortuga } from "@/components/Tortuga";
import { t } from "@/lib/idioma";
import { idiomaDe, metadatosDe } from "@/lib/paginas";

type Props = { params: Promise<{ idioma: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const idioma = await idiomaDe(params);
  const x = t(idioma);
  return metadatosDe("acerca", idioma, x("acercaTitulo"), x("acercaTeaserTexto"));
}

export default async function Acerca({ params }: Props) {
  const idioma = await idiomaDe(params);
  const x = t(idioma);
  return (
    <>
      <a href="#contenido" className="salto">{x("irAlContenido")}</a>
      <Cabecera idioma={idioma} pagina="acerca" />
      <main id="contenido" className="seccion">
        <div className="contenedor prosa">
          <div style={{ color: "var(--caparazon)", width: 120 }}><Tortuga grosor={2} /></div>
          <h1>{x("acercaTitulo")}</h1>
          {x("acercaParrafos").map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
          <h2>{x("acercaStackTitulo")}</h2>
          <p>{x("acercaStackTexto")}</p>
          <p><a className="boton secundario" href="mailto:hola@ayotl.dev">{x("acercaContacto")}</a></p>
        </div>
      </main>
    </>
  );
}
