-- El programa Beta tiene principio y fin: los días fuera del periodo no
-- cuentan ni se pagan. `inicio` y `fin` ya existían en `ayotl.programa` pero
-- nadie los miraba; aquí se hacen valer.
--
-- Si están vacíos, se comporta como antes (cuenta cualquier día).

create or replace function ayotl.en_periodo(p_fecha date) returns boolean
language sql stable set search_path = '' as $$
  select coalesce(p_fecha >= p.inicio, true) and coalesce(p_fecha <= p.fin, true)
  from ayotl.programa p where p.id = 1
$$;

-- El cruce diario, ahora acotado al periodo.
create or replace function ayotl.registrar_dia(p_fecha date default ((now() at time zone 'America/Mexico_City')::date - 1))
returns table (tester bigint, app text, evidencia jsonb)
-- En SQL y no en plpgsql: ahí los nombres de las columnas de salida chocan
-- con los de las tablas («column reference "tester" is ambiguous»).
language sql security definer set search_path = '' as $$
  with cuentas as (
    select t.id as tester, u.id as usuario
    from ayotl.testers t
    join auth.users u on lower(u.email) = coalesce(t.email_google, t.email)
    where t.baja_en is null and ayotl.en_periodo(p_fecha)
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

-- Los días de Mercadito los mete el servidor de ayotl.dev (otra base, se
-- cruza por teléfono). Esta función sólo guarda lo que le digan, dentro del
-- periodo, para que la comprobación viva en un único sitio.
create or replace function ayotl.registrar_dia_externo(p_tester bigint, p_fecha date, p_app text, p_evidencia jsonb)
returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  if not ayotl.en_periodo(p_fecha) then return false; end if;
  insert into ayotl.dias_prueba (tester, fecha, app, evidencia)
  values (p_tester, p_fecha, p_app, coalesce(p_evidencia, '{}'::jsonb))
  on conflict (tester, fecha, app) do update set evidencia = excluded.evidencia;
  return true;
end $$;

revoke all on function ayotl.en_periodo(date) from public;
revoke all on function ayotl.registrar_dia_externo(bigint, date, text, jsonb) from public;
grant execute on function ayotl.en_periodo(date) to service_role;
grant execute on function ayotl.registrar_dia(date) to service_role;
grant execute on function ayotl.registrar_dia_externo(bigint, date, text, jsonb) to service_role;
