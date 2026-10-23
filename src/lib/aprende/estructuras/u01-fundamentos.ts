import type { Unidad } from "../tipos";

export const U01: Unidad = {
  id: "fundamentos",
  titulo: { es: "Antes de empezar", en: "Before we start" },
  lecciones: [
    {
      id: "que-es-una-estructura",
      titulo: { es: "¿Qué es una estructura de datos?", en: "What is a data structure?" },
      resumen: {
        es: "Datos, la forma de acomodarlos y lo que se puede hacer con ellos. Por qué este curso va en JavaScript.",
        en: "Data, the way it's arranged and what you can do with it. Why this course uses JavaScript.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Acomodar para encontrar", en: "Arranging things to find them" },
          texto: {
            es: "Una **estructura de datos** es una forma de acomodar información para que ciertas operaciones salgan baratas. No es sólo dónde se guardan los datos: es qué tan rápido puedes **buscar**, **meter**, **sacar** o **recorrer** lo que hay ahí.\n\nYa las usas sin llamarlas así:\n\n- La fila de la tortillería: el primero que llega es el primero que sale. Eso es una **cola**.\n- Una pila de platos: el último que pusiste arriba es el primero que tomas. Eso es una **pila**.\n- El índice de un libro, ordenado de la A a la Z: no lo lees entero para encontrar una palabra. Eso se parece a un **árbol de búsqueda**.\n\nElegir una estructura es decidir qué operaciones van a ser rápidas y cuáles vas a pagar caro.",
            en: "A **data structure** is a way of arranging information so that certain operations are cheap. It's not just where the data lives: it's how fast you can **find**, **add**, **remove** or **walk through** what's in there.\n\nYou already use them without the name:\n\n- The line at the tortilla shop: first in, first out. That's a **queue**.\n- A stack of plates: the last one you put on top is the first one you take. That's a **stack**.\n- A book's index, sorted A to Z: you don't read all of it to find a word. That's close to a **search tree**.\n\nChoosing a structure means deciding which operations will be fast and which ones you'll pay dearly for.",
          },
          dibujo: { tipo: "cola", valores: ["Ana", "Beto", "Caro", "Dani"] },
        },
        {
          tipo: "explica",
          titulo: { es: "Por qué JavaScript", en: "Why JavaScript" },
          texto: {
            es: "Este curso va en **JavaScript** por tres razones:\n\n- Corre aquí mismo, en tu navegador: cada ejemplo tiene un botón **CORRER** y puedes cambiar el código y volver a correrlo. No hay que instalar nada.\n- Es el lenguaje de los juegos de Daily Challenge, que tienen su propio curso.\n- Las ideas son las mismas en Python, C o Java. Cambia cómo se escribe, no cómo se piensa.\n\nEl código ya se corrió: junto a él (a la derecha, o debajo en el teléfono) está lo que imprimió `console.log`. Cambia `\"aguacate\"` por otra cosa y córrelo otra vez.",
            en: "This course uses **JavaScript** for three reasons:\n\n- It runs right here, in your browser: every example has a **RUN** button, and you can change the code and run it again. Nothing to install.\n- It's the language of the Daily Challenge games, which have their own course.\n- The ideas are the same in Python, C or Java. What changes is how you write it, not how you think about it.\n\nThe code has already run: next to it (on the right, or below on a phone) is what `console.log` printed. Change `\"aguacate\"` to something else and run it again.",
          },
          programa: {
            codigo: {
              es: "// Una lista del súper: un arreglo (en orden)\nconst lista = [\"tortillas\", \"frijol\", \"aguacate\"];\nconsole.log(lista);\nconsole.log(lista.length);\n\n// Una ficha de producto: un objeto (por nombre)\nconst producto = { nombre: \"aguacate\", precio: 45 };\nconsole.log(producto.precio);",
              en: "// A shopping list: an array (in order)\nconst lista = [\"tortillas\", \"frijol\", \"aguacate\"];\nconsole.log(lista);\nconsole.log(lista.length);\n\n// A product card: an object (by name)\nconst producto = { nombre: \"aguacate\", precio: 45 };\nconsole.log(producto.precio);",
            },
            notas: {
              es: "- El arreglo sale con sus corchetes y sus elementos en el orden en que los pusiste.\n- `length` cuenta cuántos hay: 3.\n- Al objeto se le pide un dato **por su nombre** (`precio`), no por su posición.",
              en: "- The array prints with its brackets and its items in the order you wrote them.\n- `length` counts how many there are: 3.\n- You ask the object for a value **by name** (`precio`), not by position.",
            },
          },
          enlaces: [{ url: "https://developer.mozilla.org/es/docs/Learn/JavaScript/First_steps", texto: { es: "Primeros pasos con JavaScript (MDN)", en: "JavaScript first steps (MDN)" } }],
        },
        {
          tipo: "explica",
          titulo: { es: "Los mismos datos, otro costo", en: "Same data, different cost" },
          texto: {
            es: "Aquí están los mismos tres productos guardados de dos formas. Las dos contestan «¿hay frijol?», pero de manera distinta:\n\n- El **arreglo** revisa uno por uno hasta encontrarlo. Con tres no se nota; con un millón, sí.\n- El **conjunto** (`Set`) va directo, como si supiera en qué cajón está.\n\nA cambio, el conjunto no guarda el orden de manera útil ni admite repetidos. No hay una estructura mejor que todas: hay una mejor **para lo que vas a hacer**.",
            en: "Here are the same three products stored two ways. Both answer \"is there any frijol?\", but differently:\n\n- The **array** checks one by one until it finds it. With three you don't notice; with a million, you do.\n- The **set** (`Set`) goes straight there, as if it knew which drawer it's in.\n\nIn exchange, the set doesn't keep a useful order and doesn't allow duplicates. No structure beats all the others: one is better **for what you're going to do**.",
          },
          programa: {
            codigo: {
              es: "const enArreglo = [\"tortillas\", \"frijol\", \"aguacate\"];\nconst enConjunto = new Set(enArreglo);\n\nconsole.log(enArreglo.includes(\"frijol\"));  // revisa uno por uno\nconsole.log(enConjunto.has(\"frijol\"));      // va directo\n\nenConjunto.add(\"frijol\");                   // ya estaba: no se repite\nconsole.log(enConjunto.size);",
              en: "const enArreglo = [\"tortillas\", \"frijol\", \"aguacate\"];\nconst enConjunto = new Set(enArreglo);\n\nconsole.log(enArreglo.includes(\"frijol\"));  // checks one by one\nconsole.log(enConjunto.has(\"frijol\"));      // goes straight there\n\nenConjunto.add(\"frijol\");                   // already there: no duplicate\nconsole.log(enConjunto.size);",
            },
            notas: {
              es: "Las dos primeras dicen `true`: la respuesta es la misma, lo que cambia es el trabajo para llegar a ella. Y el tamaño del conjunto sigue en 3 aunque metiste otro frijol.",
              en: "The first two print `true`: same answer, different amount of work to get there. And the set's size stays at 3 even though you added another frijol.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "En la fila de la tortillería, el primero que llega es el primero al que atienden. ¿Qué estructura es?", en: "At the tortilla shop line, the first to arrive is the first to be served. Which structure is it?" },
          opciones: [
            { es: "Una pila", en: "A stack" },
            { es: "Una cola", en: "A queue" },
            { es: "Un árbol", en: "A tree" },
            { es: "Un conjunto", en: "A set" },
          ],
          correcta: 1,
          porque: { es: "Primero en entrar, primero en salir: eso es una **cola** (en inglés, FIFO). La pila es al revés: el último que entra sale primero.", en: "First in, first out: that's a **queue** (FIFO). A stack is the other way around: the last one in comes out first." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué imprime este código?", en: "What does this code print?" },
          codigo: "const dulces = [\"mazapán\", \"glorias\", \"cajeta\", \"ate\"];\nconsole.log(dulces.length);",
          opciones: ["3", "4", "5", "\"ate\""],
          correcta: 1,
          porque: { es: "`length` cuenta los elementos: son cuatro. Las posiciones van de 0 a 3, pero eso es otra historia (la siguiente unidad).", en: "`length` counts the items: there are four. Positions go from 0 to 3, but that's another story (the next unit)." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa para crear un arreglo con dos frutas e imprimir cuántas hay.", en: "Fill in the blanks to make an array with two fruits and print how many there are." },
          codigo: "const frutas = ___\"mango\", \"guayaba\"___;\nconsole.log(frutas.___);",
          huecos: ["[", "]", "length"],
          banco: ["[", "]", "length", "{", "}", "size"],
          porque: { es: "Los arreglos van entre **corchetes** `[ ]` y su tamaño es `length`. Las llaves `{ }` son de los objetos, y `size` es de `Set` y `Map`.", en: "Arrays go between **square brackets** `[ ]` and their size is `length`. Braces `{ }` are for objects, and `size` belongs to `Set` and `Map`." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `primero(arreglo)`: devuelve el primer elemento, o `null` si el arreglo está vacío.\n\nPista: el primer elemento es `arreglo[0]`.",
            en: "Write `primero(arreglo)`: it returns the first item, or `null` if the array is empty.\n\nHint: the first item is `arreglo[0]`.",
          },
          inicial: {
            es: "function primero(arreglo) {\n  // tu código aquí\n}\n\nconsole.log(primero([7, 8, 9]));",
            en: "function primero(arreglo) {\n  // your code here\n}\n\nconsole.log(primero([7, 8, 9]));",
          },
          pruebas: [
            { llamada: "primero([7, 8, 9])", espera: "7" },
            { llamada: "primero([\"a\"])", espera: "\"a\"" },
            { llamada: "primero([])", espera: "null" },
          ],
          solucion: "function primero(arreglo) {\n  if (arreglo.length === 0) return null;\n  return arreglo[0];\n}",
          porque: { es: "Primero se revisa el caso vacío y luego se devuelve la posición 0. Revisar «¿y si no hay nada?» antes que nada es una costumbre que te va a salvar en cada estructura.", en: "Check the empty case first, then return position 0. Asking \"what if there's nothing?\" before anything else is a habit that will save you in every structure." },
        },
      ],
    },
    {
      id: "valores-y-referencias",
      titulo: { es: "Valores y referencias", en: "Values and references" },
      resumen: {
        es: "Por qué cambiar un arreglo «copiado» cambia también el original. La base de las listas y los árboles.",
        en: "Why changing a \"copied\" array also changes the original. The foundation of lists and trees.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Los valores sencillos se copian", en: "Simple values get copied" },
          texto: {
            es: "Los números, los textos y los booleanos (`true`/`false`) son **valores primitivos**. Cuando escribes `b = a`, `b` recibe **una copia**: cambiar `b` después no toca a `a`.",
            en: "Numbers, strings and booleans (`true`/`false`) are **primitive values**. When you write `b = a`, `b` gets **a copy**: changing `b` afterwards doesn't touch `a`.",
          },
          programa: {
            codigo: "let a = 5;\nlet b = a;\nb = 8;\nconsole.log(a, b);\n\nlet saludo = \"hola\";\nlet otro = saludo;\notro = otro + \" Sahuayo\";\nconsole.log(saludo, \"|\", otro);",
            notas: {
              es: "`a` sigue en 5 y `saludo` sigue en «hola»: cada variable tiene su propio valor.",
              en: "`a` is still 5 and `saludo` is still \"hola\": each variable has its own value.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Los objetos se comparten", en: "Objects get shared" },
          texto: {
            es: "Con los **arreglos y los objetos** pasa otra cosa. La variable no guarda el arreglo: guarda **dónde está** (una referencia, como la dirección de una casa). `b = a` copia la dirección, no la casa. Los dos apuntan al mismo arreglo, así que lo que le hagas por `b` se ve por `a`.\n\nEsto es lo más importante de la unidad: las listas enlazadas, los árboles y los grafos están hechos de objetos que **se apuntan unos a otros** con referencias.",
            en: "With **arrays and objects** something else happens. The variable doesn't hold the array: it holds **where it is** (a reference, like a house's address). `b = a` copies the address, not the house. Both point to the same array, so whatever you do through `b` shows up through `a`.\n\nThis is the most important idea of the unit: linked lists, trees and graphs are made of objects that **point to each other** through references.",
          },
          programa: {
            codigo: {
              es: "const a = [1, 2, 3];\nconst b = a;        // la misma dirección\nb.push(4);\nconsole.log(a);\n\nconst ficha = { nombre: \"Rosa\", puntos: 10 };\nconst misma = ficha;\nmisma.puntos = 99;\nconsole.log(ficha.puntos);",
              en: "const a = [1, 2, 3];\nconst b = a;        // the same address\nb.push(4);\nconsole.log(a);\n\nconst ficha = { nombre: \"Rosa\", puntos: 10 };\nconst misma = ficha;\nmisma.puntos = 99;\nconsole.log(ficha.puntos);",
            },
            notas: {
              es: "`a` también tiene el 4, y la ficha original quedó con 99 puntos. Nunca hubo dos arreglos ni dos fichas: hubo dos nombres para la misma cosa.",
              en: "`a` has the 4 too, and the original card ended up with 99 points. There were never two arrays or two cards: there were two names for the same thing.",
            },
          },
          enlaces: [{ url: "https://pythontutor.com/javascript.html", texto: { es: "Míralo paso a paso en Python Tutor (también hace JavaScript)", en: "Watch it step by step in Python Tutor (it does JavaScript too)" } }],
        },
        {
          tipo: "explica",
          titulo: { es: "Copiar de verdad, y comparar", en: "Real copies, and comparing" },
          texto: {
            es: "Si quieres otro arreglo, hay que crearlo. `[...a]` hace uno nuevo con los mismos elementos (una copia **superficial**: si adentro hay objetos, esos se siguen compartiendo). `structuredClone(a)` copia todo, hasta el fondo.\n\nY ojo con `===`: con objetos compara **direcciones**, no contenido. Dos arreglos iguales por dentro no son «el mismo» arreglo.",
            en: "If you want another array, you have to create it. `[...a]` makes a new one with the same items (a **shallow** copy: objects inside are still shared). `structuredClone(a)` copies everything, all the way down.\n\nAnd watch out for `===`: with objects it compares **addresses**, not contents. Two arrays that look the same inside are not \"the same\" array.",
          },
          programa: {
            codigo: "const a = [1, 2];\nconst b = [...a];\nb.push(3);\nconsole.log(a, b);\n\nconsole.log([1, 2] === [1, 2]);\nconsole.log(a === a);\n\nconst grupos = [[\"Ana\"], [\"Beto\"]];\nconst superficial = [...grupos];\nsuperficial[0].push(\"Caro\");\nconsole.log(grupos[0]);",
            notas: {
              es: "- `a` se quedó en `[1, 2]`: ahora sí son dos arreglos.\n- `[1, 2] === [1, 2]` es `false`: son dos direcciones distintas.\n- El último caso es la trampa de la copia superficial: el arreglo de afuera es nuevo, pero `[\"Ana\"]` se compartió y ganó a «Caro».",
              en: "- `a` stayed `[1, 2]`: now there really are two arrays.\n- `[1, 2] === [1, 2]` is `false`: two different addresses.\n- The last case is the shallow-copy trap: the outer array is new, but `[\"Ana\"]` was shared and gained \"Caro\".",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué imprime?", en: "What does it print?" },
          codigo: "const x = { v: 1 };\nconst y = x;\ny.v = 2;\nconsole.log(x.v);",
          opciones: ["1", "2", "undefined", "{ v: 2 }"],
          correcta: 1,
          porque: { es: "`y` y `x` apuntan al mismo objeto. Cambiarlo por `y` es cambiarlo por `x`: imprime 2.", en: "`y` and `x` point to the same object. Changing it through `y` changes it through `x`: it prints 2." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué imprime?", en: "What does it print?" },
          codigo: "let n = 10;\nlet m = n;\nm = m + 1;\nconsole.log(n);",
          opciones: ["10", "11", "undefined", "Error"],
          correcta: 0,
          porque: { es: "Los números son primitivos: `m` recibió una copia del 10. Sumarle a `m` no toca a `n`.", en: "Numbers are primitives: `m` got a copy of 10. Adding to `m` doesn't touch `n`." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Cuánto vale `[\"a\"] === [\"a\"]`?", en: "What is `[\"a\"] === [\"a\"]`?" },
          opciones: ["true", "false"],
          correcta: 1,
          porque: { es: "Son dos arreglos distintos que por casualidad tienen lo mismo adentro. `===` compara si es **el mismo** objeto, no si se parecen.", en: "They're two different arrays that happen to hold the same thing. `===` checks whether it's **the same** object, not whether they look alike." },
        },
        {
          tipo: "ordena",
          pregunta: { es: "Ordena los renglones para intercambiar los valores de `a` y `b` con una variable auxiliar.", en: "Put the lines in order to swap the values of `a` and `b` using a helper variable." },
          lineas: ["let tmp = a;", "a = b;", "b = tmp;"],
          porque: { es: "Primero se guarda `a` en un lugar seguro, luego `a` recibe a `b` y al final `b` recibe lo guardado. Si haces `a = b` primero, el valor de `a` se pierde.", en: "First stash `a` somewhere safe, then `a` takes `b`, and finally `b` takes what you stashed. If you do `a = b` first, `a`'s value is lost." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `conCero(arreglo)`: devuelve un arreglo **nuevo** con un `0` al final, **sin cambiar** el que te pasaron.",
            en: "Write `conCero(arreglo)`: return a **new** array with a `0` at the end, **without changing** the one you were given.",
          },
          inicial: {
            es: "function conCero(arreglo) {\n  // ojo: arreglo.push(0) cambiaría el original\n}\n\nconst a = [1, 2];\nconsole.log(conCero(a), a);",
            en: "function conCero(arreglo) {\n  // careful: arreglo.push(0) would change the original\n}\n\nconst a = [1, 2];\nconsole.log(conCero(a), a);",
          },
          pruebas: [
            { llamada: "conCero([1, 2])", espera: "[1,2,0]" },
            { llamada: "(() => { const a = [5]; conCero(a); return a; })()", espera: "[5]" },
            { llamada: "conCero([])", espera: "[0]" },
          ],
          solucion: "function conCero(arreglo) {\n  return [...arreglo, 0];\n}",
          porque: { es: "`[...arreglo, 0]` crea un arreglo nuevo con todo lo de antes y el cero. El original queda intacto, que es justo lo que revisa la segunda prueba.", en: "`[...arreglo, 0]` builds a new array with everything from before plus the zero. The original stays untouched, which is exactly what the second test checks." },
        },
      ],
    },
    {
      id: "big-o",
      titulo: { es: "Cuánto cuesta: la O grande", en: "What it costs: Big O" },
      resumen: {
        es: "Contar pasos en vez de segundos: O(1), O(log n), O(n), O(n²). El idioma de todo lo que sigue.",
        en: "Counting steps instead of seconds: O(1), O(log n), O(n), O(n²). The language of everything that follows.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Contar pasos, no segundos", en: "Count steps, not seconds" },
          texto: {
            es: "Cuánto tarda un programa depende de la computadora, del teléfono, de qué más está abierto. Por eso se mide otra cosa: **cuántos pasos da según el tamaño de la entrada**, que se llama `n`.\n\nEsta función suma un arreglo y cuenta sus vueltas. Con 3 elementos da 3 pasos; con 1000, 1000. El trabajo crece igual que `n`: se dice que es **O(n)**, «de orden n» o **lineal**.",
            en: "How long a program takes depends on the computer, the phone, what else is open. So we measure something else: **how many steps it takes depending on the size of the input**, called `n`.\n\nThis function adds up an array and counts its loop turns. With 3 items it takes 3 steps; with 1000, 1000. The work grows just like `n`: we say it's **O(n)**, \"order n\" or **linear**.",
          },
          programa: {
            codigo: "function suma(arr) {\n  let total = 0, pasos = 0;\n  for (const x of arr) {\n    total += x;\n    pasos++;\n  }\n  console.log(\"n =\", arr.length, \"pasos =\", pasos);\n  return total;\n}\n\nsuma([4, 5, 6]);\nsuma(new Array(1000).fill(1));",
            notas: {
              es: "Pasos y `n` salen iguales: si el arreglo crece al doble, el trabajo crece al doble.",
              en: "Steps and `n` come out equal: if the array doubles, so does the work.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Cuando cada uno se compara con todos", en: "When everyone is compared with everyone" },
          texto: {
            es: "Si para cada elemento recorres otra vez el arreglo (dos ciclos, uno dentro del otro), los pasos crecen como `n × n`: **O(n²)**, **cuadrática**. Con 10 elementos son 45 parejas; con 1000, casi medio millón.\n\nEn la O grande se ignoran las constantes y lo pequeño: `n²/2` también es O(n²). Lo que importa es **la forma** en que crece cuando `n` se hace enorme.",
            en: "If for each item you walk the array again (two loops, one inside the other), the steps grow like `n × n`: **O(n²)**, **quadratic**. With 10 items it's 45 pairs; with 1000, almost half a million.\n\nBig O ignores constants and small terms: `n²/2` is still O(n²). What matters is **the shape** of the growth as `n` gets huge.",
          },
          programa: {
            codigo: "function parejas(n) {\n  let pasos = 0;\n  for (let i = 0; i < n; i++)\n    for (let j = i + 1; j < n; j++)\n      pasos++;\n  return pasos;\n}\n\nfor (const n of [10, 100, 1000]) {\n  console.log(n, \"->\", parejas(n));\n}",
            notas: {
              es: "Cada vez que `n` se multiplica por 10, los pasos se multiplican por unos 100. Así se ve una O(n²).",
              en: "Each time `n` grows tenfold, the steps grow about a hundredfold. That's what O(n²) looks like.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Partir a la mitad: O(log n)", en: "Halving: O(log n)" },
          texto: {
            es: "Lo contrario de crecer rápido: si en cada paso **descartas la mitad** de lo que queda, un millón se acaba en 20 pasos. Eso es **O(log n)**, logarítmica, y es la razón por la que buscar en algo ordenado es tan rápido.\n\nLas familias, de la más barata a la más cara:\n\n- **O(1)** constante: leer `arr[5]`.\n- **O(log n)**: búsqueda binaria.\n- **O(n)**: recorrer una vez.\n- **O(n log n)**: ordenar bien.\n- **O(n²)**: comparar todos contra todos.\n- **O(2ⁿ)**: probar todas las combinaciones.",
            en: "The opposite of growing fast: if each step **throws away half** of what's left, a million is done in 20 steps. That's **O(log n)**, logarithmic, and it's why searching something sorted is so fast.\n\nThe families, cheapest to most expensive:\n\n- **O(1)** constant: reading `arr[5]`.\n- **O(log n)**: binary search.\n- **O(n)**: one pass.\n- **O(n log n)**: sorting well.\n- **O(n²)**: comparing everything with everything.\n- **O(2ⁿ)**: trying every combination.",
          },
          programa: {
            codigo: "function mitades(n) {\n  let pasos = 0;\n  while (n > 1) {\n    n = Math.floor(n / 2);\n    pasos++;\n  }\n  return pasos;\n}\n\nfor (const n of [8, 1024, 1_000_000]) {\n  console.log(n, \"->\", mitades(n));\n}",
            notas: {
              es: "Un millón en 19 pasos. Multiplicar `n` por mil apenas suma unos 10 pasos.",
              en: "A million in 19 steps. Multiplying `n` by a thousand only adds about 10 steps.",
            },
          },
          enlaces: [
            { url: "https://es.wikipedia.org/wiki/Cota_superior_asint%C3%B3tica", texto: { es: "Cota superior asintótica (Wikipedia)", en: "Big O notation (Wikipedia, Spanish)" } },
            { url: "https://www.bigocheatsheet.com/", texto: { es: "Big-O Cheat Sheet: la tabla de costos de cada estructura", en: "Big-O Cheat Sheet: the cost table for every structure" } },
          ],
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Cuánto cuesta leer `arr[500]` en un arreglo de un millón de elementos?", en: "How much does reading `arr[500]` cost in an array of a million items?" },
          opciones: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
          correcta: 0,
          porque: { es: "El arreglo sabe dónde empieza y cuánto mide cada casilla, así que salta directo a la 500. No importa cuántas haya: **O(1)**.", en: "The array knows where it starts and how big each slot is, so it jumps straight to slot 500. It doesn't matter how many there are: **O(1)**." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿De qué orden es este código?", en: "What's the order of this code?" },
          codigo: "for (let i = 0; i < n; i++)\n  for (let j = 0; j < n; j++)\n    if (arr[i] === arr[j] && i !== j) repetidos++;",
          opciones: ["O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"],
          correcta: 2,
          porque: { es: "Dos ciclos de `n`, uno dentro del otro: `n × n` vueltas, **O(n²)**.", en: "Two loops of `n`, one inside the other: `n × n` turns, **O(n²)**." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Y éste?", en: "And this one?" },
          codigo: "let i = n;\nwhile (i > 1) {\n  i = Math.floor(i / 2);\n}",
          opciones: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
          correcta: 1,
          porque: { es: "Cada vuelta deja la mitad: las vueltas son cuántas veces cabe partir `n` a la mitad, **log₂ n**.", en: "Each turn keeps half: the number of turns is how many times you can halve `n`, **log₂ n**." },
        },
        {
          tipo: "ordena",
          pregunta: { es: "Ordena de la más barata a la más cara.", en: "Order them from cheapest to most expensive." },
          lineas: ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"],
          porque: { es: "Constante, logarítmica, lineal, «n log n», cuadrática y exponencial. Con `n = 1000` serían más o menos 1, 10, 1000, 10 000, un millón y un número de 302 cifras.", en: "Constant, logarithmic, linear, \"n log n\", quadratic and exponential. With `n = 1000` they'd be roughly 1, 10, 1000, 10,000, a million and a 302-digit number." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `mayor(arr)` en **O(n)**: devuelve el número más grande sin usar `Math.max` ni ordenar. Supón que el arreglo trae al menos un número.",
            en: "Write `mayor(arr)` in **O(n)**: return the largest number without `Math.max` or sorting. Assume the array has at least one number.",
          },
          inicial: {
            es: "function mayor(arr) {\n  // una sola pasada: recuerda el más grande que has visto\n}\n\nconsole.log(mayor([3, 9, 2, 7]));",
            en: "function mayor(arr) {\n  // one pass: remember the biggest one you've seen\n}\n\nconsole.log(mayor([3, 9, 2, 7]));",
          },
          pruebas: [
            { llamada: "mayor([3, 9, 2, 7])", espera: "9" },
            { llamada: "mayor([-5, -2, -9])", espera: "-2" },
            { llamada: "mayor([42])", espera: "42" },
          ],
          solucion: "function mayor(arr) {\n  let m = arr[0];\n  for (const x of arr) {\n    if (x > m) m = x;\n  }\n  return m;\n}",
          porque: { es: "Una pasada y una variable que recuerda al campeón: O(n). Empezar con `arr[0]` y no con `0` es lo que hace pasar la prueba de los negativos.", en: "One pass and a variable that remembers the champion: O(n). Starting from `arr[0]` instead of `0` is what makes the negative-numbers test pass." },
        },
      ],
    },
  ],
};
