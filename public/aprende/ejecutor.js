// Corre el código de las lecciones de /aprende, en un Worker y no en la página.
//
// - Un ciclo infinito no congela la pestaña: la página espera unos segundos y
//   termina el Worker (ver lib/aprende/ejecutar.ts).
// - El código no ve el DOM, ni las cookies, ni el localStorage del sitio.
// - Este fichero se sirve con su propia CSP (next.config.ts): permite
//   `new Function` y nada más; ni fetch ni importar scripts de fuera.
//
// Recibe { codigo, pruebas? } y contesta { salida, error?, pruebas? }.
// `salida` son los renglones de console.log ya formateados como en Node.

const MAX_RENGLONES = 300;

function formato(v, nivel, vistos) {
  const t = typeof v;
  if (t === "string") return nivel === 0 ? v : JSON.stringify(v).replace(/^"|"$/g, "'").replace(/\\"/g, '"');
  if (t === "number") return Object.is(v, -0) ? "-0" : String(v);
  if (t === "bigint") return v + "n";
  if (t === "undefined" || t === "boolean" || v === null) return String(v);
  if (t === "symbol") return v.toString();
  if (t === "function") return v.prototype && /^class\s/.test(Function.prototype.toString.call(v))
    ? `[class ${v.name || "(anónima)"}]` : `[Function: ${v.name || "(anónima)"}]`;
  if (vistos.has(v)) return "[Circular]";
  if (nivel > 3) return Array.isArray(v) ? "[Array]" : "[Object]";
  vistos.add(v);
  try {
    const f = x => formato(x, nivel + 1, vistos);
    if (Array.isArray(v)) {
      const partes = [];
      let huecos = 0;
      for (let i = 0; i < v.length; i++) {
        if (!(i in v)) { huecos++; continue; }
        if (huecos) { partes.push(`<${huecos} empty item${huecos > 1 ? "s" : ""}>`); huecos = 0; }
        if (partes.length >= 100) { partes.push(`... ${v.length - i} more items`); break; }
        partes.push(f(v[i]));
      }
      if (huecos) partes.push(`<${huecos} empty item${huecos > 1 ? "s" : ""}>`);
      return partes.length ? `[ ${partes.join(", ")} ]` : "[]";
    }
    if (v instanceof Map) {
      const partes = [...v].map(([k, x]) => `${f(k)} => ${f(x)}`);
      return `Map(${v.size}) ${partes.length ? `{ ${partes.join(", ")} }` : "{}"}`;
    }
    if (v instanceof Set) {
      const partes = [...v].map(f);
      return `Set(${v.size}) ${partes.length ? `{ ${partes.join(", ")} }` : "{}"}`;
    }
    if (v instanceof Error) return `${v.name}: ${v.message}`;
    const nombre = v.constructor && v.constructor !== Object ? v.constructor.name + " " : "";
    const claves = Object.keys(v);
    if (!claves.length) return nombre + "{}";
    const partes = claves.map(k => `${/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${f(v[k])}`);
    return `${nombre}{ ${partes.join(", ")} }`;
  } finally {
    vistos.delete(v);
  }
}

/** Para comparar con lo esperado: JSON, pero un Map o un Set también cuentan. */
function aJson(v) {
  return JSON.stringify(v, (_, x) =>
    x instanceof Map ? Object.fromEntries(x) : x instanceof Set ? [...x] : x === undefined ? null : x);
}

self.onmessage = (e) => {
  const { codigo, pruebas } = e.data;
  const salida = [];
  const imprimir = (...args) => {
    if (salida.length < MAX_RENGLONES) salida.push(args.map(a => formato(a, 0, new Set())).join(" "));
    else if (salida.length === MAX_RENGLONES) salida.push("… (demasiados renglones; corto aquí)");
  };
  const consola = { log: imprimir, info: imprimir, warn: imprimir, error: imprimir, table: imprimir };

  // Cada prueba se evalúa por separado: una que truena no tapa a las demás.
  const llamadas = (pruebas || []).map(p =>
    `(() => { try { return { ok: true, v: (${p.llamada}) }; } catch (e) { return { ok: false, e: String(e) }; } })()`);
  try {
    // "use strict": una variable sin declarar es error, no una global nueva.
    const fn = new Function("console", `"use strict";\n${codigo}\n;return [${llamadas.join(",\n")}];`);
    const res = fn(consola);
    self.postMessage({
      salida,
      pruebas: (pruebas || []).map((p, i) => {
        const r = res[i];
        if (!r.ok) return { ok: false, obtenido: r.e };
        let obtenido;
        try { obtenido = aJson(r.v); } catch { obtenido = String(r.v); }
        return { ok: obtenido === p.espera, obtenido: formato(r.v, 1, new Set()) };
      }),
    });
  } catch (err) {
    self.postMessage({ salida, error: `${err && err.name ? err.name + ": " : ""}${err && err.message ? err.message : String(err)}` });
  }
};
