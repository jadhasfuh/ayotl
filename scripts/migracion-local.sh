#!/bin/bash
# Prueba las migraciones de `ayotl` en el Postgres 16 local antes de tocar
# producción. Crea una base desechable con stubs de los roles de Supabase y de
# las tablas ajenas que lee `ayotl.registrar_dia` (auth, jlptest, arcade), y
# ejercita los `check`, el upsert por email, el conteo por IP, el cruce diario
# y los saldos.
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
create schema auth;
create table auth.users (id uuid primary key, email text);
-- lo que lee registrar_dia de jlptest (public) y Daily Challenge (arcade)
create table public.progreso (perfil text primary key, datos jsonb not null default '{}');
create table public.resultados (id bigserial primary key, perfil text not null, creado timestamptz not null default now());
create table public.cortesias (email text primary key, hasta timestamptz not null, nota text, creado timestamptz not null default now());
create schema arcade;
create table arcade.partidas (id bigserial primary key, usuario uuid not null, puntaje int not null, creado_en timestamptz not null default now());
SQL
for f in supabase/migrations/*.sql; do
  echo "--- $f"
  # pg_cron no existe en local: el bloque del cron va al final y se recorta
  sed '/^-- Cron:/,$d' "$f" | $PSQL -q -v ON_ERROR_STOP=1 -d $DB
done
$PSQL -v ON_ERROR_STOP=1 -d $DB <<'SQL'
\echo --- alta normal y upsert por email (debe quedar UNA fila, con los datos nuevos)
insert into ayotl.testers (nombre, email, plataforma, apps, ip_hash, telefono)
  values ('Ana', 'ana@gmail.com', 'android', '{mercadito}', repeat('a', 32), '3539990000');
insert into ayotl.testers (nombre, email, plataforma, apps, comentario, ip_hash, email_google, telefono)
  values ('Ana López', 'ana@gmail.com', 'ios', '{mercadito,jlptest}', 'Pixel 8', repeat('a', 32), 'ana.lopez@gmail.com', '3531234567')
  on conflict (email) do update
    set nombre = excluded.nombre, plataforma = excluded.plataforma, apps = excluded.apps,
        comentario = excluded.comentario, email_google = excluded.email_google, telefono = excluded.telefono,
        actualizado_en = now();
select nombre, email, email_google, telefono, plataforma, apps, comentario from ayotl.testers;

\echo --- conteo por ip en la última hora (lo que hace /api/beta): debe dar 1
select count(*) from ayotl.testers where ip_hash = repeat('a', 32) and actualizado_en > now() - interval '1 hour';

\echo --- los check rechazan lo que no debe entrar (cada línea debe FALLAR)
\set ON_ERROR_STOP 0
insert into ayotl.testers (nombre, email, plataforma, apps) values ('B', 'b@gmail.com', 'web', '{jlptest}');          -- nombre corto
insert into ayotl.testers (nombre, email, plataforma, apps) values ('Beto', 'Beto@Gmail.com', 'web', '{jlptest}');   -- email sin normalizar
insert into ayotl.testers (nombre, email, plataforma, apps) values ('Beto', 'beto@gmail.com', 'nokia', '{jlptest}'); -- plataforma
insert into ayotl.testers (nombre, email, plataforma, apps) values ('Beto', 'beto@gmail.com', 'web', '{}');          -- sin apps
insert into ayotl.testers (nombre, email, plataforma, apps) values ('Beto', 'beto@gmail.com', 'web', '{otra}');      -- app desconocida
update ayotl.testers set telefono = 'abc' where email = 'ana@gmail.com';                                             -- teléfono
\set ON_ERROR_STOP 1

\echo --- correos únicos: robarle el correo a otro tester debe FALLAR
\set ON_ERROR_STOP 0
insert into ayotl.testers (nombre, email, plataforma, apps, telefono) values ('Listillo', 'ana@gmail.com', 'web', '{jlptest}', '3535550000');
insert into ayotl.testers (nombre, email, plataforma, apps, telefono, email_google) values ('Listillo', 'listillo@gmail.com', 'web', '{jlptest}', '3535550000', 'ana@gmail.com');
insert into ayotl.testers (nombre, email, plataforma, apps, telefono, correos_extra) values ('Listillo', 'listillo@gmail.com', 'web', '{jlptest}', '3535550000', '{ana.lopez@gmail.com}');
\set ON_ERROR_STOP 1
\echo --- y un correo suyo de verdad sí entra
insert into ayotl.testers (nombre, email, plataforma, apps, telefono, correos_extra) values ('Listillo', 'listillo@gmail.com', 'web', '{jlptest}', '3535550000', '{listillo.viejo@hotmail.com}');
\echo --- y el tester puede seguir editando lo suyo sin chocar consigo mismo
update ayotl.testers set correos_extra = correos_extra || '{otro.mio@hotmail.com}' where email = 'listillo@gmail.com';
select nombre, correos_extra from ayotl.testers where email = 'listillo@gmail.com';

\echo --- requisitos: sin teléfono o sin gmail deben FALLAR, marque lo que marque
\set ON_ERROR_STOP 0
insert into ayotl.testers (nombre, email, plataforma, apps) values ('Sin Tel', 'sintel@gmail.com', 'web', '{jlptest}');
insert into ayotl.testers (nombre, email, plataforma, apps, telefono) values ('Sin Google', 'singoogle@ejemplo.mx', 'web', '{jlptest}', '3531110000');
\set ON_ERROR_STOP 1
\echo --- y estos SÍ deben entrar
insert into ayotl.testers (nombre, email, plataforma, apps, telefono) values ('Con Tel', 'contel@gmail.com', 'web', '{mercadito}', '3531234567');
insert into ayotl.testers (nombre, email, plataforma, apps, email_google, telefono) values ('Con Google', 'congoogle@ejemplo.mx', 'web', '{dailychallenge}', 'congoogle@gmail.com', '3531110001');
select nombre from ayotl.testers where email in ('contel@gmail.com','congoogle@ejemplo.mx') order by 1;
select count(*) as incompletos from ayotl.testers_incompletos;

\echo --- cruce diario: Ana (por su correo de Google) estudió y jugó el 2026-09-20; Beto no tiene cuenta
insert into ayotl.testers (nombre, email, plataforma, apps, telefono) values ('Beto', 'beto@gmail.com', 'web', '{jlptest}', '3532220000');
insert into auth.users values ('11111111-1111-1111-1111-111111111111', 'Ana.Lopez@gmail.com');
insert into public.progreso values ('11111111-1111-1111-1111-111111111111', '{"hechosPorDia": {"2026-09-20": 12}}');
insert into public.resultados (perfil, creado) values ('11111111-1111-1111-1111-111111111111', '2026-09-20 22:30-06');
insert into arcade.partidas (usuario, puntaje, creado_en) values
  ('11111111-1111-1111-1111-111111111111', 340, '2026-09-20 23:50-06'),   -- 05:50 UTC del 21: debe contar como el 20
  ('11111111-1111-1111-1111-111111111111', 120, '2026-09-21 09:00-06');
select * from ayotl.registrar_dia('2026-09-20');
\echo --- un segundo correo del mismo tester también cuenta
insert into auth.users values ('44444444-4444-4444-4444-444444444444', 'ana.vieja@hotmail.com');
insert into public.resultados (perfil, creado) values ('44444444-4444-4444-4444-444444444444', '2026-09-20 19:00-06');
update ayotl.testers set correos_extra = '{ana.vieja@hotmail.com}' where email = 'ana@gmail.com';
select app, evidencia from ayotl.registrar_dia('2026-09-20') where app = 'jlptest';

\echo --- otra vez (idempotente: mismas dos filas, sin duplicar)
select count(*) as filas from (select * from ayotl.registrar_dia('2026-09-20')) x;
select tester, fecha, app, evidencia from ayotl.dias_prueba order by app;
\echo --- el 21 sólo hay una partida
select app, evidencia from ayotl.registrar_dia('2026-09-21');
\echo --- tarifa por número de apps: el 20 tocó dos apps (10), el 21 sólo una (5)
select fecha, apps, cuales, monto from ayotl.dias_resumen order by fecha;

\echo --- saldos: Ana 10 + 5 = 15, paga 20, queda -5 (pagada de más); Beto 0
insert into ayotl.pagos (tester, monto, medio, referencia) select id, 20, 'codi', 'prueba' from ayotl.testers where email = 'ana@gmail.com';
select nombre, dias, ganado, pagado, saldo, ultimo_dia from ayotl.saldos order by nombre;

\echo --- plazas: 14 de cupo, y la lista de espera aparte
insert into ayotl.espera (nombre, email) values ('Curiosa', 'curiosa@ejemplo.mx');
select * from ayotl.plazas();

\echo --- cortesía: la primera la crea, la segunda no la recorta
select ayotl.dar_cortesia('ana@gmail.com', 30) is not null as creada;
select ayotl.dar_cortesia('ana@gmail.com', 1) is not null as segunda;
select email, (hasta > now() + interval '20 days') as sigue_larga, nota from public.cortesias;

\echo --- el freno del cruce: el primero se lo lleva, el segundo no
select ayotl.tomar_cruce(5) as primero, ayotl.tomar_cruce(5) as segundo;
\echo --- y pasados los minutos, vuelve a tocar
update ayotl.programa set ultimo_cruce = now() - interval '10 minutes';
select ayotl.tomar_cruce(5) as otra_vez;

\echo --- anon no puede ni ver el esquema (debe FALLAR); service_role sí
set role anon;
\set ON_ERROR_STOP 0
select count(*) from ayotl.testers;
select ayotl.registrar_dia('2026-09-20');
\set ON_ERROR_STOP 1
reset role;
set role service_role;
select count(*) as visibles_para_service_role from ayotl.testers;
select count(*) as saldos_visibles from ayotl.saldos;
reset role;
SQL
echo "Migración OK en $DB"
