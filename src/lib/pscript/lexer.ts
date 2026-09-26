/**
 * El analizador léxico de PScript, traído del original en Java.
 *
 * El orden de los tokens importa y es el mismo que tenía el `enum Tokens`:
 * las palabras reservadas van antes que el identificador, y `>=` antes que
 * `>`, porque se prueba en orden y gana el primero que casa.
 */
export type TipoToken =
  | "programa" | "inicio" | "fin" | "si" | "sino" | "endif" | "mientras" | "hacer"
  | "lec" | "imp" | "ent" | "dec" | "cart"
  | "ident" | "numero" | "decimal" | "caracter"
  | "mayi" | "mini" | "comp" | "compd" | "asig" | "may" | "min"
  | "mas" | "menos" | "por" | "entre" | "abre" | "cierra" | "coma" | "pyc"
  | "fdt";

export type Token = { tipo: TipoToken; lexema: string; linea: number; col: number };

/** Lo que casa cada token, probado en este orden. */
const REGLAS: [TipoToken, RegExp][] = [
  ["programa", /^programa\b/], ["inicio", /^inicio\b/], ["fin", /^fin\b/],
  ["si", /^si\b/], ["sino", /^sino\b/], ["endif", /^endif\b/],
  ["mientras", /^mientras\b/], ["hacer", /^hacer\b/],
  ["lec", /^lec\b/], ["imp", /^imp\b/],
  ["ent", /^ent\b/], ["dec", /^dec\b/], ["cart", /^cart\b/],
  // Una variable siempre empieza con @; así no chocan con las reservadas.
  ["ident", /^@[a-zA-Z][_a-zA-Z0-9]*/],
  ["decimal", /^[0-9]+\.[0-9]+/],
  ["numero", /^[0-9]+/],
  ["caracter", /^'[^']'/],
  ["mayi", /^>=/], ["mini", /^<=/], ["comp", /^==/], ["compd", /^!=/],
  ["asig", /^=/], ["may", /^>/], ["min", /^</],
  ["mas", /^\+/], ["menos", /^-/], ["por", /^\*/], ["entre", /^\//],
  ["abre", /^\(/], ["cierra", /^\)/], ["coma", /^,/], ["pyc", /^;/],
];

export class ErrorPScript extends Error {
  constructor(mensaje: string, public linea: number, public fase: "léxico" | "sintáctico" | "semántico" | "ejecución") {
    super(mensaje);
  }
}

export function analizar(fuente: string): Token[] {
  const tokens: Token[] = [];
  const lineas = fuente.split("\n");

  lineas.forEach((texto, i) => {
    let resto = texto;
    let col = 1;
    // Comentarios: del original no había, pero un editor sin comentarios es
    // un editor donde no se pueden explicar los ejemplos.
    const comentario = resto.indexOf("//");
    if (comentario >= 0) resto = resto.slice(0, comentario);

    while (resto.length > 0) {
      const espacios = resto.match(/^\s+/);
      if (espacios) { col += espacios[0].length; resto = resto.slice(espacios[0].length); continue; }

      const encontrado = REGLAS.find(([, re]) => re.test(resto));
      if (!encontrado) {
        throw new ErrorPScript(`Símbolo que no pertenece al lenguaje: «${resto[0]}»`, i + 1, "léxico");
      }
      const [tipo, re] = encontrado;
      const lexema = resto.match(re)![0];
      tokens.push({ tipo, lexema, linea: i + 1, col });
      col += lexema.length;
      resto = resto.slice(lexema.length);
    }
  });

  tokens.push({ tipo: "fdt", lexema: "", linea: lineas.length, col: 1 });
  return tokens;
}
