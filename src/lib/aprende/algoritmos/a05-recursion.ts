import type { Unidad } from "../tipos";

/**
 * Unidad 5: recursión. Las Torres de Hanói (2-dic-2026), con el mismo `hanoi` del Short de «Algoritmos en pixel»
 * (tools/comerciales/algoritmos/hanoi.py): si cambia uno, cambia el otro (revisar-codigo.py lo comprueba).
 *
 * Los hechos, de Wikipedia («Tower of Hanoi» y «Torres de Hanói», 27-nov-2026): Édouard Lucas, 1883, «N. Claus (de Siam)»,
 * la leyenda de los 64 discos de oro (la española cuenta otra versión, con 100), 2⁶⁴ − 1 segundos ≈ 585 mil millones de
 * años, unas 42 veces la edad del universo.
 */
const HANOI = `function hanoi(n, desde, hasta, aux) {
  if (n === 0) return;
  hanoi(n - 1, desde, aux, hasta);
  mover(n, desde, hasta);
  hanoi(n - 1, aux, hasta, desde);
}`;

// mover() imprime el movimiento; en el vídeo no sale, porque no cabe
const MOVER = {
  es: `// imprime un movimiento
const mover = (n, desde, hasta) => console.log("disco " + n + ": " + desde + " → " + hasta);`,
  en: `// prints one move
const mover = (n, desde, hasta) => console.log("disk " + n + ": " + desde + " → " + hasta);`,
};

