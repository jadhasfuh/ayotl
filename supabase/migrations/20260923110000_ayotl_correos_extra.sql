-- Un tester puede tener cuenta en las apps con más de un correo.
--
-- El caso que lo destapó: Adrián se apuntó con su Gmail (el de Daily
-- Challenge y Play) pero su cuenta de JLPTest, con todo el progreso, es de
-- hotmail. El cruce miraba un solo correo, así que su examen no contaba.
-- Va a pasar con más gente: quien ya usaba jlptest antes de apuntarse tiene
-- su cuenta con el correo que le dio la gana.
--
-- `correos_extra` son correos adicionales del mismo tester. El principal
-- sigue siendo `email_google` (o `email`), que es el que manda para Play y
-- para Daily Challenge; éstos sólo suman para encontrar actividad.

alter table ayotl.testers add column if not exists correos_extra text[] not null default '{}';

-- Todos los correos de un tester, en minúsculas y sin repetir.
create or replace function ayotl.correos_de(t ayotl.testers) returns text[]
language sql immutable set search_path = '' as $$
  select array(
    select distinct lower(btrim(c))
    from unnest(array[coalesce(t.email_google, t.email)] || t.correos_extra) as c
    where c is not null and btrim(c) <> ''
  )
$$;

-- El cruce, ahora contra cualquiera de sus correos.
create or replace function ayotl.registrar_dia(p_fecha date default ((now() at time zone 'America/Mexico_City')::date - 1))
returns table (tester bigint, app text, evidencia jsonb)
-- En SQL y no en plpgsql: ahí los nombres de las columnas de salida chocan
-- con los de las tablas («column reference "tester" is ambiguous»).
language sql security definer set search_path = '' as $$
  with cuentas as (
    -- Una fila por tester y cuenta suya: quien tenga dos correos aparece dos
    -- veces, y sus dos actividades se suman al mismo tester.
    select t.id as tester, u.id as usuario
    from ayotl.testers t
    join auth.users u on lower(u.email) = any(ayotl.correos_de(t))
    where t.baja_en is null and ayotl.en_periodo(p_fecha)
  ),
  jlptest as (
    select c.tester, 'jlptest'::text as app,
           jsonb_strip_nulls(jsonb_build_object(
             'repasos', nullif(sum(coalesce((pr.datos->'hechosPorDia'->>to_char(p_fecha, 'YYYY-MM-DD'))::int, 0))::int, 0),
             'respuestas', nullif(sum(coalesce(r.n, 0))::int, 0)
           )) as evidencia
    from cuentas c
    left join public.progreso pr on pr.perfil = c.usuario::text
    left join lateral (
      select count(*)::int as n from public.resultados x
      where x.perfil = c.usuario::text
        and (x.creado at time zone 'America/Mexico_City')::date = p_fecha
    ) r on true
    group by c.tester
    having sum(coalesce((pr.datos->'hechosPorDia'->>to_char(p_fecha, 'YYYY-MM-DD'))::int, 0)) > 0
        or sum(coalesce(r.n, 0)) > 0
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

grant execute on function ayotl.correos_de(ayotl.testers) to service_role;
grant execute on function ayotl.registrar_dia(date) to service_role;
