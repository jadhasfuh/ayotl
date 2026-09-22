-- La paga deja de ser plana y pasa a premiar usar las tres apps el mismo día:
--
--   1 app  ->  5 MXN     2 apps -> 10 MXN     3 apps -> 20 MXN
--
-- Es lo que interesa para la prueba cerrada de Play, donde lo que cuenta es
-- que las tengan instaladas y en uso, y de paso el salto de 10 a 20 hace que
-- valga la pena bajar la tercera.
--
-- `tarifa_dia` se queda como estaba (era la paga plana) para no romper nada
-- que la lea, pero ya no se usa para calcular: manda `tarifa_1/2/3`.

alter table ayotl.programa add column if not exists tarifa_1 smallint not null default 5
  check (tarifa_1 >= 0);
alter table ayotl.programa add column if not exists tarifa_2 smallint not null default 10
  check (tarifa_2 >= 0);
alter table ayotl.programa add column if not exists tarifa_3 smallint not null default 20
  check (tarifa_3 >= 0);

-- Un día de un tester, con cuántas apps tocó y lo que vale.
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
  group by d.tester, d.fecha, p.tarifa_1, p.tarifa_2, p.tarifa_3;

-- Saldos: lo ganado sale de sumar lo que vale cada día, no de multiplicar.
-- Se borra antes de crearla porque `create or replace view` no admite columnas
-- nuevas en medio, y aquí entra `dias_completos`.
drop view if exists ayotl.saldos;
create view ayotl.saldos as
  select t.id, t.nombre, t.email, coalesce(t.email_google, t.email) as email_google,
         t.telefono, t.apps,
         coalesce(d.dias, 0)                                   as dias,
         coalesce(d.completos, 0)                              as dias_completos,
         coalesce(d.ganado, 0)                                 as ganado,
         coalesce(pg.pagado, 0)                                as pagado,
         coalesce(d.ganado, 0) - coalesce(pg.pagado, 0)        as saldo,
         d.ultimo_dia
  from ayotl.testers t
  left join (
    select r.tester,
           count(*)                                   as dias,
           count(*) filter (where r.apps >= 3)        as completos,
           sum(r.monto)                               as ganado,
           max(r.fecha)                               as ultimo_dia
    from ayotl.dias_resumen r group by r.tester
  ) d on d.tester = t.id
  left join (select tester, sum(monto) as pagado from ayotl.pagos group by tester) pg on pg.tester = t.id
  where t.baja_en is null;

grant select on ayotl.dias_resumen, ayotl.saldos to service_role;
