"use client";

/**
 * Interruptor claro/oscuro. Guarda la elección en localStorage y la aplica
 * como `data-tema` en <html>; el script inline del layout la lee antes de
 * pintar en las cargas siguientes. Sin elección guardada manda el sistema.
 */
export const CLAVE_TEMA = "ayotl.tema";

export function SelectorTema({ etiqueta }: { etiqueta: string }) {
  function alternar() {
    const raiz = document.documentElement;
    const actual = raiz.dataset.tema
      || (matchMedia("(prefers-color-scheme: dark)").matches ? "oscuro" : "claro");
    const nuevo = actual === "oscuro" ? "claro" : "oscuro";
    raiz.dataset.tema = nuevo;
    try { localStorage.setItem(CLAVE_TEMA, nuevo); } catch { /* modo privado */ }
  }
  return (
    <button type="button" className="icono-boton" onClick={alternar} aria-label={etiqueta} title={etiqueta}>
      <svg className="sol" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg className="luna" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    </button>
  );
}
