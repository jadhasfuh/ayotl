import Link from "next/link";
import type { App } from "@/lib/apps";
import { t, type Idioma } from "@/lib/idioma";
import { MarcaApp } from "./MarcaApp";

export function TarjetaApp({ app, idioma }: { app: App; idioma: Idioma }) {
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
      <a className="abrir-fuera" href={app.url} target="_blank" rel="noopener">
        {x("abrirApp")} <span aria-hidden="true">↗</span>
      </a>
    </li>
  );
}
