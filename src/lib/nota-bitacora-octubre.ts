import type { Nota } from "./notas";

/**
 * El estudio de octubre de la bitácora del piloto de Mercadito (2-nov-2026). Los números salen del conjunto
 * vuelta por vuelta de mercadito/datos/bitacora-octubre-2026.json (fuera de git), codificado desde los reportes
 * de WhatsApp del colaborador y cuadrado contra las notas de la bitácora. Reglas de PILOTO-JICA.md: sin su nombre,
 * sin colonias, calles ni negocios, y NADA de dinero (§4.3, y el anteproyecto: «no billing, commission or revenue data
 * is collected or analysed»; la primera versión publicó tarifas por vuelta y se quitaron el mismo día, 2-nov), y con
 * n = 1 dicho en voz alta: son indicios, no conclusiones. La misma página, en español, vive
 * en mercadito.cx/piloto/octubre-2026.
 */
const NO_SALIO = { es: "No salió", en: "Didn't work" };
const SIN_REPORTE = { es: "Sin reporte", en: "No report" };
const VUELTAS_DIA = [17, 11, 13, 9, 12, 15, 15, 11, 3, null, null, 10, 7, 13, 13, 12, 9, 6, 13, 9, 10, 12, 5, null, 12, 9, 5, null, 7, 10, null];
const FALTA: Record<number, { es: string; en: string }> = { 10: NO_SALIO, 11: NO_SALIO, 24: SIN_REPORTE, 28: SIN_REPORTE, 31: SIN_REPORTE };

