# Decisiones

Registro de lo que se decidió y por qué, para no volver a discutirlo.

## 2026-09-21 — Next.js y no Astro

Astro sería la herramienta natural para un folleto estático, pero ya hay tres
productos con Next 16, el mismo Dockerfile, el mismo patrón de i18n y de
Supabase en servidor. Un cuarto stack costaría más en mantenimiento que lo que
ahorraría en kilobytes: el sitio son tres páginas estáticas y un route handler.

## 2026-09-21 — Railway y no Cloudflare Pages/Workers

Railway encaja con la receta (servicio nuevo, `git push` = deploy) por ~1–3 USD
al mes. Next en Cloudflare exigiría `@opennextjs/cloudflare`, otro build y otra
forma de variables; además Cloudflare está fusionando Pages en Workers.
Cloudflare se queda como DNS (y proxy opcional delante de Railway).

## 2026-09-21 — La Supabase de jlptest, esquema `ayotl`

Como Daily Challenge con `arcade`: sin tercer cómputo que pagar, y si un día
hace falta identidad compartida entre productos ya está en el mismo `auth`.
Las migraciones de aquí nunca tocan `public` ni `arcade`.

## 2026-09-21 — Altas del Beta sólo desde el servidor

El prompt original pedía «políticas RLS para inserción pública segura». Se
descartó la política `insert` para `anon`: cualquiera con la llave publicable
puede llenar la tabla en bucle. En su lugar, `ayotl.testers` tiene RLS sin
políticas, y `/api/beta` valida (zod), descarta el honeypot, verifica
Turnstile, limita a 5 altas por IP y hora, y escribe con la llave secreta. La
alternativa queda comentada en la migración por si algún día hay que servir el
sitio sin servidor.

## 2026-09-21 — Idioma en la URL, no sólo en cookie

`/`, `/beta`, `/acerca` en español; `/en`, `/en/beta`, `/en/about` en inglés,
con `hreflang` cruzado. Un sitio de marca vive del buscador y cada idioma
necesita su dirección. La cookie sólo sirve para que la raíz mande a `/en` a
quien prefiera inglés la primera vez. Se implementa con `proxy.ts` (reescritura
interna a `src/app/[idioma]/…`), no con `next-intl` ni similares.

## 2026-09-21 — 404 bilingüe con `global-not-found`

`not-found.tsx` dentro de `[idioma]` no sirve: no recibe params, leer
`headers()` ahí vuelve dinámico el segmento entero, y con el layout raíz en un
segmento dinámico Next devolvía un cascarón vacío que sólo se rellenaba con
JS (curl y los buscadores veían el 404 genérico). `app/global-not-found.tsx`
(flag `experimental.globalNotFound`) se sirve a nivel de enrutado con su
propio `<html>`. Como no sabemos el idioma de quien llega, sale en los dos.

## 2026-09-22 — Cabeceras de seguridad en `next.config.ts`

CSP que sólo permite scripts propios y de Turnstile (con `'unsafe-inline'`
porque Next hidrata con scripts inline), `nosniff`, `Referrer-Policy`,
`Permissions-Policy` y `frame-ancestors 'none'`. `/favicon.ico` se reescribe a
`/icono/32` para que los navegadores que lo piden solos no generen 404.

## 2026-09-21 — La IP no se guarda en claro

Sólo hace falta para contar altas por conexión. Se guarda un HMAC-SHA256 con
la llave secreta de Supabase (32 hex). Rotar la llave sólo reinicia la cuenta.

## 2026-09-21 — Logo placeholder

Tortuga de perfil en un solo trazo SVG (`public/icono.svg` y
`components/Tortuga.tsx` comparten el `path`). Se cambiará por el definitivo;
cuando llegue, cambiar el trazo en los dos sitios y regenerar nada más: los
PNG (`/icono/*`, `/og/*`) se construyen del mismo `path` en el build.

## 2026-09-22 — Programa Beta: 20 MXN por día, cruce en SQL

