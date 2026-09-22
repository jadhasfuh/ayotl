-- Lista de espera: quien llega cuando las 14 plazas ya están ocupadas.
--
-- Va en su propia tabla y no en `testers` con una bandera, porque no es lo
-- mismo: de un tester hacen falta teléfono, correo de Google y apps; de
-- alguien en espera basta el nombre y el correo. Mezclarlos obligaría a
-- llenar de `null` las columnas que sí son obligatorias para un tester.
--
-- Cuando se abra una plaza (o el programa siguiente), de aquí salen los
-- avisos. No se usa para nada más: es una lista de correos que dieron
-- permiso para que les escriba.

create table if not exists ayotl.espera (
  id             bigint generated always as identity primary key,
  nombre         text not null check (length(nombre) between 2 and 80),
  email          text not null unique
                 check (email = lower(btrim(email)) and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  comentario     text check (comentario is null or length(comentario) <= 500),
  idioma         text not null default 'es' check (idioma in ('es', 'en')),
  ip_hash        text check (ip_hash is null or length(ip_hash) = 32),
  -- Se marca al escribirle, para no avisar dos veces a la misma persona.
  avisado_en     timestamptz,
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

comment on table ayotl.espera is 'Lista de espera del programa Beta de ayotl.dev. Sólo escribe el servidor.';

create index if not exists espera_sin_avisar on ayotl.espera (creado_en) where avisado_en is null;

-- Igual que `testers`: RLS sin políticas, sólo entra el servidor con la
-- llave secreta desde /api/beta/espera.
alter table ayotl.espera enable row level security;
grant all on ayotl.espera to service_role;

-- Las plazas, ahora con cuánta gente espera detrás. Se borra antes porque
-- cambia lo que devuelve, y `create or replace` no admite eso.
drop function if exists ayotl.plazas();
create function ayotl.plazas()
returns table (cupo smallint, ocupadas bigint, libres int, en_espera bigint)
language sql stable security definer set search_path = '' as $$
  select p.cupo,
         (select count(*) from ayotl.testers t where t.baja_en is null) as ocupadas,
         greatest(p.cupo - (select count(*) from ayotl.testers t where t.baja_en is null), 0)::int as libres,
         (select count(*) from ayotl.espera) as en_espera
  from ayotl.programa p where p.id = 1
$$;

revoke all on function ayotl.plazas() from public;
grant execute on function ayotl.plazas() to service_role;
