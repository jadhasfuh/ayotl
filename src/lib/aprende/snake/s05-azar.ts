import type { T, Unidad } from "../tipos";

/** El mismo programa en los dos idiomas: sólo cambian los comentarios. */
const bi = (es: string, pares: [string, string][]): T => ({ es, en: pares.reduce((s, [a, b]) => s.split(a).join(b), es) });

// El generador de Daily Challenge, tal cual está en public/arcade/core/rng.js.
const MULBERRY = `function mulberry32(seed) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p,
  };
}`;

const HASH = `function hashString(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}`;

export const S05: Unidad = {
  id: "azar",
  titulo: { es: "Azar con semilla", en: "Seeded randomness" },
  lecciones: [
    {
      id: "azar-con-semilla",
      titulo: { es: "El mismo azar para todos", en: "The same luck for everyone" },
      resumen: {
        es: "Por qué Math.random no sirve para un reto diario: mulberry32, la fecha como semilla y la misma partida en el teléfono y en el servidor.",
        en: "Why Math.random won't do for a daily challenge: mulberry32, the date as a seed and the same game on the phone and on the server.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Math.random no se puede repetir", en: "Math.random can't be replayed" },
          texto: {
            es: "En Snake la fruta sale en una casilla libre al azar. Si ese azar fuera `Math.random()`, cada quien vería la fruta en otro lado y el reto del día ya no sería el mismo para todos. Peor: el servidor, que vuelve a jugar tu partida para revisar el puntaje (lo verás en la unidad 7), sacaría otras frutas y otro resultado.\n\nLa salida es un **generador pseudoaleatorio**: una función que, a partir de un número inicial, la **semilla**, da una serie que parece azar pero es siempre la misma. Daily Challenge usa **mulberry32**: diez renglones, sin librerías. Corre el programa dos veces: `Math.random` cambia; las dos series de la semilla 42 no.",
            en: "In Snake the fruit appears on a random free cell. If that randomness came from `Math.random()`, everyone would see the fruit somewhere else and the daily challenge wouldn't be the same for all. Worse: the server, which replays your game to check the score (you'll see it in unit 7), would get other fruit and another result.\n\nThe way out is a **pseudorandom generator**: a function that, starting from an initial number, the **seed**, produces a series that looks random but is always the same. Daily Challenge uses **mulberry32**: ten lines, no libraries. Run the program twice: `Math.random` changes; the two seed-42 series don't.",
          },
          programa: {
            codigo: bi(`${MULBERRY}

console.log("Math.random:", Math.random().toFixed(4), Math.random().toFixed(4));

const a = mulberry32(42);
const b = mulberry32(42);   // otra serie, misma semilla
console.log("a:", a.next().toFixed(4), a.next().toFixed(4), a.next().toFixed(4));
console.log("b:", b.next().toFixed(4), b.next().toFixed(4), b.next().toFixed(4));`, [["// otra serie, misma semilla", "// another series, same seed"]]),
            notas: {
              es: "- Los de `Math.random` salen distintos cada vez que pulsas CORRER.\n- `a` y `b` dan exactamente los mismos tres números: misma semilla, misma serie.\n- Cada `next()` devuelve un número entre 0 (incluido) y 1 (sin incluir), como `Math.random`.",
              en: "- The `Math.random` ones change every time you press RUN.\n- `a` and `b` give exactly the same three numbers: same seed, same series.\n- Each `next()` returns a number between 0 (included) and 1 (excluded), just like `Math.random`.",
            },
          },
          enlaces: [
            { url: "https://es.wikipedia.org/wiki/Generador_de_n%C3%BAmeros_pseudoaleatorios", texto: { es: "Generador de números pseudoaleatorios (Wikipedia)", en: "Pseudorandom number generator (Wikipedia, Spanish)" } },
          ],
        },
        {
          tipo: "explica",
          titulo: { es: "La fecha se vuelve semilla", en: "The date becomes the seed" },
          texto: {
            es: "¿De dónde sale la semilla del día? De la fecha. `hashString` convierte un texto como `\"2026-10-23\"` en un entero de 32 bits con **FNV-1a**: por cada letra, mezcla su código con `^` (o exclusivo) y multiplica por un primo. Fechas seguidas sólo cambian en la última letra y dan semillas cercanas, pero no importa: mulberry32 las revuelve y sus series no se parecen en nada.\n\nDe esa semilla salen **dos series independientes** con `seeds()`: una para el juego y otra para la música. Así, si un día la música pide más números al azar, la fruta no se mueve de lugar.",
            en: "Where does the day's seed come from? From the date. `hashString` turns a string like `\"2026-10-23\"` into a 32-bit integer with **FNV-1a**: for each character it mixes its code in with `^` (exclusive or) and multiplies by a prime. Consecutive dates only differ in the last character and give nearby seeds, but that's fine: mulberry32 scrambles them and their series look nothing alike.\n\nFrom that seed, `seeds()` derives **two independent series**: one for the game and one for the music. That way, if the music someday asks for more random numbers, the fruit doesn't move.",
          },
          programa: {
            codigo: bi(`${MULBERRY}

${HASH}

// De public/arcade/core/rng.js: dos semillas que no se pisan
const seeds = (seed) => ({ game: (seed ^ 0x1234abcd) >>> 0, music: (seed ^ 0x9e3779b9) >>> 0 });

for (const fecha of ["2026-10-23", "2026-10-24", "2026-10-25"]) {
  const s = hashString(fecha);
  const rng = mulberry32(seeds(s).game);
  const tres = [rng.next(), rng.next(), rng.next()].map((v) => v.toFixed(2)).join(" ");
  console.log(fecha, "->", s, "| juego:", tres);
}`, [["// De public/arcade/core/rng.js: dos semillas que no se pisan", "// From public/arcade/core/rng.js: two seeds that don't collide"], ["\"| juego:\"", "\"| game:\""]]),
            notas: {
              es: "- Las tres semillas se parecen (sólo cambió la última letra), pero las series del juego que salen de ellas no tienen nada que ver: el generador hace el revoltijo.\n- `>>> 0` deja el número como entero **sin signo** de 32 bits; sin él, la mitad saldrían negativos.\n- El servidor calcula lo mismo con la misma función (`src/lib/reto.ts` hace `hashString(fecha)`), así que nadie tiene que mandarle la semilla.",
              en: "- The three seeds look alike (only the last character changed), but the game series that come out of them have nothing in common: the generator does the scrambling.\n- `>>> 0` keeps the number as an **unsigned** 32-bit integer; without it, half would come out negative.\n- The server computes the same thing with the same function (`src/lib/reto.ts` does `hashString(fecha)`), so nobody has to send it the seed.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "pick, int y chance", en: "pick, int and chance" },
          texto: {
            es: "Sobre `next()` hay tres ayudas: `int(min, max)` da un entero entre los dos (incluidos), `pick(arr)` elige un elemento y `chance(p)` es «sí» con probabilidad `p`.\n\nSnake usa `pick`: junta las casillas libres en un arreglo y elige una (`randomEmpty` en `games/snake.js`). Aquí está esa idea en un tablero de 4×3. Corre el programa: con la misma semilla las tres frutas caen siempre en las mismas casillas, en el teléfono de cualquiera y en el servidor.",
            en: "On top of `next()` there are three helpers: `int(min, max)` gives an integer between the two (inclusive), `pick(arr)` chooses an item and `chance(p)` is \"yes\" with probability `p`.\n\nSnake uses `pick`: it gathers the free cells in an array and chooses one (`randomEmpty` in `games/snake.js`). Here's that idea on a 4×3 board. Run it: with the same seed the three fruits always land on the same cells, on anyone's phone and on the server.",
          },
          programa: {
            codigo: bi(`${MULBERRY}

function frutas(semilla) {
  const rng = mulberry32(semilla);
  const libres = [];   // casillas donde puede caer
  for (let y = 0; y < 3; y++)
    for (let x = 0; x < 4; x++) libres.push({ x, y });
  const salen = [];
  for (let i = 0; i < 3; i++) {
    const f = rng.pick(libres);
    libres.splice(libres.indexOf(f), 1);
    salen.push(f.x + "," + f.y);
  }
  return salen.join("  ");
}

console.log("semilla 7:", frutas(7));
console.log("semilla 7:", frutas(7));   // otra vez: igual
console.log("semilla 8:", frutas(8));

const dado = mulberry32(2026);
console.log("dado:", dado.int(1, 6), dado.int(1, 6), dado.int(1, 6));
console.log("moneda:", dado.chance(0.5) ? "águila" : "sol");`, [["// casillas donde puede caer", "// cells it can land on"], ["// otra vez: igual", "// again: the same"], ["\"águila\" : \"sol\"", "\"heads\" : \"tails\""]]),
            notas: {
              es: "Las dos líneas de la semilla 7 son idénticas; la 8 cambia todo. Fíjate en que el juego **nunca** guarda «la fruta salió en 2,1»: le basta con la semilla y con pedir los números en el mismo orden.",
              en: "Both seed-7 lines are identical; seed 8 changes everything. Notice the game **never** stores \"the fruit appeared at 2,1\": the seed is enough, as long as the numbers are asked for in the same order.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "La regla: sólo la semilla y los botones", en: "The rule: only the seed and the buttons" },
          texto: {
            es: "Para que una partida se pueda repetir, la simulación sólo puede depender de dos cosas: **la semilla** y **los botones de cada tick**. Nada de `Math.random`, ni de la hora (`Date.now`), ni del tamaño de la pantalla dentro de `update`.\n\nFuera de la simulación sí se vale: el ruido blanco de la percusión se llena con `Math.random` (`core/audio.js`) porque sólo suena; no mueve ni una casilla. Y ojo con el orden: pedir un número de más en un lugar corre toda la serie. Por eso el juego y la música tienen series separadas.",
            en: "For a game to be replayable, the simulation may depend on just two things: **the seed** and **each tick's buttons**. No `Math.random`, no clock (`Date.now`), no screen size inside `update`.\n\nOutside the simulation it's fine: the white noise for percussion is filled with `Math.random` (`core/audio.js`) because it only makes sound; it doesn't move a single cell. And watch the order: asking for one extra number anywhere shifts the whole series. That's why the game and the music have separate series.",
          },
          programa: {
            codigo: bi(`${MULBERRY}

const juego = mulberry32(99);
const otra = mulberry32(99);

otra.next();   // alguien pidió UN número de más (por ejemplo, la música)

console.log("fruta 1:", juego.int(0, 15), "vs", otra.int(0, 15));
console.log("fruta 2:", juego.int(0, 15), "vs", otra.int(0, 15));
console.log("fruta 3:", juego.int(0, 15), "vs", otra.int(0, 15));`, [["// alguien pidió UN número de más (por ejemplo, la música)", "// someone asked for ONE extra number (the music, say)"]]),
            notas: {
              es: "Un solo `next()` de más y todas las frutas siguientes cambian. Si la música compartiera la serie del juego, cambiar una canción movería las frutas y rompería las partidas guardadas.",
              en: "A single extra `next()` and every following fruit changes. If the music shared the game's series, changing a song would move the fruit and break saved games.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Por qué Snake no usa `Math.random()` para la fruta?", en: "Why doesn't Snake use `Math.random()` for the fruit?" },
          opciones: [
            { es: "Porque es muy lento", en: "Because it's too slow" },
            { es: "Porque no se puede repetir: el reto no sería igual para todos ni el servidor podría re-simular la partida", en: "Because it can't be replayed: the challenge wouldn't be the same for everyone and the server couldn't re-simulate the game" },
            { es: "Porque no existe en los teléfonos", en: "Because it doesn't exist on phones" },
            { es: "Porque da números negativos", en: "Because it returns negative numbers" },
          ],
          correcta: 1,
          porque: { es: "`Math.random` no tiene semilla: cada corrida es distinta. Con mulberry32 y la semilla del día, todos los teléfonos y el servidor ven las mismas frutas.", en: "`Math.random` has no seed: every run is different. With mulberry32 and the day's seed, every phone and the server see the same fruit." },
        },
        {
          tipo: "elige",
          pregunta: { es: "Con la función `mulberry32` de la lección, ¿qué imprime esto?", en: "With the lesson's `mulberry32`, what does this print?" },
          codigo: "console.log(mulberry32(7).next() === mulberry32(7).next());",
          opciones: ["true", "false", "undefined", { es: "Depende de la hora", en: "It depends on the time" }],
          correcta: 0,
          porque: { es: "Son dos generadores nuevos con la misma semilla, y se les pide el primer número a cada uno: sale el mismo. `true`.", en: "Two fresh generators with the same seed, each asked for its first number: they match. `true`." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa el camino de la fecha a la fruta.", en: "Fill in the path from the date to the fruit." },
          codigo: "const seed = ___(\"2026-10-23\");\nconst rng = ___(seeds(seed).game);\nconst fruta = rng.___(libres);",
          huecos: ["hashString", "mulberry32", "pick"],
          banco: ["hashString", "mulberry32", "pick", "Math.random", "int", "Date.now"],
          porque: { es: "La fecha se vuelve número con `hashString`, el número arranca el generador `mulberry32` y `pick` elige una casilla libre.", en: "The date becomes a number with `hashString`, that number starts the `mulberry32` generator and `pick` chooses a free cell." },
        },
        {
          tipo: "ordena",
          pregunta: { es: "Ordena los pasos que da el juego desde la fecha hasta la primera fruta.", en: "Put the steps in order, from the date to the first fruit." },
          lineas: [
            "const seed = hashString(\"2026-10-23\");",
            "const { game } = seeds(seed);",
            "const rng = mulberry32(game);",
            "const fruta = rng.pick(libres);",
          ],
          porque: { es: "Fecha → semilla del día → semilla del juego (separada de la de la música) → generador → fruta. Cada paso necesita el anterior.", en: "Date → day's seed → game seed (separate from the music's) → generator → fruit. Each step needs the one before." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Cuál de estas cosas **sí** se puede hacer con `Math.random` sin romper las partidas guardadas?", en: "Which of these **can** use `Math.random` without breaking saved games?" },
          opciones: [
            { es: "Elegir dónde sale la fruta", en: "Choosing where the fruit appears" },
            { es: "Decidir cuándo sale el bicho de premio", en: "Deciding when the bonus bug appears" },
            { es: "Llenar el ruido blanco de la percusión", en: "Filling the percussion's white noise" },
            { es: "Elegir los muros extra del día", en: "Choosing the day's extra walls" },
          ],
          correcta: 2,
          porque: { es: "El ruido sólo suena: no cambia el estado del juego. Todo lo demás pasa dentro de la simulación y tiene que salir de la semilla.", en: "The noise only makes sound: it doesn't change the game state. Everything else happens inside the simulation and has to come from the seed." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `tirarDados(semilla, n)`: devuelve un arreglo con `n` tiradas de un dado (enteros del 1 al 6) usando `mulberry32(semilla)`. Con la misma semilla tiene que dar siempre lo mismo.",
            en: "Write `tirarDados(semilla, n)`: return an array of `n` die rolls (integers 1 to 6) using `mulberry32(semilla)`. The same seed must always give the same result.",
          },
          inicial: bi(`${MULBERRY}

function tirarDados(semilla, n) {
  // usa rng.int(1, 6), no Math.random
  return [];
}

console.log(tirarDados(1, 5));`, [["// usa rng.int(1, 6), no Math.random", "// use rng.int(1, 6), not Math.random"]]),
          pruebas: [
            { llamada: "tirarDados(1, 5)", espera: "[4,1,4,6,6]" },
            { llamada: "tirarDados(2026, 3)", espera: "[3,2,4]" },
            { llamada: "tirarDados(9, 0)", espera: "[]" },
            { llamada: "JSON.stringify(tirarDados(5, 4)) === JSON.stringify(tirarDados(5, 4))", espera: "true" },
          ],
          solucion: `${MULBERRY}

function tirarDados(semilla, n) {
  const rng = mulberry32(semilla);
  const tiradas = [];
  for (let i = 0; i < n; i++) tiradas.push(rng.int(1, 6));
  return tiradas;
}`,
          porque: { es: "Un generador nuevo por llamada, con la semilla que te pasan, y `int(1, 6)` en cada vuelta. Como el generador se crea dentro de la función, dos llamadas con la misma semilla empiezan desde el mismo punto.", en: "A fresh generator per call, with the seed you're given, and `int(1, 6)` each turn. Because the generator is created inside the function, two calls with the same seed start from the same point." },
        },
      ],
    },
  ],
};
