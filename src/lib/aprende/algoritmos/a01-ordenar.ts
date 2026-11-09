import type { Unidad } from "../tipos";

/**
 * El código de la lección es el mismo del Short de «Algoritmos en pixel»
 * (tools/comerciales/algoritmos/burbuja.py, CODIGO): si cambia uno, cambia el
 * otro. Ninguna línea pasa de 37 caracteres, para que en el vídeo se lea en
 * el teléfono.
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
  ],
};
