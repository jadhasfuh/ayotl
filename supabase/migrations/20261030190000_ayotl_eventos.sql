-- Lo que se cuenta además de las páginas: por ahora, cuántas cuentas se crean en
-- jlptest y de dónde llegó quien las crea (Adrián, 30-oct-2026: «¿de dónde salen los
-- que se registran?», después de declarar en Play «Interacciones en la app» y
-- «Ubicación aproximada» para estadísticas).
--
-- Igual que las visitas: contadores agregados por día, sin IP, sin cookies y sin
-- usuario. NO se cruza con la cuenta: el perfil no guarda de dónde llegó nadie (la
-- política de jlptest lo promete). De dónde llegó es la entrada de esa persona ese
-- día, que su navegador recuerda en localStorage; el servidor sólo ve el sitio
-- ('facebook', 'google', 'app', 'directo'…). Los eventos que acepta cada sitio
-- están en EVENTOS de src/app/api/visita/route.ts.

create table if not exists ayotl.eventos (
  fecha  date    not null,
  sitio  text    not null check (sitio in ('ayotl', 'dc', 'jlptest', 'mercadito', 'warzone', 'kazan', 'procesion')),
  evento text    not null check (evento ~ '^[a-z][a-z0-9-]{1,30}$'),
  origen text    not null check (length(origen) between 1 and 60),
  pais   text    not null check (pais ~ '^[A-Z0-9]{2}$'),
  app    boolean not null,
  veces  int     not null default 0,
  primary key (fecha, sitio, evento, origen, pais, app)
);

-- Un evento: suma uno. El día es el de México, como en las visitas.
create or replace function ayotl.sumar_evento(
  p_sitio text, p_evento text, p_origen text, p_pais text, p_app boolean
) returns void
language plpgsql security definer set search_path = '' as $$
declare
  d date := (now() at time zone 'America/Mexico_City')::date;
begin
  insert into ayotl.eventos as e (fecha, sitio, evento, origen, pais, app, veces)
  values (d, p_sitio, p_evento, p_origen, p_pais, p_app, 1)
  on conflict (fecha, sitio, evento, origen, pais, app) do update set veces = e.veces + 1;
end $$;

-- Sólo el servidor, como las visitas.
alter table ayotl.eventos enable row level security;
grant all on ayotl.eventos to service_role;
revoke all on function ayotl.sumar_evento(text, text, text, text, boolean) from public, anon, authenticated;
grant execute on function ayotl.sumar_evento(text, text, text, text, boolean) to service_role;

notify pgrst, 'reload schema';

-- Consultas (en el SQL Editor):
--
--   Cuentas nuevas de jlptest por día y de dónde llegaron:
--     select fecha, origen, sum(veces) from ayotl.eventos where sitio = 'jlptest' and evento = 'cuenta'
--     group by 1, 2 order by 1 desc, 3 desc;
--
--   Por país en los últimos 30 días:
--     select pais, sum(veces) from ayotl.eventos where evento = 'cuenta' and fecha >= current_date - 30
--     group by 1 order by 2 desc;
