import type { T, Unidad } from "../tipos";

/** El mismo programa en los dos idiomas: sólo cambian los comentarios y los textos que imprime. */
const bi = (es: string, pares: [string, string][]): T => ({ es, en: pares.reduce((s, [a, b]) => s.split(a).join(b), es) });

// parseNoteName y midiToFreq, de public/arcade/core/music.js y core/audio.js.
const NOTAS = `const NOTE_IDX = { C: 0, "C#": 1, DB: 1, D: 2, "D#": 3, EB: 3, E: 4, F: 5, "F#": 6, GB: 6, G: 7, "G#": 8, AB: 8, A: 9, "A#": 10, BB: 10, B: 11 };

function parseNoteName(s) {
  const m = /^([A-G](?:#|B)?)(-?\\d)$/.exec(s.trim().toUpperCase());
  if (!m) throw new Error("Nota inválida: " + s);
  return 12 * (parseInt(m[2]) + 1) + NOTE_IDX[m[1]];
}

const midiToFreq = (n) => 440 * Math.pow(2, (n - 69) / 12);`;

export const S06: Unidad = {
  id: "sonido",
  titulo: { es: "Sonido", en: "Sound" },
  lecciones: [
    {
      id: "un-chip-con-web-audio",
      titulo: { es: "Un chip de sonido con Web Audio", en: "A sound chip with Web Audio" },
      resumen: {
        es: "Sin un solo archivo de audio: osciladores cuadrados y triangulares, una envolvente, ruido blanco y los eventos del juego.",
        en: "Without a single audio file: square and triangle oscillators, an envelope, white noise and the game's events.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Una mesa de mezclas en el navegador", en: "A mixing desk in the browser" },
          texto: {
            es: "Daily Challenge no carga ni un mp3: todos sus sonidos se fabrican al momento con la **Web Audio API**, como hacía el chip de una consola de 8 bits. La idea es una mesa de mezclas: un `AudioContext` y **nodos** conectados en cadena.\n\n- Un `OscillatorNode` da un tono: onda `square` (cuadrada, el sonido de Atari y NES) o `triangle` (triangular, más suave, buena para el bajo).\n- Un `GainNode` controla el volumen en el tiempo.\n- Todo termina en un `master` y de ahí a las bocinas. La música pasa antes por su propio bus, `musicBus`, para poder callarla sin callar los efectos.\n\nEn los teléfonos hay una regla: el audio sólo arranca **desde un toque** del usuario. Por eso `chip.unlock()` se llama al pulsar JUGAR, no al cargar la página.\n\nAquí no hay bocinas (el código corre en un Worker), así que el programa usa un `AudioContext` de mentira que **escribe** lo que habría sonado, con la función `note()` de `core/audio.js` tal cual.",
            en: "Daily Challenge doesn't load a single mp3: all its sounds are built on the fly with the **Web Audio API**, the way an 8-bit console's chip did it. Think of a mixing desk: one `AudioContext` and **nodes** wired in a chain.\n\n- An `OscillatorNode` makes a tone: a `square` wave (the Atari and NES sound) or a `triangle` wave (softer, good for bass).\n- A `GainNode` controls volume over time.\n- Everything ends in a `master` and from there goes to the speakers. Music first goes through its own bus, `musicBus`, so it can be muted without muting the effects.\n\nPhones have a rule: audio only starts **from a user's tap**. That's why `chip.unlock()` is called when you press PLAY, not when the page loads.\n\nThere are no speakers here (the code runs in a Worker), so the program uses a fake `AudioContext` that **writes down** what would have played, with `core/audio.js`'s `note()` function as is.",
          },
          programa: {
            codigo: bi(`// Un AudioContext de mentira: en vez de sonar, escribe lo que haría
const ctx = {
  createOscillator() {
    const o = {
      type: "",
      frequency: {
        setValueAtTime: (f, t) => console.log("  oscilador", o.type, f, "Hz desde t =", t),
        exponentialRampToValueAtTime: (f, t) => console.log("  se desliza hasta", f, "Hz en t =", t.toFixed(2)),
      },
      connect: (n) => n,
      start() {},
      stop: (t) => console.log("  se apaga en t =", t.toFixed(2)),
    };
    return o;
  },
  createGain() {
    return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect: (n) => n };
  },
};
const master = {};

// note() de core/audio.js
function note(freq, t, dur, type = "square", vol = 0.15, slideTo = null, bus = master) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
  g.gain.setValueAtTime(vol, t + dur * 0.6);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(bus);
  osc.start(t); osc.stop(t + dur + 0.02);
}

console.log("eat (comer fruta):");
note(660, 0, 0.06, "square", 0.2);
note(990, 0.06, 0.08, "square", 0.2);
console.log("die (chocar):");
note(400, 0, 0.5, "square", 0.25, 50);`, [
              ["// Un AudioContext de mentira: en vez de sonar, escribe lo que haría", "// A fake AudioContext: instead of playing, it writes down what it would do"],
              ["\"  oscilador\"", "\"  oscillator\""], ["\"Hz desde t =\"", "\"Hz from t =\""],
              ["\"  se desliza hasta\"", "\"  slides to\""], ["\"Hz en t =\"", "\"Hz at t =\""], ["\"  se apaga en t =\"", "\"  stops at t =\""],
              ["\"eat (comer fruta):\"", "\"eat (eating fruit):\""], ["\"die (chocar):\"", "\"die (crashing):\""],
            ]),
            notas: {
              es: "- Comer son **dos notas cuadradas** seguidas, 660 y 990 Hz: una quinta hacia arriba, suena a «¡bien!».\n- Chocar es **una sola nota que se desliza** de 400 a 50 Hz en medio segundo: el «piuuu» de toda la vida (en el juego lleva además un golpe de ruido).\n- Cada nota se apaga 20 ms después de su final, para que la envolvente termine antes de cortar.",
              en: "- Eating is **two square notes** in a row, 660 and 990 Hz: a fifth upward, it sounds like \"yes!\".\n- Crashing is **one note that slides** from 400 down to 50 Hz in half a second: the classic \"peeyoo\" (in the game it also gets a burst of noise).\n- Each note stops 20 ms after its end, so the envelope finishes before the cut.",
            },
          },
          enlaces: [
            { url: "https://developer.mozilla.org/es/docs/Web/API/Web_Audio_API", texto: { es: "Web Audio API (MDN)", en: "Web Audio API (MDN, Spanish)" } },
          ],
        },
        {
          tipo: "explica",
          titulo: { es: "La envolvente: cómo nace y muere una nota", en: "The envelope: how a note starts and dies" },
          texto: {
            es: "Si un oscilador se prende y se apaga de golpe, se oye un «clic». Por eso cada nota lleva una **envolvente** en su `GainNode`: sube en 5 milésimas de segundo (el **ataque**), se sostiene hasta el 60 % de su duración y luego cae (el **decaimiento**).\n\nLas rampas son **exponenciales** (`exponentialRampToValueAtTime`) porque el oído percibe el volumen así: bajar de 0.2 a 0.1 suena igual de fuerte que bajar de 0.02 a 0.01. Y por eso arrancan en `0.0001` y no en cero: una rampa exponencial no puede salir de 0.\n\nEl programa calcula esa misma curva para una nota de 0.3 s y la dibuja con `#`.",
            en: "If an oscillator switches on and off abruptly, you hear a \"click\". So each note gets an **envelope** on its `GainNode`: it rises in 5 milliseconds (the **attack**), holds until 60 % of its length and then falls (the **decay**).\n\nThe ramps are **exponential** (`exponentialRampToValueAtTime`) because that's how the ear hears volume: going from 0.2 to 0.1 sounds like as big a drop as 0.02 to 0.01. That's also why they start at `0.0001` rather than zero: an exponential ramp can't leave 0.\n\nThe program computes that same curve for a 0.3 s note and draws it with `#`.",
          },
          programa: {
            codigo: bi(`// La envolvente de note(): ataque de 5 ms, sostiene hasta el 60 %, cae al final
function volumen(t, dur, vol) {
  const rampa = (v0, v1, t0, t1) => v0 * Math.pow(v1 / v0, (t - t0) / (t1 - t0));
  if (t < 0.005) return rampa(0.0001, vol, 0, 0.005);
  if (t < dur * 0.6) return vol;
  if (t < dur) return rampa(vol, 0.0001, dur * 0.6, dur);
  return 0;
}

for (let i = 0; i <= 12; i++) {
  const t = i * 0.025;
  const v = volumen(t, 0.3, 0.2);
  console.log(t.toFixed(3), "s", v.toFixed(4).padStart(7), "#".repeat(Math.round(v * 150)));
}`, [["// La envolvente de note(): ataque de 5 ms, sostiene hasta el 60 %, cae al final", "// note()'s envelope: 5 ms attack, holds until 60 %, falls at the end"]]),
            notas: {
              es: "- Arriba casi desde el primer instante: con 5 ms de ataque el oído lo siente inmediato, pero sin clic.\n- Plano hasta 0.18 s (el 60 % de 0.3).\n- Luego cae rápido al principio y despacio al final: así se ve una rampa exponencial.",
              en: "- Up almost from the first instant: a 5 ms attack feels immediate, but without a click.\n- Flat until 0.18 s (60 % of 0.3).\n- Then it falls fast at first and slowly at the end: that's what an exponential ramp looks like.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "El juego no suena: avisa", en: "The game doesn't play sounds: it reports" },
          texto: {
            es: "La clase `Snake` no sabe que existe el audio. Cuando come, mete `'eat'` en `this.events`; cuando choca, `'die'`. Al final de cada tick, `main.js` recorre esa lista y toca lo que toque:\n\n`for (const e of game.events) chip.sfx(e);`\n\n¿Por qué tanto rodeo? Porque el servidor corre **la misma clase** para revisar puntajes, y en el servidor no hay bocinas ni `AudioContext`. Separar «qué pasó» de «cómo suena» deja la simulación limpia, y además `sfx()` se encarga de detalles que no son del juego: no repetir el mismo efecto antes de 40 ms y no sonar si apagaste los efectos.",
            en: "The `Snake` class doesn't know audio exists. When it eats, it pushes `'eat'` into `this.events`; when it crashes, `'die'`. At the end of each tick, `main.js` walks that list and plays whatever applies:\n\n`for (const e of game.events) chip.sfx(e);`\n\nWhy the detour? Because the server runs **the same class** to check scores, and the server has no speakers and no `AudioContext`. Separating \"what happened\" from \"how it sounds\" keeps the simulation clean, and `sfx()` handles details that aren't the game's business: not repeating the same effect within 40 ms, and staying quiet if you turned effects off.",
          },
          programa: {
            codigo: bi(`// Un juego mínimo que sólo avisa
class Juego {
  constructor() { this.tick = 0; this.events = []; }
  update() {
    this.events.length = 0;          // se vacía en cada tick, como en snake.js
    this.tick++;
    if (this.tick % 3 === 0) this.events.push("eat");
    if (this.tick === 7) this.events.push("die");
  }
}

// Lo que haría chip.sfx(): aquí sólo escribe las notas
const SONIDOS = { eat: [660, 990], die: [400] };
let efectosOn = true;
const sfx = (e) => { if (efectosOn) console.log("  ♪", e, SONIDOS[e].join(" → "), "Hz"); };

const game = new Juego();
for (let i = 1; i <= 7; i++) {
  game.update();
  console.log("tick", i, game.events);
  for (const e of game.events) sfx(e);
}`, [
              ["// Un juego mínimo que sólo avisa", "// A minimal game that only reports"],
              ["// se vacía en cada tick, como en snake.js", "// emptied every tick, as in snake.js"],
              ["// Lo que haría chip.sfx(): aquí sólo escribe las notas", "// What chip.sfx() would do: here it just writes the notes"],
            ]),
            notas: {
              es: "La simulación produce una lista de palabras; la parte del navegador las convierte en sonido. Si pones `efectosOn = false` y corres otra vez, el juego hace exactamente lo mismo y sólo se calla el sonido.",
              en: "The simulation produces a list of words; the browser side turns them into sound. Set `efectosOn = false` and run again: the game does exactly the same and only the sound goes quiet.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Ruido blanco para la batería", en: "White noise for the drums" },
          texto: {
            es: "Un oscilador no sabe hacer un platillo ni una tarola: eso es **ruido**. Al desbloquear el audio, el chip llena un buffer de un segundo con números al azar entre −1 y 1 (`Math.random() * 2 - 1`), y cada golpe de batería reproduce un pedazo pasándolo por un **filtro pasa-altos**: con corte en 6000 Hz suena a platillo (`H`), en 1500 Hz a tarola (`S`). El bombo (`K`) sí es un oscilador triangular que baja de 160 a 40 Hz.\n\nAquí `Math.random` está bien: el ruido sólo suena y no cambia el juego.",
            en: "An oscillator can't make a cymbal or a snare: those are **noise**. When audio is unlocked, the chip fills a one-second buffer with random numbers between −1 and 1 (`Math.random() * 2 - 1`), and each drum hit plays a slice of it through a **high-pass filter**: cut at 6000 Hz it sounds like a hi-hat (`H`), at 1500 Hz like a snare (`S`). The kick (`K`) is a triangle oscillator falling from 160 to 40 Hz.\n\n`Math.random` is fine here: the noise only makes sound and doesn't change the game.",
          },
          programa: {
            codigo: bi(`// El buffer de ruido del chip: un segundo de muestras al azar entre -1 y 1
const sampleRate = 44100;
const ruido = new Float32Array(sampleRate);
for (let i = 0; i < ruido.length; i++) ruido[i] = Math.random() * 2 - 1;

console.log("muestras:", ruido.length);
console.log("las primeras:", Array.from(ruido.slice(0, 5), (v) => v.toFixed(3)).join(" "));
const media = ruido.reduce((s, v) => s + v, 0) / ruido.length;
console.log("media:", media.toFixed(4));

// drum() de core/audio.js, resumido
const BATERIA = {
  K: "triángulo 160 → 40 Hz, 0.12 s",
  S: "ruido con pasa-altos en 1500 Hz + triángulo 200 → 100 Hz",
  H: "ruido con pasa-altos en 6000 Hz, 0.035 s",
};
for (const [golpe, como] of Object.entries(BATERIA)) console.log(golpe, "=", como);`, [
              ["// El buffer de ruido del chip: un segundo de muestras al azar entre -1 y 1", "// The chip's noise buffer: one second of random samples between -1 and 1"],
              ["\"las primeras:\"", "\"the first ones:\""], ["\"muestras:\"", "\"samples:\""], ["\"media:\"", "\"mean:\""],
              ["// drum() de core/audio.js, resumido", "// drum() from core/audio.js, summarized"],
              ["\"triángulo 160 → 40 Hz, 0.12 s\"", "\"triangle 160 → 40 Hz, 0.12 s\""],
              ["\"ruido con pasa-altos en 1500 Hz + triángulo 200 → 100 Hz\"", "\"noise high-passed at 1500 Hz + triangle 200 → 100 Hz\""],
              ["\"ruido con pasa-altos en 6000 Hz, 0.035 s\"", "\"noise high-passed at 6000 Hz, 0.035 s\""],
            ]),
            notas: {
              es: "44 100 muestras: un segundo a la calidad de un CD. La media sale casi en cero porque hay tantos positivos como negativos; cambia en cada corrida, y da igual.",
              en: "44,100 samples: one second at CD quality. The mean comes out near zero because there are as many positives as negatives; it changes on every run, and that's fine.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Por qué el audio se desbloquea al pulsar JUGAR y no al cargar la página?", en: "Why is audio unlocked when you press PLAY and not when the page loads?" },
          opciones: [
            { es: "Para que la página cargue más rápido", en: "So the page loads faster" },
            { es: "Porque los navegadores de teléfono sólo dejan arrancar el audio desde un gesto del usuario", en: "Because phone browsers only let audio start from a user gesture" },
            { es: "Porque el AudioContext sólo existe dentro de un canvas", en: "Because AudioContext only exists inside a canvas" },
            { es: "Para ahorrar batería mientras se lee el menú", en: "To save battery while reading the menu" },
          ],
          correcta: 1,
          porque: { es: "iOS y Android exigen que el `AudioContext` se cree o se reanude dentro de un toque. Si se intenta antes, se queda suspendido y no suena nada.", en: "iOS and Android require the `AudioContext` to be created or resumed inside a tap. Try it earlier and it stays suspended and nothing plays." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Por qué `Snake` mete `'eat'` en `events` en vez de llamar al sonido directamente?", en: "Why does `Snake` push `'eat'` into `events` instead of playing the sound directly?" },
          opciones: [
            { es: "Porque el servidor corre la misma simulación y ahí no hay audio", en: "Because the server runs the same simulation and there's no audio there" },
            { es: "Porque Web Audio no se puede llamar desde una clase", en: "Because Web Audio can't be called from a class" },
            { es: "Para que el sonido salga antes", en: "So the sound plays sooner" },
            { es: "Porque así lo pide Supabase", en: "Because Supabase requires it" },
          ],
          correcta: 0,
          porque: { es: "La simulación tiene que correr igual en el navegador y en Node. Avisar con eventos la deja sin dependencias; quien tiene bocinas decide qué hacer con el aviso.", en: "The simulation has to run the same in the browser and in Node. Reporting through events keeps it dependency-free; whoever has speakers decides what to do with it." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa el corazón de `note()`.", en: "Fill in the heart of `note()`." },
          codigo: "const osc = ctx.createOscillator();\nconst g = ctx.createGain();\nosc.___ = \"square\";\nosc.frequency.setValueAtTime(freq, t);\nosc.___(g).connect(bus);\nosc.___(t);",
          huecos: ["type", "connect", "start"],
          banco: ["type", "connect", "start", "play", "volume", "wave"],
          porque: { es: "Se elige la forma de onda con `type`, se encadena oscilador → ganancia → bus con `connect`, y se programa el arranque con `start(t)`.", en: "Pick the waveform with `type`, chain oscillator → gain → bus with `connect`, and schedule the start with `start(t)`." },
        },
        {
          tipo: "elige",
          pregunta: { es: "En el sonido de chocar, `note(400, t, 0.5, 'square', 0.25, 50)`, ¿qué hace el 50?", en: "In the crash sound, `note(400, t, 0.5, 'square', 0.25, 50)`, what does the 50 do?" },
          opciones: [
            { es: "Es el volumen", en: "It's the volume" },
            { es: "La nota se desliza de 400 a 50 Hz: baja de tono", en: "The note slides from 400 down to 50 Hz: the pitch drops" },
            { es: "Repite la nota 50 veces", en: "It repeats the note 50 times" },
            { es: "Espera 50 ms antes de sonar", en: "It waits 50 ms before playing" },
          ],
          correcta: 1,
          porque: { es: "Es `slideTo`: con `exponentialRampToValueAtTime`, la frecuencia baja de 400 a 50 Hz durante la nota. Ese descenso es lo que suena a «perdiste».", en: "It's `slideTo`: with `exponentialRampToValueAtTime`, the frequency falls from 400 to 50 Hz over the note. That drop is what sounds like \"you lost\"." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `frecuenciasDe(evento)`: devuelve las frecuencias de las notas de cada efecto, como en `sfx()`.\n\n- `'eat'` → `[660, 990]`\n- `'die'` → `[400]`\n- `'start'` → `[440, 550, 660, 880]`\n- cualquier otro → `[]`",
            en: "Write `frecuenciasDe(evento)`: return the note frequencies for each effect, as in `sfx()`.\n\n- `'eat'` → `[660, 990]`\n- `'die'` → `[400]`\n- `'start'` → `[440, 550, 660, 880]`\n- anything else → `[]`",
          },
          inicial: bi(`function frecuenciasDe(evento) {
  // un objeto o un switch, como prefieras
}

console.log(frecuenciasDe("eat"));`, [["// un objeto o un switch, como prefieras", "// an object or a switch, your choice"]]),
          pruebas: [
            { llamada: "frecuenciasDe('eat')", espera: "[660,990]" },
            { llamada: "frecuenciasDe('die')", espera: "[400]" },
            { llamada: "frecuenciasDe('start')", espera: "[440,550,660,880]" },
            { llamada: "frecuenciasDe('pausa_rara')", espera: "[]" },
          ],
          solucion: "const SONIDOS = { eat: [660, 990], die: [400], start: [440, 550, 660, 880] };\n\nfunction frecuenciasDe(evento) {\n  return SONIDOS[evento] ?? [];\n}",
          porque: { es: "Una tabla del nombre del evento a sus notas, y `?? []` para lo que no está. Es la misma idea que el `switch` de `sfx()`: el juego dice el nombre, la tabla decide cómo suena.", en: "A table from event name to its notes, and `?? []` for anything missing. Same idea as `sfx()`'s `switch`: the game names the event, the table decides how it sounds." },
        },
      ],
    },
    {
      id: "musica-desde-una-receta",
      titulo: { es: "Música desde una receta", en: "Music from a recipe" },
      resumen: {
        es: "Recetas de texto, notas MIDI y hercios, una melodía que escribe la semilla del día y un secuenciador que no se atrasa.",
        en: "Text recipes, MIDI notes and hertz, a melody written by the day's seed and a sequencer that never falls behind.",
      },
      pasos: [
        {
          tipo: "explica",
          titulo: { es: "Una canción en once renglones", en: "A song in eleven lines" },
          texto: {
            es: "La música de cada reto sale de una **receta**: un archivo de texto en `public/content/music/` con renglones `clave: valor`. Una receta no trae notas: trae las reglas (tempo, tónica, escala, progresión de acordes, estructura, ondas) y **la semilla del día escribe la melodía**. Así hay una canción distinta cada día sin componer ninguna.\n\nHay otro tipo, el tema fijo (`tune:`), con piezas de dominio público escritas nota por nota; ahí la semilla sólo elige el bajo y la batería.\n\nEl programa lee la receta `chip_01.txt` con el `parseMusicSpec` del juego, resumido.",
            en: "Each challenge's music comes from a **recipe**: a text file in `public/content/music/` with `key: value` lines. A recipe doesn't contain notes: it holds the rules (tempo, root, scale, chord progression, structure, waves) and **the day's seed writes the melody**. So there's a different song every day without composing any.\n\nThere's another kind, the fixed tune (`tune:`), with public-domain pieces written note by note; there the seed only picks the bass and drums.\n\nThe program reads the `chip_01.txt` recipe with the game's `parseMusicSpec`, summarized.",
          },
          programa: {
            codigo: bi(`const receta = [
  "# Receta 01: menor pentatónica, tipo arcade oscuro",
  "tempo: 160",
  "root: C4",
  "scale: minor_pentatonic",
  "harmony: minor",
  "progression: i VI III VII",
  "bars: 8",
  "structure: AABA",
  "lead: square",
  "bass: triangle",
  "drums: on",
].join("\\n");

// parseMusicSpec de core/music.js (sin los renglones que continúan el anterior)
function parseMusicSpec(text) {
  const spec = {};
  for (const raw of text.split("\\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf(":");
    if (i < 0) continue;
    spec[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
  }
  return spec;
}

const spec = parseMusicSpec(receta);
console.log(spec);
console.log("acordes:", spec.progression.split(" "));`, [
              ["// parseMusicSpec de core/music.js (sin los renglones que continúan el anterior)", "// parseMusicSpec from core/music.js (without continuation lines)"],
              ["\"acordes:\"", "\"chords:\""],
            ]),
            notas: {
              es: "- El comentario de arriba (`#`) se ignora; lo demás queda como un objeto de textos.\n- `i VI III VII` son grados en números romanos: el acorde de la tónica y luego el sexto, el tercero y el séptimo de la escala menor.\n- `AABA`: la sección A suena dos veces, luego una B y vuelve la A, como en tantas canciones.",
              en: "- The top comment (`#`) is skipped; the rest becomes an object of strings.\n- `i VI III VII` are scale degrees in Roman numerals: the root chord, then the sixth, third and seventh of the minor scale.\n- `AABA`: section A plays twice, then a B, then A again, as in so many songs.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "De «C4» a hercios", en: "From \"C4\" to hertz" },
          texto: {
            es: "Para hacer cuentas con notas, el juego las numera como **MIDI**: cada semitono es un número. `C4` (el do central) es 60 y `A4` (el la de afinar) es 69. `parseNoteName` hace la conversión: 12 por la octava más uno, más la posición de la nota dentro de la octava.\n\nDe número a frecuencia hay una fórmula de un renglón: `440 · 2^((n − 69) / 12)`. Cada semitono multiplica la frecuencia por la raíz doceava de 2, así que subir 12 (una octava) la **duplica**.",
            en: "To do math with notes, the game numbers them as **MIDI**: each semitone is a number. `C4` (middle C) is 60 and `A4` (the tuning A) is 69. `parseNoteName` does the conversion: 12 times the octave plus one, plus the note's position within the octave.\n\nFrom number to frequency there's a one-line formula: `440 · 2^((n − 69) / 12)`. Each semitone multiplies the frequency by the twelfth root of 2, so going up 12 (an octave) **doubles** it.",
          },
          programa: {
            codigo: bi(`${NOTAS}

for (const nombre of ["C4", "E4", "G4", "A4", "C5", "A5", "A3"]) {
  const n = parseNoteName(nombre);
  console.log(nombre.padEnd(3), "midi", n, "->", midiToFreq(n).toFixed(2), "Hz");
}`, [["\"Nota inválida: \"", "\"Invalid note: \""]]),
            notas: {
              es: "- `A4` da 440 justos: es el punto de partida de la fórmula.\n- `A5` da 880 y `A3`, 220: una octava arriba es el doble y una abajo, la mitad.\n- `C4`, `E4` y `G4` (60, 64, 67) son el acorde de do mayor.",
              en: "- `A4` gives exactly 440: it's the formula's anchor.\n- `A5` gives 880 and `A3`, 220: an octave up doubles it and an octave down halves it.\n- `C4`, `E4` and `G4` (60, 64, 67) make the C major chord.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "La semilla escribe la melodía", en: "The seed writes the melody" },
          texto: {
            es: "`generateSong` arma con la escala un **juego de notas permitidas** (dos octavas de la pentatónica menor desde `C4`) y camina por él: en cada paso sube o baja hasta dos lugares al azar, a veces calla y a veces sostiene la nota anterior. En los tiempos fuertes busca una nota del acorde que suena, para que no desafine.\n\nEl azar es `mulberry32` con la semilla de la **música** del día. Aquí va una versión reducida (sin acordes ni secciones): corre el programa y fíjate en que la misma semilla da la misma melodía.",
            en: "`generateSong` uses the scale to build a **pool of allowed notes** (two octaves of the minor pentatonic from `C4`) and walks through it: each step moves up or down up to two places at random, sometimes rests and sometimes holds the previous note. On strong beats it looks for a note of the current chord, so it doesn't clash.\n\nThe randomness is `mulberry32` with the day's **music** seed. Here's a reduced version (no chords or sections): run it and notice the same seed gives the same melody.",
          },
          programa: {
            codigo: bi(`function mulberry32(seed) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return { next, int: (min, max) => min + Math.floor(next() * (max - min + 1)) };
}

const NOMBRES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const nombre = (n) => NOMBRES[n % 12] + (Math.floor(n / 12) - 1);

// Dos octavas de la pentatónica menor desde C4 (midi 60)
const ESCALA = [0, 3, 5, 7, 10];
const permitidas = [];
for (let o = 0; o < 2; o++) for (const s of ESCALA) permitidas.push(60 + 12 * o + s);

function melodia(semilla, pasos) {
  const rng = mulberry32(semilla);
  let cur = Math.floor(permitidas.length / 2);
  const notas = [];
  for (let i = 0; i < pasos; i++) {
    const r = rng.next();
    if (r < 0.12) { notas.push("."); continue; }       // silencio
    if (r < 0.30) { notas.push("-"); continue; }       // sostener la anterior
    cur = Math.min(permitidas.length - 1, Math.max(0, cur + rng.int(-2, 2)));
    notas.push(nombre(permitidas[cur]));
  }
  return notas.join(" ");
}

console.log("permitidas:", permitidas.map(nombre).join(" "));
console.log("semilla 1:", melodia(1, 16));
console.log("semilla 1:", melodia(1, 16));
console.log("semilla 2:", melodia(2, 16));`, [
              ["// Dos octavas de la pentatónica menor desde C4 (midi 60)", "// Two octaves of the minor pentatonic from C4 (midi 60)"],
              ["// silencio", "// rest"], ["// sostener la anterior", "// hold the previous one"],
              ["\"permitidas:\"", "\"allowed:\""], ["\"semilla 1:\"", "\"seed 1:\""], ["\"semilla 2:\"", "\"seed 2:\""],
            ]),
            notas: {
              es: "- La melodía nunca sale de las diez notas permitidas: por eso, aunque sea al azar, suena «a algo».\n- `.` es silencio y `-` sostiene la nota anterior.\n- Las dos líneas de la semilla 1 coinciden nota por nota. En el juego, esa semilla sale de la fecha (unidad 5), así que todos oyen la misma canción ese día.",
              en: "- The melody never leaves the ten allowed notes: that's why, random as it is, it sounds \"like something\".\n- `.` is a rest and `-` holds the previous note.\n- Both seed-1 lines match note for note. In the game that seed comes from the date (unit 5), so everyone hears the same song that day.",
            },
          },
        },
        {
          tipo: "explica",
          titulo: { es: "Un secuenciador que no se atrasa", en: "A sequencer that never falls behind" },
          texto: {
            es: "El navegador no garantiza que un `setInterval` de 25 ms despierte cada 25 ms: a veces llega tarde porque el teléfono estaba ocupado dibujando. Si cada nota sonara «cuando el temporizador despierta», la música cojearía.\n\nEl `Sequencer` de `core/audio.js` usa un truco conocido como *lookahead*: cada vez que despierta, **programa** todas las notas de los próximos 120 ms con su **hora exacta** en el reloj del `AudioContext` (`osc.start(t)`), que es preciso. Despertar tarde no importa mientras sea antes de esa ventana.",
            en: "The browser doesn't promise that a 25 ms `setInterval` wakes every 25 ms: sometimes it's late because the phone was busy drawing. If each note played \"whenever the timer wakes\", the music would limp.\n\n`core/audio.js`'s `Sequencer` uses a well-known trick called *lookahead*: each time it wakes it **schedules** every note in the next 120 ms at its **exact time** on the `AudioContext` clock (`osc.start(t)`), which is precise. Waking late doesn't matter as long as it's before that window.",
          },
          programa: {
            codigo: bi(`const tempo = 160;
const pasoDur = 60 / tempo / 2;    // una corchea, en segundos
let siguiente = 0.05, paso = 0;

// Cuándo despertó de verdad el setInterval de 25 ms (nunca puntual)
const despertares = [0, 0.031, 0.049, 0.09, 0.101, 0.16, 0.183, 0.26, 0.29, 0.31,
  0.352, 0.37, 0.43, 0.47, 0.49, 0.53, 0.58, 0.61, 0.66, 0.7, 0.74, 0.81];

let enBlanco = 0;
for (const ahora of despertares) {
  const programadas = [];
  while (siguiente < ahora + 0.12) {
    programadas.push("paso " + paso + " a " + siguiente.toFixed(4) + " s");
    paso++;
    siguiente += pasoDur;
  }
  if (programadas.length) console.log("despierta en", ahora.toFixed(3), "->", programadas.join(", "));
  else enBlanco++;
}
console.log("despertares sin nada que hacer:", enBlanco, "de", despertares.length);`, [
              ["// una corchea, en segundos", "// one eighth note, in seconds"],
              ["// Cuándo despertó de verdad el setInterval de 25 ms (nunca puntual)", "// When the 25 ms setInterval really woke up (never on time)"],
              ["\"paso \"", "\"step \""], ["\" a \"", "\" at \""], ["\"despierta en\"", "\"wakes at\""], ["\"despertares sin nada que hacer:\"", "\"wake-ups with nothing to do:\""], ["\"de\", despertares", "\"of\", despertares"],
            ]),
            notas: {
              es: "Los despertares están desparejos, pero los pasos quedan a exactamente 0.1875 s uno del otro (una corchea a 160 por minuto). La mayoría de las veces el secuenciador despierta y no hay nada que programar: ya lo dejó listo antes.",
              en: "The wake-ups are uneven, but the steps land exactly 0.1875 s apart (an eighth note at 160 bpm). Most of the time the sequencer wakes and has nothing to schedule: it already set it up earlier.",
            },
          },
        },
        {
          tipo: "elige",
          pregunta: { es: "`A4` es el MIDI 69 y suena a 440 Hz. ¿A cuánto suena `A5`, el MIDI 81?", en: "`A4` is MIDI 69 and plays at 440 Hz. What does `A5`, MIDI 81, play at?" },
          opciones: ["452 Hz", "660 Hz", "880 Hz", "1760 Hz"],
          correcta: 2,
          porque: { es: "81 − 69 = 12 semitonos, una octava: `440 · 2^(12/12) = 880`. Cada octava duplica la frecuencia.", en: "81 − 69 = 12 semitones, one octave: `440 · 2^(12/12) = 880`. Each octave doubles the frequency." },
        },
        {
          tipo: "completa",
          pregunta: { es: "Completa la fórmula de `midiToFreq`.", en: "Fill in the `midiToFreq` formula." },
          codigo: "const midiToFreq = (n) => 440 * Math.pow(___, (n - ___) / ___);",
          huecos: ["2", "69", "12"],
          banco: ["2", "69", "12", "60", "10", "7"],
          porque: { es: "Base 2 porque una octava duplica; 69 porque es la nota de 440 Hz; 12 porque la octava tiene 12 semitonos.", en: "Base 2 because an octave doubles; 69 because it's the 440 Hz note; 12 because an octave has 12 semitones." },
        },
        {
          tipo: "elige",
          pregunta: { es: "¿Por qué el secuenciador programa las notas con la hora del `AudioContext` en vez de tocarlas cuando despierta su `setInterval`?", en: "Why does the sequencer schedule notes on the `AudioContext` clock instead of playing them when its `setInterval` wakes?" },
          opciones: [
            { es: "Porque `setInterval` no existe en los teléfonos", en: "Because `setInterval` doesn't exist on phones" },
            { es: "Porque el temporizador llega tarde a veces y la música se oiría dispareja", en: "Because the timer is sometimes late and the music would sound uneven" },
            { es: "Para que la semilla decida el tempo", en: "So the seed decides the tempo" },
            { es: "Porque así gasta menos memoria", en: "Because it uses less memory" },
          ],
          correcta: 1,
          porque: { es: "El reloj del audio es preciso y el del `setInterval` no. Programar por adelantado con la hora exacta separa «cuándo pienso» de «cuándo suena».", en: "The audio clock is precise and the `setInterval` one isn't. Scheduling ahead at the exact time separates \"when I think\" from \"when it plays\"." },
        },
        {
          tipo: "ordena",
          pregunta: { es: "Ordena lo que pasa desde la receta hasta que suena la música (más o menos lo que hacen `main.js` y `shell.js`).", en: "Put in order what happens from the recipe until the music plays (roughly what `main.js` and `shell.js` do)." },
          lineas: [
            "const texto = await fetch(receta).then((r) => r.text());",
            "const spec = parseMusicSpec(texto);",
            "const song = generateSong(spec, daily.musicSeed);",
            "seq.play(song);",
          ],
          porque: { es: "Se baja el texto, se convierte en objeto, la semilla de la música escribe la canción y el secuenciador la toca.", en: "Fetch the text, turn it into an object, the music seed writes the song, and the sequencer plays it." },
        },
        {
          tipo: "escribe",
          pregunta: {
            es: "Escribe `aHz(nombre)`: de un nombre de nota como `\"A4\"` a su frecuencia en hercios, **redondeada a dos decimales** (como número). Ya tienes `parseNoteName` y `midiToFreq`.\n\nPista: `Math.round(x * 100) / 100`.",
            en: "Write `aHz(nombre)`: from a note name like `\"A4\"` to its frequency in hertz, **rounded to two decimals** (as a number). You already have `parseNoteName` and `midiToFreq`.\n\nHint: `Math.round(x * 100) / 100`.",
          },
          inicial: bi(`${NOTAS}

function aHz(nombre) {
  // nombre -> midi -> hercios, redondeado
}

console.log(aHz("C4"));`, [["\"Nota inválida: \"", "\"Invalid note: \""], ["// nombre -> midi -> hercios, redondeado", "// name -> midi -> hertz, rounded"]]),
          pruebas: [
            { llamada: "aHz('A4')", espera: "440" },
            { llamada: "aHz('C4')", espera: "261.63" },
            { llamada: "aHz('A3')", espera: "220" },
            { llamada: "aHz('F#5')", espera: "739.99" },
          ],
          solucion: `${NOTAS}

function aHz(nombre) {
  const hz = midiToFreq(parseNoteName(nombre));
  return Math.round(hz * 100) / 100;
}`,
          porque: { es: "Se encadenan las dos funciones y se redondea al final. `F#5` es el MIDI 78: nueve semitonos arriba del la de 440.", en: "Chain the two functions and round at the end. `F#5` is MIDI 78: nine semitones above the 440 A." },
        },
      ],
    },
  ],
};
