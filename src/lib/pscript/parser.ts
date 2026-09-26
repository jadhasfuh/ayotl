import { analizar, ErrorPScript, type Token, type TipoToken } from "./lexer";

/**
 * El analizador sintáctico.
 *
 * El original es LR con tablas generadas (`Tablas.java`, 26 kB de números).
 * Aquí es descendente recursivo: reconoce la misma gramática y da los mismos
 * errores, pero se puede leer. Cada función es una regla.
 *
 *   programa      -> "programa" bloque
 *   bloque        -> sentencia*
 *   sentencia     -> declaración | asignación | lectura | impresión | si | mientras
 *   declaración   -> tipo ident ("," ident)* ";"
 *   asignación    -> ident "=" expresión ";"
 *   si            -> "si" expresión "inicio" bloque "fin" ("sino" "inicio" bloque "fin")? "endif"
 *   mientras      -> "mientras" expresión "hacer" "inicio" bloque "fin"
 *   expresión     -> suma ((">="|"<="|"=="|"!="|">"|"<") suma)?
 *   suma          -> producto (("+"|"-") producto)*
 *   producto      -> unario (("*"|"/") unario)*
 *   unario        -> "-"? primario
 *   primario      -> ident | número | decimal | carácter | "(" expresión ")"
 */

export type Tipo = "entero" | "decimal" | "caracter";

export type Expresion =
  | { clase: "var"; nombre: string; linea: number }
  | { clase: "lit"; valor: number | string; tipo: Tipo; lexema: string }
  | { clase: "bin"; op: string; izq: Expresion; der: Expresion; linea: number }
  | { clase: "neg"; de: Expresion; linea: number };

export type Sentencia =
  | { clase: "decl"; tipo: Tipo; nombres: string[]; linea: number }
  | { clase: "asig"; nombre: string; valor: Expresion; linea: number }
  | { clase: "lec"; nombre: string; linea: number }
  | { clase: "imp"; valor: Expresion; linea: number }
  | { clase: "si"; cond: Expresion; entonces: Sentencia[]; sino: Sentencia[] | null; linea: number }
  | { clase: "mientras"; cond: Expresion; cuerpo: Sentencia[]; linea: number };

export type Simbolo = { nombre: string; tipo: Tipo; linea: number };
export type Programa = { cuerpo: Sentencia[]; simbolos: Simbolo[]; tokens: Token[] };

const TIPOS: Record<string, Tipo> = { ent: "entero", dec: "decimal", cart: "caracter" };

