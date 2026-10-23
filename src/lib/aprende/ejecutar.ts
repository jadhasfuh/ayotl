import type { Prueba } from "./tipos";

export type Resultado = {
  salida: string[];
  error?: string;
  pruebas?: { ok: boolean; obtenido: string }[];
  tiempo?: boolean;        // se cortó por tardar demasiado
};

const LIMITE_MS = 3000;

/**
 * Corre código de una lección en un Worker nuevo (public/aprende/ejecutor.js)
 * y lo termina al acabar o a los tres segundos. Uno por ejecución: así un
 * ciclo infinito se mata sin más y nada de una corrida sobrevive a la otra.
 */
export function ejecutar(codigo: string, pruebas?: Prueba[]): Promise<Resultado> {
  return new Promise((resolver) => {
    let w: Worker;
    try {
      w = new Worker("/aprende/ejecutor.js");
    } catch (e) {
      resolver({ salida: [], error: String(e) });
      return;
    }
    const reloj = setTimeout(() => {
      w.terminate();
      resolver({ salida: [], tiempo: true });
    }, LIMITE_MS);
    w.onmessage = (e: MessageEvent<Resultado>) => {
      clearTimeout(reloj);
      w.terminate();
      resolver(e.data);
    };
    w.onerror = (e) => {
      clearTimeout(reloj);
      w.terminate();
      e.preventDefault();
      resolver({ salida: [], error: e.message || "Error" });
    };
    w.postMessage({ codigo, pruebas });
  });
}
