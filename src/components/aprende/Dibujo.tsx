import type { Dibujo as D } from "@/lib/aprende/tipos";
import type { Idioma } from "@/lib/idioma";

/**
 * Las estructuras dibujadas en SVG a partir de sus datos: cajas para los
 * arreglos, nodos con flechas para las listas, el árbol por niveles, el grafo
 * con sus coordenadas. Los colores salen de las variables del tema (claro y
 * oscuro) por clase, no van escritos aquí.
 */
const C = 44;   // lado de una casilla
/** Ancho de caja para que quepa el texto más largo (monoespaciada de 14 px: ~8.4 px por letra). */
const anchoPara = (valores: (string | number)[]) => Math.max(C, ...valores.map((v) => Math.ceil(String(v).length * 8.4 + 16)));

function Caja({ x, y, valor, resalta, w = C }: { x: number; y: number; valor: string | number; resalta?: boolean; w?: number }) {
  return (
    <g className={resalta ? "dib-resalta" : undefined}>
      <rect x={x} y={y} width={w} height={C} rx={4} className="dib-caja" />
      <text x={x + w / 2} y={y + C / 2} className="dib-valor">{String(valor)}</text>
    </g>
  );
}

function Flecha({ x1, y1, x2, y2, peso, doble }: { x1: number; y1: number; x2: number; y2: number; peso?: number; doble?: boolean }) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} className="dib-linea" markerEnd="url(#dib-punta)" markerStart={doble ? "url(#dib-punta-ini)" : undefined} />
      {peso !== undefined && <text x={(x1 + x2) / 2} y={(y1 + y2) / 2} className="dib-peso">{peso}</text>}
    </g>
  );
}

const Puntas = () => (
  <defs>
    <marker id="dib-punta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" className="dib-punta" />
    </marker>
    <marker id="dib-punta-ini" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" className="dib-punta" />
    </marker>
  </defs>
);

