import type { Nota } from "./notas";

/**
 * Las dos notas del 16-nov-2026: la voz del Daily Stat que deletreó un título
 * (y cómo se revisaron los audios que faltaban sin escucharlos) y los dibujos
 * hechos con código de «¿Lo conoces?». En su propio archivo para no alargar
 * notas.ts.
 */
export const NOTAS_16_NOV: Nota[] = [
  {
    id: "la-voz-que-deletreaba-los-titulos",
    fecha: "2026-11-16",
    proyecto: "dailychallenge",
    titulo: {
      es: "La voz que deletreaba los títulos",
      en: "The voice that spelled out the titles",
    },
    entradilla: {
      es: "El dato del día salió con la voz diciendo el título letra por letra. La causa era una comprobación que nunca se cumplía. Lo interesante vino después: revisar los veinte audios que faltaban por salir sin sentarse a escuchar ninguno.",
      en: "The stat of the day went out with the voice saying the title letter by letter. The cause was a check that never came true. The interesting part came after: reviewing the twenty clips still waiting to air without sitting down to listen to any of them.",
    },
    cuerpo: [
      { tipo: "p", texto: {
        es: "Daily Challenge publica cada mañana un reel con un dato de videojuegos: una gráfica que crece y una voz sintética que dice el título y, al final, el remate. Las dos frases de cada dato se graban de antemano, en tandas de veinte. El 16 de noviembre tocaba «LOS KICKSTARTERS más grandes de los videojuegos», y la voz deletreó el título, letra por letra.",
        en: "Every morning Daily Challenge posts a reel with a video game stat: a chart that grows and a synthetic voice that says the title and, at the end, the punchline. Both lines for each stat are recorded ahead of time, in batches of twenty. November 16 was “LOS KICKSTARTERS más grandes de los videojuegos” (the biggest Kickstarters in games), and the voice spelled the title out, letter by letter.",
      } },
      { tipo: "p", texto: {
        es: "En el archivo de datos el título va en MAYÚSCULAS, porque así se pinta en la gráfica, y el subtítulo en minúsculas. El guion que graba las voces quería bajar las mayúsculas antes de mandarlas, pero preguntaba por la frase entera, título y subtítulo juntos. Como el subtítulo nunca va en mayúsculas, la respuesta siempre era que no, y a la voz le llegaba el título tal cual.",
        en: "In the data file the title is in CAPITALS, because that's how the chart draws it, and the subtitle is in lowercase. The script that records the voices meant to lowercase the capitals before sending them, but it asked about the whole phrase, title and subtitle together. Since the subtitle is never in capitals, the answer was always no, and the voice got the title as is.",
      } },
      { tipo: "codigo", texto: `# antes: nunca se cumple, el subtítulo va en minúsculas
titulo = f"{s['titulo']} {s['subtitulo']}"
titulo = titulo[0] + titulo[1:].lower() if titulo.isupper() else titulo

# ahora: se baja el título solo, y luego se juntan
t = s['titulo']
t = t[0] + t[1:].lower() if t.isupper() else t
titulo = f"{t} {s['subtitulo']}"`, pie: {
        es: "Casi tres semanas pasó inadvertido: «EL JUEGO MÁS VENDIDO» la voz lo lee bien aunque vaya en mayúsculas. Lo que deletrea es la palabra que no reconoce, porque la toma por una sigla.",
        en: "It went unnoticed for almost three weeks: the voice reads “EL JUEGO MÁS VENDIDO” fine even in capitals. What it spells out is the word it doesn't recognize, because it takes it for an acronym.",
      } },
      { tipo: "p", texto: {
        es: "Arreglar la línea era lo de menos. Quedaban veinte datos grabados con el mismo defecto y había que saber cuáles sonaban mal. Escuchar veinte audios es poco; escuchar los de cada tanda, para siempre, ya no. Así que medimos otra cosa: cuánto dura cada audio por cada letra de su texto. Deletrear tarda mucho más que leer.",
        en: "Fixing the line was the easy part. Twenty stats were already recorded with the same flaw, and we needed to know which ones sounded wrong. Listening to twenty clips is nothing; listening to every batch, forever, is not. So we measured something else: how long each clip lasts per letter of its text. Spelling takes far longer than reading.",
      } },
      { tipo: "cifras", cifras: [
        { valor: "0.083 s", etiqueta: { es: "por letra, la mediana de los 60 audios", en: "per letter, the median of all 60 clips" } },
        { valor: "1.61×", etiqueta: { es: "el del título deletreado", en: "the one with the spelled-out title" } },
        { valor: "0.79–1.16×", etiqueta: { es: "los veinte, ya regrabados", en: "the twenty, once re-recorded" } },
      ] },
      { tipo: "p", texto: {
        es: "El audio del día medía 1.61 veces lo normal: se veía de lejos. Regrabamos los veinte títulos con el texto corregido y todos quedaron entre 0.79 y 1.16. De paso apareció otro sospechoso entre los viejos: «LAS CONSOLAS MINI» bajó de 6.0 a 5.2 segundos al regrabarlo, así que algo deletreaba.",
        en: "That day's clip measured 1.61 times the normal: it stood out from a mile away. We re-recorded the twenty titles with the corrected text and they all landed between 0.79 and 1.16. Along the way another suspect turned up among the old ones: “LAS CONSOLAS MINI” went from 6.0 to 5.2 seconds when re-recorded, so it was spelling something.",
      } },
      { tipo: "p", texto: {
        es: "La medida no sustituye al oído: no sabe si la voz pronunció mal un nombre. Pero es un filtro que cuesta una línea y atrapa toda una clase de errores, y desde ahora corre con cada tanda antes de publicarla. Lo que más nos gustó es que no hubo que adivinar: el fallo dejó una huella medible, y bastó con ir a buscarla.",
        en: "The measure doesn't replace listening: it can't tell whether the voice mispronounced a name. But it's a filter that costs one line and catches a whole class of mistakes, and from now on it runs on every batch before it's published. What we liked most is that there was no guessing: the bug left a measurable trace, and all it took was going to look for it.",
      } },
    ],
  },
  {
    id: "contar-un-juego-ajeno-sin-usar-nada-suyo",
    fecha: "2026-11-16",
    proyecto: "ayotl",
    titulo: {
      es: "Contar un juego ajeno sin usar nada suyo",
      en: "Telling someone else's game without using anything of theirs",
    },
    entradilla: {
      es: "«¿Lo conoces?» cuenta en un minuto la trama de juegos retro que casi nadie jugó fuera de Japón. Sin capturas, sin carátulas y sin sprites: los dibujos se hacen con código. Y con una regla para los datos: lo que dos fuentes no cuentan igual, no se dice.",
      en: "“Do you know it?” tells, in one minute, the plot of retro games almost nobody played outside Japan. No screenshots, no box art and no sprites: the drawings are made with code. And one rule for the facts: if two sources don't tell it the same way, it isn't said.",
    },
    cuerpo: [
      { tipo: "p", texto: {
        es: "La serie tiene una fórmula: «Imagina que eres… y tienes que… Pero hay un problema… Entonces ahora tú tendrás que…». Sólo al final se dice a quién le pasa y en qué juego. Los tres primeros son Sweet Home (Famicom, 1989), The Portopia Serial Murder Case (1983) y Clock Tower (Super Famicom, 1995).",
        en: "The series has a formula: “Imagine you are… and you have to… But there's a problem… So now you have to…”. Only at the end does it say who it happens to and in which game. The first three are Sweet Home (Famicom, 1989), The Portopia Serial Murder Case (1983) and Clock Tower (Super Famicom, 1995).",
      } },
      { tipo: "p", texto: {
        es: "Lo fácil habría sido poner capturas del juego o su carátula. Son de otros. Así que cada escena la dibuja un programa: un lienzo de 150 por 150, rectángulos y líneas, y una mansión con la luna detrás, un fantasma frente a una puerta tapiada o cinco personas con su objeto encima. El único texto dentro del dibujo es el nombre del juego y su año, en un cartucho genérico que no imita la etiqueta de nadie.",
        en: "The easy way would have been screenshots of the game or its box art. Those belong to someone else. So every scene is drawn by a program: a 150 by 150 canvas, rectangles and lines, and there's a mansion with the moon behind it, a ghost in front of a boarded-up door or five people with their item above them. The only text inside the drawing is the game's name and its year, on a generic cartridge that imitates nobody's label.",
      } },
      { tipo: "codigo", texto: `T, LADO = 150, 750                 # el lienzo y la tarjeta del vídeo

im = Image.new("RGB", (T, T), NOCHE)
d = ImageDraw.Draw(im)
d.fontmode = "1"                   # letras sin suavizar: pixel de verdad
persona(d, 44, 146, AZUL, espalda=True)

im.resize((LADO, LADO), Image.NEAREST).save("1-mansion.png")   # 5x exacto`, pie: {
        es: "A escala entera y con vecino más cercano, al tamaño exacto de la tarjeta del vídeo: si el vídeo tiene que cambiarle el tamaño, el pixel se emborrona.",
        en: "At a whole-number scale and with nearest neighbor, at the exact size of the video's card: if the video has to resize it, the pixels blur.",
      } },
      { tipo: "p", texto: {
        es: "Los datos van en una ficha junto al programa, cada uno leído en dos sitios: la Wikipedia en inglés y la japonesa. Y ahí salió la regla. De Portopia, una dice que la versión de Famicom vendió 700 000 copias y la otra que 600 000 u 800 000: el vídeo no dice ninguna cifra. De Clock Tower íbamos a decir «sólo salió en Japón», que fue cierto durante veintinueve años y dejó de serlo en 2024; el guion dice «durante casi treinta años». Un dato dudoso no hace más interesante el vídeo: sólo lo hace menos cierto.",
        en: "The facts live in a sheet next to the program, each one read in two places: the English Wikipedia and the Japanese one. And that's where the rule came from. For Portopia, one says the Famicom version sold 700,000 copies and the other 600,000 or 800,000: the video states no figure. For Clock Tower we were about to say “it only came out in Japan”, which was true for twenty-nine years and stopped being true in 2024; the script says “for almost thirty years”. A doubtful fact doesn't make the video more interesting: it only makes it less true.",
      } },
      { tipo: "p", texto: {
        es: "Quedan dos cuidados más. No se cuenta el final: Portopia es una novela de detectives y decir quién fue sería arruinársela a quien la descubre hoy. Y el armado se detiene si una frase no cabe en el cuadro de diálogo, cinco renglones de veintitrés letras, porque la herramienta de vídeo no avisaba y el texto se salía por abajo. La frase larga se parte en dos escenas con el mismo dibujo.",
        en: "Two more precautions remain. The ending isn't told: Portopia is a detective story, and saying who did it would spoil it for whoever discovers it today. And the build stops if a line doesn't fit in the dialogue box, five rows of twenty-three letters, because the video tool didn't warn and the text spilled out the bottom. A long line gets split into two scenes with the same drawing.",
      } },
    ],
  },
];
