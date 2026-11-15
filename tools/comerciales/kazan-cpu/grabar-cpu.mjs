// «La CPU de Kazan nunca descansa»: una isla jugada SOLO por computadoras, grabada para YouTube, Shorts e
// Instagram (27-oct-2026). Deja aquí mismo (tools/comerciales/kazan-cpu/):
//   largo.mp4       la partida entera, de la primera obra al ganador, 960x540 (3x sin suavizar), 30 fps, sin audio
//   corto-N.mp4     clips verticales de 6-10 s (1080x1920, sólo el mundo, más zoom) con lo mejor
//   escaleta.json   el segundo del largo en que pasa cada cosa (erupción, ataques, caídas, lava, ganador)
//                   y qué se ve en cada clip, para escribir la narración a tiempo
//
// Cómo se logra que juegue sólo la CPU sin tocar el juego: `M.nuevaLocal` siempre crea la nación 0 para quien
// juega; aquí, en el mismo instante, se le da su propia IA (crearIA del mismo módulo sim/ia.js, importado en la
// página) y se pone `M.yo = null` (espectador, sin niebla). Las ocho naciones se llaman CPU 1…8.
//
// La partida es determinista, así que primero se juega entera aquí en Node (medir: unos segundos) para saber
// dónde y cuándo pasa todo; con eso se decide la cámara (dirigir) y la velocidad, y luego Chrome sin ventana la
// repite paso a paso y se graba. Se comprueba que la de Chrome sea la misma (S.resumen cada 50 pasos).
//
// La cámara es nuestra, no la del juego: el mundo se pinta con el propio dibujo del juego (M.dibujar) en
// trozos de 272x136 (lo que queda libre del minimapa) que se pegan en un lienzo grande a 1x; de ahí se saca
// cualquier encuadre y zoom. A 3x (o 6x en los verticales) se escala sin suavizar; en los acercamientos y
// la vista general, con «sharp bilinear» (primero al entero de arriba sin suavizar, luego suave). El HUD, el
// minimapa, los avisos y el cartel final se copian de un dibujo normal encima. El bucle del juego
// (requestAnimationFrame) se apaga: cada cuadro avanza n pasos de simulación (M.pasos) y dos «fotogramas» de
// efectos (chispas, balas, avisos, sacudida) a 60 Hz, como haría el juego en un segundo de 30 cuadros.
//
//   node tools/comerciales/kazan-cpu/grabar-cpu.mjs                 (medir, largo, cortos y escaleta)
//   node tools/comerciales/kazan-cpu/grabar-cpu.mjs medir           (sólo la cronología, sin Chrome)
//   node tools/comerciales/kazan-cpu/grabar-cpu.mjs largo|cortos    (una parte; la escaleta se rehace siempre)
//   node tools/comerciales/kazan-cpu/grabar-cpu.mjs corto-3         (un clip, para afinarlo)
//   KAZAN_VER=0,250 node … medir                                    (cómo va la cámara en esos cuadros)
//   KAZAN_FOTOS=0,1950 KAZAN_DIR=… node … fotos                     (esos cuadros del largo a PNG, sin grabar)
//   KAZAN_IDIOMA=en node …                                          (los textos del juego en otro idioma)
//   node tools/comerciales/kazan-cpu/grabar-cpu.mjs buscar [semillas] (otra partida: ver más abajo; tarda)
//   KAZAN_SEMILLA=2 KAZAN_BIOMA=nieve KAZAN_NACIONES=8 KAZAN_ESCALA=4 KAZAN_LARGA=1 KAZAN_SALIDA=… node … largo|sonido
//                                                                   (la partida larga del 15-nov-2026, a 1280x720:
//                                                                    la lanza tools/comerciales/kazan-larga.py)
// La partida (semilla 2, desierto, 8 naciones, 20 min) se eligió entre 256 (4/5/6/8 naciones × los cuatro biomas
// × semillas 1-16) con la puntuación de `buscar`: conquistas, caídas por lava, bases tragadas y que acabe con
// una sola nación en pie y con su base. Fue la mejor: 5 conquistas, 2 naciones tragadas por la lava y final
// por conquista a los 18 min.
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const AQUI = path.dirname(new URL(import.meta.url).pathname);
const KAZAN = path.join(os.homedir(), 'Documents/kazan');
const S = await import(path.join(KAZAN, 'sim/sim.js'));
const { crearIA, ordenesIA } = await import(path.join(KAZAN, 'sim/ia.js'));
const PARTE = process.argv[2] || 'todo';

// ---------- La partida elegida ----------
// (15-nov-2026) La partida larga con el motor de hoy (tools/comerciales/kazan-larga.py) escoge otra y la graba a
// 1280x720: todo por variables de entorno, y sin ellas sale lo de siempre (semilla 2, desierto, 8 naciones, 960x540
// en esta carpeta). KAZAN_SEMILLA, KAZAN_BIOMA, KAZAN_NACIONES, KAZAN_MINUTOS: la partida. KAZAN_ESCALA=4: el largo a
// 1280x720 (4x sin suavizar). KAZAN_SALIDA: la carpeta donde quedan largo.mp4 y escaleta.json. KAZAN_LARGA=1: el
// montaje de la partida larga (más despacio, para que dure de 6 a 8 minutos) y una escaleta con más detalle (cada
// ejército que sale, cada base nueva, cómo va cada nación segundo a segundo y los sonidos del juego).
const ENV = process.env;
const SEMILLA = +(ENV.KAZAN_SEMILLA || 2), BIOMA = ENV.KAZAN_BIOMA || 'desierto', NACIONES = +(ENV.KAZAN_NACIONES || 8), MINUTOS = +(ENV.KAZAN_MINUTOS || 20);
const ESCALA = +(ENV.KAZAN_ESCALA || 3), AN = 320 * ESCALA, AL = 180 * ESCALA, AM = 136 * ESCALA;   // el largo: 960x540 a 3x, 1280x720 a 4x; AM, el alto del mundo
const SALIDA = ENV.KAZAN_SALIDA ? path.resolve(ENV.KAZAN_SALIDA) : AQUI;
const LARGA = ENV.KAZAN_LARGA === '1';
const IDIOMA = ENV.KAZAN_IDIOMA || 'es';
const NOMBRE_COL = ['AMARILLA', 'AZUL', 'ROSA', 'BLANCA', 'NARANJA', 'ROJA', 'MORADA', 'CIAN', 'LIMA', 'GRIS'];   // como render.js
const FPS = 30, T = S.TILE;
const nombre = j => `CPU ${j + 1}`;
const color = j => NOMBRE_COL[j % NOMBRE_COL.length];
const quien = j => `${nombre(j)} (${color(j).toLowerCase()})`;

