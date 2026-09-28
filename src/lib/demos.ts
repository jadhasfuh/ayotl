/**
 * Muestras para negocios de Sahuayo.
 *
 * Cada una es una página de ejemplo hecha con lo que ya es público del
 * negocio, para enseñársela en el teléfono cuando se le visita. **No son
 * sus sitios**: llevan un aviso visible arriba, no usan sus logotipos y no
 * se indexan. Si el negocio dice que no, se borra su fichero y ya.
 *
 * Los precios y los productos son de ejemplo salvo donde se diga; sirven
 * para que se vea cómo funcionaría, no para publicar sus tarifas.
 */
export type Modulo = "reserva" | "carrito" | "citas" | "cotizador";

export type Articulo = { nombre: string; detalle?: string; precio?: number; grupo?: string };

export type Demo = {
  slug: string;
  negocio: string;
  rubro: string;
  ciudad: string;
  /** Los colores de la muestra, elegidos por el rubro, no por su marca. */
  color: { fondo: string; tinta: string; acento: string; suave: string };
  /** El encabezado de la muestra, como lo diría el negocio. */
  portada: { titulo: string; bajada: string };
  /** Lo que se comprobó de su presencia actual, con fecha. */
  hallazgo: string;
  /** La frase con la que se abre la conversación. */
  gancho: string;
  /** Qué se propone construir. */
  propuesta: string[];
  modulo: Modulo;
  /** Cómo se titula la muestra: los rubros "de vestir" piden serifa. */
  tipografia: "serif" | "sans";
  /**
   * Sólo si se verificó. No hay enlace a wa.me en ninguna muestra: los
   * botones enseñan el mensaje que se compondría, porque mandarle un
   * WhatsApp de verdad a un negocio que no ha dicho que sí no se hace.
   */
  telefonoVisible?: string;
  direccion: string;
  articulos: Articulo[];
  /** Para el módulo de citas: las horas que atiende. */
  horarios?: string[];
  /** Para el cotizador: por cuántas unidades se multiplica el precio. */
  cotizacion?: { etiqueta: string; unidad: string; ayuda?: string; conCalendario?: boolean };
  /**
   * Si lleva app propia, lo que se enseña dentro. Vive en `/demo/<slug>/app`
   * y es el escalón de arriba: lo que una página no puede dar —icono en la
   * pantalla, avisos sin pagar pauta, «lo de siempre» en dos toques.
   */
  app?: {
    sucursales?: string[];
    lealtad: { hechos: number; total: number; premio: string };
    historial: { cuando: string; lineas: string[]; total: number }[];
    avisos: { cuando: string; titulo: string; texto: string }[];
  };
};

