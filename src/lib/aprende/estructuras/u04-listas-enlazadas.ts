import type { Unidad } from "../tipos";

export const U04: Unidad = {
  id: "listas-enlazadas",
  titulo: { es: "Listas enlazadas", en: "Linked lists" },
  lecciones: [
    {
      id: "nodos-y-punteros",
      titulo: { es: "Nodos y punteros", en: "Nodes and pointers" },
      resumen: {
        es: "Una lista hecha de cajitas que se apuntan una a otra: recorrerla, meter al principio en O(1) y al final con una cola.",
        en: "A list made of little boxes pointing to each other: walking it, adding at the front in O(1) and at the end with a tail.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Cajitas que se apuntan", en: "Boxes pointing to each other" },
          texto: {
            es: "Un arreglo pone todo junto. Una **lista enlazada** no: cada elemento vive en su propio **nodo**, en cualquier parte de la memoria, y cada nodo guarda dos cosas: su `valor` y una **referencia** al `siguiente` nodo. El último apunta a `null`.\n\nAquí es donde sirve la lección de valores y referencias: `siguiente` no guarda una copia del otro nodo, guarda **dónde está**. La lista entera se reconoce por su primer nodo, la **cabeza**.",
            en: "An array keeps everything together. A **linked list** doesn't: each item lives in its own **node**, anywhere in memory, and each node stores two things: its `valor` (value) and a **reference** to the `siguiente` (next) node. The last one points to `null`.\n\nThis is where the values-and-references lesson pays off: `siguiente` doesn't hold a copy of the other node, it holds **where it is**. The whole list is known by its first node, the **head**.",
          },
          dibujo: { tipo: "lista", valores: [3, 8, 5] },
          programa: {
            codigo: {
              es: "class Nodo {\n  constructor(valor, siguiente = null) {\n    this.valor = valor;\n    this.siguiente = siguiente;\n  }\n}\n\n// 3 -> 8 -> 5 -> null, armada a mano\nconst c = new Nodo(5);\nconst b = new Nodo(8, c);\nconst cabeza = new Nodo(3, b);\n\nconsole.log(cabeza.valor);\nconsole.log(cabeza.siguiente.valor);\nconsole.log(cabeza.siguiente.siguiente.valor);\nconsole.log(cabeza.siguiente.siguiente.siguiente);",
              en: "class Nodo {\n  constructor(valor, siguiente = null) {\n    this.valor = valor;\n    this.siguiente = siguiente;\n  }\n}\n\n// 3 -> 8 -> 5 -> null, built by hand\nconst c = new Nodo(5);\nconst b = new Nodo(8, c);\nconst cabeza = new Nodo(3, b);\n\nconsole.log(cabeza.valor);\nconsole.log(cabeza.siguiente.valor);\nconsole.log(cabeza.siguiente.siguiente.valor);\nconsole.log(cabeza.siguiente.siguiente.siguiente);",
            },
            notas: {
              es: "Desde la cabeza se llega a todo siguiendo `siguiente`: 3, 8, 5 y luego `null`, el fin de la lista. No hay índices: para llegar al tercero hay que pasar por los dos primeros.",
              en: "From the head you reach everything by following `siguiente`: 3, 8, 5 and then `null`, the end of the list. There are no indexes: to get to the third you have to go through the first two.",
            },
          },
          enlaces: [{ url: "https://visualgo.net/es/list", texto: { es: "Listas enlazadas animadas en VisuAlgo", en: "Animated linked lists on VisuAlgo" } }],
        },
        {
          tipo: "explica",
          titulo: { es: "Recorrer: seguir las flechas", en: "Walking: follow the arrows" },
          texto: {
            es: "Para recorrer una lista se usa un puntero `actual` que empieza en la cabeza y salta a `actual.siguiente` hasta caer en `null`. Es O(n), como en un arreglo.\n\nLo que se pierde es el acceso directo: en un arreglo `arr[1000]` es O(1); en una lista, llegar al nodo 1000 son 1000 saltos, **O(n)**. A cambio, vas a ver que meter y sacar nodos no obliga a mover a nadie.",
            en: "To walk a list you use a pointer `actual` (current) that starts at the head and jumps to `actual.siguiente` until it hits `null`. It's O(n), like an array.\n\nWhat you lose is direct access: in an array `arr[1000]` is O(1); in a list, reaching node 1000 takes 1000 hops, **O(n)**. In exchange, you'll see that adding and removing nodes doesn't force anyone to move.",
          },
          programa: {
            codigo: {
              es: "class Nodo {\n  constructor(valor, siguiente = null) { this.valor = valor; this.siguiente = siguiente; }\n}\nconst cabeza = new Nodo(3, new Nodo(8, new Nodo(5)));\n\nfunction imprimir(cabeza) {\n  const partes = [];\n  let actual = cabeza;\n  while (actual !== null) {\n    partes.push(actual.valor);\n    actual = actual.siguiente;   // salta al siguiente\n  }\n  console.log(partes.join(\" -> \") + \" -> null\");\n}\n\nfunction enPosicion(cabeza, i) {\n  let actual = cabeza;\n  for (let k = 0; k < i && actual; k++) actual = actual.siguiente;\n  return actual ? actual.valor : undefined;\n}\n\nimprimir(cabeza);\nconsole.log(enPosicion(cabeza, 2));\nconsole.log(enPosicion(cabeza, 7));",
              en: "class Nodo {\n  constructor(valor, siguiente = null) { this.valor = valor; this.siguiente = siguiente; }\n}\nconst cabeza = new Nodo(3, new Nodo(8, new Nodo(5)));\n\nfunction imprimir(cabeza) {\n  const partes = [];\n  let actual = cabeza;\n  while (actual !== null) {\n    partes.push(actual.valor);\n    actual = actual.siguiente;   // jump to the next\n  }\n  console.log(partes.join(\" -> \") + \" -> null\");\n}\n\nfunction enPosicion(cabeza, i) {\n  let actual = cabeza;\n  for (let k = 0; k < i && actual; k++) actual = actual.siguiente;\n  return actual ? actual.valor : undefined;\n}\n\nimprimir(cabeza);\nconsole.log(enPosicion(cabeza, 2));\nconsole.log(enPosicion(cabeza, 7));",
            },
            notas: {
              es: "- `imprimir` sigue las flechas hasta `null`.\n- `enPosicion(cabeza, 2)` da 5 después de dos saltos; pedir la posición 7 se queda sin lista y da `undefined`.",
              en: "- `imprimir` follows the arrows to `null`.\n- `enPosicion(cabeza, 2)` gives 5 after two hops; asking for position 7 runs out of list and gives `undefined`.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Meter al principio y al final", en: "Adding at the front and at the end" },
          texto: {
            es: "Meter **al principio** es lo que mejor hace una lista: el nodo nuevo apunta a la cabeza vieja y pasa a ser la cabeza. Nadie se mueve: **O(1)**. (En un arreglo, `unshift` era O(n).)\n\nMeter **al final** obliga a caminar hasta el último: O(n). A menos que guardes también una referencia al último nodo, la **cola** (*tail*): entonces es O(1) también. Por eso una clase `Lista` suele guardar `cabeza`, `cola` y su `tamano`.",
            en: "Adding **at the front** is what a list does best: the new node points to the old head and becomes the head. Nobody moves: **O(1)**. (In an array, `unshift` was O(n).)\n\nAdding **at the end** means walking to the last node: O(n). Unless you also keep a reference to the last node, the **tail**: then it's O(1) too. That's why a `Lista` class usually keeps `cabeza`, `cola` (tail) and its `tamano`.",
          },
          dibujo: { tipo: "lista", valores: ["nuevo", 3, 8, 5], resalta: [0] },
          programa: {
            codigo: {
              es: "class Nodo {\n  constructor(valor, siguiente = null) { this.valor = valor; this.siguiente = siguiente; }\n}\n\nclass Lista {\n  constructor() { this.cabeza = null; this.cola = null; this.tamano = 0; }\n  alPrincipio(valor) {\n    this.cabeza = new Nodo(valor, this.cabeza);   // apunta a la cabeza vieja\n    if (this.cola === null) this.cola = this.cabeza;\n    this.tamano++;\n  }\n  alFinal(valor) {\n    const nodo = new Nodo(valor);\n    if (this.cola === null) this.cabeza = this.cola = nodo;\n    else { this.cola.siguiente = nodo; this.cola = nodo; }   // sin caminar\n    this.tamano++;\n  }\n  aArreglo() {\n    const r = [];\n    for (let n = this.cabeza; n; n = n.siguiente) r.push(n.valor);\n    return r;\n  }\n}\n\nconst l = new Lista();\nl.alFinal(8);\nl.alFinal(5);\nl.alPrincipio(3);\nl.alPrincipio(1);\nconsole.log(l.aArreglo(), \"tamaño:\", l.tamano);",
              en: "class Nodo {\n  constructor(valor, siguiente = null) { this.valor = valor; this.siguiente = siguiente; }\n}\n\nclass Lista {\n  constructor() { this.cabeza = null; this.cola = null; this.tamano = 0; }\n  alPrincipio(valor) {\n    this.cabeza = new Nodo(valor, this.cabeza);   // points to the old head\n    if (this.cola === null) this.cola = this.cabeza;\n    this.tamano++;\n  }\n  alFinal(valor) {\n    const nodo = new Nodo(valor);\n    if (this.cola === null) this.cabeza = this.cola = nodo;\n    else { this.cola.siguiente = nodo; this.cola = nodo; }   // no walking\n    this.tamano++;\n  }\n  aArreglo() {\n    const r = [];\n    for (let n = this.cabeza; n; n = n.siguiente) r.push(n.valor);\n    return r;\n  }\n}\n\nconst l = new Lista();\nl.alFinal(8);\nl.alFinal(5);\nl.alPrincipio(3);\nl.alPrincipio(1);\nconsole.log(l.aArreglo(), \"size:\", l.tamano);",
            },
            notas: {
              es: "Los dos `alPrincipio` quedaron adelante en orden inverso (primero el 1, que entró al último) y los `alFinal` atrás. Ninguna operación recorrió la lista.",
              en: "The two `alPrincipio` calls ended up in front in reverse order (1 first, since it went in last) and the `alFinal` ones at the back. No operation walked the list.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Cuánto cuesta leer el elemento número `i` de una lista enlazada?", en: "How much does reading item number `i` of a linked list cost?" },
          opciones: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
          correcta: 2,
          porque: { es: "No hay casillas numeradas: hay que saltar nodo por nodo desde la cabeza. En el peor caso, `n` saltos.", en: "There are no numbered slots: you hop node by node from the head. In the worst case, `n` hops." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué imprime?", en: "What does it print?" },
          codigo: "const a = new Nodo(1);\nconst b = new Nodo(2);\na.siguiente = b;\nb.valor = 9;\nconsole.log(a.siguiente.valor);",
          opciones: ["1", "2", "9", "null"],
          correcta: 2,
          porque: { es: "`a.siguiente` no es una copia de `b`: es `b`. Cambiar `b.valor` se ve desde `a`.", en: "`a.siguiente` isn't a copy of `b`: it is `b`. Changing `b.valor` shows up through `a`." },
        },
        {
          tipo: "ordena",
          pregunta: { es: "Ordena el recorrido que suma los valores de una lista.", en: "Put in order the walk that adds up a list's values." },
          lineas: [
            "let suma = 0, actual = cabeza;",
            "while (actual !== null) {",
            "  suma += actual.valor;",
            "  actual = actual.siguiente;",
            "}",
          ],
          porque: { es: "Se empieza en la cabeza, se suma el valor del nodo actual y se salta al siguiente, hasta caer en `null`. Si saltas antes de sumar, te saltas la cabeza.", en: "Start at the head, add the current node's value and jump to the next, until you hit `null`. If you jump before adding, you skip the head." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `largo(cabeza)`: cuenta cuántos nodos tiene la lista. Una lista vacía es `null` y mide 0.\n\nYa tienes la clase `Nodo` y una función `desde(arreglo)` que arma una lista para probar.",
            en: "Write `largo(cabeza)`: count how many nodes the list has. An empty list is `null` and has length 0.\n\nYou already have the `Nodo` class and a `desde(arreglo)` function that builds a list to test with.",
          },
          inicial: {
            es: "class Nodo {\n  constructor(valor, siguiente = null) { this.valor = valor; this.siguiente = siguiente; }\n}\nconst desde = arr => arr.reduceRight((sig, v) => new Nodo(v, sig), null);\n\nfunction largo(cabeza) {\n  // sigue las flechas y cuenta\n}\n\nconsole.log(largo(desde([3, 8, 5])));",
            en: "class Nodo {\n  constructor(valor, siguiente = null) { this.valor = valor; this.siguiente = siguiente; }\n}\nconst desde = arr => arr.reduceRight((sig, v) => new Nodo(v, sig), null);\n\nfunction largo(cabeza) {\n  // follow the arrows and count\n}\n\nconsole.log(largo(desde([3, 8, 5])));",
          },
          pruebas: [
            { llamada: "largo(desde([3, 8, 5]))", espera: "3" },
            { llamada: "largo(desde([7]))", espera: "1" },
            { llamada: "largo(null)", espera: "0" },
          ],
          solucion: "class Nodo {\n  constructor(valor, siguiente = null) { this.valor = valor; this.siguiente = siguiente; }\n}\nconst desde = arr => arr.reduceRight((sig, v) => new Nodo(v, sig), null);\n\nfunction largo(cabeza) {\n  let n = 0;\n  for (let actual = cabeza; actual !== null; actual = actual.siguiente) n++;\n  return n;\n}",
          porque: { es: "Un recorrido con contador. Por eso la clase `Lista` guarda `tamano`: preguntarlo es O(1) en vez de O(n).", en: "A walk with a counter. That's why the `Lista` class keeps `tamano`: asking for it is O(1) instead of O(n)." },
        },
      ],
    },
    {
      id: "invertir-y-mezclar",
      titulo: { es: "Borrar, invertir y mezclar", en: "Removing, reversing and merging" },
      resumen: {
        es: "Cambiar flechas en vez de mover datos: sacar un nodo, invertir una lista en su lugar y juntar dos listas ordenadas.",
        en: "Changing arrows instead of moving data: removing a node, reversing a list in place and merging two sorted lists.",
      },
      retos: ["reverse-linked-list", "merge-two-sorted-lists"],
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Borrar es saltarse un nodo", en: "Removing is skipping a node" },
          texto: {
            es: "Para sacar un nodo de en medio no se mueve nada: el nodo **anterior** deja de apuntarle y apunta al que sigue. `anterior.siguiente = anterior.siguiente.siguiente`. El nodo saltado queda sin nadie que lo apunte y JavaScript lo recoge solo.\n\nEl caso raro es la cabeza, que no tiene anterior. Un truco muy usado es poner un **nodo falso** antes de la cabeza (un *centinela*, o *dummy*): así todos los nodos tienen anterior y el código no necesita un caso especial.",
            en: "To remove a node from the middle, nothing moves: the **previous** node stops pointing at it and points to the one after. `anterior.siguiente = anterior.siguiente.siguiente`. The skipped node has nobody pointing at it, and JavaScript cleans it up on its own.\n\nThe odd case is the head, which has no previous node. A common trick is to put a **fake node** before the head (a *sentinel*, or *dummy*): then every node has a previous one and the code needs no special case.",
          },
          dibujo: { tipo: "lista", valores: [3, 8, 5], resalta: [1] },
          programa: {
            codigo: {
              es: "class Nodo {\n  constructor(valor, siguiente = null) { this.valor = valor; this.siguiente = siguiente; }\n}\nconst desde = arr => arr.reduceRight((sig, v) => new Nodo(v, sig), null);\nconst ver = c => { const r = []; for (; c; c = c.siguiente) r.push(c.valor); return r.join(\" -> \") || \"(vacía)\"; };\n\nfunction borrar(cabeza, x) {\n  const falso = new Nodo(null, cabeza);   // centinela antes de la cabeza\n  let anterior = falso;\n  while (anterior.siguiente !== null) {\n    if (anterior.siguiente.valor === x) {\n      anterior.siguiente = anterior.siguiente.siguiente;  // saltarlo\n      break;\n    }\n    anterior = anterior.siguiente;\n  }\n  return falso.siguiente;   // la cabeza (quizá nueva)\n}\n\nconsole.log(ver(borrar(desde([3, 8, 5]), 8)));\nconsole.log(ver(borrar(desde([3, 8, 5]), 3)));\nconsole.log(ver(borrar(desde([3]), 3)));",
              en: "class Nodo {\n  constructor(valor, siguiente = null) { this.valor = valor; this.siguiente = siguiente; }\n}\nconst desde = arr => arr.reduceRight((sig, v) => new Nodo(v, sig), null);\nconst ver = c => { const r = []; for (; c; c = c.siguiente) r.push(c.valor); return r.join(\" -> \") || \"(empty)\"; };\n\nfunction borrar(cabeza, x) {\n  const falso = new Nodo(null, cabeza);   // sentinel before the head\n  let anterior = falso;\n  while (anterior.siguiente !== null) {\n    if (anterior.siguiente.valor === x) {\n      anterior.siguiente = anterior.siguiente.siguiente;  // skip it\n      break;\n    }\n    anterior = anterior.siguiente;\n  }\n  return falso.siguiente;   // the head (maybe a new one)\n}\n\nconsole.log(ver(borrar(desde([3, 8, 5]), 8)));\nconsole.log(ver(borrar(desde([3, 8, 5]), 3)));\nconsole.log(ver(borrar(desde([3]), 3)));",
            },
            notas: {
              es: "Las tres salen bien con el mismo código: borrar en medio, borrar la cabeza y dejar la lista vacía. Sin el centinela, los dos últimos casos necesitarían un `if` aparte.",
              en: "All three work with the same code: removing from the middle, removing the head, and emptying the list. Without the sentinel, the last two cases would need a separate `if`.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Invertir: voltear cada flecha", en: "Reversing: flip every arrow" },
          texto: {
            es: "Invertir una lista no copia nada: **voltea cada flecha**. Se camina con tres punteros:\n\n- `anterior`: lo que ya quedó volteado (empieza en `null`).\n- `actual`: el nodo que toca voltear.\n- `siguiente`: se guarda **antes** de voltear, porque al cambiar `actual.siguiente` se pierde el camino.\n\nEn cada paso, `actual` pasa a apuntar a `anterior`, y los tres avanzan. Al final, `anterior` es la cabeza nueva. O(n) y sin memoria extra. Es uno de los retos de entrevista más famosos.",
            en: "Reversing a list copies nothing: it **flips every arrow**. You walk with three pointers:\n\n- `anterior` (previous): what's already flipped (starts at `null`).\n- `actual` (current): the node whose turn it is.\n- `siguiente` (next): saved **before** flipping, because changing `actual.siguiente` loses the way forward.\n\nAt each step, `actual` starts pointing to `anterior`, and all three move on. At the end, `anterior` is the new head. O(n), no extra memory. It's one of the most famous interview problems.",
          },
          programa: {
            codigo: {
              es: "class Nodo {\n  constructor(valor, siguiente = null) { this.valor = valor; this.siguiente = siguiente; }\n}\nconst desde = arr => arr.reduceRight((sig, v) => new Nodo(v, sig), null);\nconst ver = c => { const r = []; for (; c; c = c.siguiente) r.push(c.valor); return r.join(\" -> \"); };\n\nfunction invertir(cabeza) {\n  let anterior = null, actual = cabeza;\n  while (actual !== null) {\n    const siguiente = actual.siguiente;  // guardar el camino\n    actual.siguiente = anterior;         // voltear la flecha\n    anterior = actual;                   // avanzar los tres\n    actual = siguiente;\n    console.log(\"  volteado:\", ver(anterior), \"| falta:\", ver(actual) || \"nada\");\n  }\n  return anterior;\n}\n\nconsole.log(ver(invertir(desde([1, 2, 3, 4]))));",
              en: "class Nodo {\n  constructor(valor, siguiente = null) { this.valor = valor; this.siguiente = siguiente; }\n}\nconst desde = arr => arr.reduceRight((sig, v) => new Nodo(v, sig), null);\nconst ver = c => { const r = []; for (; c; c = c.siguiente) r.push(c.valor); return r.join(\" -> \"); };\n\nfunction invertir(cabeza) {\n  let anterior = null, actual = cabeza;\n  while (actual !== null) {\n    const siguiente = actual.siguiente;  // save the way forward\n    actual.siguiente = anterior;         // flip the arrow\n    anterior = actual;                   // move all three\n    actual = siguiente;\n    console.log(\"  flipped:\", ver(anterior), \"| left:\", ver(actual) || \"nothing\");\n  }\n  return anterior;\n}\n\nconsole.log(ver(invertir(desde([1, 2, 3, 4]))));",
            },
            notas: {
              es: "En cada vuelta la parte volteada crece por delante (1, luego 2 -> 1, luego 3 -> 2 -> 1…) y lo que falta se encoge. Al final queda 4 -> 3 -> 2 -> 1.",
              en: "Each turn the flipped part grows at the front (1, then 2 -> 1, then 3 -> 2 -> 1…) and what's left shrinks. You end with 4 -> 3 -> 2 -> 1.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Mezclar dos listas ordenadas", en: "Merging two sorted lists" },
          texto: {
            es: "Si tienes dos listas ya ordenadas, juntarlas en una sola ordenada es como dos filas que se vuelven una: comparas los dos primeros, tomas el más chico y avanzas en esa lista. Cuando una se acaba, la otra se cuelga entera al final.\n\nCon un nodo centinela al principio, el código queda corto. Es O(n + m) y no crea nodos nuevos: sólo reacomoda flechas. Esta mezcla es la mitad de **merge sort**, que vas a ver en recursión.",
            en: "If you have two already-sorted lists, joining them into one sorted list is like two lines becoming one: compare the two fronts, take the smaller, and advance in that list. When one runs out, hang the rest of the other at the end.\n\nWith a sentinel node at the start, the code stays short. It's O(n + m) and creates no new nodes: it only rearranges arrows. This merge is half of **merge sort**, which you'll see in recursion.",
          },
          programa: {
            codigo: {
              es: "class Nodo {\n  constructor(valor, siguiente = null) { this.valor = valor; this.siguiente = siguiente; }\n}\nconst desde = arr => arr.reduceRight((sig, v) => new Nodo(v, sig), null);\nconst ver = c => { const r = []; for (; c; c = c.siguiente) r.push(c.valor); return r.join(\" -> \"); };\n\nfunction mezclar(a, b) {\n  const falso = new Nodo(null);\n  let fin = falso;\n  while (a !== null && b !== null) {\n    if (a.valor <= b.valor) { fin.siguiente = a; a = a.siguiente; }\n    else { fin.siguiente = b; b = b.siguiente; }\n    fin = fin.siguiente;\n  }\n  fin.siguiente = a !== null ? a : b;   // lo que sobre, entero\n  return falso.siguiente;\n}\n\nconsole.log(ver(mezclar(desde([1, 4, 9]), desde([2, 3, 10, 12]))));",
              en: "class Nodo {\n  constructor(valor, siguiente = null) { this.valor = valor; this.siguiente = siguiente; }\n}\nconst desde = arr => arr.reduceRight((sig, v) => new Nodo(v, sig), null);\nconst ver = c => { const r = []; for (; c; c = c.siguiente) r.push(c.valor); return r.join(\" -> \"); };\n\nfunction mezclar(a, b) {\n  const falso = new Nodo(null);\n  let fin = falso;\n  while (a !== null && b !== null) {\n    if (a.valor <= b.valor) { fin.siguiente = a; a = a.siguiente; }\n    else { fin.siguiente = b; b = b.siguiente; }\n    fin = fin.siguiente;\n  }\n  fin.siguiente = a !== null ? a : b;   // whatever's left, whole\n  return falso.siguiente;\n}\n\nconsole.log(ver(mezclar(desde([1, 4, 9]), desde([2, 3, 10, 12]))));",
            },
            notas: {
              es: "Se van tomando 1, 2, 3, 4, 9; ahí la primera lista se acaba y «10 -> 12» se cuelga tal cual, sin compararlo.",
              en: "It takes 1, 2, 3, 4, 9; then the first list runs out and \"10 -> 12\" is hung as is, without comparing.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "Al invertir, ¿por qué hay que guardar `actual.siguiente` antes de cambiarlo?", en: "When reversing, why must you save `actual.siguiente` before changing it?" },
          opciones: [
            { es: "Para poder imprimirlo después", en: "So you can print it later" },
            { es: "Porque al voltear la flecha se pierde el camino al resto de la lista", en: "Because flipping the arrow loses the way to the rest of the list" },
            { es: "Porque JavaScript no deja cambiar propiedades", en: "Because JavaScript doesn't allow changing properties" },
            { es: "No hace falta guardarlo", en: "You don't need to save it" },
          ],
          correcta: 1,
          porque: { es: "`actual.siguiente` era la única referencia al resto de la lista. Si la cambias primero, ya no tienes cómo seguir.", en: "`actual.siguiente` was the only reference to the rest of the list. If you change it first, you have no way to keep going." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa la línea que borra el nodo que va después de `anterior`.", en: "Fill in the line that removes the node right after `anterior`." },
          codigo: "anterior.___ = anterior.siguiente.___;",
          huecos: ["siguiente", "siguiente"],
          banco: ["siguiente", "siguiente", "valor", "cabeza"],
          porque: { es: "`anterior` se salta un nodo: apunta al siguiente del siguiente. El nodo de en medio queda fuera de la lista.", en: "`anterior` skips a node: it points to the next of the next. The node in between is out of the list." },
        },
        {
          tipo: "ordena",
          pregunta: { es: "Ordena el cuerpo del ciclo que invierte la lista.", en: "Put the body of the reversing loop in order." },
          lineas: [
            "const siguiente = actual.siguiente;",
            "actual.siguiente = anterior;",
            "anterior = actual;",
            "actual = siguiente;",
          ],
          porque: { es: "Guardar el camino, voltear la flecha y avanzar: primero `anterior` y luego `actual`. Si avanzas `actual` antes, `anterior` recibiría el nodo equivocado.", en: "Save the way, flip the arrow, and move on: first `anterior`, then `actual`. If you move `actual` first, `anterior` would get the wrong node." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `invertir(cabeza)` y devuelve la cabeza nueva. Las pruebas convierten el resultado en arreglo con `aArreglo` para comparar.",
            en: "Write `invertir(cabeza)` and return the new head. The tests turn the result into an array with `aArreglo` to compare.",
          },
          inicial: {
            es: "class Nodo {\n  constructor(valor, siguiente = null) { this.valor = valor; this.siguiente = siguiente; }\n}\nconst desde = arr => arr.reduceRight((sig, v) => new Nodo(v, sig), null);\nconst aArreglo = c => { const r = []; for (; c; c = c.siguiente) r.push(c.valor); return r; };\n\nfunction invertir(cabeza) {\n  let anterior = null, actual = cabeza;\n  // voltea cada flecha\n  return cabeza;\n}\n\nconsole.log(aArreglo(invertir(desde([1, 2, 3]))));",
            en: "class Nodo {\n  constructor(valor, siguiente = null) { this.valor = valor; this.siguiente = siguiente; }\n}\nconst desde = arr => arr.reduceRight((sig, v) => new Nodo(v, sig), null);\nconst aArreglo = c => { const r = []; for (; c; c = c.siguiente) r.push(c.valor); return r; };\n\nfunction invertir(cabeza) {\n  let anterior = null, actual = cabeza;\n  // flip every arrow\n  return cabeza;\n}\n\nconsole.log(aArreglo(invertir(desde([1, 2, 3]))));",
          },
          pruebas: [
            { llamada: "aArreglo(invertir(desde([1, 2, 3])))", espera: "[3,2,1]" },
            { llamada: "aArreglo(invertir(desde([7, 8])))", espera: "[8,7]" },
            { llamada: "aArreglo(invertir(desde([5])))", espera: "[5]" },
            { llamada: "invertir(null)", espera: "null" },
          ],
          solucion: "class Nodo {\n  constructor(valor, siguiente = null) { this.valor = valor; this.siguiente = siguiente; }\n}\nconst desde = arr => arr.reduceRight((sig, v) => new Nodo(v, sig), null);\nconst aArreglo = c => { const r = []; for (; c; c = c.siguiente) r.push(c.valor); return r; };\n\nfunction invertir(cabeza) {\n  let anterior = null, actual = cabeza;\n  while (actual !== null) {\n    const siguiente = actual.siguiente;\n    actual.siguiente = anterior;\n    anterior = actual;\n    actual = siguiente;\n  }\n  return anterior;\n}",
          porque: { es: "Se devuelve `anterior`, no `cabeza`: la cabeza vieja ahora es el último nodo y apunta a `null`. Con la lista vacía el ciclo no corre y `anterior` sigue en `null`.", en: "You return `anterior`, not `cabeza`: the old head is now the last node and points to `null`. With an empty list the loop never runs and `anterior` stays `null`." },
        },
      ],
    },
    {
      id: "lista-doble-y-ciclos",
      titulo: { es: "Listas dobles y ciclos", en: "Doubly linked lists and cycles" },
      resumen: {
        es: "Nodos que también apuntan hacia atrás, centinelas en las dos puntas y la tortuga y la liebre para detectar un ciclo.",
        en: "Nodes that also point backwards, sentinels at both ends, and the tortoise and the hare to detect a cycle.",
      },
      retos: ["linked-list-cycle"],
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Flechas de ida y de vuelta", en: "Arrows going both ways" },
          texto: {
            es: "En una **lista doble** cada nodo guarda `siguiente` y también `anterior`. Cuesta un poco más de memoria y hay que mantener dos flechas en cada cambio, pero a cambio:\n\n- se puede recorrer hacia atrás;\n- si ya tienes un nodo en la mano, **sacarlo es O(1)**: su anterior y su siguiente se apuntan entre sí, sin buscar a nadie.\n\nEsa última propiedad es la que hace funcionar la caché LRU de la última unidad. El historial de un navegador (atrás y adelante) también se parece mucho a esto.",
            en: "In a **doubly linked list** each node keeps `siguiente` and also `anterior` (previous). It costs a bit more memory and every change has to maintain two arrows, but in exchange:\n\n- you can walk it backwards;\n- if you already have a node in hand, **removing it is O(1)**: its previous and next point to each other, no searching needed.\n\nThat last property is what makes the LRU cache in the final unit work. A browser history (back and forward) looks a lot like this too.",
          },
          dibujo: { tipo: "lista", valores: ["A", "B", "C"], doble: true },
          programa: {
            codigo: {
              es: "class NodoDoble {\n  constructor(valor) { this.valor = valor; this.anterior = null; this.siguiente = null; }\n}\n\nconst a = new NodoDoble(\"A\"), b = new NodoDoble(\"B\"), c = new NodoDoble(\"C\");\na.siguiente = b; b.anterior = a;\nb.siguiente = c; c.anterior = b;\n\n// hacia adelante desde a, hacia atrás desde c\nlet ida = [], vuelta = [];\nfor (let n = a; n; n = n.siguiente) ida.push(n.valor);\nfor (let n = c; n; n = n.anterior) vuelta.push(n.valor);\nconsole.log(ida, vuelta);\n\n// sacar b en O(1): sus vecinos se apuntan entre sí\nb.anterior.siguiente = b.siguiente;\nb.siguiente.anterior = b.anterior;\nconsole.log(a.siguiente.valor, c.anterior.valor);",
              en: "class NodoDoble {\n  constructor(valor) { this.valor = valor; this.anterior = null; this.siguiente = null; }\n}\n\nconst a = new NodoDoble(\"A\"), b = new NodoDoble(\"B\"), c = new NodoDoble(\"C\");\na.siguiente = b; b.anterior = a;\nb.siguiente = c; c.anterior = b;\n\n// forward from a, backward from c\nlet ida = [], vuelta = [];\nfor (let n = a; n; n = n.siguiente) ida.push(n.valor);\nfor (let n = c; n; n = n.anterior) vuelta.push(n.valor);\nconsole.log(ida, vuelta);\n\n// remove b in O(1): its neighbors point to each other\nb.anterior.siguiente = b.siguiente;\nb.siguiente.anterior = b.anterior;\nconsole.log(a.siguiente.valor, c.anterior.valor);",
            },
            notas: {
              es: "- De ida A, B, C; de vuelta C, B, A.\n- Para sacar a B no se recorrió nada: dos asignaciones y ahora A y C se apuntan directo.",
              en: "- Forward A, B, C; backward C, B, A.\n- Removing B walked nothing: two assignments and now A and C point straight at each other.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Centinelas en las dos puntas", en: "Sentinels at both ends" },
          texto: {
            es: "En una lista doble, los casos especiales se multiplican: ¿y si es el primero?, ¿el último?, ¿el único? La solución de siempre: dos nodos falsos fijos, uno al **inicio** y otro al **fin**. Los nodos de verdad siempre viven entre los dos, así que **todos** tienen anterior y siguiente, y meter o sacar es el mismo código en cualquier posición.",
            en: "In a doubly linked list, the special cases multiply: what if it's the first? the last? the only one? The usual fix: two fixed fake nodes, one at the **start** and one at the **end**. Real nodes always live between them, so **every** node has a previous and a next, and adding or removing is the same code at any position.",
          },
          programa: {
            codigo: {
              es: "class NodoDoble {\n  constructor(valor) { this.valor = valor; this.anterior = null; this.siguiente = null; }\n}\n\nclass ListaDoble {\n  constructor() {\n    this.inicio = new NodoDoble(null);   // centinelas: nunca se sacan\n    this.fin = new NodoDoble(null);\n    this.inicio.siguiente = this.fin;\n    this.fin.anterior = this.inicio;\n  }\n  meterAntesDe(nodo, valor) {          // el mismo código para cualquier lugar\n    const n = new NodoDoble(valor);\n    n.anterior = nodo.anterior; n.siguiente = nodo;\n    nodo.anterior.siguiente = n; nodo.anterior = n;\n    return n;\n  }\n  alFinal(valor) { return this.meterAntesDe(this.fin, valor); }\n  alPrincipio(valor) { return this.meterAntesDe(this.inicio.siguiente, valor); }\n  sacar(n) { n.anterior.siguiente = n.siguiente; n.siguiente.anterior = n.anterior; }\n  aArreglo() {\n    const r = [];\n    for (let n = this.inicio.siguiente; n !== this.fin; n = n.siguiente) r.push(n.valor);\n    return r;\n  }\n}\n\nconst l = new ListaDoble();\nconst dos = l.alFinal(2);\nl.alFinal(3);\nl.alPrincipio(1);\nconsole.log(l.aArreglo());\nl.sacar(dos);\nconsole.log(l.aArreglo());",
              en: "class NodoDoble {\n  constructor(valor) { this.valor = valor; this.anterior = null; this.siguiente = null; }\n}\n\nclass ListaDoble {\n  constructor() {\n    this.inicio = new NodoDoble(null);   // sentinels: never removed\n    this.fin = new NodoDoble(null);\n    this.inicio.siguiente = this.fin;\n    this.fin.anterior = this.inicio;\n  }\n  meterAntesDe(nodo, valor) {          // the same code for any position\n    const n = new NodoDoble(valor);\n    n.anterior = nodo.anterior; n.siguiente = nodo;\n    nodo.anterior.siguiente = n; nodo.anterior = n;\n    return n;\n  }\n  alFinal(valor) { return this.meterAntesDe(this.fin, valor); }\n  alPrincipio(valor) { return this.meterAntesDe(this.inicio.siguiente, valor); }\n  sacar(n) { n.anterior.siguiente = n.siguiente; n.siguiente.anterior = n.anterior; }\n  aArreglo() {\n    const r = [];\n    for (let n = this.inicio.siguiente; n !== this.fin; n = n.siguiente) r.push(n.valor);\n    return r;\n  }\n}\n\nconst l = new ListaDoble();\nconst dos = l.alFinal(2);\nl.alFinal(3);\nl.alPrincipio(1);\nconsole.log(l.aArreglo());\nl.sacar(dos);\nconsole.log(l.aArreglo());",
            },
            notas: {
              es: "`alFinal` y `alPrincipio` son la misma operación con distinto vecino, y `sacar` no tiene ni un `if`. Los centinelas no salen en `aArreglo` porque el recorrido empieza después de `inicio` y para en `fin`.",
              en: "`alFinal` and `alPrincipio` are the same operation with a different neighbor, and `sacar` doesn't have a single `if`. The sentinels don't show up in `aArreglo` because the walk starts after `inicio` and stops at `fin`.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "La tortuga y la liebre", en: "The tortoise and the hare" },
          texto: {
            es: "¿Y si, por un error, el último nodo apunta a uno de en medio? La lista se vuelve un **ciclo** y cualquier recorrido da vueltas para siempre. ¿Cómo darse cuenta sin guardar todos los nodos vistos?\n\nCon dos punteros a distinta velocidad (el algoritmo de **Floyd**): la **tortuga** avanza un nodo por vuelta y la **liebre**, dos. Si no hay ciclo, la liebre llega a `null`. Si hay ciclo, la liebre entra, da vueltas y tarde o temprano **alcanza a la tortuga por detrás**, como en una pista de atletismo. O(n) y sin memoria extra.",
            en: "What if, by mistake, the last node points to one in the middle? The list becomes a **cycle** and any walk goes around forever. How do you notice without storing every node you've seen?\n\nWith two pointers at different speeds (**Floyd**'s algorithm): the **tortoise** moves one node per turn and the **hare**, two. If there's no cycle, the hare reaches `null`. If there is one, the hare goes in, laps around, and sooner or later **catches the tortoise from behind**, like on a running track. O(n), no extra memory.",
          },
          programa: {
            codigo: {
              es: "class Nodo {\n  constructor(valor, siguiente = null) { this.valor = valor; this.siguiente = siguiente; }\n}\n\nfunction tieneCiclo(cabeza) {\n  let tortuga = cabeza, liebre = cabeza, vueltas = 0;\n  while (liebre !== null && liebre.siguiente !== null) {\n    tortuga = tortuga.siguiente;           // un paso\n    liebre = liebre.siguiente.siguiente;   // dos pasos\n    vueltas++;\n    if (tortuga === liebre) { console.log(\"  se encontraron en\", tortuga.valor, \"tras\", vueltas, \"vueltas\"); return true; }\n  }\n  return false;\n}\n\n// 1 -> 2 -> 3 -> 4 -> 5 -> (de vuelta al 3)\nconst nodos = [1, 2, 3, 4, 5].map(v => new Nodo(v));\nfor (let i = 0; i < 4; i++) nodos[i].siguiente = nodos[i + 1];\nconsole.log(tieneCiclo(nodos[0]));\n\nnodos[4].siguiente = nodos[2];\nconsole.log(tieneCiclo(nodos[0]));",
              en: "class Nodo {\n  constructor(valor, siguiente = null) { this.valor = valor; this.siguiente = siguiente; }\n}\n\nfunction tieneCiclo(cabeza) {\n  let tortuga = cabeza, liebre = cabeza, vueltas = 0;\n  while (liebre !== null && liebre.siguiente !== null) {\n    tortuga = tortuga.siguiente;           // one step\n    liebre = liebre.siguiente.siguiente;   // two steps\n    vueltas++;\n    if (tortuga === liebre) { console.log(\"  they met at\", tortuga.valor, \"after\", vueltas, \"turns\"); return true; }\n  }\n  return false;\n}\n\n// 1 -> 2 -> 3 -> 4 -> 5 -> (back to 3)\nconst nodos = [1, 2, 3, 4, 5].map(v => new Nodo(v));\nfor (let i = 0; i < 4; i++) nodos[i].siguiente = nodos[i + 1];\nconsole.log(tieneCiclo(nodos[0]));\n\nnodos[4].siguiente = nodos[2];\nconsole.log(tieneCiclo(nodos[0]));",
            },
            notas: {
              es: "- Sin ciclo, la liebre llega a `null` y responde `false`.\n- Con el 5 apuntando al 3, se encuentran dentro del ciclo tras unas pocas vueltas: `true`. Se comparan **nodos** con `===`, no valores: dos nodos distintos pueden valer lo mismo.",
              en: "- With no cycle, the hare reaches `null` and answers `false`.\n- With 5 pointing back to 3, they meet inside the cycle after a few turns: `true`. It compares **nodes** with `===`, not values: two different nodes can hold the same value.",
            },
          },
          enlaces: [{ url: "https://es.wikipedia.org/wiki/Algoritmo_de_detecci%C3%B3n_de_ciclos", texto: { es: "Detección de ciclos (Wikipedia)", en: "Cycle detection (Wikipedia, Spanish)" } }],
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué gana una lista doble frente a una sencilla?", en: "What does a doubly linked list gain over a singly linked one?" },
          opciones: [
            { es: "Acceso por índice en O(1)", en: "O(1) access by index" },
            { es: "Sacar un nodo que ya tienes en la mano en O(1)", en: "Removing a node you already hold in O(1)" },
            { es: "Usa menos memoria", en: "It uses less memory" },
            { es: "Se mantiene ordenada sola", en: "It keeps itself sorted" },
          ],
          correcta: 1,
          porque: { es: "Con `anterior` a la mano, no hay que buscar quién apunta al nodo. Sigue sin tener índices, usa **más** memoria y no ordena nada.", en: "With `anterior` at hand, you don't have to search for who points to the node. It still has no indexes, uses **more** memory and sorts nothing." },
        },
        {
          tipo: "elige",
          pregunta: { es: "En el algoritmo de la tortuga y la liebre, ¿cuándo se sabe que **no** hay ciclo?", en: "In the tortoise and hare algorithm, when do you know there is **no** cycle?" },
          opciones: [
            { es: "Cuando la tortuga llega a la cabeza otra vez", en: "When the tortoise gets back to the head" },
            { es: "Cuando la liebre (o su siguiente) llega a null", en: "When the hare (or its next) reaches null" },
            { es: "Cuando dan n vueltas sin encontrarse", en: "When they go n turns without meeting" },
            { es: "Cuando la tortuga y la liebre se encuentran", en: "When the tortoise and the hare meet" },
          ],
          correcta: 1,
          porque: { es: "Una lista sin ciclo se acaba, y la liebre, que va más rápido, es la primera en llegar al final. Si se encuentran, es al revés: **hay** ciclo.", en: "A list without a cycle ends, and the hare, being faster, gets there first. If they meet, it's the opposite: there **is** a cycle." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa los pasos de la tortuga y la liebre.", en: "Fill in the tortoise and hare steps." },
          codigo: "tortuga = tortuga.___;\nliebre = liebre.siguiente.___;\nif (tortuga ___ liebre) return true;",
          huecos: ["siguiente", "siguiente", "==="],
          banco: ["siguiente", "siguiente", "===", "anterior", "!=="],
          porque: { es: "La tortuga da un salto, la liebre dos; si caen en el **mismo nodo** (`===`), hay ciclo.", en: "The tortoise hops once, the hare twice; if they land on the **same node** (`===`), there's a cycle." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `tieneCiclo(cabeza)` con la tortuga y la liebre. Para las pruebas tienes `conCiclo(arreglo, i)`, que arma la lista y hace que el último apunte al nodo de la posición `i` (con `i = -1`, sin ciclo).",
            en: "Write `tieneCiclo(cabeza)` with the tortoise and the hare. For the tests you have `conCiclo(arreglo, i)`, which builds the list and makes the last node point to the node at position `i` (with `i = -1`, no cycle).",
          },
          inicial: {
            es: "class Nodo {\n  constructor(valor, siguiente = null) { this.valor = valor; this.siguiente = siguiente; }\n}\nfunction conCiclo(arr, i) {\n  const ns = arr.map(v => new Nodo(v));\n  ns.forEach((n, k) => { n.siguiente = ns[k + 1] ?? null; });\n  if (i >= 0 && ns.length) ns[ns.length - 1].siguiente = ns[i];\n  return ns[0] ?? null;\n}\n\nfunction tieneCiclo(cabeza) {\n  // ojo: un while que sigue flechas en una lista con ciclo no termina nunca\n  return true;\n}\n\nconsole.log(tieneCiclo(conCiclo([1, 2, 3, 4], 1)));",
            en: "class Nodo {\n  constructor(valor, siguiente = null) { this.valor = valor; this.siguiente = siguiente; }\n}\nfunction conCiclo(arr, i) {\n  const ns = arr.map(v => new Nodo(v));\n  ns.forEach((n, k) => { n.siguiente = ns[k + 1] ?? null; });\n  if (i >= 0 && ns.length) ns[ns.length - 1].siguiente = ns[i];\n  return ns[0] ?? null;\n}\n\nfunction tieneCiclo(cabeza) {\n  // careful: a while that follows arrows in a cyclic list never ends\n  return true;\n}\n\nconsole.log(tieneCiclo(conCiclo([1, 2, 3, 4], 1)));",
          },
          pruebas: [
            { llamada: "tieneCiclo(conCiclo([1, 2, 3, 4], 1))", espera: "true" },
            { llamada: "tieneCiclo(conCiclo([1, 2, 3, 4], -1))", espera: "false" },
            { llamada: "tieneCiclo(conCiclo([1], 0))", espera: "true" },
            { llamada: "tieneCiclo(null)", espera: "false" },
          ],
          solucion: "class Nodo {\n  constructor(valor, siguiente = null) { this.valor = valor; this.siguiente = siguiente; }\n}\nfunction conCiclo(arr, i) {\n  const ns = arr.map(v => new Nodo(v));\n  ns.forEach((n, k) => { n.siguiente = ns[k + 1] ?? null; });\n  if (i >= 0 && ns.length) ns[ns.length - 1].siguiente = ns[i];\n  return ns[0] ?? null;\n}\n\nfunction tieneCiclo(cabeza) {\n  let tortuga = cabeza, liebre = cabeza;\n  while (liebre !== null && liebre.siguiente !== null) {\n    tortuga = tortuga.siguiente;\n    liebre = liebre.siguiente.siguiente;\n    if (tortuga === liebre) return true;\n  }\n  return false;\n}",
          porque: { es: "La condición del while protege los dos saltos de la liebre: si ella o su siguiente son `null`, no hay ciclo. Un solo nodo que se apunta a sí mismo también es un ciclo, y se detecta en la primera vuelta.", en: "The while condition guards the hare's two hops: if it or its next is `null`, there's no cycle. A single node pointing to itself is a cycle too, caught on the first turn." },
        },
      ],
    },
  ],
};
