import { ImageResponse } from "next/og";
import { TRAZO_TORTUGA } from "@/components/Tortuga";
import { esIdioma, IDIOMAS, t } from "@/lib/idioma";

/**
 * La tarjeta Open Graph (1200×630), una por idioma, generada en el build
 * con la misma tortuga que el favicon para que no puedan desacordarse.
 */
export const dynamic = "force-static";

export function generateStaticParams() {
  return IDIOMAS.map((i) => ({ idioma: i.id }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ idioma: string }> }) {
  const { idioma } = await params;
  const x = t(esIdioma(idioma) ? idioma : "es");
  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", display: "flex", alignItems: "center",
        padding: "72px 88px", gap: 64, background: "#f6f1e7", color: "#1c2422",
        fontFamily: "sans-serif",
      }}>
        <svg width="360" height="360" viewBox="0 0 64 64" fill="none" stroke="#4f6d3a"
             strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d={TRAZO_TORTUGA} />
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>{x("marca")}</div>
          <div style={{ fontSize: 40, color: "#5b635f", lineHeight: 1.25, maxWidth: 620 }}>{x("lema")}</div>
          <div style={{ fontSize: 30, color: "#1e6f7a", marginTop: 12 }}>ayotl.dev</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