export function compilar(fuente: string): Programa {
  const tokens = analizar(fuente);
  let i = 0;
  const simbolos = new Map<string, Simbolo>();

  const actual = () => tokens[i];
  const es = (t: TipoToken) => actual().tipo === t;
  const error = (mensaje: string, fase: "sintáctico" | "semántico" = "sintáctico") => {
    throw new ErrorPScript(mensaje, actual().linea, fase);
  };
  function comer(t: TipoToken, queEsperaba: string): Token {
    if (!es(t)) error(`Se esperaba ${queEsperaba} y llegó «${actual().lexema || "el final del archivo"}»`);
    return tokens[i++];
  }
  function declarada(nombre: string): Simbolo {
    const s = simbolos.get(nombre);
    if (!s) error(`La variable ${nombre} se usa sin haberse declarado`, "semántico");
    return s!;
  }

  function primario(): Expresion {
    const t = actual();
    if (es("ident")) { i++; declarada(t.lexema); return { clase: "var", nombre: t.lexema, linea: t.linea }; }
    if (es("numero")) { i++; return { clase: "lit", valor: Number(t.lexema), tipo: "entero", lexema: t.lexema }; }
    if (es("decimal")) { i++; return { clase: "lit", valor: Number(t.lexema), tipo: "decimal", lexema: t.lexema }; }
    if (es("caracter")) { i++; return { clase: "lit", valor: t.lexema.slice(1, -1), tipo: "caracter", lexema: t.lexema }; }
    if (es("abre")) {
      i++;
      const dentro = expresion();
      comer("cierra", "un paréntesis que cierre");
      return dentro;
    }
    error("Se esperaba una variable, un número o un paréntesis");
    throw new Error("inalcanzable");
  }

  function unario(): Expresion {
    if (es("menos")) { const t = tokens[i++]; return { clase: "neg", de: primario(), linea: t.linea }; }
    return primario();
  }

  function producto(): Expresion {
    let izq = unario();
    while (es("por") || es("entre")) {
      const op = tokens[i++];
      izq = { clase: "bin", op: op.lexema, izq, der: unario(), linea: op.linea };
    }
    return izq;
  }

  function suma(): Expresion {
    let izq = producto();
    while (es("mas") || es("menos")) {
      const op = tokens[i++];
      izq = { clase: "bin", op: op.lexema, izq, der: producto(), linea: op.linea };
    }
    return izq;
  }

  function expresion(): Expresion {
    const izq = suma();
    if (es("mayi") || es("mini") || es("comp") || es("compd") || es("may") || es("min")) {
      const op = tokens[i++];
      return { clase: "bin", op: op.lexema, izq, der: suma(), linea: op.linea };
    }
    return izq;
  }

  function bloqueHasta(...finales: TipoToken[]): Sentencia[] {
    const dentro: Sentencia[] = [];
    while (!finales.includes(actual().tipo)) {
      if (es("fdt")) error(`Falta cerrar el bloque: se esperaba «${finales[0]}»`);
      dentro.push(sentencia());
    }
    return dentro;
  }

  function sentencia(): Sentencia {
    const t = actual();

    if (es("ent") || es("dec") || es("cart")) {
      const tipo = TIPOS[tokens[i++].lexema];
      const nombres: string[] = [];
      do {
        const id = comer("ident", "un nombre de variable que empiece con @");
        if (simbolos.has(id.lexema)) error(`La variable ${id.lexema} ya estaba declarada`, "semántico");
        simbolos.set(id.lexema, { nombre: id.lexema, tipo, linea: id.linea });
        nombres.push(id.lexema);
      } while (es("coma") && ++i);
      comer("pyc", "un punto y coma");
      return { clase: "decl", tipo, nombres, linea: t.linea };
    }

    if (es("ident")) {
      const id = tokens[i++];
      declarada(id.lexema);
      comer("asig", "un signo = para asignar");
      const valor = expresion();
      comer("pyc", "un punto y coma");
      return { clase: "asig", nombre: id.lexema, valor, linea: id.linea };
    }

    if (es("lec")) {
      i++;
      const id = comer("ident", "la variable que se va a leer");
      declarada(id.lexema);
      comer("pyc", "un punto y coma");
      return { clase: "lec", nombre: id.lexema, linea: t.linea };
    }

    if (es("imp")) {
      i++;
      const valor = expresion();
      comer("pyc", "un punto y coma");
      return { clase: "imp", valor, linea: t.linea };
    }

    if (es("si")) {
      i++;
      const cond = expresion();
      comer("inicio", "la palabra inicio");
      const entonces = bloqueHasta("fin");
      comer("fin", "la palabra fin");
      let sino: Sentencia[] | null = null;
      if (es("sino")) {
        i++;
        comer("inicio", "la palabra inicio");
        sino = bloqueHasta("fin");
        comer("fin", "la palabra fin");
      }
      comer("endif", "la palabra endif para cerrar el si");
      return { clase: "si", cond, entonces, sino, linea: t.linea };
    }

    if (es("mientras")) {
      i++;
      const cond = expresion();
      comer("hacer", "la palabra hacer");
      comer("inicio", "la palabra inicio");
      const cuerpo = bloqueHasta("fin");
      comer("fin", "la palabra fin");
      return { clase: "mientras", cond, cuerpo, linea: t.linea };
    }

    error(`No se esperaba «${actual().lexema || "el final del archivo"}» aquí`);
    throw new Error("inalcanzable");
  }

  comer("programa", "la palabra programa al principio");
  const cuerpo = bloqueHasta("fdt");
  return { cuerpo, simbolos: [...simbolos.values()], tokens };
}

export { ErrorPScript };
