"use client";

import { useMemo, useState } from "react";
import type { Articulo, Demo } from "@/lib/demos";

/**
 * El módulo interactivo de cada muestra.
 *
 * Ninguno abre WhatsApp: enseñan el mensaje que se compondría. Escribirle de
 * verdad al teléfono de un negocio que no ha dicho que sí no se hace, y para
 * enseñar la idea en el celular el mensaje a la vista funciona mejor.
 */

const pesos = (n: number) => "$" + n.toLocaleString("es-MX", { maximumFractionDigits: 0 });

/** «2026-10-10» → «sábado 10 de octubre». El mediodía evita el desfase de zona. */
const enLetra = (iso: string) =>
  iso
    ? new Date(`${iso}T12:00:00`).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })
    : "";

function Mensaje({ texto }: { texto: string }) {
  return (
    <div className="mensaje">
      <p className="etiqueta">Así le llegaría al WhatsApp del negocio</p>
      <pre>{texto}</pre>
    </div>
  );
}

function Hueco() {
  return <div className="hueco" aria-hidden>foto</div>;
}

/* --- Reserva de habitación --------------------------------------------- */

function Reserva({ demo, hoy }: { demo: Demo; hoy: string }) {
  const manana = new Date(`${hoy}T12:00:00`);
  manana.setDate(manana.getDate() + 1);
  const [entrada, setEntrada] = useState(hoy);
  const [salida, setSalida] = useState(manana.toISOString().slice(0, 10));
  const [cuarto, setCuarto] = useState(0);
  const [personas, setPersonas] = useState(2);
  const [listo, setListo] = useState(false);

  const noches = Math.max(
    0,
    Math.round((new Date(salida).getTime() - new Date(entrada).getTime()) / 86400000),
  );
  const hab = demo.articulos[cuarto];
  const total = noches * (hab.precio ?? 0);

  const texto = `Hola, quiero reservar directo:
• ${hab.nombre}
• Entrada ${enLetra(entrada)} · Salida ${enLetra(salida)} (${noches} ${noches === 1 ? "noche" : "noches"})
• ${personas} ${personas === 1 ? "persona" : "personas"}
• Estimado: ${pesos(total)}
¿Me la confirman?`;

  return (
    <div className="panel">
      <h2>Reservar directo, sin comisión</h2>
      <div className="dos">
        <label className="campo">
          <span>Entrada</span>
          <input type="date" value={entrada} min={hoy} onChange={(e) => { setEntrada(e.target.value); setListo(false); }} />
        </label>
        <label className="campo">
          <span>Salida</span>
          <input type="date" value={salida} min={entrada} onChange={(e) => { setSalida(e.target.value); setListo(false); }} />
        </label>
      </div>
      <label className="campo">
        <span>Personas</span>
        <select value={personas} onChange={(e) => { setPersonas(Number(e.target.value)); setListo(false); }}>
          {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <p className="campo"><span>Habitación</span></p>
      <ul className="lista">
        {demo.articulos.map((a, i) => (
          <li key={a.nombre}>
            <button
              type="button"
              className={`ficha ${i === cuarto ? "puesta" : ""}`}
              style={{ width: "100%", textAlign: "left", font: "inherit", cursor: "pointer" }}
              aria-pressed={i === cuarto}
              onClick={() => { setCuarto(i); setListo(false); }}
            >
              <Hueco />
              <span className="cuerpo">
                <span className="nombre">{a.nombre}</span>
                <span className="detalle" style={{ display: "block" }}>{a.detalle}</span>
              </span>
              <span className="precio">{pesos(a.precio ?? 0)}<small style={{ opacity: 0.6 }}> /noche</small></span>
            </button>
          </li>
        ))}
      </ul>
      <p className="total"><span>{noches} {noches === 1 ? "noche" : "noches"}</span> <b>{pesos(total)}</b></p>
      <button type="button" className="boton" disabled={noches < 1} onClick={() => setListo(true)}>
        Pedir la reserva
      </button>
      {listo && <Mensaje texto={texto} />}
    </div>
  );
}

/* --- Carrito de pedido -------------------------------------------------- */

function Carrito({ demo }: { demo: Demo }) {
  const [cantidad, setCantidad] = useState<Record<string, number>>({});
  const [busca, setBusca] = useState("");
  const [grupo, setGrupo] = useState("");
  const [nombre, setNombre] = useState("");
  const [entrega, setEntrega] = useState("recoger");
  const [listo, setListo] = useState(false);

  const grupos = useMemo(() => {
    const m = new Map<string, Articulo[]>();
    for (const a of demo.articulos) {
      const g = a.grupo ?? "Menú";
      m.set(g, [...(m.get(g) ?? []), a]);
    }
    return [...m];
  }, [demo.articulos]);

  // Buscar por nombre y por descripción: la gente teclea «piña», no «hawaiana».
  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return grupos
      .filter(([g]) => !grupo || g === grupo)
      .map(([g, arts]) => [
        g,
        arts.filter((a) => !q || `${a.nombre} ${a.detalle ?? ""}`.toLowerCase().includes(q)),
      ] as [string, Articulo[]])
      .filter(([, arts]) => arts.length > 0);
  }, [grupos, grupo, busca]);

  const poner = (nom: string, d: number) => {
    setListo(false);
    setCantidad((c) => ({ ...c, [nom]: Math.max(0, (c[nom] ?? 0) + d) }));
  };
  const puestos = demo.articulos.filter((a) => (cantidad[a.nombre] ?? 0) > 0);
  const total = puestos.reduce((s, a) => s + (a.precio ?? 0) * cantidad[a.nombre], 0);

  const texto = `Buenas, un pedido:
${puestos.map((a) => `• ${cantidad[a.nombre]} × ${a.nombre} — ${pesos((a.precio ?? 0) * cantidad[a.nombre])}`).join("\n")}
Total: ${pesos(total)}
${entrega === "recoger" ? "Paso por él" : "A domicilio"}${nombre ? `\nA nombre de ${nombre}` : ""}`;

  return (
    <div className="panel">
      <div className="fichas">
        <span className="pildora abierto">Abierto ahora</span>
        <span className="pildora">Pide por WhatsApp</span>
        <span className="pildora">Sin registro · sin comisiones</span>
      </div>

      <label className="campo" style={{ marginTop: 14 }}>
        <span className="oculto">Buscar en la carta</span>
        <input
          type="search" value={busca} placeholder="¿Qué se te antoja?"
          onChange={(e) => { setBusca(e.target.value); setListo(false); }}
        />
      </label>

      <div className="chips">
        <button type="button" aria-pressed={grupo === ""} onClick={() => setGrupo("")}>
          Todo <small>{demo.articulos.length}</small>
        </button>
        {grupos.map(([g, arts]) => (
          <button key={g} type="button" aria-pressed={grupo === g} onClick={() => setGrupo(grupo === g ? "" : g)}>
            {g} <small>{arts.length}</small>
          </button>
        ))}
      </div>

      {filtrados.length === 0 && (
        <p className="nota" style={{ marginTop: 14 }}>No hay nada con «{busca}». Prueba con otra cosa.</p>
      )}

      {filtrados.map(([grupoNombre, arts]) => (
        <div key={grupoNombre} style={{ marginBottom: 16 }}>
          <h3 className="rubro">{grupoNombre}</h3>
          <ul className="lista">
            {arts.map((a) => (
              <li key={a.nombre} className={`ficha ${(cantidad[a.nombre] ?? 0) > 0 ? "puesta" : ""}`}>
                <Hueco />
                <div className="cuerpo">
                  <div className="nombre">{a.nombre}</div>
                  {a.detalle && <div className="detalle">{a.detalle}</div>}
                  <div className="precio">{pesos(a.precio ?? 0)}</div>
                </div>
                <div className="cuenta">
                  <button type="button" aria-label={`Quitar un ${a.nombre}`} onClick={() => poner(a.nombre, -1)}>−</button>
                  <b>{cantidad[a.nombre] ?? 0}</b>
                  <button type="button" aria-label={`Agregar un ${a.nombre}`} onClick={() => poner(a.nombre, +1)}>+</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <label className="campo">
        <span>¿A nombre de quién?</span>
        <input value={nombre} onChange={(e) => { setNombre(e.target.value); setListo(false); }} placeholder="Tu nombre" />
      </label>
      <label className="campo">
        <span>¿Cómo lo quieres?</span>
        <select value={entrega} onChange={(e) => { setEntrega(e.target.value); setListo(false); }}>
          <option value="recoger">Paso por él</option>
          <option value="domicilio">A domicilio</option>
        </select>
      </label>
      <p className="total"><span>{puestos.length} {puestos.length === 1 ? "artículo" : "artículos"}</span> <b>{pesos(total)}</b></p>
      <button type="button" className="boton" disabled={!puestos.length} onClick={() => setListo(true)}>
        Mandar el pedido
      </button>
      {listo && <Mensaje texto={texto} />}
    </div>
  );
}

/* --- Cotizador (por metro, por invitado) -------------------------------- */

const DIAS = ["L", "M", "M", "J", "V", "S", "D"];
/** Fechas de ejemplo tomadas: bastan los fines de semana y algún suelto. */
const ocupado = (dia: number, finde: boolean) => (finde && dia % 3 !== 1) || dia % 7 === 4;

function Calendario({ hoy, elegido, elegir }: { hoy: string; elegido: string; elegir: (d: string) => void }) {
  const base = new Date(`${hoy}T12:00:00`);
  // Abre en el mes que viene: un salón se aparta con meses de anticipación y
  // del actual ya casi no queda nada libre.
  const [salto, setSalto] = useState(1);
  const vista = new Date(base.getFullYear(), base.getMonth() + salto, 1);
  const año = vista.getFullYear();
  const mes = vista.getMonth();
  const dias = new Date(año, mes + 1, 0).getDate();
  // getDay(): 0 es domingo; aquí la semana empieza en lunes.
  const hueco = (vista.getDay() + 6) % 7;
  // `capitalize` del CSS pondría «Octubre De 2026»: sólo la primera letra.
  const crudo = vista.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
  const nombreMes = crudo[0].toUpperCase() + crudo.slice(1);

  const flecha = { width: 40, height: 40, font: "inherit", fontSize: 18, cursor: "pointer",
    color: "var(--m-tinta)", background: "var(--m-fondo)", border: "1px solid var(--m-linea)", borderRadius: 8 } as const;

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <button type="button" style={flecha} aria-label="Mes anterior" disabled={salto === 0} onClick={() => setSalto((m) => m - 1)}>‹</button>
        <span style={{ fontSize: 14 }}>{nombreMes}</span>
        <button type="button" style={flecha} aria-label="Mes siguiente" disabled={salto === 11} onClick={() => setSalto((m) => m + 1)}>›</button>
      </div>
      <div className="mes">
        {DIAS.map((d, i) => <div key={i} className="encabezado">{d}</div>)}
        {Array.from({ length: hueco }, (_, i) => <div key={`h${i}`} />)}
        {Array.from({ length: dias }, (_, i) => {
          const dia = i + 1;
          const fecha = `${año}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
          const semana = new Date(año, mes, dia).getDay();
          const pasado = salto === 0 && dia < base.getDate();
          if (pasado) return <div key={dia} className="dia" style={{ opacity: 0.25 }}>{dia}</div>;
          return ocupado(dia, semana === 5 || semana === 6)
            ? <div key={dia} className="dia ocupado" aria-label={`${dia}, ocupado`}>{dia}</div>
            : <button key={dia} type="button" className="dia libre" aria-pressed={elegido === fecha} onClick={() => elegir(fecha)}>{dia}</button>;
        })}
      </div>
      <p className="nota">Los días tachados ya están apartados. En el sitio real se llenan solos desde la agenda.</p>
    </div>
  );
}

function Cotizador({ demo, hoy }: { demo: Demo; hoy: string }) {
  const cfg = demo.cotizacion!;
  const [unidades, setUnidades] = useState(cfg.conCalendario ? 120 : 30);
  const [elegido, setElegido] = useState(0);
  const [fecha, setFecha] = useState("");
  const [listo, setListo] = useState(false);

  const art = demo.articulos[elegido];
  const merma = cfg.ayuda ? 1.1 : 1;
  const cantidad = Math.ceil(unidades * merma);
  const total = cantidad * (art.precio ?? 0);

  const texto = `Hola, quiero cotizar:
• ${art.nombre}${art.detalle ? ` (${art.detalle})` : ""}
• ${unidades} ${cfg.unidad}${merma > 1 ? ` (con merma, ${cantidad} ${cfg.unidad})` : ""}${fecha ? `\n• Fecha: ${enLetra(fecha)}` : ""}
• Estimado: ${pesos(total)}
¿Me confirman disponibilidad?`;

  return (
    <div className="panel">
      <h2>{cfg.conCalendario ? "Aparta tu fecha" : "Calcula lo que necesitas"}</h2>
      {cfg.conCalendario && <Calendario hoy={hoy} elegido={fecha} elegir={(d) => { setFecha(d); setListo(false); }} />}
      <label className="campo">
        <span>{cfg.etiqueta}</span>
        <input
          type="number" min={1} inputMode="numeric" value={unidades}
          onChange={(e) => { setUnidades(Math.max(1, Number(e.target.value) || 1)); setListo(false); }}
        />
      </label>
      <p className="campo"><span>{cfg.conCalendario ? "Paquete" : "Material"}</span></p>
      <ul className="lista">
        {demo.articulos.map((a, i) => (
          <li key={a.nombre}>
            <button
              type="button"
              className={`ficha ${i === elegido ? "puesta" : ""}`}
              style={{ width: "100%", textAlign: "left", font: "inherit", cursor: "pointer" }}
              aria-pressed={i === elegido}
              onClick={() => { setElegido(i); setListo(false); }}
            >
              <Hueco />
              <span className="cuerpo">
                <span className="nombre">{a.nombre}</span>
                <span className="detalle" style={{ display: "block" }}>{a.detalle}</span>
              </span>
              <span className="precio">{pesos(a.precio ?? 0)}</span>
            </button>
          </li>
        ))}
      </ul>
      {cfg.ayuda && <p className="nota">{cfg.ayuda}</p>}
      <p className="total">
        <span>{cantidad} {cfg.unidad} × {pesos(art.precio ?? 0)}</span> <b>{pesos(total)}</b>
      </p>
      <button
        type="button" className="boton"
        disabled={cfg.conCalendario && !fecha}
        onClick={() => setListo(true)}
      >
        {cfg.conCalendario ? (fecha ? "Apartar esta fecha" : "Elige una fecha") : "Pedir la cotización"}
      </button>
      {listo && <Mensaje texto={texto} />}
    </div>
  );
}

/* --- Agenda de citas ---------------------------------------------------- */

function Citas({ demo, hoy }: { demo: Demo; hoy: string }) {
  const [fecha, setFecha] = useState(hoy);
  const [hora, setHora] = useState("");
  const [servicio, setServicio] = useState(0);
  const [nombre, setNombre] = useState("");
  const [listo, setListo] = useState(false);

  // Huecos tomados de ejemplo, deterministas por fecha: el servidor y el
  // navegador tienen que pintar lo mismo.
  const suma = [...fecha].reduce((s, c) => s + c.charCodeAt(0), 0);
  const horas = demo.horarios ?? [];
  const tomada = (i: number) => (suma + i * 3) % 5 === 0;

  const art = demo.articulos[servicio];
  const texto = `Hola, quiero agendar:
• ${art.nombre}${art.detalle ? ` (${art.detalle})` : ""}
• ${enLetra(fecha)} a las ${hora}
• ${pesos(art.precio ?? 0)}${nombre ? `\n• A nombre de ${nombre}` : ""}`;

  return (
    <div className="panel">
      <h2>Agenda tu cita</h2>
      <label className="campo">
        <span>Día</span>
        <input type="date" value={fecha} min={hoy} onChange={(e) => { setFecha(e.target.value); setHora(""); setListo(false); }} />
      </label>
      <p className="campo"><span>Horas libres</span></p>
      <div className="horas">
        {horas.map((h, i) => (
          <button
            key={h} type="button" disabled={tomada(i)} aria-pressed={hora === h}
            onClick={() => { setHora(h); setListo(false); }}
          >
            {h}
          </button>
        ))}
      </div>
      <p className="nota">Las tachadas ya están tomadas. Cambia el día y verás otras.</p>
      <p className="campo" style={{ marginTop: 14 }}><span>Servicio</span></p>
      <ul className="lista">
        {demo.articulos.map((a, i) => (
          <li key={a.nombre}>
            <button
              type="button"
              className={`ficha ${i === servicio ? "puesta" : ""}`}
              style={{ width: "100%", textAlign: "left", font: "inherit", cursor: "pointer" }}
              aria-pressed={i === servicio}
              onClick={() => { setServicio(i); setListo(false); }}
            >
              <span className="cuerpo">
                <span className="nombre">{a.nombre}</span>
                <span className="detalle" style={{ display: "block" }}>{a.detalle}</span>
              </span>
              <span className="precio">{pesos(a.precio ?? 0)}</span>
            </button>
          </li>
        ))}
      </ul>
      <label className="campo" style={{ marginTop: 12 }}>
        <span>¿A nombre de quién?</span>
        <input value={nombre} onChange={(e) => { setNombre(e.target.value); setListo(false); }} placeholder="Tu nombre" />
      </label>
      <button type="button" className="boton" disabled={!hora} onClick={() => setListo(true)}>
        {hora ? `Apartar las ${hora}` : "Elige una hora"}
      </button>
      {listo && <Mensaje texto={texto} />}
    </div>
  );
}

export function Muestra({ demo, hoy }: { demo: Demo; hoy: string }) {
  if (demo.modulo === "reserva") return <Reserva demo={demo} hoy={hoy} />;
  if (demo.modulo === "carrito") return <Carrito demo={demo} />;
  if (demo.modulo === "citas") return <Citas demo={demo} hoy={hoy} />;
  return <Cotizador demo={demo} hoy={hoy} />;
}
