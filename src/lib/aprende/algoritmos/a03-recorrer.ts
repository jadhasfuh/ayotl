import type { T, Unidad } from "../tipos";

/**
 * El código de la BFS es el mismo de su Short de «Algoritmos en pixel»
 * (tools/comerciales/algoritmos/laberinto.py, CODIGO): si cambia uno, cambia
 * el otro. El laberinto también es el del vídeo: arriba una serpiente de 20
 * pasos, abajo un pasillo de 12 con bolsas sin salida.
 */
const BFS = `function bfs(ini, fin) {
  const de = { [ini]: ini };
  const cola = [ini]; let cabeza = 0;
  while (cabeza < cola.length) {
    const c = cola[cabeza++];
    if (c === fin) break;
    for (const v of vecinos(c)) {
      if (v in de) continue;
      de[v] = c; cola.push(v);
    }
  }
  const camino = [fin];
  while (camino[0] !== ini)
    camino.unshift(de[camino[0]]);
  return camino;
}`;

const LAB = `const lab = [
  "###########",
  "#...#...#.#",
  "#.#.#.#.#.#",
  "#.#...#...#",
  "..#######..",
  "#.........#",
  "#.#.###.#.#",
  "#.#...#.#.#",
  "###########",
];`;

const VECINOS: T = {
  es: `// las abiertas de al lado de c ("fila,columna"),
// en este orden: arriba, derecha, abajo, izquierda
function vecinos(c) {
  const [y, x] = c.split(",").map(Number);
  return [[y - 1, x], [y, x + 1], [y + 1, x], [y, x - 1]]
    .filter(([f, k]) => lab[f]?.[k] === ".")
    .map(([f, k]) => f + "," + k);
}`,
  en: `// the open cells next to c ("row,column"),
// in this order: up, right, down, left
function vecinos(c) {
  const [y, x] = c.split(",").map(Number);
  return [[y - 1, x], [y, x + 1], [y + 1, x], [y, x - 1]]
    .filter(([f, k]) => lab[f]?.[k] === ".")
    .map(([f, k]) => f + "," + k);
}`,
};

/** El laberinto, el pasillo, el camino de la BFS y el de la DFS, para el dibujo de rejilla. */
const LEYENDA = { x: { es: "muro", en: "wall" }, h: { es: "entrada", en: "entrance" }, f: { es: "salida", en: "exit" } };
const DIBUJO = ["xxxxxxxxxxx", "x...x...x.x", "x.x.x.x.x.x", "x.x...x...x", "h.xxxxxxx.f", "x.........x", "x.x.xxx.x.x", "x.x...x.x.x", "xxxxxxxxxxx"];
const DIBUJO_BFS = ["xxxxxxxxxxx", "x...x...x.x", "x.x.x.x.x.x", "x.x...x...x", "hbxxxxxxxbf", "xbbbbbbbbbx", "x.x.xxx.x.x", "x.x...x.x.x", "xxxxxxxxxxx"];
const DIBUJO_DFS = ["xxxxxxxxxxx", "xmmmxmmmx.x", "xmxmxmxmx.x", "xmxmmmxmmmx", "hmxxxxxxxmf", "x.........x", "x.x.xxx.x.x", "x.x...x.x.x", "xxxxxxxxxxx"];

const PROGRAMA_BFS = (idioma: "es" | "en") => `${LAB}\n\n${VECINOS[idioma]}\n\n${BFS}`;

/**
 * El código del relleno es el de su Short de «Algoritmos en pixel» (tools/comerciales/algoritmos/relleno.py, CODIGO):
 * si cambia uno, cambia el otro. La casita también es la del vídeo: 19 casillas de pared, 9 de techo, 73 de cielo y
 * una puerta de 2 que nadie toca.
 */
const RELLENO = `function rellenar(f, c, nuevo) {
  const viejo = mapa[f][c];
  if (viejo === nuevo) return;
  const pila = [[f, c]];
  mapa[f][c] = nuevo;
  while (pila.length > 0) {
    const [y, x] = pila.pop();
    for (const [i, j] of lados(y, x))
      if (mapa[i]?.[j] === viejo) {
        mapa[i][j] = nuevo;
        pila.push([i, j]);
      }
  }
}`;

const CASA = [".............", "......x......", ".....x.x.....", "....x...x....", "...x.....x...", "..xxxxxxxxx..", "..x.......x..", "..x.xxx...x..", "..x.x.x...x..", "..x.x.x...x..", "..xxxxxxxxx.."];
const CASA_PARED = [".............", "......x......", ".....x.x.....", "....x...x....", "...x.....x...", "..xxxxxxxxx..", "..xmmmmmmmx..", "..xmxxxmmmx..", "..xmx.xmmmx..", "..xmx.xmmmx..", "..xxxxxxxxx.."];
const CASA_TODA = ["hhhhhhhhhhhhh", "hhhhhhxhhhhhh", "hhhhhxoxhhhhh", "hhhhxoooxhhhh", "hhhxoooooxhhh", "hhxxxxxxxxxhh", "hhxmmmmmmmxhh", "hhxmxxxmmmxhh", "hhxmx.xmmmxhh", "hhxmx.xmmmxhh", "hhxxxxxxxxxhh"];
const LEYENDA_CASA = { x: { es: "la raya", en: "the line" }, m: { es: "la pared, 19 casillas", en: "the wall, 19 cells" } };

const MAPA: T = {
  es: `// 'x' es la raya y '.', el papel; cada fila se parte en letras para poder cambiarlas
const mapa = [
${CASA.map((f) => `  "${f}",`).join("\n")}
].map((fila) => [...fila]);`,
  en: `// 'x' is the line and '.', the paper; each row is split into letters so they can be changed
const mapa = [
${CASA.map((f) => `  "${f}",`).join("\n")}
].map((fila) => [...fila]);`,
};

const LADOS: T = {
  es: `// arriba, derecha, abajo, izquierda
const lados = (y, x) => [[y - 1, x], [y, x + 1], [y + 1, x], [y, x - 1]];`,
  en: `// up, right, down, left
const lados = (y, x) => [[y - 1, x], [y, x + 1], [y + 1, x], [y, x - 1]];`,
};

