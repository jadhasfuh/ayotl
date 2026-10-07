import datos from "@/content/retos.json";

/**
 * Los retos de código que se publican en YouTube. El JSON no se escribe a
 * mano: lo genera `ttcode export` (~/Documents/code challenge) a partir de
 * las mismas fuentes que teclea el vídeo, y ya trae el código resaltado por
 * el mismo tokenizador. Así la web y el vídeo no pueden discrepar en un
 * color, y aquí no se carga ningún resaltador.
 */
export type Clase =
  | "kw" | "type" | "builtin" | "string" | "number" | "comment"
  | "punct" | "preproc" | "func" | "ident" | "ws";

export type Tramo = [texto: string, clase: Clase];

export type Codigo = {
  lenguaje: string;
  nombre: string;          // como sale en el vídeo: PYTHON, C, JAVA…
  archivo: string;
  texto: string;           // lo que se copia
  lineas: Tramo[][];       // lo que se pinta
  comando: string;
  salida: string[];
  ok: boolean;
};

export type Reto = {
  slug: string;
  titulo: string;
  seccion: "interview" | "basic" | "intermediate" | "advanced";
  dificultad: string;
  etiquetas: string[];
  enunciado: string;
  markdown: string;
  fecha: string | null;    // la de YouTube; null mientras no se sube
  youtube: { video: string | null; short: string | null };
  codigo: Codigo[];
};

const TODOS = datos.retos as Reto[];

/** Hoy en México (AAAA-MM-DD), que es el día con el que se programan. */
export const hoyMx = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });

/**
 * Los retos ya publicados: con fecha y que no sea futura. `ttcode programar`
 * sube los vídeos programados en YouTube y exporta aquí los de varios días
 * de golpe; cada página aparece sola el día que le toca, sin otro push. Por
 * eso las páginas que leen esto son dinámicas y no se hornean en el build.
 */
export const publicados = (hoy = hoyMx()) => TODOS.filter((r) => r.fecha && r.fecha <= hoy);

export const retoPorSlug = (slug: string) => publicados().find((r) => r.slug === slug);

/** Las secciones del canal, con el rótulo que llevan en el vídeo. */
export const SECCIONES: Record<Reto["seccion"], string> = {
  interview: "Interview challenge",
  basic: "Basic",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const enlaceReto = (slug: string, idioma: string) =>
  `${idioma === "en" ? "/en/challenges" : "/retos"}/${slug}`;
