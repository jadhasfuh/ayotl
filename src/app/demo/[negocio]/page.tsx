import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AvisoMuestra } from "@/components/AvisoMuestra";
import { Muestra } from "@/components/Muestra";
import { Planes } from "@/components/Planes";
import { DEMOS, demoPorSlug } from "@/lib/demos";

export function generateStaticParams() {
  return DEMOS.map((d) => ({ negocio: d.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ negocio: string }> }): Promise<Metadata> {
  const demo = demoPorSlug((await params).negocio);
  return {
    title: demo ? `Muestra para ${demo.negocio} · Ayotl` : "Muestra · Ayotl",
    robots: { index: false, follow: false },
  };
}

export default async function PaginaMuestra({ params }: { params: Promise<{ negocio: string }> }) {
  const demo = demoPorSlug((await params).negocio);
  if (!demo) notFound();

  // La fecha se calcula aquí y baja como texto: si el componente cliente
  // llamara a `new Date()` al pintar, el servidor y el navegador podrían
  // no coincidir.
  const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });

  const estilo = {
    "--m-fondo": demo.color.fondo,
    "--m-tinta": demo.color.tinta,
    "--m-acento": demo.color.acento,
    "--m-suave": demo.color.suave,
    // Todas las muestras van sobre fondo oscuro: el filo es blanco al 14 %.
    "--m-linea": "rgba(255,255,255,0.14)",
    "--m-sobre-acento": demo.color.fondo,
  } as React.CSSProperties;

  return (
    <div className={`m ${demo.tipografia}`} style={estilo}>
      <AvisoMuestra negocio={demo.negocio} />

      <header className="cabecera">
        <div className="envoltura">
          <div className="marca">
            {demo.negocio}
            <small>{demo.rubro} · {demo.ciudad}</small>
          </div>
          {demo.telefonoVisible && <div className="tel">{demo.telefonoVisible}</div>}
        </div>
      </header>

      <main className="envoltura">
        <section className="portada">
          <h1>{demo.portada.titulo}</h1>
          <p className="bajada">{demo.portada.bajada}</p>
        </section>

        <Muestra demo={demo} hoy={hoy} />

        <p className="nota">{demo.direccion}</p>
      </main>

      <footer className="porque">
        <div className="envoltura">
          <h2>Qué resuelve esta muestra</h2>
          <p className="gancho">{demo.gancho}</p>
          <ul>
            {demo.propuesta.map((linea) => <li key={linea}>{linea}</li>)}
          </ul>
          <p className="hallazgo"><b>Lo que se revisó.</b> {demo.hallazgo}</p>

          <Planes negocio={demo.negocio} />

          <p className="firma">
            La hizo <a href="https://ayotl.dev">Ayotl</a>, taller de software en Sahuayo.
            Si le sirve a {demo.negocio}, se construye de verdad — con su nombre, sus fotos y sus precios.
          </p>
        </div>
      </footer>
    </div>
  );
}
