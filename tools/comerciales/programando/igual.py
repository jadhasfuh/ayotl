#!/usr/bin/env python3
"""¿El Snake del vídeo y el de Daily Challenge hacen lo mismo? (LeIA dice «los mismos nombres y la misma lógica».)

  python3 tools/comerciales/programando/igual.py snake1 [partidas]

Corre las dos clases con la misma semilla, la misma salida y las mismas teclas y compara en cada tick el cuerpo, la
dirección, el reloj, los puntos, la fruta y el fin. Al de DC se le quita lo que es de la parte 2: los muros, el bicho y el
hambre. El 24-nov-2026: 400 partidas y 177 088 ticks, ninguna distinta. Si cambia games/snake.js de DC, volver a correrlo.
"""
import importlib, json, os, subprocess, sys, tempfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
mod = importlib.import_module(sys.argv[1]); partidas = int(sys.argv[2]) if len(sys.argv) > 2 else 400
js = '\n'.join(l for n in ('renderer.js', 'input.js', 'snake.js') for l in mod.FINAL[n].split('\n') if not l.startswith('import ')).replace('export ', '')
PRUEBA = '''
import { Snake as DC } from '/Users/jadhasfuh/Documents/daily challenge/public/arcade/games/snake.js';
import { mulberry32 } from '/Users/jadhasfuh/Documents/daily challenge/public/arcade/core/rng.js';
const M = Object.create(Math);
const { Snake } = new Function('addEventListener', 'Math', CODIGO + ';return { Snake };')(() => {}, M);
let ticks = 0, frutas = 0, distintas = 0;
for (let semilla = 1; semilla <= PARTIDAS; semilla++) {
  const az = mulberry32(semilla * 7919);
  M.random = mulberry32(semilla).next;
  const n = new Snake(), d = new DC(1, '', { param: 0 });
  d.body = n.body.map(c => ({ ...c })); d.dir = { x: 1, y: 0 }; d.nextDir = d.dir; d.rng = mulberry32(semilla); d.spawnBicho = () => {}; d.spawnFood();
  let mask = 0;
  for (let t = 0; t < 3000 && !n.over && !d.over; t++) {
    if (t % 4 === 0) {   // casi siempre hacia la fruta, para que coma y crezca; a veces, cualquier tecla
      const h = n.body[0], f = n.food, r = az.next();
      if (r < 0.12) mask = 1 << Math.floor(az.next() * 4);
      else if (f && r < 0.6) mask = f.x > h.x ? 8 : f.x < h.x ? 4 : f.y > h.y ? 2 : 1;
      else if (f) mask = f.y > h.y ? 2 : f.y < h.y ? 1 : f.x > h.x ? 8 : 4;
    }
    d.hambre = 1e9; n.update(mask); d.update(mask); ticks++;
    const ver = g => JSON.stringify([g.body, g.dir, g.nextDir, g.tick, g.interval, g.eaten, g.score, g.over, g.food]);
    if (ver(n) !== ver(d)) { if (++distintas < 3) console.log(`semilla ${semilla}, tick ${t}:\\n  ${ver(n)}\\n  ${ver(d)}`); break; }
  }
  frutas += n.eaten;
}
console.log({ partidas: PARTIDAS, ticks, frutas, distintas });
process.exit(distintas ? 1 : 0);
'''.replace('CODIGO', json.dumps(js)).replace('PARTIDAS', str(partidas))
with tempfile.TemporaryDirectory() as tmp:
    ruta = os.path.join(tmp, 'igual.mjs'); open(ruta, 'w', encoding='utf-8').write(PRUEBA)
    sys.exit(subprocess.run(['node', ruta]).returncode)
