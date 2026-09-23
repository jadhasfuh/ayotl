import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecera } from "@/components/Cabecera";
import { MarcaApp } from "@/components/MarcaApp";
import { APPS, type App } from "@/lib/apps";
import { IDIOMAS, ruta, t, type Idioma } from "@/lib/idioma";
import { idiomaDe } from "@/lib/paginas";
import { sitio } from "@/lib/sitio";

type Props = { params: Promise<{ idioma: string; app: string }> };

/** Una página por app y por idioma, todas estáticas. */
export function generateStaticParams() {
  return IDIOMAS.flatMap((i) => APPS.map((a) => ({ idioma: i.id, app: a.id })));
}
export const dynamicParams = false;

async function appDe(params: Props["params"]): Promise<[App, Idioma]> {
  const { app } = await params;
  const idioma = await idiomaDe(params as Promise<{ idioma: string }>);
  const ficha = APPS.find((a) => a.id === app);
  if (!ficha) notFound();
  return [ficha, idioma];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [app, idioma] = await appDe(params);
  const titulo = `${app.nombre} — ${app.lema[idioma]}`;
  const url = `${sitio()}${idioma === "es" ? "" : "/en"}/apps/${app.id}`;
  return {
    title: `${app.nombre} · Ayotl`,
    description: app.descripcion[idioma],
    alternates: {
      canonical: url,
      languages: {
        es: `${sitio()}/apps/${app.id}`,
        en: `${sitio()}/en/apps/${app.id}`,
      },
    },
    openGraph: { type: "website", title: titulo, description: app.descripcion[idioma], url },
  };
}

/**
 * La página de cada producto: qué es, sus cifras y sus pantallas. Existe
 * para poder mandar un enlace de una sola app —a un negocio, a alguien que
 * estudia japonés— sin que tenga que bucear en la portada.
 */
export default async function PaginaApp({ params }: Props) {
  const [app, idioma] = await appDe(params);
  const x = t(idioma);
  const otras = APPS.filter((a) => a.id !== app.id);

  return (
    <>
      <a href="#contenido" className="salto">{x("irAlContenido")}</a>
      <Cabecera idioma={idioma} pagina="inicio" />
      <main id="contenido" className="seccion" data-acento={app.acento}>
        <div className="contenedor">
          <p className="dato">
            <Link href={`${ruta("inicio", idioma)}#apps`}>← {x("appVolver")}</Link>
          </p>

          <div className="app-cabecera">
            <span className="tarjeta-glifo grande"><MarcaApp app={app.id} /></span>
            <div>
              <h1>{app.nombre}</h1>
              <p className="grande">{app.lema[idioma]}</p>
            </div>
          </div>

          <p className="prosa">{app.descripcion[idioma]}</p>

          <ul className="datos grandes" aria-label={app.nombre}>
            {app.datos.map((d) => (
              <li key={d.valor + d.etiqueta.es}>
                <b>{d.valor}</b>
                <span className="dato">{d.etiqueta[idioma]}</span>
              </li>
            ))}
          </ul>

          <p className="hero-botones">
            <a href={app.url} className="boton" target="_blank" rel="noopener">
              {x("appAbrir")} {app.dominio} ↗
            </a>
            <Link href={ruta("negocios", idioma)} className="boton secundario">{x("navNegocios")}</Link>
          </p>

          <h2 style={{ marginTop: "3rem" }}>{x("appPantallas")}</h2>
          <ul className="pantallas">
            {app.pantallas.map((p) => (
              <li key={p.imagen}>
                <img src={`/capturas/${p.imagen}.webp`} alt="" width={840} height={1800} loading="lazy" />
                <div>
                  <h3>{p.titulo[idioma]}</h3>
                  <p>{p.texto[idioma]}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="prosa" style={{ marginTop: "2.5rem" }}>{x("appHechaPor")}</p>

          <h2 style={{ marginTop: "2.5rem" }}>{x("appOtras")}</h2>
          <ul className="trabajos">
            {otras.map((o) => (
              <li key={o.id} data-acento={o.acento}>
                <span className="tarjeta-glifo"><MarcaApp app={o.id} /></span>
                <div>
                  <h3>{o.nombre}</h3>
                  <p>{o.lema[idioma]}</p>
                </div>
                <Link href={`${idioma === "es" ? "" : "/en"}/apps/${o.id}`} className="enlace-flecha">
                  {x("leerMas")} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}
