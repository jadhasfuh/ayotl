# Vender en Sahuayo: a quién, con qué y cómo

Investigación hecha el 26-sep-2026. Todo lo que dice «comprobado» se midió
con el navegador o se leyó de la base; lo demás está marcado como suposición.

## Antes de vender nada: qué dice nuestra propia base

Mercadito tiene **60 negocios activos en Sahuayo**. De ellos, 32 cargaron un
menú de verdad (cinco productos o más), 9 cargaron cuatro o menos y 19 nunca
cargaron nada. Hay catálogos grandes: Amazónico con 392 productos,
McDonald's con 302, la Farmacia Inmaculada con 168, Crostoli con 159.

**Y en toda la historia de la base hay un pedido.** Uno.

Eso cambia qué hay que vender. El cuello de botella no es conseguir más
negocios —ya hay sesenta, y la mitad se tomó la molestia de subir su menú—,
es que nadie pide por ahí. Salir a reclutar más restaurantes para Mercadito
sería añadir oferta a un mercado sin demanda, y acabarían igual: dados de
alta y sin usarlo.

Así que la campaña de «llámame cuando me necesites» **no vende Mercadito**.
Vende lo que Ayotl sabe hacer: páginas, catálogos, sistemas y
automatizaciones. Mercadito entra sólo cuando el negocio necesita comandas,
mesas o corte de caja, que es valor para él aunque ningún cliente pida a
domicilio.

## A quién, en orden

### 1. Aceros Santos Palacios — el más fácil de convencer

**Comprobado:** su sitio es un Google Sites
(`sites.google.com/view/aceros-santos-palacios`). La portada transfiere
**65 MB** y tarda **entre 5 y 10 segundos** en abrir en un teléfono; una sola
imagen pesa **23 MB**, que es una foto subida tal cual salió de la cámara. Sí
tiene botón de WhatsApp y no se desborda en móvil.

**El gancho, en una frase:** «Tu página tarda diez segundos en abrir en un
teléfono y gasta 65 MB de datos del cliente. La mitad se va antes de verla.»

**Qué ofrecerle:** sitio propio con dominio suyo, catálogo de perfiles,
varillas y láminas con medidas y disponibilidad, y cotización que llega a su
WhatsApp. Es un negocio de catálogo: lo que vende es que el cliente encuentre
la medida y pregunte precio.

### 2. Mahide — el que no tiene nada

**Comprobado:** no le encontré sitio web. Aparece en directorios de terceros
(infoisinfo, directorio-comercial, tlapalerias.com) con datos que él no
controla; 3.9 de 5 con 19 opiniones en una de esas fichas.

**El gancho:** «Cuando alguien busca "pisos en Sahuayo", encuentra fichas de
otros con tus datos, tus horarios y tus reseñas. Ninguna es tuya.»

**Qué ofrecerle:** catálogo con fotos por línea de producto, buscador por
medida y color, y el pedido por WhatsApp. Pisos y recubrimientos es puro
catálogo visual: es el tipo de negocio donde una página bien hecha se paga
sola con dos ventas.

### 3. La Cochera — el más grande, y el que más tiene que perder

**Comprobado:** sí tiene sitio propio (`pastelerialacochera.com`), abre en
2.3 s, pesa 1.4 MB y se ve bien en móvil. **No tiene ningún enlace a
WhatsApp.** Opera desde 1986, con sucursales en Sahuayo, Jiquilpan, San
Pedro, Zamora, La Barca y Mazamitla, y reparte a domicilio de 8:00 a 20:30.

**El gancho:** «Tu página está bien, pero no vende: nadie puede encargar un
pastel desde ahí. Hoy el encargo depende de que le atiendan el teléfono.»

**Qué ofrecerle:** encargo de pasteles en línea —sabor, tamaño, texto del
pastel, fecha y sucursal de recogida— que llega al WhatsApp de la sucursal.
Aquí Mercadito encaja de verdad, con seis sucursales y reparto propio.

### 4. Rica Pizza y Pizzería La Espiga — el mismo problema

**Comprobado:** ninguna de las dos tiene sitio. Sus menús viven en sitios
ajenos —restaurantguru, carta.menu, wheree, gastroranking— que ganan dinero
con sus anuncios y publican precios que nadie actualiza. La Espiga además
tiene **dos páginas de Facebook** (una con 946 seguidores y otra con 2 215),
así que su público está partido en dos.

**El gancho:** «Tu menú está publicado en cinco páginas que no son tuyas, con
precios viejos y anuncios de otros restaurantes encima. Y en Facebook tienes
dos cuentas: la gente escribe a la que no lees.»

**Qué ofrecerle:** menú propio con código QR para las mesas y pedido a su
WhatsApp. Es exactamente Mercadito, y hoy sin costo; si sólo quieren la
página, sale igual de barato.

### 5. H. Ayuntamiento — el más lento, no el primero

**Comprobado:** tiene sitio (`gob.sahuayomich.gob.mx`) con pago en línea de
predial, agua y licencias. Carga en 1.7 s, pero **se desborda de lado en el
teléfono**: hay que arrastrar la pantalla para leerlo.

