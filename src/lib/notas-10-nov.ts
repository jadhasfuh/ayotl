import type { Nota } from "./notas";

/**
 * Las cuatro notas del 10-nov-2026, el día en que salieron War Zone 1.0.27,
 * ZANEI 1.0.13, Kazan 1.0.15 y las reseñas y los sellos de Mercadito.
 * En su propio archivo para no alargar notas.ts.
 */
export const NOTAS_10_NOV: Nota[] = [
  {
    id: "la-victoria-que-no-contaba",
    fecha: "2026-11-10",
    proyecto: "warzone",
    titulo: {
      es: "La victoria que no contaba",
      en: "The win that didn't count",
    },
    entradilla: {
      es: "El ranking en línea de War Zone estaba en ceros aunque se jugaba. El ranking estaba bien: el anfitrión volvía a escribir quién estaba sentado cada vez que alguien salía, y si el rival se iba antes del final ya no quedaba partida que contar.",
      en: "War Zone's online leaderboard sat at zero even though people were playing. The leaderboard was fine: the host rewrote who was seated every time someone left, and if the rival quit before the end there was no match left to count.",
    },
    cuerpo: [
      { tipo: "p", texto: {
        es: "En War Zone el anfitrión de una sala apunta en su ficha quién está sentado y en qué equipo. Al terminar, cada teléfono le pide a la base de datos que registre el resultado, y la función sólo lo cuenta si la sala tiene dos asientos o más y quien llama ocupa uno. Es una regla sensata: nadie se apunta una victoria en una sala donde no jugó.",
        en: "In War Zone the host of a room writes down in its record who is seated and on which team. When the match ends, each phone asks the database to register the result, and the function only counts it if the room has two or more seats and the caller holds one of them. It's a sensible rule: nobody gets to claim a win in a room they didn't play in.",
      } },
      { tipo: "p", texto: {
        es: "El fallo estaba un paso antes. Hasta la versión 1.0.26, el anfitrión volvía a escribir los asientos cada vez que alguien entraba o salía, también a media partida. Si el rival cerraba la app o se quedaba sin señal, la ficha se quedaba con un solo asiento y la función contestaba que no, sin error: ganar porque el otro se fue no existía. Y como esa misma ficha decide quién puede entrar al canal privado de la sala, a quien se le caía la red un momento ya no lo dejaba volver.",
        en: "The bug was one step earlier. Up to version 1.0.26, the host rewrote the seats every time someone came in or left, mid-match included. If the rival closed the app or lost signal, the record was left with a single seat and the function answered no, without an error: winning because the other player left simply didn't exist. And since that same record decides who may join the room's private channel, anyone whose network dropped for a moment was no longer let back in.",
      } },
      { tipo: "p", texto: {
        es: "No lo encontró una prueba ni un reporte. Salió al escribir un documento del juego tal como está, sacado del código y no de la memoria: qué hace cada modo, qué viaja entre teléfonos, quién escribe qué. Describir obliga a leer cada línea preguntando si eso sigue siendo cierto, y de esa lectura salieron tres fallos. Los otros dos: con cuatro equipos y tres o cuatro personas, una limpieza de asientos de cuando sólo había dos equipos mandaba al verde y al amarillo al azul; y las estadísticas del final contaban las del equipo azul, no las de quien llevaba el teléfono.",
        en: "Neither a test nor a report found it. It came out of writing a document of the game as it is, taken from the code and not from memory: what each mode does, what travels between phones, who writes what. Describing forces you to read every line asking whether it's still true, and that reading turned up three bugs. The other two: with four teams and three or four people, a seat clean-up from the days of two teams sent green and yellow to blue; and the end-of-match stats counted the blue team's, not those of whoever was holding the phone.",
      } },
      { tipo: "p", texto: {
        es: "El arreglo tiene dos mitades. La app y la web ya sólo escriben los asientos en la sala de espera. Y la base de datos dejó de confiar en que así sea:",
        en: "The fix has two halves. The app and the web now only write the seats in the waiting room. And the database stopped trusting that they will:",
      } },
      { tipo: "codigo", texto: `-- Disparador de la tabla de salas. Con la partida empezada, lo que decide
-- el resultado se queda como estaba al arrancar, lo mande quien lo mande.
if old.estado <> 'abierta' then
  new.asientos := old.asientos; new.modo := old.modo; new.seed := old.seed;
  if new.estado = 'abierta' then new.estado := old.estado; end if;
end if;`, pie: { es: "Una sala empezada tampoco vuelve a abrirse.", en: "A room that has started can't be reopened either." } },
      { tipo: "p", texto: {
        es: "La segunda mitad es la que importa. Una versión nueva tarda días en llegar a todos los teléfonos, y mientras tanto las anteriores siguen reescribiendo los asientos. Con la regla en la base, esa escritura ya no cambia nada: el arreglo sirve desde el minuto en que se aplica, también para quien no ha actualizado.",
        en: "The second half is the one that matters. A new version takes days to reach every phone, and meanwhile the older ones keep rewriting the seats. With the rule in the database, that write no longer changes anything: the fix works from the minute it's applied, even for people who haven't updated.",
      } },
      { tipo: "p", texto: {
        es: "Lo de los cuatro equipos pedía otra decisión. En un juego en línea determinista, donde cada teléfono simula la partida y sólo viajan las jugadas, la herramienta de siempre es subir la versión de la simulación, y eso deja fuera del juego en línea a todo el que no haya actualizado. Pero la simulación no había cambiado: sólo el reparto de asientos al arrancar. Así que ahora viaja un número de protocolo con la presencia de cada jugador, y sólo lo exige el caso que lo necesita: cuatro equipos con tres o cuatro personas. Uno contra uno, dos contra dos y cuatro equipos entre dos personas se siguen jugando entre la versión nueva, la anterior y la web.",
        en: "The four-team bug called for a different decision. In a deterministic online game, where every phone simulates the match and only the moves travel, the usual tool is bumping the simulation version, and that locks everyone who hasn't updated out of online play. But the simulation hadn't changed: only how seats are dealt at the start. So a protocol number now travels with each player's presence, and only the case that needs it demands it: four teams with three or four people. One on one, two on two and four teams between two people still play across the new version, the previous one and the web.",
      } },
      { tipo: "p", texto: {
        es: "Las pruebas de salas ganaron casos (el rival que desaparece a media partida; cuatro equipos como anfitrión, como invitado y con una app anterior en la sala), y todos fallan con el código de antes. Esa es la condición: una prueba nueva que también pasa sin el arreglo no está probando el arreglo.",
        en: "The room tests gained cases (the rival who vanishes mid-match; four teams as host, as guest and with an older app in the room), and all of them fail against the old code. That's the condition: a new test that also passes without the fix isn't testing the fix.",
      } },
    ],
  },
  {
    id: "el-volcan-ya-salia-al-azar",
    fecha: "2026-11-10",
    proyecto: "kazan",
    titulo: {
      es: "El volcán ya salía al azar: faltaba verlo",
      en: "The volcano was already random: you just couldn't see it",
    },
    entradilla: {
      es: "La petición era que el volcán de Kazan no saliera siempre en el mismo sitio. Ya cambiaba con cada isla. Medimos 400 islas de cada tamaño para entender por qué no se notaba, y salió otra cosa: en una de cada cuatro, la lava alcanzaba una base en el primer cuarto de la erupción.",
      en: "The request was for Kazan's volcano to stop appearing in the same place every time. It already moved with every island. We measured 400 islands of each size to understand why nobody noticed, and found something else: on one in four, lava reached a base within the first quarter of the eruption.",
    },
    cuerpo: [
      { tipo: "p", texto: {
        es: "Kazan es estrategia en tiempo real en una isla con un volcán que hace erupción: la lava baja por tierra, no cruza el agua, y lo que toca se pierde. El cráter se elige con la semilla de la isla, así que cada isla tiene el suyo. Pero la partida empieza con el mapa sin explorar, y el cráter no se veía hasta que alguien llegaba a él. Para quien juega, un volcán que no se ve está «donde siempre»: la lava llega de algún lado y ya. El azar que no se ve no cuenta.",
        en: "Kazan is real-time strategy on an island with an erupting volcano: lava flows over land, doesn't cross water, and whatever it touches is lost. The crater is picked from the island's seed, so every island has its own. But a match starts with the map unexplored, and the crater couldn't be seen until someone reached it. To the player, a volcano you can't see is «where it always is»: lava comes from somewhere and that's that. Randomness nobody sees doesn't count.",
      } },
      { tipo: "p", texto: {
        es: "Antes de tocar nada, medimos: 400 islas de cada tamaño, con el mismo generador del juego, apuntando en qué momento de la erupción la lava toca la primera base. Tres hallazgos. El cráter no se veía. No era parejo: con cuatro naciones, en el 27 % de las islas una base caía antes de la cuarta parte de la erupción; en la isla de doce naciones, en el 89 %. Y más o menos una de cada cien veces el cráter salía en un islote aparte, desde donde la lava no alcanza a nadie.",
        en: "Before touching anything, we measured: 400 islands of each size, with the game's own generator, noting at what point of the eruption lava touches the first base. Three findings. The crater couldn't be seen. It wasn't fair: with four nations, on 27 % of islands a base fell before a quarter of the eruption had passed; on the twelve-nation island, on 89 %. And roughly one time in a hundred the crater landed on a separate islet, from which lava reaches no one.",
      } },
      { tipo: "p", texto: {
        es: "Ahora cada nación nace con el cráter y sus alrededores ya explorados, y el minimapa lleva su marca desde el primer segundo. Para elegirlo, el generador prueba 40 sitios al azar en la misma tierra donde nacen las naciones, calcula para cada uno cuándo caería la primera base, y se queda con uno de los que la dejan vivir al menos hasta la cuarta parte de la erupción.",
        en: "Now every nation starts with the crater and its surroundings already explored, and the minimap carries its mark from the first second. To pick it, the generator tries 40 random spots on the same land where the nations start, works out for each one when the first base would fall, and keeps one of those that let it live at least until a quarter of the eruption.",
      } },
      { tipo: "codigo", texto: `for (let k = 0; k < VOLCAN_CANDIDATOS; k++) {        // 40 sitios
  const i = cand[(rnd() * cand.length) | 0];
  const v = primera(i);    // parte de la erupción en que la lava toca la primera base
  if (v >= VOLCAN_JUSTO) justos.push(i);             // 0.25
  if (v > mv) { mv = v; mejor = i; }
}
const r = rnd();           // se pide haya o no entre qué elegir
const i = justos.length ? justos[(r * justos.length) | 0] : mejor;`, pie: { es: "El último `rnd()` se llama siempre: el azar de la partida tiene que avanzar igual en todas las islas.", en: "The last `rnd()` is always called: the match's randomness has to advance the same way on every island." } },
      { tipo: "p", texto: {
        es: "Con eso, las islas donde una base cae demasiado pronto bajaron de 27 % a cero con cuatro naciones y de 89 % a 5 % con doce. Tiene un precio, y también se midió: con ocho a doce naciones el cráter queda más al centro (la mediana pasó de 0,68 a 0,42 del camino entre el centro y la orilla). Más parejo es un poco menos variado.",
        en: "With that, the islands where a base falls too early went from 27 % to zero with four nations and from 89 % to 5 % with twelve. It has a price, and we measured that too: with eight to twelve nations the crater ends up closer to the centre (the median went from 0.68 to 0.42 of the way between the centre and the shore). Fairer means a little less varied.",
      } },
      { tipo: "p", texto: {
        es: "La otra mitad de la petición era poder huir. Un obrero funda ahora una segunda base lejos de la ciudad: cuesta 300 de madera y 150 de hierro, tarda 40 segundos, tiene que ir en terreno explorado y lejos de los edificios enemigos, y sólo se pueden tener dos. Una nación ya no cae al perder su base, sino al perder la última. La computadora también se muda: en veinte partidas de máquina contra máquina, las naciones que se quedaban sin base bajaron de 71 a 17.",
        en: "The other half of the request was being able to flee. A worker can now found a second base away from the city: it costs 300 wood and 150 iron, takes 40 seconds, has to go on explored ground and far from enemy buildings, and you can only hold two. A nation no longer falls when it loses its base, but when it loses its last one. The computer moves house too: over twenty machine-versus-machine matches, nations left without a base dropped from 71 to 17.",
      } },
      { tipo: "p", texto: {
        es: "Ahí estuvo la trampa. En Kazan cada teléfono simula la partida completa y sólo viajan las órdenes; todo lo que decide una regla tiene que calcularse igual en todos. Qué casillas ha explorado cada nación era hasta ahora un dato de dibujo, y el cliente lo apuntaba también al pintar. Desde que fundar una base exige terreno explorado, ese dato decide una regla, y sólo lo puede escribir el paso de la simulación. Si lo toca el dibujo, dos teléfonos dejan de estar de acuerdo en dónde se puede construir y la partida se parte en dos.",
        en: "That's where the trap was. In Kazan every phone simulates the whole match and only orders travel; anything that decides a rule has to be computed identically on all of them. Which tiles each nation has explored used to be drawing data, and the client also wrote it while painting. Now that founding a base requires explored ground, that data decides a rule, and only the simulation step may write it. If the drawing code touches it, two phones stop agreeing on where you can build and the match splits in two.",
      } },
      { tipo: "p", texto: {
        es: "Y como cambiar una regla es cambiar la simulación, la versión subió: las apps anteriores no entran al juego en línea hasta actualizarse, y la ronda del reto de la isla empezó de nuevo. Por eso estos cambios se juntan y salen el mismo día.",
        en: "And since changing a rule means changing the simulation, the version went up: earlier apps can't join online play until they update, and the island challenge round started over. That's why changes like these get bundled and shipped on the same day.",
      } },
    ],
  },
  {
    id: "un-ranking-que-no-se-compra",
    fecha: "2026-11-10",
    proyecto: "zanei",
    titulo: {
      es: "Doce niveles seguidos y un ranking que no se compra",
      en: "Twelve levels in a row and a leaderboard you can't buy",
    },
    entradilla: {
      es: "El arcade de ZANEI era una lista de niveles sueltos. Ahora tiene un recorrido por los doce, sin diálogos ni pausas, con ranking mundial. La regla que lo sostiene: nada de lo que da un anuncio puede acabar en la tabla.",
      en: "ZANEI's arcade was a list of single levels. Now it has a run through all twelve, with no dialogue or pauses, and a world leaderboard. The rule holding it up: nothing an ad gives you can end up on the board.",
    },
    cuerpo: [
      { tipo: "p", texto: {
        es: "ZANEI es un juego de naves con historia: doce niveles, diálogos, cinemáticas y un CONTINUAR que devuelve una nave a cambio de ver un anuncio. En la historia eso está bien: nadie compite, y quien se atora puede seguir. El modo arcade, en cambio, era sólo la lista de los niveles para repetirlos, cada uno con su tabla.",
        en: "ZANEI is a shoot 'em up with a story: twelve levels, dialogue, cutscenes and a CONTINUE that gives a ship back in exchange for watching an ad. In the story that's fine: nobody is competing, and anyone who gets stuck can keep going. Arcade mode, though, was just the list of levels to replay, each with its own board.",
      } },
      { tipo: "p", texto: {
        es: "El modo nuevo recorre los doce niveles seguidos. Sin diálogos, sin cinemáticas y sin la ficha de resultados entre uno y otro: dos segundos y medio de transición y sigue. Los puntos, las naves, las bombas, el arma y su potencia se conservan de nivel a nivel, y al final hay una sola ficha con el nivel alcanzado y, si se completaron los doce, un bono por cada nave y cada bomba que sobró.",
        en: "The new mode runs the twelve levels back to back. No dialogue, no cutscenes and no results sheet in between: two and a half seconds of transition and on it goes. Score, ships, bombs, the weapon and its power carry over from level to level, and at the end there's a single sheet with the level reached and, if all twelve were cleared, a bonus for every ship and bomb left over.",
      } },
      { tipo: "p", texto: {
        es: "Lo que no hay es CONTINUAR. Si una nave se puede conseguir viendo un anuncio, la tabla deja de medir quién juega mejor y empieza a medir quién aguanta más anuncios. Las naves extra que se ganan jugando sí cuentan: las que suelta el nivel y las que dan los puntos. El anuncio quedó en un solo lugar, al dejar la ficha final, y sólo si el recorrido duró más de dos minutos: una partida que acaba a los veinte segundos no merece uno.",
        en: "What it doesn't have is CONTINUE. If a ship can be had by watching an ad, the board stops measuring who plays best and starts measuring who sits through more ads. Extra ships earned by playing do count: the ones a level drops and the ones points award. The ad ended up in a single place, when you leave the final sheet, and only if the run lasted more than two minutes: a game that ends after twenty seconds hasn't earned one.",
      } },
      { tipo: "p", texto: {
        es: "Al medir con un jugador automático salió un fallo viejo. La primera nave extra por puntos estaba en 100 000, y cada nivel de la historia empieza en cero: el jugador automático hacía entre 21 y 65 mil por nivel, así que ese premio casi no se alcanzaba. Nadie lo había reportado, porque un premio que nunca llega no se echa de menos.",
        en: "Measuring with an automatic player surfaced an old bug. The first extra ship for points sat at 100,000, and every story level starts from zero: the automatic player scored between 21 and 65 thousand per level, so that reward was almost never reached. Nobody had reported it, because a reward that never arrives isn't missed.",
      } },
      { tipo: "codigo", texto: `// Antes la primera estaba en 100 000.
export const NAVE_EXTRA = [20000, 150000, 300000, 500000, 750000, 1000000];`, pie: { es: "En el recorrido los puntos se acumulan de nivel a nivel, y los escalones altos por fin se alcanzan.", en: "In the run, points add up from level to level, and the higher steps can finally be reached." } },
      { tipo: "p", texto: {
        es: "Dos correcciones vinieron de probarlo antes de publicarlo. En el primer borrador se llamaba PARTIDA COMPLETA, y no lo es: sin diálogos ni cinemáticas es un paso por todos los niveles para el ranking, no el juego entero. Se llama LOS 12 NIVELES. Y estaba abierto desde el primer arranque, antes de que nadie hubiera visto las ayudas del primer nivel: ahora se abre al terminar el nivel 1 de la historia, y mientras tanto el menú dice cómo abrirlo.",
        en: "Two corrections came from trying it before it shipped. In the first draft it was called FULL GAME, and it isn't one: without dialogue or cutscenes it's a pass through every level for the leaderboard, not the whole game. It's called ALL 12 LEVELS. And it was open from the very first launch, before anyone had seen the first level's hints: now it unlocks on clearing level 1 of the story, and until then the menu says how to unlock it.",
      } },
      { tipo: "p", texto: {
        es: "En el servidor no hizo falta una tabla nueva: el ranking por nivel ya existía, y el recorrido entra como nivel 0, con su modo y el nivel alcanzado. Y el juego no depende de él: si el ranking no contesta, la tabla dice «NADIE TODAVÍA» y la partida sigue.",
        en: "The server didn't need a new table: the per-level leaderboard already existed, and the run goes in as level 0, with its mode and the level reached. And the game doesn't depend on it: if the leaderboard doesn't answer, the board says «NOBODY YET» and the game goes on.",
      } },
    ],
  },
  {
    id: "resenas-de-quien-si-compro",
    fecha: "2026-11-10",
    proyecto: "mercadito",
    titulo: {
      es: "Reseñas de quien sí compró, en una plataforma que no ve la venta",
      en: "Reviews from people who actually bought, on a platform that never sees the sale",
    },
    entradilla: {
      es: "En Mercadito el pedido sale por WhatsApp y la plataforma no sabe si hubo venta. Así, cualquiera podría reseñar a cualquier negocio. La prueba de compra salió de otra función que se hizo el mismo día: los sellos que el propio negocio confirma.",
      en: "On Mercadito the order goes out over WhatsApp and the platform doesn't know whether a sale happened. That way, anyone could review any business. The proof of purchase came from another feature built the same day: the stamps the business itself confirms.",
    },
    cuerpo: [
      { tipo: "p", texto: {
        es: "Mercadito es carta digital, mesas y reservas; el pedido se arma en la carta y sale al WhatsApp del negocio. Es el diseño, puesto a propósito, y tiene una consecuencia: la plataforma no ve la venta. Para unas reseñas eso es un problema serio. Sin saber quién compró, un botón de «califica» es una invitación para el competidor, para el amigo y para el que pasaba por ahí.",
        en: "Mercadito is digital menus, tables and bookings; the order is put together on the menu and goes out to the business's WhatsApp. That's the design, on purpose, and it has a consequence: the platform doesn't see the sale. For reviews that's a serious problem. Without knowing who bought, a «rate us» button is an invitation to the competitor, the friend and the passer-by.",
      } },
      { tipo: "p", texto: {
        es: "La respuesta llegó por otro lado. El mismo día se hicieron los sellos de compras repetidas: el negocio define una meta y un premio, y el cliente con cuenta junta un sello por compra. Mercadito sólo lleva la cuenta. Un sello nace de tres maneras: de un pedido por WhatsApp hecho con sesión, que queda pendiente hasta que el negocio lo confirma (con un tope de tres al día); de una cita marcada como completada; o a mano en el mostrador, con el teléfono del cliente.",
        en: "The answer came from elsewhere. That same day we built stamps for repeat purchases: the business sets a goal and a reward, and a customer with an account collects one stamp per purchase. Mercadito only keeps count. A stamp is born in one of three ways: from a WhatsApp order placed while signed in, which stays pending until the business confirms it (capped at three a day); from a booking marked as completed; or by hand at the counter, with the customer's phone number.",
      } },
      { tipo: "p", texto: {
        es: "Ese sello confirmado es justo lo que faltaba: alguien del negocio dijo «sí, esta persona me compró». Así que la regla de las reseñas cabe en una consulta: califica quien tiene un sello confirmado o una cita completada en los últimos noventa días.",
        en: "That confirmed stamp is exactly what was missing: someone at the business said «yes, this person bought from me». So the rule for reviews fits in one query: you can rate if you have a confirmed stamp or a completed booking in the last ninety days.",
      } },
      { tipo: "codigo", texto: `SELECT EXISTS (
  SELECT 1 FROM sellos WHERE puesto_id = $1 AND cliente_id = $2
     AND estado = 'confirmado' AND confirmado_at > NOW() - INTERVAL '90 days'
) OR EXISTS (
  SELECT 1 FROM citas WHERE puesto_id = $1 AND cliente_id = $2
     AND estado = 'completada' AND inicio > NOW() - INTERVAL '90 days'
) AS ok`, pie: { es: "Sin compra confirmada no sale el botón, y el servidor contesta lo mismo a quien lo intente por fuera.", en: "With no confirmed purchase the button doesn't show, and the server gives the same answer to anyone who tries from outside." } },
      { tipo: "p", texto: {
        es: "La otra mitad es a quién se le enseñan. El negocio ve cada reseña en privado desde la primera, con el nombre de pila de quien la escribió, y puede contestarla. Al público sólo salen el promedio y los comentarios cuando ya hay cinco: una sola reseña mala no le pone un 1.0 a un negocio que va empezando. El umbral se pensó con el tamaño real de un piloto en una ciudad pequeña: con diez, la mayoría de los negocios tardaría meses en enseñar algo. Hay una reseña por cliente y negocio, y se puede corregir.",
        en: "The other half is who gets to see them. The business sees every review privately from the first one, with the first name of whoever wrote it, and can reply. The public only sees the average and the comments once there are five: a single bad review doesn't pin a 1.0 on a business that's just starting. The threshold was set with the real size of a small-town pilot in mind: at ten, most businesses would take months to show anything. There's one review per customer and business, and it can be edited.",
      } },
      { tipo: "p", texto: {
        es: "Queda una frontera que no se cruza. Mercadito es también el instrumento de un piloto de investigación, y sus datos de demanda son anónimos por construcción: una sesión al azar que vive un día y que nunca se liga a una cuenta. Los sellos y las reseñas van al revés, pegados a la cuenta del cliente, porque sin cuenta no hay tarjeta de sellos. Por eso son producto y no instrumento: viven en sus propias tablas y no se cruzan con los eventos del piloto. La decisión quedó escrita en el registro de la investigación, que no se puede editar, y la política de privacidad ya habla de los dos.",
        en: "One boundary stays uncrossed. Mercadito is also the instrument of a research pilot, and its demand data is anonymous by construction: a random session that lives for a day and is never tied to an account. Stamps and reviews go the other way, attached to the customer's account, because without an account there's no stamp card. That's why they're product and not instrument: they live in their own tables and are never joined with the pilot's events. The decision was written into the research log, which can't be edited, and the privacy policy now covers both.",
      } },
    ],
  },
];
