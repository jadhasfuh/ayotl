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
          <Link href={ruta("beta", idioma)}>{x("navBeta")}</Link>
          <Link href={ruta("acerca", idioma)}>{x("navAcerca")}</Link>
          <a href="mailto:hola@ayotl.dev">hola@ayotl.dev</a>
          <a href="https://github.com/jadhasfuh" rel="me noopener">{x("pieCodigo")}</a>
        </nav>
        <p className="pie-legal">© {new Date().getFullYear()} Ayotl</p>
      </div>
    </footer>
  );
}