Un tester cobra por día con actividad real en cualquiera de sus apps (no por
app), 20 MXN, al terminar. Como jlptest, Daily Challenge y `ayotl` comparten
base, el cruce es una función SQL (`ayotl.registrar_dia`) con `pg_cron`, sin
pg_net ni secretos: lee `auth.users` por el correo de Google del tester, y de
ahí `public.progreso`/`resultados` y `arcade.partidas`. Mercadito (otra
Supabase, entra por teléfono) se marca a mano hasta que haga falta más.

El panel `/admin/testers` va detrás de una contraseña única (`ADMIN_SECRETO`)
y una cookie HMAC, no de Supabase Auth: es para una persona. Detalle en
docs/PROGRAMA-BETA.md.

## 2026-09-22 — Logo definitivo y revisión de look and feel

El placeholder de una línea se cambió por el dibujo de la revisión de diseño:
caparazón, cabeza, dos patas y cola, con una variante sin cola para 32 px o
menos (el trazo suelto se leía como suciedad) y una tabla de grosores por
tamaño (`grosorTortuga`). El viewBox se recorta al dibujo en los iconos y en
la tarjeta OG, porque el cuadrado entero dejaba la tortuga perdida en medio
lienzo.

De la revisión se aplicó todo el bloque 1 y 2:

- **Contraste**: `--tierra` daba 3.32:1 sobre la arena (comprobado), así que
  el texto de las etiquetas usa `--tierra-texto` #7f5a2e (5.48:1) y la línea
  de 4 px se queda con el ocre. `--agua-solido` para el relleno de botón.
  `--fondo-2` era casi el fondo; ahora se distingue.
- **Filo en vez de sombra**, radio 14 → 6, píldora sólo en botones y chips.
- **Tres fuentes**: Inter (interfaz), Literata 500 (títulos y logotipo),
  Martian Mono 400 (dominios, la etiqueta náhuatl). Dos pesos nuevos.

No se aplicó, por ahora: el formulario en dos pasos y la bitácora con RSS.

## 2026-09-22 — Segunda pasada de diseño: menos texto, más datos

De la segunda revisión se aplicó casi todo, con dos salvedades: los textos
siguen en primera persona del singular (es un estudio de una persona, no un
«nosotros»), y las cifras de las tarjetas son las reales, comprobadas contra
la base y el código de cada app el 2026-09-22 (7 957 palabras, 846
gramáticas, 619 unidades; 24 minijuegos, 66 mapas), no las del ejemplo.

- **Tarjetas**: un glifo por producto (QR, cuadro de kanji, marciano de
  píxeles), dos líneas de texto y tres cifras concretas. Lo demás, en la web
  de cada app.
- **Hero** con más aire y la etimología como entradilla.
- **Beta** pasa de «¿quieres probar?» a «Lo próximo de Ayotl», diciendo lo que
  se gana (20 MXN por día).
- **Pie** con la tortuga y el nombre en vez de una línea de copyright.
- **Cabecera** más baja y la navegación de móvil como pestañas subrayadas.
- **Botones**: principal verde, secundario de filo, acento sólo para enviar un
  formulario. En oscuro el texto de los botones se invierte a tinta oscura:
  blanco sobre el verde claro daba 2.16:1 (comprobado).
- **Panel de admin**: responsive de verdad. La cuadrícula de días se queda en
  escritorio; en móvil hay una ficha por tester con sus días. Acciones
  agrupadas bajo «Gestión» y la cuadrícula se abre mostrando hoy.

## 2026-09-22 — Lo profesional en «Acerca de», no una página de CV

Un currículum completo en ayotl.dev competiría con LinkedIn, envejece y no
añade nada que LinkedIn no haga mejor. Lo que el sitio sí puede demostrar y
LinkedIn no son tres productos en producción hechos por una persona.

