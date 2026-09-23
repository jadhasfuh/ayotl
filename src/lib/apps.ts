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
  id: "mercadito" | "jlptest" | "dailychallenge";
  nombre: string;
  dominio: string;
  url: string;
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
      { valor: "49", etiqueta: { es: "MXN/mes", en: "MXN/month" } },
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
      { valor: "7 957", etiqueta: { es: "palabras", en: "words" } },
      { valor: "846", etiqueta: { es: "gramáticas", en: "grammar points" } },
      { valor: "619", etiqueta: { es: "unidades", en: "units" } },
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
    ],
  },
  {
    id: "dailychallenge",
    nombre: "Daily Challenge",
    dominio: "dailychallenge.click",
    url: "https://dailychallenge.click",
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
      { valor: "24", etiqueta: { es: "minijuegos", en: "mini-games" } },
      { valor: "66", etiqueta: { es: "mapas", en: "maps" } },
      { valor: "1", etiqueta: { es: "partida/día", en: "run/day" } },
    ],
    etiquetas: { es: ["Juegos", "Android", "Web"], en: ["Games", "Android", "Web"] },
    pantallas: [
      { imagen: "dailychallenge-juego",
        titulo: { es: "El reto de hoy", en: "Today's challenge" },
        texto: { es: "Un juego distinto cada día, con su mapa y su música. Una partida por persona: la misma para todo el mundo.", en: "A different game every day, with its own map and music. One run per person: the same one for everybody." } },
      { imagen: "dailychallenge-juegos",
        titulo: { es: "24 minijuegos", en: "24 mini-games" },
        texto: { es: "Escritos en JavaScript puro, sin motor ni descargas, con la paleta y el sonido de una consola de 1977.", en: "Written in plain JavaScript, no engine and no downloads, with the palette and sound of a 1977 console." } },
      { imagen: "dailychallenge-party",
        titulo: { es: "Modo party", en: "Party mode" },
        texto: { es: "Creas una sala, pasas el código a tus amigos y juegan las mismas rondas. La tabla se actualiza en vivo.", en: "Create a room, share the code with your friends and play the same rounds. The table updates live." } },
    ],
  },
];
