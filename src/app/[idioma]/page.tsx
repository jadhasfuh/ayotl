import Link from "next/link";
import type { Metadata } from "next";
import { Cabecera } from "@/components/Cabecera";
import { TarjetaApp } from "@/components/TarjetaApp";
import { Tortuga } from "@/components/Tortuga";
import { APPS } from "@/lib/apps";
import { ruta, t } from "@/lib/idioma";
import { idiomaDe, metadatosDe } from "@/lib/paginas";
import { enAppStore, enPlay, fichaAppStore, fichaPlay } from "@/lib/en-play";

type Props = { params: Promise<{ idioma: string }> };

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const idioma = await idiomaDe(params);
  const x = t(idioma);
  return metadatosDe("inicio", idioma, x("marca"), x("descripcionSitio"));
}

export default async function Inicio({ params }: Props) {
  const idioma = await idiomaDe(params);
  const x = t(idioma);
  // La ficha de Play de cada app, si ya es pública: la tarjeta suma «En Google Play ↗» (29-oct-2026, Daily
  // Challenge). La portada se regenera cada hora, así que las siguientes salen solas.
  const enTienda = await Promise.all(APPS.map(async (a) => (a.paquetePlay && (await enPlay(a.paquetePlay)) ? fichaPlay(a.paquetePlay) : null)));
  const enApple = await Promise.all(APPS.map(async (a) => (a.bundleIos && a.appStoreId && (await enAppStore(a.bundleIos)) ? fichaAppStore(a.appStoreId) : null)));
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
              {APPS.map((app, k) => <TarjetaApp key={app.id} app={app} idioma={idioma} play={enTienda[k]} appStore={enApple[k]} />)}
            </ul>
          </div>
        </section>

        <section className="seccion">
          <div className="contenedor dos tres">
            <div className="panel">
              <h2>{x("betaTeaserTitulo")}</h2>
              <p>{x("betaTeaserTexto")}</p>
              <Link href={ruta("beta", idioma)} className="boton">{x("navBeta")} →</Link>
            </div>
            <div className="panel">
              <h2>{x("notasTeaserTitulo")}</h2>
              <p>{x("notasTeaserTexto")}</p>
              <Link href={ruta("notas", idioma)} className="enlace-flecha">{x("navNotas")} →</Link>
              <Link href={ruta("pscript", idioma)} className="enlace-flecha">PScript →</Link>
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