Así que en «Acerca de» va un párrafo corto (Salesforce, RPA, dónde ha
trabajado, JLPT N3, Sahuayo) que además explica de dónde salió cada app,
enlaces a LinkedIn y GitHub, y una línea de disponibilidad. Las treinta
certificaciones de LinkedIn no se copian: las de 2021-2022 diluyen a las que
pesan.

Se añade también un `Person` en JSON-LD con `sameAs` a LinkedIn, GitHub y los
tres dominios: es lo que le dice al buscador que todo eso es la misma
persona, para que quien busque el nombre encuentre el sitio y no sólo el
perfil.

## 2026-09-23 — Página para negocios y capturas

La portada habla a quien usa las apps; `/negocios` habla a quien quiere que
le hagan una. Separadas a propósito: mezclarlas dejaba un mensaje borroso, y
la de negocios es la que se le manda por WhatsApp a un restaurante de
Sahuayo. Lleva `ProfessionalService` en JSON-LD con el teléfono y la zona.

Las capturas se sacaron encendiendo la **tienda de demostración de
Mercadito** (`demo-apple`), cambiándole el PIN 123456 por uno aleatorio
mientras duraba, y apagándola al terminar con `apagar-demo.sql`. De paso se
le arregló el estado: estaba como `caducada` y el panel salía con el cartel
gris de «tu suscripción terminó», que es lo primero que habría visto la
próxima revisión de Apple o Google; ahora es una cortesía al corriente.

Las imágenes viven en `public/capturas/*.webp`, a 840 px de ancho (el doble
del móvil) y ~50 kB cada una. El guion que las toma está en el bloc de notas
de la sesión, no en el repo: se vuelve a escribir en cinco minutos y
dependía de credenciales de la demo.

## 2026-09-23 — Todo el sitio en tercera persona

Los textos estaban escritos en primera persona («soy Adrián», «la hice yo»,
«te pago»). Se pasan a hablar de Ayotl y de lo que hace: «Ayotl es un
estudio de software en Sahuayo», «hecha y mantenida por Ayotl», «el programa
paga por día de prueba». Las llamadas a la acción siguen dirigiéndose al
lector en segunda persona («apúntate», «escribe por WhatsApp»), que es lo
natural en un botón.

Las dos excepciones, a propósito: los botones donde habla el visitante
(«Avisarme», «Enviarme el enlace») y el mensaje de WhatsApp de
docs/PROGRAMA-BETA.md, que es un mensaje personal de Adrián y no una página.

## 2026-09-28 — Ayotl es una pata del piloto JICA, y eso manda sobre lo público

Adrián postuló a la beca Secihti/JICA (Ritsumeikan; resultados 15-dic-2026).
Mercadito es el instrumento de investigación; **Ayotl es donde eso se hace
público**: los precios de Mercadito, las notas y el programa Beta.

Por eso, antes de escribir aquí cualquier cosa sobre el piloto, los precios o
el programa, se lee `~/Documents/mercadito/docs/PILOTO-JICA.md`, que tiene el
contexto completo y las restricciones permanentes. Tres que pegan directo a
este repo:

- Lo que se publique aquí sobre Mercadito tiene que coincidir con lo que
  Mercadito cobra de verdad. Ya pasó una vez: las muestras de `/demo` decían
  «Gratis» cuando el precio era «2 meses gratis, luego $49/mes».
- Japón **no** «resolvió» la digitalización de sus pymes. Si aparece en una
  nota, va como el laboratorio más instructivo del mundo —con sus *shutter
  streets* y con la respuesta institucional más sistemática que existe—,
  nunca como país que lo tiene resuelto.
- «En ciudades pequeñas la gente no paga por reparto» es una **pregunta
  abierta**, no un hallazgo: sólo 4 % de las reseñas negativas del competidor
  local mencionan precio, y hay sesgo de supervivencia declarado.

El puntero también está en `CLAUDE.md`, pero ese fichero está en `.gitignore`
y no viaja: el registro que vale es éste.

## 2026-10-07 — Retos de código: el código vive aquí, no en YouTube

