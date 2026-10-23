import type { ReactNode } from "react";

/**
 * El Markdown mínimo de las lecciones (ver lib/aprende/tipos.ts): párrafos,
 * listas con «- », **negrita**, `código` y [enlaces](url). Sin intérprete de
 * Markdown: el contenido lo escribimos nosotros y con esto alcanza.
 */
export function enLinea(s: string): ReactNode[] {
  return s.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g).map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{enLinea(p.slice(2, -2))}</strong>;
    if (p.startsWith("`") && p.endsWith("`")) return <code key={i}>{p.slice(1, -1)}</code>;
    const m = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(p);
    if (m) {
      const fuera = /^https?:/.test(m[2]);
      return <a key={i} href={m[2]} {...(fuera ? { target: "_blank", rel: "noopener" } : {})}>{m[1]}</a>;
    }
    return p;
  });
}

export function TextoRico({ texto }: { texto: string }) {
  return (
    <>
      {texto.split(/\n{2,}/).map((bloque, i) => {
        const renglones = bloque.split("\n");
        if (renglones.every((r) => r.startsWith("- "))) {
          return <ul key={i}>{renglones.map((r, j) => <li key={j}>{enLinea(r.slice(2))}</li>)}</ul>;
        }
        return <p key={i}>{enLinea(renglones.join(" "))}</p>;
      })}
    </>
  );
}
