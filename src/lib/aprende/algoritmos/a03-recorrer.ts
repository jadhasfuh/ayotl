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

export const A03: Unidad = {
  id: "recorrer",
  titulo: { es: "Recorrer", en: "Traversal" },
  lecciones: [
    {
      id: "laberinto-bfs",
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
  ],
};
