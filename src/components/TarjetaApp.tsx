import type { App } from "@/lib/apps";
import { t, type Idioma } from "@/lib/idioma";

export function TarjetaApp({ app, idioma }: { app: App; idioma: Idioma }) {
  const x = t(idioma);
  return (
    <li className="tarjeta" data-acento={app.acento}>
      <div className="tarjeta-cabecera">
        <h3>{app.nombre}</h3>
        <span className="dominio">{app.dominio}</span>
      </div>
      <p className="lema">{app.lema[idioma]}</p>
      <p className="descripcion">{app.descripcion[idioma]}</p>
      <ul className="etiquetas" aria-label={x("navApps")}>
        {app.etiquetas[idioma].map((e) => <li key={e}>{e}</li>)}
      </ul>
      <a className="abrir" href={app.url} target="_blank" rel="noopener">
        {x("abrirApp")} {app.nombre} ↗
      </a>
    </li>
  );
}
