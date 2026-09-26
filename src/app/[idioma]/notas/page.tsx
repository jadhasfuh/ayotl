import type { Metadata } from "next";
import Link from "next/link";
import { Cabecera } from "@/components/Cabecera";
import { MarcaApp } from "@/components/MarcaApp";
import { Tortuga } from "@/components/Tortuga";
import { APPS } from "@/lib/apps";
import { ruta, t } from "@/lib/idioma";
import { NOTAS } from "@/lib/notas";
import { idiomaDe, metadatosDe } from "@/lib/paginas";

type Props = { params: Promise<{ idioma: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const idioma = await idiomaDe(params);
  const x = t(idioma);
  return metadatosDe("notas", idioma, x("notasTitulo"), x("notasIntro"));
}

export function fecha(iso: string, idioma: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString(idioma === "es" ? "es-MX" : "en-US",
    { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/** El índice: cuatro notas, de la más nueva a la más vieja. */
export default async function Notas({ params }: Props) {
  const idioma = await idiomaDe(params);
  const x = t(idioma);
  const notas = [...NOTAS].sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <>
      <a href="#contenido" className="salto">{x("irAlContenido")}</a>
      <Cabecera idioma={idioma} pagina="notas" />
      <main id="contenido" className="seccion">
        <div className="contenedor">
          <div className="prosa">
            <h1>{x("notasTitulo")}</h1>
            <p className="grande">{x("notasIntro")}</p>
          </div>

          <ul className="lista-notas">
            {notas.map((n) => {
              const app = APPS.find((a) => a.id === n.proyecto);
              return (
                <li key={n.id} data-acento={app?.acento ?? "caparazon"}>
                  {/* Las notas del propio sitio llevan la tortuga; el hueco
                      vacío dejaba el texto desalineado con las demás. */}
                  <span className="tarjeta-glifo">
                    {app ? <MarcaApp app={app.id} /> : <Tortuga lado={44} />}
                  </span>
                  <div>
                    <p className="dato">
                      {fecha(n.fecha, idioma)} · {x("notasEn")} {app?.nombre ?? "Ayotl"}
                    </p>
                    <h2>
                      <Link href={`${idioma === "en" ? "/en/notes" : "/notas"}/${n.id}`}>
                        {n.titulo[idioma]}
                      </Link>
                    </h2>
                    <p>{n.entradilla[idioma]}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="panel" style={{ marginTop: "2.5rem" }}>
            <h2>{x("psTitulo")}</h2>
            <p>{x("notasPScript")}</p>
            <Link href={ruta("pscript", idioma)} className="enlace-flecha">{x("psEjecutar")} →</Link>
          </div>
        </div>
      </main>
    </>
  );
}
