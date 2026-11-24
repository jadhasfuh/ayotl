// Corre de verdad los programas de «Programando …» (24-nov-2026), sin navegador, y guarda lo que pintan: lo que sale a la
// derecha del editor en el vídeo es el mismo código que se ve a la izquierda, no una imitación.
//   node correr.mjs trabajos.json
// Cada trabajo:
// - `salida`: base de los dos archivos que escribe: <salida>.bin (los cuadros distintos, un byte por píxel) y <salida>.json
//   ({ancho, alto, paleta, cuadros: [qué imagen va en cada cuadro], estados, estado: [qué estado va en cada cuadro],
//   sonidos: [[cuadro, nombre]]});
// - `cuadros`: cuántos, a 30 por segundo;
// - `archivos`: [[nombre, texto]] en el orden de carga (se quitan los import y los export y se pegan). El navegador es de
//   mentira: un canvas que sólo sabe fillStyle y fillRect (todo lo que usa el juego), requestAnimationFrame a 60 Hz, el
//   reloj, el teclado y Math.random con `semilla`;
// - `teclas`: [[cuadro, code, baja]]; `manual`: [[cuadro, js]] (se evalúa dentro del programa: para ir a cámara lenta o
//   preparar una situación); `quieto`: no se llama al bucle (sólo a lo que haya en `manual`); `lento`: cuántas veces más
//   despacio va su reloj; `bot`: juega sola;
// - o `dc`: {juego, mapa, semilla, param, saltar}: el juego de Daily Challenge, con su motor, jugado por el bot.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DC = '/Users/jadhasfuh/Documents/daily challenge';
const BTN = { UP: 1, DOWN: 2, LEFT: 4, RIGHT: 8 };
const TECLA = { 1: 'ArrowUp', 2: 'ArrowDown', 4: 'ArrowLeft', 8: 'ArrowRight' };

function color(c) {
  let m = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(c); if (m) return m.slice(1).map(v => parseInt(v + v, 16));
  m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(c); if (m) return m.slice(1).map(v => parseInt(v, 16));
  m = /^rgb\((\d+), ?(\d+), ?(\d+)\)$/.exec(c); if (m) return m.slice(1).map(Number);
  m = /^hsl\(([\d.]+), ?([\d.]+)%, ?([\d.]+)%\)$/.exec(c);
  if (m) {
    const h = +m[1] / 360, s = +m[2] / 100, l = +m[3] / 100;
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    const f = t => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    return [f(h + 1 / 3), f(h), f(h - 1 / 3)].map(v => Math.round(v * 255));
  }
  throw new Error('color que no entiendo: ' + c);
}

