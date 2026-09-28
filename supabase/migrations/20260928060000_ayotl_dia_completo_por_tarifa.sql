-- Un día "completo" era el que tenía 3 apps. Desde que Mercadito salió del
-- programa sólo hay 2, así que la columna salía 0 para todo el mundo aunque
-- las tarifas ya estuvieran bien (tarifa_2 = tarifa_3 = 15).
--
-- Ahora completo es el día que cobra la tarifa más alta, sea cual sea. Así no
-- se vuelve a quedar viejo si un día entra o sale una app del programa.
create or replace view ayotl.saldos as
 SELECT t.id,
    t.nombre,
    t.email,
    COALESCE(t.email_google, t.email) AS email_google,
    t.telefono,
    t.apps,
    COALESCE(d.dias, 0::bigint) AS dias,
    COALESCE(d.completos, 0::bigint) AS dias_completos,
    COALESCE(d.ganado, 0::bigint) AS ganado,
    COALESCE(pg.pagado, 0::bigint) AS pagado,
    COALESCE(d.ganado, 0::bigint) - COALESCE(pg.pagado, 0::bigint) AS saldo,
    d.ultimo_dia
   FROM ayotl.testers t
     LEFT JOIN ( SELECT r.tester,
            count(*) AS dias,
            count(*) FILTER (WHERE r.monto >= GREATEST(p.tarifa_1, p.tarifa_2, p.tarifa_3)) AS completos,
            sum(r.monto) AS ganado,
            max(r.fecha) AS ultimo_dia
           FROM ayotl.dias_resumen r
             CROSS JOIN ayotl.programa p
          WHERE p.id = 1
          GROUP BY r.tester) d ON d.tester = t.id
     LEFT JOIN ( SELECT pagos.tester,
            sum(pagos.monto) AS pagado
           FROM ayotl.pagos
          GROUP BY pagos.tester) pg ON pg.tester = t.id
  WHERE t.baja_en IS NULL;
