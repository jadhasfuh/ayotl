"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { racha, terminarLeccion } from "@/lib/aprende/progreso";
import { en, urlEn, type Leccion as L, type Paso } from "@/lib/aprende/tipos";
import { t, type Idioma } from "@/lib/idioma";
import { CodigoQuieto } from "./CodigoQuieto";
import { Dibujo } from "./Dibujo";
import { Pizarra } from "./Pizarra";
import { TextoRico } from "./TextoRico";

type Estado = "contestando" | "bien" | "mal";

/** Revuelve igual en el servidor y en el navegador (si no, la hidratación no cuadra). */
function revolver<X>(lista: X[], semilla: string): X[] {
  let h = 2166136261;
  for (const c of semilla) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const azar = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
  const r = [...lista];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  // Que nunca salga ya resuelto
  if (r.length > 1 && r.every((x, i) => x === lista[i])) r.push(r.shift()!);
  return r;
}

/**
 * Una lección al estilo Duolingo: una tarjeta a la vez, la barra de avance
 * arriba y, al contestar, la franja de abajo dice si estuvo bien y por qué.
 * Las preguntas falladas vuelven al final de la fila hasta salir bien; la
 * lección se cuenta al terminar, con 10 de xp y 5 más si no hubo fallos.
 */
export function Leccion({ curso, leccion, idioma, camino, siguiente, retos }: {
  curso: string;
  leccion: L;
  idioma: Idioma;
  camino: string;
  siguiente: { href: string; titulo: string } | null;
  retos: { href: string; titulo: string }[];
}) {
  const x = t(idioma);
  const pasos = leccion.pasos;
  const [fila, setFila] = useState<number[]>(() => pasos.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [estado, setEstado] = useState<Estado>("contestando");
  const [fallos, setFallos] = useState(0);
  const [fin, setFin] = useState<{ xp: number; racha: number } | null>(null);
  const [vuelta, setVuelta] = useState(0);      // cambia la key: una pregunta repetida empieza limpia
  const tarjeta = useRef<HTMLDivElement>(null);

  const actual = fila[pos];
  const paso = pasos[actual];
  const total = fila.length;

  // Al cambiar de tarjeta, arriba y con el foco en ella (lector de pantalla y teclado).
  useEffect(() => {
    tarjeta.current?.focus({ preventScroll: true });
    tarjeta.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [pos, fin]);

  function contestar(bien: boolean) {
    setEstado(bien ? "bien" : "mal");
    if (!bien) {
      setFallos((f) => f + 1);
      // La fallada vuelve al final, una vez por fallo.
      setFila((f) => [...f, actual]);
    }
  }

  function seguir() {
    if (pos + 1 >= fila.length) {
      const xp = 10 + (fallos === 0 ? 5 : 0);
      const p = terminarLeccion(curso, leccion.id, xp);
      setFin({ xp, racha: racha(p) });
      return;
    }
    setPos(pos + 1);
    setEstado("contestando");
    setVuelta((v) => v + 1);
  }

  if (fin) {
    return (
      <div className="leccion-fin" ref={tarjeta} tabIndex={-1}>
        <p className="leccion-fin-xp">+{fin.xp} xp</p>
        <h2>{x("aprendeTerminada")}</h2>
        <p>{fallos === 0 ? x("aprendeSinFallos") : `${x("aprendeConFallos")} ${fallos}.`}</p>
        {fin.racha > 0 && <p className="dato">{x("aprendeRacha")}: {fin.racha} {fin.racha === 1 ? x("aprendeDia") : x("aprendeDias")}</p>}
        {retos.length > 0 && (
          <div className="leccion-retos">
            <p className="dato">{x("aprendePractica")}</p>
            <ul>{retos.map((r) => <li key={r.href}><Link href={r.href}>{r.titulo}</Link></li>)}</ul>
          </div>
        )}
        <p className="leccion-fin-botones">
          {siguiente && <Link className="boton acento" href={siguiente.href}>{x("aprendeSiguiente")}: {siguiente.titulo} →</Link>}
          <Link className="boton secundario" href={camino}>{x("aprendeVolverCamino")}</Link>
        </p>
      </div>
    );
  }

  const esPregunta = paso.tipo !== "explica";
  return (
    <div className="leccion">
      <div className="leccion-barra">
        <Link href={camino} className="leccion-salir" aria-label={x("aprendeSalir")}>✕</Link>
        <div className="leccion-avance" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={pos}>
          <span style={{ width: `${(pos / total) * 100}%` }} />
        </div>
        <span className="dato">{pos + 1}/{total}</span>
      </div>

      <div className="leccion-tarjeta" ref={tarjeta} tabIndex={-1} key={`${actual}-${vuelta}`}>
        <Tarjeta paso={paso} idioma={idioma} semilla={`${leccion.id}-${actual}`} estado={estado} contestar={contestar} />
      </div>

      {!esPregunta && (
        <div className="leccion-pie">
          <button type="button" className="boton acento" onClick={seguir}>{x("aprendeContinuar")}</button>
        </div>
      )}
      {esPregunta && estado !== "contestando" && (
        <div className={`leccion-pie leccion-veredicto ${estado}`} role="status">
          <div>
            <p className="leccion-veredicto-titulo">{estado === "bien" ? x("aprendeBien") : x("aprendeMal")}</p>
            <TextoRico texto={paso.porque[idioma]} />
            {estado === "mal" && <p className="dato">{x("aprendeVuelve")}</p>}
          </div>
          <button type="button" className="boton acento" onClick={seguir} autoFocus>{x("aprendeContinuar")}</button>
        </div>
      )}
    </div>
  );
}

/** Una tarjeta: la explicación o la pregunta, según el tipo de paso. */
function Tarjeta({ paso, idioma, semilla, estado, contestar }: {
  paso: Paso; idioma: Idioma; semilla: string; estado: Estado; contestar: (bien: boolean) => void;
}) {
  const x = t(idioma);
  const cerrada = estado !== "contestando";

  if (paso.tipo === "explica") {
    return (
      <>
        <h2>{paso.titulo[idioma]}</h2>
        <div className="prosa"><TextoRico texto={paso.texto[idioma]} /></div>
        {paso.dibujo && <Dibujo dibujo={paso.dibujo} idioma={idioma} />}
        {paso.programa && <Pizarra codigo={en(paso.programa.codigo, idioma)} notas={paso.programa.notas?.[idioma]} idioma={idioma} />}
        {paso.enlaces && paso.enlaces.length > 0 && (
          <p className="leccion-enlaces">
            {paso.enlaces.map((e) => e.url.startsWith("/")
              ? <a key={e.url} href={urlEn(e.url, idioma)}>{e.texto[idioma]} →</a>
              : <a key={e.url} href={e.url} target="_blank" rel="noopener">{e.texto[idioma]} ↗</a>)}
          </p>
        )}
      </>
    );
  }

  if (paso.tipo === "elige") return <Elige paso={paso} idioma={idioma} cerrada={cerrada} contestar={contestar} />;
  if (paso.tipo === "completa") return <Completa paso={paso} idioma={idioma} semilla={semilla} cerrada={cerrada} contestar={contestar} />;
  if (paso.tipo === "ordena") return <Ordena paso={paso} idioma={idioma} semilla={semilla} cerrada={cerrada} contestar={contestar} />;

  // escribe
  return (
    <>
      <p className="dato">{x("aprendeEscribe")}</p>
      <div className="prosa leccion-pregunta"><TextoRico texto={paso.pregunta[idioma]} /></div>
      <Escribe paso={paso} idioma={idioma} cerrada={cerrada} contestar={contestar} />
    </>
  );
}

function Elige({ paso, idioma, cerrada, contestar }: {
  paso: Extract<Paso, { tipo: "elige" }>; idioma: Idioma; cerrada: boolean; contestar: (bien: boolean) => void;
}) {
  const x = t(idioma);
  const [elegida, setElegida] = useState<number | null>(null);
  return (
    <>
      <p className="dato">{x("aprendeElige")}</p>
      <div className="prosa leccion-pregunta"><TextoRico texto={paso.pregunta[idioma]} /></div>
      {paso.codigo && <CodigoQuieto codigo={en(paso.codigo, idioma)} />}
      <div className="opciones" role="radiogroup">
        {paso.opciones.map((o, i) => {
          const texto = en(o, idioma);
          const clase = cerrada && i === paso.correcta ? "correcta" : cerrada && i === elegida ? "incorrecta" : elegida === i ? "elegida" : "";
          return (
            <button key={i} type="button" role="radio" aria-checked={elegida === i} disabled={cerrada}
                    className={`opcion ${clase} ${typeof o === "string" ? "opcion-codigo" : ""}`} onClick={() => setElegida(i)}>
              <span className="opcion-letra" aria-hidden="true">{i + 1}</span>
              {typeof o === "string" ? <code>{texto}</code> : <span>{texto}</span>}
            </button>
          );
        })}
      </div>
      {!cerrada && (
        <div className="leccion-pie">
          <button type="button" className="boton acento" disabled={elegida === null} onClick={() => contestar(elegida === paso.correcta)}>
            {x("aprendeComprobar")}
          </button>
        </div>
      )}
    </>
  );
}

function Completa({ paso, idioma, semilla, cerrada, contestar }: {
  paso: Extract<Paso, { tipo: "completa" }>; idioma: Idioma; semilla: string; cerrada: boolean; contestar: (bien: boolean) => void;
}) {
  const x = t(idioma);
  const banco = useMemo(() => revolver(paso.banco.map((texto, i) => ({ texto, i })), semilla), [paso.banco, semilla]);
  const [puestas, setPuestas] = useState<(number | null)[]>(() => paso.huecos.map(() => null));
  const trozos = paso.codigo.split("___");
  const usada = (i: number) => puestas.includes(i);

  function poner(i: number) {
    if (cerrada || usada(i)) return;
    const libre = puestas.indexOf(null);
    if (libre < 0) return;
    setPuestas(puestas.map((p, k) => (k === libre ? i : p)));
  }
  const quitar = (k: number) => !cerrada && setPuestas(puestas.map((p, j) => (j === k ? null : p)));
  const bien = () => puestas.every((p, k) => p !== null && paso.banco[p] === paso.huecos[k]);

  return (
    <>
      <p className="dato">{x("aprendeCompleta")}</p>
      <div className="prosa leccion-pregunta"><TextoRico texto={paso.pregunta[idioma]} /></div>
      <div className="atari completa-codigo">
        <pre className="atari-codigo"><code>
          {trozos.map((trozo, k) => (
            <span key={k}>
              {trozo}
              {k < trozos.length - 1 && (
                <button type="button" className={`hueco ${puestas[k] === null ? "vacio" : ""} ${cerrada ? (paso.banco[puestas[k]!] === paso.huecos[k] ? "correcta" : "incorrecta") : ""}`}
                        onClick={() => quitar(k)} aria-label={puestas[k] === null ? x("aprendeHuecoVacio") : `${paso.banco[puestas[k]!]} — ${x("aprendeQuitar")}`}>
                  {puestas[k] === null ? "    " : paso.banco[puestas[k]!]}
                </button>
              )}
            </span>
          ))}
        </code></pre>
      </div>
      <div className="fichas">
        {banco.map(({ texto, i }) => (
          <button key={i} type="button" className="ficha" disabled={cerrada || usada(i)} onClick={() => poner(i)}>{texto}</button>
        ))}
      </div>
      {cerrada && !bien() && <p className="leccion-solucion"><span className="dato">{x("aprendeRespuesta")}</span> <code>{paso.huecos.join("  ·  ")}</code></p>}
      {!cerrada && (
        <div className="leccion-pie">
          <button type="button" className="boton acento" disabled={puestas.includes(null)} onClick={() => contestar(bien())}>
            {x("aprendeComprobar")}
          </button>
        </div>
      )}
    </>
  );
}

function Ordena({ paso, idioma, semilla, cerrada, contestar }: {
  paso: Extract<Paso, { tipo: "ordena" }>; idioma: Idioma; semilla: string; cerrada: boolean; contestar: (bien: boolean) => void;
}) {
  const x = t(idioma);
  const revueltas = useMemo(() => revolver(paso.lineas.map((texto, i) => ({ texto, i })), semilla), [paso.lineas, semilla]);
  const [orden, setOrden] = useState<number[]>([]);
  // Dos renglones iguales valen en cualquier orden: se compara el texto.
  const bien = () => orden.length === paso.lineas.length && orden.every((i, k) => paso.lineas[i] === paso.lineas[k]);

  return (
    <>
      <p className="dato">{x("aprendeOrdena")}</p>
      <div className="prosa leccion-pregunta"><TextoRico texto={paso.pregunta[idioma]} /></div>
      <ol className="ordena-respuesta atari" aria-label={x("aprendeTuOrden")}>
        {orden.map((i, k) => (
          <li key={i}>
            <button type="button" className={`renglon ${cerrada ? (paso.lineas[i] === paso.lineas[k] ? "correcta" : "incorrecta") : ""}`}
                    disabled={cerrada} onClick={() => setOrden(orden.filter((j) => j !== i))}>
              <code>{paso.lineas[i]}</code>
            </button>
          </li>
        ))}
        {orden.length === 0 && <li className="ordena-vacio">{x("aprendeOrdenaAyuda")}</li>}
      </ol>
      <div className="fichas fichas-renglones">
        {revueltas.map(({ texto, i }) => (
          <button key={i} type="button" className="ficha renglon" disabled={cerrada || orden.includes(i)} onClick={() => setOrden([...orden, i])}>
            <code>{texto}</code>
          </button>
        ))}
      </div>
      {cerrada && !bien() && (
        <div className="leccion-solucion"><p className="dato">{x("aprendeRespuesta")}</p><CodigoQuieto codigo={paso.lineas.join("\n")} /></div>
      )}
      {!cerrada && (
        <div className="leccion-pie">
          <button type="button" className="boton acento" disabled={orden.length !== paso.lineas.length} onClick={() => contestar(bien())}>
            {x("aprendeComprobar")}
          </button>
        </div>
      )}
    </>
  );
}

/**
 * Escribir código: se prueba las veces que haga falta sin castigo. Tras el
 * primer intento fallido aparece «ver la solución», que cuenta como fallo.
 */
function Escribe({ paso, idioma, cerrada, contestar }: {
  paso: Extract<Paso, { tipo: "escribe" }>; idioma: Idioma; cerrada: boolean; contestar: (bien: boolean) => void;
}) {
  const x = t(idioma);
  const [intentos, setIntentos] = useState(0);
  const [verSolucion, setVerSolucion] = useState(false);
  return (
    <>
      <Pizarra codigo={en(paso.inicial, idioma)} idioma={idioma} pruebas={paso.pruebas} autoCorrer={false}
               alProbar={(ok) => { setIntentos((n) => n + 1); if (ok && !cerrada) contestar(true); }} />
      {!cerrada && intentos > 0 && (
        <p className="leccion-ayuda">
          <button type="button" className="enlace-boton" onClick={() => { setVerSolucion(true); contestar(false); }}>{x("aprendeVerSolucion")}</button>
        </p>
      )}
      {(verSolucion || cerrada) && (
        <div className="leccion-solucion"><p className="dato">{x("aprendeUnaSolucion")}</p><CodigoQuieto codigo={paso.solucion} /></div>
      )}
    </>
  );
}
