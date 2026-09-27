import { INTEGRACIONES, LETRA_CHICA, NIVELES } from "@/lib/planes";

/**
 * La escalera de precios al pie de la muestra.
 *
 * Se enseña después de lo que resuelve, nunca antes: primero se ve
 * funcionando, luego se habla de dinero.
 */
export function Planes({ negocio }: { negocio: string }) {
  return (
    <>
      <h2 style={{ marginTop: 30 }}>Qué cuesta</h2>
      <p style={{ opacity: 0.75, marginTop: 6 }}>
        Tres escalones. Se empieza por el de arriba, que no cuesta nada, y se sube sólo si sirve.
      </p>

      <ul className="niveles">
        {NIVELES.map((n) => (
          <li key={n.id} className={`nivel ${n.destacado ? "elegido" : ""}`}>
            {n.destacado && <span className="cinta">Lo que le propongo a {negocio}</span>}
            <h3>{n.nombre}</h3>
            <p className="cifra">
              {n.precio}
              {n.recurrente && <span> + {n.recurrente}</span>}
            </p>
            <p className="resumen">{n.resumen}</p>
            <ul className="incluye">
              {n.incluye.map((linea) => <li key={linea}>{linea}</li>)}
            </ul>
          </li>
        ))}
      </ul>

      <h2 style={{ marginTop: 30 }}>Con qué se conecta</h2>
      <ul className="conecta">
        {INTEGRACIONES.map((i) => (
          <li key={i.nombre}>
            <b>{i.nombre}</b> — {i.detalle}
          </li>
        ))}
      </ul>

      <p className="chica">{LETRA_CHICA}</p>
    </>
  );
}
