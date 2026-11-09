import type { Unidad } from "../tipos";

/**
 * El código de cada lección es el mismo de su Short de «Algoritmos en pixel»
 * (tools/comerciales/algoritmos/<lección>.py, CODIGO): si cambia uno, cambia
 * el otro. Ninguna línea pasa de 38 caracteres, para que en el vídeo se lea
 * en el teléfono.
 */
const BURBUJA = `function burbuja(a) {
  const n = a.length;
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < n - i; j++) {
      if (a[j] > a[j + 1]) {
        const t = a[j];
        a[j] = a[j + 1];
        a[j + 1] = t;
      }
    }
  }
  return a;
}`;

const INSERCION = `function insercion(a) {
  for (let i = 1; i < a.length; i++) {
    const x = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > x) {
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = x;
  }
  return a;
}`;

const SELECCION = `function seleccion(a) {
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      if (a[j] < a[min]) min = j;
    }
    const t = a[i];
    a[i] = a[min];
    a[min] = t;
  }
  return a;
}`;

const MEZCLA = `function mezcla(v) {
  if (v.length < 2) return v;
  const m = Math.floor(v.length / 2);
  const a = mezcla(v.slice(0, m));
  const b = mezcla(v.slice(m));
  let i = 0, j = 0;
  for (let k = 0; k < v.length; k++) {
    if (j >= b.length || a[i] <= b[j])
      v[k] = a[i++];
    else v[k] = b[j++];
  }
  return v;
}`;

const RAPIDO = `function rapido(a, ini, fin) {
  if (ini >= fin) return;
  const p = a[fin];
  let i = ini;
  for (let j = ini; j < fin; j++) {
    if (a[j] < p) {
      [a[i], a[j]] = [a[j], a[i]];
      i++;
    }
  }
  [a[i], a[fin]] = [a[fin], a[i]];
  rapido(a, ini, i - 1);
  rapido(a, i + 1, fin);
}`;

/** Los mismos números «al azar» en las lecciones y en las tablas de los vídeos: la semilla es fija. */
const AL_AZAR = "function alAzar(n) {\n  let s = 42;\n  return Array.from({ length: n }, () => (s = s * 16807 % 2147483647) % 1000);\n}";

const VISUALGO = { url: "https://visualgo.net/es/sorting", texto: { es: "Ordenamientos animados en VisuAlgo", en: "Animated sorting on VisuAlgo" } };

