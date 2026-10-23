"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { abrirTodo, leerProgreso, racha, xpTotal, type Progreso } from "@/lib/aprende/progreso";
import { t, type Idioma } from "@/lib/idioma";

export type NodoCamino = { id: string; titulo: string; resumen: string; href: string };
export type UnidadCamino = { id: string; titulo: string; lecciones: NodoCamino[] };

/**
 * El camino del curso: las lecciones en zigzag, unidad por unidad, como en
 * Duolingo. La primera sin hacer es «la tuya» y las de después esperan su
 * turno, salvo que se abra todo (para quien ya sabe lo de las primeras).
 *
 * El progreso vive en el navegador, así que el servidor pinta el camino sin
 * él y aquí se completa al montar.
 */
export function Camino({ curso, unidades, idioma }: { curso: string; unidades: UnidadCamino[]; idioma: Idioma }) {
  const x = t(idioma);
  const [p, setP] = useState<Progreso | null>(null);

  useEffect(() => {
    const leer = () => setP(leerProgreso());
    leer();
    window.addEventListener("ayotl-aprende", leer);
    window.addEventListener("storage", leer);
    return () => { window.removeEventListener("ayotl-aprende", leer); window.removeEventListener("storage", leer); };
  }, []);

  const todas = unidades.flatMap((u) => u.lecciones);
  const hecha = (id: string) => Boolean(p?.lecciones[`${curso}/${id}`]);
  const primeraPendiente = todas.find((l) => !hecha(l.id))?.id ?? null;
  const abierto = Boolean(p?.abierto[curso]);
  const hechas = todas.filter((l) => hecha(l.id)).length;
  let indice = -1;

  return (
    <div className="camino">
      <div className="camino-estado" aria-live="polite">
        <span><b>{hechas}</b>/{todas.length} {x("aprendeLecciones")}</span>
        <span><b>{p ? xpTotal(p) : 0}</b> xp</span>
        <span><b>{p ? racha(p) : 0}</b> {x("aprendeRachaCorta")}</span>
        <button type="button" className="enlace-boton" onClick={() => abrirTodo(curso, !abierto)}>
          {abierto ? x("aprendeCerrarTodo") : x("aprendeAbrirTodo")}
        </button>
      </div>

      {unidades.map((u, n) => (
        <section key={u.id} className="camino-unidad" aria-labelledby={`u-${u.id}`}>
          <h2 id={`u-${u.id}`}><span className="dato">{x("aprendeUnidad")} {n + 1}</span>{u.titulo}</h2>
          <ol>
            {u.lecciones.map((l) => {
              indice++;
              const estado = hecha(l.id) ? "hecha" : l.id === primeraPendiente ? "actual" : abierto ? "abierta" : "bloqueada";
              // El zigzag: cada lección se corre un poco a un lado, como una vereda.
              const lado = [0, 1, 2, 1, 0, -1, -2, -1][indice % 8];
              return (
                <li key={l.id} className={`camino-nodo ${estado}`} style={{ "--lado": lado } as React.CSSProperties}>
                  {estado === "bloqueada" ? (
                    <span className="camino-circulo" aria-hidden="true">🔒</span>
                  ) : (
                    <Link href={l.href} className="camino-circulo" aria-label={l.titulo}>
                      {estado === "hecha" ? "✓" : indice + 1}
                    </Link>
                  )}
                  <div className="camino-texto">
                    {estado === "bloqueada"
                      ? <span className="camino-titulo">{l.titulo}</span>
                      : <Link href={l.href} className="camino-titulo">{l.titulo}</Link>}
                    <span className="camino-resumen">{l.resumen}</span>
                    {estado === "actual" && <Link href={l.href} className="boton acento chico">{hechas ? x("aprendeSeguir") : x("aprendeEmpezar")} →</Link>}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
