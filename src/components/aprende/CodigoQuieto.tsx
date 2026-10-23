import { resaltar } from "@/lib/aprende/resaltar";

/**
 * Código resaltado que no se edita ni se corre: el de las preguntas y el de
 * la lección leída de corrido. Sin "use client": sirve en los dos lados.
 */
export function CodigoQuieto({ codigo, numeros = true }: { codigo: string; numeros?: boolean }) {
  return (
    <div className="atari codigo-quieto">
      <pre className="atari-codigo"><code>
        {resaltar(codigo).map((linea, n) => (
          <span key={n} className="atari-linea">
            {numeros && <span className="atari-num" aria-hidden="true">{n + 1}</span>}
            {linea.map(([texto, clase], j) => <span key={j} className={`s-${clase}`}>{texto}</span>)}
            {"\n"}
          </span>
        ))}
      </code></pre>
    </div>
  );
}
