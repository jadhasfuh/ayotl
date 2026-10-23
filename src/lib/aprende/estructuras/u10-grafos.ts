import type { Unidad } from "../tipos";

// El grafo de cinco vértices de la primera lección
const VERTICES = `const vertices = ["A", "B", "C", "D", "E"];
const aristas = [["A", "B"], ["A", "C"], ["B", "C"], ["B", "D"], ["C", "E"], ["D", "E"]];`;

// El de seis vértices de BFS y DFS
const ADY = `const ady = {
  A: ["B", "C"],
  B: ["A", "D"],
  C: ["A", "D", "E"],
  D: ["B", "C", "F"],
  E: ["C", "F"],
  F: ["D", "E"],
};`;

// Los pueblos de Dijkstra; los kilómetros son inventados para el ejercicio
const PUEBLOS = `const ady = {
  Sah: [["Jiq", 8], ["Ven", 6], ["Zam", 60], ["Cot", 50]],
  Jiq: [["Sah", 8], ["Ven", 4], ["Zam", 45]],
  Ven: [["Sah", 6], ["Jiq", 4]],
  Cot: [["Sah", 50], ["Zam", 40]],
  Zam: [["Sah", 60], ["Jiq", 45], ["Cot", 40]],
};`;

const MATERIAS = `const grafo = {
  P1: ["P2"],
  P2: ["ED"],
  ED: ["AL"],
  MD: ["AL"],
  AL: ["CO"],
  CO: [],
};`;

const DIBUJO_ABCDE = {
  tipo: "grafo" as const,
  nodos: [{ id: "A", x: 30, y: 40 }, { id: "B", x: 150, y: 30 }, { id: "C", x: 90, y: 130 }, { id: "D", x: 250, y: 90 }, { id: "E", x: 200, y: 190 }],
  aristas: [["A", "B"], ["A", "C"], ["B", "C"], ["B", "D"], ["C", "E"], ["D", "E"]] as [string, string][],
};

