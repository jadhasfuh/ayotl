"use client";

import { useMemo, useState } from "react";
import { EJEMPLOS } from "@/lib/pscript/ejemplos";
import { generarC } from "@/lib/pscript/generar";
import { ejecutar } from "@/lib/pscript/interprete";
import { ErrorPScript } from "@/lib/pscript/lexer";
import { compilar, type Programa } from "@/lib/pscript/parser";
import { t, type Idioma } from "@/lib/idioma";

type Pestana = "salida" | "c" | "tokens" | "simbolos";

/**
 * El editor: se escribe PScript y, en cada tecla, se compila. Lo que sale
 * —el C, los tokens, la tabla de símbolos o el error con su línea— se
 * reparte en pestañas.
 *
 * Todo corre en el navegador: no hay servidor que compile nada, así que da
 * igual cuánta gente lo use y no hay código de nadie viajando a ningún sitio.
 */
export function EditorPScript({ idioma }: { idioma: Idioma }) {
  const x = t(idioma);
  const [fuente, setFuente] = useState(EJEMPLOS[1].fuente);
  const [entradas, setEntradas] = useState(EJEMPLOS[1].entradas);
  const [pestana, setPestana] = useState<Pestana>("salida");
  const [salida, setSalida] = useState<string[] | null>(null);
  const [errorEjecucion, setErrorEjecucion] = useState<string | null>(null);

  // Compilar en cada tecla: el programa más largo de aquí son treinta
  // líneas, así que no hace falta esperar a que deje de escribir.
  const { programa, error } = useMemo((): { programa: Programa | null; error: ErrorPScript | null } => {
    try {
      return { programa: compilar(fuente), error: null };
    } catch (e) {
      return { programa: null, error: e instanceof ErrorPScript ? e : null };
    }
  }, [fuente]);

  function correr() {
    setErrorEjecucion(null);
    if (!programa) { setPestana("salida"); return; }
    try {
      const datos = entradas.split("\n").map((l) => l.trim()).filter(Boolean);
      setSalida(ejecutar(programa, datos).salida);
    } catch (e) {
      setSalida(null);
      setErrorEjecucion(e instanceof ErrorPScript ? `${e.message} (línea ${e.linea})` : String(e));
    }
    setPestana("salida");
  }

  function cargar(id: string) {
    const e = EJEMPLOS.find((x) => x.id === id);
    if (!e) return;
    setFuente(e.fuente);
    setEntradas(e.entradas);
    setSalida(null);
    setErrorEjecucion(null);
  }

  const c = programa ? generarC(programa) : "";
  const PESTANAS: [Pestana, string][] = [
    ["salida", x("psSalida")], ["c", x("psCodigoC")],
    ["tokens", x("psTokens")], ["simbolos", x("psSimbolos")],
  ];

  return (
    <div className="pscript">
      <div className="pscript-barra">
        <label className="dato" htmlFor="ps-ejemplo">{x("psEjemplo")}</label>
        <select id="ps-ejemplo" onChange={(ev) => cargar(ev.target.value)} defaultValue={EJEMPLOS[1].id}>
          {EJEMPLOS.map((e) => <option key={e.id} value={e.id}>{e.nombre[idioma]}</option>)}
        </select>
        <button type="button" className="boton chico" onClick={correr} disabled={!programa}>
          {x("psEjecutar")} ▸
        </button>
      </div>

      <div className="pscript-cuerpo">
        <div className="pscript-lado">
          <label className="dato" htmlFor="ps-fuente">{x("psEditor")}</label>
          <textarea id="ps-fuente" spellCheck={false} value={fuente}
                    onChange={(ev) => setFuente(ev.target.value)} rows={18} />
          <label className="dato" htmlFor="ps-entradas">{x("psEntradas")}</label>
          <textarea id="ps-entradas" spellCheck={false} value={entradas}
                    onChange={(ev) => setEntradas(ev.target.value)} rows={2}
                    placeholder={x("psEntradasAyuda")} />
        </div>

        <div className="pscript-lado">
          <div className="pscript-pestanas" role="tablist">
            {PESTANAS.map(([id, texto]) => (
              <button key={id} type="button" role="tab" aria-selected={pestana === id}
                      className={pestana === id ? "activa" : undefined}
                      onClick={() => setPestana(id)}>
                {texto}
              </button>
            ))}
          </div>

          {error && (
            <p className="aviso error" role="alert">
              <b>{error.fase}</b> · línea {error.linea} — {error.message}
            </p>
          )}
          {!error && <p className="aviso exito">{x("psCorrecto")}</p>}

          {pestana === "salida" && (
            <pre className="pscript-panel">
              {errorEjecucion
                ? errorEjecucion
                : salida
                  ? (salida.length ? salida.join("\n") : "—")
                  : x("psSinSalida")}
            </pre>
          )}

          {pestana === "c" && (
            <>
              <pre className="pscript-panel">{c || "—"}</pre>
              {c && (
                <button type="button" className="enlace-copiar"
                        onClick={() => navigator.clipboard?.writeText(c)}>
                  {x("psCopiar")}
                </button>
              )}
            </>
          )}

          {pestana === "tokens" && (
            <pre className="pscript-panel">
              {programa
                ? programa.tokens.filter((t) => t.tipo !== "fdt")
                    .map((t) => `${String(t.linea).padStart(3)} │ ${t.tipo.padEnd(9)} │ ${t.lexema}`).join("\n")
                : "—"}
            </pre>
          )}

          {pestana === "simbolos" && (
            <pre className="pscript-panel">
              {programa && programa.simbolos.length
                ? programa.simbolos.map((s) => `${s.nombre.padEnd(14)} │ ${s.tipo.padEnd(9)} │ línea ${s.linea}`).join("\n")
                : "—"}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