// ---------- 1. Medir: la partida entera en Node, igual que nuevaLocal + la IA de la nación 0 ----------
// El orden importa (las órdenes se aplican en el orden de las IA): nuevaLocal mete las de las CPU 1..n y
// luego, en la página, se añade la de la nación 0 al final. Aquí igual.
function medir({ semilla = SEMILLA, bioma = BIOMA, naciones = NACIONES, minutos = MINUTOS } = {}) {
  const e = S.crear({ semilla, minutos, bioma, jugadores: naciones });
  S.agregarJugador(e, 'TU');
  const ias = [];
  for (let k = 0; k < naciones - 1; k++) { const j = S.agregarJugador(e, 'CPU ' + (k + 1), { cpu: true }); ias.push(crearIA(j, semilla + k)); }
  ias.push(crearIA(0, semilla + naciones - 1));
  e.jugadores.forEach((J, k) => { J.nombre = nombre(k); J.cpu = true; });   // como en la página (el nombre no entra en la simulación)
  const centro = b => ({ x: (b.x + b.w / 2) * T, y: (b.y + b.h / 2) * T });
  const tl = {
    ancho: e.ancho, alto: e.alto, erupcion: e.erupcion, duracion: e.duracion, volcan: { x: (e.volcan.x + 0.5) * T, y: (e.volcan.y + 0.5) * T },
    bases: e.jugadores.map(J => centro(e.edificios.find(b => b.due === J.id && b.tipo === 'base'))),
    disparos: [], explotas: [], caen: [], sinBase: [], marchas: [], obras: [], lavaTicks: [], lavaPct: {}, resumen: {}, fin: null,
    tierra: null, ejercitos: [],
    sonidos: [], conBase: [], estados: [], primeras: {},   // para la partida larga
  };
  // la tierra (para encuadrar la vista general en la isla y no en el mar)
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let i = 0; i < e.terreno.length; i++) if (e.terreno[i] !== 0) { const x = i % e.ancho, y = (i / e.ancho) | 0; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  tl.tierra = { x0: x0 * T, y0: y0 * T, x1: (x1 + 1) * T, y1: (y1 + 1) * T };
  const vivas = new Map();   // marchas en curso: ejército mandado contra una base
  const baseDe = {};         // la última base que terminó cada nación (si se mudó, la nueva)
  const ultimoGolpe = {};    // nación → { t, j }: la última vez que alguien le mató a alguien, y quién
  const estado = () => tl.estados.push({ t: e.tick, lava: +(100 * e.lavaPtr / e.lavaOrden.length).toFixed(1), n: e.jugadores.map(J => {
    let tropas = 0, gente = 0, edificios = 0;
    for (const u of e.unidades) if (u.due === J.id) { gente++; if (S.UNIDADES[u.tipo].dano > 0) tropas++; }
    for (const b of e.edificios) if (b.due === J.id && b.listo) edificios++;
    return { vivo: J.vivo, sinBase: !!J.sinBase, puntos: S.puntos(e, J), tropas, gente, edificios };
  }) });
  estado();
  while (!e.fin) {
    if (e.tick % (2 * S.TPS) === 0) for (const ia of ias) for (const o of ordenesIA(ia, e)) {
      if (o.t === 'atacar') {
        const b = e.edificios.find(x => x.id === o.blanco);
        if (b && b.tipo === 'base' && o.uds.length >= 3) {
          const m = { id: tl.marchas.length, j: ia.j, contra: b.due, t0: e.tick, uds: new Set(o.uds), n: o.uds.length, blanco: centro(b), pista: [] };
          tl.marchas.push(m); vivas.set(m.id, m);
        }
      }
      S.aplicar(e, ia.j, o);
    }
    const sinBaseAntes = e.jugadores.map(J => !!J.sinBase);
    S.tick(e);
    const t = e.tick, caen = new Set(e.eventos.filter(v => v.t === 'cae').map(v => v.j));
    let lavaN = 0, lx = 0, ly = 0;
    for (const v of e.eventos) {
      if (v.t === 'disparo') tl.disparos.push({ t, x: (v.x + v.bx) / 2, y: (v.y + v.by) / 2, bx: v.bx, by: v.by, j: v.j });
      else if (v.t === 'explota' && !caen.has(v.j)) tl.explotas.push({ t, x: v.x, y: v.y, j: v.j, tipo: v.tipo, lava: !!v.lava });
      else if (v.t === 'explota' && v.tipo === 'base') tl.explotas.push({ t, x: v.x, y: v.y, j: v.j, tipo: v.tipo, lava: !!v.lava, cae: true });
      else if (v.t === 'sinBase') { const b = tl.explotas.findLast(x => x.t === t && x.j === v.j && x.tipo === 'base') || tl.bases[v.j]; tl.sinBase.push({ t, j: v.j, x: b.x, y: b.y }); }   // la base que se tragó (si se mudó, la nueva)
      else if (v.t === 'conBase') tl.conBase.push({ t, j: v.j });
      else if (v.t === 'listo') { tl.obras.push({ t, j: v.j, tipo: v.tipo, x: v.x, y: v.y }); if (v.tipo === 'base') baseDe[v.j] = { x: v.x, y: v.y }; }
      else if (v.t === 'nace' && !tl.primeras[v.tipo]) tl.primeras[v.tipo] = { t, j: v.j, x: v.x, y: v.y };
      else if (v.t === 'lava') { lavaN++; lx += (v.x + 0.5) * T; ly += (v.y + 0.5) * T; }
      // lo que suena en el juego cuando se mira la partida (www/main.js, los `sonar` de cada evento; sin los que son sólo de quien juega)
      if (v.t === 'disparo') tl.sonidos.push({ t, s: 'disparo_' + (['franco', 'tanque', 'torre', 'artilleria', 'fortin', 'moto'].includes(v.tipo) ? v.tipo : 'soldado'), x: v.x, y: v.y });
      else if (v.t === 'muere' || v.t === 'explota' || v.t === 'bomba') tl.sonidos.push({ t, s: v.t, x: v.x, y: v.y });
      else if (v.t === 'lava' || v.t === 'tala') tl.sonidos.push({ t, s: v.t, x: (v.x + 0.5) * T, y: (v.y + 0.5) * T });
      else if (v.t === 'erupcion' || v.t === 'cae' || v.t === 'fin') tl.sonidos.push({ t, s: v.t });
    }
    for (const v of e.eventos) if (v.t === 'muere' && !v.lava) {   // quién mató a quién (el disparo no dice de quién es el blanco: el tiro más reciente a ese sitio)
      for (let k = tl.disparos.length - 1; k >= 0 && tl.disparos[k].t > t - 30; k--) { const d = tl.disparos[k]; if (d.j !== v.j && Math.hypot(d.bx - v.x, d.by - v.y) < 12) { ultimoGolpe[v.j] = { t, j: d.j }; break; } }
    }
    if (lavaN) tl.lavaTicks.push({ t, n: lavaN, x: lx / lavaN, y: ly / lavaN });
    for (const j of caen) {
      // (15-nov-2026, VERSION_SIM 21) cae por enemigos si le destruyeron la última base; si ya estaba sin base (se la
      // tragó la lava), cae cuando se queda sin gente: `remata` dice quién le mató a los últimos (null: la lava)
      const base = tl.explotas.find(x => x.t === t && x.j === j && x.tipo === 'base');
      const donde = base ? { x: base.x, y: base.y } : (baseDe[j] || tl.bases[j]);   // si se mudó, cae donde está su base de ahora
      const por = !sinBaseAntes[j] ? 'enemigos' : 'lava';
      const remata = por === 'lava' && ultimoGolpe[j] && t - ultimoGolpe[j].t <= 150 ? ultimoGolpe[j].j : null;
      // de quién: quién le disparó a esa base y a lo de alrededor en los últimos 40 s
      const golpes = {};
      for (let k = tl.disparos.length - 1; k >= 0 && tl.disparos[k].t > t - 400; k--) { const d = tl.disparos[k]; if (d.j !== j && Math.hypot(d.bx - donde.x, d.by - donde.y) < 48) golpes[d.j] = (golpes[d.j] || 0) + 1; }
      const cuenta = Object.entries(golpes).sort((a, b) => b[1] - a[1]);
      tl.caen.push({ t, j, por, x: donde.x, y: donde.y, quien: por === 'enemigos' && cuenta.length ? +cuenta[0][0] : null, ayudan: cuenta.slice(1).filter(c => c[1] >= 10).map(c => +c[0]), remata });
    }
    const pct = 100 * e.lavaPtr / e.lavaOrden.length;
    for (const p of [25, 50, 75]) if (pct >= p && tl.lavaPct[p] == null) tl.lavaPct[p] = t;
    if (t % 5 === 0) for (const m of vivas.values()) {
      const us = e.unidades.filter(u => m.uds.has(u.id));
      if (!us.length || t - m.t0 > 1200) { vivas.delete(m.id); continue; }
      const x = us.reduce((s, u) => s + u.x, 0) / us.length, y = us.reduce((s, u) => s + u.y, 0) / us.length;
      m.pista.push({ t, x, y, n: us.length });
      if (Math.hypot(x - m.blanco.x, y - m.blanco.y) < 6 * T && !m.llega) m.llega = t;
    }
    if (t % 50 === 0) tl.resumen[t] = S.resumen(e);
    if (t % 20 === 0 || caen.size) estado();
  }
  estado();
  tl.fin = { t: e.fin.tick, motivo: e.fin.motivo, tabla: e.fin.tabla.map(r => ({ id: r.id, puntos: r.puntos, vivo: r.vivo, sinBase: r.sinBase })) };
  tl.resumen[e.tick] = S.resumen(e);
  for (const m of tl.marchas) m.uds = undefined;
  return tl;
}


// ---------- 2. Dirigir: qué se ve, a qué velocidad y desde dónde, cuadro a cuadro ----------
// Todo en pasos de simulación (10 = 1 s de juego) hasta el final; luego se pasa a cuadros (30 por segundo
// de vídeo). Velocidad: 1 paso por cuadro (3x) en lo importante, 2 (6x) en lo demás y 3 (9x) en el arranque,
// cuando sólo se recoge y se construye. La cámara va por «tomas»: lo que no puede faltar (la apertura, la
// erupción, cada conquista, cada base que se traga la lava, la lava al 25/50/75 % en vista general y el final)
// y, en los huecos, el combate más intenso del momento, la marcha de un ejército o un paseo por las ciudades.
const VISTA_W = 320, VISTA_H = 136;   // lo que se ve del mundo a escala entera (a 3x en 960x540, a 4x en 1280x720)
const lerp = (a, b, u) => a + (b - a) * u;
const suave = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * u * (u * (u * 6 - 15) + 10);   // smootherstep

/** Los combates: los disparos agrupados en el espacio (radio 13 casillas) y en el tiempo (tramos de 50
 *  pasos que se enlazan si el centro no salta). Cada combate lleva su pista de centros y cuántos tiros. */
function combates(tl) {
  const tramos = new Map();
  for (const d of tl.disparos) { const k = Math.floor(d.t / 50); if (!tramos.has(k)) tramos.set(k, []); tramos.get(k).push(d); }
  const vivos = [], todos = [];
  for (const k of [...tramos.keys()].sort((a, b) => a - b)) {
    const grupos = [];
    for (const d of tramos.get(k)) {
      let g = grupos.find(g => Math.hypot(g.x - d.x, g.y - d.y) < 104);
      if (!g) { g = { x: d.x, y: d.y, n: 0, sx: 0, sy: 0, js: new Set() }; grupos.push(g); }
      g.n++; g.sx += d.x; g.sy += d.y; g.x = g.sx / g.n; g.y = g.sy / g.n; g.js.add(d.j);
    }
    for (const g of grupos) {
      const t = k * 50 + 25;
      let c = vivos.find(c => t - c.t1 <= 120 && Math.hypot(c.ultimo.x - g.x, c.ultimo.y - g.y) < 140);
      if (!c) { c = { t0: k * 50, t1: t, n: 0, pista: [], js: new Set() }; vivos.push(c); todos.push(c); }
      c.t1 = k * 50 + 50; c.n += g.n; c.pista.push({ t, x: g.x, y: g.y, n: g.n }); c.ultimo = g; for (const j of g.js) c.js.add(j);
    }
    for (let i = vivos.length - 1; i >= 0; i--) if (k * 50 - vivos[i].t1 > 120) vivos.splice(i, 1);
  }
  return todos.filter(c => c.n >= 12).map(c => ({ ...c, ultimo: undefined, js: [...c.js] }));
}
/** Un punto que sigue una pista [{t, x, y}] (interpolada; antes y después, sus extremos), suavizada ±w pasos. */
function sobrePista(pista, w = 60) {
  return t => {
    let sx = 0, sy = 0, sp = 0;
    for (const p of pista) { const d = Math.abs(p.t - t); if (d > w) continue; const peso = (1 - d / (w + 1)) * (p.n || 1); sx += p.x * peso; sy += p.y * peso; sp += peso; }
    if (sp) return { x: sx / sp, y: sy / sp };
    const p = t < pista[0].t ? pista[0] : pista[pista.length - 1]; return { x: p.x, y: p.y };
  };
}
/** El combate de los tiros cerca de un punto (radio r) entre t-60 y t+30; si no hay, el punto. Suavizado. */
function cercaDe(tl, x, y, r = 120) {
  const ds = tl.disparos.filter(d => Math.hypot(d.x - x, d.y - y) < r);
  return t => {
    let sx = 0, sy = 0, n = 0;
    for (const d of ds) if (d.t > t - 60 && d.t <= t + 30) { sx += d.x; sy += d.y; n++; }
    if (n < 3) return { x, y };
    const k = Math.min(1, n / 12);   // con pocos tiros, cerca de la base
    return { x: lerp(x, sx / n, k * 0.8), y: lerp(y, sy / n, k * 0.8) };
  };
}

