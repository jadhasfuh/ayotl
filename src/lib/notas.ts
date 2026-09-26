import type { Idioma } from "./idioma";

/**
 * Notas técnicas: problemas reales de los tres productos, contados por
 * quien los pagó. No son tutoriales ni «10 tips de Next.js»: cada una
 * existe porque algo se rompió en producción y costó una tarde entenderlo.
 *
 * El cuerpo se escribe como una lista de bloques para no meter Markdown ni
 * su intérprete: son cuatro notas, no un blog.
 */
export type Bloque =
  | { tipo: "p"; texto: Record<Idioma, string> }
  | { tipo: "codigo"; texto: string; pie?: Record<Idioma, string> }
  | { tipo: "lista"; puntos: Record<Idioma, string[]> };

export type Nota = {
  id: string;
  fecha: string;                       // AAAA-MM-DD, la del hallazgo
  proyecto: "mercadito" | "jlptest" | "dailychallenge" | "ayotl";
  titulo: Record<Idioma, string>;
  entradilla: Record<Idioma, string>;
  cuerpo: Bloque[];
};

export const NOTAS: Nota[] = [
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
];

export function notaPorId(id: string): Nota | undefined {
  return NOTAS.find((n) => n.id === id);
}
