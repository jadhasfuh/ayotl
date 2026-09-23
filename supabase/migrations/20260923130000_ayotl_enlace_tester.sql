-- Cada tester tiene su enlace para ver cómo va: ayotl.dev/mi/<token>.
--
-- Sin contraseñas ni correos de acceso a propósito. El trato con ellos es
-- por WhatsApp, así que el enlace se manda por ahí una vez y listo; una
-- pantalla de acceso con código sería más ceremonia que la propia prueba.
-- Lo que hay detrás del enlace son sus propios datos, nada más: si lo
-- comparte, enseña sus días y su saldo, no los de nadie.
--
-- 24 caracteres hexadecimales (12 bytes de azar): no se adivina probando.

alter table ayotl.testers add column if not exists token text;

update ayotl.testers
   set token = encode(extensions.gen_random_bytes(12), 'hex')
 where token is null;

alter table ayotl.testers alter column token set default encode(extensions.gen_random_bytes(12), 'hex');
alter table ayotl.testers alter column token set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'testers_token_key') then
    alter table ayotl.testers add constraint testers_token_key unique (token);
  end if;
end $$;

/**
 * Lo que ve un tester al abrir su enlace: sus datos, sus días y su saldo.
 * Devuelve una sola fila (o ninguna, si el enlace no vale).
 *
 * `security definer` porque la llama el servidor con la llave secreta, pero
 * filtrando por token: sin token no hay fila.
 */
create or replace function ayotl.mi_progreso(p_token text)
returns table (
  nombre text, email text, apps text[], telefono text,
  dias bigint, dias_completos bigint, ganado bigint, pagado bigint, saldo bigint,
  inicio date, fin date, tarifa_1 smallint, tarifa_2 smallint, tarifa_3 smallint,
  detalle jsonb
)
language sql stable security definer set search_path = '' as $$
  select s.nombre, s.email, s.apps, s.telefono,
         s.dias, s.dias_completos, s.ganado, s.pagado, s.saldo,
         p.inicio, p.fin, p.tarifa_1, p.tarifa_2, p.tarifa_3,
         coalesce((
           select jsonb_agg(jsonb_build_object('fecha', r.fecha, 'apps', r.cuales, 'monto', r.monto)
                            order by r.fecha desc)
           from ayotl.dias_resumen r where r.tester = t.id
         ), '[]'::jsonb) as detalle
  from ayotl.testers t
  join ayotl.saldos s on s.id = t.id
  cross join ayotl.programa p
  where t.token = p_token and p.id = 1 and t.baja_en is null
$$;

/** Para recuperar el enlace por correo: devuelve el token o nada. */
create or replace function ayotl.token_de(p_email text)
returns text
language sql stable security definer set search_path = '' as $$
  select t.token from ayotl.testers t
  where lower(btrim(p_email)) = any(ayotl.correos_de(t)) and t.baja_en is null
  limit 1
$$;

revoke all on function ayotl.mi_progreso(text) from public;
revoke all on function ayotl.token_de(text) from public;
grant execute on function ayotl.mi_progreso(text) to service_role;
grant execute on function ayotl.token_de(text) to service_role;