function dirigir(tl) {
  const F = tl.fin.t, E = tl.erupcion;
  const t0 = tl.tierra, isla = { x: (t0.x0 + t0.x1) / 2, y: (t0.y0 + t0.y1) / 2 };
  const ZG = Math.min(AM / (t0.y1 - t0.y0 + 32), AN / (t0.x1 - t0.x0 + 32));   // la vista general: toda la tierra
  const general = { foco: () => isla, z: ZG };
  const fijo = (x, y) => () => ({ x, y });
  const ganador = tl.fin.tabla[0].id, ultima = tl.caen[tl.caen.length - 1];
  // lo que no puede faltar: [clave - antes, clave + despues] (lo preferido; min* = lo que no se recorta),
  // prioridad y qué enfocar
  const llaves = [];
  const llave = (o) => llaves.push({ minAntes: 0, minDespues: 0, z: ESCALA, ...o });
  llave({ tipo: 'apertura', clave: 0, antes: 0, despues: 120, prio: 100, ...general, desc: NACIONES === 8 ? 'la isla entera: ocho naciones, todas de la computadora' : `la isla entera: ${NACIONES} naciones, todas de la computadora` });
  const m1 = tl.marchas.find(m => m.j === ganador && m.n >= 8) || tl.marchas.find(m => m.n >= 8);
  if (m1) llave({ tipo: 'marcha', clave: m1.t0, antes: 30, despues: 330, minAntes: 20, minDespues: 150, prio: 60, foco: sobrePista([{ t: m1.t0, ...tl.bases[m1.j], n: 1 }, ...m1.pista], 40), desc: `sale el primer ejército: ${quien(m1.j)} va contra ${quien(m1.contra)}` });
  llave({ tipo: 'erupcion', clave: E, antes: 70, despues: 75, minAntes: 40, minDespues: 30, prio: 95, foco: fijo(tl.volcan.x, tl.volcan.y), desc: 'el volcán hace erupción' });
  for (const c of tl.caen) if (c.por === 'enemigos') llave({ tipo: c.t === F ? 'final' : 'conquista', clave: c.t, antes: 240, despues: c.t === F ? 0 : 50, minAntes: c.t === F ? 150 : 100, minDespues: c.t === F ? 0 : 30, prio: 90, foco: cercaDe(tl, c.x, c.y), desc: `cae ${quien(c.j)}, conquistada por ${quien(c.quien)}` });
  for (const s of tl.sinBase) llave({ tipo: 'sinBase', clave: s.t, antes: 110, despues: 40, minAntes: 70, minDespues: 30, prio: 70, foco: fijo(s.x, s.y), desc: `la lava se traga la base de ${quien(s.j)}` });
  for (const p of [25, 50, 75]) if (tl.lavaPct[p] != null && tl.lavaPct[p] < F - 300) llave({ tipo: 'lava' + p, clave: tl.lavaPct[p], antes: 20, despues: 300, minDespues: 160, prio: 60, ...general, desc: `vista general: la lava cubre el ${p} % de la isla` });
  // se acomodan por prioridad; si una nueva choca con otra ya puesta, se le recorta a la otra lo de antes o lo
  // de después hasta su mínimo; si ni así cabe, la nueva se queda fuera de cámara (sigue en la escaleta)
  const tomas = [];
  for (const l of [...llaves].sort((a, b) => b.prio - a.prio || a.clave - b.clave)) {
    let cabe = true, cambios = [];
    // en la partida larga, una conquista que no cabe (otra nación cayó segundos antes) se intenta con sólo 4 s de
    // juego por delante y dejando 0,8 s a la de antes: la cámara llega justo para verla caer
    for (const [minAntes, corto] of LARGA && l.tipo === 'conquista' ? [[l.minAntes, null], [40, 8]] : [[l.minAntes, null]]) {
      const a = Math.max(0, l.clave - minAntes), b = Math.min(F, l.clave + l.minDespues); cabe = true; cambios = [];
      for (const o of tomas) {
        if (!(a < o.tb && o.ta < b)) continue;
        if (o.clave < l.clave && a >= o.clave + (corto != null && o.tipo === 'conquista' ? corto : o.minDespues)) cambios.push([o, 'tb', a]);
        else if (o.clave > l.clave && b <= o.clave - o.minAntes) cambios.push([o, 'ta', b]);
        else { cabe = false; break; }
      }
      if (cabe) break;
    }
    if (!cabe) { console.log(`  (fuera de cámara: ${l.desc} a los ${reloj(l.clave)})`); continue; }
    for (const [o, k, v] of cambios) o[k] = v;
    const t = { ...l, ta: Math.max(0, l.clave - l.antes), tb: Math.min(F, l.clave + l.despues) };
    for (const o of tomas) { if (o.clave < l.clave) t.ta = Math.max(t.ta, o.tb); else t.tb = Math.min(t.tb, o.ta); }
    tomas.push(t);
  }
  tomas.sort((a, b) => a.ta - b.ta);
  // los huecos: el combate más intenso; si no hay, una marcha; si no, una ciudad viva (la que lleve más sin verse)
  const peleas = combates(tl);
  const junto = (x, y) => { let mj = -1, md = 170; tl.bases.forEach((b, j) => { const d = Math.hypot(b.x - x, b.y - y); if (d < md) { md = d; mj = j; } }); return mj; };
  const visto = new Map(), vistas = new Set();
  const relleno = [];
  const llenar = (ga, gb) => {
    if (gb - ga < 150) return;   // menos de 5 s a 3x: lo cubre la toma de antes
    let mejor = null, mp = 0;
    for (const c of peleas) {
      const a = Math.max(ga, c.t0 - 20), b = Math.min(gb, c.t1 + 20); if (b - a < 150) continue;
      // los tiros de este tramo; vale más junto a una base (se ve la ciudad) que en el campo abierto, donde la
      // cámara se queda con cuatro muñecos en la arena; y menos si ya se vio
      const ps = c.pista.filter(p => p.t >= a && p.t <= Math.min(b, a + 360)), fuerte = ps.slice().sort((x, y) => y.n - x.n)[0] || c.pista[0], jb = junto(fuerte.x, fuerte.y);
      const n = ps.reduce((s, p) => s + p.n, 0) * (vistas.has(c) ? 0.25 : 1) * (jb >= 0 ? 1.5 : 0.5);
      if (n > mp) { mp = n; mejor = { ta: a, tb: Math.min(b, a + 360), tipo: 'combate', pelea: c, junto: jb, disparan: c.js, foco: sobrePista(c.pista, 50), z: ESCALA, desc: `combate${jb >= 0 ? ' junto a la base de ' + quien(jb) : ' en campo abierto'}; disparan ${c.js.map(quien).join(', ')}` }; }
    }
    if (mejor && mp >= 20) vistas.add(mejor.pelea);
    if (!mejor || mp < 20) {
      const m = tl.marchas.filter(m => m.pista.length > 20 && m.t0 < gb - 90 && m.pista[m.pista.length - 1].t > ga + 90).sort((a, b) => b.n - a.n)[0];
      if (m) { const a = Math.max(ga, m.t0), b = Math.min(gb, m.pista[m.pista.length - 1].t, a + 600); if (b - a >= 240) mejor = { ta: a, tb: b, tipo: 'marcha', j: m.j, contra: m.contra, n: m.n, foco: sobrePista(m.pista, 40), z: ESCALA, desc: `marcha: un ejército de ${quien(m.j)} cruza la isla (lo mandaron contra ${quien(m.contra)})` }; }
    }
    if (!mejor) {
      const vivasEn = j => !tl.caen.some(c => c.j === j && c.t <= ga) && !tl.sinBase.some(s => s.j === j && s.t <= ga);
      // el paseo por las ciudades: primero la del ganador, luego la más cercana a la anterior
      const prev = visto.size ? tl.bases[[...visto.entries()].sort((a, b) => b[1] - a[1])[0][0]] : null;
      const js = tl.bases.map((b, j) => j).filter(vivasEn).filter(j => !visto.has(j) || visto.size >= tl.bases.length)
        .sort((a, b) => (a === ganador ? -1 : b === ganador ? 1 : 0) || (prev ? Math.hypot(tl.bases[a].x - prev.x, tl.bases[a].y - prev.y) - Math.hypot(tl.bases[b].x - prev.x, tl.bases[b].y - prev.y) : a - b));
      if (!js.length) return;
      const j = prev ? js.find(j => j !== ganador) ?? js[0] : js[0]; visto.set(j, ga);
      mejor = { ta: ga, tb: Math.min(gb, ga + (ga < 1200 ? 640 : 400)), tipo: 'ciudad', j, foco: fijo(tl.bases[j].x, tl.bases[j].y + 12), z: ESCALA, desc: `la ciudad de ${quien(j)}` };
    }
    relleno.push(mejor); llenar(ga, mejor.ta); llenar(mejor.tb, gb);
  };
  let ant = 0;
  for (const t of tomas) { llenar(ant, t.ta); ant = Math.max(ant, t.tb); }
  llenar(ant, F);
  tomas.push(...relleno); tomas.sort((a, b) => a.ta - b.ta);
  // los huecos chicos que quedan: los cubre la toma de antes
  for (let i = 0; i < tomas.length; i++) { const sig = tomas[i + 1]; tomas[i].tb = sig ? sig.ta : F; }
  // la velocidad de cada paso (pasos por cuadro: 1 = 3x). En la partida larga (KAZAN_LARGA) va más despacio, y
  // KAZAN_VEL=inicio,resto,combate,clave,apertura la afina; 0.5 es un paso cada dos cuadros (1,5x: el juego de verdad
  // da 10 pasos por segundo y no interpola, así que a 15 pasos por segundo se sigue viendo fluido)
  const V = (ENV.KAZAN_VEL || (LARGA ? '2,2,1,0.5,1' : '3,2,1,1,1')).split(',').map(Number);
  const vel = new Float32Array(F + 1).fill(V[1]);
  for (let t = 0; t < Math.min(F, (m1 ? m1.t0 : 1400) - 30); t++) vel[t] = V[0];
  for (const t of tomas) {
    const v = ['erupcion', 'conquista', 'final', 'sinBase'].includes(t.tipo) ? V[3] : t.tipo === 'combate' ? V[2] : null;
    if (v) for (let k = t.ta; k < t.tb; k++) vel[k] = v;
  }
  for (const t of tomas) if (t.tipo === 'apertura') for (let k = t.ta; k < t.tb; k++) vel[k] = V[4];
  // a cuadros
  const cuadros = [];
  let t = 0, deuda = 0; cuadros.push({ n: 0, t: 0, v: vel[0] });
  while (t < F) { const v = vel[t]; deuda += v; const n = Math.min(Math.floor(deuda + 1e-6), F - t); deuda -= n; t += n; cuadros.push({ n, t, v }); }
  const FINAL_S = 6; for (let k = 0; k < FINAL_S * FPS; k++) cuadros.push({ n: 0, t: F, quieto: true });
  // la cámara: dentro de una toma sigue a su foco con un retraso suave (constante de 0,7 s); al cambiar de toma
  // viaja (1-2,4 s, smootherstep); si el salto es largo o cambia el zoom, abre la vista a mitad del viaje
  const alfa = 1 - Math.exp(-1 / (0.7 * FPS));
  let ti = 0, cam = { x: isla.x, y: isla.y, z: ZG }, sig = null, viaje = null;
  for (let k = 0; k < cuadros.length; k++) {
    const c = cuadros[k];
    while (ti < tomas.length - 1 && c.t >= tomas[ti + 1].ta && !c.quieto) { ti++; viaje = null; }
    const tm = tomas[ti]; c.toma = ti;
    const d = { ...tm.foco(Math.min(c.t, F)) };
    // a 3x, que el encuadre no se salga de la isla de más (el mar del borde basta): se acota el foco, no la cámara,
    // para que el viaje acabe ya en su sitio (acotar la cámara al llegar daba un salto)
    if (tm.z >= ESCALA - 0.01) { d.x = Math.max(VISTA_W / 2, Math.min(tl.ancho * T - VISTA_W / 2, d.x)); d.y = Math.max(VISTA_H / 2, Math.min(tl.alto * T - VISTA_H / 2, d.y)); }
    if (!viaje) {
      const dist = Math.hypot(d.x - cam.x, d.y - cam.y), zz = Math.abs(Math.log(tm.z / cam.z));
      const dur = Math.round(FPS * Math.min(2.4, Math.max(zz > 0.1 ? 1.8 : 0.9, 0.9 + dist / 420)));
      const vw = AN / Math.min(cam.z, tm.z), vh = AM / Math.min(cam.z, tm.z);
      const zMedio = Math.min(cam.z, tm.z, AN / (Math.abs(d.x - cam.x) + vw * 0.7), AM / (Math.abs(d.y - cam.y) + vh * 0.7));
      viaje = { k0: k, dur, desde: { ...cam }, sigue: { x: d.x, y: d.y }, zMedio };
    }
    const sg = viaje.sigue; sg.x += (d.x - sg.x) * alfa; sg.y += (d.y - sg.y) * alfa;
    const u = Math.min(1, (k - viaje.k0) / viaje.dur), s = suave(u);
    const z0 = viaje.desde.z, z1 = tm.z, zLin = Math.exp(lerp(Math.log(z0), Math.log(z1), s));
    const hondo = Math.log(Math.min(z0, z1) / viaje.zMedio);
    const z = hondo > 0.05 ? zLin * Math.exp(-hondo * Math.sin(Math.PI * u)) : zLin;
    cam = { x: lerp(viaje.desde.x, sg.x, s), y: lerp(viaje.desde.y, sg.y, s), z: u >= 1 ? z1 : z };
    Object.assign(c, { cx: cam.x, cy: cam.y, z: cam.z });
  }
  return { cuadros, tomas, ZG, isla };
}

