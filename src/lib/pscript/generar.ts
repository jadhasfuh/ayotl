import type { Expresion, Programa, Sentencia, Simbolo, Tipo } from "./parser";

/**
 * La generación de código: PScript entra, C sale. Es lo que hacía el
 * original, y es la parte que más sorprende de un compilador de escuela:
 * no interpreta nada, escribe otro programa.
 *
 * Las variables pierden la arroba, `imp` se vuelve `printf` con el formato
 * del tipo y `lec` se vuelve `scanf` con su `&`.
 */
const EN_C: Record<Tipo, string> = { entero: "int", decimal: "float", caracter: "char" };
const FORMATO: Record<Tipo, string> = { entero: "%d", decimal: "%f", caracter: "%c" };

const enC = (nombre: string) => nombre.replace(/^@/, "");

function tipoDe(e: Expresion, simbolos: Map<string, Simbolo>): Tipo {
  switch (e.clase) {
    case "lit": return e.tipo;
    case "var": return simbolos.get(e.nombre)?.tipo ?? "entero";
    case "neg": return tipoDe(e.de, simbolos);
    case "bin": {
      const izq = tipoDe(e.izq, simbolos);
      const der = tipoDe(e.der, simbolos);
      return izq === "decimal" || der === "decimal" ? "decimal" : "entero";
    }
  }
}

/**
 * Precedencia, para poner paréntesis sólo donde hacen falta. Sin esto,
 * `@n - (@n / @d) * @d` salía como `n - n / d * d`: da lo mismo por
 * precedencia, pero quien lee el C no debería tener que comprobarlo.
 */
const PRECEDENCIA: Record<string, number> = {
  "*": 3, "/": 3, "+": 2, "-": 2,
  ">": 1, "<": 1, ">=": 1, "<=": 1, "==": 1, "!=": 1,
};

function expr(e: Expresion, fuera = 0): string {
  switch (e.clase) {
    case "var": return enC(e.nombre);
    case "lit": return e.tipo === "caracter" ? `'${e.valor}'` : String(e.valor);
    case "neg": return `-${expr(e.de, 4)}`;
    case "bin": {
      const mia = PRECEDENCIA[e.op] ?? 0;
      // El lado derecho se envuelve a igual precedencia: a - (b - c) no es
      // lo mismo que a - b - c.
      const texto = `${expr(e.izq, mia)} ${e.op} ${expr(e.der, mia + 1)}`;
      return mia < fuera ? `(${texto})` : texto;
    }
  }
}

export function generarC(programa: Programa): string {
  const simbolos = new Map(programa.simbolos.map((s) => [s.nombre, s]));
  const lineas: string[] = ["#include <stdio.h>", "", "int main(void) {"];

  function escribir(cuerpo: Sentencia[], sangria: number) {
    const s = "    ".repeat(sangria);
    for (const n of cuerpo) {
      switch (n.clase) {
        case "decl":
          lineas.push(`${s}${EN_C[n.tipo]} ${n.nombres.map(enC).join(", ")};`);
          break;
        case "asig":
          lineas.push(`${s}${enC(n.nombre)} = ${expr(n.valor)};`);
          break;
        case "lec": {
          const t = simbolos.get(n.nombre)?.tipo ?? "entero";
          lineas.push(`${s}scanf("${FORMATO[t]}", &${enC(n.nombre)});`);
          break;
        }
        case "imp": {
          const t = tipoDe(n.valor, simbolos);
          lineas.push(`${s}printf("${FORMATO[t]}\\n", ${expr(n.valor)});`);
          break;
        }
        case "si":
          lineas.push(`${s}if (${expr(n.cond)}) {`);
          escribir(n.entonces, sangria + 1);
          if (n.sino) {
            lineas.push(`${s}} else {`);
            escribir(n.sino, sangria + 1);
          }
          lineas.push(`${s}}`);
          break;
        case "mientras":
          lineas.push(`${s}while (${expr(n.cond)}) {`);
          escribir(n.cuerpo, sangria + 1);
          lineas.push(`${s}}`);
          break;
      }
    }
  }

  escribir(programa.cuerpo, 1);
  lineas.push("    return 0;", "}");
  return lineas.join("\n");
}
