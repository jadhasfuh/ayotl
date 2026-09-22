"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { APPS } from "@/lib/apps";
import { APPS_BETA, type AppBeta } from "@/lib/beta";

export type Saldo = {
  id: number; nombre: string; email: string; email_google: string; telefono: string | null;
  apps: AppBeta[]; dias: number; dias_completos: number;
  ganado: number; pagado: number; saldo: number; ultimo_dia: string | null;
};
export type DiaPrueba = { tester: number; fecha: string; app: AppBeta; evidencia: Record<string, unknown> };
export type Pago = { id: number; tester: number; monto: number; fecha: string; medio: string; referencia: string | null };

type Props = {
  testers: Saldo[]; dias: DiaPrueba[]; pagos: Pago[];
  fechas: string[]; hoy: string; tarifas: [number, number, number]; configurado: boolean;
};

const LETRA: Record<AppBeta, string> = { mercadito: "M", jlptest: "J", dailychallenge: "D" };
const MEDIOS = ["codi", "transferencia", "efectivo", "otro"] as const;

/**
 * La cuadrícula de días × tester, los saldos y las acciones. Cada acción
 * pega a /api/admin/* y refresca la página: los datos siempre vienen del
 * servidor, aquí no se calcula nada.
 */
export function PanelTesters({ testers, dias, pagos, fechas, hoy, tarifas, configurado }: Props) {
  const router = useRouter();
  const [aviso, setAviso] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);
  // La cuadrícula empieza el día 1 del programa, pero lo que interesa es lo
  // último: al abrir, se va sola al final (hoy).
  const scroll = useRef<HTMLDivElement>(null);
  useEffect(() => { if (scroll.current) scroll.current.scrollLeft = scroll.current.scrollWidth; }, [fechas.length]);

  // (tester, fecha) → apps con actividad ese día
  const porCelda = new Map<string, DiaPrueba[]>();
  for (const d of dias) {
    const k = `${d.tester}|${d.fecha}`;
    porCelda.set(k, [...(porCelda.get(k) ?? []), d]);
  }

  async function llamar(url: string, metodo: string, cuerpo: unknown, hecho: string) {
    setOcupado(true); setAviso(null);
    try {
      const res = await fetch(url, { method: metodo, headers: { "content-type": "application/json" }, body: JSON.stringify(cuerpo) });
      const datos = (await res.json().catch(() => ({}))) as { error?: string; filas?: number };
      if (!res.ok) { setAviso({ tipo: "error", texto: `No se pudo: ${datos.error ?? res.status}` }); return; }
      setAviso({ tipo: "exito", texto: datos.filas !== undefined ? `${hecho} (${datos.filas} filas)` : hecho });
      router.refresh();
    } finally { setOcupado(false); }
  }

  function alternarDia(tester: number, fecha: string, app: AppBeta, existe: boolean) {
    if (!confirm(`${existe ? "Quitar" : "Marcar"} ${LETRA[app]} de ${fecha}?`)) return;
    llamar("/api/admin/dias", existe ? "DELETE" : "POST", { tester, fecha, app }, existe ? "Día quitado" : "Día marcado");
  }

  function registrarPago(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const f = new FormData(ev.currentTarget);
    llamar("/api/admin/pagos", "POST", {
      tester: Number(f.get("tester")), monto: Number(f.get("monto")), medio: f.get("medio"), referencia: f.get("referencia") || "",
    }, "Pago registrado");
    ev.currentTarget.reset();
  }

  function marcarDia(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const f = new FormData(ev.currentTarget);
    llamar("/api/admin/dias", "POST", { tester: Number(f.get("tester")), fecha: f.get("fecha"), app: f.get("app") }, "Día marcado");
  }

  function cruzar(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fecha = new FormData(ev.currentTarget).get("fecha");
    llamar("/api/admin/registrar", "POST", fecha ? { fecha } : {}, "Cruce hecho");
  }

  const totalSaldo = testers.reduce((s, t) => s + t.saldo, 0);
  const nombre = (id: number) => testers.find((t) => t.id === id)?.nombre ?? `#${id}`;

  if (!configurado) return <p className="aviso error">Supabase no está configurado.</p>;

  return (
    <div className="panel-admin">
      {aviso && <p className={`aviso ${aviso.tipo}`} role="status">{aviso.texto}</p>}

      <div className="resumen">
        <div><b>{testers.length}</b><span className="dato">testers</span></div>
        <div><b>{tarifas.join(" · ")}</b><span className="dato">MXN por 1 · 2 · 3 apps</span></div>
        <div><b>{totalSaldo}</b><span className="dato">por pagar</span></div>
        <div><b>{testers.reduce((n, t) => n + t.dias, 0)}</b><span className="dato">días</span></div>
        <div><b>{testers.reduce((n, t) => n + t.dias_completos, 0)}</b><span className="dato">con las 3</span></div>
        <button type="button" className="enlace-salir" onClick={() => fetch("/api/admin/salir", { method: "POST" }).then(() => router.refresh())}>
          Salir
        </button>
      </div>

      {/* Ancho: la cuadrícula completa. La lista de abajo la sustituye en
          móvil, porque una tabla de 21 columnas en 360 px no hay forma. */}
      <div className="tabla-scroll solo-ancho" ref={scroll}>
        <table className="cuadricula">
          <thead>
            <tr>
              <th className="fijo">Tester</th>
              {fechas.map((f) => <th key={f} title={f} className={f === hoy ? "hoy" : undefined}>{f.slice(8)}</th>)}
              <th>Días</th><th>Con 3</th><th>Ganado</th><th>Pagado</th><th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {testers.map((t) => (
              <tr key={t.id}>
                <th className="fijo" scope="row">
                  <span>{t.nombre}</span>
                  <small>
                    {t.email_google}{t.telefono ? ` · ${t.telefono}` : ""}
                    {t.apps.includes("mercadito") && !t.telefono && <b className="falta"> · sin WhatsApp</b>}
                  </small>
                </th>
                {fechas.map((f) => {
                  const hechos = porCelda.get(`${t.id}|${f}`) ?? [];
                  const completo = hechos.length >= APPS_BETA.length;
                  return (
                    <td key={f} className={completo ? "con completo" : hechos.length ? "con" : undefined}
                        title={completo ? "Las tres apps ese día" : undefined}>
                      {/* Se enseñan las tres apps a todos, no sólo las que
                          eligieron: ahora cualquiera puede sumar las tres. */}
                      {APPS_BETA.map((a) => {
                        const d = hechos.find((h) => h.app === a);
                        return (
                          <button key={a} type="button" disabled={ocupado} className={`dia ${d ? "si" : "no"}`}
                                  title={d ? JSON.stringify(d.evidencia) : `Marcar ${a} el ${f}`}
                                  onClick={() => alternarDia(t.id, f, a, !!d)}>
                            {LETRA[a]}
                          </button>
                        );
                      })}
                    </td>
                  );
                })}
                <td>{t.dias}</td><td>{t.dias_completos}</td><td>{t.ganado}</td><td>{t.pagado}</td><td><b>{t.saldo}</b></td>
              </tr>
            ))}
            {testers.length === 0 && <tr><td colSpan={fechas.length + 6}>Todavía no hay testers.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="ayuda solo-ancho">
        M = Mercadito · J = JLPTest · D = Daily Challenge. Verde: hubo actividad ese día (pasa el ratón para ver la evidencia).
        La celda con borde es un día con las tres apps, que vale {tarifas[2]} en vez de {tarifas[0]}.
        Pulsa una letra para marcar o quitar un día a mano.
      </p>

      <ul className="lista-testers solo-estrecho">
        {testers.map((t) => {
          const suyos = dias.filter((d) => d.tester === t.id);
          const fechasConActividad = [...new Set(suyos.map((d) => d.fecha))].sort();
          return (
            <li key={t.id} className="ficha-tester">
              <div className="ficha-cabecera">
                <b>{t.nombre}</b>
                <span className={t.saldo > 0 ? "saldo-pendiente" : "saldo-cero"}>{t.saldo} MXN</span>
              </div>
              <p className="dato">{t.dias} días ({t.dias_completos} con las 3) · {t.ganado} ganado · {t.pagado} pagado</p>
              <p className="ficha-contacto">
                {t.email_google}{t.telefono ? ` · ${t.telefono}` : ""}
                {t.apps.includes("mercadito") && !t.telefono && <b className="falta"> · sin WhatsApp</b>}
              </p>
              {fechasConActividad.length > 0 && (
                <ul className="ficha-dias">
                  {fechasConActividad.map((f) => (
                    <li key={f}>
                      <span className="dato">{f.slice(5)}</span>
                      {suyos.filter((d) => d.fecha === f).map((d) => (
                        <span key={d.app} className="dia si" title={JSON.stringify(d.evidencia)}>{LETRA[d.app]}</span>
                      ))}
                      {suyos.filter((d) => d.fecha === f).length >= APPS_BETA.length && (
                        <span className="dato">· {tarifas[2]} MXN</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
        {testers.length === 0 && <li className="ayuda">Todavía no hay testers.</li>}
      </ul>

      <h2 className="titulo-gestion">Gestión</h2>
      <div className="acciones-admin">
        <form className="formulario" onSubmit={cruzar}>
          <h3>Cruzar actividad</h3>
          <p className="ayuda">El cron lo hace solo cada mañana para el día anterior (6:00 las apps de esta base, 6:10 Mercadito). Aquí, para ver hoy sin esperar o para rellenar un día viejo.</p>
          <div className="campo"><label htmlFor="cruzar-fecha">Fecha (vacío = ayer)</label><input id="cruzar-fecha" name="fecha" type="date" max={hoy} /></div>
          <button className="boton secundario" disabled={ocupado}>Cruzar</button>
        </form>

        <form className="formulario" onSubmit={registrarPago}>
          <h3>Registrar pago</h3>
          <div className="campo"><label htmlFor="pago-tester">Tester</label>
            <select id="pago-tester" name="tester" required>
              {testers.map((t) => <option key={t.id} value={t.id}>{t.nombre} — saldo {t.saldo}</option>)}
            </select>
          </div>
          <div className="campo"><label htmlFor="pago-monto">Monto (MXN)</label><input id="pago-monto" name="monto" type="number" min={1} step={1} required /></div>
          <div className="campo"><label htmlFor="pago-medio">Medio</label>
            <select id="pago-medio" name="medio">{MEDIOS.map((m) => <option key={m} value={m}>{m}</option>)}</select>
          </div>
          <div className="campo"><label htmlFor="pago-ref">Referencia</label><input id="pago-ref" name="referencia" type="text" maxLength={120} placeholder="folio CoDi, últimos dígitos…" /></div>
          <button className="boton acento" disabled={ocupado || testers.length === 0}>Registrar</button>
        </form>

        <form className="formulario" onSubmit={marcarDia}>
          <h3>Ajustar actividad</h3>
          <p className="ayuda">Para excepciones: un día que el cruce no vio (alguien entró con otra cuenta) o uno que no debería contar.</p>
          <div className="campo"><label htmlFor="dia-tester">Tester</label>
            <select id="dia-tester" name="tester" required>{testers.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}</select>
          </div>
          <div className="campo"><label htmlFor="dia-fecha">Fecha</label><input id="dia-fecha" name="fecha" type="date" required max={hoy} defaultValue={hoy} /></div>
          <div className="campo"><label htmlFor="dia-app">App</label>
            <select id="dia-app" name="app">{APPS.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}</select>
          </div>
          <button className="boton secundario" disabled={ocupado || testers.length === 0}>Marcar</button>
        </form>
      </div>

      <h2 className="titulo-gestion">Pagos</h2>
      {pagos.length === 0 ? <p className="ayuda">Ninguno todavía.</p> : (
        <table className="lista solo-ancho">
          <thead><tr><th>Fecha</th><th>Tester</th><th>Monto</th><th>Medio</th><th>Referencia</th></tr></thead>
          <tbody>{pagos.map((p) => (
            <tr key={p.id}><td>{p.fecha}</td><td>{nombre(p.tester)}</td><td>{p.monto}</td><td>{p.medio}</td><td>{p.referencia}</td></tr>
          ))}</tbody>
        </table>
      )}
      {pagos.length > 0 && (
        <ul className="lista-pagos solo-estrecho">
          {pagos.map((p) => (
            <li key={p.id}>
              <b>{nombre(p.tester)}</b> · {p.monto} MXN
              <span className="dato">{p.fecha} · {p.medio}{p.referencia ? ` · ${p.referencia}` : ""}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
