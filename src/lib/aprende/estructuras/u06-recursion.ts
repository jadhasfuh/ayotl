import type { Unidad } from "../tipos";

export const U06: Unidad = {
  id: "recursion",
  titulo: { es: "Recursión", en: "Recursion" },
  lecciones: [
    {
      id: "recursion",
      titulo: { es: "Una función que se llama a sí misma", en: "A function that calls itself" },
      resumen: {
        es: "Caso base, la pila de llamadas y por qué el Fibonacci ingenuo explota. La herramienta para árboles y grafos.",
        en: "Base case, the call stack and why naive Fibonacci blows up. The tool for trees and graphs.",
      },
      retos: ["climbing-stairs"],
      enlaces: [
        { url: "https://visualgo.net/es/recursion", texto: { es: "VisuAlgo: el árbol de llamadas de una recursión", en: "VisuAlgo: the call tree of a recursion" } },
        { url: "https://es.wikipedia.org/wiki/Recursi%C3%B3n_(ciencias_de_computaci%C3%B3n)", texto: { es: "Recursión (Wikipedia)", en: "Recursion (Wikipedia, Spanish)" } },
      ],
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Resolver un pedazo y delegar el resto", en: "Solve one piece and hand off the rest" },
          texto: {
            es: "Una función **recursiva** se llama a sí misma con un problema más chico. Para que termine necesita dos cosas:\n\n- Un **caso base**: el problema tan chico que se contesta sin llamarse otra vez.\n- Un **paso recursivo** que se acerque al caso base en cada llamada.\n\nLa cuenta regresiva de abajo imprime `n` y le pide a otra copia de sí misma que siga desde `n - 1`. Cuando llega a 0, para.",
            en: "A **recursive** function calls itself with a smaller problem. To finish, it needs two things:\n\n- A **base case**: a problem so small it's answered without calling itself again.\n- A **recursive step** that gets closer to the base case on every call.\n\nThe countdown below prints `n` and asks another copy of itself to continue from `n - 1`. When it reaches 0, it stops.",
          },
          programa: {
            codigo: {
              es: "function cuentaRegresiva(n) {\n  if (n === 0) {              // caso base\n    console.log(\"¡despegue!\");\n    return;\n  }\n  console.log(n);\n  cuentaRegresiva(n - 1);     // un problema más chico\n}\n\ncuentaRegresiva(3);",
              en: "function cuentaRegresiva(n) {\n  if (n === 0) {              // base case\n    console.log(\"liftoff!\");\n    return;\n  }\n  console.log(n);\n  cuentaRegresiva(n - 1);     // a smaller problem\n}\n\ncuentaRegresiva(3);",
            },
            notas: {
              es: "3, 2, 1 y el despegue: cuatro llamadas, y la última es la que ya no se llama a sí misma.",
              en: "3, 2, 1 and liftoff: four calls, and the last one is the one that doesn't call itself again.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "La pila de llamadas", en: "The call stack" },
          texto: {
            es: "Cada llamada que no ha terminado espera en la **pila de llamadas**, una pila de verdad (la de la unidad anterior): la última que entró es la primera que termina. `factorial(3)` no puede contestar hasta que `factorial(2)` conteste, y ésa espera a `factorial(1)`.\n\nCuando la de hasta arriba llega al caso base, las respuestas bajan una por una y cada llamada termina su multiplicación. El programa imprime con sangría al entrar y al salir para que se vea la pila crecer y vaciarse.",
            en: "Every call that hasn't finished waits on the **call stack**, a real stack (like the one from the previous unit): the last one in is the first to finish. `factorial(3)` can't answer until `factorial(2)` answers, and that one waits for `factorial(1)`.\n\nWhen the one on top reaches the base case, the answers come back down one by one and each call finishes its multiplication. The program prints with indentation on the way in and out so you can watch the stack grow and empty.",
          },
          dibujo: { tipo: "pila", valores: ["f(3)", "f(2)", "f(1)"] },
          programa: {
            codigo: {
              es: "function factorial(n, sangria = \"\") {\n  console.log(sangria + \"entra factorial(\" + n + \")\");\n  let r;\n  if (n <= 1) r = 1;                              // caso base\n  else r = n * factorial(n - 1, sangria + \"  \");  // espera la respuesta\n  console.log(sangria + \"sale  factorial(\" + n + \") = \" + r);\n  return r;\n}\n\nfactorial(3);",
              en: "function factorial(n, sangria = \"\") {\n  console.log(sangria + \"in  factorial(\" + n + \")\");\n  let r;\n  if (n <= 1) r = 1;                              // base case\n  else r = n * factorial(n - 1, sangria + \"  \");  // waits for the answer\n  console.log(sangria + \"out factorial(\" + n + \") = \" + r);\n  return r;\n}\n\nfactorial(3);",
            },
            notas: {
              es: "Las tres entran en orden 3, 2, 1 y salen al revés, 1, 2, 3: eso es una pila. `factorial(1)` es la única que contesta sola; las otras multiplican lo que les regresan.",
              en: "The three go in as 3, 2, 1 and come out reversed, 1, 2, 3: that's a stack. `factorial(1)` is the only one that answers on its own; the others multiply what they get back.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Sin caso base, se desborda", en: "No base case, it overflows" },
          texto: {
            es: "Si la función nunca llega a un caso base, la pila crece hasta que el lenguaje dice basta. En JavaScript eso es un `RangeError`: **desbordamiento de pila** (*stack overflow*). Pasa con el caso base olvidado, y también con uno que el paso recursivo nunca alcanza, como bajar de 2 en 2 esperando llegar a 1 desde un número par.\n\nPor lo mismo, aunque esté bien escrita, una recursión de cientos de miles de niveles puede desbordarse: ahí conviene un ciclo.",
            en: "If the function never reaches a base case, the stack grows until the language says enough. In JavaScript that's a `RangeError`: a **stack overflow**. It happens when the base case is forgotten, and also with one the recursive step never reaches, like stepping down by 2 hoping to hit 1 from an even number.\n\nFor the same reason, even when it's well written, a recursion hundreds of thousands of levels deep can overflow: that's when a loop is better.",
          },
          programa: {
            codigo: {
              es: "function sinFin(n) {\n  return sinFin(n + 1);       // nunca para\n}\n\nfunction deDosEnDos(n) {\n  if (n === 1) return \"llegué\";\n  return deDosEnDos(n - 2);   // desde un par, se salta el 1\n}\n\nfor (const prueba of [() => sinFin(0), () => deDosEnDos(7), () => deDosEnDos(8)]) {\n  try {\n    console.log(prueba());\n  } catch (e) {\n    console.log(e.name + \": \" + e.message);\n  }\n}",
              en: "function sinFin(n) {\n  return sinFin(n + 1);       // never stops\n}\n\nfunction deDosEnDos(n) {\n  if (n === 1) return \"made it\";\n  return deDosEnDos(n - 2);   // from an even number, it skips 1\n}\n\nfor (const prueba of [() => sinFin(0), () => deDosEnDos(7), () => deDosEnDos(8)]) {\n  try {\n    console.log(prueba());\n  } catch (e) {\n    console.log(e.name + \": \" + e.message);\n  }\n}",
            },
            notas: {
              es: "La primera y la tercera truenan con `RangeError`. Desde el 7 sí se llega al 1; desde el 8 se pasa de largo (8, 6, 4, 2, 0, −2…) y nunca para.",
              en: "The first and third blow up with `RangeError`. From 7 you do reach 1; from 8 it overshoots (8, 6, 4, 2, 0, −2…) and never stops.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Fibonacci: cuando la recursión repite trabajo", en: "Fibonacci: when recursion repeats work" },
          texto: {
            es: "Cada número de Fibonacci es la suma de los dos anteriores: 1, 1, 2, 3, 5, 8… Escrito tal cual, `fib(n)` llama a `fib(n - 1)` y a `fib(n - 2)`, y cada una vuelve a abrirse en dos. El mismo `fib(3)` se calcula miles de veces y las llamadas crecen como O(2ⁿ).\n\nLa cura es **memorizar**: guardar en un `Map` lo ya calculado y devolverlo en vez de recalcular. Con eso cada `fib(k)` se calcula una sola vez: O(n). Es el mismo problema que «¿de cuántas formas subes una escalera de 1 en 1 o de 2 en 2?», el reto de abajo.",
            en: "Each Fibonacci number is the sum of the two before it: 1, 1, 2, 3, 5, 8… Written as is, `fib(n)` calls `fib(n - 1)` and `fib(n - 2)`, and each of those splits in two again. The same `fib(3)` gets computed thousands of times and the calls grow like O(2ⁿ).\n\nThe cure is **memoizing**: store what's already computed in a `Map` and return it instead of recomputing. Then each `fib(k)` is computed only once: O(n). It's the same problem as \"how many ways can you climb stairs 1 or 2 steps at a time?\", the challenge below.",
          },
          programa: {
            codigo: {
              es: "let llamadas = 0;\nfunction fib(n) {\n  llamadas++;\n  if (n <= 2) return 1;\n  return fib(n - 1) + fib(n - 2);\n}\n\nlet llamadasMemo = 0;\nconst memo = new Map();\nfunction fibMemo(n) {\n  llamadasMemo++;\n  if (n <= 2) return 1;\n  if (memo.has(n)) return memo.get(n);   // ya lo sabía\n  const r = fibMemo(n - 1) + fibMemo(n - 2);\n  memo.set(n, r);\n  return r;\n}\n\nfor (const n of [10, 20, 25]) {\n  llamadas = 0;\n  const r = fib(n);\n  console.log(\"fib(\" + n + \") =\", r, \"con\", llamadas, \"llamadas\");\n}\nconsole.log(\"con memoria, fib(25) =\", fibMemo(25), \"con\", llamadasMemo, \"llamadas\");",
              en: "let llamadas = 0;\nfunction fib(n) {\n  llamadas++;\n  if (n <= 2) return 1;\n  return fib(n - 1) + fib(n - 2);\n}\n\nlet llamadasMemo = 0;\nconst memo = new Map();\nfunction fibMemo(n) {\n  llamadasMemo++;\n  if (n <= 2) return 1;\n  if (memo.has(n)) return memo.get(n);   // already knew it\n  const r = fibMemo(n - 1) + fibMemo(n - 2);\n  memo.set(n, r);\n  return r;\n}\n\nfor (const n of [10, 20, 25]) {\n  llamadas = 0;\n  const r = fib(n);\n  console.log(\"fib(\" + n + \") =\", r, \"with\", llamadas, \"calls\");\n}\nconsole.log(\"memoized, fib(25) =\", fibMemo(25), \"with\", llamadasMemo, \"calls\");",
            },
            notas: {
              es: "De `fib(10)` a `fib(25)` las llamadas pasan de 109 a 150 049. Con memoria, el mismo `fib(25)` sale en 47 llamadas.",
              en: "From `fib(10)` to `fib(25)` the calls go from 109 to 150,049. Memoized, the same `fib(25)` takes 47 calls.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué es el caso base de una recursión?", en: "What is the base case of a recursion?" },
          opciones: [
            { es: "El caso que se contesta sin volver a llamar a la función", en: "The case that's answered without calling the function again" },
            { es: "La primera llamada que se hace", en: "The first call you make" },
            { es: "El caso más grande que puede recibir", en: "The largest case it can receive" },
            { es: "Una llamada a otra función distinta", en: "A call to a different function" },
          ],
          correcta: 0,
          porque: { es: "Es el fondo del pozo: el problema tan chico que tiene respuesta directa. Sin él, la función se llama para siempre.", en: "It's the bottom of the well: a problem so small it has a direct answer. Without it, the function calls itself forever." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué imprime?", en: "What does it print?" },
          codigo: "function sumar(n) {\n  if (n === 0) return 0;\n  return n + sumar(n - 1);\n}\nconsole.log(sumar(4));",
          opciones: ["4", "6", "10", "24"],
          correcta: 2,
          porque: { es: "4 + 3 + 2 + 1 + 0 = 10. (24 sería con multiplicación, como el factorial.)", en: "4 + 3 + 2 + 1 + 0 = 10. (24 would be with multiplication, like factorial.)" },
        },
        {
          tipo: "ordena",
          pregunta: { es: "Ordena los renglones del factorial recursivo.", en: "Put the lines of recursive factorial in order." },
          lineas: [
            "function factorial(n) {",
            "  if (n <= 1) return 1;",
            "  return n * factorial(n - 1);",
            "}",
          ],
          porque: { es: "El caso base va **antes** que la llamada recursiva: si fuera después, la función se llamaría antes de revisar si ya debe parar.", en: "The base case goes **before** the recursive call: if it came after, the function would call itself before checking whether to stop." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa la suma recursiva de un arreglo: el primero más la suma del resto.", en: "Complete the recursive sum of an array: the first plus the sum of the rest." },
          codigo: "function sumarTodo(arr) {\n  if (arr.length === ___) return 0;\n  return arr[0] + sumarTodo(arr.___(1));\n}",
          huecos: ["0", "slice"],
          banco: ["0", "1", "slice", "splice", "pop"],
          porque: { es: "El arreglo vacío suma 0 (caso base). `arr.slice(1)` es una copia sin el primero, un problema un elemento más chico; `splice` cambiaría el original.", en: "The empty array adds up to 0 (base case). `arr.slice(1)` is a copy without the first item, a problem one item smaller; `splice` would change the original." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `potencia(base, exp)` **recursiva**, sin `**` ni `Math.pow`: `base` multiplicada por sí misma `exp` veces. `exp` es un entero de 0 en adelante, y cualquier número a la 0 es 1.",
            en: "Write a **recursive** `potencia(base, exp)`, without `**` or `Math.pow`: `base` multiplied by itself `exp` times. `exp` is an integer from 0 up, and any number to the 0 is 1.",
          },
          inicial: {
            es: "function potencia(base, exp) {\n  // caso base: exp === 0\n  // paso: base * potencia(base, exp - 1)\n}\n\nconsole.log(potencia(2, 10));",
            en: "function potencia(base, exp) {\n  // base case: exp === 0\n  // step: base * potencia(base, exp - 1)\n}\n\nconsole.log(potencia(2, 10));",
          },
          pruebas: [
            { llamada: "potencia(2, 10)", espera: "1024" },
            { llamada: "potencia(3, 3)", espera: "27" },
            { llamada: "potencia(7, 0)", espera: "1" },
            { llamada: "potencia(10, 1)", espera: "10" },
          ],
          solucion: "function potencia(base, exp) {\n  if (exp === 0) return 1;\n  return base * potencia(base, exp - 1);\n}",
          porque: { es: "Caso base `exp === 0` → 1, y cada llamada baja el exponente en uno. Son `exp` llamadas, O(n). Si partes el exponente a la mitad (`potencia(base, exp / 2)` al cuadrado) baja a O(log n): eso es la siguiente lección.", en: "Base case `exp === 0` → 1, and each call lowers the exponent by one. That's `exp` calls, O(n). If you halve the exponent (`potencia(base, exp / 2)` squared) it drops to O(log n): that's the next lesson." },
        },
      ],
    },
    {
      id: "divide-y-venceras",
      titulo: { es: "Divide y vencerás", en: "Divide and conquer" },
      resumen: {
        es: "Partir el problema a la mitad: búsqueda binaria en O(log n) y merge sort en O(n log n).",
        en: "Splitting the problem in half: binary search in O(log n) and merge sort in O(n log n).",
      },
      retos: ["search-in-rotated-sorted-array"],
      enlaces: [
        { url: "https://es.wikipedia.org/wiki/B%C3%BAsqueda_binaria", texto: { es: "Búsqueda binaria (Wikipedia)", en: "Binary search (Wikipedia, Spanish)" } },
        { url: "https://visualgo.net/es/sorting", texto: { es: "VisuAlgo: merge sort y otros ordenamientos, animados", en: "VisuAlgo: merge sort and other sorts, animated" } },
        { url: "https://es.wikipedia.org/wiki/Ordenamiento_por_mezcla", texto: { es: "Ordenamiento por mezcla (Wikipedia)", en: "Merge sort (Wikipedia, Spanish)" } },
      ],
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Búsqueda binaria: adivina el número", en: "Binary search: guess the number" },
          texto: {
            es: "Si alguien piensa un número del 1 al 100 y te dice «más alto» o «más bajo», no preguntas 1, 2, 3…: dices 50, y con una respuesta descartas la mitad. Eso es la **búsqueda binaria**, y sólo funciona si los datos están **ordenados**.\n\nSe guardan dos índices, `izq` y `der`, que marcan dónde todavía puede estar. Se mira el de en medio: si es, listo; si es menor que lo buscado, todo lo de su izquierda sobra; si es mayor, todo lo de su derecha. Cada vuelta parte el pedazo a la mitad: **O(log n)**.",
            en: "If someone thinks of a number from 1 to 100 and tells you \"higher\" or \"lower\", you don't ask 1, 2, 3…: you say 50, and one answer throws away half. That's **binary search**, and it only works if the data is **sorted**.\n\nYou keep two indices, `izq` and `der`, marking where it can still be. You look at the middle one: if it's the one, done; if it's smaller than the target, everything to its left is out; if it's bigger, everything to its right. Each turn cuts the piece in half: **O(log n)**.",
          },
          dibujo: { tipo: "arreglo", valores: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], resalta: [4], punteros: [{ i: 0, texto: "izq" }, { i: 4, texto: "medio" }, { i: 9, texto: "der" }] },
          programa: {
            codigo: {
              es: "function buscar(arr, objetivo) {\n  let izq = 0, der = arr.length - 1;\n  while (izq <= der) {\n    const medio = Math.floor((izq + der) / 2);\n    console.log(\"miro\", izq, \"a\", der, \"-> medio\", medio, \"=\", arr[medio]);\n    if (arr[medio] === objetivo) return medio;\n    if (arr[medio] < objetivo) izq = medio + 1;   // está a la derecha\n    else der = medio - 1;                         // está a la izquierda\n  }\n  return -1;\n}\n\nconst numeros = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];\nconsole.log(\"posición:\", buscar(numeros, 23));\nconsole.log(\"posición:\", buscar(numeros, 6));",
              en: "function buscar(arr, objetivo) {\n  let izq = 0, der = arr.length - 1;\n  while (izq <= der) {\n    const medio = Math.floor((izq + der) / 2);\n    console.log(\"look\", izq, \"to\", der, \"-> middle\", medio, \"=\", arr[medio]);\n    if (arr[medio] === objetivo) return medio;\n    if (arr[medio] < objetivo) izq = medio + 1;   // it's to the right\n    else der = medio - 1;                         // it's to the left\n  }\n  return -1;\n}\n\nconst numeros = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];\nconsole.log(\"position:\", buscar(numeros, 23));\nconsole.log(\"position:\", buscar(numeros, 6));",
            },
            notas: {
              es: "- El 23 aparece a la tercera mirada: el 16 (chico, todo lo de su izquierda sobra), el 56 (grande) y el 23, en la posición 5. Diez números, tres miradas.\n- El 6 no está: mira el 16, el 5 y el 8, y entonces `izq` rebasa a `der` y sale −1.",
              en: "- 23 shows up on the third look: 16 (too small, everything to its left is out), 56 (too big) and 23, at position 5. Ten numbers, three looks.\n- 6 isn't there: it looks at 16, 5 and 8, then `izq` passes `der` and it returns −1.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "La misma idea, recursiva", en: "The same idea, recursive" },
          texto: {
            es: "La búsqueda binaria es el ejemplo más limpio de **divide y vencerás**: el problema «¿está en `arr[izq..der]`?» se convierte en el mismo problema sobre una mitad. Escrita recursiva, el caso base es el pedazo vacío (`izq > der`) y cada llamada recibe una de las dos mitades.\n\nLas dos versiones hacen lo mismo. La del ciclo no gasta pila; la recursiva se parece más a cómo se explica.",
            en: "Binary search is the cleanest example of **divide and conquer**: the problem \"is it in `arr[izq..der]`?\" turns into the same problem on one half. Written recursively, the base case is the empty piece (`izq > der`) and each call gets one of the two halves.\n\nBoth versions do the same thing. The loop doesn't use stack; the recursive one looks more like how it's explained.",
          },
          programa: {
            codigo: {
              es: "function buscarRec(arr, objetivo, izq = 0, der = arr.length - 1) {\n  if (izq > der) return -1;                     // pedazo vacío: no está\n  const medio = Math.floor((izq + der) / 2);\n  if (arr[medio] === objetivo) return medio;\n  if (arr[medio] < objetivo) return buscarRec(arr, objetivo, medio + 1, der);\n  return buscarRec(arr, objetivo, izq, medio - 1);\n}\n\nconst pares = [];\nfor (let i = 0; i < 1000000; i++) pares.push(i * 2);\n\nconsole.log(buscarRec(pares, 1337000));\nconsole.log(buscarRec(pares, 1337001));",
              en: "function buscarRec(arr, objetivo, izq = 0, der = arr.length - 1) {\n  if (izq > der) return -1;                     // empty piece: not there\n  const medio = Math.floor((izq + der) / 2);\n  if (arr[medio] === objetivo) return medio;\n  if (arr[medio] < objetivo) return buscarRec(arr, objetivo, medio + 1, der);\n  return buscarRec(arr, objetivo, izq, medio - 1);\n}\n\nconst pares = [];\nfor (let i = 0; i < 1000000; i++) pares.push(i * 2);\n\nconsole.log(buscarRec(pares, 1337000));\nconsole.log(buscarRec(pares, 1337001));",
            },
            notas: {
              es: "Un millón de números pares, y cada búsqueda baja a lo más unos 20 niveles de recursión. 1 337 000 está en la posición 668 500; el impar no está y sale −1.",
              en: "A million even numbers, and each search goes at most about 20 levels deep. 1,337,000 is at position 668,500; the odd one isn't there and returns −1.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Merge sort: partir, ordenar, mezclar", en: "Merge sort: split, sort, merge" },
          texto: {
            es: "Para **ordenar** también sirve partir: un arreglo de uno ya está ordenado (caso base). Uno más grande se parte en dos mitades, cada mitad se ordena con la misma función, y al final se **mezclan** las dos mitades ordenadas.\n\nMezclar es fácil porque las dos ya vienen en orden: se comparan los primeros de cada una y se toma el más chico, como juntar dos montones de cartas boca arriba.",
            en: "Splitting works for **sorting** too: an array of one is already sorted (base case). A bigger one is split into two halves, each half is sorted by the same function, and at the end the two sorted halves are **merged**.\n\nMerging is easy because both come in order already: compare the first of each and take the smaller one, like combining two face-up piles of cards.",
          },
          programa: {
            codigo: {
              es: "function mezclar(a, b) {\n  const r = [];\n  let i = 0, j = 0;\n  while (i < a.length && j < b.length) {\n    if (a[i] <= b[j]) r.push(a[i++]);\n    else r.push(b[j++]);\n  }\n  return r.concat(a.slice(i), b.slice(j));   // lo que sobre de alguna\n}\n\nfunction ordenar(arr, nivel = 0) {\n  if (arr.length <= 1) return arr;\n  const medio = Math.floor(arr.length / 2);\n  const izq = ordenar(arr.slice(0, medio), nivel + 1);\n  const der = ordenar(arr.slice(medio), nivel + 1);\n  const r = mezclar(izq, der);\n  console.log(\"  \".repeat(nivel) + \"mezclo\", izq, \"+\", der, \"->\", r);\n  return r;\n}\n\nordenar([38, 27, 43, 3, 9, 82, 10]);",
              en: "function mezclar(a, b) {\n  const r = [];\n  let i = 0, j = 0;\n  while (i < a.length && j < b.length) {\n    if (a[i] <= b[j]) r.push(a[i++]);\n    else r.push(b[j++]);\n  }\n  return r.concat(a.slice(i), b.slice(j));   // whatever is left of either\n}\n\nfunction ordenar(arr, nivel = 0) {\n  if (arr.length <= 1) return arr;\n  const medio = Math.floor(arr.length / 2);\n  const izq = ordenar(arr.slice(0, medio), nivel + 1);\n  const der = ordenar(arr.slice(medio), nivel + 1);\n  const r = mezclar(izq, der);\n  console.log(\"  \".repeat(nivel) + \"merge\", izq, \"+\", der, \"->\", r);\n  return r;\n}\n\nordenar([38, 27, 43, 3, 9, 82, 10]);",
            },
            notas: {
              es: "Lee de arriba abajo: primero se mezclan pedacitos de uno y dos elementos (los más sangrados, los más profundos) y al final, sin sangría, la mezcla de las dos mitades grandes da el arreglo entero ordenado.",
              en: "Read top to bottom: first tiny pieces of one and two items are merged (the most indented, the deepest) and finally, with no indentation, merging the two big halves gives the whole array sorted.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Por qué O(n log n)", en: "Why O(n log n)" },
          texto: {
            es: "Cuenta por niveles. Partir a la mitad una y otra vez da unos **log₂ n niveles**. En cada nivel, entre todas las mezclas se toca cada elemento una vez: **n** pasos por nivel. Total: **n × log n**.\n\nUn ordenamiento sencillo que compara cada elemento con los demás es O(n²). Con un millón de datos, la diferencia es entre unos 20 millones de pasos y un billón. Por eso los lenguajes traen ordenamientos de esta familia: `arr.sort()` de JavaScript es O(n log n).",
            en: "Count by levels. Halving over and over gives about **log₂ n levels**. On each level, across all the merges, every item is touched once: **n** steps per level. Total: **n × log n**.\n\nA simple sort that compares every item with the others is O(n²). With a million items, that's the difference between about 20 million steps and a trillion. That's why languages ship sorts from this family: JavaScript's `arr.sort()` is O(n log n).",
          },
          programa: {
            codigo: {
              es: "let pasos = 0;\nfunction mezclar(a, b) {\n  const r = [];\n  let i = 0, j = 0;\n  while (i < a.length && j < b.length) { pasos++; r.push(a[i] <= b[j] ? a[i++] : b[j++]); }\n  pasos += (a.length - i) + (b.length - j);\n  return r.concat(a.slice(i), b.slice(j));\n}\nfunction ordenar(arr) {\n  if (arr.length <= 1) return arr;\n  const m = Math.floor(arr.length / 2);\n  return mezclar(ordenar(arr.slice(0, m)), ordenar(arr.slice(m)));\n}\n\nfor (const n of [8, 1024, 100000]) {\n  const datos = Array.from({ length: n }, (_, i) => (i * 7919) % n);\n  pasos = 0;\n  ordenar(datos);\n  console.log(\"n =\", n, \"| pasos:\", pasos, \"| n·log2(n):\", Math.round(n * Math.log2(n)), \"| n²:\", n * n);\n}",
              en: "let pasos = 0;\nfunction mezclar(a, b) {\n  const r = [];\n  let i = 0, j = 0;\n  while (i < a.length && j < b.length) { pasos++; r.push(a[i] <= b[j] ? a[i++] : b[j++]); }\n  pasos += (a.length - i) + (b.length - j);\n  return r.concat(a.slice(i), b.slice(j));\n}\nfunction ordenar(arr) {\n  if (arr.length <= 1) return arr;\n  const m = Math.floor(arr.length / 2);\n  return mezclar(ordenar(arr.slice(0, m)), ordenar(arr.slice(m)));\n}\n\nfor (const n of [8, 1024, 100000]) {\n  const datos = Array.from({ length: n }, (_, i) => (i * 7919) % n);\n  pasos = 0;\n  ordenar(datos);\n  console.log(\"n =\", n, \"| steps:\", pasos, \"| n·log2(n):\", Math.round(n * Math.log2(n)), \"| n²:\", n * n);\n}",
            },
            notas: {
              es: "Los pasos contados salen pegados a `n·log2(n)` y muy lejos de `n²`: con 100 000 datos, menos de dos millones contra diez mil millones.",
              en: "The counted steps land right next to `n·log2(n)` and far from `n²`: with 100,000 items, under two million versus ten billion.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué necesita un arreglo para poder usar búsqueda binaria?", en: "What does an array need for binary search to work?" },
          opciones: [
            { es: "Estar ordenado", en: "Being sorted" },
            { es: "No tener repetidos", en: "Having no duplicates" },
            { es: "Tener un tamaño que sea potencia de 2", en: "Having a power-of-2 size" },
            { es: "Ser de números", en: "Being made of numbers" },
          ],
          correcta: 0,
          porque: { es: "Descartar una mitad sólo es válido si sabes que todo lo de ese lado es menor (o mayor). Eso lo garantiza el orden; con textos ordenados también funciona.", en: "Throwing away a half is only valid if you know everything on that side is smaller (or bigger). Order guarantees that; it works with sorted strings too." },
        },
        {
          tipo: "elige",
          pregunta: { es: "Más o menos, ¿cuántas miradas necesita la búsqueda binaria para un millón de datos ordenados, en el peor caso?", en: "Roughly how many looks does binary search need for a million sorted items, in the worst case?" },
          opciones: ["20", "1000", "500 000", "1 000 000"],
          correcta: 0,
          porque: { es: "2²⁰ es poco más de un millón: partiendo a la mitad, en unas 20 miradas queda un solo candidato.", en: "2²⁰ is just over a million: halving each time, about 20 looks leave a single candidate." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa el corazón de la búsqueda binaria.", en: "Complete the heart of binary search." },
          codigo: "const medio = Math.___((izq + der) / 2);\nif (arr[medio] === objetivo) return medio;\nif (arr[medio] < objetivo) izq = medio ___ 1;\nelse der = medio - 1;",
          huecos: ["floor", "+"],
          banco: ["floor", "round", "+", "-", "*"],
          porque: { es: "`Math.floor` da un índice entero. Si el de en medio es menor, lo buscado está a la derecha y `izq` salta a `medio + 1`: el `medio` ya se revisó y no hace falta volver a verlo.", en: "`Math.floor` gives an integer index. If the middle one is smaller, the target is to the right and `izq` jumps to `medio + 1`: `medio` was already checked, no need to see it again." },
        },
        {
          tipo: "ordena",
          pregunta: { es: "Ordena la búsqueda binaria con ciclo.", en: "Put the loop version of binary search in order." },
          lineas: [
            "let izq = 0, der = arr.length - 1;",
            "while (izq <= der) {",
            "  const medio = Math.floor((izq + der) / 2);",
            "  if (arr[medio] === objetivo) return medio;",
            "  if (arr[medio] < objetivo) izq = medio + 1;",
            "  else der = medio - 1;",
            "}",
            "return -1;",
          ],
          porque: { es: "Los límites antes del ciclo, el medio al principio de cada vuelta, y `return -1` hasta afuera: sólo se llega ahí cuando el pedazo quedó vacío.", en: "Bounds before the loop, the middle at the start of each turn, and `return -1` all the way outside: you only get there when the piece is empty." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `mezclar(a, b)`: recibe dos arreglos **ya ordenados** y devuelve uno solo ordenado con todos. Hazlo en O(n) con dos índices, sin `sort`.",
            en: "Write `mezclar(a, b)`: it takes two **already sorted** arrays and returns a single sorted one with everything. Do it in O(n) with two indices, without `sort`.",
          },
          inicial: {
            es: "function mezclar(a, b) {\n  const r = [];\n  let i = 0, j = 0;\n  // toma siempre el más chico de a[i] y b[j]\n  return r;\n}\n\nconsole.log(mezclar([1, 4, 9], [2, 3, 10]));",
            en: "function mezclar(a, b) {\n  const r = [];\n  let i = 0, j = 0;\n  // always take the smaller of a[i] and b[j]\n  return r;\n}\n\nconsole.log(mezclar([1, 4, 9], [2, 3, 10]));",
          },
          pruebas: [
            { llamada: "mezclar([1, 4, 9], [2, 3, 10])", espera: "[1,2,3,4,9,10]" },
            { llamada: "mezclar([], [5, 6])", espera: "[5,6]" },
            { llamada: "mezclar([1, 2, 3], [])", espera: "[1,2,3]" },
            { llamada: "mezclar([2, 2], [1, 2])", espera: "[1,2,2,2]" },
          ],
          solucion: "function mezclar(a, b) {\n  const r = [];\n  let i = 0, j = 0;\n  while (i < a.length && j < b.length) {\n    if (a[i] <= b[j]) r.push(a[i++]);\n    else r.push(b[j++]);\n  }\n  while (i < a.length) r.push(a[i++]);\n  while (j < b.length) r.push(b[j++]);\n  return r;\n}",
          porque: { es: "Mientras queden en los dos, toma el menor y avanza ese índice. Cuando uno se acaba, lo que queda del otro ya está en orden y se pega tal cual. Olvidar esa última parte es el error más común.", en: "While both have items left, take the smaller and advance that index. When one runs out, what's left of the other is already in order and gets appended as is. Forgetting that last part is the most common mistake." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `buscarBinaria(arr, objetivo)`: devuelve la posición de `objetivo` en el arreglo ordenado, o `-1` si no está. Con ciclo o recursiva, como prefieras.",
            en: "Write `buscarBinaria(arr, objetivo)`: return the position of `objetivo` in the sorted array, or `-1` if it's not there. Loop or recursion, your choice.",
          },
          inicial: {
            es: "function buscarBinaria(arr, objetivo) {\n  // izq, der, medio...\n  return -1;\n}\n\nconsole.log(buscarBinaria([1, 3, 5, 7, 9, 11], 7));",
            en: "function buscarBinaria(arr, objetivo) {\n  // izq, der, medio...\n  return -1;\n}\n\nconsole.log(buscarBinaria([1, 3, 5, 7, 9, 11], 7));",
          },
          pruebas: [
            { llamada: "buscarBinaria([1, 3, 5, 7, 9, 11], 7)", espera: "3" },
            { llamada: "buscarBinaria([1, 3, 5, 7, 9, 11], 1)", espera: "0" },
            { llamada: "buscarBinaria([1, 3, 5, 7, 9, 11], 11)", espera: "5" },
            { llamada: "buscarBinaria([1, 3, 5], 4)", espera: "-1" },
            { llamada: "buscarBinaria([], 1)", espera: "-1" },
          ],
          solucion: "function buscarBinaria(arr, objetivo) {\n  let izq = 0, der = arr.length - 1;\n  while (izq <= der) {\n    const medio = Math.floor((izq + der) / 2);\n    if (arr[medio] === objetivo) return medio;\n    if (arr[medio] < objetivo) izq = medio + 1;\n    else der = medio - 1;\n  }\n  return -1;\n}",
          porque: { es: "Las pruebas del primero y el último son las que atrapan los errores de «uno de más»: con `izq < der` en vez de `<=`, el último candidato nunca se revisa.", en: "The tests for the first and last items catch the off-by-one bugs: with `izq < der` instead of `<=`, the last candidate is never checked." },
        },
      ],
    },
  ],
};
