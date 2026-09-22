# ayotl.dev

El sitio de la marca **Ayotl** («tortuga» en náhuatl), el paraguas de Mercadito,
JLPTest y Daily Challenge. Tres páginas (inicio con las tarjetas de las apps,
programa Beta, acerca de), en español e inglés, con modo claro/oscuro.

Misma receta que los otros tres productos: **Next.js 16 App Router + React 19 +
TypeScript**, CSS propio, `output: "standalone"`, Dockerfile → **Railway**, y
datos en la **Supabase de jlptest** dentro de un esquema propio `ayotl`.

## Correr en local

```
npm install
npm run dev          # http://localhost:3002 — sin .env.local el sitio carga entero; sólo el formulario Beta contesta "no disponible"
npm run revisar      # tsc --noEmit
npm run build        # el mismo build que hace el Dockerfile
npm run db:local     # aplica la migración en el Postgres 16 local y ejercita checks, upsert y permisos
```

Con `.env.local` (copiar de `.env.example`) apuntando a Supabase y a Turnstile,
el formulario Beta funciona de verdad. Para probar sin Cloudflare, las claves de
prueba de Turnstile están en `.env.example`.

## Estructura

```
src/proxy.ts                     idioma por URL: / → /es/… por dentro, /en/about → /en/acerca, www → apex, cookie ayotl.idioma
src/app/[idioma]/layout.tsx      raíz: <html lang>, Inter, script de tema, metadatos comunes, pie
src/app/[idioma]/page.tsx        inicio: hero + tarjetas + teasers
src/app/[idioma]/beta/page.tsx   programa Beta (dinámica: lee la clave de sitio de Turnstile al servir)
src/app/[idioma]/acerca/page.tsx historia del nombre (en inglés se sirve como /en/about)
src/app/global-not-found.tsx     404 de todo el sitio, bilingüe, con su propio <html> (el layout raíz vive en [idioma])
src/app/api/beta/route.ts        POST: zod → honeypot → Turnstile → límite por IP → upsert por email con la llave secreta
src/app/[idioma]/admin/testers/  panel del programa Beta (contraseña ADMIN_SECRETO): días, saldos, pagos
src/app/api/admin/*              entrar/salir, marcar días, registrar pagos, cruzar una fecha (sólo con la cookie de admin)
src/app/og/[idioma]/route.tsx    tarjeta Open Graph 1200×630 (build)
src/app/icono/[medida]/route.tsx PNG del icono en 32/180/192/512 (build)
src/app/robots.ts, sitemap.ts
src/components/                  Tortuga (SVG de un trazo) · Cabecera · Pie · TarjetaApp · FormularioBeta · SelectorTema
src/lib/idioma.ts                textos es/en y rutas por idioma (sin librería de i18n)
src/lib/apps.ts                  las fichas de la vitrina
src/lib/beta.ts                  contrato del formulario (zod), compartido cliente/servidor
src/lib/supabase-servidor.ts     cliente con llave secreta, `import "server-only"`, esquema `ayotl`
src/lib/turnstile.ts             verificación del token (servidor)
src/lib/admin.ts                 cookie httpOnly con HMAC de ADMIN_SECRETO
src/lib/correo.ts                aviso por Resend de cada alta del Beta
src/lib/mercadito.ts             cruce de días de Mercadito (otra base, por teléfono, con pg)
src/app/api/cron/mercadito/      lo llama pg_cron con X-Cron-Secret, y el botón del panel
src/lib/sitio.ts                 URL pública (https://ayotl.dev por defecto en producción)
public/icono.svg                 favicon; el mismo trazo que components/Tortuga.tsx (único sitio duplicado)
src/app/og/Literata-Medium.ttf   la serif del nombre en la tarjeta OG: Satori no lee next/font
supabase/migrations/             esquema `ayotl` (nunca escribe en `public` ni `arcade`; registrar_dia sólo los lee)
scripts/migracion-local.sh       prueba de la migración en local
docs/                            decisiones y despliegue
```

## Variables de entorno (en Railway; los valores no van en el repo)

| Variable | Dónde | Para qué |
|---|---|---|
| `SUPABASE_URL` | servidor | la Supabase de jlptest |
| `SUPABASE_SECRET_KEY` | servidor | escribir en `ayotl.testers` saltando RLS; también sala el hash de IP |
| `TURNSTILE_SITIO` | servidor → baja como prop | clave de sitio de Turnstile (pública por diseño) |
| `TURNSTILE_SECRETO` | servidor | verificar el token |
| `NEXT_PUBLIC_SITIO` | servidor | `https://ayotl.dev`; si falta, se asume |
| `ADMIN_SECRETO` | servidor | contraseña del panel `/admin/testers` (≥ 12 caracteres); sin ella el panel no existe |
| `RESEND_API_KEY` | servidor | avisar por correo de cada alta del Beta; sin ella el alta se guarda igual |
| `CORREO_DE` / `CORREO_AVISOS` | servidor | remitente y destino del aviso (por defecto `avisos@` → `hola@ayotl.dev`) |
| `MERCADITO_DATABASE_URL` | servidor | leer la base de Mercadito (session pooler) para cruzar sus días por teléfono |
| `CRON_SECRETO` | servidor | cabecera `X-Cron-Secret` del cron que cruza Mercadito |

No hay ninguna `NEXT_PUBLIC_` que el navegador necesite: nada se hornea en el
build y el Dockerfile no lleva `ARG`.

## Desplegar

`git push origin main`. Railway construye el Dockerfile y publica. Los pasos de
la primera vez (servicio, variables, dominio en Cloudflare, Turnstile, esquema
expuesto en Supabase) están en [docs/DESPLIEGUE.md](docs/DESPLIEGUE.md).

## Programa Beta

Los testers ganan 20 MXN por día de actividad real; el cruce con jlptest y
Daily Challenge lo hace `ayotl.registrar_dia` (misma base) con un cron
diario, y el panel `/admin/testers` enseña días, saldos y pagos. Todo en
[docs/PROGRAMA-BETA.md](docs/PROGRAMA-BETA.md).

## Reglas de la casa (resumen)

- Todo en español: código, identificadores, comentarios, commits, docs. La interfaz, en es/en.
- Ningún secreto con `NEXT_PUBLIC_`. Lo que usa la llave secreta lleva `import "server-only"`.
- RLS en todas las tablas. `ayotl.testers` no tiene políticas: sólo escribe el servidor.
- Migraciones en ficheros, probadas en local (`npm run db:local`) antes que en producción. Nunca a mano en el panel.
- Los textos de cara al público los revisa Adrián antes de publicarse.
