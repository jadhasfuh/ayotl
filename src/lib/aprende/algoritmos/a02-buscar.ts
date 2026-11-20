import type { Unidad } from "../tipos";

/**
 * El código de la búsqueda binaria es el mismo de su Short de «Algoritmos en
 * pixel» (tools/comerciales/algoritmos/busqueda.py, CODIGO): si cambia uno,
 * cambia el otro. En el vídeo, la línea de `medio` va partida en dos porque no
 * cabe en el teléfono.
 */
const BUSCAR = `function buscar(a, x) {
  let izq = 0, der = a.length - 1;
  while (izq <= der) {
    const medio = Math.floor((izq + der) / 2);
    if (a[medio] === x) return medio;
    if (a[medio] < x) izq = medio + 1;
    else der = medio - 1;
  }
  return -1;
}`;

/** La lista del vídeo: 16 números ordenados; el 63 está en la casilla 10. */
const LISTA = "const lista = [4, 9, 13, 18, 25, 31, 37, 42, 50, 56, 63, 71, 77, 84, 90, 97];";
const VALORES = [4, 9, 13, 18, 25, 31, 37, 42, 50, 56, 63, 71, 77, 84, 90, 97];

export const A02: Unidad = {
  id: "buscar",
  titulo: { es: "Buscar", en: "Searching" },
  lecciones: [
    {
      id: "busqueda-binaria",
      video: { es: { id: "ssRF3DRswto", desde: "2026-11-24T16:00:00-06:00" }, en: { id: "7CwrCy4mF_8", desde: "2026-11-24T16:20:00-06:00" } },
      titulo: { es: "Búsqueda binaria", en: "Binary search" },
      resumen: {
        es: "Mirar el de en medio y tirar la mitad donde no puede estar: un millón de datos ordenados en 20 miradas, O(log n).",
        en: "Look at the middle one and throw away the half where it can't be: a million sorted items in 20 looks, O(log n).",
      },
      retos: ["search-in-rotated-sorted-array"],
      enlaces: [
        { url: "https://es.wikipedia.org/wiki/B%C3%BAsqueda_binaria", texto: { es: "Búsqueda binaria (Wikipedia)", en: "Binary search (Wikipedia, Spanish)" } },
        { url: "/aprende/estructuras-de-datos/divide-y-venceras", texto: { es: "La versión recursiva, en «Divide y vencerás»", en: "The recursive version, in \"Divide and conquer\"" } },
      ],
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Buscar: uno por uno", en: "Searching: one by one" },
          texto: {
            es: "Para saber si un número está en una lista, lo más directo es **mirar uno por uno** desde el principio hasta encontrarlo o hasta que se acabe la lista. Es la **búsqueda lineal**, y es lo que hacen por dentro `indexOf` e `includes` de JavaScript.\n\nFunciona con cualquier lista, ordenada o no. El problema es el tamaño: si lo que buscas está al final (o no está), hay que mirar los `n`. Es **O(n)**: con un millón de datos, un millón de miradas.",
            en: "To find out whether a number is in a list, the most direct way is to **look at them one by one** from the start until you find it or the list runs out. That's **linear search**, and it's what JavaScript's `indexOf` and `includes` do under the hood.\n\nIt works on any list, sorted or not. The problem is size: if what you want is at the end (or isn't there), you have to look at all `n`. It's **O(n)**: with a million items, a million looks.",
          },
          dibujo: { tipo: "arreglo", valores: VALORES, indices: true },
          programa: {
            codigo: {
              es: `function lineal(a, x) {\n  for (let i = 0; i < a.length; i++) {\n    if (a[i] === x) return i;\n  }\n  return -1;\n}\n\n${LISTA}\nconsole.log(lineal(lista, 63));\nconsole.log(lineal(lista, 60));\n\n// indexOf hace lo mismo\nconsole.log(lista.indexOf(63));`,
              en: `function lineal(a, x) {\n  for (let i = 0; i < a.length; i++) {\n    if (a[i] === x) return i;\n  }\n  return -1;\n}\n\n${LISTA}\nconsole.log(lineal(lista, 63));\nconsole.log(lineal(lista, 60));\n\n// indexOf does the same\nconsole.log(lista.indexOf(63));`,
            },
            notas: {
              es: "- El 63 está en la casilla 10: para llegar a él, miró **11** números.\n- El 60 no está: sale −1 después de mirar los **16**.\n- `-1` es la costumbre para decir «no está», porque ninguna casilla es negativa.",
              en: "- 63 is in slot 10: to get there, it looked at **11** numbers.\n- 60 isn't there: it returns −1 after looking at all **16**.\n- `-1` is the usual way to say \"not found\", since no slot is negative.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "La idea: mirar en medio", en: "The idea: look in the middle" },
          texto: {
            es: "Si alguien piensa un número del 1 al 100 y te contesta «más alto» o «más bajo», no preguntas 1, 2, 3…: dices 50, y con una respuesta descartas la mitad. Así se adivina cualquiera en **7 preguntas** o menos. Eso es la **búsqueda binaria**.\n\nCon una lista **ordenada** pasa lo mismo. Dos índices, `izq` y `der`, marcan el tramo donde todavía puede estar. Se mira el de en medio: si es, listo; si es **menor** que `x`, todo lo de su izquierda también es menor y sobra (`izq = medio + 1`); si es **mayor**, sobra todo lo de su derecha (`der = medio - 1`). Cuando `izq` rebasa a `der`, el tramo quedó vacío: no está.",
            en: "If someone thinks of a number from 1 to 100 and answers \"higher\" or \"lower\", you don't ask 1, 2, 3…: you say 50, and one answer throws away half. That way you can guess any of them in **7 questions** or fewer. That's **binary search**.\n\nA **sorted** list works the same way. Two indices, `izq` (left) and `der` (right), mark the range where it can still be. You look at the middle one: if it's the one, done; if it's **smaller** than `x`, everything to its left is smaller too and can go (`izq = medio + 1`); if it's **bigger**, everything to its right goes (`der = medio - 1`). When `izq` passes `der`, the range is empty: it's not there.",
          },
          dibujo: { tipo: "arreglo", valores: VALORES, resalta: [7], punteros: [{ i: 0, texto: "izq" }, { i: 7, texto: "medio" }, { i: 15, texto: "der" }] },
          programa: {
            codigo: `${BUSCAR}\n\n${LISTA}\nconsole.log(buscar(lista, 63));\nconsole.log(buscar(lista, 60));`,
            notas: {
              es: "- Devuelve lo mismo que la búsqueda lineal: 10 para el 63 y −1 para el 60.\n- `Math.floor` redondea hacia abajo: con `izq = 0` y `der = 15`, el de en medio es el 7.",
              en: "- It returns the same as linear search: 10 for 63 and −1 for 60.\n- `Math.floor` rounds down: with `izq = 0` and `der = 15`, the middle one is 7.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Mirada por mirada", en: "Look by look" },
          texto: {
            es: "La misma función, ahora diciendo qué mira en cada vuelta. Buscando el 63: el de en medio es el 42 (chico: se va la izquierda), luego el 71 (grande: se va la derecha), el 56 (chico) y el 63. **Cuatro miradas**, contra las 11 de uno por uno.\n\nCon el 60, que no está, también son cuatro: después de mirar el 63, `der` queda antes que `izq` y el ciclo se acaba.",
            en: "The same function, now saying what it looks at on each turn. Searching for 63: the middle one is 42 (too small: the left goes), then 71 (too big: the right goes), 56 (too small) and 63. **Four looks**, against 11 one by one.\n\nWith 60, which isn't there, it's also four: after looking at 63, `der` ends up before `izq` and the loop is over.",
          },
          programa: {
            codigo: {
              es: `function buscar(a, x) {\n  let izq = 0, der = a.length - 1;\n  let miradas = 0;\n  while (izq <= der) {\n    const medio = Math.floor((izq + der) / 2);\n    miradas++;\n    console.log("mirada", miradas, "| izq", izq, "der", der, "| medio", medio, "→", a[medio]);\n    if (a[medio] === x) return medio;\n    if (a[medio] < x) izq = medio + 1;\n    else der = medio - 1;\n  }\n  return -1;\n}\n\n${LISTA}\nconsole.log("el 63 está en", buscar(lista, 63));\nconsole.log("el 60 está en", buscar(lista, 60));`,
              en: `function buscar(a, x) {\n  let izq = 0, der = a.length - 1;\n  let miradas = 0;\n  while (izq <= der) {\n    const medio = Math.floor((izq + der) / 2);\n    miradas++;\n    console.log("look", miradas, "| izq", izq, "der", der, "| medio", medio, "→", a[medio]);\n    if (a[medio] === x) return medio;\n    if (a[medio] < x) izq = medio + 1;\n    else der = medio - 1;\n  }\n  return -1;\n}\n\n${LISTA}\nconsole.log("63 is at", buscar(lista, 63));\nconsole.log("60 is at", buscar(lista, 60));`,
            },
            notas: {
              es: "- Mira cómo se cierran `izq` y `der`: de 0–15 a 8–15, 8–10, 10–10.\n- Cambia el número que se busca: ninguno de los 16 necesita más de 5 miradas.",
              en: "- Watch `izq` and `der` close in: from 0–15 to 8–15, 8–10, 10–10.\n- Change the number you search for: none of the 16 needs more than 5 looks.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Por qué O(log n)", en: "Why O(log n)" },
          texto: {
            es: "Cada mirada deja la mitad de lo que había: con 16, quedan 8, 4, 2, 1. Las miradas son las veces que se puede partir `n` a la mitad hasta quedarse sin nada: unas **log₂ n**, y en el peor caso exactamente ⌊log₂ n⌋ + 1.\n\nEso crece **muy** despacio: con el doble de datos, sólo hace falta **una mirada más**. 2¹⁰ es 1 024, así que mil números se resuelven en 10 miradas; 2²⁰ pasa del millón, así que un millón se resuelve en 20. Por eso es **O(log n)**, y por eso buscar en algo ordenado es tan rápido.",
            en: "Each look leaves half of what there was: with 16, 8 are left, then 4, 2, 1. The looks are the number of times you can halve `n` until nothing is left: about **log₂ n**, and in the worst case exactly ⌊log₂ n⌋ + 1.\n\nThat grows **very** slowly: with twice the data, you need just **one more look**. 2¹⁰ is 1,024, so a thousand numbers take 10 looks; 2²⁰ is over a million, so a million take 20. That's why it's **O(log n)**, and why searching something sorted is so fast.",
          },
          programa: {
            codigo: {
              es: "// El peor caso: buscar uno más grande que todos,\n// así que siempre se va a la derecha\nfunction peorCaso(n) {\n  const a = Array.from({ length: n }, (_, i) => i);\n  let izq = 0, der = n - 1, miradas = 0;\n  while (izq <= der) {\n    const medio = Math.floor((izq + der) / 2);\n    miradas++;\n    if (a[medio] < n) izq = medio + 1;\n    else der = medio - 1;\n  }\n  return miradas;\n}\n\nfor (const n of [16, 100, 1000, 2000, 1000000]) {\n  console.log(n, \"→ uno por uno:\", n, \"| binaria:\", peorCaso(n));\n}",
              en: "// The worst case: search for one bigger than all,\n// so it always goes right\nfunction peorCaso(n) {\n  const a = Array.from({ length: n }, (_, i) => i);\n  let izq = 0, der = n - 1, miradas = 0;\n  while (izq <= der) {\n    const medio = Math.floor((izq + der) / 2);\n    miradas++;\n    if (a[medio] < n) izq = medio + 1;\n    else der = medio - 1;\n  }\n  return miradas;\n}\n\nfor (const n of [16, 100, 1000, 2000, 1000000]) {\n  console.log(n, \"→ one by one:\", n, \"| binary:\", peorCaso(n));\n}",
            },
            notas: {
              es: "- 16 → 5, 100 → 7, 1 000 → 10, 2 000 → 11, 1 000 000 → 20.\n- De 1 000 a 2 000 datos, la búsqueda lineal hace el doble de trabajo; la binaria, una mirada más.",
              en: "- 16 → 5, 100 → 7, 1,000 → 10, 2,000 → 11, 1,000,000 → 20.\n- Going from 1,000 to 2,000 items, linear search does twice the work; binary search, one more look.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Ojo: tiene que estar ordenada", en: "Careful: it has to be sorted" },
          texto: {
            es: "Tirar una mitad sólo vale si sabes que **todo** lo de ese lado es menor (o mayor). Eso lo garantiza el orden. En una lista revuelta, la búsqueda binaria se equivoca sin avisar: dice −1 aunque el número sí esté.\n\nOrdenar primero cuesta **O(n log n)**, más que una búsqueda lineal. Conviene cuando vas a buscar **muchas veces** en la misma lista: se ordena una vez y cada búsqueda después cuesta O(log n). Así funcionan un diccionario de papel, el índice de una base de datos o la lista de contactos del teléfono.",
            en: "Throwing away a half only works if you know **everything** on that side is smaller (or bigger). Order guarantees that. On a shuffled list, binary search gets it wrong without warning: it says −1 even though the number is there.\n\nSorting first costs **O(n log n)**, more than one linear search. It pays off when you'll search the same list **many times**: sort it once and every search after that costs O(log n). That's how a paper dictionary, a database index or your phone's contact list work.",
          },
          programa: {
            codigo: {
              es: `${BUSCAR}\n\nconst revuelta = [42, 9, 77, 4, 63, 18, 90, 31];\nconsole.log("revuelta:", buscar(revuelta, 63));\n\nconst ordenada = [...revuelta].sort((a, b) => a - b);\nconsole.log(ordenada);\nconsole.log("ordenada:", buscar(ordenada, 63));`,
              en: `${BUSCAR}\n\nconst revuelta = [42, 9, 77, 4, 63, 18, 90, 31];\nconsole.log("shuffled:", buscar(revuelta, 63));\n\nconst ordenada = [...revuelta].sort((a, b) => a - b);\nconsole.log(ordenada);\nconsole.log("sorted:", buscar(ordenada, 63));`,
            },
            notas: {
              es: "- Revuelta: −1, ¡y el 63 está en la casilla 4! Miró el 4 (chico), el 18 (chico) y el 90 (grande), y se quedó sin tramo.\n- Ordenada: lo encuentra en la casilla 5.",
              en: "- Shuffled: −1, and 63 is right there in slot 4! It looked at 4 (too small), 18 (too small) and 90 (too big), and ran out of range.\n- Sorted: it finds it in slot 5.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "Buscando el 31 en `[4, 9, 13, 18, 25, 31, 37]`, ¿qué número mira primero la búsqueda binaria?", en: "Searching for 31 in `[4, 9, 13, 18, 25, 31, 37]`, which number does binary search look at first?" },
          opciones: ["18", "4", "25", "31"],
          correcta: 0,
          porque: {
            es: "`izq = 0` y `der = 6`, así que `medio = 3`: el 18. Es menor que 31, `izq` pasa a 4, y la segunda mirada (casilla 5) ya es el 31.",
            en: "`izq = 0` and `der = 6`, so `medio = 3`: 18. It's smaller than 31, `izq` moves to 4, and the second look (slot 5) is already 31.",
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "Con 1 000 números ordenados, ¿cuántas miradas necesita como mucho?", en: "With 1,000 sorted numbers, how many looks does it need at most?" },
          opciones: ["10", "100", "500", "1000"],
          correcta: 0,
          porque: {
            es: "2¹⁰ = 1 024: partiendo a la mitad diez veces, de mil queda uno. La búsqueda lineal necesitaría hasta mil.",
            en: "2¹⁰ = 1,024: halving ten times takes a thousand down to one. Linear search would need up to a thousand.",
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "Si la lista ordenada crece al doble, ¿qué pasa con las miradas de la búsqueda binaria en el peor caso?", en: "If the sorted list doubles in size, what happens to binary search's worst-case looks?" },
          opciones: [
            { es: "Hace falta una más", en: "It needs one more" },
            { es: "Se duplican", en: "They double" },
            { es: "Se multiplican por cuatro", en: "They multiply by four" },
            { es: "Siguen igual", en: "They stay the same" },
          ],
          correcta: 0,
          porque: {
            es: "La primera mirada parte la lista doble a la mitad, y lo que queda es del tamaño de antes. Eso es crecer como log n.",
            en: "The first look cuts the doubled list in half, and what's left is the old size. That's growing like log n.",
          },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa cómo se cierra el tramo.", en: "Fill in how the range closes in." },
          codigo: "if (a[medio] === x) return medio;\nif (a[medio] < x) izq = ___;\nelse der = ___;",
          huecos: ["medio + 1", "medio - 1"],
          banco: ["medio + 1", "medio - 1", "medio", "izq + 1"],
          porque: {
            es: "El de en medio ya se miró, así que se salta: si es chico, el tramo empieza justo después (`medio + 1`); si es grande, acaba justo antes (`medio - 1`). Con `izq = medio`, a veces el ciclo nunca termina.",
            en: "The middle one was already checked, so it's skipped: if it's too small, the range starts right after it (`medio + 1`); if it's too big, it ends right before it (`medio - 1`). With `izq = medio`, the loop sometimes never ends.",
          },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Con repetidos, `buscar` devuelve **alguna** de las casillas, no necesariamente la primera. Escribe `primeraVez(a, x)`: la casilla de la **primera** aparición de `x` en el arreglo ordenado, o `-1` si no está, en O(log n).",
            en: "With duplicates, `buscar` returns **some** matching slot, not necessarily the first. Write `primeraVez(a, x)`: the slot of the **first** occurrence of `x` in the sorted array, or `-1` if it's not there, in O(log n).",
          },
          inicial: {
            es: "function primeraVez(a, x) {\n  let izq = 0, der = a.length - 1;\n  // si lo encuentras, apúntalo y sigue buscando a la izquierda\n  return -1;\n}\n\nconsole.log(primeraVez([1, 2, 2, 2, 3], 2));",
            en: "function primeraVez(a, x) {\n  let izq = 0, der = a.length - 1;\n  // if you find it, write it down and keep searching to the left\n  return -1;\n}\n\nconsole.log(primeraVez([1, 2, 2, 2, 3], 2));",
          },
          pruebas: [
            { llamada: "primeraVez([1, 2, 2, 2, 3], 2)", espera: "1" },
            { llamada: "primeraVez([2, 2, 2, 2, 2, 2, 2, 2], 2)", espera: "0" },
            { llamada: "primeraVez([1, 3, 5, 7], 7)", espera: "3" },
            { llamada: "primeraVez([1, 3, 5], 4)", espera: "-1" },
            { llamada: "primeraVez([], 1)", espera: "-1" },
          ],
          solucion: "function primeraVez(a, x) {\n  let izq = 0, der = a.length - 1, r = -1;\n  while (izq <= der) {\n    const medio = Math.floor((izq + der) / 2);\n    if (a[medio] === x) {\n      r = medio;\n      der = medio - 1;\n    } else if (a[medio] < x) izq = medio + 1;\n    else der = medio - 1;\n  }\n  return r;\n}",
          porque: {
            es: "Al encontrarlo no se sale: se apunta en `r` y se sigue buscando en la mitad izquierda, por si hay otro antes. Sigue siendo O(log n), porque cada vuelta tira la mitad igual que antes.",
            en: "Finding it doesn't end the loop: it's written down in `r` and the search goes on in the left half, in case there's another one earlier. It's still O(log n), because each turn throws away half just like before.",
          },
        },
      ],
    },
  ],
};
