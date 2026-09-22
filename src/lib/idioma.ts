/**
 * Los textos de la interfaz, en español e inglés.
 *
 * Sin librería de i18n a propósito, igual que en jlptest: son unas decenas de
 * cadenas y una tabla se lee mejor que una cadena de herramientas. Añadir un
 * idioma es añadir una columna aquí y una entrada en RUTAS.
 *
 * Las URL llevan el idioma: `/`, `/beta`, `/acerca` en español (por defecto,
 * sin prefijo) y `/en`, `/en/beta`, `/en/about` en inglés. Es mejor para el
 * buscador que la cookie sola: cada idioma tiene su dirección y su hreflang.
 */
export const IDIOMAS = [
  { id: "es", nombre: "Español" },
  { id: "en", nombre: "English" },
] as const;

export type Idioma = (typeof IDIOMAS)[number]["id"];
export const IDIOMA_POR_DEFECTO: Idioma = "es";
export const COOKIE_IDIOMA = "ayotl.idioma";

export function esIdioma(v: unknown): v is Idioma {
  return typeof v === "string" && IDIOMAS.some((i) => i.id === v);
}

/**
 * Del encabezado Accept-Language del navegador al idioma que tengamos.
 * Copiado de jlptest: ordena por peso y respeta el orden a igual peso.
 * Si el navegador no pide ni español ni inglés, inglés: es lo que más gente
 * lee de las dos.
 */
export function idiomaDeCabecera(accept: string | null | undefined): Idioma {
  if (!accept) return IDIOMA_POR_DEFECTO;
  const preferencias = accept.split(",")
    .map((trozo) => {
      const [cod, ...params] = trozo.split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="))?.slice(2);
      const peso = q === undefined ? 1 : Number(q);
      return { cod: cod.trim().toLowerCase(), peso: Number.isFinite(peso) ? peso : 0 };
    })
    .filter((x) => x.cod && x.peso > 0)
    .map((x, i) => ({ ...x, i }))
    .sort((a, b) => b.peso - a.peso || a.i - b.i);

  for (const { cod } of preferencias) {
    if (cod === "es" || cod.startsWith("es-")) return "es";
    if (cod === "en" || cod.startsWith("en-")) return "en";
  }
  return "en";
}

/** Las páginas del sitio y su dirección pública en cada idioma. */
export const PAGINAS = ["inicio", "beta", "acerca"] as const;
export type Pagina = (typeof PAGINAS)[number];

export const RUTAS: Record<Pagina, Record<Idioma, string>> = {
  inicio: { es: "/", en: "/en" },
  beta:   { es: "/beta", en: "/en/beta" },
  acerca: { es: "/acerca", en: "/en/about" },
};

/** La misma página en el otro idioma (para el selector y los hreflang). */
export function ruta(pagina: Pagina, idioma: Idioma): string {
  return RUTAS[pagina][idioma];
}

// ---------------------------------------------------------------------------
// Textos. Los de cara al público los revisa Adrián antes de publicar.

