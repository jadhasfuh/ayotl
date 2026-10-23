import type { Unidad } from "../tipos";

export const S02: Unidad = {
  id: "graficos",
  titulo: { es: "Gráficos", en: "Graphics" },
  lecciones: [
    {
      id: "pantalla-de-160x192",
      titulo: { es: "Una pantalla de 160 × 192", en: "A 160 × 192 screen" },
      resumen: {
        es: "La pantalla virtual de la Atari, cómo se agranda sin ponerse borrosa y dónde cae cada casilla de Snake.",
        en: "The Atari's virtual screen, how it's scaled up without blurring and where each Snake cell lands.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Píxeles virtuales", en: "Virtual pixels" },
          texto: {
            es: "Todos los juegos dibujan en una pantalla de **160 × 192 píxeles**, la proporción de la Atari 2600. No importa si tu teléfono tiene 400 o 1400 píxeles de ancho: el juego sólo conoce esos 160.\n\nEn `core/renderer.js` el canvas se crea de ese tamaño exacto y se apaga el suavizado:\n\n`canvas.width = VW; canvas.height = VH;`\n`this.ctx.imageSmoothingEnabled = false;`\n\nY pintar es casi siempre una sola cosa: un rectángulo de color, `rect(x, y, w, h, color)`. El programa imita ese renderer con letras: cada carácter vale un bloque de 10 × 10 píxeles.",
            en: "Every game draws on a **160 × 192 pixel** screen, the Atari 2600's proportions. It doesn't matter whether your phone is 400 or 1400 pixels wide: the game only knows those 160.\n\nIn `core/renderer.js` the canvas is created at exactly that size and smoothing is turned off:\n\n`canvas.width = VW; canvas.height = VH;`\n`this.ctx.imageSmoothingEnabled = false;`\n\nAnd drawing is almost always just one thing: a colored rectangle, `rect(x, y, w, h, color)`. The program imitates that renderer with characters: each one stands for a 10 × 10 pixel block.",
          },
          programa: {
            codigo: {
              es: `const VW = 160, VH = 192, BLOQUE = 10;

// Un renderer de mentira: pinta letras en vez de píxeles
class Renderer {
  constructor() {
    this.filas = Array.from({ length: Math.ceil(VH / BLOQUE) }, () => Array(VW / BLOQUE).fill(" "));
  }
  rect(x, y, w, h, color) {
    for (let fy = Math.floor(y / BLOQUE); fy < Math.ceil((y + h) / BLOQUE); fy++)
      for (let fx = Math.floor(x / BLOQUE); fx < Math.ceil((x + w) / BLOQUE); fx++)
        if (this.filas[fy] && fx < this.filas[fy].length) this.filas[fy][fx] = color;
  }
  clear(color) { this.rect(0, 0, VW, VH, color); }
  mostrar() { for (const f of this.filas) console.log("|" + f.join("") + "|"); }
}

const r = new Renderer();
r.clear(".");
r.rect(0, 0, 160, 16, "=");      // el marcador de arriba
r.rect(70, 96, 30, 10, "s");     // tres casillas de serpiente
r.rect(120, 56, 10, 10, "f");    // una fruta
r.mostrar();`,
              en: `const VW = 160, VH = 192, BLOQUE = 10;

// A fake renderer: draws characters instead of pixels
class Renderer {
  constructor() {
    this.filas = Array.from({ length: Math.ceil(VH / BLOQUE) }, () => Array(VW / BLOQUE).fill(" "));
  }
  rect(x, y, w, h, color) {
    for (let fy = Math.floor(y / BLOQUE); fy < Math.ceil((y + h) / BLOQUE); fy++)
      for (let fx = Math.floor(x / BLOQUE); fx < Math.ceil((x + w) / BLOQUE); fx++)
        if (this.filas[fy] && fx < this.filas[fy].length) this.filas[fy][fx] = color;
  }
  clear(color) { this.rect(0, 0, VW, VH, color); }
  mostrar() { for (const f of this.filas) console.log("|" + f.join("") + "|"); }
}

const r = new Renderer();
r.clear(".");
r.rect(0, 0, 160, 16, "=");      // the score bar at the top
r.rect(70, 96, 30, 10, "s");     // three snake cells
r.rect(120, 56, 10, 10, "f");    // a fruit
r.mostrar();`,
            },
            notas: {
              es: "Salen 16 columnas por 20 renglones de letras: 160 × 192 entre 10. El marcador mide 16 píxeles, y por eso el tablero empieza en el píxel 16, a media letra: la serpiente (en el píxel 96, la salida real de snake_01) y la fruta ocupan dos renglones cada una. La pantalla de verdad no tiene ese problema; el dibujo con letras es más burdo. Mueve la fruta cambiando el 120 y el 56.",
              en: "You get 16 columns by 20 rows of characters: 160 × 192 divided by 10. The score bar is 16 pixels tall, so the board starts at pixel 16, halfway through a character: the snake (at pixel 96, snake_01's real start) and the fruit each take up two rows. The real screen doesn't have that problem; the character drawing is just coarser. Move the fruit by changing the 120 and the 56.",
            },
          },
          enlaces: [{ url: "https://developer.mozilla.org/es/docs/Web/API/Canvas_API/Tutorial", texto: { es: "Tutorial de Canvas (MDN)", en: "Canvas tutorial (MDN)" } }],
        },
        {
          tipo: "explica",
          titulo: { es: "Agrandar sin que se vea borroso", en: "Scaling up without blur" },
          texto: {
            es: "160 píxeles en un teléfono serían una estampita. Así que el canvas se agranda con CSS, pero **sólo por números enteros**: ×2, ×3, ×4. Si fuera ×2.5, unos píxeles saldrían de 2 y otros de 3, y las letras de 3 × 5 se verían chuecas.\n\nEsto es `fit()`, tal cual está en el renderer:\n\n`const s = Math.max(1, Math.floor(Math.min(availW / VW, availH / VH)));`\n\nBusca la escala que cabe a lo ancho y a lo alto, se queda con la menor y la redondea hacia abajo. Y el CSS del canvas lleva `image-rendering: pixelated`, para que el navegador agrande cada píxel como un cuadro duro en vez de difuminarlo.",
            en: "160 pixels on a phone would be a postage stamp. So the canvas is scaled up with CSS, but **only by whole numbers**: ×2, ×3, ×4. At ×2.5, some pixels would come out 2 wide and others 3, and the 3 × 5 letters would look crooked.\n\nThis is `fit()`, exactly as it is in the renderer:\n\n`const s = Math.max(1, Math.floor(Math.min(availW / VW, availH / VH)));`\n\nIt finds the scale that fits horizontally and vertically, keeps the smaller one and rounds it down. And the canvas CSS has `image-rendering: pixelated`, so the browser enlarges each pixel as a hard square instead of smearing it.",
          },
          programa: {
            codigo: {
              es: `const VW = 160, VH = 192;
function fit(availW, availH) {
  return Math.max(1, Math.floor(Math.min(availW / VW, availH / VH)));
}

const pantallas = [
  ["teléfono chico", 360, 560],
  ["teléfono grande", 412, 760],
  ["tableta", 820, 1000],
  ["laptop", 1366, 680],
];
for (const [nombre, w, h] of pantallas) {
  const s = fit(w, h);
  console.log(nombre.padEnd(16), "x" + s, "->", VW * s + "x" + VH * s, "px");
}`,
              en: `const VW = 160, VH = 192;
function fit(availW, availH) {
  return Math.max(1, Math.floor(Math.min(availW / VW, availH / VH)));
}

const pantallas = [
  ["small phone", 360, 560],
  ["large phone", 412, 760],
  ["tablet", 820, 1000],
  ["laptop", 1366, 680],
];
for (const [nombre, w, h] of pantallas) {
  const s = fit(w, h);
  console.log(nombre.padEnd(16), "x" + s, "->", VW * s + "x" + VH * s, "px");
}`,
            },
            notas: {
              es: "En la laptop manda la altura: 680 / 192 da 3.5, que baja a ×3. En el teléfono chico manda el ancho: 360 / 160 = 2.25, ×2. Sobra un poco de espacio a los lados, y es el precio de los píxeles parejos.",
              en: "On the laptop the height decides: 680 / 192 is 3.5, which rounds down to ×3. On the small phone the width decides: 360 / 160 = 2.25, ×2. A bit of space is left over at the sides; that's the price of even pixels.",
            },
          },
          enlaces: [{ url: "https://developer.mozilla.org/es/docs/Web/CSS/image-rendering", texto: { es: "image-rendering (MDN)", en: "image-rendering (MDN)" } }],
        },
        {
          tipo: "explica",
          titulo: { es: "Dónde cae cada casilla", en: "Where each cell lands" },
          texto: {
            es: "Snake no piensa en píxeles sino en casillas. Arriba de `snake.js` están sus medidas:\n\n`export const CELL = 10, COLS = 16, ROWS = 17, HUD = 16;`\n\n- 16 columnas de 10 píxeles = 160: el ancho exacto de la pantalla.\n- 17 renglones de 10 = 170, más los 16 del marcador (`HUD`) = 186, que caben en 192.\n\nPara pintar la casilla `(x, y)` se convierte a píxeles: `x * CELL` a lo ancho y `HUD + y * CELL` a lo alto, porque el tablero empieza debajo del marcador. Así pinta el cuerpo `render()`:\n\n`r.rect(b.x * CELL, HUD + b.y * CELL, CELL, CELL, color)`\n\nUn comentario del archivo cuenta por qué 10 píxeles: «se ve mejor en teléfono que 20x22 de 8px».",
            en: "Snake doesn't think in pixels but in cells. At the top of `snake.js` are its measurements:\n\n`export const CELL = 10, COLS = 16, ROWS = 17, HUD = 16;`\n\n- 16 columns of 10 pixels = 160: exactly the screen's width.\n- 17 rows of 10 = 170, plus the 16 of the score bar (`HUD`) = 186, which fits in 192.\n\nTo paint cell `(x, y)` it's converted to pixels: `x * CELL` across and `HUD + y * CELL` down, because the board starts below the score bar. This is how `render()` paints the body:\n\n`r.rect(b.x * CELL, HUD + b.y * CELL, CELL, CELL, color)`\n\nA comment in the file explains why 10 pixels: it \"looks better on a phone than 20x22 at 8px\".",
          },
          programa: {
            codigo: {
              es: `const CELL = 10, COLS = 16, ROWS = 17, HUD = 16;

function aPixel(casilla) {
  return { px: casilla.x * CELL, py: HUD + casilla.y * CELL };
}

console.log("esquina de arriba:", aPixel({ x: 0, y: 0 }));
console.log("salida de snake_01:", aPixel({ x: 7, y: 8 }));
console.log("esquina de abajo:", aPixel({ x: COLS - 1, y: ROWS - 1 }));
console.log("alto usado:", HUD + ROWS * CELL, "de 192");`,
              en: `const CELL = 10, COLS = 16, ROWS = 17, HUD = 16;

function aPixel(casilla) {
  return { px: casilla.x * CELL, py: HUD + casilla.y * CELL };
}

console.log("top corner:", aPixel({ x: 0, y: 0 }));
console.log("snake_01 start:", aPixel({ x: 7, y: 8 }));
console.log("bottom corner:", aPixel({ x: COLS - 1, y: ROWS - 1 }));
console.log("height used:", HUD + ROWS * CELL, "of 192");`,
            },
            notas: {
              es: "La última casilla empieza en el píxel 176 y termina en el 185: sobran 6 píxeles abajo. La lógica del juego nunca habla de píxeles; sólo `render` hace la cuenta.",
              en: "The last cell starts at pixel 176 and ends at 185: 6 pixels are left over at the bottom. The game logic never talks about pixels; only `render` does the math.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "Hay 400 × 700 píxeles libres. ¿Qué escala elige `fit()`?", en: "There are 400 × 700 pixels free. Which scale does `fit()` choose?" },
          opciones: ["×1", "×2", "×2.5", "×3"],
          correcta: 1,
          porque: { es: "A lo ancho cabe 400 / 160 = 2.5 y a lo alto 700 / 192 ≈ 3.6. Se toma la menor, 2.5, y se redondea hacia abajo: ×2. Nunca escalas con decimales.", en: "Horizontally 400 / 160 = 2.5 fits, vertically 700 / 192 ≈ 3.6. Take the smaller one, 2.5, and round down: ×2. Never fractional scales." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Para qué sirve `image-rendering: pixelated` en el canvas?", en: "What is `image-rendering: pixelated` on the canvas for?" },
          opciones: [
            { es: "Para que el juego corra más rápido", en: "To make the game run faster" },
            { es: "Para que al agrandarlo cada píxel sea un cuadro nítido y no una mancha", en: "So that when it's enlarged each pixel is a sharp square, not a blur" },
            { es: "Para bajar la resolución del teléfono", en: "To lower the phone's resolution" },
            { es: "Para convertir los colores a la paleta Atari", en: "To convert the colors to the Atari palette" },
          ],
          correcta: 1,
          porque: { es: "Sin esa regla, el navegador suaviza al agrandar y los bordes salen borrosos. Con ella, un píxel virtual se vuelve un bloque duro de 2 × 2, 3 × 3…", en: "Without that rule, the browser smooths when enlarging and edges come out blurry. With it, one virtual pixel becomes a hard 2 × 2, 3 × 3… block." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa la línea de `render()` que pinta cada parte del cuerpo.", en: "Complete the line in `render()` that paints each body segment." },
          codigo: "r.rect(b.x * ___, ___ + b.y * CELL, CELL, CELL, color);",
          huecos: ["CELL", "HUD"],
          banco: ["CELL", "HUD", "COLS", "ROWS", "VW"],
          porque: { es: "La casilla se multiplica por `CELL` (10) y, en vertical, se le suma `HUD` (16) porque el tablero empieza debajo del marcador.", en: "The cell is multiplied by `CELL` (10) and, vertically, `HUD` (16) is added because the board starts below the score bar." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `escala(ancho, alto)` como `fit()`: la escala entera más grande con la que 160 × 192 cabe en ese espacio, y nunca menos de 1.",
            en: "Write `escala(ancho, alto)` like `fit()`: the largest whole scale at which 160 × 192 fits in that space, and never less than 1.",
          },
          inicial: {
            es: "function escala(ancho, alto) {\n  // 160 x 192 tiene que caber entero\n}\n\nconsole.log(escala(360, 600));",
            en: "function escala(ancho, alto) {\n  // 160 x 192 has to fit whole\n}\n\nconsole.log(escala(360, 600));",
          },
          pruebas: [
            { llamada: "escala(360, 600)", espera: "2" },
            { llamada: "escala(1000, 800)", espera: "4" },
            { llamada: "escala(480, 576)", espera: "3" },
            { llamada: "escala(100, 100)", espera: "1" },
          ],
          solucion: "function escala(ancho, alto) {\n  return Math.max(1, Math.floor(Math.min(ancho / 160, alto / 192)));\n}",
          porque: { es: "`Math.min` se queda con el lado que aprieta más, `Math.floor` lo vuelve entero y `Math.max(1, …)` evita la escala 0 en pantallas diminutas (ahí el juego se sale, pero al menos se ve).", en: "`Math.min` picks the tighter side, `Math.floor` makes it whole and `Math.max(1, …)` avoids scale 0 on tiny screens (the game overflows there, but at least it shows)." },
        },
      ],
    },
    {
      id: "letras-sprites-y-paleta",
      titulo: { es: "Letras, sprites y paleta", en: "Letters, sprites and palette" },
      resumen: {
        es: "Una fuente de 3 × 5 hecha de unos y ceros, el bicho de premio de 1 bit y los 128 colores de la Atari.",
        en: "A 3 × 5 font made of ones and zeros, the 1-bit bonus bug and the Atari's 128 colors.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Una fuente de 3 × 5", en: "A 3 × 5 font" },
          texto: {
            es: "Daily Challenge no carga una tipografía para el marcador: cada letra es un dibujo de 3 píxeles de ancho por 5 de alto, guardado como cinco textos de unos y ceros. Así está la `A` en `renderer.js`:\n\n`'A':['010','101','111','101','101']`\n\nPara escribir, `text()` recorre cada letra, y por cada `'1'` pinta un píxel de 1 × 1. Después avanza 4 píxeles: 3 de la letra y 1 de espacio. Por eso un texto mide `largo × 4 − 1` píxeles.",
            en: "Daily Challenge doesn't load a typeface for the score bar: each letter is a drawing 3 pixels wide by 5 tall, stored as five strings of ones and zeros. This is the `A` in `renderer.js`:\n\n`'A':['010','101','111','101','101']`\n\nTo write, `text()` goes through each letter, and for every `'1'` it paints a 1 × 1 pixel. Then it moves 4 pixels along: 3 for the letter and 1 of space. That's why a text is `length × 4 − 1` pixels wide.",
          },
          programa: {
            codigo: {
              es: `// Cinco letras de la fuente real de renderer.js
const FONT = {
  S: ["111", "100", "111", "001", "111"],
  N: ["110", "101", "101", "101", "101"],
  A: ["010", "101", "111", "101", "101"],
  K: ["101", "101", "110", "101", "101"],
  E: ["111", "100", "111", "100", "111"],
};

function text(str) {
  const renglones = ["", "", "", "", ""];
  for (const ch of str) {
    const g = FONT[ch];
    for (let r = 0; r < 5; r++)
      renglones[r] += g[r].replaceAll("1", "#").replaceAll("0", " ") + " ";
  }
  for (const r of renglones) console.log(r);
}

text("SNAKE");
console.log("ancho en píxeles:", "SNAKE".length * 4 - 1);`,
              en: `// Five letters from the real font in renderer.js
const FONT = {
  S: ["111", "100", "111", "001", "111"],
  N: ["110", "101", "101", "101", "101"],
  A: ["010", "101", "111", "101", "101"],
  K: ["101", "101", "110", "101", "101"],
  E: ["111", "100", "111", "100", "111"],
};

function text(str) {
  const renglones = ["", "", "", "", ""];
  for (const ch of str) {
    const g = FONT[ch];
    for (let r = 0; r < 5; r++)
      renglones[r] += g[r].replaceAll("1", "#").replaceAll("0", " ") + " ";
  }
  for (const r of renglones) console.log(r);
}

text("SNAKE");
console.log("width in pixels:", "SNAKE".length * 4 - 1);`,
            },
            notas: {
              es: "Ahí está «SNAKE»: 5 píxeles de alto y 19 de ancho. La fuente entera tiene unas 60 entradas como éstas; agrega la `T` (`['111','010','010','010','010']`) y escribe «SKATE».",
              en: "There's \"SNAKE\", 5 pixels tall and 19 wide. The whole font has about 60 entries like these; add the `T` (`['111','010','010','010','010']`) and write \"SKATE\".",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "El bicho de premio", en: "The bonus bug" },
          texto: {
            es: "Los dibujos más grandes usan la misma idea. En Snake, cada cinco frutas sale un **bicho de premio**, como en el Snake II de Nokia: un sprite de 10 × 10 en el que `'1'` es píxel encendido y `'.'` apagado. Es de **1 bit**: no guarda colores, sólo «hay o no hay». El color se lo pone quien lo pinta:\n\n`r.sprite(BICHO, x, y, PAL.yellow)`\n\nComo es sólo texto, se puede transformar con código: voltearlo, contarlo, compararlo.",
            en: "Bigger drawings use the same idea. In Snake, every five fruits a **bonus bug** appears, as in Nokia's Snake II: a 10 × 10 sprite where `'1'` is a lit pixel and `'.'` is off. It's **1-bit**: it doesn't store colors, only \"there or not\". The color comes from whoever paints it:\n\n`r.sprite(BICHO, x, y, PAL.yellow)`\n\nSince it's just text, code can transform it: flip it, count it, compare it.",
          },
          programa: {
            codigo: {
              es: `// El sprite tal cual está en snake.js
const BICHO = [".1......1.", "..1....1..", "...1111...", "..111111..", ".11.11.11.",
               ".11111111.", "..111111..", ".1.1..1.1.", "1..1..1..1", ".........."];

const pintar = filas => filas.forEach(f => console.log(f.replaceAll("1", "#").replaceAll(".", " ")));
pintar(BICHO);

const encendidos = BICHO.join("").split("").filter(c => c === "1").length;
console.log("píxeles encendidos:", encendidos, "de", BICHO.length * BICHO[0].length);

console.log("--- de cabeza:");
pintar([...BICHO].reverse());`,
              en: `// The sprite exactly as it is in snake.js
const BICHO = [".1......1.", "..1....1..", "...1111...", "..111111..", ".11.11.11.",
               ".11111111.", "..111111..", ".1.1..1.1.", "1..1..1..1", ".........."];

const pintar = filas => filas.forEach(f => console.log(f.replaceAll("1", "#").replaceAll(".", " ")));
pintar(BICHO);

const encendidos = BICHO.join("").split("").filter(c => c === "1").length;
console.log("lit pixels:", encendidos, "of", BICHO.length * BICHO[0].length);

console.log("--- upside down:");
pintar([...BICHO].reverse());`,
            },
            notas: {
              es: "Antenas, ojos (los huecos del renglón 5) y patas. El renglón de abajo está vacío a propósito: el bicho ocupa una casilla de 10 × 10 y así no se pega a la de abajo.",
              en: "Antennae, eyes (the gaps in row 5) and legs. The bottom row is empty on purpose: the bug fills a 10 × 10 cell and this way it doesn't touch the one below.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "128 colores con una fórmula", en: "128 colors from one formula" },
          texto: {
            es: "La Atari 2600 tenía una paleta fija: 16 tonos por 8 luminosidades. `core/palette.js` la reproduce con una función `atari(hue, lum)` que devuelve un color CSS:\n\n- Tono `0` son los grises: `v = lum * 34`, de negro a casi blanco.\n- Los demás tonos dan la vuelta al círculo cromático **al revés**, como el chip de video de la consola (el TIA): `h = (55 - (hue - 1) * 24 + 720) % 360`.\n- Más luminosidad sube la `l` del HSL y baja un poco la saturación.\n\nLuego `PAL` les pone nombre a los que más se usan, para no recordar números: `PAL.green` es `atari(13, 4)`.",
            en: "The Atari 2600 had a fixed palette: 16 hues by 8 luminances. `core/palette.js` reproduces it with a function `atari(hue, lum)` that returns a CSS color:\n\n- Hue `0` is the grays: `v = lum * 34`, from black to almost white.\n- The other hues go around the color wheel **backwards**, like the console's video chip (the TIA): `h = (55 - (hue - 1) * 24 + 720) % 360`.\n- More luminance raises the HSL `l` and lowers the saturation a bit.\n\nThen `PAL` names the most used ones so nobody has to remember numbers: `PAL.green` is `atari(13, 4)`.",
          },
          programa: {
            codigo: {
              es: `// La función real de core/palette.js
function atari(hue, lum) {
  hue &= 15; lum &= 7;
  if (hue === 0) { const v = Math.round(lum * 34); return "rgb(" + v + "," + v + "," + v + ")"; }
  const h = (55 - (hue - 1) * 24 + 720) % 360;
  const l = 14 + lum * 10;
  const s = 90 - lum * 5;
  return "hsl(" + h + "," + s + "%," + l + "%)";
}

const PAL = { black: atari(0, 0), white: atari(0, 7), yellow: atari(1, 6),
              red: atari(4, 4), blue: atari(9, 4), green: atari(13, 4), lgreen: atari(13, 6) };
for (const [nombre, color] of Object.entries(PAL)) console.log(nombre.padEnd(7), color);`,
              en: `// The real function from core/palette.js
function atari(hue, lum) {
  hue &= 15; lum &= 7;
  if (hue === 0) { const v = Math.round(lum * 34); return "rgb(" + v + "," + v + "," + v + ")"; }
  const h = (55 - (hue - 1) * 24 + 720) % 360;
  const l = 14 + lum * 10;
  const s = 90 - lum * 5;
  return "hsl(" + h + "," + s + "%," + l + "%)";
}

const PAL = { black: atari(0, 0), white: atari(0, 7), yellow: atari(1, 6),
              red: atari(4, 4), blue: atari(9, 4), green: atari(13, 4), lgreen: atari(13, 6) };
for (const [nombre, color] of Object.entries(PAL)) console.log(nombre.padEnd(7), color);`,
            },
            notas: {
              es: "La serpiente usa `green` para el cuerpo y `lgreen` (el mismo tono, más claro) para la cabeza; los muros son `blue` y la fruta, `red`. `hue &= 15` recorta cualquier número a 0-15: un tono fuera de rango nunca rompe nada.",
              en: "The snake uses `green` for the body and `lgreen` (same hue, lighter) for the head; walls are `blue` and the fruit `red`. `hue &= 15` clamps any number to 0-15: an out-of-range hue never breaks anything.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Cuántos píxeles de ancho mide «SCORE 00120» con la fuente de 3 × 5?", en: "How many pixels wide is \"SCORE 00120\" in the 3 × 5 font?" },
          opciones: ["33", "43", "44", "55"],
          correcta: 1,
          porque: { es: "Son 11 caracteres (el espacio también cuenta): 11 × 4 − 1 = 43. El −1 es porque después de la última letra no hace falta separación.", en: "That's 11 characters (the space counts too): 11 × 4 − 1 = 43. The −1 is because no gap is needed after the last letter." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Qué color da `atari(0, 7)`?", en: "What color does `atari(0, 7)` give?" },
          opciones: ["rgb(0,0,0)", "rgb(238,238,238)", "rgb(255,255,255)", "hsl(55,55%,84%)"],
          correcta: 1,
          porque: { es: "Tono 0 es la rama de grises: `v = 7 × 34 = 238`. El «blanco» de la Atari no llega a 255.", en: "Hue 0 is the gray branch: `v = 7 × 34 = 238`. The Atari's \"white\" doesn't reach 255." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa el corazón de `sprite()`: pinta un píxel sólo donde el dibujo está encendido.", en: "Complete the heart of `sprite()`: paint a pixel only where the drawing is lit." },
          codigo: "if (row[c] === ___ || row[c] === '#')\n  this.ctx.fillRect(x + c, y + r, ___, 1);",
          huecos: ["'1'", "1"],
          banco: ["'1'", "1", "'.'", "10", "'0'"],
          porque: { es: "Encendido es `'1'` (o `'#'`, que también acepta). Y cada punto es un rectángulo de 1 × 1: el píxel virtual.", en: "Lit is `'1'` (or `'#'`, which it also accepts). And each dot is a 1 × 1 rectangle: the virtual pixel." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `encendidos(filas)`: cuenta cuántos píxeles encendidos tiene un sprite, contando como encendidos los caracteres `'1'` y `'#'`.",
            en: "Write `encendidos(filas)`: count how many lit pixels a sprite has, counting both `'1'` and `'#'` as lit.",
          },
          inicial: {
            es: "function encendidos(filas) {\n  let n = 0;\n  // recorre cada fila y cada carácter\n  return n;\n}\n\nconsole.log(encendidos([\"010\", \"111\"]));",
            en: "function encendidos(filas) {\n  let n = 0;\n  // go through each row and each character\n  return n;\n}\n\nconsole.log(encendidos([\"010\", \"111\"]));",
          },
          pruebas: [
            { llamada: "encendidos([\"010\", \"111\"])", espera: "4" },
            { llamada: "encendidos([\"#.#\", \".#.\"])", espera: "3" },
            { llamada: "encendidos([\".1......1.\", \"..........\"])", espera: "2" },
            { llamada: "encendidos([])", espera: "0" },
          ],
          solucion: "function encendidos(filas) {\n  let n = 0;\n  for (const fila of filas)\n    for (const c of fila)\n      if (c === \"1\" || c === \"#\") n++;\n  return n;\n}",
          porque: { es: "Dos ciclos, como `sprite()`: uno por fila y otro por carácter. Es exactamente el recorrido del renderer, pero contando en vez de pintar.", en: "Two loops, like `sprite()`: one per row and one per character. It's exactly the renderer's walk, counting instead of painting." },
        },
      ],
    },
  ],
};
