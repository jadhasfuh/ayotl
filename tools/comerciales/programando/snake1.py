"""«Programando Snake», parte 1 (piloto del 24-nov-2026, para el domingo 29-nov 18:00): LeIA programa desde una página en
blanco el Snake de Daily Challenge. Los nombres y la lógica son los de public/arcade/games/snake.js, core/renderer.js,
core/input.js y el bucle de shell.js; aquí van en cinco archivos cortos, sin mapas, semilla, bicho, hambre, sonido ni
servidor, que son la parte 2. El formato lo explica armar.py; el curso es ayotl.dev/aprende/snake.

Cada versión de un archivo se hace de la anterior con tras(), antes() o cambia(), y P(…, ed=(archivo, versión)) la
escribe en pantalla. Lo que corre a la derecha es ese mismo código (correr.mjs). Las reglas para cambiarlo:
- renglones de 54 caracteres o menos (es lo que cabe a 24 px);
- cada dato de lo que dice LeIA se comprueba con `armar.py snake1 --revisar` o contra el código de DC.
"""
from pasos import P, antes, cambia, tras

CLAVE = 'snake-1'
TITULO = {'es': ('PROGRAMANDO', 'SNAKE', 'PARTE 1'), 'en': ('CODING', 'SNAKE', 'PART 1')}
LEMA = {'es': 'Parte 1: de cero a jugable', 'en': 'Part 1: from zero to playable'}
SUBTITULO = {'es': 'JAVASCRIPT, SIN MOTOR', 'en': 'JAVASCRIPT, NO ENGINE'}
ORDEN = ['index.html', 'renderer.js', 'input.js', 'snake.js', 'main.js']   # el de carga, para correrlo
CAPITULOS = {'es': ['LA PANTALLA', 'LAS CASILLAS', 'UNA LISTA', 'MOVERSE', 'EL RELOJ', 'LOS CONTROLES', 'LA COMIDA',
                    'LOS CHOQUES', 'EL MARCADOR', 'A JUGAR'],
             'en': ['THE SCREEN', 'THE CELLS', 'A LIST', 'MOVING', 'THE CLOCK', 'THE CONTROLS', 'THE FOOD', 'COLLISIONS',
                    'THE SCORE', "LET'S PLAY"]}

# ---------------------------------------------------------------- las versiones de cada archivo
HTML = '''<!doctype html>
<style>
  canvas {
    width: 480px;
    image-rendering: pixelated;
  }
</style>
<canvas></canvas>
<script type="module" src="main.js"></script>'''

REN1 = '''export const VW = 160, VH = 192;

export class Renderer {
  constructor(canvas) {
    canvas.width = VW;
    canvas.height = VH;
    this.ctx = canvas.getContext('2d');
  }
}'''
REN2 = tras(REN1, "getContext('2d')", '''  }

  rect(x, y, w, h, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);''')
REN3 = tras(REN2, 'fillRect(x, y, w, h)', '''  }

  clear(color) {
    this.rect(0, 0, VW, VH, color);''')
REN4 = tras(REN3, 'VW = 160', '''
export const PAL = {
  black: 'rgb(0,0,0)',
  dgray: 'rgb(68,68,68)',
  white: 'rgb(238,238,238)',
  yellow: 'hsl(55,60%,74%)',
  red: 'hsl(343,70%,54%)',
  green: 'hsl(127,70%,54%)',
  lgreen: 'hsl(127,60%,74%)',
};''')
# la fuente de core/renderer.js: sólo lo que usa el marcador
REN5 = antes(REN4, 'export class Renderer', '''const FONT = {
  'S': ['111', '100', '111', '001', '111'],
  'C': ['111', '100', '100', '100', '111'],
  'O': ['111', '101', '101', '101', '111'],
  'R': ['110', '101', '110', '101', '101'],
  'E': ['111', '100', '111', '100', '111'],
  'X': ['101', '101', '010', '101', '101'],
  ' ': ['000', '000', '000', '000', '000'],
  '0': ['111', '101', '101', '101', '111'],
  '1': ['010', '110', '010', '010', '111'],
  '2': ['111', '001', '111', '100', '111'],
  '3': ['111', '001', '111', '001', '111'],
  '4': ['101', '101', '111', '001', '001'],
  '5': ['111', '100', '111', '001', '111'],
  '6': ['111', '100', '111', '101', '111'],
  '7': ['111', '001', '001', '001', '001'],
  '8': ['111', '101', '111', '101', '111'],
  '9': ['111', '101', '111', '001', '111'],
};
''')
FUENTE = {m[0]: m[1] for m in __import__('ast').literal_eval('[' + ','.join('(' + l.strip().rstrip(',').replace(': [', ', [', 1) + ')'
          for l in REN5.split('\n') if l.startswith("  '") and ': [' in l) + ']')}   # la misma, para dibujarla en grande
REN6 = tras(REN5, 'this.rect(0, 0, VW, VH, color)', '''  }

  text(str, x, y, color) {
    for (const ch of str) {
      const g = FONT[ch];
      for (let r = 0; r < 5; r++)
        for (let c = 0; c < 3; c++)
          if (g[r][c] === '1')
            this.rect(x + c, y + r, 1, 1, color);
      x += 4;
    }''')

MAIN1 = '''import { Renderer, PAL } from './renderer.js';

const canvas = document.querySelector('canvas');
const r = new Renderer(canvas);
r.clear(PAL.black);
r.rect(60, 96, 30, 10, PAL.green);'''
MAIN2 = '''import { Renderer } from './renderer.js';
import { Snake } from './snake.js';

const canvas = document.querySelector('canvas');
const r = new Renderer(canvas);
const game = new Snake();
game.render(r);'''
MAIN3 = cambia(MAIN2, 'game.render(r);', '''
function frame() {
  requestAnimationFrame(frame);
  game.update();
  game.render(r);
}
requestAnimationFrame(frame);''')
MAIN4 = cambia(MAIN3, 'function frame() {', '''const TICK_MS = 1000 / 30;
let last = performance.now(), acc = 0;

function frame(now) {''')
MAIN5 = cambia(MAIN4, '  game.update();', '''  acc += Math.min(now - last, 250);
  last = now;
  while (acc >= TICK_MS) {
    game.update();
    acc -= TICK_MS;
  }''')
