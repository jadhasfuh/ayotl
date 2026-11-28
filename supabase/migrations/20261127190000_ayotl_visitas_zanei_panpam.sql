-- El contador de visitas admite dos sitios más: 'zanei' y 'panpam' (27-nov-2026).
-- La migración del 21-oct-2026 creó ayotl.visitas y ayotl.visitantes con un check de siete sitios. ZANEI (3-nov) se añadió a la
-- ruta /api/visita y al juego, pero ninguna migración amplió el check: si nadie lo cambió a mano, sus visitas se rechazan en
-- silencio (la ruta contesta 204 siempre). PanPam! llega hoy con el mismo problema. Se puede correr más de una vez.
alter table ayotl.visitas drop constraint if exists visitas_sitio_check;
alter table ayotl.visitas add constraint visitas_sitio_check
  check (sitio in ('ayotl', 'dc', 'jlptest', 'mercadito', 'warzone', 'kazan', 'procesion', 'zanei', 'panpam'));
alter table ayotl.visitantes drop constraint if exists visitantes_sitio_check;
alter table ayotl.visitantes add constraint visitantes_sitio_check
  check (sitio in ('ayotl', 'dc', 'jlptest', 'mercadito', 'warzone', 'kazan', 'procesion', 'zanei', 'panpam'));
