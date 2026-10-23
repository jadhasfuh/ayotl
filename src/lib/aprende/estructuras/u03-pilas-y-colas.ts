import type { Unidad } from "../tipos";

export const U03: Unidad = {
  id: "pilas-y-colas",
  titulo: { es: "Pilas y colas", en: "Stacks and queues" },
  lecciones: [
    {
      id: "pilas",
      titulo: { es: "Pilas: el último en entrar sale primero", en: "Stacks: last in, first out" },
      resumen: {
        es: "Una pila de platos en código: push y pop, el botón de deshacer, la pila de llamadas y los paréntesis balanceados.",
        en: "A stack of plates in code: push and pop, the undo button, the call stack and balanced parentheses.",
      },
      retos: ["valid-parentheses"],
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Sólo por arriba", en: "Only from the top" },
          texto: {
            es: "Una **pila** (*stack*) sólo deja hacer tres cosas, y todas por arriba:\n\n- **push**: poner algo encima.\n- **pop**: quitar lo de encima.\n- **peek** (o *top*): mirar lo de encima sin quitarlo.\n\nEl último que entra es el primero que sale: **LIFO** (*last in, first out*). Un arreglo de JavaScript ya es una pila si sólo usas `push` y `pop` por el final, y las dos cuestan O(1).",
            en: "A **stack** only lets you do three things, all from the top:\n\n- **push**: put something on top.\n- **pop**: take the top thing off.\n- **peek** (or *top*): look at the top without removing it.\n\nThe last one in is the first one out: **LIFO**. A JavaScript array is already a stack if you only use `push` and `pop` at the end, and both cost O(1).",
          },
          dibujo: { tipo: "pila", valores: ["plato 1", "plato 2", "plato 3"] },
          programa: {
            codigo: {
              es: "const platos = [];\nplatos.push(\"plato 1\");\nplatos.push(\"plato 2\");\nplatos.push(\"plato 3\");\nconsole.log(platos);\n\nconsole.log(platos[platos.length - 1]); // peek: mirar el de arriba\nconsole.log(platos.pop());              // sale el último que entró\nconsole.log(platos.pop());\nconsole.log(platos);",
              en: "const platos = [];\nplatos.push(\"plato 1\");\nplatos.push(\"plato 2\");\nplatos.push(\"plato 3\");\nconsole.log(platos);\n\nconsole.log(platos[platos.length - 1]); // peek: look at the top\nconsole.log(platos.pop());              // the last one in comes out\nconsole.log(platos.pop());\nconsole.log(platos);",
            },
            notas: {
              es: "Entraron 1, 2, 3 y salieron 3, 2: al revés. Al final sólo queda el «plato 1», el primero que se puso.",
              en: "In went 1, 2, 3 and out came 3, 2: reversed. In the end only \"plato 1\" is left, the first one placed.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Una clase Pila, y el botón de deshacer", en: "A Pila class, and the undo button" },
          texto: {
            es: "Envolver el arreglo en una clase sirve para **prometer** que nadie va a meter la mano por en medio: la pila sólo ofrece lo que una pila ofrece.\n\nEl botón de **deshacer** de cualquier editor es una pila: cada cambio se apila, y deshacer saca el más reciente. Por eso deshaces en el orden contrario al que escribiste.",
            en: "Wrapping the array in a class is a way of **promising** nobody will reach into the middle: the stack only offers what a stack offers.\n\nThe **undo** button in any editor is a stack: each change gets pushed, and undo pops the most recent one. That's why you undo in the opposite order from how you typed.",
          },
          programa: {
            codigo: {
              es: "class Pila {\n  constructor() { this.datos = []; }\n  push(x) { this.datos.push(x); }\n  pop() { return this.datos.pop(); }\n  peek() { return this.datos[this.datos.length - 1]; }\n  get vacia() { return this.datos.length === 0; }\n}\n\nlet texto = \"\";\nconst historial = new Pila();\nfunction escribir(s) { historial.push(texto); texto += s; }\nfunction deshacer() { if (!historial.vacia) texto = historial.pop(); }\n\nescribir(\"Hola\");\nescribir(\", Sahuayo\");\nescribir(\"!!!\");\nconsole.log(texto);\ndeshacer();\nconsole.log(texto);\ndeshacer();\nconsole.log(texto);",
              en: "class Pila {\n  constructor() { this.datos = []; }\n  push(x) { this.datos.push(x); }\n  pop() { return this.datos.pop(); }\n  peek() { return this.datos[this.datos.length - 1]; }\n  get vacia() { return this.datos.length === 0; }\n}\n\nlet texto = \"\";\nconst historial = new Pila();\nfunction escribir(s) { historial.push(texto); texto += s; }\nfunction deshacer() { if (!historial.vacia) texto = historial.pop(); }\n\nescribir(\"Hola\");\nescribir(\", Sahuayo\");\nescribir(\"!!!\");\nconsole.log(texto);\ndeshacer();\nconsole.log(texto);\ndeshacer();\nconsole.log(texto);",
            },
            notas: {
              es: "Antes de cada cambio se apila cómo estaba el texto. Deshacer saca el estado más reciente: primero se van los «!!!» y luego «, Sahuayo».",
              en: "Before each change, the text as it was gets pushed. Undo pops the most recent state: first the \"!!!\" goes, then \", Sahuayo\".",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Paréntesis que cierran bien", en: "Parentheses that close properly" },
          texto: {
            es: "¿Está bien cerrado `([{}])`? ¿Y `([)]`? Una pila lo resuelve de una pasada: cada vez que abre algo, lo apilas; cada vez que cierra, lo de arriba de la pila **tiene que** ser su pareja. Al final, la pila debe quedar vacía.\n\nEs exactamente lo que hace un compilador para avisarte que te faltó una llave. Y la computadora misma usa una pila para recordar qué función llamó a cuál: la **pila de llamadas**, que vas a ver en la unidad de recursión.",
            en: "Is `([{}])` properly closed? What about `([)]`? A stack solves it in one pass: every time something opens, push it; every time something closes, the top of the stack **must** be its partner. At the end, the stack must be empty.\n\nThat's exactly how a compiler tells you a brace is missing. And the computer itself uses a stack to remember which function called which: the **call stack**, which you'll meet in the recursion unit.",
          },
          programa: {
            codigo: {
              es: "function balanceado(s) {\n  const pareja = { \")\": \"(\", \"]\": \"[\", \"}\": \"{\" };\n  const pila = [];\n  for (const c of s) {\n    if (c === \"(\" || c === \"[\" || c === \"{\") pila.push(c);\n    else if (c in pareja) {\n      if (pila.pop() !== pareja[c]) return false;  // no cierra lo último que abrió\n    }\n  }\n  return pila.length === 0;                         // ¿quedó algo abierto?\n}\n\nfor (const s of [\"([{}])\", \"([)]\", \"((\", \"f(a[0]) { }\"]) {\n  console.log(s, \"->\", balanceado(s));\n}",
              en: "function balanceado(s) {\n  const pareja = { \")\": \"(\", \"]\": \"[\", \"}\": \"{\" };\n  const pila = [];\n  for (const c of s) {\n    if (c === \"(\" || c === \"[\" || c === \"{\") pila.push(c);\n    else if (c in pareja) {\n      if (pila.pop() !== pareja[c]) return false;  // doesn't close the last opener\n    }\n  }\n  return pila.length === 0;                         // anything left open?\n}\n\nfor (const s of [\"([{}])\", \"([)]\", \"((\", \"f(a[0]) { }\"]) {\n  console.log(s, \"->\", balanceado(s));\n}",
            },
            notas: {
              es: "- `([)]` falla en el `)`: arriba de la pila hay un `[`.\n- `((` no falla en ningún cierre, pero termina con dos abiertos: `false`.\n- Las letras y los números se ignoran: sólo cuentan los signos.",
              en: "- `([)]` fails at the `)`: the top of the stack is a `[`.\n- `((` never fails on a close, but ends with two still open: `false`.\n- Letters and digits are ignored: only the brackets count.",
            },
          },
          enlaces: [{ url: "https://visualgo.net/es/list", texto: { es: "Pilas y colas animadas en VisuAlgo", en: "Animated stacks and queues on VisuAlgo" } }],
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué imprime?", en: "What does it print?" },
          codigo: "const p = [];\np.push(1);\np.push(2);\np.pop();\np.push(3);\nconsole.log(p.pop());",
          opciones: ["1", "2", "3", "undefined"],
          correcta: 2,
          porque: { es: "Entra 1, entra 2, sale 2, entra 3. Arriba queda el 3, y es lo que sale.", en: "1 in, 2 in, 2 out, 3 in. The 3 is on top, and that's what comes out." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Cuál de estos usos es una pila?", en: "Which of these is a stack?" },
          opciones: [
            { es: "Atender a los clientes de una tortillería en orden de llegada", en: "Serving tortilla shop customers in order of arrival" },
            { es: "El botón «atrás» del navegador", en: "The browser's \"back\" button" },
            { es: "Una impresora que imprime los trabajos en el orden en que llegaron", en: "A printer that prints jobs in the order they arrived" },
            { es: "Buscar una palabra en un diccionario", en: "Looking up a word in a dictionary" },
          ],
          correcta: 1,
          porque: { es: "«Atrás» te regresa a la página más reciente, luego a la anterior: el último que entró sale primero. La tortillería y la impresora son colas.", en: "\"Back\" takes you to the most recent page, then the one before: last in, first out. The tortilla shop and the printer are queues." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa el método `peek` y el que dice si la pila está vacía.", en: "Fill in the `peek` method and the one that says whether the stack is empty." },
          codigo: "class Pila {\n  constructor() { this.datos = []; }\n  peek() { return this.datos[this.datos.___ - 1]; }\n  vacia() { return this.datos.length ___ 0; }\n}",
          huecos: ["length", "==="],
          banco: ["length", "===", "size", "!==", "top"],
          porque: { es: "Lo de arriba está en la última casilla, `length - 1`; y la pila está vacía cuando su largo es exactamente 0.", en: "The top sits in the last slot, `length - 1`; and the stack is empty when its length is exactly 0." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `alReves(texto)` usando una pila: mete cada letra con `push` y luego sácalas con `pop` para armar el texto invertido. (Sin `reverse`.)",
            en: "Write `alReves(texto)` using a stack: push each letter, then pop them to build the reversed text. (No `reverse`.)",
          },
          inicial: {
            es: "function alReves(texto) {\n  const pila = [];\n  let resultado = \"\";\n  // primero apila, luego desapila\n  return resultado;\n}\n\nconsole.log(alReves(\"tortuga\"));",
            en: "function alReves(texto) {\n  const pila = [];\n  let resultado = \"\";\n  // push first, then pop\n  return resultado;\n}\n\nconsole.log(alReves(\"tortuga\"));",
          },
          pruebas: [
            { llamada: "alReves(\"tortuga\")", espera: "\"agutrot\"" },
            { llamada: "alReves(\"ab\")", espera: "\"ba\"" },
            { llamada: "alReves(\"x\")", espera: "\"x\"" },
          ],
          solucion: "function alReves(texto) {\n  const pila = [];\n  for (const c of texto) pila.push(c);\n  let resultado = \"\";\n  while (pila.length > 0) resultado += pila.pop();\n  return resultado;\n}",
          porque: { es: "Lo que entra a una pila sale al revés: es su propiedad más útil. Dos pasadas de `n`, O(n).", en: "Whatever goes into a stack comes out reversed: that's its most useful property. Two passes of `n`, O(n)." },
        },
      ],
    },
    {
      id: "colas",
      titulo: { es: "Colas: el primero en llegar sale primero", en: "Queues: first come, first served" },
      resumen: {
        es: "La fila de la tortillería en código, por qué shift sale caro y cómo hacer una cola O(1) con un índice.",
        en: "The tortilla shop line in code, why shift is expensive and how to make an O(1) queue with an index.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Se entra por atrás, se sale por delante", en: "In at the back, out at the front" },
          texto: {
            es: "Una **cola** (*queue*) es justa: el primero que llega es el primero al que atienden. **FIFO** (*first in, first out*). Sus operaciones:\n\n- **encolar** (*enqueue*): meter al final.\n- **desencolar** (*dequeue*): sacar del frente.\n\nCon un arreglo, lo obvio es `push` para encolar y `shift` para desencolar. Funciona, pero acuérdate de la lección anterior: `shift` recorre a todos los que quedan un lugar. Con una fila de un millón, cada «¡el que sigue!» mueve un millón de casillas.",
            en: "A **queue** is fair: the first to arrive is the first served. **FIFO** (*first in, first out*). Its operations:\n\n- **enqueue**: add at the back.\n- **dequeue**: remove from the front.\n\nWith an array, the obvious way is `push` to enqueue and `shift` to dequeue. It works, but remember the last lesson: `shift` moves everyone left one place. With a line of a million, every \"next, please!\" moves a million slots.",
          },
          dibujo: { tipo: "cola", valores: ["Ana", "Beto", "Caro"] },
          programa: {
            codigo: {
              es: "const fila = [];\nfila.push(\"Ana\");\nfila.push(\"Beto\");\nfila.push(\"Caro\");\n\nconsole.log(\"atiendo a\", fila.shift());\nfila.push(\"Dani\");\nconsole.log(\"atiendo a\", fila.shift());\nconsole.log(\"esperan:\", fila);",
              en: "const fila = [];\nfila.push(\"Ana\");\nfila.push(\"Beto\");\nfila.push(\"Caro\");\n\nconsole.log(\"serving\", fila.shift());\nfila.push(\"Dani\");\nconsole.log(\"serving\", fila.shift());\nconsole.log(\"waiting:\", fila);",
            },
            notas: {
              es: "Salen en el orden en que llegaron: Ana, luego Beto. Dani llegó después y queda atrás de Caro.",
              en: "They leave in the order they arrived: Ana, then Beto. Dani came later and is behind Caro.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Una cola O(1) con un índice", en: "An O(1) queue with an index" },
          texto: {
            es: "El truco es **no mover a nadie**: en vez de sacar el primero del arreglo, se lleva un índice `cabeza` que dice dónde empieza la fila. Desencolar es leer `datos[cabeza]` y sumarle uno a `cabeza`. O(1).\n\nLo que ya salió se queda ocupando casillas al principio. Para no gastar memoria sin fin, cuando la parte vieja es más de la mitad, se recorta de una vez con `slice`. Ese recorte cuesta O(n), pero pasa tan de vez en cuando que, repartido entre todas las operaciones, sigue saliendo O(1) **en promedio** (se dice «amortizado»).",
            en: "The trick is **not moving anyone**: instead of removing the first item from the array, keep an index `cabeza` (head) that says where the line starts. Dequeue reads `datos[cabeza]` and adds one to `cabeza`. O(1).\n\nWhat already left keeps taking up slots at the front. To avoid wasting memory forever, when the old part is more than half, trim it in one go with `slice`. That trim costs O(n), but it happens so rarely that, spread across all operations, it's still O(1) **on average** (called \"amortized\").",
          },
          dibujo: { tipo: "arreglo", valores: ["Ana", "Beto", "Caro", "Dani", "Eva"], resalta: [2], punteros: [{ i: 2, texto: "cabeza" }] },
          programa: {
            codigo: {
              es: "class Cola {\n  constructor() { this.datos = []; this.cabeza = 0; }\n  encolar(x) { this.datos.push(x); }\n  desencolar() {\n    if (this.vacia) return undefined;\n    const x = this.datos[this.cabeza++];\n    // limpieza de vez en cuando: tira lo que ya salió\n    if (this.cabeza * 2 > this.datos.length) {\n      this.datos = this.datos.slice(this.cabeza);\n      this.cabeza = 0;\n    }\n    return x;\n  }\n  get tamano() { return this.datos.length - this.cabeza; }\n  get vacia() { return this.tamano === 0; }\n}\n\nconst c = new Cola();\nconst t0 = Date.now();\nfor (let i = 0; i < 20000; i++) c.encolar(i);\nwhile (!c.vacia) c.desencolar();\nconsole.log(\"Cola:  \", Date.now() - t0, \"ms\");\n\nconst a = [];\nconst t1 = Date.now();\nfor (let i = 0; i < 20000; i++) a.push(i);\nwhile (a.length) a.shift();\nconsole.log(\"shift: \", Date.now() - t1, \"ms\");",
              en: "class Cola {\n  constructor() { this.datos = []; this.cabeza = 0; }\n  encolar(x) { this.datos.push(x); }\n  desencolar() {\n    if (this.vacia) return undefined;\n    const x = this.datos[this.cabeza++];\n    // occasional cleanup: drop what already left\n    if (this.cabeza * 2 > this.datos.length) {\n      this.datos = this.datos.slice(this.cabeza);\n      this.cabeza = 0;\n    }\n    return x;\n  }\n  get tamano() { return this.datos.length - this.cabeza; }\n  get vacia() { return this.tamano === 0; }\n}\n\nconst c = new Cola();\nconst t0 = Date.now();\nfor (let i = 0; i < 20000; i++) c.encolar(i);\nwhile (!c.vacia) c.desencolar();\nconsole.log(\"Cola:  \", Date.now() - t0, \"ms\");\n\nconst a = [];\nconst t1 = Date.now();\nfor (let i = 0; i < 20000; i++) a.push(i);\nwhile (a.length) a.shift();\nconsole.log(\"shift: \", Date.now() - t1, \"ms\");",
            },
            notas: {
              es: "Los dos procesan 20 000 elementos y `shift` tarda muchas veces más: cada salida recorre a todos los que quedan. Con diez veces más elementos, `shift` tardaría unas cien veces más; la `Cola`, unas diez. La `Cola` con índice es O(1) en cualquier navegador y en cualquier lenguaje.",
              en: "Both process 20,000 items and `shift` takes many times longer: every removal shifts everyone left. With ten times more items, `shift` would take about a hundred times longer; the `Cola`, about ten. The indexed `Cola` is O(1) in any browser and any language.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Un adelanto: recorrer por capas", en: "A preview: exploring in layers" },
          texto: {
            es: "La cola es el corazón de la **búsqueda en anchura** (BFS), que vas a ver con los árboles y los grafos. La idea: para explorar un mapa desde un punto, encolas el punto de salida; luego, mientras haya alguien en la cola, lo sacas y encolas a sus vecinos que no hayas visto.\n\nComo la cola atiende en orden de llegada, primero salen todos los que están a 1 paso, luego los de 2, luego los de 3: el mapa se explora **por capas**, como una onda en el agua. Así encuentra Snake si la arena quedó partida en dos.",
            en: "The queue is the heart of **breadth-first search** (BFS), which you'll see with trees and graphs. The idea: to explore a map from a point, enqueue the starting point; then, while someone is in the queue, take them out and enqueue their neighbors you haven't seen.\n\nSince the queue serves in order of arrival, first come everyone 1 step away, then 2, then 3: the map is explored **in layers**, like a ripple on water. That's how Snake checks whether the arena got split in two.",
          },
          programa: {
            codigo: {
              es: "const mapa = [\n  \"S...\",\n  \".xx.\",\n  \"....\",\n];\nconst dist = mapa.map(f => [...f].map(() => \"#\"));\nconst cola = [[0, 0]];\ndist[0][0] = 0;\nlet cabeza = 0;\nwhile (cabeza < cola.length) {\n  const [y, x] = cola[cabeza++];               // desencolar\n  for (const [dy, dx] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {\n    const ny = y + dy, nx = x + dx;\n    if (mapa[ny]?.[nx] === \".\" && dist[ny][nx] === \"#\") {\n      dist[ny][nx] = dist[y][x] + 1;\n      cola.push([ny, nx]);                     // encolar\n    }\n  }\n}\nfor (const fila of dist) console.log(fila.join(\" \"));",
              en: "const mapa = [\n  \"S...\",\n  \".xx.\",\n  \"....\",\n];\nconst dist = mapa.map(f => [...f].map(() => \"#\"));\nconst cola = [[0, 0]];\ndist[0][0] = 0;\nlet cabeza = 0;\nwhile (cabeza < cola.length) {\n  const [y, x] = cola[cabeza++];               // dequeue\n  for (const [dy, dx] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {\n    const ny = y + dy, nx = x + dx;\n    if (mapa[ny]?.[nx] === \".\" && dist[ny][nx] === \"#\") {\n      dist[ny][nx] = dist[y][x] + 1;\n      cola.push([ny, nx]);                     // enqueue\n    }\n  }\n}\nfor (const fila of dist) console.log(fila.join(\" \"));",
            },
            notas: {
              es: "Cada número es a cuántos pasos está esa casilla de la salida. Los `#` son los muros, que nunca se alcanzan. Fíjate en la cola: es un arreglo con un índice `cabeza`, la misma idea de la clase `Cola`.",
              en: "Each number is how many steps that cell is from the start. The `#` are walls, never reached. Look at the queue: an array with a `cabeza` index, the same idea as the `Cola` class.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué imprime?", en: "What does it print?" },
          codigo: "const c = [];\nc.push(\"a\");\nc.push(\"b\");\nc.shift();\nc.push(\"c\");\nconsole.log(c.shift());",
          opciones: ["\"a\"", "\"b\"", "\"c\"", "undefined"],
          correcta: 1,
          porque: { es: "Entran a y b, sale a, entra c. Al frente queda b.", en: "a and b go in, a comes out, c goes in. b is at the front." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Por qué la cola con índice `cabeza` es más rápida que `shift`?", en: "Why is the queue with a `cabeza` index faster than `shift`?" },
          opciones: [
            { es: "Porque desencolar sólo mueve el índice y no recorre a nadie", en: "Because dequeuing only moves the index and shifts nobody" },
            { es: "Porque usa menos memoria", en: "Because it uses less memory" },
            { es: "Porque ordena los elementos", en: "Because it sorts the items" },
            { es: "Porque saca del final", en: "Because it removes from the end" },
          ],
          correcta: 0,
          porque: { es: "`shift` recorre todas las casillas un lugar: O(n). Sumar uno a `cabeza` es O(1). De hecho usa algo **más** de memoria por un rato, hasta la limpieza.", en: "`shift` moves every slot one place: O(n). Adding one to `cabeza` is O(1). It actually uses a bit **more** memory for a while, until the cleanup." },
        },
        {
          tipo: "ordena",
          pregunta: { es: "Ordena el ciclo principal de un BFS con cola.", en: "Put the main loop of a queue-based BFS in order." },
          lineas: [
            "const cola = [inicio];",
            "while (cabeza < cola.length) {",
            "  const actual = cola[cabeza++];",
            "  for (const v of vecinos(actual)) cola.push(v);",
            "}",
          ],
          porque: { es: "Se encola el inicio, y mientras quede alguien se saca del frente y se encolan sus vecinos al final. (En un BFS de verdad también se marcan los ya vistos, para no encolarlos dos veces.)", en: "Enqueue the start, and while anyone remains, take from the front and enqueue their neighbors at the back. (A real BFS also marks the ones already seen, so they're not enqueued twice.)" },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `atender(llegadas, turnos)`: `llegadas` es la fila en orden de llegada; atiende (desencola) a `turnos` personas y devuelve un arreglo con quiénes **siguen esperando**, en orden. Si `turnos` es más grande que la fila, no queda nadie.",
            en: "Write `atender(llegadas, turnos)`: `llegadas` is the line in order of arrival; serve (dequeue) `turnos` people and return an array with who is **still waiting**, in order. If `turnos` is bigger than the line, nobody is left.",
          },
          inicial: {
            es: "function atender(llegadas, turnos) {\n  // pista: con un índice cabeza no hace falta shift\n}\n\nconsole.log(atender([\"Ana\", \"Beto\", \"Caro\"], 1));",
            en: "function atender(llegadas, turnos) {\n  // hint: with a cabeza index you don't need shift\n}\n\nconsole.log(atender([\"Ana\", \"Beto\", \"Caro\"], 1));",
          },
          pruebas: [
            { llamada: "atender([\"Ana\", \"Beto\", \"Caro\"], 1)", espera: "[\"Beto\",\"Caro\"]" },
            { llamada: "atender([\"Ana\", \"Beto\"], 0)", espera: "[\"Ana\",\"Beto\"]" },
            { llamada: "atender([\"Ana\"], 5)", espera: "[]" },
          ],
          solucion: "function atender(llegadas, turnos) {\n  let cabeza = 0;\n  while (cabeza < llegadas.length && turnos > 0) {\n    cabeza++;\n    turnos--;\n  }\n  return llegadas.slice(cabeza);\n}",
          porque: { es: "Atender es avanzar la cabeza; los que siguen esperando son los que están de la cabeza en adelante. También se vale `llegadas.slice(turnos)`, que hace lo mismo de una vez.", en: "Serving means moving the head forward; those still waiting are from the head onward. `llegadas.slice(turnos)` also works and does it in one go." },
        },
      ],
    },
    {
      id: "deque-y-cola-circular",
      titulo: { es: "Cola circular y deque", en: "Circular queue and deque" },
      resumen: {
        es: "Una cola de tamaño fijo que da la vuelta con el módulo, y una cola que deja entrar y salir por las dos puntas.",
        en: "A fixed-size queue that wraps around with modulo, and a queue that lets you in and out at both ends.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Dar la vuelta con el módulo", en: "Wrapping around with modulo" },
          texto: {
            es: "Si sabes cuántos caben como máximo (los últimos 5 mensajes, los últimos 60 cuadros de un juego), puedes usar un arreglo **fijo** y hacer que la cola **dé la vuelta**: cuando el final llega a la última casilla, sigue en la casilla 0.\n\nEl operador **módulo** `%` hace la vuelta solo: `(i + 1) % tamaño` va 0, 1, 2, 3, 4, 0, 1… Nunca se mueve a nadie, nunca se crea memoria nueva y todo es O(1). Se llama **cola circular** o *ring buffer*.",
            en: "If you know the most it will ever hold (the last 5 messages, the last 60 frames of a game), you can use a **fixed** array and let the queue **wrap around**: when the end reaches the last slot, it continues at slot 0.\n\nThe **modulo** operator `%` does the wrapping for you: `(i + 1) % size` goes 0, 1, 2, 3, 4, 0, 1… Nobody ever moves, no new memory is created, and everything is O(1). It's called a **circular queue** or *ring buffer*.",
          },
          programa: {
            codigo: {
              es: "for (let i = 0; i < 12; i++) {\n  console.log(i, \"->\", i % 5);\n}",
              en: "for (let i = 0; i < 12; i++) {\n  console.log(i, \"->\", i % 5);\n}",
            },
            notas: {
              es: "El residuo de dividir entre 5 siempre va de 0 a 4 y vuelve a empezar: justo los índices de un arreglo de 5 casillas.",
              en: "The remainder of dividing by 5 always goes from 0 to 4 and starts over: exactly the indexes of a 5-slot array.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "La cola circular", en: "The circular queue" },
          texto: {
            es: "La cola circular guarda tres números: `cabeza` (dónde está el primero), `tamano` (cuántos hay) y `capacidad` (cuántos caben). El lugar donde entra el siguiente es `(cabeza + tamano) % capacidad`.\n\nEsta versión, cuando se llena, **pisa al más viejo**: es lo que quieres para «los últimos N» (un historial de puntajes, el promedio de los últimos cuadros). Otra opción es negarse a encolar cuando está llena.",
            en: "The circular queue keeps three numbers: `cabeza` (where the first one is), `tamano` (how many there are) and `capacidad` (how many fit). The slot where the next one goes is `(cabeza + tamano) % capacidad`.\n\nThis version **overwrites the oldest** when it's full: that's what you want for \"the last N\" (a score history, the average of the last frames). Another option is to refuse to enqueue when it's full.",
          },
          dibujo: { tipo: "arreglo", valores: [6, 7, 3, 4, 5], resalta: [2], punteros: [{ i: 2, texto: "cabeza" }] },
          programa: {
            codigo: {
              es: "class ColaCircular {\n  constructor(capacidad) {\n    this.datos = new Array(capacidad);\n    this.capacidad = capacidad;\n    this.cabeza = 0;\n    this.tamano = 0;\n  }\n  encolar(x) {\n    const fin = (this.cabeza + this.tamano) % this.capacidad;\n    this.datos[fin] = x;\n    if (this.tamano < this.capacidad) this.tamano++;\n    else this.cabeza = (this.cabeza + 1) % this.capacidad;  // llena: se pierde el más viejo\n  }\n  desencolar() {\n    if (this.tamano === 0) return undefined;\n    const x = this.datos[this.cabeza];\n    this.cabeza = (this.cabeza + 1) % this.capacidad;\n    this.tamano--;\n    return x;\n  }\n  enOrden() {\n    const r = [];\n    for (let k = 0; k < this.tamano; k++) r.push(this.datos[(this.cabeza + k) % this.capacidad]);\n    return r;\n  }\n}\n\nconst ultimos = new ColaCircular(5);\nfor (let i = 1; i <= 7; i++) ultimos.encolar(i);\nconsole.log(\"casillas:\", ultimos.datos);\nconsole.log(\"en orden:\", ultimos.enOrden());\nconsole.log(\"sale:\", ultimos.desencolar());",
              en: "class ColaCircular {\n  constructor(capacidad) {\n    this.datos = new Array(capacidad);\n    this.capacidad = capacidad;\n    this.cabeza = 0;\n    this.tamano = 0;\n  }\n  encolar(x) {\n    const fin = (this.cabeza + this.tamano) % this.capacidad;\n    this.datos[fin] = x;\n    if (this.tamano < this.capacidad) this.tamano++;\n    else this.cabeza = (this.cabeza + 1) % this.capacidad;  // full: the oldest is lost\n  }\n  desencolar() {\n    if (this.tamano === 0) return undefined;\n    const x = this.datos[this.cabeza];\n    this.cabeza = (this.cabeza + 1) % this.capacidad;\n    this.tamano--;\n    return x;\n  }\n  enOrden() {\n    const r = [];\n    for (let k = 0; k < this.tamano; k++) r.push(this.datos[(this.cabeza + k) % this.capacidad]);\n    return r;\n  }\n}\n\nconst ultimos = new ColaCircular(5);\nfor (let i = 1; i <= 7; i++) ultimos.encolar(i);\nconsole.log(\"slots:   \", ultimos.datos);\nconsole.log(\"in order:\", ultimos.enOrden());\nconsole.log(\"out:\", ultimos.desencolar());",
            },
            notas: {
              es: "- Entraron del 1 al 7 en 5 casillas: el 6 y el 7 pisaron al 1 y al 2. Por eso las casillas dicen `[ 6, 7, 3, 4, 5 ]`.\n- En orden, empezando por la cabeza: `[ 3, 4, 5, 6, 7 ]`, los últimos cinco.\n- El primero en salir es el 3, el más viejo que sobrevive.",
              en: "- 1 through 7 went into 5 slots: 6 and 7 overwrote 1 and 2. That's why the slots read `[ 6, 7, 3, 4, 5 ]`.\n- In order, starting from the head: `[ 3, 4, 5, 6, 7 ]`, the last five.\n- The first one out is 3, the oldest survivor.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Deque: entrar y salir por las dos puntas", en: "Deque: in and out at both ends" },
          texto: {
            es: "Una **deque** (*double-ended queue*, se pronuncia «dek») junta la pila y la cola: deja meter y sacar por delante y por detrás, todo en O(1). Se hace con la misma idea circular: para meter por delante, la cabeza **retrocede** una casilla, `(cabeza - 1 + capacidad) % capacidad` (se suma la capacidad para no caer en negativos).\n\nUn uso clásico: el **máximo de cada ventana** de tamaño k en una pasada. La deque guarda índices de candidatos de mayor a menor; los que ya no pueden ganar se sacan por detrás y los que salieron de la ventana, por delante.",
            en: "A **deque** (*double-ended queue*, pronounced \"deck\") combines stack and queue: you can add and remove at the front and at the back, all in O(1). It's built with the same circular idea: to add at the front, the head **steps back** one slot, `(cabeza - 1 + capacidad) % capacidad` (adding the capacity avoids going negative).\n\nA classic use: the **maximum of every window** of size k in one pass. The deque keeps indexes of candidates from largest to smallest; those that can no longer win are popped from the back, and those that left the window, from the front.",
          },
          programa: {
            codigo: {
              es: "// Máximo de cada ventana de 3. Para que se lea, la deque es un arreglo;\n// en serio iría circular para que shift sea O(1).\nfunction maximos(nums, k) {\n  const dq = [];   // índices; sus valores van de mayor a menor\n  const r = [];\n  for (let i = 0; i < nums.length; i++) {\n    while (dq.length && nums[dq[dq.length - 1]] <= nums[i]) dq.pop(); // ya no pueden ganar\n    dq.push(i);\n    if (dq[0] <= i - k) dq.shift();                                  // salió de la ventana\n    if (i >= k - 1) r.push(nums[dq[0]]);\n  }\n  return r;\n}\n\nconsole.log(maximos([1, 3, -1, -3, 5, 3, 6, 7], 3));",
              en: "// Maximum of each window of 3. For readability the deque is a plain array;\n// for real it would be circular so shift is O(1).\nfunction maximos(nums, k) {\n  const dq = [];   // indexes; their values go largest to smallest\n  const r = [];\n  for (let i = 0; i < nums.length; i++) {\n    while (dq.length && nums[dq[dq.length - 1]] <= nums[i]) dq.pop(); // can't win anymore\n    dq.push(i);\n    if (dq[0] <= i - k) dq.shift();                                  // left the window\n    if (i >= k - 1) r.push(nums[dq[0]]);\n  }\n  return r;\n}\n\nconsole.log(maximos([1, 3, -1, -3, 5, 3, 6, 7], 3));",
            },
            notas: {
              es: "Seis ventanas de 3, seis máximos: `[ 3, 3, 5, 5, 6, 7 ]`. El frente de la deque siempre es el máximo de la ventana actual, y cada índice entra y sale una sola vez: O(n).",
              en: "Six windows of 3, six maximums: `[ 3, 3, 5, 5, 6, 7 ]`. The front of the deque is always the current window's maximum, and each index goes in and out once: O(n).",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "En una cola circular de capacidad 4, la cabeza está en 3 y hay 2 elementos. ¿En qué casilla entra el siguiente?", en: "In a circular queue of capacity 4, the head is at 3 and there are 2 items. Which slot does the next one go into?" },
          opciones: ["5", "1", "0", "3"],
          correcta: 1,
          porque: { es: "`(cabeza + tamano) % capacidad = (3 + 2) % 4 = 1`. Los dos que hay están en las casillas 3 y 0; el siguiente va en la 1.", en: "`(cabeza + tamano) % capacidad = (3 + 2) % 4 = 1`. The two items are in slots 3 and 0; the next goes in slot 1." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué imprime `(0 - 1 + 5) % 5`?", en: "What does `(0 - 1 + 5) % 5` print?" },
          opciones: ["-1", "0", "4", "5"],
          correcta: 2,
          porque: { es: "Es retroceder una casilla desde la 0 en un arreglo de 5: da la vuelta a la última, la 4. Sin el `+ 5`, JavaScript daría `-1`, que no es una casilla.", en: "It's stepping back one slot from 0 in a 5-slot array: it wraps around to the last, 4. Without the `+ 5`, JavaScript would give `-1`, which isn't a slot." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa `desencolar` de la cola circular.", en: "Fill in the circular queue's `desencolar`." },
          codigo: "desencolar() {\n  const x = this.datos[this.cabeza];\n  this.cabeza = (this.cabeza + 1) ___ this.capacidad;\n  this.tamano___;\n  return x;\n}",
          huecos: ["%", "--"],
          banco: ["%", "--", "++", "/", "*"],
          porque: { es: "La cabeza avanza una casilla y da la vuelta con `%`; hay un elemento menos, así que el tamaño baja.", en: "The head moves one slot and wraps with `%`; there's one item fewer, so the size goes down." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `rotar(arr, k)`: devuelve un arreglo **nuevo** donde cada elemento se movió `k` lugares a la derecha, y los que se salen por la derecha entran por la izquierda.\n\nPista: el elemento de la casilla `i` termina en `(i + k) % n`.",
            en: "Write `rotar(arr, k)`: return a **new** array where every item moved `k` places to the right, and those that fall off the right come back in on the left.\n\nHint: the item at slot `i` ends up at `(i + k) % n`.",
          },
          inicial: {
            es: "function rotar(arr, k) {\n  const n = arr.length;\n  const r = new Array(n);\n  // coloca cada arr[i] en su nueva casilla\n  return r;\n}\n\nconsole.log(rotar([1, 2, 3, 4, 5], 2));",
            en: "function rotar(arr, k) {\n  const n = arr.length;\n  const r = new Array(n);\n  // put each arr[i] in its new slot\n  return r;\n}\n\nconsole.log(rotar([1, 2, 3, 4, 5], 2));",
          },
          pruebas: [
            { llamada: "rotar([1, 2, 3, 4, 5], 2)", espera: "[4,5,1,2,3]" },
            { llamada: "rotar([1, 2, 3], 3)", espera: "[1,2,3]" },
            { llamada: "rotar([1, 2, 3], 4)", espera: "[3,1,2]" },
            { llamada: "rotar([\"a\", \"b\"], 0)", espera: "[\"a\",\"b\"]" },
          ],
          solucion: "function rotar(arr, k) {\n  const n = arr.length;\n  const r = new Array(n);\n  for (let i = 0; i < n; i++) {\n    r[(i + k) % n] = arr[i];\n  }\n  return r;\n}",
          porque: { es: "El módulo hace la vuelta: lo que pasaría de la última casilla cae al principio. Rotar `n` veces deja todo igual, y rotar `n + 1` es lo mismo que rotar 1.", en: "Modulo does the wrapping: whatever would go past the last slot lands at the start. Rotating `n` times leaves everything the same, and rotating `n + 1` equals rotating 1." },
        },
      ],
    },
  ],
};
