-- Sólo se paga lo que cae dentro del programa.
--
-- `en_periodo` ya impedía **registrar** días fuera de rango, pero la vista
-- que suma no lo comprobaba: los días registrados antes de mover las fechas
-- seguían contando. Al correr el inicio al 24 de septiembre quedaron dos
-- días de prueba (22 y 23) que ya no forman parte del programa.
--
-- Las filas no se borran: quedan como historia en `dias_prueba`, y lo que
-- cambia es que no suman.

create or replace view ayotl.dias_resumen as
  select d.tester, d.fecha,
         count(distinct d.app)::int as apps,
         array_agg(distinct d.app order by d.app) as cuales,
         case count(distinct d.app)
           when 1 then p.tarifa_1
           when 2 then p.tarifa_2
           else p.tarifa_3
         end::int as monto
  from ayotl.dias_prueba d
  cross join ayotl.programa p
  where p.id = 1
    and coalesce(d.fecha >= p.inicio, true)
    and coalesce(d.fecha <= p.fin, true)
  group by d.tester, d.fecha, p.tarifa_1, p.tarifa_2, p.tarifa_3;

grant select on ayotl.dias_resumen to service_role;
