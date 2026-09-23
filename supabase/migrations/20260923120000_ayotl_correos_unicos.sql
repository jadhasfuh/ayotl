-- Ningún correo puede estar en dos testers.
--
-- `email` ya era único, pero `email_google` y `correos_extra` no: dos
-- personas podían apuntar el mismo correo y las dos cobrarían la actividad
-- de esa cuenta. Con un segundo correo por tester la tentación es evidente,
-- así que se cierra en la base y no sólo en el formulario.
--
-- Se hace con un disparador y no con un `unique`, porque lo que hay que
-- comparar es la unión de tres campos (uno de ellos un array) contra la de
-- todos los demás, y eso no cabe en un índice único normal.

-- Todos los correos de un tester: el de contacto, el de Google y los extra.
-- Antes sólo miraba `coalesce(email_google, email)`; incluir también el de
-- contacto hace que cuente la actividad de quien usó ese correo en una app,
-- y es lo que el disparador necesita comparar.
create or replace function ayotl.correos_de(t ayotl.testers) returns text[]
language sql immutable set search_path = '' as $$
  select array(
    select distinct lower(btrim(c))
    from unnest(array[t.email, t.email_google] || t.correos_extra) as c
    where c is not null and btrim(c) <> ''
  )
$$;

create or replace function ayotl.correos_sin_repetir() returns trigger
language plpgsql set search_path = '' as $$
declare
  v_otro text;
begin
  -- En un alta, la fila que tiene ese mismo correo de contacto no es «otra
  -- persona»: es la que el upsert de /api/beta va a actualizar (volver a
  -- apuntarse con el mismo correo es la forma de corregir tus datos). El
  -- disparador se dispara otra vez, ya como UPDATE, sobre esa fila.
  select t.nombre into v_otro
  from ayotl.testers t
  where t.id is distinct from new.id
    and not (tg_op = 'INSERT' and t.email = new.email)
    and ayotl.correos_de(t) && ayotl.correos_de(new)
  limit 1;

  if v_otro is not null then
    -- 23505 = unique_violation: /api/beta lo traduce a un mensaje claro.
    raise exception 'ese correo ya está apuntado por otra persona (%)', v_otro
      using errcode = '23505';
  end if;
  return new;
end $$;

drop trigger if exists testers_correos_unicos on ayotl.testers;
create trigger testers_correos_unicos
  before insert or update of email, email_google, correos_extra on ayotl.testers
  for each row execute function ayotl.correos_sin_repetir();

-- Lo mismo para la lista de espera contra los testers: si ya está dentro,
-- que no se apunte otra vez como si nada.
create index if not exists testers_correos_idx on ayotl.testers using gin (ayotl.correos_de(testers));

grant execute on function ayotl.correos_de(ayotl.testers) to service_role;
