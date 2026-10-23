import type { Unidad } from "../tipos";

/**
 * El nodo y la función que arma un árbol a partir de sus niveles, como los
 * escribe LeetCode: [3, 9, 20, null, null, 15, 7]. Van al principio de cada
 * programa para que se pueda correr solo.
 */
const NODO = "class NodoArbol {\n  constructor(valor, izq = null, der = null) {\n    this.valor = valor;\n    this.izq = izq;\n    this.der = der;\n  }\n}\n";
const ARMAR = "function arbol(niveles) {\n  if (!niveles.length || niveles[0] === null) return null;\n  const raiz = new NodoArbol(niveles[0]);\n  const cola = [raiz];\n  let i = 1;\n  while (i < niveles.length) {\n    const nodo = cola.shift();\n    if (niveles[i] != null) { nodo.izq = new NodoArbol(niveles[i]); cola.push(nodo.izq); }\n    i++;\n    if (i < niveles.length && niveles[i] != null) { nodo.der = new NodoArbol(niveles[i]); cola.push(nodo.der); }\n    i++;\n  }\n  return raiz;\n}\n";
const BASE = NODO + "\n" + ARMAR + "\n";

export const U07: Unidad = {
  id: "arboles",
  titulo: { es: "Árboles", en: "Trees" },
  lecciones: [
    {
      id: "arboles-binarios",
      titulo: { es: "Árboles binarios", en: "Binary trees" },
      resumen: {
        es: "Raíz, hijos, hojas, altura y profundidad. Nodos que apuntan a dos nodos, y cómo armarlos en JavaScript.",
        en: "Root, children, leaves, height and depth. Nodes that point to two nodes, and how to build them in JavaScript.",
      },
      enlaces: [
        { url: "https://es.wikipedia.org/wiki/%C3%81rbol_binario", texto: { es: "Árbol binario (Wikipedia)", en: "Binary tree (Wikipedia, Spanish)" } },
      ],
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Un árbol, de cabeza", en: "A tree, upside down" },
          texto: {
            es: "Una lista enlazada es una fila de nodos donde cada uno apunta al siguiente. En un **árbol**, cada nodo puede apuntar a **varios**. En un **árbol binario**, a dos como máximo: su hijo **izquierdo** y su hijo **derecho**.\n\nEl vocabulario, con el dibujo:\n\n- La **raíz** es el nodo de arriba, el único sin padre: el 8.\n- Los **hijos** del 3 son el 1 y el 6; el 3 es su **padre**.\n- Las **hojas** son los nodos sin hijos: 1, 6 y 14.\n- La **profundidad** de un nodo es cuántos pasos hay desde la raíz: el 8 está a 0, el 6 a 2.\n- La **altura** del árbol es cuántos niveles tiene: éste tiene 3.\n\nSe dibujan con la raíz arriba, al revés de los árboles de verdad. Y están en todas partes: las carpetas de tu computadora, el HTML de una página, el índice de una base de datos.",
            en: "A linked list is a line of nodes where each one points to the next. In a **tree**, each node can point to **several**. In a **binary tree**, to two at most: its **left** child and its **right** child.\n\nThe vocabulary, with the drawing:\n\n- The **root** is the top node, the only one without a parent: 8.\n- The **children** of 3 are 1 and 6; 3 is their **parent**.\n- The **leaves** are nodes with no children: 1, 6 and 14.\n- A node's **depth** is how many steps it is from the root: 8 is at 0, 6 at 2.\n- The tree's **height** is how many levels it has: this one has 3.\n\nThey're drawn with the root on top, upside down from real trees. And they're everywhere: your computer's folders, a web page's HTML, a database index.",
          },
          dibujo: { tipo: "arbol", valores: [8, 3, 10, 1, 6, null, 14], resalta: [8] },
        },
        {
          tipo: "explica",
          titulo: { es: "Un nodo con dos punteros", en: "A node with two pointers" },
          texto: {
            es: "En código, un nodo es un objeto con su `valor` y dos referencias, `izq` y `der`, que valen `null` cuando no hay hijo. Igual que en la unidad de valores y referencias: el nodo no **contiene** a sus hijos, **apunta** a ellos.\n\nAbajo se arma a mano el árbol del dibujo, de adentro hacia afuera.",
            en: "In code, a node is an object with its `valor` and two references, `izq` and `der`, which are `null` when there's no child. Just like in the values and references unit: the node doesn't **contain** its children, it **points** to them.\n\nBelow, the tree from the drawing is built by hand, from the inside out.",
          },
          programa: {
            codigo: NODO + "\nconst raiz = new NodoArbol(8,\n  new NodoArbol(3, new NodoArbol(1), new NodoArbol(6)),\n  new NodoArbol(10, null, new NodoArbol(14)),\n);\n\nconsole.log(raiz.valor);\nconsole.log(raiz.izq.valor, raiz.der.valor);\nconsole.log(raiz.izq.der.valor);\nconsole.log(raiz.der.izq);\nconsole.log(raiz.izq);",
            notas: {
              es: "- La raíz es 8 y sus hijos 3 y 10.\n- `raiz.izq.der` es «el hijo derecho del hijo izquierdo»: el 6.\n- El 10 no tiene hijo izquierdo: `null`.\n- El último renglón enseña el nodo 3 completo, con sus dos hijos adentro.",
              en: "- The root is 8 and its children are 3 and 10.\n- `raiz.izq.der` is \"the right child of the left child\": 6.\n- 10 has no left child: `null`.\n- The last line shows node 3 whole, with its two children inside.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Armarlo por niveles", en: "Building it by levels" },
          texto: {
            es: "Escribir árboles grandes a mano cansa. La convención de LeetCode (y la de los retos en vídeo) es escribirlos **por niveles**, de izquierda a derecha, con `null` donde falta un hijo: el árbol del dibujo es `[8, 3, 10, 1, 6, null, 14]`.\n\nLa función `arbol` de abajo hace la conversión; la vas a ver al principio de los demás programas de la unidad. Y para recorrerlo, la herramienta natural es la recursión: un árbol es un nodo con dos **árboles más chicos** colgando. Contar nodos es «yo, más los de mi izquierda, más los de mi derecha».",
            en: "Writing big trees by hand gets tiring. The LeetCode convention (also used in the video challenges) is writing them **by levels**, left to right, with `null` where a child is missing: the tree from the drawing is `[8, 3, 10, 1, 6, null, 14]`.\n\nThe `arbol` function below does the conversion; you'll see it at the top of the other programs in this unit. And to walk it, the natural tool is recursion: a tree is a node with two **smaller trees** hanging from it. Counting nodes is \"me, plus the ones on my left, plus the ones on my right\".",
          },
          programa: {
            codigo: {
              es: BASE + "function contar(nodo) {\n  if (nodo === null) return 0;          // árbol vacío\n  return 1 + contar(nodo.izq) + contar(nodo.der);\n}\n\n// De lado: la raíz a la izquierda y los hijos derechos arriba\nfunction dibujar(nodo, sangria = \"\") {\n  if (nodo === null) return;\n  dibujar(nodo.der, sangria + \"    \");\n  console.log(sangria + nodo.valor);\n  dibujar(nodo.izq, sangria + \"    \");\n}\n\nconst raiz = arbol([8, 3, 10, 1, 6, null, 14]);\nconsole.log(\"nodos:\", contar(raiz));\ndibujar(raiz);",
              en: BASE + "function contar(nodo) {\n  if (nodo === null) return 0;          // empty tree\n  return 1 + contar(nodo.izq) + contar(nodo.der);\n}\n\n// Sideways: root on the left, right children on top\nfunction dibujar(nodo, sangria = \"\") {\n  if (nodo === null) return;\n  dibujar(nodo.der, sangria + \"    \");\n  console.log(sangria + nodo.valor);\n  dibujar(nodo.izq, sangria + \"    \");\n}\n\nconst raiz = arbol([8, 3, 10, 1, 6, null, 14]);\nconsole.log(\"nodes:\", contar(raiz));\ndibujar(raiz);",
            },
            notas: {
              es: "- Seis nodos: los `null` no cuentan.\n- El dibujo sale acostado: gira la cabeza a la izquierda y es el mismo árbol de la primera tarjeta, con el 8 como raíz.",
              en: "- Six nodes: the `null`s don't count.\n- The drawing comes out lying down: tilt your head left and it's the same tree as the first card, with 8 as the root.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Profundidad de cada nodo", en: "Each node's depth" },
          texto: {
            es: "Para saber a qué profundidad está cada nodo, se baja por el árbol pasando un número: la raíz recibe 0 y cada hijo recibe uno más que su padre. La altura del árbol es la profundidad más grande, más uno.\n\nObserva que la recursión visita primero toda la rama izquierda y luego la derecha: eso es un **recorrido en profundidad**, el tema de la siguiente lección.",
            en: "To find each node's depth, you walk down the tree passing a number along: the root gets 0 and each child gets one more than its parent. The tree's height is the largest depth, plus one.\n\nNotice that the recursion visits the whole left branch first and then the right one: that's a **depth-first traversal**, the topic of the next lesson.",
          },
          programa: {
            codigo: {
              es: BASE + "let maxima = 0;\nfunction profundidades(nodo, p) {\n  if (nodo === null) return;\n  console.log(\"  \".repeat(p) + nodo.valor + \" está a profundidad \" + p + (nodo.izq || nodo.der ? \"\" : \" (hoja)\"));\n  maxima = Math.max(maxima, p);\n  profundidades(nodo.izq, p + 1);\n  profundidades(nodo.der, p + 1);\n}\n\nprofundidades(arbol([8, 3, 10, 1, 6, null, 14]), 0);\nconsole.log(\"altura:\", maxima + 1);",
              en: BASE + "let maxima = 0;\nfunction profundidades(nodo, p) {\n  if (nodo === null) return;\n  console.log(\"  \".repeat(p) + nodo.valor + \" is at depth \" + p + (nodo.izq || nodo.der ? \"\" : \" (leaf)\"));\n  maxima = Math.max(maxima, p);\n  profundidades(nodo.izq, p + 1);\n  profundidades(nodo.der, p + 1);\n}\n\nprofundidades(arbol([8, 3, 10, 1, 6, null, 14]), 0);\nconsole.log(\"height:\", maxima + 1);",
            },
            notas: {
              es: "Las tres hojas (1, 6 y 14) están a profundidad 2, así que la altura es 3. El orden en que salen (8, 3, 1, 6, 10, 14) baja por la izquierda antes de ir a la derecha.",
              en: "The three leaves (1, 6 and 14) are at depth 2, so the height is 3. The order they come out in (8, 3, 1, 6, 10, 14) goes down the left before going right.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "En el árbol `[8, 3, 10, 1, 6, null, 14]`, ¿cuáles son las hojas?", en: "In the tree `[8, 3, 10, 1, 6, null, 14]`, which are the leaves?" },
          opciones: ["8", "3, 10", "1, 6, 14", "1, 3, 6"],
          correcta: 2,
          porque: { es: "Las hojas no tienen hijos: 1, 6 y 14. El 3 y el 10 tienen al menos uno, y el 8 es la raíz.", en: "Leaves have no children: 1, 6 and 14. 3 and 10 have at least one, and 8 is the root." },
        },
        {
          tipo: "elige",
          pregunta: { es: "Un árbol binario tiene raíz, dos hijos y cuatro nietos. ¿Cuál es su altura, contando niveles?", en: "A binary tree has a root, two children and four grandchildren. What's its height, counting levels?" },
          opciones: ["2", "3", "4", "7"],
          correcta: 1,
          porque: { es: "Raíz, hijos y nietos: tres niveles. 7 es el número de nodos, no la altura.", en: "Root, children and grandchildren: three levels. 7 is the number of nodes, not the height." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa el constructor del nodo: guarda su valor y empieza sin hijos.", en: "Complete the node's constructor: store its value and start with no children." },
          codigo: "class NodoArbol {\n  constructor(valor) {\n    this.valor = ___;\n    this.izq = ___;\n    this.der = null;\n  }\n}",
          huecos: ["valor", "null"],
          banco: ["valor", "null", "izq", "0", "[]"],
          porque: { es: "El nodo guarda el `valor` que le pasan y sus hijos empiezan en `null`: «no apunta a nadie». Un `0` sería un hijo que vale cero.", en: "The node stores the `valor` it's given and its children start as `null`: \"points to nobody\". A `0` would be a child whose value is zero." },
        },
        {
          tipo: "ordena",
          pregunta: { es: "Ordena la función que cuenta los nodos de un árbol.", en: "Put the function that counts a tree's nodes in order." },
          lineas: [
            "function contar(nodo) {",
            "  if (nodo === null) return 0;",
            "  return 1 + contar(nodo.izq) + contar(nodo.der);",
            "}",
          ],
          porque: { es: "Caso base primero: un árbol vacío tiene 0 nodos. Si no, el nodo cuenta 1 más los de sus dos subárboles.", en: "Base case first: an empty tree has 0 nodes. Otherwise, the node counts 1 plus the ones in its two subtrees." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `contarHojas(nodo)`: cuántos nodos del árbol no tienen ningún hijo. Un árbol vacío (`null`) tiene 0. `NodoArbol` y `arbol` ya están escritos.",
            en: "Write `contarHojas(nodo)`: how many nodes in the tree have no children at all. An empty tree (`null`) has 0. `NodoArbol` and `arbol` are already written.",
          },
          inicial: {
            es: BASE + "function contarHojas(nodo) {\n  // vacío: 0 · hoja: 1 · si no: las de la izquierda + las de la derecha\n}\n\nconsole.log(contarHojas(arbol([8, 3, 10, 1, 6, null, 14])));",
            en: BASE + "function contarHojas(nodo) {\n  // empty: 0 · leaf: 1 · otherwise: left ones + right ones\n}\n\nconsole.log(contarHojas(arbol([8, 3, 10, 1, 6, null, 14])));",
          },
          pruebas: [
            { llamada: "contarHojas(arbol([8, 3, 10, 1, 6, null, 14]))", espera: "3" },
            { llamada: "contarHojas(arbol([1]))", espera: "1" },
            { llamada: "contarHojas(null)", espera: "0" },
            { llamada: "contarHojas(arbol([1, 2, null, 3]))", espera: "1" },
          ],
          solucion: BASE + "function contarHojas(nodo) {\n  if (nodo === null) return 0;\n  if (nodo.izq === null && nodo.der === null) return 1;\n  return contarHojas(nodo.izq) + contarHojas(nodo.der);\n}",
          porque: { es: "Dos casos base: el vacío vale 0 y la hoja vale 1. Todo lo demás suma lo de sus dos lados. El último árbol es una «vara» (1 → 2 → 3) con una sola hoja.", en: "Two base cases: empty is 0 and a leaf is 1. Everything else adds up its two sides. The last tree is a \"stick\" (1 → 2 → 3) with a single leaf." },
        },
      ],
    },
    {
      id: "recorridos-en-profundidad",
      titulo: { es: "Recorridos en profundidad", en: "Depth-first traversals" },
      resumen: {
        es: "Preorden, inorden y postorden: el mismo árbol en tres órdenes. Altura, espejo y el ancestro común.",
        en: "Preorder, inorder and postorder: the same tree in three orders. Height, mirroring and the common ancestor.",
      },
      retos: ["maximum-depth-of-binary-tree", "invert-binary-tree", "lowest-common-ancestor-of-a-binary-tree"],
      enlaces: [
        { url: "https://es.wikipedia.org/wiki/Recorrido_de_%C3%A1rboles", texto: { es: "Recorrido de árboles (Wikipedia)", en: "Tree traversal (Wikipedia, Spanish)" } },
      ],
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Tres órdenes, una sola idea", en: "Three orders, one idea" },
          texto: {
            es: "Recorrer un árbol en **profundidad** (DFS, *depth-first search*) es bajar por una rama hasta el fondo antes de pasar a la siguiente. Con recursión, en cada nodo hay tres cosas que hacer: visitar el nodo, recorrer su izquierda y recorrer su derecha. Según **cuándo** visitas el nodo, sale un orden distinto:\n\n- **Preorden**: nodo, izquierda, derecha. Primero el jefe, luego los subordinados.\n- **Inorden**: izquierda, nodo, derecha.\n- **Postorden**: izquierda, derecha, nodo. Primero los hijos, al final el padre.",
            en: "Walking a tree **depth-first** (DFS) means going down one branch all the way before moving to the next. With recursion, at each node there are three things to do: visit the node, walk its left side and walk its right side. Depending on **when** you visit the node, you get a different order:\n\n- **Preorder**: node, left, right. Boss first, then the team.\n- **Inorder**: left, node, right.\n- **Postorder**: left, right, node. Children first, parent last.",
          },
          dibujo: { tipo: "arbol", valores: [8, 3, 10, 1, 6, null, 14] },
          programa: {
            codigo: {
              es: BASE + "function preorden(n, r = []) {\n  if (!n) return r;\n  r.push(n.valor); preorden(n.izq, r); preorden(n.der, r);\n  return r;\n}\nfunction inorden(n, r = []) {\n  if (!n) return r;\n  inorden(n.izq, r); r.push(n.valor); inorden(n.der, r);\n  return r;\n}\nfunction postorden(n, r = []) {\n  if (!n) return r;\n  postorden(n.izq, r); postorden(n.der, r); r.push(n.valor);\n  return r;\n}\n\nconst raiz = arbol([8, 3, 10, 1, 6, null, 14]);\nconsole.log(\"preorden: \", preorden(raiz));\nconsole.log(\"inorden:  \", inorden(raiz));\nconsole.log(\"postorden:\", postorden(raiz));",
              en: BASE + "function preorden(n, r = []) {\n  if (!n) return r;\n  r.push(n.valor); preorden(n.izq, r); preorden(n.der, r);\n  return r;\n}\nfunction inorden(n, r = []) {\n  if (!n) return r;\n  inorden(n.izq, r); r.push(n.valor); inorden(n.der, r);\n  return r;\n}\nfunction postorden(n, r = []) {\n  if (!n) return r;\n  postorden(n.izq, r); postorden(n.der, r); r.push(n.valor);\n  return r;\n}\n\nconst raiz = arbol([8, 3, 10, 1, 6, null, 14]);\nconsole.log(\"preorder: \", preorden(raiz));\nconsole.log(\"inorder:  \", inorden(raiz));\nconsole.log(\"postorder:\", postorden(raiz));",
            },
            notas: {
              es: "- El preorden empieza con la raíz (8) y el postorden termina con ella.\n- El inorden sale **ordenado**: 1, 3, 6, 8, 10, 14. No es casualidad: en este árbol todo lo de la izquierda de cada nodo es menor y todo lo de la derecha, mayor. Eso es un árbol de búsqueda, la siguiente unidad.\n- Las tres funciones son iguales salvo por **dónde** va el `push`.",
              en: "- Preorder starts with the root (8) and postorder ends with it.\n- Inorder comes out **sorted**: 1, 3, 6, 8, 10, 14. Not by chance: in this tree everything left of each node is smaller and everything right is bigger. That's a search tree, the next unit.\n- The three functions are identical except for **where** the `push` goes.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "La altura en una línea", en: "Height in one line" },
          texto: {
            es: "Muchos problemas de árboles se resuelven con la misma forma: «pregúntale a tu izquierda, pregúntale a tu derecha y combina». La **altura** (o profundidad máxima) de un árbol es 1 más la mayor altura de sus dos subárboles; la de un árbol vacío es 0.\n\nEs postorden: el nodo contesta **después** de oír a sus hijos. Es el reto «Maximum Depth of Binary Tree».",
            en: "Many tree problems are solved with the same shape: \"ask your left, ask your right, and combine\". A tree's **height** (or maximum depth) is 1 plus the larger height of its two subtrees; an empty tree's is 0.\n\nThat's postorder: the node answers **after** hearing from its children. It's the \"Maximum Depth of Binary Tree\" challenge.",
          },
          programa: {
            codigo: {
              es: BASE + "function altura(nodo) {\n  if (nodo === null) return 0;\n  return 1 + Math.max(altura(nodo.izq), altura(nodo.der));\n}\n\nconsole.log(altura(arbol([8, 3, 10, 1, 6, null, 14])));\nconsole.log(altura(arbol([1, 2, null, 3, null, 4])));   // una vara hacia la izquierda\nconsole.log(altura(arbol([])));",
              en: BASE + "function altura(nodo) {\n  if (nodo === null) return 0;\n  return 1 + Math.max(altura(nodo.izq), altura(nodo.der));\n}\n\nconsole.log(altura(arbol([8, 3, 10, 1, 6, null, 14])));\nconsole.log(altura(arbol([1, 2, null, 3, null, 4])));   // a stick leaning left\nconsole.log(altura(arbol([])));",
            },
            notas: {
              es: "3 para el árbol de siempre; 4 para la vara (cuatro nodos, uno por nivel), y 0 para el vacío.",
              en: "3 for the usual tree; 4 for the stick (four nodes, one per level), and 0 for the empty one.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "El espejo y el ancestro común", en: "The mirror and the common ancestor" },
          texto: {
            es: "**Invertir** un árbol (hacerlo espejo) es intercambiar los dos hijos de cada nodo. Con recursión: invierte la izquierda, invierte la derecha y cámbialas de lado. El inorden del espejo sale exactamente al revés.\n\nEl **ancestro común más bajo** de dos nodos es el nodo más profundo que tiene a los dos debajo. La misma forma: si el nodo es uno de los dos, contesta él; si no, pregunta a sus dos lados. Si los dos lados encontraron algo, los nodos están separados y el ancestro es él.",
            en: "**Inverting** a tree (mirroring it) means swapping the two children of every node. Recursively: invert the left, invert the right and swap them. The mirror's inorder comes out exactly reversed.\n\nThe **lowest common ancestor** of two nodes is the deepest node that has both below it. Same shape: if the node is one of the two, it answers itself; otherwise it asks both sides. If both sides found something, the nodes are split up and the ancestor is this one.",
          },
          programa: {
            codigo: {
              es: BASE + "function inorden(n, r = []) {\n  if (n) { inorden(n.izq, r); r.push(n.valor); inorden(n.der, r); }\n  return r;\n}\n\nfunction invertir(nodo) {\n  if (nodo === null) return null;\n  const izq = invertir(nodo.izq);\n  const der = invertir(nodo.der);\n  nodo.izq = der;\n  nodo.der = izq;\n  return nodo;\n}\n\nfunction ancestro(nodo, p, q) {\n  if (nodo === null || nodo.valor === p || nodo.valor === q) return nodo;\n  const izq = ancestro(nodo.izq, p, q);\n  const der = ancestro(nodo.der, p, q);\n  if (izq && der) return nodo;      // uno a cada lado: soy yo\n  return izq ?? der;                // los dos del mismo lado\n}\n\nconst raiz = arbol([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);\nconsole.log(\"ancestro de 5 y 1:\", ancestro(raiz, 5, 1).valor);\nconsole.log(\"ancestro de 7 y 4:\", ancestro(raiz, 7, 4).valor);\nconsole.log(\"ancestro de 5 y 4:\", ancestro(raiz, 5, 4).valor);\n\nconsole.log(\"antes: \", inorden(raiz));\ninvertir(raiz);\nconsole.log(\"espejo:\", inorden(raiz));",
              en: BASE + "function inorden(n, r = []) {\n  if (n) { inorden(n.izq, r); r.push(n.valor); inorden(n.der, r); }\n  return r;\n}\n\nfunction invertir(nodo) {\n  if (nodo === null) return null;\n  const izq = invertir(nodo.izq);\n  const der = invertir(nodo.der);\n  nodo.izq = der;\n  nodo.der = izq;\n  return nodo;\n}\n\nfunction ancestro(nodo, p, q) {\n  if (nodo === null || nodo.valor === p || nodo.valor === q) return nodo;\n  const izq = ancestro(nodo.izq, p, q);\n  const der = ancestro(nodo.der, p, q);\n  if (izq && der) return nodo;      // one on each side: it's me\n  return izq ?? der;                // both on the same side\n}\n\nconst raiz = arbol([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);\nconsole.log(\"ancestor of 5 and 1:\", ancestro(raiz, 5, 1).valor);\nconsole.log(\"ancestor of 7 and 4:\", ancestro(raiz, 7, 4).valor);\nconsole.log(\"ancestor of 5 and 4:\", ancestro(raiz, 5, 4).valor);\n\nconsole.log(\"before:\", inorden(raiz));\ninvertir(raiz);\nconsole.log(\"mirror:\", inorden(raiz));",
            },
            notas: {
              es: "- El 5 y el 1 están a cada lado de la raíz: su ancestro es el 3. El 7 y el 4 cuelgan del 2.\n- Para el 5 y el 4 sale el 5: un nodo cuenta como ancestro de sí mismo, y el 4 está debajo de él.\n- El inorden del espejo es el de antes, leído de atrás para adelante.",
              en: "- 5 and 1 are on either side of the root: their ancestor is 3. 7 and 4 hang from 2.\n- For 5 and 4 you get 5: a node counts as its own ancestor, and 4 is below it.\n- The mirror's inorder is the previous one, read back to front.",
            },
          },
          dibujo: { tipo: "arbol", valores: [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], resalta: [5, 4] },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Cuál es el **preorden** de este árbol?", en: "What is this tree's **preorder**?" },
          codigo: "//        1\n//      /   \\\n//     2     3\n//    / \\\n//   4   5\nconst raiz = arbol([1, 2, 3, 4, 5]);",
          opciones: ["1, 2, 4, 5, 3", "4, 2, 5, 1, 3", "4, 5, 2, 3, 1", "1, 2, 3, 4, 5"],
          correcta: 0,
          porque: { es: "Preorden: nodo, izquierda, derecha. El 1, luego todo su lado izquierdo en preorden (2, 4, 5) y al final el 3. La segunda opción es el inorden, la tercera el postorden y la última el recorrido por niveles.", en: "Preorder: node, left, right. 1, then its whole left side in preorder (2, 4, 5), and finally 3. The second option is inorder, the third postorder and the last one level order." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿En qué recorrido el nodo se visita **después** de sus dos hijos?", en: "In which traversal is a node visited **after** both of its children?" },
          opciones: [
            { es: "Preorden", en: "Preorder" },
            { es: "Inorden", en: "Inorder" },
            { es: "Postorden", en: "Postorder" },
          ],
          correcta: 2,
          porque: { es: "**Post**orden: izquierda, derecha y al final el nodo. Por eso sirve para la altura o para borrar un árbol: el padre decide cuando ya sabe todo de sus hijos.", en: "**Post**order: left, right and the node last. That's why it's used for height or deleting a tree: the parent decides once it knows everything about its children." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa la altura de un árbol.", en: "Complete the height of a tree." },
          codigo: "function altura(nodo) {\n  if (nodo === ___) return 0;\n  return 1 + Math.___(altura(nodo.izq), altura(nodo.der));\n}",
          huecos: ["null", "max"],
          banco: ["null", "max", "min", "undefined", "0"],
          porque: { es: "El árbol vacío (`null`) mide 0, y el nodo suma 1 a la **mayor** de sus dos alturas. Con `min` sacarías la profundidad de la hoja más cercana… casi: eso tiene su propia trampa con los nodos de un solo hijo.", en: "The empty tree (`null`) has height 0, and the node adds 1 to the **larger** of its two heights. With `min` you'd get the depth of the nearest leaf… almost: that has its own trap with one-child nodes." },
        },
        {
          tipo: "ordena",
          pregunta: { es: "Ordena el recorrido en **postorden** que imprime cada valor.", en: "Put the **postorder** traversal that prints each value in order." },
          lineas: [
            "function postorden(nodo) {",
            "  if (nodo === null) return;",
            "  postorden(nodo.izq);",
            "  postorden(nodo.der);",
            "  console.log(nodo.valor);",
            "}",
          ],
          porque: { es: "Caso base, luego los dos hijos (izquierda antes que derecha) y el `console.log` al final: eso es lo que lo hace postorden.", en: "Base case, then both children (left before right) and the `console.log` last: that's what makes it postorder." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `invertir(nodo)`: cambia de lado los dos hijos de **cada** nodo y devuelve la raíz. Para el árbol vacío devuelve `null`. Las pruebas miran el inorden del resultado con `enOrden`, que ya está escrita.",
            en: "Write `invertir(nodo)`: swap the two children of **every** node and return the root. For the empty tree, return `null`. The tests check the result's inorder with `enOrden`, which is already written.",
          },
          inicial: {
            es: BASE + "function enOrden(n, r = []) {\n  if (n) { enOrden(n.izq, r); r.push(n.valor); enOrden(n.der, r); }\n  return r;\n}\n\nfunction invertir(nodo) {\n  // invierte los dos lados y cámbialos\n}\n\nconsole.log(enOrden(invertir(arbol([4, 2, 7, 1, 3, 6, 9]))));",
            en: BASE + "function enOrden(n, r = []) {\n  if (n) { enOrden(n.izq, r); r.push(n.valor); enOrden(n.der, r); }\n  return r;\n}\n\nfunction invertir(nodo) {\n  // invert both sides and swap them\n}\n\nconsole.log(enOrden(invertir(arbol([4, 2, 7, 1, 3, 6, 9]))));",
          },
          pruebas: [
            { llamada: "enOrden(invertir(arbol([4, 2, 7, 1, 3, 6, 9])))", espera: "[9,7,6,4,3,2,1]" },
            { llamada: "enOrden(invertir(arbol([1, 2])))", espera: "[1,2]" },
            { llamada: "invertir(null)", espera: "null" },
            { llamada: "invertir(arbol([5])).valor", espera: "5" },
          ],
          solucion: BASE + "function enOrden(n, r = []) {\n  if (n) { enOrden(n.izq, r); r.push(n.valor); enOrden(n.der, r); }\n  return r;\n}\n\nfunction invertir(nodo) {\n  if (nodo === null) return null;\n  const izq = invertir(nodo.izq);\n  nodo.izq = invertir(nodo.der);\n  nodo.der = izq;\n  return nodo;\n}",
          porque: { es: "Guarda un lado antes de pisarlo, como el intercambio con variable auxiliar de la primera unidad. Si haces `nodo.izq = invertir(nodo.der)` sin guardar, pierdes el hijo izquierdo original.", en: "Save one side before overwriting it, like the swap with a helper variable from the first unit. If you do `nodo.izq = invertir(nodo.der)` without saving, you lose the original left child." },
        },
      ],
    },
    {
      id: "recorrido-por-niveles",
      titulo: { es: "Recorrido por niveles", en: "Level-order traversal" },
      resumen: {
        es: "Visitar el árbol piso por piso con una cola (BFS). Los niveles como arreglos y la vista desde la derecha.",
        en: "Visiting the tree floor by floor with a queue (BFS). Levels as arrays and the view from the right.",
      },
      retos: ["binary-tree-level-order-traversal"],
      enlaces: [
        { url: "https://es.wikipedia.org/wiki/B%C3%BAsqueda_en_anchura", texto: { es: "Búsqueda en anchura (Wikipedia)", en: "Breadth-first search (Wikipedia, Spanish)" } },
      ],
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Piso por piso, con una cola", en: "Floor by floor, with a queue" },
          texto: {
            es: "El recorrido en profundidad se va hasta el fondo de una rama. El **recorrido por niveles** (BFS, *breadth-first search*, búsqueda en anchura) hace lo contrario: primero la raíz, luego todos sus hijos, luego todos los nietos.\n\nNo sale con recursión sino con una **cola**: se mete la raíz; mientras la cola no esté vacía, se saca el de enfrente, se visita y se forman sus hijos al final. Como la cola es primero en entrar, primero en salir, los de un piso siempre salen antes que los del siguiente.",
            en: "Depth-first goes to the bottom of a branch. **Level-order traversal** (BFS, breadth-first search) does the opposite: the root first, then all its children, then all the grandchildren.\n\nIt isn't done with recursion but with a **queue**: put the root in; while the queue isn't empty, take the one at the front, visit it and line its children up at the back. Since a queue is first in, first out, everyone on one floor always comes out before anyone on the next.",
          },
          dibujo: { tipo: "arbol", valores: [3, 9, 20, null, null, 15, 7] },
          programa: {
            codigo: {
              es: BASE + "function porAnchura(raiz) {\n  if (raiz === null) return;\n  const cola = [raiz];\n  while (cola.length > 0) {\n    const nodo = cola.shift();                    // sale el de enfrente\n    if (nodo.izq) cola.push(nodo.izq);            // sus hijos, al final\n    if (nodo.der) cola.push(nodo.der);\n    console.log(\"visito\", nodo.valor, \"| la cola queda:\", cola.map((n) => n.valor));\n  }\n}\n\nporAnchura(arbol([3, 9, 20, null, null, 15, 7]));",
              en: BASE + "function porAnchura(raiz) {\n  if (raiz === null) return;\n  const cola = [raiz];\n  while (cola.length > 0) {\n    const nodo = cola.shift();                    // the front one leaves\n    if (nodo.izq) cola.push(nodo.izq);            // its children go to the back\n    if (nodo.der) cola.push(nodo.der);\n    console.log(\"visit\", nodo.valor, \"| queue now:\", cola.map((n) => n.valor));\n  }\n}\n\nporAnchura(arbol([3, 9, 20, null, null, 15, 7]));",
            },
            notas: {
              es: "El orden es 3, 9, 20, 15, 7: piso por piso, de izquierda a derecha. Mira la cola después de visitar el 20: sus hijos, 15 y 7, se formaron al final y salen en las dos vueltas siguientes.",
              en: "The order is 3, 9, 20, 15, 7: floor by floor, left to right. Look at the queue after visiting 20: its children, 15 and 7, lined up at the back and come out in the next two rounds.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Cada nivel en su arreglo", en: "Each level in its own array" },
          texto: {
            es: "A veces no basta el orden: se quiere saber **dónde termina cada piso**. El truco es mirar cuántos hay en la cola al empezar una vuelta: ésos son exactamente los del nivel actual. Se sacan esos `tam`, se juntan en un arreglo, y los hijos que se formaron mientras tanto son el nivel siguiente.\n\nAsí sale `[[3], [9, 20], [15, 7]]`, que es el reto «Binary Tree Level Order Traversal».",
            en: "Sometimes the order isn't enough: you want to know **where each floor ends**. The trick is to check how many are in the queue when a round starts: those are exactly the current level. Take out those `tam`, collect them in an array, and the children queued meanwhile are the next level.\n\nThat gives `[[3], [9, 20], [15, 7]]`, which is the \"Binary Tree Level Order Traversal\" challenge.",
          },
          programa: {
            codigo: {
              es: BASE + "function niveles(raiz) {\n  const r = [];\n  if (raiz === null) return r;\n  const cola = [raiz];\n  while (cola.length > 0) {\n    const tam = cola.length;        // los de este nivel\n    const nivel = [];\n    for (let i = 0; i < tam; i++) {\n      const nodo = cola.shift();\n      nivel.push(nodo.valor);\n      if (nodo.izq) cola.push(nodo.izq);\n      if (nodo.der) cola.push(nodo.der);\n    }\n    r.push(nivel);\n  }\n  return r;\n}\n\nconsole.log(niveles(arbol([3, 9, 20, null, null, 15, 7])));\nconsole.log(niveles(arbol([8, 3, 10, 1, 6, null, 14])));",
              en: BASE + "function niveles(raiz) {\n  const r = [];\n  if (raiz === null) return r;\n  const cola = [raiz];\n  while (cola.length > 0) {\n    const tam = cola.length;        // the ones on this level\n    const nivel = [];\n    for (let i = 0; i < tam; i++) {\n      const nodo = cola.shift();\n      nivel.push(nodo.valor);\n      if (nodo.izq) cola.push(nodo.izq);\n      if (nodo.der) cola.push(nodo.der);\n    }\n    r.push(nivel);\n  }\n  return r;\n}\n\nconsole.log(niveles(arbol([3, 9, 20, null, null, 15, 7])));\nconsole.log(niveles(arbol([8, 3, 10, 1, 6, null, 14])));",
            },
            notas: {
              es: "Un arreglo por piso. El número de arreglos es la altura del árbol, y el más largo te dice cuál es el piso más ancho.",
              en: "One array per floor. The number of arrays is the tree's height, and the longest one tells you the widest floor.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Lo que se ve desde la derecha", en: "What you see from the right" },
          texto: {
            es: "Con los niveles separados salen problemas que con profundidad serían enredosos. Si te paras a la derecha del árbol, de cada piso sólo ves **el último** nodo: la «vista derecha» es el último de cada nivel.\n\nUna nota de costo: `shift()` en un arreglo es O(n), porque recorre todo para cerrar el hueco (lo viste en la unidad de colas). Para árboles chicos da igual; para millones de nodos, usa la cola con índice de enfrente.",
            en: "With the levels separated, problems that would be messy depth-first come out easily. If you stand to the right of the tree, on each floor you only see **the last** node: the \"right side view\" is the last of each level.\n\nA note on cost: `shift()` on an array is O(n), because it moves everything to close the gap (you saw this in the queues unit). For small trees it doesn't matter; for millions of nodes, use the queue with a front index.",
          },
          programa: {
            codigo: {
              es: BASE + "function vistaDerecha(raiz) {\n  const r = [];\n  const cola = raiz ? [raiz] : [];\n  let frente = 0;                   // en vez de shift(): un índice\n  while (frente < cola.length) {\n    const fin = cola.length;        // el nivel va de frente a fin\n    for (let i = frente; i < fin; i++) {\n      const nodo = cola[i];\n      if (i === fin - 1) r.push(nodo.valor);   // el último del piso\n      if (nodo.izq) cola.push(nodo.izq);\n      if (nodo.der) cola.push(nodo.der);\n    }\n    frente = fin;\n  }\n  return r;\n}\n\nconsole.log(vistaDerecha(arbol([1, 2, 3, null, 5, null, 4])));\nconsole.log(vistaDerecha(arbol([1, 2, 3, 4])));",
              en: BASE + "function vistaDerecha(raiz) {\n  const r = [];\n  const cola = raiz ? [raiz] : [];\n  let frente = 0;                   // instead of shift(): an index\n  while (frente < cola.length) {\n    const fin = cola.length;        // the level runs from frente to fin\n    for (let i = frente; i < fin; i++) {\n      const nodo = cola[i];\n      if (i === fin - 1) r.push(nodo.valor);   // last one on the floor\n      if (nodo.izq) cola.push(nodo.izq);\n      if (nodo.der) cola.push(nodo.der);\n    }\n    frente = fin;\n  }\n  return r;\n}\n\nconsole.log(vistaDerecha(arbol([1, 2, 3, null, 5, null, 4])));\nconsole.log(vistaDerecha(arbol([1, 2, 3, 4])));",
            },
            notas: {
              es: "- Primer árbol: 1, 3 y 4, los de la orilla derecha.\n- Segundo: 1, 3 y **4**, aunque el 4 cuelga del lado izquierdo: en su piso no hay nadie más a su derecha que lo tape.",
              en: "- First tree: 1, 3 and 4, the ones on the right edge.\n- Second: 1, 3 and **4**, even though 4 hangs on the left side: on its floor there's nobody further right to hide it.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué estructura usa el recorrido por niveles para saber a quién visitar después?", en: "What structure does level-order traversal use to know who to visit next?" },
          opciones: [
            { es: "Una cola", en: "A queue" },
            { es: "Una pila", en: "A stack" },
            { es: "Un Set", en: "A Set" },
            { es: "Un arreglo ordenado", en: "A sorted array" },
          ],
          correcta: 0,
          porque: { es: "Una **cola**: los nodos salen en el orden en que se formaron, y eso mantiene los pisos en orden. Con una pila saldría un recorrido en profundidad.", en: "A **queue**: nodes come out in the order they were queued, which keeps the floors in order. With a stack you'd get a depth-first traversal." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿En qué orden visita los nodos un recorrido por niveles de `arbol([1, 2, 3, 4, 5, 6, 7])`?", en: "In what order does a level-order traversal of `arbol([1, 2, 3, 4, 5, 6, 7])` visit the nodes?" },
          opciones: ["1, 2, 3, 4, 5, 6, 7", "1, 2, 4, 5, 3, 6, 7", "4, 2, 5, 1, 6, 3, 7", "4, 5, 2, 6, 7, 3, 1"],
          correcta: 0,
          porque: { es: "La forma de escribir el árbol **es** su recorrido por niveles: piso por piso, de izquierda a derecha. Las otras son preorden, inorden y postorden.", en: "The way the tree is written **is** its level order: floor by floor, left to right. The others are preorder, inorder and postorder." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa la vuelta que procesa un nivel entero.", en: "Complete the round that processes a whole level." },
          codigo: "const tam = cola.___;\nfor (let i = 0; i < tam; i++) {\n  const nodo = cola.___();\n  nivel.push(nodo.valor);\n  if (nodo.izq) cola.push(nodo.izq);\n  if (nodo.der) cola.push(nodo.der);\n}",
          huecos: ["length", "shift"],
          banco: ["length", "shift", "pop", "size"],
          porque: { es: "`tam` se toma **antes** del ciclo, porque la cola crece mientras tanto. Y se saca con `shift` (de enfrente); `pop` sacaría del final y revolvería los pisos.", en: "`tam` is read **before** the loop, because the queue grows meanwhile. And you take with `shift` (from the front); `pop` would take from the back and scramble the floors." },
        },
        {
          tipo: "ordena",
          pregunta: { es: "Ordena el recorrido por niveles que imprime cada valor.", en: "Put the level-order traversal that prints each value in order." },
          lineas: [
            "const cola = [raiz];",
            "while (cola.length > 0) {",
            "  const nodo = cola.shift();",
            "  console.log(nodo.valor);",
            "  if (nodo.izq) cola.push(nodo.izq);",
            "  if (nodo.der) cola.push(nodo.der);",
            "}",
          ],
          porque: { es: "La raíz entra antes del ciclo; en cada vuelta sale uno, se visita y se forman sus hijos, el izquierdo antes que el derecho para que el piso salga de izquierda a derecha.", en: "The root goes in before the loop; each round one comes out, gets visited and its children are queued, left before right so the floor comes out left to right." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `porNiveles(raiz)`: devuelve un arreglo con un arreglo por nivel, de arriba abajo y de izquierda a derecha. Para el árbol vacío, `[]`.",
            en: "Write `porNiveles(raiz)`: return an array with one array per level, top to bottom and left to right. For the empty tree, `[]`.",
          },
          inicial: {
            es: BASE + "function porNiveles(raiz) {\n  const r = [];\n  // una cola y, en cada vuelta, cuántos hay en ella\n  return r;\n}\n\nconsole.log(porNiveles(arbol([3, 9, 20, null, null, 15, 7])));",
            en: BASE + "function porNiveles(raiz) {\n  const r = [];\n  // a queue and, each round, how many are in it\n  return r;\n}\n\nconsole.log(porNiveles(arbol([3, 9, 20, null, null, 15, 7])));",
          },
          pruebas: [
            { llamada: "porNiveles(arbol([3, 9, 20, null, null, 15, 7]))", espera: "[[3],[9,20],[15,7]]" },
            { llamada: "porNiveles(arbol([1]))", espera: "[[1]]" },
            { llamada: "porNiveles(null)", espera: "[]" },
            { llamada: "porNiveles(arbol([1, 2, 3, 4, null, null, 5]))", espera: "[[1],[2,3],[4,5]]" },
          ],
          solucion: BASE + "function porNiveles(raiz) {\n  const r = [];\n  if (raiz === null) return r;\n  const cola = [raiz];\n  while (cola.length > 0) {\n    const tam = cola.length;\n    const nivel = [];\n    for (let i = 0; i < tam; i++) {\n      const nodo = cola.shift();\n      nivel.push(nodo.valor);\n      if (nodo.izq) cola.push(nodo.izq);\n      if (nodo.der) cola.push(nodo.der);\n    }\n    r.push(nivel);\n  }\n  return r;\n}",
          porque: { es: "La clave es `tam`: fijar cuántos son del nivel antes de empezar a sacar. Sin él, los hijos recién formados se mezclarían con el piso de sus padres.", en: "The key is `tam`: pin down how many belong to the level before you start taking them out. Without it, freshly queued children would mix into their parents' floor." },
        },
      ],
    },
  ],
};
