import type { T, Unidad } from "../tipos";

/** El mismo programa en los dos idiomas: sólo cambian los comentarios y los textos que imprime. */
const bi = (es: string, pares: [string, string][]): T => ({ es, en: pares.reduce((s, [a, b]) => s.split(a).join(b), es) });

// Un juego mínimo y determinista para las demostraciones de esta unidad: un
// punto en una fila de diez casillas que junta monedas. Misma forma que los
// juegos de Daily Challenge: constructor(seed), update(mask), score y over.
const JUEGO = `function mulberry32(seed) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return { next, int: (min, max) => min + Math.floor(next() * (max - min + 1)) };
}

const BTN = { UP: 1, DOWN: 2, LEFT: 4, RIGHT: 8, A: 16 };

// Un juego de juguete: un punto en una fila de 10 casillas que junta monedas
class Monedas {
  constructor(seed) {
    this.rng = mulberry32(seed);
    this.x = 0; this.moneda = this.rng.int(1, 9);
    this.score = 0; this.tick = 0; this.over = false;
  }
  update(mask) {
    if (this.over) return;
    this.tick++;
    if (mask & BTN.RIGHT) this.x = Math.min(9, this.x + 1);
    if (mask & BTN.LEFT) this.x = Math.max(0, this.x - 1);
    if (this.x === this.moneda) { this.score += 10; this.moneda = this.rng.int(0, 9); }
    if (this.tick >= 60) this.over = true;
  }
}`;

const JUEGO_EN: [string, string][] = [["// Un juego de juguete: un punto en una fila de 10 casillas que junta monedas", "// A toy game: a dot on a row of 10 cells collecting coins"]];

