import type { Curso } from "../tipos";
import { S01 } from "./s01-el-proyecto";
import { S02 } from "./s02-graficos";
import { S03 } from "./s03-bucle-y-controles";
import { S04 } from "./s04-logica";
import { S05 } from "./s05-azar";
import { S06 } from "./s06-sonido";
import { S07 } from "./s07-servidor";
import { S08 } from "./s08-en-linea";

export const SNAKE: Curso = {
  id: "snake",
  titulo: { es: "Así se hace un juego: Snake de Daily Challenge", en: "How a game is made: Daily Challenge's Snake" },
  resumen: {
    es: "El Snake de dailychallenge.click por dentro: el lenguaje, cómo se divide, gráficos, sonido, lógica, el servidor que no se cree tu puntaje y el multijugador en línea.",
    en: "Inside the Snake on dailychallenge.click: the language, how it's split up, graphics, sound, logic, the server that doesn't trust your score, and online multiplayer.",
  },
  intro: {
    es: "Snake es uno de los 36 juegos de Daily Challenge, y de los más sencillos de leer: unas 180 líneas de JavaScript sin motor ni librerías. Aquí se recorre entero, pieza por pieza, con el código de verdad. Conviene haber hecho las primeras unidades de estructuras de datos (arreglos, colas, BFS), porque Snake las usa todas.",
    en: "Snake is one of Daily Challenge's 36 games, and one of the easiest to read: about 180 lines of JavaScript with no engine or libraries. Here we go through all of it, piece by piece, with the real code. It helps to have done the first data structures units (arrays, queues, BFS), because Snake uses all of them.",
  },
  lenguaje: "JavaScript",
  acento: "caparazon",
  unidades: [S01, S02, S03, S04, S05, S06, S07, S08].filter((u) => u.lecciones.length > 0),
};
