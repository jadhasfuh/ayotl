-- Conteo de visitas de todos los sitios de la casa (ayotl.dev, Daily Challenge,
-- jlptest, Mercadito y los juegos extra que viven dentro de Daily: War Zone,
-- Kazan y La procesión). Hasta hoy no sabíamos cuánta gente entra a ninguno.
--
-- Cada página vista manda un beacon a ayotl.dev/api/visita (está detrás de
-- Cloudflare, que dice el país sin que tengamos que mirar la IP) y el servidor
-- suma uno. Son contadores agregados por día: ni IP, ni cookies, ni usuario,
-- ni la dirección completa de la que se llegó (sólo el sitio: google, ayotl.dev…).
-- El «visitante único» lo decide el navegador: la primera página del día en
-- ese sitio cuenta como visitante nuevo (lo recuerda en su localStorage).
--
-- Dos tablas porque responden preguntas distintas y así no se multiplican las
-- filas: `visitas` es qué páginas se ven y de dónde se llega a ellas (cada
-- página vista), `visitantes` es quién entra (una vez por día y sitio).

create table if not exists ayotl.visitas (
  fecha  date    not null,
  sitio  text    not null check (sitio in ('ayotl', 'dc', 'jlptest', 'mercadito', 'warzone', 'kazan', 'procesion')),
  ruta   text    not null check (length(ruta) between 1 and 120),
  -- 'interno' = navegó dentro del sitio; 'directo' = sin referencia; 'app' = abrió
  -- la app de Play; si no, el sitio de origen ya normalizado ('google', 'ayotl.dev'…).
  origen text    not null check (length(origen) between 1 and 60),
  app    boolean not null,
  vistas int     not null default 0,
  primary key (fecha, sitio, ruta, origen, app)
);

create table if not exists ayotl.visitantes (
  fecha      date    not null,
  sitio      text    not null check (sitio in ('ayotl', 'dc', 'jlptest', 'mercadito', 'warzone', 'kazan', 'procesion')),
  -- Código de país de Cloudflare: 'MX', 'JP'…; 'XX' si no lo sabe.
  pais       text    not null check (pais ~ '^[A-Z0-9]{2}$'),
  -- Idioma del navegador ('es', 'en', 'ja'…), no el que eligió en el sitio.
  idioma     text    not null check (idioma ~ '^[a-z]{2,3}$' or idioma = '?'),
  movil      boolean not null,
  app        boolean not null,
  origen     text    not null check (length(origen) between 1 and 60),
  visitantes int     not null default 0,
  primary key (fecha, sitio, pais, idioma, movil, app, origen)
);

-- Una página vista: suma uno en `visitas` y, si es la primera del día de ese
-- navegador en ese sitio, uno en `visitantes`. El día es el de México.
create or replace function ayotl.sumar_visita(
  p_sitio text, p_ruta text, p_origen text, p_app boolean,
  p_nuevo boolean, p_pais text, p_idioma text, p_movil boolean
) returns void
language plpgsql security definer set search_path = '' as $$
declare
  d date := (now() at time zone 'America/Mexico_City')::date;
begin
  insert into ayotl.visitas as v (fecha, sitio, ruta, origen, app, vistas)
  values (d, p_sitio, p_ruta, p_origen, p_app, 1)
  on conflict (fecha, sitio, ruta, origen, app) do update set vistas = v.vistas + 1;

  if p_nuevo then
    insert into ayotl.visitantes as u (fecha, sitio, pais, idioma, movil, app, origen, visitantes)
    values (d, p_sitio, p_pais, p_idioma, p_movil, p_app, p_origen, 1)
    on conflict (fecha, sitio, pais, idioma, movil, app, origen) do update set visitantes = u.visitantes + 1;
  end if;
end $$;

-- El resumen de cabecera: un renglón por día y sitio.
--   entradas = vistas que llegaron de fuera (no 'interno'); de_google = las que llegaron de Google.
create or replace view ayotl.visitas_por_dia with (security_invoker = on) as
select coalesce(v.fecha, u.fecha)   as fecha,
       coalesce(v.sitio, u.sitio)   as sitio,
       coalesce(u.visitantes, 0)    as visitantes,
       coalesce(v.vistas, 0)        as vistas,
       coalesce(v.entradas, 0)      as entradas,
       coalesce(v.de_google, 0)     as de_google,
       coalesce(v.en_app, 0)        as vistas_en_app
from (
  select fecha, sitio,
         sum(vistas)                                       as vistas,
         sum(vistas) filter (where origen <> 'interno')    as entradas,
         sum(vistas) filter (where origen = 'google')      as de_google,
         sum(vistas) filter (where app)                    as en_app
  from ayotl.visitas group by fecha, sitio
) v
full join (
  select fecha, sitio, sum(visitantes) as visitantes
  from ayotl.visitantes group by fecha, sitio
) u on u.fecha = v.fecha and u.sitio = v.sitio;

-- Sólo el servidor: RLS sin políticas, y la función no la puede llamar nadie
-- más aunque tenga la llave publicable.
alter table ayotl.visitas    enable row level security;
alter table ayotl.visitantes enable row level security;
grant all on ayotl.visitas, ayotl.visitantes to service_role;
grant select on ayotl.visitas_por_dia to service_role;
revoke all on ayotl.visitas_por_dia from anon, authenticated;
revoke all on function ayotl.sumar_visita(text, text, text, boolean, boolean, text, text, boolean) from public, anon, authenticated;
grant execute on function ayotl.sumar_visita(text, text, text, boolean, boolean, text, text, boolean) to service_role;

-- Consultas de cabecera (en el SQL Editor):
--
--   Los últimos 14 días de todos los sitios:
--     select * from ayotl.visitas_por_dia where fecha >= current_date - 14 order by fecha desc, visitantes desc;
--
--   Totales por sitio en los últimos 30 días:
--     select sitio, sum(visitantes) visitantes, sum(vistas) vistas, sum(de_google) de_google
--     from ayotl.visitas_por_dia where fecha >= current_date - 30 group by 1 order by 2 desc;
--
--   Las páginas más vistas de Daily esta semana:
--     select ruta, sum(vistas) from ayotl.visitas where sitio = 'dc' and fecha >= current_date - 7 group by 1 order by 2 desc limit 20;
--
--   De dónde llega la gente (sin contar la navegación interna):
--     select sitio, origen, sum(vistas) from ayotl.visitas where origen <> 'interno' and fecha >= current_date - 30 group by 1, 2 order by 3 desc;
--
--   Países e idiomas:
--     select sitio, pais, idioma, sum(visitantes) from ayotl.visitantes where fecha >= current_date - 30 group by 1, 2, 3 order by 4 desc;
