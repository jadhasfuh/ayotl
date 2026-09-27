"use client";

import { useState } from "react";
import type { Demo } from "@/lib/demos";
import { Carrito } from "./Muestra";

/**
 * La muestra de app propia.
 *
 * Es el escalón de arriba de la escalera: lo que una página no puede dar.
 * Cada pestaña existe por una razón que se dice en voz alta al enseñarla:
 *
 *  - Carta: lo mismo que en la web, para que se vea que el catálogo es uno.
 *  - Lo de siempre: repetir el pedido de siempre en dos toques. En un negocio
 *    de clientes que vuelven, esto es lo que hace que se quede la app.
 *  - Puntos: la tarjeta de sellos sin el cartoncito que se pierde.
 *  - Avisos: el único canal que le llega al cliente sin pagarle pauta a nadie.
 *
 * En el teléfono se ve a pantalla completa, que es donde se enseña; en
 * escritorio va dentro de un marco para que se lea como app y no como web.
 */

const pesos = (n: number) => "$" + n.toLocaleString("es-MX", { maximumFractionDigits: 0 });

type Pestaña = "carta" | "siempre" | "puntos" | "avisos";

const PESTAÑAS: { id: Pestaña; nombre: string; icono: string }[] = [
  { id: "carta", nombre: "Carta", icono: "☰" },
  { id: "siempre", nombre: "Lo de siempre", icono: "↻" },
  { id: "puntos", nombre: "Puntos", icono: "★" },
  { id: "avisos", nombre: "Avisos", icono: "◉" },
];

export function MuestraApp({ demo }: { demo: Demo }) {
  const app = demo.app!;
  const [donde, setDonde] = useState<Pestaña>("carta");
  const [sucursal, setSucursal] = useState(app.sucursales?.[0] ?? "");
  const [repetido, setRepetido] = useState("");

  return (
    <div className="telefono">
      <div className="pantalla">
        <header className="appBarra">
          <div>
            <div className="appNombre">{demo.negocio}</div>
            {app.sucursales ? (
              <label className="appSucursal">
                <span className="oculto">Sucursal</span>
                <select value={sucursal} onChange={(e) => setSucursal(e.target.value)}>
                  {app.sucursales.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
            ) : (
              <div className="appSucursal sinMenu">{demo.ciudad}</div>
            )}
          </div>
          <span className="appCampana" aria-hidden>◉<i /></span>
        </header>

        <div className="appCuerpo">
          {donde === "carta" && <Carrito demo={demo} desnudo />}

          {donde === "siempre" && (
            <>
              <h3 className="rubro">Lo que pides siempre</h3>
              <ul className="lista">
                {app.historial.map((h) => (
                  <li key={h.cuando} className="ficha" style={{ display: "block" }}>
                    <div className="detalle">{h.cuando}</div>
                    {h.lineas.map((l) => <div key={l} className="nombre" style={{ fontWeight: 500 }}>{l}</div>)}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, gap: 10 }}>
                      <b className="precio">{pesos(h.total)}</b>
                      <button
                        type="button" className="boton" style={{ width: "auto", padding: "9px 16px" }}
                        onClick={() => setRepetido(h.cuando)}
                      >
                        Pedir lo mismo
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {repetido && (
                <div className="mensaje">
                  <p className="etiqueta">Dos toques y el pedido está hecho</p>
                  <pre>{`Repetir el pedido de ${repetido.toLowerCase()}:
${app.historial.find((h) => h.cuando === repetido)!.lineas.map((l) => "• " + l).join("\n")}
Total: ${pesos(app.historial.find((h) => h.cuando === repetido)!.total)}`}</pre>
                </div>
              )}
              <p className="nota">Esto una página no lo puede hacer: no sabe quién eres hasta que se lo dices.</p>
            </>
          )}

          {donde === "puntos" && (
            <>
              <h3 className="rubro">Tu tarjeta</h3>
              <div className="tarjeta">
                <div className="sellos">
                  {Array.from({ length: app.lealtad.total }, (_, i) => (
                    <span key={i} className={i < app.lealtad.hechos ? "sello puesto" : "sello"} aria-hidden>
                      {i < app.lealtad.hechos ? "★" : ""}
                    </span>
                  ))}
                </div>
                <p className="premio">{app.lealtad.premio}</p>
                <p className="faltan">
                  Te {app.lealtad.total - app.lealtad.hechos === 1 ? "falta uno" : `faltan ${app.lealtad.total - app.lealtad.hechos}`}.
                </p>
              </div>
              <p className="nota">Sin cartoncito que se moja, se pierde o se olvida en el otro pantalón.</p>
            </>
          )}

          {donde === "avisos" && (
            <>
              <h3 className="rubro">Avisos</h3>
              <ul className="lista">
                {app.avisos.map((a) => (
                  <li key={a.titulo} className="ficha" style={{ display: "block" }}>
                    <div className="detalle">{a.cuando}</div>
                    <div className="nombre">{a.titulo}</div>
                    <div className="detalle">{a.texto}</div>
                  </li>
                ))}
              </ul>
              <p className="nota">
                Un aviso así le llega a quien tenga la app, y no cuesta nada. El mismo alcance en
                Facebook se paga.
              </p>
            </>
          )}
        </div>

        <nav className="appPestanas">
          {PESTAÑAS.map((p) => (
            <button key={p.id} type="button" aria-pressed={donde === p.id} onClick={() => setDonde(p.id)}>
              <span aria-hidden>{p.icono}</span>
              {p.nombre}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
