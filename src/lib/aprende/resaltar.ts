/**
 * Resaltado de JavaScript para el editor de las lecciones, con las mismas
 * clases que el de los retos (`s-kw`, `s-string`…), así sale con los colores
 * del vídeo. Es un tokenizador de una pasada, no un intérprete: le basta con
 * no equivocarse en cadenas y comentarios, que es lo que más se nota.
 *
 * Corre en el servidor (la lectura entera de la lección) y en el navegador
 * (en cada tecla del editor), así que no toca el DOM.
 */
export type Clase = "kw" | "type" | "builtin" | "string" | "number" | "comment" | "punct" | "func" | "ident" | "ws";
export type Tramo = [texto: string, clase: Clase];

const KW = new Set(("break case catch class const continue default delete do else export extends false finally for " +
  "function if import in instanceof let new null of return static super switch this throw true try typeof " +
  "undefined var void while yield async await").split(" "));
const BUILTIN = new Set(("console Math JSON Array Object Map Set WeakMap String Number Boolean Infinity NaN Date " +
  "Symbol Promise Error parseInt parseFloat structuredClone").split(" "));

const REGLAS: [RegExp, Clase][] = [
  [/^\/\/[^\n]*/, "comment"],
  [/^\/\*[\s\S]*?(\*\/|$)/, "comment"],
  [/^`(?:\\[\s\S]|[^`\\])*`?/, "string"],
  [/^"(?:\\.|[^"\\\n])*"?/, "string"],
  [/^'(?:\\.|[^'\\\n])*'?/, "string"],
  [/^(?:0x[\da-f]+|\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?n?)/i, "number"],
  [/^[A-Za-z_$][\w$]*/, "ident"],
  [/^[ \t]+/, "ws"],
  [/^[^\sA-Za-z_$\d]/, "punct"],
];

function linea(texto: string, enComentario: boolean): [Tramo[], boolean] {
  const tramos: Tramo[] = [];
  let resto = texto;
  // Un comentario /* … */ que viene del renglón anterior
  if (enComentario) {
    const fin = resto.indexOf("*/");
    if (fin < 0) return [[[resto, "comment"]], true];
    tramos.push([resto.slice(0, fin + 2), "comment"]);
    resto = resto.slice(fin + 2);
  }
  while (resto) {
    for (const [re, clase] of REGLAS) {
      const m = re.exec(resto);
      if (!m) continue;
      let c = clase;
      const t = m[0];
      if (c === "comment" && t.startsWith("/*") && !t.endsWith("*/")) {
        tramos.push([t, c]);
        return [tramos, true];
      }
      if (c === "ident") {
        if (KW.has(t)) c = "kw";
        else if (BUILTIN.has(t)) c = "builtin";
        else if (/^[A-Z]/.test(t)) c = "type";
        else if (/^\s*\(/.test(resto.slice(t.length))) c = "func";
      }
      tramos.push([t, c]);
      resto = resto.slice(t.length);
      break;
    }
  }
  return [tramos, false];
}

/** El código partido en renglones, y cada renglón en tramos con su clase. */
export function resaltar(codigo: string): Tramo[][] {
  let enComentario = false;
  return codigo.split("\n").map((l) => {
    const [tramos, sigue] = linea(l, enComentario);
    enComentario = sigue;
    return tramos;
  });
}
