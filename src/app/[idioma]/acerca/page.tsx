import type { Metadata } from "next";
import { Cabecera } from "@/components/Cabecera";
import { Tortuga } from "@/components/Tortuga";
import { t } from "@/lib/idioma";
import { idiomaDe, metadatosDe } from "@/lib/paginas";
import { sitio } from "@/lib/sitio";

const LINKEDIN = "https://www.linkedin.com/in/adrian-ceja-renter%C3%ADa-7a0b90194/";
const GITHUB = "https://github.com/jadhasfuh";

type Props = { params: Promise<{ idioma: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const idioma = await idiomaDe(params);
  const x = t(idioma);
  return metadatosDe("acerca", idioma, x("acercaTitulo"), x("acercaTeaserTexto"));
}

export default async function Acerca({ params }: Props) {
  const idioma = await idiomaDe(params);
  const x = t(idioma);
  return (
    <>
      <a href="#contenido" className="salto">{x("irAlContenido")}</a>
      <Cabecera idioma={idioma} pagina="acerca" />
      <main id="contenido" className="seccion">
        <div className="contenedor prosa">
          <div style={{ color: "var(--caparazon)" }}><Tortuga lado={120} /></div>
          <h1>{x("acercaTitulo")}</h1>
          {x("acercaParrafos").map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
          <h2>{x("acercaQuienTitulo")}</h2>
          {x("acercaQuienParrafos").map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
          <p className="enlaces-persona">
            <a href={LINKEDIN} target="_blank" rel="noopener">LinkedIn</a>
            <a href={GITHUB} target="_blank" rel="noopener">GitHub</a>
            <a href="mailto:hola@ayotl.dev">hola@ayotl.dev</a>
          </p>
          <p className="disponible">{x("acercaDisponible")}</p>

          <h2>{x("acercaStackTitulo")}</h2>
          <p>{x("acercaStackTexto")}</p>
          <p><a className="boton secundario" href="mailto:hola@ayotl.dev">{x("acercaContacto")}</a></p>

          {/*
            Para el buscador, no para quien lee: dice que ayotl.dev, los tres
            dominios y el LinkedIn son la misma persona. Sin esto, quien busque
            «Adrián Ceja Rentería» encuentra el perfil pero no el sitio.
          */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Adrián Ceja Rentería",
              url: sitio() + "/acerca",
              email: "mailto:hola@ayotl.dev",
              jobTitle: idioma === "es" ? "Desarrollador de software" : "Software developer",
              homeLocation: { "@type": "Place", name: "Sahuayo de Morelos, Michoacán, México" },
              knowsLanguage: ["es", "en", "ja"],
              sameAs: [LINKEDIN, GITHUB, "https://mercadito.cx", "https://jlptest.org", "https://dailychallenge.click"],
              worksFor: { "@type": "Organization", name: "Ayotl", url: sitio() },
            }) }}
          />
        </div>
      </main>
    </>
  );
}