**Por qué no es el primer objetivo:** venderle al municipio es darse de alta
como proveedor, cotizar y esperar; son meses, no semanas, y conviene llegar
con trabajo hecho en el pueblo. Cuando llegue el momento, el gancho es
concreto: «su portal no se puede usar con una mano en el teléfono, y ahí es
donde la gente paga el predial».

## El método: la demo de quince minutos

Lo que convierte en este pueblo no es un folleto, es enseñarle a alguien su
propio negocio funcionando. Antes de tocar la puerta:

1. **Abre su muestra** en `ayotl.dev/demo/<negocio>`. Ya hay cinco montadas
   (ver abajo); una nueva son quince minutos: un fichero en `src/lib/demos.ts`.
2. **Ábrela en tu teléfono antes de entrar**, y dale una vuelta tú primero,
   para que no sea la primera vez que la tocas delante del dueño.
3. **Entra y enséñasela.** No se explica, se enseña: «Mire, así se vería. La
   hice ayer para enseñársela; si le sirve, la dejamos con su dominio.»
4. **Deja algo físico**: una tarjeta con el QR de esa demo. Que la pueda
   enseñar a su socio cuando tú ya no estés.

Es más trabajo por visita, pero cambia la conversación: se deja de discutir
si conviene tener página y se pasa a discutir la suya.

### La escalera: qué se ofrece y qué cuesta

Los precios viven en `src/lib/planes.ts` y salen al pie de cada muestra. Para
cambiarlos se toca ese fichero y nada más.

| | Qué es | Cuánto |
| --- | --- | --- |
| **1. Su ficha en Mercadito** | Su carta en `mercadito.cx/m/su-negocio`, con pedido por WhatsApp, sin comisiones por venta. También mesas, comandas y citas | **Gratis** hasta el 31-oct-2027 |
| **2. Enlace propio** | Lo mismo con su nombre y sus colores, sin Mercadito a la vista. Un solo panel, un solo catálogo, sale en los dos lados | $1,500 de alta + $250 al mes |
| **3. A la medida** | Lo que un catálogo no resuelve: reservas, citas, calendario, cotizador, dominio propio | Desde $8,000 + $350 al mes |

El primer escalón es gratis de verdad: desde el 28-sep-2026 Mercadito no le
cobra a nadie mientras dure el **piloto de digitalización del comercio local**
(`mercadito.cx/piloto`), hasta el 31-oct-2027. Convierte la visita en
«pruébelo» en vez de «fírmeme», y a ti no te cuesta nada porque **ya está
construido**.

Eso además cambia la frase con la que entras. Ya no es «le sale en $49 al
mes»: es «esto no le cuesta nada, y si un día quiere su propio enlace,
hablamos». Es mucho más fácil que te dejen enseñarlo. El segundo es el que se quiere
vender: el alta cubre el trabajo y la mensualidad paga el mantenimiento sin
tener que revender cada año.

Cobrar con tarjeta se puede conectar, pero la comisión la pone el banco: se
dice aparte y se cotiza aparte. Prometer una comisión que no se controla es
la manera más rápida de quedar mal.

### El mejor prospecto del pueblo ya está en Mercadito

`mercadito.cx/menus` tiene **37 negocios de Sahuayo con la carta cargada y
pública**. Ésos son los prospectos más calientes que hay, por encima de
cualquiera del directorio, y por una razón: ya demostraron que quieren estar
en línea y ya hicieron el trabajo aburrido de subir su catálogo. Crostoli
tiene 66 bebidas y 25 fotos cargadas a mano. Eso es alguien comprometido.

A ése no se le vende una página: se le enseña la suya funcionando y se le
pregunta si la quiere con su nombre en vez del de Mercadito. La venta empieza
en el escalón dos, no en el cero.

Lo que ya está resuelto ahí dentro —y que no hay que volver a construir— es
el menú: color propio del negocio, «Abierto ahora», buscador, categorías con
su cuenta, «más vendidos», fotos, personalizar y el pedido por WhatsApp. Las
muestras de catálogo copian esos patrones justamente porque ya están probados.

### Las muestras ya montadas

Están en `ayotl.dev/demo` (esa lista no se enlaza desde el sitio ni se
indexa). Cada una lleva arriba, pegado y sin forma de cerrarlo, el aviso de
que no es el sitio del negocio: una página que pudiera pasar por oficial no
se publica, y además así la conversación empieza donde tiene que empezar.
Ningún botón le escribe a nadie —enseñan el mensaje que se compondría—, y
ninguna usa sus fotos ni su logotipo: van huecos marcados «foto».