export const DEMOS: Demo[] = [
  {
    slug: "portozul",
    portada: { titulo: "Dormir bien en Sahuayo", bajada: "Veinte habitaciones a cinco minutos del centro, con estacionamiento techado y wifi en todo el hotel. Reserva directa: el mismo precio, sin intermediario." },
    tipografia: "serif",
    negocio: "Portozul Hotel & Suites",
    rubro: "Hotel",
    ciudad: "Sahuayo, Michoacán",
    color: { fondo: "#0f1b2a", tinta: "#eef2f7", acento: "#3d8bbf", suave: "#16293d" },
    hallazgo: "26-sep-2026: no tiene sitio propio. Se reserva por Expedia, Hotels.com, Orbitz, Despegar y Trip.com, más su página de Facebook.",
    gancho: "Cada reserva que entra por Expedia o Hotels.com deja entre 15 y 20 % de comisión. Una reserva directa no deja nada.",
    propuesta: [
      "Página propia con las habitaciones, las fotos y lo que incluye cada una.",
      "Reserva directa: el huésped elige fechas y habitación, y la solicitud llega al WhatsApp de recepción con todo escrito.",
      "Un mensaje automático de confirmación y otro el día anterior, para que no se caiga la reserva.",
      "La página sigue enviando a las agencias si conviene, pero primero ofrece el trato directo.",
    ],
    modulo: "reserva",
    telefonoVisible: "(353) 532-2242",
    direccion: "J. Trinidad Montes 491, Sahuayo de Morelos",
    articulos: [
      { nombre: "Habitación sencilla", detalle: "1 cama matrimonial · wifi · estacionamiento", precio: 750 },
      { nombre: "Habitación doble", detalle: "2 camas matrimoniales · wifi · estacionamiento", precio: 950 },
      { nombre: "Suite", detalle: "Cama king, sala y minibar", precio: 1400 },
    ],
  },
  {
    slug: "mahide",
    portada: { titulo: "Pisos, azulejo y recubrimiento", bajada: "Lo que hay en bodega, con su medida y su precio. Calcula los metros que necesitas y pide la cotización desde aquí." },
    tipografia: "sans",
    negocio: "Mahide",
    rubro: "Pisos y recubrimientos",
    ciudad: "Sahuayo, Michoacán",
    color: { fondo: "#1a1613", tinta: "#f2ece4", acento: "#c08a4a", suave: "#241e19" },
    hallazgo: "26-sep-2026: no le encontré sitio propio. Aparece en fichas de terceros (infoisinfo, tlapalerias.com, directorios) con datos y reseñas que no controla.",
    gancho: "Cuando alguien busca «pisos en Sahuayo», encuentra fichas de otros con tus datos y tus reseñas. Ninguna es tuya.",
    propuesta: [
      "El catálogo puede estar hoy en Mercadito, con buscador y pedido por WhatsApp, y sin costo hasta octubre de 2027.",
      "Con enlace propio: buscador por medida, color y ambiente, con foto grande de cada pieza.",
      "Cada pieza con su medida, su acabado y si hay existencia; el cliente llega sabiendo qué pedir.",
      "Botón de cotizar que manda al WhatsApp los metros cuadrados y la pieza elegida.",
    ],
    modulo: "cotizador",
    cotizacion: { etiqueta: "¿Cuántos metros cuadrados?", unidad: "m²", ayuda: "Se añade 10 % de merma, que es lo que se corta en obra." },
    direccion: "Blvd. Lázaro Cárdenas Nte., Sahuayo de Morelos",
    articulos: [
      { nombre: "Porcelanato mármol", detalle: "60 × 120 cm · rectificado", precio: 389, grupo: "Pisos" },
      { nombre: "Cerámica madera", detalle: "20 × 120 cm · antiderrapante", precio: 249, grupo: "Pisos" },
      { nombre: "Azulejo subway", detalle: "10 × 30 cm · brillante", precio: 199, grupo: "Muros" },
      { nombre: "Piedra laja", detalle: "30 × 60 cm · exterior", precio: 320, grupo: "Fachadas" },
      { nombre: "Zoclo a juego", detalle: "10 × 60 cm", precio: 65, grupo: "Complementos" },
      { nombre: "Boquilla y pegazulejo", detalle: "Saco de 20 kg", precio: 180, grupo: "Complementos" },
    ],
  },
  {
    slug: "rica-pizza",
    portada: { titulo: "Pizza recién hecha, en el centro", bajada: "Masa del día y horno de piedra. Arma tu pedido aquí y pásalo directo a la cocina." },
    tipografia: "sans",
    negocio: "Rica Pizza",
    rubro: "Pizzería",
    ciudad: "Sahuayo, Michoacán",
    color: { fondo: "#1d1210", tinta: "#f7ece7", acento: "#d1503a", suave: "#2a1a17" },
    hallazgo: "26-sep-2026: sin sitio propio. Su menú está publicado en restaurantguru, carta.menu, wheree y gastroranking, con precios que no controla y anuncios de otros restaurantes encima.",
    gancho: "Tu menú está en cinco páginas que no son tuyas, con precios viejos y anuncios de la competencia al lado.",
    propuesta: [
      "Esto puede estar en línea hoy mismo y sin costo: es Mercadito, que ya funciona, ya tiene 37 cartas de Sahuayo cargadas y es gratis hasta octubre de 2027.",
      "Pedido armado por el cliente que llega al WhatsApp ya escrito, sin errores de teléfono y sin comisión de nadie.",
      "Si después quiere su propio enlace, es la misma carta con su nombre y sus colores: se carga una vez y sale en los dos lados.",
      "Código QR para las mesas, y lo que hoy no tiene: cuántos abrieron la carta y qué es lo que más se pide.",
    ],
    modulo: "carrito",
    telefonoVisible: "(353) 532-5644",
    direccion: "Abasolo 49, Centro, Sahuayo de Morelos",
    app: {
      lealtad: { hechos: 7, total: 10, premio: "La décima pizza va por la casa" },
      historial: [
        { cuando: "Viernes pasado", lineas: ["2 × Pizza hawaiana", "1 × Refresco 600 ml"], total: 360 },
        { cuando: "Hace dos semanas", lineas: ["1 × Pizza mexicana", "1 × Pasta alfredo"], total: 295 },
      ],
      avisos: [
        { cuando: "Hoy, 1:20 p. m.", titulo: "Ya salió la del día", texto: "Rebanada de peperoni a $35 hasta las 6." },
        { cuando: "Sábado", titulo: "2×1 en pizzas medianas", texto: "Sólo hoy, de 7 a 10 de la noche." },
      ],
    },

    articulos: [
      { nombre: "Pizza hawaiana", detalle: "Jamón y piña", precio: 165, grupo: "Pizzas" },
      { nombre: "Pizza mexicana", detalle: "Chorizo, jalapeño y cebolla", precio: 175, grupo: "Pizzas" },
      { nombre: "Pizza de salami", detalle: "Doble queso", precio: 170, grupo: "Pizzas" },
      { nombre: "Rebanada", detalle: "Del sabor del día", precio: 35, grupo: "Por rebanada" },
      { nombre: "Pasta alfredo", detalle: "Con pan de ajo", precio: 120, grupo: "Pastas" },
      { nombre: "Refresco 600 ml", precio: 30, grupo: "Bebidas" },
    ],
  },
  {
    slug: "real-de-las-palmas",
    portada: { titulo: "Tu evento, en jardín", bajada: "Salón y jardín para hasta 400 invitados, con estacionamiento propio. Mira qué fechas quedan libres y aparta la tuya." },
    tipografia: "serif",
    negocio: "Real de las Palmas",
    rubro: "Salón de eventos",
    ciudad: "Sahuayo, Michoacán",
    color: { fondo: "#14181a", tinta: "#eef1f0", acento: "#7fa35f", suave: "#1d2426" },
    hallazgo: "26-sep-2026: aparece en el directorio local sin sitio propio ni datos más allá del teléfono. La categoría «Fiestas & Eventos» tiene 63 negocios y casi ninguno tiene página.",
    gancho: "Cada novia que pregunta «¿tienen libre el 14 de febrero?» es una llamada que alguien tiene que contestar. Si no contestas a la primera, llama al de al lado.",
    propuesta: [
      "Calendario público con las fechas ocupadas: quien pregunta ya sabe si hay lugar antes de llamar.",
      "Cotizador: número de invitados y paquete, y sale el estimado al momento.",
      "La solicitud de fecha llega al WhatsApp con todo: día, invitados, paquete y contacto.",
      "Apartado con anticipo y recordatorio automático quince días antes del evento.",
    ],
    modulo: "cotizador",
    cotizacion: { etiqueta: "¿Cuántos invitados?", unidad: "invitados", conCalendario: true },
    direccion: "Sahuayo de Morelos, Michoacán",
    articulos: [
      { nombre: "Paquete sencillo", detalle: "Salón, mesas, sillas y limpieza", precio: 350, grupo: "Por invitado" },
      { nombre: "Paquete con banquete", detalle: "Lo anterior más comida y servicio", precio: 620, grupo: "Por invitado" },
      { nombre: "Paquete completo", detalle: "Banquete, bebidas, música y coordinación", precio: 890, grupo: "Por invitado" },
    ],
  },
  {
    slug: "la-cochera",
    portada: { titulo: "Pastelería desde 1986", bajada: "Once sucursales en seis ciudades. Encarga tu pastel para la fecha que lo necesitas, y recógelo en la que te quede más cerca." },
    tipografia: "serif",
    negocio: "Pastelería La Cochera",
    rubro: "Pastelería y cafetería",
    ciudad: "Sahuayo, Michoacán",
    color: { fondo: "#1a1214", tinta: "#f6ece9", acento: "#c9736f", suave: "#251a1c" },
    hallazgo: "26-sep-2026: tiene sitio propio (pastelerialacochera.com) con once sucursales listadas, pero es un folleto: no deja pedir en línea, no enseña precios y no tiene WhatsApp. Hasta la sección «Tu Pastel» es informativa: para encargarlo hay que ir o llamar.",
    gancho: "Cuarenta años, once sucursales y seis ciudades — y para encargar un pastel el cliente todavía tiene que ir al mostrador o llamar por teléfono.",
    propuesta: [
      "Encargo de pastel en línea: sabor, tamaño, qué se escribe encima, para qué día y en qué sucursal se recoge.",
      "El encargo entra ya escrito a la sucursal que eligió: se acaban los pasteles mal anotados por teléfono.",
      "Once sucursales en el mapa, con la más cercana arriba.",
      "Y lo que un mostrador no da: saber qué sabor se pide más, en qué sucursal y en qué semana del año.",
    ],
    modulo: "carrito",
    telefonoVisible: "(353) 128-2488",
    direccion: "Constitución 303, Sahuayo de Morelos · y diez sucursales más",
    articulos: [
      { nombre: "Pastel de tres leches", detalle: "Chico, 8 porciones", precio: 320, grupo: "Pasteles" },
      { nombre: "Pastel de chocolate", detalle: "Mediano, 15 porciones", precio: 480, grupo: "Pasteles" },
      { nombre: "Pastel personalizado", detalle: "Se encarga con tres días", precio: 650, grupo: "Pasteles" },
      { nombre: "Rebanada del día", detalle: "La que haya en mostrador", precio: 55, grupo: "Por rebanada" },
      { nombre: "Concha y pan dulce", detalle: "Por pieza", precio: 18, grupo: "Panadería" },
      { nombre: "Café americano", precio: 40, grupo: "Cafetería" },
      { nombre: "Capuchino", precio: 55, grupo: "Cafetería" },
    ],
    app: {
      sucursales: ["Portal 20", "Guerrero", "Madero", "Matamoros", "Lázaro Cárdenas", "Jiquilpan", "Zamora Centro", "Zamora Norte", "San Pedro Caro", "La Barca", "Mazamitla"],
      lealtad: { hechos: 4, total: 8, premio: "El octavo café va por la casa" },
      historial: [
        { cuando: "Domingo", lineas: ["1 × Pastel de chocolate", "2 × Capuchino"], total: 590 },
        { cuando: "Hace un mes", lineas: ["1 × Pastel personalizado", "6 × Concha y pan dulce"], total: 758 },
      ],
      avisos: [
        { cuando: "Hoy, 8:10 a. m.", titulo: "Ya hay pan recién salido", texto: "En Portal 20, de 8 a 11 de la mañana." },
        { cuando: "Hace tres días", titulo: "Tu pastel está listo", texto: "Puedes recogerlo en la sucursal Guerrero hasta las 9." },
      ],
    },
  },
  {
    slug: "crostoli",
    portada: { titulo: "Café y restaurante", bajada: "Desayuno, comida y cena en un solo lugar, en Las Brisas. Pide desde aquí y recógelo o que te lo lleven." },
    tipografia: "sans",
    negocio: "Crostoli",
    rubro: "Café y restaurante",
    ciudad: "Sahuayo, Michoacán",
    color: { fondo: "#17130f", tinta: "#f4ede4", acento: "#d98b3a", suave: "#211a14" },
    hallazgo: "26-sep-2026: es el #2 de 481 restaurantes de Sahuayo en Restaurant Guru, con 4.5 estrellas y 197 reseñas en Google. Y ya tiene 134 platillos en 16 categorías cargados en Mercadito, con fotos: el catálogo existe y está al día.",
    gancho: "Ya subiste 134 platillos con sus fotos. Ese trabajo ya está hecho — falta que salga con tu nombre y no con el de otro.",
    propuesta: [
      "Su carta ya está cargada: lo que sigue no es capturarla otra vez, es ponerle su nombre, su portada y su enlace.",
      "El mismo panel de siempre: se cambia un precio una vez y cambia en los dos lados.",
      "Con 197 reseñas y el segundo lugar del pueblo, la gente ya lo busca por su nombre: que encuentre lo suyo y no una ficha de terceros.",
      "Y el escalón de arriba: su app, con avisos que llegan sin pagarle pauta a Facebook.",
    ],
    modulo: "carrito",
    telefonoVisible: "(353) 688-0761",
    direccion: "Calle Michoacán 7-37, Las Brisas, Sahuayo de Morelos",
    articulos: [
      { nombre: "Hamburguesa de la casa", detalle: "Con papas gajo", precio: 165, grupo: "Hamburguesas" },
      { nombre: "Panini de pollo", detalle: "Pesto y queso manchego", precio: 135, grupo: "Paninis" },
      { nombre: "Pasta alfredo", detalle: "Con pan de ajo", precio: 145, grupo: "Pastas" },
      { nombre: "Waffle con fruta", detalle: "Miel de maple", precio: 110, grupo: "Waffles" },
      { nombre: "Pan francés", detalle: "Con cajeta y nuez", precio: 105, grupo: "Waffles" },
      { nombre: "Capuchino", precio: 55, grupo: "Bebidas" },
      { nombre: "Frappé", detalle: "El de la temporada", precio: 75, grupo: "Bebidas" },
      { nombre: "Pastel de zanahoria", detalle: "Rebanada", precio: 70, grupo: "Postres" },
    ],
    app: {
      lealtad: { hechos: 6, total: 8, premio: "El octavo café va por la casa" },
      historial: [
        { cuando: "Ayer", lineas: ["1 × Hamburguesa de la casa", "1 × Frappé"], total: 240 },
        { cuando: "La semana pasada", lineas: ["2 × Pan francés", "2 × Capuchino"], total: 320 },
      ],
      avisos: [
        { cuando: "Hoy, 9:00 a. m.", titulo: "Ya está el desayuno", texto: "Pan francés con café a $135 hasta mediodía." },
        { cuando: "Viernes", titulo: "Nuevo en la carta", texto: "Frappé de temporada. Pruébalo esta semana." },
      ],
    },
  },
  {
    slug: "fisiotec",
    portada: { titulo: "Fisioterapia y rehabilitación", bajada: "Valoración, terapia manual y rehabilitación después de una lesión o una cirugía. Agenda tu cita en línea, a la hora que te quede." },
    tipografia: "sans",
    negocio: "Fisiotec",
    rubro: "Fisioterapia y rehabilitación",
    ciudad: "Sahuayo, Michoacán",
    color: { fondo: "#101a1c", tinta: "#eaf2f2", acento: "#4aa39b", suave: "#182628" },
    hallazgo: "26-sep-2026: aparece en el directorio local sin sitio propio. La categoría «Médicos & Especialistas» tiene 42 fichas y casi ninguna permite agendar.",
    gancho: "Las citas se agendan por WhatsApp, una por una, contestando el teléfono a media sesión.",
    propuesta: [
      "Agenda en línea con los horarios libres de verdad: el paciente elige y se apunta solo.",
      "Recordatorio automático el día anterior, que es lo que baja las faltas.",
      "Ficha de cada terapia, para que llegue sabiendo qué le van a hacer y cuánto cuesta.",
      "Historial por paciente: cuántas sesiones lleva y cuándo fue la última.",
    ],
    modulo: "citas",
    direccion: "Sahuayo de Morelos, Michoacán",
    horarios: ["9:00", "10:00", "11:00", "12:00", "16:00", "17:00", "18:00", "19:00"],
    articulos: [
      { nombre: "Valoración inicial", detalle: "45 minutos", precio: 350 },
      { nombre: "Sesión de terapia", detalle: "50 minutos", precio: 300 },
      { nombre: "Paquete de 10 sesiones", detalle: "Se paga por adelantado", precio: 2600 },
    ],
  },
];

export function demoPorSlug(slug: string): Demo | undefined {
  return DEMOS.find((d) => d.slug === slug);
}
