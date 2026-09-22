-- Teléfono y cuenta de Google pasan a ser obligatorios para todos, no sólo
-- según las apps marcadas.
--
-- El motivo es práctico: los enlaces de la prueba cerrada de Play se aceptan
-- con cuenta de Google, marque lo que marque, y el pago va por CoDi, que
-- necesita teléfono. Con las reglas condicionales quedaban altas a medias
-- (cinco de las seis primeras se apuntaron sin teléfono).
--
-- Siguen siendo `not valid`: las seis altas anteriores se quedan como están
-- y se les pide el dato por WhatsApp.

do $$
begin
  if exists (select 1 from pg_constraint where conname = 'testers_mercadito_telefono') then
    alter table ayotl.testers drop constraint testers_mercadito_telefono;
  end if;
  if exists (select 1 from pg_constraint where conname = 'testers_daily_google') then
    alter table ayotl.testers drop constraint testers_daily_google;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'testers_telefono') then
    alter table ayotl.testers add constraint testers_telefono
      check (telefono is not null) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'testers_google') then
    alter table ayotl.testers add constraint testers_google
      check (coalesce(email_google, email) ~ '@(gmail|googlemail)\.com$') not valid;
  end if;
end $$;

-- La vista de incompletos, con las reglas nuevas.
create or replace view ayotl.testers_incompletos as
  select id, nombre, coalesce(email_google, email) as correo_google, telefono, apps,
         (telefono is null) as falta_telefono,
         (coalesce(email_google, email) !~ '@(gmail|googlemail)\.com$') as falta_google
  from ayotl.testers
  where baja_en is null
    and (telefono is null
      or coalesce(email_google, email) !~ '@(gmail|googlemail)\.com$');
