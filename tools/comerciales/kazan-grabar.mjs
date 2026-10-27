// Las tres escenas de juego del comercial de Kazan (kazan.json): una partida local grabada del lienzo
// (320x180) cuadro a cuadro, un paso de la simulación por cuadro (10 pasos = 1 s de juego, así que a 30 fps
// va a 3x). Levanta el servidor de ~/Documents/kazan en un puerto propio, no toca el repo, y deja
// kazan/{ciudad,tropas,lava}.mp4 a 960x540 sin suavizar. La lava se graba como espectador (M.yo = null):
// el volcán está en la niebla de quien juega.
//   node tools/comerciales/kazan-grabar.mjs          (las tres)
//   node tools/comerciales/kazan-grabar.mjs lava     (sólo una, para afinarla)
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const AQUI = path.dirname(new URL(import.meta.url).pathname);
const KAZAN = path.join(os.homedir(), 'Documents/kazan');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kazan-rec-'));
const SOLO = process.argv[2];
const FFMPEG = spawnSync(path.join(os.homedir(), 'Documents/code challenge/.venv/bin/python'), ['-c', 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())'], { encoding: 'utf8' }).stdout.trim();
const dormir = ms => new Promise(r => setTimeout(r, ms));
const PUERTO = 8797;
const srv = spawn('node', ['servidor.mjs'], { cwd: KAZAN, env: { ...process.env, PORT: String(PUERTO), CPUS: '1' }, stdio: 'ignore' });
process.on('exit', () => srv.kill());
await dormir(800);
const perfil = path.join(TMP, 'perfil');
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--no-first-run', '--mute-audio', '--remote-debugging-port=9457', `--user-data-dir=${perfil}`, '--window-size=960,540', 'about:blank'], { stdio: 'ignore' });
let ws = null; for (let i = 0; i < 60 && !ws; i++) { await dormir(250); try { const l = await (await fetch('http://127.0.0.1:9457/json/list')).json(); const p = l.find(x => x.type === 'page'); if (p) ws = new WebSocket(p.webSocketDebuggerUrl); } catch {} }
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pend = new Map();
ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
const cdp = (method, params = {}) => new Promise(r => { const k = ++id; pend.set(k, r); ws.send(JSON.stringify({ id: k, method, params })); });
await cdp('Page.enable'); await cdp('Runtime.enable');
const ev = async e => { const r = await cdp('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text); return r.result?.result?.value; };
await cdp('Page.navigate', { url: `http://127.0.0.1:${PUERTO}/` }); await dormir(1500);

// n cuadros; antes de cada uno, `paso` (en un bloque: las constantes no chocan entre cuadros) y luego el lienzo
async function grabar(escena, n, paso = 'M.pasos(1)') {
  const d = path.join(TMP, escena); fs.mkdirSync(d, { recursive: true });
  for (let k = 0; k < n; k++) {
    const url = await ev(`{ ${paso} } document.getElementById('screen').toDataURL('image/png')`);
    fs.writeFileSync(path.join(d, String(k).padStart(4, '0') + '.png'), Buffer.from(url.split(',')[1], 'base64'));
  }
  const r = spawnSync(FFMPEG, ['-loglevel', 'error', '-y', '-framerate', '30', '-i', path.join(d, '%04d.png'), '-vf', 'scale=960:540:flags=neighbor',
                               '-c:v', 'libx264', '-crf', '14', '-pix_fmt', 'yuv420p', path.join(AQUI, 'kazan', escena + '.mp4')]);
  console.log(escena, n, 'cuadros', r.status === 0 ? '→ kazan/' + escena + '.mp4' : 'ffmpeg falló: ' + r.stderr);
}

const nueva = `M.saltarIntro(); M.menu.nombre = 'TU'; M.nuevaLocal({ cpus: 3, minutos: 10, semilla: 11, bioma: 'bosque' });`;
if (!SOLO || SOLO === 'ciudad' || SOLO === 'tropas') {
  // 1. La ciudad: una granja y una casa en obra, con los obreros yendo y viniendo
  await ev(`${nueva} M.pasos(40); M.mensajeT = 0; 1`);
  const base = await ev(`(() => { const b = M.e.edificios.find(x => x.due === M.yo && x.tipo === 'base'); return { x: b.x, y: b.y }; })()`);
  await ev(`M.ordenar({ t: 'construir', tipo: 'granja', x: ${base.x} - 3, y: ${base.y} + 1 }); M.ordenar({ t: 'construir', tipo: 'casa', x: ${base.x} + 4, y: ${base.y} }); 1`);
  await grabar('ciudad', 180);
  // 2. El ejército: el cuartel en cuanto alcance la madera, cinco tropas y a marchar
  await ev(`(() => { for (let k = 0; k < 40 && M.S.porQueNo(M.e, M.e.jugadores[M.yo], 'cuartel', ${base.x}, ${base.y} + 4); k++) M.pasos(50); M.ordenar({ t: 'construir', tipo: 'cuartel', x: ${base.x}, y: ${base.y} + 4 }); for (let k = 0; k < 40 && !M.e.edificios.some(b => b.due === M.yo && b.tipo === 'cuartel' && b.listo); k++) M.pasos(50); return 1; })()`);
  await ev(`(() => { const q = M.e.edificios.find(x => x.due === M.yo && x.tipo === 'cuartel'); if (q) { for (const t of ['soldado', 'soldado', 'soldado', 'franco', 'explorador']) M.ordenar({ t: 'entrenar', ed: q.id, tipo: t }); M.pasos(500); } M.mensajeT = 0; return 1; })()`);
  await ev(`(() => { const mil = M.e.unidades.filter(u => u.due === M.yo && u.tipo !== 'obrero'); M.sel = mil.map(u => u.id); M.tocar(60, 40); return mil.length; })()`);
  await grabar('tropas', 180);
}

if (!SOLO || SOLO === 'lava') {
  // 3. La lava saliendo del volcán justo después de la erupción, a 3 pasos por cuadro, sin avisos encima
  await ev(`(() => { ${nueva} for (let k = 0; k < 400 && M.e.lavaPtr === 0; k++) M.pasos(5); M.pasos(30); M.yo = null; return 1; })()`);
  await grabar('lava', 180, `M.pasos(3); M.modal = null; M.mensajeT = 0; const T = M.S.TILE, v = M.e.volcan; M.cam.x = Math.max(0, Math.min(M.e.ancho * T - 320, Math.round((v.x + 0.5) * T - 160))); M.cam.y = Math.max(0, Math.min(M.e.alto * T - 136, Math.round((v.y + 0.5) * T - 68))); M.dibujar()`);
}

ws.close(); chrome.kill(); srv.kill(); await dormir(800); fs.rmSync(TMP, { recursive: true, force: true });
process.exit(0);