// ---------- 3. La página: el ayudante que pinta cada cuadro (se inyecta tal cual en Chrome) ----------
function ayudante(T, E, JA) {   // E: la escala del largo (3 o 4); JA: el juego en japonés
  // las barras del juego: desde el 6-nov-2026 (k8x12, el japonés legible) en japonés miden 14 y 40 y el mundo 126
  // (www/main.js, medirBarras y dibujarFin); en español e inglés, 10 y 34 y el mundo 136
  const HA = JA ? 14 : 10, HB = JA ? 40 : 34, MH = 180 - HA - HB, PASO = 272;   // trozos de 272: a la derecha está el minimapa
  const finMedidas = () => { const n = M.fin.tabla.length, paso = JA ? 12 : 9, cab = JA ? 32 : 24, alto = cab + 4 + n * paso + 30, top = Math.max(4, ((180 - alto) / 2) | 0); return { alto, top, yb: top + cab + n * paso + 4 }; };
  const scr = document.getElementById('screen'), sctx = scr.getContext('2d');
  const lienzo = () => { const c = document.createElement('canvas'); c.width = 8; c.height = 8; return [c, c.getContext('2d')]; };
  const [st, sg] = lienzo(), [up, ug] = lienzo(), [out, og] = lienzo();
  const tam = (c, w, h) => { if (c.width !== w || c.height !== h) { c.width = w; c.height = h; } };
  let ahora = 1000, mar = null;
  // el mar fuera del mapa: la esquina del mapa (siempre agua) repetida, alineada con el mundo
  function patronMar() {
    const [c, g] = lienzo(); c.width = 48; c.height = 48; g.drawImage(M.terrenoCanvas, 0, 0, 48, 48, 0, 0, 48, 48);
    mar = sg.createPattern(c, 'repeat');
  }
  // lo que el bucle del juego hace con los efectos en cada cuadro de pantalla (60 por segundo)
  function efectos(n) {
    for (let k = 0; k < n; k++) {
      for (const f of M.efectos) { if (f.espera > 0) { f.espera--; continue; } f.ttl--; if (f.t === 'chispa') { f.x += f.vx; f.y += f.vy; f.vy += 0.15; } if (f.t === 'texto') f.y -= 0.4; }
      M.efectos = M.efectos.filter(f => f.ttl > 0);
      if (M.mensajeT > 0) M.mensajeT -= 1 / 60;
      if (M.sacudida > 0) M.sacudida--;
      ahora += 1000 / 60;
    }
    M.ahora = ahora;
  }
  // el mundo a 1x en el rectángulo (x0, y0, w, h), pegando trozos del dibujo del propio juego
  function mundo(x0, y0, w, h) {
    tam(st, w, h);
    sg.save(); sg.translate(-x0, -y0); sg.fillStyle = mar; sg.fillRect(x0, y0, w, h); sg.restore();
    const sv = [M.mensajeT, M.sacudida, M.fin, M.cam.x, M.cam.y]; M.mensajeT = 0; M.sacudida = 0; M.fin = null;
    const W = M.e.ancho * T, H = M.e.alto * T;
    const ax = Math.max(0, x0), ay = Math.max(0, y0), bx = Math.min(W, x0 + w), by = Math.min(H, y0 + h);
    for (let ty = ay; ty < by; ty += MH) for (let tx = ax; tx < bx; tx += PASO) {
      M.cam.x = tx; M.cam.y = ty; M.dibujar();
      const cw = Math.min(PASO, bx - tx), ch = Math.min(MH, by - ty);
      sg.drawImage(scr, 0, HA, cw, ch, tx - x0, ty - y0, cw, ch);
    }
    [M.mensajeT, M.sacudida, M.fin, M.cam.x, M.cam.y] = sv;
  }
  // el cartel final sin los botones OTRA VEZ / MENU (se corta encima de ellos y se cierra el marco)
  function pegarFin(dx, dy, k) {
    const { top, yb } = finMedidas();
    const p = sctx.getImageData(40, top, 1, 1).data, amarillo = `rgb(${p[0]},${p[1]},${p[2]})`;
    og.imageSmoothingEnabled = false;
    og.drawImage(scr, 40, top, 240, yb - top, dx, dy, 240 * k, (yb - top) * k);
    og.fillStyle = '#000'; og.fillRect(dx, dy + (yb - top) * k, 240 * k, 5 * k);
    og.fillStyle = amarillo; og.fillRect(dx, dy + (yb - top) * k, k, 5 * k); og.fillRect(dx + 239 * k, dy + (yb - top) * k, k, 5 * k); og.fillRect(dx, dy + (yb - top + 4) * k, 240 * k, k);
  }
  // el HUD de arriba y de abajo, el minimapa, el aviso y el cartel final, de un dibujo normal del juego
  function pegarHud(cx, cy) {
    const W = M.e.ancho * T, H = M.e.alto * T;
    M.cam.x = Math.max(0, Math.min(W - 320, Math.round(cx - 160))); M.cam.y = Math.max(0, Math.min(H - MH, Math.round(cy - MH / 2)));
    const sac = M.sacudida; M.sacudida = 0;
    let A = null, B = null;
    if (M.mensajeT > 0) {   // el aviso es una caja negra al 75 %: se compara con el mismo dibujo sin aviso
      const m = M.mensajeT, fin = M.fin; M.fin = null;
      M.mensajeT = 0; M.dibujar(); B = sctx.getImageData(50, HA + 2, 220, 30).data;
      M.mensajeT = m; M.dibujar(); A = sctx.getImageData(50, HA + 2, 220, 30).data; M.fin = fin;
    }
    const fin = M.fin; M.fin = null; M.dibujar(); M.fin = fin; M.sacudida = sac;   // el cartel final tapa la barra de abajo: aparte
    og.imageSmoothingEnabled = false;
    const copia = (x, y, w, h) => og.drawImage(scr, x, y, w, h, x * E, y * E, w * E, h * E);
    copia(0, 0, 320, HA); copia(0, HA + MH, 320, HB); copia(275, HA + 1, 45, 45);
    if (A) {
      let alto = 0;
      for (let y = 0; y < 30; y++) for (let x = 0; x < 220; x += 3) { const i = (y * 220 + x) * 4; if (A[i] !== B[i] || A[i + 1] !== B[i + 1] || A[i + 2] !== B[i + 2]) alto = y + 1; }
      if (alto) {
        og.fillStyle = 'rgba(0,0,0,.75)'; og.fillRect(50 * E, (HA + 2) * E, 220 * E, alto * E);
        for (let y = 0; y < alto; y++) for (let x = 0; x < 220; x++) {
          const i = (y * 220 + x) * 4;
          if (Math.abs(A[i] - B[i] / 4) > 24 || Math.abs(A[i + 1] - B[i + 1] / 4) > 24 || Math.abs(A[i + 2] - B[i + 2] / 4) > 24) { og.fillStyle = `rgb(${A[i]},${A[i + 1]},${A[i + 2]})`; og.fillRect((50 + x) * E, (HA + 2 + y) * E, E, E); }
        }
      }
    }
    if (M.fin) { M.dibujar(); pegarFin(40 * E, finMedidas().top * E, E); }
  }
  /** Un cuadro: el mundo visto desde (cx, cy) con zoom z (píxeles de salida por píxel del mundo), en un
   *  lienzo W x H; con `hud`, el mundo va en la franja de en medio (como el juego) y encima el HUD. */
  function cuadro(o) {
    const { cx, cy, z, W, H, hud, fin } = o;
    if (!mar) patronMar();
    const ax = 0, ay = hud ? HA * E : 0, aw = W, ah = hud ? MH * E : H;
    const vw = aw / z, vh = ah / z, x0f = cx - vw / 2, y0f = cy - vh / 2;
    const x0 = Math.floor(x0f) - 1, y0 = Math.floor(y0f) - 1, w = Math.ceil(vw) + 3, h = Math.ceil(vh) + 3;
    let sx = 0, sy = 0;   // la sacudida de la erupción: la del juego (±2 px a 1x), en píxeles de salida
    const ks = hud ? E : 3; if (M.sacudida > 0) { sx = (((Math.random() * 4) | 0) - 2) * ks; sy = (((Math.random() * 4) | 0) - 2) * ks; }
    mundo(x0, y0, w, h);
    tam(out, W, H); og.fillStyle = '#000'; og.fillRect(0, 0, W, H);
    og.save(); og.beginPath(); og.rect(ax, ay, aw, ah); og.clip();
    const ox = ax + (x0 - x0f) * z + sx, oy = ay + (y0 - y0f) * z + sy, ze = Math.round(z);
    if (Math.abs(z - ze) < 1e-3) { og.imageSmoothingEnabled = false; og.drawImage(st, Math.round(ox), Math.round(oy), w * ze, h * ze); }
    else if (z > 1) { const k = Math.ceil(z); tam(up, w * k, h * k); ug.imageSmoothingEnabled = false; ug.drawImage(st, 0, 0, w * k, h * k); og.imageSmoothingEnabled = true; og.imageSmoothingQuality = 'high'; og.drawImage(up, ox, oy, w * z, h * z); }
    else { og.imageSmoothingEnabled = true; og.imageSmoothingQuality = 'high'; og.drawImage(st, ox, oy, w * z, h * z); }
    og.restore();
    if (hud) pegarHud(cx, cy);
    else if (fin && M.fin) { M.dibujar(); pegarFin((W - 960) / 2, Math.round(H * 0.42 - (finMedidas().alto - 30) * 2), 4); }
    return out.toDataURL('image/png');
  }
  function limpiar() { M.efectos = []; M.golpes.clear(); M.vuelos.clear(); M.mensajeT = 0; M.sacudida = 0; M.modal = null; }
  window.REC = { efectos, cuadro, limpiar };
}

