import parte1 from "@/content/programando-snake-1.json";
import type { Idioma } from "../idioma";
import { rutaCurso } from "./index";
import type { T, VideoLeccion } from "./tipos";

/**
 * El código de los vídeos largos de «Programando …», para copiarlo y jugarlo
 * (Adrián, 24-nov-2026). El JSON no se escribe a mano: lo deja
 * tools/comerciales/programando/exportar.py con el mismo código que se ve
 * escribirse en el vídeo; `junto` es ese código en un solo .html, que es lo
 * que corre en la página.
 */
export type Programando = {
  curso: string;            // de qué curso cuelga: /aprende/<curso>/codigo/<id>
  id: string;
  titulo: T;
  resumen: T;
  intro: T;
  archivo: string;          // cómo se llama «todo en uno»
  video: VideoLeccion | null;
  archivos: { nombre: string; texto: string }[];
  lineas: number;
  junto: string;
};

export const PROGRAMANDO: Programando[] = [
  {
    curso: "snake",
    id: "parte-1",
    titulo: { es: "Programando Snake, parte 1", en: "Coding Snake, part 1" },
    resumen: {
      es: `Las ${parte1.lineas} líneas del vídeo para copiarlas y jugarlas: un Snake en JavaScript, sin motor ni librerías, en cinco archivos.`,
      en: `The video's ${parte1.lineas} lines, to copy and play: a Snake in JavaScript, with no engine or libraries, in five files.`,
    },
    intro: {
      es: "Es el código del vídeo, tal cual: un Snake jugable en JavaScript, sin motor ni librerías. Los nombres y la lógica son los del [Snake de Daily Challenge](https://dailychallenge.click/juegos/snake). Lo que le falta (los mapas con muros, el bicho de premio, el hambre, el sonido y el servidor) es la parte 2.",
      en: "This is the video's code, as is: a playable Snake in JavaScript, with no engine or libraries. The names and the logic are those of [Daily Challenge's Snake](https://dailychallenge.click/juegos/snake). What's missing (the maps with walls, the bonus bug, the hunger, the sound and the server) is part 2.",
    },
    archivo: "snake.html",
    video: { es: { id: "37O_Kdo0ebw", desde: "2026-11-29T18:00:00-06:00" }, en: { id: "R0ey0G_VfUI", desde: "2026-11-29T18:20:00-06:00" } },
    archivos: parte1.archivos,
    lineas: parte1.lineas,
    junto: parte1.junto,
  },
];

export const programandoDe = (curso: string) => PROGRAMANDO.filter((p) => p.curso === curso);

/** /aprende/snake/codigo/parte-1 (y /en/learn/snake/codigo/parte-1). */
export const rutaCodigo = (p: Programando, idioma: Idioma) => `${rutaCurso(p.curso, idioma)}/codigo/${p.id}`;

/** El id del vídeo en ese idioma, si ya es público (antes de esa hora es privado). */
export function videoDe(p: Programando, idioma: Idioma, ahora = Date.now()): string | null {
  const v = p.video?.[idioma];
  return v && Date.parse(v.desde) <= ahora ? v.id : null;
}

/** El programa en un solo archivo, vestido para jugarse dentro de la página: sin márgenes y a lo ancho de su marco. */
export const paraJugar = (p: Programando) =>
  p.junto.replace("</style>", "  html, body { margin: 0; background: #000; overflow: hidden; }\n  canvas { width: 100%; height: auto; display: block; }\n</style>")
  + `\n<script>addEventListener("keydown", (e) => { if (e.code.startsWith("Arrow")) e.preventDefault(); });</script>`;
