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