const VER = `const ver = () => console.log(mapa.map((fila) => fila.join("")).join("\\n"));
const cuantas = (letra) => mapa.flat().filter((l) => l === letra).length;`;

const BASE_RELLENO = (idioma: "es" | "en") => `${MAPA[idioma]}\n\n${LADOS[idioma]}\n\n${RELLENO}\n\n${VER}`;

export const A03: Unidad = {
  id: "recorrer",
  titulo: { es: "Recorrer", en: "Traversal" },
  lecciones: [
    {
      id: "laberinto-bfs",
      video: { es: { id: "N2WKcDTsk5Q", desde: "2026-11-26T16:00:00-06:00" }, en: { id: "hngtOc0wuuE", desde: "2026-11-26T16:20:00-06:00" } },
      titulo: { es: "El laberinto: búsqueda en anchura (BFS)", en: "The maze: breadth-first search (BFS)" },
      resumen: {
        es: "Salir de un laberinto por el camino más corto con una cola: la BFS explora por capas y la primera vez que llega a la salida ya es por el camino con menos pasos.",
        en: "Getting out of a maze by the shortest path with a queue: BFS explores in layers, and the first time it reaches the exit it's already along the path with the fewest steps.",
      },
      retos: ["number-of-islands", "rotting-oranges"],
      enlaces: [
        { url: "/aprende/estructuras-de-datos/colas", texto: { es: "Colas: el índice cabeza, en «Estructuras de datos»", en: "Queues: the cabeza index, in \"Data structures\"" } },
        { url: "/aprende/estructuras-de-datos/bfs-y-dfs", texto: { es: "BFS y DFS en un grafo cualquiera", en: "BFS and DFS on any graph" } },
        { url: "https://es.wikipedia.org/wiki/B%C3%BAsqueda_en_anchura", texto: { es: "Búsqueda en anchura (Wikipedia)", en: "Breadth-first search (Wikipedia, Spanish)" } },
      ],
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Un laberinto es un grafo", en: "A maze is a graph" },
          texto: {
            es: "Un laberinto de casillas se escribe como unas filas de texto: `#` es muro y `.` es pasillo. Cada casilla abierta es un **vértice**, y sus **vecinas** son las abiertas de arriba, abajo, izquierda y derecha. No hace falta armar nada más: los vecinos se calculan al vuelo.\n\nA cada casilla la llamamos por su fila y su columna, como texto: `\"4,0\"` es la entrada (fila 4, columna 0) y `\"4,10\"` la salida. Así sirven de llave en un objeto. La computadora no ve el dibujo: sólo puede preguntar «¿quiénes son los vecinos de esta casilla?».",
            en: "A maze of cells is written as rows of text: `#` is a wall and `.` is a corridor. Each open cell is a **vertex**, and its **neighbors** are the open cells above, below, left and right. Nothing else to build: neighbors are computed on the fly.\n\nWe name each cell by its row and column, as text: `\"4,0\"` is the entrance (row 4, column 0) and `\"4,10\"` the exit. That way they work as keys in an object. The computer doesn't see the drawing: all it can ask is \"who are this cell's neighbors?\".",
          },
          dibujo: { tipo: "rejilla", filas: DIBUJO, leyenda: LEYENDA },
          programa: {
            codigo: {
              es: `${LAB}\n\n${VECINOS.es}\n\nconsole.log(vecinos("4,0"));   // la entrada\nconsole.log(vecinos("4,1"));   // aquí se parte en dos\nconsole.log(vecinos("5,5"));   // a media galería de abajo`,
              en: `${LAB}\n\n${VECINOS.en}\n\nconsole.log(vecinos("4,0"));   // the entrance\nconsole.log(vecinos("4,1"));   // it splits in two here\nconsole.log(vecinos("5,5"));   // halfway along the bottom corridor`,
            },
            notas: {
              es: "- La entrada sólo tiene un vecino: la casilla de su derecha. A su izquierda está el borde, y `lab[4][-1]` es `undefined`, no `\".\"`.\n- En `\"4,1\"` hay tres: arriba (la serpiente), abajo (el pasillo) y la entrada, de donde venimos.\n- `?.` evita el error al preguntar por una fila que no existe, como la −1.",
              en: "- The entrance has just one neighbor: the cell to its right. To its left is the edge, and `lab[4][-1]` is `undefined`, not `\".\"`.\n- `\"4,1\"` has three: up (the snake), down (the corridor) and the entrance, where we came from.\n- `?.` avoids an error when asking for a row that doesn't exist, like −1.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "La BFS: por capas, con una cola", en: "BFS: layer by layer, with a queue" },
          texto: {
            es: "La **búsqueda en anchura** (BFS, *breadth-first search*) mete la entrada a una **cola**. Luego, mientras quede alguien, saca al del frente y mete al final a sus vecinos **nuevos**. En `de` anota de qué casilla vino cada una: sirve para saber quién ya entró (`v in de`) y, al final, para reconstruir el camino.\n\nLa cola es la de la lección de colas: un arreglo con un índice `cabeza` que sólo avanza, sin `shift`, así que sacar es O(1). Cuando sale la salida, se acaba (`break`). El camino se arma **de vuelta**: desde la salida, `de` dice de dónde vino, y de dónde vino ésa, hasta la entrada.",
            en: "**Breadth-first search** (BFS) puts the entrance in a **queue**. Then, while anyone's left, it takes the one at the front and adds its **new** neighbors at the back. In `de` (\"from\") it notes which cell each one came from: that tells who already went in (`v in de`) and, at the end, rebuilds the path.\n\nThe queue is the one from the queues lesson: an array with a `cabeza` (head) index that only moves forward, no `shift`, so taking one out is O(1). When the exit comes out, it's done (`break`). The path is built **backwards**: from the exit, `de` says where it came from, and where that one came from, back to the entrance.",
          },
          dibujo: { tipo: "rejilla", filas: DIBUJO_BFS, leyenda: { ...LEYENDA, b: { es: "el camino que encuentra la BFS", en: "the path BFS finds" } } },
          programa: {
            codigo: {
              es: `${PROGRAMA_BFS("es")}\n\nconst camino = bfs("4,0", "4,10");\nconsole.log(camino.length - 1, "pasos");\nconsole.log(camino.join(" → "));`,
              en: `${PROGRAMA_BFS("en")}\n\nconst camino = bfs("4,0", "4,10");\nconsole.log(camino.length - 1, "steps");\nconsole.log(camino.join(" → "));`,
            },
            notas: {
              es: "- **12 pasos**: baja al pasillo, lo cruza entero y sube a la salida.\n- `camino` tiene 13 casillas: los pasos son una menos, porque la entrada no cuenta.\n- `de[ini] = ini` marca la entrada como vista desde el principio, para que nadie la vuelva a meter.",
              en: "- **12 steps**: down to the corridor, all the way across and up to the exit.\n- `camino` has 13 cells: the steps are one fewer, because the entrance doesn't count.\n- `de[ini] = ini` marks the entrance as seen from the start, so nobody adds it again.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Capa por capa", en: "Layer by layer" },
          texto: {
            es: "Si en vez de «de dónde vino» se anota la **distancia** (la del que la descubrió más uno), se ven las capas: la entrada es 0, su vecina 1, las dos de la bifurcación 2, y así. La onda avanza **pareja** por la serpiente y por el pasillo.\n\nFíjate en el orden de la cola: las distancias **nunca bajan** (0 1 2 2 3 3 …). Es porque la cola atiende en orden de llegada: todos los de la capa `d` salen antes que cualquiera de la `d + 1`, que entraron después. Ésa es toda la magia de la BFS.",
            en: "If instead of \"where it came from\" you note the **distance** (the discoverer's plus one), you see the layers: the entrance is 0, its neighbor 1, the two at the fork 2, and so on. The wave moves **evenly** through the snake and the corridor.\n\nLook at the queue's order: the distances **never go down** (0 1 2 2 3 3 …). That's because the queue serves in order of arrival: everyone in layer `d` comes out before anyone in `d + 1`, who arrived later. That's the whole magic of BFS.",
          },
          programa: {
            codigo: {
              es: `${LAB}\n\n${VECINOS.es}\n\nfunction capas(ini) {\n  const dist = { [ini]: 0 };\n  const cola = [ini]; let cabeza = 0;\n  while (cabeza < cola.length) {\n    const c = cola[cabeza++];\n    for (const v of vecinos(c)) {\n      if (v in dist) continue;\n      dist[v] = dist[c] + 1; cola.push(v);\n    }\n  }\n  return { dist, cola };\n}\n\nconst { dist, cola } = capas("4,0");\nfor (let y = 0; y < lab.length; y++) {\n  let fila = "";\n  for (let x = 0; x < lab[y].length; x++) {\n    const d = dist[y + "," + x];\n    fila += d === undefined ? " ##" : String(d).padStart(3);\n  }\n  console.log(fila);\n}\nconsole.log("la cola, en distancias:", cola.map((c) => dist[c]).join(" "));`,
              en: `${LAB}\n\n${VECINOS.en}\n\nfunction capas(ini) {\n  const dist = { [ini]: 0 };\n  const cola = [ini]; let cabeza = 0;\n  while (cabeza < cola.length) {\n    const c = cola[cabeza++];\n    for (const v of vecinos(c)) {\n      if (v in dist) continue;\n      dist[v] = dist[c] + 1; cola.push(v);\n    }\n  }\n  return { dist, cola };\n}\n\nconst { dist, cola } = capas("4,0");\nfor (let y = 0; y < lab.length; y++) {\n  let fila = "";\n  for (let x = 0; x < lab[y].length; x++) {\n    const d = dist[y + "," + x];\n    fila += d === undefined ? " ##" : String(d).padStart(3);\n  }\n  console.log(fila);\n}\nconsole.log("the queue, as distances:", cola.map((c) => dist[c]).join(" "));`,
            },
            notas: {
              es: "- Aquí no hay `break`: recorre todo el laberinto. La salida queda a 12; lo más lejano, a 15.\n- Por la serpiente, la salida estaría a 20. Su punta junto a la salida (`3,9`) tiene 12 y no 18: le llegó antes la onda del pasillo.\n- La cola sale ordenada sin ordenar nada: 0, 1, 2, 2, 3, 3, …",
              en: "- No `break` here: it walks the whole maze. The exit is 12 away; the farthest cell, 15.\n- Through the snake, the exit would be 20 away. Its tip next to the exit (`3,9`) has 12, not 18: the wave from the corridor got there first.\n- The queue comes out sorted without sorting anything: 0, 1, 2, 2, 3, 3, …",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Por qué es el más corto (y la DFS no)", en: "Why it's the shortest (and DFS isn't)" },
          texto: {
            es: "La BFS revisa **todas** las casillas a distancia 1 antes que cualquiera a distancia 2, todas las de 2 antes que las de 3… Así que la primera vez que toca la salida, no puede existir un camino más corto: lo habría encontrado en una capa anterior. Por eso la BFS da el camino con **menos pasos** (en un laberinto donde cada paso cuesta lo mismo).\n\nLa **búsqueda en profundidad** (DFS) usa una pila, o la recursión: se mete por el primer pasillo hasta el fondo y sólo regresa si se atora. Encuentra **un** camino, no necesariamente el más corto: con este orden de vecinos (arriba primero) se mete por la serpiente y da 20. Las dos cuestan **O(V + E)**: cada casilla entra una vez y cada vecino se mira una vez.",
            en: "BFS checks **all** cells at distance 1 before any at distance 2, all at 2 before those at 3… So the first time it touches the exit, there can't be a shorter path: it would have found it in an earlier layer. That's why BFS gives the path with the **fewest steps** (in a maze where every step costs the same).\n\n**Depth-first search** (DFS) uses a stack, or recursion: it dives down the first corridor to the end and only backs up when stuck. It finds **a** path, not necessarily the shortest: with this neighbor order (up first) it goes into the snake and takes 20. Both cost **O(V + E)**: each cell goes in once and each neighbor is looked at once.",
          },
          dibujo: { tipo: "rejilla", filas: DIBUJO_DFS, leyenda: { ...LEYENDA, m: { es: "el camino que encuentra la DFS", en: "the path DFS finds" } } },
          programa: {
            codigo: {
              es: `${PROGRAMA_BFS("es")}\n\n// en profundidad: se mete por el primer vecino hasta el fondo\nfunction dfs(c, fin, visto = new Set([c])) {\n  if (c === fin) return [c];\n  for (const v of vecinos(c)) {\n    if (visto.has(v)) continue;\n    visto.add(v);\n    const resto = dfs(v, fin, visto);\n    if (resto) return [c, ...resto];\n  }\n  return null;   // por aquí no se llega\n}\n\nconsole.log("BFS:", bfs("4,0", "4,10").length - 1, "pasos");\nconsole.log("DFS:", dfs("4,0", "4,10").length - 1, "pasos");`,
              en: `${PROGRAMA_BFS("en")}\n\n// depth-first: dives down the first neighbor to the end\nfunction dfs(c, fin, visto = new Set([c])) {\n  if (c === fin) return [c];\n  for (const v of vecinos(c)) {\n    if (visto.has(v)) continue;\n    visto.add(v);\n    const resto = dfs(v, fin, visto);\n    if (resto) return [c, ...resto];\n  }\n  return null;   // no way through here\n}\n\nconsole.log("BFS:", bfs("4,0", "4,10").length - 1, "steps");\nconsole.log("DFS:", dfs("4,0", "4,10").length - 1, "steps");`,
            },
            notas: {
              es: "- BFS: 12. DFS: 20, por la serpiente de arriba.\n- Cambia el orden de `vecinos` para que mire abajo antes que arriba: la DFS tomará el pasillo y dará 12. Tuvo suerte; la BFS no depende de la suerte.",
              en: "- BFS: 12. DFS: 20, through the snake at the top.\n- Change the order in `vecinos` so it looks down before up: DFS will take the corridor and give 12. It got lucky; BFS doesn't depend on luck.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué pasa si en la BFS cambias la cola por una pila (sacar el **último** que entró)?", en: "What happens if you swap BFS's queue for a stack (take out the **last** one in)?" },
          opciones: [
            { es: "Se vuelve una búsqueda en profundidad y ya no garantiza el camino más corto", en: "It becomes a depth-first search and no longer guarantees the shortest path" },
            { es: "Encuentra el mismo camino, pero más rápido", en: "It finds the same path, only faster" },
            { es: "No termina nunca", en: "It never ends" },
            { es: "Recorre el laberinto al revés, de la salida a la entrada", en: "It walks the maze backwards, from exit to entrance" },
          ],
          correcta: 0,
          porque: {
            es: "Con una pila sale primero el más nuevo, así que sigue y sigue por el mismo pasillo: eso es ir a lo hondo. Termina, porque nadie entra dos veces, pero el orden ya no es por capas.",
            en: "With a stack the newest comes out first, so it keeps going down the same corridor: that's going deep. It does end, since nobody goes in twice, but the order is no longer by layers.",
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "En la cola de una BFS, ¿cómo van las distancias de las casillas, del frente hacia atrás?", en: "In a BFS queue, how do the cells' distances go, from front to back?" },
          opciones: [
            { es: "Nunca bajan: primero todas las d, luego las d + 1", en: "They never go down: first all the d's, then the d + 1's" },
            { es: "Están revueltas", en: "They're mixed up" },
            { es: "Van de mayor a menor", en: "They go from largest to smallest" },
            { es: "Son todas iguales", en: "They're all equal" },
          ],
          correcta: 0,
          porque: {
            es: "Los de la capa d + 1 los mete alguien de la capa d al salir, así que siempre quedan detrás de los d que faltan. En la cola nunca conviven más de dos capas seguidas.",
            en: "The ones in layer d + 1 are added by someone from layer d as it comes out, so they always end up behind the d's still waiting. The queue never holds more than two consecutive layers.",
          },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa el corazón de la BFS.", en: "Fill in the heart of BFS." },
          codigo: "const c = cola[___];\nif (c === fin) break;\nfor (const v of vecinos(c)) {\n  if (v ___ de) continue;\n  de[v] = c; cola.___(v);\n}",
          huecos: ["cabeza++", "in", "push"],
          banco: ["cabeza++", "in", "push", "cabeza--", "unshift", "pop"],
          porque: {
            es: "Se saca el del frente y la cabeza avanza (`cabeza++`); se salta al que ya está en `de`; los nuevos van al final (`push`). Con `unshift` se colarían al frente y dejaría de ir por capas.",
            en: "Take the one at the front and move the head forward (`cabeza++`); skip anyone already in `de`; new ones go at the back (`push`). With `unshift` they'd cut to the front and it would stop going by layers.",
          },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `pasos(lab, ini, fin)`: cuántos pasos tiene el camino más corto de `ini` a `fin` (casillas `\"fila,columna\"`, abiertas con `.`), o `-1` si no se puede llegar. No hace falta el camino: con la distancia basta.",
            en: "Write `pasos(lab, ini, fin)`: how many steps the shortest path from `ini` to `fin` has (cells as `\"row,column\"`, open ones are `.`), or `-1` if you can't get there. You don't need the path: the distance is enough.",
          },
          inicial: {
            es: "function pasos(lab, ini, fin) {\n  // una BFS que anote la distancia de cada casilla\n  return -1;\n}\n\nconsole.log(pasos([\"...\", \".#.\", \"...\"], \"0,0\", \"2,2\"));",
            en: "function pasos(lab, ini, fin) {\n  // a BFS that notes each cell's distance\n  return -1;\n}\n\nconsole.log(pasos([\"...\", \".#.\", \"...\"], \"0,0\", \"2,2\"));",
          },
          pruebas: [
            { llamada: "pasos([\"...\", \".#.\", \"...\"], \"0,0\", \"2,2\")", espera: "4" },
            { llamada: "pasos([\".....\"], \"0,0\", \"0,4\")", espera: "4" },
            { llamada: "pasos([\".#.\", \".#.\", \".#.\"], \"0,0\", \"0,2\")", espera: "-1" },
            { llamada: "pasos([\".\"], \"0,0\", \"0,0\")", espera: "0" },
            { llamada: "pasos([\"###########\", \"#...#...#.#\", \"#.#.#.#.#.#\", \"#.#...#...#\", \"..#######..\", \"#.........#\", \"#.#.###.#.#\", \"#.#...#.#.#\", \"###########\"], \"4,0\", \"4,10\")", espera: "12" },
          ],
          solucion: "function pasos(lab, ini, fin) {\n  const dist = { [ini]: 0 };\n  const cola = [ini]; let cabeza = 0;\n  while (cabeza < cola.length) {\n    const c = cola[cabeza++];\n    if (c === fin) return dist[c];\n    const [y, x] = c.split(\",\").map(Number);\n    for (const [f, k] of [[y - 1, x], [y, x + 1], [y + 1, x], [y, x - 1]]) {\n      const v = f + \",\" + k;\n      if (lab[f]?.[k] !== \".\" || v in dist) continue;\n      dist[v] = dist[c] + 1; cola.push(v);\n    }\n  }\n  return -1;\n}",
          porque: {
            es: "Es la misma BFS, pero en vez de `de` guarda la distancia: la del que la descubrió más uno. Cuando sale `fin` de la cola, su distancia ya es la mínima. Si la cola se vacía sin verla, no hay camino.",
            en: "It's the same BFS, but instead of `de` it stores the distance: the discoverer's plus one. When `fin` comes out of the queue, its distance is already the minimum. If the queue empties without seeing it, there's no path.",
          },
        },
      ],
    },
    {
      id: "relleno",
      video: { es: { id: "dVTG3X23r64", desde: "2026-11-28T16:00:00-06:00" }, en: { id: "M3oEjsnZvbs", desde: "2026-11-28T16:20:00-06:00" } },
      titulo: { es: "El relleno (flood fill): el bote de pintura", en: "Flood fill: the paint bucket" },
      resumen: {
        es: "Cómo sabe el bote de pintura hasta dónde pintar: una pila, cuatro vecinas y una sola regla, seguir mientras la casilla sea del color viejo.",
        en: "How the paint bucket knows where to stop: a stack, four neighbors and a single rule, keep going while the cell is the old color.",
      },
      retos: ["number-of-islands", "rotting-oranges"],
      enlaces: [
        { url: "/aprende/estructuras-de-datos/pilas", texto: { es: "Pilas, en «Estructuras de datos»", en: "Stacks, in \"Data structures\"" } },
        { url: "https://dailychallenge.click/juegos/qix", texto: { es: "Qix, en Daily Challenge: usa este algoritmo", en: "Qix, on Daily Challenge: it uses this algorithm" } },
        { url: "https://es.wikipedia.org/wiki/Algoritmo_de_relleno_por_difusi%C3%B3n", texto: { es: "Relleno por difusión (Wikipedia)", en: "Flood fill (Wikipedia, Spanish)" } },
      ],
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "¿Hasta dónde pinta el bote?", en: "How far does the bucket paint?" },
          texto: {
            es: "Picas la pared con el bote de pintura y se pinta **toda la pared**, pero no el techo, ni el cielo, ni la puerta, aunque también son blancos. La regla es ésta: se pintan las casillas que tienen el **mismo color** que la que picaste **y** a las que se llega desde ella pasando sólo por casillas de ese color, hacia arriba, abajo, izquierda o derecha.\n\nA eso se le llama **relleno**, o *flood fill*: como si echaras agua y la raya negra fuera la orilla. La puerta es blanca, pero para llegar a ella habría que cruzar la raya.",
            en: "You click the wall with the paint bucket and **the whole wall** gets painted, but not the roof, or the sky, or the door, even though they're white too. The rule is this: it paints the cells that have the **same color** as the one you clicked **and** that you can reach from it going only through cells of that color, up, down, left or right.\n\nThat's called **flood fill**: as if you poured water and the black line were the shore. The door is white, but to get to it you'd have to cross the line.",
          },
          dibujo: { tipo: "rejilla", filas: CASA_PARED, leyenda: LEYENDA_CASA },
          programa: {
            codigo: {
              es: `${MAPA.es}\n\n${LADOS.es}\n\n// las cuatro vecinas de la casilla (6, 6), en la pared\nfor (const [i, j] of lados(6, 6)) console.log(i, j, mapa[i]?.[j]);\n\n// y las de una esquina del cielo: dos caen fuera\nfor (const [i, j] of lados(0, 0)) console.log(i, j, mapa[i]?.[j]);`,
              en: `${MAPA.en}\n\n${LADOS.en}\n\n// the four neighbors of cell (6, 6), on the wall\nfor (const [i, j] of lados(6, 6)) console.log(i, j, mapa[i]?.[j]);\n\n// and the ones of a corner of the sky: two fall outside\nfor (const [i, j] of lados(0, 0)) console.log(i, j, mapa[i]?.[j]);`,
            },
            notas: {
              es: "- De `(6, 6)`, la de arriba y la de abajo son raya (`x`); la de la derecha y la de la izquierda, papel.\n- Fuera del mapa sale `undefined`: `?.` evita que truene al pedir una fila que no existe. Como `undefined` no es el color viejo, el borde del dibujo detiene la pintura solo.",
              en: "- From `(6, 6)`, the ones above and below are line (`x`); the ones to the right and left are paper.\n- Outside the map you get `undefined`: `?.` keeps it from crashing when you ask for a row that doesn't exist. Since `undefined` isn't the old color, the edge of the drawing stops the paint by itself.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Una pila de pendientes", en: "A stack of things to do" },
          texto: {
            es: "Primero se anota el color **viejo**, el que había donde picaste. Se pinta esa casilla y se mete a una **pila**. Después, mientras la pila tenga algo: se saca la de **arriba** y se miran sus cuatro vecinas; las que todavía sean del color viejo se pintan y entran a la pila.\n\nCuando la pila queda vacía, ya no hay a quién preguntarle: se acabó. La pared da **19 casillas**.",
            en: "First you note the **old** color, the one that was where you clicked. You paint that cell and push it onto a **stack**. Then, while the stack has something: you pop the one on **top** and look at its four neighbors; the ones that are still the old color get painted and pushed.\n\nWhen the stack is empty, there's no one left to ask: you're done. The wall comes to **19 cells**.",
          },
          programa: {
            codigo: {
              es: `${BASE_RELLENO("es")}\n\nrellenar(6, 6, "m");\nver();\nconsole.log("pintadas:", cuantas("m"));`,
              en: `${BASE_RELLENO("en")}\n\nrellenar(6, 6, "m");\nver();\nconsole.log("painted:", cuantas("m"));`,
            },
            notas: {
              es: "- Las dos casillas de la puerta siguen siendo `.`: nadie llegó a ellas.\n- Prueba `rellenar(8, 5, \"p\")` para pintar la puerta, o `rellenar(5, 5, \"x\")`: picar la raya con su mismo color no hace nada.\n- Pica la raya con otra letra, `rellenar(5, 5, \"r\")`: cambia el marco de la pared, pero no las rayas del techo. Sólo se tocan por la esquina, y eso importa más adelante.",
              en: "- The two cells of the door are still `.`: nobody got to them.\n- Try `rellenar(8, 5, \"p\")` to paint the door, or `rellenar(5, 5, \"x\")`: clicking the line with its own color does nothing.\n- Click the line with another letter, `rellenar(5, 5, \"r\")`: the wall's frame changes, but not the roof's lines. They only touch at the corner, and that matters later on.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Pintar ya es marcar", en: "Painting is marking" },
          texto: {
            es: "En el laberinto hacía falta anotar quién ya estaba visto. Aquí no: en cuanto una casilla se pinta, deja de ser del color viejo, así que **nadie entra dos veces**. Por eso se pinta **al meterla** a la pila y no al sacarla: si se dejara para después, dos vecinas podrían meter a la misma.\n\nY por eso está `if (viejo === nuevo) return;`. Si pintas de blanco lo que ya es blanco, la casilla pintada **sigue siendo del color viejo**: todas volverían a entrar una y otra vez, y no acabaría nunca.",
            en: "In the maze you had to note who had already been seen. Not here: as soon as a cell is painted, it stops being the old color, so **nobody goes in twice**. That's why it's painted **when it's pushed** and not when it's popped: if you left it for later, two neighbors could push the same one.\n\nAnd that's why `if (viejo === nuevo) return;` is there. If you paint white what's already white, the painted cell **is still the old color**: they'd all go in again and again, and it would never end.",
          },
          programa: {
            codigo: {
              es: `${MAPA.es}\n\n${LADOS.es}\n\n// la misma, pero pinta al SACAR en vez de al meter, y cuenta cuántas entran\nfunction tarde(f, c, nuevo) {\n  const viejo = mapa[f][c];\n  const pila = [[f, c]];\n  let entraron = 1;\n  while (pila.length > 0) {\n    const [y, x] = pila.pop();\n    mapa[y][x] = nuevo;\n    for (const [i, j] of lados(y, x))\n      if (mapa[i]?.[j] === viejo) { pila.push([i, j]); entraron++; }\n  }\n  return entraron;\n}\n\nconsole.log("casillas de la pared: 19");\nconsole.log("entraron a la pila:", tarde(6, 6, "m"));`,
              en: `${MAPA.en}\n\n${LADOS.en}\n\n// the same one, but it paints when POPPING instead of pushing, and counts how many go in\nfunction tarde(f, c, nuevo) {\n  const viejo = mapa[f][c];\n  const pila = [[f, c]];\n  let entraron = 1;\n  while (pila.length > 0) {\n    const [y, x] = pila.pop();\n    mapa[y][x] = nuevo;\n    for (const [i, j] of lados(y, x))\n      if (mapa[i]?.[j] === viejo) { pila.push([i, j]); entraron++; }\n  }\n  return entraron;\n}\n\nconsole.log("wall cells: 19");\nconsole.log("pushed onto the stack:", tarde(6, 6, "m"));`,
            },
            notas: {
              es: "- Da el mismo dibujo, pero entran más de 19: algunas casillas estaban dos veces en la pila.\n- En un dibujo grande la diferencia se nota. Pintando al meter, cada casilla entra **una** vez y se miran sus cuatro lados: el trabajo crece con las casillas pintadas, **O(n)**.",
              en: "- You get the same picture, but more than 19 go in: some cells were on the stack twice.\n- On a big drawing you'd notice. Painting on push, each cell goes in **once** and its four sides are looked at: the work grows with the cells painted, **O(n)**.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Cuatro vecinas, no ocho", en: "Four neighbors, not eight" },
          texto: {
            es: "Las rayas del techo van en **diagonal**: cada casilla negra toca a la siguiente sólo por la esquina. Con cuatro vecinas eso basta para cerrar el paso. Si además se miran las diagonales (ocho vecinas), la pintura **se cuela por las esquinas** y mancha el cielo.\n\nNo es que ocho esté mal: es otra idea de «pegadas». Lo importante es saber cuál quieres. El buscaminas, por ejemplo, abre hacia las ocho.",
            en: "The lines of the roof run **diagonally**: each black cell touches the next one only at the corner. With four neighbors that's enough to block the way. If you also look at the diagonals (eight neighbors), the paint **leaks through the corners** and stains the sky.\n\nEight isn't wrong: it's a different idea of \"touching\". What matters is knowing which one you want. Minesweeper, for example, opens in all eight.",
          },
          dibujo: { tipo: "rejilla", filas: CASA_TODA, leyenda: { ...LEYENDA_CASA, o: { es: "el techo, 9 casillas", en: "the roof, 9 cells" }, h: { es: "el cielo, 73 casillas", en: "the sky, 73 cells" } } },
          programa: {
            codigo: {
              es: `${MAPA.es}\n\n// las ocho de alrededor, con las diagonales\nconst lados = (y, x) => [[y - 1, x], [y - 1, x + 1], [y, x + 1], [y + 1, x + 1],\n                         [y + 1, x], [y + 1, x - 1], [y, x - 1], [y - 1, x - 1]];\n\n${RELLENO}\n\n${VER}\n\nrellenar(4, 6, "o");   // el techo\nver();\nconsole.log("pintadas:", cuantas("o"));`,
              en: `${MAPA.en}\n\n// all eight around it, diagonals included\nconst lados = (y, x) => [[y - 1, x], [y - 1, x + 1], [y, x + 1], [y + 1, x + 1],\n                         [y + 1, x], [y + 1, x - 1], [y, x - 1], [y - 1, x - 1]];\n\n${RELLENO}\n\n${VER}\n\nrellenar(4, 6, "o");   // the roof\nver();\nconsole.log("painted:", cuantas("o"));`,
            },
            notas: {
              es: "- Pinta 82: las 9 del techo y las 73 del cielo. Con cuatro vecinas daría 9.\n- La pared se salva: sus esquinas están cerradas con casillas negras que se tocan por el lado.",
              en: "- It paints 82: the roof's 9 and the sky's 73. With four neighbors it'd be 9.\n- The wall is safe: its corners are closed with black cells that touch side by side.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Con cola, con pila o llamándose a sí misma", en: "With a queue, a stack, or calling itself" },
          texto: {
            es: "Si en vez de sacar la de arriba sacas la **primera** que entró (una cola), la pintura avanza en **ondas** parejas, como la BFS del laberinto. Con la pila se va a lo hondo por un lado y luego regresa. El orden cambia; **el dibujo final es el mismo**, porque se pintan todas las que se alcanzan, en el orden que sea.\n\nTambién se puede escribir con **recursión**: pinta y llámate con tus cuatro vecinas. Son seis renglones, pero ahora la pila es la de las llamadas, y ésa es chica: en un dibujo grande se desborda.",
            en: "If instead of popping the top one you take the **first** one in (a queue), the paint moves in even **waves**, like the maze's BFS. With the stack it dives deep on one side and then comes back. The order changes; **the final picture is the same**, because every reachable cell gets painted, whatever the order.\n\nYou can also write it with **recursion**: paint, then call yourself with your four neighbors. It's six lines, but now the stack is the call stack, and that one is small: on a big drawing it overflows.",
          },
          programa: {
            codigo: {
              es: `${LADOS.es}\n\nlet mapa;\nfunction recursivo(f, c, nuevo, viejo = mapa[f][c]) {\n  if (viejo === nuevo || mapa[f]?.[c] !== viejo) return;\n  mapa[f][c] = nuevo;\n  for (const [i, j] of lados(f, c)) recursivo(i, j, nuevo, viejo);\n}\n\n${RELLENO}\n\nconst lienzo = (n) => Array.from({ length: n }, () => Array(n).fill("."));\nconst cuantas = () => mapa.flat().filter((l) => l === "m").length;\n\nmapa = lienzo(20);\nrecursivo(0, 0, "m");\nconsole.log("20 x 20, recursivo:", cuantas());\n\nmapa = lienzo(400);\ntry {\n  recursivo(0, 0, "m");\n  console.log("400 x 400, recursivo:", cuantas());\n} catch (e) {\n  console.log("400 x 400, recursivo:", e.message);\n}\n\nmapa = lienzo(400);\nrellenar(0, 0, "m");\nconsole.log("400 x 400, con pila:", cuantas());`,
              en: `${LADOS.en}\n\nlet mapa;\nfunction recursivo(f, c, nuevo, viejo = mapa[f][c]) {\n  if (viejo === nuevo || mapa[f]?.[c] !== viejo) return;\n  mapa[f][c] = nuevo;\n  for (const [i, j] of lados(f, c)) recursivo(i, j, nuevo, viejo);\n}\n\n${RELLENO}\n\nconst lienzo = (n) => Array.from({ length: n }, () => Array(n).fill("."));\nconst cuantas = () => mapa.flat().filter((l) => l === "m").length;\n\nmapa = lienzo(20);\nrecursivo(0, 0, "m");\nconsole.log("20 x 20, recursive:", cuantas());\n\nmapa = lienzo(400);\ntry {\n  recursivo(0, 0, "m");\n  console.log("400 x 400, recursive:", cuantas());\n} catch (e) {\n  console.log("400 x 400, recursive:", e.message);\n}\n\nmapa = lienzo(400);\nrellenar(0, 0, "m");\nconsole.log("400 x 400, with a stack:", cuantas());`,
            },
            notas: {
              es: "- En el de 20 x 20 las dos sirven. En el de 400 x 400 la recursiva se queda sin pila de llamadas (el mensaje cambia con el navegador); la nuestra pinta las 160 000.\n- Para verla en ondas, cambia `pila.pop()` por `pila.shift()`: el resultado no cambia.",
              en: "- On the 20 x 20 one both work. On the 400 x 400 one the recursive version runs out of call stack (the message depends on the browser); ours paints all 160,000.\n- To see it in waves, change `pila.pop()` to `pila.shift()`: the result doesn't change.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Para qué sirve: Qix y contar islas", en: "What it's for: Qix and counting islands" },
          texto: {
            es: "En [Qix](https://dailychallenge.click/juegos/qix), de Daily Challenge, cuando cierras una línea el juego **rellena** cada pedazo que quedó sin dueño, con una pila como la de aquí, y le pone un número. Luego mira en cuáles anda el bicho: ésos se quedan libres y **los demás son tuyos**.\n\nLo mismo sirve para **contar regiones**: recorre las casillas y, cada vez que encuentres una sin pintar, rellénala entera y suma uno. Es el problema de «contar islas», un clásico de las entrevistas.",
            en: "In [Qix](https://dailychallenge.click/juegos/qix), on Daily Challenge, when you close a line the game **fills** each unclaimed piece, with a stack like this one, and gives it a number. Then it checks which ones the creature is in: those stay free and **the rest are yours**.\n\nThe same works for **counting regions**: go over the cells and, each time you find one that's not painted, fill all of it and add one. It's the \"number of islands\" problem, an interview classic.",
          },
          programa: {
            codigo: {
              es: `${BASE_RELLENO("es")}\n\nlet regiones = 0;\nfor (let f = 0; f < mapa.length; f++)\n  for (let c = 0; c < mapa[f].length; c++)\n    if (mapa[f][c] === ".") {\n      regiones++;\n      rellenar(f, c, String(regiones));   // cada pedazo, con su número\n    }\nver();\nconsole.log("pedazos blancos:", regiones);`,
              en: `${BASE_RELLENO("en")}\n\nlet regiones = 0;\nfor (let f = 0; f < mapa.length; f++)\n  for (let c = 0; c < mapa[f].length; c++)\n    if (mapa[f][c] === ".") {\n      regiones++;\n      rellenar(f, c, String(regiones));   // each piece, with its number\n    }\nver();\nconsole.log("white pieces:", regiones);`,
            },
            notas: {
              es: "- Son cuatro: el cielo, el techo, la pared y la puerta.\n- Los `for` pasan por todas las casillas, pero cada una se pinta una sola vez: el trabajo total sigue siendo **O(n)**.",
              en: "- There are four: the sky, the roof, the wall and the door.\n- The `for` loops go over every cell, but each one is painted only once: the total work is still **O(n)**.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "La puerta es blanca, igual que la pared. ¿Por qué no se pinta cuando picas la pared?", en: "The door is white, just like the wall. Why isn't it painted when you click the wall?" },
          opciones: [
            { es: "Porque no hay camino de casillas blancas, de lado en lado, de la pared a la puerta", en: "Because there's no path of white cells, side by side, from the wall to the door" },
            { es: "Porque es más chica que la pared", en: "Because it's smaller than the wall" },
            { es: "Porque la pila se llena antes de llegar a ella", en: "Because the stack fills up before getting to it" },
            { es: "Porque está más abajo en el mapa", en: "Because it's lower down on the map" },
          ],
          correcta: 0,
          porque: {
            es: "El relleno sólo avanza a casillas pegadas por un lado y del color viejo. La raya rodea la puerta por completo, así que ninguna vecina blanca la mete a la pila.",
            en: "Flood fill only moves to cells that touch by a side and are the old color. The line goes all the way around the door, so no white neighbor ever pushes it onto the stack.",
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "Quitas `if (viejo === nuevo) return;` y pintas de blanco una región blanca. ¿Qué pasa?", en: "You remove `if (viejo === nuevo) return;` and paint a white region white. What happens?" },
          opciones: [
            { es: "No termina: las casillas pintadas siguen siendo del color viejo y vuelven a entrar", en: "It never ends: painted cells are still the old color and go back in" },
            { es: "No pasa nada: la región ya estaba blanca", en: "Nothing: the region was already white" },
            { es: "Se pinta todo el mapa, también la raya", en: "The whole map gets painted, the line too" },
            { es: "Pinta sólo la primera casilla", en: "It paints only the first cell" },
          ],
          correcta: 0,
          porque: {
            es: "Lo que evita que una casilla entre dos veces es que deja de ser del color viejo. Si el nuevo y el viejo son el mismo, nunca deja de serlo: la pila se vuelve a llenar sin parar.",
            en: "What keeps a cell from going in twice is that it stops being the old color. If the new and the old are the same, it never stops being it: the stack keeps filling up forever.",
          },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa el corazón del relleno.", en: "Fill in the heart of flood fill." },
          codigo: "const [y, x] = pila.___();\nfor (const [i, j] of lados(y, x))\n  if (mapa[i]?.[j] === ___) {\n    mapa[i][j] = ___;\n    pila.push([i, j]);\n  }",
          huecos: ["pop", "viejo", "nuevo"],
          banco: ["pop", "viejo", "nuevo", "push", "pila", "undefined"],
          porque: {
            es: "Se saca la de arriba (`pop`), se aceptan sólo las vecinas del color `viejo` y se pintan del `nuevo` antes de meterlas, para que nadie más las meta.",
            en: "Pop the one on top (`pop`), accept only neighbors of the `viejo` (old) color and paint them `nuevo` (new) before pushing them, so nobody else pushes them.",
          },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `pedazos(filas)`: cuántas regiones de `.` hay, si dos casillas están pegadas sólo cuando se tocan por un lado. Puedes rellenar cada región con otra letra mientras cuentas.",
            en: "Write `pedazos(filas)`: how many regions of `.` there are, where two cells touch only if they share a side. You can fill each region with another letter as you count.",
          },
          inicial: {
            es: "function pedazos(filas) {\n  const mapa = filas.map((f) => [...f]);\n  // por cada '.' que encuentres: suma uno y rellena su región\n  return 0;\n}\n\nconsole.log(pedazos([\".x.\", \"xxx\", \".x.\"]));",
            en: "function pedazos(filas) {\n  const mapa = filas.map((f) => [...f]);\n  // for each '.' you find: add one and fill its region\n  return 0;\n}\n\nconsole.log(pedazos([\".x.\", \"xxx\", \".x.\"]));",
          },
          pruebas: [
            { llamada: "pedazos([\".x.\", \"xxx\", \".x.\"])", espera: "4" },
            { llamada: "pedazos([\"..\", \"..\"])", espera: "1" },
            { llamada: "pedazos([\"xxx\"])", espera: "0" },
            { llamada: "pedazos([\".x\", \"x.\"])", espera: "2" },
            { llamada: "pedazos([\".............\", \"......x......\", \".....x.x.....\", \"....x...x....\", \"...x.....x...\", \"..xxxxxxxxx..\", \"..x.......x..\", \"..x.xxx...x..\", \"..x.x.x...x..\", \"..x.x.x...x..\", \"..xxxxxxxxx..\"])", espera: "4" },
          ],
          solucion: "function pedazos(filas) {\n  const mapa = filas.map((f) => [...f]);\n  let n = 0;\n  for (let f = 0; f < mapa.length; f++)\n    for (let c = 0; c < mapa[f].length; c++) {\n      if (mapa[f][c] !== \".\") continue;\n      n++;\n      const pila = [[f, c]];\n      mapa[f][c] = \"o\";\n      while (pila.length > 0) {\n        const [y, x] = pila.pop();\n        for (const [i, j] of [[y - 1, x], [y, x + 1], [y + 1, x], [y, x - 1]])\n          if (mapa[i]?.[j] === \".\") {\n            mapa[i][j] = \"o\";\n            pila.push([i, j]);\n          }\n      }\n    }\n  return n;\n}",
          porque: {
            es: "Cada `.` que aparece al recorrer el mapa es de una región nueva: si fuera de una ya contada, el relleno la habría pintado de `o`. En `[\".x\", \"x.\"]` son dos, porque se tocan sólo por la esquina.",
            en: "Each `.` you come across is from a new region: if it were from one already counted, the fill would have painted it `o`. In `[\".x\", \"x.\"]` there are two, because they only touch at the corner.",
          },
        },
      ],
    },
  ],
};
