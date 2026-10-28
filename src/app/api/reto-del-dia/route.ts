import { NextResponse } from "next/server";
import { enlaceReto, retoDelDia } from "@/lib/retos";
import { sitio } from "@/lib/sitio";

export const dynamic = "force-dynamic";

/**
 * El reto de código que sale ese día (27-oct-2026): lo pide el cron social de
 * Daily Challenge para publicar el Short en Instagram y Facebook a las 17:00,
 * el mismo día que sale en YouTube a las 13:00. Devuelve el mp4 que sirve este
 * sitio (public/retos/<slug>.mp4, que deja `ttcode export`) y un pie en español.
 * Sin reto ese día, 404. ?fecha=AAAA-MM-DD; sin ella, hoy en México.
 */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("fecha");
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(q ?? "") ? q! : hoyMx();
  const reto = retoDelDia(fecha);
  if (!reto) return NextResponse.json({ fecha, sin_reto: true }, { status: 404 });
  const video = `${sitio()}/retos/${reto.slug}.mp4`;
  const dificultad = ({ easy: "fácil", medium: "medio", hard: "difícil" } as Record<string, string>)[reto.dificultad] ?? reto.dificultad;
  const pie = [
    `💻 Reto de código de hoy: ${reto.titulo} (${dificultad}).`,
    "",
    primerParrafo(reto.enunciado),
    "",
    `Resuelto en Python y en C, en un minuto, con el estilo de una computadora de los 80. El código completo y el enunciado: ${sitio()}${enlaceReto(reto.slug, "es")}`,
    "",
    "#programación #python #clenguaje #codingchallenge #entrevistaTécnica #retroComputing #ayotl",
  ].join("\n");
  return NextResponse.json({ fecha, slug: reto.slug, titulo: reto.titulo, video, pie });
}

const hoyMx = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
/** El enunciado viene en inglés; para el pie basta la primera frase, sin el ejemplo. */
const primerParrafo = (texto: string) => texto.split(/\n\n|Example:/)[0].trim();
