import type { Unidad } from "../tipos";

export const S01: Unidad = {
  id: "el-proyecto",
  titulo: { es: "El proyecto", en: "The project" },
  lecciones: [
    {
      id: "que-vamos-a-ver",
      titulo: { es: "Qué vamos a desarmar", en: "What we're taking apart" },
      resumen: {
        es: "Daily Challenge, su Snake y por qué está hecho en JavaScript puro, sin motor ni librerías.",
        en: "Daily Challenge, its Snake and why it's written in plain JavaScript, with no engine or libraries.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Un reto al día", en: "One challenge a day" },
          texto: {
            es: "[Daily Challenge](https://dailychallenge.click) pone un juego arcade nuevo cada día, al estilo de la Atari 2600: una partida por persona, un tablero del día y, a medianoche, el top 10. Tiene 36 juegos: 29 para el reto diario y 7 versus para jugar con amigos.\n\n**Snake** es de los más cortos y el más conocido: unas 180 líneas en un solo archivo, `games/snake.js`. Por eso es el que vamos a desarmar. El tablero es una cuadrícula de 16 × 17 casillas; las `x` del mapa son muros, y la serpiente come frutas para crecer.\n\nEl programa de abajo lee ese mapa tal como viene en el archivo de texto `snake_01.txt` y cuenta lo que hay.",
            en: "[Daily Challenge](https://dailychallenge.click) puts out a new arcade game every day, Atari 2600 style: one try per person, a board for the day and, at midnight, the top 10. It has 36 games: 29 for the daily challenge and 7 versus games to play with friends.\n\n**Snake** is one of the shortest and the best known: about 180 lines in a single file, `games/snake.js`. That's why it's the one we'll take apart. The board is a 16 × 17 grid; the `x`s in the map are walls, and the snake eats fruit to grow.\n\nThe program below reads that map just as it comes in the text file `snake_01.txt` and counts what's in it.",
          },
          dibujo: {
            tipo: "rejilla",
            filas: [
              "xxxxxxxxxxxxxxxx",
              "x..............x",
              "x..xx......xx..x",
              "x..xx......xx..x",
              "x..............x",
              "x...........f..x",
              "x..............x",
              "x..............x",
              "x....ssc.......x",
              "x..............x",
              "x..............x",
              "x..............x",
              "x..............x",
              "x..xx......xx..x",
              "x..xx......xx..x",
              "x..............x",
              "xxxxxxxxxxxxxxxx",
            ],
            leyenda: {
              x: { es: "muro", en: "wall" },
              s: { es: "cuerpo", en: "body" },
              c: { es: "cabeza", en: "head" },
              f: { es: "fruta", en: "fruit" },
            },
          },
          programa: {
            codigo: {
              es: `// El mapa snake_01.txt, tal cual (16 columnas x 17 renglones)
const mapa = [
  "xxxxxxxxxxxxxxxx",
  "x..............x",
  "x..xx......xx..x",
  "x..xx......xx..x",
  "x..............x",
  "x..............x",
  "x..............x",
  "x..............x",
  "x......p.......x",
  "x..............x",
  "x..............x",
  "x..............x",
  "x..............x",
  "x..xx......xx..x",
  "x..xx......xx..x",
  "x..............x",
  "xxxxxxxxxxxxxxxx",
];

let muros = 0, libres = 0;
for (const renglon of mapa)
  for (const c of renglon)
    if (c === "x") muros++; else libres++;

console.log("renglones:", mapa.length, "columnas:", mapa[0].length);
console.log("muros:", muros, "libres:", libres);
const y = mapa.findIndex(r => r.includes("p"));
console.log("la serpiente sale en", { x: mapa[y].indexOf("p"), y });`,
              en: `// The map snake_01.txt, as is (16 columns x 17 rows)
const mapa = [
  "xxxxxxxxxxxxxxxx",
  "x..............x",
  "x..xx......xx..x",
  "x..xx......xx..x",
  "x..............x",
  "x..............x",
  "x..............x",
  "x..............x",
  "x......p.......x",
  "x..............x",
  "x..............x",
  "x..............x",
  "x..............x",
  "x..xx......xx..x",
  "x..xx......xx..x",
  "x..............x",
  "xxxxxxxxxxxxxxxx",
];

let muros = 0, libres = 0;
for (const renglon of mapa)
  for (const c of renglon)
    if (c === "x") muros++; else libres++;

console.log("rows:", mapa.length, "columns:", mapa[0].length);
console.log("walls:", muros, "free:", libres);
const y = mapa.findIndex(r => r.includes("p"));
console.log("the snake starts at", { x: mapa[y].indexOf("p"), y });`,
            },
            notas: {
              es: "Un nivel entero es un arreglo de textos. La `p` marca la salida de la serpiente (columna 7, renglón 8). Los mapas viven en archivos `.txt` aparte del código: hacer un nivel nuevo es escribir un dibujo, no programar.",
              en: "A whole level is an array of strings. The `p` marks where the snake starts (column 7, row 8). Maps live in `.txt` files apart from the code: making a new level means drawing, not programming.",
            },
          },
          enlaces: [{ url: "https://dailychallenge.click/juegos/snake", texto: { es: "Juega Snake en Daily Challenge", en: "Play Snake on Daily Challenge" } }],
        },
        {
          tipo: "explica",
          titulo: { es: "Sin motor y sin compilar", en: "No engine, no build step" },
          texto: {
            es: "No hay Unity, ni Phaser, ni un paso de compilación. Cada juego es un **módulo de JavaScript** que importa lo que necesita, y el navegador lo carga tal cual:\n\n`import { BTN } from '../core/buttons.js';`\n\nLa razón más fuerte es otra: **el mismo archivo corre en el servidor**. Cuando terminas una partida, tu teléfono no manda tu puntaje: manda la lista de botones que apretaste en cada momento. El servidor (Node.js) importa el mismo `snake.js`, vuelve a jugar la partida con esos botones y saca el puntaje él solo. Si el juego dependiera de un motor que sólo vive en el navegador, eso no se podría.\n\nEl programa simula las dos partes con el mismo código.",
            en: "There's no Unity, no Phaser and no build step. Each game is a **JavaScript module** that imports what it needs, and the browser loads it as is:\n\n`import { BTN } from '../core/buttons.js';`\n\nThe strongest reason is a different one: **the same file runs on the server**. When you finish a game, your phone doesn't send your score: it sends the list of buttons you pressed at each moment. The server (Node.js) imports the very same `snake.js`, replays the game with those buttons and works out the score itself. If the game depended on an engine that only lives in the browser, that wouldn't be possible.\n\nThe program simulates both sides with the same code.",
          },
          programa: {
            codigo: {
              es: `// Un "juego" mínimo: suma puntos si aprietas A (16)
class Juego {
  constructor() { this.score = 0; this.over = false; this.tick = 0; }
  update(mask) {
    this.tick++;
    if (mask & 16) this.score += 10;
    if (this.tick >= 6) this.over = true;
  }
}

// En el teléfono: se juega y se guarda cada botón
const log = [0, 16, 0, 16, 16, 0];
const telefono = new Juego();
for (const m of log) telefono.update(m);

// En el servidor: llega SOLO el log, y se vuelve a jugar
const servidor = new Juego();
for (const m of log) servidor.update(m);

console.log("teléfono:", telefono.score, "servidor:", servidor.score);`,
              en: `// A tiny "game": scores points when you press A (16)
class Juego {
  constructor() { this.score = 0; this.over = false; this.tick = 0; }
  update(mask) {
    this.tick++;
    if (mask & 16) this.score += 10;
    if (this.tick >= 6) this.over = true;
  }
}

// On the phone: you play and every button is saved
const log = [0, 16, 0, 16, 16, 0];
const telefono = new Juego();
for (const m of log) telefono.update(m);

// On the server: ONLY the log arrives, and it's replayed
const servidor = new Juego();
for (const m of log) servidor.update(m);

console.log("phone:", telefono.score, "server:", servidor.score);`,
            },
            notas: {
              es: "Los dos dan 30. El servidor nunca vio la pantalla ni recibió un número de puntos: lo calculó. Esa idea sostiene todo el curso, y la unidad del servidor la cuenta completa.",
              en: "Both give 30. The server never saw the screen or received a point total: it computed it. That idea holds up the whole course, and the server unit tells the full story.",
            },
          },
          enlaces: [{ url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Modules", texto: { es: "Módulos de JavaScript (MDN)", en: "JavaScript modules (MDN)" } }],
        },
        {
          tipo: "explica",
          titulo: { es: "Lo que el lenguaje da y lo que no", en: "What the language gives you and what it doesn't" },
          texto: {
            es: "El navegador trae casi todo lo que un juego arcade necesita:\n\n- **Canvas 2D** para pintar píxeles.\n- **Web Audio** para generar sonido con osciladores, sin archivos de audio.\n- Eventos de **teclado y toque** (`pointerdown`, `keydown`).\n- `requestAnimationFrame` para dibujar al ritmo de la pantalla.\n- Conexiones en vivo para jugar en línea.\n\nY tiene tres trampas que el código de Daily Challenge esquiva a propósito:\n\n- **Un solo hilo**: si un cálculo tarda, la pantalla se congela. Por eso cada paso del juego es corto.\n- **Números con decimales que redondean**: `0.1 + 0.2` no da `0.3` exacto. Para que el teléfono y el servidor saquen lo mismo, el azar se hace con enteros de 32 bits (`Math.imul`, `>>> 0`) y no con `Math.random`.\n- **El recolector de basura**: crear objetos nuevos en cada cuadro causa tirones. Snake vacía su lista de eventos con `this.events.length = 0` en vez de crear una nueva.",
            en: "The browser comes with almost everything an arcade game needs:\n\n- **Canvas 2D** to paint pixels.\n- **Web Audio** to generate sound with oscillators, no audio files.\n- **Keyboard and touch** events (`pointerdown`, `keydown`).\n- `requestAnimationFrame` to draw in step with the screen.\n- Live connections for online play.\n\nAnd it has three traps that Daily Challenge's code dodges on purpose:\n\n- **A single thread**: if a calculation takes long, the screen freezes. So every game step is short.\n- **Decimal numbers that round**: `0.1 + 0.2` isn't exactly `0.3`. For the phone and the server to get the same result, randomness uses 32-bit integers (`Math.imul`, `>>> 0`), not `Math.random`.\n- **The garbage collector**: creating new objects every frame causes stutters. Snake empties its event list with `this.events.length = 0` instead of making a new one.",
          },
          programa: {
            codigo: `console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);

// Con enteros de 32 bits no hay redondeo: da igual en todos lados
console.log(Math.imul(123456789, 987654321));
console.log((4000000000 + 500000000) >>> 0);

// Math.random cambia en cada corrida (y no se le puede dar semilla)
console.log(Math.random() === Math.random());

// Vaciar sin crear un arreglo nuevo
const events = ["eat", "die"];
const mismo = events;
events.length = 0;
console.log(mismo, mismo === events);`,
            notas: {
              es: "- `0.30000000000000004`: el redondeo de los decimales.\n- `Math.imul` multiplica como lo haría C con enteros de 32 bits, y `>>> 0` deja el número sin signo: resultados exactos en cualquier máquina.\n- Vaciar con `length = 0` deja **el mismo** arreglo (`true`), sin basura nueva.",
              en: "- `0.30000000000000004`: decimal rounding.\n- `Math.imul` multiplies the way C does with 32-bit integers, and `>>> 0` makes the number unsigned: exact results on any machine.\n- Emptying with `length = 0` keeps **the same** array (`true`), no new garbage.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Por qué el servidor puede calcular el puntaje de tu partida?", en: "Why can the server compute your game's score?" },
          opciones: [
            { es: "Porque tu teléfono le manda el puntaje firmado", en: "Because your phone sends it the signed score" },
            { es: "Porque corre el mismo archivo del juego con tus botones", en: "Because it runs the same game file with your buttons" },
            { es: "Porque graba la pantalla de tu teléfono", en: "Because it records your phone's screen" },
            { es: "Porque usa Unity en el servidor", en: "Because it uses Unity on the server" },
          ],
          correcta: 1,
          porque: { es: "El juego es JavaScript puro, sin depender del navegador, así que Node.js puede importar el mismo `snake.js` y volver a jugar la partida con el registro de botones.", en: "The game is plain JavaScript that doesn't depend on the browser, so Node.js can import the same `snake.js` and replay the game from the button log." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Por qué el azar de los juegos no usa `Math.random()`?", en: "Why doesn't the games' randomness use `Math.random()`?" },
          opciones: [
            { es: "Porque es muy lento", en: "Because it's too slow" },
            { es: "Porque no existe en Node.js", en: "Because it doesn't exist in Node.js" },
            { es: "Porque no se le puede dar una semilla: el servidor no podría repetir la partida", en: "Because you can't seed it: the server couldn't replay the game" },
            { es: "Porque sólo da números enteros", en: "Because it only returns integers" },
          ],
          correcta: 2,
          porque: { es: "`Math.random()` da algo distinto en cada corrida. Para repetir una partida idéntica hace falta un generador con semilla, que es lo que usa Daily Challenge (lo verás en la unidad del azar).", en: "`Math.random()` gives something different on every run. Replaying an identical game needs a seeded generator, which is what Daily Challenge uses (you'll see it in the randomness unit)." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa la primera línea de `snake.js`, que trae los botones de otro módulo.", en: "Complete the first line of `snake.js`, which brings in the buttons from another module." },
          codigo: "___ { BTN } ___ '../core/buttons.js';",
          huecos: ["import", "from"],
          banco: ["import", "from", "require", "export", "in"],
          porque: { es: "`import { … } from '…'` es la forma de los módulos ES: el navegador y Node la entienden sin herramientas extra.", en: "`import { … } from '…'` is the ES module syntax: both the browser and Node understand it without extra tools." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `simular(log)`. Empieza en `x = 0`; por cada número del log, si es `8` (derecha) suma 1 y si es `4` (izquierda) resta 1. Devuelve `x`.\n\nEs lo que hace el servidor en pequeño: volver a jugar desde los botones.",
            en: "Write `simular(log)`. Start at `x = 0`; for each number in the log, if it's `8` (right) add 1, and if it's `4` (left) subtract 1. Return `x`.\n\nIt's what the server does, in miniature: replay from the buttons.",
          },
          inicial: {
            es: "function simular(log) {\n  let x = 0;\n  // recorre el log\n  return x;\n}\n\nconsole.log(simular([8, 8, 4, 0, 8]));",
            en: "function simular(log) {\n  let x = 0;\n  // walk through the log\n  return x;\n}\n\nconsole.log(simular([8, 8, 4, 0, 8]));",
          },
          pruebas: [
            { llamada: "simular([8, 8, 4, 0, 8])", espera: "2" },
            { llamada: "simular([4, 4, 4])", espera: "-3" },
            { llamada: "simular([0, 16, 1])", espera: "0" },
            { llamada: "simular([])", espera: "0" },
          ],
          solucion: "function simular(log) {\n  let x = 0;\n  for (const m of log) {\n    if (m === 8) x++;\n    else if (m === 4) x--;\n  }\n  return x;\n}",
          porque: { es: "Un ciclo sobre el log y nada más: sin pantalla, sin tiempo real. Con el mismo log siempre sale lo mismo, y eso es lo que permite verificar.", en: "One loop over the log and nothing else: no screen, no real time. The same log always gives the same result, and that's what makes verification possible." },
        },
      ],
    },
    {
      id: "como-se-divide",
      titulo: { es: "Cómo se divide el código", en: "How the code is split up" },
      resumen: {
        es: "Las carpetas, el contrato que cumple cada juego y por qué la lógica nunca toca la pantalla.",
        en: "The folders, the contract every game follows and why the logic never touches the screen.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Las carpetas", en: "The folders" },
          texto: {
            es: "Todo el arcade vive en `public/arcade/`, dividido por responsabilidad:\n\n- `core/`: lo que comparten los 36 juegos. `renderer.js` (pintar), `input.js` (botones), `audio.js` y `music.js` (sonido), `rng.js` (azar con semilla), `map.js` (leer mapas), `buttons.js`, `palette.js` (colores).\n- `games/`: un archivo por juego (`snake.js`, `tetris.js`…) y un `index.js` que los registra.\n- `main.js` y `shell.js`: las pantallas, el menú y el bucle que llama al juego 30 veces por segundo.\n- `net.js`: la conversación con el servidor.\n- `verify.js`: volver a jugar una partida a partir de sus botones.\n\nY aparte, `public/content/`: los mapas y la música, en archivos de texto.",
            en: "The whole arcade lives in `public/arcade/`, split by responsibility:\n\n- `core/`: what all 36 games share. `renderer.js` (drawing), `input.js` (buttons), `audio.js` and `music.js` (sound), `rng.js` (seeded randomness), `map.js` (reading maps), `buttons.js`, `palette.js` (colors).\n- `games/`: one file per game (`snake.js`, `tetris.js`…) and an `index.js` that registers them.\n- `main.js` and `shell.js`: the screens, the menu and the loop that calls the game 30 times a second.\n- `net.js`: talking to the server.\n- `verify.js`: replaying a game from its buttons.\n\nAnd separately, `public/content/`: the maps and the music, as text files.",
          },
          programa: {
            codigo: {
              es: `const archivos = {
  "core/renderer.js": { dom: true,  hace: "pintar en el canvas" },
  "core/input.js":    { dom: true,  hace: "teclado, D-pad y swipes" },
  "core/audio.js":    { dom: true,  hace: "el chip de sonido" },
  "core/rng.js":      { dom: false, hace: "azar con semilla" },
  "core/map.js":      { dom: false, hace: "mapas de texto a cuadrícula" },
  "games/snake.js":   { dom: false, hace: "las reglas de Snake" },
  "verify.js":        { dom: false, hace: "re-simular una partida" },
  "main.js":          { dom: true,  hace: "pantallas y bucle" },
};

const puros = Object.keys(archivos).filter(f => !archivos[f].dom);
console.log("pueden correr en el servidor:");
for (const f of puros) console.log("  " + f, "->", archivos[f].hace);`,
              en: `const archivos = {
  "core/renderer.js": { dom: true,  hace: "draw on the canvas" },
  "core/input.js":    { dom: true,  hace: "keyboard, D-pad and swipes" },
  "core/audio.js":    { dom: true,  hace: "the sound chip" },
  "core/rng.js":      { dom: false, hace: "seeded randomness" },
  "core/map.js":      { dom: false, hace: "text maps to a grid" },
  "games/snake.js":   { dom: false, hace: "Snake's rules" },
  "verify.js":        { dom: false, hace: "replay a game" },
  "main.js":          { dom: true,  hace: "screens and loop" },
};

const puros = Object.keys(archivos).filter(f => !archivos[f].dom);
console.log("can run on the server:");
for (const f of puros) console.log("  " + f, "->", archivos[f].hace);`,
            },
            notas: {
              es: "La línea que divide el proyecto: de un lado lo que necesita el navegador (pantalla, teclado, sonido); del otro, lo que es puro cálculo y por eso también corre en Node. El juego queda del lado puro.",
              en: "The line that splits the project: on one side what needs the browser (screen, keyboard, sound); on the other, pure computation that therefore also runs in Node. The game sits on the pure side.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "El contrato de un juego", en: "A game's contract" },
          texto: {
            es: "Los 36 juegos cumplen la misma forma, y por eso `main.js` puede correr cualquiera sin saber cuál es:\n\n- `static id`, `title` y `hint`: el nombre y la ayuda de controles (en español, inglés y japonés).\n- `constructor(seed, mapText, opts)`: arma la partida con la semilla del día, el texto del mapa y opciones (en Snake, `opts.param` son los muros extra).\n- `update(mask)`: avanza **un tick** con los botones de ese tick.\n- `render(r)`: pinta el estado con el renderer `r`.\n- `score`, `over` y `events`: el puntaje, si ya terminó y lo que pasó en este tick (`'eat'`, `'die'`).\n\nEl programa arma un juego de juguete con ese contrato y un «main» que no sabe nada de él.",
            en: "All 36 games follow the same shape, which is why `main.js` can run any of them without knowing which one it is:\n\n- `static id`, `title` and `hint`: the name and the controls hint (in Spanish, English and Japanese).\n- `constructor(seed, mapText, opts)`: sets up the game with the day's seed, the map text and options (in Snake, `opts.param` is the number of extra walls).\n- `update(mask)`: advances **one tick** with that tick's buttons.\n- `render(r)`: draws the state using the renderer `r`.\n- `score`, `over` and `events`: the score, whether it's finished, and what happened this tick (`'eat'`, `'die'`).\n\nThe program builds a toy game with that contract and a \"main\" that knows nothing about it.",
          },
          programa: {
            codigo: {
              es: `class Monedas {
  static id = "monedas";
  static title = "MONEDAS";
  constructor(seed, mapText, opts = {}) {
    this.meta = opts.param ?? 3;
    this.score = 0; this.over = false; this.events = [];
  }
  update(mask) {
    this.events.length = 0;
    if (this.over) return;
    if (mask & 16) { this.score += 5; this.events.push("eat"); }
    if (this.score >= this.meta * 5) { this.over = true; this.events.push("die"); }
  }
  render(r) { r.text("SCORE " + this.score); }
}

// El "main": no sabe qué juego es, sólo usa el contrato
function correr(Juego, log) {
  const g = new Juego(1234, "", { param: 2 });
  const r = { text: s => console.log("  pantalla:", s) };
  for (const mask of log) {
    g.update(mask);
    for (const e of g.events) console.log("  sonido:", e);
    if (g.over) break;
  }
  g.render(r);
  return g.score;
}

console.log(Monedas.title, "->", correr(Monedas, [0, 16, 0, 16, 16]));`,
              en: `class Monedas {
  static id = "monedas";
  static title = "COINS";
  constructor(seed, mapText, opts = {}) {
    this.meta = opts.param ?? 3;
    this.score = 0; this.over = false; this.events = [];
  }
  update(mask) {
    this.events.length = 0;
    if (this.over) return;
    if (mask & 16) { this.score += 5; this.events.push("eat"); }
    if (this.score >= this.meta * 5) { this.over = true; this.events.push("die"); }
  }
  render(r) { r.text("SCORE " + this.score); }
}

// The "main": doesn't know which game it is, it only uses the contract
function correr(Juego, log) {
  const g = new Juego(1234, "", { param: 2 });
  const r = { text: s => console.log("  screen:", s) };
  for (const mask of log) {
    g.update(mask);
    for (const e of g.events) console.log("  sound:", e);
    if (g.over) break;
  }
  g.render(r);
  return g.score;
}

console.log(Monedas.title, "->", correr(Monedas, [0, 16, 0, 16, 16]));`,
            },
            notas: {
              es: "Con `param: 2` la partida acaba al segundo A: suenan `eat`, `eat` y `die`, y el último 16 del log ya no se juega. Cambia `param` a 3 y vuelve a correrlo.",
              en: "With `param: 2` the game ends on the second A: you get `eat`, `eat` and `die`, and the last 16 in the log never gets played. Change `param` to 3 and run it again.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "La lógica no toca la pantalla", en: "The logic never touches the screen" },
          texto: {
            es: "El encabezado de `snake.js` lo dice así: «Snake determinista y sin dependencias de DOM: update() solo recibe la bitmask del tick, render() solo recibe el renderer».\n\n`update` no pinta, no suena y no lee el teclado. Si quiere que algo suene, lo **anota** en `events`, y es `main.js` quien decide qué hacer:\n\n`for (const e of game.events) chip.sfx(e);`\n\nGracias a eso, la misma partida puede correr en el teléfono (con sonido), en el servidor (sin nada), como fantasma que ves jugar o en un video generado por una herramienta. Ninguno de esos sitios necesita una pantalla de verdad.",
            en: "The header of `snake.js` puts it like this: \"Deterministic Snake with no DOM dependencies: update() only receives the tick's bitmask, render() only receives the renderer.\"\n\n`update` doesn't draw, doesn't play sounds and doesn't read the keyboard. If it wants something to make a sound, it **writes it down** in `events`, and `main.js` decides what to do:\n\n`for (const e of game.events) chip.sfx(e);`\n\nThanks to that, the same game can run on the phone (with sound), on the server (with nothing), as a ghost you watch playing, or in a video produced by a tool. None of those places needs a real screen.",
          },
          programa: {
            codigo: {
              es: `function verifyRun(Game, log) {
  const g = new Game();
  let ticks = 0;
  for (const mask of log) {
    if (g.over) break;
    g.update(mask);
    ticks++;
  }
  return { score: g.score, over: g.over, ticks };
}

class Contador {
  constructor() { this.score = 0; this.over = false; this.events = []; }
  update(mask) {
    this.events.length = 0;
    if (mask & 16) { this.score++; this.events.push("eat"); }
    if (this.score === 3) this.over = true;
  }
}

// Igual que verify.js: sin sonido, sin pantalla, sin teclado
console.log(verifyRun(Contador, [16, 0, 16, 16, 16, 16]));`,
              en: `function verifyRun(Game, log) {
  const g = new Game();
  let ticks = 0;
  for (const mask of log) {
    if (g.over) break;
    g.update(mask);
    ticks++;
  }
  return { score: g.score, over: g.over, ticks };
}

class Contador {
  constructor() { this.score = 0; this.over = false; this.events = []; }
  update(mask) {
    this.events.length = 0;
    if (mask & 16) { this.score++; this.events.push("eat"); }
    if (this.score === 3) this.over = true;
  }
}

// Just like verify.js: no sound, no screen, no keyboard
console.log(verifyRun(Contador, [16, 0, 16, 16, 16, 16]));`,
            },
            notas: {
              es: "Ésta es casi literal la función `verifyRun` de `verify.js`. Se detiene en cuanto `over` es verdadero (4 ticks), aunque el log traiga más: lo que alguien teclee después de perder no cuenta.",
              en: "This is almost literally the `verifyRun` function from `verify.js`. It stops as soon as `over` is true (4 ticks), even if the log has more: whatever someone types after losing doesn't count.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿En qué método de un juego está permitido dibujar?", en: "Which game method is allowed to draw?" },
          opciones: ["constructor", "update(mask)", "render(r)", { es: "En ninguno", en: "None of them" }],
          correcta: 2,
          porque: { es: "Sólo `render(r)` pinta, y únicamente con lo que le pasan en `r`. `update` cambia el estado y deja anotados los eventos.", en: "Only `render(r)` draws, and only through the `r` it's given. `update` changes the state and writes down the events." },
        },
        {
          tipo: "elige",
          pregunta: { es: "Snake quiere que suene algo al comer. ¿Qué hace?", en: "Snake wants a sound when it eats. What does it do?" },
          opciones: [
            { es: "Llama a `chip.sfx('eat')` desde `update`", en: "Calls `chip.sfx('eat')` from `update`" },
            { es: "Mete `'eat'` en `this.events` y `main.js` lo hace sonar", en: "Pushes `'eat'` into `this.events` and `main.js` plays it" },
            { es: "Carga un archivo `eat.mp3`", en: "Loads an `eat.mp3` file" },
            { es: "Manda un mensaje al servidor", en: "Sends a message to the server" },
          ],
          correcta: 1,
          porque: { es: "El juego sólo anota el evento. Así, en el servidor —donde no hay sonido— el mismo código corre sin cambiar nada.", en: "The game only writes down the event. That way, on the server —where there's no sound— the same code runs unchanged." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa el contrato: los dos métodos que `main.js` llama en cada vuelta.", en: "Complete the contract: the two methods `main.js` calls every time around." },
          codigo: "class MiJuego {\n  constructor(seed, mapText, opts) { /* … */ }\n  ___(mask) { /* avanza un tick */ }\n  ___(r) { /* pinta */ }\n}",
          huecos: ["update", "render"],
          banco: ["update", "render", "draw", "tick", "loop"],
          porque: { es: "`update(mask)` avanza la simulación y `render(r)` la pinta. Los nombres importan: `main.js`, `verify.js` y el party los llaman así para los 36 juegos.", en: "`update(mask)` advances the simulation and `render(r)` draws it. The names matter: `main.js`, `verify.js` and the party mode call them like that for all 36 games." },
        },
        {
          tipo: "ordena",
          pregunta: { es: "Ordena el cuerpo de `verifyRun`.", en: "Put the body of `verifyRun` in order." },
          lineas: [
            "const g = new Game(seed, mapText, opts);",
            "let ticks = 0;",
            "for (const mask of log) {",
            "  if (g.over) break;",
            "  g.update(mask);",
            "  ticks++;",
            "}",
            "return { score: g.score, over: g.over, ticks };",
          ],
          porque: { es: "Se crea la partida con lo mismo que tuvo el jugador, se reparte el log tick por tick y se para al perder. Lo que devuelve es lo único que el servidor cree.", en: "Create the game with the same inputs the player had, feed the log tick by tick and stop on game over. What it returns is the only thing the server believes." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `verificar(Juego, log)`: crea un `new Juego()`, le pasa el log con `update` uno por uno, **se detiene cuando `over` sea verdadero** y devuelve el `score`.",
            en: "Write `verificar(Juego, log)`: create a `new Juego()`, feed it the log with `update` one by one, **stop when `over` is true**, and return the `score`.",
          },
          inicial: {
            es: "function verificar(Juego, log) {\n  const g = new Juego();\n  // reparte el log\n}\n",
            en: "function verificar(Juego, log) {\n  const g = new Juego();\n  // feed it the log\n}\n",
          },
          pruebas: [
            { llamada: "verificar(class { constructor() { this.score = 0; this.over = false; } update(m) { this.score += m; } }, [1, 2])", espera: "3" },
            { llamada: "verificar(class { constructor() { this.score = 0; this.over = false; } update(m) { this.score += m; if (this.score >= 10) this.over = true; } }, [3, 4, 5, 6])", espera: "12" },
            { llamada: "verificar(class { constructor() { this.score = 7; this.over = false; } update(m) {} }, [])", espera: "7" },
          ],
          solucion: "function verificar(Juego, log) {\n  const g = new Juego();\n  for (const mask of log) {\n    if (g.over) break;\n    g.update(mask);\n  }\n  return g.score;\n}",
          porque: { es: "La segunda prueba es la importante: después de llegar a 12 la partida terminó y el 6 ya no cuenta. Sin el `break`, daría 18.", en: "The second test is the important one: after reaching 12 the game is over and the 6 doesn't count. Without the `break` you'd get 18." },
        },
      ],
    },
  ],
};