// ---------- 4. Chrome sin ventana y un servidor de archivos propio (sólo www/ y sim/, de lectura) ----------
// No se usa servidor.mjs: no hace falta el modo en línea, y así nada escribe en datos/ ni en Supabase.
const FFMPEG = spawnSync(path.join(os.homedir(), 'Documents/code challenge/.venv/bin/python'), ['-c', 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())'], { encoding: 'utf8' }).stdout.trim();
const dormir = ms => new Promise(r => setTimeout(r, ms));
async function abrirChrome() {
  const http = await import('node:http');
  const TIPOS = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json' };
  const srv = http.createServer((req, res) => {
    let ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (ruta === '/') ruta = '/index.html';
    const archivo = path.normalize(path.join(KAZAN, ruta.startsWith('/sim/') ? '' : 'www', ruta));
    if (![path.join(KAZAN, 'www') + path.sep, path.join(KAZAN, 'sim') + path.sep].some(d => archivo.startsWith(d)) || !fs.existsSync(archivo) || fs.statSync(archivo).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': TIPOS[path.extname(archivo)] || 'application/octet-stream', 'cache-control': 'no-store' }); fs.createReadStream(archivo).pipe(res);
  });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const puerto = srv.address().port, DEP = 9461;
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'kazan-cpu-chrome-'));
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--no-first-run', '--no-default-browser-check', '--mute-audio', `--remote-debugging-port=${DEP}`, `--user-data-dir=${perfil}`, '--window-size=960,540', 'about:blank'], { stdio: 'ignore' });
  const cerrar = async () => { try { ws.close(); } catch {} chrome.kill(); srv.close(); await dormir(600); fs.rmSync(perfil, { recursive: true, force: true }); };
  process.on('exit', () => { try { chrome.kill(); } catch {} });
  for (const s of ['SIGTERM', 'SIGINT', 'SIGHUP']) process.on(s, () => process.exit(1));   // que un kill no deje el Chrome huérfano (15-nov-2026)
  let ws = null; for (let i = 0; i < 80 && !ws; i++) { await dormir(250); try { const l = await (await fetch(`http://127.0.0.1:${DEP}/json/list`)).json(); const p = l.find(x => x.type === 'page'); if (p) ws = new WebSocket(p.webSocketDebuggerUrl); } catch {} }
  if (!ws) throw new Error('Chrome no abrió');
  await new Promise(r => ws.addEventListener('open', r));
  let id = 0; const pend = new Map();
  ws.addEventListener('message', m => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } });
  const cdp = (method, params = {}) => new Promise(r => { const k = ++id; pend.set(k, r); ws.send(JSON.stringify({ id: k, method, params })); });
  const ev = async e => { const r = await cdp('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text); return r.result?.result?.value; };
  await cdp('Page.enable'); await cdp('Runtime.enable');
  await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `try { localStorage.setItem('sonido', 'no'); } catch {}` });
  await cdp('Page.navigate', { url: `http://127.0.0.1:${puerto}/?lang=${IDIOMA}` });
  for (let i = 0; i < 40 && !(await ev(`!!window.M`).catch(() => false)); i++) await dormir(250);
  await ev(`(${ayudante.toString()})(${T}, ${ESCALA}, ${IDIOMA === 'ja'}); 1`);
  return { ev, cerrar };
}
/** La partida en la página: nuevaLocal con 7 CPU, la IA para la nación 0, todas «CPU n», espectador, y el
 *  bucle del juego apagado (cada cuadro lo avanza la grabación). Devuelve el resumen del estado en el paso 0. */
async function prepararPartida(ev) {
  return ev(`(async () => {
    M.saltarIntro(); await new Promise(r => setTimeout(r, 300));
    window.requestAnimationFrame = () => 0; await new Promise(r => setTimeout(r, 120));
    const { crearIA } = await import('/sim/ia.js');
    M.nuevaLocal({ cpus: ${NACIONES - 1}, minutos: ${MINUTOS}, semilla: ${SEMILLA}, bioma: '${BIOMA}' });
    M.ias.push(crearIA(0, ${SEMILLA + NACIONES - 1}));
    M.e.jugadores.forEach((J, k) => { J.nombre = 'CPU ' + (k + 1); J.cpu = true; });
    M.yo = null; M.sel = []; M.selEd = null; REC.limpiar();
    return M.S.resumen(M.e);
  })()`);
}
/** Graba una lista de cuadros a mp4: cada cuadro avanza n pasos, dos fotogramas de efectos y se pinta. Los
 *  PNG van directo a ffmpeg por una tubería (nada al disco). Compara el estado con el de Node cada 50 pasos. */