MAIN6 = cambia(tras(MAIN5, './snake.js', "import { poll } from './input.js';"), '    game.update();', '    game.update(poll());')

IN1 = '''export const BTN = {
  UP: 1, DOWN: 2, LEFT: 4, RIGHT: 8,
};'''
IN2 = IN1 + '''

const KEYS = {
  ArrowUp: BTN.UP, ArrowDown: BTN.DOWN,
  ArrowLeft: BTN.LEFT, ArrowRight: BTN.RIGHT,
};'''
IN3 = IN2 + '''

let held = 0;

addEventListener('keydown', e => {
  held |= KEYS[e.code] ?? 0;
});

addEventListener('keyup', e => {
  held &= ~(KEYS[e.code] ?? 0);
});'''
IN4 = IN3 + '''

export const poll = () => held;'''

SN1 = '''export const CELL = 10, COLS = 16, ROWS = 17;'''
SN2 = SN1 + '''
export const HUD = 16;'''
SN3 = SN2 + '''

export class Snake {
  constructor() {
    this.body = [
      { x: 8, y: 8 },
      { x: 7, y: 8 },
      { x: 6, y: 8 },
    ];
  }
}'''
SN4 = tras(SN3, '    ];', '    this.dir = { x: 1, y: 0 };')
SN5 = "import { PAL } from './renderer.js';\n\n" + tras(SN4, 'this.dir = {', '''  }

  render(r) {
    r.clear(PAL.black);
    this.body.forEach((b, i) => r.rect(
      b.x * CELL, HUD + b.y * CELL, CELL, CELL,
      i === 0 ? PAL.lgreen : PAL.green));''')
SN6 = antes(SN5, '  render(r) {', '''  update() {
    const head = {
      x: this.body[0].x + this.dir.x,
      y: this.body[0].y + this.dir.y,
    };
  }
''')
SN7 = tras(SN6, 'y: this.body[0].y', '''    };
    this.body.unshift(head);''', quita=1)
SN8 = tras(SN7, 'unshift(head)', '    this.body.pop();')
SN9 = antes(tras(SN8, 'this.dir = {', '''    this.tick = 0;
    this.interval = 8;'''), '    const head = {', '''    this.tick++;
    if (this.tick % this.interval !== 0) return;
''')
SN10 = "import { BTN } from './input.js';\n" + cambia(SN9, '  update() {', '''  update(mask) {
    if (mask & BTN.UP && this.dir.y !== 1)
      this.nextDir = { x: 0, y: -1 };
''')
SN11 = tras(SN10, 'this.nextDir = { x: 0, y: -1 };', '''    else if (mask & BTN.DOWN && this.dir.y !== -1)
      this.nextDir = { x: 0, y: 1 };
    else if (mask & BTN.LEFT && this.dir.x !== 1)
      this.nextDir = { x: -1, y: 0 };
    else if (mask & BTN.RIGHT && this.dir.x !== -1)
      this.nextDir = { x: 1, y: 0 };''')
SN12 = antes(tras(SN11, 'this.dir = { x: 1', '    this.nextDir = this.dir;'), '    const head = {', '    this.dir = this.nextDir;')
SN13 = antes(SN12, '  update(mask) {', '''  isFree(x, y) {
    if (x < 0 || x >= COLS) return false;
    if (y < 0 || y >= ROWS) return false;
    return !this.body.some(
      b => b.x === x && b.y === y);
  }
''')
SN14 = antes(SN13, '  update(mask) {', '''  spawnFood() {
    const free = [];
    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < COLS; x++)
        if (this.isFree(x, y)) free.push({ x, y });
  }
''')
SN15 = tras(SN14, 'free.push({ x, y })', '''    const n = Math.random() * free.length;
    this.food = free[Math.floor(n)];''')
SN16 = tras(tras(SN15, 'this.interval = 8;', '    this.spawnFood();'), 'r.clear(PAL.black);', '''    const f = this.food;
    if (f) r.rect(
      f.x * CELL + 1, HUD + f.y * CELL + 1,
      CELL - 2, CELL - 2, PAL.red);''')
SN17 = antes(SN16, '    this.body.unshift(head);', '''    const eating = head.x === this.food.x
      && head.y === this.food.y;''')
SN18 = cambia(SN17, '    this.body.pop();', '''    if (eating) {
      this.spawnFood();
    } else {
      this.body.pop();
    }''')
SN19 = antes(tras(SN18, 'this.interval = 8;', '''    this.eaten = 0;
    this.score = 0;'''), '      this.spawnFood();', '''      this.eaten++;
      this.score += 10 + (8 - this.interval) * 5;
      this.interval = Math.max(3,
        8 - Math.floor(this.eaten / 4));''')
SN20 = antes(tras(tras(SN19, 'this.score = 0;', '    this.over = false;'), 'update(mask) {', '    if (this.over) return;'),
             '    this.body.unshift(head);', '''    if (!this.isFree(head.x, head.y)) {
      this.over = true;
      return;
    }''')
SN21 = cambia(SN20, '    if (!this.isFree(head.x, head.y)) {', '''    const tail = this.body[this.body.length - 1];
    const hitsTail = !eating &&
      head.x === tail.x && head.y === tail.y;
    if (!hitsTail && !this.isFree(head.x, head.y)) {''')
SN21B = tras(SN21, '      this.spawnFood();', '      if (!this.food) this.over = true;')
SN22 = tras(SN21B, 'CELL - 2, CELL - 2, PAL.red', '''    r.rect(0, 0, 160, HUD, PAL.dgray);
    const pts = String(this.score).padStart(5, '0');
    r.text('SCORE ' + pts, 4, 5, PAL.white);
    r.text('X' + this.eaten, 132, 5, PAL.yellow);''')

