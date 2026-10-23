import type { Idioma } from "../idioma";

/**
 * Los cursos de /aprende. El contenido se escribe en ficheros TypeScript, uno
 * por unidad, como las notas: es poco, cambia despacio y así el compilador
 * revisa que a ninguna lección le falte su inglés.
 *
 * En los textos (`T`) vale un Markdown mínimo, el mismo en todas partes:
 * párrafos separados por una línea en blanco, renglones que empiezan con
 * «- » como lista, **negrita**, `código` y [enlaces](https://…).
 */
export type T = Record<Idioma, string>;

export type Enlace = { url: string; texto: T };

/**
 * Un dibujo hecho con SVG a partir de datos, para ver la estructura además de
 * leerla. `resalta` son posiciones (índices o valores, según el dibujo) que
 * salen en color de acento.
 */
export type Dibujo =
  | { tipo: "arreglo"; valores: (string | number)[]; resalta?: number[]; indices?: boolean; punteros?: { i: number; texto: string }[] }
  | { tipo: "lista"; valores: (string | number)[]; doble?: boolean; resalta?: number[] }
  | { tipo: "pila"; valores: (string | number)[] }                 // el último es la cima
  | { tipo: "cola"; valores: (string | number)[] }                 // el primero es el frente
  | { tipo: "arbol"; valores: (string | number | null)[]; resalta?: (string | number)[] }   // por niveles, null = hueco
  | { tipo: "grafo"; nodos: { id: string; x: number; y: number }[]; aristas: [string, string, number?][]; dirigido?: boolean; resalta?: string[] }
  | { tipo: "hash"; cubetas: (string | number)[][] }
  | { tipo: "rejilla"; filas: string[]; leyenda?: Record<string, T> };   // una letra por casilla

/** Código que se puede correr: lo que imprime `console.log` sale a la derecha. */
export type Programa = {
  codigo: string | T;      // T cuando los comentarios cambian de idioma
  notas?: T;               // qué mirar en la salida; sale debajo del resultado
};

/** Para `escribe`: `llamada` es una expresión de JS y `espera`, el JSON de lo que debe dar. */
export type Prueba = { llamada: string; espera: string };

export type Paso =
  /** Explicación: texto arriba y, si hay, el código que se corre con su resultado al lado. */
  | { tipo: "explica"; titulo: T; texto: T; programa?: Programa; dibujo?: Dibujo; enlaces?: Enlace[] }
  /** Opción múltiple. Las opciones en código van como string; las de texto, como T. */
  | { tipo: "elige"; pregunta: T; codigo?: string | T; opciones: (string | T)[]; correcta: number; porque: T }
  /** Completar huecos: cada `___` del código se llena, en orden, con una ficha del banco. */
  | { tipo: "completa"; pregunta: T; codigo: string; huecos: string[]; banco: string[]; porque: T }
  /** Ordenar renglones: `lineas` va en el orden bueno y se enseña revuelto. */
  | { tipo: "ordena"; pregunta: T; lineas: string[]; porque: T }
  /** Escribir código que pasa unas pruebas, en el navegador de quien lo escribe. */
  | { tipo: "escribe"; pregunta: T; inicial: string | T; pruebas: Prueba[]; solucion: string; porque: T };

export type Leccion = {
  id: string;
  titulo: T;
  resumen: T;              // una línea: sale en el camino y en los buscadores
  pasos: Paso[];
  retos?: string[];        // slugs de /retos para practicar después (sólo salen los ya publicados)
  enlaces?: Enlace[];      // para leer más
};

export type Unidad = { id: string; titulo: T; lecciones: Leccion[] };

export type Curso = {
  id: string;
  titulo: T;
  resumen: T;
  intro: T;                // el párrafo de arriba del camino
  lenguaje: string;
  acento: "agua" | "caparazon" | "tierra";
  unidades: Unidad[];
};

/** El texto en el idioma de la página; los string valen para los dos. */
export const en = (v: string | T, idioma: Idioma): string => (typeof v === "string" ? v : v[idioma]);

/**
 * Los enlaces internos del contenido se escriben con la dirección en español
 * (`/notas/…`, `/retos/…`, `/aprende/…`); en inglés se traducen a la suya.
 */
export function urlEn(url: string, idioma: Idioma): string {
  if (idioma === "es" || !url.startsWith("/")) return url;
  for (const [es, en] of [["/notas/", "/en/notes/"], ["/retos/", "/en/challenges/"], ["/aprende/", "/en/learn/"]] as const)
    if (url.startsWith(es)) return en + url.slice(es.length);
  return url;
}
