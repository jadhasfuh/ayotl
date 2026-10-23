import type { Unidad } from "../tipos";

export const S03: Unidad = {
  id: "bucle-y-controles",
  titulo: { es: "El bucle y los controles", en: "The loop and the controls" },
  lecciones: [
    {
      id: "ticks-fijos",
      titulo: { es: "30 ticks por segundo, siempre", en: "30 ticks a second, always" },
      resumen: {
        es: "requestAnimationFrame, el acumulador y por qué el juego avanza a pasos fijos aunque la pantalla vaya a 60 o a 120.",
        en: "requestAnimationFrame, the accumulator and why the game moves in fixed steps whether the screen runs at 60 or 120.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "El problema de los cuadros", en: "The trouble with frames" },
          texto: {
            es: "El navegador avisa cada vez que la pantalla está lista para un cuadro nuevo con `requestAnimationFrame`. Pero no todas las pantallas van igual: muchas a 60 cuadros por segundo, otras a 90 o 120, y un teléfono ocupado se salta cuadros.\n\nSi la serpiente avanzara **una casilla por cuadro**, en un teléfono de 120 Hz iría al doble de rápido que en uno de 60. Y peor: el servidor, que no tiene pantalla, no sabría cuántos cuadros hubo.\n\nLa solución de Daily Challenge: separar **dibujar** de **simular**. Se dibuja cuando la pantalla quiera; se simula siempre a **30 ticks por segundo**.",
            en: "The browser lets you know each time the screen is ready for a new frame with `requestAnimationFrame`. But not all screens run the same: many at 60 frames per second, others at 90 or 120, and a busy phone skips frames.\n\nIf the snake moved **one cell per frame**, on a 120 Hz phone it would go twice as fast as on a 60 Hz one. Worse: the server, which has no screen, wouldn't know how many frames there were.\n\nDaily Challenge's solution: separate **drawing** from **simulating**. Draw whenever the screen wants; simulate always at **30 ticks per second**.",
          },
          programa: {
            codigo: {
              es: `// Un segundo de juego en dos pantallas distintas
for (const hz of [60, 120]) {
  const frame = 1000 / hz;
  let porCuadro = 0, porTick = 0, acc = 0;
  for (let t = 0; t < 1000 - 0.001; t += frame) {
    porCuadro++;                      // mal: un paso por cuadro
    acc += frame;                     // bien: pasos fijos de 1000/30 ms
    while (acc >= 1000 / 30) { porTick++; acc -= 1000 / 30; }
  }
  console.log(hz + " Hz -> por cuadro:", porCuadro, "| por tick:", porTick);
}`,
              en: `// One second of play on two different screens
for (const hz of [60, 120]) {
  const frame = 1000 / hz;
  let porCuadro = 0, porTick = 0, acc = 0;
  for (let t = 0; t < 1000 - 0.001; t += frame) {
    porCuadro++;                      // wrong: one step per frame
    acc += frame;                     // right: fixed steps of 1000/30 ms
    while (acc >= 1000 / 30) { porTick++; acc -= 1000 / 30; }
  }
  console.log(hz + " Hz -> per frame:", porCuadro, "| per tick:", porTick);
}`,
            },
            notas: {
              es: "Por cuadro: 60 contra 120 pasos en el mismo segundo. Por tick: 30 en las dos. El juego va igual de rápido; la pantalla de 120 Hz sólo dibuja más seguido.",
              en: "Per frame: 60 versus 120 steps in the same second. Per tick: 30 on both. The game runs at the same speed; the 120 Hz screen just draws more often.",
            },
          },
          enlaces: [{ url: "https://developer.mozilla.org/es/docs/Web/API/Window/requestAnimationFrame", texto: { es: "requestAnimationFrame (MDN)", en: "requestAnimationFrame (MDN)" } }],
        },
        {
          tipo: "explica",
          titulo: { es: "El acumulador", en: "The accumulator" },
          texto: {
            es: "Así está el bucle en `shell.js` (le quité el manejo de errores):\n\n`const dt = Math.min(now - last, 250);`\n`last = now;`\n`acc += dt;`\n`while (acc >= TICK_MS) { tick(); acc -= TICK_MS; }`\n`render();`\n\ncon `TICK_MS = 1000 / 30`, unos 33.3 ms. En cada cuadro se suma al **acumulador** el tiempo que pasó y se gastan tantos ticks como quepan. Lo que sobra se queda para el próximo cuadro. Si un cuadro llega tarde, ese cuadro corre dos o tres ticks seguidos; si llega temprano, ninguno. A la larga, siempre 30 por segundo.",
            en: "This is the loop in `shell.js` (error handling removed):\n\n`const dt = Math.min(now - last, 250);`\n`last = now;`\n`acc += dt;`\n`while (acc >= TICK_MS) { tick(); acc -= TICK_MS; }`\n`render();`\n\nwith `TICK_MS = 1000 / 30`, about 33.3 ms. On each frame the elapsed time is added to the **accumulator** and as many ticks as fit are spent. The rest is kept for the next frame. If a frame arrives late, that frame runs two or three ticks in a row; if it arrives early, none. In the long run, always 30 a second.",
          },
          programa: {
            codigo: {
              es: `const TICK_MS = 1000 / 30;
let acc = 0, ticks = 0;

// milisegundos entre cuadros: parejos, uno tardado y uno muy rápido
const cuadros = [16.7, 16.7, 16.7, 70, 8, 16.7];
for (const dt of cuadros) {
  acc += dt;
  let aqui = 0;
  while (acc >= TICK_MS) { ticks++; aqui++; acc -= TICK_MS; }
  console.log("dt", String(dt).padStart(4), "-> ticks en este cuadro:", aqui, " sobra:", acc.toFixed(1));
}
console.log("total:", ticks, "ticks en", cuadros.reduce((a, b) => a + b, 0).toFixed(1), "ms");`,
              en: `const TICK_MS = 1000 / 30;
let acc = 0, ticks = 0;

// milliseconds between frames: steady, one late and one very quick
const cuadros = [16.7, 16.7, 16.7, 70, 8, 16.7];
for (const dt of cuadros) {
  acc += dt;
  let aqui = 0;
  while (acc >= TICK_MS) { ticks++; aqui++; acc -= TICK_MS; }
  console.log("dt", String(dt).padStart(4), "-> ticks this frame:", aqui, " left:", acc.toFixed(1));
}
console.log("total:", ticks, "ticks in", cuadros.reduce((a, b) => a + b, 0).toFixed(1), "ms");`,
            },
            notas: {
              es: "El cuadro tardado (70 ms) corre dos ticks de golpe para alcanzar al reloj; el de 8 ms no corre ninguno. Al final van 4 ticks en 145 ms, lo que toca a 30 por segundo.",
              en: "The late frame (70 ms) runs two ticks at once to catch up with the clock; the 8 ms one runs none. In the end there are 4 ticks in 145 ms, right on 30 a second.",
            },
          },
          enlaces: [{ url: "https://gafferongames.com/post/fix_your_timestep/", texto: { es: "Fix Your Timestep! (Glenn Fiedler, en inglés): el artículo clásico del acumulador", en: "Fix Your Timestep! (Glenn Fiedler): the classic accumulator article" } }],
        },
        {
          tipo: "explica",
          titulo: { es: "El tope de 250 ms y la pausa", en: "The 250 ms cap and pausing" },
          texto: {
            es: "Si cambias de pestaña, el navegador deja de llamar a `requestAnimationFrame`. Al volver, `now - last` pueden ser cinco segundos: sin tope, el bucle correría 150 ticks de un jalón y te encontrarías la serpiente estrellada. Por eso `dt` se recorta a **250 ms**: como mucho, 7 ticks de golpe.\n\nY en pausa (o durante la cuenta atrás al volver) no se llama a `tick` y el acumulador se vacía: `if (pausa.quieto) { acc = 0; … return; }`. El tiempo parado no existe para el juego, ni se escribe en el registro de la partida.\n\nEsto es también lo que hace justa la partida: el puntaje sale de **ticks**, no de segundos del reloj. El servidor no necesita saber qué tan rápido iba tu teléfono.",
            en: "If you switch tabs, the browser stops calling `requestAnimationFrame`. When you come back, `now - last` might be five seconds: with no cap, the loop would run 150 ticks in one go and you'd find your snake crashed. So `dt` is clamped to **250 ms**: at most 7 ticks at once.\n\nAnd while paused (or during the countdown on resume) `tick` isn't called and the accumulator is emptied: `if (pausa.quieto) { acc = 0; … return; }`. Paused time doesn't exist for the game, and nothing is written to the game's log.\n\nThis is also what makes the game fair: the score comes from **ticks**, not clock seconds. The server doesn't need to know how fast your phone was.",
          },
          programa: {
            codigo: {
              es: `const TICK_MS = 1000 / 30;
function ticksDeUnCuadro(dt, conTope) {
  let acc = conTope ? Math.min(dt, 250) : dt, n = 0;
  while (acc >= TICK_MS) { n++; acc -= TICK_MS; }
  return n;
}

const ausencia = 5000;   // cinco segundos en otra pestaña
console.log("sin tope:", ticksDeUnCuadro(ausencia, false), "ticks de golpe");
console.log("con tope:", ticksDeUnCuadro(ausencia, true), "ticks de golpe");`,
              en: `const TICK_MS = 1000 / 30;
function ticksDeUnCuadro(dt, conTope) {
  let acc = conTope ? Math.min(dt, 250) : dt, n = 0;
  while (acc >= TICK_MS) { n++; acc -= TICK_MS; }
  return n;
}

const ausencia = 5000;   // five seconds in another tab
console.log("no cap:", ticksDeUnCuadro(ausencia, false), "ticks at once");
console.log("with cap:", ticksDeUnCuadro(ausencia, true), "ticks at once");`,
            },
            notas: {
              es: "150 contra 7. Con el tope, el juego no intenta «recuperar» el tiempo perdido: simplemente sigue.",
              en: "150 versus 7. With the cap, the game doesn't try to \"make up\" lost time: it just carries on.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "La serpiente no se mueve en cada tick", en: "The snake doesn't move every tick" },
          texto: {
            es: "30 ticks por segundo serían 30 casillas por segundo: imposible de jugar. Snake lleva otro contador, `this.interval = 8`: **se mueve un tick de cada ocho**. En `update`:\n\n`this.tick++;`\n`if (this.tick % this.interval !== 0) return;`\n\nLos demás ticks no se pierden: se lee el control, corre la cuenta atrás del bicho de premio y baja el hambre. Al comer, el intervalo baja y la serpiente acelera:\n\n`this.interval = Math.max(3, 8 - Math.floor(this.eaten / 4));`\n\nUna velocidad que sale de enteros y del contador de ticks, sin ningún reloj: idéntica en el teléfono y en el servidor.",
            en: "30 ticks a second would be 30 cells a second: unplayable. Snake keeps another counter, `this.interval = 8`: **it moves one tick out of every eight**. In `update`:\n\n`this.tick++;`\n`if (this.tick % this.interval !== 0) return;`\n\nThe other ticks aren't wasted: the controls are read, the bonus bug's countdown runs and hunger goes down. When it eats, the interval drops and the snake speeds up:\n\n`this.interval = Math.max(3, 8 - Math.floor(this.eaten / 4));`\n\nA speed built from integers and the tick counter, no clock at all: identical on the phone and on the server.",
          },
          programa: {
            codigo: {
              es: `for (const eaten of [0, 4, 8, 12, 16, 20, 40]) {
  const interval = Math.max(3, 8 - Math.floor(eaten / 4));
  const casillas = (30 / interval).toFixed(2);
  console.log("frutas", String(eaten).padStart(2), "-> cada", interval, "ticks =", casillas, "casillas/s");
}`,
              en: `for (const eaten of [0, 4, 8, 12, 16, 20, 40]) {
  const interval = Math.max(3, 8 - Math.floor(eaten / 4));
  const casillas = (30 / interval).toFixed(2);
  console.log("fruit", String(eaten).padStart(2), "-> every", interval, "ticks =", casillas, "cells/s");
}`,
            },
            notas: {
              es: "Arranca a 3.75 casillas por segundo y llega al tope (cada 3 ticks, 10 por segundo) a las 20 frutas. Después ya no acelera: `Math.max(3, …)` lo detiene.",
              en: "It starts at 3.75 cells a second and reaches the limit (every 3 ticks, 10 a second) at 20 fruits. After that it doesn't speed up: `Math.max(3, …)` stops it.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "La partida duró exactamente 10 segundos de juego, sin pausas. ¿Cuántos ticks tiene su registro?", en: "The game lasted exactly 10 seconds of play, no pauses. How many ticks are in its log?" },
          opciones: ["10", "300", "600", { es: "Depende de la pantalla", en: "It depends on the screen" }],
          correcta: 1,
          porque: { es: "30 por segundo × 10 = 300, en cualquier teléfono. Que no dependa de la pantalla es justo el punto del paso fijo.", en: "30 a second × 10 = 300, on any phone. Not depending on the screen is the whole point of the fixed step." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Para qué sirve recortar `dt` a 250 ms?", en: "What is clamping `dt` to 250 ms for?" },
          opciones: [
            { es: "Para que el juego vaya a 4 cuadros por segundo", en: "So the game runs at 4 frames a second" },
            { es: "Para no correr cientos de ticks de golpe al volver de otra pestaña", en: "To avoid running hundreds of ticks at once when coming back from another tab" },
            { es: "Para ahorrar batería", en: "To save battery" },
            { es: "Para que el servidor acepte la partida", en: "So the server accepts the game" },
          ],
          correcta: 1,
          porque: { es: "Con el tope, un cuadro corre como mucho 7 ticks. Sin él, la ausencia entera se simularía de un jalón sin que pudieras reaccionar.", en: "With the cap, one frame runs at most 7 ticks. Without it, the whole absence would be simulated in one go with no chance to react." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa el corazón del bucle.", en: "Complete the heart of the loop." },
          codigo: "acc += dt;\nwhile (acc >= ___) { tick(); acc -= ___; }\nrender();",
          huecos: ["TICK_MS", "TICK_MS"],
          banco: ["TICK_MS", "TICK_MS", "dt", "1000", "acc"],
          porque: { es: "Mientras quepa un tick entero en el acumulador, se corre uno y se descuenta su duración. Lo que sobra espera al siguiente cuadro.", en: "While a whole tick fits in the accumulator, run one and subtract its duration. The remainder waits for the next frame." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `ticksPorFrames(dts)`: recibe los milisegundos entre cuadros y devuelve cuántos ticks se corrieron en total, con un acumulador, `TICK_MS = 1000 / 30` y cada `dt` recortado a 250.",
            en: "Write `ticksPorFrames(dts)`: it takes the milliseconds between frames and returns how many ticks ran in total, using an accumulator, `TICK_MS = 1000 / 30` and each `dt` clamped to 250.",
          },
          inicial: {
            es: "const TICK_MS = 1000 / 30;\n\nfunction ticksPorFrames(dts) {\n  let acc = 0, ticks = 0;\n  // por cada dt: súmalo (con tope) y gasta los ticks que quepan\n  return ticks;\n}\n\nconsole.log(ticksPorFrames([40, 40, 40]));",
            en: "const TICK_MS = 1000 / 30;\n\nfunction ticksPorFrames(dts) {\n  let acc = 0, ticks = 0;\n  // for each dt: add it (capped) and spend the ticks that fit\n  return ticks;\n}\n\nconsole.log(ticksPorFrames([40, 40, 40]));",
          },
          pruebas: [
            { llamada: "ticksPorFrames([40, 40, 40])", espera: "3" },
            { llamada: "ticksPorFrames([16.7, 16.7, 16.7, 16.7])", espera: "2" },
            { llamada: "ticksPorFrames([1000])", espera: "7" },
            { llamada: "ticksPorFrames([5000, 10])", espera: "7" },
            { llamada: "ticksPorFrames([])", espera: "0" },
          ],
          solucion: "const TICK_MS = 1000 / 30;\n\nfunction ticksPorFrames(dts) {\n  let acc = 0, ticks = 0;\n  for (const dt of dts) {\n    acc += Math.min(dt, 250);\n    while (acc >= TICK_MS) { ticks++; acc -= TICK_MS; }\n  }\n  return ticks;\n}",
          porque: { es: "Los tres cuadros de 40 ms suman 120: caben 3 ticks y sobran 20 ms. Y el de 1000 ms se recorta a 250, así que da 7 y no 30.", en: "Three 40 ms frames add up to 120: 3 ticks fit and 20 ms are left. And the 1000 ms one is clamped to 250, so it gives 7, not 30." },
        },
      ],
    },
    {
      id: "una-bitmask-por-tick",
      titulo: { es: "Una bitmask por tick", en: "One bitmask per tick" },
      resumen: {
        es: "Cuatro direcciones y un botón en un número del 0 al 31: teclado, cruceta y swipes hablan el mismo idioma.",
        en: "Four directions and one button in a number from 0 to 31: keyboard, D-pad and swipes speak the same language.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Cinco botones, cinco bits", en: "Five buttons, five bits" },
          texto: {
            es: "La Atari tenía una palanca de cuatro direcciones y un botón. Daily Challenge guarda los cinco en **un solo número**, un bit por botón. Es todo `core/buttons.js`:\n\n`export const BTN = { UP: 1, DOWN: 2, LEFT: 4, RIGHT: 8, A: 16 };`\n\nCada valor es una potencia de 2, así que se pueden **sumar sin chocar**: arriba y derecha a la vez es `1 | 8 = 9`. Para preguntar si un botón está apretado se usa el **y** de bits: `mask & BTN.UP` da distinto de cero si el bit de arriba está encendido. Con cinco bits hay 32 combinaciones: del 0 (nada) al 31 (todo).",
            en: "The Atari had a four-way joystick and one button. Daily Challenge stores all five in **a single number**, one bit per button. That's all of `core/buttons.js`:\n\n`export const BTN = { UP: 1, DOWN: 2, LEFT: 4, RIGHT: 8, A: 16 };`\n\nEach value is a power of 2, so they can be **combined without clashing**: up and right together is `1 | 8 = 9`. To ask whether a button is pressed you use bitwise **and**: `mask & BTN.UP` is non-zero if the up bit is on. Five bits give 32 combinations: from 0 (nothing) to 31 (everything).",
          },
          programa: {
            codigo: {
              es: `const BTN = { UP: 1, DOWN: 2, LEFT: 4, RIGHT: 8, A: 16 };

function nombres(mask) {
  const lista = Object.keys(BTN).filter(b => mask & BTN[b]);
  return lista.length ? lista.join("+") : "nada";
}

for (const m of [0, 1, 9, 16, 25, 31]) {
  console.log(String(m).padStart(2), m.toString(2).padStart(5, "0"), nombres(m));
}
console.log("arriba + derecha =", BTN.UP | BTN.RIGHT);`,
              en: `const BTN = { UP: 1, DOWN: 2, LEFT: 4, RIGHT: 8, A: 16 };

function nombres(mask) {
  const lista = Object.keys(BTN).filter(b => mask & BTN[b]);
  return lista.length ? lista.join("+") : "nothing";
}

for (const m of [0, 1, 9, 16, 25, 31]) {
  console.log(String(m).padStart(2), m.toString(2).padStart(5, "0"), nombres(m));
}
console.log("up + right =", BTN.UP | BTN.RIGHT);`,
            },
            notas: {
              es: "La columna del medio es el número en binario: cada 1 es un botón apretado. El 25 es `11001`: A, derecha y arriba.",
              en: "The middle column is the number in binary: each 1 is a pressed button. 25 is `11001`: A, right and up.",
            },
          },
          enlaces: [{ url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/Bitwise_AND", texto: { es: "El operador & (MDN)", en: "The & operator (MDN)" } }],
        },
        {
          tipo: "explica",
          titulo: { es: "Mantener y tocar: held y latched", en: "Holding and tapping: held and latched" },
          texto: {
            es: "`core/input.js` junta tres fuentes en la misma bitmask: el **teclado** (flechas, WASD, espacio), la **cruceta** en pantalla y los **swipes** sobre el juego. Las guarda en dos lados:\n\n- `held`: lo que está apretado ahora. Una tecla prende su bit al bajar y lo apaga al subir.\n- `latched`: lo que pasó una sola vez, como un swipe. Se guarda hasta el siguiente tick y luego se borra, para que un swipe rapidísimo entre dos ticks **no se pierda**.\n\nUna vez por tick, el bucle llama a `poll()`:\n\n`const m = this.held | this.latched;`\n`this.latched = 0;`\n`return m;`",
            en: "`core/input.js` merges three sources into the same bitmask: the **keyboard** (arrows, WASD, space), the on-screen **D-pad** and **swipes** over the game. It keeps them in two places:\n\n- `held`: what's pressed right now. A key turns its bit on when it goes down and off when it comes up.\n- `latched`: what happened just once, like a swipe. It's kept until the next tick and then cleared, so a lightning-fast swipe between two ticks **isn't lost**.\n\nOnce per tick, the loop calls `poll()`:\n\n`const m = this.held | this.latched;`\n`this.latched = 0;`\n`return m;`",
          },
          programa: {
            codigo: {
              es: `const BTN = { UP: 1, DOWN: 2, LEFT: 4, RIGHT: 8, A: 16 };
const input = {
  held: 0, latched: 0,
  bajaTecla(b) { this.held |= b; },
  subeTecla(b) { this.held &= ~b; },
  swipe(b)     { this.latched |= b; },
  poll() { const m = this.held | this.latched; this.latched = 0; return m; },
};

const log = [];
input.bajaTecla(BTN.RIGHT);  log.push(input.poll());   // tick 1
                             log.push(input.poll());   // tick 2: sigue apretada
input.swipe(BTN.UP);         log.push(input.poll());   // tick 3: el swipe
                             log.push(input.poll());   // tick 4: ya se borró
input.subeTecla(BTN.RIGHT);  log.push(input.poll());   // tick 5
console.log(log);`,
              en: `const BTN = { UP: 1, DOWN: 2, LEFT: 4, RIGHT: 8, A: 16 };
const input = {
  held: 0, latched: 0,
  bajaTecla(b) { this.held |= b; },
  subeTecla(b) { this.held &= ~b; },
  swipe(b)     { this.latched |= b; },
  poll() { const m = this.held | this.latched; this.latched = 0; return m; },
};

const log = [];
input.bajaTecla(BTN.RIGHT);  log.push(input.poll());   // tick 1
                             log.push(input.poll());   // tick 2: still held
input.swipe(BTN.UP);         log.push(input.poll());   // tick 3: the swipe
                             log.push(input.poll());   // tick 4: already cleared
input.subeTecla(BTN.RIGHT);  log.push(input.poll());   // tick 5
console.log(log);`,
            },
            notas: {
              es: "`[8, 8, 9, 8, 0]`: la derecha se mantiene mientras la tecla esté abajo; el swipe hacia arriba aparece **una sola vez** (8 + 1 = 9) y desaparece. `~b` invierte los bits: `held &= ~b` apaga sólo ese botón.",
              en: "`[8, 8, 9, 8, 0]`: right stays on while the key is down; the upward swipe shows up **exactly once** (8 + 1 = 9) and goes away. `~b` flips the bits: `held &= ~b` turns off just that button.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Apretar no es mantener", en: "Pressing isn't holding" },
          texto: {
            es: "A Snake le basta saber qué está apretado: `if (mask & BTN.UP && this.dir.y !== 1) …`. Pero otros juegos necesitan el **momento** en que se aprieta: en Tetris, mantener el botón no debe girar la pieza 30 veces por segundo. Para eso `buttons.js` trae una segunda función:\n\n`export const pressed = (mask, prev) => mask & ~prev;`\n\nDevuelve los bits que están **ahora** pero **no estaban** en el tick anterior: los flancos.",
            en: "Snake only needs to know what's held: `if (mask & BTN.UP && this.dir.y !== 1) …`. But other games need the **moment** a button goes down: in Tetris, holding the button shouldn't rotate the piece 30 times a second. For that, `buttons.js` has a second function:\n\n`export const pressed = (mask, prev) => mask & ~prev;`\n\nIt returns the bits that are on **now** but **weren't** on the previous tick: the edges.",
          },
          programa: {
            codigo: {
              es: `const pressed = (mask, prev) => mask & ~prev;

// A mantenido tres ticks, soltado y vuelto a apretar
const masks = [0, 16, 16, 16, 0, 16];
let prev = 0, giros = 0;
for (const m of masks) {
  if (pressed(m, prev) & 16) giros++;
  prev = m;
}
console.log("ticks con A:", masks.filter(m => m & 16).length, "| giros:", giros);`,
              en: `const pressed = (mask, prev) => mask & ~prev;

// A held for three ticks, released and pressed again
const masks = [0, 16, 16, 16, 0, 16];
let prev = 0, giros = 0;
for (const m of masks) {
  if (pressed(m, prev) & 16) giros++;
  prev = m;
}
console.log("ticks with A:", masks.filter(m => m & 16).length, "| rotations:", giros);`,
            },
            notas: {
              es: "Cuatro ticks con A apretado, pero sólo dos giros: uno por cada vez que el botón **bajó**.",
              en: "Four ticks with A down, but only two rotations: one for each time the button **went down**.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Toda la partida, en un texto", en: "The whole game, as text" },
          texto: {
            es: "Cada tick, `main.js` guarda la bitmask antes de pasársela al juego: `log.push(mask); game.update(mask);`. Al final, el registro entero es un arreglo de números del 0 al 31, uno por tick.\n\nPara mandarlo al servidor, `net.js` vuelve cada número un carácter, sumándole 48 (el código del `'0'`):\n\n`log.map(m => String.fromCharCode(48 + m)).join('')`\n\nUna partida de un minuto son 1800 caracteres. El servidor hace la cuenta al revés con `charCodeAt(0) - 48` y rechaza el registro si algún número sale del 0 al 31.",
            en: "Every tick, `main.js` saves the bitmask before handing it to the game: `log.push(mask); game.update(mask);`. At the end, the whole log is an array of numbers from 0 to 31, one per tick.\n\nTo send it to the server, `net.js` turns each number into a character by adding 48 (the code of `'0'`):\n\n`log.map(m => String.fromCharCode(48 + m)).join('')`\n\nA one-minute game is 1800 characters. The server does the reverse with `charCodeAt(0) - 48` and rejects the log if any number falls outside 0 to 31.",
          },
          programa: {
            codigo: {
              es: `const log = [0, 0, 8, 8, 9, 1, 1, 16, 0];
const texto = log.map(m => String.fromCharCode(48 + m)).join("");
console.log("para el servidor:", texto);

// del lado del servidor
const deVuelta = Array.from(texto, ch => ch.charCodeAt(0) - 48);
console.log("leído:", deVuelta);
console.log("¿válido?", deVuelta.every(m => m >= 0 && m <= 31));
console.log("un minuto =", 30 * 60, "caracteres");`,
              en: `const log = [0, 0, 8, 8, 9, 1, 1, 16, 0];
const texto = log.map(m => String.fromCharCode(48 + m)).join("");
console.log("for the server:", texto);

// on the server's side
const deVuelta = Array.from(texto, ch => ch.charCodeAt(0) - 48);
console.log("read back:", deVuelta);
console.log("valid?", deVuelta.every(m => m >= 0 && m <= 31));
console.log("one minute =", 30 * 60, "characters");`,
            },
            notas: {
              es: "Del 0 al 9 salen los dígitos, del 10 al 15 signos como `:` y `?`, el 16 es `@` y del 17 al 31, las letras de la `A` a la `O`. Un carácter por tick: compacto y fácil de revisar.",
              en: "0 to 9 come out as digits, 10 to 15 as symbols like `:` and `?`, 16 is `@` and 17 to 31 are the letters `A` to `O`. One character per tick: compact and easy to check.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué número es «arriba y derecha a la vez»?", en: "What number is \"up and right at the same time\"?" },
          opciones: ["5", "9", "12", "18"],
          correcta: 1,
          porque: { es: "UP vale 1 y RIGHT vale 8: `1 | 8 = 9`, en binario `01001`.", en: "UP is 1 and RIGHT is 8: `1 | 8 = 9`, binary `01001`." },
        },
        {
          tipo: "elige",
          pregunta: { es: "En el tick anterior estaba apretado A (16). Ahora, A y arriba (17). ¿Qué da `pressed(17, 16)`?", en: "On the previous tick A (16) was down. Now, A and up (17). What does `pressed(17, 16)` give?" },
          opciones: ["0", "1", "16", "17"],
          correcta: 1,
          porque: { es: "A ya estaba, así que no es nuevo. Lo único que bajó en este tick es arriba: `17 & ~16 = 1`.", en: "A was already down, so it isn't new. The only thing that went down this tick is up: `17 & ~16 = 1`." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa `poll()`, que se llama una vez por tick.", en: "Complete `poll()`, which is called once per tick." },
          codigo: "poll() {\n  const m = this.held ___ this.latched;\n  this.latched = ___;\n  return m;\n}",
          huecos: ["|", "0"],
          banco: ["|", "0", "&", "1", "+", "this.held"],
          porque: { es: "Se juntan los dos con el **o** de bits y lo de un solo disparo se borra: así un swipe cuenta exactamente en un tick.", en: "Combine both with bitwise **or** and clear the one-shot part: that way a swipe counts on exactly one tick." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `codificar(log)` como `net.js`: convierte cada número del log en el carácter con código `48 + número` y une todo en un texto.",
            en: "Write `codificar(log)` like `net.js`: turn each number in the log into the character with code `48 + number` and join them into one string.",
          },
          inicial: {
            es: "function codificar(log) {\n  // String.fromCharCode(48 + m)\n}\n\nconsole.log(codificar([0, 1, 16]));",
            en: "function codificar(log) {\n  // String.fromCharCode(48 + m)\n}\n\nconsole.log(codificar([0, 1, 16]));",
          },
          pruebas: [
            { llamada: "codificar([0, 1, 16])", espera: "\"01@\"" },
            { llamada: "codificar([8, 8, 9])", espera: "\"889\"" },
            { llamada: "codificar([17, 31])", espera: "\"AO\"" },
            { llamada: "codificar([])", espera: "\"\"" },
          ],
          solucion: "function codificar(log) {\n  return log.map(m => String.fromCharCode(48 + m)).join(\"\");\n}",
          porque: { es: "`map` convierte cada número y `join(\"\")` los pega sin separador. El registro vacío da el texto vacío, y el servidor lo rechaza por eso mismo.", en: "`map` converts each number and `join(\"\")` glues them with no separator. An empty log gives the empty string, which the server rejects for exactly that reason." },
        },
      ],
    },
  ],
};
