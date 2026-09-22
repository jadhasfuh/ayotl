import type { Idioma } from "./idioma";

/**
 * Las fichas de la vitrina. Una entrada por producto; añadir una app es
 * añadir un objeto aquí (y su id a APPS_BETA en beta.ts si entra al programa).
 *
 * Los textos son de cara al público: los revisa Adrián.
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
      es: "Mesas con QR, comandas, meseros, reservas y corte de caja. Los pedidos llegan al WhatsApp del negocio; Mercadito no toca el dinero. Pensado para Sahuayo, Jiquilpan y alrededores.",
      en: "QR tables, orders, waiters, reservations and end-of-day cash count. Orders go straight to the business's WhatsApp; Mercadito never touches the money. Built for Sahuayo, Jiquilpan and nearby towns.",
    },
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
      es: "Vocabulario, gramática, lecturas y mini exámenes del JLPT con repaso espaciado. Más de 8 000 palabras y 800 puntos de gramática, con diccionario propio y un libro del N5.",
      en: "Vocabulary, grammar, readings and JLPT mini-tests with spaced repetition. Over 8,000 words and 800 grammar points, with a built-in dictionary and an N5 book.",
    },
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
      es: "23 minijuegos, una partida por persona y top 10 a medianoche. Modo party para jugar con amigos y versus en tiempo real. Gratis.",
      en: "23 mini-games, one run per person and a top 10 at midnight. Party mode to play with friends and real-time versus. Free.",
    },
    etiquetas: { es: ["Juegos", "Android", "Web"], en: ["Games", "Android", "Web"] },
  },
];
