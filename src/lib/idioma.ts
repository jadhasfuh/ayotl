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
export const PAGINAS = ["inicio", "negocios", "notas", "beta", "acerca"] as const;
export type Pagina = (typeof PAGINAS)[number];

export const RUTAS: Record<Pagina, Record<Idioma, string>> = {
  inicio: { es: "/", en: "/en" },
  negocios: { es: "/negocios", en: "/en/business" },
  notas: { es: "/notas", en: "/en/notes" },
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
  // En el teléfono no caben las cuatro secciones con su nombre largo, y
  // recortarlas es mejor que dejar la barra corriéndose de lado.
  navNegociosCorto: { es: "Negocios", en: "Business" },
  navBetaCorto: { es: "Beta", en: "Beta" },
  navAcercaCorto: { es: "Acerca", en: "About" },
  navNotas: { es: "Notas", en: "Notes" },
  navBeta: { es: "Programa Beta", en: "Beta Program" },
  navAcerca: { es: "Acerca de", en: "About" },
  cambiarIdioma: { es: "English", en: "Español" },
  cambiarTema: { es: "Cambiar tema", en: "Toggle theme" },
  irAlContenido: { es: "Ir al contenido", en: "Skip to content" },

  // Inicio
  heroTitulo: { es: "Un estudio pequeño. Apps que duran.", en: "A small studio. Apps built to last." },
  heroTexto: {
    es: "Ayotl significa «tortuga» en náhuatl. Aquí se hacen productos pequeños, independientes y útiles, uno a uno y sin prisa.",
    en: "Ayotl means “turtle” in Nahuatl. Small, independent, useful products, built one at a time and in no hurry.",
  },
  heroBotonApps: { es: "Ver las apps", en: "See the apps" },
  heroBotonBeta: { es: "Entrar al programa beta", en: "Join the beta program" },
  appsTitulo: { es: "Las apps", en: "The apps" },
  appsTexto: {
    es: "Tres productos en producción, cada uno con su dominio y su propia gente.",
    en: "Three products in production, each with its own domain and its own people.",
  },
  abrirApp: { es: "Abrir", en: "Open" },
  betaTeaserTitulo: { es: "Lo próximo de Ayotl", en: "What's next at Ayotl" },
  betaTeaserTexto: {
    es: "Cada versión la prueba antes un grupo pequeño de gente que usa las apps de verdad. El programa paga por día de prueba: hasta 15 pesos por usar las dos.",
    en: "Every release is tried first by a small group of people who actually use the apps. The program pays per day of testing: up to 15 MXN for using both.",
  },
  acercaTeaserTitulo: { es: "¿Por qué una tortuga?", en: "Why a turtle?" },
  acercaTeaserTexto: {
    es: "Un nombre náhuatl de Sahuayo, Michoacán, elegido por lo que representa: llegar sin correr.",
    en: "A Nahuatl name from Sahuayo, Michoacán, chosen for what it stands for: getting there without running.",
  },
  leerMas: { es: "Leer la historia", en: "Read the story" },
  notasTeaserTitulo: { es: "Cómo está hecho por dentro", en: "How it works underneath" },
  notasTeaserTexto: {
    es: "Notas de cosas que se rompieron en producción: un cron que decía «succeeded» sin haber publicado nada, una base que no se dejaba alcanzar, un juego que no puede fiarse del navegador.",
    en: "Notes on things that broke in production: a cron reporting “succeeded” with nothing published, a database that refused to be reached, a game that can't trust the browser.",
  },

  // Página de cada app
  appAbrir: { es: "Abrir", en: "Open" },
  appEnLaTienda: { es: "En Google Play", en: "On Google Play" },
  appVolver: { es: "Todas las apps", en: "All apps" },
  appPantallas: { es: "Por dentro", en: "A look inside" },
  appOtras: { es: "Las otras apps", en: "The other apps" },
  appHechaPor: {
    es: "Hecha y mantenida por Ayotl. Si tu negocio necesita algo parecido, la página «Para negocios» lo explica.",
    en: "Built and maintained by Ayotl. If your business needs something similar, the “For businesses” page explains how.",
  },

  // Notas
  notasTitulo: { es: "Notas", en: "Notes" },
  notasIntro: {
    es: "Cosas que se rompieron en producción y lo que costó entenderlas. Ni tutoriales ni listas de trucos: sólo problemas que pasaron de verdad, con el detalle que hace falta para que a otro no le cuesten la misma tarde.",
    en: "Things that broke in production and what it took to understand them. No tutorials, no listicles: only problems that actually happened, with the detail someone else needs to avoid losing the same afternoon.",
  },
  notasEn: { es: "En", en: "In" },
  notasVolver: { es: "Todas las notas", en: "All notes" },
  notasLeer: { es: "Leer", en: "Read" },

  // Para negocios
  negTitulo: { es: "¿Tu negocio necesita una app o una página?", en: "Does your business need an app or a website?" },
  negCercania: {
    es: "Hecho en Sahuayo, para negocios de aquí",
    en: "Made in Sahuayo, for businesses here",
  },
  negIntro: {
    es: "Ayotl es un estudio de software de Sahuayo. Aquí mismo: sus tres apps están en producción y las usan negocios y gente de la región todos los días. Si tu negocio necesita algo a la medida, la primera plática no cuesta nada —en tu local si prefieres— y termina con una respuesta clara: si vale la pena hacerlo, cuánto cuesta y en cuánto tiempo.",
    en: "Ayotl is a software studio from Sahuayo — right here. Its three apps are in production, used every day by businesses and people around the region. If your business needs something custom, the first conversation is free — at your place if you prefer — and ends with a clear answer: whether it's worth building, what it costs and how long it takes.",
  },
  negQueHago: { es: "Qué se puede construir", en: "What can be built" },
  negServicios: {
    es: [
      { t: "Tu página o tienda en línea", d: "Rápida, que se vea bien en el teléfono y que aparezca en Google. Con tu propio dominio, no una red social prestada." },
      { t: "Una app para iPhone y Android", d: "Publicada en App Store y Google Play a nombre del negocio. Es lo que hay detrás de Mercadito, que hoy está en las dos tiendas." },
      { t: "El sistema de tu negocio", d: "Menú con código QR, comandas a la cocina, meseros, reservas, corte de caja. Lo mismo que Mercadito hace para los negocios de la región, adaptado a cada caso." },
      { t: "Automatizaciones", d: "Que tu negocio publique solo en Facebook e Instagram, que los pedidos lleguen a tu WhatsApp, que tu sistema hable con el que ya usas. Se configura una vez y trabaja solo." },
    ],
    en: [
      { t: "Your website or online store", d: "Fast, good-looking on a phone, and findable on Google. On your own domain, not a borrowed social account." },
      { t: "An iPhone and Android app", d: "Published on the App Store and Google Play under the business's name. That's what's behind Mercadito, now live on both." },
      { t: "Your business system", d: "QR menu, orders to the kitchen, waiters, reservations, end-of-day cash count. The same Mercadito does for businesses here, fitted to each case." },
      { t: "Automation", d: "Your business posting to Facebook and Instagram on its own, orders landing in your WhatsApp, your system talking to the one you already use. Set up once, then it runs itself." },
    ],
  },
  negMuestraTitulo: { es: "Así se ve", en: "What it looks like" },
  negMuestraMenu: {
    es: "El menú que ve tu cliente en su teléfono: pide sin registrarse y el pedido te llega por WhatsApp.",
    en: "The menu your customer sees on their phone: they order without signing up and it reaches you on WhatsApp.",
  },
  negMuestraPanel: {
    es: "Tu panel: tus precios, el QR de tu menú, tus mesas y el corte de caja del día.",
    en: "Your dashboard: your prices, your menu's QR code, your tables and the day's cash count.",
  },
  negPrueba: { es: "Lo que ya está hecho", en: "What's already built" },
  negPruebaTexto: {
    es: "No son ejemplos de escuela: son tres productos en producción, con su dominio, sus usuarios y su mantenimiento. A Mercadito lo usan negocios de aquí —Sahuayo, Jiquilpan, San Pedro— y quien lo atiende cuando algo falla vive en el mismo pueblo.",
    en: "These aren't school projects: three products in production, each with its own domain, users and upkeep. Mercadito is used by businesses here — Sahuayo, Jiquilpan, San Pedro — and whoever fixes it when something breaks lives in the same town.",
  },
  negComo: { es: "Cómo se trabaja", en: "How the work goes" },
  negPasos: {
    es: [
      "Primero una plática, donde te acomode: en tu negocio, por WhatsApp o por llamada. Sin compromiso, y si no te hace falta un software se te dice de frente.",
      "Después, por escrito y cerrado: qué incluye, cuánto cuesta y en cuánto tiempo. Sin letras chiquitas ni cobros que aparezcan luego.",
      "Durante el trabajo lo vas viendo funcionando, no en dibujos, y se te enseña cómo usarlo hasta que te sientas a gusto.",
      "Al final queda a tu nombre: tu dominio, tus cuentas, tus datos. Si un día quieres llevártelo, te lo llevas.",
    ],
    en: [
      "First a conversation, wherever suits you: at your business, over WhatsApp or by phone. No strings, and if you don't need software you'll be told straight.",
      "Then, in writing and fixed: what's included, the price and the timeline. No fine print and no charges that show up later.",
      "While it's being built you see it working, not as drawings, and you're shown how to use it until you're comfortable.",
      "At the end it's yours: your domain, your accounts, your data. If you ever want to take it elsewhere, you can.",
    ],
  },
  negContacto: { es: "Platiquemos", en: "Let's talk" },
  negContactoTexto: {
    es: "Manda un WhatsApp y platicamos sin compromiso. Y si prefieres verlo en persona, Ayotl está aquí en Sahuayo: se puede pasar a tu negocio.",
    en: "Send a WhatsApp and let's talk, no strings. And if you'd rather do it in person, Ayotl is right here in Sahuayo: a visit to your place can be arranged.",
  },
  negWhatsapp: { es: "Mandar un WhatsApp", en: "Send a WhatsApp" },

  // Programa Beta
  betaTitulo: { es: "Programa Beta", en: "Beta Program" },
  betaIntro: {
    es: "Antes de publicar una versión, la prueba un grupo pequeño de personas reales. Quien se apunta recibe un correo cuando hay algo que probar, con qué mirar, y responde contando qué se rompió. Sin compromiso: se sale cuando quiera.",
    en: "Before a release goes out, a small group of real people tries it first. If you sign up, you get an email when there's something to test, with what to look at, and you reply saying what broke. No commitment: leave whenever you want.",
  },
  betaQueRecibes: { es: "Qué recibes", en: "What you get" },
  betaVentajas: {
    es: [
      "Un mes de JLPTest completo, gratis, desde que te apuntas.",
      "Se paga por día y por cuántas apps usaste ese día: 5 pesos por una y 15 si usas las dos. Todo junto al final, por CoDi o transferencia.",
      "Acceso a las versiones nuevas antes de que salgan.",
      "Un canal directo para reportar fallos y proponer cosas.",
      "Tu nombre en los agradecimientos, si quieres.",
    ],
    en: [
      "A full month of JLPTest, free, from the day you sign up.",
      "Paid per day, by how many apps you used that day: 5 MXN for one and 15 if you use both. Paid at the end via CoDi or bank transfer.",
      "Access to new versions before they ship.",
      "A direct line for bugs and ideas.",
      "Your name in the credits, if you want.",
    ],
  },
  esperaTitulo: { es: "Por ahora ya no hay lugares", en: "No spots left for now" },
  esperaTexto: {
    es: "Esta ronda ya llegó al número de testers que hacía falta. Deja tu correo y te avisamos en cuanto se abra un lugar o empiece la siguiente.",
    en: "This round has already reached the number of testers needed. Leave your email and you'll hear as soon as a spot opens up or the next round starts.",
  },
  esperaEnviar: { es: "Avisarme", en: "Let me know" },
  esperaComentario: { es: "¿Qué app te interesa? (opcional)", en: "Which app are you interested in? (optional)" },
  esperaGraciasTitulo: { es: "Apuntado", en: "You're on the list" },
  esperaGraciasTexto: {
    es: "Te llegará un correo en cuanto haya un lugar o algo nuevo que probar. Tu correo no se usa para nada más.",
    en: "You'll get an email as soon as there's a spot or something new to test. Your email isn't used for anything else.",
  },
  betaPlazas: {
    es: (libres: number, cupo: number) => libres > 0
      ? `Quedan ${libres} de ${cupo} lugares.`
      : "Por ahora ya se alcanzó el número de testers que hacía falta.",
    en: (libres: number, cupo: number) => libres > 0
      ? `${libres} of ${cupo} spots left.`
      : "For now, the number of testers needed has been reached.",
  },
  campoNombre: { es: "Nombre", en: "Name" },
  campoEmail: { es: "Correo electrónico", en: "Email" },
  campoPlataforma: { es: "Dispositivo principal", en: "Main device" },
  campoApps: { es: "Apps que te interesan", en: "Apps you're interested in" },
  campoEmailGoogle: { es: "Correo de Google", en: "Google email" },
  campoEmailGoogleAyuda: {
    es: "La cuenta de Google con la que instalas apps. Úsala también para entrar a las apps: es como se cuentan tus días.",
    en: "The Google account you install apps with. Use it to sign in to the apps too: that's how your days are counted.",
  },
  campoTelefono: { es: "WhatsApp", en: "WhatsApp" },
  campoTelefonoOpcional: { es: "WhatsApp", en: "WhatsApp" },
  campoTelefonoAyuda: { es: "10 dígitos. Para el pago por CoDi.", en: "10 digits. For the CoDi payment." },
  campoTelefonoObligatorio: {
    es: "10 dígitos. Para el pago por CoDi y para los avisos de la prueba.",
    en: "10 digits. For the CoDi payment and for test notifications.",
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
    es: "Te llegará un correo en cuanto haya algo que probar. Tu mes de JLPTest ya está activo: entra con el mismo correo. Gracias por echar una mano.",
    en: "You'll get an email as soon as there's something to test. Your free month of JLPTest is already active: sign in with the same email. Thanks for helping out.",
  },
  errorGenerico: { es: "No se pudo enviar. Inténtalo de nuevo en un momento.", en: "Couldn't send. Please try again in a moment." },
  errorDatos: { es: "Revisa los campos marcados.", en: "Please check the highlighted fields." },
  errorMuchos: { es: "Demasiados intentos desde esta conexión. Prueba más tarde.", en: "Too many attempts from this connection. Try again later." },
  errorRobot: { es: "No se pudo verificar que eres una persona. Recarga la página e inténtalo otra vez.", en: "We couldn't verify you're a person. Reload the page and try again." },
  errorNoDisponible: { es: "El formulario no está disponible ahora mismo. Escribe a hola@ayotl.dev.", en: "The form isn't available right now. Write to hola@ayotl.dev." },
  errorTelefonoMercadito: {
    es: "Hace falta tu WhatsApp: es por donde llegan los avisos y el pago por CoDi.",
    en: "Your WhatsApp number is required: it's where notifications and the CoDi payment go.",
  },
  errorGoogleDaily: {
    es: "Hace falta una cuenta de Gmail: es con la que se acepta la prueba en Google Play. Ponla en «Correo de Google».",
    en: "A Gmail account is required: it's how you accept the test on Google Play. Put it in “Google email”.",
  },
  errorCorreoUsado: {
    es: "Ese correo ya está apuntado por otra persona. Si es tuyo y te apuntaste antes, usa el mismo correo de contacto de aquella vez.",
    en: "That email is already registered by someone else. If it's yours and you signed up before, use the same contact email you used then.",
  },
  errorLleno: { es: "Se acaban de llenar las plazas. Escribe a hola@ayotl.dev para quedar en la lista de espera.", en: "The spots just filled up. Write to hola@ayotl.dev to join the waiting list." },
  elegirUnaApp: { es: "Elige al menos una app.", en: "Pick at least one app." },

  // Enlace del tester
  miTitulo: { es: "Tu programa Beta", en: "Your Beta program" },
  miHola: { es: (nombre: string) => `Hola, ${nombre}`, en: (nombre: string) => `Hi, ${nombre}` },
  miDias: { es: "días con actividad", en: "days with activity" },
  miCompletos: { es: "con las dos apps", en: "with both apps" },
  miGanado: { es: "ganado", en: "earned" },
  miPagado: { es: "pagado", en: "paid" },
  miSaldo: { es: "por pagarte", en: "owed to you" },
  miComoSeCuenta: {
    es: (t1: number, t2: number) =>
      `Cada día cuenta según en cuántas apps hiciste algo: ${t1} pesos por una y ${t2} por las dos. Basta con un repaso en JLPTest o una partida en Daily Challenge.`,
    en: (t1: number, t2: number) =>
      `Each day counts by how many apps you used: ${t1} MXN for one and ${t2} for both. One review in JLPTest or one run in Daily Challenge is enough.`,
  },
  miHoy: { es: "Hoy", en: "Today" },
  miEnPlay: { es: "Aceptar en Play", en: "Accept on Play" },
  miPlayNota: {
    es: "Si todavía no aceptaste la prueba en Google Play, empieza por ahí: sin eso la app no se puede instalar y el día no cuenta.",
    en: "If you haven't accepted the test on Google Play yet, start there: without it the app can't be installed and the day won't count.",
  },
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
    es: "Puede que esté incompleto o que tu alta ya no exista. Pon el correo con el que te apuntaste y te llegará otra vez.",
    en: "It may be incomplete, or your signup may no longer exist. Enter the email you signed up with and it'll be sent again.",
  },
  miPedir: { es: "Enviarme el enlace", en: "Send me the link" },
  miPedido: {
    es: "Si ese correo está apuntado, el enlace ya va para allá. Revisa también el correo no deseado.",
    en: "If that email is registered, the link is on its way. Check your spam folder too.",
  },
  miGuarda: {
    es: "Guarda este enlace: con él ves tus días y lo que llevas ganado. También te llegó por correo.",
    en: "Keep this link: it shows your days and what you've earned. It's in your inbox too.",
  },
  miCopiar: { es: "Copiar", en: "Copy" },
  miCopiado: { es: "Copiado", en: "Copied" },

  // Acerca de
  acercaTitulo: { es: "Acerca de Ayotl", en: "About Ayotl" },
  acercaParrafos: {
    es: [
      "Ayotl (se dice «a-yotl») es «tortuga» en náhuatl. Es una de las raíces que se le atribuyen al nombre de Sahuayo, el pueblo de Michoacán donde nació el estudio: la lectura más repetida lo hace venir de «tzacuatlayotl», «vasija con forma de tortuga», de «tzacuatl» (vasija) y «ayotl» (tortuga). Hay otras versiones, como en casi toda etimología de pueblo; ésta es la que se quedó.",
      "El nombre dice bastante de cómo se trabaja aquí. Una tortuga no corre, pero llega; carga su casa encima y no necesita mucho más. Los proyectos de Ayotl son así: pequeños, autosuficientes, sin inversores ni prisa, hechos por una sola persona que los usa y los mantiene.",
      "Ayotl hace software desde Sahuayo para gente concreta: los negocios de la región, quienes estudian japonés y quienes quieren un reto de cinco minutos al día. Cada app tiene su propio dominio y su propia vida; Ayotl es el paraguas que las junta.",
    ],
    en: [
      "Ayotl (pronounced “ah-yotl”) is “turtle” in Nahuatl. It's one of the roots attributed to the name of Sahuayo, the town in Michoacán, Mexico, where the studio was born: the most repeated reading derives it from “tzacuatlayotl”, “turtle-shaped vessel”, from “tzacuatl” (vessel) and “ayotl” (turtle). There are other versions, as with almost every town etymology; this is the one that stuck.",
      "The name says a lot about how the work goes here. A turtle doesn't run, but it gets there; it carries its house on its back and doesn't need much else. Ayotl's projects are like that: small, self-sufficient, with no investors and no rush, built by one person who uses and maintains them.",
      "Ayotl builds software from Sahuayo for specific people: the region's businesses, people studying Japanese, and people who want a five-minute challenge every day. Each app has its own domain and its own life; Ayotl is the umbrella that brings them together.",
    ],
  },
  acercaQuienTitulo: { es: "Quién está detrás", en: "Who's behind it" },
  acercaQuienParrafos: {
    es: [
      "Detrás de Ayotl está Adrián Ceja Rentería, desarrollador de software: unos cinco años, los últimos tres en Salesforce —Industries/OmniStudio, Order Management, Financial Services Cloud— y antes en automatización con RPA. Ha pasado por IBM, Bluetab, xpd global y ahora Ness Digital Engineering.",
      "Estudia japonés y tiene el JLPT N3, que es de donde salió JLPTest; vive en Sahuayo, que es de donde salió Mercadito. Ayotl es lo que hace por su cuenta, fuera del trabajo.",
    ],
    en: [
      "Behind Ayotl is Adrián Ceja Rentería, a software developer: about five years, the last three in Salesforce — Industries/OmniStudio, Order Management, Financial Services Cloud — and before that in RPA automation. He has worked at IBM, Bluetab, xpd global and now Ness Digital Engineering.",
      "He studies Japanese and holds the JLPT N3, which is where JLPTest came from; he lives in Sahuayo, which is where Mercadito came from. Ayotl is what he does on his own, outside work.",
    ],
  },
  acercaDisponible: {
    es: "Abierto a proyectos de Salesforce e integraciones.",
    en: "Open to Salesforce and integration work.",
  },
  acercaStackTitulo: { es: "Cómo está hecho", en: "How it's built" },
  acercaStackTexto: {
    es: "Todo corre sobre la misma base: Next.js y TypeScript, desplegado en Railway con Docker, datos en Supabase (Postgres) y las apps de tienda como envoltorios de la web. El código está en GitHub y los comentarios, en español.",
    en: "Everything runs on the same foundation: Next.js and TypeScript, deployed on Railway with Docker, data in Supabase (Postgres), and the store apps as wrappers around the web. Code on GitHub, comments in Spanish.",
  },
  acercaContacto: { es: "Contacto", en: "Get in touch" },

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
