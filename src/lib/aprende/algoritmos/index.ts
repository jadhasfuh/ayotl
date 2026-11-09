import type { Curso } from "../tipos";
import { A01 } from "./a01-ordenar";

export const ALGORITMOS: Curso = {
  id: "algoritmos",
  titulo: { es: "Algoritmos", en: "Algorithms" },
  resumen: {
    es: "Los algoritmos clásicos uno por uno, empezando por ordenar: cómo funcionan paso a paso, con código que se corre en el navegador, y cuánto trabajo hacen.",
    en: "The classic algorithms one by one, starting with sorting: how they work step by step, with code that runs in your browser, and how much work they do.",
  },
  intro: {
    es: "Cada lección toma un algoritmo clásico, lo sigue paso a paso con un programa que puedes cambiar y correr, y cuenta cuánto trabajo hace. Empieza por ordenar, que es de lo que más hace una computadora. Conviene conocer la notación O grande, de la primera unidad de estructuras de datos. Tu avance se guarda en este navegador, sin cuenta.",
    en: "Each lesson takes a classic algorithm, follows it step by step with a program you can change and run, and counts how much work it does. It starts with sorting, one of the things computers do most. It helps to know big O notation, from the first unit of data structures. Your progress is saved in this browser, no account needed.",
  },
  lenguaje: "JavaScript",
  acento: "tierra",
  unidades: [A01].filter((u) => u.lecciones.length > 0),
};
