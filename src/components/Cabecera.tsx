import Link from "next/link";
import { ruta, t, type Idioma, type Pagina } from "@/lib/idioma";
import { SelectorTema } from "./SelectorTema";
import { Tortuga } from "./Tortuga";

/**
 * Cabecera con la marca, las secciones, el selector de idioma (que lleva a
 * la misma página en el otro idioma) y el interruptor de tema.
 */
export function Cabecera({ idioma, pagina }: { idioma: Idioma; pagina: Pagina }) {
  const x = t(idioma);
  const otro: Idioma = idioma === "es" ? "en" : "es";
  const secciones: { pagina: Pagina; texto: string }[] = [
    { pagina: "inicio", texto: x("navApps") },
    { pagina: "negocios", texto: x("navNegocios") },
    { pagina: "beta", texto: x("navBeta") },
    { pagina: "acerca", texto: x("navAcerca") },
  ];
  const enlaces = secciones.map((s) => (
    <Link key={s.pagina} href={s.pagina === "inicio" ? `${ruta("inicio", idioma)}#apps` : ruta(s.pagina, idioma)}
          aria-current={s.pagina === pagina && s.pagina !== "inicio" ? "page" : undefined}>
      {s.texto}
    </Link>
  ));

  return (
    <header className="cabecera">
      <div className="contenedor">
        <Link href={ruta("inicio", idioma)} className="marca" aria-label={x("marca")}>
          <Tortuga lado={34} />
          <span className="marca-nombre">{x("marca")}</span>
        </Link>
        <nav className="nav" aria-label={x("navInicio")}>{enlaces}</nav>
        <div className="cabecera-acciones">
          <Link href={ruta(pagina, otro)} className="enlace-idioma" hrefLang={otro} lang={otro}>
            {x("cambiarIdioma")}
          </Link>
          <SelectorTema etiqueta={x("cambiarTema")} />
        </div>
      </div>
      <nav className="nav-movil" aria-label={x("navInicio")}>{enlaces}</nav>
    </header>
  );
}
