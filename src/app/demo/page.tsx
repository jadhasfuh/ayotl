import type { Metadata } from "next";
import Link from "next/link";
import { DEMOS } from "@/lib/demos";

export const metadata: Metadata = {
  title: "Muestras · Ayotl",
  robots: { index: false, follow: false },
};

const MODULOS: Record<string, string> = {
  reserva: "Reserva directa",
  carrito: "Pedido con carrito",
  citas: "Agenda de citas",
  cotizador: "Cotizador",
};

/**
 * El índice de las muestras. No se enlaza desde el sitio ni se indexa: es
 * la lista desde la que se abre una en el teléfono al visitar el negocio.
 */
export default function Muestras() {
  return (
    <div className="m sans" style={{
      "--m-fondo": "#11161a", "--m-tinta": "#e9eef2", "--m-acento": "#63c3d2",
      "--m-suave": "#1a2229", "--m-linea": "rgba(255,255,255,0.14)", "--m-sobre-acento": "#11161a",
      minHeight: "100vh",
    } as React.CSSProperties}>
      <main className="envoltura" style={{ paddingTop: 34, paddingBottom: 50 }}>
        <h1 style={{ fontSize: 26 }}>Muestras para negocios de Sahuayo</h1>
        <p className="bajada" style={{ marginTop: 10, opacity: 0.75 }}>
          Ejemplos para enseñar en el teléfono. Ninguna es el sitio del negocio: todas lo
          dicen arriba, ninguna se indexa y ningún botón le escribe a nadie.
        </p>
        <ul className="lista" style={{ marginTop: 22 }}>
          {DEMOS.map((d) => (
            <li key={d.slug} className="ficha" style={{ display: "block" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                <Link href={`/demo/${d.slug}`} className="nombre" style={{ color: "var(--m-acento)", fontSize: 17 }}>
                  {d.negocio}
                </Link>
                <span className="detalle" style={{ whiteSpace: "nowrap" }}>{MODULOS[d.modulo]}</span>
              </div>
              <p className="detalle" style={{ marginTop: 6 }}>{d.rubro} · {d.gancho}</p>
              {d.app && (
                <p style={{ marginTop: 8 }}>
                  <Link href={`/demo/${d.slug}/app`} style={{ color: "var(--m-acento)", fontSize: 13.5 }}>
                    y su app →
                  </Link>
                </p>
              )}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
