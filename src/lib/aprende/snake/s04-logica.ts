import type { Unidad } from "../tipos";

export const S04: Unidad = {
  id: "logica",
  titulo: { es: "La lógica de Snake", en: "Snake's logic" },
  lecciones: [
    {
      id: "el-cuerpo-de-la-serpiente",
      titulo: { es: "El cuerpo es una cola", en: "The body is a queue" },
      resumen: {
        es: "La serpiente como arreglo de casillas: entra una cabeza por delante, sale la cola por detrás, y nunca da vuelta en U.",
        en: "The snake as an array of cells: a head goes in at the front, the tail comes off the back, and it never U-turns.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Una lista de casillas", en: "A list of cells" },
          texto: {
            es: "La serpiente no es un dibujo: es un **arreglo de casillas** `{ x, y }`, con la cabeza en la posición 0. Al empezar mide tres. El constructor de `snake.js` elige la dirección con más camino libre desde la salida y pone el cuerpo detrás, en sentido contrario:\n\n`this.body = [start, { x: start.x - dir0.x, y: start.y - dir0.y }, { x: start.x - 2 * dir0.x, y: start.y - 2 * dir0.y }];`\n\nPintarla es recorrer el arreglo: la casilla 0 con el verde claro y el resto con el verde normal.",
            en: "The snake isn't a picture: it's an **array of cells** `{ x, y }`, with the head at position 0. It starts three long. The constructor in `snake.js` picks the direction with the most free path from the start and puts the body behind it, the opposite way:\n\n`this.body = [start, { x: start.x - dir0.x, y: start.y - dir0.y }, { x: start.x - 2 * dir0.x, y: start.y - 2 * dir0.y }];`\n\nDrawing it means walking the array: cell 0 in light green and the rest in regular green.",
          },
          programa: {
            codigo: {
              es: `const COLS = 10, ROWS = 5;
const start = { x: 4, y: 2 }, dir0 = { x: 1, y: 0 };   // mirando a la derecha
const body = [start,
  { x: start.x - dir0.x, y: start.y - dir0.y },
  { x: start.x - 2 * dir0.x, y: start.y - 2 * dir0.y }];

function pintar(body) {
  const t = Array.from({ length: ROWS }, () => Array(COLS).fill("."));
  body.forEach((b, i) => { t[b.y][b.x] = i === 0 ? "C" : "s"; });
  for (const fila of t) console.log(fila.join(""));
}

console.log(body);
pintar(body);`,
              en: `const COLS = 10, ROWS = 5;
const start = { x: 4, y: 2 }, dir0 = { x: 1, y: 0 };   // facing right
const body = [start,
  { x: start.x - dir0.x, y: start.y - dir0.y },
  { x: start.x - 2 * dir0.x, y: start.y - 2 * dir0.y }];

function pintar(body) {
  const t = Array.from({ length: ROWS }, () => Array(COLS).fill("."));
  body.forEach((b, i) => { t[b.y][b.x] = i === 0 ? "C" : "s"; });
  for (const fila of t) console.log(fila.join(""));
}

console.log(body);
pintar(body);`,
            },
            notas: {
              es: "La cabeza (`C`) en la columna 4 y el cuerpo a su izquierda, porque mira a la derecha. Cambia `dir0` a `{ x: 0, y: 1 }` (hacia abajo) y el cuerpo queda arriba de la cabeza.",
              en: "The head (`C`) in column 4 and the body to its left, because it faces right. Change `dir0` to `{ x: 0, y: 1 }` (down) and the body ends up above the head.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Moverse: entra por delante, sale por detrás", en: "Moving: in at the front, out at the back" },
          texto: {
            es: "Para avanzar no se mueve cada pedazo. Se calcula la casilla nueva de la cabeza, se **mete al principio** con `unshift` y se **saca el último** con `pop`. Todo lo de en medio se queda donde estaba, y aun así la serpiente parece reptar.\n\n`this.body.unshift(head);`\n`…`\n`this.body.pop();`\n\nEs una **cola de doble extremo** (deque): se mete por un lado y se saca por el otro. En un arreglo, `unshift` cuesta O(n) porque recorre todo para hacer lugar, pero aquí `n` nunca pasa de 16 × 17 = 272 casillas: no se nota.",
            en: "To move forward, not every piece moves. The new head cell is computed, **added at the start** with `unshift`, and the **last one is removed** with `pop`. Everything in between stays where it was, and yet the snake looks like it's slithering.\n\n`this.body.unshift(head);`\n`…`\n`this.body.pop();`\n\nIt's a **double-ended queue** (deque): items go in one end and out the other. In an array, `unshift` costs O(n) because it shifts everything to make room, but here `n` never exceeds 16 × 17 = 272 cells: you can't tell.",
          },
          programa: {
            codigo: {
              es: `const COLS = 10, ROWS = 5;
const body = [{ x: 4, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 2 }];
const pintar = () => {
  const t = Array.from({ length: ROWS }, () => Array(COLS).fill("."));
  body.forEach((b, i) => { t[b.y][b.x] = i === 0 ? "C" : "s"; });
  return t.map(f => f.join("")).join("  ");
};

const pasos = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
console.log("inicio  ", pintar());
for (const dir of pasos) {
  const head = { x: body[0].x + dir.x, y: body[0].y + dir.y };
  body.unshift(head);   // entra la cabeza
  body.pop();           // sale la cola
  console.log("paso    ", pintar());
}
console.log("largo:", body.length);`,
              en: `const COLS = 10, ROWS = 5;
const body = [{ x: 4, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 2 }];
const pintar = () => {
  const t = Array.from({ length: ROWS }, () => Array(COLS).fill("."));
  body.forEach((b, i) => { t[b.y][b.x] = i === 0 ? "C" : "s"; });
  return t.map(f => f.join("")).join("  ");
};

const pasos = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
console.log("start   ", pintar());
for (const dir of pasos) {
  const head = { x: body[0].x + dir.x, y: body[0].y + dir.y };
  body.unshift(head);   // the head goes in
  body.pop();           // the tail comes off
  console.log("step    ", pintar());
}
console.log("length:", body.length);`,
            },
            notas: {
              es: "Cada renglón de la salida es el tablero entero aplanado (sus cinco filas una tras otra). La serpiente avanza, baja dos y da vuelta a la izquierda, y el largo sigue en 3: por cada cabeza que entra sale una cola.",
              en: "Each output line is the whole board flattened (its five rows one after another). The snake moves on, goes down twice and turns left, and the length stays 3: for every head that goes in, a tail comes off.",
            },
          },
          dibujo: { tipo: "lista", valores: ["(5,2)", "(4,2)", "(3,2)"], resalta: [0] },
        },
        {
          tipo: "explica",
          titulo: { es: "Nunca de reversa", en: "Never in reverse" },
          texto: {
            es: "El control se lee **en cada tick**, pero la serpiente sólo se mueve cada `interval` ticks. Por eso hay dos direcciones: `dir`, la que lleva, y `nextDir`, la que pediste para el próximo paso.\n\n`if (mask & BTN.UP && this.dir.y !== 1) this.nextDir = { x: 0, y: -1 };`\n`else if (mask & BTN.DOWN && this.dir.y !== -1) this.nextDir = { x: 0, y: 1 };`\n`…`\n\nCada condición prohíbe la contraria: si vas hacia abajo (`dir.y === 1`), arriba se ignora. Y se compara contra `dir`, la dirección **real**, no contra la pedida. Si vas a la derecha y en el mismo paso aprietas arriba y luego izquierda, la izquierda se ignora: si no, la cabeza se metería en su propio cuello.",
            en: "The controls are read **every tick**, but the snake only moves every `interval` ticks. So there are two directions: `dir`, the one it's going, and `nextDir`, the one you asked for on the next step.\n\n`if (mask & BTN.UP && this.dir.y !== 1) this.nextDir = { x: 0, y: -1 };`\n`else if (mask & BTN.DOWN && this.dir.y !== -1) this.nextDir = { x: 0, y: 1 };`\n`…`\n\nEach condition forbids the opposite: if you're going down (`dir.y === 1`), up is ignored. And it compares against `dir`, the **real** direction, not the requested one. If you're going right and within one step you press up and then left, left is ignored: otherwise the head would run into its own neck.",
          },
          programa: {
            codigo: {
              es: `const BTN = { UP: 1, DOWN: 2, LEFT: 4, RIGHT: 8 };
const s = { dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 } };   // va a la derecha

function leer(mask) {
  if (mask & BTN.UP && s.dir.y !== 1) s.nextDir = { x: 0, y: -1 };
  else if (mask & BTN.DOWN && s.dir.y !== -1) s.nextDir = { x: 0, y: 1 };
  else if (mask & BTN.LEFT && s.dir.x !== 1) s.nextDir = { x: -1, y: 0 };
  else if (mask & BTN.RIGHT && s.dir.x !== -1) s.nextDir = { x: 1, y: 0 };
}

leer(BTN.LEFT);
console.log("izquierda yendo a la derecha:", s.nextDir);
leer(BTN.UP);
console.log("arriba:", s.nextDir);
leer(BTN.LEFT);
console.log("izquierda antes de moverse:", s.nextDir);
s.dir = s.nextDir;   // llega el tick en que se mueve
leer(BTN.LEFT);
console.log("izquierda ya yendo arriba:", s.nextDir);`,
              en: `const BTN = { UP: 1, DOWN: 2, LEFT: 4, RIGHT: 8 };
const s = { dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 } };   // going right

function leer(mask) {
  if (mask & BTN.UP && s.dir.y !== 1) s.nextDir = { x: 0, y: -1 };
  else if (mask & BTN.DOWN && s.dir.y !== -1) s.nextDir = { x: 0, y: 1 };
  else if (mask & BTN.LEFT && s.dir.x !== 1) s.nextDir = { x: -1, y: 0 };
  else if (mask & BTN.RIGHT && s.dir.x !== -1) s.nextDir = { x: 1, y: 0 };
}

leer(BTN.LEFT);
console.log("left while going right:", s.nextDir);
leer(BTN.UP);
console.log("up:", s.nextDir);
leer(BTN.LEFT);
console.log("left before moving:", s.nextDir);
s.dir = s.nextDir;   // the tick where it moves arrives
leer(BTN.LEFT);
console.log("left once going up:", s.nextDir);`,
            },
            notas: {
              es: "La primera izquierda se ignora (sería reversa). Arriba se acepta. La segunda izquierda también se ignora, porque `dir` sigue siendo «derecha» hasta que la serpiente se mueva. Ya moviéndose hacia arriba, la izquierda sí entra.",
              en: "The first left is ignored (it would be reversing). Up is accepted. The second left is also ignored, because `dir` is still \"right\" until the snake moves. Once it's moving up, left is accepted.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "La serpiente mide 5. Se hace `body.unshift(head)` y luego `body.pop()`. ¿Cuánto mide?", en: "The snake is 5 long. `body.unshift(head)` runs, then `body.pop()`. How long is it?" },
          opciones: ["4", "5", "6", "7"],
          correcta: 1,
          porque: { es: "Entra una casilla y sale otra: sigue en 5. Para crecer, se salta el `pop` (lo verás al comer).", en: "One cell in, one cell out: still 5. To grow, the `pop` is skipped (you'll see that when it eats)." },
        },
        {
          tipo: "elige",
          pregunta: { es: "La serpiente va hacia arriba. Aprietas abajo. ¿Qué pasa?", en: "The snake is going up. You press down. What happens?" },
          opciones: [
            { es: "Se da la vuelta y choca consigo misma", en: "It turns around and hits itself" },
            { es: "Nada: la reversa directa se ignora", en: "Nothing: a direct reverse is ignored" },
            { es: "Se detiene", en: "It stops" },
            { es: "Pierde una casilla", en: "It loses a cell" },
          ],
          correcta: 1,
          porque: { es: "`this.dir.y !== -1` es falso cuando vas hacia arriba, así que el botón de abajo no cambia `nextDir`.", en: "`this.dir.y !== -1` is false when you're going up, so the down button doesn't change `nextDir`." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa el paso de avanzar sin comer.", en: "Complete the step of moving without eating." },
          codigo: "const head = { x: this.body[0].x + this.dir.x, y: this.body[0].y + this.dir.y };\nthis.body.___(head);\nthis.body.___();",
          huecos: ["unshift", "pop"],
          banco: ["unshift", "pop", "push", "shift", "splice"],
          porque: { es: "La cabeza va al **principio** (`unshift`) y la cola sale del **final** (`pop`). Con `push` y `shift` la serpiente avanzaría hacia atrás.", en: "The head goes at the **start** (`unshift`) and the tail comes off the **end** (`pop`). With `push` and `shift` the snake would move backwards." },
        },
        {
          tipo: "ordena",
          pregunta: { es: "Ordena lo que hace `update` en un tick en que la serpiente se mueve.", en: "Order what `update` does on a tick where the snake moves." },
          lineas: [
            "if (mask & BTN.UP && this.dir.y !== 1) this.nextDir = { x: 0, y: -1 };",
            "this.tick++;",
            "if (this.tick % this.interval !== 0) return;",
            "this.dir = this.nextDir;",
            "const head = { x: this.body[0].x + this.dir.x, y: this.body[0].y + this.dir.y };",
            "this.body.unshift(head);",
          ],
          porque: { es: "Primero se lee el control (en todos los ticks), luego se cuenta el tick y, si no toca moverse, se sale. Si toca, la dirección pedida se vuelve la real y se calcula y mete la cabeza nueva.", en: "First read the controls (every tick), then count the tick and, if it isn't time to move, leave. If it is, the requested direction becomes the real one and the new head is computed and added." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `mover(cuerpo, dir)`: devuelve un arreglo **nuevo** con la serpiente avanzada una casilla en `dir` (cabeza nueva al principio, sin la última casilla). No cambies el arreglo que recibes.",
            en: "Write `mover(cuerpo, dir)`: return a **new** array with the snake moved one cell in `dir` (new head at the start, last cell dropped). Don't change the array you receive.",
          },
          inicial: {
            es: "function mover(cuerpo, dir) {\n  const cabeza = cuerpo[0];\n  // la casilla nueva, y luego el resto sin el último\n}\n\nconsole.log(mover([{ x: 2, y: 1 }, { x: 1, y: 1 }], { x: 1, y: 0 }));",
            en: "function mover(cuerpo, dir) {\n  const cabeza = cuerpo[0];\n  // the new cell, then the rest without the last one\n}\n\nconsole.log(mover([{ x: 2, y: 1 }, { x: 1, y: 1 }], { x: 1, y: 0 }));",
          },
          pruebas: [
            { llamada: "mover([{ x: 2, y: 1 }, { x: 1, y: 1 }], { x: 1, y: 0 })", espera: "[{\"x\":3,\"y\":1},{\"x\":2,\"y\":1}]" },
            { llamada: "mover([{ x: 4, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 2 }], { x: 0, y: 1 })", espera: "[{\"x\":4,\"y\":3},{\"x\":4,\"y\":2},{\"x\":3,\"y\":2}]" },
            { llamada: "(() => { const c = [{ x: 0, y: 0 }]; mover(c, { x: 1, y: 0 }); return c; })()", espera: "[{\"x\":0,\"y\":0}]" },
          ],
          solucion: "function mover(cuerpo, dir) {\n  const cabeza = cuerpo[0];\n  const nueva = { x: cabeza.x + dir.x, y: cabeza.y + dir.y };\n  return [nueva, ...cuerpo.slice(0, -1)];\n}",
          porque: { es: "`slice(0, -1)` copia todo menos el último, sin tocar el original. Es la versión sin efectos de `unshift` + `pop`: el juego real cambia el arreglo en su lugar para no crear basura en cada paso.", en: "`slice(0, -1)` copies everything but the last item without touching the original. It's the side-effect-free version of `unshift` + `pop`: the real game changes the array in place to avoid creating garbage on every step." },
        },
      ],
    },
    {
      id: "choques-comida-y-puntos",
      titulo: { es: "Choques, comida y puntos", en: "Collisions, food and points" },
      resumen: {
        es: "Cuándo una casilla está libre, por qué la cola no estorba, cómo se crece, cuánto vale cada fruta, el hambre y el bicho de premio.",
        en: "When a cell is free, why the tail doesn't get in the way, how it grows, what each fruit is worth, hunger and the bonus bug.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "¿Está libre?", en: "Is it free?" },
          texto: {
            es: "Antes de meter la cabeza nueva, Snake pregunta si esa casilla está libre. Esto es `isFree`, completa:\n\n`if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return false;`\n`if (this.walls[y][x]) return false;`\n`return !this.body.some(b => b.x === x && b.y === y);`\n\nFuera del tablero, muro o cuerpo: perdiste. Pero hay una excepción fina. La cola se va a mover **en el mismo paso**, así que meter la cabeza donde ahora está la cola es válido… siempre que no estés comiendo, porque al comer la cola se queda:\n\n`const hitsTail = !eating && head.x === tail.x && head.y === tail.y;`",
            en: "Before adding the new head, Snake asks whether that cell is free. This is `isFree`, in full:\n\n`if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return false;`\n`if (this.walls[y][x]) return false;`\n`return !this.body.some(b => b.x === x && b.y === y);`\n\nOff the board, a wall or the body: game over. But there's a subtle exception. The tail is going to move **on the same step**, so putting the head where the tail is now is fine… as long as you're not eating, because when you eat the tail stays put:\n\n`const hitsTail = !eating && head.x === tail.x && head.y === tail.y;`",
          },
          dibujo: {
            tipo: "rejilla",
            filas: ["xxxxxx", "x.sc.x", "x.ss.x", "x....x", "xxxxxx"],
            leyenda: {
              x: { es: "muro", en: "wall" },
              c: { es: "cabeza", en: "head" },
              s: { es: "cuerpo (la de la izquierda arriba es la cola)", en: "body (the top-left one is the tail)" },
            },
          },
          programa: {
            codigo: {
              es: `const COLS = 6, ROWS = 5;
const walls = ["xxxxxx", "x....x", "x....x", "x....x", "xxxxxx"].map(f => [...f].map(c => c === "x"));
// cabeza en (3,1), luego (3,2), (2,2) y la cola en (2,1): un cuadrito
const body = [{ x: 3, y: 1 }, { x: 3, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 1 }];

function isFree(x, y) {
  if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return false;
  if (walls[y][x]) return false;
  return !body.some(b => b.x === x && b.y === y);
}

console.log("derecha (4,1):", isFree(4, 1));
console.log("arriba (3,0), muro:", isFree(3, 0));
console.log("fuera (9,9):", isFree(9, 9));
const tail = body[body.length - 1];
const head = { x: 2, y: 1 };   // izquierda: donde está la cola
console.log("izquierda (2,1):", isFree(head.x, head.y), "pero ¿es la cola?", head.x === tail.x && head.y === tail.y);`,
              en: `const COLS = 6, ROWS = 5;
const walls = ["xxxxxx", "x....x", "x....x", "x....x", "xxxxxx"].map(f => [...f].map(c => c === "x"));
// head at (3,1), then (3,2), (2,2) and the tail at (2,1): a little square
const body = [{ x: 3, y: 1 }, { x: 3, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 1 }];

function isFree(x, y) {
  if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return false;
  if (walls[y][x]) return false;
  return !body.some(b => b.x === x && b.y === y);
}

console.log("right (4,1):", isFree(4, 1));
console.log("up (3,0), wall:", isFree(3, 0));
console.log("outside (9,9):", isFree(9, 9));
const tail = body[body.length - 1];
const head = { x: 2, y: 1 };   // left: where the tail is
console.log("left (2,1):", isFree(head.x, head.y), "but is it the tail?", head.x === tail.x && head.y === tail.y);`,
            },
            notas: {
              es: "La casilla de la izquierda no está libre (es cuerpo), pero es la cola: Snake deja pasar. Sin esa excepción, una serpiente de cuatro no podría dar vueltas en un cuadrito de 2 × 2.",
              en: "The left cell isn't free (it's body), but it's the tail: Snake lets it through. Without that exception, a four-cell snake couldn't loop around a 2 × 2 square.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Comer: crecer y acelerar", en: "Eating: growing and speeding up" },
          texto: {
            es: "Comer es **no hacer `pop`**: entra la cabeza y la cola se queda, así que la serpiente mide uno más. Además, en ese mismo paso:\n\n`this.score += 10 + Math.max(0, 8 - this.interval) * 5; // más rápido = más puntos`\n`this.interval = Math.max(3, 8 - Math.floor(this.eaten / 4));`\n`this.events.push('eat');`\n\nCada fruta vale 10, más 5 por cada tick que la serpiente ya va más rápido que al principio. Ir rápido es más difícil, y paga más. Y si al buscar lugar para la fruta nueva no queda ninguno libre, llenaste el tablero: la partida termina con 500 de premio.",
            en: "Eating means **not doing the `pop`**: the head goes in and the tail stays, so the snake is one longer. Also, on that same step:\n\n`this.score += 10 + Math.max(0, 8 - this.interval) * 5; // faster = more points`\n`this.interval = Math.max(3, 8 - Math.floor(this.eaten / 4));`\n`this.events.push('eat');`\n\nEach fruit is worth 10, plus 5 for every tick the snake is already faster than at the start. Going fast is harder, and it pays more. And if there's no free cell left for the new fruit, you've filled the board: the game ends with a 500 bonus.",
          },
          programa: {
            codigo: {
              es: `let interval = 8, eaten = 0, score = 0;
for (let fruta = 1; fruta <= 24; fruta++) {
  eaten++;
  const puntos = 10 + Math.max(0, 8 - interval) * 5;
  score += puntos;
  if (fruta % 4 === 0) console.log("fruta", fruta, "vale", puntos, "| total", score, "| se mueve cada", interval);
  interval = Math.max(3, 8 - Math.floor(eaten / 4));
}`,
              en: `let interval = 8, eaten = 0, score = 0;
for (let fruta = 1; fruta <= 24; fruta++) {
  eaten++;
  const puntos = 10 + Math.max(0, 8 - interval) * 5;
  score += puntos;
  if (fruta % 4 === 0) console.log("fruit", fruta, "worth", puntos, "| total", score, "| moves every", interval);
  interval = Math.max(3, 8 - Math.floor(eaten / 4));
}`,
            },
            notas: {
              es: "Las primeras cuatro frutas valen 10; de la 21 en adelante, 35 cada una. Fíjate en el orden del código real: los puntos se calculan con el intervalo de **antes** de comer, y luego se actualiza.",
              en: "The first four fruits are worth 10; from 21 on, 35 each. Note the order in the real code: points use the interval from **before** eating, and then it's updated.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Dónde sale la fruta, el hambre y el bicho", en: "Where fruit appears, hunger and the bug" },
          texto: {
            es: "La fruta sale en una casilla libre al azar: `randomEmpty` junta **todas** las casillas libres en un arreglo y elige una con el generador de la semilla del día (`this.rng.pick(free)`). Como el generador es el mismo en el teléfono y en el servidor, la fruta sale en el mismo lugar en los dos.\n\nDos reglas más, sacadas de Nokia y de una revisión de partidas:\n\n- **Hambre**: `HAMBRE = 30 * 30`, 30 segundos de ticks. Si no comes en ese tiempo, pierdes. Un comentario del código cuenta que sin ella, dar vueltas en un cuadrito no se acababa nunca.\n- **Bicho de premio**: cada 5 frutas aparece lejos de la cabeza y dura `BICHO_DURA = 150` ticks (5 segundos). Vale `50 + 5 * Math.ceil(vida / 30)`: de 75 si vas por él al instante a 55 en el último segundo. No alarga ni acelera; es puntaje puro.",
            en: "The fruit appears on a random free cell: `randomEmpty` collects **all** the free cells in an array and picks one with the day's seeded generator (`this.rng.pick(free)`). Since the generator is the same on the phone and on the server, the fruit appears in the same place on both.\n\nTwo more rules, taken from Nokia and from a review of played games:\n\n- **Hunger**: `HAMBRE = 30 * 30`, 30 seconds' worth of ticks. If you don't eat within that time, you lose. A comment in the code explains that without it, circling a tiny square never ended.\n- **Bonus bug**: every 5 fruits it appears far from the head and lasts `BICHO_DURA = 150` ticks (5 seconds). It's worth `50 + 5 * Math.ceil(vida / 30)`: 75 if you go for it immediately, down to 55 in the last second. It doesn't make you longer or faster; it's pure score.",
          },
          programa: {
            codigo: {
              es: `// El generador real de core/rng.js
function mulberry32(seed) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return { pick: arr => arr[Math.floor(next() * arr.length)] };
}

const libres = [];
for (let y = 1; y < 4; y++) for (let x = 1; x < 5; x++) libres.push({ x, y });
const rngTelefono = mulberry32(2026), rngServidor = mulberry32(2026);
console.log("libres:", libres.length);
console.log("teléfono:", rngTelefono.pick(libres), "servidor:", rngServidor.pick(libres));

for (const vida of [150, 120, 60, 31, 30, 1])
  console.log("bicho con vida", vida, "vale", 50 + 5 * Math.ceil(vida / 30));`,
              en: `// The real generator from core/rng.js
function mulberry32(seed) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return { pick: arr => arr[Math.floor(next() * arr.length)] };
}

const libres = [];
for (let y = 1; y < 4; y++) for (let x = 1; x < 5; x++) libres.push({ x, y });
const rngTelefono = mulberry32(2026), rngServidor = mulberry32(2026);
console.log("free cells:", libres.length);
console.log("phone:", rngTelefono.pick(libres), "server:", rngServidor.pick(libres));

for (const vida of [150, 120, 60, 31, 30, 1])
  console.log("bug with life", vida, "worth", 50 + 5 * Math.ceil(vida / 30));`,
            },
            notas: {
              es: "Con la misma semilla, el teléfono y el servidor eligen la misma casilla. Cambia una de las dos semillas y deja de coincidir: por eso la semilla del día la decide el servidor, no tu teléfono.",
              en: "With the same seed, the phone and the server pick the same cell. Change one of the seeds and they stop matching: that's why the day's seed is decided by the server, not your phone.",
            },
          },
          enlaces: [{ url: "https://dailychallenge.click/juegos/snake", texto: { es: "Prueba la regla del hambre jugando", en: "Try the hunger rule by playing" } }],
        },
        {
          tipo: "elige",
          pregunta: { es: "La cabeza va a entrar en la casilla donde ahora está la cola, y en ese paso **no** come. ¿Qué pasa?", en: "The head is about to enter the cell where the tail is now, and on that step it does **not** eat. What happens?" },
          opciones: [
            { es: "Choca y pierde", en: "It crashes and loses" },
            { es: "Pasa: la cola se va en el mismo paso", en: "It's fine: the tail moves away on the same step" },
            { es: "Se come la cola y crece", en: "It eats its tail and grows" },
            { es: "Se queda quieta un paso", en: "It stays still for a step" },
          ],
          correcta: 1,
          porque: { es: "Es el caso de `hitsTail`: como la cola sale con el `pop` de ese mismo paso, la casilla queda libre a tiempo. Si estuviera comiendo, la cola no se movería y sí sería choque.", en: "That's the `hitsTail` case: since the tail leaves with that same step's `pop`, the cell frees up in time. If it were eating, the tail wouldn't move and it would be a crash." },
        },
        {
          tipo: "elige",
          pregunta: { es: "La serpiente se mueve cada 6 ticks y se come una fruta. ¿Cuántos puntos gana?", en: "The snake moves every 6 ticks and eats a fruit. How many points does it get?" },
          opciones: ["10", "15", "20", "30"],
          correcta: 2,
          porque: { es: "`10 + (8 − 6) × 5 = 20`. Dos ticks más rápida que al principio, 10 puntos extra.", en: "`10 + (8 − 6) × 5 = 20`. Two ticks faster than at the start, 10 extra points." },
        },
        {
          tipo: "elige",
          pregunta: { es: "Te comes el bicho de premio en cuanto aparece (vida 150). ¿Cuánto vale?", en: "You eat the bonus bug right when it appears (life 150). What's it worth?" },
          opciones: ["50", "55", "75", "150"],
          correcta: 2,
          porque: { es: "`50 + 5 × ⌈150 / 30⌉ = 50 + 25 = 75`. Cada segundo que tardas le quita 5.", en: "`50 + 5 × ⌈150 / 30⌉ = 50 + 25 = 75`. Every second you take knocks off 5." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `libre(x, y, muros, cuerpo)` como `isFree`: `muros` es un arreglo de textos donde `'x'` es muro, y `cuerpo` un arreglo de `{ x, y }`. Fuera del tablero también cuenta como ocupado.",
            en: "Write `libre(x, y, muros, cuerpo)` like `isFree`: `muros` is an array of strings where `'x'` is a wall, and `cuerpo` is an array of `{ x, y }`. Off the board also counts as taken.",
          },
          inicial: {
            es: "function libre(x, y, muros, cuerpo) {\n  // 1. ¿dentro del tablero?  2. ¿muro?  3. ¿cuerpo?\n}\n\nconsole.log(libre(1, 1, [\"xxx\", \"x.x\", \"xxx\"], []));",
            en: "function libre(x, y, muros, cuerpo) {\n  // 1. inside the board?  2. wall?  3. body?\n}\n\nconsole.log(libre(1, 1, [\"xxx\", \"x.x\", \"xxx\"], []));",
          },
          pruebas: [
            { llamada: "libre(1, 1, [\"xxx\", \"x.x\", \"xxx\"], [])", espera: "true" },
            { llamada: "libre(0, 1, [\"xxx\", \"x.x\", \"xxx\"], [])", espera: "false" },
            { llamada: "libre(1, 1, [\"...\", \"...\"], [{ x: 1, y: 1 }])", espera: "false" },
            { llamada: "libre(3, 0, [\"...\", \"...\"], [])", espera: "false" },
            { llamada: "libre(0, -1, [\"...\"], [])", espera: "false" },
          ],
          solucion: "function libre(x, y, muros, cuerpo) {\n  if (y < 0 || y >= muros.length || x < 0 || x >= muros[0].length) return false;\n  if (muros[y][x] === \"x\") return false;\n  return !cuerpo.some(b => b.x === x && b.y === y);\n}",
          porque: { es: "El orden importa: primero los límites, porque `muros[-1]` no existe y `muros[-1][x]` truena. Después el muro y al final el cuerpo, que es lo más caro de revisar.", en: "Order matters: bounds first, because `muros[-1]` doesn't exist and `muros[-1][x]` throws. Then the wall, and the body last, since it's the most expensive check." },
        },
      ],
    },
    {
      id: "mapas-de-texto",
      titulo: { es: "Mapas de texto y una arena entera", en: "Text maps and an unbroken arena" },
      resumen: {
        es: "De un dibujo en texto a una cuadrícula, los muros extra de cada día y el recorrido que evita partir la arena en dos.",
        en: "From a text drawing to a grid, each day's extra walls, and the search that keeps the arena from splitting in two.",
      },
      retos: ["number-of-islands"],
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Del texto a la cuadrícula", en: "From text to grid" },
          texto: {
            es: "Cada nivel es un archivo como `snake_03.txt`, «Bordes rotos»: los huecos en la orilla no son salidas, porque salir del tablero también es perder. `core/map.js` lo convierte en una cuadrícula de `true`/`false` con `parseMap`:\n\n- Los renglones que empiezan con `#` son comentarios y se saltan.\n- `x` es muro (`true`); `.` o espacio, vacío.\n- La `p` marca la salida, y se guarda aparte en `start`.\n\nLo que devuelve, `grid[y][x]`, es lo que `isFree` consulta en cada paso.",
            en: "Each level is a file like `snake_03.txt`, \"Broken edges\": the gaps on the border aren't exits, because leaving the board also loses. `core/map.js` turns it into a grid of `true`/`false` with `parseMap`:\n\n- Lines starting with `#` are comments and get skipped.\n- `x` is a wall (`true`); `.` or a space, empty.\n- The `p` marks the start, and is kept separately in `start`.\n\nWhat it returns, `grid[y][x]`, is what `isFree` checks on every step.",
          },
          dibujo: {
            tipo: "rejilla",
            filas: [
              "xxxxx......xxxxx",
              "x..............x",
              "x..............x",
              "x..............x",
              "x..............x",
              "................",
              "................",
              "x..............x",
              "x.....c........x",
              "x..............x",
              "................",
              "................",
              "x..............x",
              "x..............x",
              "x..............x",
              "x..............x",
              "xxxxx......xxxxx",
            ],
            leyenda: {
              x: { es: "muro", en: "wall" },
              c: { es: "salida (la p del archivo)", en: "start (the file's p)" },
            },
          },
          programa: {
            codigo: {
              es: `// parseMap, igual que en core/map.js
function parseMap(text, cols, rows) {
  const lines = text.split("\\n").filter(l => !l.startsWith("#"));
  const grid = [];
  let start = null;
  for (let y = 0; y < rows; y++) {
    const line = lines[y] ?? "";
    const row = [];
    for (let x = 0; x < cols; x++) {
      const c = line[x] ?? " ";
      row.push(c === "x" || c === "X");
      if (c === "p" || c === "P") start = { x, y };
    }
    grid.push(row);
  }
  return { grid, start, cols, rows };
}

const texto = "# Un mapa chiquito\\nxxxxxx\\nx..p.x\\nx.x..x\\nxxxxxx";
const m = parseMap(texto, 6, 4);
console.log("salida:", m.start);
for (const fila of m.grid) console.log(fila.map(b => (b ? "#" : ".")).join(""));
console.log("¿muro en (2,2)?", m.grid[2][2]);`,
              en: `// parseMap, just like in core/map.js
function parseMap(text, cols, rows) {
  const lines = text.split("\\n").filter(l => !l.startsWith("#"));
  const grid = [];
  let start = null;
  for (let y = 0; y < rows; y++) {
    const line = lines[y] ?? "";
    const row = [];
    for (let x = 0; x < cols; x++) {
      const c = line[x] ?? " ";
      row.push(c === "x" || c === "X");
      if (c === "p" || c === "P") start = { x, y };
    }
    grid.push(row);
  }
  return { grid, start, cols, rows };
}

const texto = "# A tiny map\\nxxxxxx\\nx..p.x\\nx.x..x\\nxxxxxx";
const m = parseMap(texto, 6, 4);
console.log("start:", m.start);
for (const fila of m.grid) console.log(fila.map(b => (b ? "#" : ".")).join(""));
console.log("wall at (2,2)?", m.grid[2][2]);`,
            },
            notas: {
              es: "La `p` se volvió `{ x: 3, y: 1 }` y en la cuadrícula es piso, no muro. El comentario de la primera línea no ocupa renglón. Si a un renglón le faltan letras, `?? \" \"` las rellena de vacío: un editor que borra espacios al final no rompe el mapa.",
              en: "The `p` became `{ x: 3, y: 1 }` and in the grid it's floor, not wall. The comment on the first line doesn't take up a row. If a row is short, `?? \" \"` fills it with empty: an editor that trims trailing spaces doesn't break the map.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Muros extra que no parten la arena", en: "Extra walls that don't split the arena" },
          texto: {
            es: "Para que el mismo mapa no se juegue igual dos veces, el calendario le pone a Snake muros extra cada día (`opts.param`, 4 si no dice nada). Cada uno sale en una casilla libre al azar, a más de 5 casillas de la salida para no morir en el primer paso. Pero un muro mal puesto puede **partir la arena en dos**: si la fruta luego sale del otro lado, nunca la alcanzarías.\n\nEl constructor lo resuelve probando: pone el muro, pregunta `arenaEntera(start)` y, si la arena quedó partida, lo quita y sortea otra casilla (hasta 12 intentos por muro):\n\n`this.walls[c.y][c.x] = true;`\n`if (this.arenaEntera(start)) break;`\n`this.walls[c.y][c.x] = false;`",
            en: "So the same map never plays the same twice, the calendar gives Snake extra walls each day (`opts.param`, 4 if it says nothing). Each one goes on a random free cell, more than 5 cells from the start so you don't die on the first step. But a badly placed wall can **split the arena in two**: if the fruit then appeared on the other side, you could never reach it.\n\nThe constructor solves it by trying: it places the wall, asks `arenaEntera(start)` and, if the arena got split, removes it and draws another cell (up to 12 tries per wall):\n\n`this.walls[c.y][c.x] = true;`\n`if (this.arenaEntera(start)) break;`\n`this.walls[c.y][c.x] = false;`",
          },
          dibujo: {
            tipo: "rejilla",
            filas: ["xxxxxxxxx", "x...x...x", "x.c.m...x", "x...x...x", "xxxxxxxxx"],
            leyenda: {
              x: { es: "muro", en: "wall" },
              c: { es: "salida", en: "start" },
              m: { es: "un muro extra aquí cerraría el único paso", en: "an extra wall here would close the only passage" },
            },
          },
          programa: {
            codigo: {
              es: `const mapa = ["xxxxxxxxx", "x...x...x", "x...m...x", "x...x...x", "xxxxxxxxx"];
const walls = mapa.map(f => [...f].map(c => c === "x"));
const ROWS = walls.length, COLS = walls[0].length;

function cuantasAlcanzo(start) {
  const visto = new Set([start.y * COLS + start.x]), pila = [start];
  while (pila.length) {
    const { x, y } = pila.pop();
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
      const nx = x + dx, ny = y + dy, k = ny * COLS + nx;
      if (walls[ny][nx] || visto.has(k)) continue;
      visto.add(k); pila.push({ x: nx, y: ny });
    }
  }
  return visto.size;
}

const libres = () => walls.flat().filter(w => !w).length;
const start = { x: 2, y: 2 };
console.log("sin el muro extra:", cuantasAlcanzo(start), "de", libres());
walls[2][4] = true;   // el muro extra, justo en el paso
console.log("con el muro extra:", cuantasAlcanzo(start), "de", libres());`,
              en: `const mapa = ["xxxxxxxxx", "x...x...x", "x...m...x", "x...x...x", "xxxxxxxxx"];
const walls = mapa.map(f => [...f].map(c => c === "x"));
const ROWS = walls.length, COLS = walls[0].length;

function cuantasAlcanzo(start) {
  const visto = new Set([start.y * COLS + start.x]), pila = [start];
  while (pila.length) {
    const { x, y } = pila.pop();
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
      const nx = x + dx, ny = y + dy, k = ny * COLS + nx;
      if (walls[ny][nx] || visto.has(k)) continue;
      visto.add(k); pila.push({ x: nx, y: ny });
    }
  }
  return visto.size;
}

const libres = () => walls.flat().filter(w => !w).length;
const start = { x: 2, y: 2 };
console.log("without the extra wall:", cuantasAlcanzo(start), "of", libres());
walls[2][4] = true;   // the extra wall, right in the passage
console.log("with the extra wall:", cuantasAlcanzo(start), "of", libres());`,
            },
            notas: {
              es: "Sin el muro se llega a las 19 casillas libres; con él, a 9 de 18. Alcanzables y libres ya no coinciden: la arena quedó partida y ese muro se descartaría. (Aquí no se revisan las orillas porque el mapa está cerrado con muros; el código real sí las revisa.)",
              en: "Without the wall all 19 free cells are reachable; with it, 9 of 18. Reachable and free no longer match: the arena is split and that wall would be thrown out. (Bounds aren't checked here because the map is walled in; the real code does check them.)",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "arenaEntera: un recorrido de grafo", en: "arenaEntera: a graph search" },
          texto: {
            es: "La pregunta «¿llego a todas las casillas libres?» es un **recorrido de grafo**: cada casilla es un nodo y cada vecina libre, una arista. `arenaEntera` cuenta las libres, luego sale de la salida visitando vecinas y al final compara:\n\n`return visto.size === libres;`\n\nUn detalle del código real: la lista de pendientes se llama `cola`, pero se saca con `cola.pop()`, que toma **el último**. Eso la vuelve una **pila**, y el recorrido es en profundidad (DFS), no por niveles (BFS). Para esta pregunta da igual: los dos visitan exactamente las mismas casillas, sólo que en otro orden. Es el mismo algoritmo que «Number of Islands», el reto de las islas.",
            en: "The question \"can I reach every free cell?\" is a **graph search**: each cell is a node and each free neighbor, an edge. `arenaEntera` counts the free cells, then starts from the start cell visiting neighbors, and finally compares:\n\n`return visto.size === libres;`\n\nA detail of the real code: the pending list is called `cola` (queue), but it's taken with `cola.pop()`, which takes **the last one**. That makes it a **stack**, and the search is depth-first (DFS), not level by level (BFS). For this question it doesn't matter: both visit exactly the same cells, just in a different order. It's the same algorithm as \"Number of Islands\", the islands challenge.",
          },
          programa: {
            codigo: {
              es: `// La búsqueda de arenaEntera, anotando el orden de visita
const mapa = ["xxxxxx", "x....x", "x.xx.x", "x....x", "xxxxxx"];
const walls = mapa.map(f => [...f].map(c => c === "x"));
const COLS = 6, ROWS = 5;

function recorrer(start, conPop) {
  const visto = new Set([start.y * COLS + start.x]), pendientes = [start], orden = [];
  while (pendientes.length) {
    const { x, y } = conPop ? pendientes.pop() : pendientes.shift();
    orden.push(x + "," + y);
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
      const nx = x + dx, ny = y + dy, k = ny * COLS + nx;
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS || walls[ny][nx] || visto.has(k)) continue;
      visto.add(k); pendientes.push({ x: nx, y: ny });
    }
  }
  return orden;
}

console.log("pop   (pila, DFS):", recorrer({ x: 1, y: 1 }, true).join(" "));
console.log("shift (cola, BFS):", recorrer({ x: 1, y: 1 }, false).join(" "));`,
              en: `// arenaEntera's search, writing down the visiting order
const mapa = ["xxxxxx", "x....x", "x.xx.x", "x....x", "xxxxxx"];
const walls = mapa.map(f => [...f].map(c => c === "x"));
const COLS = 6, ROWS = 5;

function recorrer(start, conPop) {
  const visto = new Set([start.y * COLS + start.x]), pendientes = [start], orden = [];
  while (pendientes.length) {
    const { x, y } = conPop ? pendientes.pop() : pendientes.shift();
    orden.push(x + "," + y);
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
      const nx = x + dx, ny = y + dy, k = ny * COLS + nx;
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS || walls[ny][nx] || visto.has(k)) continue;
      visto.add(k); pendientes.push({ x: nx, y: ny });
    }
  }
  return orden;
}

console.log("pop   (stack, DFS):", recorrer({ x: 1, y: 1 }, true).join(" "));
console.log("shift (queue, BFS):", recorrer({ x: 1, y: 1 }, false).join(" "));`,
            },
            notas: {
              es: "Las dos listas tienen las mismas 10 casillas en distinto orden. Con `pop` se va hasta el fondo de un lado antes de volver; con `shift` se expande parejo, como una mancha. Para contar, cualquiera; para el camino más corto, sólo BFS (eso viene en la unidad de grafos).",
              en: "Both lists have the same 10 cells in a different order. With `pop` it goes all the way down one side before coming back; with `shift` it spreads evenly, like a stain. For counting, either one; for the shortest path, only BFS (that's in the graphs unit).",
            },
          },
          enlaces: [{ url: "https://es.wikipedia.org/wiki/Algoritmo_de_relleno_por_difusi%C3%B3n", texto: { es: "Relleno por difusión (flood fill) en Wikipedia", en: "Flood fill on Wikipedia (Spanish)" } }],
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué hace `parseMap` con la letra `p` del mapa?", en: "What does `parseMap` do with the letter `p` in the map?" },
          opciones: [
            { es: "La toma como muro", en: "Treats it as a wall" },
            { es: "Guarda su posición en `start` y la deja como piso", en: "Saves its position in `start` and leaves it as floor" },
            { es: "Pone ahí la primera fruta", en: "Puts the first fruit there" },
            { es: "La ignora como si fuera comentario", en: "Ignores it like a comment" },
          ],
          correcta: 1,
          porque: { es: "Sólo `x` es muro. La `p` guarda la salida en `start` (`{ x, y }`) y en la cuadrícula queda `false`, piso.", en: "Only `x` is a wall. The `p` stores the start in `start` (`{ x, y }`) and in the grid it stays `false`, floor." },
        },
        {
          tipo: "elige",
          pregunta: { es: "`arenaEntera` saca las casillas pendientes con `cola.pop()`. ¿Qué recorrido es?", en: "`arenaEntera` takes pending cells with `cola.pop()`. What kind of search is it?" },
          opciones: [
            { es: "Por niveles (BFS), porque se llama cola", en: "Level by level (BFS), because it's called a queue" },
            { es: "En profundidad (DFS): `pop` saca el último, como una pila", en: "Depth-first (DFS): `pop` takes the last one, like a stack" },
            { es: "Búsqueda binaria", en: "Binary search" },
            { es: "Dijkstra", en: "Dijkstra" },
          ],
          correcta: 1,
          porque: { es: "Lo que decide es cómo se saca, no el nombre de la variable. Con `pop` es pila y DFS; con `shift` sería cola y BFS. Para saber si se llega a todo, sirven los dos.", en: "What decides it is how items are taken out, not the variable's name. With `pop` it's a stack and DFS; with `shift` it'd be a queue and BFS. To check whether everything is reachable, both work." },
        },
        {
          tipo: "ordena",
          pregunta: { es: "Ordena el ciclo de la búsqueda.", en: "Put the search loop in order." },
          lineas: [
            "const visto = new Set([inicio]), pila = [inicio];",
            "while (pila.length) {",
            "  const actual = pila.pop();",
            "  for (const vecina of vecinasLibres(actual)) {",
            "    if (visto.has(vecina)) continue;",
            "    visto.add(vecina); pila.push(vecina);",
            "  }",
            "}",
          ],
          porque: { es: "Se marca como vista **al meterla** a la pila, no al sacarla: así ninguna casilla entra dos veces. Al terminar, `visto` tiene todo lo alcanzable.", en: "A cell is marked as seen **when it's pushed**, not when it's popped: that way no cell goes in twice. At the end, `visto` holds everything reachable." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `alcanzables(filas, inicio)`: `filas` es un mapa de textos con `'x'` como muro e `inicio` es `{ x, y }`. Devuelve cuántas casillas libres se alcanzan desde `inicio` moviéndose arriba, abajo, izquierda y derecha (contando la de inicio). Revisa las orillas: un mapa puede no estar cerrado.",
            en: "Write `alcanzables(filas, inicio)`: `filas` is a map of strings with `'x'` as wall and `inicio` is `{ x, y }`. Return how many free cells can be reached from `inicio` moving up, down, left and right (counting the starting one). Check the borders: a map may not be closed.",
          },
          inicial: {
            es: "function alcanzables(filas, inicio) {\n  const visto = new Set([inicio.x + \",\" + inicio.y]);\n  const pila = [inicio];\n  // mientras haya pendientes: saca una y mete sus vecinas libres no vistas\n  return 0;\n}\n\nconsole.log(alcanzables([\"...\", \".x.\", \"...\"], { x: 0, y: 0 }));",
            en: "function alcanzables(filas, inicio) {\n  const visto = new Set([inicio.x + \",\" + inicio.y]);\n  const pila = [inicio];\n  // while there are pending cells: take one and push its unseen free neighbors\n  return 0;\n}\n\nconsole.log(alcanzables([\"...\", \".x.\", \"...\"], { x: 0, y: 0 }));",
          },
          pruebas: [
            { llamada: "alcanzables([\"...\", \".x.\", \"...\"], { x: 0, y: 0 })", espera: "8" },
            { llamada: "alcanzables([\"..x..\", \"..x..\"], { x: 0, y: 0 })", espera: "4" },
            { llamada: "alcanzables([\"xxx\", \"x.x\", \"xxx\"], { x: 1, y: 1 })", espera: "1" },
            { llamada: "alcanzables([\".\"], { x: 0, y: 0 })", espera: "1" },
          ],
          solucion: "function alcanzables(filas, inicio) {\n  const visto = new Set([inicio.x + \",\" + inicio.y]);\n  const pila = [inicio];\n  while (pila.length) {\n    const { x, y } = pila.pop();\n    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {\n      const nx = x + dx, ny = y + dy, k = nx + \",\" + ny;\n      if (ny < 0 || ny >= filas.length || nx < 0 || nx >= filas[ny].length) continue;\n      if (filas[ny][nx] === \"x\" || visto.has(k)) continue;\n      visto.add(k);\n      pila.push({ x: nx, y: ny });\n    }\n  }\n  return visto.size;\n}",
          porque: { es: "Es `arenaEntera` sin la comparación final. La segunda prueba es una arena partida: desde la izquierda sólo se llega a 4 de las 8 libres, y eso es lo que el constructor de Snake no deja pasar.", en: "It's `arenaEntera` without the final comparison. The second test is a split arena: from the left you only reach 4 of the 8 free cells, and that's exactly what Snake's constructor refuses to allow." },
        },
      ],
    },
  ],
};
