import Link from "next/link";
import { ruta, t, type Idioma } from "@/lib/idioma";
import { Tortuga } from "./Tortuga";

export function Pie({ idioma }: { idioma: Idioma }) {
  const x = t(idioma);
  return (
    <footer className="pie">
      <div className="contenedor">
        <div className="pie-marca">
          <span className="marca" aria-hidden="true">
            <Tortuga lado={28} />
            <span className="marca-nombre">{x("marca")}</span>
          </span>
          <p>{x("pieHecho")}</p>
        </div>
        <nav aria-label={x("marca")}>
          <Link href={ruta("notas", idioma)}>{x("navNotas")}</Link>
          <Link href={ruta("retos", idioma)}>{x("navRetos")}</Link>
          <Link href={ruta("beta", idioma)}>{x("navBeta")}</Link>
          <Link href={ruta("acerca", idioma)}>{x("navAcerca")}</Link>
          {/* Siempre a /en/research, también desde el sitio en español: la
              página es en inglés y en la otra dirección salía con el menú en
              español alrededor. */}
          <Link href="/en/research" lang="en">Research</Link>
          <a href="mailto:hola@ayotl.dev">hola@ayotl.dev</a>
          <a href="https://github.com/jadhasfuh" rel="me noopener">{x("pieCodigo")}</a>
        </nav>
        <p className="pie-legal">© {new Date().getFullYear()} Ayotl</p>
      </div>
    </footer>
  );
}
