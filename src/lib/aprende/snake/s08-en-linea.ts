import type { T, Unidad } from "../tipos";

/** El mismo programa en los dos idiomas: sólo cambian los comentarios y los textos que imprime. */
const bi = (es: string, pares: [string, string][]): T => ({ es, en: pares.reduce((s, [a, b]) => s.split(a).join(b), es) });

// Un Snake versus reducido, con las reglas de games/snakevs.js: todas avanzan a
// la vez, primero se calculan las cabezas nuevas y luego se resuelven los choques.
const VERSUS = `const BTN = { UP: 1, DOWN: 2, LEFT: 4, RIGHT: 8, A: 16 };
const DIRS = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];   // arriba, abajo, izq., der.
const COLS = 10, ROWS = 5;

class MiniVs {
  constructor(salidas) {
    this.players = salidas.map((s, i) => ({ i, body: [{ x: s.x, y: s.y }], dir: s.dir, want: s.dir, vivo: true }));
    this.tick = 0; this.over = false;
  }
  update(masks) {
    if (this.over) return;
    this.tick++;
    for (const p of this.players) {
      const m = masks[p.i] ?? 0;   // un input por jugador
      if (m & BTN.UP && p.dir !== 1) p.want = 0; else if (m & BTN.DOWN && p.dir !== 0) p.want = 1;
      else if (m & BTN.LEFT && p.dir !== 3) p.want = 2; else if (m & BTN.RIGHT && p.dir !== 2) p.want = 3;
    }
    const vivos = this.players.filter((p) => p.vivo);
    // 1) todas las cabezas nuevas, antes de mover a nadie
    const nuevas = vivos.map((p) => { p.dir = p.want; const h = p.body[0]; return { p, x: h.x + DIRS[p.dir].x, y: h.y + DIRS[p.dir].y }; });
    // 2) los choques, con todo el tablero todavía quieto
    const muere = new Set();
    for (const n of nuevas) {
      const { p, x, y } = n;
      if (x < 0 || y < 0 || x >= COLS || y >= ROWS) muere.add(p);
      for (const q of vivos) if (q.body.some((b) => b.x === x && b.y === y)) muere.add(p);
      for (const o of nuevas) if (o !== n && ((o.x === x && o.y === y) ||
        (o.x === p.body[0].x && o.y === p.body[0].y && x === o.p.body[0].x && y === o.p.body[0].y))) muere.add(p);
    }
    // 3) mover a las que sobreviven (crecen siempre, para que se vea el rastro)
    for (const n of nuevas) if (!muere.has(n.p)) n.p.body.unshift({ x: n.x, y: n.y });
    for (const p of muere) p.vivo = false;
    if (this.players.filter((p) => p.vivo).length <= 1) this.over = true;
  }
  dibujar() {
    const filas = Array.from({ length: ROWS }, () => Array(COLS).fill("."));
    for (const p of this.players) p.body.forEach((b, k) => { filas[b.y][b.x] = k === 0 ? (p.vivo ? "AB"[p.i] : "x") : "ab"[p.i]; });
    return filas.map((f) => f.join("")).join("\\n");
  }
}`;

const VERSUS_EN: [string, string][] = [
  ["// arriba, abajo, izq., der.", "// up, down, left, right"],
  ["// un input por jugador", "// one input per player"],
  ["// 1) todas las cabezas nuevas, antes de mover a nadie", "// 1) every new head, before anyone moves"],
  ["// 2) los choques, con todo el tablero todavía quieto", "// 2) the crashes, with the whole board still frozen"],
  ["// 3) mover a las que sobreviven (crecen siempre, para que se vea el rastro)", "// 3) move the survivors (they always grow, so the trail shows)"],
];

// Un juego de juguete para la red: cada jugador es un punto en una fila y
// junta monedas. Lo que importa es que es determinista y que su estado se
// puede comparar entre teléfonos.
const RED = `class Juego {
  constructor(n) { this.pos = Array(n).fill(0); this.puntos = Array(n).fill(0); this.tick = 0; }
  update(masks) {
    this.tick++;
    masks.forEach((m, i) => {
      if (m & 8) this.pos[i]++;                       // derecha
      if (m & 4) this.pos[i]--;                       // izquierda
      if (m & 16 && this.pos[i] % 3 === 0) this.puntos[i] += 10;   // A sobre una moneda
    });
  }
  huella() { return this.tick + "|" + this.pos.join(",") + "|" + this.puntos.join(","); }
}

// Lo que aprieta cada jugador en cada tick (una regla fija, para poder repetirlo)
const aprieta = (jugador, tick) => [8, 8, 16, 4, 0, 24][(tick * (jugador + 2) + jugador) % 6];`;

const RED_EN: [string, string][] = [
  ["// derecha", "// right"], ["// izquierda", "// left"], ["// A sobre una moneda", "// A on a coin"],
  ["// Lo que aprieta cada jugador en cada tick (una regla fija, para poder repetirlo)", "// What each player presses on each tick (a fixed rule, so it can be repeated)"],
];

