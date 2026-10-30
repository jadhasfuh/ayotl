// La partida del campeón de un día de Daily Challenge, entera y en vídeo, para el Short del «mejor del día»
// con LeIA (leia-mejor-del-dia.py; Adrián, 30-oct-2026). Re-simula tick a tick el log de inputs que guarda
// arcade.partidas, como hace tools/reel.js de DC, pero graba la partida completa y no sólo 8 s: la pantalla
// del juego (160x192, que ya trae su marcador) a 4x sin suavizar, con la chiptune del día. Los cuadros van a
// ffmpeg conforme salen, porque una partida de 16 minutos no cabe en memoria.
//   node dc-partida.mjs <fecha> <salida.mp4> [--info] [--minimo <s>]
// --info sólo simula y dice cuánto dura. --minimo repite la partida hasta llenar esos segundos, para una
// partida muy corta en la que LeIA habla más de lo que dura.
// Lee NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY del entorno (las pone leia-mejor-del-dia.py; nunca se
// imprimen). Escribe un JSON con {fecha, juego, titulo, nombre, puntaje, segundos, fin, vueltas, salida}.
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const DC = '/Users/jadhasfuh/Documents/daily challenge';
const { claseDe, CONTENT } = await import(join(DC, 'public/arcade/games/index.js'));
const { Renderer } = await import(join(DC, 'public/arcade/core/renderer.js'));
const { hashString, seeds } = await import(join(DC, 'public/arcade/core/rng.js'));
const { retoProcedural } = await import(join(DC, 'public/arcade/core/procedural.js'));
const { ordenMapas } = await import(join(DC, 'public/arcade/core/orden-mapas.js'));
const { musicaVigente } = await import(join(DC, 'public/arcade/core/musica-retirada.js'));
const { lienzo, guardarPng } = await import(join(DC, 'tools/lienzo.js'));
const { chiptuneWav } = await import(join(DC, 'tools/chiptune.js'));
const { binarioFfmpeg } = await import(join(DC, 'tools/reel.js'));

const FPS = 30, ESCALA = 4, AN = 160, AL = 192;
const PAUSA = 2;   // segundos con la pantalla final quieta después del game over (y entre una vuelta y otra)

const args = process.argv.slice(2);
const [fecha, salida] = args.filter(a => !a.startsWith('--') && !/^\d+(\.\d+)?$/.test(a));
const info = args.includes('--info');
const minimo = args.includes('--minimo') ? parseFloat(args[args.indexOf('--minimo') + 1]) : 0;
if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha ?? '') || (!info && !salida)) {
  console.error('uso: node dc-partida.mjs <fecha> <salida.mp4> [--info] [--minimo <s>]'); process.exit(1);
}

const contenido = (...p) => readFileSync(join(DC, 'public', 'content', ...p), 'utf8');

async function rest(ruta) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, llave = process.env.SUPABASE_SECRET_KEY;
  if (!url || !llave) throw new Error('faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY en el entorno');
  const r = await fetch(`${url}/rest/v1/${ruta}`, { headers: { apikey: llave, 'Accept-Profile': 'arcade' } });
  if (!r.ok) throw new Error(`Supabase contestó ${r.status} en ${ruta.split('?')[0]}`);
  return r.json();
}

/** El reto que se jugó ese día: el que quedó guardado en arcade.retos (como asegurarReto de DC) o, si no hay fila, el del calendario. */
async function retoDe(fecha) {
  const [fila] = await rest(`retos?select=juego,mapa,musica,param,semilla&fecha=eq.${fecha}`);
  if (fila) return { juego: fila.juego, mapa: fila.mapa, musica: musicaVigente(fila.musica, fila.juego), param: fila.param, semilla: Number(fila.semilla) };
  const filas = contenido('schedule.txt').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#')).map(l => l.split(/\s+/));
  const f = filas.find(x => x[0] === fecha);
  const r = f ? { juego: f[1], mapa: f[2], musica: f[3], param: parseInt(f[4] ?? '1') }
              : (p => ({ juego: p.gameId, mapa: p.mapFile, musica: p.musicFile, param: p.param }))(retoProcedural(fecha));
  return { ...r, musica: musicaVigente(r.musica, r.juego), semilla: hashString(fecha) };
}

