/**
 * El aviso de que esto no es el sitio del negocio.
 *
 * Va en todas las muestras, arriba, pegado al borde superior y sin forma de
 * cerrarlo. Una página que pudiera pasar por el sitio oficial de alguien no
 * se publica; con el aviso, es lo que es: un ejemplo enseñable.
 *
 * Corto a propósito: como está pegado, cada línea de más tapa contenido al
 * bajar. Lo imprescindible es que no es suyo y que los datos son inventados.
 */
export function AvisoMuestra({ negocio }: { negocio: string }) {
  return (
    <div className="aviso">
      <div className="envoltura">
        <span>
          <b>Muestra no oficial.</b> Ejemplo hecho por <a href="https://ayotl.dev">Ayotl</a> para
          enseñárselo a {negocio}: no es su sitio y los datos son de ejemplo.
        </span>
      </div>
    </div>
  );
}
