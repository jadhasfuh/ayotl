// Revisa los cursos de /aprende sin abrir el navegador:
//
// - corre cada programa de las explicaciones (en los dos idiomas) con el
//   mismo ejecutor que usa la página (public/aprende/ejecutor.js) y avisa si
//   truena o si no imprime nada;
// - corre la solución de cada ejercicio `escribe` contra sus pruebas, que
//   tienen que pasar todas, y el código inicial, que no debería pasarlas;
// - revisa que cada `elige` tenga su respuesta, que los huecos de `completa`
//   estén en el banco, que no falte ningún texto en un idioma y que los retos
//   enlazados existan.
//
// Uso: npm run aprende            (sólo errores y avisos)
//      npm run aprende -- --ver    (además, lo que imprime cada programa)
//      npm run aprende -- snake    (sólo un curso, o una lección por su id)
import { readFileSync } from "node:fs";
import { register } from "node:module";
import vm from "node:vm";

// Node corre TypeScript solo, pero no adivina la extensión de `./u01-fundamentos`.
register("data:text/javascript," + encodeURIComponent(`
export async function resolve(esp, ctx, sig) {
  try { return await sig(esp, ctx); }
  catch (e) {
    if (!esp.startsWith(".") || /\\.\\w+$/.test(esp)) throw e;
    try { return await sig(esp + ".ts", ctx); } catch { return sig(esp + "/index.ts", ctx); }
  }
}`));

const raiz = new URL("../", import.meta.url);
const { CURSOS } = await import(new URL("src/lib/aprende/index.ts", raiz));
const retos = new Set(JSON.parse(readFileSync(new URL("src/content/retos.json", raiz), "utf8")).retos.map((r) => r.slug));
const ejecutor = readFileSync(new URL("public/aprende/ejecutor.js", raiz), "utf8");

const ver = process.argv.includes("--ver");
const filtro = process.argv.slice(2).find((a) => !a.startsWith("--"));

function correr(codigo, pruebas) {
  let respuesta = null;
  const ctx = vm.createContext({ self: { postMessage: (m) => { respuesta = m; } } });
  vm.runInContext(ejecutor, ctx);
  ctx.__msg = { codigo, pruebas };
  try {
    vm.runInContext("self.onmessage({ data: __msg })", ctx, { timeout: 2000 });
  } catch (e) {
    return { salida: [], error: String(e), tiempo: /timed out/.test(String(e)) };
  }
  return respuesta;
}

let errores = 0, avisos = 0, lecciones = 0, ejercicios = 0;
const error = (donde, msg) => { errores++; console.log(`✗ ${donde}: ${msg}`); };
const aviso = (donde, msg) => { avisos++; console.log(`! ${donde}: ${msg}`); };
const textos = (v) => (typeof v === "string" ? [["*", v]] : Object.entries(v));
const vacio = (donde, nombre, v) => { if (!v || (typeof v !== "string" && (!v.es?.trim() || !v.en?.trim()))) error(donde, `falta texto en ${nombre}`); };

for (const curso of CURSOS) {
  if (filtro && filtro !== curso.id && !curso.unidades.some((u) => u.lecciones.some((l) => l.id === filtro))) continue;
  const ids = new Set();
  for (const unidad of curso.unidades) {
    for (const l of unidad.lecciones) {
      if (filtro && filtro !== curso.id && filtro !== l.id) continue;
      lecciones++;
      const donde0 = `${curso.id}/${l.id}`;
      if (ids.has(l.id)) error(donde0, "id repetido");
      ids.add(l.id);
      vacio(donde0, "titulo", l.titulo); vacio(donde0, "resumen", l.resumen);
      if (!l.pasos.some((p) => p.tipo === "explica")) error(donde0, "no tiene ninguna explicación");
      if (l.pasos.filter((p) => p.tipo !== "explica").length < 3) aviso(donde0, "menos de tres preguntas");
      for (const r of l.retos ?? []) if (!retos.has(r)) error(donde0, `el reto «${r}» no existe en retos.json`);
      l.pasos.forEach((p, i) => {
        const donde = `${donde0} #${i + 1} (${p.tipo})`;
        if (p.tipo === "explica") {
          vacio(donde, "titulo", p.titulo); vacio(donde, "texto", p.texto);
          if (p.programa) {
            for (const [idioma, codigo] of textos(p.programa.codigo)) {
              const r = correr(codigo);
              if (r.error) error(`${donde} [${idioma}]`, `el programa truena: ${r.error}`);
              else if (!r.salida.length) aviso(`${donde} [${idioma}]`, "el programa no imprime nada");
              if (ver && idioma !== "en") console.log(`— ${donde}\n  ${r.salida.join("\n  ")}`);
            }
          }
          return;
        }
        ejercicios++;
        if (p.tipo !== "ordena") vacio(donde, "porque", p.porque);
        vacio(donde, "pregunta", p.pregunta);
        if (p.tipo === "elige") {
          if (!(p.correcta >= 0 && p.correcta < p.opciones.length)) error(donde, "la respuesta correcta no está entre las opciones");
          const vistas = p.opciones.map((o) => JSON.stringify(o));
          if (new Set(vistas).size !== vistas.length) error(donde, "opciones repetidas");
        } else if (p.tipo === "completa") {
          const n = p.codigo.split("___").length - 1;
          if (n !== p.huecos.length) error(donde, `${n} huecos en el código y ${p.huecos.length} respuestas`);
          for (const h of p.huecos) if (!p.banco.includes(h)) error(donde, `«${h}» no está en el banco`);
          // si el banco tiene dos fichas iguales, que sea porque hay dos huecos iguales
          const cuenta = (lista, x) => lista.filter((y) => y === x).length;
          for (const b of new Set(p.banco)) if (cuenta(p.banco, b) > Math.max(1, cuenta(p.huecos, b))) error(donde, `ficha «${b}» repetida en el banco`);
        } else if (p.tipo === "ordena") {
          vacio(donde, "porque", p.porque);
          if (p.lineas.length < 3) error(donde, "menos de tres renglones");
        } else if (p.tipo === "escribe") {
          if (!p.pruebas.length) error(donde, "sin pruebas");
          const r = correr(p.solucion, p.pruebas);
          if (r.error) error(donde, `la solución truena: ${r.error}`);
          else r.pruebas.forEach((x, k) => { if (!x.ok) error(donde, `la solución no pasa ${p.pruebas[k].llamada}: dio ${x.obtenido}, se esperaba ${p.pruebas[k].espera}`); });
          for (const [idioma, inicial] of textos(p.inicial)) {
            const ri = correr(inicial, p.pruebas);
            if (!ri.error && !ri.tiempo && ri.pruebas.every((x) => x.ok)) error(`${donde} [${idioma}]`, "el código inicial ya pasa todas las pruebas");
          }
        }
      });
    }
  }
}

console.log(`\n${lecciones} lecciones, ${ejercicios} preguntas · ${errores} errores, ${avisos} avisos`);
process.exit(errores ? 1 : 0);
