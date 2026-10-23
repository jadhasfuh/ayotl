import type { Unidad } from "../tipos";

// Subir y bajar en un montículo mínimo de números. Los programas de la
// unidad lo repiten para correr solos.
const SUBIR = `function subir(heap, i) {
  while (i > 0) {
    const p = (i - 1) >> 1;
    if (heap[p] <= heap[i]) break;
    [heap[p], heap[i]] = [heap[i], heap[p]];
    i = p;
  }
}`;

const BAJAR = `function bajar(heap, i) {
  const n = heap.length;
  while (true) {
    const izq = 2 * i + 1, der = 2 * i + 2;
    let menor = i;
    if (izq < n && heap[izq] < heap[menor]) menor = izq;
    if (der < n && heap[der] < heap[menor]) menor = der;
    if (menor === i) break;
    [heap[menor], heap[i]] = [heap[i], heap[menor]];
    i = menor;
  }
}`;

const METER_SACAR = `${SUBIR}

${BAJAR}

function meter(heap, valor) {
  heap.push(valor);
  subir(heap, heap.length - 1);
}

function sacar(heap) {
  const min = heap[0];
  const ultimo = heap.pop();
  if (heap.length > 0) {
    heap[0] = ultimo;
    bajar(heap, 0);
  }
  return min;
}`;

// La cola de prioridad: un montículo de parejas [prioridad, dato].
const COLA = `class ColaPrioridad {
  constructor() { this.heap = []; }
  get tamano() { return this.heap.length; }

  meter(prioridad, dato) {
    const h = this.heap;
    h.push([prioridad, dato]);
    let i = h.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (h[p][0] <= h[i][0]) break;
      [h[p], h[i]] = [h[i], h[p]];
      i = p;
    }
  }

  sacar() {
    const h = this.heap;
    const arriba = h[0];
    const ultimo = h.pop();
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
    return arriba[1];
  }
}`;

