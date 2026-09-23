-- El programa Beta se queda en dos apps: JLPTest y Daily Challenge.
--
-- Mercadito sale porque ya está publicada en las tiendas: no necesita la
-- prueba cerrada de Play y no tiene sentido pagar por probarla.
--
-- Tarifas nuevas: 5 por una app y 15 por las dos. El salto sigue premiando
-- usar las dos, que es lo que hace falta para los 14 días de Play.

update ayotl.programa
   set tarifa_1 = 5, tarifa_2 = 15, tarifa_3 = 15, actualizado_en = now()
 where id = 1;

-- Quien ya estaba apuntado a Mercadito se queda sólo con las otras dos.
update ayotl.testers
   set apps = array(select unnest(apps) except select 'mercadito'),
       actualizado_en = now()
 where 'mercadito' = any(apps);

-- La lista de apps válidas, sin Mercadito. `not valid` por costumbre de la
-- casa: si quedara alguna fila vieja fuera de la lista, que no reviente la
-- migración; lo nuevo sí la cumple.
do $$
begin
  if exists (select 1 from pg_constraint where conname = 'testers_apps_check') then
    alter table ayotl.testers drop constraint testers_apps_check;
  end if;
  alter table ayotl.testers add constraint testers_apps_check
    check (cardinality(apps) >= 1 and apps <@ array['jlptest', 'dailychallenge']) not valid;
end $$;

-- El cron de Mercadito deja de correr. El endpoint y el código se quedan:
-- si algún día vuelve al programa, basta con volver a programarlo.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron')
     and exists (select 1 from cron.job where jobname = 'ayotl-mercadito') then
    perform cron.unschedule('ayotl-mercadito');
  end if;
end $$;
