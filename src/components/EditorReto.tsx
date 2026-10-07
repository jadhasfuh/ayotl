"use client";

import { useState } from "react";
import type { Codigo } from "@/lib/retos";

/**
 * El editor del vídeo, quieto: fondo azul Atari, la fuente de 8×8 y los
 * mismos colores de sintaxis. Una pestaña por lenguaje, el botón de copiar
 * y debajo la terminal con la salida real (la que ejecutó ttcode).
 *
 * Los colores llegan ya calculados en cada tramo; aquí sólo se pintan.
 */
export function EditorReto({ codigo, textos }: {
  codigo: Codigo[];
  textos: { copiar: string; copiado: string; salida: string };
}) {
  const [activo, setActivo] = useState(0);
  const [copiado, setCopiado] = useState(false);
  const c = codigo[activo];

  async function copiar() {
    try {
      await navigator.clipboard.writeText(c.texto + "\n");
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1600);
    } catch {
      // Sin permiso de portapapeles: el código sigue ahí para seleccionarlo.
    }
  }

  return (
    <div className="atari">
      <div className="atari-barra">
        <div role="tablist" className="atari-pestanas">
          {codigo.map((k, i) => (
            <button key={k.lenguaje} type="button" role="tab" aria-selected={i === activo}
                    onClick={() => { setActivo(i); setCopiado(false); }}>
              {k.nombre}
            </button>
          ))}
        </div>
        <button type="button" className="atari-copiar" onClick={copiar} aria-live="polite">
          {copiado ? textos.copiado : textos.copiar}
        </button>
      </div>

      <pre className="atari-codigo" aria-label={c.archivo}><code>
        {c.lineas.map((linea, n) => (
          <span key={n} className="atari-linea">
            <span className="atari-num" aria-hidden="true">{n + 1}</span>
            {linea.length === 0 ? "\n" : linea.map(([texto, clase], j) => (
              <span key={j} className={`s-${clase}`}>{texto}</span>
            ))}
            {linea.length > 0 && "\n"}
          </span>
        ))}
      </code></pre>

      <div className="atari-terminal" aria-label={textos.salida}>
        <p><span className="atari-prompt">$</span> {c.comando}</p>
        {c.salida.map((l, i) => <p key={i} className={c.ok ? undefined : "atari-error"}>{l || " "}</p>)}
      </div>
    </div>
  );
}
