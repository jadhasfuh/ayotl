import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { TRAZO_TORTUGA } from "@/components/Tortuga";
import { esIdioma, IDIOMAS, t } from "@/lib/idioma";

/**
 * La tarjeta Open Graph (1200×630), una por idioma, generada en el build con
 * la misma tortuga que el favicon para que no puedan desacordarse.
 *
 * Satori no lee next/font ni las hojas de Google: la fuente hay que pasársela
 * como binario, y por eso Literata Medium está versionada aquí al lado. Como
 * la ruta es estática, el fichero sólo hace falta durante el build.
 */
export const dynamic = "force-static";

export function generateStaticParams() {
  return IDIOMAS.map((i) => ({ idioma: i.id }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ idioma: string }> }) {
  const { idioma } = await params;
  if (!esIdioma(idioma)) return new Response("No", { status: 404 });
  const x = t(idioma);
  const literata = await readFile(join(process.cwd(), "src/app/og/Literata-Medium.ttf"));

  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", background: "#f6f1e7", color: "#1c2422",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: 88, fontFamily: "Literata",
      }}>
        {/* El viewBox va recortado al dibujo (x 3–59, y 16–46) para que la
            tortuga pese lo que debe junto al nombre; el cuadrado entero
            dejaría medio lienzo vacío. */}
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <svg width="500" height="300" viewBox="1 14 62 34" fill="none" stroke="#4f6d3a"
               strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d={TRAZO_TORTUGA} />
          </svg>
          <span style={{ fontSize: 190, letterSpacing: "-0.005em" }}>{x("marca")}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 40, color: "#5b635f" }}>{x("lema")}</div>
          <div style={{ fontSize: 30, color: "#165761" }}>ayotl.dev</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: [{ name: "Literata", data: literata, weight: 500, style: "normal" }] },
  );
}
