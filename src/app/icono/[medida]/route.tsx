import { ImageResponse } from "next/og";
import { TRAZO_TORTUGA } from "@/components/Tortuga";

/**
 * Iconos PNG para lo que no acepta SVG: el apple-touch-icon (180) y el
 * favicon de respaldo (32). Misma construcción que public/icono.svg sobre
 * fondo arena, escalada a la medida que se pida.
 */
export const dynamic = "force-static";

const MEDIDAS = ["32", "180", "192", "512"] as const;

export function generateStaticParams() {
  return MEDIDAS.map((medida) => ({ medida }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ medida: string }> }) {
  const { medida } = await params;
  const lado = Number(medida);
  if (!MEDIDAS.includes(medida as (typeof MEDIDAS)[number])) return new Response("No", { status: 404 });
  const dibujo = Math.round(lado * 0.82);
  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#f6f1e7", borderRadius: lado >= 180 ? lado * 0.2 : 0,
      }}>
        <svg width={dibujo} height={dibujo} viewBox="0 0 64 64" fill="none" stroke="#4f6d3a"
             strokeWidth={lado <= 32 ? 4.5 : 3} strokeLinecap="round" strokeLinejoin="round">
          <path d={TRAZO_TORTUGA} />
        </svg>
      </div>
    ),
    { width: lado, height: lado },
  );
}