Los vídeos de retos (ttcode, `~/Documents/code challenge`) se publican en el
canal de YouTube de Adrián, y cada uno enlaza a `/retos/<slug>` (en inglés
`/en/challenges/<slug>`). El código **no** va en la descripción del vídeo:
YouTube rechaza `<` y `>` (y el C los trae en cada `#include`), y con una
sola fuente la descripción no se desincroniza del código.

- La página pinta el editor del vídeo, quieto: azul Atari, Press Start 2P y
  los colores de `ttcode/palette.py`. Esos colores **no** siguen el tema del
  sitio, porque son los del vídeo. Botón de copiar y la salida real debajo.
- El sitio no resalta nada. `ttcode export` escribe `src/content/retos.json`
  con el código ya partido en tramos por el mismo tokenizador del vídeo, así
  que la web y el vídeo no pueden discrepar en un color.
- El enunciado va en inglés en las dos versiones, como en el vídeo; la
  versión en español lo avisa.
- El vídeo se incrusta desde `youtube-nocookie.com` (añadido a `frame-src`).
- «Retos» va en el pie y no en la cabecera, que en el teléfono ya va llena.

### 2026-10-07 — Un reto al día, sin push diario

`ttcode programar` sube los vídeos de varios días de golpe, programados en
YouTube (`publishAt`, 13:00 de México), y exporta todos a `retos.json` con su
fecha. El sitio esconde los de fecha futura (`publicados()` en `lib/retos.ts`,
con el día de México), así que cada página aparece sola el día que le toca.
Por eso `/retos`, `/retos/<slug>` y el sitemap son dinámicos y no se hornean.
La página sale a las 00:00 y el vídeo a las 13:00: el enlace de la
descripción nunca apunta a un 404.

## 2026-10-07 — Fuentes en el repo, no descargadas en cada build

`next/font/google` baja las tipografías de fonts.googleapis.com en cada
compilación, y si Google no contesta en ese minuto el deploy entero falla. A
Mercadito le pasó el 5-oct (su commit 3cd632b). Las cuatro de este sitio
(Inter variable, Literata 500, Martian Mono 400, Press Start 2P) se bajaron una
vez, subconjunto `latin` como antes, a `src/app/fuentes/`, y se cargan con
`next/font/local` desde un solo módulo que importan los tres layouts y la
página de reto. Mismo resultado en el navegador (variables CSS, respaldo con
`size-adjust`, preload); el build ya no sale a internet y bajó a ~4 s.

## 2026-10-08 — War Zone entra a la vitrina sin tener web

War Zone (`~/Documents/territorio war`) es el cuarto producto: un juego
nativo (Capacitor, AdMob) en camino a Google Play y App Store, sin dominio
propio porque no hay nada que servir por web. Su ficha vive aquí, en
`/apps/warzone`, para tener a dónde mandar desde las tiendas y desde los
vídeos. Para eso `App.url` pasó a ser opcional: sin URL, la tarjeta y la
página dicen «Próximamente» y el campo `dominio` nombra las tiendas. Las
capturas son del canvas del juego (320×180) escaladas ×4 sin suavizar y en
webp sin pérdida, pesan menos de 3 KB cada una, y se montan en un teléfono
acostado (`Telefono apaisado`), porque el juego se juega así. El texto de
«tres apps en producción» se queda: War Zone todavía no lo está.

## 2026-10-13 — Capturas al día

