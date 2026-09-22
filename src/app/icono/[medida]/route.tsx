import { ImageResponse } from "next/og";
import { grosorTortuga, trazoTortuga } from "@/components/Tortuga";

/**
 * Iconos PNG para lo que no acepta SVG: el apple-touch-icon (180), los de
 * Android (192, 512) y el favicon de respaldo (32). Misma construcción que
 * public/icono.svg sobre fondo arena, escalada a la medida que se pida.
 *
 * Aquí el trazo va en verde fijo y no en `currentColor`: un PNG no tiene tema.
 */
export const dynamic = "force-static";

const MEDIDAS = ["32", "180", "192", "512"] as const;

export function generateStaticParams() {
  return MEDIDAS.map((medida) => ({ medida }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ medida: string }> }) {
  const { medida } = await params;
  if (!MEDIDAS.includes(medida as (typeof MEDIDAS)[number])) return new Response("No", { status: 404 });
  const lado = Number(medida);
  // El dibujo ocupa x 3–59 e y 16–46 del viewBox cuadrado, así que dentro de
  // un icono cuadrado se veía perdido: se recorta el viewBox a la tortuga y
  // se ocupa el 80 % del ancho, que deja el área de respeto justa.
  const ancho = Math.round(lado * 0.8);
  const alto = Math.round((ancho * 36) / 62);
  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#f6f1e7", borderRadius: lado >= 180 ? lado * 0.2 : 0,
      }}>
        <svg width={ancho} height={alto} viewBox="1 13 62 36" fill="none" stroke="#4f6d3a"
             strokeWidth={grosorTortuga(lado)} strokeLinecap="round" strokeLinejoin="round">
          <path d={trazoTortuga(lado)} />
        </svg>
      </div>
    ),
    { width: lado, height: lado },
  );
}
