-- Dos reglas nuevas del programa Beta:
--
--   1. Hay **14 plazas**. Cuando se llenan, el formulario deja de aceptar
--      altas nuevas (quien ya está puede seguir corrigiendo sus datos).
--   2. Quien entra se lleva **un mes de JLPTest completo**, de cortesía.
--
-- Lo segundo es la única vez que este esquema escribe fuera de `ayotl`: mete
-- una fila en `public.cortesias`, que es de jlptest. Se hace con una función
-- y no desde el servidor a pelo para que quede en un solo sitio, con su
-- nota, y para no repartir permisos de escritura sobre `public`.
-- Nada de DDL: `public` no se toca, sólo se le añade una fila por correo.

alter table ayotl.programa add column if not exists cupo smallint not null default 14
  check (cupo between 0 and 200);
alter table ayotl.programa add column if not exists dias_cortesia smallint not null default 30
  check (dias_cortesia between 0 and 365);

-- Plazas: cuántas hay, cuántas quedan.
create or replace function ayotl.plazas()
returns table (cupo smallint, ocupadas bigint, libres int)
language sql stable security definer set search_path = '' as $$
  select p.cupo,
         (select count(*) from ayotl.testers t where t.baja_en is null) as ocupadas,
         greatest(p.cupo - (select count(*) from ayotl.testers t where t.baja_en is null), 0)::int as libres
  from ayotl.programa p where p.id = 1
$$;

/**
 * La cortesía de JLPTest. Idempotente y sin recortar: si la persona ya tenía
 * una más larga (porque se apuntó dos veces, o porque se la diste a mano),
 * se queda la que vence más tarde.
 */
create or replace function ayotl.dar_cortesia(p_email text, p_dias int default null)
returns timestamptz
language plpgsql security definer set search_path = '' as $$
declare
  v_dias int;
  v_hasta timestamptz;
begin
  if p_email is null or p_email = '' then return null; end if;
  select coalesce(p_dias, p.dias_cortesia) into v_dias from ayotl.programa p where p.id = 1;
  if coalesce(v_dias, 0) <= 0 then return null; end if;
  v_hasta := now() + make_interval(days => v_dias);

  insert into public.cortesias (email, hasta, nota)
  values (lower(btrim(p_email)), v_hasta, 'programa beta de ayotl.dev')
  on conflict (email) do update
    set hasta = greatest(public.cortesias.hasta, excluded.hasta),
        nota  = coalesce(public.cortesias.nota, excluded.nota);

  return v_hasta;
end $$;

revoke all on function ayotl.plazas() from public;
revoke all on function ayotl.dar_cortesia(text, int) from public;
grant execute on function ayotl.plazas() to service_role;
grant execute on function ayotl.dar_cortesia(text, int) to service_role;