const [campeon] = await rest(`partidas?select=log,puntaje,perfiles(nombre)&fecha=eq.${fecha}&order=puntaje.desc&limit=1`);
if (!campeon?.log) { console.log(JSON.stringify({ fecha, sin_partidas: true })); process.exit(0); }
const perfil = Array.isArray(campeon.perfiles) ? campeon.perfiles[0] : campeon.perfiles;
const reto = await retoDe(fecha);
const Game = claseDe(reto.juego, fecha);   // con la fecha, las reglas de ese día: el log se jugó con ellas
if (!Game) throw new Error(`juego desconocido: ${reto.juego}`);
const log = Array.from(String(campeon.log), ch => ch.charCodeAt(0) - 48);
const opciones = { param: reto.param, mapas: ordenMapas(CONTENT.maps[reto.juego] ?? [reto.mapa], reto.mapa, fecha, reto.semilla).map(m => contenido('maps', `${m}.txt`)) };
const nuevo = () => new Game(seeds(reto.semilla).game, contenido('maps', `${reto.mapa}.txt`), opciones);

// Una pasada sin dibujar: en qué tick acaba la partida, con cuántos puntos y cuántos llevaba cada segundo
// (en una partida larga, LeIA dice cada tanto cuántos puntos van).
const g0 = nuevo();
let fin = 0;
const marcador = [];
while (fin < log.length && !g0.over) { if (fin % FPS === 0) marcador.push(g0.score); g0.update(log[fin++]); }
const vuelta = fin + PAUSA * FPS;   // cuadros de una vuelta: la partida y la pantalla final
const vueltas = Math.max(1, Math.ceil(minimo * FPS / vuelta));
const datos = { fecha, juego: reto.juego, titulo: Game.title, nombre: perfil?.nombre ?? '', puntaje: campeon.puntaje,
                puntaje_simulado: g0.score, segundos: +(vuelta * vueltas / FPS).toFixed(2), fin: +(fin / FPS).toFixed(2), vueltas, salida: salida ?? null };
if (g0.score !== campeon.puntaje) console.error(`ojo: la simulación da ${g0.score} y la base ${campeon.puntaje}`);
if (info) { console.log(JSON.stringify({ ...datos, marcador })); process.exit(0); }

const ffmpeg = await binarioFfmpeg();
const wav = `${salida}.wav`;
writeFileSync(wav, chiptuneWav(contenido('music', `${reto.musica}.txt`), seeds(reto.semilla).music, vuelta * vueltas / FPS));
const p = spawn(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${AN}x${AL}`, '-r', String(FPS), '-i', 'pipe:0', '-i', wav,
  '-vf', `scale=${AN * ESCALA}:${AL * ESCALA}:flags=neighbor`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '18', '-g', '60',
  '-c:a', 'aac', '-ar', '48000', '-ac', '2', '-b:a', '128k', '-shortest', '-movflags', '+faststart', salida], { stdio: ['pipe', 'ignore', 'pipe'] });
let err = '';
p.stderr.on('data', d => { err += d; });
p.stdin.on('error', () => {});   // si ffmpeg se cae, interesa su stderr, no el EPIPE
const termino = new Promise((ok, mal) => p.on('close', c => (c === 0 ? ok() : mal(new Error(`ffmpeg salió con ${c}:\n${err.slice(-800)}`)))));
const escribir = buf => (p.stdin.write(buf) ? null : new Promise(ok => p.stdin.once('drain', ok)));

const pantalla = lienzo(AN, AL);
const r = new Renderer(pantalla.canvas);
for (let v = 0; v < vueltas; v++) {
  const g = nuevo();
  for (let t = 0; t < vuelta; t++) {
    if (t < fin && !g.over) g.update(log[t]);
    g.render(r);
    // la captura para la miniatura: un segundo antes del final, con el marcador casi completo
    if (v === 0 && t === Math.max(0, fin - FPS)) guardarPng(pantalla, salida.replace(/\.mp4$/, '.png'), ESCALA);
    await escribir(Uint8Array.from(pantalla.px));
  }
}
p.stdin.end();
await termino;
try { unlinkSync(wav); } catch {}
console.log(JSON.stringify(datos));
