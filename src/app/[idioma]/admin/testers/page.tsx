import type { Metadata } from "next";
import { Cabecera } from "@/components/Cabecera";
import { EntrarAdmin } from "@/components/EntrarAdmin";
import { PanelTesters, type DiaPrueba, type Pago, type Saldo } from "@/components/PanelTesters";
import { Refrescar } from "@/components/Refrescar";
import { adminConfigurado, esAdmin } from "@/lib/admin";
import { idiomaDe } from "@/lib/paginas";
import { ayotl } from "@/lib/supabase-servidor";

type Props = { params: Promise<{ idioma: string }> };

// Lee cookie y base en cada petición; nada de esto se cachea.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Testers · Ayotl",
  robots: { index: false, follow: false },
};

/** Hoy en Sahuayo, como AAAA-MM-DD. El cron y la base cuentan en esa zona. */
function hoyMexico(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date());
}

function sumarDias(fecha: string, n: number): string {
  const d = new Date(fecha + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/**
 * Panel del programa Beta: quién es tester, qué días hizo algo en cada app,
 * cuánto lleva ganado y pagado, y botones para marcar días a mano (Mercadito)
 * y registrar pagos. Sólo en español: es para Adrián.
 */
export default async function Testers({ params }: Props) {
  const idioma = await idiomaDe(params);
  const cabecera = <Cabecera idioma={idioma} pagina="inicio" />;

  if (!(await esAdmin())) {
    return (
      <>
        {cabecera}
        <main className="contenedor seccion" style={{ maxWidth: 420 }}>
          <h1>Panel</h1>
          <EntrarAdmin configurado={adminConfigurado()} />
        </main>
      </>
    );
  }

  const base = ayotl();
  const hoy = hoyMexico();

  // Cruzar el día de hoy al abrir, para que la cuadrícula esté al día sin
  // tocar ningún botón. `tomar_cruce` limita esto a una vez cada dos
  // minutos, porque la página se renderiza en cada visita. Para ver algo
  // que acaba de pasar está el botón «Actualizar», que se salta el freno.
  if (base) {
    const { data: toca } = await base.rpc("tomar_cruce", { p_minutos: 2 });
    if (toca === true) {
      const { error } = await base.rpc("registrar_dia", { p_fecha: hoy });
      if (error) console.error("[panel] cruce", error.message);
    }
  }

  const [programa, saldos, dias, pagos, plazas] = base
    ? await Promise.all([
        base.from("programa").select("tarifa_1, tarifa_2, tarifa_3, inicio, fin").eq("id", 1).maybeSingle(),
        base.from("saldos").select("*").order("nombre"),
        base.from("dias_prueba").select("tester, fecha, app, evidencia").gte("fecha", sumarDias(hoy, -60)).order("fecha"),
        base.from("pagos").select("id, tester, monto, fecha, medio, referencia").order("id", { ascending: false }).limit(100),
        base.rpc("plazas").maybeSingle(),
      ])
    : [null, null, null, null, null];

  const p = programa?.data;
  const tarifas: [number, number, number] = [p?.tarifa_1 ?? 5, p?.tarifa_2 ?? 10, p?.tarifa_3 ?? 20];
  // La cuadrícula va desde el inicio del programa (o 21 días atrás) hasta hoy.
  const inicio = p?.inicio ?? sumarDias(hoy, -20);
  const fechas: string[] = [];
  for (let f = inicio; f <= hoy && fechas.length < 90; f = sumarDias(f, 1)) fechas.push(f);

  return (
    <>
      {cabecera}
      <Refrescar />
      <main className="contenedor seccion">
        <h1 style={{ fontSize: "2rem" }}>Testers</h1>
        <PanelTesters
          testers={(saldos?.data ?? []) as Saldo[]}
          dias={(dias?.data ?? []) as DiaPrueba[]}
          pagos={(pagos?.data ?? []) as Pago[]}
          fechas={fechas}
          hoy={hoy}
          tarifas={tarifas}
          enEspera={(plazas?.data as { en_espera: number } | null)?.en_espera ?? 0}
          configurado={!!base}
        />
      </main>
    </>
  );
}