async function grabar(ev, cuadros, salida, { W, H, hud, tl, extra = '' }) {
  const ff = spawn(FFMPEG, ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', salida], { stdio: ['pipe', 'ignore', 'inherit'] });
  const cerrado = new Promise(r => ff.on('close', r));
  let malos = 0, buenos = 0; const t0 = Date.now();
  for (let k = 0; k < cuadros.length; k++) {
    const c = cuadros[k];
    const [url, tick, res] = await ev(`(() => { M.pasos(${c.n}); M.modal = null; REC.efectos(2); ${extra}
      const r = M.e.tick % 50 === 0 && ${c.n} > 0 ? M.S.resumen(M.e) : null;
      return [REC.cuadro(${JSON.stringify({ cx: c.cx, cy: c.cy, z: c.z, W, H, hud, fin: !!c.fin })}), M.e.tick, r]; })()`);
    if (tick !== c.t) throw new Error(`cuadro ${k}: la página va en el paso ${tick} y el plan en ${c.t}`);
    if (res != null && tl.resumen[tick] != null) { if (res === tl.resumen[tick]) buenos++; else { malos++; if (malos < 4) console.log(`  ¡distinta de Node en el paso ${tick}!`); } }
    const buf = Buffer.from(url.split(',')[1], 'base64');
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (k % 600 === 0 && k) console.log(`  ${path.basename(salida)}: ${k}/${cuadros.length} cuadros, paso ${tick}, ${((Date.now() - t0) / k).toFixed(0)} ms/cuadro`);
  }
  ff.stdin.end(); const st = await cerrado;
  console.log(`${path.basename(salida)}: ${cuadros.length} cuadros (${(cuadros.length / FPS).toFixed(1)} s) ${st === 0 ? 'listo' : 'ffmpeg falló'}; igual que Node en ${buenos} comprobaciones${malos ? `, DISTINTA en ${malos}` : ''}`);
  return { buenos, malos };
}

// ---------- 5. Los cortos: verticales 1080x1920, sólo el mundo y más cerca (5x o 6x, sin suavizar) ----------
/** Cuadros de un clip: desde el paso t0, con tramos [{n pasos por cuadro, cuadros}], y la cámara como
 *  función (k cuadro, t paso) → {x, y, z}; sigue al foco con el mismo retraso suave del largo. */
function clip(t0, tramos, camara, F) {
  const cuadros = [{ n: 0, t: t0 }]; let t = t0;
  for (const tr of tramos) for (let k = 0; k < tr.cuadros; k++) { const n = Math.max(0, Math.min(tr.n, F - t)); t += n; cuadros.push({ n, t, fin: tr.fin }); }
  const alfa = 1 - Math.exp(-1 / (0.7 * FPS)); let sx = null, sy = null;
  cuadros.forEach((c, k) => { const d = camara(k, c.t); if (sx == null) { sx = d.x; sy = d.y; } sx += (d.x - sx) * alfa; sy += (d.y - sy) * alfa; Object.assign(c, { cx: sx, cy: sy, z: d.z }); });
  return cuadros;
}
function cortos(tl) {
  const F = tl.fin.t, E = tl.erupcion, gan = tl.fin.tabla[0].id, out = [];
  // 1. Las ciudades creciendo: la del ganador desde el primer paso, a 15x (5 pasos por cuadro), encuadrada en lo
  //    que habrá levantado al final del clip (y con el zoom entero más grande en que quepa a lo ancho, 4x-6x)
  const b = tl.bases[gan], tFin1 = 5 * 254, eds = [b, ...tl.obras.filter(o => o.j === gan && o.t <= tFin1)];
  const bx0 = Math.min(...eds.map(o => o.x)) - 16, bx1 = Math.max(...eds.map(o => o.x)) + 16, by0 = Math.min(...eds.map(o => o.y)) - 16, by1 = Math.max(...eds.map(o => o.y)) + 16;
  const z1 = Math.max(4, Math.min(6, Math.floor(1080 / (bx1 - bx0))));
  out.push({ nombre: 'corto-1', t0: 0, cuadros: clip(0, [{ n: 5, cuadros: 254 }], () => ({ x: (bx0 + bx1) / 2, y: (by0 + by1) / 2, z: z1 }), F),
    desc: `La ciudad de ${quien(gan)} crece sola desde el primer segundo: obreros a la madera y al hierro, granjas, casas, aserradero, cuartel. Velocidad 15x (los primeros 2 min de juego en 8,5 s), zoom ${z1}x.` });
  // 2. Un ejército que sale: la primera marcha grande del ganador, seguida hasta que llega a la ciudad enemiga:
  //    sale a 6x, cruza la isla a 15x y llega a 3x
  const m = tl.marchas.find(m => m.j === gan && m.n >= 8 && m.llega) || tl.marchas.find(m => m.n >= 8 && m.llega) || tl.marchas.find(m => m.n >= 8);
  const pm = sobrePista([{ t: m.t0 - 60, ...tl.bases[m.j], n: 1 }, ...m.pista], 50), lleg = m.llega || m.t0 + 820;
  const cruza = Math.max(10, Math.round((lleg - 60 - (m.t0 + 90)) / 5));
  out.push({ nombre: 'corto-2', t0: m.t0 - 60, cuadros: clip(m.t0 - 60, [{ n: 2, cuadros: 75 }, { n: 5, cuadros: cruza }, { n: 1, cuadros: 90 }], (k, t) => ({ ...pm(t), z: 5 }), F),
    desc: `Sale el primer ejército de ${quien(m.j)}: ${m.n} tropas dejan la base (velocidad 6x), cruzan la isla (15x, desde los 2,5 s) y llegan a la ciudad de ${quien(m.contra)} (3x, en los últimos 3 s). Zoom 5x.` });
  // 3. Una ciudad que cae: la conquista con más tiros alrededor de la base en los 25 s de antes (sin la erupción en medio)
  const conq = tl.caen.filter(c => c.por === 'enemigos' && c.t !== F && Math.abs(c.t - E) > 400)
    .map(c => ({ c, n: tl.disparos.filter(d => d.t > c.t - 250 && d.t <= c.t && Math.hypot(d.x - c.x, d.y - c.y) < 120).length })).sort((a, b) => b.n - a.n)[0].c;
  out.push({ nombre: 'corto-3', t0: conq.t - 230, cuadros: clip(conq.t - 230, [{ n: 1, cuadros: 290 }], () => ({ x: conq.x, y: conq.y + 16, z: 6 }), F),
    desc: `El asalto a la base de ${quien(conq.j)}: las tropas de ${quien(conq.quien)} la rodean y le disparan; a los ${(230 / FPS).toFixed(1).replace('.', ',')} s la base explota y con ella todos sus edificios. Velocidad 3x, zoom 6x.` });
  // 4. La erupción y la lava: el cráter a 6x, la sacudida, y luego a 24x abriendo hasta 2,5x para ver correr la lava
  const v = tl.volcan, tramos4 = [{ n: 1, cuadros: 90 }, { n: 2, cuadros: 10 }, { n: 4, cuadros: 10 }, { n: 6, cuadros: 10 }, { n: 8, cuadros: 140 }];
  out.push({ nombre: 'corto-4', t0: E - 30, cuadros: clip(E - 30, tramos4, k => ({ x: v.x, y: v.y, z: Math.exp(lerp(Math.log(6), Math.log(2.5), suave((k - 60) / 170))) }), F),
    desc: `El volcán: a 1 s hace erupción (sacudida, fogonazo, chispas); desde los 3 s se acelera hasta 24x y la cámara se abre (zoom de 6x a 2,5x) para ver la lava extenderse en cuadro por la isla.` });
  // 5. El final: el último asalto del ganador y el cartel QUEDO UNA SOLA NACION
  const ult = tl.caen[tl.caen.length - 1];
  out.push({ nombre: 'corto-5', t0: F - 210, cuadros: clip(F - 210, [{ n: 1, cuadros: 210 }, { n: 0, cuadros: 80, fin: true }], () => ({ x: ult.x, y: ult.y + 16, z: 6 }), F),
    desc: `El final: ${quien(ult.quien)} tumba la última base, la de ${quien(ult.j)} (a los 7 s), con la lava ya en la orilla de abajo, y sale el cartel «QUEDO UNA SOLA NACION» con la tabla: gana ${quien(gan)}. Velocidad 3x, zoom 6x.` });
  return out;
}

// ---------- 6. La escaleta ----------
const reloj = t => { const s = Math.round(t / S.TPS); return `${(s / 60) | 0}:${String(s % 60).padStart(2, '0')}`; };
function escaleta(tl, plan, cs) {
  const seg = t => { const k = plan.cuadros.findIndex(c => c.t >= t); return +(k / FPS).toFixed(2); };
  const enCamara = (t, x, y) => { const c = plan.cuadros.find(c => c.t >= t); return !!c && Math.abs(c.cx - x) < AN / c.z / 2 && Math.abs(c.cy - y) < AM / c.z / 2; };
  const ev = [], F = tl.fin.t;
  const add = (t, tipo, texto, x, y) => ev.push({ t: seg(t), tick: t, juego: reloj(t), tipo, texto, ...(x != null ? { en_camara: enCamara(t, x, y) } : {}) });
  add(0, 'inicio', `Empieza la partida: ${NACIONES} naciones, todas de la computadora, cada una con su base y 4 obreros.`);
  const d1 = tl.disparos[0]; add(d1.t, 'primer_disparo', `Primer disparo de la partida (${quien(d1.j)}).`, d1.x, d1.y);
  const m1 = plan.tomas.find(t => t.tipo === 'marcha'); if (m1) { const m = tl.marchas.find(m => m.t0 === m1.clave); add(m1.clave, 'primer_ejercito', m1.desc[0].toUpperCase() + m1.desc.slice(1) + '.', tl.bases[m.j].x, tl.bases[m.j].y); }
  const llegada = tl.marchas.filter(m => m.llega).sort((a, b) => a.llega - b.llega)[0];
  if (llegada) add(llegada.llega, 'primer_ataque', `Primer ataque a una ciudad: el ejército de ${quien(llegada.j)} llega a la base de ${quien(llegada.contra)}.`, llegada.blanco.x, llegada.blanco.y);
  add(tl.erupcion, 'erupcion', 'El volcán hace erupción: la lava empieza a bajar.', tl.volcan.x, tl.volcan.y);
  for (const c of tl.caen) add(c.t, c.t === F ? 'ultima_caida' : 'cae_ciudad', c.por === 'enemigos'
    ? `Cae ${quien(c.j)}, conquistada por ${quien(c.quien)}${c.ayudan.length ? ' (también le pegaban ' + c.ayudan.map(quien).join(' y ') + ')' : ''}.`
    : `Cae ${quien(c.j)}: la lava ya le había quitado la base y muere su última gente.`, c.x, c.y);
  for (const s of tl.sinBase) add(s.t, 'lava_base', `La lava se traga la base de ${quien(s.j)} (sigue viva un rato con su gente).`, s.x, s.y);
  for (const p of [25, 50, 75]) if (tl.lavaPct[p] != null) { add(tl.lavaPct[p], 'lava_' + p, `La lava cubre el ${p} % de la isla (el HUD dice LAVA ${p}%).`); const c = plan.cuadros.find(c => c.t >= tl.lavaPct[p]); ev[ev.length - 1].en_camara = !!c && plan.tomas[c.toma].tipo === 'lava' + p; }
  add(F, 'ganador', `Queda una sola nación: gana ${quien(tl.fin.tabla[0].id)}. Sale el cartel final con la tabla (se queda ${(plan.cuadros.length - seg(F) * FPS) / FPS | 0} s).`);
  ev.sort((a, b) => a.tick - b.tick || (a.tipo === 'ganador') - (b.tipo === 'ganador'));
  // tramos de velocidad y de toma, en segundos del vídeo
  const tramos = (clave, valor) => { const r = []; plan.cuadros.forEach((c, k) => { const v = valor(c); if (!r.length || r[r.length - 1][clave] !== v) r.push({ desde: +(k / FPS).toFixed(2), [clave]: v }); }); r.forEach((x, i) => { x.hasta = +((i + 1 < r.length ? r[i + 1].desde * FPS : plan.cuadros.length) / FPS).toFixed(2); }); return r; };
  const vel = tramos('x', c => c.quieto ? 'quieto' : (c.v ?? c.n ?? plan.cuadros[1].n) * 3).map(v => ({ desde: v.desde, hasta: v.hasta, velocidad: typeof v.x === 'number' ? v.x + 'x' : 'quieto' }));
  const tomas = tramos('toma', c => c.toma).map(x => { const t = plan.tomas[x.toma]; return { desde: x.desde, hasta: x.hasta, tipo: t.tipo, juego: `${reloj(t.ta)}-${reloj(t.tb)}`, que_se_ve: t.desc }; });
  const naciones = tl.fin.tabla.map(r => r.id).sort((a, b) => a - b).map(j => ({ nombre: nombre(j), color: color(j).toLowerCase(), termina: (() => { const c = tl.caen.find(c => c.j === j); return c ? `cae a los ${reloj(c.t)} (${c.por === 'enemigos' ? 'conquistada por ' + quien(c.quien) : 'por la lava'})` : (j === tl.fin.tabla[0].id ? 'gana' : 'sigue viva'); })() }));
  return {
    titulo: 'Kazan: la CPU nunca descansa',
    partida: { semilla: SEMILLA, bioma: BIOMA, naciones: NACIONES, minutos_de_partida: MINUTOS, isla_casillas: `${tl.ancho}x${tl.alto}`, idioma_del_juego: IDIOMA, duracion_real_de_juego: reloj(F),
      como: `Las ${NACIONES === 8 ? 'ocho' : NACIONES} naciones las juega la IA del juego (sim/ia.js): nuevaLocal con ${NACIONES - 1} CPU y a la nación 0 se le da su propia IA en el mismo instante; la cámara es de espectador (sin niebla). Abajo dice VIENDO LA PARTIDA.`,
      naciones },
    largo: { archivo: 'largo.mp4', resolucion: `${AN}x${AL} (${ESCALA}x sin suavizar; la vista general y los viajes con zoom, suavizados)`, fps: FPS, duracion_s: +(plan.cuadros.length / FPS).toFixed(2), audio: 'ninguno',
      notas: `HUD arriba (LAVA % y FIN), minimapa arriba a la derecha y los avisos del propio juego (EL VOLCAN HIZO ERUPCION, LA CIUDAD X CAYO, PERDIO SU BASE). El reloj del HUD cuenta lo que falta para el fin de ${MINUTOS} min, no para el final real.`,
      eventos: ev, velocidad: vel, tomas },
    ...(LARGA ? { larga: detalle(tl, plan) } : {}),
    cortos: cs.map(c => ({ archivo: c.nombre + '.mp4', resolucion: '1080x1920', fps: FPS, duracion_s: +(c.cuadros.length / FPS).toFixed(2), juego: `${reloj(c.cuadros[0].t)}-${reloj(c.cuadros[c.cuadros.length - 1].t)}`, que_se_ve: c.desc })),
  };
}

// ---------- 6b. La partida larga (KAZAN_LARGA=1): el detalle para narrarla y la pista de efectos ----------
/** Todo lo que pasa, con su segundo del vídeo: cada caída (de qué y por quién), las bases que se traga la lava y las
 *  que se fundan después, cada ejército que sale contra una base, la primera tropa de cada tipo, la lava al 25/50/75 %
 *  y, cada 2 s de juego, cómo va cada nación (puntos, tropas, gente, edificios): de ahí sale el marcador de los lados. */
function detalle(tl, plan) {
  const F = tl.fin.t, cuadroDe = t => { const k = plan.cuadros.findIndex(c => c.t >= t); return k < 0 ? plan.cuadros.length - 1 : k; };
  const seg = t => +(cuadroDe(t) / FPS).toFixed(2);
  const enCamara = (t, x, y) => { const c = plan.cuadros[cuadroDe(t)]; return Math.abs(c.cx - x) < AN / c.z / 2 && Math.abs(c.cy - y) < AM / c.z / 2; };
  const suc = [];
  const add = (t, tipo, datos = {}, x = null, y = null) => suc.push({ t: seg(t), tick: t, juego: reloj(t), tipo, ...datos, ...(x != null ? { en_camara: enCamara(t, x, y) } : {}) });
  add(tl.erupcion, 'erupcion', {}, tl.volcan.x, tl.volcan.y);
  for (const c of tl.caen) add(c.t, 'cae', { j: c.j, por: c.por, quien: c.quien, ayudan: c.ayudan, remata: c.remata, ultima: c.t === F }, c.x, c.y);
  for (const x of tl.sinBase) add(x.t, 'sin_base', { j: x.j }, x.x, x.y);
  for (const x of tl.conBase) add(x.t, 'con_base', { j: x.j });
  for (const o of tl.obras) if (o.tipo === 'base') add(o.t, 'base_nueva', { j: o.j }, o.x, o.y);
  for (const p of [25, 50, 75]) if (tl.lavaPct[p] != null) add(tl.lavaPct[p], 'lava', { pct: p });
  for (const m of tl.marchas) add(m.t0, 'ejercito', { j: m.j, contra: m.contra, n: m.n, llega: m.llega ? seg(m.llega) : null }, tl.bases[m.j].x, tl.bases[m.j].y);
  for (const [unidad, x] of Object.entries(tl.primeras)) add(x.t, 'primera_tropa', { unidad, j: x.j }, x.x, x.y);
  const vistos = new Set();
  for (const o of tl.obras) if (!vistos.has(o.tipo) && o.tipo !== 'base') { vistos.add(o.tipo); add(o.t, 'primer_edificio', { edificio: o.tipo, j: o.j }, o.x, o.y); }
  const d1 = tl.disparos[0]; if (d1) add(d1.t, 'primer_disparo', { j: d1.j }, d1.x, d1.y);
  add(F, 'fin', { motivo: tl.fin.motivo, gana: tl.fin.tabla[0].id, tabla: tl.fin.tabla });
  suc.sort((a, b) => a.tick - b.tick || (a.tipo === 'fin') - (b.tipo === 'fin'));
  const estados = []; let ant = -1;
  for (const x of tl.estados) { const t = seg(x.t); if (t === ant) estados.pop(); estados.push({ t, tick: x.t, lava: x.lava, n: x.n }); ant = t; }
  const tomas = []; plan.cuadros.forEach((c, k) => { if (!tomas.length || tomas[tomas.length - 1].i !== c.toma) tomas.push({ i: c.toma, desde: +(k / FPS).toFixed(2) }); });
  tomas.forEach((x, i) => { const t = plan.tomas[x.i]; x.hasta = +((i + 1 < tomas.length ? tomas[i + 1].desde : plan.cuadros.length / FPS)).toFixed(2); Object.assign(x, { tipo: t.tipo, ...(t.j != null ? { j: t.j } : {}), ...(t.contra != null ? { contra: t.contra, n: t.n } : {}), ...(t.junto != null ? { junto: t.junto, disparan: t.disparan } : {}) }); delete x.i; });
  return {
    naciones: tl.bases.map((b, j) => ({ j, nombre: nombre(j), color: color(j) })), semilla: SEMILLA, bioma: BIOMA, minutos: MINUTOS, isla: tl.ancho,
    segundos: +(plan.cuadros.length / FPS).toFixed(2), fin_s: seg(F), erupcion_s: seg(tl.erupcion), sucesos: suc, estados, tomas,
    velocidad: (() => { const r = []; plan.cuadros.forEach((c, k) => { const v = c.quieto ? 0 : c.v * 3; if (!r.length || r[r.length - 1].x !== v) r.push({ desde: +(k / FPS).toFixed(2), x: v }); }); return r; })(),
  };
}

/** Cada sonido del juego, tocado por el propio código de www/sonido.js en un contexto de audio sin tarjeta
 *  (OfflineAudioContext), PASO segundos cada uno, todos seguidos en una sola pista. El módulo de la página ya abrió su
 *  audio al arrancar (la intro de la casa) y no deja cambiarlo, así que se toma su texto tal cual, sin los `export`, y
 *  se arma con él una copia por sonido cuyo `window.AudioContext` es el nuestro: su abrirAudio() pone el volumen
 *  maestro del juego y su catálogo SONIDOS toca el sonido a volumen 1. */
const SR_SON = 48000, PASO_SON = 2.5;
async function bancoDeSonidos(ev, nombres) {
  const largo = Math.round(SR_SON * PASO_SON), banco = new Float32Array(largo * nombres.length);
  await ev(`(async () => {
    const texto = (await (await fetch('/sonido.js')).text()).replace(/^export /gm, '');
    window.__sonar = new Function('window', texto + '\\n; abrirAudio(); return SONIDOS;');
    return 1; })()`);
  for (let k = 0; k < nombres.length; k++) {
    const b64 = await ev(`(async () => {
      const off = new OfflineAudioContext(1, ${largo}, ${SR_SON});
      const S = window.__sonar({ AudioContext: function () { return off; } });
      if (!S[${JSON.stringify(nombres[k])}]) throw new Error('el juego no tiene el sonido ' + ${JSON.stringify(nombres[k])});
      S[${JSON.stringify(nombres[k])}](1);
      const d = (await off.startRendering()).getChannelData(0), u8 = new Uint8Array(d.buffer, d.byteOffset, d.byteLength);
      let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
      return btoa(s); })()`);
    const b = Buffer.from(b64, 'base64');
    banco.set(new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)), k * largo);
  }
  return banco;
}
/** La pista de efectos del largo (efectos.wav, mono): cada sonido en el cuadro en que pasa, con las reglas del juego
 *  (www/sonido.js, tocar): no repite el mismo en 60 ms ni más de 8 en 100 ms, y lo que pasa en el mapa suena según lo
 *  cerca que esté de lo que se ve (a más de 160 px, nada). Aquí lo que se ve es el encuadre de nuestra cámara; en la
 *  vista general, que abarca toda la isla, se baja con el zoom para que no suene toda la isla a la vez. Kazan no tiene
 *  música: esto es todo lo que suena. */