| Muestra | Negocio | Lo que enseña | Por qué ése |
| --- | --- | --- | --- |
| `/demo/portozul` | Portozul Hotel & Suites | Reserva directa: fechas, habitación, estimado | Sólo se reserva por Expedia, Hotels.com, Orbitz, Despegar y Trip.com. Cada reserva deja 15–20 % de comisión |
| `/demo/mahide` | Mahide | Cotizador por metro cuadrado, con merma | Sin sitio propio; sus datos y reseñas viven en fichas de terceros |
| `/demo/rica-pizza` | Rica Pizza | Menú con carrito y pedido armado | Su menú está en restaurantguru, carta.menu, wheree y gastroranking, con anuncios de la competencia al lado |
| `/demo/real-de-las-palmas` | Real de las Palmas | Calendario de fechas libres + cotizador por invitado | «Fiestas & Eventos» son 63 negocios y casi ninguno tiene página; la pregunta que más llega es si hay fecha |
| `/demo/fisiotec` | Fisiotec | Agenda de citas con horas libres | 42 fichas de médicos en el directorio y ninguna deja agendar |
| `/demo/la-cochera` | Pastelería La Cochera | Carta, y su app con encargo y sucursal | Once sucursales en seis ciudades, cuarenta años, y su sitio no deja pedir, ni ver precios, ni escribir por WhatsApp |
| `/demo/crostoli` | Crostoli | Carta, y su app | #2 de 481 restaurantes de Sahuayo, 4.5★ con 197 reseñas, y 134 platillos ya cargados en Mercadito |

Tres llevan además **muestra de app** en `/demo/<negocio>/app`: Rica Pizza,
La Cochera y Crostoli. Desde la página se pasa a la app con el par de botones
de arriba, que es como se enseña: primero su página, luego «y así se vería su
app». La app tiene cuatro pestañas y cada una está por una razón que se dice
en voz alta:

- **Carta** — el mismo catálogo, para que se vea que se carga una sola vez.
- **Lo de siempre** — repetir el pedido de siempre en dos toques. En un
  negocio al que se vuelve, esto es lo que hace que la app se quede.
- **Puntos** — la tarjeta de sellos sin el cartoncito que se pierde.
- **Avisos** — el único canal que llega al cliente sin pagarle pauta a nadie.
  Ése es el argumento de venta de la app, y conviene decirlo con esas
  palabras: el mismo alcance en Facebook se paga cada vez.

Los tres módulos (reserva, carrito, agenda) y el cotizador sirven para casi
cualquier giro del pueblo: hotel y salón comparten el calendario, restaurante
y ferretería el carrito, y todo consultorio la agenda. Montar la sexta
muestra es copiar el bloque de otra y cambiar los datos.

### Lo que se dice al entrar

> Buenas, ¿es usted el dueño? Soy Adrián, de aquí de Sahuayo, hago páginas y
> aplicaciones. No vengo a venderle nada hoy: le hice esto para que lo vea
> —y le enseña el teléfono—. Si le late, le digo qué cuesta y en cuánto lo
> tengo; si no, me voy y no le quito más tiempo.

### El mensaje, si es por WhatsApp

> Buenas tardes. Soy Adrián Ceja, de Sahuayo. Hago páginas y apps; las tres
> que tengo publicadas están en ayotl.dev.
>
> Le escribo por algo concreto: [el gancho de arriba, en una frase].
>
> Le armé una muestra con lo de su negocio para que la vea, sin compromiso:
> [enlace de la demo]. Si le interesa, le paso qué incluye, cuánto cuesta y
> en cuánto tiempo, por escrito. Si no, aquí queda y no lo molesto más.

### El seguimiento

Una sola vez, a los cuatro o cinco días, y corto: «¿Alcanzó a ver la
muestra? Si quiere la ajusto a lo que usted tenía en mente.» Si no contesta,
se deja ir. En un pueblo, insistir dos veces cuesta la reputación de años.

## Cuántos y en qué orden

Dos visitas por semana, hechas bien, valen más que diez repartiendo tarjetas.
El orden sugerido es el de arriba: primero los que tienen un problema que se
puede medir delante de ellos (Aceros, Mahide), después los que ya invirtieron
algo y les falta el último paso (La Cochera), luego las pizzerías, y el
Ayuntamiento cuando haya dos o tres trabajos locales que enseñar.

## Dónde buscar más

`negocios.sahuayomich.mx` es un directorio local con los negocios de Sahuayo
ya clasificados: 183 en «Restaurantes & Comida Rápida», 73 en «Comida &
Desayunos», 61 en «Tecnología & Electrónica», 42 en «Cafeterías &
Pastelerías», 42 en «Médicos». Es la lista de prospectos más completa que hay
del pueblo.

Dos advertencias sobre ese directorio. La primera: sus fichas están casi
vacías —dirección, teléfono y poco más—, así que no sirve para saber si un
negocio tiene sitio; eso hay que comprobarlo a mano. La segunda, y la que
importa: **lo patrocina OITSYS (oitsys.com), una consultora de software de
aquí**. O sea que el directorio es el embudo de un competidor local que ya
está en esas puertas. No cambia a quién visitar, pero sí el tono: no se
compite por precio contra una consultora, se compite por ser el de aquí que
contesta el teléfono y entrega en una semana.

---

Fuentes consultadas: los sitios de cada negocio (medidos con el navegador),
sus fichas en directorios locales, y la base de datos de Mercadito.