export const A01: Unidad = {
  id: "ordenar",
  titulo: { es: "Ordenar", en: "Sorting" },
  lecciones: [
    {
      id: "burbuja",
      titulo: { es: "Ordenamiento por burbuja", en: "Bubble sort" },
      resumen: {
        es: "Comparar vecinos y cambiarlos si están al revés, pasada tras pasada: el ordenamiento más fácil de entender, y por qué es O(n²).",
        en: "Compare neighbors and swap them if they're out of order, pass after pass: the easiest sort to understand, and why it's O(n²).",
      },
      retos: ["merge-intervals", "kth-largest-element-in-an-array"],
      enlaces: [
        { url: "https://visualgo.net/es/sorting", texto: { es: "Ordenamientos animados en VisuAlgo", en: "Animated sorting on VisuAlgo" } },
        { url: "/aprende/estructuras-de-datos/divide-y-venceras", texto: { es: "Merge sort, que es O(n log n)", en: "Merge sort, which is O(n log n)" } },
      ],
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Ordenar: el problema", en: "Sorting: the problem" },
          texto: {
            es: "**Ordenar** es acomodar los datos de menor a mayor (o al revés). Las computadoras lo hacen todo el tiempo: el top 10 de un juego, los precios de una tienda, los contactos del teléfono. Y casi siempre es el primer paso de otra cosa: en una lista ordenada se puede buscar con **búsqueda binaria**, los repetidos quedan juntos y el mínimo y el máximo están en las puntas.\n\nHay muchos algoritmos para ordenar. El primero que se aprende es el de **burbuja**: no es el más rápido, pero se explica en una frase y cabe en trece líneas.",
            en: "**Sorting** means putting data in order, smallest to largest (or the other way around). Computers do it all the time: a game's top 10, a store's prices, the contacts on your phone. And it's almost always the first step toward something else: a sorted list can be searched with **binary search**, duplicates end up side by side, and the minimum and maximum sit at the ends.\n\nThere are many sorting algorithms. The first one people learn is **bubble sort**: it isn't the fastest, but it fits in one sentence and thirteen lines.",
          },
          dibujo: { tipo: "arreglo", valores: [5, 2, 8, 3, 7, 1, 6, 4], indices: true },
          programa: {
            codigo: {
              es: "const puntos = [5, 2, 8, 3, 7, 1, 6, 4];\n\n// sort ya viene en JavaScript;\n// (a, b) => a - b compara números\nconst orden = [...puntos];\norden.sort((a, b) => a - b);\nconsole.log(orden);\nconsole.log(\"mínimo:\", orden[0]);\nconsole.log(\"máximo:\", orden.at(-1));\n\n// Sin esa función compara texto:\n// \"10\" va antes que \"9\"\nconsole.log([10, 9, 1].sort());",
              en: "const puntos = [5, 2, 8, 3, 7, 1, 6, 4];\n\n// sort comes with JavaScript;\n// (a, b) => a - b compares numbers\nconst orden = [...puntos];\norden.sort((a, b) => a - b);\nconsole.log(orden);\nconsole.log(\"min:\", orden[0]);\nconsole.log(\"max:\", orden.at(-1));\n\n// Without it, it compares text:\n// \"10\" comes before \"9\"\nconsole.log([10, 9, 1].sort());",
            },
            notas: {
              es: "- Ya ordenada, el mínimo y el máximo son una lectura O(1) cada uno.\n- El último renglón da `[ 1, 10, 9 ]`: sin la función, `sort` compara letras. Es un error clásico.\n- En esta lección vas a escribir tu propio ordenamiento, sin `sort`.",
              en: "- Once sorted, the minimum and the maximum are one O(1) read each.\n- The last line gives `[ 1, 10, 9 ]`: without the function, `sort` compares characters. A classic bug.\n- In this lesson you'll write your own sort, without `sort`.",
            },
          },
          enlaces: [{ url: "/aprende/estructuras-de-datos/big-o", texto: { es: "Antes conviene ver la notación O grande", en: "It helps to see big O notation first" } }],
        },
        {
          tipo: "explica",
          titulo: { es: "La idea: vecinos al revés", en: "The idea: neighbors out of order" },
          texto: {
            es: "La idea cabe en una frase: **recorre la lista comparando cada par de vecinos y, si están al revés, cámbialos de lugar**.\n\nAl terminar una vuelta completa (una **pasada**), el número más grande ya llegó al final: en cada comparación se lo fue llevando consigo, como una burbuja que sube. De ahí el nombre. La segunda pasada lleva al segundo más grande a su lugar, y así hasta que todos quedan en orden.\n\nEn el programa, `i` cuenta las pasadas y `j` recorre los pares `a[j]` y `a[j + 1]`. Cada pasada revisa un par menos que la anterior, porque los últimos ya están acomodados.",
            en: "The idea fits in one sentence: **walk the list comparing each pair of neighbors and, if they're out of order, swap them**.\n\nWhen a full walk (a **pass**) ends, the largest number has already reached the end: every comparison carried it along, like a bubble rising. Hence the name. The second pass takes the second largest to its place, and so on until everything is in order.\n\nIn the program, `i` counts the passes and `j` walks the pairs `a[j]` and `a[j + 1]`. Each pass checks one pair fewer than the one before, because the last ones are already in place.",
          },
          dibujo: { tipo: "arreglo", valores: [5, 2, 8, 3, 7, 1, 6, 4], resalta: [0, 1], punteros: [{ i: 0, texto: "j" }, { i: 1, texto: "j + 1" }] },
          programa: {
            codigo: BURBUJA + "\n\nconst lista = [5, 2, 8, 3, 7, 1, 6, 4];\nconsole.log(burbuja(lista));",
            notas: {
              es: "- El intercambio usa una variable auxiliar `t`: si primero haces `a[j] = a[j + 1]`, el valor de `a[j]` se pierde.\n- La función ordena el arreglo **en su lugar** (cambia el que le pasas, sin crear otro) y además lo devuelve.",
              en: "- The swap uses a helper variable `t`: if you do `a[j] = a[j + 1]` first, the value of `a[j]` is lost.\n- The function sorts the array **in place** (it changes the one you pass in, without making another) and also returns it.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Pasada por pasada", en: "Pass by pass" },
          texto: {
            es: "Para ver qué hace, la misma función con tres cosas más: imprime el arreglo al terminar cada pasada y cuenta las **comparaciones** (cuántas veces corre el `if`) y los **intercambios** (cuántas veces cambia dos de lugar).",
            en: "To see what it does, here's the same function with three additions: it prints the array after each pass and counts the **comparisons** (how many times the `if` runs) and the **swaps** (how many times two trade places).",
          },
          programa: {
            codigo: {
              es: "function burbuja(a) {\n  const n = a.length;\n  let comparaciones = 0;\n  let intercambios = 0;\n  for (let i = 1; i < n; i++) {\n    for (let j = 0; j < n - i; j++) {\n      comparaciones++;\n      if (a[j] > a[j + 1]) {\n        const t = a[j];\n        a[j] = a[j + 1];\n        a[j + 1] = t;\n        intercambios++;\n      }\n    }\n    console.log(\"pasada\", i + \":\", ...a);\n  }\n  console.log(\"comparaciones:\", comparaciones);\n  console.log(\"intercambios:\", intercambios);\n  return a;\n}\n\nburbuja([5, 2, 8, 3, 7, 1, 6, 4]);",
              en: "function burbuja(a) {\n  const n = a.length;\n  let comparaciones = 0;\n  let intercambios = 0;\n  for (let i = 1; i < n; i++) {\n    for (let j = 0; j < n - i; j++) {\n      comparaciones++;\n      if (a[j] > a[j + 1]) {\n        const t = a[j];\n        a[j] = a[j + 1];\n        a[j + 1] = t;\n        intercambios++;\n      }\n    }\n    console.log(\"pass\", i + \":\", ...a);\n  }\n  console.log(\"comparisons:\", comparaciones);\n  console.log(\"swaps:\", intercambios);\n  return a;\n}\n\nburbuja([5, 2, 8, 3, 7, 1, 6, 4]);",
            },
            notas: {
              es: "- Mira el final de cada renglón: tras la pasada 1 el 8 ya está al final; tras la 2, el 7; tras la 3, el 6.\n- Desde la pasada 5 ya está ordenado, pero la 6 y la 7 corren igual.\n- Las comparaciones son 7 + 6 + 5 + 4 + 3 + 2 + 1 = **28**, vengan como vengan los números. Los intercambios dependen de qué tan revuelta esté la lista: aquí, **15**.",
              en: "- Look at the end of each line: after pass 1 the 8 is already last; after pass 2, the 7; after pass 3, the 6.\n- It's sorted from pass 5 on, but passes 6 and 7 run anyway.\n- There are 7 + 6 + 5 + 4 + 3 + 2 + 1 = **28** comparisons, however the numbers come in. The swaps depend on how shuffled the list is: **15** here.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Por qué es lento: O(n²)", en: "Why it's slow: O(n²)" },
          texto: {
            es: "Con `n` números, la primera pasada hace `n - 1` comparaciones, la segunda `n - 2`, y así hasta 1. En total son **n(n - 1)/2**: con 8 números, 28; con 100, 4 950; con 1 000, casi medio millón.\n\nEso crece como **n²**: con el doble de datos, el trabajo se multiplica por cuatro. Por eso burbuja es **O(n²)**. Con unas decenas de datos no se nota; con un millón serían medio billón de comparaciones. Los ordenamientos que traen los lenguajes, como `sort` de JavaScript, son **O(n log n)**: de la familia de merge sort.",
            en: "With `n` numbers, the first pass makes `n - 1` comparisons, the second `n - 2`, and so on down to 1. That's **n(n - 1)/2** in total: 28 with 8 numbers; 4,950 with 100; almost half a million with 1,000.\n\nThat grows like **n²**: twice the data, four times the work. That's why bubble sort is **O(n²)**. With a few dozen items you won't notice; with a million it would take half a trillion comparisons. The sorts that ship with languages, like JavaScript's `sort`, are **O(n log n)**: merge sort's family.",
          },
          programa: {
            codigo: {
              es: "// Las comparaciones de burbuja,\n// contadas sin ordenar nada\nfunction comparaciones(n) {\n  let c = 0;\n  for (let i = 1; i < n; i++) {\n    for (let j = 0; j < n - i; j++) c++;\n  }\n  return c;\n}\n\nfor (const n of [8, 100, 1000, 2000]) {\n  console.log(n, \"→\", comparaciones(n));\n}\nconsole.log(\"fórmula con 2000:\", 2000 * 1999 / 2);",
              en: "// Bubble sort's comparisons,\n// counted without sorting anything\nfunction comparaciones(n) {\n  let c = 0;\n  for (let i = 1; i < n; i++) {\n    for (let j = 0; j < n - i; j++) c++;\n  }\n  return c;\n}\n\nfor (const n of [8, 100, 1000, 2000]) {\n  console.log(n, \"→\", comparaciones(n));\n}\nconsole.log(\"formula for 2000:\", 2000 * 1999 / 2);",
            },
            notas: {
              es: "- El ciclo da lo mismo que la fórmula n(n - 1)/2: el último renglón la calcula para 2 000.\n- De 1 000 a 2 000 números, las comparaciones pasan de 499 500 a 1 999 000: **cuatro veces más** por el doble de datos.",
              en: "- The loop agrees with the formula n(n - 1)/2: the last line works it out for 2,000.\n- Going from 1,000 to 2,000 numbers, comparisons go from 499,500 to 1,999,000: **four times as many** for twice the data.",
            },
          },
          enlaces: [{ url: "/aprende/estructuras-de-datos/divide-y-venceras", texto: { es: "Merge sort, en la unidad de recursión", en: "Merge sort, in the recursion unit" } }],
        },
        {
          tipo: "explica",
          titulo: { es: "Una mejora: parar si ya está", en: "An improvement: stop when it's done" },
          texto: {
            es: "En el ejemplo, las pasadas 6 y 7 no cambiaron nada. La mejora de siempre es **llevar una bandera**: si una pasada entera no hizo ni un intercambio, la lista ya está ordenada y se puede parar.\n\nCon una lista que ya viene ordenada basta una pasada: **O(n)** en el mejor caso. En el peor caso, la lista al revés, sigue siendo O(n²). De paso, aquí el intercambio va en una línea, con desestructuración: `[a[j], a[j + 1]] = [a[j + 1], a[j]]` hace lo mismo que las tres líneas con `t`.",
            en: "In the example, passes 6 and 7 changed nothing. The usual improvement is to **keep a flag**: if a whole pass made no swap at all, the list is already sorted and you can stop.\n\nWith a list that comes in sorted, one pass is enough: **O(n)** in the best case. In the worst case, a reversed list, it's still O(n²). Also, here the swap fits on one line with destructuring: `[a[j], a[j + 1]] = [a[j + 1], a[j]]` does the same as the three lines with `t`.",
          },
          programa: {
            codigo: {
              es: "function conBandera(a) {\n  const n = a.length;\n  let comparaciones = 0;\n  for (let i = 1; i < n; i++) {\n    let cambio = false;\n    for (let j = 0; j < n - i; j++) {\n      comparaciones++;\n      if (a[j] > a[j + 1]) {\n        [a[j], a[j + 1]] = [a[j + 1], a[j]];\n        cambio = true;\n      }\n    }\n    if (!cambio) break;   // ya está\n  }\n  return comparaciones;\n}\n\nconst revuelta = [5, 2, 8, 3, 7, 1, 6, 4];\nconst ordenada = [1, 2, 3, 4, 5, 6, 7, 8];\nconst alReves = [8, 7, 6, 5, 4, 3, 2, 1];\nconsole.log(\"revuelta:\", conBandera(revuelta));\nconsole.log(\"ordenada:\", conBandera(ordenada));\nconsole.log(\"al revés:\", conBandera(alReves));",
              en: "function conBandera(a) {\n  const n = a.length;\n  let comparaciones = 0;\n  for (let i = 1; i < n; i++) {\n    let cambio = false;\n    for (let j = 0; j < n - i; j++) {\n      comparaciones++;\n      if (a[j] > a[j + 1]) {\n        [a[j], a[j + 1]] = [a[j + 1], a[j]];\n        cambio = true;\n      }\n    }\n    if (!cambio) break;   // done\n  }\n  return comparaciones;\n}\n\nconst revuelta = [5, 2, 8, 3, 7, 1, 6, 4];\nconst ordenada = [1, 2, 3, 4, 5, 6, 7, 8];\nconst alReves = [8, 7, 6, 5, 4, 3, 2, 1];\nconsole.log(\"shuffled:\", conBandera(revuelta));\nconsole.log(\"sorted:  \", conBandera(ordenada));\nconsole.log(\"reversed:\", conBandera(alReves));",
            },
            notas: {
              es: "- Revuelta: 27 en vez de 28. La pasada 6 no cambió nada y ahí paró: se ahorró la 7.\n- Ya ordenada: 7, una sola pasada.\n- Al revés: 28, el peor caso, porque cada comparación termina en intercambio.",
              en: "- Shuffled: 27 instead of 28. Pass 6 changed nothing, so it stopped there and skipped pass 7.\n- Already sorted: 7, a single pass.\n- Reversed: 28, the worst case, because every comparison ends in a swap.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "Después de **una** pasada de burbuja sobre `[4, 1, 3, 2]`, ¿cómo queda el arreglo?", en: "After **one** bubble sort pass over `[4, 1, 3, 2]`, what does the array look like?" },
          opciones: ["[ 1, 4, 3, 2 ]", "[ 1, 3, 2, 4 ]", "[ 1, 2, 3, 4 ]", "[ 4, 3, 2, 1 ]"],
          correcta: 1,
          porque: {
            es: "4 > 1, se cambian; 4 > 3, se cambian; 4 > 2, se cambian. El 4 viaja hasta el final, pero el 3 y el 2 siguen al revés: falta otra pasada.",
            en: "4 > 1, swap; 4 > 3, swap; 4 > 2, swap. The 4 travels all the way to the end, but 3 and 2 are still out of order: another pass is needed.",
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Cuántas comparaciones hace `burbuja` (sin bandera) con 10 números?", en: "How many comparisons does `burbuja` (no flag) make with 10 numbers?" },
          opciones: ["10", "45", "90", "100"],
          correcta: 1,
          porque: {
            es: "9 + 8 + … + 1 = 10 × 9 / 2 = 45, vengan como vengan los números.",
            en: "9 + 8 + … + 1 = 10 × 9 / 2 = 45, however the numbers come in.",
          },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa el intercambio de `a[j]` y `a[j + 1]` con la variable auxiliar.", en: "Fill in the swap of `a[j]` and `a[j + 1]` using the helper variable." },
          codigo: "const t = a[j];\na[j] = ___;\na[j + 1] = ___;",
          huecos: ["a[j + 1]", "t"],
          banco: ["a[j + 1]", "t", "a[j]", "a[j - 1]"],
          porque: {
            es: "Primero se guarda `a[j]` en `t`; luego `a[j]` toma el valor de su vecino y, al final, el vecino recibe lo que se guardó. Sin `t`, el primer valor se perdería.",
            en: "First `a[j]` is saved in `t`; then `a[j]` takes its neighbor's value and, finally, the neighbor gets what was saved. Without `t`, the first value would be lost.",
          },
        },
        {
          tipo: "ordena",
          pregunta: { es: "Ordena los renglones del corazón de burbuja.", en: "Put the lines at the heart of bubble sort in order." },
          lineas: [
            "for (let j = 0; j < n - i; j++) {",
            "if (a[j] > a[j + 1]) {",
            "const t = a[j];",
            "a[j] = a[j + 1];",
            "a[j + 1] = t;",
          ],
          porque: {
            es: "Se recorre cada par con `j`; si están al revés, se guarda uno en `t`, se copia el otro encima y `t` va a donde estaba el otro.",
            en: "Walk each pair with `j`; if they're out of order, save one in `t`, copy the other over it, and `t` goes where the other one was.",
          },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `intercambios(a)`: ordena `a` con burbuja **en su lugar** y devuelve cuántos intercambios hizo.",
            en: "Write `intercambios(a)`: sort `a` with bubble sort **in place** and return how many swaps it made.",
          },
          inicial: {
            es: "function intercambios(a) {\n  let cuenta = 0;\n  // ordena a con burbuja y suma 1 a cuenta en cada intercambio\n  return cuenta;\n}\n\nconsole.log(intercambios([5, 2, 8, 3, 7, 1, 6, 4]));",
            en: "function intercambios(a) {\n  let cuenta = 0;\n  // sort a with bubble sort and add 1 to cuenta on every swap\n  return cuenta;\n}\n\nconsole.log(intercambios([5, 2, 8, 3, 7, 1, 6, 4]));",
          },
          pruebas: [
            { llamada: "intercambios([5, 2, 8, 3, 7, 1, 6, 4])", espera: "15" },
            { llamada: "intercambios([1, 2, 3])", espera: "0" },
            { llamada: "intercambios([3, 2, 1])", espera: "3" },
            { llamada: "(() => { const a = [3, 1, 2]; intercambios(a); return a; })()", espera: "[1,2,3]" },
          ],
          solucion: "function intercambios(a) {\n  let cuenta = 0;\n  const n = a.length;\n  for (let i = 1; i < n; i++) {\n    for (let j = 0; j < n - i; j++) {\n      if (a[j] > a[j + 1]) {\n        [a[j], a[j + 1]] = [a[j + 1], a[j]];\n        cuenta++;\n      }\n    }\n  }\n  return cuenta;\n}",
          porque: {
            es: "Es burbuja con un contador en el intercambio; con `[5, 2, 8, 3, 7, 1, 6, 4]` da los 15 de la pasada por pasada. Cada intercambio arregla exactamente un par que estaba al revés, así que el total es el número de pares desordenados de la lista. La última prueba revisa que ordenaste el original y no una copia.",
            en: "It's bubble sort with a counter on the swap; with `[5, 2, 8, 3, 7, 1, 6, 4]` it gives the 15 from the pass-by-pass run. Each swap fixes exactly one pair that was out of order, so the total is the number of out-of-order pairs in the list. The last test checks that you sorted the original, not a copy.",
          },
        },
      ],
    },
    {
      id: "insercion",
      titulo: { es: "Ordenamiento por inserción", en: "Insertion sort" },
      resumen: {
        es: "Como acomodar cartas en la mano: cada número se recorre a la izquierda hasta su lugar. O(n²), pero casi gratis si la lista ya viene ordenada.",
        en: "Like sorting cards in your hand: each number slides left until it finds its place. O(n²), but nearly free if the list is already sorted.",
      },
      retos: ["insert-interval", "merge-intervals"],
      enlaces: [VISUALGO],
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Como las cartas en la mano", en: "Like the cards in your hand" },
          texto: {
            es: "Si te reparten cartas una por una, seguramente las ordenas así: tomas la nueva y la **metes** en su lugar entre las que ya tienes, recorriendo a la derecha las que son mayores. Eso es el **ordenamiento por inserción**.\n\nEn el programa, `i` señala el número que toca insertar y lo guarda en `x`. Luego `j` camina hacia la izquierda: mientras `a[j]` sea mayor que `x`, lo recorre un lugar a la derecha (`a[j + 1] = a[j]`). Cuando encuentra uno menor o igual, o se acaba el arreglo, deja `x` en el hueco. Lo que está a la izquierda de `i` siempre queda ordenado.",
            en: "If you're dealt cards one at a time, you probably sort them like this: take the new one and **insert** it into its place among the ones you hold, sliding the bigger ones to the right. That's **insertion sort**.\n\nIn the program, `i` points at the number whose turn it is and saves it in `x`. Then `j` walks left: while `a[j]` is bigger than `x`, it shifts one place to the right (`a[j + 1] = a[j]`). When it finds one that's smaller or equal, or runs out of array, it drops `x` into the gap. Everything to the left of `i` is always sorted.",
          },
          dibujo: { tipo: "arreglo", valores: [2, 5, 8, 3, 7, 1, 6, 4], resalta: [3], punteros: [{ i: 3, texto: "x" }] },
          programa: {
            codigo: INSERCION + "\n\nconst lista = [5, 2, 8, 3, 7, 1, 6, 4];\nconsole.log(insercion(lista));",
            notas: {
              es: "- No hay intercambios: cada número mayor se **recorre** una vez, y `x` se escribe al final en el hueco que quedó.\n- Como burbuja, ordena en su lugar y devuelve el mismo arreglo.",
              en: "- There are no swaps: each bigger number **shifts** once, and `x` is written at the end into the gap that's left.\n- Like bubble sort, it sorts in place and returns the same array.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Paso a paso", en: "Step by step" },
          texto: {
            es: "La misma función, con el ciclo de adentro partido para contar: cada vuelta compara una vez y, si `a[j]` no es mayor, se sale con `break`. Imprime el arreglo después de insertar cada `x` y, al final, cuántas comparaciones y cuántos **movimientos** (`a[j + 1] = a[j]`) hizo.",
            en: "The same function, with the inner loop split up so it can count: each turn compares once and, if `a[j]` isn't bigger, leaves with `break`. It prints the array after inserting each `x` and, at the end, how many comparisons and how many **moves** (`a[j + 1] = a[j]`) it made.",
          },
          programa: {
            codigo: {
              es: `function insercion(a) {
  let comparaciones = 0;
  let movimientos = 0;
  for (let i = 1; i < a.length; i++) {
    const x = a[i];
    let j = i - 1;
    while (j >= 0) {
      comparaciones++;
      if (a[j] <= x) break;
      a[j + 1] = a[j];
      movimientos++;
      j--;
    }
    a[j + 1] = x;
    console.log("x =", x, "→", ...a);
  }
  console.log("comparaciones:", comparaciones);
  console.log("movimientos:", movimientos);
}

insercion([5, 2, 8, 3, 7, 1, 6, 4]);`,
              en: `function insercion(a) {
  let comparaciones = 0;
  let movimientos = 0;
  for (let i = 1; i < a.length; i++) {
    const x = a[i];
    let j = i - 1;
    while (j >= 0) {
      comparaciones++;
      if (a[j] <= x) break;
      a[j + 1] = a[j];
      movimientos++;
      j--;
    }
    a[j + 1] = x;
    console.log("x =", x, "→", ...a);
  }
  console.log("comparisons:", comparaciones);
  console.log("moves:", movimientos);
}

insercion([5, 2, 8, 3, 7, 1, 6, 4]);`,
            },
            notas: {
              es: "- Mira cómo crece la parte ordenada de la izquierda: el 3 se mete entre el 2 y el 5, el 1 viaja hasta el principio.\n- 20 comparaciones y 15 movimientos. Los 15 son los mismos intercambios de burbuja: cada movimiento arregla un par que estaba al revés.",
              en: "- Watch the sorted part on the left grow: the 3 slips in between the 2 and the 5, the 1 travels all the way to the front.\n- 20 comparisons and 15 moves. Those 15 are the same as bubble sort's swaps: each move fixes one pair that was out of order.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Casi ordenada, casi gratis", en: "Nearly sorted, nearly free" },
          texto: {
            es: "Lo mejor de inserción: si la lista ya viene ordenada, cada número se compara una sola vez con su vecino y se queda donde está. Son `n - 1` comparaciones: **O(n)**. Si viene al revés, cada número viaja hasta el principio: n(n - 1)/2, **O(n²)**, igual que burbuja. Al azar, más o menos la mitad de eso.\n\nPor eso muchos ordenamientos rápidos de verdad usan inserción para los pedazos chicos o casi ordenados: es simple y no desperdicia trabajo.",
            en: "The best thing about insertion sort: if the list is already sorted, each number is compared once with its neighbor and stays put. That's `n - 1` comparisons: **O(n)**. If it comes in reversed, every number travels all the way to the front: n(n - 1)/2, **O(n²)**, same as bubble sort. Random input lands at about half of that.\n\nThat's why many real-world fast sorts use insertion sort for small or nearly sorted pieces: it's simple and wastes no work.",
          },
          programa: {
            codigo: {
              es: `function comparaciones(a) {
  let c = 0;
  for (let i = 1; i < a.length; i++) {
    const x = a[i];
    let j = i - 1;
    while (j >= 0) {
      c++;
      if (a[j] <= x) break;
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = x;
  }
  return c;
}

// mil números al azar: siempre los mismos, porque la semilla es fija
${AL_AZAR}

const ordenada = Array.from({ length: 1000 }, (_, i) => i + 1);
const alReves = [...ordenada].reverse();
console.log("ordenada:", comparaciones(ordenada));
console.log("al azar: ", comparaciones(alAzar(1000)));
console.log("al revés:", comparaciones(alReves));`,
              en: `function comparaciones(a) {
  let c = 0;
  for (let i = 1; i < a.length; i++) {
    const x = a[i];
    let j = i - 1;
    while (j >= 0) {
      c++;
      if (a[j] <= x) break;
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = x;
  }
  return c;
}

// a thousand random numbers: always the same ones, because the seed is fixed
${AL_AZAR}

const ordenada = Array.from({ length: 1000 }, (_, i) => i + 1);
const alReves = [...ordenada].reverse();
console.log("sorted:  ", comparaciones(ordenada));
console.log("random:  ", comparaciones(alAzar(1000)));
console.log("reversed:", comparaciones(alReves));`,
            },
            notas: {
              es: "- Ya ordenada: 999 comparaciones, una por número.\n- Al azar: unas 247 000, cerca de la mitad del peor caso.\n- Al revés: 499 500, lo mismo que burbuja.",
              en: "- Already sorted: 999 comparisons, one per number.\n- Random: about 247,000, close to half the worst case.\n- Reversed: 499,500, same as bubble sort.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "Después de insertar el 3 en `[2, 5, 8, 3, 7]` (con `i = 3`), ¿cómo queda el arreglo?", en: "After inserting the 3 into `[2, 5, 8, 3, 7]` (with `i = 3`), what does the array look like?" },
          opciones: ["[ 2, 3, 5, 8, 7 ]", "[ 2, 5, 3, 8, 7 ]", "[ 3, 2, 5, 8, 7 ]", "[ 2, 3, 5, 7, 8 ]"],
          correcta: 0,
          porque: {
            es: "El 8 y el 5 son mayores que 3 y se recorren; el 2 no, así que el 3 queda entre el 2 y el 5. El 7 todavía no se toca: le toca en la siguiente vuelta.",
            en: "The 8 and the 5 are bigger than 3 and shift over; the 2 isn't, so the 3 lands between the 2 and the 5. The 7 isn't touched yet: its turn is the next one.",
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Cuántas comparaciones hace con 10 números que **ya están ordenados**?", en: "How many comparisons does it make with 10 numbers that are **already sorted**?" },
          opciones: ["9", "10", "45", "100"],
          correcta: 0,
          porque: {
            es: "Cada número se compara una vez con el de su izquierda, ve que está bien y se queda: 9 comparaciones, O(n). Burbuja sin bandera haría 45 de todos modos.",
            en: "Each number is compared once with the one to its left, sees it's fine and stays: 9 comparisons, O(n). Bubble sort without a flag would make 45 anyway.",
          },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa el ciclo que recorre a los mayores para hacerle lugar a `x`.", en: "Fill in the loop that shifts the bigger ones to make room for `x`." },
          codigo: "while (j >= 0 && a[j] > ___) {\n  a[j + 1] = ___;\n  j--;\n}\na[j + 1] = x;",
          huecos: ["x", "a[j]"],
          banco: ["x", "a[j]", "a[i]", "a[j - 1]"],
          porque: {
            es: "Mientras el de la izquierda sea mayor que `x`, se recorre un lugar a la derecha. Al salir del ciclo, `j + 1` es el hueco donde va `x`.",
            en: "While the one on the left is bigger than `x`, it shifts one place right. When the loop ends, `j + 1` is the gap where `x` goes.",
          },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `insertar(ordenado, x)`: mete `x` en el arreglo ya ordenado, en su lugar, y devuelve el arreglo. Es el corazón de inserción.",
            en: "Write `insertar(ordenado, x)`: put `x` into the already sorted array, in its place, and return the array. It's the heart of insertion sort.",
          },
          inicial: {
            es: "function insertar(ordenado, x) {\n  // recorre desde el final mientras el de la izquierda sea mayor que x\n  return ordenado;\n}\n\nconsole.log(insertar([1, 3, 5], 4));",
            en: "function insertar(ordenado, x) {\n  // walk from the end while the one on the left is bigger than x\n  return ordenado;\n}\n\nconsole.log(insertar([1, 3, 5], 4));",
          },
          pruebas: [
            { llamada: "insertar([1, 3, 5], 4)", espera: "[1,3,4,5]" },
            { llamada: "insertar([], 2)", espera: "[2]" },
            { llamada: "insertar([2, 3], 1)", espera: "[1,2,3]" },
            { llamada: "insertar([1, 2], 9)", espera: "[1,2,9]" },
          ],
          solucion: "function insertar(ordenado, x) {\n  let j = ordenado.length - 1;\n  while (j >= 0 && ordenado[j] > x) {\n    ordenado[j + 1] = ordenado[j];\n    j--;\n  }\n  ordenado[j + 1] = x;\n  return ordenado;\n}",
          porque: {
            es: "Es la vuelta de adentro de inserción: el hueco empieza al final y se va recorriendo a la izquierda mientras haya mayores. Con un arreglo vacío, `j` empieza en -1 y `x` va a la casilla 0.",
            en: "It's insertion sort's inner loop: the gap starts at the end and moves left while there are bigger numbers. With an empty array, `j` starts at -1 and `x` goes into slot 0.",
          },
        },
      ],
    },
    {
      id: "seleccion",
      titulo: { es: "Ordenamiento por selección", en: "Selection sort" },
      resumen: {
        es: "Busca el más chico y ponlo al frente; luego el siguiente. Siempre n(n - 1)/2 comparaciones, pero sólo n - 1 intercambios.",
        en: "Find the smallest and put it in front; then the next one. Always n(n - 1)/2 comparisons, but only n - 1 swaps.",
      },
      retos: ["kth-largest-element-in-an-array"],
      enlaces: [VISUALGO],
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Busca el mínimo y ponlo al frente", en: "Find the minimum and put it in front" },
          texto: {
            es: "El **ordenamiento por selección** hace lo que harías con unas fichas regadas en la mesa: buscas la más chica y la pones primero; de las que quedan, buscas la más chica y la pones segunda; y así.\n\nEn el programa, `i` es la casilla que toca llenar y `min` recuerda dónde está el más chico visto hasta ahora. La vuelta de `j` revisa todo lo que falta; al terminar, el mínimo se cambia a la casilla `i` y esa casilla ya no se vuelve a tocar.",
            en: "**Selection sort** does what you'd do with tiles scattered on a table: find the smallest and put it first; of the rest, find the smallest and put it second; and so on.\n\nIn the program, `i` is the slot to fill and `min` remembers where the smallest one seen so far is. The `j` loop checks everything that's left; when it ends, the minimum is swapped into slot `i` and that slot is never touched again.",
          },
          dibujo: { tipo: "arreglo", valores: [5, 2, 8, 3, 7, 1, 6, 4], resalta: [5], punteros: [{ i: 0, texto: "i" }, { i: 5, texto: "min" }] },
          programa: {
            codigo: SELECCION + "\n\nconst lista = [5, 2, 8, 3, 7, 1, 6, 4];\nconsole.log(seleccion(lista));",
            notas: {
              es: "- La comparación es `<` y no `<=`: con números repetidos se queda con el primero que encontró.\n- Cada vuelta hace exactamente un intercambio, aunque sea de un número consigo mismo.",
              en: "- The comparison is `<`, not `<=`: with repeated numbers it keeps the first one it found.\n- Each pass makes exactly one swap, even if it's a number with itself.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Paso a paso", en: "Step by step" },
          texto: {
            es: "La misma función, que imprime el arreglo al final de cada vuelta y cuenta las comparaciones.",
            en: "The same function, printing the array at the end of each pass and counting the comparisons.",
          },
          programa: {
            codigo: {
              es: `function seleccion(a) {
  const n = a.length;
  let comparaciones = 0;
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      comparaciones++;
      if (a[j] < a[min]) min = j;
    }
    [a[i], a[min]] = [a[min], a[i]];
    console.log("i =", i, "→", ...a);
  }
  console.log("comparaciones:", comparaciones);
  console.log("intercambios:", n - 1);
}

seleccion([5, 2, 8, 3, 7, 1, 6, 4]);`,
              en: `function seleccion(a) {
  const n = a.length;
  let comparaciones = 0;
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      comparaciones++;
      if (a[j] < a[min]) min = j;
    }
    [a[i], a[min]] = [a[min], a[i]];
    console.log("i =", i, "→", ...a);
  }
  console.log("comparisons:", comparaciones);
  console.log("swaps:", n - 1);
}

seleccion([5, 2, 8, 3, 7, 1, 6, 4]);`,
            },
            notas: {
              es: "- Después de cada renglón, los primeros `i + 1` ya están en su lugar **definitivo**: a diferencia de inserción, ya no se mueven.\n- 28 comparaciones, las mismas que burbuja, y sólo 7 intercambios.",
              en: "- After each line, the first `i + 1` are already in their **final** place: unlike insertion sort, they never move again.\n- 28 comparisons, the same as bubble sort, and only 7 swaps.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Siempre el mismo trabajo", en: "Always the same work" },
          texto: {
            es: "Selección no se da cuenta de nada: aunque la lista ya venga ordenada, revisa todo lo que falta en cada vuelta. Siempre son **n(n - 1)/2 comparaciones**: O(n²) en el mejor y en el peor caso.\n\nSu ventaja es otra: hace a lo mucho **n - 1 intercambios**, muchísimos menos que burbuja. Cuando escribir cuesta mucho más que leer (por ejemplo, en una memoria que se desgasta al escribir), eso importa.",
            en: "Selection sort doesn't notice anything: even if the list is already sorted, it checks everything that's left on every pass. It's always **n(n - 1)/2 comparisons**: O(n²) in the best and the worst case.\n\nIts strength is something else: it makes at most **n - 1 swaps**, far fewer than bubble sort. When writing costs much more than reading (say, memory that wears out as you write to it), that matters.",
          },
          programa: {
            codigo: {
              es: `function cuenta(a) {
  let comparaciones = 0, intercambios = 0;
  for (let i = 0; i < a.length - 1; i++) {
    let min = i;
    for (let j = i + 1; j < a.length; j++) {
      comparaciones++;
      if (a[j] < a[min]) min = j;
    }
    [a[i], a[min]] = [a[min], a[i]];
    intercambios++;
  }
  return comparaciones + " comparaciones, " + intercambios + " intercambios";
}

const ordenada = Array.from({ length: 1000 }, (_, i) => i + 1);
console.log("ordenada:", cuenta(ordenada));
console.log("al revés:", cuenta([...ordenada].reverse()));`,
              en: `function cuenta(a) {
  let comparaciones = 0, intercambios = 0;
  for (let i = 0; i < a.length - 1; i++) {
    let min = i;
    for (let j = i + 1; j < a.length; j++) {
      comparaciones++;
      if (a[j] < a[min]) min = j;
    }
    [a[i], a[min]] = [a[min], a[i]];
    intercambios++;
  }
  return comparaciones + " comparisons, " + intercambios + " swaps";
}

const ordenada = Array.from({ length: 1000 }, (_, i) => i + 1);
console.log("sorted:  ", cuenta(ordenada));
console.log("reversed:", cuenta([...ordenada].reverse()));`,
            },
            notas: {
              es: "- Ordenada o al revés, hace exactamente lo mismo: 499 500 comparaciones y 999 intercambios.\n- Inserción, con la lista ordenada, hacía 999 comparaciones y ningún movimiento.",
              en: "- Sorted or reversed, it does exactly the same: 499,500 comparisons and 999 swaps.\n- Insertion sort, on the sorted list, made 999 comparisons and no moves.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "Después de la **primera** vuelta de selección sobre `[4, 1, 3, 2]`, ¿cómo queda?", en: "After the **first** selection sort pass over `[4, 1, 3, 2]`, what does it look like?" },
          opciones: ["[ 1, 4, 3, 2 ]", "[ 1, 2, 3, 4 ]", "[ 1, 3, 2, 4 ]", "[ 4, 1, 3, 2 ]"],
          correcta: 0,
          porque: {
            es: "El mínimo es el 1, en la casilla 1, y se cambia con la casilla 0. Lo demás queda igual hasta la siguiente vuelta.",
            en: "The minimum is the 1, in slot 1, and it swaps with slot 0. Everything else stays the same until the next pass.",
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Cuántas comparaciones hace con 10 números que **ya están ordenados**?", en: "How many comparisons does it make with 10 numbers that are **already sorted**?" },
          opciones: ["9", "10", "45", "90"],
          correcta: 2,
          porque: {
            es: "9 + 8 + … + 1 = 45. Selección no sabe que ya están en orden: revisa todo de todos modos.",
            en: "9 + 8 + … + 1 = 45. Selection sort doesn't know they're already in order: it checks everything anyway.",
          },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa la vuelta que busca el mínimo.", en: "Fill in the loop that finds the minimum." },
          codigo: "let min = i;\nfor (let j = i + 1; j < n; j++) {\n  if (a[j] < a[___]) min = ___;\n}",
          huecos: ["min", "j"],
          banco: ["min", "j", "i", "n"],
          porque: {
            es: "Se compara con el mínimo visto hasta ahora, `a[min]`; si `a[j]` es menor, ahora el mínimo está en `j`.",
            en: "It compares against the smallest seen so far, `a[min]`; if `a[j]` is smaller, the minimum is now at `j`.",
          },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `posicionDelMinimo(a, desde)`: devuelve el índice del número más chico de `a`, buscando desde la casilla `desde` hasta el final. Si hay empate, el primero.",
            en: "Write `posicionDelMinimo(a, desde)`: return the index of the smallest number in `a`, searching from slot `desde` to the end. On a tie, the first one.",
          },
          inicial: {
            es: "function posicionDelMinimo(a, desde) {\n  let min = desde;\n  // revisa desde + 1 hasta el final\n  return min;\n}\n\nconsole.log(posicionDelMinimo([5, 2, 8, 1, 6], 0));",
            en: "function posicionDelMinimo(a, desde) {\n  let min = desde;\n  // check from desde + 1 to the end\n  return min;\n}\n\nconsole.log(posicionDelMinimo([5, 2, 8, 1, 6], 0));",
          },
          pruebas: [
            { llamada: "posicionDelMinimo([5, 2, 8, 1, 6], 0)", espera: "3" },
            { llamada: "posicionDelMinimo([5, 2, 8, 1, 6], 4)", espera: "4" },
            { llamada: "posicionDelMinimo([3, 1, 2, 1], 0)", espera: "1" },
            { llamada: "posicionDelMinimo([9, 7, 8], 1)", espera: "1" },
          ],
          solucion: "function posicionDelMinimo(a, desde) {\n  let min = desde;\n  for (let j = desde + 1; j < a.length; j++) {\n    if (a[j] < a[min]) min = j;\n  }\n  return min;\n}",
          porque: {
            es: "Es la vuelta de adentro de selección. Con `<` (y no `<=`) se queda con el primero de los empatados: en `[3, 1, 2, 1]` responde 1, no 3.",
            en: "It's selection sort's inner loop. With `<` (not `<=`) it keeps the first of the tied ones: for `[3, 1, 2, 1]` it answers 1, not 3.",
          },
        },
      ],
    },
    {
      id: "mezcla",
      titulo: { es: "Ordenamiento por mezcla", en: "Merge sort" },
      resumen: {
        es: "Parte a la mitad, ordena cada mitad con la misma función y mezcla las dos: O(n log n), a cambio de memoria extra.",
        en: "Split in half, sort each half with the same function and merge them: O(n log n), at the cost of extra memory.",
      },
      retos: ["merge-two-sorted-lists", "merge-intervals"],
      enlaces: [VISUALGO, { url: "/aprende/estructuras-de-datos/divide-y-venceras", texto: { es: "Divide y vencerás, en estructuras de datos", en: "Divide and conquer, in data structures" } }],
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Divide y vencerás", en: "Divide and conquer" },
          texto: {
            es: "Burbuja, inserción y selección comparan casi todo contra todo: O(n²). El **ordenamiento por mezcla** (*merge sort*) lo baja partiendo el problema. Un arreglo de un solo número ya está ordenado; uno más grande se parte en dos mitades, cada mitad se ordena **con la misma función** y luego las dos mitades ordenadas se **mezclan**.\n\nMezclar es fácil porque las dos ya vienen en orden: se comparan sus cabezas y se toma la menor, como juntar dos montones de cartas boca arriba. En el programa, `i` y `j` son las cabezas de `a` y `b`, y `k` es la casilla de `v` que toca escribir.",
            en: "Bubble, insertion and selection sort compare almost everything against everything: O(n²). **Merge sort** brings that down by splitting the problem. An array with a single number is already sorted; a bigger one is split into two halves, each half is sorted **with the same function**, and then the two sorted halves are **merged**.\n\nMerging is easy because both already come in order: compare their heads and take the smaller one, like combining two face-up piles of cards. In the program, `i` and `j` are the heads of `a` and `b`, and `k` is the slot of `v` to write next.",
          },
          programa: {
            codigo: MEZCLA + "\n\nconst lista = [5, 2, 8, 3, 7, 1, 6, 4];\nconsole.log(mezcla(lista));",
            notas: {
              es: "- `slice` hace copias: las mitades `a` y `b` se ordenan aparte y el resultado se escribe de vuelta en `v`.\n- Cuando `a` se acaba, `a[i]` es `undefined` y `a[i] <= b[j]` da `false`: se toma de `b`. Cuando `b` se acaba, `j >= b.length` toma de `a` sin comparar.",
              en: "- `slice` makes copies: the halves `a` and `b` are sorted separately and the result is written back into `v`.\n- When `a` runs out, `a[i]` is `undefined` and `a[i] <= b[j]` is `false`: it takes from `b`. When `b` runs out, `j >= b.length` takes from `a` without comparing.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Mezcla por mezcla", en: "Merge by merge" },
          texto: {
            es: "La misma función, que imprime cada mezcla y cuenta las comparaciones entre dos números (las que se hacen mientras quedan cabezas en las dos mitades).",
            en: "The same function, printing every merge and counting the comparisons between two numbers (the ones made while both halves still have heads).",
          },
          programa: {
            codigo: {
              es: `let comparaciones = 0;
function mezcla(v) {
  if (v.length < 2) return v;
  const m = Math.floor(v.length / 2);
  const a = mezcla(v.slice(0, m));
  const b = mezcla(v.slice(m));
  let i = 0, j = 0;
  for (let k = 0; k < v.length; k++) {
    if (i < a.length && j < b.length) comparaciones++;
    if (j >= b.length || a[i] <= b[j]) v[k] = a[i++];
    else v[k] = b[j++];
  }
  console.log(a.join(" "), "+", b.join(" "), "→", v.join(" "));
  return v;
}

mezcla([5, 2, 8, 3, 7, 1, 6, 4]);
console.log("comparaciones:", comparaciones);`,
              en: `let comparaciones = 0;
function mezcla(v) {
  if (v.length < 2) return v;
  const m = Math.floor(v.length / 2);
  const a = mezcla(v.slice(0, m));
  const b = mezcla(v.slice(m));
  let i = 0, j = 0;
  for (let k = 0; k < v.length; k++) {
    if (i < a.length && j < b.length) comparaciones++;
    if (j >= b.length || a[i] <= b[j]) v[k] = a[i++];
    else v[k] = b[j++];
  }
  console.log(a.join(" "), "+", b.join(" "), "→", v.join(" "));
  return v;
}

mezcla([5, 2, 8, 3, 7, 1, 6, 4]);
console.log("comparisons:", comparaciones);`,
            },
            notas: {
              es: "- Siete mezclas: cuatro de pares, dos de cuatro números y una de ocho.\n- 17 comparaciones, contra las 28 de burbuja.",
              en: "- Seven merges: four of pairs, two of four numbers and one of eight.\n- 17 comparisons, against bubble sort's 28.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Por qué n log n", en: "Why n log n" },
          texto: {
            es: "Cuenta por niveles. Partir a la mitad una y otra vez da unos **log₂ n niveles** (con 8 números, 3). En cada nivel, entre todas las mezclas se escribe cada número una vez: **n** pasos por nivel. Total: **n log n**.\n\nCon 1 000 números al azar son unas 8 700 comparaciones, contra 499 500 de burbuja. El precio: las copias de `slice` ocupan **memoria extra**, tanta como el arreglo. `sort` de JavaScript es de esta familia.",
            en: "Count by levels. Halving over and over gives about **log₂ n levels** (3 with 8 numbers). On each level, across all the merges, every number is written once: **n** steps per level. Total: **n log n**.\n\nWith 1,000 random numbers that's about 8,700 comparisons, against bubble sort's 499,500. The price: the `slice` copies take **extra memory**, as much as the array. JavaScript's `sort` belongs to this family.",
          },
          programa: {
            codigo: {
              es: `let c = 0;
function mezcla(v) {
  if (v.length < 2) return v;
  const m = Math.floor(v.length / 2);
  const a = mezcla(v.slice(0, m));
  const b = mezcla(v.slice(m));
  let i = 0, j = 0;
  for (let k = 0; k < v.length; k++) {
    if (i < a.length && j < b.length) c++;
    if (j >= b.length || a[i] <= b[j]) v[k] = a[i++];
    else v[k] = b[j++];
  }
  return v;
}

// números al azar: siempre los mismos, porque la semilla es fija
${AL_AZAR}

for (const n of [100, 1000]) {
  c = 0;
  mezcla(alAzar(n));
  console.log(n, "números:", c, "comparaciones; burbuja:", n * (n - 1) / 2);
}`,
              en: `let c = 0;
function mezcla(v) {
  if (v.length < 2) return v;
  const m = Math.floor(v.length / 2);
  const a = mezcla(v.slice(0, m));
  const b = mezcla(v.slice(m));
  let i = 0, j = 0;
  for (let k = 0; k < v.length; k++) {
    if (i < a.length && j < b.length) c++;
    if (j >= b.length || a[i] <= b[j]) v[k] = a[i++];
    else v[k] = b[j++];
  }
  return v;
}

// random numbers: always the same ones, because the seed is fixed
${AL_AZAR}

for (const n of [100, 1000]) {
  c = 0;
  mezcla(alAzar(n));
  console.log(n, "numbers:", c, "comparisons; bubble sort:", n * (n - 1) / 2);
}`,
            },
            notas: {
              es: "- Con 100 números, 542 comparaciones contra 4 950; con 1 000, 8 714 contra 499 500.\n- Por cada 10 veces más datos, burbuja trabaja 100 veces más; la mezcla, unas 16.",
              en: "- With 100 numbers, 542 comparisons against 4,950; with 1,000, 8,714 against 499,500.\n- For every 10 times more data, bubble sort does 100 times the work; merge sort, about 16.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Cuántos niveles de mezclas hay con 8 números?", en: "How many levels of merges are there with 8 numbers?" },
          opciones: ["2", "3", "4", "8"],
          correcta: 1,
          porque: {
            es: "8 → 4 → 2 → 1: se parte tres veces, así que hay tres niveles de mezclas (de pares, de cuatro y de ocho). Es log₂ 8 = 3.",
            en: "8 → 4 → 2 → 1: it splits three times, so there are three levels of merges (pairs, fours and eights). That's log₂ 8 = 3.",
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué necesita la mezcla que burbuja no?", en: "What does merge sort need that bubble sort doesn't?" },
          opciones: [
            { es: "Memoria extra para las mitades", en: "Extra memory for the halves" },
            { es: "Que los números sean distintos", en: "Numbers that are all different" },
            { es: "Que la lista venga casi ordenada", en: "A nearly sorted list" },
            { es: "Un pivote", en: "A pivot" },
          ],
          correcta: 0,
          porque: {
            es: "Las copias de `slice` (o un arreglo auxiliar) ocupan tanto como el arreglo. Burbuja, inserción y selección ordenan en su lugar, sin memoria extra.",
            en: "The `slice` copies (or a helper array) take as much space as the array. Bubble, insertion and selection sort work in place, with no extra memory.",
          },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa la mezcla: toma de `a` si `b` ya se acabó o si la cabeza de `a` es menor o igual.", en: "Fill in the merge: take from `a` if `b` has run out or if the head of `a` is smaller or equal." },
          codigo: "for (let k = 0; k < v.length; k++) {\n  if (j >= b.___ || a[i] <= b[j])\n    v[k] = a[___];\n  else v[k] = b[j++];\n}",
          huecos: ["length", "i++"],
          banco: ["length", "i++", "j++", "k"],
          porque: {
            es: "Si `b` se acabó (`j >= b.length`) o la cabeza de `a` gana, se escribe `a[i]` y se avanza `i`; si no, se escribe la cabeza de `b`.",
            en: "If `b` has run out (`j >= b.length`) or the head of `a` wins, `a[i]` is written and `i` moves on; otherwise, the head of `b` is written.",
          },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `mezclar(a, b)`: recibe dos arreglos ordenados y devuelve uno nuevo, ordenado, con todos sus números.",
            en: "Write `mezclar(a, b)`: take two sorted arrays and return a new one, sorted, with all their numbers.",
          },
          inicial: {
            es: "function mezclar(a, b) {\n  const r = [];\n  // compara las cabezas y toma la menor; al final, lo que sobre\n  return r;\n}\n\nconsole.log(mezclar([1, 4, 9], [2, 3, 10]));",
            en: "function mezclar(a, b) {\n  const r = [];\n  // compare the heads and take the smaller one; at the end, whatever is left\n  return r;\n}\n\nconsole.log(mezclar([1, 4, 9], [2, 3, 10]));",
          },
          pruebas: [
            { llamada: "mezclar([1, 4, 9], [2, 3, 10])", espera: "[1,2,3,4,9,10]" },
            { llamada: "mezclar([], [1, 2])", espera: "[1,2]" },
            { llamada: "mezclar([5], [])", espera: "[5]" },
            { llamada: "mezclar([1, 1], [1])", espera: "[1,1,1]" },
          ],
          solucion: "function mezclar(a, b) {\n  const r = [];\n  let i = 0, j = 0;\n  while (i < a.length && j < b.length) {\n    if (a[i] <= b[j]) r.push(a[i++]);\n    else r.push(b[j++]);\n  }\n  return r.concat(a.slice(i), b.slice(j));\n}",
          porque: {
            es: "Mientras haya cabezas en los dos, la menor pasa al resultado. Cuando uno se acaba, lo que queda del otro ya está ordenado y va completo al final. Son a lo mucho `a.length + b.length - 1` comparaciones.",
            en: "While both have heads, the smaller one goes into the result. When one runs out, what's left of the other is already sorted and goes to the end whole. That's at most `a.length + b.length - 1` comparisons.",
          },
        },
      ],
    },
    {
      id: "rapido",
      titulo: { es: "Ordenamiento rápido (quicksort)", en: "Quicksort" },
      resumen: {
        es: "Elige un pivote, deja a los menores a su izquierda y repite con cada lado: O(n log n) en promedio, sin memoria extra; O(n²) con un mal pivote.",
        en: "Pick a pivot, put the smaller ones to its left and repeat on each side: O(n log n) on average, with no extra memory; O(n²) with a bad pivot.",
      },
      retos: ["kth-largest-element-in-an-array"],
      enlaces: [VISUALGO],
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Un pivote", en: "A pivot" },
          texto: {
            es: "El **ordenamiento rápido** (*quicksort*) también divide, pero al revés que la mezcla: primero acomoda y después parte. Elige un **pivote** (aquí, el último del tramo) y recorre el tramo dejando a la izquierda a todos los menores que él. Al final mete al pivote justo después de ellos: ésa es su casilla definitiva. Luego repite lo mismo, por separado, con lo de su izquierda y lo de su derecha.\n\nEn el programa, `j` recorre el tramo e `i` marca dónde va el siguiente menor; a esto se le llama **partición de Lomuto**. La función recibe el tramo (`ini` y `fin`), así que la primera llamada es `rapido(a, 0, a.length - 1)`.",
            en: "**Quicksort** also divides, but the other way around from merge sort: it arranges first and splits afterwards. It picks a **pivot** (here, the last one in the range) and walks the range, leaving every number smaller than it on the left. At the end it drops the pivot right after them: that's its final slot. Then it repeats the same thing, separately, on what's to its left and what's to its right.\n\nIn the program, `j` walks the range and `i` marks where the next smaller number goes; this is called the **Lomuto partition**. The function takes the range (`ini` and `fin`), so the first call is `rapido(a, 0, a.length - 1)`.",
          },
          dibujo: { tipo: "arreglo", valores: [5, 2, 8, 3, 7, 1, 6, 4], resalta: [7], punteros: [{ i: 0, texto: "i, j" }, { i: 7, texto: "p" }] },
          programa: {
            codigo: RAPIDO + "\n\nconst lista = [5, 2, 8, 3, 7, 1, 6, 4];\nrapido(lista, 0, lista.length - 1);\nconsole.log(lista);",
            notas: {
              es: "- No devuelve nada: ordena el arreglo en su lugar, sin copias.\n- El intercambio va en una línea, con desestructuración: `[a[i], a[j]] = [a[j], a[i]]`.",
              en: "- It returns nothing: it sorts the array in place, with no copies.\n- The swap fits on one line with destructuring: `[a[i], a[j]] = [a[j], a[i]]`.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "La partición, paso a paso", en: "The partition, step by step" },
          texto: {
            es: "Sólo la primera partición, con el 4 como pivote: imprime el arreglo después de revisar cada `j` y dice si era menor que el pivote.",
            en: "Just the first partition, with 4 as the pivot: it prints the array after checking each `j` and says whether it was smaller than the pivot.",
          },
          programa: {
            codigo: {
              es: `function particion(a, ini, fin) {
  const p = a[fin];
  let i = ini;
  for (let j = ini; j < fin; j++) {
    const menor = a[j] < p;
    if (menor) {
      [a[i], a[j]] = [a[j], a[i]];
      i++;
    }
    console.log("j =", j, menor ? "menor" : "mayor", "→", ...a);
  }
  [a[i], a[fin]] = [a[fin], a[i]];
  console.log("el pivote", p, "queda en la casilla", i, "→", ...a);
}

particion([5, 2, 8, 3, 7, 1, 6, 4], 0, 7);`,
              en: `function particion(a, ini, fin) {
  const p = a[fin];
  let i = ini;
  for (let j = ini; j < fin; j++) {
    const menor = a[j] < p;
    if (menor) {
      [a[i], a[j]] = [a[j], a[i]];
      i++;
    }
    console.log("j =", j, menor ? "smaller" : "bigger", "→", ...a);
  }
  [a[i], a[fin]] = [a[fin], a[i]];
  console.log("pivot", p, "lands in slot", i, "→", ...a);
}

particion([5, 2, 8, 3, 7, 1, 6, 4], 0, 7);`,
            },
            notas: {
              es: "- Los menores que 4 (el 2, el 3 y el 1) van quedando juntos al principio.\n- Al final, el 4 se cambia con el primero de los mayores y queda en la casilla 3: a su izquierda sólo hay menores; a su derecha, sólo mayores. Ya no se mueve.",
              en: "- The ones smaller than 4 (the 2, the 3 and the 1) gather together at the front.\n- At the end, the 4 swaps with the first of the bigger ones and lands in slot 3: only smaller numbers to its left, only bigger ones to its right. It never moves again.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Promedio y peor caso", en: "Average and worst case" },
          texto: {
            es: "Si el pivote parte el tramo más o menos a la mitad, hay unos log n niveles y cada uno recorre n números: **O(n log n)**, como la mezcla, pero sin memoria extra y con muy poco trabajo por paso. Por eso tantas bibliotecas lo usan, con variantes, por dentro.\n\nEl riesgo es el pivote: si siempre es el mayor (o el menor), cada partición sólo quita un número y vuelve a ser **O(n²)**. Con el último como pivote, eso pasa justo con una lista ya ordenada. Las versiones de verdad eligen mejor el pivote: al azar, o la mediana de tres.",
            en: "If the pivot splits the range roughly in half, there are about log n levels and each one walks n numbers: **O(n log n)**, like merge sort, but with no extra memory and very little work per step. That's why so many libraries use it, in some variant, under the hood.\n\nThe risk is the pivot: if it's always the biggest (or the smallest), each partition removes just one number and it's back to **O(n²)**. With the last one as the pivot, that happens exactly on an already sorted list. Real implementations pick the pivot better: at random, or the median of three.",
          },
          programa: {
            codigo: {
              es: `let c = 0;
function rapido(a, ini, fin) {
  if (ini >= fin) return;
  const p = a[fin];
  let i = ini;
  for (let j = ini; j < fin; j++) {
    c++;
    if (a[j] < p) {
      [a[i], a[j]] = [a[j], a[i]];
      i++;
    }
  }
  [a[i], a[fin]] = [a[fin], a[i]];
  rapido(a, ini, i - 1);
  rapido(a, i + 1, fin);
}

// números al azar: siempre los mismos, porque la semilla es fija
${AL_AZAR}

for (const n of [100, 1000]) {
  c = 0;
  rapido(alAzar(n), 0, n - 1);
  console.log(n, "al azar:", c, "comparaciones");
}
c = 0;
rapido(Array.from({ length: 1000 }, (_, i) => i + 1), 0, 999);
console.log("1000 ya ordenados:", c, "comparaciones");`,
              en: `let c = 0;
function rapido(a, ini, fin) {
  if (ini >= fin) return;
  const p = a[fin];
  let i = ini;
  for (let j = ini; j < fin; j++) {
    c++;
    if (a[j] < p) {
      [a[i], a[j]] = [a[j], a[i]];
      i++;
    }
  }
  [a[i], a[fin]] = [a[fin], a[i]];
  rapido(a, ini, i - 1);
  rapido(a, i + 1, fin);
}

// random numbers: always the same ones, because the seed is fixed
${AL_AZAR}

for (const n of [100, 1000]) {
  c = 0;
  rapido(alAzar(n), 0, n - 1);
  console.log(n, "random:", c, "comparisons");
}
c = 0;
rapido(Array.from({ length: 1000 }, (_, i) => i + 1), 0, 999);
console.log("1000 already sorted:", c, "comparisons");`,
            },
            notas: {
              es: "- Al azar: 690 comparaciones con 100 números y unas 10 800 con 1 000, cerca de las 8 700 de la mezcla.\n- Ya ordenados: 499 500, lo mismo que burbuja. Cada partición deja todo de un lado del pivote.",
              en: "- Random: 690 comparisons with 100 numbers and about 10,800 with 1,000, close to merge sort's 8,700.\n- Already sorted: 499,500, the same as bubble sort. Every partition leaves everything on one side of the pivot.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "Al partir `[3, 1, 4, 2]` con el último (2) como pivote, ¿cómo queda?", en: "Partitioning `[3, 1, 4, 2]` with the last one (2) as the pivot, what do you get?" },
          opciones: ["[ 1, 2, 4, 3 ]", "[ 1, 2, 3, 4 ]", "[ 2, 1, 3, 4 ]", "[ 1, 3, 4, 2 ]"],
          correcta: 0,
          porque: {
            es: "Sólo el 1 es menor que 2: va a la casilla 0. Luego el 2 se cambia con la casilla 1 (donde estaba el 3) y queda en su lugar. El 4 y el 3 se ordenan en la siguiente llamada.",
            en: "Only the 1 is smaller than 2: it goes to slot 0. Then the 2 swaps with slot 1 (where the 3 was) and lands in place. The 4 and the 3 get sorted in the next call.",
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Con cuál de estas listas tarda más este quicksort, con el último como pivote?", en: "Which of these lists is slowest for this quicksort, with the last one as the pivot?" },
          opciones: [
            { es: "Una lista ya ordenada", en: "An already sorted list" },
            { es: "Una lista al azar", en: "A random list" },
            { es: "Una lista con el mayor a la mitad", en: "A list with the biggest in the middle" },
            { es: "Tardan lo mismo", en: "They all take the same" },
          ],
          correcta: 0,
          porque: {
            es: "Con la lista ordenada, el último siempre es el mayor: cada partición deja todo a su izquierda y sólo quita un número. Son n(n - 1)/2 comparaciones, O(n²).",
            en: "On a sorted list the last one is always the biggest: every partition leaves everything on its left and removes just one number. That's n(n - 1)/2 comparisons, O(n²).",
          },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa la partición.", en: "Fill in the partition." },
          codigo: "for (let j = ini; j < fin; j++) {\n  if (a[j] < ___) {\n    [a[i], a[j]] = [a[j], a[i]];\n    ___;\n  }\n}",
          huecos: ["p", "i++"],
          banco: ["p", "i++", "j++", "a[i]"],
          porque: {
            es: "Se compara con el pivote `p`; si es menor, se cambia a la casilla `i` y el límite de los menores avanza uno.",
            en: "Compare against the pivot `p`; if it's smaller, swap it into slot `i` and move the boundary of the smaller ones forward by one.",
          },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `particion(a)`: usa el último número como pivote, deja a la izquierda a los menores, pone el pivote justo después de ellos y devuelve su casilla.",
            en: "Write `particion(a)`: use the last number as the pivot, leave the smaller ones on the left, put the pivot right after them and return its slot.",
          },
          inicial: {
            es: "function particion(a) {\n  const fin = a.length - 1;\n  const p = a[fin];\n  let i = 0;\n  // recorre con j; al final, cambia a[i] con a[fin]\n  return i;\n}\n\nconsole.log(particion([3, 1, 4, 2]));",
            en: "function particion(a) {\n  const fin = a.length - 1;\n  const p = a[fin];\n  let i = 0;\n  // walk with j; at the end, swap a[i] with a[fin]\n  return i;\n}\n\nconsole.log(particion([3, 1, 4, 2]));",
          },
          pruebas: [
            { llamada: "particion([3, 1, 4, 2])", espera: "1" },
            { llamada: "(() => { const a = [3, 1, 4, 2]; const k = particion(a); return a[k] === 2 && a.slice(0, k).every((x) => x < 2) && a.slice(k + 1).every((x) => x >= 2); })()", espera: "true" },
            { llamada: "particion([1, 2, 3])", espera: "2" },
            { llamada: "particion([5, 6, 1])", espera: "0" },
          ],
          solucion: "function particion(a) {\n  const fin = a.length - 1;\n  const p = a[fin];\n  let i = 0;\n  for (let j = 0; j < fin; j++) {\n    if (a[j] < p) {\n      [a[i], a[j]] = [a[j], a[i]];\n      i++;\n    }\n  }\n  [a[i], a[fin]] = [a[fin], a[i]];\n  return i;\n}",
          porque: {
            es: "Todo lo que queda antes de `i` es menor que el pivote; por eso, al cambiarlo a la casilla `i`, ya está en su lugar definitivo. La segunda prueba revisa justo eso, sin importar cómo quedaron acomodados los demás.",
            en: "Everything before `i` is smaller than the pivot; so once it's swapped into slot `i`, it's in its final place. The second test checks exactly that, no matter how the others ended up.",
          },
        },
      ],
    },
  ],
};
