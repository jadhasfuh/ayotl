import type { Idioma } from "./idioma";

/**
 * Las fichas de la vitrina. Una entrada por producto; añadir una app es
 * añadir un objeto aquí (y su id a APPS_BETA en beta.ts si entra al programa).
 *
 * La portada sólo cuenta lo justo para que alguien decida si le interesa: un
 * lema, una línea y tres datos. Lo demás, en la web de cada producto.
 *
 * Los datos son reales y salen de la base o del código de cada app
 * (comprobados el 2026-09-22); si crecen, se actualizan aquí a mano.
 */
export type App = {
  id: "mercadito" | "jlptest" | "dailychallenge" | "warzone" | "procesion" | "kazan";
  nombre: string;
  /** Lo que va bajo el nombre en la tarjeta: el dominio, o dónde está si aún no tiene web. */
  dominio: string;
  /** Si falta, la app todavía no se puede abrir desde aquí (está en camino a la tienda). */
  url?: string;
  /**
   * La página de «Become a tester» de la prueba cerrada de Play. Es el paso
   * que de verdad cuenta para Google, y el que más se olvida: sin aceptar
   * ahí, la ficha de la app no abre y la instalación no cuenta.
   */
  playTester?: string;
  /** Color de acento de la tarjeta (par claro/oscuro, ver globals.css). */
  acento: "agua" | "caparazon" | "tierra";
  lema: Record<Idioma, string>;
  descripcion: Record<Idioma, string>;
  /** Tres cifras concretas; dicen más que un párrafo y son escaneables. */
  datos: { valor: string; etiqueta: Record<Idioma, string> }[];
  etiquetas: Record<Idioma, string[]>;
  /**
   * Las pantallas de su página propia. El fichero vive en
   * `public/capturas/<imagen>.webp` y se hizo con la tienda de demostración
   * o con las pantallas públicas de cada app.
   */
  pantallas: { imagen: string; titulo: Record<Idioma, string>; texto: Record<Idioma, string> }[];
  /** Juegos apaisados: la captura se monta en un teléfono acostado, en vez de parado. */
  apaisada?: boolean;
};

