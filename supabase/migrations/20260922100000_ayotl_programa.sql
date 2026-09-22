-- Programa Beta: seguimiento diario de los testers y su pago.
--
-- Regla acordada: un tester gana `programa.tarifa_dia` (20 MXN) por cada día
-- en que hizo algo real en al menos una de las apps. «Algo real» es un repaso
-- o examen en jlptest, o una partida en Daily Challenge. Mercadito vive en
-- otra Supabase y de momento se marca a mano (o por el panel).
--
-- El cruce es posible porque jlptest (`public`), Daily Challenge (`arcade`) y
-- este esquema comparten base y `auth`: el correo de Google del tester lleva a
-- `auth.users.id`, y ese id es la clave de `public.progreso`,
-- `public.resultados` y `arcade.partidas`. Sólo se LEE de esos esquemas.

-- ---------------------------------------------------------------------------
-- Datos extra del tester: el correo con el que entra a Play y a las apps (si
-- es otro que el del formulario) y el teléfono, para Mercadito y para CoDi.
alter table ayotl.testers add column if not exists email_google text
  check (email_google is null or (email_google = lower(btrim(email_google)) and email_google ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'));
alter table ayotl.testers add column if not exists telefono text
  check (telefono is null or telefono ~ '^\+?[0-9 ]{10,15}$');
alter table ayotl.testers add column if not exists nota text;

-- ---------------------------------------------------------------------------
-- Parámetros del programa: una sola fila.
create table if not exists ayotl.programa (
  id          smallint primary key default 1 check (id = 1),
  tarifa_dia  integer not null default 20 check (tarifa_dia >= 0),   -- MXN
  inicio      date,
  fin         date,
  actualizado_en timestamptz not null default now()
);
insert into ayotl.programa (id) values (1) on conflict (id) do nothing;

-- Un día completado por tester y app, con la evidencia que lo justificó.
create table if not exists ayotl.dias_prueba (
  id         bigint generated always as identity primary key,
  tester     bigint not null references ayotl.testers(id) on delete cascade,
  fecha      date not null,
  app        text not null check (app in ('mercadito', 'jlptest', 'dailychallenge')),
  evidencia  jsonb not null default '{}'::jsonb,   -- {"repasos": 12} · {"partidas": 1} · {"manual": "Adrián"}
  creado_en  timestamptz not null default now(),
  unique (tester, fecha, app)
);
create index if not exists dias_prueba_fecha on ayotl.dias_prueba (fecha desc);

-- Pagos hechos. El saldo es lo ganado menos esto.
create table if not exists ayotl.pagos (
  id          bigint generated always as identity primary key,
  tester      bigint not null references ayotl.testers(id) on delete cascade,
  monto       integer not null check (monto > 0),                   -- MXN
  fecha       date not null default (now() at time zone 'America/Mexico_City')::date,
  medio       text not null check (medio in ('codi', 'transferencia', 'efectivo', 'otro')),
  referencia  text,
  creado_en   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Saldos: días distintos con actividad × tarifa, menos lo pagado.
create or replace view ayotl.saldos as
  select t.id, t.nombre, t.email, coalesce(t.email_google, t.email) as email_google, t.telefono, t.apps,
         coalesce(d.dias, 0)                                   as dias,
         coalesce(d.dias, 0) * p.tarifa_dia                    as ganado,
         coalesce(pg.pagado, 0)                                as pagado,
         coalesce(d.dias, 0) * p.tarifa_dia - coalesce(pg.pagado, 0) as saldo,
         d.ultimo_dia
  from ayotl.testers t
  cross join ayotl.programa p
  left join (select tester, count(distinct fecha) as dias, max(fecha) as ultimo_dia
             from ayotl.dias_prueba group by tester) d on d.tester = t.id
  left join (select tester, sum(monto) as pagado from ayotl.pagos group by tester) pg on pg.tester = t.id
  where t.baja_en is null;

-- ---------------------------------------------------------------------------
-- Registrar un día: cruza cada tester con lo que hizo ese día en jlptest y
-- en Daily Challenge. Idempotente: se puede correr las veces que haga falta
-- para la misma fecha (actualiza la evidencia, no duplica).
--
-- Por defecto mira AYER en hora de México, que es cuando el cron lo corre.
--
-- Trampa conocida: jlptest guarda `hechosPorDia` con la fecha UTC del
-- navegador, así que un repaso a las 8 pm de Sahuayo queda bajo el día
-- siguiente. Se acepta tal cual: cada día de estudio sigue contando una vez,
-- sólo desplazado. `resultados` y `partidas` sí llevan timestamp y se
-- convierten a México.
create or replace function ayotl.registrar_dia(p_fecha date default ((now() at time zone 'America/Mexico_City')::date - 1))
returns table (tester bigint, app text, evidencia jsonb)
-- En SQL y no en plpgsql: ahí los nombres de las columnas de salida chocan
-- con los de las tablas («column reference "tester" is ambiguous»).
language sql security definer set search_path = '' as $$
  with cuentas as (
    select t.id as tester, u.id as usuario
    from ayotl.testers t
    join auth.users u on lower(u.email) = coalesce(t.email_google, t.email)
    where t.baja_en is null
  ),
  jlptest as (
    select c.tester, 'jlptest'::text as app,
           jsonb_strip_nulls(jsonb_build_object(
             'repasos', nullif((pr.datos->'hechosPorDia'->>to_char(p_fecha, 'YYYY-MM-DD'))::int, 0),
             'respuestas', nullif(r.n, 0)
           )) as evidencia
    from cuentas c
    left join public.progreso pr on pr.perfil = c.usuario::text
    left join lateral (
      select count(*)::int as n from public.resultados x
      where x.perfil = c.usuario::text
        and (x.creado at time zone 'America/Mexico_City')::date = p_fecha
    ) r on true
    where coalesce((pr.datos->'hechosPorDia'->>to_char(p_fecha, 'YYYY-MM-DD'))::int, 0) > 0 or r.n > 0
  ),
  arcade as (
    select c.tester, 'dailychallenge'::text as app,
           jsonb_build_object('partidas', count(*), 'mejor', max(pa.puntaje)) as evidencia
    from cuentas c
    join arcade.partidas pa on pa.usuario = c.usuario
      and (pa.creado_en at time zone 'America/Mexico_City')::date = p_fecha
    group by c.tester
  ),
  todo as (select * from jlptest union all select * from arcade),
  guardado as (
    insert into ayotl.dias_prueba (tester, fecha, app, evidencia)
    select todo.tester, p_fecha, todo.app, todo.evidencia from todo
    on conflict (tester, fecha, app) do update set evidencia = excluded.evidencia
    returning dias_prueba.tester, dias_prueba.app, dias_prueba.evidencia
  )
  select * from guardado;
$$;

-- ---------------------------------------------------------------------------
-- Permisos: igual que testers, nada para anon/authenticated. La función es
-- security definer (lee public, arcade y auth) y sólo la llama el servidor.
alter table ayotl.programa     enable row level security;
alter table ayotl.dias_prueba  enable row level security;
alter table ayotl.pagos        enable row level security;
grant all on ayotl.programa, ayotl.dias_prueba, ayotl.pagos to service_role;
grant select on ayotl.saldos to service_role;
revoke all on function ayotl.registrar_dia(date) from public;
grant execute on function ayotl.registrar_dia(date) to service_role;

-- ---------------------------------------------------------------------------
-- Cron: todos los días a las 6:00 de México (12:00 UTC; México ya no cambia
-- de hora) registra el día anterior. Sin secretos ni pg_net: es la misma base.
-- (El bloque va al final para que la prueba local lo recorte con sed.)
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    if exists (select 1 from cron.job where jobname = 'ayotl-registrar-dia') then perform cron.unschedule('ayotl-registrar-dia'); end if;
    perform cron.schedule('ayotl-registrar-dia', '0 12 * * *', $cron$ select ayotl.registrar_dia(); $cron$);
  end if;
end $$;