/** El canvas: un búfer RGB del tamaño que le ponga el programa. */
function pantalla() {
  let an = 160, al = 192, px = new Uint8Array(an * al * 3);
  const ctx = {
    fillStyle: '#000000', imageSmoothingEnabled: true,
    fillRect(x, y, w, h) {
      const [r, g, b] = color(this.fillStyle);
      const x0 = Math.max(0, Math.round(x)), y0 = Math.max(0, Math.round(y)), x1 = Math.min(an, Math.round(x + w)), y1 = Math.min(al, Math.round(y + h));
      for (let j = y0; j < y1; j++) for (let i = x0; i < x1; i++) { const k = (j * an + i) * 3; px[k] = r; px[k + 1] = g; px[k + 2] = b; }
    },
  };
  const canvas = {
    style: {}, getContext: () => ctx,
    get width() { return an; }, set width(v) { an = v; px = new Uint8Array(an * al * 3); },
    get height() { return al; }, set height(v) { al = v; px = new Uint8Array(an * al * 3); },
  };
  return { canvas, ctx, leer: () => ({ an, al, px }) };
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0; let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- el bot: el camino más corto a la fruta, si después todavía puede alcanzar su cola; si no, sigue a su cola
const DIRS = [[0, -1, 1], [0, 1, 2], [-1, 0, 4], [1, 0, 8]];
function camino(cuerpo, meta, dentro, COLS) {
  // el cuerpo se va quitando solo: el pedazo i (0 = cabeza) deja libre su casilla en largo - i pasos
  const libreEn = new Map(cuerpo.map((b, i) => [b.y * COLS + b.x, cuerpo.length - i]));
  const ini = cuerpo[0], k0 = ini.y * COLS + ini.x, de = new Map([[k0, null]]);
  let capa = [ini], d = 0;
  while (capa.length) {
    d++; const sig = [];
    for (const c of capa) for (const [dx, dy, b] of DIRS) {
      const x = c.x + dx, y = c.y + dy, k = y * COLS + x;
      if (!dentro(x, y) || de.has(k) || (libreEn.get(k) ?? 0) > d) continue;
      de.set(k, [c.y * COLS + c.x, b]);
      if (x === meta.x && y === meta.y) {
        const pasos = [];
        for (let q = k; de.get(q); q = de.get(q)[0]) pasos.unshift({ x: q % COLS, y: Math.floor(q / COLS), b: de.get(q)[1] });
        return pasos;
      }
      sig.push({ x, y });
    }
    capa = sig;
  }
  return null;
}
function decidir(g, COLS, ROWS, muro) {
  const dentro = (x, y) => x >= 0 && y >= 0 && x < COLS && y < ROWS && !muro(x, y);
  const cuerpo = g.body.map(b => ({ x: b.x, y: b.y }));
  const metas = [g.bicho, g.food].filter(Boolean);
  for (const meta of metas) {
    const p = camino(cuerpo, meta, dentro, COLS);
    if (!p || (meta === g.bicho && p.length * g.interval > g.bicho.vida)) continue;
    const despues = [...p.map(q => ({ x: q.x, y: q.y })).reverse(), ...cuerpo].slice(0, cuerpo.length + 1);
    if (despues.length < 4 || camino(despues, despues[despues.length - 1], dentro, COLS)) return p[0].b;
  }
  // a lo seguro: el paso que más lejos deja la cola sin perderla de vista
  let mejor = 0, lejos = -1;
  for (const [dx, dy, b] of DIRS) {
    const x = cuerpo[0].x + dx, y = cuerpo[0].y + dy, cola = cuerpo[cuerpo.length - 1];
    const esCola = x === cola.x && y === cola.y;
    if (!dentro(x, y) || (!esCola && cuerpo.some(c => c.x === x && c.y === y))) continue;
    const sig = [{ x, y }, ...cuerpo.slice(0, -1)];
    const p = camino(sig, sig[sig.length - 1], dentro, COLS);
    if (p && p.length > lejos) { lejos = p.length; mejor = b; }
    else if (!mejor) mejor = b;
  }
  return mejor;
}

/** Guarda los cuadros (sin repetir) y los estados (sin repetir) de un trabajo. */
function grabadora() {
  const paleta = new Map(), imagenes = [], clave = new Map(), cuadros = [], estados = [], estado = [], sonidos = [];
  let dim = null;
  return {
    cuadro({ an, al, px }) {
      dim ??= { an, al };
      const im = Buffer.alloc(an * al);
      for (let i = 0; i < im.length; i++) {
        const c = (px[i * 3] << 16) | (px[i * 3 + 1] << 8) | px[i * 3 + 2];
        let n = paleta.get(c); if (n === undefined) { n = paleta.size; paleta.set(c, n); if (n > 255) throw new Error('más de 256 colores'); }
        im[i] = n;
      }
      const s = im.toString('latin1');
      let n = clave.get(s); if (n === undefined) { n = imagenes.length; clave.set(s, n); imagenes.push(im); }
      cuadros.push(n);
    },
    estado(e) {
      const s = JSON.stringify(e);
      if (!estados.length || s !== JSON.stringify(estados[estados.length - 1])) estados.push(JSON.parse(s));
      estado.push(estados.length - 1);
    },
    sonido(n) { sonidos.push([cuadros.length, n]); },
    guardar(salida) {
      writeFileSync(salida + '.bin', Buffer.concat(imagenes));
      writeFileSync(salida + '.json', JSON.stringify({ ancho: dim.an, alto: dim.al, imagenes: imagenes.length, paleta: [...paleta.keys()].map(c => [c >> 16, (c >> 8) & 255, c & 255]), cuadros, estados, estado, sonidos }));
    },
  };
}

function programa(t) {
  const g = grabadora(), p = pantalla();
  const js = t.archivos.filter(([n]) => n.endsWith('.js')).map(([, s]) => s.split('\n').filter(l => !/^import .* from /.test(l)).join('\n').replace(/^export /gm, '')).join('\n');
  let reloj = 0, cola = [];
  const oye = { keydown: [], keyup: [] };
  const M = Object.create(Math); M.random = mulberry32(t.semilla ?? 1);
  const f = new Function('document', 'addEventListener', 'requestAnimationFrame', 'performance', 'Math', js + '\n;return __s => eval(__s);');
  const dentro = f({ querySelector: () => p.canvas }, (n, fn) => oye[n]?.push(fn), fn => { cola.push(fn); }, { now: () => reloj }, M);
  const hay = n => dentro(`typeof ${n} !== 'undefined'`);
  const tecla = (code, baja) => { for (const fn of oye[baja ? 'keydown' : 'keyup']) fn({ code }); };
  let sostiene = null, previo = null;
  for (let c = 0; c < t.cuadros; c++) {
    for (const [n, js_] of t.manual ?? []) if (n === c) dentro(js_);
    for (const [n, code, baja] of t.teclas ?? []) if (n === c) tecla(code, baja);
    for (let h = 0; h < 2; h++) {   // la pantalla va a 60 Hz y el vídeo a 30
      reloj += 1000 / 60 / (t.lento ?? 1);
      if (t.quieto) continue;
      if (t.bot && hay('game') && !dentro('game.over')) {   // el bot sostiene la tecla que toca hasta el siguiente paso
        const j = dentro('game');
        const b = decidir(j, dentro('COLS'), dentro('ROWS'), () => false);
        if (b && TECLA[b] !== sostiene) { if (sostiene) tecla(sostiene, false); tecla(TECLA[b], true); sostiene = TECLA[b]; }
      }
      const toca = cola; cola = [];
      for (const fn of toca) fn(reloj);
    }
    const e = hay('game') ? dentro('({body: game.body, dir: game.dir, nextDir: game.nextDir, tick: game.tick, interval: game.interval, eaten: game.eaten, score: game.score, over: game.over, food: game.food})') : {};
    e.held = hay('held') ? dentro('held') : 0;
    if (previo && e.body && previo.largo && e.body.length > previo.largo) g.sonido('eat');
    if (previo && e.over && !previo.over) g.sonido('die');
    previo = { largo: e.body?.length, over: e.over };
    g.estado(e); g.cuadro(p.leer());
  }
  g.guardar(t.salida);
}

async function daily(t) {
  const { claseDe } = await import(join(DC, 'public/arcade/games/index.js'));
  const { Renderer } = await import(join(DC, 'public/arcade/core/renderer.js'));
  const { COLS, ROWS } = await import(join(DC, `public/arcade/games/${t.dc.juego}.js`));
  const g = grabadora(), p = pantalla(), r = new Renderer(p.canvas);
  const Juego = claseDe(t.dc.juego);
  const j = new Juego(t.dc.semilla, readFileSync(join(DC, 'public/content/maps', t.dc.mapa + '.txt'), 'utf8'), { param: t.dc.param ?? 0 });
  const paso = () => j.update(j.over ? 0 : decidir(j, COLS, ROWS, (x, y) => j.walls[y][x]));
  for (let i = 0; i < (t.dc.saltar ?? 0); i++) paso();
  for (let c = 0; c < t.cuadros; c++) {
    if (c) { paso(); for (const s of j.events) g.sonido(s); }
    j.render(r);
    g.estado({ body: j.body, dir: j.dir, tick: j.tick, interval: j.interval, eaten: j.eaten, score: j.score, over: j.over, food: j.food, bicho: j.bicho, held: 0 });
    g.cuadro(p.leer());
  }
  g.guardar(t.salida);
}

for (const t of JSON.parse(readFileSync(process.argv[2], 'utf8'))) await (t.dc ? daily(t) : programa(t));
