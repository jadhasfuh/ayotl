import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AvisoMuestra } from "@/components/AvisoMuestra";
import { MuestraApp } from "@/components/MuestraApp";
import { Planes } from "@/components/Planes";
import { DEMOS, demoPorSlug } from "@/lib/demos";

export function generateStaticParams() {
  return DEMOS.filter((d) => d.app).map((d) => ({ negocio: d.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ negocio: string }> }): Promise<Metadata> {
  const demo = demoPorSlug((await params).negocio);
  return {
    title: demo ? `App para ${demo.negocio} · Ayotl` : "Muestra · Ayotl",
    robots: { index: false, follow: false },
  };
}

/** Lo que una app da y una página no. Se dice aquí y no en la muestra. */
const SOLO_APP = [
  "Su icono en la pantalla del cliente, al lado de WhatsApp. No hay que acordarse de ninguna dirección.",
  "Avisos que llegan solos. Es el único canal que no se paga: el mismo alcance en Facebook cuesta dinero cada vez.",
  "«Lo de siempre» en dos toques, porque la app sí sabe quién es el cliente.",
  "La tarjeta de puntos sin el cartoncito que se pierde.",
  "Funciona con mala señal: la carta ya está descargada.",
  "Se publica en Google Play con su nombre, y aparece cuando alguien lo busca ahí.",
];

export default async function PaginaApp({ params }: { params: Promise<{ negocio: string }> }) {
  const demo = demoPorSlug((await params).negocio);
  if (!demo?.app) notFound();

  const estilo = {
    "--m-fondo": demo.color.fondo,
    "--m-tinta": demo.color.tinta,
    "--m-acento": demo.color.acento,
    "--m-suave": demo.color.suave,
    "--m-linea": "rgba(255,255,255,0.14)",
    "--m-sobre-acento": demo.color.fondo,
  } as React.CSSProperties;

  return (
    <div className={`m ${demo.tipografia}`} style={estilo}>
      <AvisoMuestra negocio={demo.negocio} />

      <main className="envoltura">
        <section className="portada" style={{ paddingBottom: 6 }}>
          <h1>Así se vería su app</h1>
          <p className="bajada">
            El mismo catálogo de siempre, cargado una sola vez, con el nombre de {demo.negocio} en la
            pantalla del cliente.
          </p>
          <nav className="cambiar">
            <a href={`/demo/${demo.slug}`}>Su página</a>
            <a href={`/demo/${demo.slug}/app`} aria-current="page">Su app</a>
          </nav>
        </section>

        <MuestraApp demo={demo} />
      </main>

      <footer className="porque">
        <div className="envoltura">
          <h2>Qué da la app que no da la página</h2>
          <ul>
            {SOLO_APP.map((linea) => <li key={linea}>{linea}</li>)}
          </ul>
          <p className="hallazgo"><b>Lo que se revisó.</b> {demo.hallazgo}</p>

          <Planes negocio={demo.negocio} />

          <p className="firma">
            La hizo <a href="https://ayotl.dev">Ayotl</a>, taller de software en Sahuayo, que ya tiene
            tres apps publicadas en Google Play. Si le sirve a {demo.negocio}, se construye de verdad.
          </p>
        </div>
      </footer>
    </div>
  );
}