FINAL = {'index.html': HTML, 'renderer.js': REN6, 'input.js': IN4, 'snake.js': SN22, 'main.js': MAIN6}
TOTAL = sum(len(v.split('\n')) for v in FINAL.values())
assert all(len(l) <= 54 for v in FINAL.values() for l in v.split('\n')), [l for v in FINAL.values() for l in v.split('\n') if len(l) > 54]

# la serpiente de cuatro que da vueltas en un cuadro de 2 x 2, para el error de la cola (se coloca a mano)
CUADRO = ('game.body = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 7, y: 9 }, { x: 8, y: 9 }];'
          'game.dir = game.nextDir = { x: 1, y: 0 }; game.food = { x: 3, y: 4 }; game.tick = 0; game.interval = 16;')
# abajo, izquierda, arriba, derecha: cada tecla se aprieta justo después de un paso (uno cada 16 ticks, para verlo)
VUELTAS = [(0.10 + i * 16 / 30, ['ArrowDown', 'ArrowLeft', 'ArrowUp', 'ArrowRight'][i % 4], 0.3) for i in range(60)]
IZQ = 'game.body = [{ x: 1, y: 8 }, { x: 0, y: 8 }, { x: -1, y: 8 }]; game.tick = 0;'
CENTRO = 'game.body = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }];'

TRES = [(8, 8), (7, 8), (6, 8)]
REAL = {'juego': 'snake', 'mapa': 'snake_01', 'semilla': 20261129, 'param': 3}

ARCHIVOS = {'es': [('index.html', 'LA PÁGINA'), ('renderer.js', 'PINTA'), ('input.js', 'LEE LAS TECLAS'), ('snake.js', 'EL JUEGO'),
                   ('main.js', 'LO JUNTA TODO')],
            'en': [('index.html', 'THE PAGE'), ('renderer.js', 'DRAWS'), ('input.js', 'READS THE KEYS'), ('snake.js', 'THE GAME'),
                   ('main.js', 'TIES IT TOGETHER')]}

