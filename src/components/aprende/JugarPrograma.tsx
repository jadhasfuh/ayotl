"use client";

import { useRef, useState } from "react";

// cada tecla, hacia qué lado y cuánto gira la flecha (dibujada: las de la fuente no miden lo mismo)
const CRUCETA = [["ArrowUp", "arriba", 0], ["ArrowLeft", "izquierda", 270], ["ArrowDown", "abajo", 180], ["ArrowRight", "derecha", 90]] as const;

/**
 * El programa de un vídeo, jugándose en la página. Corre en un <iframe srcDoc>
 * (el mismo código de «Todo en uno»): tiene su propio documento, así que
 * «Otra partida» es montarlo de nuevo, y al salir de la página se acaba solo.
 * El programa sólo lee el teclado; la cruceta de pantalla le manda las mismas
 * teclas a su ventana. Un srcDoc hereda la CSP del sitio y no pasa por frame-src.
 */
export function JugarPrograma({ html, titulo, textos }: {
  html: string;
  titulo: string;
  textos: { jugar: string; otra: string; ayuda: string; arriba: string; abajo: string; izquierda: string; derecha: string };
}) {
  const [partida, setPartida] = useState(0);
  const marco = useRef<HTMLIFrameElement>(null);

  function tecla(code: string, baja: boolean) {
    const w = marco.current?.contentWindow as (Window & typeof globalThis) | null | undefined;
    w?.dispatchEvent(new w.KeyboardEvent(baja ? "keydown" : "keyup", { code, cancelable: true }));
  }

  return (
    <div className="programa">
      <div className="programa-pantalla">
        {partida > 0 ? (
          <iframe key={partida} ref={marco} srcDoc={html} title={titulo} onLoad={() => marco.current?.contentWindow?.focus()} />
        ) : (
          <button type="button" className="programa-jugar" onClick={() => setPartida(1)}>▶ {textos.jugar}</button>
        )}
      </div>
      {partida > 0 && (
        <div className="programa-mandos">
          <div className="programa-cruceta">
            {CRUCETA.map(([code, lado, giro]) => (
              <button key={code} type="button" data-lado={lado} aria-label={textos[lado]}
                      onPointerDown={(e) => { e.preventDefault(); tecla(code, true); }}
                      onPointerUp={() => tecla(code, false)} onPointerLeave={() => tecla(code, false)} onPointerCancel={() => tecla(code, false)}
                      onContextMenu={(e) => e.preventDefault()}>
                <svg viewBox="0 0 10 10" width="20" height="20" aria-hidden="true" style={{ transform: `rotate(${giro}deg)` }}><path d="M5 1.5 9 8H1z" fill="currentColor" /></svg>
              </button>
            ))}
          </div>
          <button type="button" className="boton secundario chico" onClick={() => setPartida(partida + 1)}>{textos.otra}</button>
        </div>
      )}
      <p className="dato">{textos.ayuda}</p>
    </div>
  );
}