export const S07: Unidad = {
  id: "servidor",
  titulo: { es: "El servidor y el reto diario", en: "The server and the daily challenge" },
  lecciones: [
    {
      id: "no-creer-el-puntaje",
      titulo: { es: "El servidor no se cree tu puntaje", en: "The server doesn't trust your score" },
      resumen: {
        es: "El teléfono manda los botones de cada tick, no un número; el servidor vuelve a jugar la partida con el mismo código y saca el puntaje él solo.",
        en: "The phone sends each tick's buttons, not a number; the server replays the game with the same code and works out the score itself.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Un número se cambia en la consola", en: "A number can be changed in the console" },
          texto: {
            es: "La forma ingenua de guardar un récord es que el teléfono mande `{ puntaje: 340 }`. El problema: cualquiera abre las herramientas del navegador y manda `{ puntaje: 999999 }`. El servidor no tiene cómo saber si es verdad.\n\nDaily Challenge manda otra cosa: **el registro de botones** de la partida, uno por tick. Cada tick es una máscara de bits entre 0 y 31 (unidad 3), y para que viaje como texto corto se escribe un carácter por tick: el de código `48 + máscara`. Así, 0 es `'0'`, arriba es `'1'`, derecha es `'8'` y el botón A (16) es `'@'`. Una partida de dos minutos son 3600 caracteres.",
            en: "The naive way to save a high score is for the phone to send `{ puntaje: 340 }`. The problem: anyone can open the browser's tools and send `{ puntaje: 999999 }`. The server has no way to know if it's true.\n\nDaily Challenge sends something else: **the button log** of the game, one entry per tick. Each tick is a bitmask between 0 and 31 (unit 3), and to travel as short text it's written as one character per tick: the one with code `48 + mask`. So 0 is `'0'`, up is `'1'`, right is `'8'` and the A button (16) is `'@'`. A two-minute game is 3,600 characters.",
          },
          programa: {
            codigo: bi(`const BTN = { UP: 1, DOWN: 2, LEFT: 4, RIGHT: 8, A: 16 };

// De net.js: un carácter por tick
const codificar = (log) => log.map((m) => String.fromCharCode(48 + m)).join("");
// De /api/score: de vuelta a números
const decodificar = (texto) => Array.from(texto, (ch) => ch.charCodeAt(0) - 48);

const log = [0, 0, BTN.RIGHT, BTN.RIGHT, BTN.UP, BTN.A, BTN.RIGHT | BTN.A, 0];
const texto = codificar(log);
console.log("máscaras:", log);
console.log("texto:   ", texto);
console.log("de vuelta:", decodificar(texto));
console.log("dos minutos a 30 ticks/s:", 30 * 120, "caracteres");`, [
              ["// De net.js: un carácter por tick", "// From net.js: one character per tick"],
              ["// De /api/score: de vuelta a números", "// From /api/score: back to numbers"],
              ["\"máscaras:\"", "\"masks:\""], ["\"de vuelta:\"", "\"back again:\""],
              ["\"dos minutos a 30 ticks/s:\"", "\"two minutes at 30 ticks/s:\""], ["\"caracteres\"", "\"characters\""],
            ]),
            notas: {
              es: "- `RIGHT | A` es 8 + 16 = 24, y su carácter es `'H'` (48 + 24 = 72).\n- Del 48 al 79 sólo hay números, letras mayúsculas y unos pocos signos (`: ; < = > ? @`): nada que se rompa al viajar en JSON.\n- Decodificar devuelve exactamente el arreglo original.",
              en: "- `RIGHT | A` is 8 + 16 = 24, and its character is `'H'` (48 + 24 = 72).\n- From 48 to 79 there are only digits, capital letters and a few symbols (`: ; < = > ? @`): nothing that breaks when sent as JSON.\n- Decoding gives back exactly the original array.",
            },
          },
          enlaces: [{ url: "/notas/el-cliente-nunca-manda-un-numero", texto: { es: "La nota: el cliente nunca manda un número", en: "The note: the client never sends a number" } }],
        },
        {
          tipo: "explica",
          titulo: { es: "Volver a jugar la partida", en: "Replaying the game" },
          texto: {
            es: "Con el registro, el servidor hace lo que haría el teléfono: crea el juego con **la misma semilla** y le pasa los botones uno por uno. Como la simulación es determinista (unidad 5), llega al mismo final y al mismo puntaje. Ésta es `verifyRun`, de `public/arcade/verify.js`, casi tal cual:\n\n`for (const mask of log) { if (g.over) break; g.update(mask); }`\n\nY el detalle que lo hace funcionar: el servidor no tiene una copia del juego, **importa el mismo archivo** `games/snake.js` que corre en tu navegador. Si fueran dos programas, tarde o temprano dirían cosas distintas.",
            en: "With the log, the server does what the phone would do: it creates the game with **the same seed** and feeds it the buttons one by one. Since the simulation is deterministic (unit 5), it reaches the same ending and the same score. This is `verifyRun`, from `public/arcade/verify.js`, almost as is:\n\n`for (const mask of log) { if (g.over) break; g.update(mask); }`\n\nAnd the detail that makes it work: the server doesn't have a copy of the game, it **imports the same file** `games/snake.js` that runs in your browser. If they were two programs, sooner or later they'd disagree.",
          },
          programa: {
            codigo: bi(`${JUEGO}

// verifyRun de verify.js, con un solo juego
function verifyRun(seed, log) {
  const g = new Monedas(seed);
  let ticks = 0;
  for (const mask of log) {
    if (g.over) break;
    g.update(mask);
    ticks++;
  }
  return { score: g.score, over: g.over, ticks };
}

// EN EL TELÉFONO: alguien juega y se guardan sus botones
const semilla = 20261023;
const partida = new Monedas(semilla);
const log = [];
while (!partida.over) {
  const mask = partida.moneda > partida.x ? BTN.RIGHT : partida.moneda < partida.x ? BTN.LEFT : 0;
  log.push(mask);
  partida.update(mask);
}
console.log("el teléfono vio:", partida.score, "puntos");
console.log("y dice que sacó:", 999999);

// EN EL SERVIDOR: no lee el número, vuelve a jugar
console.log("el servidor calcula:", verifyRun(semilla, log));`, [
              ...JUEGO_EN,
              ["// verifyRun de verify.js, con un solo juego", "// verifyRun from verify.js, with a single game"],
              ["// EN EL TELÉFONO: alguien juega y se guardan sus botones", "// ON THE PHONE: someone plays and their buttons are recorded"],
              ["// EN EL SERVIDOR: no lee el número, vuelve a jugar", "// ON THE SERVER: it ignores the number and replays"],
              ["\"el teléfono vio:\"", "\"the phone saw:\""], ["\"puntos\"", "\"points\""],
              ["\"y dice que sacó:\"", "\"and claims it got:\""], ["\"el servidor calcula:\"", "\"the server computes:\""],
            ]),
            notas: {
              es: "El 999999 nunca entra en la cuenta: el servidor llega solo al mismo puntaje que vio el teléfono. Para inflarlo habría que mandar otros botones, y entonces es otra partida que también tendría que salir bien jugando.",
              en: "The 999999 never enters the calculation: the server reaches the same score the phone saw on its own. To inflate it you'd have to send other buttons, and then it's a different game that would also have to be played well.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Qué revisa la puerta, y qué no puede saber", en: "What the gate checks, and what it can't know" },
          texto: {
            es: "Antes de re-simular, la ruta `/api/score` revisa lo barato: que la fecha sea la de hoy, que el registro sea texto y no pase de **36 000 ticks** (20 minutos), que cada carácter sea una máscara de 0 a 31 y que no hayas jugado ya ese día (el segundo intento sólo con un ticket).\n\nY hay que ser honesto con lo que esto **no** garantiza: el servidor sabe que el puntaje sale de esos botones, pero no quién los apretó. Un programa que juegue solo y mande su registro pasaría la revisión. Lo que se acaba es la trampa barata de cambiar un número.",
            en: "Before re-simulating, the `/api/score` route checks the cheap stuff: that the date is today, that the log is text and no longer than **36,000 ticks** (20 minutes), that each character is a mask from 0 to 31, and that you haven't already played that day (a second try only with a ticket).\n\nAnd it's worth being honest about what this does **not** guarantee: the server knows the score comes from those buttons, but not who pressed them. A program that plays by itself and sends its log would pass. What ends is the cheap trick of changing a number.",
          },
          programa: {
            codigo: bi(`const MAX_TICKS = 30 * 60 * 20;   // 20 minutos

// Las revisiones de /api/score sobre el log, antes de re-simular
function revisar(texto) {
  if (typeof texto !== "string" || !texto.length || texto.length > MAX_TICKS) return "log inválido";
  const log = Array.from(texto, (ch) => ch.charCodeAt(0) - 48);
  if (log.some((m) => m < 0 || m > 31)) return "log inválido";
  return "pasa a re-simular (" + log.length + " ticks)";
}

console.log(revisar("0088@H0"));
console.log(revisar(""));
console.log(revisar("00a0"));            // 'a' es 97: 97 - 48 = 49, no es máscara
console.log(revisar(12345));             // un número no es un log
console.log(revisar("0".repeat(MAX_TICKS + 1)));`, [
              ["// 20 minutos", "// 20 minutes"],
              ["// Las revisiones de /api/score sobre el log, antes de re-simular", "// /api/score's checks on the log, before re-simulating"],
              ["\"log inválido\"", "\"invalid log\""], ["\"pasa a re-simular (\"", "\"goes on to re-simulate (\""],
              ["// 'a' es 97: 97 - 48 = 49, no es máscara", "// 'a' is 97: 97 - 48 = 49, not a mask"],
              ["// un número no es un log", "// a number is not a log"],
            ]),
            notas: {
              es: "Sólo el primero pasa. Revisar el formato antes de simular es barato y deja fuera la basura sin gastar tiempo de servidor en ella.",
              en: "Only the first one passes. Checking the format before simulating is cheap and keeps junk out without spending server time on it.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Cambiar el juego sin romper las partidas viejas", en: "Changing the game without breaking old games" },
          texto: {
            es: "Si el servidor re-simula, cambiar las reglas es delicado: el 21 de octubre de 2026 Snake ganó el bicho de premio y el hambre (30 s sin comer y se acaba). Con las reglas nuevas, una partida del día 15 ya no daría el mismo puntaje, y el fantasma y la auditoría se descompondrían.\n\nLa solución está en `games/legado/`: la versión anterior se congela en `snake-1.js` y `LEGADO` dice hasta qué fecha vale. `claseDe(id, fecha)` elige la clase según el día de la partida:\n\n`if (fecha) for (const [hasta, Clase] of LEGADO[id] ?? []) if (fecha < hasta) return Clase;`",
            en: "If the server re-simulates, changing the rules is delicate: on 21 October 2026 Snake gained the bonus bug and hunger (30 s without eating and it's over). Under the new rules, a game from the 15th would no longer give the same score, and the ghost and the audit would break.\n\nThe fix lives in `games/legado/`: the previous version is frozen in `snake-1.js` and `LEGADO` says until which date it applies. `claseDe(id, fecha)` picks the class according to the game's day:\n\n`if (fecha) for (const [hasta, Clase] of LEGADO[id] ?? []) if (fecha < hasta) return Clase;`",
          },
          programa: {
            codigo: bi(`${JUEGO}

// Versión nueva: las monedas valen 15
class Monedas2 extends Monedas {
  update(mask) {
    const antes = this.score;
    super.update(mask);
    if (this.score > antes) this.score += 5;
  }
}

const GAMES = { monedas: Monedas2 };
const LEGADO = { monedas: [["2026-10-21", Monedas]] };   // antes del 21, la vieja

function claseDe(id, fecha) {
  if (fecha) for (const [hasta, Clase] of LEGADO[id] ?? []) if (fecha < hasta) return Clase;
  return GAMES[id];
}

const log = Array(60).fill(BTN.RIGHT);
for (const fecha of ["2026-10-15", "2026-10-21", "2026-10-23", undefined]) {
  const g = new (claseDe("monedas", fecha))(7);
  for (const m of log) g.update(m);
  console.log(String(fecha).padEnd(10), "->", g.constructor.name, g.score);
}`, [
              ...JUEGO_EN,
              ["// Versión nueva: las monedas valen 15", "// New version: coins are worth 15"],
              ["// antes del 21, la vieja", "// before the 21st, the old one"],
            ]),
            notas: {
              es: "- El mismo registro da 10 por moneda si la partida es del 15 y 15 por moneda desde el 21.\n- La fecha de corte es **posterior** al día del despliegue: el día en que se sube el cambio se sigue jugando con lo viejo, en el teléfono y en el servidor.\n- Sin fecha (práctica libre, party) va la versión vigente.",
              en: "- The same log gives 10 per coin if the game is from the 15th and 15 per coin from the 21st.\n- The cutoff date is **after** the deploy day: on the day the change goes up, people keep playing the old rules, on the phone and on the server.\n- With no date (free practice, party) the current version runs.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Por qué el teléfono manda el registro de botones y no el puntaje?", en: "Why does the phone send the button log and not the score?" },
          opciones: [
            { es: "Porque ocupa menos que un número", en: "Because it's smaller than a number" },
            { es: "Porque un número se puede inventar; con los botones, el servidor calcula el puntaje él mismo", en: "Because a number can be made up; with the buttons, the server works out the score itself" },
            { es: "Porque el servidor no sabe guardar números", en: "Because the server can't store numbers" },
            { es: "Para poder mostrar un vídeo de la partida", en: "So it can show a video of the game" },
          ],
          correcta: 1,
          porque: { es: "El servidor no se fía de lo que dice el cliente: re-simula con el mismo código y la misma semilla. Ocupa más que un número, pero no se puede falsificar cambiando una cifra.", en: "The server doesn't trust what the client says: it re-simulates with the same code and seed. It's bigger than a number, but it can't be forged by changing a digit." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué carácter viaja en el registro en un tick en que sólo se aprieta el botón A (16)?", en: "Which character goes in the log on a tick where only the A button (16) is pressed?" },
          opciones: ["'A'", "'@'", "'G'", "'16'"],
          correcta: 1,
          porque: { es: "48 + 16 = 64, y el carácter 64 es `'@'`. La `'A'` es el 65: arriba + A (1 + 16 = 17).", en: "48 + 16 = 64, and character 64 is `'@'`. `'A'` is 65: up + A (1 + 16 = 17)." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa cómo `/api/score` convierte el texto en máscaras.", en: "Fill in how `/api/score` turns the text into masks." },
          codigo: "const log = Array.from(texto, (ch) => ch.___(0) - ___);\nif (log.some((m) => m < 0 || m > ___)) return error;",
          huecos: ["charCodeAt", "48", "31"],
          banco: ["charCodeAt", "48", "31", "fromCharCode", "16", "255"],
          porque: { es: "`charCodeAt(0)` da el código del carácter y se le resta 48. Cinco botones son cinco bits: la máscara más grande posible es 31.", en: "`charCodeAt(0)` gives the character's code and 48 is subtracted. Five buttons are five bits: the largest possible mask is 31." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué **no** puede garantizar la re-simulación?", en: "What can re-simulation **not** guarantee?" },
          opciones: [
            { es: "Que el puntaje salga de esos botones", en: "That the score comes from those buttons" },
            { es: "Que la partida respete las reglas del juego", en: "That the game followed the game's rules" },
            { es: "Que los botones los haya apretado una persona y no un programa", en: "That a person pressed the buttons and not a program" },
            { es: "Que nadie inventó el número final", en: "That nobody made up the final number" },
          ],
          correcta: 2,
          porque: { es: "El servidor sólo ve botones. Si un bot juega bien y manda su registro, el puntaje es legítimo para la simulación. Lo que se elimina es cambiar el número sin jugar.", en: "The server only sees buttons. If a bot plays well and sends its log, the score is legitimate as far as the simulation goes. What's eliminated is changing the number without playing." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `decodificar(texto)`: devuelve el arreglo de máscaras (código del carácter − 48), o `null` si algún carácter no da una máscara válida (de 0 a 31).",
            en: "Write `decodificar(texto)`: return the array of masks (character code − 48), or `null` if any character doesn't give a valid mask (0 to 31).",
          },
          inicial: bi(`function decodificar(texto) {
  // un número por carácter; si alguno se sale de 0..31, null
}

console.log(decodificar("0148@H"));`, [["// un número por carácter; si alguno se sale de 0..31, null", "// one number per character; if any falls outside 0..31, null"]]),
          pruebas: [
            { llamada: "decodificar('0148')", espera: "[0,1,4,8]" },
            { llamada: "decodificar('@H')", espera: "[16,24]" },
            { llamada: "decodificar('0a')", espera: "null" },
            { llamada: "decodificar('/')", espera: "null" },
            { llamada: "decodificar('')", espera: "[]" },
          ],
          solucion: "function decodificar(texto) {\n  const log = Array.from(texto, (ch) => ch.charCodeAt(0) - 48);\n  if (log.some((m) => m < 0 || m > 31)) return null;\n  return log;\n}",
          porque: { es: "`'a'` da 49 y `'/'` da −1: los dos se salen. Revisar el rango antes de simular es lo que impide que un registro raro llegue a la partida.", en: "`'a'` gives 49 and `'/'` gives −1: both are out of range. Checking the range before simulating stops a weird log from reaching the game." },
        },
      ],
    },
    {
      id: "el-fantasma",
      titulo: { es: "El fantasma: ver jugar a otro sin vídeo", en: "The ghost: watching someone play without video" },
      resumen: {
        es: "Si el juego es determinista, ver la partida de otro es recibir sus botones y simularlos. Medio segundo de retraso y casi ningún byte.",
        en: "If the game is deterministic, watching someone else's game is receiving their buttons and simulating them. Half a second of delay and almost no bytes.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Mandar botones, no imágenes", en: "Send buttons, not pictures" },
          texto: {
            es: "En el modo party, mientras esperas tu turno, ves en vivo la partida de otro: la **cámara fantasma**. No viaja ni un fotograma. El que juega manda sus botones por un canal de **Supabase Realtime** (mensajes *broadcast*, sin base de datos) y tu teléfono corre **la misma simulación** con la misma semilla y el mismo mapa. Lo que ves es tu propia copia de su partida.\n\nEl `Emisor` de `ghost.js` junta los botones y cada **15 ticks** (medio segundo) manda los nuevos como texto, con `desde`: la posición del primero. El `Espectador` los acomoda en su copia del registro y avanza.",
            en: "In party mode, while you wait your turn, you watch someone else's game live: the **ghost camera**. Not a single frame travels. The player sends their buttons over a **Supabase Realtime** channel (*broadcast* messages, no database) and your phone runs **the same simulation** with the same seed and map. What you see is your own copy of their game.\n\n`ghost.js`'s `Emisor` collects the buttons and every **15 ticks** (half a second) sends the new ones as text, with `desde`: the position of the first one. The `Espectador` slots them into its copy of the log and moves forward.",
          },
          programa: {
            codigo: bi(`${JUEGO}

const canal = [];   // un canal de mentira: lo que se manda queda aquí
const CADA = 15;

// El que juega (Emisor de ghost.js, resumido)
const jugador = new Monedas(99);
const log = [];
let enviado = 0;
function enviar() {
  const masks = log.slice(enviado).map((m) => String.fromCharCode(48 + m)).join("");
  canal.push({ desde: enviado, masks });
  enviado = log.length;
}

// El que mira (Espectador): su propia copia del juego
const copia = new Monedas(99);
const suLog = [];
let simulado = 0;

for (let tick = 0; tick < 60; tick++) {
  const m = tick % 7 < 4 ? BTN.RIGHT : BTN.LEFT;
  log.push(m); jugador.update(m);
  if (log.length % CADA === 0) enviar();

  // llega lo que haya en el canal
  while (canal.length) {
    const p = canal.shift();
    for (let i = 0; i < p.masks.length; i++) suLog[p.desde + i] = p.masks.charCodeAt(i) - 48;
  }
  if (simulado < suLog.length) copia.update(suLog[simulado++]);
}
while (simulado < suLog.length) copia.update(suLog[simulado++]);

console.log("paquetes de", CADA, "ticks:", log.length / CADA);
console.log("jugador:", { x: jugador.x, score: jugador.score });
console.log("copia:  ", { x: copia.x, score: copia.score });`, [
              ...JUEGO_EN,
              ["// un canal de mentira: lo que se manda queda aquí", "// a fake channel: whatever is sent lands here"],
              ["// El que juega (Emisor de ghost.js, resumido)", "// The player (Emisor from ghost.js, summarized)"],
              ["// El que mira (Espectador): su propia copia del juego", "// The viewer (Espectador): its own copy of the game"],
              ["// llega lo que haya en el canal", "// whatever is in the channel arrives"],
              ["\"paquetes de\"", "\"packets of\""], ["\"jugador:\"", "\"player:\""], ["\"copia:  \"", "\"copy:   \""],
            ]),
            notas: {
              es: "Cuatro paquetes de 15 caracteres y la copia termina exactamente donde el jugador: misma posición, mismo puntaje. La copia va medio segundo atrás porque los botones llegan por tandas.",
              en: "Four 15-character packets and the copy ends exactly where the player did: same position, same score. The copy runs half a second behind because the buttons arrive in batches.",
            },
          },
          enlaces: [{ url: "https://dailychallenge.click/party", texto: { es: "El modo party de Daily Challenge", en: "Daily Challenge's party mode" } }],
        },
        {
          tipo: "explica",
          titulo: { es: "Llegar tarde y alcanzar", en: "Arriving late and catching up" },
          texto: {
            es: "¿Y si entras a mirar cuando el otro ya lleva un minuto? El espectador manda un aviso `'quien'` al canal y el emisor contesta reenviando **todo** su registro desde el tick 0.\n\nCon 1800 botones de golpe, la copia va muy atrás. En vez de saltar al final (y perderte la jugada), el espectador simula **3 ticks por cada tick** mientras el atraso pase de 45, y 1 cuando ya casi alcanzó. Ves la partida a triple velocidad unos segundos, hasta quedar al día.",
            en: "What if you start watching when the other player is already a minute in? The viewer sends a `'quien'` (\"who's there\") message to the channel and the emitter answers by resending its **whole** log from tick 0.\n\nWith 1,800 buttons at once, the copy is far behind. Instead of jumping to the end (and missing the play), the viewer simulates **3 ticks per tick** while the lag is over 45, and 1 once it's nearly caught up. You watch at triple speed for a few seconds until it's current.",
          },
          programa: {
            codigo: bi(`// Espectador.tick() de ghost.js: cuántos ticks simular según el atraso
let recibido = 1800;   // llegó el registro entero: un minuto
let simulado = 0;

for (let tick = 1; simulado < recibido; tick++) {
  recibido++;            // el otro sigue jugando: un botón nuevo por tick
  const atraso = recibido - simulado;
  const pasos = atraso > 45 ? 3 : atraso > 0 ? 1 : 0;
  simulado += pasos;
  if (tick % 150 === 0 || atraso <= 46) {
    console.log("tick", tick, "atraso", atraso, "simula", pasos);
    if (atraso <= 46) break;
  }
}`, [
              ["// Espectador.tick() de ghost.js: cuántos ticks simular según el atraso", "// Espectador.tick() from ghost.js: how many ticks to simulate given the lag"],
              ["// llegó el registro entero: un minuto", "// the whole log arrived: one minute"],
              ["// el otro sigue jugando: un botón nuevo por tick", "// the other player keeps going: one new button per tick"],
              ["\"atraso\"", "\"lag\""], ["\"simula\"", "\"simulates\""],
            ]),
            notas: {
              es: "Como el otro sigue jugando, cada tick el espectador gana 2 (simula 3, llega 1). Un minuto de atraso se recupera en unos 30 segundos, y a partir de ahí va al paso, un tick por tick.",
              en: "Since the other player keeps going, each tick the viewer gains 2 (simulates 3, receives 1). A minute of lag is recovered in about 30 seconds, and from then on it keeps pace, one tick per tick.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Lo que cuesta: casi nada", en: "What it costs: almost nothing" },
          texto: {
            es: "Un byte por tick son **30 bytes por segundo**. Una partida entera de tres minutos son 5.4 KB, menos que una foto miniatura. Transmitir vídeo de esa misma pantalla, aun pequeño, serían megas. Y el servidor no hace nada: Realtime sólo pasa los mensajes de un teléfono a otro.\n\nLa misma idea da el **fantasma del líder**: al acabar tu partida del día puedes ver la mejor partida, re-simulada en tu pantalla desde su registro. El servidor sólo la entrega a quien ya no puede puntuar ese día, para que nadie copie la jugada antes de jugar.",
            en: "One byte per tick is **30 bytes per second**. A whole three-minute game is 5.4 KB, less than a thumbnail photo. Streaming video of that same screen, even small, would be megabytes. And the server does nothing: Realtime just passes messages from one phone to another.\n\nThe same idea gives you the **leader's ghost**: after your game of the day you can watch the best game, re-simulated on your screen from its log. The server only hands it to people who can no longer score that day, so nobody copies the play before playing.",
          },
          programa: {
            codigo: bi(`const TICKS_POR_SEGUNDO = 30;
const segundos = 3 * 60;
const bytes = TICKS_POR_SEGUNDO * segundos;   // un carácter por tick
console.log("registro de 3 minutos:", bytes, "bytes =", (bytes / 1000).toFixed(1), "KB");

// Para comparar: la pantalla del juego es de 160 x 192 píxeles
const pixeles = 160 * 192;
console.log("un solo fotograma sin comprimir, 1 byte por píxel:", pixeles, "bytes");
console.log("o sea, un fotograma pesa como", Math.round(pixeles / TICKS_POR_SEGUNDO), "segundos de botones");`, [
              ["// un carácter por tick", "// one character per tick"],
              ["\"registro de 3 minutos:\"", "\"3-minute log:\""],
              ["// Para comparar: la pantalla del juego es de 160 x 192 píxeles", "// For comparison: the game screen is 160 x 192 pixels"],
              ["\"un solo fotograma sin comprimir, 1 byte por píxel:\"", "\"a single uncompressed frame, 1 byte per pixel:\""],
              ["\"o sea, un fotograma pesa como\"", "\"so one frame weighs as much as\""], ["\"segundos de botones\"", "\"seconds of buttons\""],
            ]),
            notas: {
              es: "Un solo fotograma sin comprimir pesa lo que más de quince minutos de botones. El truco sólo funciona porque los dos teléfonos tienen el juego y la semilla: lo que viaja es lo único que no pueden adivinar.",
              en: "A single uncompressed frame weighs as much as over fifteen minutes of buttons. The trick only works because both phones have the game and the seed: what travels is the only thing they can't guess.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué hace posible ver la partida de otro mandando sólo sus botones?", en: "What makes it possible to watch someone's game by sending only their buttons?" },
          opciones: [
            { es: "Que el juego es determinista: misma semilla, mismo mapa y mismos botones dan la misma partida", en: "That the game is deterministic: same seed, map and buttons give the same game" },
            { es: "Que Realtime comprime el vídeo", en: "That Realtime compresses the video" },
            { es: "Que los dos teléfonos tienen la misma pantalla", en: "That both phones have the same screen" },
            { es: "Que el servidor simula y manda las posiciones", en: "That the server simulates and sends the positions" },
          ],
          correcta: 0,
          porque: { es: "El espectador tiene todo lo demás: el código, la semilla, el mapa. Los botones son lo único que no puede adivinar, y con ellos reconstruye la partida.", en: "The viewer has everything else: the code, the seed, the map. The buttons are the only thing it can't guess, and with them it rebuilds the game." },
        },
        {
          tipo: "elige",
          pregunta: { es: "El emisor manda sus botones cada 15 ticks. ¿Cuánto tiempo es eso a 30 ticks por segundo?", en: "The emitter sends its buttons every 15 ticks. How long is that at 30 ticks per second?" },
          opciones: [{ es: "15 segundos", en: "15 seconds" }, { es: "Medio segundo", en: "Half a second" }, { es: "Un tick", en: "One tick" }, { es: "Dos segundos", en: "Two seconds" }],
          correcta: 1,
          porque: { es: "15 / 30 = 0.5 s. Por eso el fantasma va medio segundo atrás: es el precio de no mandar un mensaje por tick.", en: "15 / 30 = 0.5 s. That's why the ghost runs half a second behind: the price of not sending one message per tick." },
        },
        {
          tipo: "ordena",
          pregunta: { es: "Ordena lo que hace el espectador con cada paquete que llega.", en: "Put in order what the viewer does with each packet that arrives." },
          lineas: [
            "for (let i = 0; i < p.masks.length; i++) log[p.desde + i] = p.masks.charCodeAt(i) - 48;",
            "const atraso = log.length - simulado;",
            "const pasos = atraso > 45 ? 3 : atraso > 0 ? 1 : 0;",
            "for (let k = 0; k < pasos; k++) game.update(log[simulado++]);",
          ],
          porque: { es: "Primero se acomodan los botones en su lugar (con `desde`), luego se mide el atraso y se simula lo que toca.", en: "First the buttons go into place (using `desde`), then the lag is measured and the right number of ticks is simulated." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `aplicarPaquete(log, paquete)`: el paquete es `{ desde, masks }`, con `masks` como texto (un carácter por tick, código − 48). Escribe cada máscara en `log` a partir de la posición `desde` y devuelve `log`.",
            en: "Write `aplicarPaquete(log, paquete)`: the packet is `{ desde, masks }`, with `masks` as text (one character per tick, code − 48). Write each mask into `log` starting at position `desde` and return `log`.",
          },
          inicial: bi(`function aplicarPaquete(log, paquete) {
  // cada carácter de paquete.masks va a log[paquete.desde + i]
  return log;
}

console.log(aplicarPaquete([], { desde: 0, masks: "088" }));`, [["// cada carácter de paquete.masks va a log[paquete.desde + i]", "// each character of paquete.masks goes to log[paquete.desde + i]"]]),
          pruebas: [
            { llamada: "aplicarPaquete([], { desde: 0, masks: '088' })", espera: "[0,8,8]" },
            { llamada: "aplicarPaquete([1, 1], { desde: 2, masks: '@0' })", espera: "[1,1,16,0]" },
            { llamada: "aplicarPaquete([0, 0, 0], { desde: 1, masks: '4' })", espera: "[0,4,0]" },
            { llamada: "aplicarPaquete([5], { desde: 1, masks: '' })", espera: "[5]" },
          ],
          solucion: "function aplicarPaquete(log, paquete) {\n  for (let i = 0; i < paquete.masks.length; i++) {\n    log[paquete.desde + i] = paquete.masks.charCodeAt(i) - 48;\n  }\n  return log;\n}",
          porque: { es: "Gracias a `desde`, un paquete repetido o que llega en desorden cae en su lugar sin duplicar nada: escribir dos veces lo mismo en la misma posición no cambia el registro.", en: "Thanks to `desde`, a repeated or out-of-order packet lands in its place without duplicating anything: writing the same thing twice at the same position doesn't change the log." },
        },
      ],
    },
  ],
};
