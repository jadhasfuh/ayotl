import type { Unidad } from "../tipos";

// Lo que comparten los programas de la unidad: el nodo, insertar y armar un
// árbol a partir de una lista. Cada programa lo repite para correr solo.
const BASE = `class Nodo {
  constructor(valor) {
    this.valor = valor;
    this.izq = null;
    this.der = null;
  }
}

function insertar(raiz, valor) {
  if (raiz === null) return new Nodo(valor);
  if (valor < raiz.valor) raiz.izq = insertar(raiz.izq, valor);
  else if (valor > raiz.valor) raiz.der = insertar(raiz.der, valor);
  return raiz;
}

function armar(valores) {
  let raiz = null;
  for (const v of valores) raiz = insertar(raiz, v);
  return raiz;
}`;

const INORDEN = `function inorden(nodo, salida = []) {
  if (nodo === null) return salida;
  inorden(nodo.izq, salida);
  salida.push(nodo.valor);
  inorden(nodo.der, salida);
  return salida;
}`;

const ALTURA = `function altura(nodo) {
  if (nodo === null) return 0;
  return 1 + Math.max(altura(nodo.izq), altura(nodo.der));
}`;

export const U08: Unidad = {
  id: "arboles-de-busqueda",
  titulo: { es: "Árboles binarios de búsqueda", en: "Binary search trees" },
  lecciones: [
    {
      id: "bst-buscar-insertar",
      titulo: { es: "Buscar e insertar en un BST", en: "Searching and inserting in a BST" },
      resumen: {
        es: "Menores a la izquierda, mayores a la derecha: la regla que deja buscar descartando medio árbol en cada paso.",
        en: "Smaller to the left, bigger to the right: the rule that lets you search by discarding half the tree at each step.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Una sola regla", en: "A single rule" },
          texto: {
            es: "Un **árbol binario de búsqueda** (BST, por *binary search tree*) es un árbol binario con una regla: en **cada** nodo, todo lo que cuelga a su izquierda es menor y todo lo que cuelga a su derecha es mayor. No sólo sus hijos directos: todo el subárbol.\n\nPara insertar no hay que pensar dónde: se compara con la raíz y se baja a la izquierda o a la derecha hasta encontrar un hueco (`null`). Ahí se cuelga el nodo nuevo. Si el valor ya estaba, aquí se ignora.\n\nEl dibujo es el árbol que sale de insertar 8, 3, 10, 1, 6, 14, 4 y 7, en ese orden.",
            en: "A **binary search tree** (BST) is a binary tree with one rule: at **every** node, everything hanging to its left is smaller and everything hanging to its right is bigger. Not just its direct children: the whole subtree.\n\nTo insert, you don't have to think about where: compare with the root and go left or right until you hit a gap (`null`). That's where the new node hangs. If the value was already there, here it's ignored.\n\nThe drawing is the tree you get by inserting 8, 3, 10, 1, 6, 14, 4 and 7, in that order.",
          },
          dibujo: { tipo: "arbol", valores: [8, 3, 10, 1, 6, null, 14, null, null, 4, 7] },
          programa: {
            codigo: {
              es: `class Nodo {
  constructor(valor) {
    this.valor = valor;
    this.izq = null;   // menores
    this.der = null;   // mayores
  }
}

function insertar(raiz, valor) {
  if (raiz === null) return new Nodo(valor);   // el hueco: aquí va
  if (valor < raiz.valor) raiz.izq = insertar(raiz.izq, valor);
  else if (valor > raiz.valor) raiz.der = insertar(raiz.der, valor);
  return raiz;   // los repetidos se ignoran
}

let raiz = null;
for (const v of [8, 3, 10, 1, 6, 14, 4, 7]) raiz = insertar(raiz, v);

console.log(raiz.valor, raiz.izq.valor, raiz.der.valor);
console.log(raiz.izq.der.valor);
console.log(raiz.izq.der.izq.valor, raiz.izq.der.der.valor);`,
              en: `class Nodo {
  constructor(valor) {
    this.valor = valor;
    this.izq = null;   // smaller
    this.der = null;   // bigger
  }
}

function insertar(raiz, valor) {
  if (raiz === null) return new Nodo(valor);   // the gap: it goes here
  if (valor < raiz.valor) raiz.izq = insertar(raiz.izq, valor);
  else if (valor > raiz.valor) raiz.der = insertar(raiz.der, valor);
  return raiz;   // duplicates are ignored
}

let raiz = null;
for (const v of [8, 3, 10, 1, 6, 14, 4, 7]) raiz = insertar(raiz, v);

console.log(raiz.valor, raiz.izq.valor, raiz.der.valor);
console.log(raiz.izq.der.valor);
console.log(raiz.izq.der.izq.valor, raiz.izq.der.der.valor);`,
            },
            notas: {
              es: "- La raíz es el 8, el primero que entró; a su izquierda el 3 y a su derecha el 10.\n- El 6 quedó a la derecha del 3 (es mayor que 3) pero a la izquierda del 8 (es menor que 8).\n- El 4 y el 7 cuelgan del 6. Cambia el orden de la lista y córrelo: los mismos valores dan otro árbol.",
              en: "- The root is 8, the first one in; 3 is on its left and 10 on its right.\n- 6 ended up to the right of 3 (it's bigger than 3) but to the left of 8 (it's smaller than 8).\n- 4 and 7 hang from 6. Change the order of the list and run it: the same values give a different tree.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Buscar es bajar por un solo lado", en: "Searching means going down one side" },
          texto: {
            es: "Para buscar se hace lo mismo que para insertar: comparar y bajar. Cada comparación **descarta un subárbol entero**, así que los pasos no dependen de cuántos nodos hay, sino de la **altura** del árbol, `h`. Buscar e insertar cuestan **O(h)**.\n\nSi el árbol está bien repartido, la altura es más o menos log₂ n y la búsqueda es tan rápida como la búsqueda binaria en un arreglo ordenado. La diferencia: aquí meter un valor nuevo también es O(h), y en el arreglo había que recorrer todo para hacerle lugar.",
            en: "Searching works just like inserting: compare and go down. Each comparison **discards a whole subtree**, so the steps don't depend on how many nodes there are, but on the tree's **height**, `h`. Searching and inserting cost **O(h)**.\n\nIf the tree is well spread out, the height is roughly log₂ n and searching is as fast as binary search on a sorted array. The difference: here adding a new value is also O(h), while in the array you had to shift everything to make room.",
          },
          programa: {
            codigo: {
              es: `${BASE}

// Devuelve cuántos nodos visitó; negativo si no lo encontró
function buscar(raiz, valor) {
  let nodo = raiz, pasos = 0;
  while (nodo !== null) {
    pasos++;
    if (valor === nodo.valor) return pasos;
    nodo = valor < nodo.valor ? nodo.izq : nodo.der;
  }
  return -pasos;
}

const raiz = armar([8, 3, 10, 1, 6, 14, 4, 7]);
console.log("7:", buscar(raiz, 7));
console.log("14:", buscar(raiz, 14));
console.log("8:", buscar(raiz, 8));
console.log("5:", buscar(raiz, 5));`,
              en: `${BASE}

// Returns how many nodes it visited; negative if not found
function buscar(raiz, valor) {
  let nodo = raiz, pasos = 0;
  while (nodo !== null) {
    pasos++;
    if (valor === nodo.valor) return pasos;
    nodo = valor < nodo.valor ? nodo.izq : nodo.der;
  }
  return -pasos;
}

const raiz = armar([8, 3, 10, 1, 6, 14, 4, 7]);
console.log("7:", buscar(raiz, 7));
console.log("14:", buscar(raiz, 14));
console.log("8:", buscar(raiz, 8));
console.log("5:", buscar(raiz, 5));`,
            },
            notas: {
              es: "- El 7 está a 4 pasos: 8 → 3 → 6 → 7.\n- El 8 está a 1: es la raíz.\n- El 5 no está: se dio cuenta en 4 pasos (8 → 3 → 6 → 4 y luego `null`), sin mirar el 10 ni el 14.",
              en: "- 7 is 4 steps away: 8 → 3 → 6 → 7.\n- 8 is 1 step away: it's the root.\n- 5 isn't there: it found out in 4 steps (8 → 3 → 6 → 4 and then `null`), without ever looking at 10 or 14.",
            },
          },
          enlaces: [{ url: "https://visualgo.net/es/bst", texto: { es: "Insertar y buscar en un BST, animado (VisuAlgo)", en: "BST insert and search, animated (VisuAlgo)" } }],
        },
        {
          tipo: "explica",
          titulo: { es: "En orden sale ordenado, y la trampa de validar", en: "In-order comes out sorted, and the validation trap" },
          texto: {
            es: "Si recorres el árbol **en orden** (primero la izquierda, luego el nodo, luego la derecha), los valores salen **ordenados de menor a mayor**. Es la prueba de que la regla se cumple.\n\nY una trampa clásica de entrevista: para revisar si un árbol es BST no basta con comparar cada nodo con sus hijos. En el segundo árbol del dibujo, el 6 es mayor que su padre 3 (bien), pero está a la izquierda del 5 y es mayor que 5 (mal). Hay que bajar llevando **los límites** que cada nodo tiene que respetar.",
            en: "If you walk the tree **in order** (left first, then the node, then the right), the values come out **sorted from smallest to largest**. That's proof the rule holds.\n\nAnd a classic interview trap: to check whether a tree is a BST, comparing each node with its children isn't enough. In the drawing's tree, 6 is bigger than its parent 3 (fine), but it sits to the left of 5 and is bigger than 5 (wrong). You have to go down carrying **the limits** each node must respect.",
          },
          dibujo: { tipo: "arbol", valores: [5, 3, null, null, 6], resalta: [6] },
          programa: {
            codigo: {
              es: `${BASE}

${INORDEN}

function esBST(nodo, min = -Infinity, max = Infinity) {
  if (nodo === null) return true;
  if (nodo.valor <= min || nodo.valor >= max) return false;
  // a la izquierda, el tope es este valor; a la derecha, el piso
  return esBST(nodo.izq, min, nodo.valor) && esBST(nodo.der, nodo.valor, max);
}

const raiz = armar([8, 3, 10, 1, 6, 14, 4, 7]);
console.log(inorden(raiz));
console.log(esBST(raiz));

// Armado a mano para que esté mal: el 6 a la izquierda del 5
const malo = new Nodo(5);
malo.izq = new Nodo(3);
malo.izq.der = new Nodo(6);
console.log(inorden(malo));
console.log(esBST(malo));`,
              en: `${BASE}

${INORDEN}

function esBST(nodo, min = -Infinity, max = Infinity) {
  if (nodo === null) return true;
  if (nodo.valor <= min || nodo.valor >= max) return false;
  // on the left, this value is the ceiling; on the right, the floor
  return esBST(nodo.izq, min, nodo.valor) && esBST(nodo.der, nodo.valor, max);
}

const raiz = armar([8, 3, 10, 1, 6, 14, 4, 7]);
console.log(inorden(raiz));
console.log(esBST(raiz));

// Built by hand to be wrong: 6 to the left of 5
const malo = new Nodo(5);
malo.izq = new Nodo(3);
malo.izq.der = new Nodo(6);
console.log(inorden(malo));
console.log(esBST(malo));`,
            },
            notas: {
              es: "- El árbol bueno sale `[1, 3, 4, 6, 7, 8, 10, 14]`: ordenado.\n- El malo sale `[3, 6, 5]`: el 6 antes del 5 delata el error, y `esBST` lo detecta porque el 6 llegó con tope 5.",
              en: "- The good tree comes out `[1, 3, 4, 6, 7, 8, 10, 14]`: sorted.\n- The bad one comes out `[3, 6, 5]`: 6 before 5 gives it away, and `esBST` catches it because 6 arrived with a ceiling of 5.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "En el árbol de 8, 3, 10, 1, 6, 14, 4 y 7, ¿por qué nodos pasas para encontrar el 7?", en: "In the tree of 8, 3, 10, 1, 6, 14, 4 and 7, which nodes do you go through to find 7?" },
          opciones: [
            { es: "8 → 3 → 6 → 7", en: "8 → 3 → 6 → 7" },
            { es: "8 → 10 → 7", en: "8 → 10 → 7" },
            { es: "8 → 3 → 1 → 7", en: "8 → 3 → 1 → 7" },
            { es: "Todos, en orden", en: "All of them, in order" },
          ],
          correcta: 0,
          porque: { es: "7 es menor que 8 (izquierda), mayor que 3 (derecha), mayor que 6 (derecha): ahí está. El 10, el 1 y el 4 nunca se miran.", en: "7 is smaller than 8 (left), bigger than 3 (right), bigger than 6 (right): there it is. 10, 1 and 4 are never looked at." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Cuánto cuesta buscar un valor en un BST?", en: "How much does searching for a value in a BST cost?" },
          opciones: [
            { es: "O(1)", en: "O(1)" },
            { es: "O(h), donde h es la altura del árbol", en: "O(h), where h is the tree's height" },
            { es: "O(n²)", en: "O(n²)" },
            { es: "O(n log n)", en: "O(n log n)" },
          ],
          correcta: 1,
          porque: { es: "Se baja un nivel por comparación, así que se dan como mucho `h` pasos. Si el árbol está bien repartido, `h` es cerca de log n; si no, puede llegar a n (lo vemos en la siguiente lección).", en: "Each comparison goes down one level, so it takes at most `h` steps. If the tree is well spread out, `h` is close to log n; if not, it can reach n (next lesson)." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué imprime el recorrido en orden de este BST?", en: "What does the in-order walk of this BST print?" },
          codigo: "const raiz = armar([50, 30, 70, 20, 40]);\nconsole.log(inorden(raiz));",
          opciones: ["[ 50, 30, 70, 20, 40 ]", "[ 20, 30, 40, 50, 70 ]", "[ 70, 50, 40, 30, 20 ]", "[ 50, 30, 20, 40, 70 ]"],
          correcta: 1,
          porque: { es: "En un BST, el recorrido en orden siempre sale de menor a mayor, sin importar en qué orden se insertaron los valores.", en: "In a BST, the in-order walk always comes out smallest to largest, no matter what order the values were inserted in." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa `insertar`.", en: "Complete `insertar`." },
          codigo: "function insertar(raiz, valor) {\n  if (raiz === ___) return new Nodo(valor);\n  if (valor ___ raiz.valor) raiz.izq = insertar(raiz.___, valor);\n  else raiz.der = insertar(raiz.der, valor);\n  return raiz;\n}",
          huecos: ["null", "<", "izq"],
          banco: ["null", "<", "izq", ">", "der", "undefined"],
          porque: { es: "Un hueco es `null`; ahí se crea el nodo. Si el valor es **menor** se baja por la **izquierda**, y se guarda lo que devuelve la llamada para no perder el nodo nuevo.", en: "A gap is `null`; that's where the node gets created. If the value is **smaller** you go **left**, and you store what the call returns so the new node isn't lost." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `minimo(raiz)`: devuelve el valor más chico del BST, o `null` si el árbol está vacío.\n\nPista: no hace falta recorrerlo entero. ¿Hacia dónde están los menores?",
            en: "Write `minimo(raiz)`: return the smallest value in the BST, or `null` if the tree is empty.\n\nHint: you don't need to walk all of it. Where are the smaller values?",
          },
          inicial: {
            es: `${BASE}

function minimo(raiz) {
  // tu código aquí
}

console.log(minimo(armar([8, 3, 10, 1, 6])));`,
            en: `${BASE}

function minimo(raiz) {
  // your code here
}

console.log(minimo(armar([8, 3, 10, 1, 6])));`,
          },
          pruebas: [
            { llamada: "minimo(armar([8, 3, 10, 1, 6]))", espera: "1" },
            { llamada: "minimo(armar([20, 30, 25]))", espera: "20" },
            { llamada: "minimo(armar([5]))", espera: "5" },
            { llamada: "minimo(null)", espera: "null" },
          ],
          solucion: `${BASE}

function minimo(raiz) {
  if (raiz === null) return null;
  let nodo = raiz;
  while (nodo.izq !== null) nodo = nodo.izq;
  return nodo.valor;
}`,
          porque: { es: "El menor está lo más a la izquierda posible: se baja por `izq` hasta que no haya más. Es O(h), no O(n). En `[20, 30, 25]` la raíz ya es el mínimo, porque no tiene nada a su izquierda.", en: "The smallest value is as far left as possible: go down `izq` until there's nothing more. That's O(h), not O(n). In `[20, 30, 25]` the root is already the minimum, because nothing hangs to its left." },
        },
      ],
      retos: ["validate-binary-search-tree"],
      enlaces: [{ url: "https://es.wikipedia.org/wiki/%C3%81rbol_binario_de_b%C3%BAsqueda", texto: { es: "Árbol binario de búsqueda (Wikipedia)", en: "Binary search tree (Wikipedia, Spanish)" } }],
    },
    {
      id: "bst-borrar-y-balance",
      titulo: { es: "Borrar, y por qué hay que balancear", en: "Deleting, and why balancing matters" },
      resumen: {
        es: "Los tres casos de borrar, el árbol que se vuelve lista con datos ordenados y cómo una rotación lo arregla.",
        en: "The three cases of deleting, the tree that turns into a list with sorted data, and how a rotation fixes it.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Borrar: tres casos", en: "Deleting: three cases" },
          texto: {
            es: "Primero se busca el nodo, como siempre. Luego depende de cuántos hijos tenga:\n\n- **Ninguno** (una hoja): se quita y ya.\n- **Uno**: su hijo sube a ocupar su lugar.\n- **Dos**: no se puede quitar sin dejar dos ramas sueltas. Se reemplaza su valor por el de su **sucesor**, el menor de su subárbol derecho, y se borra el sucesor, que tiene a lo más un hijo.\n\nEl sucesor sirve porque es mayor que todo lo de la izquierda y menor que todo lo demás de la derecha: la regla sigue en pie.",
            en: "First you find the node, as usual. Then it depends on how many children it has:\n\n- **None** (a leaf): just remove it.\n- **One**: its child moves up to take its place.\n- **Two**: you can't remove it without leaving two loose branches. Replace its value with its **successor**'s, the smallest in its right subtree, and delete the successor, which has at most one child.\n\nThe successor works because it's bigger than everything on the left and smaller than everything else on the right: the rule still holds.",
          },
          dibujo: { tipo: "arbol", valores: [8, 3, 10, 1, 6, null, 14, null, null, 4, 7], resalta: [3, 4] },
          programa: {
            codigo: {
              es: `${BASE}

${INORDEN}

function borrar(nodo, valor) {
  if (nodo === null) return null;
  if (valor < nodo.valor) nodo.izq = borrar(nodo.izq, valor);
  else if (valor > nodo.valor) nodo.der = borrar(nodo.der, valor);
  else {
    if (nodo.izq === null) return nodo.der;   // hoja o sólo hijo derecho
    if (nodo.der === null) return nodo.izq;   // sólo hijo izquierdo
    let sucesor = nodo.der;                   // dos hijos
    while (sucesor.izq !== null) sucesor = sucesor.izq;
    nodo.valor = sucesor.valor;
    nodo.der = borrar(nodo.der, sucesor.valor);
  }
  return nodo;
}

let raiz = armar([8, 3, 10, 1, 6, 14, 4, 7]);
raiz = borrar(raiz, 3);    // dos hijos: su sucesor es el 4
console.log(inorden(raiz), raiz.izq.valor);
raiz = borrar(raiz, 1);    // hoja
console.log(inorden(raiz));
raiz = borrar(raiz, 10);   // un hijo (el 14)
console.log(inorden(raiz), raiz.der.valor);`,
              en: `${BASE}

${INORDEN}

function borrar(nodo, valor) {
  if (nodo === null) return null;
  if (valor < nodo.valor) nodo.izq = borrar(nodo.izq, valor);
  else if (valor > nodo.valor) nodo.der = borrar(nodo.der, valor);
  else {
    if (nodo.izq === null) return nodo.der;   // leaf or only a right child
    if (nodo.der === null) return nodo.izq;   // only a left child
    let sucesor = nodo.der;                   // two children
    while (sucesor.izq !== null) sucesor = sucesor.izq;
    nodo.valor = sucesor.valor;
    nodo.der = borrar(nodo.der, sucesor.valor);
  }
  return nodo;
}

let raiz = armar([8, 3, 10, 1, 6, 14, 4, 7]);
raiz = borrar(raiz, 3);    // two children: its successor is 4
console.log(inorden(raiz), raiz.izq.valor);
raiz = borrar(raiz, 1);    // leaf
console.log(inorden(raiz));
raiz = borrar(raiz, 10);   // one child (14)
console.log(inorden(raiz), raiz.der.valor);`,
            },
            notas: {
              es: "- Al borrar el 3, su lugar lo ocupa el 4, su sucesor (lo resaltado en el dibujo): el hijo izquierdo del 8 ahora es 4.\n- El 1 era una hoja y se fue sin más; al borrar el 10, el 14 subió a ser el hijo derecho del 8.\n- Tras cada borrado el recorrido en orden sigue ordenado: el árbol sigue siendo BST.",
              en: "- Deleting 3 puts 4 in its place, its successor (highlighted in the drawing): 8's left child is now 4.\n- 1 was a leaf and simply went away; deleting 10 moved 14 up as 8's right child.\n- After each deletion the in-order walk is still sorted: the tree is still a BST.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Con datos ordenados se vuelve lista", en: "With sorted data it turns into a list" },
          texto: {
            es: "El BST no se acomoda solo. Si insertas 1, 2, 3, 4… en orden, cada número es mayor que todos los anteriores y siempre va a la derecha: sale una vara torcida, que en realidad es una **lista enlazada**. Su altura es `n` y buscar vuelve a costar **O(n)**.\n\nY los datos ordenados no son raros: fechas, folios, ids que van creciendo. Aquí se ven los mismos 15 números insertados en orden y en un orden que reparte bien. La **altura** (los nodos del camino más largo de la raíz a una hoja) cuenta la diferencia.",
            en: "A BST doesn't rearrange itself. If you insert 1, 2, 3, 4… in order, each number is bigger than all before it and always goes right: you get a crooked stick that is really a **linked list**. Its height is `n` and searching costs **O(n)** again.\n\nAnd sorted data isn't unusual: dates, invoice numbers, ids that keep growing. Here are the same 15 numbers inserted in order and in an order that spreads them well. The **height** (the nodes on the longest path from the root to a leaf) tells the difference.",
          },
          dibujo: { tipo: "arbol", valores: [1, null, 2, null, null, null, 3, null, null, null, null, null, null, null, 4] },
          programa: {
            codigo: `${BASE}

${ALTURA}

const enOrden = [];
for (let i = 1; i <= 15; i++) enOrden.push(i);
const repartido = [8, 4, 12, 2, 6, 10, 14, 1, 3, 5, 7, 9, 11, 13, 15];

console.log(altura(armar(enOrden)));
console.log(altura(armar(repartido)));

const mil = [];
for (let i = 1; i <= 1000; i++) mil.push(i);
console.log(altura(armar(mil)));`,
            notas: {
              es: "- En orden: altura 15, uno por nivel.\n- Bien repartido: altura 4, porque 15 = 1 + 2 + 4 + 8 nodos caben en cuatro niveles.\n- Mil números en orden dan altura 1000: buscar el último es recorrerlos todos. Bien balanceado serían 10.",
              en: "- In order: height 15, one per level.\n- Well spread: height 4, because 15 = 1 + 2 + 4 + 8 nodes fit in four levels.\n- A thousand numbers in order give height 1000: finding the last one means walking all of them. Well balanced, it would be 10.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Rotar para balancear", en: "Rotating to rebalance" },
          texto: {
            es: "Los **árboles balanceados** arreglan esto solos: después de cada inserción o borrado revisan las alturas y, si un lado creció de más, hacen una **rotación**. Una rotación cambia quién es padre de quién en dos o tres nodos, sin romper la regla del BST, y baja la altura.\n\n- El **AVL** exige que en cada nodo las alturas de sus dos lados difieran a lo más en 1.\n- El **rojinegro** es más relajado y rota menos; es el que usan por dentro el `TreeMap` de Java y el `std::map` de C++.\n\nJavaScript no trae un árbol balanceado: `Map` y `Set` son tablas hash, sin orden por valor. Aquí está la rotación a la izquierda, la pieza básica.",
            en: "**Balanced trees** fix this on their own: after each insert or delete they check the heights and, if one side grew too much, they do a **rotation**. A rotation changes who is whose parent among two or three nodes, without breaking the BST rule, and lowers the height.\n\n- **AVL** requires that at every node the heights of its two sides differ by at most 1.\n- **Red-black** is more relaxed and rotates less; it's what Java's `TreeMap` and C++'s `std::map` use inside.\n\nJavaScript doesn't ship a balanced tree: `Map` and `Set` are hash tables, with no ordering by value. Here's the left rotation, the basic building block.",
          },
          dibujo: { tipo: "arbol", valores: [2, 1, 3] },
          programa: {
            codigo: {
              es: `${BASE}

${INORDEN}

${ALTURA}

// x tiene un hijo derecho y que sube a su lugar; x baja a la izquierda de y
function rotarIzq(x) {
  const y = x.der;
  x.der = y.izq;   // lo que y tenía a la izquierda pasa a ser de x
  y.izq = x;
  return y;        // la nueva raíz de este pedazo
}

let raiz = armar([1, 2, 3]);   // 1 -> 2 -> 3, todo a la derecha
console.log(raiz.valor, altura(raiz), inorden(raiz));
raiz = rotarIzq(raiz);
console.log(raiz.valor, altura(raiz), inorden(raiz));`,
              en: `${BASE}

${INORDEN}

${ALTURA}

// x has a right child y that moves up to its place; x goes down to y's left
function rotarIzq(x) {
  const y = x.der;
  x.der = y.izq;   // whatever y had on its left now belongs to x
  y.izq = x;
  return y;        // the new root of this piece
}

let raiz = armar([1, 2, 3]);   // 1 -> 2 -> 3, all to the right
console.log(raiz.valor, altura(raiz), inorden(raiz));
raiz = rotarIzq(raiz);
console.log(raiz.valor, altura(raiz), inorden(raiz));`,
            },
            notas: {
              es: "Antes: raíz 1, altura 3. Después: raíz 2, altura 2, como en el dibujo. El recorrido en orden es el mismo `[1, 2, 3]`: la rotación no rompe la regla, sólo reacomoda.",
              en: "Before: root 1, height 3. After: root 2, height 2, as in the drawing. The in-order walk is the same `[1, 2, 3]`: the rotation doesn't break the rule, it just rearranges.",
            },
          },
          enlaces: [
            { url: "https://es.wikipedia.org/wiki/%C3%81rbol_AVL", texto: { es: "Árbol AVL (Wikipedia)", en: "AVL tree (Wikipedia, Spanish)" } },
            { url: "https://visualgo.net/es/bst", texto: { es: "BST y AVL animados: prueba insertar datos ordenados (VisuAlgo)", en: "BST and AVL animated: try inserting sorted data (VisuAlgo)" } },
          ],
        },
        {
          tipo: "elige",
          pregunta: { es: "Vas a borrar un nodo que tiene dos hijos. ¿Por qué valor se reemplaza?", en: "You're deleting a node with two children. What value replaces it?" },
          opciones: [
            { es: "Por el menor de su subárbol derecho (su sucesor)", en: "The smallest in its right subtree (its successor)" },
            { es: "Siempre por su hijo izquierdo", en: "Always its left child" },
            { es: "Por el valor de la raíz", en: "The root's value" },
            { es: "Por cualquier hoja del árbol", en: "Any leaf of the tree" },
          ],
          correcta: 0,
          porque: { es: "El sucesor es mayor que todo lo de la izquierda y menor que todo lo que queda a la derecha, así que la regla se sostiene. (El mayor del subárbol izquierdo, el predecesor, también sirve.)", en: "The successor is bigger than everything on the left and smaller than everything left on the right, so the rule holds. (The largest in the left subtree, the predecessor, also works.)" },
        },
        {
          tipo: "elige",
          pregunta: { es: "Insertas 10, 20, 30, 40 y 50, en ese orden, en un BST vacío. ¿Qué altura tiene?", en: "You insert 10, 20, 30, 40 and 50, in that order, into an empty BST. What's its height?" },
          opciones: ["2", "3", "5", "1"],
          correcta: 2,
          porque: { es: "Cada uno es mayor que los anteriores y va a la derecha del último: una vara de 5 nodos. Balanceado, cabría en 3 niveles.", en: "Each is bigger than the ones before and goes right of the last: a stick of 5 nodes. Balanced, it would fit in 3 levels." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Cuánto cuesta buscar en un BST de n nodos que se armó con datos ya ordenados?", en: "How much does searching cost in a BST of n nodes built from already sorted data?" },
          opciones: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
          correcta: 2,
          porque: { es: "El árbol quedó como lista: la altura es `n` y buscar el último es recorrerlos todos. Por eso existen los árboles balanceados.", en: "The tree ended up as a list: the height is `n` and finding the last one means walking them all. That's why balanced trees exist." },
        },
        {
          tipo: "ordena",
          pregunta: { es: "Ordena los renglones de la rotación a la izquierda de `x`.", en: "Put the lines of the left rotation of `x` in order." },
          lineas: ["const y = x.der;", "x.der = y.izq;", "y.izq = x;", "return y;"],
          porque: { es: "Primero se guarda `y`; luego `x` adopta lo que `y` tenía a la izquierda (si no, se perdería); después `x` cuelga a la izquierda de `y`, y `y` es la nueva raíz.", en: "First save `y`; then `x` adopts what `y` had on its left (otherwise it would be lost); then `x` hangs on `y`'s left, and `y` is the new root." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `altura(nodo)`: el número de nodos del camino más largo de la raíz a una hoja. Un árbol vacío (`null`) tiene altura 0 y uno de un solo nodo, 1.",
            en: "Write `altura(nodo)`: the number of nodes on the longest path from the root to a leaf. An empty tree (`null`) has height 0 and a single node has height 1.",
          },
          inicial: {
            es: `${BASE}

function altura(nodo) {
  // pista: la altura de un nodo depende de la de sus dos hijos
}

console.log(altura(armar([2, 1, 3])));`,
            en: `${BASE}

function altura(nodo) {
  // hint: a node's height depends on its two children's
}

console.log(altura(armar([2, 1, 3])));`,
          },
          pruebas: [
            { llamada: "altura(armar([2, 1, 3]))", espera: "2" },
            { llamada: "altura(armar([1, 2, 3, 4]))", espera: "4" },
            { llamada: "altura(null)", espera: "0" },
            { llamada: "altura(armar([8, 4, 12, 2, 6, 10, 14]))", espera: "3" },
          ],
          solucion: `${BASE}

${ALTURA}`,
          porque: { es: "Es recursivo: vacío mide 0, y cualquier otro nodo mide 1 más que el más alto de sus dos hijos. Visita cada nodo una vez: O(n).", en: "It's recursive: empty measures 0, and any other node measures 1 more than the taller of its two children. It visits each node once: O(n)." },
        },
      ],
      enlaces: [{ url: "https://es.wikipedia.org/wiki/%C3%81rbol_rojo-negro", texto: { es: "Árbol rojo-negro (Wikipedia)", en: "Red-black tree (Wikipedia, Spanish)" } }],
    },
  ],
};
