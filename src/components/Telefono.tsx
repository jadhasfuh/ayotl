/**
 * Una captura montada en un teléfono.
 *
 * El marco es CSS, no una imagen: pesa nada, se adapta al tema y no hay que
 * mantener un PNG de un móvil que envejece cada dos años. Las proporciones
 * son las de un teléfono normal y la captura se recorta por arriba, que es
 * donde está lo que se quiere enseñar.
 *
 * Sin isla ni cámara dibujadas: tapaban justo la cabecera de cada app, que
 * es lo que da a entender de qué pantalla se trata.
 *
 * `apaisado` acuesta el teléfono para los juegos que se juegan así (War
 * Zone): la captura es 16:9 y pixel art, y se escala sin suavizar para que
 * los píxeles gordos sigan siendo gordos.
 */
export function Telefono({ imagen, alto = "corto", apaisado = false }: { imagen: string; alto?: "corto" | "largo"; apaisado?: boolean }) {
  if (apaisado) {
    return (
      <span className="telefono apaisado" aria-hidden="true">
        <img src={`/capturas/${imagen}.webp`} alt="" width={1280} height={720} loading="lazy" />
      </span>
    );
  }
  return (
    <span className={`telefono ${alto}`} aria-hidden="true">
      <img src={`/capturas/${imagen}.webp`} alt="" width={840} height={1800} loading="lazy" />
    </span>
  );
}