export const APPS: App[] = [
  {
    id: "mercadito",
    nombre: "Mercadito",
    dominio: "mercadito.cx",
    url: "https://mercadito.cx",
    acento: "tierra",
    lema: {
      es: "Menú digital y herramientas para negocios locales.",
      en: "Digital menu and tools for local businesses.",
    },
    descripcion: {
      es: "Los pedidos llegan al WhatsApp del negocio; Mercadito no toca el dinero.",
      en: "Orders go straight to the business's WhatsApp; Mercadito never touches the money.",
    },
    datos: [
      // Durante el piloto de investigación (2026-2027) no hay mensualidad.
      { valor: "Gratis", etiqueta: { es: "piloto 2026-2027", en: "2026-2027 pilot" } },
      { valor: "0 %", etiqueta: { es: "comisión", en: "commission" } },
      { valor: "3", etiqueta: { es: "municipios", en: "towns" } },
    ],
    etiquetas: { es: ["Negocios", "iOS y Android", "Web"], en: ["Business", "iOS & Android", "Web"] },
    pantallas: [
      { imagen: "mercadito-menu",
        titulo: { es: "El menú que ve tu cliente", en: "The menu your customer sees" },
        texto: { es: "Abre el QR, arma su pedido y te lo manda por WhatsApp. Sin registrarse, sin descargar nada y sin comisión por lo que venda.", en: "They open the QR, build their order and send it to you on WhatsApp. No signup, no download, no commission on what you sell." } },
      { imagen: "mercadito-panel-movil",
        titulo: { es: "Tu panel, desde el teléfono", en: "Your dashboard, from your phone" },
        texto: { es: "Tus precios, el QR de tu menú listo para imprimir y cuánta gente lo abrió. Todo desde el mismo aparato con el que atiendes.", en: "Your prices, your menu's QR ready to print, and how many people opened it. All from the same phone you work with." } },
      { imagen: "mercadito-mesas",
        titulo: { es: "Mesas y meseros", en: "Tables and waiters" },
        texto: { es: "El comensal escanea el código de su mesa y el pedido cae en cocina. Tus meseros toman y cobran desde su propio celular.", en: "Diners scan their table's code and the order lands in the kitchen. Your waiters take orders and charge from their own phones." } },
      { imagen: "mercadito-caja",
        titulo: { es: "Punto de venta", en: "Point of sale" },
        texto: { es: "Cobra en la barra con los mismos precios del menú: comer aquí, para llevar o a domicilio.", en: "Charge at the counter with the same menu prices: dine in, takeaway or delivery." } },
      { imagen: "mercadito-corte",
        titulo: { es: "Corte de caja", en: "End-of-day count" },
        texto: { es: "Abres el turno diciendo con cuánto empiezas; al cerrar cuentas el cajón y te dice si cuadra, sin enseñarte el número antes.", en: "You open the shift saying how much you start with; at closing you count the drawer and it tells you whether it matches, without showing the number first." } },
      { imagen: "mercadito-ventas",
        titulo: { es: "Lo que vendiste", en: "What you sold" },
        texto: { es: "Ventas por día, ticket promedio, lo que más se pide y tus horas más fuertes. Datos de tu negocio, no de una hoja de cálculo.", en: "Sales by day, average ticket, best sellers and your busiest hours. Your business's numbers, not a spreadsheet's." } },
    ],
  },
  {
    id: "jlptest",
    nombre: "JLPTest",
    dominio: "jlptest.org",
    url: "https://jlptest.org",
    playTester: "https://play.google.com/apps/testing/org.jlptest.twa",
    acento: "agua",
    lema: {
      es: "Japonés del N5 al N1, en unidades de 20 palabras.",
      en: "Japanese from N5 to N1, in 20-word units.",
    },
    descripcion: {
      es: "Vocabulario, gramática, lecturas y mini exámenes con repaso espaciado.",
      en: "Vocabulary, grammar, readings and mini-tests with spaced repetition.",
    },
    datos: [
      // Lo que dice la portada de jlptest.org el 2026-10-20 (VOCABULARIO,
      // GRAMATICA y UNIDADES de su lib/contenido.ts).
      { valor: "9 452", etiqueta: { es: "palabras", en: "words" } },
      { valor: "864", etiqueta: { es: "gramáticas", en: "grammar points" } },
      { valor: "600", etiqueta: { es: "unidades", en: "units" } },
    ],
    etiquetas: { es: ["Japonés", "Android", "Web"], en: ["Japanese", "Android", "Web"] },
    pantallas: [
      { imagen: "jlptest-inicio",
        titulo: { es: "Tu camino, por niveles", en: "Your path, level by level" },
        texto: { es: "Del N5 al N1, partido en unidades de 20 palabras con su gramática y su lectura. Siempre sabes qué toca hoy.", en: "From N5 to N1, split into 20-word units with their grammar and reading. You always know what's next." } },
      { imagen: "jlptest-nivel",
        titulo: { es: "Secciones temáticas", en: "Themed sections" },
        texto: { es: "El vocabulario se agrupa por tema —la ciudad, la comida, el tiempo—, no en una lista alfabética que nadie termina.", en: "Vocabulary is grouped by topic — the city, food, time — not in an alphabetical list nobody finishes." } },
      { imagen: "jlptest-examen",
        titulo: { es: "Mini exámenes del JLPT", en: "JLPT mini-tests" },
        texto: { es: "Con la estructura real del examen: eliges nivel, duración y si quieres reloj. Sirve para medirte, no para adivinar.", en: "Built on the real exam's structure: pick level, length and whether you want the clock. To measure yourself, not to guess." } },
      { imagen: "jlptest-repaso",
        titulo: { es: "Repaso espaciado", en: "Spaced repetition" },
        texto: { es: "Cada palabra vuelve justo antes de que se te olvide. Si aciertas se aleja, si fallas regresa.", en: "Each word comes back right before you forget it. Get it right and it moves away; miss it and it returns." } },
      { imagen: "jlptest-noticias",
        titulo: { es: "Noticias a tu nivel", en: "News at your level" },
        texto: { es: "Lo que pasa en Japón, contado para tu nivel: con furigana, la gramática marcada y preguntas. Cinco al día, y tres se leen sin cuenta.", en: "What's happening in Japan, told at your level: with furigana, the grammar highlighted and questions. Five a day, and three can be read without an account." } },
    ],
  },
  {
    id: "dailychallenge",
    nombre: "Daily Challenge",
    dominio: "dailychallenge.click",
    url: "https://dailychallenge.click",
    playTester: "https://play.google.com/apps/testing/click.dailychallenge.twa",
    acento: "caparazon",
    lema: {
      es: "Un reto arcade nuevo cada día, estilo Atari 2600.",
      en: "A new arcade challenge every day, Atari 2600 style.",
    },
    descripcion: {
      es: "Una partida por persona y top 10 a medianoche. Gratis.",
      en: "One run per person and a top 10 at midnight. Free.",
    },
    datos: [
      // Lo que dice dailychallenge.click/juegos el 2026-10-20 (40 recreativas) y public/content/maps (147).
      { valor: "40", etiqueta: { es: "recreativas", en: "arcade games" } },
      { valor: "147", etiqueta: { es: "mapas", en: "maps" } },
      { valor: "1", etiqueta: { es: "partida/día", en: "run/day" } },
    ],
    etiquetas: { es: ["Juegos", "Android", "Web"], en: ["Games", "Android", "Web"] },
    pantallas: [
      { imagen: "dailychallenge-juego",
        titulo: { es: "El reto de hoy", en: "Today's challenge" },
        texto: { es: "Un juego distinto cada día, con su mapa y su música. Una partida por persona: la misma para todo el mundo.", en: "A different game every day, with its own map and music. One run per person: the same one for everybody." } },
      { imagen: "dailychallenge-juegos",
        titulo: { es: "40 recreativas", en: "40 arcade games" },
        texto: { es: "Escritos en JavaScript puro, sin motor ni descargas, con la paleta y el sonido de una consola de 1977.", en: "Written in plain JavaScript, no engine and no downloads, with the palette and sound of a 1977 console." } },
      { imagen: "dailychallenge-party",
        titulo: { es: "Modo party", en: "Party mode" },
        texto: { es: "Creas una sala, pasas el código a tus amigos y juegan las mismas rondas. La tabla se actualiza en vivo.", en: "Create a room, share the code with your friends and play the same rounds. The table updates live." } },
    ],
  },
  {
    // Estrategia en tiempo real en una isla con volcán, el juego completo (ya
    // no la demo): en la web en kazan.dailychallenge.click (y como «juego
    // extra» en Daily Challenge), en línea desde el 22-oct y en Google Play
    // desde el 23-oct-2026 (prueba cerrada, dev.ayotl.kazan, con AdMob). El
    // nombre es 火山, «volcán» en japonés. Las cifras salen de sim/sim.js y
    // sim/mapa.js del repo jadhasfuh/kazan.
    id: "kazan",
    nombre: "Kazan",
    dominio: "kazan.dailychallenge.click",
    url: "https://kazan.dailychallenge.click",
    playTester: "https://play.google.com/apps/testing/dev.ayotl.kazan",
    acento: "agua",
    apaisada: true,
    lema: {
      es: "Levanta tu ciudad, arma tu ejército y escapa de la lava.",
      en: "Build your city, raise an army and outrun the lava.",
    },
    descripcion: {
      es: "Estrategia en tiempo real en una isla con volcán: obreros, tropas, niebla de guerra y una erupción que se come el mapa. Solo contra la computadora o en línea, en un reto semanal de hasta 50 naciones o en una sala con código para tus amigos. En la web y en Android, gratis.",
      en: "Real-time strategy on a volcano island: workers, troops, fog of war and an eruption that eats the map. Solo against the computer or online, in a weekly challenge for up to 50 nations or a room with a code for your friends. On the web and Android, free.",
    },
    datos: [
      { valor: "12", etiqueta: { es: "edificios", en: "buildings" } },
      { valor: "9", etiqueta: { es: "tropas", en: "unit types" } },
      { valor: "4", etiqueta: { es: "islas", en: "island types" } },
    ],
    etiquetas: { es: ["Juegos", "Android", "Web"], en: ["Games", "Android", "Web"] },
    pantallas: [
      { imagen: "kazan-ciudad",
        titulo: { es: "Obreros que recogen y construyen", en: "Workers who gather and build" },
        texto: { es: "Empiezas con tu base y cuatro obreros: tres ya cortan madera y uno saca hierro. Cada árbol y cada veta se agotan, así que la ciudad crece hacia el bosque y la sierra.", en: "You start with your base and four workers: three already chop wood and one mines iron. Every tree and every seam runs out, so the city grows toward the forest and the hills." } },
      { imagen: "kazan-construir",
        titulo: { es: "Una cuadrícula que dice dónde", en: "A grid that says where" },
        texto: { es: "Eliges un edificio y la isla se pinta de verde donde cabe y de rojo donde no: árboles, mineral, agua, montaña o por donde viene la lava. El fantasma se arrastra con el dedo y una torre enseña su alcance.", en: "Pick a building and the island turns green where it fits and red where it doesn't: trees, ore, water, mountain or where the lava is headed. The ghost drags with your finger and a tower shows its range." } },
      { imagen: "kazan-cuartel",
        titulo: { es: "Nueve tropas que se contrarrestan", en: "Nine unit types that counter each other" },
        texto: { es: "Soldado barato, francotirador de alcance, moto que caza obreros, médico que cura a los suyos, tanque que pega el doble a los edificios, artillería que dispara a siete casillas, explorador que corre, dron que vuela sobre el agua, y el obrero. Las tropas en marcha atacan lo que encuentran.", en: "A cheap soldier, a long-range sniper, a bike that hunts workers, a medic that heals its own, a tank that hits buildings twice as hard, artillery that shoots seven tiles away, a fast scout, a drone that flies over water, and the worker. Troops on the march attack whatever they find." } },
      { imagen: "kazan-tropas",
        titulo: { es: "Hecho para el dedo", en: "Made for a finger" },
        texto: { es: "Tocas un muñeco y se elige su grupo. Dejas el dedo quieto un momento y arrastras: eliges todo lo que quede en el área. Luego tocas a dónde van.", en: "Tap a figure and its group is selected. Hold still for a moment and drag: everything inside the area is selected. Then tap where they go." } },
      { imagen: "kazan-lava",
        titulo: { es: "El volcán se come la isla", en: "The volcano eats the island" },
        texto: { es: "A un cuarto de la partida hace erupción. La lava avanza por tierra, casilla a casilla, y el agua la para. Si se come tu base, sigues con la gente que te quede: huir también es jugar.", en: "A quarter of the way in, it erupts. The lava moves over land, tile by tile, and water stops it. If it swallows your base, you carry on with whoever is left: running is part of the game." } },
      { imagen: "kazan-nieve",
        titulo: { es: "Cuatro islas", en: "Four islands" },
        texto: { es: "Bosque, nieve, desierto y pantano, cada una con su propio mapa a partir de una semilla. En el pantano las ciénagas frenan y no se construye; en el desierto casi no hay agua donde esconderse.", en: "Forest, snow, desert and swamp, each with its own map from a seed. In the swamp the marshes slow you down and can't be built on; in the desert there is hardly any water to hide behind." } },
    ],
  },
  {
    // Se juega en la web dentro de Daily Challenge (como «juego extra», sin
    // anuncios) y va en camino a Google Play y App Store con AdMob (octubre
    // de 2026). Las cifras salen del código: www/game/weapons.js, maps.js y
    // campaign.js del repo jadhasfuh/warzone.
    id: "warzone",
    nombre: "War Zone",
    dominio: "dailychallenge.click/warzone",
    url: "https://dailychallenge.click/warzone",
    acento: "caparazon",
    apaisada: true,
    lema: {
      es: "Batallas por turnos de monigotes, estilo Atari 2600.",
      en: "Turn-based stick-figure battles, Atari 2600 style.",
    },
    descripcion: {
      es: "Terreno que se rompe, doce armas, campaña, retos, partidas pasando el teléfono y en línea. Gratis, con anuncios.",
      en: "Destructible terrain, twelve weapons, a campaign, challenges, pass-the-phone and online matches. Free, with ads.",
    },
    datos: [
      { valor: "12", etiqueta: { es: "armas", en: "weapons" } },
      { valor: "8", etiqueta: { es: "mapas", en: "maps" } },
      { valor: "10", etiqueta: { es: "misiones", en: "missions" } },
    ],
    etiquetas: { es: ["Juegos", "Android", "iOS"], en: ["Games", "Android", "iOS"] },
    pantallas: [
      { imagen: "warzone-castillo",
        titulo: { es: "El terreno se rompe", en: "The ground breaks" },
        texto: { es: "Cada granada deja un cráter. El muro que te cubría deja de cubrirte en tres turnos, y un buen tiro puede tirar a alguien al vacío.", en: "Every grenade leaves a crater. The wall that covered you stops covering you in three turns, and a good shot can knock someone off the map." } },
      { imagen: "warzone-isla",
        titulo: { es: "Doce armas", en: "Twelve weapons" },
        texto: { es: "Granada, rifle y bota sin límite. Bazuca, francotirador, bomba, pico, plataforma, muro y hara kiri con munición contada. El láser y el lanzagranadas se ganan.", en: "Grenade, rifle and boot, unlimited. Bazooka, sniper, bomb, pickaxe, platform, wall and hara-kiri with counted ammo. The laser and the grenade launcher are earned." } },
      { imagen: "warzone-campana",
        titulo: { es: "Campaña de diez misiones", en: "A ten-mission campaign" },
        texto: { es: "Del tres contra tres en la isla al seis contra seis en la cueva. Cada misión ganada abre un mapa, un arma o un gorro.", en: "From three-on-three on the island to six-on-six in the cave. Each mission won unlocks a map, a weapon or a hat." } },
      { imagen: "warzone-pasa",
        titulo: { es: "Pasa el teléfono", en: "Pass the phone" },
        texto: { es: "Dos jugadores en el mismo aparato. Entre turno y turno la pantalla se apaga para que nadie vea el plan del otro.", en: "Two players on the same device. Between turns the screen goes dark so nobody sees the other side's plan." } },
      { imagen: "warzone-menu",
        titulo: { es: "En línea, sin servidor de juego", en: "Online, with no game server" },
        texto: { es: "Salas con código de cinco letras, uno contra uno y dos contra dos cooperativo, ranking por victorias. Sólo viajan los botones que pulsas: la partida se calcula igual en cada teléfono.", en: "Rooms with a five-letter code, one-on-one and two-on-two co-op, a ranking by wins. Only the buttons you press travel: every phone computes the same match." } },
      { imagen: "warzone-vector",
        titulo: { es: "Dos estilos", en: "Two looks" },
        texto: { es: "La paleta de una consola de 1977, o puro contorno: líneas blancas sobre negro. Mismo juego, mismas reglas; sólo cambia el dibujo.", en: "The palette of a 1977 console, or pure outline: white lines on black. Same game, same rules; only the drawing changes." } },
    ],
  },
  {
    // «La procesión de los dormidos» es el nombre de trabajo (octubre de 2026).
    // La demo (capítulos 1 a 3) se juega en Daily Challenge, la app de juegos,
    // como War Zone; ayotl.dev/procesion redirige allá (next.config.ts). El
    // juego completo va a itch.io y a Google Play. Las cifras salen del guion
    // (PROCESION.md del repo procesion-de-los-dormidos).
    id: "procesion",
    nombre: "La procesión de los dormidos (demo)",
    dominio: "dailychallenge.click/procesion",
    url: "https://dailychallenge.click/procesion",
    acento: "tierra",
    apaisada: true,
    lema: {
      es: "Survival horror en las calles reales de Sahuayo, estilo FAITH y Atari 2600.",
      en: "Survival horror on the real streets of Sahuayo, FAITH and Atari 2600 style.",
    },
    descripcion: {
      es: "Liobas vuelve después de quince años y el pueblo despertó a otra cosa. Ocho capítulos de historia; la demo trae los tres primeros, gratis.",
      en: "Liobas comes back after fifteen years and the town woke up to something else. An eight-chapter story; the demo has the first three, free.",
    },
    datos: [
      { valor: "8", etiqueta: { es: "capítulos", en: "chapters" } },
      { valor: "1 h 30", etiqueta: { es: "de historia", en: "of story" } },
      { valor: "21", etiqueta: { es: "documentos", en: "documents" } },
    ],
    etiquetas: { es: ["Juegos", "Terror", "Web"], en: ["Games", "Horror", "Web"] },
    pantallas: [
      { imagen: "procesion-titulo",
        titulo: { es: "Líneas sobre negro", en: "Lines on black" },
        texto: { es: "Lienzo de 240 por 160, la paleta de 128 colores del Atari 2600, un acento por lugar y un monitor viejo encima: líneas de barrido, viñeta y estática que crece cuando algo se acerca.", en: "A 240 by 160 canvas, the Atari 2600's 128-colour palette, one accent colour per place and an old monitor on top: scanlines, vignette and static that grows when something gets close." } },
      { imagen: "procesion-boulevard",
        titulo: { es: "Las calles de verdad", en: "The real streets" },
        texto: { es: "El trazo del centro de Sahuayo sale de OpenStreetMap: la central de autobuses, la Presidencia, Constitución, la plaza, el mercado. Las cuadras se acortan; los nombres no cambian.", en: "The layout of downtown Sahuayo comes from OpenStreetMap: the bus station, the town hall, Constitución, the plaza, the market. Blocks get shorter; the names stay." } },
      { imagen: "procesion-plaza",
        titulo: { es: "Un pueblo que no está vacío", en: "A town that isn't empty" },
        texto: { es: "La gente sigue ahí, haciendo lo de siempre: barrer, vender, rezar, mirar la Parroquia. No se mueren: se caen y se levantan. Y responden a su propio nombre.", en: "The people are still there, doing what they always did: sweeping, selling, praying, staring at the church. They don't die: they fall and get up. And they answer to their own name." } },
      { imagen: "procesion-catacumbas",
        titulo: { es: "La historia se lee", en: "The story is read" },
        texto: { es: "Veintiún documentos con voz propia: partes de la policía, actas de cabildo, cartas sin enviar, hojas de oración, la libreta de un cura. Los nombres que aprendes ahí son la munición del final.", en: "Twenty-one documents, each in its own voice: police reports, council minutes, unsent letters, prayer sheets, a priest's notebook. The names you learn there are the ammunition for the ending." } },
      { imagen: "procesion-torre",
        titulo: { es: "Campanas que suenan solas", en: "Bells that ring on their own" },
        texto: { es: "Todo el sonido es chiptune sintetizado al vuelo, y los diálogos los lee una voz de chip, letra por letra, con la boca del retrato sincronizada. Sin un solo archivo de audio.", en: "All the sound is chiptune synthesized on the fly, and a chip voice reads the dialogue letter by letter, with the portrait's mouth in sync. Not a single audio file." } },
      { imagen: "procesion-ayotl",
        titulo: { es: "Lo que hay abajo", en: "What's underneath" },
        texto: { es: "Cinemáticas rotoscopiadas con líneas, como las de FAITH, en los momentos que importan. Lo que despertó bajo el cerro no se ve nunca completo. Ficción: la Hermandad, la vasija y los túneles son invención.", en: "Rotoscoped line cinematics, FAITH style, at the moments that matter. What woke up under the hill is never fully seen. Fiction: the Brotherhood, the vessel and the tunnels are invented." } },
    ],
  },
];
