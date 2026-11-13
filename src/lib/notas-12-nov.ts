import type { Nota } from "./notas";

/**
 * Las tres notas del 12-nov-2026, el día en que Eventos (invitaciones con
 * confirmación, pases QR y control de entrada) salió como tercer módulo de
 * Mercadito. En su propio archivo para no alargar notas.ts.
 */
export const NOTAS_12_NOV: Nota[] = [
  {
    id: "una-fiesta-en-la-que-todo-sale-torcido",
    fecha: "2026-11-12",
    proyecto: "mercadito",
    titulo: {
      es: "Una fiesta en la que todo sale torcido",
      en: "A party where everything goes wrong",
    },
    entradilla: {
      es: "Eventos pasaba todas sus pruebas. Entonces escribimos otra que no recorre el camino derecho: dos teléfonos a la vez, la señal que se va, la invitada que cambia de idea. Encontró nueve fallos en una tarde.",
      en: "Eventos passed all its tests. Then we wrote another one that doesn't walk the happy path: two phones at once, the signal dropping, the guest who changes her mind. It found nine bugs in an afternoon.",
    },
    cuerpo: [
      { tipo: "p", texto: {
        es: "Eventos es el módulo nuevo de Mercadito: una invitación en una página, la lista de invitados con sus confirmaciones, un pase con código QR para quien dice que sí y un escáner para quien cuida la entrada. Tenía más de cien pruebas automáticas, todas en verde. El problema de esas pruebas es que las escribe quien escribió el código, y recorren lo que ya había imaginado.",
        en: "Eventos is Mercadito's new module: an invitation on a page, the guest list with its RSVPs, a QR pass for whoever says yes and a scanner for whoever watches the door. It had over a hundred automated tests, all green. The trouble with those tests is that they're written by whoever wrote the code, and they walk what that person had already imagined.",
      } },
      { tipo: "p", texto: {
        es: "Así que escribimos una distinta, con una sola regla: es una fiesta de punta a punta en la que casi todo sale torcido, el servidor nunca puede contestar con un error interno, nada se cuenta dos veces y al final las cuentas cuadran. La organizadora agrega invitados desde cuatro teléfonos a la vez. Una fecha dice 31 de febrero. El teléfono del portero se queda sin señal y reenvía la misma entrada cinco veces. Una tía dice que sí, luego que no, luego que quizá.",
        en: "So we wrote a different one, with a single rule: it's a party from end to end where almost everything goes wrong, the server may never answer with an internal error, nothing is counted twice and at the end the numbers add up. The host adds guests from four phones at once. A date says February 31st. The doorman's phone loses signal and resends the same entry five times. An aunt says yes, then no, then maybe.",
      } },
      { tipo: "p", texto: {
        es: "La primera corrida encontró nueve cosas. La lista tiene un tope de 50 invitaciones, y con cuatro teléfonos agregando a la vez quedaron 54: cada petición contaba cuántas había, veía que cabían y agregaba, sin saber de las otras tres. Lo mismo con las fotos: cinco subidas a la vez dejaron 15 donde caben 12. Una fecha imposible y un carácter nulo en un nombre tumbaban la petición entera. Y si el portero deshacía una «entrada sin pase» apuntada por error, esa persona se quedaba en la lista como confirmada que nunca entró.",
        en: "The first run found nine things. The list is capped at 50 invitations, and with four phones adding at once it ended up with 54: each request counted how many there were, saw there was room and added, unaware of the other three. Same with photos: five uploads at once left 15 where 12 fit. An impossible date and a null character in a name brought the whole request down. And if the doorman undid a walk-in entry logged by mistake, that person stayed on the list as confirmed but never arrived.",
      } },
      { tipo: "codigo", texto: `// Contar y agregar van juntos, de uno en uno por evento.
// El cerrojo dura lo que dura la transacción.
export async function enLista(q, evento) {
  await q("select pg_advisory_xact_lock(hashtext($1))", ["shotai:lista:" + evento]);
  const [f] = await q(
    "select count(*)::int as n from shotai.invitados where evento = $1 and origen <> 'puerta'",
    [evento],
  );
  return f.n;
}`, pie: {
        es: "El arreglo del tope: quien va a agregar toma primero un cerrojo del evento. Y quien llegó sin pase no cuenta como invitación.",
        en: "The fix for the cap: whoever is about to add takes a lock on the event first. And walk-ins don't count as invitations.",
      } },
      { tipo: "p", texto: {
        es: "Ninguno de los nueve era difícil de arreglar. Lo difícil era verlos: todos viven en el espacio entre dos peticiones, o en el dato que nadie escribiría a propósito. La prueba se quedó en el repositorio y corre con las demás. Hoy son tres suites, y la de tropiezos es la que más ha cambiado el código.",
        en: "None of the nine was hard to fix. What was hard was seeing them: they all live in the gap between two requests, or in the input nobody would type on purpose. The test stayed in the repository and runs with the rest. There are three suites now, and the chaos one is the one that has changed the code the most.",
      } },
    ],
  },
  {
    id: "la-puerta-que-entregaba-las-llaves",
    fecha: "2026-11-12",
    proyecto: "mercadito",
    titulo: {
      es: "La puerta que entregaba las llaves",
      en: "The door that handed out the keys",
    },
    entradilla: {
      es: "Para leer pases sin señal, el teléfono del portero recibía la llave personal de cada invitado. Nadie lo vio en el código ni en las pruebas: salió al describir el sistema, frase por frase, para alguien que no lo conoce.",
      en: "To read passes offline, the doorman's phone received every guest's personal key. Nobody saw it in the code or in the tests: it surfaced while describing the system, sentence by sentence, for someone who doesn't know it.",
    },
    cuerpo: [
      { tipo: "p", texto: {
        es: "En Eventos casi nadie tiene cuenta. El invitado contesta con un enlace personal que lleva una clave de 16 caracteres; quien cuida la entrada usa otro enlace, y su teléfono guarda la lista para seguir leyendo pases aunque el salón no tenga señal. Para reconocer un código QR sin preguntarle al servidor, ese teléfono necesita algo con qué compararlo. Le mandábamos la clave completa de cada invitado.",
        en: "In Eventos almost nobody has an account. A guest answers with a personal link carrying a 16-character key; whoever watches the door uses a different link, and their phone stores the list so it can keep reading passes even if the venue has no signal. To recognise a QR code without asking the server, that phone needs something to compare against. We were sending it each guest's full key.",
      } },
      { tipo: "p", texto: {
        es: "Con esa clave se abre la invitación de esa persona, se ve lo que escribió y se puede contestar por ella. Nuestro propio aviso de privacidad decía que quien cuida la entrada ve nombres, lugares y mesa, nunca teléfonos ni mensajes. La pantalla cumplía; lo que viajaba al teléfono, no.",
        en: "With that key you can open that person's invitation, see what they wrote and answer on their behalf. Our own privacy notice said that whoever watches the door sees names, seats and table, never phone numbers or messages. The screen complied; what travelled to the phone did not.",
      } },
      { tipo: "p", texto: {
        es: "No lo encontró una prueba ni una revisión de código. Lo encontró un ejercicio de escritura: describir todo lo que hace el módulo, con cada regla y cada número, para un lector que no ve el código ni la pantalla. Al llegar a «qué recibe el teléfono de la entrada» había que escribir la respuesta, y la respuesta no se podía escribir sin vergüenza.",
        en: "No test found it, and no code review. A writing exercise did: describing everything the module does, with every rule and every number, for a reader who sees neither the code nor the screen. On reaching \"what does the door phone receive\" the answer had to be written down, and it couldn't be written without embarrassment.",
      } },
      { tipo: "p", texto: {
        es: "El arreglo es chico. La entrada recibe ahora sólo los primeros 8 caracteres de cada clave: bastan para saber de quién es un pase y no para abrir su invitación. Del mismo repaso salió otro: «busca tu nombre» llevaba a la invitación de quien se escribiera, así que cualquiera con el enlace general podía ver el pase de otro. Ahora por nombre sólo se puede dar la primera respuesta, con palabras completas, y el resto pide el enlace personal.",
        en: "The fix is small. The door now receives only the first 8 characters of each key: enough to tell whose pass it is, not enough to open their invitation. The same pass over the text turned up another one: \"find your name\" led to the invitation of whoever was typed in, so anyone with the general link could see someone else's pass. Now a name only lets you give the first answer, with whole words, and everything else asks for the personal link.",
      } },
      { tipo: "p", texto: {
        es: "La descripción terminó en más de dieciséis mil palabras y encontró ocho fallos más. Es lento y no se parece a programar, pero obliga a contestar preguntas que el código deja pasar: quién ve qué, qué viaja a dónde, qué pasa después.",
        en: "The description ended up over sixteen thousand words long and found eight more bugs. It's slow and doesn't feel like programming, but it forces answers to questions the code lets slide: who sees what, what travels where, what happens afterwards.",
      } },
    ],
  },
  {
    id: "retirar-es-el-ultimo-recurso",
    fecha: "2026-11-12",
    proyecto: "mercadito",
    titulo: {
      es: "Retirar es el último recurso",
      en: "Taking it down is the last resort",
    },
    entradilla: {
      es: "La primera versión de la moderación de Eventos tenía un botón: retirar la invitación. Tumbar una boda una semana antes por una canción hace más daño que la falta. Y los textos legales prometían cosas que el código no cumplía.",
      en: "The first version of Eventos moderation had one button: take the invitation down. Killing a wedding a week before over a song does more harm than the offence. And the legal text promised things the code didn't do.",
    },
    cuerpo: [
      { tipo: "p", texto: {
        es: "Cualquiera puede reportar una invitación, y una persona lee cada reporte. Lo que esa persona podía hacer al principio era una sola cosa: retirarla. La revisión de diseño lo dijo sin rodeos: es desproporcionado. Ahora hay una escalera, y se sube según la gravedad: pedir que se corrija, quitar la música, quitar una foto, ocultar una sección y, al final, retirar.",
        en: "Anyone can report an invitation, and a person reads every report. At first that person could do exactly one thing: take it down. The design review put it bluntly: that's disproportionate. Now there's a ladder, climbed according to how serious it is: ask for a fix, remove the music, remove a photo, hide a section and, last, take it down.",
      } },
      { tipo: "lista", puntos: {
        es: [
          "Retirada, la invitación deja de verse, pero los pases y la entrada siguen sirviendo: nadie se queda fuera el día de la fiesta por un reporte. Sólo se apagan si el evento es un fraude.",
          "Quien organiza ve el motivo y dónde está la falta (la música, una foto concreta, una sección), corrige y pide revisión con un botón.",
          "Si un invitado pide que no guardemos su teléfono, se borra el teléfono, no al invitado, y ese número ya no se puede volver a apuntar en esa fiesta.",
          "El motivo que se le dice a quien organiza sale de una lista fija. Nunca es texto libre, para que no se cuele nada de quien reportó.",
        ],
        en: [
          "Once taken down, the invitation is no longer visible, but passes and the door keep working: nobody is left outside on the day because of a report. They're only switched off if the event is a fraud.",
          "The host sees the reason and where the problem is (the music, one specific photo, a section), fixes it and asks for a review with one button.",
          "If a guest asks us not to keep their phone number, the number is deleted, not the guest, and that number can't be added to that party again.",
          "The reason shown to the host comes from a fixed list. It's never free text, so nothing from whoever reported can slip through.",
        ],
      } },
      { tipo: "p", texto: {
        es: "La otra mitad del trabajo fue de redacción. El aviso de privacidad y los términos decían «siempre le avisamos», «quitamos lo que pida», «una huella que no deja leer el número». Ninguna era del todo cierta: el aviso al teléfono sólo llega si está encendido, no siempre se puede comprobar quién pide quitar un dato, y la huella de un teléfono se puede adivinar probando números si la clave vive junto a ella.",
        en: "The other half of the work was wording. The privacy notice and the terms said \"we always notify\", \"we remove whatever is asked\", \"a fingerprint that can't be read back\". None was quite true: the phone notification only arrives if it's switched on, it isn't always possible to check who is asking for data to be removed, and a phone number's fingerprint can be guessed by trying numbers if the key lives next to it.",
      } },
      { tipo: "p", texto: {
        es: "Se arregló por los dos lados. Donde se podía, el código subió hasta la frase: la huella ahora se calcula con una clave que no está en la base de datos, y nada se borra antes de 30 días desde que se avisó. Donde no, la frase bajó hasta el código: «se lo decimos en su panel», «si podemos comprobar que es esa persona». Y cada frase de esos apartados tiene una prueba automática que falla si deja de ser verdad.",
        en: "It was fixed from both sides. Where possible, the code rose to meet the sentence: the fingerprint is now computed with a key that isn't in the database, and nothing is deleted sooner than 30 days after the warning. Where not, the sentence came down to meet the code: \"we tell them in their panel\", \"if we can verify it's that person\". And every sentence in those sections has an automated test that fails if it stops being true.",
      } },
    ],
  },
];