# ---------------------------------------------------------------- lo que dice LeIA y lo que se ve
GUION = [
    # ------------------------------------------------ la entrada
    P('¡Hola! Soy LeIA. Hoy vamos a programar Snake, el de Daily Challenge, desde una página en blanco.',
      voz='¡Hola! Soy Leia. Hoy vamos a programar Snake, el de Daily Challenge, desde una página en blanco.',
      cara='feliz', vista='portada', corre={'id': 'real', 'dc': dict(REAL, saltar=1500)}),
    P(f'Sin motor y sin librerías: JavaScript, un canvas y {TOTAL} líneas, contando las de la página.',
      vista='portada', corre='real'),
    P('Ésta es la parte 1: al final, la serpiente se mueve, come, crece y choca. En la 2 le ponemos mapas, sonido y servidor.',
      voz='Ésta es la parte uno: al final, la serpiente se mueve, come, crece y choca. En la dos le ponemos mapas, sonido y servidor.',
      cara='guino', vista='portada', corre='real'),
    P('Si sabes qué es una variable y qué es un if, llegas hasta el final.', cara='feliz', vista='portada', corre='real'),

    # ------------------------------------------------ 1 la pantalla
    P('Son cinco archivos cortos. El primero, index.html: un canvas y nuestro programa.',
      voz='Son cinco archivos cortos. El primero, index punto hache te eme ele: un canvas y nuestro programa.',
      cap=0, ed=('index.html', HTML), panel=('archivos', ARCHIVOS, 0)),
    P('El juego mide 160 por 192 píxeles, la proporción de la Atari 2600. El estilo lo agranda tres veces.',
      voz='El juego mide ciento sesenta por ciento noventa y dos píxeles, la proporción de la Atari veintiséis cientos. El estilo lo agranda tres veces.',
      resalta=[('width: 480px', 0.6)], panel=('medidas',)),
    P('Y pixelated es la palabra mágica: sin ella, al agrandar, el navegador difumina y todo sale borroso.',
      voz='Y pixeleited es la palabra mágica: sin ella, al agrandar, el navegador difumina y todo sale borroso.',
      cara='guino', resalta=[('pixelated', 0.0)], panel=('borroso',)),
    P('Y type module nos deja partir el programa en archivos. Eso sí: se abre con un servidor local, no con doble clic.',
      voz='Y taip mádiul nos deja partir el programa en archivos. Eso sí: se abre con un servidor local, no con doble clic.',
      cara='pensando', resalta=[('type="module"', 0.0)], panel=('terminal',)),
    P('renderer.js es el pincel. Le da su tamaño al canvas y pide el contexto 2D, que es con lo que se pinta.',
      voz='Renderer es el pincel. Le da su tamaño al canvas y pide el contexto dos de, que es con lo que se pinta.',
      ed=('renderer.js', REN1), panel=('archivos', ARCHIVOS, 1)),
    P('Sabe hacer una sola cosa: rectángulos. Una esquina, un ancho, un alto y un color.',
      ed=('renderer.js', REN2), panel=('rectangulo',)),
    P('Limpiar también es un rectángulo: uno del tamaño de toda la pantalla.', ed=('renderer.js', REN3), panel=('rectangulo', 'todo')),
    P('Y una paleta corta, con los colores de Daily Challenge, para no escribirlos cada vez.', ed=('renderer.js', REN4),
      panel=('paleta',)),
    P('Vamos a probarlo. En main.js: fondo negro y un rectángulo verde, de 30 por 10.',
      voz='Vamos a probarlo. En main: fondo negro y un rectángulo verde, de treinta por diez.',
      ed=('main.js', MAIN1), corre={'id': 'prueba', 'desde': 0.93}),
    P('¡Ahí está! Treinta píxeles de serpiente. No se mueve, pero tampoco se queja.', cara='feliz', corre='prueba'),

    # ------------------------------------------------ 2 las casillas
    P('Ahora el juego, snake.js. Snake no piensa en píxeles: piensa en casillas de 10 por 10.',
      voz='Ahora el juego, en snake punto jota ese. Snake no piensa en píxeles: piensa en casillas de diez por diez.',
      cap=1, ed=('snake.js', SN1), panel=('rejilla', [])),
    P('16 columnas por 10 son 160: el ancho exacto. Y 17 renglones por 10 son 170.',
      voz='Dieciséis columnas por diez son ciento sesenta: el ancho exacto. Y diecisiete renglones por diez son ciento setenta.',
      resalta=[('COLS = 16', 0.0)], panel=('rejilla', [('16 x 10 = 160', 0.15), ('17 x 10 = 170', 0.62)])),
    P('Arriba, 16 píxeles para el marcador: el HUD. En total, 186 de 192. Sobran seis.',
      voz='Arriba, dieciséis píxeles para el marcador: el jad. En total, ciento ochenta y seis de ciento noventa y dos. Sobran seis.',
      ed=('snake.js', SN2), panel=('rejilla', [('170 + 16 = 186', 0.4), ('192 - 186 = 6', 0.8)], 'hud')),
    P('De casilla a píxel: la columna por 10, y el renglón por 10, más el HUD. La casilla 7, 8 cae en el píxel 70, 96.',
      voz='De casilla a píxel: la columna por diez, y el renglón por diez, más el jad. La casilla siete, ocho, cae en el píxel setenta, noventa y seis.',
      panel=('casilla', (7, 8)), resalta=[('CELL = 10', 0.0), ('HUD = 16', 0.42)]),

    # ------------------------------------------------ 3 una lista
    P('¿Y la serpiente? No es un dibujo. Es una lista de casillas.', cap=2, cara='pensando', ed=('snake.js', SN3),
      panel=('lista', [])),
    P('La primera es la cabeza. Empieza con tres, en el centro, una detrás de otra.',
      resalta=[('{ x: 8, y: 8 }', 0.0), (('{ x: 8, y: 8 }', '{ x: 6, y: 8 }'), 0.35)], panel=('lista', [(8, 8), (7, 8), (6, 8)])),
    P('También guarda hacia dónde va: x 1, y 0. O sea, un paso a la derecha.',
      voz='También guarda hacia dónde va: equis uno, ye cero. O sea, un paso a la derecha.',
      ed=('snake.js', SN4), panel=('lista', [(8, 8), (7, 8), (6, 8)], 'dir')),
    P('render la pinta: recorre la lista y hace un rectángulo por casilla.', ed=('snake.js', SN5),
      panel=('lista', [(8, 8), (7, 8), (6, 8)], 'dir')),
    P('La casilla cero, la cabeza, en verde claro. Las demás, en verde.', resalta=[('i === 0', 0.0)],
      panel=('lista', [(8, 8), (7, 8), (6, 8)], 'dir')),
    P('En main.js cambiamos el rectángulo por el juego. Ahora sí: es una serpiente de verdad.',
      voz='En main cambiamos el rectángulo por el juego. Ahora sí: es una serpiente de verdad.',
      cara='feliz', ed=('main.js', MAIN2), corre={'id': 'quieta', 'desde': 0.6}),

    # ------------------------------------------------ 4 moverse
    P('Que se mueva. Para avanzar un paso, ¿hay que mover las tres casillas?', cap=3, cara='pensando', ve='snake.js',
      resalta=[(('{ x: 8, y: 8 }', '{ x: 6, y: 8 }'), 0.3)], corre='quieta'),
    P('No. Se calcula dónde va a quedar la cabeza: su casilla más la dirección.', ed=('snake.js', SN6), panel=('lista',), corre='quieta'),
    P('Esa casilla entra al principio de la lista, con unshift.', voz='Esa casilla entra al principio de la lista, con anshift.',
      ed=('snake.js', SN7), panel=('lista', {'pasos': [(0, TRES), (0.55, [(9, 8)] + TRES)]}), corre='quieta'),
    P('Y la última sale, con pop. Las de en medio ni se enteran.', ed=('snake.js', SN8),
      panel=('lista', {'pasos': [(0, [(9, 8)] + TRES), (0.35, [(9, 8)] + TRES[:2])]}), corre='quieta'),
    P('Míralo a cámara lenta: entra una por delante y sale una por detrás.',
      resalta=[('unshift(head)', 0.3), ('body.pop()', 0.65)], panel=('lista',),
      corre={'id': 'lenta', 'manual': [(1.0 + i * 1.1, 'game.update(); game.render(r);') for i in range(7)]}),
    P('Parece que repta, y sólo cambiaron dos casillas. Da lo mismo si mide 3 o 200.',
      voz='Parece que repta, y sólo cambiaron dos casillas. Da lo mismo si mide tres o doscientas.',
      cara='guino', panel=('lista',), corre='lenta'),

    # ------------------------------------------------ 5 el reloj
    P('¿Y quién llama a update? El navegador avisa antes de pintar cada cuadro, con requestAnimationFrame.',
      voz='¿Y quién llama a apdeit? El navegador avisa antes de pintar cada cuadro, con requést animéishon freim.',
      cap=4, ed=('main.js', MAIN3), corre='lenta'),
    P('Movámosla en cada aviso, a ver qué pasa…', cara='pensando', resalta=[('game.update()', 0.0)], corre={'id': 'loca', 'desde': 0.75,
      'manual': [(i * 1.2, CENTRO) for i in range(1, 12)]}),
    P('¡Se fue! Sesenta casillas por segundo. Y en una pantalla de 120 hercios, ciento veinte.',
      voz='¡Se fue! Sesenta casillas por segundo. Y en una pantalla de ciento veinte hercios, ciento veinte.',
      cara='sorpresa', corre='loca'),
    P('El juego necesita su propio reloj: 30 ticks por segundo, siempre, en cualquier pantalla.',
      voz='El juego necesita su propio reloj: treinta tics por segundo, siempre, en cualquier pantalla.',
      ed=('main.js', MAIN4), panel=('acumulador', [])),
    P('acc, el acumulador, junta el tiempo que va pasando. Mientras quepa un tick entero, se corre uno y se descuenta.',
      voz='El acumulador junta el tiempo que va pasando. Mientras quepa un tic entero, se corre uno y se descuenta.',
      ed=('main.js', MAIN5), panel=('acumulador', [])),
    P('Si un cuadro llega tarde, corren dos ticks seguidos; si llega temprano, ninguno. A la larga, siempre 30.',
      voz='Si un cuadro llega tarde, corren dos tics seguidos; si llega temprano, ninguno. A la larga, siempre treinta.',
      resalta=[(('while (acc', 'acc -= TICK_MS'), 0.0)], panel=('acumulador', [16.7, 16.7, 16.7, 60, 8, 16.7, 16.7])),
    P('El tope de 250 milisegundos es por si cambias de pestaña: sin él, al volver correría todo de golpe.',
      voz='El tope de doscientos cincuenta milisegundos es por si cambias de pestaña: sin él, al volver correría todo de golpe.',
      resalta=[('Math.min', 0.0)], panel=('acumulador', [])),
    P('Pero 30 casillas por segundo siguen siendo demasiadas. La serpiente se mueve un tick de cada ocho.',
      voz='Pero treinta casillas por segundo siguen siendo demasiadas. La serpiente se mueve un tic de cada ocho.',
      ed=('snake.js', SN9), panel=('ticks',), corre='quieta'),
    P('Ese signo da lo que sobra al dividir. Sobra cero una vez cada ocho ticks, y ahí se mueve; en los demás, se sale.',
      voz='Ese signo da lo que sobra al dividir. Sobra cero una vez cada ocho tics, y ahí se mueve; en los demás, se sale.',
      resalta=[('this.interval !== 0', 0.0)], panel=('ticks',), corre={'id': 'ocho', 'manual': [(0, 'game.body = [{ x: 3, y: 8 }, { x: 2, y: 8 }, { x: 1, y: 8 }];')],
                                                                   'lento': 3}),
    P('A velocidad normal, casi cuatro casillas por segundo. Eso ya se puede jugar.', cara='feliz',
      corre={'id': 'normal', 'manual': [(0, IZQ), (3.55, IZQ)]}),
    P('…y se sale, porque todavía no hay bordes. Ya llegarán.', cara='triste', corre='normal'),

    # ------------------------------------------------ 6 los controles
    P('Primero, los controles. Cuatro botones, y cada uno vale una potencia de dos: 1, 2, 4 y 8.',
      voz='Primero, los controles. Cuatro botones, y cada uno vale una potencia de dos: uno, dos, cuatro y ocho.',
      cap=5, ed=('input.js', IN1), panel=('bits', [(0.5, 1), (0.6, 2), (0.7, 4), (0.8, 8), (0.95, 0)])),
    P('Así caben todos en un solo número: arriba y derecha, a la vez, son 1 más 8. Nueve. Cada botón es un bit.',
      voz='Así caben todos en un solo número: arriba y derecha, a la vez, son uno más ocho. Nueve. Cada botón es un bit.',
      resalta=[('UP: 1', 0.0)], panel=('bits', [(0.38, 1), (0.6, 9)])),
    P('Esta tabla traduce las flechas del teclado.', ed=('input.js', IN2), panel=('bits', [])),
    P('Al bajar una tecla, su bit se prende con or. Al soltarla, se apaga.', ed=('input.js', IN3),
      panel=('bits', [(0.35, 8), (0.8, 0)])),
    P('Y poll entrega el número. En main.js se lo pasamos a update, una vez por tick.',
      voz='Y pol entrega el número. En main se lo pasamos a apdeit, una vez por tic.',
      ed=[('input.js', IN4), ('main.js', MAIN6)], panel=('bits', [])),
    P('En update: si está prendido el bit de arriba, la próxima dirección es hacia arriba.',
      voz='En apdeit: si está prendido el bit de arriba, la próxima dirección es hacia arriba.',
      ed=('snake.js', SN10), panel=('bits', [(0.3, 1)])),
    P('Y lo mismo con abajo, izquierda y derecha.', ed=('snake.js', SN11), panel=('bits', [(0.3, 2), (0.5, 4), (0.75, 8)])),
    P('¿Por qué la próxima? Porque la serpiente sólo se mueve cada ocho ticks: el giro espera en nextDir hasta entonces.',
      voz='¿Por qué la próxima? Porque la serpiente sólo se mueve cada ocho tics: el giro espera en next dir hasta entonces.',
      cara='pensando', ed=('snake.js', SN12), panel=('bits', [])),
    P('Y nada de reversa: si vas hacia abajo, arriba no cuenta. Te meterías en tu propio cuello.', cara='enojo',
      resalta=[('this.dir.y !== 1', 0.0)], panel=('bits', [])),
    P('A ver… arriba, izquierda, abajo, derecha. ¡Obedece! Es más de lo que puedo decir de mí los lunes.', cara='guino',
      panel=('bits',), corre={'id': 'giros', 'teclas': [(0.75, 'ArrowUp', 0.4), (1.55, 'ArrowLeft', 0.4), (2.5, 'ArrowDown', 0.4), (3.45, 'ArrowRight', 0.4),
                                                          (4.7, 'ArrowUp', 0.35), (5.3, 'ArrowLeft', 0.35), (6.4, 'ArrowDown', 0.35), (7.2, 'ArrowRight', 0.35),
                                                          (8.0, 'ArrowUp', 0.35), (8.9, 'ArrowLeft', 0.35), (9.9, 'ArrowDown', 0.35), (11.0, 'ArrowRight', 0.35),
                                                          (12.1, 'ArrowUp', 0.35), (13.1, 'ArrowLeft', 0.35), (14.1, 'ArrowDown', 0.35)]}),

    # ------------------------------------------------ 7 la comida
    P('Una serpiente sin comida es un protector de pantalla. Vamos por la fruta.', cap=6, cara='guino', ve='snake.js', corre='giros'),
    P('isFree dice si una casilla está libre: dentro del tablero y sin cuerpo encima.',
      voz='Is fri dice si una casilla está libre: dentro del tablero y sin cuerpo encima.',
      ed=('snake.js', SN13), panel=('libres', 'prueba')),
    P('spawnFood junta en una lista todas las libres…', voz='Spon fud junta en una lista todas las libres…', ed=('snake.js', SN14),
      panel=('libres',)),
    P('…y elige una al azar. Al empezar hay 269: las 272 del tablero, menos tres de serpiente.',
      voz='…y elige una al azar. Al empezar hay doscientas sesenta y nueve: las doscientas setenta y dos del tablero, menos tres de serpiente.',
      ed=('snake.js', SN15), panel=('libres', 'elige')),
    P('El constructor pide la primera, y render la pinta: un cuadro rojo, un píxel más chico por lado.',
      ed=('snake.js', SN16), corre={'id': 'fruta', 'desde': 0.8, 'quieto': True, 'semilla': 7, 'manual': [(0, 'game.render(r);')]}),
    P('Por ahora le pasa por encima y no ocurre nada. ¿Cómo se sabe si comió? Si la cabeza nueva cae en la casilla de la fruta.',
      ed=('snake.js', SN17), corre={'id': 'pasa', 'bot': True, 'semilla': 7}),
    P('Y para crecer hay que hacer… nada. Si comió, no se le quita la cola. Y ya.', cara='feliz', ed=('snake.js', SN18), corre='pasa'),
    P('Mira la lista: cuando come, entra una y no sale ninguna.', panel=('lista',), corre={'id': 'come', 'bot': True, 'semilla': 7}),
    P('Además suma puntos y acelera: cada cuatro frutas, un tick menos de espera, hasta llegar a tres.',
      voz='Además suma puntos y acelera: cada cuatro frutas, un tic menos de espera, hasta llegar a tres.',
      ed=('snake.js', SN19), panel=('lista',), corre='come'),
    P('Una fruta vale 10 al principio, y 35 a toda velocidad. Ir rápido es más difícil, así que paga más.',
      voz='Una fruta vale diez al principio, y treinta y cinco a toda velocidad. Ir rápido es más difícil, así que paga más.',
      resalta=[('this.score += 10', 0.0)], panel=('puntos',)),

    # ------------------------------------------------ 8 los choques
    P('Falta lo más importante: perder. Si la casilla nueva no está libre, se acabó.', cap=7, cara='enojo', ed=('snake.js', SN20)),
    P('Con eso ya hay bordes y cuerpo, porque isFree revisa las dos cosas.', voz='Con eso ya hay bordes y cuerpo, porque is fri revisa las dos cosas.',
      resalta=[('!this.isFree(head', 0.0), (('isFree(x, y) {', 'b.y === y)'), 0.5)], corre={'id': 'borde'}),
    P('Pero quedó un error escondido. Ésta mide cuatro y quiere dar vueltas en un cuadro de dos por dos…', cara='pensando',
      panel=('cuadro',), corre={'id': 'error', 'quieto': True, 'manual': [(0, CUADRO + ' game.render(r);')]}),
    P('Se murió. ¡Y no tocó a nadie!', cara='sorpresa', dur=3.2, panel=('cuadro', 'muere'),
      corre={'id': 'muere', 'manual': [(0, CUADRO)], 'teclas': VUELTAS}),
    P('La casilla de abajo tenía a su cola, así que isFree dijo que no. Pero la cola se va en ese mismo paso.',
      voz='La casilla de abajo tenía a su cola, así que is fri dijo que no. Pero la cola se va en ese mismo paso.',
      panel=('cuadro', 'cola'), resalta=[('!this.isFree(head', 0.0), ('body.pop()', 0.7)], corre='muere'),
    P('Se arregla con hitsTail: si cae en la cola, y no está comiendo, pasa.', voz='Se arregla con jits teil: si cae en la cola, y no está comiendo, pasa.',
      ed=('snake.js', SN21), panel=('cuadro', 'cola'), corre='muere'),
    P('¿Y por qué importa si come? Porque entonces la cola no se mueve, y ahí sí choca.', cara='pensando',
      resalta=[('hitsTail = !eating', 0.0)], panel=('cuadro', 'cola'), corre='muere'),
    P('Ahora sí. Una serpiente que se persigue la cola: ya casi es un perro.', cara='feliz', panel=('cuadro', 'vive'),
      corre={'id': 'vive', 'manual': [(0, CUADRO)], 'teclas': VUELTAS}),

    P('Y también se puede ganar: si ya no hay dónde poner la fruta, llenaste el tablero.', cara='feliz', ed=('snake.js', SN21B),
      panel=('cuadro', 'vive'), corre='vive'),

    # ------------------------------------------------ 9 el marcador
    P('Sólo falta el marcador. Daily Challenge no usa tipografías: cada letra es un dibujo de tres por cinco.', cap=8,
      ed=('renderer.js', REN5), panel=('letra', 'S')),
    P('Un 1 es un punto prendido. Ésta es la S.', voz='Un uno es un punto prendido. Ésta es la ese.', resalta=[("'S':", 0.0)], panel=('letra', 'S')),
    P('text recorre las letras y pinta un cuadrito de un píxel por cada punto. Luego avanza cuatro: tres de letra y uno de aire.',
      voz='Text recorre las letras y pinta un cuadrito de un píxel por cada punto. Luego avanza cuatro: tres de letra y uno de aire.',
      ed=('renderer.js', REN6), panel=('letra', 'SCORE')),
    P('Y en render: la barra gris, los puntos y cuántas frutas llevas.', ed=('snake.js', SN22),
      corre={'id': 'marcador', 'desde': 0.85, 'bot': True, 'semilla': 11}),

    # ------------------------------------------------ 10 a jugar
    P(f'Y es todo: {TOTAL} líneas en cinco archivos. Vamos a jugarlo.', cap=9, cara='feliz', vista='juego',
      corre={'id': 'partida', 'bot': True, 'semilla': 29}),
    P('Juego yo, que para eso soy una IA: busco el camino más corto a la fruta…', voz='Juego yo, que para eso soy una i a: busco el camino más corto a la fruta…',
      vista='juego', corre='partida'),
    P('…y antes de ir reviso que después pueda alcanzar mi cola. Si no, doy un rodeo.', cara='pensando', vista='juego', corre='partida'),
    P('Es la búsqueda por anchura, la del laberinto. Hay un vídeo de eso en este canal.', cara='guino', vista='juego', corre='partida'),
    P('Fíjate en la velocidad: cada cuatro frutas, un tick menos de espera.', voz='Fíjate en la velocidad: cada cuatro frutas, un tic menos de espera.',
      vista='juego', corre='partida'),
    P('Y cuanto más larga, menos lugar. Al final, Snake es un problema de estacionamiento.', cara='guino', vista='juego', corre='partida'),

    # ------------------------------------------------ el cierre
    P('A la izquierda, el nuestro. A la derecha, el de Daily Challenge: los mismos nombres y la misma lógica.', vista='dos',
      corre='partida', corre2={'id': 'real2', 'dc': dict(REAL, semilla=77, saltar=900)}),
    P('¿Qué le falta? Los mapas con muros, el bicho de premio, el hambre y el sonido.', cara='pensando', vista='dos',
      corre='partida', corre2='real2'),
    P('Y lo mejor: un servidor que no se cree tu puntaje, y vuelve a jugar tu partida para comprobarlo. Eso va en la parte 2.',
      voz='Y lo mejor: un servidor que no se cree tu puntaje, y vuelve a jugar tu partida para comprobarlo. Eso va en la parte dos.',
      cara='sorpresa', vista='dos', corre='partida', corre2='real2'),
    P('El código está en ayotl.dev/aprende, para copiarlo y jugarlo. Y el curso completo, con ejercicios, también es gratis.',
      voz='El código está en áyotl punto dev, diagonal aprende, para copiarlo y jugarlo. Y el curso completo, con ejercicios, también es gratis.',
      cara='feliz', vista='dos', corre='partida', corre2='real2'),
    P('¿Ya estás suscrito? Síguenos, y nos vemos en la parte 2.', voz='¿Ya estás suscrito? Síguenos, y nos vemos en la parte dos.',
      cara='guino', final=True),
]

