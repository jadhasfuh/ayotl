import type { Idioma } from "./idioma";

/**
 * Notas técnicas: problemas reales de los tres productos, contados por
 * quien los pagó. No son tutoriales ni «10 tips de Next.js»: cada una
 * existe porque algo se rompió en producción y costó una tarde entenderlo.
 *
 * El cuerpo se escribe como una lista de bloques para no meter Markdown ni
 * su intérprete: son unas pocas notas, no un blog.
 */
export type Bloque =
  | { tipo: "p"; texto: Record<Idioma, string> }
  | { tipo: "codigo"; texto: string; pie?: Record<Idioma, string> }
  | { tipo: "lista"; puntos: Record<Idioma, string[]> };

export type Nota = {
  id: string;
  fecha: string;                       // AAAA-MM-DD, la del hallazgo
  proyecto: "mercadito" | "jlptest" | "dailychallenge" | "ayotl" | "warzone";
  titulo: Record<Idioma, string>;
  entradilla: Record<Idioma, string>;
  cuerpo: Bloque[];
};

export const NOTAS: Nota[] = [
  {
    id: "mercadito-se-vuelve-gratuito",
    fecha: "2026-09-28",
    proyecto: "mercadito",
    titulo: {
      es: "Mercadito se vuelve gratuito: un piloto de investigación",
      en: "Mercadito goes free: a research pilot",
    },
    entradilla: {
      es: "El canal informal le ganó al formal, y el producto se rediseñó alrededor de eso. Lo que faltaba era medirlo: un contador dice cuántos, nunca cuándo, y eso no se puede recuperar después.",
      en: "The informal channel beat the formal one, and the product was redesigned around it. What was missing was measuring it: a counter tells you how many, never when — and that can't be recovered later.",
    },
    cuerpo: [
      { tipo: "p", texto: {
        es: "Mercadito empezó como un marketplace con reparto y comisión del 5 al 8 %. El 24 de agosto de 2026 dejó de operar entregas y se quedó como menús digitales, mesas y reservas, con el pedido saliendo al WhatsApp del negocio. No fue un fracaso técnico: fue que el canal informal ganó tan claramente que lo sensato era rediseñar el producto alrededor de él, en vez de seguir peleándole.",
        en: "Mercadito started as a delivery marketplace with a 5–8 % commission. On 24 August 2026 it stopped running deliveries and became digital menus, tables and bookings, with the order going out to the business's own WhatsApp. It wasn't a technical failure: the informal channel won so clearly that the sensible move was to redesign the product around it instead of fighting it.",
      } },
      { tipo: "p", texto: {
        es: "El código de la comisión no se borró: sigue en el repositorio, apagado tras una bandera. Un modelo que se recorrió y se abandonó, con su fecha y su hash, vale más que cualquier afirmación sobre él — y si se borra, se borra la prueba.",
        en: "The commission code wasn't deleted: it's still in the repo, switched off behind a flag. A model you adopted, operated and abandoned, with its date and its hash, is worth more than any claim about it — and deleting it deletes the evidence.",
      } },
      { tipo: "p", texto: {
        es: "Lo que no había era medición. El menú tenía dos contadores, `menu_vistas` y `menu_pedidos`, acumulados desde siempre. Dicen cuántos y no dicen nada más: ni a qué hora entra el trabajo, ni si quien abre la carta llega a pedir, ni si el pedido que salió a WhatsApp terminó en venta. Y un acumulado no se puede des-agregar después: cada día que pasaba era un día de serie perdido para siempre.",
        en: "What was missing was measurement. The menu had two counters, `menu_vistas` and `menu_pedidos`, cumulative since day one. They say how many and nothing else: not when the work comes in, not whether someone who opens the menu ends up ordering, not whether an order that left for WhatsApp became a sale. And a running total can't be un-aggregated later: every day that passed was a day of series lost for good.",
      } },
      { tipo: "p", texto: {
        es: "Desde el 28 de septiembre de 2026 hay una fila por cada apertura de carta y por cada pedido: con su marca de tiempo, de dónde llegó, una sesión aleatoria que vive 24 horas y la banda del monto. La tabla es de sólo altas, y lo impone la base de datos, no la costumbre: un registro que se puede reescribir no sirve para investigar.",
        en: "Since 28 September 2026 there's one row per menu open and per order: with its timestamp, where it came from, a random session that lives 24 hours, and the amount band. The table is append-only, and the database enforces it rather than convention: a record you can rewrite is no use for research.",
      } },
      { tipo: "codigo", texto: `-- Append-only con una sola puerta: el negocio puede contestar
-- "¿este pedido sí te llegó?", y nada más.
IF OLD.confirmado IS NOT NULL THEN
  RAISE EXCEPTION 'esta confirmación ya se respondió y no se cambia';
END IF;
IF (NEW.id, NEW.created_at, NEW.puesto_id, NEW.tipo, NEW.session_id,
    NEW.origen, NEW.monto_estimado_rango, NEW.items)
   IS DISTINCT FROM
   (OLD.id, OLD.created_at, OLD.puesto_id, OLD.tipo, OLD.session_id,
    OLD.origen, OLD.monto_estimado_rango, OLD.items) THEN
  RAISE EXCEPTION 'de menu_eventos sólo se escribe la confirmación del negocio';
END IF;`, pie: {
        es: "Sin esa confirmación, el contador de pedidos cuenta intenciones y las llama ventas.",
        en: "Without that confirmation, the order counter counts intentions and calls them sales.",
      } },
      { tipo: "p", texto: {
        es: "El dato personal no se anonimiza después: no se captura. Eso no es una postura, es una decisión de esquema, y se nota en las columnas que no existen:",
        en: "Personal data isn't anonymised afterwards: it isn't captured. That's not a stance, it's a schema decision, and it shows in the columns that don't exist:",
      } },
      { tipo: "lista", puntos: {
        es: [
          "Banda de monto («de $101 a $200»), nunca el ticket: para modelar demanda alcanza, y no dice cuánto factura nadie.",
          "Colonia, nunca la dirección. Franja del día, nunca la hora del cliente.",
          "Ni nombre, ni teléfono, ni el texto que el cliente escriba: sólo productos y cantidades.",
          "La sesión es aleatoria, caduca sola en 24 horas y no se liga a ninguna cuenta aunque exista.",
        ],
        en: [
          "Amount band (“$101 to $200”), never the ticket: enough to model demand, and it doesn't say what anyone bills.",
          "Neighbourhood, never the street address. Time-of-day band, never the customer's clock time.",
          "No name, no phone, no free text from the customer: just products and quantities.",
          "The session id is random, expires by itself in 24 hours and is never linked to an account, even when one exists.",
        ],
      } },
      { tipo: "p", texto: {
        es: "Y por eso Mercadito es gratuito hasta octubre de 2027. No es una promoción: el acceso libre es lo que maximiza cuántos negocios cargan su carta, que es de donde sale el dato. Tampoco se está regalando un ingreso que existiera — la plataforma tenía 60 negocios activos y un solo pedido en toda su historia. Los negocios lo saben: hay una página que lo explica y quien no quiera participar queda fuera escribiendo un correo, sin perder nada.",
        en: "That's why Mercadito is free until October 2027. It isn't a promotion: open access is what maximises how many businesses load their menu, which is where the data comes from. Nor is it giving up revenue that existed — the platform had 60 active businesses and a single order in its whole history. The businesses know: there's a page explaining it, and anyone who'd rather not take part is excluded by sending an email, losing nothing.",
      } },
      { tipo: "p", texto: {
        es: "El estudio mira a Japón, y conviene decir con cuidado por qué. Japón no resolvió la digitalización de su comercio chico: tiene sus propias calles de cortinas bajadas, y sus pymes van tarde en transformación digital. Lo que sí tiene, y no tiene nadie más, es la respuesta institucional más sistemática que existe — programas de revitalización de calles comerciales, subsidios para adoptar herramientas digitales, un programa nacional de productividad. Se estudia por sus aciertos y por sus fracasos, que es la única forma en que un caso ajeno sirve para algo.",
        en: "The study looks at Japan, and it's worth being careful about why. Japan hasn't solved small-retail digitalisation: it has its own shuttered shopping streets, and its SMEs lag on digital transformation. What it does have, and nobody else does, is the most systematic policy response in existence — shopping-street revitalisation programmes, subsidies for adopting digital tools, a national SME productivity programme. It's studied for its successes and its failures, which is the only way somebody else's case is any use.",
      } },
    ],
  },
  {
    id: "el-cliente-nunca-manda-un-numero",
    fecha: "2026-09-11",
    proyecto: "dailychallenge",
    titulo: {
      es: "El cliente nunca manda un número",
      en: "The client never sends a number",
    },
    entradilla: {
      es: "Un juego con tabla de puntuaciones en el navegador es un formulario abierto a quien sepa abrir la consola. La salida no fue ofuscar: fue dejar de creerle al cliente.",
      en: "A browser game with a leaderboard is an open form for anyone who can open the console. The fix wasn't obfuscation: it was to stop believing the client.",
    },
    cuerpo: [
      { tipo: "p", texto: {
        es: "Daily Challenge publica un reto distinto cada día y un top 10 a medianoche. Si el navegador mandara «hice 24 680 puntos», cualquiera cambiaría ese número en dos segundos, y una tabla que se puede falsear no vale nada: el juego entero deja de tener sentido.",
        en: "Daily Challenge posts a different challenge every day and a top 10 at midnight. If the browser sent “I scored 24,680”, anyone could change that number in two seconds, and a leaderboard you can fake is worthless: the whole game stops making sense.",
      } },
      { tipo: "p", texto: {
        es: "Lo que sube el navegador no es el puntaje, es el registro de teclas: qué se pulsó y en qué tick. El servidor vuelve a correr la partida con ese registro y calcula el puntaje él mismo. Para que eso funcione, la simulación tiene que ser determinista: física en enteros, nada de números al azar sin semilla, y el mismo código corriendo en los dos lados.",
        en: "What the browser uploads isn't the score, it's the input log: which key was pressed on which tick. The server replays the run from that log and computes the score itself. For that to work the simulation has to be deterministic: integer physics, no unseeded randomness, and the same code running on both sides.",
      } },
      { tipo: "codigo", texto: `// public/arcade/verify.js — el mismo módulo que usa el navegador
export function verify(juego, mapa, semilla, log) {
  const estado = crear(juego, mapa, semilla);   // misma semilla, mismo mundo
  for (const tick of log) avanzar(estado, tick);
  return estado.puntaje;                        // esto es lo que vale
}`, pie: {
        es: "El endpoint /api/score corre esto y guarda su resultado, no el del jugador.",
        en: "The /api/score endpoint runs this and stores its result, not the player's.",
      } },
      { tipo: "p", texto: {
        es: "El determinismo no se cuida solo, así que hay una prueba que lo vigila: un bot aleatorio juega los veinticuatro minijuegos y comprueba que reproducir el registro da exactamente el mismo puntaje. Si alguien mete un `Math.random()` suelto o una física con decimales, la prueba se cae antes de llegar a producción.",
        en: "Determinism doesn't keep itself, so a test watches it: a random bot plays all twenty-four mini-games and checks that replaying the log yields exactly the same score. If someone slips in a loose Math.random() or floating-point physics, the test fails before it ships.",
      } },
      { tipo: "p", texto: {
        es: "La misma idea sirvió para dos cosas más. La cámara fantasma —ver la partida de otro mientras esperas— no manda vídeo: manda los mismos inputs por un canal en tiempo real y cada espectador re-simula. Y el versus se juega en lockstep: el anfitrión reparte los inputs de todos cada seis ticks, así que nadie diverge, y al final el servidor re-simula la partida conjunta. Un solo mecanismo bien hecho pagó tres funciones.",
        en: "The same idea paid for two more things. The ghost camera — watching someone else's run while you wait — doesn't stream video: it broadcasts the same inputs over a realtime channel and each viewer re-simulates. And versus runs in lockstep: the host hands out everyone's inputs every six ticks, so nobody diverges, and at the end the server replays the joint match. One mechanism, done properly, paid for three features.",
      } },
    ],
  },
  {
    id: "las-variables-que-se-hornean",
    fecha: "2026-08-30",
    proyecto: "jlptest",
    titulo: {
      es: "Las variables que se hornean en el build",
      en: "The variables that get baked into the build",
    },
    entradilla: {
      es: "Tres veces se desplegó una app que arrancaba perfecta y donde nadie podía iniciar sesión. Siempre por lo mismo, y nunca lo pareció.",
      en: "Three times a deploy came up perfectly healthy and nobody could sign in. Always the same cause, and it never looked like it.",
    },
    cuerpo: [
      { tipo: "p", texto: {
        es: "En Next, una variable con prefijo NEXT_PUBLIC_ no se lee al arrancar: se sustituye por su valor mientras se compila. Si el build no la ve, lo que queda dentro del paquete del navegador es literalmente `undefined`, para siempre, hasta el siguiente build.",
        en: "In Next, a NEXT_PUBLIC_ variable isn't read at startup: it's substituted for its value while compiling. If the build can't see it, what ends up inside the browser bundle is literally `undefined`, forever, until the next build.",
      } },
      { tipo: "p", texto: {
        es: "Y el build corría dentro de Docker, que por defecto no hereda las variables del panel de Railway. El resultado fue una app que pasaba todas las comprobaciones de salud —el contenedor arranca, el servidor responde, las páginas se pintan— y que por dentro estaba rota en tres sitios distintos:",
        en: "And the build ran inside Docker, which doesn't inherit the platform's variables by default. The result was an app that passed every health check — container starts, server answers, pages render — and was broken in three different places:",
      } },
      { tipo: "lista", puntos: {
        es: [
          "el sitemap salió apuntando a localhost, y así lo recogió el buscador;",
          "el muro de pago no se podía cerrar, porque el cliente de pagos nacía sin token;",
          "y el login no funcionaba: el cliente de Supabase era null, sin un solo error en los registros.",
        ],
        en: [
          "the sitemap pointed at localhost, and that's what the search engine picked up;",
          "the paywall couldn't be dismissed, because the payments client was born without a token;",
          "and login didn't work: the Supabase client was null, with not one error in the logs.",
        ],
      } },
      { tipo: "p", texto: {
        es: "El arreglo evidente es declarar cada variable como ARG en el Dockerfile. Funciona, pero deja el mismo cepo puesto para el siguiente que añada una. Así que la app dejó de depender de eso: lo que el navegador necesita se lee en el servidor, ya en marcha, y baja como props.",
        en: "The obvious fix is declaring each variable as an ARG in the Dockerfile. It works, but it leaves the same trap set for whoever adds the next one. So the app stopped depending on that: whatever the browser needs is read on the server, at runtime, and handed down as props.",
      } },
      { tipo: "codigo", texto: `// Sólo la llave pública viaja, y viaja en el HTML, no en el paquete.
export function configurarSupabase(url?: string | null, key?: string | null) {
  if (!url || !key || configurado) return;
  configurado = { url, key };
  clienteNavegador = undefined;   // que se cree de nuevo con lo bueno
}` },
      { tipo: "p", texto: {
        es: "La regla que quedó: si cambiar una variable obliga a reconstruir la imagen, esa variable está en el lugar equivocado. Y la de seguridad que va con ella: una llave secreta jamás lleva ese prefijo, y los módulos que la usan importan `server-only`, para que colarla sea un error de compilación y no un incidente.",
        en: "The rule that stuck: if changing a variable forces an image rebuild, that variable is in the wrong place. And the security rule beside it: a secret key never carries that prefix, and the modules that use it import `server-only`, so leaking it is a compile error instead of an incident.",
      } },
    ],
  },
  {
    id: "el-cron-que-decia-succeeded",
    fecha: "2026-09-06",
    proyecto: "jlptest",
    titulo: {
      es: "El cron que decía «succeeded» mintiendo",
      en: "The cron that said “succeeded” while lying",
    },
    entradilla: {
      es: "La tarea diaria llevaba una semana en verde y sin publicar nada. La tabla que todo el mundo consulta no dice lo que parece decir.",
      en: "The daily job had been green for a week and had published nothing. The table everyone checks doesn't say what it looks like it says.",
    },
    cuerpo: [
      { tipo: "p", texto: {
        es: "Los tres productos hacen sus tareas periódicas dentro de Postgres, con pg_cron y pg_net: nada de un servidor de crones aparte que haya que vigilar y pagar. La tarea llama por HTTP a un endpoint del propio sitio, con un secreto en la cabecera.",
        en: "All three products run their periodic jobs inside Postgres, with pg_cron and pg_net: no separate cron server to babysit and pay for. The job calls one of the site's own endpoints over HTTP, with a secret in the header.",
      } },
      { tipo: "p", texto: {
        es: "Cuando la publicación diaria dejó de salir, lo primero fue mirar el historial del cron. Todo `succeeded`, un día tras otro. Y era verdad, sólo que no la verdad que uno busca: `net.http_post` es asíncrono y lo único que reporta es que la petición se encoló. Que la API contestara 500 es otra conversación, y está en otra tabla.",
        en: "When the daily post stopped going out, the first thing to check was the cron history. All `succeeded`, day after day. And it was true, just not the truth you're looking for: `net.http_post` is asynchronous, and all it reports is that the request was queued. Whether the API answered 500 is a different conversation, in a different table.",
      } },
      { tipo: "codigo", texto: `-- Esto miente para lo que quieres saber:
select status, return_message from cron.job_run_details order by start_time desc;

-- Esto es lo que contestó de verdad:
select id, status_code, content from net._http_response order by id desc limit 5;` },
      { tipo: "p", texto: {
        es: "La segunda trampa del mismo día: los crones corren en UTC. Un guardia de «una vez al día» que compare fechas en UTC se salta un día entero cuando tu zona va por detrás, y al revés publica dos veces. Todas las comparaciones de fecha se hacen ahora en la zona de México, explícitamente, aunque el servidor viva en otra.",
        en: "The same day's second trap: crons run in UTC. A “once a day” guard comparing dates in UTC skips a whole day when your zone runs behind, and double-posts the other way. Every date comparison is now done explicitly in Mexico time, even though the server lives somewhere else.",
      } },
      { tipo: "p", texto: {
        es: "Y la tercera, de seguridad: el secreto no va escrito en el comando del cron. `cron.job` guarda el comando entero y lo lee cualquiera que entre a la base, así que el secreto vive en Vault y el comando lo saca de ahí al vuelo.",
        en: "And the third, a security one: the secret isn't written into the cron command. `cron.job` stores the whole command and anyone with database access can read it, so the secret lives in Vault and the command pulls it at run time.",
      } },
    ],
  },
  {
    id: "ipv6-y-el-pooler",
    fecha: "2026-09-22",
    proyecto: "ayotl",
    titulo: {
      es: "«Timeout expired», o por qué la base no se dejaba alcanzar",
      en: "“Timeout expired”, or why the database refused to be reached",
    },
    entradilla: {
      es: "La cadena de conexión que copia todo el mundo del panel funciona desde tu portátil y no desde tu servidor. La diferencia no está en la contraseña.",
      en: "The connection string everyone copies from the dashboard works from your laptop and not from your server. The difference isn't the password.",
    },
    cuerpo: [
      { tipo: "p", texto: {
        es: "Para contar los días de prueba de cada tester, el sitio de la marca tenía que leer la base de otro de los productos, que vive en un proyecto de Supabase distinto. Se copió la cadena que da el panel, se puso en el servidor y la respuesta fue siempre la misma: `conexión: timeout expired`. Ni «contraseña incorrecta» ni «no existe el host»; silencio hasta agotar el tiempo.",
        en: "To count each tester's active days, the brand site had to read another product's database, living in a different Supabase project. The dashboard's connection string went into the server, and the answer was always the same: `connection: timeout expired`. Not “wrong password”, not “no such host”; silence until the clock ran out.",
      } },
      { tipo: "codigo", texto: `$ dig +short A  db.xxxxxxxx.supabase.co     # nada
$ dig +short AAAA db.xxxxxxxx.supabase.co   # 2600:1f14:131e:...
$ dig +short A  aws-1-us-west-2.pooler.supabase.com
44.252.246.120  44.225.139.66  34.215.156.231`, pie: {
        es: "La conexión directa sólo existe en IPv6; el pooler tiene IPv4.",
        en: "The direct connection only exists over IPv6; the pooler has IPv4.",
      } },
      { tipo: "p", texto: {
        es: "Desde un portátil con IPv6 funciona y uno concluye que la cadena es buena. Desde una plataforma que sale por IPv4, no resuelve y se queda esperando. La solución es usar el session pooler, que cambia el usuario y el host pero no la contraseña. Media tarde por un registro DNS que nadie enseña.",
        en: "From a laptop with IPv6 it works, and you conclude the string is fine. From a platform that egresses over IPv4 it doesn't resolve and just hangs. The fix is the session pooler, which changes the user and the host but not the password. Half an afternoon over a DNS record nobody shows you.",
      } },
      { tipo: "p", texto: {
        es: "Por el camino apareció algo peor y silencioso: el cliente de Postgres emite un evento `error` cuando el handshake falla, y sin nadie escuchándolo Node lo convierte en excepción no capturada y **se lleva el proceso por delante**. El contenedor moría y el proxy devolvía un 502 genérico, que no dice nada del error real. Dos líneas lo arreglan, y la lección es más general: en una integración nueva, lo primero que se escribe no es la consulta, es el manejo del fallo.",
        en: "Along the way something worse and quieter showed up: the Postgres client emits an `error` event when the handshake fails, and with nobody listening Node turns it into an uncaught exception that **takes the process down**. The container died and the proxy returned a generic 502, which says nothing about the real error. Two lines fix it, and the lesson is broader: in a new integration, the first thing you write isn't the query, it's the failure handling.",
      } },
      { tipo: "p", texto: {
        es: "Y un hallazgo de regalo: al probar la otra vía, la API REST de ese proyecto llevaba meses caída («could not query the database for the schema cache») y nadie se había enterado, porque esa app se conecta por Postgres directo y nunca la usa. Una integración nueva es también una auditoría gratis de lo que creías sano.",
        en: "And a bonus finding: while testing the other route, that project's REST API had been down for months (“could not query the database for the schema cache”) and nobody had noticed, because that app connects over plain Postgres and never uses it. A new integration is also a free audit of what you assumed was healthy.",
      } },
    ],
  },
  {
    id: "la-api-de-youtube",
    fecha: "2026-10-07",
    proyecto: "ayotl",
    titulo: {
      es: "Subir un vídeo por la API de YouTube: tres trampas en una tarde",
      en: "Uploading a video through the YouTube API: three traps in one afternoon",
    },
    entradilla: {
      es: "Un «argumento inválido» que no dice cuál, un permiso que deja subir pero no corregir, y una edición que apaga en silencio lo que no le mandaste.",
      en: "An “invalid argument” that won't say which one, a permission that lets you upload but not fix, and an edit that silently switches off whatever you didn't send.",
    },
    cuerpo: [
      { tipo: "p", texto: {
        es: "Los retos de código de este sitio salen también en YouTube: un vídeo largo y un Short por día, subidos y programados por un script. La primera subida, con título, descripción, etiquetas, idioma, «no es para niños» y fecha de publicación, volvió con esto:",
        en: "This site's code challenges also go out on YouTube: one long video and one Short a day, uploaded and scheduled by a script. The first upload, with title, description, tags, language, “not made for kids” and a publish date, came back with this:",
      } },
      { tipo: "codigo", texto: `HttpError 400: Request contains an invalid argument.
reason: INVALID_REQUEST_METADATA`, pie: {
        es: "Ni el campo ni el motivo. Y cada subida cuesta 1 600 de las 10 000 unidades diarias.",
        en: "Neither the field nor the reason. And every upload costs 1,600 of the 10,000 daily units.",
      } },
      { tipo: "p", texto: {
        es: "Con seis subidas al día no se puede ir probando a ciegas. Lo que funcionó fue cambiar de estrategia: subir el vídeo con lo mínimo (título, descripción, categoría, privado) y añadir el resto después con `videos.update`, que cuesta 50. Así se podía probar campo por campo. Y ahí vino la sorpresa: los cuatro campos pasaron, uno a uno y todos juntos. Lo que la subida rechaza, la edición lo acepta. Desde entonces el script sube en dos pasos.",
        en: "With six uploads a day you can't test blindly. What worked was changing strategy: upload the video with the bare minimum (title, description, category, private) and add the rest afterwards with `videos.update`, which costs 50. That made it possible to test field by field. And the surprise: all four fields went through, one by one and all together. What the upload rejects, the edit accepts. Since then the script uploads in two steps.",
      } },
      { tipo: "p", texto: {
        es: "La segunda trampa salió al intentar esa edición: `403 insufficient permissions`. El permiso que uno pide para subir vídeos, `youtube.upload`, deja subir y nada más: ni corregir un título ni cambiar la fecha. Hace falta el permiso completo, `youtube`, y volver a autorizar.",
        en: "The second trap appeared on that very edit: `403 insufficient permissions`. The scope you ask for to upload videos, `youtube.upload`, lets you upload and nothing else: not fix a title, not change the date. You need the full `youtube` scope, and to authorize again.",
      } },
      { tipo: "p", texto: {
        es: "La tercera es la más traicionera, porque no da error. Para programar el vídeo se mandó sólo la parte que importaba del `status`: privado, fecha y «no es para niños». Respuesta: 200. Pero `update` **reemplaza el objeto entero**, y lo que no va en él vuelve a su valor por omisión. El vídeo quedó con `embeddable: false`, o sea que el reproductor incrustado en la página del reto habría dicho «vídeo no disponible» el día del estreno. Ahora el script manda siempre el `status` completo.",
        en: "The third is the most treacherous, because it doesn't fail. To schedule the video, only the relevant part of `status` was sent: private, date and “not made for kids”. Response: 200. But `update` **replaces the whole object**, and whatever isn't in it goes back to its default. The video ended up with `embeddable: false`, meaning the player embedded on the challenge page would have said “video unavailable” on launch day. The script now always sends the full `status`.",
      } },
      { tipo: "p", texto: {
        es: "Y una buena noticia que la documentación no deja clara: aunque el proyecto no haya pasado la auditoría de la API, un vídeo subido como privado con fecha de publicación se publica solo a su hora. La auditoría hace falta para subir más de seis vídeos al día, no para publicarlos.",
        en: "And some good news the documentation doesn't make clear: even if the project hasn't passed the API audit, a video uploaded as private with a publish date goes public on its own at that time. The audit is needed to upload more than six videos a day, not to publish them.",
      } },
    ],
  },
  {
    id: "pixeles-gordos-en-android",
    fecha: "2026-10-09",
    proyecto: "warzone",
    titulo: {
      es: "War Zone: píxeles gordos que llegan nítidos al teléfono",
      en: "War Zone: fat pixels that reach the phone crisp",
    },
    entradilla: {
      es: "Un juego dibujado a 320 por 180 con la paleta del Atari 2600, y el icono salía borroso en Android. No era el dibujo: eran tres reescalados que nadie pidió.",
      en: "A game drawn at 320 by 180 with the Atari 2600 palette, and the icon came out blurry on Android. It wasn't the drawing: it was three rescalings nobody asked for.",
    },
    cuerpo: [
      { tipo: "p", texto: {
        es: "War Zone es artillería por turnos con monigotes: un lienzo de 320 por 180, la paleta de 128 colores del chip de vídeo del 2600, una fuente de 3 por 5 y una calavera de 13 por 13 píxeles como logo. Todo se dibuja con rectángulos, sin un solo PNG, y el canvas se escala con `image-rendering: pixelated`. En el navegador, impecable. En el teléfono, la primera queja fue «el logo al iniciar no tiene mucha calidad».",
        en: "War Zone is turn-based artillery with stick figures: a 320 by 180 canvas, the 128-colour palette of the 2600's video chip, a 3 by 5 font and a 13 by 13 pixel skull as the logo. Everything is drawn with rectangles, not a single PNG, and the canvas is scaled with `image-rendering: pixelated`. In the browser, flawless. On the phone, the first complaint was “the logo at launch doesn't look very sharp”.",
      } },
      { tipo: "p", texto: {
        es: "El icono y la pantalla de arranque no los dibuja el juego: los genera una herramienta a partir de un PNG de 1024 píxeles, reescalándolo a cada densidad de Android con un filtro Lanczos. Es lo correcto para una foto y lo peor para una calavera de 13 celdas: cada borde se vuelve un degradado de dos o tres píxeles. Luego Android 12 toma el icono adaptable, pensado para 108 dp, y lo pinta a 240 dp en la pantalla de arranque con filtro bilineal: un segundo reescalado, hacia arriba, de 2,2 veces. Y por el camino el icono adaptable recorta un 16,7 % por lado para la máscara. Tres transformaciones, ninguna entera.",
        en: "The game doesn't draw the icon or the launch screen: a tool generates them from a 1024-pixel PNG, rescaling it to every Android density with a Lanczos filter. That's right for a photo and the worst thing for a 13-cell skull: every edge becomes a two- or three-pixel gradient. Then Android 12 takes the adaptive icon, meant for 108 dp, and paints it at 240 dp on the launch screen with bilinear filtering: a second rescale, upwards, by 2.2. And along the way the adaptive icon crops 16.7 % per side for the mask. Three transforms, none of them whole.",
      } },
      { tipo: "codigo", texto: `// celda de un número entero de píxeles, para que la calavera
// quepa en el círculo visible de cada recurso
const celdaEnCirculo = (diametro, aire = 0.92) =>
  Math.max(1, Math.floor(diametro / 2 / radio * aire));

for (const [d, k] of Object.entries({ mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 })) {
  const fg = Math.round(108 * k), sp = Math.round(288 * k);
  escribir(\`mipmap-\${d}/ic_launcher_foreground.png\`, calavera(fg, celdaEnCirculo(fg)));
  escribir(\`mipmap-\${d}/splash_icono_fg.png\`, calavera(sp, celdaEnCirculo(sp * 2 / 3)));
}`, pie: {
        es: "Cada recurso se dibuja a su tamaño exacto. No se reescala nada, nunca.",
        en: "Every resource is drawn at its exact size. Nothing gets rescaled, ever.",
      } },
      { tipo: "p", texto: {
        es: "La pantalla de arranque de Android 12 admite un icono propio (`windowSplashScreenAnimatedIcon`), así que se le da uno de 288 dp con la calavera dentro del círculo visible de 192 dp, en vez de dejar que agrande el del lanzador. Y el fondo de la ventana mientras carga el WebView, que como PNG se estiraba a la pantalla, pasa a ser un `layer-list`: color plano y el mismo bitmap centrado, sin escalar. Se comprobó con capturas por `adb` nada más lanzar la app, con dos trampas de regalo: con la pantalla apagada las capturas salen negras, y la del arranque sale girada, porque el sistema la dibuja en vertical aunque el juego sea apaisado.",
        en: "Android 12's launch screen accepts its own icon (`windowSplashScreenAnimatedIcon`), so it gets a 288 dp one with the skull inside the visible 192 dp circle, instead of letting it enlarge the launcher's. And the window background while the WebView loads, which as a PNG was stretched to the screen, becomes a `layer-list`: flat colour and the same bitmap centred, unscaled. It was verified with `adb` screenshots right after launching the app, with two free traps: with the screen off the captures come out black, and the launch one comes out rotated, because the system draws it portrait even though the game is landscape.",
      } },
      { tipo: "p", texto: {
        es: "Lo mismo que limita al 2600 es lo que le da el estilo, y el juego lo usa a propósito:",
        en: "What limits the 2600 is what gives it its look, and the game uses it on purpose:",
      } },
      { tipo: "lista", puntos: {
        es: [
          "Cambiar el color entre línea y línea era gratis y un degradado horizontal, imposible: por eso los cielos a bandas.",
          "Dos sprites de 8 píxeles por línea, de un solo color; más que eso, parpadeo. Los fondos van en bloques de 4 por 2, el «playfield» de 40 columnas.",
          "Animar era apuntar a otra tabla de bytes: el monigote tiene un cuadro por pose, de 7 por 10, y se espeja para mirar al otro lado.",
          "Un sprite azul sobre un cielo azul no se ve. La consola no tenía contorno; el juego sí: un halo negro de un píxel alrededor de cada monigote.",
        ],
        en: [
          "Changing the colour between scanlines was free and a horizontal gradient impossible: hence the banded skies.",
          "Two 8-pixel sprites per line, one colour each; more than that, flicker. Backgrounds go in 4 by 2 blocks, the 40-column “playfield”.",
          "Animating meant pointing at another table of bytes: the stick figure has one frame per pose, 7 by 10, mirrored to face the other way.",
          "A blue sprite over a blue sky can't be seen. The console had no outlines; the game does: a one-pixel black halo around every figure.",
        ],
      } },
      { tipo: "p", texto: {
        es: "Y el ojo chueco. Con todo ya nítido, el logo seguía raro: la cuenca derecha de la calavera iba corrida un píxel desde el primer día. A 5 píxeles no se nota; a 50, en la pantalla de arranque, sí, y lo vio Adrián nada más verla grande. La nitidez también sirve para eso: para que los errores se vean.",
        en: "And the crooked eye. With everything sharp at last, the logo still looked off: the skull's right socket had been shifted one pixel since day one. At 5 pixels it doesn't show; at 50, on the launch screen, it does, and Adrián spotted it the moment he saw it big. Sharpness is good for that too: it lets the mistakes show.",
      } },
      { tipo: "p", texto: {
        es: "War Zone se juega en dailychallenge.click/warzone y está entrando a Google Play en prueba cerrada.",
        en: "War Zone is playable at dailychallenge.click/warzone and is entering Google Play as a closed test.",
      } },
    ],
  },
];

export function notaPorId(id: string): Nota | undefined {
  return NOTAS.find((n) => n.id === id);
}
