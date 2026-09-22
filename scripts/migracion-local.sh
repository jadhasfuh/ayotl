#!/bin/bash
# Prueba la migración de `ayotl` en el Postgres 16 local antes de tocar
# producción. Crea una base desechable con stubs de los roles de Supabase y
# ejercita los `check`, el upsert por email y el conteo por IP.
set -euo pipefail
PSQL=/opt/homebrew/opt/postgresql@16/bin/psql
DB=ayotl_prueba
cd "$(dirname "$0")/.."
$PSQL -q -d postgres -c "drop database if exists $DB" -c "create database $DB"
$PSQL -q -v ON_ERROR_STOP=1 -d $DB <<'SQL'
-- stubs mínimos de lo que Supabase trae de fábrica
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin; end if;
end $$;
-- Los roles son de todo el clúster: si otro proyecto (Daily Challenge) ya
-- creó service_role sin bypassrls, hay que ponérselo, que es como viene en
-- Supabase. Sin esto el conteo de abajo da 0 y parece que la RLS lo tapa.
alter role service_role bypassrls;
SQL
for f in supabase/migrations/*.sql; do
  echo "--- $f"
  $PSQL -q -v ON_ERROR_STOP=1 -d $DB -f "$f"
done
$PSQL -v ON_ERROR_STOP=1 -d $DB <<'SQL'
\echo --- alta normal y upsert por email (debe quedar UNA fila, con los datos nuevos)
insert into ayotl.testers (nombre, email, plataforma, apps, ip_hash)
  values ('Ana', 'ana@ejemplo.mx', 'android', '{mercadito}', repeat('a', 32));
insert into ayotl.testers (nombre, email, plataforma, apps, comentario, ip_hash)
  values ('Ana López', 'ana@ejemplo.mx', 'ios', '{mercadito,jlptest}', 'Pixel 8', repeat('a', 32))
  on conflict (email) do update
    set nombre = excluded.nombre, plataforma = excluded.plataforma, apps = excluded.apps,
        comentario = excluded.comentario, actualizado_en = now();
select nombre, email, plataforma, apps, comentario from ayotl.testers;

\echo --- conteo por ip en la última hora (lo que hace /api/beta): debe dar 1
select count(*) from ayotl.testers where ip_hash = repeat('a', 32) and actualizado_en > now() - interval '1 hour';

\echo --- los check rechazan lo que no debe entrar (cada línea debe FALLAR)
\set ON_ERROR_STOP 0
insert into ayotl.testers (nombre, email, plataforma, apps) values ('B', 'b@ejemplo.mx', 'web', '{jlptest}');          -- nombre corto
insert into ayotl.testers (nombre, email, plataforma, apps) values ('Beto', 'Beto@Ejemplo.mx', 'web', '{jlptest}');   -- email sin normalizar
insert into ayotl.testers (nombre, email, plataforma, apps) values ('Beto', 'beto@ejemplo.mx', 'nokia', '{jlptest}'); -- plataforma
insert into ayotl.testers (nombre, email, plataforma, apps) values ('Beto', 'beto@ejemplo.mx', 'web', '{}');          -- sin apps
insert into ayotl.testers (nombre, email, plataforma, apps) values ('Beto', 'beto@ejemplo.mx', 'web', '{otra}');      -- app desconocida
\set ON_ERROR_STOP 1

\echo --- anon no puede ni ver el esquema (debe FALLAR); service_role sí
set role anon;
\set ON_ERROR_STOP 0
select count(*) from ayotl.testers;
\set ON_ERROR_STOP 1
reset role;
set role service_role;
select count(*) as visibles_para_service_role from ayotl.testers;
reset role;
SQL
echo "Migración OK en $DB"