const TEXTOS = {
  // Marca
  marca: { es: "Ayotl", en: "Ayotl" },
  lema: { es: "Software hecho despacio, desde Sahuayo.", en: "Software made slowly, from Sahuayo." },
  descripcionSitio: {
    es: "Ayotl es el estudio personal de software de Adrián: Mercadito, JLPTest y Daily Challenge. Apps pequeñas, cuidadas y hechas desde Sahuayo, Michoacán.",
    en: "Ayotl is Adrián's personal software studio: Mercadito, JLPTest and Daily Challenge. Small, carefully built apps made in Sahuayo, Michoacán.",
  },

  // Navegación
  navInicio: { es: "Inicio", en: "Home" },
  navApps: { es: "Apps", en: "Apps" },
  navBeta: { es: "Programa Beta", en: "Beta Program" },
  navAcerca: { es: "Acerca de", en: "About" },
  cambiarIdioma: { es: "English", en: "Español" },
  cambiarTema: { es: "Cambiar tema", en: "Toggle theme" },
  irAlContenido: { es: "Ir al contenido", en: "Skip to content" },

  // Inicio
  heroTitulo: { es: "Un estudio pequeño. Apps que duran.", en: "A small studio. Apps built to last." },
  heroTexto: {
    es: "Ayotl significa «tortuga» en náhuatl. Hago productos pequeños, independientes y útiles, uno a uno y sin prisa.",
    en: "Ayotl means “turtle” in Nahuatl. I build small, independent, useful products, one at a time and in no hurry.",
  },
  heroBotonApps: { es: "Ver las apps", en: "See the apps" },
  heroBotonBeta: { es: "Unirme al programa beta", en: "Join the beta program" },
  appsTitulo: { es: "Las apps", en: "The apps" },
  appsTexto: {
    es: "Tres productos en producción, cada uno con su dominio y su propia gente.",
    en: "Three products in production, each with its own domain and its own people.",
  },
  abrirApp: { es: "Abrir", en: "Open" },
  betaTeaserTitulo: { es: "Lo próximo de Ayotl", en: "What's next at Ayotl" },
  betaTeaserTexto: {
    es: "Cada versión la prueba antes un grupo pequeño de gente que usa las apps de verdad. Pago por día de prueba: hasta 20 pesos si usas las tres.",
    en: "Every release is tried first by a small group of people who actually use the apps. I pay per day of testing: up to 20 MXN if you use all three.",
  },
  acercaTeaserTitulo: { es: "¿Por qué una tortuga?", en: "Why a turtle?" },
  acercaTeaserTexto: {
    es: "Un nombre náhuatl de Sahuayo, Michoacán, que me gustó por lo que representa: llegar sin correr.",
    en: "A Nahuatl name from Sahuayo, Michoacán, that I liked for what it stands for: getting there without running.",
  },
  leerMas: { es: "Leer la historia", en: "Read the story" },

  // Programa Beta
  betaTitulo: { es: "Programa Beta", en: "Beta Program" },
  betaIntro: {
    es: "Antes de publicar una versión, la prueba un grupo pequeño de personas reales. Si te apuntas, te aviso por correo cuando haya algo que probar, te digo qué mirar y tú me cuentas qué se rompió. Sin compromiso: te sales cuando quieras.",
    en: "Before a release goes out, a small group of real people tries it first. If you sign up, I'll email you when there's something to test, tell you what to look at, and you tell me what broke. No commitment: leave whenever you want.",
  },
  betaQueRecibes: { es: "Qué recibes", en: "What you get" },
  betaVentajas: {
    es: [
      "Un mes de JLPTest completo, gratis, desde que te apuntas.",
      "Se paga por día y por cuántas apps usaste ese día: 5 pesos por una, 10 por dos y 20 si usas las tres. Todo junto al final, por CoDi o transferencia.",
      "Acceso a las versiones nuevas antes de que salgan.",
      "Un canal directo conmigo para reportar fallos y proponer cosas.",
      "Tu nombre en los agradecimientos, si quieres.",
    ],
    en: [
      "A full month of JLPTest, free, from the day you sign up.",
      "Paid per day, by how many apps you used that day: 5 MXN for one, 10 for two, 20 if you use all three. Paid at the end via CoDi or bank transfer.",
      "Access to new versions before they ship.",
      "A direct line to me for bugs and ideas.",
      "Your name in the credits, if you want.",
    ],
  },
  betaPlazas: {
    es: (libres: number, cupo: number) => libres > 0
      ? `Quedan ${libres} de ${cupo} plazas.`
      : `Las ${cupo} plazas están ocupadas. Escríbeme y te aviso si se abre una.`,
    en: (libres: number, cupo: number) => libres > 0
      ? `${libres} of ${cupo} spots left.`
      : `All ${cupo} spots are taken. Write to me and I'll let you know if one opens up.`,
  },
  campoNombre: { es: "Nombre", en: "Name" },
  campoEmail: { es: "Correo electrónico", en: "Email" },
  campoPlataforma: { es: "Dispositivo principal", en: "Main device" },
  campoApps: { es: "Apps que te interesan", en: "Apps you're interested in" },
  campoEmailGoogle: { es: "Correo de Google Play (si es distinto)", en: "Google Play email (if different)" },
  campoEmailGoogleAyuda: {
    es: "La cuenta de Google con la que instalas apps. Úsala también para entrar a las apps: así puedo ver tu actividad y contarte los días.",
    en: "The Google account you install apps with. Use it to sign in to the apps too, so I can see your activity and count your days.",
  },
  campoTelefono: { es: "WhatsApp", en: "WhatsApp" },
  campoTelefonoOpcional: { es: "WhatsApp (opcional)", en: "WhatsApp (optional)" },
  campoTelefonoAyuda: { es: "10 dígitos. Para pagarte por CoDi.", en: "10 digits. To pay you via CoDi." },
  campoTelefonoObligatorio: {
    es: "Obligatorio para probar Mercadito: se entra con el teléfono, y es la única forma de contar tus días ahí.",
    en: "Required to test Mercadito: you sign in with your phone, and it's the only way to count your days there.",
  },
  campoEmailGoogleObligatorio: {
    es: "Obligatorio para probar Daily Challenge: se entra con «Entrar con Google», así que tiene que ser una cuenta de Gmail.",
    en: "Required to test Daily Challenge: you sign in with “Sign in with Google”, so it has to be a Gmail account.",
  },
  campoComentario: { es: "Algo más (opcional)", en: "Anything else (optional)" },
  campoComentarioAyuda: {
    es: "Modelo del teléfono, qué sueles usar, por qué te interesa…",
    en: "Phone model, what you usually use, why you're interested…",
  },
  plataformaIos: { es: "iPhone / iPad", en: "iPhone / iPad" },
  plataformaAndroid: { es: "Android", en: "Android" },
  plataformaWeb: { es: "Computadora / navegador", en: "Desktop / browser" },
  enviar: { es: "Apuntarme", en: "Sign me up" },
  enviando: { es: "Enviando…", en: "Sending…" },
  privacidad: {
    es: "Tu correo se usa sólo para avisarte de las pruebas. No se comparte con nadie ni se usa para publicidad.",
    en: "Your email is only used to notify you about tests. It isn't shared with anyone or used for advertising.",
  },
  graciasTitulo: { es: "¡Listo, ya estás dentro!", en: "Done, you're in!" },
  graciasTexto: {
    es: "Te escribo en cuanto haya algo que probar. Tu mes de JLPTest ya está activo: entra con el mismo correo. Gracias por echar una mano.",
    en: "I'll write to you as soon as there's something to test. Your free month of JLPTest is already active: sign in with the same email. Thanks for helping out.",
  },
  errorGenerico: { es: "No se pudo enviar. Inténtalo de nuevo en un momento.", en: "Couldn't send. Please try again in a moment." },
  errorDatos: { es: "Revisa los campos marcados.", en: "Please check the highlighted fields." },
  errorMuchos: { es: "Demasiados intentos desde esta conexión. Prueba más tarde.", en: "Too many attempts from this connection. Try again later." },
  errorRobot: { es: "No pudimos verificar que eres una persona. Recarga la página e inténtalo otra vez.", en: "We couldn't verify you're a person. Reload the page and try again." },
  errorNoDisponible: { es: "El formulario no está disponible ahora mismo. Escríbeme a hola@ayotl.dev.", en: "The form isn't available right now. Email me at hola@ayotl.dev." },
  errorTelefonoMercadito: {
    es: "Para probar Mercadito hace falta tu WhatsApp: es con lo que se entra a la app.",
    en: "To test Mercadito I need your WhatsApp number: that's how you sign in to the app.",
  },
  errorGoogleDaily: {
    es: "Para probar Daily Challenge hace falta una cuenta de Gmail, que es con la que se entra. Ponla en «Correo de Google Play».",
    en: "To test Daily Challenge I need a Gmail account, which is how you sign in. Put it in “Google Play email”.",
  },
  errorLleno: { es: "Se acaban de llenar las plazas. Escríbeme a hola@ayotl.dev y te aviso si se abre una.", en: "The spots just filled up. Email me at hola@ayotl.dev and I'll let you know if one opens." },
  elegirUnaApp: { es: "Elige al menos una app.", en: "Pick at least one app." },

  // Acerca de
  acercaTitulo: { es: "Acerca de Ayotl", en: "About Ayotl" },
  acercaParrafos: {
    es: [
      "Ayotl (se dice «a-yotl») es «tortuga» en náhuatl. Es una de las raíces que se le atribuyen al nombre de Sahuayo, el pueblo de Michoacán del que soy: la lectura más repetida lo hace venir de «tzacuatlayotl», «vasija con forma de tortuga», de «tzacuatl» (vasija) y «ayotl» (tortuga). Hay otras versiones, como en casi toda etimología de pueblo; me quedo con la tortuga.",
      "Me gustó como nombre porque dice bastante de cómo trabajo. Una tortuga no corre, pero llega; carga su casa encima y no necesita mucho más. Los proyectos de Ayotl son así: pequeños, autosuficientes, sin inversores ni prisa, hechos por una sola persona que los usa y los mantiene.",
      "Soy Adrián. Hago software desde Sahuayo para gente concreta: los negocios de mi región, quienes estudian japonés, y quienes quieren un reto de cinco minutos al día. Cada app tiene su propio dominio y su propia vida; Ayotl es el paraguas que las junta.",
    ],
    en: [
      "Ayotl (pronounced “ah-yotl”) is “turtle” in Nahuatl. It's one of the roots attributed to the name of Sahuayo, the town in Michoacán, Mexico, where I'm from: the most repeated reading derives it from “tzacuatlayotl”, “turtle-shaped vessel”, from “tzacuatl” (vessel) and “ayotl” (turtle). There are other versions, as with almost every town etymology; I'm keeping the turtle.",
      "I liked it as a name because it says a lot about how I work. A turtle doesn't run, but it gets there; it carries its house on its back and doesn't need much else. Ayotl's projects are like that: small, self-sufficient, with no investors and no rush, built by one person who uses and maintains them.",
      "I'm Adrián. I build software from Sahuayo for specific people: the businesses in my region, people studying Japanese, and people who want a five-minute challenge every day. Each app has its own domain and its own life; Ayotl is the umbrella that brings them together.",
    ],
  },
  acercaStackTitulo: { es: "Cómo está hecho", en: "How it's built" },
  acercaStackTexto: {
    es: "Todo corre sobre la misma base: Next.js y TypeScript, desplegado en Railway con Docker, datos en Supabase (Postgres) y las apps de tienda como envoltorios de la web. Código en GitHub, comentarios en español.",
    en: "Everything runs on the same foundation: Next.js and TypeScript, deployed on Railway with Docker, data in Supabase (Postgres), and the store apps as wrappers around the web. Code on GitHub, comments in Spanish.",
  },
  acercaContacto: { es: "Escríbeme", en: "Get in touch" },

  // Pie
  pieHecho: { es: "Hecho en Sahuayo, Michoacán.", en: "Made in Sahuayo, Michoacán." },
  pieCodigo: { es: "Código", en: "Code" },
  pieDerechos: { es: "Todos los derechos reservados.", en: "All rights reserved." },

  // 404
  noEncontradoTitulo: { es: "Esta página no existe", en: "This page doesn't exist" },
  noEncontradoTexto: { es: "Quizá la tortuga se la llevó. Vuelve al inicio.", en: "Maybe the turtle took it. Head back home." },
  volverInicio: { es: "Volver al inicio", en: "Back home" },
} as const;

type Clave = keyof typeof TEXTOS;
type Valor<C extends Clave> = (typeof TEXTOS)[C]["es"];

/** `t("es")("heroTitulo")`: los textos de un idioma, con el tipo de cada clave. */
export function t(idioma: Idioma) {
  return <C extends Clave>(clave: C): Valor<C> => TEXTOS[clave][idioma] as Valor<C>;
}
export type Textos = ReturnType<typeof t>;
