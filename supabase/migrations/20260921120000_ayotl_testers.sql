-- Ayotl: esquema propio dentro de la Supabase compartida con jlptest, igual
-- que hizo Daily Challenge con `arcade`.
--
-- TODO lo de este proyecto vive en `ayotl`. Ninguna migración de aquí toca
-- `public` (jlptest), `arcade` (Daily Challenge) ni `auth` (Supabase). Si un
-- día hay que mudarlo a su propio proyecto: `pg_dump -n ayotl` y listo.
--
-- Para que la API lo sirva hay que añadir `ayotl` a Settings → API →
-- Exposed schemas (una vez, a mano). Sin eso, supabase-js responde
-- "schema must be one of the following".

create schema if not exists ayotl;

-- Sólo el servidor entra a este esquema. `anon` y `authenticated` no tienen
-- ni `usage`: aunque alguien tuviera la llave publicable, la API le contesta
-- "permission denied" antes de mirar ninguna política.
grant usage on schema ayotl to service_role;

-- ---------------------------------------------------------------------------
-- Testers del programa Beta. Una fila por correo; apuntarse dos veces
-- actualiza la fila (upsert por email desde /api/beta).
--
-- Los `check` repiten lo que valida zod en el servidor a propósito: la base
-- es la última línea de defensa y no depende de que el código esté bien.
create table if not exists ayotl.testers (
  id             bigint generated always as identity primary key,
  nombre         text not null check (length(nombre) between 2 and 80),
  email          text not null unique
                 check (email = lower(btrim(email)) and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  plataforma     text not null check (plataforma in ('ios', 'android', 'web')),
  apps           text[] not null
                 check (cardinality(apps) >= 1 and apps <@ array['mercadito', 'jlptest', 'dailychallenge']),
  comentario     text check (comentario is null or length(comentario) <= 500),
  idioma         text not null default 'es' check (idioma in ('es', 'en')),
  -- HMAC de la IP (no la IP), sólo para contar altas por conexión y hora.
  ip_hash        text check (ip_hash is null or length(ip_hash) = 32),
  -- Para el correo de avisos: se marca al darse de baja, no se borra.
  baja_en        timestamptz,
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

comment on table ayotl.testers is 'Altas del programa Beta de ayotl.dev. Sólo escribe el servidor.';

create index if not exists testers_ip_hash_reciente on ayotl.testers (ip_hash, actualizado_en desc);

-- ---------------------------------------------------------------------------
-- RLS activa y SIN políticas: nadie que no sea service_role (que se la
-- salta) lee ni escribe. Es la regla 4 de la casa: lo que sólo escribe el
-- servidor va sin política y se toca con la llave secreta desde /api/beta,
-- que además valida, comprueba Turnstile y limita por IP.
alter table ayotl.testers enable row level security;

grant all on ayotl.testers to service_role;
-- `grant all on all tables` sólo alcanza a las tablas que existen al
-- correrlo; esto cubre las que vengan después.
alter default privileges in schema ayotl grant all on tables to service_role;
alter default privileges in schema ayotl grant all on sequences to service_role;

-- ---------------------------------------------------------------------------
-- Alternativa descartada: inserción pública directa desde el navegador con
-- la llave publicable. Queda documentada por si algún día hace falta (por
-- ejemplo, un sitio 100 % estático sin servidor). Cualquiera con la llave
-- pública podría llenar la tabla en bucle, así que iría con Turnstile
-- verificado en una función y no con una política suelta.
--
--   grant usage on schema ayotl to anon;
--   grant insert (nombre, email, plataforma, apps, comentario, idioma) on ayotl.testers to anon;
--   create policy testers_alta_publica on ayotl.testers
--     for insert to anon
--     with check (
--       length(nombre) between 2 and 80
--       and plataforma in ('ios', 'android', 'web')
--       and cardinality(apps) between 1 and 3
--     );
--   -- Sin política de select: quien inserta no puede leer lo de los demás
--   -- (y el insert debe ir sin `.select()` o falla por RLS).
