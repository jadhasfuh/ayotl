import type { Unidad } from "../tipos";

// El trie que comparten las tarjetas de la primera lección: cada programa
// corre solo, así que cada uno lo trae completo.
const TRIE = "class NodoTrie {\n  constructor() {\n    this.hijos = new Map();\n    this.fin = false;\n  }\n}\n\nfunction insertar(raiz, palabra) {\n  let nodo = raiz;\n  for (const letra of palabra) {\n    if (!nodo.hijos.has(letra)) nodo.hijos.set(letra, new NodoTrie());\n    nodo = nodo.hijos.get(letra);\n  }\n  nodo.fin = true;\n}\n";

const BAJAR = "function bajar(raiz, texto) {\n  let nodo = raiz;\n  for (const letra of texto) {\n    nodo = nodo.hijos.get(letra);\n    if (!nodo) return null;\n  }\n  return nodo;\n}\n";

const UF = "function crear(n) {\n  return { padre: Array.from({ length: n }, (_, i) => i), tam: new Array(n).fill(1) };\n}\n\nfunction encontrar(uf, x) {\n  if (uf.padre[x] !== x) uf.padre[x] = encontrar(uf, uf.padre[x]);\n  return uf.padre[x];\n}\n\nfunction unir(uf, a, b) {\n  let ra = encontrar(uf, a), rb = encontrar(uf, b);\n  if (ra === rb) return false;\n  if (uf.tam[ra] < uf.tam[rb]) [ra, rb] = [rb, ra];\n  uf.padre[rb] = ra;\n  uf.tam[ra] += uf.tam[rb];\n  return true;\n}\n";

