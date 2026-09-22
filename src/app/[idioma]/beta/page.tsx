import type { Metadata } from "next";
import { Cabecera } from "@/components/Cabecera";
import { FormularioBeta } from "@/components/FormularioBeta";
import { t } from "@/lib/idioma";
import { idiomaDe, metadatosDe } from "@/lib/paginas";
import { ayotl } from "@/lib/supabase-servidor";
import { turnstileSitio } from "@/lib/turnstile";

type Props = { params: Promise<{ idioma: string }> };

// La clave de sitio de Turnstile se lee al servir, no en el build: el
// Dockerfile no pasa variables a `npm run build`.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const idioma = await idiomaDe(params);
  const x = t(idioma);
  return metadatosDe("beta", idioma, x("betaTitulo"), x("betaTeaserTexto"));
}

export default async function Beta({ params }: Props) {
  const idioma = await idiomaDe(params);
  const x = t(idioma);
  // Las plazas se leen al servir: si se llenan, el formulario se sustituye
  // por un aviso en vez de aceptar altas que luego hay que rechazar.
  const { data: plazas } = (await ayotl()?.rpc("plazas").maybeSingle()) ?? { data: null };
  const { cupo, libres } = (plazas as { cupo: number; libres: number } | null) ?? { cupo: 14, libres: null };
  return (
    <>
      <a href="#contenido" className="salto">{x("irAlContenido")}</a>
      <Cabecera idioma={idioma} pagina="beta" />
      <main id="contenido" className="seccion">
        <div className="contenedor formulario-cuadricula">
          <div>
            <h1>{x("betaTitulo")}</h1>
            <p className="grande">{x("betaIntro")}</p>
            {libres !== null && <p className="dato" style={{ marginTop: "-0.5rem" }}>{x("betaPlazas")(libres, cupo)}</p>}
            <h2 style={{ fontSize: "1.2rem", marginTop: "2rem" }}>{x("betaQueRecibes")}</h2>
            <ul className="ventajas">
              {x("betaVentajas").map((v) => <li key={v}>{v}</li>)}
            </ul>
          </div>
          <FormularioBeta idioma={idioma} turnstileSitio={turnstileSitio()} libres={libres} />
        </div>
      </main>
    </>
  );
}
