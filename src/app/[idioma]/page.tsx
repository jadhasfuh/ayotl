import Link from "next/link";
import type { Metadata } from "next";
import { Cabecera } from "@/components/Cabecera";
import { TarjetaApp } from "@/components/TarjetaApp";
import { Tortuga } from "@/components/Tortuga";
import { APPS } from "@/lib/apps";
import { ruta, t } from "@/lib/idioma";
import { idiomaDe, metadatosDe } from "@/lib/paginas";

type Props = { params: Promise<{ idioma: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const idioma = await idiomaDe(params);
  const x = t(idioma);
  return metadatosDe("inicio", idioma, x("marca"), x("descripcionSitio"));
}

export default async function Inicio({ params }: Props) {
  const idioma = await idiomaDe(params);
  const x = t(idioma);
  return (
    <>
      <a href="#contenido" className="salto">{x("irAlContenido")}</a>
      <Cabecera idioma={idioma} pagina="inicio" />
      <main id="contenido">
        <section className="hero">
          <div className="contenedor hero-interior">
            <div>
              <span className="etiqueta-nahuatl" lang="nci">ayotl · {idioma === "es" ? "tortuga" : "turtle"}</span>
              <h1>{x("heroTitulo")}</h1>
              <p className="grande">{x("heroTexto")}</p>
              <div className="hero-botones">
                <a href="#apps" className="boton">{x("heroBotonApps")}</a>
                <Link href={ruta("beta", idioma)} className="boton secundario">{x("heroBotonBeta")}</Link>
              </div>
            </div>
            <div className="hero-tortuga"><Tortuga lado={320} /></div>
          </div>
        </section>

        <section id="apps" className="seccion franja">
          <div className="contenedor">
            <div className="seccion-cabecera">
              <h2>{x("appsTitulo")}</h2>
              <p>{x("appsTexto")}</p>
            </div>
            <ul className="tarjetas">
              {APPS.map((app) => <TarjetaApp key={app.id} app={app} idioma={idioma} />)}
            </ul>
          </div>
        </section>

        <section className="seccion">
          <div className="contenedor dos">
            <div className="panel">
              <h2>{x("betaTeaserTitulo")}</h2>
              <p>{x("betaTeaserTexto")}</p>
              <Link href={ruta("beta", idioma)} className="boton">{x("navBeta")} →</Link>
            </div>
            <div className="panel panel-tortuga">
              <Tortuga lado={56} />
              <h2>{x("acercaTeaserTitulo")}</h2>
              <p>{x("acercaTeaserTexto")}</p>
              <Link href={ruta("acerca", idioma)} className="enlace-flecha">{x("leerMas")} →</Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