export function Dibujo({ dibujo, idioma }: { dibujo: D; idioma: Idioma }) {
  const d = dibujo;
  let ancho = 0, alto = 0;
  let cuerpo: React.ReactNode = null;
  let leyenda: React.ReactNode = null;

  if (d.tipo === "arreglo") {
    const arriba = d.punteros?.length ? 26 : 4;
    const w = anchoPara(d.valores);
    ancho = d.valores.length * w + 8; alto = arriba + C + (d.indices === false ? 6 : 26);
    cuerpo = (
      <>
        {d.valores.map((v, i) => <Caja key={i} x={4 + i * w} y={arriba} w={w} valor={v} resalta={d.resalta?.includes(i)} />)}
        {d.indices !== false && d.valores.map((_, i) => <text key={i} x={4 + i * w + w / 2} y={arriba + C + 15} className="dib-indice">{i}</text>)}
        {d.punteros?.map((p, k) => <text key={k} x={4 + p.i * w + w / 2} y={16} className="dib-puntero">{p.texto} ↓</text>)}
      </>
    );
  } else if (d.tipo === "lista") {
    const w = anchoPara(d.valores);
    const paso = w + 34;
    ancho = d.valores.length * paso + 54; alto = C + 8;
    cuerpo = (
      <>
        {d.valores.map((v, i) => (
          <g key={i}>
            <Caja x={4 + i * paso} y={4} w={w} valor={v} resalta={d.resalta?.includes(i)} />
            <Flecha x1={4 + i * paso + w + 2} y1={4 + C / 2} x2={4 + (i + 1) * paso - 3} y2={4 + C / 2} doble={d.doble && i < d.valores.length - 1} />
          </g>
        ))}
        <text x={4 + d.valores.length * paso + 16} y={4 + C / 2} className="dib-nulo">null</text>
      </>
    );
  } else if (d.tipo === "pila" || d.tipo === "cola") {
    if (d.tipo === "pila") {
      const w = Math.max(76, anchoPara(d.valores) + 8);
      ancho = w + 90; alto = Math.max(1, d.valores.length) * C + 12;
      cuerpo = (
        <>
          <path d={`M4,4 V${alto - 4} H${w + 4} V4`} className="dib-recipiente" />
          {d.valores.map((v, i) => (
            <Caja key={i} x={8} y={alto - 8 - (i + 1) * C} w={w - 8} valor={v} resalta={i === d.valores.length - 1} />
          ))}
          {d.valores.length > 0 && <text x={w + 14} y={alto - 8 - d.valores.length * C + C / 2} className="dib-puntero dib-izq">← {idioma === "es" ? "cima" : "top"}</text>}
        </>
      );
    } else {
      const w = anchoPara(d.valores);
      ancho = d.valores.length * w + 120; alto = C + 30;
      cuerpo = (
        <>
          {d.valores.map((v, i) => <Caja key={i} x={60 + i * w} y={4} w={w} valor={v} resalta={i === 0} />)}
          <text x={30} y={4 + C / 2} className="dib-puntero">←</text>
          <text x={60 + d.valores.length * w + 30} y={4 + C / 2} className="dib-puntero">←</text>
          <text x={60 + w / 2} y={C + 22} className="dib-indice">{idioma === "es" ? "sale" : "out"}</text>
          {d.valores.length > 1 && <text x={60 + (d.valores.length - 0.5) * w} y={C + 22} className="dib-indice">{idioma === "es" ? "entra" : "in"}</text>}
        </>
      );
    }
  } else if (d.tipo === "arbol") {
    const niveles = Math.max(1, Math.ceil(Math.log2(d.valores.length + 1)));
    const hojas = 2 ** (niveles - 1);
    const r = 20, dx = 50, dy = 64;
    ancho = Math.max(hojas * dx, 60) + 8; alto = (niveles - 1) * dy + 2 * r + 8;
    const pos = (i: number) => {
      const nivel = Math.floor(Math.log2(i + 1));
      const enNivel = i - (2 ** nivel - 1);
      const tramo = (ancho - 8) / 2 ** nivel;
      return { x: 4 + tramo * (enNivel + 0.5), y: 4 + r + nivel * dy };
    };
    cuerpo = (
      <>
        {d.valores.map((v, i) => {
          if (v === null || i === 0) return null;
          const padre = Math.floor((i - 1) / 2);
          if (d.valores[padre] === null) return null;
          const a = pos(padre), b = pos(i);
          return <line key={`l${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="dib-linea" />;
        })}
        {d.valores.map((v, i) => {
          if (v === null) return null;
          const p = pos(i);
          return (
            <g key={i} className={d.resalta?.includes(v) ? "dib-resalta" : undefined}>
              <circle cx={p.x} cy={p.y} r={r} className="dib-caja" />
              <text x={p.x} y={p.y} className="dib-valor">{String(v)}</text>
            </g>
          );
        })}
      </>
    );
  } else if (d.tipo === "grafo") {
    const r = 20;
    ancho = Math.max(...d.nodos.map((n) => n.x)) + r + 8; alto = Math.max(...d.nodos.map((n) => n.y)) + r + 8;
    const de = (id: string) => d.nodos.find((n) => n.id === id)!;
    cuerpo = (
      <>
        {d.aristas.map(([a, b, peso], i) => {
          const p = de(a), q = de(b);
          const len = Math.hypot(q.x - p.x, q.y - p.y) || 1;
          const ux = (q.x - p.x) / len, uy = (q.y - p.y) / len;
          return d.dirigido
            ? <Flecha key={i} x1={p.x + ux * r} y1={p.y + uy * r} x2={q.x - ux * (r + 2)} y2={q.y - uy * (r + 2)} peso={peso} />
            : (
              <g key={i}>
                <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} className="dib-linea" />
                {peso !== undefined && <text x={(p.x + q.x) / 2} y={(p.y + q.y) / 2} className="dib-peso">{peso}</text>}
              </g>
            );
        })}
        {d.nodos.map((n) => (
          <g key={n.id} className={d.resalta?.includes(n.id) ? "dib-resalta" : undefined}>
            <circle cx={n.x} cy={n.y} r={r} className="dib-caja" />
            <text x={n.x} y={n.y} className="dib-valor">{n.id}</text>
          </g>
        ))}
      </>
    );
  } else if (d.tipo === "hash") {
    const largo = Math.max(1, ...d.cubetas.map((c) => c.length));
    const w = anchoPara(d.cubetas.flat());
    const paso = w + 34;
    ancho = 60 + largo * paso + 10; alto = d.cubetas.length * (C + 8) + 4;
    cuerpo = d.cubetas.map((cubeta, i) => {
      const y = 4 + i * (C + 8);
      return (
        <g key={i}>
          <text x={18} y={y + C / 2} className="dib-indice">{i}</text>
          <rect x={34} y={y} width={18} height={C} rx={3} className="dib-recipiente-caja" />
          {cubeta.map((v, j) => (
            <g key={j}>
              <Flecha x1={52 + j * paso} y1={y + C / 2} x2={52 + j * paso + 28} y2={y + C / 2} />
              <Caja x={52 + j * paso + 32} y={y} valor={v} w={w} />
            </g>
          ))}
        </g>
      );
    });
  } else if (d.tipo === "rejilla") {
    const L = 22;
    const cols = Math.max(...d.filas.map((f) => f.length));
    ancho = cols * L + 8; alto = d.filas.length * L + 8;
    cuerpo = d.filas.flatMap((fila, y) => [...fila].map((ch, x) => (
      <g key={`${x}-${y}`} className={`dib-celda dib-celda-${/[a-z0-9]/i.test(ch) ? ch : "vacio"}`}>
        <rect x={4 + x * L} y={4 + y * L} width={L} height={L} />
        {/[0-9]/.test(ch) && <text x={4 + x * L + L / 2} y={4 + y * L + L / 2} className="dib-valor dib-chico">{ch}</text>}
      </g>
    )));
    if (d.leyenda) {
      leyenda = (
        <ul className="dib-leyenda">
          {Object.entries(d.leyenda).map(([ch, txt]) => (
            <li key={ch}><span className={`dib-muestra dib-celda-${ch}`} aria-hidden="true" /> <code>{ch}</code> {txt[idioma]}</li>
          ))}
        </ul>
      );
    }
  }

  return (
    <figure className="dibujo">
      <svg viewBox={`0 0 ${ancho} ${alto}`} width={ancho} height={alto} role="img"
           aria-label={d.tipo === "rejilla" ? d.filas.join(" / ") : "valores" in d ? JSON.stringify(d.valores) : d.tipo}>
        <Puntas />
        {cuerpo}
      </svg>
      {leyenda}
    </figure>
  );
}
