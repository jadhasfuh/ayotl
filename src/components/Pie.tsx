import Link from "next/link";
import { ruta, t, type Idioma } from "@/lib/idioma";

export function Pie({ idioma }: { idioma: Idioma }) {
  const x = t(idioma);
  return (
    <footer className="pie">
      <div className="contenedor">
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} Ayotl · {x("pieHecho")}</p>
        <nav aria-label="Ayotl">
          <Link href={ruta("beta", idioma)}>{x("navBeta")}</Link>
          <Link href={ruta("acerca", idioma)}>{x("navAcerca")}</Link>
          <a href="mailto:hola@ayotl.dev">hola@ayotl.dev</a>
          <a href="https://github.com/jadhasfuh" rel="me noopener">{x("pieCodigo")}</a>
        </nav>
      </div>
    </footer>
  );
}
