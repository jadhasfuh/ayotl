import type { Metadata } from "next";
import Link from "next/link";
import { Cabecera } from "@/components/Cabecera";
import { MarcaApp } from "@/components/MarcaApp";
import { Tortuga } from "@/components/Tortuga";
import { APPS } from "@/lib/apps";
import { ruta, t } from "@/lib/idioma";
import { idiomaDe, metadatosDe } from "@/lib/paginas";
import { sitio } from "@/lib/sitio";

type Props = { params: Promise<{ idioma: string }> };

const WHATSAPP = "https://wa.me/523531522293";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const idioma = await idiomaDe(params);
  const x = t(idioma);
  return metadatosDe("negocios", idioma, x("negTitulo"), x("negIntro").slice(0, 160));
}

/**
 * La página para los negocios de la región: qué les puedo hacer, qué ya he
 * hecho y cómo contactarme. Va aparte de la portada a propósito: la portada
 * habla a quien usa las apps, ésta a quien quiere que le hagan una.
 */
export default async function Negocios({ params }: Props) {
  const idioma = await idiomaDe(params);
  const x = t(idioma);
  return (
    <>
      <a href="#contenido" className="salto">{x("irAlContenido")}</a>
      <Cabecera idioma={idioma} pagina="negocios" />
      <main id="contenido" className="seccion">
        <div className="contenedor">
          <div className="prosa">
            <p className="etiqueta-nahuatl">{x("negCercania")}</p>
            <h1>{x("negTitulo")}</h1>
            <p className="grande">{x("negIntro")}</p>
            <p className="hero-botones">
              <a href={WHATSAPP} className="boton" target="_blank" rel="noopener">{x("negWhatsapp")}</a>
              <a href="mailto:hola@ayotl.dev" className="boton secundario">hola@ayotl.dev</a>
            </p>
          </div>

          <h2 style={{ marginTop: "3rem" }}>{x("negQueHago")}</h2>
          <ul className="servicios">
            {x("negServicios").map((s) => (
              <li key={s.t}>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </li>
            ))}
          </ul>

          <h2 style={{ marginTop: "3rem" }}>{x("negMuestraTitulo")}</h2>
          {/* Capturas reales de Mercadito, hechas con la tienda de
              demostración: enseñar el producto convence más que describirlo. */}
          <ul className="capturas">
            <li>
              <img src="/capturas/mercadito-menu.webp" alt="" width={840} height={1720} loading="lazy" />
              <p>{x("negMuestraMenu")}</p>
            </li>
            <li>
              <img src="/capturas/mercadito-panel-movil.webp" alt="" width={840} height={1800} loading="lazy" />
              <p>{x("negMuestraPanel")}</p>
            </li>
            <li>
              <img src="/capturas/mercadito-mesas.webp" alt="" width={840} height={1800} loading="lazy" />
              <p>{x("negServicios")[2].d}</p>
            </li>
          </ul>

          <h2 style={{ marginTop: "3rem" }}>{x("negPrueba")}</h2>
          <p className="prosa">{x("negPruebaTexto")}</p>
          <ul className="trabajos">
            {APPS.map((app) => (
              <li key={app.id} data-acento={app.acento}>
                <span className="tarjeta-glifo"><MarcaApp app={app.id} /></span>
                <div>
                  <h3>{app.nombre}</h3>
                  <p>{app.lema[idioma]}</p>
                </div>
                <a href={app.url} target="_blank" rel="noopener" className="enlace-flecha">
                  {app.dominio} ↗
                </a>
              </li>
            ))}
          </ul>

          <div className="dos" style={{ marginTop: "3rem" }}>
            <div className="prosa">
              <h2>{x("negComo")}</h2>
              <ol className="pasos">
                {x("negPasos").map((paso) => <li key={paso.slice(0, 20)}>{paso}</li>)}
              </ol>
            </div>
            <div className="panel panel-tortuga">
              <Tortuga lado={56} />
              <h2>{x("negContacto")}</h2>
              <p>{x("negContactoTexto")}</p>
              <p className="enlaces-persona">
                <a href={WHATSAPP} target="_blank" rel="noopener">WhatsApp</a>
                <a href="mailto:hola@ayotl.dev">hola@ayotl.dev</a>
                <Link href={ruta("acerca", idioma)}>{x("navAcerca")}</Link>
              </p>
            </div>
          </div>

          {/* Para el buscador: que sepa que esto es un negocio local de
              Sahuayo que hace software, no una página más del sitio. */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: "Ayotl",
              url: sitio() + ruta("negocios", idioma),
              email: "mailto:hola@ayotl.dev",
              telephone: "+52 353 152 2293",
              areaServed: ["Sahuayo de Morelos", "Jiquilpan", "San Pedro Caro", "Michoacán", "México"],
              address: { "@type": "PostalAddress", addressLocality: "Sahuayo de Morelos", addressRegion: "Michoacán", addressCountry: "MX" },
              knowsLanguage: ["es", "en"],
              serviceType: idioma === "es"
                ? ["Desarrollo de sitios web", "Desarrollo de apps móviles", "Sistemas para negocios", "Automatización"]
                : ["Web development", "Mobile app development", "Business systems", "Automation"],
            }) }}
          />
        </div>
      </main>
    </>
  );
}
