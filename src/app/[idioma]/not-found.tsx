import Link from "next/link";
import { Cabecera } from "@/components/Cabecera";
import { Tortuga } from "@/components/Tortuga";
import { ruta, t } from "@/lib/idioma";

/**
 * `not-found` no recibe `params`, y leer `headers()` aquí volvería dinámico
 * el segmento entero (adiós páginas estáticas). Así que el 404 es bilingüe
 * y se genera una vez: es la página que menos gente ve.
 */
export default function NoEncontrado() {
  const es = t("es");
  const en = t("en");
  return (
    <>
      <Cabecera idioma="es" pagina="inicio" />
      <main className="contenedor no-encontrado">
        <Tortuga grosor={1.5} />
        <h1>{es("noEncontradoTitulo")}</h1>
        <p>{es("noEncontradoTexto")}</p>
        <p lang="en" style={{ color: "var(--tinta-2)" }}>{en("noEncontradoTitulo")}. {en("noEncontradoTexto")}</p>
        <p style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href={ruta("inicio", "es")} className="boton">{es("volverInicio")}</Link>
          <Link href={ruta("inicio", "en")} className="boton secundario" lang="en">{en("volverInicio")}</Link>
        </p>
      </main>
    </>
  );
}
