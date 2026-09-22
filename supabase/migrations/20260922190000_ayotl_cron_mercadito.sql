-- El cron que cruza los días de Mercadito.
--
-- jlptest y Daily Challenge se cruzan en SQL porque comparten esta base;
-- Mercadito está en otra Supabase, así que hay que salir a la web: pg_net
-- pega a /api/cron/mercadito de ayotl.dev, que sí puede abrir las dos.
--
-- El secreto va en Vault y no en el comando: `cron.job` guarda el comando
-- entero y lo lee cualquiera que entre a la base. Antes de aplicar esto hay
-- que crear el secreto (una vez, desde el panel o por SQL):
--
--   select vault.create_secret('<el valor de CRON_SECRETO>', 'ayotl_cron_secreto');
--
-- Y recordar la trampa de siempre: `cron.job_run_details` dice `succeeded`
-- aunque la API conteste 500, porque net.http_post sólo encola. La respuesta
-- de verdad está en `net._http_response`.

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron')
     and exists (select 1 from pg_extension where extname = 'pg_net') then
    if exists (select 1 from cron.job where jobname = 'ayotl-mercadito') then
      perform cron.unschedule('ayotl-mercadito');
    end if;
    -- 12:10 UTC = 6:10 de México, diez minutos después del cruce en SQL.
    perform cron.schedule('ayotl-mercadito', '10 12 * * *', $cron$
      select net.http_post(
        url := 'https://ayotl.dev/api/cron/mercadito',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'X-Cron-Secret', (select decrypted_secret from vault.decrypted_secrets where name = 'ayotl_cron_secreto')
        ),
        body := '{}'::jsonb
      );
    $cron$);
  end if;
end $$;
