"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ejecutar, type Resultado } from "@/lib/aprende/ejecutar";
import { resaltar } from "@/lib/aprende/resaltar";
import type { Prueba } from "@/lib/aprende/tipos";
import { t, type Idioma } from "@/lib/idioma";
import { TextoRico } from "./TextoRico";

/**
 * El editor de los retos, pero que se puede escribir y correr: a la izquierda
 * el código en azul Atari, a la derecha lo que imprime y, debajo, las notas
 * de qué mirar en el resultado. En el teléfono, el resultado va debajo.
 *
 * Para escribir encima del código resaltado, el <textarea> va transparente
 * sobre el <pre>, en la misma celda de la rejilla: los dos miden lo mismo y el
 * cursor cae justo sobre la letra.
 *
 * Con `pruebas` es un ejercicio: el botón dice PROBAR, enseña cada prueba con
 * lo que dio y avisa a la lección con `alProbar`.
 */
export function Pizarra({ codigo, notas, idioma, pruebas, alProbar, autoCorrer = true, archivo = "leccion.js" }: {
  codigo: string;
  notas?: string;
  idioma: Idioma;
  pruebas?: Prueba[];
  alProbar?: (todasBien: boolean) => void;
  autoCorrer?: boolean;
  archivo?: string;
}) {
  const x = t(idioma);
  const [fuente, setFuente] = useState(codigo);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [corriendo, setCorriendo] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);
  const lineas = useMemo(() => resaltar(fuente), [fuente]);

  async function correr(texto = fuente) {
    setCorriendo(true);
    const r = await ejecutar(texto, pruebas);
    setResultado(r);
    setCorriendo(false);
    if (pruebas && alProbar) alProbar(!r.error && !r.tiempo && (r.pruebas ?? []).every((p) => p.ok));
  }

  // Las explicaciones se corren solas al aparecer: el resultado ya está a la
  // derecha cuando uno termina de leer el código.
  useEffect(() => {
    if (autoCorrer && !pruebas) void correr(codigo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigo]);

  function teclas(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      void correr();
    } else if (e.key === "Tab" && !e.shiftKey) {
      // Tab mete dos espacios en vez de saltar al botón; Shift+Tab sale.
      e.preventDefault();
      const { selectionStart: a, selectionEnd: b } = el;
      const nuevo = fuente.slice(0, a) + "  " + fuente.slice(b);
      setFuente(nuevo);
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = a + 2; });
    }
  }

  const salida = resultado?.salida ?? [];
  const fallo = resultado?.error ?? (resultado?.tiempo ? x("pzTiempo") : null);

  return (
    <div className="pizarra">
      <div className="atari pizarra-editor">
        <div className="atari-barra">
          <span className="pizarra-archivo">{archivo}</span>
          <span className="pizarra-botones">
            {fuente !== codigo && (
              <button type="button" onClick={() => { setFuente(codigo); setResultado(null); }}>{x("pzReiniciar")}</button>
            )}
            <button type="button" className="atari-copiar" onClick={() => void correr()} disabled={corriendo}>
              {pruebas ? x("pzProbar") : x("pzCorrer")} ▸
            </button>
          </span>
        </div>
        <div className="pizarra-hoja">
          <pre className="atari-codigo" aria-hidden="true"><code>
            {lineas.map((linea, n) => (
              <span key={n} className="atari-linea">
                <span className="atari-num">{n + 1}</span>
                {linea.map(([texto, clase], j) => <span key={j} className={`s-${clase}`}>{texto}</span>)}
                {"\n"}
              </span>
            ))}
          </code></pre>
          <textarea ref={area} value={fuente} onChange={(e) => setFuente(e.target.value)} onKeyDown={teclas}
                    spellCheck={false} autoCapitalize="off" autoCorrect="off" autoComplete="off"
                    aria-label={x("pzEditor")} />
        </div>
      </div>

      <div className="pizarra-lado">
        <div className="atari-terminal pizarra-salida" aria-live="polite" aria-label={x("pzResultado")}>
          <p><span className="atari-prompt">$</span> node {archivo}</p>
          {corriendo && <p>…</p>}
          {!corriendo && resultado && salida.map((l, i) => <p key={i}>{l || " "}</p>)}
          {!corriendo && resultado && !salida.length && !fallo && !pruebas && <p className="pizarra-nada">{x("pzSinSalida")}</p>}
          {!corriendo && fallo && <p className="atari-error">{fallo}</p>}
          {!corriendo && resultado?.pruebas?.map((p, i) => (
            <p key={i} className={p.ok ? "pizarra-ok" : "atari-error"}>
              {p.ok ? "✓" : "✗"} {pruebas![i].llamada}{"\n"}  → {p.obtenido}{!p.ok && <>{"\n"}  {x("pzEsperaba")} {pruebas![i].espera}</>}
            </p>
          ))}
          {!resultado && !corriendo && <p className="pizarra-nada">{pruebas ? x("pzAyudaProbar") : x("pzAyudaCorrer")}</p>}
        </div>
        {notas && (
          <div className="pizarra-notas">
            <p className="dato">{x("pzNotas")}</p>
            <TextoRico texto={notas} />
          </div>
        )}
      </div>
    </div>
  );
}