# ---------------------------------------------------------------- el inglés, renglón por renglón: (lo que se lee, lo que se pronuncia)
EN = [
    ("Hi! I'm LeIA. Today we're going to code Snake, the one from Daily Challenge, from a blank page.",
     "Hi! I'm Leia. Today we're going to code Snake, the one from Daily Challenge, from a blank page."),
    (f"No engine and no libraries: JavaScript, a canvas and {TOTAL} lines, counting the page's own.", None),
    ("This is part 1: by the end, the snake moves, eats, grows and crashes. In part 2 we add maps, sound and a server.",
     "This is part one: by the end, the snake moves, eats, grows and crashes. In part two we add maps, sound and a server."),
    ("If you know what a variable and an if are, you'll make it to the end.", None),
    ("It's five short files. The first one, index.html: a canvas and our program.",
     "It's five short files. The first one, index dot H T M L: a canvas and our program."),
    ("The game is 160 by 192 pixels, the Atari 2600's proportions. The style makes it three times bigger.",
     "The game is one sixty by one ninety-two pixels, the Atari twenty-six hundred's proportions. The style makes it three times bigger."),
    ("And pixelated is the magic word: without it, the browser smooths things out as it scales up, and it's all a blur.", None),
    ("And type module lets us split the program into files. Just one thing: open it with a local server, not a double click.", None),
    ("renderer.js is the brush. It gives the canvas its size and asks for the 2D context, which is what you paint with.",
     "Renderer is the brush. It gives the canvas its size and asks for the 2D context, which is what you paint with."),
    ("It can only do one thing: rectangles. A corner, a width, a height and a color.", None),
    ("Clearing is a rectangle too: one the size of the whole screen.", None),
    ("And a short palette, with Daily Challenge's colors, so we don't have to write them out every time.", None),
    ("Let's try it. In main.js: a black background and a green rectangle, 30 by 10.",
     "Let's try it. In main: a black background and a green rectangle, thirty by ten."),
    ("There it is! Thirty pixels of snake. It doesn't move, but it doesn't complain either.", None),
    ("Now the game, snake.js. Snake doesn't think in pixels: it thinks in cells, 10 by 10.",
     "Now the game, in snake dot J S. Snake doesn't think in pixels: it thinks in cells, ten by ten."),
    ("16 columns times 10 is 160: exactly the width. And 17 rows times 10 is 170.", None),
    ("At the top, 16 pixels for the score bar: the HUD. That's 186 out of 192. Six to spare.",
     "At the top, sixteen pixels for the score bar: the hud. That's 186 out of 192. Six to spare."),
    ("From cell to pixel: the column times 10, and the row times 10, plus the HUD. Cell 7, 8 lands on pixel 70, 96.",
     "From cell to pixel: the column times ten, and the row times ten, plus the hud. Cell seven, eight, lands on pixel seventy, ninety-six."),
    ("And the snake? It's not a picture. It's a list of cells.", None),
    ("The first one is the head. It starts with three, in the center, one behind the other.", None),
    ("It also remembers where it's going: x 1, y 0. That is, one step to the right.",
     "It also remembers where it's going: x one, y zero. That is, one step to the right."),
    ("render paints it: it goes through the list and makes one rectangle per cell.", None),
    ("Cell zero, the head, in light green. The rest, in green.", None),
    ("In main.js we swap the rectangle for the game. Now that's a real snake.",
     "In main, we swap the rectangle for the game. Now that's a real snake."),
    ("Let's make it move. To take one step, do we have to move all three cells?", None),
    ("No. We work out where the head is going to be: its cell plus the direction.", None),
    ("That cell goes in at the front of the list, with unshift.", None),
    ("And the last one comes off, with pop. The ones in the middle don't even notice.", None),
    ("Watch it in slow motion: one goes in at the front and one comes off the back.", None),
    ("It looks like it slithers, and only two cells changed. It's the same if it's 3 long or 200.", None),
    ("And who calls update? The browser tells you before painting each frame, with requestAnimationFrame.",
     "And who calls update? The browser tells you before painting each frame, with request animation frame."),
    ("Let's move it on every frame and see what happens…", None),
    ("It's gone! Sixty cells per second. And on a 120-hertz screen, a hundred and twenty.", None),
    ("The game needs its own clock: 30 ticks a second, always, on any screen.", None),
    ("acc, the accumulator, collects the time that goes by. While a whole tick fits, we run one and subtract it.",
     "The accumulator collects the time that goes by. While a whole tick fits, we run one and subtract it."),
    ("If a frame comes late, two ticks run in a row; if it comes early, none. In the long run, always 30.", None),
    ("The 250-millisecond cap is for when you switch tabs: without it, coming back would run everything at once.", None),
    ("But 30 cells a second is still too many. The snake moves one tick out of every eight.", None),
    ("That sign gives you what's left over when you divide. It's zero once every eight ticks: that's when it moves. The rest, it leaves.", None),
    ("At normal speed, almost four cells a second. Now that you can play.", None),
    ("…and off it goes, because there are no edges yet. They're coming.", None),
    ("First, the controls. Four buttons, and each one is worth a power of two: 1, 2, 4 and 8.", None),
    ("That way they all fit in a single number: up and right, together, are 1 plus 8. Nine. Each button is a bit.", None),
    ("This table translates the keyboard's arrows.", None),
    ("When a key goes down, its bit is turned on with or. When it comes up, it's turned off.", None),
    ("And poll hands over the number. In main.js we pass it to update, once per tick.",
     "And poll hands over the number. In main, we pass it to update, once per tick."),
    ("In update: if the up bit is on, the next direction is up.", None),
    ("And the same with down, left and right.", None),
    ("Why the next one? Because the snake only moves every eight ticks: the turn waits in nextDir until then.",
     "Why the next one? Because the snake only moves every eight ticks: the turn waits in next dir until then."),
    ("And no reversing: if you're going down, up doesn't count. You'd run into your own neck.", None),
    ("Let's see… up, left, down, right. It obeys! That's more than I can say for myself on Mondays.", None),
    ("A snake with no food is a screensaver. Let's get the fruit.", None),
    ("isFree tells you if a cell is free: inside the board and with no body on it.",
     "Is free tells you if a cell is free: inside the board and with no body on it."),
    ("spawnFood gathers all the free ones in a list…", "Spawn food gathers all the free ones in a list…"),
    ("…and picks one at random. At the start there are 269: the board's 272, minus three of snake.", None),
    ("The constructor asks for the first one, and render paints it: a red square, one pixel smaller on each side.", None),
    ("For now it goes right over it and nothing happens. How do we know it ate? If the new head lands on the fruit's cell.", None),
    ("And to grow you have to do… nothing. If it ate, don't take the tail off. That's it.", None),
    ("Watch the list: when it eats, one goes in and none comes off.", None),
    ("It also scores points and speeds up: every four fruits, one tick less to wait, down to three.", None),
    ("A fruit is worth 10 at the start, and 35 at full speed. Going fast is harder, so it pays more.", None),
    ("The most important part is missing: losing. If the new cell isn't free, it's over.", None),
    ("That gives us the edges and the body, because isFree checks both.", "That gives us the edges and the body, because is free checks both."),
    ("But there's a hidden bug. This one is four long and wants to go around a two-by-two square…", None),
    ("It died. And it didn't touch anyone!", None),
    ("The cell below had its tail, so isFree said no. But the tail leaves on that very step.",
     "The cell below had its tail, so is free said no. But the tail leaves on that very step."),
    ("hitsTail fixes it: if it lands on the tail, and it isn't eating, it goes through.",
     "Hits tail fixes it: if it lands on the tail, and it isn't eating, it goes through."),
    ("And why does eating matter? Because then the tail doesn't move, and that is a crash.", None),
    ("Now we're talking. A snake chasing its own tail: it's almost a dog.", None),
    ("And you can win, too: if there's nowhere left to put the fruit, you filled the board.", None),
    ("Only the score bar is missing. Daily Challenge doesn't use a typeface: each letter is a drawing, three by five.", None),
    ("A 1 is a lit dot. This is the S.", "A one is a lit dot. This is the S."),
    ("text goes through the letters and paints a one-pixel square for each dot. Then it moves four along: three for the letter and one of air.", None),
    ("And in render: the gray bar, the points and how many fruits you've had.", None),
    (f"And that's all: {TOTAL} lines in five files. Let's play it.", None),
    ("I'll play, being an AI and all: I look for the shortest path to the fruit…", None),
    ("…and before I go, I check that I'll still be able to reach my tail. If not, I take a detour.", None),
    ("It's breadth-first search, the one from the maze. There's a video about that on this channel.", None),
    ("Look at the speed: every four fruits, one tick less to wait.", None),
    ("And the longer it is, the less room. In the end, Snake is a parking problem.", None),
    ("On the left, ours. On the right, Daily Challenge's: the same names and the same logic.", None),
    ("What's missing? The maps with walls, the bonus bug, the hunger and the sound.", None),
    ("And the best part: a server that doesn't believe your score, and replays your game to check it. That's for part 2.",
     "And the best part: a server that doesn't believe your score, and replays your game to check it. That's for part two."),
    ("The code is at ayotl.dev/en/learn, to copy and to play. And the full course, with exercises, is free too.",
     "The code is at Ah-yotl dot dev, slash E N, slash learn, to copy and to play. And the full course, with exercises, is free too."),
    ("Are you subscribed yet? Follow us, and see you in part 2.", "Are you subscribed yet? Follow us, and see you in part two."),
]
assert len(EN) == len(GUION), (len(EN), len(GUION))
for p, (dice, voz) in zip(GUION, EN):
    p['dice'], p['voz'] = {'es': p['dice'], 'en': dice}, {'es': p['voz'], 'en': voz or dice}
