import type { Unidad } from "../tipos";

/**
 * Unidad 4: simular. El Juego de la vida (30-nov-2026), con el mismo `siguiente` del Short de «Algoritmos en pixel»
 * (tools/comerciales/algoritmos/vida.py): si cambia uno, cambia el otro (revisar-codigo.py lo comprueba).
 */
const OCHO = {
  es: `// las ocho de alrededor
const ocho = (y, x) => [[y - 1, x - 1], [y - 1, x], [y - 1, x + 1], [y, x - 1],
                        [y, x + 1], [y + 1, x - 1], [y + 1, x], [y + 1, x + 1]];`,
  en: `// the eight around it
const ocho = (y, x) => [[y - 1, x - 1], [y - 1, x], [y - 1, x + 1], [y, x - 1],
                        [y, x + 1], [y + 1, x - 1], [y + 1, x], [y + 1, x + 1]];`,
};

const SIGUIENTE = `function siguiente(m) {
  return m.map((fila, y) =>
    fila.map((viva, x) => {
      let n = 0;
      for (const [i, j] of ocho(y, x))
        n += m[i]?.[j] ?? 0;
      if (n === 3) return 1;
      return viva && n === 2 ? 1 : 0;
    }));
}`;

// el mismo, con sus nombres en inglés en los comentarios: el código no cambia
const LEER = `const leer = (filas) => filas.map((f) => [...f].map((c) => (c === "O" ? 1 : 0)));`;
const VER = `const ver = (m) => console.log(m.map((f) => f.map((v) => (v ? "O" : ".")).join(" ")).join("\\n") + "\\n");`;

const PISTOLA = `const pistola = [
  "........................O...........",
  "......................O.O...........",
  "............OO......OO............OO",
  "...........O...O....OO............OO",
  "OO........O.....O...OO..............",
  "OO........O...O.OO....O.O...........",
  "..........O.....O.......O...........",
  "...........O...O....................",
  "............OO......................",
];`;