export const U09: Unidad = {
  id: "monticulos",
  titulo: { es: "Montículos", en: "Heaps" },
  lecciones: [
    {
      id: "monticulo-en-arreglo",
      titulo: { es: "Un árbol guardado en un arreglo", en: "A tree stored in an array" },
      resumen: {
        es: "El montículo mínimo: el más chico siempre arriba, sin punteros, y meter o sacar en O(log n).",
        en: "The min-heap: the smallest always on top, no pointers, and push or pop in O(log n).",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "El más chico, siempre arriba", en: "The smallest, always on top" },
          texto: {
            es: "Un **montículo mínimo** (*min-heap*) es un árbol binario con dos reglas:\n\n- Cada padre es **menor o igual** que sus hijos. Por eso la raíz es el mínimo de todo.\n- Es **completo**: se llena por niveles, de izquierda a derecha, sin huecos.\n\nNo está ordenado del todo: entre hermanos o primos no hay ninguna regla. Sólo promete una cosa, que el más chico está arriba, y eso es justo lo que lo hace barato.\n\nComo no tiene huecos, no necesita nodos ni punteros: se guarda en un **arreglo**, nivel por nivel. Los hijos de la posición `i` están en `2i + 1` y `2i + 2`, y su padre en `(i - 1) >> 1` (dividir entre 2 y quitar decimales).",
            en: "A **min-heap** is a binary tree with two rules:\n\n- Every parent is **less than or equal to** its children. So the root is the minimum of everything.\n- It's **complete**: it fills level by level, left to right, with no gaps.\n\nIt isn't fully sorted: there's no rule between siblings or cousins. It promises only one thing, that the smallest is on top, and that's exactly what makes it cheap.\n\nSince it has no gaps, it needs no nodes or pointers: it's stored in an **array**, level by level. The children of position `i` are at `2i + 1` and `2i + 2`, and its parent at `(i - 1) >> 1` (divide by 2 and drop the decimals).",
          },
          dibujo: { tipo: "arbol", valores: [1, 3, 2, 7, 4, 5, 8] },
          programa: {
            codigo: {
              es: `// El árbol del dibujo, guardado por niveles
const heap = [1, 3, 2, 7, 4, 5, 8];

for (let i = 0; i < heap.length; i++) {
  const izq = 2 * i + 1, der = 2 * i + 2;
  if (izq < heap.length) {
    console.log("posición", i, "valor", heap[i], "-> hijos", heap[izq], heap[der]);
  }
}
console.log("el padre de la posición 5 es", heap[(5 - 1) >> 1]);
console.log("el mínimo:", heap[0]);`,
              en: `// The tree in the drawing, stored level by level
const heap = [1, 3, 2, 7, 4, 5, 8];

for (let i = 0; i < heap.length; i++) {
  const izq = 2 * i + 1, der = 2 * i + 2;
  if (izq < heap.length) {
    console.log("position", i, "value", heap[i], "-> children", heap[izq], heap[der]);
  }
}
console.log("the parent of position 5 is", heap[(5 - 1) >> 1]);
console.log("the minimum:", heap[0]);`,
            },
            notas: {
              es: "- Cada padre es menor que sus dos hijos: 1 → 3 y 2; 3 → 7 y 4; 2 → 5 y 8.\n- La posición 5 (el 5) tiene de padre a la 2 (el 2).\n- El mínimo está en `heap[0]`: leerlo cuesta O(1).",
              en: "- Every parent is smaller than both children: 1 → 3 and 2; 3 → 7 and 4; 2 → 5 and 8.\n- Position 5 (the 5) has position 2 (the 2) as its parent.\n- The minimum is at `heap[0]`: reading it costs O(1).",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Meter: al final, y subir", en: "Pushing: at the end, then up" },
          texto: {
            es: "Para meter un valor sin romper la forma, va **al final** del arreglo (el siguiente hueco del último nivel). Luego **sube**: mientras sea menor que su padre, se intercambian.\n\nComo el árbol es completo, su altura es log₂ n, y subir da a lo más esa cantidad de pasos: **O(log n)**. Mira cómo queda el arreglo después de cada valor.",
            en: "To push a value without breaking the shape, it goes **at the end** of the array (the next slot on the last level). Then it **moves up**: while it's smaller than its parent, they swap.\n\nSince the tree is complete, its height is log₂ n, and moving up takes at most that many steps: **O(log n)**. Watch the array after each value.",
          },
          programa: {
            codigo: `${SUBIR}

function meter(heap, valor) {
  heap.push(valor);
  subir(heap, heap.length - 1);
}

const heap = [];
for (const v of [5, 3, 8, 1, 9, 2]) {
  meter(heap, v);
  console.log(v, "->", heap);
}`,
            notas: {
              es: "- Al meter el 1 entra al final, `[3, 5, 8, 1]`, y sube dos veces: pasa al 5 y luego al 3, hasta quedar en la raíz.\n- El 9 no sube nada: ya es mayor que su padre.\n- El 2 sube una vez y se queda bajo el 1. El arreglo final no está ordenado, pero el mínimo está en la posición 0.",
              en: "- The 1 enters at the end, `[3, 5, 8, 1]`, and moves up twice: past 5 and then past 3, until it's the root.\n- The 9 doesn't move at all: it's already bigger than its parent.\n- The 2 moves up once and stays under the 1. The final array isn't sorted, but the minimum is at position 0.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Sacar el mínimo: el último arriba, y bajar", en: "Popping the minimum: last one on top, then down" },
          texto: {
            es: "El mínimo es la raíz. Para quitarla sin dejar hueco, el **último** elemento pasa a la raíz y **baja**: se intercambia con el **menor** de sus dos hijos mientras alguno sea menor que él. También es **O(log n)**.\n\nSi sacas el mínimo una y otra vez, los valores salen en orden: eso es **heapsort**, ordenar en O(n log n) sin memoria extra.",
            en: "The minimum is the root. To remove it without leaving a gap, the **last** element moves to the root and **moves down**: it swaps with the **smaller** of its two children while either one is smaller than it. Also **O(log n)**.\n\nIf you pop the minimum over and over, the values come out in order: that's **heapsort**, sorting in O(n log n) with no extra memory.",
          },
          programa: {
            codigo: `${BAJAR}

function sacar(heap) {
  const min = heap[0];
  const ultimo = heap.pop();
  if (heap.length > 0) {
    heap[0] = ultimo;
    bajar(heap, 0);
  }
  return min;
}

const heap = [1, 3, 2, 5, 9, 8];
console.log(sacar(heap), heap);

const salen = [];
while (heap.length > 0) salen.push(sacar(heap));
console.log(salen);`,
            notas: {
              es: "- Al sacar el 1, el 8 (el último) pasa a la raíz y baja hasta su lugar: queda `[2, 3, 8, 5, 9]`.\n- Sacando todo, sale `[2, 3, 5, 8, 9]`: ordenado.\n- El `if` cuida el caso de un solo elemento: sin él, el último volvería a entrar después de sacarlo.",
              en: "- Popping 1 moves 8 (the last one) to the root and it sinks to its place: `[2, 3, 8, 5, 9]`.\n- Popping everything gives `[2, 3, 5, 8, 9]`: sorted.\n- The `if` handles the single-element case: without it, the last item would come back right after being removed.",
            },
          },
          enlaces: [{ url: "https://visualgo.net/es/heap", texto: { es: "Montículo animado: meter, sacar y heapsort (VisuAlgo)", en: "Heap animated: push, pop and heapsort (VisuAlgo)" } }],
        },
        {
          tipo: "elige",
          pregunta: { es: "En un montículo guardado en arreglo, ¿en qué posiciones están los hijos de la posición 3?", en: "In a heap stored in an array, at which positions are the children of position 3?" },
          opciones: ["4 y 5", "6 y 7", "7 y 8", "1 y 2"],
          correcta: 2,
          porque: { es: "`2·3 + 1 = 7` y `2·3 + 2 = 8`.", en: "`2·3 + 1 = 7` and `2·3 + 2 = 8`." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Cuál de estos arreglos es un montículo mínimo válido?", en: "Which of these arrays is a valid min-heap?" },
          opciones: ["[1, 4, 2, 5, 6, 3]", "[2, 1, 3]", "[1, 5, 2, 4]", "[3, 4, 5, 1]"],
          correcta: 0,
          porque: { es: "En `[1, 4, 2, 5, 6, 3]` cada padre es menor que sus hijos: 1 con 4 y 2, 4 con 5 y 6, 2 con 3. En los otros, algún hijo es menor que su padre: el 1 bajo el 2, el 4 bajo el 5, el 1 bajo el 4.", en: "In `[1, 4, 2, 5, 6, 3]` every parent is smaller than its children: 1 over 4 and 2, 4 over 5 and 6, 2 over 3. In the others some child is smaller than its parent: 1 under 2, 4 under 5, 1 under 4." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Cuánto cuesta sacar el mínimo de un montículo de n elementos?", en: "How much does popping the minimum from a heap of n items cost?" },
          opciones: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
          correcta: 1,
          porque: { es: "**Leer** el mínimo es O(1), pero **sacarlo** obliga a bajar el último desde la raíz: a lo más la altura, log n.", en: "**Reading** the minimum is O(1), but **removing** it means sinking the last item from the root: at most the height, log n." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa el ciclo de `subir`.", en: "Complete the `subir` loop." },
          codigo: "while (i > 0) {\n  const p = (i - 1) ___ 1;\n  if (heap[p] <= heap[i]) ___;\n  [heap[p], heap[i]] = [heap[i], heap[___]];\n  i = p;\n}",
          huecos: [">>", "break", "p"],
          banco: [">>", "break", "p", "<<", "continue", "i"],
          porque: { es: "`(i - 1) >> 1` es el padre. Si el padre ya es menor o igual, la regla se cumple y se para con `break`. Si no, se intercambian y se sigue subiendo desde `p`.", en: "`(i - 1) >> 1` is the parent. If the parent is already less than or equal, the rule holds and `break` stops. Otherwise they swap and keep going up from `p`." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `esMonticulo(arr)`: `true` si cada padre es menor o igual que sus hijos (con hijos en `2i + 1` y `2i + 2`), `false` si no. Un arreglo vacío sí es montículo.",
            en: "Write `esMonticulo(arr)`: `true` if every parent is less than or equal to its children (children at `2i + 1` and `2i + 2`), `false` otherwise. An empty array is a heap.",
          },
          inicial: {
            es: "function esMonticulo(arr) {\n  // revisa a cada hijo contra su padre, o a cada padre contra sus hijos\n}\n\nconsole.log(esMonticulo([1, 4, 2, 5, 6, 3]));",
            en: "function esMonticulo(arr) {\n  // check each child against its parent, or each parent against its children\n}\n\nconsole.log(esMonticulo([1, 4, 2, 5, 6, 3]));",
          },
          pruebas: [
            { llamada: "esMonticulo([1, 4, 2, 5, 6, 3])", espera: "true" },
            { llamada: "esMonticulo([2, 1, 3])", espera: "false" },
            { llamada: "esMonticulo([1, 5, 2, 4])", espera: "false" },
            { llamada: "esMonticulo([])", espera: "true" },
            { llamada: "esMonticulo([7, 7, 7])", espera: "true" },
          ],
          solucion: "function esMonticulo(arr) {\n  for (let i = 1; i < arr.length; i++) {\n    if (arr[(i - 1) >> 1] > arr[i]) return false;\n  }\n  return true;\n}",
          porque: { es: "Basta con recorrer a cada hijo (de la posición 1 en adelante) y compararlo con su padre `(i - 1) >> 1`. Es O(n). Los iguales están permitidos: «menor **o igual**».", en: "It's enough to walk every child (from position 1 on) and compare it with its parent `(i - 1) >> 1`. That's O(n). Equal values are allowed: \"less than **or equal**\"." },
        },
      ],
      enlaces: [{ url: "https://es.wikipedia.org/wiki/Mont%C3%ADculo_(inform%C3%A1tica)", texto: { es: "Montículo (Wikipedia)", en: "Heap (Wikipedia, Spanish)" } }],
    },
    {
      id: "cola-de-prioridad",
      titulo: { es: "Colas de prioridad", en: "Priority queues" },
      resumen: {
        es: "Sale primero el más urgente, no el primero que llegó. Y los k más grandes de un millón sin ordenar el millón.",
        en: "The most urgent goes first, not the first to arrive. And the k largest out of a million without sorting the million.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Sale el más urgente", en: "The most urgent goes first" },
          texto: {
            es: "En una **cola de prioridad** cada cosa entra con un número de prioridad, y siempre sale la de prioridad más baja (la más urgente), no la que llegó primero. Como en urgencias: una fractura pasa antes que una receta, aunque la receta haya llegado antes.\n\nSe arma con un montículo de parejas `[prioridad, dato]` que compara sólo la prioridad. Meter y sacar cuestan O(log n). La usan los planificadores de tareas, los juegos que ordenan eventos por tiempo y, en la siguiente unidad, Dijkstra.",
            en: "In a **priority queue** each item comes in with a priority number, and the one with the lowest priority (the most urgent) always comes out, not the one that arrived first. Like an emergency room: a broken bone goes before a prescription, even if the prescription came first.\n\nIt's built from a heap of `[priority, data]` pairs that compares only the priority. Push and pop cost O(log n). Task schedulers use it, games use it to order events by time and, in the next unit, so does Dijkstra.",
          },
          programa: {
            codigo: {
              es: `${COLA}

const urgencias = new ColaPrioridad();
urgencias.meter(3, "tos");
urgencias.meter(5, "receta");
urgencias.meter(1, "fractura");
urgencias.meter(2, "fiebre alta");

while (urgencias.tamano > 0) {
  console.log(urgencias.sacar());
}`,
              en: `${COLA}

const urgencias = new ColaPrioridad();
urgencias.meter(3, "cough");
urgencias.meter(5, "prescription");
urgencias.meter(1, "broken bone");
urgencias.meter(2, "high fever");

while (urgencias.tamano > 0) {
  console.log(urgencias.sacar());
}`,
            },
            notas: {
              es: "Entraron tos, receta, fractura y fiebre; salen por prioridad: fractura (1), fiebre alta (2), tos (3), receta (5). La clase es el montículo de la lección anterior, mirando sólo `[0]` de cada pareja.",
              en: "They came in as cough, prescription, broken bone and fever; they leave by priority: broken bone (1), high fever (2), cough (3), prescription (5). The class is last lesson's heap, looking only at `[0]` of each pair.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Los k más grandes", en: "The k largest" },
          texto: {
            es: "Un truco muy usado: para quedarte con los **k más grandes** de una lista enorme no hace falta ordenarla. Se usa un montículo **mínimo** de tamaño k: cada valor entra, y si el montículo pasa de k, se saca el mínimo. Lo que sobrevive son los k más grandes, y arriba está el más chico de ellos.\n\nCuesta **O(n log k)** y sólo guarda k cosas. Con un millón de valores y k = 10, es mucho menos trabajo que ordenar el millón.",
            en: "A popular trick: to keep the **k largest** of a huge list you don't need to sort it. Use a **min**-heap of size k: every value goes in, and if the heap grows past k, pop the minimum. What survives are the k largest, with the smallest of them on top.\n\nIt costs **O(n log k)** and only stores k things. With a million values and k = 10, that's far less work than sorting the million.",
          },
          programa: {
            codigo: {
              es: `${METER_SACAR}

function kMayores(arr, k) {
  const heap = [];
  for (const x of arr) {
    meter(heap, x);
    if (heap.length > k) sacar(heap);   // fuera el más chico
  }
  return heap;
}

const ventas = [120, 45, 300, 80, 210, 95, 400, 60];
const top = kMayores(ventas, 3);
console.log(top);
console.log("el tercer lugar:", top[0]);`,
              en: `${METER_SACAR}

function kMayores(arr, k) {
  const heap = [];
  for (const x of arr) {
    meter(heap, x);
    if (heap.length > k) sacar(heap);   // out goes the smallest
  }
  return heap;
}

const ventas = [120, 45, 300, 80, 210, 95, 400, 60];
const top = kMayores(ventas, 3);
console.log(top);
console.log("third place:", top[0]);`,
            },
            notas: {
              es: "- Quedan 210, 300 y 400, en orden de montículo, no ordenados: `[210, 400, 300]`.\n- `top[0]` es el más chico de los tres: el tercer lugar, sin ordenar nada.",
              en: "- 210, 300 and 400 remain, in heap order, not sorted: `[210, 400, 300]`.\n- `top[0]` is the smallest of the three: third place, without sorting anything.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Empates, y lo que traen otros lenguajes", en: "Ties, and what other languages ship" },
          texto: {
            es: "Un montículo no respeta el orden de llegada entre iguales: si dos pacientes tienen prioridad 2, puede salir primero el que llegó después. Cuando eso importa, la prioridad se hace pareja: `[prioridad, turno]`, con un contador que crece en cada `meter`. Así el empate lo rompe el turno.\n\nJavaScript no trae cola de prioridad; hay que escribirla, como aquí. Otros lenguajes sí: `heapq` en Python (un montículo mínimo sobre una lista), `PriorityQueue` en Java y `priority_queue` en C++ (ésta, de máximos).",
            en: "A heap doesn't respect arrival order among equals: if two patients both have priority 2, the one who arrived later may go first. When that matters, make the priority a pair: `[priority, turn]`, with a counter that grows on every push. Then the turn breaks the tie.\n\nJavaScript doesn't ship a priority queue; you have to write it, like here. Other languages do: `heapq` in Python (a min-heap over a list), `PriorityQueue` in Java and `priority_queue` in C++ (that one's a max-heap).",
          },
          programa: {
            codigo: {
              es: `${COLA}

// La prioridad compara primero la urgencia y, si empatan, el turno
let turno = 0;
const prioridad = (urgencia) => urgencia * 1000 + turno++;

const cola = new ColaPrioridad();
for (const [urgencia, quien] of [[2, "Ana"], [2, "Beto"], [1, "Caro"], [2, "Dani"], [2, "Eli"]]) {
  cola.meter(prioridad(urgencia), quien);
}
const orden = [];
while (cola.tamano > 0) orden.push(cola.sacar());
console.log(orden);`,
              en: `${COLA}

// The priority compares urgency first and, on a tie, the turn
let turno = 0;
const prioridad = (urgencia) => urgencia * 1000 + turno++;

const cola = new ColaPrioridad();
for (const [urgencia, quien] of [[2, "Ana"], [2, "Beto"], [1, "Caro"], [2, "Dani"], [2, "Eli"]]) {
  cola.meter(prioridad(urgencia), quien);
}
const orden = [];
while (cola.tamano > 0) orden.push(cola.sacar());
console.log(orden);`,
            },
            notas: {
              es: "Caro sale primero (urgencia 1) y luego los de urgencia 2 en el orden en que llegaron: Ana, Beto, Dani, Eli. El truco de `urgencia * 1000 + turno` mete la pareja en un solo número (vale mientras haya menos de mil turnos); con la pareja de verdad se comparan dos campos.",
              en: "Caro goes first (urgency 1) and then the urgency-2 ones in arrival order: Ana, Beto, Dani, Eli. The `urgencia * 1000 + turno` trick packs the pair into one number (fine while there are fewer than a thousand turns); with a real pair you compare two fields.",
            },
          },
          enlaces: [{ url: "https://docs.python.org/es/3/library/heapq.html", texto: { es: "heapq, la cola de prioridad de Python", en: "heapq, Python's priority queue (Spanish docs)" } }],
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué imprime?", en: "What does it print?" },
          codigo: "const c = new ColaPrioridad();\nc.meter(4, \"a\");\nc.meter(2, \"b\");\nc.meter(9, \"c\");\nconsole.log(c.sacar());",
          opciones: ["a", "b", "c", "undefined"],
          correcta: 1,
          porque: { es: "Sale la prioridad más baja, el 2, que es la de «b», aunque «a» llegó antes.", en: "The lowest priority comes out, 2, which belongs to \"b\", even though \"a\" arrived first." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Cuánto cuesta quedarte con los k más grandes de n valores usando un montículo de tamaño k?", en: "How much does keeping the k largest of n values cost with a heap of size k?" },
          opciones: ["O(k)", "O(n log k)", "O(n²)", "O(k log n)"],
          correcta: 1,
          porque: { es: "Cada uno de los n valores entra (y quizá sale) de un montículo que nunca pasa de k: `n` veces `log k`.", en: "Each of the n values goes into (and maybe out of) a heap that never exceeds k: `n` times `log k`." },
        },
        {
          tipo: "elige",
          pregunta: { es: "Para los k **más grandes**, ¿qué montículo de tamaño k se usa?", en: "For the k **largest**, which heap of size k do you use?" },
          opciones: [
            { es: "Uno mínimo: así es fácil echar al más chico", en: "A min-heap: so it's easy to evict the smallest" },
            { es: "Uno máximo: para tener al más grande arriba", en: "A max-heap: to keep the largest on top" },
            { es: "Da igual", en: "It doesn't matter" },
          ],
          correcta: 0,
          porque: { es: "Al pasarse de k hay que tirar al **más chico** de los que llevas, y eso es lo que un montículo mínimo tiene a la mano en la raíz.", en: "When you go past k you need to drop the **smallest** of what you have, and that's exactly what a min-heap keeps handy at the root." },
        },
        {
          tipo: "ordena",
          pregunta: { es: "Ordena los renglones de `sacar` (supón que quedan elementos después de sacar).", en: "Put the lines of `sacar` in order (assume items remain after popping)." },
          lineas: ["const min = heap[0];", "const ultimo = heap.pop();", "heap[0] = ultimo;", "bajar(heap, 0);", "return min;"],
          porque: { es: "Se guarda el mínimo antes de pisarlo; se quita el último, se pone en la raíz, se baja a su lugar y se devuelve lo guardado.", en: "Save the minimum before overwriting it; remove the last item, put it at the root, sink it to its place and return what you saved." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `kMayores(arr, k)`: devuelve los `k` valores más grandes, **ordenados de menor a mayor**. Ya tienes `meter` y `sacar` de un montículo mínimo.\n\nPista: tras el ciclo, el montículo tiene los k más grandes; sacarlos uno por uno los da en orden.",
            en: "Write `kMayores(arr, k)`: return the `k` largest values, **sorted smallest to largest**. You already have `meter` and `sacar` for a min-heap.\n\nHint: after the loop, the heap holds the k largest; popping them one by one gives them in order.",
          },
          inicial: {
            es: `${METER_SACAR}

function kMayores(arr, k) {
  const heap = [];
  // tu código aquí
  return [];
}

console.log(kMayores([5, 1, 9, 3, 7, 2, 8], 3));`,
            en: `${METER_SACAR}

function kMayores(arr, k) {
  const heap = [];
  // your code here
  return [];
}

console.log(kMayores([5, 1, 9, 3, 7, 2, 8], 3));`,
          },
          pruebas: [
            { llamada: "kMayores([5, 1, 9, 3, 7, 2, 8], 3)", espera: "[7,8,9]" },
            { llamada: "kMayores([4, 4, 1], 2)", espera: "[4,4]" },
            { llamada: "kMayores([10], 1)", espera: "[10]" },
            { llamada: "kMayores([3, 1, 2], 0)", espera: "[]" },
          ],
          solucion: `${METER_SACAR}

function kMayores(arr, k) {
  const heap = [];
  for (const x of arr) {
    meter(heap, x);
    if (heap.length > k) sacar(heap);
  }
  const salida = [];
  while (heap.length > 0) salida.push(sacar(heap));
  return salida;
}`,
          porque: { es: "El ciclo deja en el montículo los k más grandes (O(n log k)) y vaciarlo los da del menor al mayor (O(k log k)). Con k = 0 todo entra y sale de inmediato.", en: "The loop leaves the k largest in the heap (O(n log k)) and emptying it gives them smallest to largest (O(k log k)). With k = 0 everything goes in and right back out." },
        },
      ],
      retos: ["top-k-frequent-elements"],
    },
  ],
};