export const U11: Unidad = {
  id: "avanzadas",
  titulo: { es: "Estructuras avanzadas", en: "Advanced structures" },
  lecciones: [
    {
      id: "trie",
      titulo: { es: "Trie: el árbol de los prefijos", en: "Trie: the prefix tree" },
      resumen: {
        es: "Un árbol con una letra por arista: buscar palabras y autocompletar sin importar cuántas haya guardadas.",
        en: "A tree with one letter per edge: find words and autocomplete no matter how many are stored.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Una letra por paso", en: "One letter per step" },
          texto: {
            es: "Un **trie** (se dice como *try*) guarda palabras repartiendo sus letras en un árbol: cada nodo tiene un `Map` de **hijos**, uno por cada letra que puede seguir, y una marca `fin` que dice «aquí termina una palabra».\n\nLas palabras que empiezan igual **comparten camino**: «sol», «sopa» y «sopes» pasan por la misma `s` y la misma `o`, y se separan después. Por eso el trie es la estructura del autocompletado y de los diccionarios.",
            en: "A **trie** (pronounced *try*) stores words by spreading their letters across a tree: each node has a `Map` of **children**, one for each letter that can come next, and a `fin` flag that says \"a word ends here\".\n\nWords that start the same way **share a path**: \"sol\", \"sopa\" and \"sopes\" go through the same `s` and the same `o`, and split later. That's why the trie is the structure behind autocomplete and dictionaries.",
          },
          programa: {
            codigo: TRIE + "\nconst raiz = new NodoTrie();\nfor (const p of [\"sol\", \"sopa\", \"sopes\", \"salsa\"]) insertar(raiz, p);\n\nconsole.log([...raiz.hijos.keys()]);\nconsole.log([...raiz.hijos.get(\"s\").hijos.keys()]);\nconsole.log([...raiz.hijos.get(\"s\").hijos.get(\"o\").hijos.keys()]);",
            notas: {
              es: "- De la raíz sale una sola letra, `s`: las cuatro palabras empiezan con ella.\n- Después de la `s` hay dos caminos: `o` (sol, sopa, sopes) y `a` (salsa).\n- Después de «so» se separan otra vez: `l` para «sol» y `p` para «sopa» y «sopes».",
              en: "- Only one letter leaves the root, `s`: all four words start with it.\n- After the `s` there are two paths: `o` (sol, sopa, sopes) and `a` (salsa).\n- After \"so\" they split again: `l` for \"sol\" and `p` for \"sopa\" and \"sopes\".",
            },
          },
          enlaces: [{ url: "https://es.wikipedia.org/wiki/Trie", texto: { es: "Trie (Wikipedia)", en: "Trie (Wikipedia, Spanish)" } }],
        },
        {
          tipo: "explica",
          titulo: { es: "¿Es palabra o sólo el principio de una?", en: "Is it a word or just the start of one?" },
          texto: {
            es: "Buscar es bajar letra por letra. Si en algún punto falta el hijo, la palabra no está. Si llegas al final, todavía falta una pregunta: ¿ese nodo tiene `fin`? «sop» existe como camino, pero nadie guardó «sop» como palabra.\n\nLo importante es el costo: bajar cuesta **O(largo de la palabra)**. Da igual si el trie tiene cuatro palabras o cien mil.",
            en: "Searching means going down letter by letter. If a child is missing at any point, the word isn't there. If you reach the end, there's still one question: does that node have `fin`? \"sop\" exists as a path, but nobody stored \"sop\" as a word.\n\nWhat matters is the cost: going down costs **O(length of the word)**. It doesn't matter whether the trie holds four words or a hundred thousand.",
          },
          programa: {
            codigo: TRIE + "\n" + BAJAR + "\nconst existe = (raiz, p) => { const n = bajar(raiz, p); return n !== null && n.fin; };\nconst empiezaCon = (raiz, pre) => bajar(raiz, pre) !== null;\n\nconst raiz = new NodoTrie();\nfor (const p of [\"sol\", \"sopa\", \"sopes\", \"salsa\"]) insertar(raiz, p);\n\nconsole.log(existe(raiz, \"sopa\"));\nconsole.log(existe(raiz, \"sop\"));\nconsole.log(empiezaCon(raiz, \"sop\"));\nconsole.log(existe(raiz, \"taco\"));",
            notas: {
              es: "- «sopa» está: el camino existe y su último nodo tiene `fin`.\n- «sop» no es palabra (`false`), pero **sí** es prefijo (`true`): el camino existe, la marca no.\n- «taco» se cae en la primera letra: de la raíz no sale ninguna `t`.",
              en: "- \"sopa\" is there: the path exists and its last node has `fin`.\n- \"sop\" is not a word (`false`), but it **is** a prefix (`true`): the path exists, the flag doesn't.\n- \"taco\" fails on the first letter: no `t` leaves the root.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Autocompletar", en: "Autocomplete" },
          texto: {
            es: "Para sugerir palabras, primero bajas hasta el nodo del prefijo y desde ahí recorres **todo lo que cuelga** (un recorrido en profundidad), juntando cada camino que llegue a un `fin`.\n\nEl trabajo depende de cuántas sugerencias hay, no del tamaño del diccionario: lo que no empieza con el prefijo ni se toca.",
            en: "To suggest words, first go down to the prefix's node, and from there walk **everything hanging below it** (a depth-first walk), collecting every path that reaches a `fin`.\n\nThe work depends on how many suggestions there are, not on the size of the dictionary: anything that doesn't start with the prefix isn't even touched.",
          },
          programa: {
            codigo: TRIE + "\n" + BAJAR + "\nfunction autocompletar(raiz, prefijo) {\n  const res = [];\n  function juntar(nodo, camino) {\n    if (nodo.fin) res.push(camino);\n    for (const [letra, hijo] of nodo.hijos) juntar(hijo, camino + letra);\n  }\n  const nodo = bajar(raiz, prefijo);\n  if (nodo) juntar(nodo, prefijo);\n  return res;\n}\n\nconst raiz = new NodoTrie();\nfor (const p of [\"sol\", \"sopa\", \"sopes\", \"sal\", \"salsa\"]) insertar(raiz, p);\n\nconsole.log(autocompletar(raiz, \"sop\"));\nconsole.log(autocompletar(raiz, \"sal\"));\nconsole.log(autocompletar(raiz, \"x\"));",
            notas: {
              es: "- «sop» sugiere «sopa» y «sopes».\n- «sal» se sugiere a sí misma (su nodo tiene `fin`) y luego a «salsa», que cuelga de ella.\n- «x» no lleva a ningún nodo: arreglo vacío.",
              en: "- \"sop\" suggests \"sopa\" and \"sopes\".\n- \"sal\" suggests itself (its node has `fin`) and then \"salsa\", which hangs below it.\n- \"x\" leads to no node: empty array.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "Un trie guarda 100 000 palabras. ¿De qué depende el costo de buscar «taco»?", en: "A trie holds 100,000 words. What does the cost of searching for \"taco\" depend on?" },
          opciones: [
            { es: "Del número de palabras guardadas", en: "On the number of stored words" },
            { es: "Del largo de «taco»: cuatro letras, cuatro pasos", en: "On the length of \"taco\": four letters, four steps" },
            { es: "Del logaritmo del número de palabras", en: "On the logarithm of the number of words" },
            { es: "De cuántas palabras empiezan con «t»", en: "On how many words start with \"t\"" },
          ],
          correcta: 1,
          porque: { es: "Se baja una letra por paso y cada paso es una consulta a un `Map`, O(1). Son tantos pasos como letras tiene lo que buscas.", en: "You go down one letter per step and each step is a `Map` lookup, O(1). There are as many steps as letters in what you're looking for." },
        },
        {
          tipo: "elige",
          pregunta: { es: "En un trie donde sólo se insertó «sopa», ¿qué contesta `existe(raiz, \"sop\")`?", en: "In a trie where only \"sopa\" was inserted, what does `existe(raiz, \"sop\")` return?" },
          opciones: ["true", "false", "null", "\"sopa\""],
          correcta: 1,
          porque: { es: "El camino s-o-p existe, pero el nodo de la `p` no tiene `fin`: nadie guardó «sop» como palabra. Es prefijo, no palabra.", en: "The s-o-p path exists, but the `p` node has no `fin`: nobody stored \"sop\" as a word. It's a prefix, not a word." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa `insertar`: crear el hijo si falta, bajar a él y marcar el final.", en: "Fill in `insertar`: create the child if it's missing, go down into it and mark the end." },
          codigo: "for (const letra of palabra) {\n  if (!nodo.hijos.___(letra)) nodo.hijos.set(letra, new NodoTrie());\n  nodo = nodo.hijos.___(letra);\n}\nnodo.___ = true;",
          huecos: ["has", "get", "fin"],
          banco: ["has", "get", "fin", "add", "size", "push"],
          porque: { es: "`has` pregunta si ya existe el hijo, `get` baja a él y `fin = true` marca que ahí termina una palabra. Sin esa marca, el trie no distinguiría «sol» de «so».", en: "`has` asks whether the child exists, `get` goes down into it and `fin = true` marks that a word ends there. Without that flag, the trie couldn't tell \"sol\" from \"so\"." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `contarPrefijo(raiz, prefijo)`: cuántas palabras del trie empiezan con `prefijo` (contando la palabra misma si existe). Ya tienes `NodoTrie` e `insertar`.",
            en: "Write `contarPrefijo(raiz, prefijo)`: how many words in the trie start with `prefijo` (counting the word itself if it exists). You already have `NodoTrie` and `insertar`.",
          },
          inicial: {
            es: TRIE + "\nfunction contarPrefijo(raiz, prefijo) {\n  // 1. baja hasta el nodo del prefijo (si falta una letra, son 0)\n  // 2. cuenta los fin que cuelgan de ahí\n}\n\nconst raiz = new NodoTrie();\nfor (const p of [\"sol\", \"sopa\", \"sopes\", \"salsa\"]) insertar(raiz, p);\nconsole.log(contarPrefijo(raiz, \"sop\"));",
            en: TRIE + "\nfunction contarPrefijo(raiz, prefijo) {\n  // 1. go down to the prefix's node (if a letter is missing, it's 0)\n  // 2. count the fin flags hanging from there\n}\n\nconst raiz = new NodoTrie();\nfor (const p of [\"sol\", \"sopa\", \"sopes\", \"salsa\"]) insertar(raiz, p);\nconsole.log(contarPrefijo(raiz, \"sop\"));",
          },
          pruebas: [
            { llamada: "(() => { const r = new NodoTrie(); for (const p of [\"sol\", \"sopa\", \"sopes\", \"salsa\"]) insertar(r, p); return contarPrefijo(r, \"sop\"); })()", espera: "2" },
            { llamada: "(() => { const r = new NodoTrie(); for (const p of [\"sol\", \"sopa\", \"sopes\", \"salsa\"]) insertar(r, p); return contarPrefijo(r, \"s\"); })()", espera: "4" },
            { llamada: "(() => { const r = new NodoTrie(); for (const p of [\"sol\", \"sopa\", \"sopes\", \"salsa\"]) insertar(r, p); return contarPrefijo(r, \"sol\"); })()", espera: "1" },
            { llamada: "(() => { const r = new NodoTrie(); for (const p of [\"sol\", \"sopa\"]) insertar(r, p); return contarPrefijo(r, \"x\"); })()", espera: "0" },
          ],
          solucion: TRIE + "\nfunction contarPrefijo(raiz, prefijo) {\n  let nodo = raiz;\n  for (const letra of prefijo) {\n    nodo = nodo.hijos.get(letra);\n    if (!nodo) return 0;\n  }\n  function contar(n) {\n    let total = n.fin ? 1 : 0;\n    for (const hijo of n.hijos.values()) total += contar(hijo);\n    return total;\n  }\n  return contar(nodo);\n}",
          porque: { es: "Es el autocompletar sin juntar las palabras: bajar por el prefijo y contar cada `fin` del subárbol. Muchos tries guardan ese conteo en cada nodo al insertar, para contestar en O(largo del prefijo).", en: "It's autocomplete without collecting the words: go down the prefix and count every `fin` in the subtree. Many tries store that count in each node while inserting, to answer in O(length of the prefix)." },
        },
      ],
    },
    {
      id: "union-find",
      titulo: { es: "Union-Find: ¿están en el mismo grupo?", en: "Union-Find: are they in the same group?" },
      resumen: {
        es: "Conjuntos disjuntos con un solo arreglo de padres: unir grupos y preguntar si dos cosas están juntas, casi en O(1).",
        en: "Disjoint sets with a single array of parents: merge groups and ask whether two things are together, almost in O(1).",
      },
      retos: ["number-of-islands"],
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Cada quien apunta a su jefe", en: "Everyone points to their boss" },
          texto: {
            es: "**Union-Find** (o conjuntos disjuntos) contesta dos cosas: **unir** dos grupos y **encontrar** a qué grupo pertenece alguien. Sirve para redes de amigos, para saber si dos puntos de un mapa están conectados y en el algoritmo de Kruskal.\n\nTodo cabe en un arreglo `padre`: al principio cada elemento es su propio padre (un grupo de uno). Unir es colgar la **raíz** de un grupo de la raíz del otro. Encontrar es subir de padre en padre hasta la raíz, que es la que representa al grupo.",
            en: "**Union-Find** (or disjoint sets) answers two things: **merge** two groups and **find** which group something belongs to. It's used for friend networks, for knowing whether two points on a map are connected, and in Kruskal's algorithm.\n\nIt all fits in a `padre` (parent) array: at first each element is its own parent (a group of one). Merging hangs one group's **root** under the other's root. Finding means climbing from parent to parent up to the root, which represents the group.",
          },
          dibujo: {
            tipo: "grafo",
            dirigido: true,
            nodos: [{ id: "0", x: 30, y: 30 }, { id: "1", x: 110, y: 30 }, { id: "2", x: 190, y: 30 }, { id: "3", x: 30, y: 110 }, { id: "4", x: 110, y: 110 }, { id: "5", x: 190, y: 110 }],
            aristas: [["0", "1"], ["1", "2"], ["3", "4"]],
            resalta: ["2", "4", "5"],
          },
          programa: {
            codigo: "const padre = [0, 1, 2, 3, 4, 5];\n\nfunction encontrar(x) {\n  while (padre[x] !== x) x = padre[x];\n  return x;\n}\nfunction unir(a, b) {\n  padre[encontrar(a)] = encontrar(b);\n}\n\nunir(0, 1);\nunir(1, 2);\nunir(3, 4);\nconsole.log(padre);\nconsole.log(encontrar(0) === encontrar(2));\nconsole.log(encontrar(0) === encontrar(3));",
            notas: {
              es: "- El arreglo queda `[1, 2, 2, 4, 4, 5]`: el 0 apunta al 1, el 1 al 2, el 3 al 4. Las raíces (2, 4 y 5) se apuntan a sí mismas, y son las resaltadas en el dibujo.\n- 0 y 2 tienen la misma raíz: mismo grupo. 0 y 3, no.",
              en: "- The array ends up `[1, 2, 2, 4, 4, 5]`: 0 points to 1, 1 to 2, 3 to 4. The roots (2, 4 and 5) point to themselves, and they're the ones highlighted in the drawing.\n- 0 and 2 share a root: same group. 0 and 3 don't.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Dos trucos: comprimir y colgar al chico", en: "Two tricks: compress, and hang the small one" },
          texto: {
            es: "La versión sencilla puede formar cadenas largas (0→1→2→3→…) y entonces encontrar cuesta O(n). Se arregla con dos ideas:\n\n- **Compresión de caminos:** al encontrar la raíz, cada nodo del camino se cuelga **directo** de ella. La siguiente vez es un solo salto.\n- **Unir por tamaño:** el grupo chico se cuelga del grande, nunca al revés, para que el árbol no crezca en altura.\n\nCon las dos, cada operación cuesta en la práctica **casi O(1)** (el costo real es la función inversa de Ackermann, que no pasa de 4 para cualquier tamaño que quepa en una computadora).",
            en: "The simple version can form long chains (0→1→2→3→…), and then finding costs O(n). Two ideas fix it:\n\n- **Path compression:** when you find the root, every node on the way gets hung **directly** from it. Next time it's a single jump.\n- **Union by size:** the small group hangs from the big one, never the other way around, so the tree doesn't grow taller.\n\nWith both, each operation costs **almost O(1)** in practice (the real cost is the inverse Ackermann function, which never exceeds 4 for any size that fits in a computer).",
          },
          programa: {
            codigo: UF + "\nconst uf = crear(8);\nunir(uf, 0, 1);\nunir(uf, 2, 3);\nunir(uf, 1, 3);\nunir(uf, 4, 5);\nconsole.log(uf.padre);\n\nconsole.log(encontrar(uf, 3) === encontrar(uf, 0));\nconsole.log(uf.padre);\nconsole.log(unir(uf, 0, 2));",
            notas: {
              es: "- Antes de buscar, el 3 todavía apunta al 2 (`[0, 0, 0, 2, …]`).\n- Después de `encontrar(uf, 3)`, el 3 ya apunta **directo** al 0: eso es la compresión de caminos.\n- `unir(uf, 0, 2)` da `false`: ya estaban en el mismo grupo y no hay nada que unir.",
              en: "- Before searching, 3 still points to 2 (`[0, 0, 0, 2, …]`).\n- After `encontrar(uf, 3)`, 3 points **straight** to 0: that's path compression.\n- `unir(uf, 0, 2)` returns `false`: they were already in the same group, nothing to merge.",
            },
          },
          enlaces: [
            { url: "https://visualgo.net/es/ufds", texto: { es: "Union-Find animado en VisuAlgo", en: "Union-Find animated on VisuAlgo" } },
            { url: "https://es.wikipedia.org/wiki/Estructura_de_datos_para_conjuntos_disjuntos", texto: { es: "Conjuntos disjuntos (Wikipedia)", en: "Disjoint sets (Wikipedia, Spanish)" } },
          ],
        },
        {
          tipo: "explica",
          titulo: { es: "Contar grupos", en: "Counting groups" },
          texto: {
            es: "Un uso clásico: tienes personas y una lista de amistades, y quieres saber cuántos grupos de amigos hay (contando a los amigos de tus amigos). Empiezas con `n` grupos y cada `unir` que de verdad junta dos grupos resta uno.\n\nEs el mismo problema que contar islas en un mapa: cada casilla de tierra se une con su vecina de tierra, y al final cuentas cuántas raíces quedaron.",
            en: "A classic use: you have people and a list of friendships, and you want to know how many friend groups there are (counting friends of friends). You start with `n` groups, and every `unir` that actually joins two groups subtracts one.\n\nIt's the same problem as counting islands on a map: each land cell is merged with its land neighbor, and at the end you count how many roots are left.",
          },
          programa: {
            codigo: UF + "\nconst nombres = [\"Ana\", \"Beto\", \"Caro\", \"Dani\", \"Eli\", \"Fer\"];\nconst amistades = [[0, 1], [1, 2], [3, 4]];\n\nconst uf = crear(nombres.length);\nlet grupos = nombres.length;\nfor (const [a, b] of amistades) {\n  if (unir(uf, a, b)) grupos--;\n}\nconsole.log(\"grupos:\", grupos);\n\nconst porRaiz = new Map();\nnombres.forEach((nombre, i) => {\n  const r = encontrar(uf, i);\n  if (!porRaiz.has(r)) porRaiz.set(r, []);\n  porRaiz.get(r).push(nombre);\n});\nconsole.log([...porRaiz.values()]);",
            notas: {
              es: "Tres grupos: Ana, Beto y Caro (Ana y Caro no son amigas directas, pero comparten a Beto); Dani y Eli; y Fer, sola.",
              en: "Three groups: Ana, Beto and Caro (Ana and Caro aren't direct friends, but they share Beto); Dani and Eli; and Fer, alone.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué hace la compresión de caminos?", en: "What does path compression do?" },
          opciones: [
            { es: "Borra los grupos que ya no se usan", en: "Deletes groups that are no longer used" },
            { es: "Cuelga cada nodo del camino directo de la raíz al encontrarla", en: "Hangs every node on the path directly from the root when it finds it" },
            { es: "Ordena el arreglo de padres", en: "Sorts the parent array" },
            { es: "Une siempre el grupo grande dentro del chico", en: "Always merges the big group into the small one" },
          ],
          correcta: 1,
          porque: { es: "Al subir hasta la raíz, se aprovecha el viaje: cada nodo visitado queda apuntando directo a ella, y la próxima búsqueda es de un salto. Lo de colgar el chico del grande es el otro truco, unir por tamaño.", en: "On the way up to the root, it makes use of the trip: every visited node ends up pointing straight at it, and the next search is a single jump. Hanging the small group from the big one is the other trick, union by size." },
        },
        {
          tipo: "elige",
          pregunta: { es: "Hay 5 elementos, del 0 al 4. ¿Cuántos grupos quedan después de esto?", en: "There are 5 elements, 0 to 4. How many groups are left after this?" },
          codigo: "unir(uf, 0, 1);\nunir(uf, 2, 3);\nunir(uf, 1, 0);",
          opciones: ["1", "2", "3", "4"],
          correcta: 2,
          porque: { es: "Empiezan 5 grupos. `0-1` junta dos (quedan 4), `2-3` junta otros dos (quedan 3) y `1-0` ya estaban juntos: no cambia nada. Quedan {0,1}, {2,3} y {4}.", en: "You start with 5 groups. `0-1` merges two (4 left), `2-3` merges two more (3 left), and `1-0` were already together: nothing changes. What's left: {0,1}, {2,3} and {4}." },
        },
        {
          tipo: "ordena",
          pregunta: { es: "Ordena `encontrar` con compresión de caminos.", en: "Put `encontrar` with path compression in order." },
          lineas: ["function encontrar(uf, x) {", "  if (uf.padre[x] !== x)", "    uf.padre[x] = encontrar(uf, uf.padre[x]);", "  return uf.padre[x];", "}"],
          porque: { es: "Si `x` no es raíz, se busca la raíz de su padre y `x` se cuelga directo de ella; al final se devuelve el padre de `x`, que ya es la raíz.", en: "If `x` isn't a root, find its parent's root and hang `x` straight from it; finally return `x`'s parent, which is now the root." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa la unión por tamaño: el grupo chico (`rb`) se cuelga del grande (`ra`).", en: "Complete union by size: the small group (`rb`) hangs from the big one (`ra`)." },
          codigo: "if (uf.tam[ra] < uf.tam[rb]) [ra, rb] = [rb, ra];\nuf.padre[___] = ___;\nuf.tam[ra] += uf.tam[___];",
          huecos: ["rb", "ra", "rb"],
          banco: ["rb", "ra", "rb", "padre", "tam"],
          porque: { es: "Después del intercambio, `ra` es el grande: la raíz chica `rb` pasa a tener a `ra` de padre y el tamaño de `ra` suma el de `rb`.", en: "After the swap, `ra` is the big one: the small root `rb` gets `ra` as its parent, and `ra`'s size adds `rb`'s." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `contarGrupos(n, pares)`: hay `n` personas (de 0 a n-1) y `pares` dice quién es amigo de quién. Devuelve cuántos grupos de amigos hay.",
            en: "Write `contarGrupos(n, pares)`: there are `n` people (0 to n-1) and `pares` says who's friends with whom. Return how many friend groups there are.",
          },
          inicial: {
            es: "function contarGrupos(n, pares) {\n  const padre = Array.from({ length: n }, (_, i) => i);\n  // escribe encontrar, une cada par y cuenta\n}\n\nconsole.log(contarGrupos(4, [[0, 1], [2, 3]]));",
            en: "function contarGrupos(n, pares) {\n  const padre = Array.from({ length: n }, (_, i) => i);\n  // write encontrar, merge each pair and count\n}\n\nconsole.log(contarGrupos(4, [[0, 1], [2, 3]]));",
          },
          pruebas: [
            { llamada: "contarGrupos(4, [[0, 1], [2, 3]])", espera: "2" },
            { llamada: "contarGrupos(5, [])", espera: "5" },
            { llamada: "contarGrupos(3, [[0, 1], [1, 2], [0, 2]])", espera: "1" },
            { llamada: "contarGrupos(6, [[0, 1], [1, 2], [3, 4]])", espera: "3" },
          ],
          solucion: "function contarGrupos(n, pares) {\n  const padre = Array.from({ length: n }, (_, i) => i);\n  function encontrar(x) {\n    if (padre[x] !== x) padre[x] = encontrar(padre[x]);\n    return padre[x];\n  }\n  let grupos = n;\n  for (const [a, b] of pares) {\n    const ra = encontrar(a), rb = encontrar(b);\n    if (ra !== rb) {\n      padre[ra] = rb;\n      grupos--;\n    }\n  }\n  return grupos;\n}",
          porque: { es: "Cada par que une dos raíces distintas resta un grupo; el que ya estaba junto (como `[0, 2]` en la tercera prueba) no resta nada. Esa revisión `ra !== rb` es todo el secreto.", en: "Each pair that joins two different roots subtracts one group; one that was already together (like `[0, 2]` in the third test) subtracts nothing. That `ra !== rb` check is the whole secret." },
        },
      ],
    },
    {
      id: "sumas-por-rango",
      titulo: { es: "Sumas por rango: prefijos y Fenwick", en: "Range sums: prefixes and Fenwick" },
      resumen: {
        es: "Sumar cualquier tramo de un arreglo en O(1) con sumas prefijas, y en O(log n) aunque los datos cambien, con un árbol de Fenwick.",
        en: "Sum any stretch of an array in O(1) with prefix sums, and in O(log n) even when the data changes, with a Fenwick tree.",
      },
      retos: ["product-of-array-except-self"],
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Sumas prefijas: pagar una vez, preguntar mil", en: "Prefix sums: pay once, ask a thousand times" },
          texto: {
            es: "Si te preguntan muchas veces «¿cuánto se vendió del día 2 al 5?», sumar el tramo cada vez cuesta O(n) por pregunta. Mejor preparar una vez el arreglo de **sumas prefijas**: `pre[i]` es la suma de los primeros `i` elementos, con `pre[0] = 0`.\n\nLa suma de `a` a `b` (incluidos) es entonces **`pre[b + 1] - pre[a]`**: todo hasta `b`, menos lo que había antes de `a`. Una resta, **O(1)**, sin importar qué tan largo sea el tramo.",
            en: "If you're asked many times \"how much was sold from day 2 to day 5?\", adding up the stretch every time costs O(n) per question. Better to build the **prefix sums** array once: `pre[i]` is the sum of the first `i` items, with `pre[0] = 0`.\n\nThe sum from `a` to `b` (inclusive) is then **`pre[b + 1] - pre[a]`**: everything up to `b`, minus what came before `a`. One subtraction, **O(1)**, no matter how long the stretch is.",
          },
          dibujo: { tipo: "arreglo", valores: [3, 1, 4, 1, 5, 9, 2, 6], resalta: [2, 3, 4, 5], punteros: [{ i: 2, texto: "a" }, { i: 5, texto: "b" }] },
          programa: {
            codigo: "const ventas = [3, 1, 4, 1, 5, 9, 2, 6];\nconst pre = [0];\nfor (const v of ventas) pre.push(pre[pre.length - 1] + v);\nconsole.log(pre);\n\nconst suma = (a, b) => pre[b + 1] - pre[a];\nconsole.log(suma(2, 5));\nconsole.log(suma(0, 7));",
            notas: {
              es: "- `pre` tiene un elemento más que `ventas` y crece siempre (si no hay negativos).\n- `suma(2, 5)` es `pre[6] - pre[2]` = 23 − 4 = 19, lo mismo que 4 + 1 + 5 + 9, las casillas resaltadas.\n- El total, 31, es el último de `pre`.",
              en: "- `pre` has one more item than `ventas` and only grows (when there are no negatives).\n- `suma(2, 5)` is `pre[6] - pre[2]` = 23 − 4 = 19, the same as 4 + 1 + 5 + 9, the highlighted cells.\n- The total, 31, is the last item of `pre`.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "La misma idea con productos", en: "The same idea with products" },
          texto: {
            es: "El reto «producto del arreglo excepto uno mismo» pide, para cada posición, el producto de todos los demás, **sin dividir** y en O(n). Es un pariente de las sumas prefijas: en una pasada de izquierda a derecha guardas el producto de todo lo que hay **antes**; en otra de derecha a izquierda multiplicas por todo lo que hay **después**.\n\nAsí funciona aunque haya un cero, que es justo donde dividir fallaría.",
            en: "The \"product of array except self\" challenge asks, for each position, for the product of all the others, **without dividing** and in O(n). It's a cousin of prefix sums: in a left-to-right pass you store the product of everything **before**; in a right-to-left pass you multiply by everything **after**.\n\nThis works even when there's a zero, which is exactly where dividing would fail.",
          },
          programa: {
            codigo: "function productoExceptoYo(nums) {\n  const n = nums.length;\n  const res = new Array(n).fill(1);\n  let izq = 1;\n  for (let i = 0; i < n; i++) {\n    res[i] = izq;\n    izq *= nums[i];\n  }\n  let der = 1;\n  for (let i = n - 1; i >= 0; i--) {\n    res[i] *= der;\n    der *= nums[i];\n  }\n  return res;\n}\n\nconsole.log(productoExceptoYo([1, 2, 3, 4]));\nconsole.log(productoExceptoYo([2, 0, 5]));",
            notas: {
              es: "- Para `[1, 2, 3, 4]`: 24 = 2·3·4, 12 = 1·3·4, 8 = 1·2·4 y 6 = 1·2·3.\n- Con el cero, sólo la posición del cero da algo distinto de 0: 2·5 = 10.",
              en: "- For `[1, 2, 3, 4]`: 24 = 2·3·4, 12 = 1·3·4, 8 = 1·2·4 and 6 = 1·2·3.\n- With the zero, only the zero's own position gets something other than 0: 2·5 = 10.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Cuando los datos cambian: el árbol de Fenwick", en: "When the data changes: the Fenwick tree" },
          texto: {
            es: "Las sumas prefijas tienen un problema: si cambia un valor, hay que recalcular todo lo que viene después, O(n). El **árbol de Fenwick** (o árbol binario indexado) reparte la diferencia: cada casilla `arbol[i]` guarda la suma de un tramo que **termina en `i`** y mide `i & -i`.\n\n`i & -i` es el **bit más bajo encendido** de `i`: para 6 (110 en binario) es 2, para 8 (1000) es 8, para 12 (1100) es 4. Para consultar se baja restando ese bit; para actualizar se sube sumándolo. Cada camino tiene a lo más log₂ n pasos: las dos operaciones son **O(log n)**.\n\nLos índices van desde 1, porque `0 & -0` es 0 y el ciclo nunca avanzaría.",
            en: "Prefix sums have a problem: if a value changes, everything after it must be recomputed, O(n). The **Fenwick tree** (or binary indexed tree) spreads the difference: each slot `arbol[i]` stores the sum of a stretch that **ends at `i`** and is `i & -i` long.\n\n`i & -i` is the **lowest set bit** of `i`: for 6 (110 in binary) it's 2, for 8 (1000) it's 8, for 12 (1100) it's 4. To query you go down subtracting that bit; to update you go up adding it. Each path has at most log₂ n steps: both operations are **O(log n)**.\n\nIndices start at 1, because `0 & -0` is 0 and the loop would never move.",
          },
          programa: {
            codigo: "class Fenwick {\n  constructor(n) {\n    this.arbol = new Array(n + 1).fill(0);\n  }\n  sumar(i, delta) {\n    for (; i < this.arbol.length; i += i & -i) this.arbol[i] += delta;\n  }\n  prefijo(i) {\n    let s = 0;\n    for (; i > 0; i -= i & -i) s += this.arbol[i];\n    return s;\n  }\n  rango(a, b) {\n    return this.prefijo(b) - this.prefijo(a - 1);\n  }\n}\n\nconst ventas = [3, 1, 4, 1, 5, 9, 2, 6];\nconst f = new Fenwick(ventas.length);\nventas.forEach((v, k) => f.sumar(k + 1, v));\n\nconsole.log(f.rango(3, 6));\nf.sumar(4, 10);\nconsole.log(f.rango(3, 6));\n\nfor (const i of [6, 8, 12]) console.log(i, \"& -\" + i, \"=\", i & -i);",
            notas: {
              es: "- `rango(3, 6)` cuenta desde 1: son 4 + 1 + 5 + 9 = 19.\n- Al sumarle 10 a la posición 4, el mismo rango da 29 sin reconstruir nada: `sumar` tocó sólo unas pocas casillas.\n- Los últimos renglones enseñan el bit más bajo: 2, 8 y 4.",
              en: "- `rango(3, 6)` counts from 1: that's 4 + 1 + 5 + 9 = 19.\n- After adding 10 to position 4, the same range gives 29 without rebuilding anything: `sumar` only touched a few slots.\n- The last lines show the lowest bit: 2, 8 and 4.",
            },
          },
          enlaces: [
            { url: "https://visualgo.net/es/fenwicktree", texto: { es: "Árbol de Fenwick animado en VisuAlgo", en: "Fenwick tree animated on VisuAlgo" } },
            { url: "https://es.wikipedia.org/wiki/%C3%81rbol_binario_indexado", texto: { es: "Árbol binario indexado (Wikipedia)", en: "Binary indexed tree (Wikipedia, Spanish)" } },
          ],
        },
        {
          tipo: "elige",
          pregunta: { es: "Con `nums = [2, 3, 4, 5]`, `pre` sale `[0, 2, 5, 9, 14]`. ¿Cuánto da `pre[4] - pre[1]`?", en: "With `nums = [2, 3, 4, 5]`, `pre` is `[0, 2, 5, 9, 14]`. What is `pre[4] - pre[1]`?" },
          opciones: ["7", "9", "12", "14"],
          correcta: 2,
          porque: { es: "14 − 2 = 12: es la suma de las posiciones 1 a 3, es decir 3 + 4 + 5. Todo hasta el final menos lo que había antes de la posición 1.", en: "14 − 2 = 12: it's the sum of positions 1 to 3, that is 3 + 4 + 5. Everything up to the end minus what came before position 1." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Cuánto vale `12 & -12`?", en: "What is `12 & -12`?" },
          opciones: ["1", "4", "8", "12"],
          correcta: 1,
          porque: { es: "12 en binario es 1100; su bit más bajo encendido vale 4. Eso es lo que aísla `i & -i`.", en: "12 in binary is 1100; its lowest set bit is worth 4. That's what `i & -i` isolates." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Cuándo conviene un árbol de Fenwick en vez de sumas prefijas?", en: "When is a Fenwick tree better than prefix sums?" },
          opciones: [
            { es: "Cuando los datos nunca cambian", en: "When the data never changes" },
            { es: "Cuando los valores cambian seguido y también hay que consultar seguido", en: "When values change often and you also query often" },
            { es: "Cuando el arreglo tiene menos de diez elementos", en: "When the array has fewer than ten items" },
            { es: "Cuando hay que ordenar el arreglo", en: "When the array has to be sorted" },
          ],
          correcta: 1,
          porque: { es: "Con datos fijos, las sumas prefijas ganan: O(1) por consulta. Si los valores cambian, las prefijas pagan O(n) por cambio y Fenwick sólo O(log n) en las dos operaciones.", en: "With fixed data, prefix sums win: O(1) per query. If values change, prefix sums pay O(n) per change, while Fenwick pays only O(log n) for both operations." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa las sumas prefijas y la consulta de `a` a `b`, incluidos.", en: "Complete the prefix sums and the query from `a` to `b`, inclusive." },
          codigo: "const pre = [0];\nfor (const v of nums) pre.push(pre[pre.length - ___] + v);\nconst suma = (a, b) => pre[b + ___] - pre[___];",
          huecos: ["1", "1", "a"],
          banco: ["1", "1", "a", "b", "0"],
          porque: { es: "Cada prefijo es el anterior (`pre.length - 1`) más el valor nuevo. La consulta toma todo hasta `b` (`pre[b + 1]`) y le quita lo de antes de `a` (`pre[a]`).", en: "Each prefix is the previous one (`pre.length - 1`) plus the new value. The query takes everything up to `b` (`pre[b + 1]`) and removes what came before `a` (`pre[a]`)." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `sumasRango(nums, consultas)`: cada consulta es `[a, b]` (índices desde 0, incluidos). Devuelve un arreglo con la suma de cada una, usando sumas prefijas.",
            en: "Write `sumasRango(nums, consultas)`: each query is `[a, b]` (0-based, inclusive). Return an array with the sum for each one, using prefix sums.",
          },
          inicial: {
            es: "function sumasRango(nums, consultas) {\n  // 1. arma pre\n  // 2. contesta cada consulta con una resta\n}\n\nconsole.log(sumasRango([3, 1, 4, 1, 5], [[0, 2], [1, 1]]));",
            en: "function sumasRango(nums, consultas) {\n  // 1. build pre\n  // 2. answer each query with a subtraction\n}\n\nconsole.log(sumasRango([3, 1, 4, 1, 5], [[0, 2], [1, 1]]));",
          },
          pruebas: [
            { llamada: "sumasRango([3, 1, 4, 1, 5], [[0, 2], [1, 1], [0, 4]])", espera: "[8,1,14]" },
            { llamada: "sumasRango([5, -2], [[0, 1]])", espera: "[3]" },
            { llamada: "sumasRango([7, 7, 7], [])", espera: "[]" },
          ],
          solucion: "function sumasRango(nums, consultas) {\n  const pre = [0];\n  for (const v of nums) pre.push(pre[pre.length - 1] + v);\n  return consultas.map(([a, b]) => pre[b + 1] - pre[a]);\n}",
          porque: { es: "Se paga O(n) una vez para armar `pre` y después cada consulta es una resta. Con negativos también funciona: la resta no supone nada sobre los signos.", en: "You pay O(n) once to build `pre`, and then each query is one subtraction. It works with negatives too: the subtraction assumes nothing about signs." },
        },
      ],
    },
    {
      id: "cache-lru",
      titulo: { es: "Caché LRU", en: "LRU cache" },
      resumen: {
        es: "Una memoria de tamaño fijo que olvida lo que llevas más tiempo sin usar: con un Map de JavaScript, y con mapa más lista doble.",
        en: "A fixed-size memory that forgets what you haven't used for the longest: with a JavaScript Map, and with a map plus a doubly linked list.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Olvidar lo menos reciente", en: "Forget the least recent" },
          texto: {
            es: "Una **caché** guarda resultados que costó trabajo conseguir, para no volver a pedirlos. Como no cabe todo, cuando se llena hay que sacar algo. La regla **LRU** (*least recently used*) saca lo que lleva **más tiempo sin usarse**, como las apps recientes del teléfono.\n\nEn JavaScript, un `Map` recuerda el **orden en que se metieron** las claves. Si al usar una clave la borras y la vuelves a meter, se va al final: el principio del `Map` es siempre lo más viejo.",
            en: "A **cache** stores results that took work to get, so you don't ask for them again. Since not everything fits, something has to go when it's full. The **LRU** rule (*least recently used*) removes whatever has gone **unused the longest**, like your phone's recent apps.\n\nIn JavaScript, a `Map` remembers the **order in which keys were added**. If you delete a key when you use it and add it back, it moves to the end: the start of the `Map` is always the oldest.",
          },
          programa: {
            codigo: "const m = new Map();\nm.set(\"a\", 1);\nm.set(\"b\", 2);\nm.set(\"c\", 3);\nconsole.log([...m.keys()]);\n\nm.delete(\"a\");\nm.set(\"a\", 1);\nconsole.log([...m.keys()]);\n\nconsole.log(m.keys().next().value);",
            notas: {
              es: "- Al principio el orden es el de llegada: a, b, c.\n- Borrar y volver a meter «a» la manda al final.\n- `m.keys().next().value` da la primera clave, la más vieja: «b».",
              en: "- At first the order is arrival order: a, b, c.\n- Deleting and re-adding \"a\" sends it to the end.\n- `m.keys().next().value` gives the first key, the oldest: \"b\".",
            },
          },
          enlaces: [{ url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Map", texto: { es: "Map en MDN", en: "Map on MDN (Spanish)" } }],
        },
        {
          tipo: "explica",
          titulo: { es: "LRU con un Map", en: "LRU with a Map" },
          texto: {
            es: "Con ese truco la caché sale en pocas líneas:\n\n- `get`: si la clave está, se saca y se vuelve a meter (ahora es la más reciente) y se devuelve su valor; si no, `-1`.\n- `put`: se mete al final y, si ya no cabe, se borra la primera, la más vieja.\n\nLas dos operaciones son **O(1)**.",
            en: "With that trick the cache takes just a few lines:\n\n- `get`: if the key is there, take it out and put it back (now it's the most recent) and return its value; otherwise `-1`.\n- `put`: add it at the end and, if it no longer fits, delete the first one, the oldest.\n\nBoth operations are **O(1)**.",
          },
          programa: {
            codigo: "class CacheLRU {\n  constructor(capacidad) {\n    this.capacidad = capacidad;\n    this.datos = new Map();\n  }\n  get(clave) {\n    if (!this.datos.has(clave)) return -1;\n    const valor = this.datos.get(clave);\n    this.datos.delete(clave);\n    this.datos.set(clave, valor);\n    return valor;\n  }\n  put(clave, valor) {\n    this.datos.delete(clave);\n    this.datos.set(clave, valor);\n    if (this.datos.size > this.capacidad) {\n      const masVieja = this.datos.keys().next().value;\n      this.datos.delete(masVieja);\n    }\n  }\n}\n\nconst c = new CacheLRU(2);\nc.put(\"tacos\", 30);\nc.put(\"tortas\", 45);\nconsole.log(c.get(\"tacos\"));\nc.put(\"sopes\", 25);\nconsole.log(c.get(\"tortas\"));\nconsole.log([...c.datos.keys()]);",
            notas: {
              es: "- `get(\"tacos\")` da 30 y, de paso, vuelve reciente a «tacos».\n- Al meter «sopes» ya no caben tres: sale «tortas», que era la que llevaba más tiempo sin usarse, y por eso su `get` da -1.\n- Quedan «tacos» y «sopes», de la más vieja a la más nueva.",
              en: "- `get(\"tacos\")` returns 30 and, along the way, makes \"tacos\" recent.\n- Adding \"sopes\" makes three, which doesn't fit: \"tortas\" goes, since it had been unused the longest, which is why its `get` returns -1.\n- \"tacos\" and \"sopes\" remain, oldest to newest.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "La versión clásica: mapa y lista doble", en: "The classic version: map and doubly linked list" },
          texto: {
            es: "En muchos lenguajes el mapa no guarda el orden, y la LRU se arma con dos piezas:\n\n- Una **lista doblemente enlazada** con el orden de uso: la más reciente adelante, la más vieja atrás.\n- Un **mapa** de clave a **nodo**, para llegar a cualquier nodo en O(1) sin recorrer la lista.\n\nLa lista tiene que ser **doble** porque, para sacar un nodo de en medio en O(1), hay que conocer a su anterior. Dos nodos de mentira (**centinelas**) en las puntas evitan revisar si la lista está vacía.",
            en: "In many languages a map doesn't keep order, and an LRU is built from two pieces:\n\n- A **doubly linked list** with the order of use: the most recent in front, the oldest at the back.\n- A **map** from key to **node**, to reach any node in O(1) without walking the list.\n\nThe list has to be **doubly** linked because, to remove a node from the middle in O(1), you need to know its previous node. Two dummy nodes (**sentinels**) at the ends save you from checking whether the list is empty.",
          },
          dibujo: { tipo: "lista", valores: ["d", "a", "c"], doble: true, resalta: [0] },
          programa: {
            codigo: "class Nodo {\n  constructor(clave, valor) {\n    this.clave = clave;\n    this.valor = valor;\n    this.ant = null;\n    this.sig = null;\n  }\n}\n\nclass LRU {\n  constructor(capacidad) {\n    this.capacidad = capacidad;\n    this.mapa = new Map();\n    this.cabeza = new Nodo();\n    this.cola = new Nodo();\n    this.cabeza.sig = this.cola;\n    this.cola.ant = this.cabeza;\n  }\n  quitar(n) {\n    n.ant.sig = n.sig;\n    n.sig.ant = n.ant;\n  }\n  alFrente(n) {\n    n.sig = this.cabeza.sig;\n    n.ant = this.cabeza;\n    this.cabeza.sig.ant = n;\n    this.cabeza.sig = n;\n  }\n  get(clave) {\n    const n = this.mapa.get(clave);\n    if (!n) return -1;\n    this.quitar(n);\n    this.alFrente(n);\n    return n.valor;\n  }\n  put(clave, valor) {\n    if (this.mapa.has(clave)) this.quitar(this.mapa.get(clave));\n    const n = new Nodo(clave, valor);\n    this.mapa.set(clave, n);\n    this.alFrente(n);\n    if (this.mapa.size > this.capacidad) {\n      const viejo = this.cola.ant;\n      this.quitar(viejo);\n      this.mapa.delete(viejo.clave);\n    }\n  }\n  orden() {\n    const r = [];\n    for (let n = this.cabeza.sig; n !== this.cola; n = n.sig) r.push(n.clave);\n    return r;\n  }\n}\n\nconst c = new LRU(3);\nc.put(\"a\", 1);\nc.put(\"b\", 2);\nc.put(\"c\", 3);\nconsole.log(c.orden());\nc.get(\"a\");\nconsole.log(c.orden());\nc.put(\"d\", 4);\nconsole.log(c.orden());",
            notas: {
              es: "- Aquí la lista va de la más reciente a la más vieja: después de meter a, b y c, el orden es c, b, a.\n- `get(\"a\")` mueve «a» al frente sin recorrer nada: el mapa da el nodo y la lista doble lo desengancha.\n- Al meter «d» sobra uno y sale el de atrás, «b». Es el estado del dibujo: d, a, c.",
              en: "- Here the list goes from most recent to oldest: after adding a, b and c, the order is c, b, a.\n- `get(\"a\")` moves \"a\" to the front without walking anything: the map gives the node and the doubly linked list unhooks it.\n- Adding \"d\" makes one too many, and the one at the back, \"b\", goes. That's the state in the drawing: d, a, c.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "Una caché LRU de capacidad 2 recibe esto. ¿Qué clave sale?", en: "An LRU cache with capacity 2 gets this. Which key is evicted?" },
          codigo: "c.put(\"a\", 1);\nc.put(\"b\", 2);\nc.get(\"a\");\nc.put(\"c\", 3);",
          opciones: ["\"a\"", "\"b\"", "\"c\"", "ninguna / none"],
          correcta: 1,
          porque: { es: "El `get(\"a\")` volvió reciente a «a», así que la que lleva más tiempo sin usarse es «b». Sin ese `get`, habría salido «a».", en: "The `get(\"a\")` made \"a\" recent, so the one unused the longest is \"b\". Without that `get`, \"a\" would have gone." },
        },
        {
          tipo: "elige",
          pregunta: { es: "En la versión con mapa y lista, ¿por qué la lista tiene que ser doble?", en: "In the map-plus-list version, why does the list have to be doubly linked?" },
          opciones: [
            { es: "Para ocupar menos memoria", en: "To use less memory" },
            { es: "Para sacar un nodo de en medio en O(1), hace falta su anterior", en: "To remove a node from the middle in O(1), you need its previous node" },
            { es: "Porque el mapa no puede guardar nodos simples", en: "Because the map can't store singly linked nodes" },
            { es: "Para poder ordenarla", en: "So it can be sorted" },
          ],
          correcta: 1,
          porque: { es: "Para desenganchar un nodo hay que cambiar el `sig` de su anterior. En una lista simple, encontrar al anterior obliga a recorrer: O(n). Con `ant` es un salto.", en: "To unhook a node you have to change its previous node's `sig`. In a singly linked list, finding the previous one means walking the list: O(n). With `ant` it's one jump." },
        },
        {
          tipo: "ordena",
          pregunta: { es: "Ordena el `get` de la caché con `Map`.", en: "Put the `Map` cache's `get` in order." },
          lineas: ["if (!this.datos.has(clave)) return -1;", "const valor = this.datos.get(clave);", "this.datos.delete(clave);", "this.datos.set(clave, valor);", "return valor;"],
          porque: { es: "Primero el caso de que no esté. Luego se guarda el valor **antes** de borrar (después ya no estaría), se vuelve a meter para que quede al final y se devuelve.", en: "First the case where it's missing. Then save the value **before** deleting (afterwards it would be gone), add it back so it ends up last, and return it." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa el desalojo del `put`: si se pasó de la capacidad, se borra la clave más vieja.", en: "Complete the `put` eviction: if it went over capacity, delete the oldest key." },
          codigo: "if (this.datos.size > this.___) {\n  const masVieja = this.datos.___().next().value;\n  this.datos.___(masVieja);\n}",
          huecos: ["capacidad", "keys", "delete"],
          banco: ["capacidad", "keys", "delete", "values", "set", "length"],
          porque: { es: "Se compara contra `capacidad`; `keys()` da las claves en orden de llegada y la primera es la más vieja; `delete` la saca.", en: "Compare against `capacidad`; `keys()` gives keys in arrival order and the first one is the oldest; `delete` removes it." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `simularLRU(capacidad, usos)`: `usos` es una lista de claves que se van usando (si no está, entra; si ya está, se vuelve reciente). Devuelve las claves que quedan en la caché, **de la más vieja a la más reciente**.",
            en: "Write `simularLRU(capacidad, usos)`: `usos` is a list of keys being used (if it's missing it comes in; if it's there, it becomes recent). Return the keys left in the cache, **oldest to most recent**.",
          },
          inicial: {
            es: "function simularLRU(capacidad, usos) {\n  const cache = new Map();\n  for (const clave of usos) {\n    // vuélvela la más reciente y saca la más vieja si no cabe\n  }\n  return [...cache.keys()];\n}\n\nconsole.log(simularLRU(2, [\"a\", \"b\", \"a\", \"c\"]));",
            en: "function simularLRU(capacidad, usos) {\n  const cache = new Map();\n  for (const clave of usos) {\n    // make it the most recent and evict the oldest if it doesn't fit\n  }\n  return [...cache.keys()];\n}\n\nconsole.log(simularLRU(2, [\"a\", \"b\", \"a\", \"c\"]));",
          },
          pruebas: [
            { llamada: "simularLRU(2, [\"a\", \"b\", \"a\", \"c\"])", espera: "[\"a\",\"c\"]" },
            { llamada: "simularLRU(3, [\"x\", \"y\", \"z\", \"x\", \"w\"])", espera: "[\"z\",\"x\",\"w\"]" },
            { llamada: "simularLRU(1, [\"a\", \"b\"])", espera: "[\"b\"]" },
            { llamada: "simularLRU(2, [\"a\"])", espera: "[\"a\"]" },
          ],
          solucion: "function simularLRU(capacidad, usos) {\n  const cache = new Map();\n  for (const clave of usos) {\n    cache.delete(clave);\n    cache.set(clave, true);\n    if (cache.size > capacidad) cache.delete(cache.keys().next().value);\n  }\n  return [...cache.keys()];\n}",
          porque: { es: "Borrar y volver a meter cada clave la deja al final; si se pasa de la capacidad, sale la primera. En la segunda prueba, usar «x» otra vez la salva y la que sale es «y».", en: "Deleting and re-adding each key leaves it at the end; if it goes over capacity, the first one goes. In the second test, using \"x\" again saves it and \"y\" is the one that goes." },
        },
      ],
    },
    {
      id: "programacion-dinamica",
      titulo: { es: "Programación dinámica: no calcular dos veces", en: "Dynamic programming: never compute twice" },
      resumen: {
        es: "Guardar en un Map o en una tabla lo que ya calculaste: de exponencial a lineal en escaleras, monedas y subarreglos.",
        en: "Store what you already computed in a Map or a table: from exponential to linear for stairs, coins and subarrays.",
      },
      retos: ["climbing-stairs", "coin-change", "maximum-subarray", "longest-palindromic-substring"],
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "El mismo trabajo, una y otra vez", en: "The same work, over and over" },
          texto: {
            es: "¿De cuántas formas subes una escalera de `n` escalones si das pasos de 1 o de 2? Para llegar al escalón `n` vienes del `n-1` o del `n-2`, así que `formas(n) = formas(n-1) + formas(n-2)`.\n\nLa recursión directa es correcta pero terriblemente lenta: `formas(n-2)` se calcula dentro de `formas(n-1)` y otra vez afuera, y así hacia abajo. Las llamadas crecen como **O(2ⁿ)**. Cuenta cuántas hace:",
            en: "How many ways can you climb a staircase of `n` steps taking 1 or 2 at a time? To reach step `n` you come from `n-1` or `n-2`, so `formas(n) = formas(n-1) + formas(n-2)`.\n\nThe direct recursion is correct but terribly slow: `formas(n-2)` gets computed inside `formas(n-1)` and again outside, and so on down. The calls grow like **O(2ⁿ)**. Count how many it makes:",
          },
          programa: {
            codigo: "let llamadas = 0;\nfunction formas(n) {\n  llamadas++;\n  if (n <= 1) return 1;\n  return formas(n - 1) + formas(n - 2);\n}\n\nfor (const n of [10, 20, 25]) {\n  llamadas = 0;\n  const r = formas(n);\n  console.log(n, \"escalones:\", r, \"formas,\", llamadas, \"llamadas\");\n}",
            notas: {
              es: "Con 25 escalones son 121 393 formas, pero casi 243 000 llamadas: cada resultado chico se recalcula miles de veces. Cada 5 escalones más, las llamadas se multiplican por 11.",
              en: "With 25 steps there are 121,393 ways, but almost 243,000 calls: every small result gets recomputed thousands of times. Every 5 extra steps, the calls multiply by 11.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Memoizar: anotar antes de olvidar", en: "Memoization: write it down before you forget" },
          texto: {
            es: "La **programación dinámica** es resolver un problema con subproblemas que se repiten **guardando cada respuesta la primera vez**. La forma más directa es **memoizar**: antes de calcular, revisas si ya lo tienes en un `Map`; si no, lo calculas y lo anotas.\n\nAhora cada `n` se calcula una sola vez: **O(n)**. Lo que sin memo habría tardado semanas sale al instante.",
            en: "**Dynamic programming** means solving a problem with repeating subproblems by **storing each answer the first time**. The most direct way is **memoization**: before computing, check whether you already have it in a `Map`; if not, compute it and write it down.\n\nNow each `n` is computed only once: **O(n)**. What would have taken weeks without it comes out instantly.",
          },
          programa: {
            codigo: "function formasMemo(n, memo = new Map()) {\n  if (n <= 1) return 1;\n  if (memo.has(n)) return memo.get(n);\n  const r = formasMemo(n - 1, memo) + formasMemo(n - 2, memo);\n  memo.set(n, r);\n  return r;\n}\n\nconsole.log(formasMemo(25));\nconsole.log(formasMemo(70));",
            notas: {
              es: "25 da lo mismo que antes, y 70 sale de inmediato: 308 061 521 170 129 formas. Sin memo, serían unos 600 billones de llamadas.",
              en: "25 gives the same as before, and 70 comes out immediately: 308,061,521,170,129 ways. Without the memo, it would take some 600 trillion calls.",
            },
          },
          enlaces: [{ url: "https://es.wikipedia.org/wiki/Programaci%C3%B3n_din%C3%A1mica", texto: { es: "Programación dinámica (Wikipedia)", en: "Dynamic programming (Wikipedia, Spanish)" } }],
        },
        {
          tipo: "explica",
          titulo: { es: "La tabla, de abajo hacia arriba", en: "The table, bottom-up" },
          texto: {
            es: "La otra forma es llenar una **tabla** desde el caso más chico hasta el que buscas, sin recursión. El reto de las monedas: ¿cuántas monedas, como mínimo, suman un monto?\n\n`dp[m]` es el mínimo para el monto `m`. `dp[0] = 0`, y para cada `m` pruebas cada moneda `c`: `dp[m - c] + 1`. Con monedas de 1, 3 y 4 y un monto de 6, la respuesta es 2 (3 + 3). Tomar siempre la moneda más grande daría 4 + 1 + 1, tres monedas: por eso aquí no sirve el atajo «goloso» y hace falta la tabla.\n\nLa receta de siempre: **estado** (qué significa `dp[m]`), **transición** (cómo sale de los anteriores), **caso base** y **orden** de llenado.",
            en: "The other way is to fill a **table** from the smallest case up to the one you want, with no recursion. The coin challenge: what's the minimum number of coins that add up to an amount?\n\n`dp[m]` is the minimum for amount `m`. `dp[0] = 0`, and for each `m` you try each coin `c`: `dp[m - c] + 1`. With coins of 1, 3 and 4 and an amount of 6, the answer is 2 (3 + 3). Always taking the biggest coin would give 4 + 1 + 1, three coins: that's why the \"greedy\" shortcut doesn't work here and you need the table.\n\nThe usual recipe: **state** (what `dp[m]` means), **transition** (how it comes from earlier ones), **base case**, and filling **order**.",
          },
          dibujo: { tipo: "arreglo", valores: [0, 1, 2, 1, 1, 2, 2], resalta: [6] },
          programa: {
            codigo: "function minMonedas(monedas, monto) {\n  const dp = new Array(monto + 1).fill(Infinity);\n  dp[0] = 0;\n  for (let m = 1; m <= monto; m++) {\n    for (const c of monedas) {\n      if (c <= m && dp[m - c] + 1 < dp[m]) dp[m] = dp[m - c] + 1;\n    }\n  }\n  console.log(dp);\n  return dp[monto] === Infinity ? -1 : dp[monto];\n}\n\nconsole.log(minMonedas([1, 3, 4], 6));\nconsole.log(minMonedas([5, 10], 3));",
            notas: {
              es: "- La tabla de `[1, 3, 4]` es la del dibujo: el 6 se llena desde el 3 (`dp[3] + 1 = 2`).\n- Con monedas de 5 y 10 no hay forma de juntar 3: la tabla se queda en `Infinity` y la función devuelve -1.",
              en: "- The table for `[1, 3, 4]` is the one in the drawing: 6 is filled from 3 (`dp[3] + 1 = 2`).\n- With 5 and 10 coins there's no way to make 3: the table stays at `Infinity` and the function returns -1.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "A veces la tabla cabe en dos variables", en: "Sometimes the table fits in two variables" },
          texto: {
            es: "Si cada casilla sólo depende de la anterior, no hace falta guardar la tabla entera. El **algoritmo de Kadane** encuentra el subarreglo seguido con la suma más grande: en cada posición decides si **sigues** el tramo que traías o **empiezas** uno nuevo aquí, y recuerdas el mejor que has visto.\n\nEs programación dinámica en O(n) de tiempo y O(1) de memoria.",
            en: "If each cell depends only on the previous one, you don't need to keep the whole table. **Kadane's algorithm** finds the contiguous subarray with the largest sum: at each position you decide whether to **extend** the stretch you had or **start** a new one here, and you remember the best one you've seen.\n\nIt's dynamic programming in O(n) time and O(1) memory.",
          },
          programa: {
            codigo: "function mayorSubarreglo(nums) {\n  let actual = nums[0], mejor = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    actual = Math.max(nums[i], actual + nums[i]);\n    mejor = Math.max(mejor, actual);\n  }\n  return mejor;\n}\n\nconsole.log(mayorSubarreglo([-2, 1, -3, 4, -1, 2, 1, -5, 4]));\nconsole.log(mayorSubarreglo([-3, -1, -2]));",
            notas: {
              es: "- El 6 sale del tramo `[4, -1, 2, 1]`: el -1 no alcanza a romperlo.\n- Si todo es negativo, el mejor tramo es el número menos malo, -1.",
              en: "- The 6 comes from the stretch `[4, -1, 2, 1]`: the -1 isn't enough to break it.\n- If everything is negative, the best stretch is the least bad number, -1.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué es memoizar?", en: "What is memoization?" },
          opciones: [
            { es: "Ordenar los datos antes de calcular", en: "Sorting the data before computing" },
            { es: "Guardar el resultado de cada subproblema la primera vez y reusarlo", en: "Storing each subproblem's result the first time and reusing it" },
            { es: "Partir el problema a la mitad en cada paso", en: "Splitting the problem in half at every step" },
            { es: "Tomar siempre la opción que parece mejor en el momento", en: "Always taking the option that looks best right now" },
          ],
          correcta: 1,
          porque: { es: "Memoizar es anotar respuestas para no recalcularlas. Partir a la mitad es divide y vencerás; tomar lo mejor del momento es un algoritmo goloso.", en: "Memoizing is writing answers down so you don't recompute them. Splitting in half is divide and conquer; taking what looks best right now is a greedy algorithm." },
        },
        {
          tipo: "elige",
          pregunta: { es: "Con monedas de 1, 3 y 4, ¿cuántas monedas como mínimo suman 6?", en: "With coins of 1, 3 and 4, what's the minimum number of coins that add up to 6?" },
          opciones: ["1", "2", "3", "6"],
          correcta: 1,
          porque: { es: "3 + 3: dos monedas. Empezar por la más grande (4 + 1 + 1) da tres; por eso el problema necesita la tabla y no el atajo goloso.", en: "3 + 3: two coins. Starting with the biggest (4 + 1 + 1) gives three; that's why the problem needs the table and not the greedy shortcut." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa la versión memoizada de la escalera.", en: "Complete the memoized staircase." },
          codigo: "if (memo.___(n)) return memo.___(n);\nconst r = formasMemo(n - 1, memo) + formasMemo(n - 2, memo);\nmemo.___(n, r);\nreturn r;",
          huecos: ["has", "get", "set"],
          banco: ["has", "get", "set", "push", "add"],
          porque: { es: "`has` pregunta si ya está anotado, `get` lo lee y `set` lo anota. `push` es de arreglos y `add` de `Set`.", en: "`has` asks whether it's written down, `get` reads it and `set` writes it. `push` belongs to arrays and `add` to `Set`." },
        },
        {
          tipo: "ordena",
          pregunta: { es: "Ordena la escalera de abajo hacia arriba, con tabla.", en: "Put the bottom-up staircase, with a table, in order." },
          lineas: ["const dp = [1, 1];", "for (let i = 2; i <= n; i++) {", "  dp[i] = dp[i - 1] + dp[i - 2];", "}", "return dp[n];"],
          porque: { es: "Primero los casos base (0 y 1 escalones: una forma cada uno), luego se llena cada casilla con las dos anteriores y al final se lee la que buscabas.", en: "First the base cases (0 and 1 steps: one way each), then each cell is filled from the two before it, and finally you read the one you wanted." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `formasTres(n)`: de cuántas formas subes `n` escalones si puedes dar pasos de **1, 2 o 3**. `formasTres(0)` es 1. Tiene que ser rápida: una prueba pide 30 escalones.",
            en: "Write `formasTres(n)`: how many ways to climb `n` steps if you can take **1, 2 or 3** at a time. `formasTres(0)` is 1. It must be fast: one test asks for 30 steps.",
          },
          inicial: {
            es: "function formasTres(n) {\n  // como la escalera, pero vienes de n-1, n-2 o n-3\n}\n\nconsole.log(formasTres(4));",
            en: "function formasTres(n) {\n  // like the staircase, but you come from n-1, n-2 or n-3\n}\n\nconsole.log(formasTres(4));",
          },
          pruebas: [
            { llamada: "formasTres(3)", espera: "4" },
            { llamada: "formasTres(4)", espera: "7" },
            { llamada: "formasTres(10)", espera: "274" },
            { llamada: "formasTres(30)", espera: "53798080" },
          ],
          solucion: "function formasTres(n) {\n  const dp = [1, 1, 2];\n  for (let i = 3; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2] + dp[i - 3];\n  return dp[n];\n}",
          porque: { es: "Estado: `dp[i]` son las formas de llegar al escalón `i`. Transición: la suma de los tres anteriores. Casos base: 1, 1 y 2. Sin tabla, `formasTres(30)` haría decenas de millones de llamadas.", en: "State: `dp[i]` is the number of ways to reach step `i`. Transition: the sum of the previous three. Base cases: 1, 1 and 2. Without a table, `formasTres(30)` would make tens of millions of calls." },
        },
      ],
    },
  ],
};