export const A04: Unidad = {
  id: "simular",
  titulo: { es: "Simular", en: "Simulation" },
  lecciones: [
    {
      id: "juego-de-la-vida",
      video: { es: { id: "pJXP08qlaNk", desde: "2026-11-30T16:00:00-06:00" }, en: { id: "56WgeI4BpFE", desde: "2026-11-30T16:20:00-06:00" } },
      titulo: { es: "El Juego de la vida", en: "The Game of Life" },
      resumen: {
        es: "Un tablero que se mueve solo: cada casilla cuenta a sus ocho vecinas y con dos renglones de regla salen osciladores, planeadores y hasta computadoras.",
        en: "A board that moves on its own: each cell counts its eight neighbors, and two lines of rules give you oscillators, gliders and even computers.",
      },
      retos: ["rotting-oranges", "number-of-islands"],
      enlaces: [
        { url: "https://es.wikipedia.org/wiki/Juego_de_la_vida", texto: { es: "Juego de la vida (Wikipedia)", en: "Conway's Game of Life (Wikipedia, Spanish)" } },
        { url: "https://conwaylife.com/wiki/Main_Page", texto: { es: "LifeWiki, la enciclopedia del Juego de la vida (en inglés)", en: "LifeWiki, the Game of Life encyclopedia" } },
        { url: "/aprende/algoritmos/relleno", texto: { es: "El relleno: otra vez mirar a las vecinas", en: "Flood fill: looking at the neighbors, again" } },
      ],
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Contar vecinas", en: "Counting neighbors" },
          texto: {
            es: "Un tablero de casillas; cada una está **viva** o **muerta**. No hay jugador: el tablero cambia solo, por **generaciones**. En cada una, cada casilla mira a las **ocho** que tiene alrededor (también en diagonal) y cuenta cuántas están vivas.\n\nLo inventó el matemático John Conway, y se hizo famoso en octubre de 1970, en la columna de Martin Gardner en *Scientific American*. Al principio se jugaba a mano, con fichas.",
            en: "A board of cells; each one is **alive** or **dead**. There's no player: the board changes on its own, in **generations**. In each one, every cell looks at the **eight** around it (diagonals too) and counts how many are alive.\n\nThe mathematician John Conway invented it, and it became famous in October 1970, in Martin Gardner's column in *Scientific American*. At first people played it by hand, with counters.",
          },
          dibujo: {
            tipo: "rejilla",
            filas: [".....", ".....", ".OOO.", ".....", "....."],
            leyenda: { O: { es: "viva", en: "alive" }, ".": { es: "muerta", en: "dead" } },
          },
          programa: {
            codigo: {
              es: `${OCHO.es}\n\nconst m = [\n  [0, 0, 0, 0, 0],\n  [0, 0, 0, 0, 0],\n  [0, 1, 1, 1, 0],\n  [0, 0, 0, 0, 0],\n  [0, 0, 0, 0, 0],\n];\n\nfunction vecinas(y, x) {\n  let n = 0;\n  for (const [i, j] of ocho(y, x)) n += m[i]?.[j] ?? 0;   // fuera del tablero, 0\n  return n;\n}\n\n// cuántas vecinas vivas tiene cada casilla\nfor (let y = 0; y < 5; y++)\n  console.log([0, 1, 2, 3, 4].map((x) => vecinas(y, x)).join(" "));`,
              en: `${OCHO.en}\n\nconst m = [\n  [0, 0, 0, 0, 0],\n  [0, 0, 0, 0, 0],\n  [0, 1, 1, 1, 0],\n  [0, 0, 0, 0, 0],\n  [0, 0, 0, 0, 0],\n];\n\nfunction vecinas(y, x) {\n  let n = 0;\n  for (const [i, j] of ocho(y, x)) n += m[i]?.[j] ?? 0;   // off the board, 0\n  return n;\n}\n\n// how many live neighbors each cell has\nfor (let y = 0; y < 5; y++)\n  console.log([0, 1, 2, 3, 4].map((x) => vecinas(y, x)).join(" "));`,
            },
            notas: {
              es: "- La del centro tiene **2** vecinas vivas; las de las puntas, **1**; la de arriba y la de abajo del centro, **3**.\n- `m[i]?.[j] ?? 0`: si la fila no existe da `undefined`, y `?? 0` lo cuenta como muerta. Así las orillas no truenan.",
              en: "- The center one has **2** live neighbors; the ones at the ends, **1**; the ones above and below the center, **3**.\n- `m[i]?.[j] ?? 0`: if the row doesn't exist you get `undefined`, and `?? 0` counts it as dead. That way the edges don't crash.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "La regla, en dos renglones", en: "The rule, in two lines" },
          texto: {
            es: "Con el número de vecinas vivas se decide la generación siguiente:\n\n- Con **tres**, la casilla **vive**: si estaba muerta, nace; si estaba viva, sigue.\n- Con **dos**, se **queda como está**.\n- Con cualquier otro número, muere o sigue muerta: con una o ninguna, **de sola**; con cuatro o más, **amontonada**.\n\nY ya. `siguiente` recibe el tablero y devuelve el que sigue.",
            en: "The number of live neighbors decides the next generation:\n\n- With **three**, the cell **lives**: if it was dead, it's born; if it was alive, it stays.\n- With **two**, it **stays as it is**.\n- With any other number it dies or stays dead: with one or none, of **loneliness**; with four or more, of **crowding**.\n\nThat's all. `siguiente` (\"next\") takes the board and returns the one that follows.",
          },
          programa: {
            codigo: {
              es: `${OCHO.es}\n\n${SIGUIENTE}\n\n${LEER}\n${VER}\n\nlet m = leer([".....", ".....", ".OOO.", ".....", "....."]);\nfor (let g = 0; g < 4; g++) {\n  console.log("generación", g);\n  ver(m);\n  m = siguiente(m);\n}`,
              en: `${OCHO.en}\n\n${SIGUIENTE}\n\n${LEER}\n${VER}\n\nlet m = leer([".....", ".....", ".OOO.", ".....", "....."]);\nfor (let g = 0; g < 4; g++) {\n  console.log("generation", g);\n  ver(m);\n  m = siguiente(m);\n}`,
            },
            notas: {
              es: "- Las puntas mueren (tenían una vecina) y arriba y abajo nacen dos (tenían tres). En la siguiente, al revés: **gira para siempre**. Se llama parpadeador.\n- Prueba con `[\"....\", \".OO.\", \".OO.\", \"....\"]`: cada una tiene tres vecinas y no cambia nunca. Es el bloque.",
              en: "- The ends die (they had one neighbor) and two are born above and below (they had three). In the next one, the other way around: **it spins forever**. It's called the blinker.\n- Try `[\"....\", \".OO.\", \".OO.\", \"....\"]`: each one has three neighbors and it never changes. That's the block.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Todas a la vez", en: "All at once" },
          texto: {
            es: "Fíjate en que `siguiente` usa `map`: **no toca el tablero viejo**, hace uno nuevo. Es lo más importante del programa. Si fueras cambiando las casillas en el mismo tablero, las de abajo contarían vecinas que ya son de la generación siguiente, y las de arriba no: saldría otra cosa.\n\nEsto pasa en muchas simulaciones: se lee de una copia y se escribe en otra. A veces se llama *doble búfer*.",
            en: "Notice that `siguiente` uses `map`: it **doesn't touch the old board**, it builds a new one. That's the most important thing in the program. If you changed the cells in the same board as you go, the lower ones would count neighbors that already belong to the next generation, and the upper ones wouldn't: you'd get something else.\n\nThis comes up in many simulations: you read from one copy and write to another. It's sometimes called *double buffering*.",
          },
          programa: {
            codigo: {
              es: `${OCHO.es}\n\n${SIGUIENTE}\n\n// mal: cambia el mismo tablero mientras cuenta\nfunction malo(m) {\n  for (let y = 0; y < m.length; y++)\n    for (let x = 0; x < m[y].length; x++) {\n      let n = 0;\n      for (const [i, j] of ocho(y, x)) n += m[i]?.[j] ?? 0;\n      m[y][x] = n === 3 || (m[y][x] && n === 2) ? 1 : 0;\n    }\n  return m;\n}\n\n${LEER}\n${VER}\n\nconst filas = [".....", ".....", ".OOO.", ".....", "....."];\nconsole.log("bien:"); ver(siguiente(leer(filas)));\nconsole.log("mal:"); ver(malo(leer(filas)));`,
              en: `${OCHO.en}\n\n${SIGUIENTE}\n\n// wrong: it changes the same board while counting\nfunction malo(m) {\n  for (let y = 0; y < m.length; y++)\n    for (let x = 0; x < m[y].length; x++) {\n      let n = 0;\n      for (const [i, j] of ocho(y, x)) n += m[i]?.[j] ?? 0;\n      m[y][x] = n === 3 || (m[y][x] && n === 2) ? 1 : 0;\n    }\n  return m;\n}\n\n${LEER}\n${VER}\n\nconst filas = [".....", ".....", ".OOO.", ".....", "....."];\nconsole.log("right:"); ver(siguiente(leer(filas)));\nconsole.log("wrong:"); ver(malo(leer(filas)));`,
            },
            notas: {
              es: "Con las mismas tres casillas, el parpadeador sale bien con el tablero nuevo y sale otra figura si se cambia el mismo: la casilla que nace arriba ya cuenta como vecina para las de abajo.",
              en: "With the same three cells, the blinker comes out right with a new board and a different shape comes out if you change the same one: the cell born above already counts as a neighbor for the ones below.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Quietas, que giran y que caminan", en: "Still, spinning and walking" },
          texto: {
            es: "Con esa regla salen figuras de tres clases:\n\n- **Quietas**: no cambian, como el bloque.\n- **Osciladores**: vuelven a ser iguales cada tantas generaciones, en el mismo lugar, como el parpadeador.\n- **Naves**: vuelven a ser iguales, pero en **otro lugar**. La más chica es el **planeador**, de cinco casillas: cada cuatro generaciones está una casilla más abajo y una a la derecha.\n\nEl programa corre cada figura hasta que se repite y dice cada cuánto y cuánto se movió.",
            en: "That rule gives you three kinds of shapes:\n\n- **Still lifes**: they don't change, like the block.\n- **Oscillators**: they come back to the same shape every so many generations, in the same place, like the blinker.\n- **Spaceships**: they come back to the same shape, but **somewhere else**. The smallest is the **glider**, with five cells: every four generations it's one cell lower and one to the right.\n\nThe program runs each shape until it repeats, and says how often and how far it moved.",
          },
          programa: {
            codigo: {
              es: `${OCHO.es}\n\n${SIGUIENTE}\n\n// pone la figura en un tablero de 20 x 20, con su esquina en (6, 6)\nfunction poner(filas) {\n  const m = Array.from({ length: 20 }, () => Array(20).fill(0));\n  filas.forEach((f, y) => [...f].forEach((c, x) => { if (c === "O") m[y + 6][x + 6] = 1; }));\n  return m;\n}\n\n// la forma sin su lugar, y su esquina\nfunction forma(m) {\n  const vivas = m.flatMap((f, y) => f.flatMap((v, x) => (v ? [[y, x]] : [])));\n  const y0 = Math.min(...vivas.map((c) => c[0])), x0 = Math.min(...vivas.map((c) => c[1]));\n  return { clave: vivas.map(([y, x]) => (y - y0) + "," + (x - x0)).join(" "), y0, x0 };\n}\n\nconst figuras = {\n  bloque: ["OO", "OO"],\n  parpadeador: ["OOO"],\n  sapo: [".OOO", "OOO."],\n  planeador: [".O.", "..O", "OOO"],\n  nave: [".O..O", "O....", "O...O", "OOOO."],\n};\n\nfor (const nombre in figuras) {\n  let m = poner(figuras[nombre]);\n  const a = forma(m);\n  for (let g = 1; g <= 20; g++) {\n    m = siguiente(m);\n    const b = forma(m);\n    if (b.clave === a.clave) {\n      console.log(nombre + ": se repite cada", g, "| se movió", b.y0 - a.y0, "abajo y", b.x0 - a.x0, "a la derecha");\n      break;\n    }\n  }\n}`,
              en: `${OCHO.en}\n\n${SIGUIENTE}\n\n// puts the shape on a 20 x 20 board, with its corner at (6, 6)\nfunction poner(filas) {\n  const m = Array.from({ length: 20 }, () => Array(20).fill(0));\n  filas.forEach((f, y) => [...f].forEach((c, x) => { if (c === "O") m[y + 6][x + 6] = 1; }));\n  return m;\n}\n\n// the shape without its place, and its corner\nfunction forma(m) {\n  const vivas = m.flatMap((f, y) => f.flatMap((v, x) => (v ? [[y, x]] : [])));\n  const y0 = Math.min(...vivas.map((c) => c[0])), x0 = Math.min(...vivas.map((c) => c[1]));\n  return { clave: vivas.map(([y, x]) => (y - y0) + "," + (x - x0)).join(" "), y0, x0 };\n}\n\nconst figuras = {\n  block: ["OO", "OO"],\n  blinker: ["OOO"],\n  toad: [".OOO", "OOO."],\n  glider: [".O.", "..O", "OOO"],\n  spaceship: [".O..O", "O....", "O...O", "OOOO."],\n};\n\nfor (const nombre in figuras) {\n  let m = poner(figuras[nombre]);\n  const a = forma(m);\n  for (let g = 1; g <= 20; g++) {\n    m = siguiente(m);\n    const b = forma(m);\n    if (b.clave === a.clave) {\n      console.log(nombre + ": repeats every", g, "| moved", b.y0 - a.y0, "down and", b.x0 - a.x0, "right");\n      break;\n    }\n  }\n}`,
            },
            notas: {
              es: "- El bloque se repite cada 1 (nunca cambia); el parpadeador y el sapo, cada 2, sin moverse.\n- El planeador y la nave se repiten cada 4, pero en otro lugar. Un número negativo quiere decir hacia arriba o a la izquierda.",
              en: "- The block repeats every 1 (it never changes); the blinker and the toad, every 2, without moving.\n- The glider and the spaceship repeat every 4, but somewhere else. A negative number means up or to the left.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "La pistola y la computadora", en: "The gun and the computer" },
          texto: {
            es: "Conway ofreció **50 dólares** a quien demostrara, antes de acabar 1970, si una figura podía crecer sin fin. Los ganó en noviembre un equipo del MIT dirigido por Bill Gosper, con una **pistola de planeadores**: dispara el primero en la generación 15 y luego uno **cada 30**, para siempre.\n\nCon chorros de planeadores que chocan se hacen «y», «o» y «no», que es de lo que está hecha una computadora. Por eso el Juego de la vida puede calcular **cualquier cosa** que calcule una computadora, y de hecho se han armado computadoras programables adentro: una corre Tetris.",
            en: "Conway offered **50 dollars** to whoever could show, before the end of 1970, whether a shape could grow without end. A team from MIT led by Bill Gosper won it in November, with a **glider gun**: it fires the first one on generation 15 and then one **every 30**, forever.\n\nWith streams of gliders that crash into each other you can make \"and\", \"or\" and \"not\", which is what computers are made of. So the Game of Life can compute **anything** a computer can, and people have in fact built programmable computers inside it: one runs Tetris.",
          },
          programa: {
            codigo: {
              es: `${OCHO.es}\n\n${SIGUIENTE}\n\n${PISTOLA}\n\n// en un tablero grande, para que los planeadores no lleguen a la orilla\nlet m = Array.from({ length: 70 }, () => Array(90).fill(0));\npistola.forEach((f, y) => [...f].forEach((c, x) => { if (c === "O") m[y + 2][x + 2] = 1; }));\n\nconst vivas = () => m.flat().reduce((a, v) => a + v, 0);\nfor (let g = 0; g <= 120; g++) {\n  if (g % 30 === 0) console.log("generación", String(g).padStart(3), "vivas", vivas());\n  m = siguiente(m);\n}`,
              en: `${OCHO.en}\n\n${SIGUIENTE}\n\n${PISTOLA}\n\n// on a big board, so the gliders don't reach the edge\nlet m = Array.from({ length: 70 }, () => Array(90).fill(0));\npistola.forEach((f, y) => [...f].forEach((c, x) => { if (c === "O") m[y + 2][x + 2] = 1; }));\n\nconst vivas = () => m.flat().reduce((a, v) => a + v, 0);\nfor (let g = 0; g <= 120; g++) {\n  if (g % 30 === 0) console.log("generation", String(g).padStart(3), "alive", vivas());\n  m = siguiente(m);\n}`,
            },
            notas: {
              es: "Cada 30 generaciones la pistola vuelve a ser igual y hay **cinco vivas más**: un planeador nuevo que se va. Así crece sin fin.",
              en: "Every 30 generations the gun is back to the same shape and there are **five more alive**: a new glider on its way. That's how it grows without end.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Sólo las que importan", en: "Only the ones that matter" },
          texto: {
            es: "`siguiente` mira las ocho vecinas de **todas** las casillas, aunque casi todas estén muertas: en un tablero de 100 × 100 son 80 000 miradas por generación, para un planeador de cinco. Es **O(n)** con n casillas.\n\nAl revés sale mejor: que cada **viva** le sume uno a sus ocho vecinas. Sólo se toca lo que está junto a una viva, y el tablero ya no tiene orillas, porque no se guarda: se guardan las vivas, en un `Set`, y las cuentas, en un `Map`.",
            en: "`siguiente` looks at the eight neighbors of **every** cell, even though almost all of them are dead: on a 100 × 100 board that's 80,000 looks per generation, for a glider of five. It's **O(n)** with n cells.\n\nIt works better the other way around: let each **live** one add one to its eight neighbors. You only touch what's next to a live cell, and the board no longer has edges, because you don't store it: you store the live ones, in a `Set`, and the counts, in a `Map`.",
          },
          programa: {
            codigo: {
              es: `${OCHO.es}\n\nlet miradas = 0;\nfunction siguienteVivas(vivas) {\n  const cuenta = new Map();\n  for (const c of vivas) {\n    const [y, x] = c.split(",").map(Number);\n    for (const [i, j] of ocho(y, x)) {\n      const k = i + "," + j;\n      cuenta.set(k, (cuenta.get(k) ?? 0) + 1);\n      miradas++;\n    }\n  }\n  const nuevas = new Set();\n  for (const [k, n] of cuenta)\n    if (n === 3 || (n === 2 && vivas.has(k))) nuevas.add(k);\n  return nuevas;\n}\n\nlet planeador = new Set(["0,1", "1,2", "2,0", "2,1", "2,2"]);\nplaneador = siguienteVivas(planeador);\nconsole.log("miradas en una generación:", miradas);\n\nfor (let g = 1; g < 400; g++) planeador = siguienteVivas(planeador);\nconsole.log("400 generaciones después:", [...planeador].sort().join("  "));`,
              en: `${OCHO.en}\n\nlet miradas = 0;\nfunction siguienteVivas(vivas) {\n  const cuenta = new Map();\n  for (const c of vivas) {\n    const [y, x] = c.split(",").map(Number);\n    for (const [i, j] of ocho(y, x)) {\n      const k = i + "," + j;\n      cuenta.set(k, (cuenta.get(k) ?? 0) + 1);\n      miradas++;\n    }\n  }\n  const nuevas = new Set();\n  for (const [k, n] of cuenta)\n    if (n === 3 || (n === 2 && vivas.has(k))) nuevas.add(k);\n  return nuevas;\n}\n\nlet planeador = new Set(["0,1", "1,2", "2,0", "2,1", "2,2"]);\nplaneador = siguienteVivas(planeador);\nconsole.log("looks in one generation:", miradas);\n\nfor (let g = 1; g < 400; g++) planeador = siguienteVivas(planeador);\nconsole.log("400 generations later:", [...planeador].sort().join("  "));`,
            },
            notas: {
              es: "- 40 miradas (cinco vivas por ocho) en vez de 80 000.\n- En 400 generaciones el planeador camina 100 casillas en diagonal, y sigue siendo el mismo: `0,1` pasó a `100,101`.",
              en: "- 40 looks (five live cells times eight) instead of 80,000.\n- In 400 generations the glider walks 100 cells diagonally, and it's still the same: `0,1` became `100,101`.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "Una casilla **muerta** tiene dos vecinas vivas. ¿Cómo está en la generación siguiente?", en: "A **dead** cell has two live neighbors. What is it in the next generation?" },
          opciones: [
            { es: "Muerta: con dos se queda como está", en: "Dead: with two it stays as it is" },
            { es: "Viva: con dos nace", en: "Alive: with two it's born" },
            { es: "Viva, pero sólo una generación", en: "Alive, but only for one generation" },
            { es: "Depende de si está en la orilla", en: "It depends on whether it's on the edge" },
          ],
          correcta: 0,
          porque: {
            es: "`viva && n === 2 ? 1 : 0`: con dos sólo sigue viva la que ya lo estaba. Para nacer hacen falta tres.",
            en: "`viva && n === 2 ? 1 : 0`: with two, only one that was already alive stays alive. It takes three to be born.",
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Por qué `siguiente` hace un tablero nuevo en vez de cambiar `m`?", en: "Why does `siguiente` build a new board instead of changing `m`?" },
          opciones: [
            { es: "Para gastar menos memoria", en: "To use less memory" },
            { es: "Para que todas cuenten vecinas de la misma generación", en: "So that all cells count neighbors from the same generation" },
            { es: "Porque en JavaScript no se puede cambiar un arreglo", en: "Because in JavaScript you can't change an array" },
            { es: "Para que las orillas no truenen", en: "So the edges don't crash" },
          ],
          correcta: 1,
          porque: {
            es: "Si se cambia el mismo tablero, unas casillas cuentan vecinas viejas y otras, nuevas. (Memoria gasta más, no menos: dos tableros en vez de uno.)",
            en: "If you change the same board, some cells count old neighbors and others, new ones. (It uses more memory, not less: two boards instead of one.)",
          },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa la regla.", en: "Fill in the rule." },
          codigo: "for (const [i, j] of ocho(y, x))\n  n += m[i]?.[j] ?? ___;\nif (n === ___) return 1;\nreturn viva && n === ___ ? 1 : 0;",
          huecos: ["0", "3", "2"],
          banco: ["0", "3", "2", "1", "8", "4"],
          porque: {
            es: "Lo que cae fuera del tablero cuenta 0; con tres vive, estuviera como estuviera; con dos, sólo si ya estaba viva.",
            en: "Whatever falls off the board counts as 0; with three it lives, whatever it was; with two, only if it was already alive.",
          },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `generacion(filas)`: recibe el tablero como renglones de `O` (viva) y `.` (muerta) y devuelve los renglones de la generación siguiente. Fuera del tablero no hay nadie.",
            en: "Write `generacion(filas)`: it takes the board as rows of `O` (alive) and `.` (dead) and returns the rows of the next generation. There's nobody off the board.",
          },
          inicial: {
            es: "function generacion(filas) {\n  // por cada casilla: cuenta sus vecinas 'O' y decide\n  return filas;\n}\n\nconsole.log(generacion([\".....\", \".....\", \".OOO.\", \".....\", \".....\"]).join(\"\\n\"));",
            en: "function generacion(filas) {\n  // for each cell: count its 'O' neighbors and decide\n  return filas;\n}\n\nconsole.log(generacion([\".....\", \".....\", \".OOO.\", \".....\", \".....\"]).join(\"\\n\"));",
          },
          pruebas: [
            { llamada: "generacion([\".....\", \".....\", \".OOO.\", \".....\", \".....\"])", espera: "[\".....\",\"..O..\",\"..O..\",\"..O..\",\".....\"]" },
            { llamada: "generacion([\"....\", \".OO.\", \".OO.\", \"....\"])", espera: "[\"....\",\".OO.\",\".OO.\",\"....\"]" },
            { llamada: "generacion([\"OOO\", \"OOO\", \"OOO\"])", espera: "[\"O.O\",\"...\",\"O.O\"]" },
            { llamada: "generacion([\"O\"])", espera: "[\".\"]" },
            { llamada: "generacion([\".O...\", \"..O..\", \"OOO..\", \".....\", \".....\"])", espera: "[\".....\",\"O.O..\",\".OO..\",\".O...\",\".....\"]" },
          ],
          solucion: "function generacion(filas) {\n  return filas.map((fila, y) =>\n    [...fila].map((c, x) => {\n      let n = 0;\n      for (let i = y - 1; i <= y + 1; i++)\n        for (let j = x - 1; j <= x + 1; j++)\n          if ((i !== y || j !== x) && filas[i]?.[j] === \"O\") n++;\n      return n === 3 || (c === \"O\" && n === 2) ? \"O\" : \".\";\n    }).join(\"\"));\n}",
          porque: {
            es: "`filas` nunca cambia: todas cuentan sobre la misma generación y el resultado va en renglones nuevos. En el de 3 × 3 lleno, la del centro tiene ocho vecinas y muere amontonada; las esquinas tienen tres y siguen.",
            en: "`filas` never changes: every cell counts on the same generation and the result goes into new rows. In the full 3 × 3 one, the center has eight neighbors and dies of crowding; the corners have three and stay.",
          },
        },
      ],
    },
  ],
};