export const S08: Unidad = {
  id: "en-linea",
  titulo: { es: "Multijugador en línea", en: "Online multiplayer" },
  lecciones: [
    {
      id: "snake-versus",
      titulo: { es: "Snake versus: una simulación, varios jugadores", en: "Snake versus: one simulation, several players" },
      resumen: {
        es: "SnakeVs recibe un input por jugador en cada tick, mueve a todas las serpientes a la vez y reparte los puntos por puesto.",
        en: "SnakeVs takes one input per player each tick, moves every snake at once and hands out points by finishing place.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Un arreglo de botones en vez de uno", en: "An array of buttons instead of one" },
          texto: {
            es: "En el Snake de un jugador, `update(mask)` recibe un número por tick. En **Snake VS** (`games/snakevs.js`, de 2 a 5 jugadores) recibe **un arreglo**: `masks[0]` son los botones del jugador 1, `masks[1]` los del 2, y así. El resto es la misma idea: una sola simulación, determinista, con todas las serpientes adentro.\n\nEso es lo que la hace jugable en línea: si cada teléfono recibe los mismos arreglos en el mismo orden, todos calculan el mismo tablero. La siguiente lección cuenta cómo se logra que lleguen iguales.\n\nEl programa usa una versión reducida de `SnakeVs` en un tablero de 10×5: `A` y `B` son las cabezas, `a` y `b` los cuerpos.",
            en: "In single-player Snake, `update(mask)` takes one number per tick. In **Snake VS** (`games/snakevs.js`, 2 to 5 players) it takes **an array**: `masks[0]` holds player 1's buttons, `masks[1]` player 2's, and so on. The rest is the same idea: a single deterministic simulation with every snake inside it.\n\nThat's what makes it playable online: if every phone gets the same arrays in the same order, they all compute the same board. The next lesson tells how they're made to arrive the same.\n\nThe program uses a reduced `SnakeVs` on a 10×5 board: `A` and `B` are the heads, `a` and `b` the bodies.",
          },
          programa: {
            codigo: bi(`${VERSUS}

const g = new MiniVs([{ x: 0, y: 0, dir: 3 }, { x: 9, y: 4, dir: 2 }]);
const jugada = [
  [0, 0],
  [BTN.DOWN, 0],          // el 1 baja; el 2 sigue
  [0, BTN.UP],            // el 2 sube
  [BTN.RIGHT, 0],
];
for (const masks of jugada) g.update(masks);
console.log(g.dibujar());
console.log("tick", g.tick, "| vivos:", g.players.filter((p) => p.vivo).length);`, [
              ...VERSUS_EN,
              ["// el 1 baja; el 2 sigue", "// player 1 turns down; player 2 carries on"], ["// el 2 sube", "// player 2 turns up"],
              ["\"| vivos:\"", "\"| alive:\""],
            ]),
            notas: {
              es: "Cada renglón de `jugada` es un tick con dos máscaras, una por jugador. Las dos serpientes se movieron en los mismos ticks, cada una con sus botones: la A arrancó a la derecha, bajó dos y volvió a girar; la B arrancó a la izquierda y subió.",
              en: "Each row of `jugada` is one tick with two masks, one per player. Both snakes moved on the same ticks, each with its own buttons: A started right, went down two and turned again; B started left and turned up.",
            },
          },
          enlaces: [{ url: "https://dailychallenge.click/juegos/snakevs", texto: { es: "Snake VS en Daily Challenge", en: "Snake VS on Daily Challenge" } }],
        },
        {
          tipo: "explica",
          titulo: { es: "Todas a la vez: primero las cabezas, luego los choques", en: "All at once: heads first, then crashes" },
          texto: {
            es: "Si el código moviera primero a la serpiente 1 y luego a la 2, la 1 tendría ventaja: en un choque de frente llegaría antes a la casilla. Por eso `SnakeVs.update` va en tres pasos:\n\n- calcula **todas** las cabezas nuevas sin mover a nadie;\n- revisa los choques con el tablero todavía quieto: muro, cualquier cuerpo, dos cabezas en la misma casilla, o dos cabezas que **se cruzan** (cada una va a donde estaba la otra);\n- mueve sólo a las que sobrevivieron.\n\nAsí el resultado no depende del orden del arreglo. Si dos caen en el mismo tick, empatan en el puesto.",
            en: "If the code moved snake 1 first and then snake 2, snake 1 would have an edge: in a head-on crash it would reach the cell first. So `SnakeVs.update` works in three steps:\n\n- compute **every** new head without moving anyone;\n- check crashes with the board still frozen: wall, any body, two heads on the same cell, or two heads that **swap** (each goes where the other was);\n- move only the survivors.\n\nThat way the result doesn't depend on the array's order. If two fall on the same tick, they tie for the place.",
          },
          programa: {
            codigo: bi(`${VERSUS}

// Caso 1: de frente, con una casilla en medio: las dos cabezas van a la misma
const g1 = new MiniVs([{ x: 3, y: 2, dir: 3 }, { x: 5, y: 2, dir: 2 }]);
g1.update([0, 0]);
console.log("misma casilla:");
console.log(g1.dibujar());

// Caso 2: pegadas de frente: cada una va a donde está la otra (se cruzan)
const g2 = new MiniVs([{ x: 4, y: 2, dir: 3 }, { x: 5, y: 2, dir: 2 }]);
g2.update([0, 0]);
console.log("se cruzan:");
console.log(g2.dibujar());

console.log("vivos:", g1.players.filter((p) => p.vivo).length, "y", g2.players.filter((p) => p.vivo).length);`, [
              ...VERSUS_EN,
              ["// Caso 1: de frente, con una casilla en medio: las dos cabezas van a la misma", "// Case 1: head-on, one cell apart: both heads go to the same cell"],
              ["// Caso 2: pegadas de frente: cada una va a donde está la otra (se cruzan)", "// Case 2: touching head-on: each goes where the other is (they swap)"],
              ["\"misma casilla:\"", "\"same cell:\""], ["\"se cruzan:\"", "\"they swap:\""], ["\"vivos:\"", "\"alive:\""], ["\"y\", g2", "\"and\", g2"],
            ]),
            notas: {
              es: "En los dos casos mueren las dos (`x`). Sin la regla de «se cruzan», en el segundo caso las serpientes se atravesarían como fantasmas, porque ninguna cabeza nueva cae sobre la otra cabeza nueva.",
              en: "Both die in both cases (`x`). Without the \"swap\" rule, in the second case the snakes would pass through each other like ghosts, because neither new head lands on the other new head.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Puntos por fruta y por puesto", en: "Points for fruit and for place" },
          texto: {
            es: "Cada fruta vale **10** y hace crecer la serpiente. Al caer se te asigna un puesto: el último vivo es el 1.º. La partida acaba cuando queda una sola o a los **2 minutos**; si se acaba el tiempo, gana la más larga. Y cada 15 segundos todas aceleran (el intervalo baja de 7 hasta 4 ticks por paso), para que nadie gane escondiéndose.\n\nLos puntos del puesto salen de `PUNTOS_PUESTO = [300, 200, 100, 50, 0]`:\n\n`puntosDe(p) { return p.frutas * 10 + PUNTOS_PUESTO[Math.min(4, p.puesto - 1)]; }`",
            en: "Each fruit is worth **10** and makes the snake grow. When you fall you get a place: the last one alive is 1st. The game ends when only one is left or after **2 minutes**; if time runs out, the longest wins. And every 15 seconds they all speed up (the interval drops from 7 down to 4 ticks per step), so nobody wins by hiding.\n\nPlace points come from `PUNTOS_PUESTO = [300, 200, 100, 50, 0]`:\n\n`puntosDe(p) { return p.frutas * 10 + PUNTOS_PUESTO[Math.min(4, p.puesto - 1)]; }`",
          },
          programa: {
            codigo: bi(`const PUNTOS_PUESTO = [300, 200, 100, 50, 0];
const puntosDe = (p) => p.frutas * 10 + PUNTOS_PUESTO[Math.min(4, p.puesto - 1)];

const final = [
  { nombre: "Rosa", frutas: 2, puesto: 1 },
  { nombre: "Beto", frutas: 9, puesto: 2 },
  { nombre: "Caro", frutas: 4, puesto: 3 },
  { nombre: "Dani", frutas: 4, puesto: 3 },   // cayeron en el mismo tick: empate
];
for (const p of final) console.log(p.nombre, "puesto", p.puesto, "->", puntosDe(p), "puntos");

// Cuánto tarda cada paso a lo largo de la partida (acelera cada 15 s, mínimo 4)
for (let s = 0; s <= 120; s += 15) console.log(s + " s: un paso cada", Math.max(4, 7 - Math.floor(s / 15)), "ticks");`, [
              ["// cayeron en el mismo tick: empate", "// fell on the same tick: a tie"],
              ["\"puesto\"", "\"place\""], ["\"puntos\"", "\"points\""],
              ["// Cuánto tarda cada paso a lo largo de la partida (acelera cada 15 s, mínimo 4)", "// How long each step takes over the game (speeds up every 15 s, minimum 4)"],
              ["\": un paso cada\"", "\": one step every\""],
            ]),
            notas: {
              es: "- Beto comió mucho más, pero Rosa sobrevivió: 320 contra 290. Sobrevivir pesa más que comer.\n- Caro y Dani empatan en el 3.er puesto y se llevan lo mismo.\n- Desde el segundo 45 las serpientes ya van a su velocidad máxima.",
              en: "- Beto ate a lot more, but Rosa survived: 320 to 290. Surviving outweighs eating.\n- Caro and Dani tie for 3rd and get the same.\n- From second 45 on, the snakes are already at top speed.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Por qué `SnakeVs` calcula todas las cabezas nuevas antes de mover a ninguna serpiente?", en: "Why does `SnakeVs` compute every new head before moving any snake?" },
          opciones: [
            { es: "Porque es más rápido", en: "Because it's faster" },
            { es: "Para que el resultado no dependa del orden de los jugadores en el arreglo", en: "So the result doesn't depend on the players' order in the array" },
            { es: "Para ahorrar memoria", en: "To save memory" },
            { es: "Porque Realtime lo exige", en: "Because Realtime requires it" },
          ],
          correcta: 1,
          porque: { es: "Si se movieran una por una, la primera del arreglo llegaría antes a cada casilla disputada. Resolver todo con el tablero quieto trata a todas por igual.", en: "If they moved one at a time, the first in the array would reach every contested cell first. Resolving everything on a frozen board treats them all equally." },
        },
        {
          tipo: "elige",
          pregunta: { es: "Con `PUNTOS_PUESTO = [300, 200, 100, 50, 0]`, ¿cuántos puntos lleva quien quedó 2.º con 3 frutas?", en: "With `PUNTOS_PUESTO = [300, 200, 100, 50, 0]`, how many points does someone get for 2nd place with 3 fruits?" },
          opciones: ["203", "230", "330", "500"],
          correcta: 1,
          porque: { es: "3 frutas × 10 = 30, más 200 del segundo puesto (`PUNTOS_PUESTO[1]`): 230.", en: "3 fruits × 10 = 30, plus 200 for second place (`PUNTOS_PUESTO[1]`): 230." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa cómo cada serpiente lee sus propios botones.", en: "Fill in how each snake reads its own buttons." },
          codigo: "update(masks) {\n  for (const p of this.___) {\n    const m = masks[p.___] ?? 0;\n    if (m & BTN.UP && p.dir !== 1) p.want = 0;\n  }\n}",
          huecos: ["players", "i", ],
          banco: ["players", "i", "body", "tick", "dir"],
          porque: { es: "Se recorren los jugadores y cada uno toma la máscara de su posición `p.i`. El `?? 0` cubre al que no mandó nada: se queda sin apretar.", en: "Loop over the players and each one takes the mask at its position `p.i`. The `?? 0` covers anyone who sent nothing: they press no buttons." },
        },
        {
          tipo: "ordena",
          pregunta: { es: "Ordena los pasos de un tick de `SnakeVs` (resumidos): leer botones, cabezas nuevas, choques, mover y dar puestos.", en: "Put the steps of one `SnakeVs` tick in order (summarized): read buttons, new heads, crashes, move and assign places." },
          lineas: [
            "const m = masks[p.i] ?? 0;",
            "const nuevas = vivos.map((p) => cabezaNueva(p));",
            "for (const n of nuevas) if (choca(n)) muere.add(n.p);",
            "for (const n of nuevas) if (!muere.has(n.p)) n.p.body.unshift(n);",
            "for (const p of muere) { p.vivo = false; p.puesto = this.n - this.caidos++; }",
          ],
          porque: { es: "Botones → cabezas nuevas → choques con el tablero quieto → movimiento → puestos. Mover antes de revisar los choques volvería a depender del orden.", en: "Buttons → new heads → crashes on a frozen board → movement → places. Moving before checking crashes would bring order-dependence back." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `puntos(frutas, puesto)` como `puntosDe` de Snake VS: 10 por fruta más lo del puesto (`[300, 200, 100, 50, 0]`; del 5.º para abajo, 0).",
            en: "Write `puntos(frutas, puesto)` like Snake VS's `puntosDe`: 10 per fruit plus the place bonus (`[300, 200, 100, 50, 0]`; 5th and below, 0).",
          },
          inicial: bi(`const PUNTOS_PUESTO = [300, 200, 100, 50, 0];

function puntos(frutas, puesto) {
  // el puesto 1 es PUNTOS_PUESTO[0]
}

console.log(puntos(3, 2));`, [["// el puesto 1 es PUNTOS_PUESTO[0]", "// place 1 is PUNTOS_PUESTO[0]"]]),
          pruebas: [
            { llamada: "puntos(3, 2)", espera: "230" },
            { llamada: "puntos(0, 1)", espera: "300" },
            { llamada: "puntos(12, 5)", espera: "120" },
            { llamada: "puntos(1, 7)", espera: "10" },
          ],
          solucion: "const PUNTOS_PUESTO = [300, 200, 100, 50, 0];\n\nfunction puntos(frutas, puesto) {\n  return frutas * 10 + PUNTOS_PUESTO[Math.min(4, puesto - 1)];\n}",
          porque: { es: "`Math.min(4, puesto - 1)` evita salirse del arreglo: con un puesto 7, sin él, `PUNTOS_PUESTO[6]` sería `undefined` y la suma daría `NaN`.", en: "`Math.min(4, puesto - 1)` keeps you inside the array: with place 7, without it, `PUNTOS_PUESTO[6]` would be `undefined` and the sum would be `NaN`." },
        },
      ],
    },
    {
      id: "lockstep-con-anfitrion",
      titulo: { es: "Lockstep: todos ven la misma partida", en: "Lockstep: everyone sees the same game" },
      resumen: {
        es: "Un anfitrión junta los botones y cada 200 ms manda un turno; todos simulan sólo con esos turnos y en orden. Paquetes perdidos, jugadores que se van y el precio del retraso.",
        en: "A host collects the buttons and every 200 ms sends a turn; everyone simulates only with those turns, in order. Lost packets, players who leave and the price of delay.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Lo ingenuo: cada quien aplica lo que le llega", en: "The naive way: everyone applies what reaches them" },
          texto: {
            es: "Imagina dos teléfonos. Cada uno aplica sus botones al instante y los del otro **cuando llegan**. El problema es que llegan tarde, y no igual de tarde: el teléfono A aplica un botón de B dos ticks después de que B lo apretó, y B aplica el de A tres ticks después. Cada uno simula una partida ligeramente distinta y, como en Snake un tick de diferencia es chocar o no chocar, al rato son dos partidas distintas.\n\nCorre el programa: el mismo juego, los mismos botones, sólo cambia **cuándo** se aplican.",
            en: "Picture two phones. Each applies its own buttons instantly and the other's **when they arrive**. The trouble is they arrive late, and not equally late: phone A applies B's button two ticks after B pressed it, and B applies A's three ticks after. Each simulates a slightly different game and, since in Snake one tick is the difference between crashing or not, soon they're two different games.\n\nRun the program: the same game, the same buttons, only **when** they're applied changes.",
          },
          programa: {
            codigo: bi(`${RED}

// Cada teléfono ve su botón al momento y el del otro con retraso
function teléfono(yo, retrasoDelOtro) {
  const g = new Juego(2);
  for (let t = 0; t < 30; t++) {
    const masks = [0, 0];
    masks[yo] = aprieta(yo, t);
    const otro = 1 - yo;
    if (t - retrasoDelOtro >= 0) masks[otro] = aprieta(otro, t - retrasoDelOtro);
    g.update(masks);
  }
  return g.huella();
}

console.log("teléfono A:", teléfono(0, 2));
console.log("teléfono B:", teléfono(1, 3));`, [
              ...RED_EN,
              ["// Cada teléfono ve su botón al momento y el del otro con retraso", "// Each phone sees its own button instantly and the other's with a delay"],
              ["teléfono(", "phone("], ["\"teléfono A:\"", "\"phone A:\""], ["\"teléfono B:\"", "\"phone B:\""],
            ]),
            notas: {
              es: "La huella es `tick | posiciones | puntos`. Las dos salen distintas: cada teléfono cree en una partida diferente, y ninguno está mal según lo que vio.",
              en: "The fingerprint is `tick | positions | points`. The two differ: each phone believes in a different game, and neither is wrong given what it saw.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Turnos del anfitrión", en: "Turns from the host" },
          texto: {
            es: "La solución de `versus.js` se llama **lockstep** (paso al unísono). Uno de los teléfonos es el **anfitrión**. Los demás le mandan sus botones; el anfitrión, cada **turno de 6 ticks** (200 ms), arma un paquete `{ k, masks }` con un input por jugador y lo manda a todos.\n\nLa regla de oro: **nadie simula con otra cosa**, ni siquiera el anfitrión con sus propios botones. Todos esperan el turno `k`, lo aplican durante 6 ticks y pasan al `k + 1`. Si los paquetes llegan a destiempo, da igual: se aplican en orden. Mismos paquetes, mismo orden, mismo juego.\n\nEl tubo es un canal de **Supabase Realtime** por ronda (`party:CODIGO:r0`), con mensajes *broadcast*: pasan de teléfono a teléfono sin tocar la base de datos.",
            en: "`versus.js`'s solution is called **lockstep**. One phone is the **host**. The others send it their buttons; every **6-tick turn** (200 ms) the host builds a `{ k, masks }` packet with one input per player and sends it to everyone.\n\nThe golden rule: **nobody simulates with anything else**, not even the host with its own buttons. Everyone waits for turn `k`, applies it for 6 ticks and moves on to `k + 1`. If packets arrive at odd times, no matter: they're applied in order. Same packets, same order, same game.\n\nThe pipe is one **Supabase Realtime** channel per round (`party:CODIGO:r0`), with *broadcast* messages: they go from phone to phone without touching the database.",
          },
          programa: {
            codigo: bi(`${RED}

const TURN = 6;
// Un canal de mentira con retraso: cada mensaje llega a cada teléfono en otro momento
function mulberry32(a) { return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const azar = mulberry32(3);

const telefonos = [0, 1, 2].map((i) => ({ i, juego: new Juego(3), turnos: [], siguiente: 0, buzon: [] }));

for (let k = 0; k < 10; k++) {
  // el anfitrión (teléfono 0) compone el turno k con lo último de cada jugador
  const turno = { k, masks: telefonos.map((t) => aprieta(t.i, k)) };
  // lo manda a todos, él incluido; cada copia llega con 0 a 3 turnos de retraso
  for (const t of telefonos) t.buzon.push({ llega: k + Math.floor(azar() * 4), turno });

  for (const t of telefonos) {
    for (const m of t.buzon.filter((m) => m.llega <= k)) t.turnos[m.turno.k] = m.turno;
    t.buzon = t.buzon.filter((m) => m.llega > k);
    // sólo se avanza con el turno que sigue, en orden
    while (t.turnos[t.siguiente]) {
      const { masks } = t.turnos[t.siguiente++];
      for (let i = 0; i < TURN; i++) t.juego.update(masks);
    }
  }
}
// al final llega todo lo que faltaba
for (const t of telefonos) {
  for (const m of t.buzon) t.turnos[m.turno.k] = m.turno;
  while (t.turnos[t.siguiente]) { const { masks } = t.turnos[t.siguiente++]; for (let i = 0; i < TURN; i++) t.juego.update(masks); }
  console.log("teléfono", t.i, t.juego.huella());
}`, [
              ...RED_EN,
              ["// Un canal de mentira con retraso: cada mensaje llega a cada teléfono en otro momento", "// A fake channel with delay: each message reaches each phone at a different time"],
              ["// el anfitrión (teléfono 0) compone el turno k con lo último de cada jugador", "// the host (phone 0) builds turn k with each player's latest input"],
              ["// lo manda a todos, él incluido; cada copia llega con 0 a 3 turnos de retraso", "// sends it to everyone, itself included; each copy arrives 0 to 3 turns late"],
              ["// sólo se avanza con el turno que sigue, en orden", "// only advance with the next turn, in order"],
              ["// al final llega todo lo que faltaba", "// at the end, everything still missing arrives"],
              ["\"teléfono\"", "\"phone\""],
            ]),
            notas: {
              es: "Los tres teléfonos recibieron los turnos en momentos distintos y aun así terminan con la misma huella: 60 ticks, mismas posiciones, mismos puntos. Ninguno simuló un tick sin tener el turno que le tocaba.",
              en: "The three phones got the turns at different times and still end with the same fingerprint: 60 ticks, same positions, same points. None of them simulated a tick without the turn it needed.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Paquetes perdidos y gente que se va", en: "Lost packets and people who leave" },
          texto: {
            es: "En una red de verdad, a veces un mensaje no llega. Si a un teléfono le llega el turno 4 sin haber tenido el 3, sabe que le falta uno: manda `'need'` con `from: 3` y el anfitrión reenvía desde su historial todos los turnos desde ahí. Mientras tanto ese teléfono **espera**: prefiere ir atrasado a ir equivocado.\n\nOtros casos que `versus.js` cubre:\n\n- Quien lleva más de **1.5 s** sin mandar botones (cerró la app) se queda quieto: el anfitrión pone `0` en su lugar.\n- Si el creador de la party no aparece en 6 s, el anfitrión es el primer presente de la lista, y el elegido queda fijo al arrancar (`hostFijo`).\n- Si los turnos dejan de llegar por **6 s**, la ronda se da por terminada con lo que haya.",
            en: "On a real network, sometimes a message doesn't arrive. If a phone gets turn 4 without having had turn 3, it knows it's missing one: it sends `'need'` with `from: 3` and the host resends every turn from there out of its history. Meanwhile that phone **waits**: better behind than wrong.\n\nOther cases `versus.js` handles:\n\n- Anyone who hasn't sent buttons for more than **1.5 s** (closed the app) stands still: the host puts `0` in their slot.\n- If the party's creator doesn't show up within 6 s, the host is the first present member on the list, and the choice is locked when the round starts (`hostFijo`).\n- If turns stop arriving for **6 s**, the round is called with whatever there is.",
          },
          programa: {
            codigo: bi(`${RED}

const TURN = 6;
const historial = [];               // lo que guarda el anfitrión
const turnos = [];                  // lo que tiene el invitado
let siguiente = 0;
const juego = new Juego(2);

function recibirTurno(t) {          // recibirTurno() de versus.js, resumido
  turnos[t.k] = t;
  if (t.k > siguiente && !turnos[siguiente]) {
    console.log("  falta el", siguiente, "-> need from", siguiente);
    for (const v of historial.slice(siguiente)) turnos[v.k] = v;   // el anfitrión reenvía
  }
}

for (let k = 0; k < 6; k++) {
  const t = { k, masks: [aprieta(0, k), aprieta(1, k)] };
  historial[k] = t;
  if (k === 3) { console.log("turno 3: se perdió en el camino"); continue; }
  console.log("turno", k, "llega");
  recibirTurno(t);
  while (turnos[siguiente]) { const { masks } = turnos[siguiente++]; for (let i = 0; i < TURN; i++) juego.update(masks); }
}

// El anfitrión simuló todo sin perder nada
const anfitrion = new Juego(2);
for (const { masks } of historial) for (let i = 0; i < TURN; i++) anfitrion.update(masks);
console.log("invitado: ", juego.huella());
console.log("anfitrión:", anfitrion.huella());`, [
              ...RED_EN,
              ["// lo que guarda el anfitrión", "// what the host keeps"], ["// lo que tiene el invitado", "// what the guest has"],
              ["// recibirTurno() de versus.js, resumido", "// recibirTurno() from versus.js, summarized"],
              ["\"  falta el\"", "\"  missing\""], ["// el anfitrión reenvía", "// the host resends"],
              ["\"turno 3: se perdió en el camino\"", "\"turn 3: lost on the way\""], ["\"turno\", k, \"llega\"", "\"turn\", k, \"arrives\""],
              ["// El anfitrión simuló todo sin perder nada", "// The host simulated everything without losing anything"],
              ["\"invitado: \"", "\"guest:    \""], ["\"anfitrión:\"", "\"host:     \""],
            ]),
            notas: {
              es: "Al llegar el 4 sin el 3, el invitado pide lo que le falta y se pone al día. Sus huellas y las del anfitrión coinciden: el turno perdido no dejó rastro en la partida, sólo un poco de retraso.",
              en: "When turn 4 arrives without turn 3, the guest asks for what's missing and catches up. Its fingerprint matches the host's: the lost turn left no trace in the game, just a bit of delay.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "El precio, y el registro para el servidor", en: "The price, and the log for the server" },
          texto: {
            es: "Lockstep tiene un costo que se siente: entre que aprietas y que tu serpiente gira pasan **200 a 400 ms**, lo que tarda tu botón en llegar al anfitrión, en entrar al siguiente turno y en volver. A cambio, nadie puede ver una partida distinta, y Realtime sólo transporta unos cuantos bytes por turno.\n\nAl terminar, el anfitrión tiene todos los turnos. `log()` los despliega en **un arreglo de máscaras por tick** (cada turno vale 6 ticks) y eso es lo que se manda al servidor, que lo re-simula con `verifyVersus` para repartir los puntos: la misma idea de la unidad 7.\n\nKazan, el juego de estrategia de la casa, lleva esto mismo a **50 jugadores** en una isla, con órdenes en vez de botones.",
            en: "Lockstep has a price you can feel: between pressing a button and your snake turning there are **200 to 400 ms**, the time for your button to reach the host, get into the next turn and come back. In exchange, nobody can see a different game, and Realtime only carries a few bytes per turn.\n\nAt the end, the host has every turn. `log()` unrolls them into **one array of masks per tick** (each turn counts for 6 ticks) and that's what goes to the server, which re-simulates it with `verifyVersus` to hand out points: the same idea as unit 7.\n\nKazan, the studio's strategy game, takes this same idea to **50 players** on an island, with orders instead of buttons.",
          },
          programa: {
            codigo: bi(`const TURN = 6;
const turnos = [
  { k: 0, masks: [8, 0] },
  { k: 1, masks: [8, 1] },
  { k: 2, masks: [2, 1] },
];

// log() de versus.js: un input por jugador por tick
function log(turnos, turnoFin) {
  const out = [];
  for (let k = 0; k < turnoFin && turnos[k]; k++)
    for (let i = 0; i < TURN; i++) out.push(turnos[k].masks);
  return out;
}

const registro = log(turnos, turnos.length);
console.log("ticks:", registro.length);
console.log("primeros 8:", JSON.stringify(registro.slice(0, 8)));
console.log("retraso de un turno:", (TURN * 1000 / 30).toFixed(0), "ms");`, [
              ["// log() de versus.js: un input por jugador por tick", "// log() from versus.js: one input per player per tick"],
              ["\"primeros 8:\"", "\"first 8:\""], ["\"retraso de un turno:\"", "\"one turn of delay:\""],
            ]),
            notas: {
              es: "Tres turnos son 18 ticks: cada paquete se repite seis veces seguidas. El turno dura 200 ms; con lo que tarda la red en ir y volver, el retraso que se siente queda entre 200 y 400 ms.",
              en: "Three turns are 18 ticks: each packet repeats six times in a row. A turn lasts 200 ms; with the network's round trip on top, the delay you feel lands between 200 and 400 ms.",
            },
          },
          enlaces: [
            { url: "/notas/un-juego-de-estrategia-en-linea-con-unos-bytes-por-tick", texto: { es: "La nota: Kazan, un juego de estrategia en línea con unos bytes por tick", en: "The note: Kazan, an online strategy game at a few bytes per tick" } },
            { url: "https://dailychallenge.click/party", texto: { es: "Probarlo: el modo party de Daily Challenge", en: "Try it: Daily Challenge's party mode" } },
          ],
        },
        {
          tipo: "elige",
          pregunta: { es: "Un turno son 6 ticks y el juego corre a 30 ticks por segundo. ¿Cada cuánto manda el anfitrión un paquete?", en: "A turn is 6 ticks and the game runs at 30 ticks per second. How often does the host send a packet?" },
          opciones: [{ es: "Cada 6 ms", en: "Every 6 ms" }, { es: "Cada 33 ms", en: "Every 33 ms" }, { es: "Cada 200 ms", en: "Every 200 ms" }, { es: "Cada segundo", en: "Every second" }],
          correcta: 2,
          porque: { es: "6 / 30 = 0.2 s. Cinco paquetes por segundo bastan, porque cada uno vale para seis ticks.", en: "6 / 30 = 0.2 s. Five packets per second are enough, because each one covers six ticks." },
        },
        {
          tipo: "elige",
          pregunta: { es: "En lockstep, ¿con qué botones simula el anfitrión su propia serpiente?", en: "In lockstep, which buttons does the host use to simulate its own snake?" },
          opciones: [
            { es: "Con los suyos, al instante, para no tener retraso", en: "Its own, instantly, to avoid delay" },
            { es: "Con los mismos turnos `{ k, masks }` que manda a todos", en: "With the same `{ k, masks }` turns it sends everyone" },
            { es: "Con lo que diga el servidor", en: "With whatever the server says" },
            { es: "No simula: sólo reparte", en: "It doesn't simulate: it only distributes" },
          ],
          correcta: 1,
          porque: { es: "Si el anfitrión se saltara la fila con sus propios botones, su partida sería distinta de la de los demás. Todos, él incluido, simulan sólo con los turnos.", en: "If the host jumped the queue with its own buttons, its game would differ from everyone else's. Everyone, host included, simulates only with the turns." },
        },
        {
          tipo: "elige",
          pregunta: { es: "Un jugador cierra la app a media ronda. ¿Qué hace el anfitrión con su lugar en los turnos?", en: "A player closes the app mid-round. What does the host do with their slot in the turns?" },
          opciones: [
            { es: "Detiene la partida para todos", en: "Stops the game for everyone" },
            { es: "Repite su último botón para siempre", en: "Repeats their last button forever" },
            { es: "Pasados 1.5 s sin noticias, pone 0: su serpiente sigue sin girar", en: "After 1.5 s of silence, puts 0: their snake keeps going without turning" },
            { es: "Lo saca del arreglo", en: "Removes them from the array" },
          ],
          correcta: 2,
          porque: { es: "Sacarlo cambiaría los índices de los demás y rompería la simulación. Con `0`, su serpiente sigue recta hasta chocar, y la partida continúa igual en todos los teléfonos.", en: "Removing them would shift everyone else's indices and break the simulation. With `0`, their snake goes straight until it crashes, and the game carries on the same on every phone." },
        },
        {
          tipo: "ordena",
          pregunta: { es: "Ordena el viaje de un botón en lockstep, con los renglones de `versus.js` y `party.js`: el invitado lo manda, el anfitrión lo guarda, arma el turno, todos lo simulan y al final va el registro al servidor.", en: "Put a button's journey through lockstep in order, using lines from `versus.js` and `party.js`: the guest sends it, the host stores it, builds the turn, everyone simulates it and finally the log goes to the server." },
          lineas: [
            "this.send('in', { u: this.yo, k: this.siguiente + 1, m: this.dir | this.aPend });",
            "this.latest[p.u] = p.m;",
            "this.send('turn', { k, masks });",
            "for (let i = 0; i < TURN; i++) this.game.update(masks);",
            "api('/api/party/' + CODIGO, { accion: 'versus', ronda, log: versus.log() });",
          ],
          porque: { es: "Botón → anfitrión → turno → todos simulan el mismo turno → registro al servidor. Ningún teléfono aplica un botón que no venga dentro de un turno.", en: "Button → host → turn → everyone simulates the same turn → log to the server. No phone applies a button that doesn't come inside a turn." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `expandir(turnos, TURN)`, como `log()` de `versus.js`: recibe los turnos en orden (`{ k, masks }`) y devuelve un arreglo con las `masks` de cada turno repetidas `TURN` veces.",
            en: "Write `expandir(turnos, TURN)`, like `versus.js`'s `log()`: it takes the turns in order (`{ k, masks }`) and returns an array with each turn's `masks` repeated `TURN` times.",
          },
          inicial: bi(`function expandir(turnos, TURN) {
  // cada turno aporta TURN renglones iguales
  return [];
}

console.log(expandir([{ k: 0, masks: [8, 0] }], 2));`, [["// cada turno aporta TURN renglones iguales", "// each turn contributes TURN identical rows"]]),
          pruebas: [
            { llamada: "expandir([{ k: 0, masks: [8, 0] }], 2)", espera: "[[8,0],[8,0]]" },
            { llamada: "expandir([{ k: 0, masks: [1] }, { k: 1, masks: [2] }], 3)", espera: "[[1],[1],[1],[2],[2],[2]]" },
            { llamada: "expandir([], 6)", espera: "[]" },
            { llamada: "expandir([{ k: 0, masks: [0, 16, 4] }], 6).length", espera: "6" },
          ],
          solucion: "function expandir(turnos, TURN) {\n  const out = [];\n  for (const t of turnos) {\n    for (let i = 0; i < TURN; i++) out.push(t.masks);\n  }\n  return out;\n}",
          porque: { es: "Dos ciclos: uno por turno y otro por cada tick del turno. El servidor recibe así exactamente lo que cada teléfono simuló, tick por tick.", en: "Two loops: one per turn and one for each tick in the turn. The server then gets exactly what each phone simulated, tick by tick." },
        },
      ],
    },
  ],
};
