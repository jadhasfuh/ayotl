import type { Curso } from "../tipos";
import { U01 } from "./u01-fundamentos";
import { U02 } from "./u02-arreglos";
import { U03 } from "./u03-pilas-y-colas";
import { U04 } from "./u04-listas-enlazadas";
import { U05 } from "./u05-tablas-hash";
import { U06 } from "./u06-recursion";
import { U07 } from "./u07-arboles";
import { U08 } from "./u08-arboles-de-busqueda";
import { U09 } from "./u09-monticulos";
import { U10 } from "./u10-grafos";
import { U11 } from "./u11-avanzadas";

export const ESTRUCTURAS: Curso = {
  id: "estructuras-de-datos",
  titulo: { es: "Estructuras de datos desde cero", en: "Data structures from scratch" },
  resumen: {
    es: "De qué es un arreglo hasta Dijkstra, tries y cachés LRU, con código que se corre en el navegador.",
    en: "From what an array is to Dijkstra, tries and LRU caches, with code that runs in your browser.",
  },
  intro: {
    es: "Un curso en lecciones cortas: cada una explica una idea con código que puedes cambiar y correr, y luego te pregunta. Lo que falles vuelve al final hasta que salga. No hace falta saber programar mucho; sí, tener ganas de probar. Tu avance se guarda en este navegador, sin cuenta.",
    en: "A course in short lessons: each one explains an idea with code you can change and run, then quizzes you. Whatever you miss comes back at the end until you get it. You don't need to know much programming; just be willing to try things. Your progress is saved in this browser, no account needed.",
  },
  lenguaje: "JavaScript",
  acento: "agua",
  unidades: [U01, U02, U03, U04, U05, U06, U07, U08, U09, U10, U11].filter((u) => u.lecciones.length > 0),
};
