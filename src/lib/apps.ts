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
  },
];
