/**
 * Lo que se le ofrece al negocio, y lo que cuesta.
 *
 * Va al pie de cada muestra. Los precios están aquí y en ningún otro sitio:
 * para cambiarlos se toca este fichero y ya.
 *
 * El primer escalón cuesta $49 al mes con dos meses gratis, que es lo que
 * Mercadito cobra de verdad. No se pone «gratis» para que suene mejor: el
 * precio va escrito donde el negocio lo pueda leer, y de todas formas la
 * prueba de dos meses ya hace el trabajo de convencer.
 */
export type Nivel = {
  id: string;
  nombre: string;
  precio: string;
  recurrente?: string;
  resumen: string;
  incluye: string[];
  /** El del medio se resalta: es el que se quiere vender. */
  destacado?: boolean;
};

export const NIVELES: Nivel[] = [
  {
    id: "ficha",
    nombre: "Su ficha en Mercadito",
    precio: "2 meses gratis",
    recurrente: "luego $49 al mes",
    resumen: "Ya está hecha. Se carga el menú y esa misma tarde está en línea.",
    incluye: [
      "Su carta en mercadito.cx/m/su-negocio",
      "Pedido por WhatsApp, sin registro y sin comisiones",
      "Buscador, categorías y «lo más pedido»",
      "Mesas, comandas y reserva de citas, si el giro lo pide",
      "Se actualiza desde el celular, cuando cambie un precio",
    ],
  },
  {
    id: "enlace",
    nombre: "Enlace propio",
    precio: "$1,500 de alta",
    recurrente: "$250 al mes",
    resumen: "Lo mismo, pero con su nombre y sus colores, sin Mercadito a la vista.",
    destacado: true,
    incluye: [
      "Su portada, su logotipo y sus colores",
      "Su propio enlace, el que se pone en la bio de Facebook",
      "El mismo catálogo y el mismo panel: se carga una vez, sale en los dos lados",
      "Código QR para las mesas o el mostrador",
      "Cuántos abrieron la carta y qué se pide más",
    ],
  },
  {
    id: "medida",
    nombre: "A la medida",
    precio: "Desde $8,000",
    recurrente: "$350 al mes",
    resumen: "Lo que un catálogo no resuelve: fechas, citas, habitaciones, cotizaciones.",
    incluye: [
      "Reserva con calendario de lo que ya está apartado",
      "Agenda de citas con recordatorio automático",
      "Cotizador con sus precios y sus medidas",
      "Su dominio propio (.com o .mx), con el correo incluido",
      "Lo que haga falta: se escribe antes cuánto y en cuánto tiempo",
    ],
  },
  {
    id: "app",
    nombre: "Su app propia",
    precio: "Desde $15,000",
    recurrente: "$450 al mes",
    resumen: "Su icono en la pantalla del cliente, y avisos que llegan sin pagar pauta.",
    incluye: [
      "Publicada en Google Play con su nombre",
      "Avisos a quien tenga la app, sin costo por mensaje",
      "«Lo de siempre»: repetir el pedido de siempre en dos toques",
      "Tarjeta de puntos, sin el cartoncito que se pierde",
      "El mismo catálogo otra vez: se carga una vez y sale en los tres lados",
    ],
  },
];

/** Con qué se puede conectar. Todo esto está hecho ya en algún producto. */
export const INTEGRACIONES: { nombre: string; detalle: string }[] = [
  { nombre: "WhatsApp", detalle: "El pedido, la reserva o la cita llegan escritos, sin errores de teléfono." },
  { nombre: "Código QR", detalle: "Para la mesa, el mostrador o el cristal del local." },
  { nombre: "Facebook e Instagram", detalle: "Un solo enlace en la bio que siempre lleva a lo de hoy." },
  { nombre: "Google", detalle: "Que al buscar su nombre salga su página, no la ficha de un directorio." },
  { nombre: "Su dominio", detalle: "sunegocio.com, con correo propio en vez de un hotmail." },
  { nombre: "Recordatorios", detalle: "Aviso automático el día anterior; es lo que baja las faltas." },
  { nombre: "Números", detalle: "Cuántos abrieron, qué se pide más, a qué hora entra el trabajo." },
];

/**
 * Los pagos con tarjeta se dicen aparte y con su letra chica: los cobra la
 * pasarela, no Ayotl, y prometer una comisión que no se controla es la
 * manera más rápida de quedar mal.
 */
export const LETRA_CHICA =
  "Precios en pesos, sin IVA. El alta se cobra al entregar, no antes. La mensualidad cubre hospedaje, " +
  "respaldos y los cambios chicos; se cancela cuando quiera y el catálogo se va con usted. " +
  "Cobrar con tarjeta se puede conectar, pero la comisión la pone el banco y se cotiza aparte. " +
  "La cuenta de Google Play ya está pagada y es de Ayotl: la app se publica ahí sin costo de alta para usted, " +
  "y si un día quiere la suya propia, se traspasa.";
