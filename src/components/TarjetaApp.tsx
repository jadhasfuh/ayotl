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
      <a className="abrir" href={app.url} target="_blank" rel="noopener">
        {x("abrirApp")} {app.nombre} <span aria-hidden="true">↗</span>
      </a>
    </li>
  );
}
