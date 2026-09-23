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
export const PAGINAS = ["inicio", "negocios", "beta", "acerca"] as const;
export type Pagina = (typeof PAGINAS)[number];

export const RUTAS: Record<Pagina, Record<Idioma, string>> = {
  inicio: { es: "/", en: "/en" },
  negocios: { es: "/negocios", en: "/en/business" },
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
  navNegocios: { es: "Para negocios", en: "For businesses" },
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
    es: "Cada versión la prueba antes un grupo pequeño de gente que usa las apps de verdad. Pago por día de prueba: hasta 15 pesos si usas las dos.",
    en: "Every release is tried first by a small group of people who actually use the apps. I pay per day of testing: up to 15 MXN if you use both.",
  },
  acercaTeaserTitulo: { es: "¿Por qué una tortuga?", en: "Why a turtle?" },
  acercaTeaserTexto: {
    es: "Un nombre náhuatl de Sahuayo, Michoacán, que me gustó por lo que representa: llegar sin correr.",
    en: "A Nahuatl name from Sahuayo, Michoacán, that I liked for what it stands for: getting there without running.",
  },
  leerMas: { es: "Leer la historia", en: "Read the story" },

  // Para negocios
  negTitulo: { es: "¿Necesitas una app o una página?", en: "Need an app or a website?" },
  negIntro: {
    es: "Soy Adrián, de Sahuayo. Hago software desde aquí: tres apps mías están en producción y las usan negocios y gente de la región todos los días. Si tienes un negocio y necesitas algo hecho a la medida, hablamos y te digo con franqueza si puedo ayudarte y cuánto cuesta.",
    en: "I'm Adrián, from Sahuayo. I build software from here: three of my own apps are in production, used every day by businesses and people in the region. If you run a business and need something custom, let's talk and I'll tell you straight whether I can help and what it costs.",
  },
  negQueHago: { es: "Qué puedo hacerte", en: "What I can build for you" },
  negServicios: {
    es: [
      { t: "Tu página o tienda en línea", d: "Rápida, que se vea bien en el teléfono y que aparezca en Google. Con tu propio dominio, no una red social prestada." },
      { t: "Una app para iPhone y Android", d: "Publicada en App Store y Google Play a tu nombre. Es lo que hice con Mercadito, que hoy está en las dos tiendas." },
      { t: "El sistema de tu negocio", d: "Menú con código QR, comandas a la cocina, meseros, reservas, corte de caja. Lo mismo que Mercadito hace para los negocios de aquí, adaptado a lo tuyo." },
      { t: "Automatizaciones", d: "Que tu negocio publique solo en Facebook e Instagram, que los pedidos lleguen a tu WhatsApp, que tu sistema hable con el que ya usas. Se configura una vez y trabaja solo." },
    ],
    en: [
      { t: "Your website or online store", d: "Fast, good-looking on a phone, and findable on Google. On your own domain, not a borrowed social account." },
      { t: "An iPhone and Android app", d: "Published on the App Store and Google Play under your name. That's what I did with Mercadito, now live on both." },
      { t: "Your business system", d: "QR menu, orders to the kitchen, waiters, reservations, end-of-day cash count. The same Mercadito does for businesses here, fitted to yours." },
      { t: "Automation", d: "Your business posting to Facebook and Instagram on its own, orders landing in your WhatsApp, your system talking to the one you already use. Set up once, then it runs itself." },
    ],
  },
  negPrueba: { es: "Lo que ya he hecho", en: "What I've already built" },
  negPruebaTexto: {
    es: "No son ejemplos de escuela: son tres productos en producción, con su dominio, sus usuarios y su mantenimiento. Mercadito lo usan negocios de Sahuayo, Jiquilpan y San Pedro.",
    en: "These aren't school projects: three products in production, each with its own domain, users and upkeep. Mercadito is used by businesses in Sahuayo, Jiquilpan and San Pedro.",
  },
  negComo: { es: "Cómo trabajo", en: "How I work" },
  negPasos: {
    es: [
      "Hablamos de lo que necesitas, sin compromiso. Si no te hace falta un software, te lo digo.",
      "Te paso qué incluye, cuánto cuesta y en cuánto tiempo, por escrito y cerrado.",
      "Lo hago y te lo voy enseñando funcionando, no en dibujos.",
      "Queda a tu nombre: tu dominio, tus cuentas, tus datos. Si un día quieres llevártelo, te lo llevas.",
    ],
    en: [
      "We talk about what you need, no strings. If you don't need software, I'll say so.",
      "You get what's included, the price and the timeline, in writing and fixed.",
      "I build it and show it to you working, not as drawings.",
      "It's yours: your domain, your accounts, your data. If you ever want to take it elsewhere, you can.",
    ],
  },
  negContacto: { es: "Hablemos", en: "Let's talk" },
  negContactoTexto: {
    es: "Escríbeme por WhatsApp o por correo y platicamos. Soy de aquí: si hace falta, nos vemos.",
    en: "Send me a WhatsApp or an email and we'll talk it through. I'm local: we can meet in person if that's easier.",
  },
  negWhatsapp: { es: "Escríbeme por WhatsApp", en: "Message me on WhatsApp" },

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
      "Se paga por día y por cuántas apps usaste ese día: 5 pesos por una y 15 si usas las dos. Todo junto al final, por CoDi o transferencia.",
      "Acceso a las versiones nuevas antes de que salgan.",
      "Un canal directo conmigo para reportar fallos y proponer cosas.",
      "Tu nombre en los agradecimientos, si quieres.",
    ],
    en: [
      "A full month of JLPTest, free, from the day you sign up.",
      "Paid per day, by how many apps you used that day: 5 MXN for one and 15 if you use both. Paid at the end via CoDi or bank transfer.",
      "Access to new versions before they ship.",
      "A direct line to me for bugs and ideas.",
      "Your name in the credits, if you want.",
    ],
  },
  esperaTitulo: { es: "Por ahora ya no hay lugares", en: "No spots left for now" },
  esperaTexto: {
    es: "Lo siento: ya se alcanzó el número de testers que necesitaba para esta ronda. Déjame tu correo y te aviso en cuanto se abra un lugar o empiece la siguiente.",
    en: "Sorry: I've already reached the number of testers I needed for this round. Leave me your email and I'll let you know as soon as a spot opens up or the next round starts.",
  },
  esperaEnviar: { es: "Avísame", en: "Let me know" },
  esperaComentario: { es: "¿Qué app te interesa? (opcional)", en: "Which app are you interested in? (optional)" },
  esperaGraciasTitulo: { es: "Apuntado", en: "You're on the list" },
  esperaGraciasTexto: {
    es: "Te escribo en cuanto haya un lugar o algo nuevo que probar. Tu correo no se usa para nada más.",
    en: "I'll write to you as soon as there's a spot or something new to test. Your email isn't used for anything else.",
  },
  betaPlazas: {
    es: (libres: number, cupo: number) => libres > 0
      ? `Quedan ${libres} de ${cupo} lugares.`
      : "Lo siento: ya se alcanzó el número de testers que necesitaba por ahora.",
    en: (libres: number, cupo: number) => libres > 0
      ? `${libres} of ${cupo} spots left.`
      : "Sorry: I've already reached the number of testers I needed for now.",
  },
  campoNombre: { es: "Nombre", en: "Name" },
  campoEmail: { es: "Correo electrónico", en: "Email" },
  campoPlataforma: { es: "Dispositivo principal", en: "Main device" },
  campoApps: { es: "Apps que te interesan", en: "Apps you're interested in" },
  campoEmailGoogle: { es: "Correo de Google", en: "Google email" },
  campoEmailGoogleAyuda: {
    es: "La cuenta de Google con la que instalas apps. Úsala también para entrar a las apps: así puedo ver tu actividad y contarte los días.",
    en: "The Google account you install apps with. Use it to sign in to the apps too, so I can see your activity and count your days.",
  },
  campoTelefono: { es: "WhatsApp", en: "WhatsApp" },
  campoTelefonoOpcional: { es: "WhatsApp", en: "WhatsApp" },
  campoTelefonoAyuda: { es: "10 dígitos. Para pagarte por CoDi.", en: "10 digits. To pay you via CoDi." },
  campoTelefonoObligatorio: {
    es: "10 dígitos. Para pagarte por CoDi, para avisarte, y porque a Mercadito se entra con el teléfono.",
    en: "10 digits. To pay you via CoDi, to reach you, and because you sign in to Mercadito with your phone.",
  },
  campoEmailGoogleObligatorio: {
    es: "Tiene que ser una cuenta de Gmail: es con la que se acepta la prueba en Google Play y con la que se entra a Daily Challenge.",
    en: "It has to be a Gmail account: it's how you accept the test on Google Play and how you sign in to Daily Challenge.",
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
    es: "Hace falta tu WhatsApp: es como te aviso y como te pago por CoDi.",
    en: "I need your WhatsApp number: it's how I reach you and how I pay you via CoDi.",
  },
  errorGoogleDaily: {
    es: "Hace falta una cuenta de Gmail: es con la que se acepta la prueba en Google Play. Ponla en «Correo de Google».",
    en: "I need a Gmail account: it's how you accept the test on Google Play. Put it in “Google email”.",
  },
  errorCorreoUsado: {
    es: "Ese correo ya está apuntado por otra persona. Si es tuyo y te apuntaste antes, usa el mismo correo de contacto de aquella vez.",
    en: "That email is already registered by someone else. If it's yours and you signed up before, use the same contact email you used then.",
  },
  errorLleno: { es: "Se acaban de llenar las plazas. Escríbeme a hola@ayotl.dev y te aviso si se abre una.", en: "The spots just filled up. Email me at hola@ayotl.dev and I'll let you know if one opens." },
  elegirUnaApp: { es: "Elige al menos una app.", en: "Pick at least one app." },

  // Enlace del tester
  miTitulo: { es: "Tu programa Beta", en: "Your Beta program" },
  miHola: { es: (nombre: string) => `Hola, ${nombre}`, en: (nombre: string) => `Hi, ${nombre}` },
  miDias: { es: "días con actividad", en: "days with activity" },
  miCompletos: { es: "con las dos apps", en: "with both apps" },
  miGanado: { es: "ganado", en: "earned" },
  miPagado: { es: "pagado", en: "paid" },
  miSaldo: { es: "te debo", en: "I owe you" },
  miComoSeCuenta: {
    es: (t1: number, t2: number) =>
      `Cada día cuenta según en cuántas apps hiciste algo: ${t1} pesos por una y ${t2} por las dos. Basta con un repaso en JLPTest o una partida en Daily Challenge.`,
    en: (t1: number, t2: number) =>
      `Each day counts by how many apps you used: ${t1} MXN for one and ${t2} for both. One review in JLPTest or one run in Daily Challenge is enough.`,
  },
  miHoy: { es: "Hoy", en: "Today" },
  miHoyNada: { es: "Hoy todavía no registras nada.", en: "Nothing registered today yet." },
  miHoyFaltan: {
    es: (faltan: string[]) => `Hoy te faltan: ${faltan.join(", ")}.`,
    en: (faltan: string[]) => `Missing today: ${faltan.join(", ")}.`,
  },
  miHoyCompleto: { es: "¡Día completo! Hoy ya vale el máximo.", en: "Full day! Today is worth the maximum." },
  miPeriodo: {
    es: (inicio: string, fin: string) => `Del ${inicio} al ${fin}.`,
    en: (inicio: string, fin: string) => `From ${inicio} to ${fin}.`,
  },
  miDetalle: { es: "Tus días", en: "Your days" },
  miSinDias: { es: "Todavía no hay días registrados. Se actualiza cada mañana.", en: "No days registered yet. It updates every morning." },
  miTarda: {
    es: "Lo de hoy puede tardar unos minutos en aparecer; lo de ayer y antes se cierra cada mañana a las 6.",
    en: "Today's activity can take a few minutes to show up; previous days are closed every morning at 6.",
  },
  miNoVale: { es: "Ese enlace no vale", en: "That link isn't valid" },
  miNoValeTexto: {
    es: "Puede que esté incompleto o que tu alta ya no exista. Pon el correo con el que te apuntaste y te lo mando otra vez.",
    en: "It may be incomplete, or your signup may no longer exist. Enter the email you signed up with and I'll send it again.",
  },
  miPedir: { es: "Mándame el enlace", en: "Send me the link" },
  miPedido: {
    es: "Si ese correo está apuntado, el enlace ya va para allá. Revisa también el correo no deseado.",
    en: "If that email is registered, the link is on its way. Check your spam folder too.",
  },
  miGuarda: {
    es: "Guarda este enlace: con él ves tus días y lo que llevas ganado. También te lo mandé por correo.",
    en: "Keep this link: it shows your days and what you've earned. I've emailed it to you too.",
  },
  miCopiar: { es: "Copiar", en: "Copy" },
  miCopiado: { es: "Copiado", en: "Copied" },

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
  acercaQuienTitulo: { es: "Quién está detrás", en: "Who's behind it" },
  acercaQuienParrafos: {
    es: [
      "Soy desarrollador de software: unos cinco años, los últimos tres en Salesforce —Industries/OmniStudio, Order Management, Financial Services Cloud— y antes en automatización con RPA. He pasado por IBM, Bluetab, xpd global y ahora Ness Digital Engineering.",
      "Estudio japonés y tengo el JLPT N3, que es de donde salió JLPTest; vivo en Sahuayo, que es de donde salió Mercadito. Ayotl es lo que hago por mi cuenta, fuera del trabajo.",
    ],
    en: [
      "I'm a software developer: about five years, the last three in Salesforce — Industries/OmniStudio, Order Management, Financial Services Cloud — and before that in RPA automation. I've worked at IBM, Bluetab, xpd global and now Ness Digital Engineering.",
      "I study Japanese and hold the JLPT N3, which is where JLPTest came from; I live in Sahuayo, which is where Mercadito came from. Ayotl is what I do on my own, outside work.",
    ],
  },
  acercaDisponible: {
    es: "Abierto a proyectos de Salesforce e integraciones.",
    en: "Open to Salesforce and integration work.",
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