export const U10: Unidad = {
  id: "grafos",
  titulo: { es: "Grafos", en: "Graphs" },
  lecciones: [
    {
      id: "grafos-representacion",
      titulo: { es: "Puntos y líneas: qué es un grafo", en: "Dots and lines: what a graph is" },
      resumen: {
        es: "Vértices y aristas, con flecha o sin ella, con peso o sin él. Guardarlos en lista de adyacencia o en matriz.",
        en: "Vertices and edges, with or without arrows, with or without weights. Storing them as an adjacency list or a matrix.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Vértices y aristas", en: "Vertices and edges" },
          texto: {
            es: "Un **grafo** es un montón de **vértices** (puntos) unidos por **aristas** (líneas). Sirve para todo lo que son relaciones: pueblos y carreteras, personas y amistades, páginas y enlaces, casillas de un mapa y sus vecinas.\n\nLos árboles de las unidades anteriores son un caso especial: un grafo sin ciclos donde cada nodo tiene un solo padre. En un grafo general puede haber ciclos, varios caminos entre dos puntos y pedazos sueltos.\n\nEl **grado** de un vértice es cuántas aristas lo tocan. Como cada arista toca dos vértices, la suma de todos los grados es el doble de las aristas.",
            en: "A **graph** is a bunch of **vertices** (dots) joined by **edges** (lines). It's for anything made of relationships: towns and roads, people and friendships, pages and links, map squares and their neighbors.\n\nThe trees from earlier units are a special case: a graph with no cycles where every node has a single parent. A general graph can have cycles, several paths between two points, and disconnected pieces.\n\nA vertex's **degree** is how many edges touch it. Since every edge touches two vertices, the sum of all degrees is twice the number of edges.",
          },
          dibujo: DIBUJO_ABCDE,
          programa: {
            codigo: {
              es: `${VERTICES}

console.log(vertices.length, "vértices,", aristas.length, "aristas");

const grado = {};
for (const v of vertices) grado[v] = 0;
for (const [a, b] of aristas) {
  grado[a]++;
  grado[b]++;
}
console.log(grado);

let suma = 0;
for (const v of vertices) suma += grado[v];
console.log("suma de grados:", suma);`,
              en: `${VERTICES}

console.log(vertices.length, "vertices,", aristas.length, "edges");

const grado = {};
for (const v of vertices) grado[v] = 0;
for (const [a, b] of aristas) {
  grado[a]++;
  grado[b]++;
}
console.log(grado);

let suma = 0;
for (const v of vertices) suma += grado[v];
console.log("sum of degrees:", suma);`,
            },
            notas: {
              es: "- B y C tienen grado 3; A, D y E, grado 2. Compáralo con el dibujo.\n- La suma da 12, el doble de las 6 aristas.",
              en: "- B and C have degree 3; A, D and E, degree 2. Compare it with the drawing.\n- The sum is 12, twice the 6 edges.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Lista de adyacencia", en: "Adjacency list" },
          texto: {
            es: "Una lista de aristas sirve para guardar el grafo, pero no para preguntar «¿quiénes son los vecinos de C?» sin revisarlas todas. Lo más usado es la **lista de adyacencia**: a cada vértice le toca un arreglo con sus vecinos. En JavaScript, un `Map` (o un objeto) de vértice a arreglo.\n\nEn un grafo **no dirigido** cada arista se anota dos veces, una en cada punta. Ocupa memoria **O(V + E)** (vértices más aristas), y recorrer los vecinos de un vértice cuesta lo que tenga de vecinos.",
            en: "A list of edges is fine for storing the graph, but not for asking \"who are C's neighbors?\" without checking all of them. The most common choice is the **adjacency list**: each vertex gets an array with its neighbors. In JavaScript, a `Map` (or an object) from vertex to array.\n\nIn an **undirected** graph each edge is written down twice, once at each end. It takes **O(V + E)** memory (vertices plus edges), and walking a vertex's neighbors costs however many neighbors it has.",
          },
          programa: {
            codigo: {
              es: `${VERTICES}

const ady = new Map();
for (const v of vertices) ady.set(v, []);
for (const [a, b] of aristas) {
  ady.get(a).push(b);
  ady.get(b).push(a);   // no dirigido: en los dos sentidos
}

console.log(ady);
console.log("vecinos de C:", ady.get("C"));
console.log("¿B y E son vecinos?", ady.get("B").includes("E"));`,
              en: `${VERTICES}

const ady = new Map();
for (const v of vertices) ady.set(v, []);
for (const [a, b] of aristas) {
  ady.get(a).push(b);
  ady.get(b).push(a);   // undirected: both ways
}

console.log(ady);
console.log("neighbors of C:", ady.get("C"));
console.log("are B and E neighbors?", ady.get("B").includes("E"));`,
            },
            notas: {
              es: "- Cada vértice tiene su arreglo de vecinos; la arista A–B aparece en el de A y en el de B.\n- Los vecinos de C salen directo: `[A, B, E]`.\n- Preguntar si B y E son vecinos obliga a revisar la lista de B: es `false`.",
              en: "- Each vertex has its array of neighbors; edge A–B shows up in A's and in B's.\n- C's neighbors come straight out: `[A, B, E]`.\n- Asking whether B and E are neighbors means scanning B's list: it's `false`.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Matriz de adyacencia", en: "Adjacency matrix" },
          texto: {
            es: "La otra forma es una **matriz** de V × V: la casilla `[i][j]` vale 1 si hay arista entre `i` y `j`, y 0 si no. Preguntar si dos vértices están unidos cuesta **O(1)**, pero la matriz ocupa **O(V²)** aunque casi no haya aristas.\n\nRegla práctica: lista de adyacencia casi siempre; matriz cuando el grafo es chico o casi todos están unidos con todos.",
            en: "The other way is a V × V **matrix**: cell `[i][j]` is 1 if there's an edge between `i` and `j`, and 0 if not. Asking whether two vertices are joined costs **O(1)**, but the matrix takes **O(V²)** even when there are hardly any edges.\n\nRule of thumb: adjacency list almost always; a matrix when the graph is small or nearly everything is connected to everything.",
          },
          programa: {
            codigo: {
              es: `${VERTICES}

const indice = {};
vertices.forEach((v, i) => { indice[v] = i; });
const n = vertices.length;
const matriz = Array.from({ length: n }, () => new Array(n).fill(0));

for (const [a, b] of aristas) {
  matriz[indice[a]][indice[b]] = 1;
  matriz[indice[b]][indice[a]] = 1;
}

console.log("  " + vertices.join(" "));
for (let i = 0; i < n; i++) console.log(vertices[i], matriz[i].join(" "));
console.log("¿B y E?", matriz[indice.B][indice.E] === 1);`,
              en: `${VERTICES}

const indice = {};
vertices.forEach((v, i) => { indice[v] = i; });
const n = vertices.length;
const matriz = Array.from({ length: n }, () => new Array(n).fill(0));

for (const [a, b] of aristas) {
  matriz[indice[a]][indice[b]] = 1;
  matriz[indice[b]][indice[a]] = 1;
}

console.log("  " + vertices.join(" "));
for (let i = 0; i < n; i++) console.log(vertices[i], matriz[i].join(" "));
console.log("B and E?", matriz[indice.B][indice.E] === 1);`,
            },
            notas: {
              es: "- La matriz es simétrica: en un grafo no dirigido, `[i][j]` y `[j][i]` siempre coinciden.\n- De 25 casillas, sólo 12 tienen un 1. Con mil vértices serían un millón de casillas, casi todas en cero.",
              en: "- The matrix is symmetric: in an undirected graph, `[i][j]` and `[j][i]` always match.\n- Out of 25 cells, only 12 hold a 1. With a thousand vertices it'd be a million cells, almost all zero.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Con flecha y con peso", en: "With arrows and weights" },
          texto: {
            es: "Dos variantes que vienen en las siguientes lecciones:\n\n- **Dirigido**: la arista tiene sentido, como seguir a alguien en una red (tú lo sigues; él a ti, quién sabe). Se anota una sola vez, en el vértice de salida.\n- **Con pesos**: cada arista lleva un número, como los kilómetros de una carretera o el costo de un vuelo. En la lista de adyacencia, cada vecino va con su peso: `[vecino, peso]`.\n\nEl dibujo es dirigido y con pesos.",
            en: "Two variants coming up in the next lessons:\n\n- **Directed**: the edge has a direction, like following someone on social media (you follow them; whether they follow you, who knows). It's written down once, at the vertex it leaves from.\n- **Weighted**: each edge carries a number, like a road's kilometers or a flight's cost. In the adjacency list, each neighbor comes with its weight: `[neighbor, weight]`.\n\nThe drawing is directed and weighted.",
          },
          dibujo: {
            tipo: "grafo",
            dirigido: true,
            nodos: [{ id: "A", x: 30, y: 90 }, { id: "B", x: 150, y: 30 }, { id: "C", x: 150, y: 160 }, { id: "D", x: 270, y: 90 }],
            aristas: [["A", "B", 4], ["A", "C", 2], ["C", "B", 1], ["B", "D", 5], ["C", "D", 8]],
          },
          programa: {
            codigo: {
              es: `const aristas = [["A", "B", 4], ["A", "C", 2], ["C", "B", 1], ["B", "D", 5], ["C", "D", 8]];

const ady = {};
for (const [a, b, peso] of aristas) {
  if (!ady[a]) ady[a] = [];
  if (!ady[b]) ady[b] = [];
  ady[a].push([b, peso]);   // dirigido: sólo de a hacia b
}

console.log(ady);
console.log("de C se puede ir a:", ady.C.map(([v]) => v));
console.log("de D se puede ir a:", ady.D.map(([v]) => v));`,
              en: `const aristas = [["A", "B", 4], ["A", "C", 2], ["C", "B", 1], ["B", "D", 5], ["C", "D", 8]];

const ady = {};
for (const [a, b, peso] of aristas) {
  if (!ady[a]) ady[a] = [];
  if (!ady[b]) ady[b] = [];
  ady[a].push([b, peso]);   // directed: only from a to b
}

console.log(ady);
console.log("from C you can go to:", ady.C.map(([v]) => v));
console.log("from D you can go to:", ady.D.map(([v]) => v));`,
            },
            notas: {
              es: "- Cada vecino trae su peso: de A a B cuesta 4 y de A a C, 2.\n- D no tiene salidas: todas las flechas llegan a él y ninguna sale. En un grafo dirigido, «vecino» depende del sentido.",
              en: "- Each neighbor carries its weight: A to B costs 4 and A to C, 2.\n- D has no way out: every arrow points into it and none leaves. In a directed graph, \"neighbor\" depends on the direction.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "En el grafo de A a E (aristas A–B, A–C, B–C, B–D, C–E y D–E), ¿qué grado tiene B?", en: "In the A-to-E graph (edges A–B, A–C, B–C, B–D, C–E and D–E), what's B's degree?" },
          opciones: ["2", "3", "4", "5"],
          correcta: 1,
          porque: { es: "B toca tres aristas: con A, con C y con D.", en: "B touches three edges: to A, to C and to D." },
        },
        {
          tipo: "elige",
          pregunta: { es: "En una red social donde «seguir» no tiene que ser mutuo, ¿qué grafo es?", en: "In a social network where \"following\" doesn't have to be mutual, what kind of graph is it?" },
          opciones: [
            { es: "No dirigido", en: "Undirected" },
            { es: "Dirigido", en: "Directed" },
            { es: "Un árbol", en: "A tree" },
          ],
          correcta: 1,
          porque: { es: "Que tú sigas a alguien no quiere decir que te siga: la arista tiene sentido. (Una amistad de Facebook, que es mutua, sería no dirigida.)", en: "You following someone doesn't mean they follow you: the edge has a direction. (A Facebook friendship, which is mutual, would be undirected.)" },
        },
        {
          tipo: "elige",
          pregunta: { es: "Un grafo de 1000 vértices y 3000 aristas guardado en matriz de adyacencia, ¿cuántas casillas ocupa?", en: "A graph with 1000 vertices and 3000 edges stored as an adjacency matrix: how many cells does it take?" },
          opciones: [
            { es: "3000", en: "3000" },
            { es: "4000", en: "4000" },
            { es: "Un millón", en: "A million" },
            { es: "Seis mil", en: "Six thousand" },
          ],
          correcta: 2,
          porque: { es: "La matriz es V × V = 1000 × 1000, sin importar cuántas aristas haya. La lista de adyacencia guardaría unas 1000 + 2·3000 cosas.", en: "The matrix is V × V = 1000 × 1000, no matter how many edges there are. The adjacency list would store about 1000 + 2·3000 things." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa la lista de adyacencia de un grafo no dirigido.", en: "Complete the adjacency list of an undirected graph." },
          codigo: "const ady = new Map();\nfor (const v of vertices) ady.set(v, ___);\nfor (const [a, b] of aristas) {\n  ady.get(a).___(b);\n  ady.get(___).push(a);\n}",
          huecos: ["[]", "push", "b"],
          banco: ["[]", "push", "b", "{}", "pop", "a"],
          porque: { es: "Cada vértice empieza con un arreglo vacío; cada arista se anota en las dos puntas: `b` en la lista de `a` y `a` en la de `b`.", en: "Each vertex starts with an empty array; each edge is written at both ends: `b` in `a`'s list and `a` in `b`'s." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `listaDeAdyacencia(n, aristas)` para un grafo **no dirigido** con vértices `0` a `n - 1`. Devuelve un arreglo de `n` arreglos: en la posición `i`, los vecinos de `i` en el orden en que aparecen las aristas.",
            en: "Write `listaDeAdyacencia(n, aristas)` for an **undirected** graph with vertices `0` to `n - 1`. Return an array of `n` arrays: at position `i`, the neighbors of `i` in the order the edges appear.",
          },
          inicial: {
            es: "function listaDeAdyacencia(n, aristas) {\n  // pista: Array.from({ length: n }, () => []) crea n arreglos distintos\n  return [];\n}\n\nconsole.log(listaDeAdyacencia(3, [[0, 1], [1, 2]]));",
            en: "function listaDeAdyacencia(n, aristas) {\n  // hint: Array.from({ length: n }, () => []) makes n separate arrays\n  return [];\n}\n\nconsole.log(listaDeAdyacencia(3, [[0, 1], [1, 2]]));",
          },
          pruebas: [
            { llamada: "listaDeAdyacencia(3, [[0, 1], [1, 2]])", espera: "[[1],[0,2],[1]]" },
            { llamada: "listaDeAdyacencia(2, [])", espera: "[[],[]]" },
            { llamada: "listaDeAdyacencia(4, [[0, 3], [0, 1], [3, 2]])", espera: "[[3,1],[0],[3],[0,2]]" },
          ],
          solucion: "function listaDeAdyacencia(n, aristas) {\n  const ady = Array.from({ length: n }, () => []);\n  for (const [a, b] of aristas) {\n    ady[a].push(b);\n    ady[b].push(a);\n  }\n  return ady;\n}",
          porque: { es: "Ojo con `new Array(n).fill([])`: llenaría todo con **el mismo** arreglo (lo de las referencias de la unidad 1) y cada vecino aparecería en todas las listas. `Array.from` con una función crea uno nuevo por posición.", en: "Watch out for `new Array(n).fill([])`: it would fill everything with **the same** array (the references from unit 1) and every neighbor would show up in every list. `Array.from` with a function makes a new one per slot." },
        },
      ],
      enlaces: [{ url: "https://visualgo.net/es/graphds", texto: { es: "Las formas de guardar un grafo, dibujadas (VisuAlgo)", en: "Ways to store a graph, drawn (VisuAlgo)" } }],
    },
    {
      id: "bfs-y-dfs",
      titulo: { es: "Recorrer un grafo: BFS y DFS", en: "Walking a graph: BFS and DFS" },
      resumen: {
        es: "A lo ancho con una cola, a lo hondo con una pila. Distancias, componentes y las islas de un mapa.",
        en: "Breadth-first with a queue, depth-first with a stack. Distances, components and the islands on a map.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "BFS: por capas, con una cola", en: "BFS: layer by layer, with a queue" },
          texto: {
            es: "La **búsqueda en anchura** (BFS, *breadth-first search*) visita primero a los vecinos del origen, luego a los vecinos de esos, y así, como las ondas de una piedra en el agua. Usa una **cola**: el que se descubre primero se visita primero.\n\nComo avanza por capas, la primera vez que llega a un vértice lo hace por el camino con **menos aristas**. Por eso BFS da la distancia en saltos desde el origen. Lo único que hay que cuidar es no meter a nadie dos veces: se marca al descubrirlo.\n\nCuesta **O(V + E)**: cada vértice entra una vez y cada arista se mira una vez por punta.",
            en: "**Breadth-first search** (BFS) visits the start's neighbors first, then their neighbors, and so on, like ripples from a stone in water. It uses a **queue**: whoever is discovered first is visited first.\n\nSince it moves in layers, the first time it reaches a vertex it does so along the path with the **fewest edges**. That's why BFS gives the distance in hops from the start. The only thing to watch is not adding anyone twice: mark them when you discover them.\n\nIt costs **O(V + E)**: each vertex goes in once and each edge is looked at once per end.",
          },
          dibujo: {
            tipo: "grafo",
            nodos: [{ id: "A", x: 30, y: 90 }, { id: "B", x: 130, y: 30 }, { id: "C", x: 130, y: 150 }, { id: "D", x: 230, y: 90 }, { id: "E", x: 230, y: 200 }, { id: "F", x: 330, y: 150 }],
            aristas: [["A", "B"], ["A", "C"], ["B", "D"], ["C", "D"], ["C", "E"], ["D", "F"], ["E", "F"]],
            resalta: ["A"],
          },
          programa: {
            codigo: {
              es: `${ADY}

function bfs(inicio) {
  const dist = { [inicio]: 0 };   // descubierto = ya tiene distancia
  const cola = [inicio];
  let cabeza = 0;                  // sacar con un índice: shift() es O(n)
  while (cabeza < cola.length) {
    const v = cola[cabeza++];
    for (const w of ady[v]) {
      if (!(w in dist)) {
        dist[w] = dist[v] + 1;
        cola.push(w);
      }
    }
  }
  console.log("orden de visita:", cola);
  return dist;
}

console.log(bfs("A"));`,
              en: `${ADY}

function bfs(inicio) {
  const dist = { [inicio]: 0 };   // discovered = already has a distance
  const cola = [inicio];
  let cabeza = 0;                  // dequeue with an index: shift() is O(n)
  while (cabeza < cola.length) {
    const v = cola[cabeza++];
    for (const w of ady[v]) {
      if (!(w in dist)) {
        dist[w] = dist[v] + 1;
        cola.push(w);
      }
    }
  }
  console.log("visit order:", cola);
  return dist;
}

console.log(bfs("A"));`,
            },
            notas: {
              es: "- Primero A, luego su capa (B y C), luego la siguiente (D y E) y al final F.\n- F queda a 3 saltos: A → B → D → F o A → C → E → F, cualquiera de los dos.\n- El arreglo `cola` nunca se vacía: al final es el orden en que se visitó todo.",
              en: "- First A, then its layer (B and C), then the next one (D and E) and finally F.\n- F is 3 hops away: A → B → D → F or A → C → E → F, either one.\n- The `cola` array is never emptied: at the end it's the order everything was visited in.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "DFS: hasta el fondo, y de regreso", en: "DFS: all the way down, and back" },
          texto: {
            es: "La **búsqueda en profundidad** (DFS, *depth-first search*) se mete por un camino hasta que ya no puede seguir y luego regresa a probar el siguiente. Es el recorrido en preorden de los árboles, pero marcando lo visitado, porque en un grafo hay ciclos y se daría vueltas para siempre.\n\nSe escribe con recursión (la pila de llamadas hace el trabajo) o con una **pila** explícita. No da distancias, pero sirve para todo lo que es «¿qué se alcanza desde aquí?». Por ejemplo, contar **componentes**: los pedazos sueltos del grafo. Cada DFS que arranca en un vértice no visitado descubre un componente entero.",
            en: "**Depth-first search** (DFS) goes down one path until it can't continue, then backs up to try the next. It's the preorder walk from trees, but marking what was visited, because a graph has cycles and it would go around forever.\n\nYou write it with recursion (the call stack does the work) or with an explicit **stack**. It doesn't give distances, but it's great for anything like \"what can I reach from here?\". For example, counting **components**: the disconnected pieces of the graph. Each DFS that starts from an unvisited vertex discovers a whole component.",
          },
          programa: {
            codigo: {
              es: `${ADY}

const visto = new Set();
const orden = [];
function dfs(v) {
  visto.add(v);
  orden.push(v);
  for (const w of ady[v]) if (!visto.has(w)) dfs(w);
}
dfs("A");
console.log("DFS desde A:", orden);

// Tres pedazos: P-Q-R, S-T y U solo
const red = { P: ["Q"], Q: ["P", "R"], R: ["Q"], S: ["T"], T: ["S"], U: [] };

function componentes(g) {
  const visto = new Set();
  let cuenta = 0;
  for (const inicio in g) {
    if (visto.has(inicio)) continue;
    cuenta++;                      // nadie lo alcanzó: pedazo nuevo
    const pila = [inicio];         // DFS con pila explícita
    visto.add(inicio);
    while (pila.length > 0) {
      const v = pila.pop();
      for (const w of g[v]) if (!visto.has(w)) { visto.add(w); pila.push(w); }
    }
  }
  return cuenta;
}
console.log("componentes:", componentes(red));`,
              en: `${ADY}

const visto = new Set();
const orden = [];
function dfs(v) {
  visto.add(v);
  orden.push(v);
  for (const w of ady[v]) if (!visto.has(w)) dfs(w);
}
dfs("A");
console.log("DFS from A:", orden);

// Three pieces: P-Q-R, S-T and U alone
const red = { P: ["Q"], Q: ["P", "R"], R: ["Q"], S: ["T"], T: ["S"], U: [] };

function componentes(g) {
  const visto = new Set();
  let cuenta = 0;
  for (const inicio in g) {
    if (visto.has(inicio)) continue;
    cuenta++;                      // nobody reached it: a new piece
    const pila = [inicio];         // DFS with an explicit stack
    visto.add(inicio);
    while (pila.length > 0) {
      const v = pila.pop();
      for (const w of g[v]) if (!visto.has(w)) { visto.add(w); pila.push(w); }
    }
  }
  return cuenta;
}
console.log("components:", componentes(red));`,
            },
            notas: {
              es: "- DFS desde A va A → B → D → C → E → F: se mete por B hasta el fondo antes de tocar a C como vecino de A. BFS, en cambio, visitó B y C juntos.\n- `red` tiene 3 componentes; U solo cuenta como uno.",
              en: "- DFS from A goes A → B → D → C → E → F: it dives through B all the way before touching C as A's neighbor. BFS, instead, visited B and C together.\n- `red` has 3 components; U on its own counts as one.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Un mapa también es un grafo", en: "A map is a graph too" },
          texto: {
            es: "Una **rejilla** (un tablero, un mapa de casillas) es un grafo aunque nadie lo dibuje así: cada casilla es un vértice y sus vecinas de arriba, abajo, izquierda y derecha son sus aristas. No hace falta armar la lista de adyacencia: los vecinos se calculan sumando `[1, 0]`, `[-1, 0]`, `[0, 1]` y `[0, -1]`.\n\nEl problema clásico es contar **islas**: en un mapa de `1` (tierra) y `0` (agua), cuántos grupos de tierra hay. Son los componentes del grafo de la tierra. El Snake de Daily Challenge hace algo parecido para revisar que un muro nuevo no parta la arena en dos.",
            en: "A **grid** (a board, a tile map) is a graph even if nobody draws it that way: each square is a vertex and its neighbors above, below, left and right are its edges. No need to build an adjacency list: neighbors are computed by adding `[1, 0]`, `[-1, 0]`, `[0, 1]` and `[0, -1]`.\n\nThe classic problem is counting **islands**: on a map of `1` (land) and `0` (water), how many groups of land there are. They're the components of the land graph. Daily Challenge's Snake does something similar to check that a new wall doesn't split the arena in two.",
          },
          dibujo: {
            tipo: "rejilla",
            filas: ["11000", "11010", "00011", "00000", "01100"],
            leyenda: { "1": { es: "tierra", en: "land" }, "0": { es: "agua", en: "water" } },
          },
          programa: {
            codigo: {
              es: `const mapa = [
  "11000",
  "11010",
  "00011",
  "00000",
  "01100",
];

function contarIslas(mapa) {
  const filas = mapa.length, cols = mapa[0].length;
  const visto = mapa.map(() => new Array(cols).fill(false));
  let islas = 0;
  for (let y = 0; y < filas; y++) {
    for (let x = 0; x < cols; x++) {
      if (mapa[y][x] !== "1" || visto[y][x]) continue;
      islas++;                                 // tierra que nadie visitó
      const cola = [[y, x]];                   // BFS desde aquí
      visto[y][x] = true;
      let cabeza = 0;
      while (cabeza < cola.length) {
        const [cy, cx] = cola[cabeza++];
        for (const [dy, dx] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const ny = cy + dy, nx = cx + dx;
          if (ny < 0 || ny >= filas || nx < 0 || nx >= cols) continue;
          if (mapa[ny][nx] === "1" && !visto[ny][nx]) {
            visto[ny][nx] = true;
            cola.push([ny, nx]);
          }
        }
      }
    }
  }
  return islas;
}

console.log(contarIslas(mapa));`,
              en: `const mapa = [
  "11000",
  "11010",
  "00011",
  "00000",
  "01100",
];

function contarIslas(mapa) {
  const filas = mapa.length, cols = mapa[0].length;
  const visto = mapa.map(() => new Array(cols).fill(false));
  let islas = 0;
  for (let y = 0; y < filas; y++) {
    for (let x = 0; x < cols; x++) {
      if (mapa[y][x] !== "1" || visto[y][x]) continue;
      islas++;                                 // land nobody visited yet
      const cola = [[y, x]];                   // BFS from here
      visto[y][x] = true;
      let cabeza = 0;
      while (cabeza < cola.length) {
        const [cy, cx] = cola[cabeza++];
        for (const [dy, dx] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const ny = cy + dy, nx = cx + dx;
          if (ny < 0 || ny >= filas || nx < 0 || nx >= cols) continue;
          if (mapa[ny][nx] === "1" && !visto[ny][nx]) {
            visto[ny][nx] = true;
            cola.push([ny, nx]);
          }
        }
      }
    }
  }
  return islas;
}

console.log(contarIslas(mapa));`,
            },
            notas: {
              es: "Salen 3: el cuadro de arriba a la izquierda, la «L» de la derecha (las casillas en diagonal no cuentan como vecinas, pero ésas se tocan de lado) y la de abajo. Cambia un `0` del mapa por `1` para unir dos islas y córrelo.",
              en: "It gives 3: the top-left square, the \"L\" on the right (diagonal squares don't count as neighbors, but those touch side by side) and the one at the bottom. Change a `0` on the map to `1` to join two islands and run it.",
            },
          },
          enlaces: [{ url: "https://visualgo.net/es/dfsbfs", texto: { es: "BFS y DFS paso a paso (VisuAlgo)", en: "BFS and DFS step by step (VisuAlgo)" } }],
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué estructura usa BFS para decidir a quién visitar después?", en: "Which structure does BFS use to decide who to visit next?" },
          opciones: [
            { es: "Una pila", en: "A stack" },
            { es: "Una cola", en: "A queue" },
            { es: "Un montículo", en: "A heap" },
            { es: "Una tabla hash", en: "A hash table" },
          ],
          correcta: 1,
          porque: { es: "El que se descubre primero se visita primero: una **cola**. Con una pila, el mismo código haría un DFS.", en: "Whoever is discovered first is visited first: a **queue**. With a stack, the same code would do a DFS." },
        },
        {
          tipo: "elige",
          pregunta: { es: "Quieres el camino con menos saltos entre dos estaciones del metro (todas las conexiones cuentan igual). ¿Qué usas?", en: "You want the path with the fewest hops between two subway stations (every connection counts the same). What do you use?" },
          opciones: [
            { es: "BFS desde la estación de salida", en: "BFS from the starting station" },
            { es: "DFS desde la estación de salida", en: "DFS from the starting station" },
            { es: "Ordenar las estaciones", en: "Sort the stations" },
          ],
          correcta: 0,
          porque: { es: "BFS llega a cada vértice por primera vez por el camino con menos aristas. DFS encuentra **un** camino, no necesariamente el más corto.", en: "BFS reaches each vertex for the first time along the path with the fewest edges. DFS finds **a** path, not necessarily the shortest." },
        },
        {
          tipo: "elige",
          pregunta: { es: "En el grafo de A a F de esta lección, ¿a cuántos saltos está F de A?", en: "In this lesson's A-to-F graph, how many hops is F from A?" },
          opciones: ["2", "3", "4", "6"],
          correcta: 1,
          porque: { es: "A → B → D → F (o A → C → E → F): tres aristas. No hay camino de dos.", en: "A → B → D → F (or A → C → E → F): three edges. There's no two-edge path." },
        },
        {
          tipo: "ordena",
          pregunta: { es: "Ordena el cuerpo del ciclo de BFS.", en: "Put the body of the BFS loop in order." },
          lineas: ["const v = cola[cabeza++];", "for (const w of ady[v]) {", "  if (!(w in dist)) {", "    dist[w] = dist[v] + 1;", "    cola.push(w);"],
          porque: { es: "Se saca el siguiente de la cola, se recorren sus vecinos y a los no descubiertos se les da distancia **antes** de formarlos: así nadie entra dos veces.", en: "Take the next one from the queue, walk its neighbors, and give undiscovered ones a distance **before** queueing them: that way nobody gets in twice." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `contarComponentes(n, aristas)`: cuántos pedazos tiene un grafo no dirigido con vértices `0` a `n - 1`. Un vértice sin aristas es un pedazo por sí solo.",
            en: "Write `contarComponentes(n, aristas)`: how many pieces an undirected graph with vertices `0` to `n - 1` has. A vertex with no edges is a piece of its own.",
          },
          inicial: {
            es: "function contarComponentes(n, aristas) {\n  // 1) arma la lista de adyacencia\n  // 2) recorre: cada BFS o DFS desde un vértice no visitado es un pedazo\n  return 0;\n}\n\nconsole.log(contarComponentes(5, [[0, 1], [1, 2], [3, 4]]));",
            en: "function contarComponentes(n, aristas) {\n  // 1) build the adjacency list\n  // 2) walk it: each BFS or DFS from an unvisited vertex is one piece\n  return 0;\n}\n\nconsole.log(contarComponentes(5, [[0, 1], [1, 2], [3, 4]]));",
          },
          pruebas: [
            { llamada: "contarComponentes(5, [[0, 1], [1, 2], [3, 4]])", espera: "2" },
            { llamada: "contarComponentes(3, [])", espera: "3" },
            { llamada: "contarComponentes(4, [[0, 1], [1, 2], [2, 3]])", espera: "1" },
            { llamada: "contarComponentes(6, [[0, 5], [2, 3]])", espera: "4" },
          ],
          solucion: "function contarComponentes(n, aristas) {\n  const ady = Array.from({ length: n }, () => []);\n  for (const [a, b] of aristas) {\n    ady[a].push(b);\n    ady[b].push(a);\n  }\n  const visto = new Array(n).fill(false);\n  let cuenta = 0;\n  for (let i = 0; i < n; i++) {\n    if (visto[i]) continue;\n    cuenta++;\n    const pila = [i];\n    visto[i] = true;\n    while (pila.length > 0) {\n      const v = pila.pop();\n      for (const w of ady[v]) {\n        if (!visto[w]) {\n          visto[w] = true;\n          pila.push(w);\n        }\n      }\n    }\n  }\n  return cuenta;\n}",
          porque: { es: "Cada vez que encuentras un vértice que ningún recorrido anterior alcanzó, empieza un pedazo nuevo; el recorrido marca todo el pedazo. En total, O(V + E).", en: "Every time you find a vertex no earlier walk reached, a new piece starts; the walk marks the whole piece. In total, O(V + E)." },
        },
      ],
      retos: ["number-of-islands"],
    },
    {
      id: "dijkstra",
      titulo: { es: "El camino más corto: Dijkstra", en: "The shortest path: Dijkstra" },
      resumen: {
        es: "Cuando las aristas pesan distinto, menos saltos no es menos kilómetros. El algoritmo de los mapas.",
        en: "When edges weigh differently, fewer hops isn't fewer kilometers. The algorithm behind maps.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Menos tramos no es menos kilómetros", en: "Fewer legs isn't fewer kilometers" },
          texto: {
            es: "BFS cuenta saltos, como si todas las aristas midieran lo mismo. En un mapa no es así. En el dibujo hay cinco pueblos de la región (Sahuayo, Jiquilpan, Venustiano Carranza, Cotija y Zamora) con los kilómetros sobre cada tramo. **Los kilómetros son inventados para el ejercicio**, no los de la carretera.\n\nDe Sahuayo a Zamora hay un tramo directo de 60, pero pasando por Jiquilpan son 8 + 45 = 53. BFS diría «directo, un salto». Hace falta algo que sume pesos.",
            en: "BFS counts hops, as if every edge had the same length. On a map that's not true. The drawing has five towns in the region (Sahuayo, Jiquilpan, Venustiano Carranza, Cotija and Zamora) with the kilometers on each leg. **The kilometers are made up for the exercise**, not the real road distances.\n\nFrom Sahuayo to Zamora there's a direct leg of 60, but going through Jiquilpan it's 8 + 45 = 53. BFS would say \"direct, one hop\". We need something that adds up weights.",
          },
          dibujo: {
            tipo: "grafo",
            nodos: [{ id: "Zam", x: 60, y: 40 }, { id: "Jiq", x: 260, y: 40 }, { id: "Sah", x: 160, y: 130 }, { id: "Ven", x: 290, y: 160 }, { id: "Cot", x: 40, y: 200 }],
            aristas: [["Sah", "Jiq", 8], ["Sah", "Ven", 6], ["Ven", "Jiq", 4], ["Sah", "Zam", 60], ["Jiq", "Zam", 45], ["Sah", "Cot", 50], ["Cot", "Zam", 40]],
            resalta: ["Sah", "Zam"],
          },
          programa: {
            codigo: {
              es: `const km = { "Sah-Zam": 60, "Sah-Jiq": 8, "Jiq-Zam": 45 };

const directo = km["Sah-Zam"];
const porJiquilpan = km["Sah-Jiq"] + km["Jiq-Zam"];

console.log("directo:       1 tramo, ", directo, "km");
console.log("por Jiquilpan: 2 tramos,", porJiquilpan, "km");`,
              en: `const km = { "Sah-Zam": 60, "Sah-Jiq": 8, "Jiq-Zam": 45 };

const directo = km["Sah-Zam"];
const porJiquilpan = km["Sah-Jiq"] + km["Jiq-Zam"];

console.log("direct:          1 leg, ", directo, "km");
console.log("via Jiquilpan:   2 legs,", porJiquilpan, "km");`,
            },
            notas: {
              es: "El camino con más tramos es el más corto en kilómetros. Con cinco pueblos se ve a ojo; con miles de cruces, como en un mapa de verdad, hace falta un algoritmo.",
              en: "The path with more legs is shorter in kilometers. With five towns you can eyeball it; with thousands of intersections, like a real map, you need an algorithm.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "La idea de Dijkstra", en: "Dijkstra's idea" },
          texto: {
            es: "Edsger Dijkstra lo publicó en 1959. Cada vértice lleva su **mejor distancia conocida** desde el origen (al principio, infinito; el origen, 0). Luego se repite:\n\n- Toma el vértice **no fijado** con la distancia más chica. Esa distancia ya es definitiva: cualquier otro camino pasaría por algo más lejos.\n- **Relaja** sus aristas: si llegar a un vecino por aquí es más corto que lo que tenía, se actualiza y se anota de dónde vino.\n\nEsta versión busca el más chico revisando todos, así que cuesta **O(V²)**. Para reconstruir la ruta se sigue `previo` hacia atrás desde el destino.",
            en: "Edsger Dijkstra published it in 1959. Each vertex carries its **best known distance** from the start (at first, infinity; the start itself, 0). Then repeat:\n\n- Take the **unsettled** vertex with the smallest distance. That distance is now final: any other path would go through something farther away.\n- **Relax** its edges: if reaching a neighbor through here is shorter than what it had, update it and note where it came from.\n\nThis version finds the smallest by checking them all, so it costs **O(V²)**. To rebuild the route, follow `previo` backwards from the destination.",
          },
          programa: {
            codigo: {
              es: `${PUEBLOS}

function dijkstra(origen) {
  const dist = {}, previo = {}, fijo = new Set();
  for (const v in ady) dist[v] = Infinity;
  dist[origen] = 0;
  while (fijo.size < Object.keys(ady).length) {
    // el no fijado más cercano
    let v = null;
    for (const u in ady) if (!fijo.has(u) && (v === null || dist[u] < dist[v])) v = u;
    if (dist[v] === Infinity) break;   // lo que queda no se alcanza
    fijo.add(v);
    for (const [w, km] of ady[v]) {
      if (dist[v] + km < dist[w]) {    // relajar
        dist[w] = dist[v] + km;
        previo[w] = v;
      }
    }
  }
  return { dist, previo };
}

const { dist, previo } = dijkstra("Sah");
console.log(dist);

const ruta = ["Zam"];
while (previo[ruta[0]]) ruta.unshift(previo[ruta[0]]);
console.log(ruta.join(" -> "), dist.Zam, "km");`,
              en: `${PUEBLOS}

function dijkstra(origen) {
  const dist = {}, previo = {}, fijo = new Set();
  for (const v in ady) dist[v] = Infinity;
  dist[origen] = 0;
  while (fijo.size < Object.keys(ady).length) {
    // the closest unsettled one
    let v = null;
    for (const u in ady) if (!fijo.has(u) && (v === null || dist[u] < dist[v])) v = u;
    if (dist[v] === Infinity) break;   // what's left can't be reached
    fijo.add(v);
    for (const [w, km] of ady[v]) {
      if (dist[v] + km < dist[w]) {    // relax
        dist[w] = dist[v] + km;
        previo[w] = v;
      }
    }
  }
  return { dist, previo };
}

const { dist, previo } = dijkstra("Sah");
console.log(dist);

const ruta = ["Zam"];
while (previo[ruta[0]]) ruta.unshift(previo[ruta[0]]);
console.log(ruta.join(" -> "), dist.Zam, "km");`,
            },
            notas: {
              es: "- Zamora queda a 53 por Jiquilpan, no a 60 por el tramo directo.\n- Jiquilpan queda a 8 directo: por Venustiano Carranza serían 6 + 4 = 10, y Dijkstra se quedó con el menor.\n- La ruta sale de seguir `previo` desde Zamora hasta Sahuayo.",
              en: "- Zamora is 53 away via Jiquilpan, not 60 on the direct leg.\n- Jiquilpan is 8 away directly: via Venustiano Carranza it would be 6 + 4 = 10, and Dijkstra kept the smaller one.\n- The route comes from following `previo` from Zamora back to Sahuayo.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Más rápido con un montículo", en: "Faster with a heap" },
          texto: {
            es: "Buscar el más cercano revisando todos es lo caro. Con la **cola de prioridad** de la unidad anterior se saca en O(log V): cada vez que una distancia mejora, se mete la pareja `[distancia, vértice]`. Pueden quedar parejas viejas de un vértice que ya mejoró; al sacarlas se reconocen porque su distancia es mayor que la anotada, y se tiran. Así cuesta **O((V + E) log V)**, que en un mapa grande es la diferencia entre un instante y una espera.\n\nUna condición: los pesos no pueden ser **negativos**. Dijkstra da por definitiva una distancia en cuanto la saca, y una arista negativa más adelante podría mejorarla. Para pesos negativos existe Bellman-Ford, más lento.",
            en: "Finding the closest by checking them all is the expensive part. With last unit's **priority queue** it comes out in O(log V): every time a distance improves, push the pair `[distance, vertex]`. Old pairs for a vertex that has since improved may linger; when popped, they're recognized because their distance is bigger than the recorded one, and they're tossed. That makes it **O((V + E) log V)**, which on a big map is the difference between an instant and a wait.\n\nOne condition: weights can't be **negative**. Dijkstra treats a distance as final as soon as it pops it, and a negative edge further on could improve it. For negative weights there's Bellman-Ford, which is slower.",
          },
          programa: {
            codigo: {
              es: `${PUEBLOS}

// Montículo mínimo de parejas [distancia, vértice] (el de la unidad 9, compacto)
function meter(h, par) {
  h.push(par);
  let i = h.length - 1;
  while (i > 0) {
    const p = (i - 1) >> 1;
    if (h[p][0] <= h[i][0]) break;
    [h[p], h[i]] = [h[i], h[p]];
    i = p;
  }
}
function sacar(h) {
  const arriba = h[0], ultimo = h.pop();
  if (h.length > 0) {
    h[0] = ultimo;
    let i = 0;
    while (true) {
      const a = 2 * i + 1, b = 2 * i + 2;
      let m = i;
      if (a < h.length && h[a][0] < h[m][0]) m = a;
      if (b < h.length && h[b][0] < h[m][0]) m = b;
      if (m === i) break;
      [h[m], h[i]] = [h[i], h[m]];
      i = m;
    }
  }
  return arriba;
}

function dijkstra(origen) {
  const dist = { [origen]: 0 };
  const heap = [[0, origen]];
  let sacadas = 0, viejas = 0;
  while (heap.length > 0) {
    const [d, v] = sacar(heap);
    sacadas++;
    if (d > dist[v]) { viejas++; continue; }   // ya había un camino mejor
    for (const [w, km] of ady[v]) {
      const nueva = d + km;
      if (dist[w] === undefined || nueva < dist[w]) {
        dist[w] = nueva;
        meter(heap, [nueva, w]);
      }
    }
  }
  console.log("parejas sacadas:", sacadas, "· viejas:", viejas);
  return dist;
}

console.log(dijkstra("Sah"));`,
              en: `${PUEBLOS}

// Min-heap of [distance, vertex] pairs (unit 9's, compacted)
function meter(h, par) {
  h.push(par);
  let i = h.length - 1;
  while (i > 0) {
    const p = (i - 1) >> 1;
    if (h[p][0] <= h[i][0]) break;
    [h[p], h[i]] = [h[i], h[p]];
    i = p;
  }
}
function sacar(h) {
  const arriba = h[0], ultimo = h.pop();
  if (h.length > 0) {
    h[0] = ultimo;
    let i = 0;
    while (true) {
      const a = 2 * i + 1, b = 2 * i + 2;
      let m = i;
      if (a < h.length && h[a][0] < h[m][0]) m = a;
      if (b < h.length && h[b][0] < h[m][0]) m = b;
      if (m === i) break;
      [h[m], h[i]] = [h[i], h[m]];
      i = m;
    }
  }
  return arriba;
}

function dijkstra(origen) {
  const dist = { [origen]: 0 };
  const heap = [[0, origen]];
  let sacadas = 0, viejas = 0;
  while (heap.length > 0) {
    const [d, v] = sacar(heap);
    sacadas++;
    if (d > dist[v]) { viejas++; continue; }   // a better path was already found
    for (const [w, km] of ady[v]) {
      const nueva = d + km;
      if (dist[w] === undefined || nueva < dist[w]) {
        dist[w] = nueva;
        meter(heap, [nueva, w]);
      }
    }
  }
  console.log("pairs popped:", sacadas, "· stale:", viejas);
  return dist;
}

console.log(dijkstra("Sah"));`,
            },
            notas: {
              es: "- Las distancias son las mismas que con la versión O(V²): 8, 6, 53 y 50.\n- Salió una pareja vieja: `[60, Zam]`, que entró antes de descubrir el camino de 53 por Jiquilpan. Se tiró sin hacer nada.",
              en: "- The distances are the same as the O(V²) version: 8, 6, 53 and 50.\n- One stale pair came out: `[60, Zam]`, pushed before the 53 path through Jiquilpan was found. It was tossed without doing anything.",
            },
          },
          enlaces: [
            { url: "https://visualgo.net/es/sssp", texto: { es: "Dijkstra y Bellman-Ford animados (VisuAlgo)", en: "Dijkstra and Bellman-Ford animated (VisuAlgo)" } },
            { url: "https://es.wikipedia.org/wiki/Algoritmo_de_Dijkstra", texto: { es: "Algoritmo de Dijkstra (Wikipedia)", en: "Dijkstra's algorithm (Wikipedia, Spanish)" } },
          ],
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Por qué BFS no sirve para el camino más corto en kilómetros?", en: "Why doesn't BFS work for the shortest path in kilometers?" },
          opciones: [
            { es: "Porque cuenta tramos, no kilómetros", en: "Because it counts legs, not kilometers" },
            { es: "Porque se queda en ciclos infinitos", en: "Because it gets stuck in infinite loops" },
            { es: "Porque sólo sirve en árboles", en: "Because it only works on trees" },
          ],
          correcta: 0,
          porque: { es: "BFS encuentra el camino con menos aristas, como si todas pesaran 1. Con pesos distintos, el de menos aristas puede ser el más largo.", en: "BFS finds the path with the fewest edges, as if they all weighed 1. With different weights, the one with the fewest edges can be the longest." },
        },
        {
          tipo: "elige",
          pregunta: { es: "En los pueblos de la lección, ¿a cuántos kilómetros queda Jiquilpan de Sahuayo según Dijkstra?", en: "In the lesson's towns, how far is Jiquilpan from Sahuayo according to Dijkstra?" },
          opciones: ["6", "8", "10", "53"],
          correcta: 1,
          porque: { es: "El tramo directo mide 8; por Venustiano Carranza serían 6 + 4 = 10. Gana el directo.", en: "The direct leg is 8; via Venustiano Carranza it would be 6 + 4 = 10. The direct one wins." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué pasa si el grafo tiene aristas con peso negativo?", en: "What happens if the graph has negative-weight edges?" },
          opciones: [
            { es: "Dijkstra puede dar distancias equivocadas", en: "Dijkstra may give wrong distances" },
            { es: "Funciona igual, sólo más lento", en: "It works the same, just slower" },
            { es: "Se convierte en BFS", en: "It turns into BFS" },
          ],
          correcta: 0,
          porque: { es: "Dijkstra da por definitiva una distancia en cuanto la saca; una arista negativa más adelante podría mejorarla y ya no la revisaría. Para eso está Bellman-Ford.", en: "Dijkstra treats a distance as final as soon as it pops it; a negative edge later could improve it and it would never recheck. That's what Bellman-Ford is for." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa la relajación de una arista de `v` a `w` que mide `km`.", en: "Complete relaxing an edge from `v` to `w` that measures `km`." },
          codigo: "if (dist[v] + km ___ dist[w]) {\n  dist[w] = dist[v] ___ km;\n  previo[w] = ___;\n}",
          huecos: ["<", "+", "v"],
          banco: ["<", "+", "v", ">", "-", "w"],
          porque: { es: "Si llegar a `w` pasando por `v` es **más corto** que lo que tenía, se actualiza su distancia y se anota que vino de `v`.", en: "If reaching `w` through `v` is **shorter** than what it had, update its distance and note that it came from `v`." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `distancia(ady, origen, destino)`: el largo del camino más corto en un grafo **dirigido** con pesos no negativos, o `-1` si no se puede llegar. `ady` es un objeto donde cada vértice tiene sus `[vecino, peso]`, y todos los vértices aparecen como clave.\n\nLa versión O(V²) de la lección alcanza.",
            en: "Write `distancia(ady, origen, destino)`: the length of the shortest path in a **directed** graph with non-negative weights, or `-1` if it can't be reached. `ady` is an object where each vertex has its `[neighbor, weight]` pairs, and every vertex appears as a key.\n\nThe lesson's O(V²) version is enough.",
          },
          inicial: {
            es: "function distancia(ady, origen, destino) {\n  // dist con Infinity para todos y 0 en el origen; luego fija y relaja\n}\n\nconsole.log(distancia({ A: [[\"B\", 1], [\"C\", 4]], B: [[\"C\", 2]], C: [] }, \"A\", \"C\"));",
            en: "function distancia(ady, origen, destino) {\n  // dist with Infinity for all and 0 at the start; then settle and relax\n}\n\nconsole.log(distancia({ A: [[\"B\", 1], [\"C\", 4]], B: [[\"C\", 2]], C: [] }, \"A\", \"C\"));",
          },
          pruebas: [
            { llamada: "distancia({ A: [['B', 1], ['C', 4]], B: [['C', 2]], C: [] }, 'A', 'C')", espera: "3" },
            { llamada: "distancia({ A: [['B', 1], ['C', 4]], B: [['C', 2]], C: [] }, 'A', 'A')", espera: "0" },
            { llamada: "distancia({ A: [['B', 5]], B: [], C: [] }, 'A', 'C')", espera: "-1" },
            { llamada: "distancia({ A: [['B', 10], ['C', 1]], C: [['D', 1]], D: [['B', 1]], B: [] }, 'A', 'B')", espera: "3" },
          ],
          solucion: "function distancia(ady, origen, destino) {\n  const dist = {}, fijo = new Set();\n  for (const v in ady) dist[v] = Infinity;\n  dist[origen] = 0;\n  while (true) {\n    let v = null;\n    for (const u in ady) if (!fijo.has(u) && (v === null || dist[u] < dist[v])) v = u;\n    if (v === null || dist[v] === Infinity) break;\n    fijo.add(v);\n    for (const [w, peso] of ady[v]) {\n      if (dist[v] + peso < dist[w]) dist[w] = dist[v] + peso;\n    }\n  }\n  return dist[destino] === Infinity ? -1 : dist[destino];\n}",
          porque: { es: "Es el Dijkstra de la lección sin `previo`. La última prueba es la trampa: el tramo directo A → B pesa 10, pero A → C → D → B suma 3.", en: "It's the lesson's Dijkstra without `previo`. The last test is the trap: the direct A → B leg weighs 10, but A → C → D → B adds up to 3." },
        },
      ],
    },
    {
      id: "orden-topologico",
      titulo: { es: "Qué va primero: orden topológico", en: "What comes first: topological order" },
      resumen: {
        es: "Materias con prerrequisitos, tareas que dependen de otras: ponerlas en fila sin romper ninguna dependencia.",
        en: "Courses with prerequisites, tasks that depend on others: lining them up without breaking any dependency.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Dependencias como flechas", en: "Dependencies as arrows" },
          texto: {
            es: "Un plan de estudios inventado: Programación I (P1) antes de Programación II (P2); P2 antes de Estructuras de datos (ED); ED y Matemáticas discretas (MD) antes de Algoritmos (AL); y AL antes de Compiladores (CO). Cada «antes de» es una flecha.\n\nUn **orden topológico** es una fila de todos los vértices donde cada flecha apunta hacia adelante: nadie aparece antes que algo de lo que depende. Sólo existe si el grafo es dirigido y **sin ciclos**, un **DAG** (*directed acyclic graph*). Si A necesita a B y B necesita a A, no hay por dónde empezar.\n\nY casi nunca es único: MD puede ir al principio o justo antes de AL.",
            en: "A made-up study plan: Programming I (P1) before Programming II (P2); P2 before Data Structures (ED); ED and Discrete Math (MD) before Algorithms (AL); and AL before Compilers (CO). Each \"before\" is an arrow.\n\nA **topological order** is a line-up of all the vertices where every arrow points forward: nothing shows up before something it depends on. It only exists if the graph is directed and **acyclic**, a **DAG** (directed acyclic graph). If A needs B and B needs A, there's nowhere to start.\n\nAnd it's rarely unique: MD can go first or right before AL.",
          },
          dibujo: {
            tipo: "grafo",
            dirigido: true,
            nodos: [{ id: "P1", x: 30, y: 40 }, { id: "P2", x: 130, y: 40 }, { id: "ED", x: 230, y: 40 }, { id: "MD", x: 130, y: 150 }, { id: "AL", x: 330, y: 100 }, { id: "CO", x: 330, y: 200 }],
            aristas: [["P1", "P2"], ["P2", "ED"], ["ED", "AL"], ["MD", "AL"], ["AL", "CO"]],
          },
          programa: {
            codigo: {
              es: `const requisitos = [["P1", "P2"], ["P2", "ED"], ["ED", "AL"], ["MD", "AL"], ["AL", "CO"]];

function esValido(orden) {
  const pos = {};
  orden.forEach((m, i) => { pos[m] = i; });
  // cada flecha "antes -> después" tiene que apuntar hacia adelante
  return requisitos.every(([antes, despues]) => pos[antes] < pos[despues]);
}

console.log(esValido(["P1", "MD", "P2", "ED", "AL", "CO"]));
console.log(esValido(["MD", "P1", "P2", "ED", "AL", "CO"]));
console.log(esValido(["P1", "P2", "AL", "ED", "MD", "CO"]));`,
              en: `const requisitos = [["P1", "P2"], ["P2", "ED"], ["ED", "AL"], ["MD", "AL"], ["AL", "CO"]];

function esValido(orden) {
  const pos = {};
  orden.forEach((m, i) => { pos[m] = i; });
  // every "before -> after" arrow has to point forward
  return requisitos.every(([antes, despues]) => pos[antes] < pos[despues]);
}

console.log(esValido(["P1", "MD", "P2", "ED", "AL", "CO"]));
console.log(esValido(["MD", "P1", "P2", "ED", "AL", "CO"]));
console.log(esValido(["P1", "P2", "AL", "ED", "MD", "CO"]));`,
            },
            notas: {
              es: "- Los dos primeros órdenes son válidos aunque son distintos: MD puede ir en varios lugares.\n- El tercero no: pone Algoritmos antes que Estructuras de datos y que Discretas.",
              en: "- The first two orders are valid even though they differ: MD can go in several places.\n- The third isn't: it puts Algorithms before Data Structures and Discrete Math.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "El algoritmo de Kahn", en: "Kahn's algorithm" },
          texto: {
            es: "La forma más clara de armarlo es contar el **grado de entrada** de cada vértice: cuántas flechas le llegan, o sea, cuántas cosas le faltan.\n\n- Los de grado 0 no dependen de nada: van a una cola.\n- Se saca uno, se anota en el orden y se le resta 1 a cada vértice al que apunta (ya se cumplió ese requisito).\n- Al que llegue a 0 se le forma en la cola.\n\nSi al final el orden tiene menos vértices que el grafo, los que faltan están atorados en un **ciclo**: nunca llegaron a 0. Cuesta **O(V + E)**.",
            en: "The clearest way to build it is to count each vertex's **in-degree**: how many arrows point at it, that is, how many things it's still waiting for.\n\n- The ones with degree 0 depend on nothing: they go into a queue.\n- Take one out, add it to the order and subtract 1 from each vertex it points to (that requirement is now met).\n- Whoever reaches 0 joins the queue.\n\nIf at the end the order has fewer vertices than the graph, the missing ones are stuck in a **cycle**: they never reached 0. It costs **O(V + E)**.",
          },
          programa: {
            codigo: {
              es: `${MATERIAS}

function kahn(grafo) {
  const grado = {};
  for (const v in grafo) grado[v] = 0;
  for (const v in grafo) for (const w of grafo[v]) grado[w]++;
  console.log("grados de entrada:", grado);

  const cola = Object.keys(grafo).filter((v) => grado[v] === 0);
  const orden = [];
  let cabeza = 0;
  while (cabeza < cola.length) {
    const v = cola[cabeza++];
    orden.push(v);
    for (const w of grafo[v]) {
      grado[w]--;                      // un requisito menos
      if (grado[w] === 0) cola.push(w);
    }
  }
  // si faltan vértices, quedaron atorados en un ciclo
  return orden.length === Object.keys(grafo).length ? orden : null;
}

console.log(kahn(grafo));
console.log(kahn({ A: ["B"], B: ["C"], C: ["A"] }));`,
              en: `${MATERIAS}

function kahn(grafo) {
  const grado = {};
  for (const v in grafo) grado[v] = 0;
  for (const v in grafo) for (const w of grafo[v]) grado[w]++;
  console.log("in-degrees:", grado);

  const cola = Object.keys(grafo).filter((v) => grado[v] === 0);
  const orden = [];
  let cabeza = 0;
  while (cabeza < cola.length) {
    const v = cola[cabeza++];
    orden.push(v);
    for (const w of grafo[v]) {
      grado[w]--;                      // one requirement fewer
      if (grado[w] === 0) cola.push(w);
    }
  }
  // if vertices are missing, they got stuck in a cycle
  return orden.length === Object.keys(grafo).length ? orden : null;
}

console.log(kahn(grafo));
console.log(kahn({ A: ["B"], B: ["C"], C: ["A"] }));`,
            },
            notas: {
              es: "- P1 y MD empiezan con grado 0; AL empieza con 2 (le faltan ED y MD).\n- Sale `[P1, MD, P2, ED, AL, CO]`: AL sólo entra a la cola cuando ED y MD ya salieron.\n- En el triángulo A → B → C → A nadie empieza en 0: devuelve `null`. (Los grados salen dos veces porque `kahn` se llama dos veces.)",
              en: "- P1 and MD start at degree 0; AL starts at 2 (it's waiting on ED and MD).\n- Out comes `[P1, MD, P2, ED, AL, CO]`: AL only joins the queue once ED and MD are out.\n- In the triangle A → B → C → A nobody starts at 0: it returns `null`. (The degrees print twice because `kahn` is called twice.)",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Con DFS, y para qué se usa", en: "With DFS, and what it's for" },
          texto: {
            es: "Otra forma: un DFS que anota cada vértice **al terminar** con todo lo que depende de él. Esa lista, al revés, es un orden topológico. Da otro orden igual de válido (para detectar ciclos así hay que distinguir «visitando» de «terminado», que aquí se omite).\n\nEsto está en más lugares de los que parece: npm decide en qué orden instalar paquetes, `make` en qué orden compilar archivos, una hoja de cálculo en qué orden recalcular celdas que dependen de otras, y una receta en qué orden hacer los pasos.",
            en: "Another way: a DFS that writes down each vertex **when it finishes** with everything that depends on it. That list, reversed, is a topological order. It gives a different but equally valid order (to detect cycles this way you need to tell \"visiting\" from \"done\", skipped here).\n\nThis shows up in more places than it seems: npm deciding what order to install packages in, `make` deciding what order to compile files in, a spreadsheet deciding what order to recalculate cells that depend on others, and a recipe deciding what order to do the steps in.",
          },
          programa: {
            codigo: {
              es: `${MATERIAS}

function topoDFS(grafo) {
  const visto = new Set(), salida = [];
  function visitar(v) {
    if (visto.has(v)) return;
    visto.add(v);
    for (const w of grafo[v]) visitar(w);
    salida.push(v);   // termina después de todo lo que depende de él
  }
  for (const v in grafo) visitar(v);
  console.log("al terminar:", salida);
  return salida.reverse();
}

console.log(topoDFS(grafo));`,
              en: `${MATERIAS}

function topoDFS(grafo) {
  const visto = new Set(), salida = [];
  function visitar(v) {
    if (visto.has(v)) return;
    visto.add(v);
    for (const w of grafo[v]) visitar(w);
    salida.push(v);   // finishes after everything that depends on it
  }
  for (const v in grafo) visitar(v);
  console.log("on finish:", salida);
  return salida.reverse();
}

console.log(topoDFS(grafo));`,
            },
            notas: {
              es: "- Al terminar sale CO primero (nada depende de él) y P1 casi al final.\n- Al revés queda `[MD, P1, P2, ED, AL, CO]`: distinto al de Kahn y también válido.",
              en: "- On finish, CO comes out first (nothing depends on it) and P1 near the end.\n- Reversed it's `[MD, P1, P2, ED, AL, CO]`: different from Kahn's and also valid.",
            },
          },
          enlaces: [{ url: "https://es.wikipedia.org/wiki/Ordenamiento_topol%C3%B3gico", texto: { es: "Ordenamiento topológico (Wikipedia)", en: "Topological sorting (Wikipedia, Spanish)" } }],
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué grafos tienen orden topológico?", en: "Which graphs have a topological order?" },
          opciones: [
            { es: "Los dirigidos sin ciclos (DAG)", en: "Directed acyclic graphs (DAGs)" },
            { es: "Todos los dirigidos", en: "All directed graphs" },
            { es: "Los no dirigidos", en: "Undirected graphs" },
            { es: "Sólo los árboles", en: "Only trees" },
          ],
          correcta: 0,
          porque: { es: "Con un ciclo no hay por dónde empezar, y sin flechas no hay «antes» ni «después». Los árboles dirigidos son DAG, pero no los únicos: AL tiene dos requisitos y en un árbol no podría.", en: "With a cycle there's nowhere to start, and without arrows there's no \"before\" or \"after\". Directed trees are DAGs, but not the only ones: AL has two prerequisites, which a tree wouldn't allow." },
        },
        {
          tipo: "elige",
          pregunta: { es: "En el algoritmo de Kahn, ¿quiénes entran a la cola al principio?", en: "In Kahn's algorithm, who goes into the queue at the start?" },
          opciones: [
            { es: "Los que tienen grado de entrada 0", en: "Those with in-degree 0" },
            { es: "Los que tienen más flechas de salida", en: "Those with the most outgoing arrows" },
            { es: "Todos los vértices", en: "Every vertex" },
            { es: "El último de la lista", en: "The last one in the list" },
          ],
          correcta: 0,
          porque: { es: "Grado de entrada 0 quiere decir que no les falta nada: se pueden hacer ya.", en: "In-degree 0 means they aren't waiting on anything: they can be done right away." },
        },
        {
          tipo: "elige",
          pregunta: { es: "Kahn terminó y el orden tiene 4 vértices, pero el grafo tiene 6. ¿Qué pasó?", en: "Kahn finished and the order has 4 vertices, but the graph has 6. What happened?" },
          opciones: [
            { es: "Hay un ciclo: dos vértices nunca llegaron a grado 0", en: "There's a cycle: two vertices never reached degree 0" },
            { es: "Dos vértices no tenían aristas", en: "Two vertices had no edges" },
            { es: "La cola se llenó", en: "The queue filled up" },
          ],
          correcta: 0,
          porque: { es: "Un vértice sin aristas tiene grado 0 y entra desde el principio. Los únicos que nunca entran son los que dependen, directa o indirectamente, de sí mismos.", en: "A vertex with no edges has degree 0 and goes in from the start. The only ones that never get in are those that depend, directly or indirectly, on themselves." },
        },
        {
          tipo: "ordena",
          pregunta: { es: "Ordena los pasos de Kahn.", en: "Put Kahn's steps in order." },
          lineas: [
            "for (const v in grafo) grado[v] = 0;",
            "for (const v in grafo) for (const w of grafo[v]) grado[w]++;",
            "const cola = Object.keys(grafo).filter((v) => grado[v] === 0);",
            "while (cabeza < cola.length) { /* sacar, anotar, restar */ }",
            "return orden.length === n ? orden : null;",
          ],
          porque: { es: "Grados en cero, contar las flechas que llegan, formar a los de grado 0, procesar la cola y al final revisar si alguien quedó atorado en un ciclo.", en: "Degrees at zero, count the incoming arrows, queue up the degree-0 ones, process the queue and finally check whether anyone got stuck in a cycle." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `ordenTopologico(grafo)`: devuelve un arreglo con un orden topológico de `grafo` (un objeto de vértice a arreglo de vértices a los que apunta), o `null` si tiene un ciclo. Todos los vértices aparecen como clave.",
            en: "Write `ordenTopologico(grafo)`: return an array with a topological order of `grafo` (an object from vertex to the array of vertices it points to), or `null` if it has a cycle. Every vertex appears as a key.",
          },
          inicial: {
            es: "function ordenTopologico(grafo) {\n  // Kahn: grados de entrada, cola con los de grado 0, y restar\n  return [];\n}\n\nconsole.log(ordenTopologico({ a: [\"b\"], b: [\"c\"], c: [] }));",
            en: "function ordenTopologico(grafo) {\n  // Kahn: in-degrees, a queue with the degree-0 ones, and subtract\n  return [];\n}\n\nconsole.log(ordenTopologico({ a: [\"b\"], b: [\"c\"], c: [] }));",
          },
          pruebas: [
            { llamada: "ordenTopologico({ a: ['b'], b: ['c'], c: [] })", espera: "[\"a\",\"b\",\"c\"]" },
            { llamada: "(() => { const o = ordenTopologico({ calcetines: ['zapatos'], pantalon: ['zapatos'], zapatos: [] }); return o.length === 3 && o[2] === 'zapatos'; })()", espera: "true" },
            { llamada: "ordenTopologico({ a: ['b'], b: ['a'] })", espera: "null" },
            { llamada: "ordenTopologico({ x: [] })", espera: "[\"x\"]" },
          ],
          solucion: "function ordenTopologico(grafo) {\n  const grado = {};\n  for (const v in grafo) grado[v] = 0;\n  for (const v in grafo) for (const w of grafo[v]) grado[w]++;\n  const cola = Object.keys(grafo).filter((v) => grado[v] === 0);\n  const orden = [];\n  let cabeza = 0;\n  while (cabeza < cola.length) {\n    const v = cola[cabeza++];\n    orden.push(v);\n    for (const w of grafo[v]) {\n      grado[w]--;\n      if (grado[w] === 0) cola.push(w);\n    }\n  }\n  return orden.length === Object.keys(grafo).length ? orden : null;\n}",
          porque: { es: "Es Kahn tal cual. La segunda prueba no pide un orden exacto, porque calcetines y pantalón pueden ir en cualquier orden: sólo revisa que los zapatos vayan al final.", en: "It's Kahn as is. The second test doesn't ask for an exact order, because socks and pants can go either way: it only checks that the shoes go last." },
        },
      ],
    },
  ],
};
