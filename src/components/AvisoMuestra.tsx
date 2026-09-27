/**
 * El aviso de que esto no es el sitio del negocio.
 *
 * Va en todas las muestras, arriba, pegado al borde superior y sin forma de
 * cerrarlo. Una página que pudiera pasar por el sitio oficial de alguien no
 * se publica; con el aviso, es lo que es: un ejemplo enseñable.
 */
export function AvisoMuestra({ negocio }: { negocio: string }) {
  return (
    <div className="aviso">
      <div className="envoltura">
        <span>
          <b>Muestra no oficial.</b> La hizo <a href="https://ayotl.dev">Ayotl</a> como ejemplo de lo que
          se le podría construir a {negocio}. No es su sitio, no está hecha con ellos y los datos de
          esta página son de ejemplo.
        </span>
      </div>
    </div>
  );
}