Las del 23-sep se habían quedado atrás: Daily Challenge ya tiene sus puertas
(reto, práctica, juegos libres, party, War Zone) y 35 recreativas; jlptest
sumó Noticias a tu nivel, y War Zone cambió de HUD, de castillo y de armas
(son doce con el hara kiri). Se rehicieron con un Chrome sin ventana a
420×900 a 2× que contesta en local toda petición que no sea GET: no salió
ninguna vista, progreso ni partida. Sólo se dejó pasar el alta de la sesión
anónima de Daily Challenge, porque sin ella la portada enseña un error.
Mercadito usa la carta pública de la tienda de demostración. Las del panel
salieron de la sesión de la demo que Adrián abrió en su Chrome (el PIN no lo
teclea Claude). La ventana estaba a pantalla completa y no se podía achicar,
así que el cuerpo de la página se fijó a 420 px con `zoom: 2` (cada píxel sale a
2×). Los tramos de 704 px se cosieron con los encabezados pegajosos en su sitio,
y el teléfono del mesero de prueba va desenfocado. «Tu panel» es ahora la
pestaña Mi tienda (vistas, QR, compartir, menú para imprimir), que es lo que
dice su texto. Ventas se queda con la del 23-sep: hoy la demo no tiene ventas
y saldría vacía. Las de War
Zone salen del propio juego (`window.TH` en un Chrome sin ventana: menú,
campaña, castillo con su cráter, arsenal, pasa el teléfono y vector).

## 2026-10-20 — Capturas al día (2)

Adrián vio algunas viejas. Lo que cambió:

- **Mercadito.** La carta de la demo salía con letras en lugar de fotos; ahora
  es la de Amazónico (Adrián dio permiso de usar cualquier restaurante), con
  su logo, la promoción del día y «Más vendidos» con fotos. Su vista
  (`POST /api/menu/<id>/evento`) se contestó en local: el piloto no la contó.
  Las del panel siguen siendo de la demo; la interfaz no ha cambiado.
- **jlptest.** Las cinco, al día: la portada dice 9 452 palabras y 864 puntos
  de gramática, y las noticias son las de hoy. «Repaso espaciado» enseñaba la
  pantalla vacía («Nada vencido»), porque la sesión anónima no tiene
  historial. Ahora es una tarjeta de práctica, con «No la sabía / La sabía» y
  «las que falles vuelven antes de cerrar la sesión». El progreso que manda se
  contestó en local. Las cifras de la ficha pasan a 9 452 / 864 / 600, las de
  su `lib/contenido.ts` en producción.
- **La procesión de los dormidos.** Las seis, rehechas con el juego del 18-oct:
  - el menú nuevo (idioma, capítulos);
  - los sprites de tres tonos y los árboles;
  - los nombres nuevos;
  - la frase completa del boulevard.
- **War Zone.** Se quedan: desde el 13-oct sólo cambió lo de los anuncios.
- **Daily Challenge.** Las cuatro, con la tanda de octubre ya desplegada
  (Railway tuvo caída de builds de 11:03 a 15:00). `dailychallenge-juego` era
  una copia de la portada: ahora es una partida de práctica de la pirámide de
  cubos (la práctica contada se contestó en local). El catálogo dice 40
  recreativas y hay 147 mapas: las cifras de la ficha pasan de 35/66 a 40/147.

## 2026-10-21 — Kazan en la vitrina, y tres notas

Entra el sexto producto, **Kazan** (nombre provisional: 火山, «volcán»): estrategia
en tiempo real en una isla con volcán, prototipo que se juega dentro de Daily
Challenge como juego extra. Su ficha lleva seis capturas apaisadas del propio
canvas (320×180 a 4× sin suavizar, como las de War Zone), sacadas con
`tools/capturas-ayotl.mjs` de su repo. Sus cifras salen de `sim/sim.js`.

Las notas de ayotl.dev llevaban desde el 12-oct sin entradas. Van tres: cómo
funciona la partida en línea de Kazan (cada teléfono simula, sólo viajan las
órdenes), la intro de la casa que ahora comparten los tres juegos, y cómo se
grabó el reel de citas de Mercadito en un Mercadito local para no enseñar los
datos de un negocio real. Para eso `Nota.proyecto` admite ahora `kazan`.

## 2026-10-21 — Un contador de visitas propio para toda la casa

Hasta hoy no sabíamos cuánta gente entra a ningún sitio (Search Console sólo
ve la portada de Daily, y AdSense pide tráfico). Adrián pidió poder contarlo
desde Supabase con una consulta. Se hizo propio, sin Google Analytics ni
terceros:

