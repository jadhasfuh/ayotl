# Despliegue: la primera vez

Después de esto, desplegar es `git push origin main`.

## 1. Supabase (proyecto de jlptest)

1. Aplicar la migración por el pooler de sesión (puerto 5432), nunca a mano en
   el panel. Con `~/.pgpass` ya configurado:
   ```
   /opt/homebrew/opt/libpq/bin/psql "host=aws-0-us-west-2.pooler.supabase.com port=5432 dbname=postgres user=postgres.nstpivbrojehlaghfwov" -v ON_ERROR_STOP=1 -f supabase/migrations/20260921120000_ayotl_testers.sql
   ```
2. Settings → API → **Exposed schemas**: añadir `ayotl`. Sin esto supabase-js
   contesta «schema must be one of the following».
3. Copiar la URL del proyecto y la **secret key** (no la publishable) para
   Railway.

Las migraciones siguientes van igual, en orden de fecha. La de
`ayotl_programa` deja un cron (`ayotl-registrar-dia`, 12:00 UTC): se ve en
`select * from cron.job` y su resultado real en `net._http_response` no
aplica aquí (no usa pg_net); lo que hizo queda en `ayotl.dias_prueba`.

## 2. Cloudflare Turnstile

Cloudflare → Turnstile → Add widget: dominio `ayotl.dev`, modo *Managed*.
Anotar la **site key** (pública, va en `TURNSTILE_SITIO`) y la **secret key**
(`TURNSTILE_SECRETO`). Para probar en local sin Cloudflare, las claves de prueba
están en `.env.example`.

## 3. Railway

1. Mismo proyecto que los otros tres → **New service → GitHub repo →
   `jadhasfuh/ayotl`**. Railway detecta el Dockerfile solo.
2. Variables (Railway no hereda entre servicios; se pegan aquí aunque ya estén
   en otro):
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY`
   - `TURNSTILE_SITIO`
   - `TURNSTILE_SECRETO`
   - `NEXT_PUBLIC_SITIO=https://ayotl.dev`
   - `ADMIN_SECRETO` (contraseña larga del panel `/admin/testers`)
3. Settings → Networking → **Custom Domain** → `ayotl.dev`. Railway enseña un
   destino `xxxx.up.railway.app` y espera a ver el DNS.

## 4. DNS en Cloudflare

El dominio está en Cloudflare Registrar y el DNS en Cloudflare.

1. DNS → Records → **Add record**: tipo `CNAME`, nombre `@`, destino
   `xxxx.up.railway.app` (el que dio Railway). Cloudflare aplana el CNAME en la
   raíz solo; es el equivalente del `ALIAS @` de Hostinger.
2. **Proxy status: DNS only (nube gris)** mientras Railway verifica el dominio y
   emite el certificado (Let's Encrypt, unos minutos). Railway marca «Active».
3. `www`: o un `CNAME www → ayotl.dev` (el sitio redirige `www` al apex con
   308), o mejor una *Redirect Rule* en Cloudflare: `www.ayotl.dev/*` →
   `https://ayotl.dev/${1}` (301), que ahorra un salto.
4. Opcional, después: activar el proxy (nube naranja). Entonces SSL/TLS →
   **Full (strict)** y «Always Use HTTPS». **Nunca Flexible**: Cloudflare
   hablaría HTTP con Railway, Railway redirige a HTTPS y se entra en bucle.

Sobre el `.dev`: el TLD entero está en la lista HSTS *preload* de los
navegadores, así que `http://ayotl.dev` no existe para ellos. No hay nada que
configurar, pero hasta que el certificado esté emitido la página no abre en
absoluto (no hay fallback a HTTP). No anunciar el dominio antes de ver «Active».

## 5. Comprobar

```
curl -sI https://ayotl.dev | head -3                 # 200, HTML
curl -sI https://www.ayotl.dev/beta | grep -i location   # https://ayotl.dev/beta
curl -sI -H "Accept-Language: en" https://ayotl.dev | grep -i location   # /en
curl -s https://ayotl.dev/og/es -o /dev/null -w "%{content_type}\n"       # image/png
```

Y mandar un alta de prueba desde `/beta`; debe aparecer en `ayotl.testers`.

## Si algún día se va a Cloudflare Pages/Workers

El dominio ya está en la cuenta: Workers & Pages → proyecto → Custom domains →
`ayotl.dev`, y Cloudflare crea el DNS y el certificado solo. Pero Next en
Cloudflare exige `@opennextjs/cloudflare` y otro build; ver docs/DECISIONES.md.
