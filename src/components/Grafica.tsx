import type { Idioma } from "@/lib/idioma";
import type { BloqueGrafica, BloqueCifras } from "@/lib/notas";

/**
 * Las gráficas de las notas (2-nov-2026, el estudio de octubre del piloto de Mercadito): SVG hecho en el
 * servidor, sin librería. Una sola serie, del color de acento (`--agua`); lo que no tiene dato va en gris y
 * dice por qué. Barras de 24 px como mucho, con la punta redondeada y la base recta; rejilla de un pixel;
 * sólo se rotula el valor más alto (el resto lo dan el eje, la descripción al pasar el cursor —el <title>
 * de cada barra— y la tabla de abajo, que siempre está).
 */
const AN = 460;   // un lienzo angosto: en un teléfono de 360 px la letra queda en ~10 px, y en escritorio no pasa de 560 px

function redondo(n: number): number {
  const p = 10 ** Math.floor(Math.log10(Math.max(1, n)));
  return [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].map((k) => k * p).find((k) => k >= n) ?? n;
}

function etiqueta(e: string | Record<Idioma, string>, idioma: Idioma): string {
  return typeof e === "string" ? e : e[idioma];
}

function num(n: number, idioma: Idioma): string {
  return n.toLocaleString(idioma === "es" ? "es-MX" : "en-US", { maximumFractionDigits: 1 });
}

/** Columna con la punta redondeada (4 px) y la base recta. */
function columna(x: number, y: number, w: number, base: number): string {
  const r = Math.min(4, w / 2, base - y);
  return `M${x},${base} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${base} Z`;
}

/** Barra horizontal con la punta (a la derecha) redondeada. */
function barra(x: number, y: number, w: number, h: number): string {
  const r = Math.min(4, h / 2, w);
  return `M${x},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} H${x} Z`;
}

export function Grafica({ g, idioma }: { g: BloqueGrafica; idioma: Idioma }) {
  const titulo = g.titulo[idioma];
  const unidad = g.unidad[idioma];
  const con = g.datos.filter((d) => d.valor != null) as { valor: number }[];
  const max = redondo(Math.max(...con.map((d) => d.valor)));
  const alto = Math.max(...con.map((d) => d.valor));
  const desc = (d: BloqueGrafica["datos"][number]) =>
    `${etiqueta(d.etiqueta, idioma)}: ${d.valor == null ? (d.falta?.[idioma] ?? "—") : `${num(d.valor, idioma)} ${unidad}`}`;

  let svg;
  if (g.forma === "columnas") {
    const H = 200, arriba = 18, abajo = 26, izq = 34, ancho = AN - izq - 4;
    const base = H - abajo, banda = ancho / g.datos.length, w = Math.min(24, banda * 0.72);
    const ticks = [0, 0.5, 1].map((k) => k * max);
    const cada = g.cadaEtiqueta ?? 1;
    svg = (
      <svg viewBox={`0 0 ${AN} ${H}`} role="img" aria-label={titulo}>
        {ticks.map((v) => {
          const y = base - (v / max) * (base - arriba);
          return (
            <g key={v} className="grafica-eje">
              <line x1={izq} x2={AN} y1={y} y2={y} />
              <text x={izq - 6} y={y + 4} textAnchor="end">{num(v, idioma)}</text>
            </g>
          );
        })}
        {g.datos.map((d, i) => {
          const x = izq + i * banda + (banda - w) / 2;
          const rotulo = i % cada === 0 || i === g.datos.length - 1;
          if (d.valor == null) {
            return (
              <g key={i} className="grafica-falta">
                <title>{desc(d)}</title>
                <rect x={izq + i * banda} y={arriba} width={banda} height={base - arriba} fill="transparent" />
                <line x1={x} x2={x + w} y1={base - 1} y2={base - 1} />
                {rotulo && <text x={x + w / 2} y={H - 8} textAnchor="middle">{etiqueta(d.etiqueta, idioma)}</text>}
              </g>
            );
          }
          const y = base - (d.valor / max) * (base - arriba);
          return (
            <g key={i} className="grafica-marca">
              <title>{desc(d)}</title>
              <rect x={izq + i * banda} y={arriba} width={banda} height={base - arriba} fill="transparent" />
              <path d={columna(x, y, w, base)} className={d.gris ? "gris" : undefined} />
              {d.valor === alto && <text x={x + w / 2} y={y - 5} textAnchor="middle" className="grafica-valor">{num(d.valor, idioma)}</text>}
              {rotulo && <text x={x + w / 2} y={H - 8} textAnchor="middle">{etiqueta(d.etiqueta, idioma)}</text>}
            </g>
          );
        })}
      </svg>
    );
  } else {
    const fila = 30, h = 18, izq = g.anchoEtiqueta ?? 170, der = 44;
    const H = g.datos.length * fila + 4, ancho = AN - izq - der;
    svg = (
      <svg viewBox={`0 0 ${AN} ${H}`} role="img" aria-label={titulo}>
        <line x1={izq} x2={izq} y1={0} y2={H} className="grafica-base" />
        {g.datos.map((d, i) => {
          const y = i * fila + (fila - h) / 2, w = d.valor == null ? 0 : Math.max(2, (d.valor / max) * ancho);
          return (
            <g key={i} className="grafica-marca">
              <title>{desc(d)}</title>
              <rect x={0} y={i * fila} width={AN} height={fila} fill="transparent" />
              <text x={izq - 8} y={y + h / 2 + 4} textAnchor="end" className="grafica-cat">{etiqueta(d.etiqueta, idioma)}</text>
              {d.valor != null && <path d={barra(izq, y, w, h)} className={d.gris ? "gris" : undefined} />}
              <text x={izq + w + 6} y={y + h / 2 + 4} className="grafica-valor">
                {d.valor == null ? "—" : `${num(d.valor, idioma)}${g.sufijo ?? ""}`}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  return (
    <figure className="grafica">
      <figcaption className="grafica-titulo">{titulo}</figcaption>
      {svg}
      {g.pie && <p className="grafica-pie">{g.pie[idioma]}</p>}
      <details className="grafica-tabla">
        <summary>{idioma === "es" ? "Ver los datos" : "See the data"}</summary>
        <table>
          <tbody>
            {g.datos.map((d, i) => (
              <tr key={i}>
                <th scope="row">{etiqueta(d.etiqueta, idioma)}</th>
                <td>{d.valor == null ? (d.falta?.[idioma] ?? "—") : `${num(d.valor, idioma)} ${unidad}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

/** Una fila de cifras: el dato grande y qué es. */
export function Cifras({ b, idioma }: { b: BloqueCifras; idioma: Idioma }) {
  return (
    <dl className="cifras">
      {b.cifras.map((c) => (
        <div key={c.etiqueta.es}>
          <dt>{c.etiqueta[idioma]}</dt>
          <dd>{typeof c.valor === "string" ? c.valor : c.valor[idioma]}</dd>
        </div>
      ))}
    </dl>
  );
}
