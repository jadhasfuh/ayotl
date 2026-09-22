-- El panel cruza el día de hoy solo, al abrirlo, para no depender del botón.
--
-- Como la página se renderiza en cada visita, hace falta un freno: sin él,
-- cada recarga abriría una conexión a la base de Mercadito y repetiría el
-- cruce. `tomar_cruce` es ese freno y además es atómico: si se abren dos
-- pestañas a la vez, sólo una se lleva el turno.

alter table ayotl.programa add column if not exists ultimo_cruce timestamptz;

create or replace function ayotl.tomar_cruce(p_minutos int default 5)
returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  v_tomado boolean;
begin
  update ayotl.programa
     set ultimo_cruce = now()
   where id = 1
     and (ultimo_cruce is null or ultimo_cruce < now() - make_interval(mins => greatest(p_minutos, 0)))
  returning true into v_tomado;
  return coalesce(v_tomado, false);
end $$;

revoke all on function ayotl.tomar_cruce(int) from public;
grant execute on function ayotl.tomar_cruce(int) to service_role;
