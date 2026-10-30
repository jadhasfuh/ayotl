import Link from "next/link";
import type { App } from "@/lib/apps";
import { t, type Idioma } from "@/lib/idioma";
import { MarcaApp } from "./MarcaApp";

/** `play` y `appStore`: las fichas públicas de las tiendas, si ya las hay (lo decide la portada con lib/en-play). */
export function TarjetaApp({ app, idioma, play = null, appStore = null }: { app: App; idioma: Idioma; play?: string | null; appStore?: string | null }) {
  const x = t(idioma);
  return (
    <li className="tarjeta" data-acento={app.acento}>
      <div className="tarjeta-cabecera">
        <span className="tarjeta-glifo"><MarcaApp app={app.id} /></span>
        <div>
          <h3>{app.nombre}</h3>
          <span className="dominio">{app.dominio}</span>
        </div>
      </div>
      <p className="lema">{app.lema[idioma]}</p>
      <p className="descripcion">{app.descripcion[idioma]}</p>
      <ul className="datos" aria-label={app.nombre}>
        {app.datos.map((d) => (
          <li key={d.valor + d.etiqueta.es}>
            <b>{d.valor}</b>
            <span className="dato">{d.etiqueta[idioma]}</span>
          </li>
        ))}
      </ul>
      <ul className="etiquetas" aria-label={x("navApps")}>
        {app.etiquetas[idioma].map((e) => <li key={e}>{e}</li>)}
      </ul>
      {/* El enlace que cubre la tarjeta lleva a su página, no a la app: ahí
          se ve qué hace antes de decidir salir del sitio. */}
      <Link className="abrir" href={`${idioma === "en" ? "/en" : ""}/apps/${app.id}`}>
        {x("leerMas")} <span aria-hidden="true">→</span>
      </Link>
      {app.url ? (
        <a className="abrir-fuera" href={app.url} target="_blank" rel="noopener">
          {x("abrirApp")} <span aria-hidden="true">↗</span>
        </a>
      ) : (
        <span className="abrir-fuera">{x("appProximamente")}</span>
      )}
      {play && (
        <a className="abrir-fuera" href={play} target="_blank" rel="noopener">
          {x("appEnLaTienda")} <span aria-hidden="true">↗</span>
        </a>
      )}
      {appStore && (
        <a className="abrir-fuera" href={appStore} target="_blank" rel="noopener">
          {x("appEnAppStore")} <span aria-hidden="true">↗</span>
        </a>
      )}
    </li>
  );
}