export const A05: Unidad = {
  id: "recursion",
  titulo: { es: "Recursión", en: "Recursion" },
  lecciones: [
    {
      id: "torres-de-hanoi",
      titulo: { es: "Las Torres de Hanói", en: "The Tower of Hanoi" },
      resumen: {
        es: "Pasar una torre de discos de un poste a otro con una función que se llama a sí misma: el caso base, la pila de llamadas y por qué son 2ⁿ − 1 movimientos.",
        en: "Moving a tower of disks from one peg to another with a function that calls itself: the base case, the call stack and why it takes 2ⁿ − 1 moves.",
      },
      retos: ["subsets-permutations", "fibonacci-series"],
      enlaces: [
        { url: "/aprende/estructuras-de-datos/recursion", texto: { es: "Recursión y la pila de llamadas, en «Estructuras de datos»", en: "Recursion and the call stack, in \"Data structures\"" } },
        { url: "https://es.wikipedia.org/wiki/Torres_de_Han%C3%B3i", texto: { es: "Torres de Hanói (Wikipedia)", en: "Tower of Hanoi (Wikipedia, Spanish)" } },
        { url: "https://en.wikipedia.org/wiki/Tower_of_Hanoi", texto: { es: "Tower of Hanoi (Wikipedia en inglés, con la leyenda de los 64 discos)", en: "Tower of Hanoi (Wikipedia)" } },
      ],
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "El juego y sus dos reglas", en: "The puzzle and its two rules" },
          texto: {
            es: "Tres postes y una torre de discos, del más grande abajo al más chico arriba. Hay que pasar la torre entera a otro poste con dos reglas:\n\n- Se mueve **un disco a la vez**: el de arriba de algún poste.\n- **Nunca** va un disco **grande sobre uno chico**.\n\nLo inventó el matemático francés Édouard Lucas en 1883, y lo presentó como el hallazgo de un tal «N. Claus de Siam», que es un anagrama de «Lucas d'Amiens».\n\nCada poste es una **pila**: sólo se toca el disco de arriba. En JavaScript, un arreglo con `push` y `pop`.",
            en: "Three pegs and a tower of disks, from the biggest at the bottom to the smallest on top. You have to move the whole tower to another peg with two rules:\n\n- You move **one disk at a time**: the top one of some peg.\n- A **big** disk **never** goes **on a small one**.\n\nThe French mathematician Édouard Lucas invented it in 1883, and presented it as the discovery of one \"N. Claus de Siam\", an anagram of \"Lucas d'Amiens\".\n\nEach peg is a **stack**: you only touch the top disk. In JavaScript, an array with `push` and `pop`.",
          },
          dibujo: {
            tipo: "rejilla",
            filas: ["..1..............", ".222.............", "33333............", "xxxxx.xxxxx.xxxxx"],
            leyenda: { "1": { es: "los discos, del 1 (el chico) al 3", en: "the disks, from 1 (the small one) to 3" }, x: { es: "los postes A, B y C", en: "pegs A, B and C" } },
          },
          programa: {
            codigo: {
              es: `// los tres postes; el último de cada arreglo es el disco de arriba\nconst postes = { A: [3, 2, 1], B: [], C: [] };\n\nfunction mover(desde, hasta) {\n  const disco = postes[desde].at(-1);\n  const debajo = postes[hasta].at(-1);\n  if (debajo !== undefined && debajo < disco) {\n    console.log("no se vale: el " + disco + " sobre el " + debajo);\n    return;\n  }\n  postes[hasta].push(postes[desde].pop());\n  console.log(disco + ": " + desde + " → " + hasta, JSON.stringify(postes));\n}\n\nmover("A", "C");\nmover("A", "C");   // el 2 sobre el 1\nmover("A", "B");\nmover("C", "B");`,
              en: `// the three pegs; the last item of each array is the top disk\nconst postes = { A: [3, 2, 1], B: [], C: [] };\n\nfunction mover(desde, hasta) {\n  const disco = postes[desde].at(-1);\n  const debajo = postes[hasta].at(-1);\n  if (debajo !== undefined && debajo < disco) {\n    console.log("not allowed: " + disco + " on top of " + debajo);\n    return;\n  }\n  postes[hasta].push(postes[desde].pop());\n  console.log(disco + ": " + desde + " → " + hasta, JSON.stringify(postes));\n}\n\nmover("A", "C");\nmover("A", "C");   // 2 on top of 1\nmover("A", "B");\nmover("C", "B");`,
            },
            notas: {
              es: "- El segundo movimiento no se vale: arriba de C ya está el 1.\n- Con tres movimientos buenos, los dos chicos quedaron en B y el 3 está libre en A. Eso es justo la mitad del truco.",
              en: "- The second move isn't allowed: 1 is already on top of C.\n- After three good moves, the two small ones are on B and 3 is free on A. That's exactly half of the trick.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "El truco: mover n − 1, el grande y n − 1 otra vez", en: "The trick: move n − 1, the big one, and n − 1 again" },
          texto: {
            es: "Para pasar **n** discos de `desde` a `hasta`, el grande de abajo tiene que llegar primero a `hasta`, y para eso los n − 1 de encima tienen que estar en el tercer poste, `aux`. Así que:\n\n1. Mueve los **n − 1** de arriba de `desde` a `aux`.\n2. Mueve el **grande** a `hasta`.\n3. Mueve los **n − 1** de `aux` a `hasta`, encima del grande.\n\nLos pasos 1 y 3 son el mismo problema con un disco menos: la función se llama a sí misma. Y con **cero discos** no hay nada que mover: es el **caso base**, que detiene la recursión.\n\nÉste es el código del vídeo; `mover` sólo imprime.",
            en: "To move **n** disks from `desde` (from) to `hasta` (to), the big one at the bottom has to reach `hasta` first, and for that the n − 1 above it have to be on the third peg, `aux` (spare). So:\n\n1. Move the top **n − 1** from `desde` to `aux`.\n2. Move the **big one** to `hasta`.\n3. Move the **n − 1** from `aux` to `hasta`, on top of the big one.\n\nSteps 1 and 3 are the same problem with one disk fewer: the function calls itself. And with **zero disks** there's nothing to move: that's the **base case**, which stops the recursion.\n\nThis is the code from the video; `mover` (move) only prints.",
          },
          programa: {
            codigo: {
              es: `${MOVER.es}\n\n${HANOI}\n\nhanoi(3, "A", "C", "B");`,
              en: `${MOVER.en}\n\n${HANOI}\n\nhanoi(3, "A", "C", "B");`,
            },
            notas: {
              es: "- Siete movimientos. El 3 se mueve una sola vez, justo a la mitad: antes, los dos de arriba se fueron a B (los tres primeros); después, regresan encima (los tres últimos).\n- Cambia el 3 por 4: salen 15.",
              en: "- Seven moves. Disk 3 moves only once, right in the middle: before it, the two on top went to B (the first three); after it, they come back on top (the last three).\n- Change the 3 to 4: you get 15.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "La pila de llamadas", en: "The call stack" },
          texto: {
            es: "Cuando `hanoi(3, …)` llama a `hanoi(2, …)`, la de 3 no termina: se queda **esperando** en la **pila de llamadas**, con todo y el renglón donde iba, hasta que la de 2 acabe. La de 2 espera a la de 1, y la de 1 a la de 0, que regresa de inmediato. La última que entró es la primera que sale.\n\nEl programa hace esa pila a mano, con un arreglo, para verla: cada renglón es la pila en el momento en que entra una llamada. Es la misma función con el caso base escrito al revés (`if (n > 0)`), para que `pila.pop()` corra en las dos.",
            en: "When `hanoi(3, …)` calls `hanoi(2, …)`, the 3-call doesn't finish: it **waits** on the **call stack**, along with the line it was on, until the 2-call is done. The 2-call waits for the 1-call, and the 1-call for the 0-call, which returns right away. The last one in is the first one out.\n\nThe program builds that stack by hand, with an array, so you can see it: each line is the stack at the moment a call comes in. It's the same function with the base case written the other way around (`if (n > 0)`), so `pila.pop()` runs in both cases.",
          },
          dibujo: { tipo: "pila", valores: ["hanoi(3,A,C,B)", "hanoi(2,A,B,C)", "hanoi(1,A,C,B)", "hanoi(0,A,B,C)"] },
          programa: {
            codigo: {
              es: `const pila = [];   // la pila de llamadas, hecha a mano para verla\n\nfunction hanoi(n, desde, hasta, aux) {\n  pila.push("hanoi(" + n + "," + desde + "," + hasta + "," + aux + ")");\n  console.log(pila.join(" "));\n  if (n > 0) {\n    hanoi(n - 1, desde, aux, hasta);\n    console.log("   mueve el disco " + n + ": " + desde + " → " + hasta);\n    hanoi(n - 1, aux, hasta, desde);\n  }\n  pila.pop();\n}\n\nhanoi(2, "A", "C", "B");`,
              en: `const pila = [];   // the call stack, built by hand so you can see it\n\nfunction hanoi(n, desde, hasta, aux) {\n  pila.push("hanoi(" + n + "," + desde + "," + hasta + "," + aux + ")");\n  console.log(pila.join(" "));\n  if (n > 0) {\n    hanoi(n - 1, desde, aux, hasta);\n    console.log("   move disk " + n + ": " + desde + " → " + hasta);\n    hanoi(n - 1, aux, hasta, desde);\n  }\n  pila.pop();\n}\n\nhanoi(2, "A", "C", "B");`,
            },
            notas: {
              es: "- La pila crece hasta tres llamadas (2, 1 y 0) y se encoge cada vez que una termina. `hanoi(2, …)` encabeza todos los renglones de la pila: espera de principio a fin.\n- Con dos discos hay 7 llamadas en total, pero nunca más de **3 a la vez**. Con n discos, nunca más de n + 1: la pila ocupa O(n) aunque el trabajo sea mucho más.",
              en: "- The stack grows to three calls (2, 1 and 0) and shrinks every time one finishes. `hanoi(2, …)` heads every stack line: it waits from start to finish.\n- With two disks there are 7 calls in all, but never more than **3 at once**. With n disks, never more than n + 1: the stack takes O(n) even though the work is much more.",
            },
          },
          enlaces: [{ url: "/aprende/estructuras-de-datos/recursion", texto: { es: "La pila de llamadas con el factorial, en «Estructuras de datos»", en: "The call stack with factorial, in \"Data structures\"" } }],
        },
        {
          tipo: "explica",
          titulo: { es: "¿Cuántos movimientos? 2ⁿ − 1", en: "How many moves? 2ⁿ − 1" },
          texto: {
            es: "Mover n discos es mover n − 1, uno más, y otra vez n − 1: **el doble de lo de n − 1, y uno**. Con 1 disco es 1 movimiento; con 2, 3; con 3, 7; con 4, 15… Siempre uno menos que una potencia de 2: **2ⁿ − 1**. Y no se puede con menos: el disco grande no se mueve hasta que los demás están juntos en el otro poste, así que cualquier solución pasa dos veces por una torre de n − 1.\n\nEs **O(2ⁿ)**: cada disco de más duplica el trabajo. La recursión no lo hace lento; el problema es así de grande.",
            en: "Moving n disks is moving n − 1, one more, and n − 1 again: **double what n − 1 takes, plus one**. With 1 disk it's 1 move; with 2, 3; with 3, 7; with 4, 15… Always one less than a power of 2: **2ⁿ − 1**. And you can't do it in fewer: the big disk can't move until all the others are together on another peg, so any solution goes through a tower of n − 1 twice.\n\nIt's **O(2ⁿ)**: each extra disk doubles the work. Recursion doesn't make it slow; the problem really is that big.",
          },
          programa: {
            codigo: {
              es: `let movimientos = 0, llamadas = 0, alto = 0, altoMax = 0;\nconst mover = () => movimientos++;\n\nfunction hanoi(n, desde, hasta, aux) {\n  llamadas++; alto++; altoMax = Math.max(altoMax, alto);\n  if (n > 0) {\n    hanoi(n - 1, desde, aux, hasta);\n    mover(n, desde, hasta);\n    hanoi(n - 1, aux, hasta, desde);\n  }\n  alto--;\n}\n\nfor (const n of [1, 2, 3, 4, 10, 20]) {\n  movimientos = llamadas = altoMax = 0;\n  hanoi(n, "A", "C", "B");\n  console.log("n =", n, "| movimientos:", movimientos, "| 2^n - 1:", 2 ** n - 1, "| llamadas:", llamadas, "| pila:", altoMax);\n}`,
              en: `let movimientos = 0, llamadas = 0, alto = 0, altoMax = 0;\nconst mover = () => movimientos++;\n\nfunction hanoi(n, desde, hasta, aux) {\n  llamadas++; alto++; altoMax = Math.max(altoMax, alto);\n  if (n > 0) {\n    hanoi(n - 1, desde, aux, hasta);\n    mover(n, desde, hasta);\n    hanoi(n - 1, aux, hasta, desde);\n  }\n  alto--;\n}\n\nfor (const n of [1, 2, 3, 4, 10, 20]) {\n  movimientos = llamadas = altoMax = 0;\n  hanoi(n, "A", "C", "B");\n  console.log("n =", n, "| moves:", movimientos, "| 2^n - 1:", 2 ** n - 1, "| calls:", llamadas, "| stack:", altoMax);\n}`,
            },
            notas: {
              es: "- Los movimientos cuentan igual que `2 ** n - 1`: con 20 discos, más de un millón.\n- Las llamadas son 2ⁿ⁺¹ − 1 (cada una que mueve hace dos más), pero la pila nunca pasa de n + 1.",
              en: "- The moves count exactly like `2 ** n - 1`: with 20 disks, over a million.\n- The calls are 2ⁿ⁺¹ − 1 (each one that moves makes two more), but the stack never goes past n + 1.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "La leyenda de los 64 discos", en: "The legend of the 64 disks" },
          texto: {
            es: "El juego venía con una leyenda: en un templo, unos sacerdotes mueven una torre de **64 discos de oro** con estas mismas reglas, y cuando acaben se acabará el mundo. (Hay versiones con otro lugar y otro número de discos.)\n\nNo hay prisa. Son 2⁶⁴ − 1 movimientos: a uno por segundo, unos **585 mil millones de años**, unas 42 veces la edad del universo. Ni una computadora que hiciera mil millones por segundo acabaría en menos de 500 años.\n\nUn detalle de JavaScript: 2⁶⁴ − 1 ya no cabe exacto en un `Number`, que guarda unas 16 cifras. Para contarlo sin perder ninguna está `BigInt`, los números con `n` al final.",
            en: "The puzzle came with a legend: in a temple, priests move a tower of **64 golden disks** following these same rules, and when they finish, the world will end. (There are versions with another place and another number of disks.)\n\nNo need to rush. It takes 2⁶⁴ − 1 moves: at one per second, about **585 billion years**, some 42 times the age of the universe. Not even a computer making a billion moves per second would finish in under 500 years.\n\nA JavaScript detail: 2⁶⁴ − 1 no longer fits exactly in a `Number`, which keeps about 16 digits. To count it without losing any there's `BigInt`, the numbers with an `n` at the end.",
          },
          programa: {
            codigo: {
              es: `const movimientos = 2n ** 64n - 1n;   // BigInt: exacto\nconsole.log("movimientos:", movimientos.toString());\nconsole.log("con Number:  ", 2 ** 64 - 1);   // se redondea\n\nconst anio = 365.25 * 24 * 60 * 60;          // segundos en un año\nconst segundos = Number(movimientos);\nconsole.log("años a uno por segundo:", Math.round(segundos / anio));\nconsole.log("años a mil millones por segundo:", Math.round(segundos / 1e9 / anio));`,
              en: `const movimientos = 2n ** 64n - 1n;   // BigInt: exact\nconsole.log("moves:", movimientos.toString());\nconsole.log("as a Number:", 2 ** 64 - 1);   // gets rounded\n\nconst anio = 365.25 * 24 * 60 * 60;          // seconds in a year\nconst segundos = Number(movimientos);\nconsole.log("years at one per second:", Math.round(segundos / anio));\nconsole.log("years at a billion per second:", Math.round(segundos / 1e9 / anio));`,
            },
            notas: {
              es: "- 18 446 744 073 709 551 615 movimientos; el `Number` termina en …552000: perdió las últimas cifras.\n- 584 542 046 091 años, que redondeados son los 585 mil millones. Con mil millones por segundo, 585 años.",
              en: "- 18,446,744,073,709,551,615 moves; the `Number` ends in …552000: it lost the last digits.\n- 584,542,046,091 years, which round to 585 billion. At a billion per second, 585 years.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Cuántos movimientos hacen falta, como mínimo, para una torre de 5 discos?", en: "What's the minimum number of moves for a tower of 5 disks?" },
          opciones: ["31", "32", "25", "15"],
          correcta: 0,
          porque: {
            es: "2⁵ − 1 = 31. O contando: 1, 3, 7, 15 y 31, cada uno el doble del anterior más uno. 15 es con 4 discos.",
            en: "2⁵ − 1 = 31. Or counting: 1, 3, 7, 15 and 31, each one double the one before plus one. 15 is with 4 disks.",
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "En `hanoi(3, \"A\", \"C\", \"B\")`, ¿a qué poste van primero los dos discos de arriba?", en: "In `hanoi(3, \"A\", \"C\", \"B\")`, which peg do the top two disks go to first?" },
          opciones: [
            { es: "Al poste B, el auxiliar", en: "To B, the spare" },
            { es: "Al poste C, el destino", en: "To C, the target" },
            { es: "Se quedan en A", en: "They stay on A" },
            { es: "Uno a B y otro a C", en: "One to B and one to C" },
          ],
          correcta: 0,
          porque: {
            es: "`hanoi(n - 1, desde, aux, hasta)`: los n − 1 de arriba van al auxiliar para dejarle libre el destino al grande. (Por el camino, el chico sí pasa un momento por C.)",
            en: "`hanoi(n - 1, desde, aux, hasta)`: the top n − 1 go to the spare peg to leave the target free for the big one. (Along the way, the small one does stop on C for a moment.)",
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "Con `hanoi(10, …)`, ¿cuántas llamadas llega a haber **a la vez** en la pila?", en: "With `hanoi(10, …)`, how many calls are on the stack **at once**, at most?" },
          opciones: ["11", "10", "1 023", "2 047"],
          correcta: 0,
          porque: {
            es: "Una por cada tamaño, del 10 al 0: 11. En total se hacen 2 047 llamadas, pero cada una sale antes de que entre la siguiente de su nivel.",
            en: "One for each size, from 10 down to 0: 11. In all there are 2,047 calls, but each one leaves before the next one at its level comes in.",
          },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa la función.", en: "Complete the function." },
          codigo: "function hanoi(n, desde, hasta, aux) {\n  if (n === ___) return;\n  hanoi(n - 1, desde, ___, hasta);\n  mover(n, desde, hasta);\n  hanoi(n - 1, aux, hasta, ___);\n}",
          huecos: ["0", "aux", "desde"],
          banco: ["0", "1", "aux", "hasta", "desde"],
          porque: {
            es: "Con cero discos no hay nada que hacer. Los de arriba van primero al auxiliar, y luego del auxiliar al destino, con `desde` como el poste libre: el grande ya se fue de ahí.",
            en: "With zero disks there's nothing to do. The top ones go to the spare peg first, then from the spare to the target, with `desde` as the free peg: the big one already left it.",
          },
        },
        {
          tipo: "ordena",
          pregunta: { es: "Ordena los renglones de `hanoi`.", en: "Put the lines of `hanoi` in order." },
          lineas: [
            "function hanoi(n, desde, hasta, aux) {",
            "  if (n === 0) return;",
            "  hanoi(n - 1, desde, aux, hasta);",
            "  mover(n, desde, hasta);",
            "  hanoi(n - 1, aux, hasta, desde);",
            "}",
          ],
          porque: {
            es: "El caso base primero; luego los de arriba se quitan del camino, se mueve el grande y los de arriba regresan encima. El grande no puede moverse mientras tenga discos encima: por eso van antes los de arriba.",
            en: "Base case first; then the top ones get out of the way, the big one moves and the top ones come back on top. The big one can't move while it has disks on top: that's why the top ones go first.",
          },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `hanoiLista(n, desde, hasta, aux)`: en vez de imprimir, devuelve un arreglo con los movimientos en orden, cada uno como el texto de dos letras `desde + hasta` (`\"AC\"` es de A a C).",
            en: "Write `hanoiLista(n, desde, hasta, aux)`: instead of printing, it returns an array with the moves in order, each one as the two-letter string `desde + hasta` (`\"AC\"` is from A to C).",
          },
          inicial: {
            es: "function hanoiLista(n, desde, hasta, aux) {\n  // caso base: con 0 discos, ningún movimiento\n  // si no: los de n - 1, el grande y otra vez los de n - 1\n  return [];\n}\n\nconsole.log(hanoiLista(2, \"A\", \"C\", \"B\"));",
            en: "function hanoiLista(n, desde, hasta, aux) {\n  // base case: with 0 disks, no moves\n  // otherwise: the moves of n - 1, the big one, and n - 1 again\n  return [];\n}\n\nconsole.log(hanoiLista(2, \"A\", \"C\", \"B\"));",
          },
          pruebas: [
            { llamada: "hanoiLista(1, \"A\", \"C\", \"B\")", espera: "[\"AC\"]" },
            { llamada: "hanoiLista(2, \"A\", \"C\", \"B\")", espera: "[\"AB\",\"AC\",\"BC\"]" },
            { llamada: "hanoiLista(3, \"A\", \"C\", \"B\")", espera: "[\"AC\",\"AB\",\"CB\",\"AC\",\"BA\",\"BC\",\"AC\"]" },
            { llamada: "hanoiLista(0, \"A\", \"C\", \"B\")", espera: "[]" },
            { llamada: "hanoiLista(10, \"A\", \"C\", \"B\").length", espera: "1023" },
          ],
          solucion: "function hanoiLista(n, desde, hasta, aux) {\n  if (n === 0) return [];\n  return [\n    ...hanoiLista(n - 1, desde, aux, hasta),\n    desde + hasta,\n    ...hanoiLista(n - 1, aux, hasta, desde),\n  ];\n}",
          porque: {
            es: "Es `hanoi` con `return` en vez de `mover`: el arreglo de los n − 1 de arriba, el movimiento del grande y el arreglo de los n − 1 otra vez, pegados con `...`.",
            en: "It's `hanoi` with `return` instead of `mover`: the array for the top n − 1, the big one's move, and the array for n − 1 again, joined with `...`.",
          },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `cuantos(n)`, **recursiva** y sin `**`: cuántos movimientos hacen falta para n discos, sin moverlos. Usa la misma idea: los de n − 1, uno más, y otra vez los de n − 1.",
            en: "Write a **recursive** `cuantos(n)` (how many), without `**`: how many moves it takes for n disks, without moving them. Use the same idea: those of n − 1, one more, and those of n − 1 again.",
          },
          inicial: {
            es: "function cuantos(n) {\n  // caso base: con 0 discos, 0 movimientos\n  return 0;\n}\n\nconsole.log(cuantos(3));",
            en: "function cuantos(n) {\n  // base case: with 0 disks, 0 moves\n  return 0;\n}\n\nconsole.log(cuantos(3));",
          },
          pruebas: [
            { llamada: "cuantos(0)", espera: "0" },
            { llamada: "cuantos(1)", espera: "1" },
            { llamada: "cuantos(3)", espera: "7" },
            { llamada: "cuantos(10)", espera: "1023" },
            { llamada: "cuantos(20)", espera: "1048575" },
          ],
          solucion: "function cuantos(n) {\n  if (n === 0) return 0;\n  return 2 * cuantos(n - 1) + 1;\n}",
          porque: {
            es: "`cuantos(n - 1)` dos veces, más el grande: `2 * cuantos(n - 1) + 1`. Llamarla una sola vez y multiplicar por 2 importa: con `cuantos(n - 1) + 1 + cuantos(n - 1)` da lo mismo, pero con 2ⁿ⁺¹ − 1 llamadas en vez de n + 1.",
            en: "`cuantos(n - 1)` twice, plus the big one: `2 * cuantos(n - 1) + 1`. Calling it once and multiplying by 2 matters: `cuantos(n - 1) + 1 + cuantos(n - 1)` gives the same answer, but with 2ⁿ⁺¹ − 1 calls instead of n + 1.",
          },
        },
      ],
    },
  ],
};
