import type { Idioma } from "../idioma";
import { ESTRUCTURAS } from "./estructuras";
import { SNAKE } from "./snake";
import type { Curso, Leccion } from "./tipos";

/** Los cursos, en el orden en que salen en /aprende. */
export const CURSOS: Curso[] = [ESTRUCTURAS, SNAKE];

export const cursoPorId = (id: string) => CURSOS.find((c) => c.id === id);

export const leccionesDe = (c: Curso): Leccion[] => c.unidades.flatMap((u) => u.lecciones);

export function leccionPorId(c: Curso, id: string): { leccion: Leccion; anterior: Leccion | null; siguiente: Leccion | null; numero: number } | null {
  const todas = leccionesDe(c);
  const i = todas.findIndex((l) => l.id === id);
  if (i < 0) return null;
  return { leccion: todas[i], anterior: todas[i - 1] ?? null, siguiente: todas[i + 1] ?? null, numero: i + 1 };
}

/** /aprende en español; /en/learn en inglés (el proxy traduce la carpeta). */
const BASE: Record<Idioma, string> = { es: "/aprende", en: "/en/learn" };
export const rutaCurso = (curso: string, idioma: Idioma) => `${BASE[idioma]}/${curso}`;
export const rutaLeccion = (curso: string, leccion: string, idioma: Idioma) => `${BASE[idioma]}/${curso}/${leccion}`;
