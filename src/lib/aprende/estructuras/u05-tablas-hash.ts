import type { Unidad } from "../tipos";

export const U05: Unidad = {
  id: "tablas-hash",
  titulo: { es: "Tablas hash", en: "Hash tables" },
  lecciones: [
    {
      id: "funcion-hash-y-cubetas",
      titulo: { es: "La función hash y las cubetas", en: "The hash function and the buckets" },
      resumen: {
        es: "Convertir una clave en el número de un cajón para encontrarla sin recorrer nada. Colisiones, factor de carga y por qué es O(1).",
        en: "Turning a key into a drawer number so you can find it without walking through anything. Collisions, load factor and why it's O(1).",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Un cajón para cada clave", en: "A drawer for each key" },
          texto: {
            es: "Buscar en un arreglo es O(n): hay que revisar uno por uno. La **tabla hash** hace un truco: con la clave misma calcula **en qué cajón va**. Ese cálculo es la **función hash**, y los cajones se llaman **cubetas**.\n\nLa función de abajo es de juguete: recorre las letras y las va mezclando en un número, que al final se recorta con `%` para que caiga entre 0 y el número de cubetas. Lo importante es que **la misma clave siempre da el mismo número**: por eso, para buscar «mango», no hay que revisar nada, sólo volver a calcular su cubeta.",
            en: "Searching an array is O(n): you have to check one by one. A **hash table** pulls a trick: from the key itself it computes **which drawer it goes in**. That computation is the **hash function**, and the drawers are called **buckets**.\n\nThe function below is a toy: it walks through the letters and mixes them into a number, which at the end gets trimmed with `%` so it lands between 0 and the number of buckets. The key point is that **the same key always gives the same number**: so to find \"mango\" you don't check anything, you just compute its bucket again.",
          },
          programa: {
            codigo: {
              es: "function hash(clave, tam) {\n  let h = 0;\n  for (const letra of clave) {\n    h = (h * 31 + letra.charCodeAt(0)) % tam;\n  }\n  return h;\n}\n\nfor (const fruta of [\"mango\", \"guayaba\", \"tuna\", \"lima\"]) {\n  console.log(fruta, \"-> cubeta\", hash(fruta, 8));\n}\nconsole.log(\"mango otra vez ->\", hash(\"mango\", 8));",
              en: "function hash(clave, tam) {\n  let h = 0;\n  for (const letra of clave) {\n    h = (h * 31 + letra.charCodeAt(0)) % tam;\n  }\n  return h;\n}\n\nfor (const fruta of [\"mango\", \"guayaba\", \"tuna\", \"lima\"]) {\n  console.log(fruta, \"-> bucket\", hash(fruta, 8));\n}\nconsole.log(\"mango again ->\", hash(\"mango\", 8));",
            },
            notas: {
              es: "- Cada fruta cae en una cubeta entre 0 y 7.\n- «mango» da el mismo número las dos veces: la función no tiene azar ni memoria.\n- «mango» y «guayaba» caen las dos en la cubeta 2. Guarda eso para la siguiente tarjeta.\n- Cambia el 8 por 16 y vuelve a correrlo: las cubetas cambian, porque dependen del tamaño de la tabla.",
              en: "- Each fruit lands in a bucket between 0 and 7.\n- \"mango\" gives the same number both times: the function has no randomness and no memory.\n- \"mango\" and \"guayaba\" both land in bucket 2. Keep that in mind for the next card.\n- Change the 8 to 16 and run it again: the buckets change, because they depend on the table's size.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Colisiones: dos claves, un cajón", en: "Collisions: two keys, one drawer" },
          texto: {
            es: "Hay muchísimas claves posibles y pocas cubetas, así que tarde o temprano dos claves caen en el mismo cajón. Eso es una **colisión**, y no es un error: hay que planearla.\n\nLa forma más común es el **encadenamiento**: cada cubeta es una listita de pares `[clave, valor]`. Para buscar, se calcula la cubeta y sólo se revisa **esa** listita, que normalmente tiene uno o dos elementos.",
            en: "There are tons of possible keys and few buckets, so sooner or later two keys land in the same drawer. That's a **collision**, and it's not a bug: you have to plan for it.\n\nThe most common approach is **chaining**: each bucket is a little list of `[key, value]` pairs. To search, you compute the bucket and only check **that** little list, which usually holds one or two items.",
          },
          dibujo: { tipo: "hash", cubetas: [["tuna"], ["lima"], ["mango", "guayaba"], []] },
          programa: {
            codigo: {
              es: "class TablaHash {\n  constructor(tam = 4) {\n    this.tam = tam;\n    this.cubetas = Array.from({ length: tam }, () => []);\n  }\n  hash(clave) {\n    let h = 0;\n    for (const letra of clave) h = (h * 31 + letra.charCodeAt(0)) % this.tam;\n    return h;\n  }\n  poner(clave, valor) {\n    const cubeta = this.cubetas[this.hash(clave)];\n    const par = cubeta.find((p) => p[0] === clave);\n    if (par) par[1] = valor;          // ya estaba: se actualiza\n    else cubeta.push([clave, valor]); // nueva: al final de su cubeta\n  }\n  obtener(clave) {\n    const cubeta = this.cubetas[this.hash(clave)];\n    const par = cubeta.find((p) => p[0] === clave);\n    return par ? par[1] : undefined;\n  }\n}\n\nconst precios = new TablaHash(4);\nprecios.poner(\"mango\", 25);\nprecios.poner(\"guayaba\", 30);\nprecios.poner(\"tuna\", 18);\nprecios.poner(\"lima\", 12);\nprecios.poner(\"mango\", 28);\nconsole.log(precios.obtener(\"mango\"));\nconsole.log(precios.obtener(\"kiwi\"));\nconsole.log(precios.cubetas);",
              en: "class TablaHash {\n  constructor(tam = 4) {\n    this.tam = tam;\n    this.cubetas = Array.from({ length: tam }, () => []);\n  }\n  hash(clave) {\n    let h = 0;\n    for (const letra of clave) h = (h * 31 + letra.charCodeAt(0)) % this.tam;\n    return h;\n  }\n  poner(clave, valor) {\n    const cubeta = this.cubetas[this.hash(clave)];\n    const par = cubeta.find((p) => p[0] === clave);\n    if (par) par[1] = valor;          // already there: update it\n    else cubeta.push([clave, valor]); // new: end of its bucket\n  }\n  obtener(clave) {\n    const cubeta = this.cubetas[this.hash(clave)];\n    const par = cubeta.find((p) => p[0] === clave);\n    return par ? par[1] : undefined;\n  }\n}\n\nconst precios = new TablaHash(4);\nprecios.poner(\"mango\", 25);\nprecios.poner(\"guayaba\", 30);\nprecios.poner(\"tuna\", 18);\nprecios.poner(\"lima\", 12);\nprecios.poner(\"mango\", 28);\nconsole.log(precios.obtener(\"mango\"));\nconsole.log(precios.obtener(\"kiwi\"));\nconsole.log(precios.cubetas);",
            },
            notas: {
              es: "- «mango» vale 28: el segundo `poner` actualizó el par en vez de duplicarlo.\n- «kiwi» no está y sale `undefined`.\n- En la última línea se ven las cuatro cubetas por dentro, igual que en el dibujo: la tercera (la 2) tiene a «mango» y «guayaba», la colisión de la tarjeta anterior. La última quedó vacía.",
              en: "- \"mango\" is 28: the second `poner` updated the pair instead of duplicating it.\n- \"kiwi\" isn't there and comes out `undefined`.\n- The last line shows the four buckets inside, just like the drawing: the third one (bucket 2) holds \"mango\" and \"guayaba\", the collision from the previous card. The last one is empty.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Factor de carga: crecer a tiempo", en: "Load factor: growing in time" },
          texto: {
            es: "Si metes mil claves en cuatro cubetas, cada listita tendrá unas 250 y buscar vuelve a ser lento. Por eso se vigila el **factor de carga**: elementos entre cubetas. Cuando pasa de cierto límite (muchas implementaciones usan 0.75), la tabla **duplica sus cubetas y vuelve a acomodar todo** (eso se llama *rehash*).\n\nRehacer cuesta O(n), pero pasa tan pocas veces que, repartido entre todas las inserciones, sale O(1) **en promedio**. El peor caso sigue siendo O(n): si la función hash es mala y todo cae en la misma cubeta, la tabla es un arreglo disfrazado. Abajo se compara una función buena con una que sólo mira el largo de la palabra.",
            en: "If you put a thousand keys in four buckets, each little list will hold about 250 and searching is slow again. So you watch the **load factor**: items divided by buckets. When it passes some limit (many implementations use 0.75), the table **doubles its buckets and re-places everything** (that's called a *rehash*).\n\nRehashing costs O(n), but it happens so rarely that, spread across all insertions, it comes out O(1) **on average**. The worst case is still O(n): if the hash function is bad and everything lands in the same bucket, the table is an array in disguise. Below, a good function is compared with one that only looks at the word's length.",
          },
          programa: {
            codigo: {
              es: "function buena(clave, tam) {\n  let h = 0;\n  for (const letra of clave) h = (h * 31 + letra.charCodeAt(0)) % tam;\n  return h;\n}\nfunction mala(clave, tam) {\n  return clave.length % tam;   // sólo mira cuántas letras tiene\n}\n\nfunction peorCubeta(funcion, claves, tam) {\n  const cuenta = new Array(tam).fill(0);\n  for (const c of claves) cuenta[funcion(c, tam)]++;\n  return Math.max(...cuenta);\n}\n\n// 1000 claves de 4 letras: \"c000\", \"c001\", ...\nconst claves = [];\nfor (let i = 0; i < 1000; i++) claves.push(\"c\" + String(i).padStart(3, \"0\"));\n\nconsole.log(\"buena: la cubeta más llena tiene\", peorCubeta(buena, claves, 1024));\nconsole.log(\"mala:  la cubeta más llena tiene\", peorCubeta(mala, claves, 1024));\nconsole.log(\"factor de carga:\", 1000 / 1024);",
              en: "function buena(clave, tam) {\n  let h = 0;\n  for (const letra of clave) h = (h * 31 + letra.charCodeAt(0)) % tam;\n  return h;\n}\nfunction mala(clave, tam) {\n  return clave.length % tam;   // only looks at how many letters it has\n}\n\nfunction peorCubeta(funcion, claves, tam) {\n  const cuenta = new Array(tam).fill(0);\n  for (const c of claves) cuenta[funcion(c, tam)]++;\n  return Math.max(...cuenta);\n}\n\n// 1000 four-letter keys: \"c000\", \"c001\", ...\nconst claves = [];\nfor (let i = 0; i < 1000; i++) claves.push(\"c\" + String(i).padStart(3, \"0\"));\n\nconsole.log(\"good: fullest bucket holds\", peorCubeta(buena, claves, 1024));\nconsole.log(\"bad:  fullest bucket holds\", peorCubeta(mala, claves, 1024));\nconsole.log(\"load factor:\", 1000 / 1024);",
            },
            notas: {
              es: "- Con la función buena, la cubeta más llena tiene 5 claves: buscar sigue siendo casi inmediato.\n- Con la mala, las 1000 claves miden 4 letras y caen **todas** en la misma cubeta: buscar es O(n).\n- El factor de carga es 0.98: pasa de 0.75, así que una tabla real ya habría duplicado sus cubetas.",
              en: "- With the good function, the fullest bucket holds 5 keys: searching is still almost instant.\n- With the bad one, all 1000 keys are 4 letters long and **all** land in the same bucket: searching is O(n).\n- The load factor is 0.98: above 0.75, so a real table would already have doubled its buckets.",
            },
          },
          enlaces: [
            { url: "https://visualgo.net/es/hashtable", texto: { es: "VisuAlgo: tablas hash animadas", en: "VisuAlgo: animated hash tables" } },
            { url: "https://es.wikipedia.org/wiki/Tabla_hash", texto: { es: "Tabla hash (Wikipedia)", en: "Hash table (Wikipedia, Spanish)" } },
          ],
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué es una colisión en una tabla hash?", en: "What is a collision in a hash table?" },
          opciones: [
            { es: "Que dos claves distintas caen en la misma cubeta", en: "Two different keys land in the same bucket" },
            { es: "Que se mete dos veces la misma clave", en: "The same key is inserted twice" },
            { es: "Que la tabla se queda sin memoria", en: "The table runs out of memory" },
            { es: "Que la función hash devuelve un número negativo", en: "The hash function returns a negative number" },
          ],
          correcta: 0,
          porque: { es: "Dos claves **distintas**, un mismo cajón. Meter la misma clave otra vez no es colisión: es actualizar su valor.", en: "Two **different** keys, one drawer. Inserting the same key again isn't a collision: it's updating its value." },
        },
        {
          tipo: "elige",
          pregunta: { es: "Si la función hash devolviera siempre 0, ¿cuánto costaría buscar entre n claves?", en: "If the hash function always returned 0, how much would searching among n keys cost?" },
          opciones: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
          correcta: 2,
          porque: { es: "Todas las claves acabarían en la cubeta 0, una sola lista larga, y habría que recorrerla: **O(n)**. La rapidez de la tabla depende de que la función reparta bien.", en: "Every key would end up in bucket 0, one long list, and you'd have to walk it: **O(n)**. The table's speed depends on the function spreading keys well." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa `obtener`: calcula la cubeta, busca el par y devuelve su valor.", en: "Complete `obtener`: compute the bucket, find the pair and return its value." },
          codigo: "obtener(clave) {\n  const i = this.___(clave);\n  for (const [k, v] of this.cubetas[___]) {\n    if (k === clave) return ___;\n  }\n  return undefined;\n}",
          huecos: ["hash", "i", "v"],
          banco: ["hash", "i", "v", "k", "clave", "length"],
          porque: { es: "Primero `this.hash(clave)` da el índice `i`; luego se recorre **sólo** la cubeta `i` y, cuando la clave `k` coincide, se devuelve su valor `v`.", en: "First `this.hash(clave)` gives the index `i`; then you walk **only** bucket `i` and, when key `k` matches, return its value `v`." },
        },
        {
          tipo: "ordena",
          pregunta: { es: "Ordena los renglones de `poner` (meter o actualizar una clave).", en: "Put the lines of `poner` in order (insert or update a key)." },
          lineas: [
            "const i = this.hash(clave);",
            "const cubeta = this.cubetas[i];",
            "const par = cubeta.find((p) => p[0] === clave);",
            "if (par) par[1] = valor;",
            "else cubeta.push([clave, valor]);",
          ],
          porque: { es: "Cubeta, buscar dentro de ella, y luego decidir: si la clave ya estaba se actualiza; si no, se agrega. Sin el `find`, meter «mango» dos veces dejaría dos pares.", en: "Bucket, search inside it, then decide: if the key was there, update it; otherwise add it. Without the `find`, inserting \"mango\" twice would leave two pairs." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `hashSimple(texto, tam)`: suma los códigos de las letras (`letra.charCodeAt(0)`) y devuelve el residuo de dividir esa suma entre `tam`.\n\nPor ejemplo, `\"ab\"` suma 97 + 98 = 195, y con `tam = 10` da 5.",
            en: "Write `hashSimple(texto, tam)`: add up the letter codes (`letra.charCodeAt(0)`) and return the remainder of dividing that sum by `tam`.\n\nFor example, `\"ab\"` adds 97 + 98 = 195, and with `tam = 10` it gives 5.",
          },
          inicial: {
            es: "function hashSimple(texto, tam) {\n  // suma los códigos y usa %\n}\n\nconsole.log(hashSimple(\"ab\", 10));",
            en: "function hashSimple(texto, tam) {\n  // add up the codes and use %\n}\n\nconsole.log(hashSimple(\"ab\", 10));",
          },
          pruebas: [
            { llamada: "hashSimple(\"ab\", 10)", espera: "5" },
            { llamada: "hashSimple(\"hola\", 100)", espera: "20" },
            { llamada: "hashSimple(\"\", 7)", espera: "0" },
          ],
          solucion: "function hashSimple(texto, tam) {\n  let suma = 0;\n  for (const letra of texto) suma += letra.charCodeAt(0);\n  return suma % tam;\n}",
          porque: { es: "Una pasada para sumar y un `%` al final. Ojo: esta función es floja, porque «ab» y «ba» suman lo mismo y siempre chocan; por eso la de la lección multiplica por 31 en cada letra, para que el orden importe.", en: "One pass to add and a `%` at the end. Careful: this function is weak, because \"ab\" and \"ba\" add up the same and always collide; that's why the one in the lesson multiplies by 31 at each letter, so order matters." },
        },
      ],
    },
    {
      id: "map-y-set",
      titulo: { es: "Map y Set: las tablas hash de JavaScript", en: "Map and Set: JavaScript's hash tables" },
      resumen: {
        es: "Las tablas hash que ya trae el lenguaje: contar, agrupar, quitar repetidos y encontrar parejas en una sola pasada.",
        en: "The hash tables the language already has: counting, grouping, removing duplicates and finding pairs in a single pass.",
      },
      retos: ["two-sum", "contains-duplicate", "valid-anagram", "group-anagrams", "top-k-frequent-elements"],
      enlaces: [
        { url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Map", texto: { es: "Map (MDN)", en: "Map (MDN, Spanish)" } },
        { url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Set", texto: { es: "Set (MDN)", en: "Set (MDN, Spanish)" } },
      ],
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Map: clave → valor", en: "Map: key → value" },
          texto: {
            es: "No hace falta escribir tu propia tabla: JavaScript trae **`Map`**, que es exactamente eso. `set` mete, `get` saca, `has` pregunta y `delete` borra, todas en O(1) promedio.\n\nUn objeto `{}` también guarda pares, pero sus claves siempre se vuelven texto y trae propiedades heredadas. `Map` acepta cualquier clave (números, objetos), recuerda el orden en que entraron y sabe su tamaño con `size`. Para datos que cambian, usa `Map`.",
            en: "You don't need to write your own table: JavaScript ships **`Map`**, which is exactly that. `set` puts, `get` takes, `has` asks and `delete` removes, all O(1) on average.\n\nA plain object `{}` also stores pairs, but its keys always turn into strings and it comes with inherited properties. `Map` accepts any key (numbers, objects), remembers insertion order and knows its size with `size`. For data that changes, use `Map`.",
          },
          programa: {
            codigo: {
              es: "const precios = new Map();\nprecios.set(\"tamal\", 18);\nprecios.set(\"atole\", 22);\nprecios.set(\"tamal\", 20);      // misma clave: se reemplaza\n\nconsole.log(precios.get(\"tamal\"));\nconsole.log(precios.has(\"champurrado\"));\nconsole.log(precios.size);\nconsole.log(precios);\n\n// Con un objeto, la clave 1 se vuelve el texto \"1\"\nconst obj = {};\nobj[1] = \"uno\";\nconsole.log(Object.keys(obj));\nconst m = new Map([[1, \"uno\"]]);\nconsole.log(m.get(1), m.get(\"1\"));",
              en: "const precios = new Map();\nprecios.set(\"tamal\", 18);\nprecios.set(\"atole\", 22);\nprecios.set(\"tamal\", 20);      // same key: replaced\n\nconsole.log(precios.get(\"tamal\"));\nconsole.log(precios.has(\"champurrado\"));\nconsole.log(precios.size);\nconsole.log(precios);\n\n// With an object, the key 1 turns into the string \"1\"\nconst obj = {};\nobj[1] = \"uno\";\nconsole.log(Object.keys(obj));\nconst m = new Map([[1, \"uno\"]]);\nconsole.log(m.get(1), m.get(\"1\"));",
            },
            notas: {
              es: "- El tamal vale 20 y el `Map` tiene 2 elementos, no 3.\n- `Object.keys` devuelve `'1'` entre comillas: el objeto convirtió el número en texto.\n- El `Map` distingue `1` de `\"1\"`: con el texto no encuentra nada.",
              en: "- The tamal is 20 and the `Map` holds 2 items, not 3.\n- `Object.keys` returns `'1'` in quotes: the object turned the number into a string.\n- The `Map` tells `1` and `\"1\"` apart: with the string it finds nothing.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Set: ¿está o no está?", en: "Set: is it there or not?" },
          texto: {
            es: "Un **`Set`** es una tabla hash sin valores: sólo claves, y cada una una vez. Sirve para dos cosas que salen todo el tiempo:\n\n- **Quitar repetidos**: `[...new Set(arr)]`.\n- **Preguntar si algo ya se vio**, en O(1), dentro de un ciclo.\n\nCon eso, «¿hay repetidos?» se contesta en una pasada: si el conjunto queda más chico que el arreglo, algo se repitió.",
            en: "A **`Set`** is a hash table without values: just keys, each one once. It's good for two things that come up all the time:\n\n- **Removing duplicates**: `[...new Set(arr)]`.\n- **Asking whether you've seen something already**, in O(1), inside a loop.\n\nWith that, \"are there duplicates?\" is answered in one pass: if the set ends up smaller than the array, something repeated.",
          },
          programa: {
            codigo: {
              es: "const visitas = [\"Ana\", \"Beto\", \"Ana\", \"Caro\", \"Beto\", \"Ana\"];\nconst unicos = new Set(visitas);\nconsole.log(unicos);\nconsole.log([...unicos]);\nconsole.log(\"¿hubo repetidos?\", unicos.size < visitas.length);\n\n// El primero que se repite, en una sola pasada\nconst vistos = new Set();\nfor (const nombre of visitas) {\n  if (vistos.has(nombre)) {\n    console.log(\"primer repetido:\", nombre);\n    break;\n  }\n  vistos.add(nombre);\n}",
              en: "const visitas = [\"Ana\", \"Beto\", \"Ana\", \"Caro\", \"Beto\", \"Ana\"];\nconst unicos = new Set(visitas);\nconsole.log(unicos);\nconsole.log([...unicos]);\nconsole.log(\"any duplicates?\", unicos.size < visitas.length);\n\n// The first one to repeat, in a single pass\nconst vistos = new Set();\nfor (const nombre of visitas) {\n  if (vistos.has(nombre)) {\n    console.log(\"first duplicate:\", nombre);\n    break;\n  }\n  vistos.add(nombre);\n}",
            },
            notas: {
              es: "- El `Set` se queda con tres nombres, en el orden en que aparecieron por primera vez.\n- Como 3 < 6, sí hubo repetidos.\n- El ciclo se detiene en la tercera vuelta: «Ana» ya estaba en `vistos`.",
              en: "- The `Set` keeps three names, in the order they first appeared.\n- Since 3 < 6, there were duplicates.\n- The loop stops on the third turn: \"Ana\" was already in `vistos`.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Contar y agrupar", en: "Counting and grouping" },
          texto: {
            es: "El patrón más útil de todo el curso cabe en una línea: **contar frecuencias** con `m.set(x, (m.get(x) ?? 0) + 1)`. El `?? 0` pone cero cuando la clave aún no existe.\n\nY una variante: **agrupar** por una clave calculada. Dos palabras son anagramas si tienen las mismas letras; si ordenas sus letras, las dos dan la misma clave (`\"amor\"` y `\"roma\"` → `\"amor\"`). Así se agrupan en una pasada, sin comparar cada palabra con todas las demás.",
            en: "The most useful pattern of the whole course fits on one line: **counting frequencies** with `m.set(x, (m.get(x) ?? 0) + 1)`. The `?? 0` puts a zero when the key doesn't exist yet.\n\nAnd a variant: **grouping** by a computed key. Two words are anagrams if they have the same letters; if you sort their letters, both give the same key (`\"amor\"` and `\"roma\"` → `\"amor\"`). That way they group in one pass, without comparing each word with all the others.",
          },
          programa: {
            codigo: {
              es: "// Contar letras\nconst cuenta = new Map();\nfor (const letra of \"banana\") {\n  cuenta.set(letra, (cuenta.get(letra) ?? 0) + 1);\n}\nconsole.log(cuenta);\n\n// Agrupar anagramas: la clave es la palabra con sus letras ordenadas\nconst palabras = [\"amor\", \"roma\", \"saco\", \"mora\", \"cosa\", \"luna\"];\nconst grupos = new Map();\nfor (const p of palabras) {\n  const clave = [...p].sort().join(\"\");\n  if (!grupos.has(clave)) grupos.set(clave, []);\n  grupos.get(clave).push(p);\n}\nconsole.log([...grupos.values()]);",
              en: "// Count letters\nconst cuenta = new Map();\nfor (const letra of \"banana\") {\n  cuenta.set(letra, (cuenta.get(letra) ?? 0) + 1);\n}\nconsole.log(cuenta);\n\n// Group anagrams: the key is the word with its letters sorted\nconst palabras = [\"amor\", \"roma\", \"saco\", \"mora\", \"cosa\", \"luna\"];\nconst grupos = new Map();\nfor (const p of palabras) {\n  const clave = [...p].sort().join(\"\");\n  if (!grupos.has(clave)) grupos.set(clave, []);\n  grupos.get(clave).push(p);\n}\nconsole.log([...grupos.values()]);",
            },
            notas: {
              es: "- «banana»: tres `a`, dos `n` y una `b`.\n- Salen tres grupos: amor/roma/mora, saco/cosa y luna sola. Cada palabra se tocó una vez.",
              en: "- \"banana\": three `a`, two `n` and one `b`.\n- Three groups come out: amor/roma/mora, saco/cosa and luna alone. Each word was touched once.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Two Sum: guardar lo que te falta", en: "Two Sum: remember what you're missing" },
          texto: {
            es: "Un clásico de entrevista: dado un arreglo y un objetivo, encuentra las posiciones de dos números que sumen el objetivo. Con dos ciclos es O(n²). Con un `Map` es O(n):\n\nAl ver cada número `x`, preguntas si ya viste a su **complemento** `objetivo - x`. Si sí, ahí está la pareja; si no, guardas `x` con su posición y sigues. Cambias memoria por tiempo, que es casi siempre lo que hace una tabla hash.",
            en: "An interview classic: given an array and a target, find the positions of two numbers that add up to the target. With two loops it's O(n²). With a `Map` it's O(n):\n\nWhen you see each number `x`, ask whether you've already seen its **complement** `objetivo - x`. If so, there's the pair; if not, store `x` with its position and move on. You trade memory for time, which is almost always what a hash table does.",
          },
          programa: {
            codigo: {
              es: "function dosSuma(nums, objetivo) {\n  const vistos = new Map();          // número -> posición\n  for (let i = 0; i < nums.length; i++) {\n    const falta = objetivo - nums[i];\n    if (vistos.has(falta)) return [vistos.get(falta), i];\n    vistos.set(nums[i], i);\n  }\n  return null;\n}\n\nconsole.log(dosSuma([2, 7, 11, 15], 9));\nconsole.log(dosSuma([3, 2, 4], 6));\nconsole.log(dosSuma([1, 2], 10));",
              en: "function dosSuma(nums, objetivo) {\n  const vistos = new Map();          // number -> position\n  for (let i = 0; i < nums.length; i++) {\n    const falta = objetivo - nums[i];\n    if (vistos.has(falta)) return [vistos.get(falta), i];\n    vistos.set(nums[i], i);\n  }\n  return null;\n}\n\nconsole.log(dosSuma([2, 7, 11, 15], 9));\nconsole.log(dosSuma([3, 2, 4], 6));\nconsole.log(dosSuma([1, 2], 10));",
            },
            notas: {
              es: "- `[0, 1]`: 2 + 7 = 9. Al llegar al 7, el 2 ya estaba guardado.\n- `[1, 2]`: 2 + 4. El 3 no se usa con él mismo, porque se pregunta **antes** de guardarlo.\n- `null` cuando no hay pareja.",
              en: "- `[0, 1]`: 2 + 7 = 9. When the 7 arrives, the 2 is already stored.\n- `[1, 2]`: 2 + 4. The 3 isn't paired with itself, because you ask **before** storing it.\n- `null` when there's no pair.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué imprime?", en: "What does it print?" },
          codigo: "console.log(new Set([1, 1, 2, 3, 3, 3]).size);",
          opciones: ["2", "3", "6", "undefined"],
          correcta: 1,
          porque: { es: "Un `Set` guarda cada valor una vez: quedan 1, 2 y 3. Su tamaño es `size`, 3.", en: "A `Set` stores each value once: 1, 2 and 3 remain. Its size is `size`, 3." },
        },
        {
          tipo: "elige",
          pregunta: { es: "Tienes que preguntar 100 000 veces si un número está entre otros 100 000. ¿Qué conviene?", en: "You need to ask 100,000 times whether a number is among another 100,000. What's best?" },
          opciones: [
            { es: "`arr.includes(x)` cada vez", en: "`arr.includes(x)` every time" },
            { es: "Meterlos una vez en un `Set` y usar `has`", en: "Put them in a `Set` once and use `has`" },
            { es: "Ordenar el arreglo cada vez que preguntas", en: "Sort the array every time you ask" },
          ],
          correcta: 1,
          porque: { es: "`includes` es O(n) por pregunta: 100 000 × 100 000 pasos. Armar el `Set` cuesta O(n) una vez y luego cada `has` es O(1).", en: "`includes` is O(n) per question: 100,000 × 100,000 steps. Building the `Set` costs O(n) once, and then each `has` is O(1)." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa el conteo de frecuencias.", en: "Complete the frequency count." },
          codigo: "const cuenta = new Map();\nfor (const x of datos) {\n  cuenta.___(x, (cuenta.___(x) ?? 0) + 1);\n}",
          huecos: ["set", "get"],
          banco: ["set", "get", "has", "add", "push"],
          porque: { es: "Se **lee** la cuenta actual con `get` (o 0 si no hay) y se **escribe** la nueva con `set`. `add` es de `Set` y `push` de los arreglos.", en: "You **read** the current count with `get` (or 0 if missing) and **write** the new one with `set`. `add` belongs to `Set` and `push` to arrays." },
        },
        {
          tipo: "elige",
          pregunta: { es: "Para agrupar anagramas en un `Map`, ¿qué clave usarías para cada palabra?", en: "To group anagrams in a `Map`, what key would you use for each word?" },
          opciones: [
            { es: "La palabra con sus letras ordenadas", en: "The word with its letters sorted" },
            { es: "El largo de la palabra", en: "The word's length" },
            { es: "La primera letra", en: "The first letter" },
            { es: "La palabra tal cual", en: "The word as is" },
          ],
          correcta: 0,
          porque: { es: "Los anagramas tienen las mismas letras en otro orden; al ordenarlas, todos dan la misma clave. El largo o la primera letra juntarían palabras que no son anagramas.", en: "Anagrams have the same letters in a different order; sorted, they all give the same key. Length or first letter would lump together words that aren't anagrams." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `hayRepetidos(arr)`: devuelve `true` si algún valor aparece más de una vez y `false` si no. Hazlo en O(n) con un `Set`.",
            en: "Write `hayRepetidos(arr)`: return `true` if any value appears more than once and `false` otherwise. Do it in O(n) with a `Set`.",
          },
          inicial: {
            es: "function hayRepetidos(arr) {\n  // tu código aquí\n}\n\nconsole.log(hayRepetidos([1, 2, 3, 1]));",
            en: "function hayRepetidos(arr) {\n  // your code here\n}\n\nconsole.log(hayRepetidos([1, 2, 3, 1]));",
          },
          pruebas: [
            { llamada: "hayRepetidos([1, 2, 3, 1])", espera: "true" },
            { llamada: "hayRepetidos([1, 2, 3, 4])", espera: "false" },
            { llamada: "hayRepetidos([])", espera: "false" },
            { llamada: "hayRepetidos([\"a\", \"b\", \"a\"])", espera: "true" },
          ],
          solucion: "function hayRepetidos(arr) {\n  return new Set(arr).size < arr.length;\n}",
          porque: { es: "Si el conjunto queda más chico que el arreglo, algo se repitió. También vale el ciclo con `vistos.has`, que además se detiene en cuanto encuentra el primero.", en: "If the set ends up smaller than the array, something repeated. The loop with `vistos.has` works too, and it stops as soon as it finds the first one." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `sonAnagramas(a, b)`: `true` si las dos palabras tienen exactamente las mismas letras, las mismas veces. Cuenta las letras de `a` con un `Map` y descuéntalas con las de `b`.",
            en: "Write `sonAnagramas(a, b)`: `true` if both words have exactly the same letters, the same number of times. Count the letters of `a` with a `Map` and subtract the letters of `b`.",
          },
          inicial: {
            es: "function sonAnagramas(a, b) {\n  if (a.length !== b.length) return false;\n  const cuenta = new Map();\n  // suma las de a, resta las de b\n}\n\nconsole.log(sonAnagramas(\"amor\", \"roma\"));",
            en: "function sonAnagramas(a, b) {\n  if (a.length !== b.length) return false;\n  const cuenta = new Map();\n  // add a's letters, subtract b's\n}\n\nconsole.log(sonAnagramas(\"amor\", \"roma\"));",
          },
          pruebas: [
            { llamada: "sonAnagramas(\"amor\", \"roma\")", espera: "true" },
            { llamada: "sonAnagramas(\"perro\", \"porre\")", espera: "true" },
            { llamada: "sonAnagramas(\"gato\", \"toga\")", espera: "true" },
            { llamada: "sonAnagramas(\"casa\", \"saco\")", espera: "false" },
            { llamada: "sonAnagramas(\"ola\", \"hola\")", espera: "false" },
          ],
          solucion: "function sonAnagramas(a, b) {\n  if (a.length !== b.length) return false;\n  const cuenta = new Map();\n  for (const l of a) cuenta.set(l, (cuenta.get(l) ?? 0) + 1);\n  for (const l of b) {\n    if (!cuenta.get(l)) return false;\n    cuenta.set(l, cuenta.get(l) - 1);\n  }\n  return true;\n}",
          porque: { es: "Suma las letras de una palabra y réstalas con la otra; si en algún momento falta una letra, no son anagramas. Es O(n), contra O(n log n) de ordenar las dos y compararlas.", en: "Add one word's letters and subtract the other's; if at any point a letter is missing, they're not anagrams. That's O(n), versus O(n log n) for sorting both and comparing." },
        },
      ],
    },
  ],
};