function pistaDeEfectos(tl, plan, banco, nombres, salida) {
  const F = tl.fin.t, total = plan.cuadros.length / FPS, out = new Float32Array(Math.ceil((total + 2) * SR_SON));
  const cuadroDe = new Int32Array(F + 2); { let k = 0; for (let t = 0; t <= F; t++) { while (k < plan.cuadros.length - 1 && plan.cuadros[k].t < t) k++; cuadroDe[t] = k; } }
  const ultimo = new Map(); let ventana = -1e9, enCien = 0, suenan = 0;
  const largo = Math.round(PASO_SON * SR_SON);
  for (const s of tl.sonidos) {
    const idx = nombres.indexOf(s.s); if (idx < 0) continue;
    const k = cuadroDe[Math.min(F, s.t)], c = plan.cuadros[k], ahora = k / FPS * 1000;
    if (ahora - (ultimo.get(s.s) ?? -1e9) < 60) continue;
    if (ahora - ventana > 100) { ventana = ahora; enCien = 0; } if (++enCien > 8) continue;
    let v = 1;
    if (s.x != null) {
      const w = AN / c.z, h = AM / c.z, x0 = c.cx - w / 2, y0 = c.cy - h / 2;
      const dx = Math.max(0, x0 - s.x, s.x - (x0 + w)), dy = Math.max(0, y0 - s.y, s.y - (y0 + h)), d = Math.sqrt(dx * dx + dy * dy);
      if (d > 160) continue; v = (1 - d / 160) * Math.max(0.2, Math.min(1, c.z / ESCALA));
    }
    ultimo.set(s.s, ahora); suenan++;
    const i0 = Math.round(k / FPS * SR_SON), b0 = idx * largo;
    for (let i = 0; i < largo && i0 + i < out.length; i++) out[i0 + i] += banco[b0 + i] * v;
  }
  // a 16 bits, con un tope suave (cuando coinciden muchos, que no reviente)
  const pcm = Buffer.alloc(44 + out.length * 2);
  pcm.write('RIFF', 0); pcm.writeUInt32LE(36 + out.length * 2, 4); pcm.write('WAVEfmt ', 8); pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22);
  pcm.writeUInt32LE(SR_SON, 24); pcm.writeUInt32LE(SR_SON * 2, 28); pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34); pcm.write('data', 36); pcm.writeUInt32LE(out.length * 2, 40);
  for (let i = 0; i < out.length; i++) pcm.writeInt16LE(Math.round(Math.tanh(out[i] * 1.2) / 1.2 * 32767 * 0.98), 44 + i * 2);
  fs.writeFileSync(salida, pcm);
  console.log(`${path.basename(salida)}: ${total.toFixed(1)} s, suenan ${suenan} de ${tl.sonidos.length} sonidos del juego`);
}

