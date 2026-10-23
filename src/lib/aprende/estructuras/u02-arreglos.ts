import type { Unidad } from "../tipos";

export const U02: Unidad = {
  id: "arreglos",
  titulo: { es: "Arreglos", en: "Arrays" },
  lecciones: [
    {
      id: "arreglos-e-indices",
      titulo: { es: "Arreglos e índices", en: "Arrays and indexes" },
      resumen: {
        es: "Casillas en fila, numeradas desde 0: por qué leer cualquiera cuesta lo mismo, y las rejillas como arreglos de arreglos.",
        en: "Slots in a row, numbered from 0: why reading any of them costs the same, and grids as arrays of arrays.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Casillas en fila, desde el 0", en: "Slots in a row, from 0" },
          texto: {
            es: "Un **arreglo** guarda sus elementos uno junto a otro, en casillas numeradas. El número de la casilla es su **índice**, y se empieza a contar en **0**: el primero es `arr[0]` y el último es `arr[arr.length - 1]`.\n\nComo las casillas van seguidas en la memoria, para llegar a la casilla 7 basta con hacer una cuenta: «donde empieza el arreglo + 7 casillas». No hay que pasar por las anteriores. Por eso leer o escribir `arr[i]` cuesta **O(1)**, sin importar si el arreglo tiene diez elementos o diez millones.",
            en: "An **array** stores its items next to each other, in numbered slots. The slot's number is its **index**, and counting starts at **0**: the first is `arr[0]` and the last is `arr[arr.length - 1]`.\n\nSince the slots sit next to each other in memory, reaching slot 7 is just arithmetic: \"where the array starts + 7 slots\". You don't walk past the earlier ones. That's why reading or writing `arr[i]` costs **O(1)**, whether the array has ten items or ten million.",
          },
          dibujo: { tipo: "arreglo", valores: [12, 5, 8, 21, 3], resalta: [3], punteros: [{ i: 3, texto: "arr[3]" }] },
          programa: {
            codigo: {
              es: "const precios = [12, 5, 8, 21, 3];\n\nconsole.log(precios[0]);                  // el primero\nconsole.log(precios[3]);                  // el cuarto\nconsole.log(precios[precios.length - 1]); // el último\n\nprecios[1] = 6;                           // escribir también es O(1)\nconsole.log(precios);",
              en: "const precios = [12, 5, 8, 21, 3];\n\nconsole.log(precios[0]);                  // the first\nconsole.log(precios[3]);                  // the fourth\nconsole.log(precios[precios.length - 1]); // the last\n\nprecios[1] = 6;                           // writing is O(1) too\nconsole.log(precios);",
            },
            notas: {
              es: "- `precios[3]` es 21: el **cuarto** elemento, porque se cuenta desde 0.\n- El último se pide con `length - 1`, no con `length`.\n- Cambiar la casilla 1 no movió a nadie más.",
              en: "- `precios[3]` is 21: the **fourth** item, because counting starts at 0.\n- You get the last one with `length - 1`, not `length`.\n- Changing slot 1 didn't move anything else.",
            },
          },
          enlaces: [{ url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array", texto: { es: "Array en MDN", en: "Array on MDN (Spanish)" } }],
        },
        {
          tipo: "explica",
          titulo: { es: "Fuera del arreglo", en: "Outside the array" },
          texto: {
            es: "¿Qué pasa si pides una casilla que no existe? En C o en Java eso es un error grave (o algo peor: leer basura de la memoria). JavaScript es más relajado y te devuelve `undefined`, sin avisar. Es cómodo, pero esconde errores: un índice que se pasó por uno da `undefined` y el programa sigue como si nada.\n\nEl error más común con arreglos tiene nombre: **«por uno»** (*off by one*). Un ciclo `i <= arr.length` da una vuelta de más y lee la casilla que no existe.",
            en: "What happens if you ask for a slot that doesn't exist? In C or Java that's a serious error (or worse: reading garbage from memory). JavaScript is more relaxed and hands you `undefined`, silently. Convenient, but it hides bugs: an index that's off by one gives `undefined` and the program keeps going as if nothing happened.\n\nThe most common array bug has a name: **off by one**. A loop with `i <= arr.length` takes one turn too many and reads the slot that isn't there.",
          },
          programa: {
            codigo: {
              es: "const dias = [\"lun\", \"mar\", \"mié\"];\n\nconsole.log(dias[3]);   // no existe\nconsole.log(dias[-1]);  // tampoco: no cuenta desde atrás\nconsole.log(dias.at(-1)); // at() sí cuenta desde atrás\n\n// El error «por uno»: <= da una vuelta de más\nfor (let i = 0; i <= dias.length; i++) {\n  console.log(i, dias[i]);\n}",
              en: "const dias = [\"lun\", \"mar\", \"mié\"];\n\nconsole.log(dias[3]);   // doesn't exist\nconsole.log(dias[-1]);  // neither: no counting from the end\nconsole.log(dias.at(-1)); // at() does count from the end\n\n// The off-by-one bug: <= takes one extra turn\nfor (let i = 0; i <= dias.length; i++) {\n  console.log(i, dias[i]);\n}",
            },
            notas: {
              es: "- `dias[3]` y `dias[-1]` dan `undefined`, sin error.\n- `at(-1)` es la forma moderna de pedir el último.\n- La última vuelta del ciclo imprime `3 undefined`: ésa es la vuelta de más.",
              en: "- `dias[3]` and `dias[-1]` give `undefined`, no error.\n- `at(-1)` is the modern way to ask for the last one.\n- The loop's last turn prints `3 undefined`: that's the extra turn.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Rejillas: arreglos de arreglos", en: "Grids: arrays of arrays" },
          texto: {
            es: "Un tablero, un mapa o una hoja de cálculo es un arreglo de **filas**, y cada fila es otro arreglo. Se lee con dos índices: primero la fila (`y`) y luego la columna (`x`): `rejilla[y][x]`.\n\nAsí guarda Snake de Daily Challenge sus muros: un arreglo de 17 filas con 16 casillas cada una, `true` donde hay muro. Revisar si una casilla está libre es una lectura O(1).",
            en: "A board, a map or a spreadsheet is an array of **rows**, and each row is another array. You read it with two indexes: first the row (`y`), then the column (`x`): `grid[y][x]`.\n\nThat's how Daily Challenge's Snake stores its walls: an array of 17 rows with 16 cells each, `true` where there's a wall. Checking whether a cell is free is one O(1) read.",
          },
          dibujo: {
            tipo: "rejilla",
            filas: ["xxxxxx", "x....x", "x.xx.x", "x....x", "xxxxxx"],
            leyenda: { x: { es: "muro", en: "wall" } },
          },
          programa: {
            codigo: {
              es: "const mapa = [\n  \"xxxxxx\",\n  \"x....x\",\n  \"x.xx.x\",\n  \"x....x\",\n  \"xxxxxx\",\n];\n// Del texto a una rejilla de booleanos: true = muro\nconst muros = mapa.map(fila => [...fila].map(c => c === \"x\"));\n\nconsole.log(muros.length, \"filas,\", muros[0].length, \"columnas\");\nconsole.log(muros[2][2]);  // fila 2, columna 2\nconsole.log(muros[1][2]);  // fila 1, columna 2",
              en: "const mapa = [\n  \"xxxxxx\",\n  \"x....x\",\n  \"x.xx.x\",\n  \"x....x\",\n  \"xxxxxx\",\n];\n// From text to a grid of booleans: true = wall\nconst muros = mapa.map(fila => [...fila].map(c => c === \"x\"));\n\nconsole.log(muros.length, \"rows,\", muros[0].length, \"columns\");\nconsole.log(muros[2][2]);  // row 2, column 2\nconsole.log(muros[1][2]);  // row 1, column 2",
            },
            notas: {
              es: "- 5 filas de 6 columnas.\n- `muros[2][2]` es `true`: en la fila 2 hay muro en medio.\n- `muros[1][2]` es `false`: pasillo. El orden importa: **fila primero, columna después**.",
              en: "- 5 rows of 6 columns.\n- `muros[2][2]` is `true`: row 2 has a wall in the middle.\n- `muros[1][2]` is `false`: open floor. Order matters: **row first, column second**.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué imprime?", en: "What does it print?" },
          codigo: "const letras = [\"a\", \"b\", \"c\", \"d\"];\nconsole.log(letras[2]);",
          opciones: ["\"b\"", "\"c\"", "\"d\"", "undefined"],
          correcta: 1,
          porque: { es: "Se cuenta desde 0: `a` es 0, `b` es 1 y `c` es 2.", en: "Counting starts at 0: `a` is 0, `b` is 1 and `c` is 2." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Por qué leer `arr[i]` cuesta O(1)?", en: "Why does reading `arr[i]` cost O(1)?" },
          opciones: [
            { es: "Porque JavaScript guarda una copia de cada elemento", en: "Because JavaScript keeps a copy of every item" },
            { es: "Porque las casillas van seguidas y la dirección se calcula con una cuenta", en: "Because the slots sit next to each other and the address is computed with arithmetic" },
            { es: "Porque el arreglo siempre está ordenado", en: "Because the array is always sorted" },
            { es: "Porque recorre el arreglo muy rápido", en: "Because it walks the array very fast" },
          ],
          correcta: 1,
          porque: { es: "Inicio + i × tamaño de casilla: una cuenta, no un recorrido. No importa el orden de los valores ni cuántos haya.", en: "Start + i × slot size: arithmetic, not a walk. The order of the values and how many there are don't matter." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa para imprimir el último elemento y la casilla de la fila 1, columna 0.", en: "Fill in to print the last item and the cell at row 1, column 0." },
          codigo: "const a = [4, 7, 9];\nconsole.log(a[a.length ___]);\n\nconst r = [[1, 2], [3, 4]];\nconsole.log(r___);",
          huecos: ["- 1", "[1][0]"],
          banco: ["- 1", "+ 1", "[1][0]", "[0][1]"],
          porque: { es: "El último está en `length - 1`. Y en una rejilla va primero la fila: `r[1][0]` es el 3.", en: "The last one sits at `length - 1`. And in a grid the row comes first: `r[1][0]` is 3." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `esquinas(rejilla)`: devuelve un arreglo con las cuatro esquinas en este orden: arriba a la izquierda, arriba a la derecha, abajo a la izquierda y abajo a la derecha.",
            en: "Write `esquinas(rejilla)`: return an array with the four corners in this order: top left, top right, bottom left and bottom right.",
          },
          inicial: {
            es: "function esquinas(rejilla) {\n  // la última fila es rejilla[rejilla.length - 1]\n}\n\nconsole.log(esquinas([[1, 2, 3], [4, 5, 6]]));",
            en: "function esquinas(rejilla) {\n  // the last row is rejilla[rejilla.length - 1]\n}\n\nconsole.log(esquinas([[1, 2, 3], [4, 5, 6]]));",
          },
          pruebas: [
            { llamada: "esquinas([[1, 2, 3], [4, 5, 6]])", espera: "[1,3,4,6]" },
            { llamada: "esquinas([[7]])", espera: "[7,7,7,7]" },
            { llamada: "esquinas([[1, 2], [3, 4], [5, 6]])", espera: "[1,2,5,6]" },
          ],
          solucion: "function esquinas(rejilla) {\n  const arriba = rejilla[0];\n  const abajo = rejilla[rejilla.length - 1];\n  return [arriba[0], arriba[arriba.length - 1], abajo[0], abajo[abajo.length - 1]];\n}",
          porque: { es: "Cuatro lecturas O(1): primera y última fila, y en cada una la primera y la última casilla. Con una rejilla de 1×1 las cuatro esquinas son la misma.", en: "Four O(1) reads: first and last row, and in each one the first and last slot. In a 1×1 grid all four corners are the same." },
        },
      ],
    },
    {
      id: "recorrer-insertar-borrar",
      titulo: { es: "Recorrer, meter y sacar", en: "Walking, adding and removing" },
      resumen: {
        es: "Por qué meter al final es barato y al principio es caro, cómo buscar sin índice, y map, filter y reduce.",
        en: "Why adding at the end is cheap and at the front is expensive, how to search without an index, and map, filter and reduce.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Recorrer", en: "Walking through" },
          texto: {
            es: "Recorrer es visitar cada casilla una vez: **O(n)**. En JavaScript hay dos formas que vas a usar todo el tiempo:\n\n- `for (let i = 0; i < arr.length; i++)` cuando necesitas el índice.\n- `for (const x of arr)` cuando sólo te importa el valor.\n\nBuscar un valor sin saber dónde está también es un recorrido: `indexOf` e `includes` revisan casilla por casilla hasta encontrarlo. Es la **búsqueda lineal**, O(n) en el peor caso.",
            en: "Walking an array means visiting each slot once: **O(n)**. In JavaScript there are two forms you'll use all the time:\n\n- `for (let i = 0; i < arr.length; i++)` when you need the index.\n- `for (const x of arr)` when you only care about the value.\n\nLooking for a value without knowing where it is is also a walk: `indexOf` and `includes` check slot by slot until they find it. That's **linear search**, O(n) in the worst case.",
          },
          programa: {
            codigo: {
              es: "const tianguis = [\"jitomate\", \"cebolla\", \"chile\", \"aguacate\"];\n\nfor (let i = 0; i < tianguis.length; i++) {\n  console.log(i, tianguis[i]);\n}\nfor (const cosa of tianguis) {\n  console.log(cosa.toUpperCase());\n}\n\nconsole.log(tianguis.indexOf(\"chile\"));   // dónde está\nconsole.log(tianguis.indexOf(\"mango\"));   // -1: no está\nconsole.log(tianguis.includes(\"mango\"));",
              en: "const tianguis = [\"jitomate\", \"cebolla\", \"chile\", \"aguacate\"];\n\nfor (let i = 0; i < tianguis.length; i++) {\n  console.log(i, tianguis[i]);\n}\nfor (const cosa of tianguis) {\n  console.log(cosa.toUpperCase());\n}\n\nconsole.log(tianguis.indexOf(\"chile\"));   // where it is\nconsole.log(tianguis.indexOf(\"mango\"));   // -1: not there\nconsole.log(tianguis.includes(\"mango\"));",
            },
            notas: {
              es: "- El primer ciclo da índice y valor; el segundo, sólo el valor.\n- `indexOf` devuelve `-1` cuando no lo encuentra: para saberlo tuvo que revisar las cuatro casillas.",
              en: "- The first loop gives index and value; the second, just the value.\n- `indexOf` returns `-1` when it doesn't find it: to know that, it had to check all four slots.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Al final es barato; al principio, caro", en: "The end is cheap; the front is expensive" },
          texto: {
            es: "`push` mete al final y `pop` saca del final: no hay que mover a nadie, así que cuestan **O(1)**.\n\n`unshift` mete al principio y `shift` saca del principio. Como las casillas van seguidas y numeradas, **todos los demás tienen que recorrerse un lugar** para dejar o tapar el hueco: O(n). `splice`, que mete o saca en medio, también recorre a los que quedan detrás.\n\nEl programa mide cuánto tarda cada uno con 20 000 elementos.",
            en: "`push` adds at the end and `pop` removes from the end: nobody has to move, so they cost **O(1)**.\n\n`unshift` adds at the front and `shift` removes from the front. Since the slots are contiguous and numbered, **everyone else has to shift one place** to open or close the gap: O(n). `splice`, which adds or removes in the middle, also shifts everything behind it.\n\nThe program times each one with 20,000 items.",
          },
          dibujo: { tipo: "arreglo", valores: ["Z", "A", "B", "C", "D"], resalta: [0], punteros: [{ i: 0, texto: "unshift" }] },
          programa: {
            codigo: {
              es: "function medir(nombre, hacer) {\n  const arr = [];\n  const t0 = Date.now();\n  for (let i = 0; i < 20000; i++) hacer(arr, i);\n  console.log(nombre, Date.now() - t0, \"ms\");\n}\n\nmedir(\"push   \", (a, i) => a.push(i));\nmedir(\"unshift\", (a, i) => a.unshift(i));\n\nconst letras = [\"a\", \"b\", \"c\", \"d\"];\nletras.splice(1, 2);        // desde el 1, saca 2\nconsole.log(letras);\nletras.splice(1, 0, \"x\");   // desde el 1, saca 0 y mete \"x\"\nconsole.log(letras);",
              en: "function medir(nombre, hacer) {\n  const arr = [];\n  const t0 = Date.now();\n  for (let i = 0; i < 20000; i++) hacer(arr, i);\n  console.log(nombre, Date.now() - t0, \"ms\");\n}\n\nmedir(\"push   \", (a, i) => a.push(i));\nmedir(\"unshift\", (a, i) => a.unshift(i));\n\nconst letras = [\"a\", \"b\", \"c\", \"d\"];\nletras.splice(1, 2);        // from 1, remove 2\nconsole.log(letras);\nletras.splice(1, 0, \"x\");   // from 1, remove 0 and insert \"x\"\nconsole.log(letras);",
            },
            notas: {
              es: "- `unshift` tarda muchas veces más que `push` con la misma cantidad: cada uno recorre a todos los anteriores. (Los milisegundos cambian de una corrida a otra; la diferencia no.)\n- `splice(inicio, cuántos, ...nuevos)` saca y mete en medio.",
              en: "- `unshift` takes many times longer than `push` for the same count: each one shifts everyone already there. (The milliseconds change from run to run; the gap doesn't.)\n- `splice(start, howMany, ...newItems)` removes and inserts in the middle.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "map, filter y reduce", en: "map, filter and reduce" },
          texto: {
            es: "Tres recorridos tan comunes que tienen nombre propio. Los tres devuelven algo **nuevo** y no cambian el original:\n\n- `map(f)`: un arreglo del mismo tamaño, con `f` aplicada a cada elemento.\n- `filter(f)`: sólo los elementos para los que `f` da `true`.\n- `reduce(f, inicial)`: junta todo en un solo valor, como una suma.\n\nSiguen siendo O(n): son ciclos escritos de otra forma.",
            en: "Three walks so common they have their own names. All three return something **new** and leave the original alone:\n\n- `map(f)`: an array of the same size, with `f` applied to each item.\n- `filter(f)`: only the items for which `f` returns `true`.\n- `reduce(f, initial)`: folds everything into a single value, like a sum.\n\nThey're still O(n): loops written another way.",
          },
          programa: {
            codigo: {
              es: "const precios = [20, 45, 12, 80];\n\nconst conIva = precios.map(p => p * 1.16);\nconsole.log(conIva);\n\nconst baratos = precios.filter(p => p < 30);\nconsole.log(baratos);\n\nconst total = precios.reduce((suma, p) => suma + p, 0);\nconsole.log(total);\n\nconsole.log(precios); // el original no cambió",
              en: "const precios = [20, 45, 12, 80];\n\nconst conIva = precios.map(p => p * 1.16);\nconsole.log(conIva);\n\nconst baratos = precios.filter(p => p < 30);\nconsole.log(baratos);\n\nconst total = precios.reduce((suma, p) => suma + p, 0);\nconsole.log(total);\n\nconsole.log(precios); // the original didn't change",
            },
            notas: {
              es: "- `map` da cuatro precios con IVA (con decimales feos: así son los números de punto flotante).\n- `filter` se queda con 20 y 12.\n- `reduce` empieza en 0 y va sumando: 157.",
              en: "- `map` gives four prices with 16 % tax (with ugly decimals: that's floating point for you).\n- `filter` keeps 20 and 12.\n- `reduce` starts at 0 and keeps adding: 157.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Cuál de estas operaciones cuesta O(1) en un arreglo?", en: "Which of these operations costs O(1) on an array?" },
          opciones: ["arr.unshift(x)", "arr.shift()", "arr.push(x)", "arr.indexOf(x)"],
          correcta: 2,
          porque: { es: "`push` pone al final y nadie se mueve. `unshift` y `shift` recorren a todos, e `indexOf` revisa casilla por casilla.", en: "`push` adds at the end and nobody moves. `unshift` and `shift` shift everyone, and `indexOf` checks slot by slot." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué imprime?", en: "What does it print?" },
          codigo: "const a = [1, 2, 3, 4];\nconst b = a.filter(x => x % 2 === 0).map(x => x * 10);\nconsole.log(b);",
          opciones: ["[ 10, 30 ]", "[ 20, 40 ]", "[ 10, 20, 30, 40 ]", "[ 2, 4 ]"],
          correcta: 1,
          porque: { es: "`filter` deja los pares (2 y 4) y `map` los multiplica por 10.", en: "`filter` keeps the even ones (2 and 4) and `map` multiplies them by 10." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa: saca el último elemento y mete un 0 al principio.", en: "Fill in: remove the last item and add a 0 at the front." },
          codigo: "const a = [5, 6, 7];\na.___();\na.___(0);\nconsole.log(a); // [ 0, 5, 6 ]",
          huecos: ["pop", "unshift"],
          banco: ["pop", "unshift", "shift", "push"],
          porque: { es: "`pop` saca del final y `unshift` mete al principio. `shift` sacaría el 5 y `push` metería el 0 al final.", en: "`pop` removes from the end and `unshift` adds at the front. `shift` would remove the 5 and `push` would put the 0 at the end." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `buscar(arr, x)` sin usar `indexOf`: devuelve el índice de la primera vez que aparece `x`, o `-1` si no está.",
            en: "Write `buscar(arr, x)` without `indexOf`: return the index of the first time `x` appears, or `-1` if it isn't there.",
          },
          inicial: {
            es: "function buscar(arr, x) {\n  // recorre con un for que tenga índice\n}\n\nconsole.log(buscar([4, 8, 15], 8));",
            en: "function buscar(arr, x) {\n  // walk it with a for loop that has an index\n}\n\nconsole.log(buscar([4, 8, 15], 8));",
          },
          pruebas: [
            { llamada: "buscar([4, 8, 15], 8)", espera: "1" },
            { llamada: "buscar([4, 8, 15], 16)", espera: "-1" },
            { llamada: "buscar([3, 1, 3], 3)", espera: "0" },
            { llamada: "buscar([], 1)", espera: "-1" },
          ],
          solucion: "function buscar(arr, x) {\n  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] === x) return i;\n  }\n  return -1;\n}",
          porque: { es: "Es la búsqueda lineal: en cuanto lo encuentras, regresas su índice; si el ciclo termina, no estaba. O(n) en el peor caso.", en: "That's linear search: as soon as you find it, return its index; if the loop ends, it wasn't there. O(n) in the worst case." },
        },
      ],
    },
    {
      id: "dos-punteros-y-ventanas",
      titulo: { es: "Dos punteros y ventanas", en: "Two pointers and sliding windows" },
      resumen: {
        es: "Dos índices que caminan a la vez convierten muchos problemas de O(n²) en O(n). La técnica de media entrevista.",
        en: "Two indexes walking at once turn many O(n²) problems into O(n). Half of all interview questions.",
      },
      retos: ["valid-palindrome", "two-sum", "container-with-most-water", "three-sum", "best-time-to-buy-and-sell-stock", "longest-substring-without-repeating-characters"],
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Uno en cada punta", en: "One at each end" },
          texto: {
            es: "Muchos problemas de arreglos se resuelven con **dos índices** en vez de dos ciclos anidados. El más sencillo: uno empieza a la izquierda (`i`), otro a la derecha (`j`), y se acercan.\n\nPara saber si una palabra es **palíndromo** (se lee igual al revés), comparas las puntas: si son iguales, los dos avanzan hacia el centro; si no, ya sabes que no lo es. Cada letra se mira una vez: **O(n)**.",
            en: "Many array problems are solved with **two indexes** instead of two nested loops. The simplest: one starts on the left (`i`), the other on the right (`j`), and they move toward each other.\n\nTo know whether a word is a **palindrome** (reads the same backwards), compare the ends: if they match, both step toward the middle; if not, you already know it isn't. Each letter is looked at once: **O(n)**.",
          },
          dibujo: { tipo: "arreglo", valores: ["r", "e", "c", "o", "n", "o", "c", "e", "r"], resalta: [0, 8], punteros: [{ i: 0, texto: "i" }, { i: 8, texto: "j" }] },
          programa: {
            codigo: "function esPalindromo(texto) {\n  let i = 0, j = texto.length - 1;\n  while (i < j) {\n    console.log(\"  \", texto[i], \"vs\", texto[j]);\n    if (texto[i] !== texto[j]) return false;\n    i++;\n    j--;\n  }\n  return true;\n}\n\nconsole.log(esPalindromo(\"reconocer\"));\nconsole.log(esPalindromo(\"sahuayo\"));",
            notas: {
              es: "- «reconocer» compara cuatro parejas y llega al centro: `true`.\n- «sahuayo» falla en la primera comparación (s contra o) y no sigue.",
              en: "- \"reconocer\" compares four pairs and reaches the middle: `true`.\n- \"sahuayo\" fails on the first comparison (s vs o) and stops there.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "En un arreglo ordenado", en: "In a sorted array" },
          texto: {
            es: "Con un arreglo **ordenado**, dos punteros encuentran dos números que sumen un objetivo sin probar todas las parejas. Si la suma de las puntas se queda corta, mueves `i` a la derecha (un número más grande); si se pasa, mueves `j` a la izquierda (uno más chico).\n\nCada paso descarta un elemento para siempre, así que son a lo mucho `n` pasos en vez de `n²/2` parejas. El orden es lo que permite descartar.",
            en: "With a **sorted** array, two pointers find two numbers that add up to a target without trying every pair. If the ends add up to too little, move `i` right (a bigger number); if they overshoot, move `j` left (a smaller one).\n\nEach step discards one item for good, so it's at most `n` steps instead of `n²/2` pairs. The ordering is what lets you discard.",
          },
          programa: {
            codigo: {
              es: "function parQueSuma(ordenado, objetivo) {\n  let i = 0, j = ordenado.length - 1;\n  while (i < j) {\n    const suma = ordenado[i] + ordenado[j];\n    console.log(\"  i =\", i, \"j =\", j, \"suma =\", suma);\n    if (suma === objetivo) return [i, j];\n    if (suma < objetivo) i++;   // falta: uno más grande\n    else j--;                   // sobra: uno más chico\n  }\n  return null;\n}\n\nconsole.log(parQueSuma([1, 3, 4, 6, 8, 11], 10));",
              en: "function parQueSuma(ordenado, objetivo) {\n  let i = 0, j = ordenado.length - 1;\n  while (i < j) {\n    const suma = ordenado[i] + ordenado[j];\n    console.log(\"  i =\", i, \"j =\", j, \"suma =\", suma);\n    if (suma === objetivo) return [i, j];\n    if (suma < objetivo) i++;   // too little: a bigger one\n    else j--;                   // too much: a smaller one\n  }\n  return null;\n}\n\nconsole.log(parQueSuma([1, 3, 4, 6, 8, 11], 10));",
            },
            notas: {
              es: "1 + 11 = 12 se pasa y el 11 queda descartado; 1 + 8 = 9 se queda corto y sale el 1; 3 + 8 = 11 se pasa y sale el 8; 3 + 6 = 9 se queda corto y sale el 3; 4 + 6 = 10. Cinco pasos y responde `[ 2, 3 ]`.",
              en: "1 + 11 = 12 overshoots, so 11 is out; 1 + 8 = 9 falls short, so 1 is out; 3 + 8 = 11 overshoots and 8 is out; 3 + 6 = 9 falls short and 3 is out; 4 + 6 = 10. Five steps and it answers `[ 2, 3 ]`.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "La ventana que se desliza", en: "The sliding window" },
          texto: {
            es: "Otra forma de dos punteros: los dos van en la **misma dirección** y marcan una **ventana** `[inicio, fin]`. El `fin` avanza para meter elementos; el `inicio` avanza para sacarlos cuando la ventana deja de cumplir la condición.\n\nEjemplo: el tramo más largo de un texto sin letras repetidas. La ventana crece mientras no haya repetidas; cuando entra una repetida, el inicio se recorre hasta sacarla. Cada letra entra una vez y sale a lo mucho una vez: O(n).",
            en: "Another flavor of two pointers: both move in the **same direction** and mark a **window** `[start, end]`. `end` moves forward to bring items in; `start` moves forward to drop them when the window stops meeting the condition.\n\nExample: the longest stretch of a text with no repeated letters. The window grows while there are no repeats; when a repeat comes in, start slides until it's gone. Each letter enters once and leaves at most once: O(n).",
          },
          programa: {
            codigo: {
              es: "function masLargoSinRepetir(s) {\n  const dentro = new Set();\n  let inicio = 0, mejor = 0;\n  for (let fin = 0; fin < s.length; fin++) {\n    while (dentro.has(s[fin])) {      // repetida: encoger por la izquierda\n      dentro.delete(s[inicio]);\n      inicio++;\n    }\n    dentro.add(s[fin]);\n    mejor = Math.max(mejor, fin - inicio + 1);\n    console.log(\"  ventana:\", s.slice(inicio, fin + 1));\n  }\n  return mejor;\n}\n\nconsole.log(masLargoSinRepetir(\"abcabcbb\"));",
              en: "function masLargoSinRepetir(s) {\n  const dentro = new Set();\n  let inicio = 0, mejor = 0;\n  for (let fin = 0; fin < s.length; fin++) {\n    while (dentro.has(s[fin])) {      // repeat: shrink from the left\n      dentro.delete(s[inicio]);\n      inicio++;\n    }\n    dentro.add(s[fin]);\n    mejor = Math.max(mejor, fin - inicio + 1);\n    console.log(\"  window:\", s.slice(inicio, fin + 1));\n  }\n  return mejor;\n}\n\nconsole.log(masLargoSinRepetir(\"abcabcbb\"));",
            },
            notas: {
              es: "La ventana crece a «abc», y cada vez que entra una letra repetida suelta la de la izquierda: «bca», «cab», «abc»… La mejor mide 3.",
              en: "The window grows to \"abc\", and each time a repeated letter comes in it drops the leftmost one: \"bca\", \"cab\", \"abc\"… The best one is 3 long.",
            },
          },
          enlaces: [{ url: "https://visualgo.net/es/array", texto: { es: "Arreglos animados en VisuAlgo", en: "Animated arrays on VisuAlgo" } }],
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué hace falta para usar dos punteros desde las puntas buscando una suma?", en: "What do you need to use two pointers from the ends to find a sum?" },
          opciones: [
            { es: "Que el arreglo esté ordenado", en: "The array has to be sorted" },
            { es: "Que no tenga números negativos", en: "It can't have negative numbers" },
            { es: "Que tenga un tamaño par", en: "It must have an even length" },
            { es: "Nada: sirve con cualquier arreglo", en: "Nothing: it works with any array" },
          ],
          correcta: 0,
          porque: { es: "Sin orden, saber que la suma se quedó corta no te dice qué puntero mover. Con orden, mover `i` siempre sube la suma y mover `j` siempre la baja.", en: "Without order, knowing the sum fell short doesn't tell you which pointer to move. With order, moving `i` always raises the sum and moving `j` always lowers it." },
        },
        {
          tipo: "elige",
          pregunta: { es: "En la ventana deslizante, ¿por qué el total es O(n) aunque haya un `while` dentro del `for`?", en: "In the sliding window, why is the total O(n) even though there's a `while` inside the `for`?" },
          opciones: [
            { es: "Porque el while casi nunca se ejecuta", en: "Because the while almost never runs" },
            { es: "Porque cada elemento entra una vez y sale a lo mucho una vez", en: "Because each item enters once and leaves at most once" },
            { es: "Porque el Set es O(1)", en: "Because the Set is O(1)" },
            { es: "No es O(n): es O(n²)", en: "It isn't O(n): it's O(n²)" },
          ],
          correcta: 1,
          porque: { es: "`inicio` sólo avanza y nunca pasa a `fin`: entre todas las vueltas del while, avanza a lo mucho `n` veces en total. Sumando, son unos `2n` pasos.", en: "`start` only moves forward and never passes `end`: across all the while's turns, it moves at most `n` times in total. Add it up and it's about `2n` steps." },
        },
        {
          tipo: "ordena",
          pregunta: { es: "Ordena el cuerpo del ciclo de dos punteros que busca una suma en un arreglo ordenado.", en: "Put the body of the two-pointer loop that searches a sum in a sorted array in order." },
          lineas: [
            "const suma = a[i] + a[j];",
            "if (suma === objetivo) return [i, j];",
            "if (suma < objetivo) i++;",
            "else j--;",
          ],
          porque: { es: "Primero se calcula la suma, luego se revisa si ya está y, si no, se mueve el puntero que la acerca al objetivo.", en: "First compute the sum, then check whether you're done, and if not, move the pointer that brings it closer to the target." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `invertir(arr)` con dos punteros: invierte el arreglo **en su lugar** (sin crear otro ni usar `reverse`) y devuélvelo.\n\nPista: intercambia las puntas y acércalas, como en el palíndromo.",
            en: "Write `invertir(arr)` with two pointers: reverse the array **in place** (no new array, no `reverse`) and return it.\n\nHint: swap the ends and move them inward, like in the palindrome.",
          },
          inicial: {
            es: "function invertir(arr) {\n  let i = 0, j = arr.length - 1;\n  // mientras i < j: intercambia y acércalos\n  return arr;\n}\n\nconsole.log(invertir([1, 2, 3, 4, 5]));",
            en: "function invertir(arr) {\n  let i = 0, j = arr.length - 1;\n  // while i < j: swap and move them inward\n  return arr;\n}\n\nconsole.log(invertir([1, 2, 3, 4, 5]));",
          },
          pruebas: [
            { llamada: "invertir([1, 2, 3, 4, 5])", espera: "[5,4,3,2,1]" },
            { llamada: "invertir([\"a\", \"b\"])", espera: "[\"b\",\"a\"]" },
            { llamada: "(() => { const a = [1, 2, 3]; invertir(a); return a; })()", espera: "[3,2,1]" },
            { llamada: "invertir([])", espera: "[]" },
          ],
          solucion: "function invertir(arr) {\n  let i = 0, j = arr.length - 1;\n  while (i < j) {\n    [arr[i], arr[j]] = [arr[j], arr[i]];\n    i++;\n    j--;\n  }\n  return arr;\n}",
          porque: { es: "Cada vuelta acomoda dos elementos, así que son `n/2` intercambios: O(n) sin memoria extra. La tercera prueba revisa que cambiaste el original y no una copia.", en: "Each turn places two items, so it's `n/2` swaps: O(n) with no extra memory. The third test checks that you changed the original, not a copy." },
        },
      ],
    },
  ],
};
