-- Dos requisitos que antes eran de palabra y ahora son de la base:
--
--   · Quien pruebe **Mercadito** tiene que dejar teléfono. Esa app vive en
--     otra Supabase y se entra con teléfono y PIN, así que sin él sus días
--     no se pueden cruzar con nada.
--   · Quien pruebe **Daily Challenge** tiene que dar una cuenta de Google.
--     Ahí se entra con «Entrar con Google»; con cualquier otro correo no hay
--     manera de saber quién jugó.
--
-- Van como `not valid` a propósito: las seis altas que ya existen se quedan
-- como están (varias entraron sin teléfono, antes de esta regla), pero
-- cualquier alta o cambio a partir de ahora sí las cumple. A esas seis se
-- les pide el teléfono por WhatsApp y al volver a apuntarse quedan al día.

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'testers_mercadito_telefono') then
    alter table ayotl.testers add constraint testers_mercadito_telefono
      check (not ('mercadito' = any(apps)) or telefono is not null) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'testers_daily_google') then
    alter table ayotl.testers add constraint testers_daily_google
      check (
        not ('dailychallenge' = any(apps))
        or coalesce(email_google, email) ~ '@(gmail|googlemail)\.com$'
      ) not valid;
  end if;
end $$;

-- Para verlo de un vistazo: a quién le falta algo para que sus días cuenten.
create or replace view ayotl.testers_incompletos as
  select id, nombre, coalesce(email_google, email) as correo_google, telefono, apps,
         ('mercadito' = any(apps) and telefono is null) as falta_telefono,
         ('dailychallenge' = any(apps)
          and coalesce(email_google, email) !~ '@(gmail|googlemail)\.com$') as falta_google
  from ayotl.testers
  where baja_en is null
    and (('mercadito' = any(apps) and telefono is null)
      or ('dailychallenge' = any(apps)
          and coalesce(email_google, email) !~ '@(gmail|googlemail)\.com$'));

grant select on ayotl.testers_incompletos to service_role;