- **Un solo endpoint, en ayotl.dev** (`/api/visita`): es el único sitio detrás
  de Cloudflare, así que el país sale de `cf-ipcountry` sin mirar la IP. Daily
  (y sus juegos extra), jlptest y Mercadito le mandan un beacon de texto plano
  (sin CORS previo); Mercadito tuvo que abrir `https://ayotl.dev` en su
  `connect-src`. Así Mercadito, que tiene su propia base, no necesita la llave
  secreta de la Supabase compartida.
- **Agregado por día** en el esquema `ayotl` (`visitas` por página y origen,
  `visitantes` por país, idioma, teléfono o computadora y app). Ni IP, ni cookies,
  ni la dirección de la que se llegó (sólo el sitio: `google`, `ayotl.dev`…). Los
  tokens e identificadores de las rutas se cambian por `:token` / `:id`; `/admin`
  y `/api` no se cuentan. El «visitante» lo decide el navegador: la primera
  página del día en ese sitio (lo recuerda en localStorage).
- **Sólo en producción** (el componente mira el dominio) y `?nocontar` apaga el
  contador en ese navegador para no contarnos a nosotros.
- **Las apps nativas no cuentan:** el contador de los juegos extra se lo pone
  Daily al copiarlos (`tools/visita.js`), no vive en sus repos. Las TWA (Daily,
  jlptest) sí, porque son la web; se marcan como `app`.
- Las páginas de privacidad de Daily, jlptest y Mercadito lo cuentan.

## 2026-10-23 — Aprende: cursos con código que se corre aquí mismo

Adrián pidió una sección para aprender, «para mí y para quien quiera», al
estilo Duolingo: un curso de estructuras de datos desde cero hasta avanzado y
otro que explique un juego de Daily Challenge por partes (lenguaje, cómo se
divide, gráficos, sonido, lógica, multijugador). Vive en `/aprende`
(`/en/learn`) y tiene un aviso al principio de `/retos` para quien llega a los
retos sin las bases.

- **JavaScript**, no Python ni C: corre en el navegador sin instalar nada, es el
  lenguaje de los juegos de Daily Challenge (así los dos cursos comparten
  lenguaje) y las ideas pasan igual a los otros.
- **El código se corre de verdad**, en un Worker (`public/aprende/ejecutor.js`)
  nuevo por ejecución que se mata a los 3 s: un ciclo infinito no congela la
  página. El Worker no ve el DOM, ni cookies, ni localStorage, y se sirve con su
  propia CSP (`default-src 'none'; script-src 'self' 'unsafe-eval'`): puede usar
  `new Function` pero no sale a la red. La CSP del sitio no cambió. El proxy de
  idioma ya no toca los `.js` (si no, el Worker se reescribía a `/es/…`).
- **La forma de la lección** la pidió Adrián: explicación arriba, el código en el
  editor azul de los retos (ahora editable, con el mismo resaltado) y a la
  derecha el resultado con notas de qué mirar; en el teléfono, debajo. Luego
  preguntas de cuatro tipos: elegir, completar huecos, ordenar renglones y
  escribir código que pasa pruebas. Las falladas vuelven al final.
- **El progreso**, en localStorage (`ayotl.aprende`): sin cuenta ni tabla. Es una
  comodidad de quien estudia; si se pierde, se pierde una racha, no un dato.
- **El contenido son ficheros TS** (una unidad por fichero), como las notas.
  `npm run aprende` corre cada programa en los dos idiomas con el mismo
  ejecutor y cada solución contra sus pruebas, y comprueba que el código
  inicial no las pase ya.
- Las lecciones son estáticas con `revalidate` de una hora: los retos enlazados
  salen el día que se publica su vídeo, como en `/retos`.
- El curso de Snake cita el código real de `daily challenge/public/arcade`. Si
  Snake cambia, hay que revisarlo.
