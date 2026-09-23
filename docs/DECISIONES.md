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