// ---------- 7. Todo junto ----------
if (PARTE === 'buscar') {   // puntúa muchas partidas (sin Chrome) para elegir otra semilla; cambiar arriba SEMILLA, BIOMA…
  // (15-nov-2026) KAZAN_BUSCAR_NACIONES=4,6,8 KAZAN_BUSCAR_BIOMAS=bosque,nieve KAZAN_BUSCAR_MINUTOS=20,30 acotan la
  // búsqueda; cada fila dice además cuándo cae cada nación y de qué (j<q: conquistada por q; jL: sin base y sin gente),
  // las bases que se tragó la lava (sinBase) y las que se fundaron después de la primera (mudanzas)
  const [s0, s1] = (process.argv[3] || '1-16').split('-').map(Number), filas = [];
  const lista = (k, def) => (ENV[k] ? ENV[k].split(',') : def);
  for (const minutos of lista('KAZAN_BUSCAR_MINUTOS', [MINUTOS]).map(Number)) for (const naciones of lista('KAZAN_BUSCAR_NACIONES', [4, 5, 6, 8]).map(Number)) for (const bioma of lista('KAZAN_BUSCAR_BIOMAS', ['bosque', 'nieve', 'desierto', 'pantano'])) for (let semilla = s0; semilla <= (s1 || s0); semilla++) {
    const r = medir({ semilla, bioma, naciones, minutos }), conq = r.caen.filter(c => c.por === 'enemigos').length, lava = r.caen.length - conq;
    const ultimoConBase = r.fin.motivo === 'ultimo' && !r.fin.tabla[0].sinBase;
    const fila = { p: conq * 3 + Math.min(lava, 2) * 2 + Math.min(r.sinBase.length, 3) + (ultimoConBase ? 6 : 0) + (r.fin.t >= 8000 ? 2 : -4), minutos, naciones, bioma, semilla, conq, lava, sinBase: r.sinBase.length,
      mudanzas: r.obras.filter(o => o.tipo === 'base').length, fin: `${reloj(r.fin.t)} ${r.fin.motivo}`, erupcion: reloj(r.erupcion),
      caen: r.caen.map(c => `${reloj(c.t)} ${c.j}${c.por === 'enemigos' ? '<' + c.quien : 'L' + (c.remata != null ? '<' + c.remata : '')}`).join(', '), gana: r.fin.tabla[0].id };
    filas.push(fila); if (ENV.KAZAN_BUSCAR_TODO) console.log(JSON.stringify(fila));
  }
  console.log('--- las mejores');
  for (const f of filas.sort((a, b) => b.p - a.p).slice(0, 25)) console.log(JSON.stringify(f));
  process.exit(0);
}
const t0 = Date.now(); const tl = medir();
console.log(`medida en ${Date.now() - t0} ms: isla ${tl.ancho}, erupción ${reloj(tl.erupcion)}, fin ${reloj(tl.fin.t)} (${tl.fin.motivo}), gana ${quien(tl.fin.tabla[0].id)}`);
for (const c of tl.caen) console.log(`  ${reloj(c.t)} cae ${quien(c.j)} por ${c.por}${c.quien != null ? ', conquistada por ' + quien(c.quien) : ''}`);
const plan = dirigir(tl), cs = cortos(tl);
const esc = escaleta(tl, plan, cs);
fs.mkdirSync(SALIDA, { recursive: true });
fs.writeFileSync(path.join(SALIDA, 'escaleta.json'), JSON.stringify(esc, null, LARGA ? 1 : 2) + '\n');
console.log(`largo: ${plan.cuadros.length} cuadros = ${(plan.cuadros.length / FPS / 60).toFixed(2)} min; ${plan.tomas.length} tomas; vista general a ${plan.ZG.toFixed(3)}x`);
if (PARTE === 'medir' && process.env.KAZAN_VER) {   // KAZAN_VER=0,250,…: cómo va el plan en esos cuadros
  for (const k of process.env.KAZAN_VER.split(',').map(Number)) { const c = plan.cuadros[k]; console.log(k, `${(k / FPS).toFixed(2)} s paso ${c.t} (+${c.n}) cam ${c.cx.toFixed(0)},${c.cy.toFixed(0)} z ${c.z.toFixed(3)} toma ${plan.tomas[c.toma].tipo}`); }
}
if (PARTE === 'medir' && LARGA) { for (const x of esc.larga.sucesos) if (!['primera_tropa', 'primer_edificio', 'ejercito'].includes(x.tipo)) console.log(`  ${x.t} s (${x.juego}) ${x.tipo} ${JSON.stringify({ ...x, t: undefined, tick: undefined, juego: undefined, tipo: undefined, tabla: undefined })}`); }
if (PARTE === 'medir') { for (const t of esc.largo.tomas) console.log(`  ${t.desde}-${t.hasta} s ${t.tipo}: ${t.que_se_ve}`); process.exit(0); }
const nombresSon = [...new Set(tl.sonidos.map(x => x.s))];
const { ev, cerrar } = await abrirChrome();
try {
  if (PARTE === 'sonido') {   // la pista de efectos de la partida larga (no depende del idioma)
    pistaDeEfectos(tl, plan, await bancoDeSonidos(ev, nombresSon), nombresSon, path.join(SALIDA, 'efectos.wav'));
  }
  if (PARTE === 'fotos') {   // para revisar: unos cuadros sueltos del largo a PNG (KAZAN_FOTOS=12,340,…), sin grabar
    const dir = process.env.KAZAN_DIR || path.join(os.tmpdir(), 'kazan-cpu-fotos'); fs.mkdirSync(dir, { recursive: true });
    const quiero = new Set((process.env.KAZAN_FOTOS || '').split(',').filter(Boolean).map(Number)), ultimo = Math.max(...quiero);
    await prepararPartida(ev);
    for (let k = 0; k <= ultimo; k++) {
      const c = plan.cuadros[k];
      if (!quiero.has(k)) { await ev(`M.pasos(${c.n}); REC.efectos(2); 1`); continue; }
      const url = await ev(`(() => { M.pasos(${c.n}); M.modal = null; REC.efectos(2); return REC.cuadro(${JSON.stringify({ cx: c.cx, cy: c.cy, z: c.z, W: AN, H: AL, hud: true })}); })()`);
      fs.writeFileSync(path.join(dir, String(k).padStart(5, '0') + '.png'), Buffer.from(url.split(',')[1], 'base64'));
    }
    console.log('fotos en', dir);
  }
  if (PARTE === 'todo' || PARTE === 'largo') {
    const r0 = await prepararPartida(ev); if (r0 !== tl.resumen[0] && tl.resumen[0] != null) console.log('  ojo: el paso 0 no coincide');
    await grabar(ev, plan.cuadros, path.join(SALIDA, 'largo.mp4'), { W: AN, H: AL, hud: true, tl });
  }
  for (const c of cs) {
    if (!(PARTE === 'todo' || PARTE === 'cortos' || PARTE === c.nombre)) continue;
    await prepararPartida(ev);
    for (let t = 0; t < c.t0; t += 500) await ev(`M.pasos(${Math.min(500, c.t0 - t)}); 1`);
    await ev(`REC.limpiar(); 1`);
    await grabar(ev, c.cuadros, path.join(SALIDA, c.nombre + '.mp4'), { W: 1080, H: 1920, hud: false, tl });
  }
} finally { await cerrar(); }
process.exit(0);
