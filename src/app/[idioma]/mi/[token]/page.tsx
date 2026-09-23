import type { Metadata } from "next";
import { Cabecera } from "@/components/Cabecera";
import { PedirEnlace } from "@/components/PedirEnlace";
import { APPS } from "@/lib/apps";
import { APPS_BETA, type AppBeta } from "@/lib/beta";
import { t } from "@/lib/idioma";
import { idiomaDe } from "@/lib/paginas";
import { ayotl } from "@/lib/supabase-servidor";
import { turnstileSitio } from "@/lib/turnstile";

type Props = { params: Promise<{ idioma: string; token: string }> };

// Datos de una persona concreta: nunca cacheado, nunca indexado.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

type Progreso = {
  nombre: string; apps: AppBeta[];
  dias: number; dias_completos: number; ganado: number; pagado: number; saldo: number;
  inicio: string | null; fin: string | null;
  tarifa_1: number; tarifa_2: number; tarifa_3: number;
  detalle: { fecha: string; apps: AppBeta[]; monto: number }[];
};

function hoyMexico(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date());
}

function dia(fecha: string, idioma: string): string {
  return new Date(`${fecha}T12:00:00Z`).toLocaleDateString(idioma === "es" ? "es-MX" : "en-US",
    { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

/**
 * Lo que ve un tester con su enlace: sus días, lo que lleva ganado y qué le
 * falta hoy para el día completo. Sin contraseña: el enlace es la llave, y
 * detrás sólo están sus propios datos.
 */
export default async function MiProgreso({ params }: Props) {
  const { token } = await params;
  const idioma = await idiomaDe(params);
  const x = t(idioma);
  const base = ayotl();
  const { data } = base ? await base.rpc("mi_progreso", { p_token: token }).maybeSingle() : { data: null };
  const p = data as Progreso | null;

  if (!p) {
    return (
      <>
        <Cabecera idioma={idioma} pagina="beta" />
        <main className="contenedor seccion" style={{ maxWidth: 460 }}>
          <h1>{x("miNoVale")}</h1>
          <p>{x("miNoValeTexto")}</p>
          <PedirEnlace idioma={idioma} turnstileSitio={turnstileSitio()} />
        </main>
      </>
    );
  }

  const hoy = hoyMexico();
  const deHoy = p.detalle.find((d) => d.fecha === hoy);
  const faltanHoy = APPS_BETA.filter((a) => !deHoy?.apps.includes(a))
    .map((a) => APPS.find((app) => app.id === a)?.nombre ?? a);
  const nombreApp = (a: AppBeta) => APPS.find((app) => app.id === a)?.nombre ?? a;

  return (
    <>
      <Cabecera idioma={idioma} pagina="beta" />
      <main className="contenedor seccion mi-progreso">
        <p className="dato">{x("miTitulo")}</p>
        <h1>{x("miHola")(p.nombre.split(" ")[0])}</h1>
        {p.inicio && p.fin && <p className="dato">{x("miPeriodo")(dia(p.inicio, idioma), dia(p.fin, idioma))}</p>}

        <ul className="cifras">
          <li><b>{p.dias}</b><span className="dato">{x("miDias")}</span></li>
          <li><b>{p.dias_completos}</b><span className="dato">{x("miCompletos")}</span></li>
          <li><b>{p.ganado}</b><span className="dato">{x("miGanado")}</span></li>
          {p.pagado > 0 && <li><b>{p.pagado}</b><span className="dato">{x("miPagado")}</span></li>}
          <li className="destacada"><b>{p.saldo}</b><span className="dato">{x("miSaldo")}</span></li>
        </ul>

        <div className={`panel hoy ${faltanHoy.length === 0 ? "completo" : ""}`}>
          <h2>{x("miHoy")}</h2>
          {!deHoy ? <p>{x("miHoyNada")}</p> : (
            <p>
              {deHoy.apps.map(nombreApp).join(" · ")} — <b>{deHoy.monto} MXN</b>
            </p>
          )}
          {faltanHoy.length > 0
            ? <p className="dato">{x("miHoyFaltan")(faltanHoy)}</p>
            : <p className="dato">{x("miHoyCompleto")}</p>}
          <p className="enlaces-persona">
            {APPS.map((a) => (
              <a key={a.id} href={a.url} target="_blank" rel="noopener">{a.nombre} ↗</a>
            ))}
          </p>
        </div>

        <h2>{x("miDetalle")}</h2>
        {p.detalle.length === 0 ? <p className="dato">{x("miSinDias")}</p> : (
          <ul className="mis-dias">
            {p.detalle.map((d) => (
              <li key={d.fecha} className={d.apps.length >= APPS_BETA.length ? "completo" : undefined}>
                <span>{dia(d.fecha, idioma)}</span>
                <span className="dato">{d.apps.map(nombreApp).join(" · ")}</span>
                <b>{d.monto}</b>
              </li>
            ))}
          </ul>
        )}
        <p className="dato">{x("miTarda")}</p>

        <p>{x("miComoSeCuenta")(p.tarifa_1, p.tarifa_2, p.tarifa_3)}</p>
      </main>
    </>
  );
}
