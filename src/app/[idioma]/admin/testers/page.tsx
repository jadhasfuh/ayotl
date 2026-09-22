import type { Metadata } from "next";
import { Cabecera } from "@/components/Cabecera";
import { EntrarAdmin } from "@/components/EntrarAdmin";
import { PanelTesters, type DiaPrueba, type Pago, type Saldo } from "@/components/PanelTesters";
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
  const [programa, saldos, dias, pagos] = base
    ? await Promise.all([
        base.from("programa").select("tarifa_dia, inicio, fin").eq("id", 1).maybeSingle(),
        base.from("saldos").select("*").order("nombre"),
        base.from("dias_prueba").select("tester, fecha, app, evidencia").gte("fecha", sumarDias(hoy, -60)).order("fecha"),
        base.from("pagos").select("id, tester, monto, fecha, medio, referencia").order("id", { ascending: false }).limit(100),
      ])
    : [null, null, null, null];

  const tarifa = programa?.data?.tarifa_dia ?? 20;
  // La cuadrícula va desde el inicio del programa (o 21 días atrás) hasta hoy.
  const inicio = programa?.data?.inicio ?? sumarDias(hoy, -20);
  const fechas: string[] = [];
  for (let f = inicio; f <= hoy && fechas.length < 90; f = sumarDias(f, 1)) fechas.push(f);

  return (
    <>
      {cabecera}
      <main className="contenedor seccion">
        <h1 style={{ fontSize: "2rem" }}>Testers</h1>
        <PanelTesters
          testers={(saldos?.data ?? []) as Saldo[]}
          dias={(dias?.data ?? []) as DiaPrueba[]}
          pagos={(pagos?.data ?? []) as Pago[]}
          fechas={fechas}
          hoy={hoy}
          tarifa={tarifa}
          configurado={!!base}
        />
      </main>
    </>
  );
}
