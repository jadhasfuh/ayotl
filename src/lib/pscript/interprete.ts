import { ErrorPScript } from "./lexer";
import type { Expresion, Programa, Sentencia, Tipo } from "./parser";

/**
 * El intérprete.
 *
 * Esto **no** estaba en el compilador original, que sólo traduce a C. Se
 * añadió para la página: sin él habría que bajarse el C y compilarlo para
 * ver si un programa hace lo que uno creía, y una demo que no se puede
 * correr es media demo.
 *
 * `lec` toma los valores de una lista que se escribe aparte, porque en una
 * web no hay teclado que bloquee.
 */
const TOPE_PASOS = 200_000;   // un `mientras` mal escrito no cuelga la pestaña

export type Resultado = { salida: string[]; pasos: number };

export function ejecutar(programa: Programa, entradas: string[]): Resultado {
  const memoria = new Map<string, number | string>();
  const tipos = new Map(programa.simbolos.map((s) => [s.nombre, s.tipo]));

  /**
   * El tipo que tendría la expresión en el C generado. Hace falta para una
   * cosa concreta: en C, `7 / 2` entre enteros da 3, no 3.5. Sin esto, el
   * intérprete y el C generado daban resultados distintos con la misma
   * división, y el truco de sacar el resto —`a - (a / b) * b`— no
   * funcionaba en la página aunque sí en C.
   */
  const tipoDe = (e: Expresion): Tipo => {
    switch (e.clase) {
      case "lit": return e.tipo;
      case "var": return tipos.get(e.nombre) ?? "entero";
      case "neg": return tipoDe(e.de);
      case "bin": return tipoDe(e.izq) === "decimal" || tipoDe(e.der) === "decimal" ? "decimal" : "entero";
    }
  };
  const salida: string[] = [];
  const cola = [...entradas];
  let pasos = 0;

  const valor = (e: Expresion): number | string => {
    switch (e.clase) {
      case "lit": return e.valor;
      case "var": {
        const v = memoria.get(e.nombre);
        if (v === undefined) {
          throw new ErrorPScript(`La variable ${e.nombre} se usa antes de tener un valor`, e.linea, "ejecución");
        }
        return v;
      }
      case "neg": return -Number(valor(e.de));
      case "bin": {
        const a = valor(e.izq), b = valor(e.der);
        // `dec` es `float` en el C generado, o sea 32 bits. JavaScript
        // calcula en 64, así que 149.90 * 0.16 salía 173.884000 aquí y
        // 173.883987 en el programa compilado. `Math.fround` recorta cada
        // resultado a 32 bits y los dos vuelven a decir lo mismo.
        const aFloat = (n: number) => (tipoDe(e) === "decimal" ? Math.fround(n) : n);
        switch (e.op) {
          case "+": return typeof a === "string" || typeof b === "string" ? `${a}${b}` : aFloat(a + b);
          case "-": return aFloat(Number(a) - Number(b));
          case "*": return aFloat(Number(a) * Number(b));
          case "/": {
            if (Number(b) === 0) throw new ErrorPScript("División entre cero", e.linea, "ejecución");
            const division = Number(a) / Number(b);
            // Entre enteros, división entera: igual que el C que sale.
            return tipoDe(e.izq) === "entero" && tipoDe(e.der) === "entero"
              ? Math.trunc(division) : aFloat(division);
          }
          case ">": return a > b ? 1 : 0;
          case "<": return a < b ? 1 : 0;
          case ">=": return a >= b ? 1 : 0;
          case "<=": return a <= b ? 1 : 0;
          case "==": return a === b ? 1 : 0;
          case "!=": return a !== b ? 1 : 0;
          default: throw new ErrorPScript(`Operador desconocido: ${e.op}`, e.linea, "ejecución");
        }
      }
    }
  };

  const corre = (cuerpo: Sentencia[]) => {
    for (const n of cuerpo) {
      if (++pasos > TOPE_PASOS) {
        throw new ErrorPScript("El programa lleva demasiados pasos; ¿un mientras que no termina?", n.linea, "ejecución");
      }
      switch (n.clase) {
        case "decl":
          // Como en C: declarar no da valor. Usarla antes de asignarla avisa.
          break;
        case "asig": {
          const v = valor(n.valor);
          // Un entero se queda entero, como haría el C generado.
          const t = tipos.get(n.nombre);
          const guardado = typeof v === "number"
            ? (t === "entero" ? Math.trunc(v) : t === "decimal" ? Math.fround(v) : v)
            : v;
          memoria.set(n.nombre, guardado);
          break;
        }
        case "lec": {
          const crudo = cola.shift();
          if (crudo === undefined) {
            throw new ErrorPScript(`No hay más datos de entrada para ${n.nombre}`, n.linea, "ejecución");
          }
          const tipoLeido = tipos.get(n.nombre);
          memoria.set(n.nombre,
            tipoLeido === "caracter" ? crudo.trim().slice(0, 1)
              : tipoLeido === "decimal" ? Math.fround(Number(crudo))
              : Math.trunc(Number(crudo)));
          break;
        }
        case "imp": {
          const v = valor(n.valor);
          salida.push(typeof v === "number" && !Number.isInteger(v) ? v.toFixed(6) : String(v));
          break;
        }
        case "si":
          if (Number(valor(n.cond)) !== 0) corre(n.entonces);
          else if (n.sino) corre(n.sino);
          break;
        case "mientras":
          while (Number(valor(n.cond)) !== 0) {
            if (++pasos > TOPE_PASOS) {
              throw new ErrorPScript("El programa lleva demasiados pasos; ¿un mientras que no termina?", n.linea, "ejecución");
            }
            corre(n.cuerpo);
          }
          break;
      }
    }
  };

  corre(programa.cuerpo);
  return { salida, pasos };
}