export const NOTA_BITACORA_OCTUBRE: Nota = {
  id: "bitacora-de-octubre",
  fecha: "2026-11-02",
  proyecto: "mercadito",
  titulo: {
    es: "Un mes de mandados por WhatsApp: la bitácora de octubre",
    en: "A month of WhatsApp errands: the October field log",
  },
  entradilla: {
    es: "Un mandadero independiente de Sahuayo mandó cada noche por WhatsApp el resumen de su día. En octubre fueron 268 vueltas y 367 entregas, y ninguna plataforma vio una sola. Esto es lo que enseñaron, y lo que todavía no alcanzan a decir.",
    en: "An independent errand runner in Sahuayo sent the summary of his day over WhatsApp every night. In October that came to 268 trips and 367 drop-offs, and no platform saw a single one. Here's what they showed — and what they can't say yet.",
  },
  cuerpo: [
    { tipo: "p", texto: {
      es: "Es una de las fuentes del piloto de Mercadito: un diario de campo. Mercadito no reparte —dejó de hacerlo en agosto de 2026—; el colaborador trabaja por su cuenta, con sus clientes y por WhatsApp, y al final del día mandaba qué hizo. De cada mensaje, este estudio usa sólo la ciudad, el tipo de encargo y el giro del lugar. Ni nombres, ni calles, ni colonias, ni qué medicina, ni dinero.",
      en: "It's one of the sources of Mercadito's pilot: a field diary. Mercadito doesn't deliver — it stopped in August 2026; the collaborator works on his own, with his own customers, over WhatsApp, and at the end of the day he sent what he'd done. From each message, this study uses only the city, the kind of errand and the kind of place. No names, no streets, no neighbourhoods, no which-medicine, no money.",
    } },
    { tipo: "p", texto: {
      es: "Es una sola persona (n = 1) en un solo mes. Lo de abajo son indicios para formular preguntas y decidir a quién entrevistar, no conclusiones sobre el reparto en Sahuayo. Y no se analiza dinero: el piloto no estudia cobros ni ingresos de nadie, tampoco los de él.",
      en: "It's one person (n = 1) over one month. What follows are leads for framing questions and deciding whom to interview, not conclusions about delivery work in Sahuayo. And no money is analysed: the pilot doesn't study anyone's fees or income, his included.",
    } },
    { tipo: "cifras", cifras: [
      { valor: { es: "26 de 31", en: "26 of 31" }, etiqueta: { es: "días trabajados", en: "days worked" } },
      { valor: "268", etiqueta: { es: "vueltas", en: "trips" } },
      { valor: "367", etiqueta: { es: "entregas", en: "drop-offs" } },
      { valor: "10.3", etiqueta: { es: "vueltas por día trabajado", en: "trips per day worked" } },
      { valor: "36 %", etiqueta: { es: "a otra ciudad", en: "to another town" } },
      { valor: "92 %", etiqueta: { es: "para alguien que ya había pedido", en: "for someone who'd ordered before" } },
    ] },
    { tipo: "grafica", forma: "columnas", cadaEtiqueta: 5,
      titulo: { es: "Vueltas por día, octubre de 2026", en: "Trips per day, October 2026" },
      unidad: { es: "vueltas", en: "trips" },
      datos: VUELTAS_DIA.map((v, i) => ({ etiqueta: String(i + 1), valor: v, falta: FALTA[i + 1] })),
      pie: {
        es: "Los días sin barra no son ceros: el 10 y el 11 no salió (el 10, por un huracán y porque seguía enfermo desde el 9) y del 24, el 28 y el 31 no llegó reporte.",
        en: "Days without a bar aren't zeros: on the 10th and 11th he didn't work (on the 10th, a hurricane, and he was still sick from the 9th), and no report came in for the 24th, 28th and 31st.",
      } },
    { tipo: "p", texto: {
      es: "La primera semana fue la más cargada, con 13 vueltas por día; después se asentó entre 8 y 10. Cada vuelta es un viaje; las entregas son más porque las rutas de reparto de una tienda tocan varias puertas en un mismo viaje.",
      en: "The first week was the busiest, at 13 trips a day; after that it settled between 8 and 10. Each trip is one journey; there are more drop-offs because a shop's delivery routes knock on several doors in one go.",
    } },

    { tipo: "h2", texto: { es: "No es reparto de restaurantes: es hacer el mandado", en: "It isn't restaurant delivery: it's running errands" } },
    { tipo: "grafica", forma: "barras", anchoEtiqueta: 200,
      titulo: { es: "Qué hace en cada vuelta", en: "What each trip is" },
      unidad: { es: "vueltas", en: "trips" },
      datos: [
        { etiqueta: { es: "Compra para el cliente", en: "Buys for the customer" }, valor: 157 },
        { etiqueta: { es: "Entrega de un negocio", en: "Delivers for a business" }, valor: 87 },
        { etiqueta: { es: "Recoge algo del cliente", en: "Picks up from the customer" }, valor: 21 },
        { etiqueta: { es: "Trámite de dinero", en: "Money errand" }, valor: 3 },
      ] },
    { tipo: "p", texto: {
      es: "Casi seis de cada diez vueltas son compras: el cliente le escribe lo que quiere y él lo compra —en el súper, la farmacia, la ferretería o la taquería— y se lo lleva. Una de cada seis junta dos o más lugares en el mismo viaje. Sólo un tercio son entregas de un negocio que ya tenía el pedido listo. El modelo de «la app del restaurante con repartidor» no describe casi nada de esto.",
      en: "Almost six in ten trips are purchases: the customer texts what they want, he buys it — at the supermarket, the pharmacy, the hardware store or the taco stand — and brings it over. One in six combines two or more stops in the same journey. Only a third are deliveries for a business that already had the order ready. The 'restaurant app with a courier' model describes almost none of it.",
    } },
    { tipo: "grafica", forma: "barras", anchoEtiqueta: 200,
      titulo: { es: "Qué le piden", en: "What people ask for" },
      unidad: { es: "vueltas", en: "trips" },
      datos: [
        { etiqueta: { es: "Comida", en: "Food" }, valor: 137 },
        { etiqueta: { es: "Despensa", en: "Groceries" }, valor: 22 },
        { etiqueta: { es: "Rutas de una tienda de ropa", en: "A clothing shop's routes" }, valor: 19 },
        { etiqueta: { es: "Paquetería", en: "Parcels" }, valor: 16 },
        { etiqueta: { es: "Encargos personales", en: "Personal errands" }, valor: 14 },
        { etiqueta: { es: "Farmacia y salud", en: "Pharmacy and health" }, valor: 11 },
        { etiqueta: { es: "Ferretería", en: "Hardware" }, valor: 9 },
        { etiqueta: { es: "Celular a reparar", en: "Phone repair" }, valor: 8 },
        { etiqueta: { es: "Papelería", en: "Stationery" }, valor: 7 },
        { etiqueta: { es: "Antojos", en: "Snacks and treats" }, valor: 7 },
        { etiqueta: { es: "Otros", en: "Other" }, valor: 18, gris: true },
      ] },
    { tipo: "p", texto: {
      es: "La comida es la mitad, pero detrás viene una cola larga: despensa, paquetes, farmacia, ferretería, un celular a reparar, papelería, una lavandería, flores. Las vueltas salieron de 44 tipos de lugar distintos, y ninguno pasa de una de cada seis.",
      en: "Food is half of it, but a long tail follows: groceries, parcels, pharmacy, hardware, a phone to fix, stationery, a laundry, flowers. Trips started at 44 different kinds of place, and none accounts for more than one in six.",
    } },

    { tipo: "h2", texto: { es: "Casi todo es de clientes que vuelven", en: "Almost all of it comes from repeat customers" } },
    { tipo: "p", texto: {
      es: "El 92 % de las vueltas fue para un cliente, un negocio, una colonia o un encargo que ya había salido antes: una pollería que le dio 44 entregas en 22 días; una tienda de ropa que le encargó 19 rutas de reparto con más de cien paradas; un paquete que va de un hospital a una paquetería, 13 veces en el mes; el almuerzo que lleva de una casa a una oficina, otras 13. Una sola colonia de Jiquilpan recibió 87 vueltas, en 25 de los 26 días que trabajó.",
      en: "92 % of trips were for a customer, a business, a neighbourhood or an errand that had come up before: a chicken shop that gave him 44 deliveries over 22 days; a clothing shop that booked 19 delivery routes with over a hundred stops; a parcel that goes from a hospital to a courier office, 13 times in the month; a lunch he carries from a house to an office, another 13. A single neighbourhood in Jiquilpan got 87 trips, on 25 of the 26 days he worked.",
    } },
    { tipo: "p", texto: {
      es: "Es su fuerza y es su riesgo: el trabajo depende de pocos clientes. Y también es un sesgo del estudio: buena parte de lo que se ve aquí es lo que piden esos pocos.",
      en: "That's his strength and his risk: the work hangs on a few customers. It's also a bias in the study: much of what you see here is what those few ask for.",
    } },

    { tipo: "h2", texto: { es: "Jiquilpan pesa más de lo que parece", en: "Jiquilpan weighs more than it looks" } },
    { tipo: "grafica", forma: "barras", anchoEtiqueta: 200,
      titulo: { es: "A dónde va cada vuelta", en: "Where each trip ends" },
      unidad: { es: "vueltas", en: "trips" },
      datos: [
        { etiqueta: "Sahuayo", valor: 153 },
        { etiqueta: "Jiquilpan", valor: 97 },
        { etiqueta: { es: "No lo dijo", en: "Not stated" }, valor: 15, gris: true },
        { etiqueta: { es: "Las dos ciudades", en: "Both towns" }, valor: 3, gris: true },
      ] },
    { tipo: "p", texto: {
      es: "Jiquilpan, la ciudad vecina, recibió el 36 % de las vueltas, y casi nueve de cada diez fueron a una misma colonia. Dos de cada tres vueltas a Jiquilpan empiezan en Sahuayo: se compra aquí y se entrega allá. Es comercio entre dos ciudades que pasa entero por WhatsApp.",
      en: "Jiquilpan, the neighbouring town, got 36 % of the trips, nearly nine in ten of them to a single neighbourhood. Two in three trips to Jiquilpan start in Sahuayo: bought here, delivered there. It's trade between two towns that runs entirely over WhatsApp.",
    } },

    { tipo: "h2", texto: { es: "Cuándo", en: "When" } },
    { tipo: "grafica", forma: "columnas",
      titulo: { es: "Vueltas por día trabajado, según el día de la semana", en: "Trips per day worked, by weekday" },
      unidad: { es: "vueltas por día", en: "trips per day" },
      datos: [
        { etiqueta: { es: "Lun", en: "Mon" }, valor: 11 },
        { etiqueta: { es: "Mar", en: "Tue" }, valor: 9 },
        { etiqueta: { es: "Mié", en: "Wed" }, valor: 12.7 },
        { etiqueta: { es: "Jue", en: "Thu" }, valor: 12 },
        { etiqueta: { es: "Vie", en: "Fri" }, valor: 8.2 },
        { etiqueta: { es: "Sáb", en: "Sat" }, valor: 11 },
        { etiqueta: { es: "Dom", en: "Sun" }, valor: 9 },
      ],
      pie: { es: "De dos a cinco días por barra: es una pista, no una regla.", en: "Two to five days per bar: a hint, not a rule." } },

    { tipo: "h2", texto: { es: "Qué mejorar en la bitácora", en: "What to fix in the log" } },
    { tipo: "lista", puntos: {
      es: [
        "La hora. Sólo seis días trajeron horas, y sin la franja (mañana, comida, tarde, noche) no se puede decir cuándo entra el trabajo, que es lo primero que un negocio quiere saber.",
        "El destino. Quince vueltas no dicen a qué ciudad fueron; un campo obligatorio no las deja perderse.",
        "Rangos, no cifras. La bitácora se diseñó para pedir el rango del monto, no la cantidad; por WhatsApp llegaban cifras exactas. Con el formulario sólo se captura el rango, que es lo que el estudio declara.",
        "El texto libre trae de más: nombres de negocios, colonias, medicinas. Todo se quitó al capturarlo, pero lo mejor es no recibirlo: el formulario de la bitácora pregunta sólo lo que el piloto puede guardar.",
        "Los huecos. Tres días sin reporte: un recordatorio en la noche ayuda más que una regla.",
        "Una sola persona. Con n = 1, cada hallazgo puede ser de él y no del oficio. Hacen falta más repartidores en la bitácora.",
      ],
      en: [
        "The time. Only six days came with times, and without the time slot (morning, lunch, afternoon, night) we can't say when the work comes in — the first thing a business wants to know.",
        "The destination. Fifteen trips don't say which town they went to; a required field keeps them from getting lost.",
        "Bands, not figures. The log was designed to ask for an amount band, not the amount; over WhatsApp, exact figures came in. The form only captures the band, which is what the study declares.",
        "Free text brings too much: business names, neighbourhoods, medicines. All of it was stripped on entry, but better not to receive it at all: the log form asks only for what the pilot may keep.",
        "The gaps. Three days without a report: a reminder at night helps more than a rule.",
        "One person. With n = 1, every finding may be about him rather than the trade. The log needs more couriers.",
      ],
    } },

    { tipo: "h2", texto: { es: "Lo que le diríamos a quien hace mandados", en: "What we'd tell someone who runs errands" } },
    { tipo: "lista", puntos: {
      es: [
        "Juntar los viajes a la otra ciudad: avisar por una lista de difusión de WhatsApp «salgo a Jiquilpan a tal hora» y llevar varios encargos en un solo viaje.",
        "Aprovechar las vueltas que ya juntan varios lugares: una de cada seis pasa por dos o más tiendas; avisar «paso por el súper y la farmacia» atrae más encargos de camino.",
        "Acordar un horario fijo con los que más piden (la pollería, la tienda): el trabajo se vuelve predecible para los dos.",
        "Usar los días flojos —martes, viernes y domingo— para buscar clientes nuevos, por ejemplo en el tablón de repartidores de Mercadito, que es gratis.",
        "Cuidar el ritmo: la primera semana fue de 13 vueltas por día, y en la segunda se enfermó.",
      ],
      en: [
        "Bundle the trips to the other town: post on a WhatsApp broadcast list 'heading to Jiquilpan at such-and-such time' and carry several errands in one journey.",
        "Build on the trips that already combine stops: one in six goes through two or more shops; posting 'stopping at the supermarket and the pharmacy' draws more errands along the way.",
        "Agree on fixed times with the biggest customers (the chicken shop, the clothing shop): the work becomes predictable for both sides.",
        "Use the slow days — Tuesday, Friday and Sunday — to find new customers, for instance on Mercadito's free couriers board.",
        "Mind the pace: the first week ran at 13 trips a day, and in the second he fell ill.",
      ],
    } },

    { tipo: "h2", texto: { es: "Qué puede hacer Mercadito con los repartidores y las tiendas", en: "What Mercadito can do for couriers and shops" } },
    { tipo: "p", texto: {
      es: "Mercadito no opera entregas desde agosto de 2026 ni va a cobrar comisión: ese modelo ya se recorrió y se dejó, y su código sigue apagado como evidencia. Lo que sí puede dar es acceso —la queja documentada entre repartidores es de puerta cerrada: «ya tienen suficientes repartidores»— y números:",
      en: "Mercadito hasn't run deliveries since August 2026 and won't take a commission: that model was tried and dropped, and its code stays switched off as evidence. What it can offer is access — the documented complaint among couriers is a closed door: 'they already have enough couriers' — and numbers:",
    } },
    { tipo: "lista", puntos: {
      es: [
        "El tablón de repartidores: cada quien publica sus colonias, su tarifa y su horario, y el trato es directo por WhatsApp. Le falta la «ruta fija» («a Jiquilpan, martes y jueves») para la demanda entre ciudades.",
        "La bitácora como herramienta propia: a fin de mes, cada repartidor recibe sus números —vueltas, clientes que vuelven, días buenos y flojos—, como los de esta nota. Con su permiso, la misma bitácora alimenta el estudio.",
        "A las tiendas, en su panel, los repartidores del tablón que cubren su zona, con botón a WhatsApp. Mercadito no asigna ni cobra: sólo los presenta.",
        "Las rutas fijas, como las de la tienda de ropa: una tienda con entregas recurrentes puede acordar un día y una ruta con un repartidor del tablón.",
        "Y decir lo que hay: hoy el tablón da visibilidad, no trabajo. Prometer ingresos con la demanda de hoy sería mentirle a quien se registra.",
      ],
      en: [
        "The couriers board: each person posts their neighbourhoods, fee and hours, and the deal is made directly over WhatsApp. It's missing a 'fixed route' ('to Jiquilpan, Tuesdays and Thursdays') for demand between towns.",
        "The log as their own tool: at month's end, each courier gets their own numbers — trips, repeat customers, good days and slow ones — like the ones in this note. With their consent, the same log feeds the study.",
        "For shops, on their dashboard: the board's couriers who cover their area, with a WhatsApp button. Mercadito doesn't assign or charge: it only introduces them.",
        "Fixed routes, like the clothing shop's: a shop with recurring deliveries can agree a day and a route with a courier from the board.",
        "And say what's true: today the board gives visibility, not work. Promising income with today's demand would be lying to whoever signs up.",
      ],
    } },
    { tipo: "p", texto: {
      es: "Los datos no se borran: la bitácora de octubre sigue en la base del piloto, que sólo acepta altas, y el conjunto vuelta por vuelta queda para el análisis del año que viene.",
      en: "Nothing gets deleted: the October log stays in the pilot's append-only database, and the trip-by-trip dataset is kept for next year's analysis.",
    } },
  ],
};
