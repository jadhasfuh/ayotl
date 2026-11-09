"""El fondo de un Short de «Algoritmos en pixel» (9-nov-2026): 1080x1920, el código arriba y la animación abajo.

Adrián pidió el piloto de una serie nueva: un Short vertical que explica un algoritmo con su código y una
animación, narrado por LeIA. Arriba va el código en JavaScript (el mismo de la lección de ayotl.dev/aprende) con
la línea que se ejecuta resaltada; abajo, barras pixel que se comparan (dos en color) y se intercambian, con un
contador de comparaciones y otro de intercambios. Estética de Daily Challenge: fondo negro, Press Start 2P para
todo, la paleta Atari del motor (core/palette.js) y los blips de su chip (core/audio.js).

Aquí no se narra nada: lo arma armar.py. La entrada es la línea de tiempo (escenas con su duración, que es la de
la voz de cada renglón del guion, y lo que se ve en cada una); la salida, el vídeo mudo (fondo.mp4) y su sonido
aparte (fondo.wav: los blips y una chiptune suave), que comercial.py usa como `musica` y baja cuando habla LeIA.

Los pasos que entiende (los da pasos() del archivo de cada algoritmo), con `lineas` (las del código que corren en
ese paso, desde 1), `vars` (las variables que se ven, p. ej. {'i': 2}) y los índices de las barras:
- compara {j, k}: las dos barras en amarillo, con las flechas j y j+1 debajo; suma una comparación;
- cambia {j, k}: las dos en rojo y se cambian de lugar (la que va a la derecha da un brinco); suma un intercambio;
- fija {k}: esa barra ya quedó en su lugar (verde);
- marca {k, rol}: una barra señalada (el mínimo, el pivote…) con su rótulo encima, hasta el paso siguiente;
- pasada / linea: sólo mueven el resaltado del código y las variables;
- fin: todas en su lugar, con un barrido de notas y la fanfarria de ganar de DC.
Un algoritmo que necesite otra cosa (dos arreglos, un árbol) agrega aquí su tipo de paso o su vista.
"""
import colorsys, math, os, re, subprocess, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg

W, H, FPS, SR = 1080, 1920, 30, 48000
FF = imageio_ffmpeg.get_ffmpeg_exe()
PIXEL = os.path.expanduser('~/Documents/daily challenge/src/fonts/PressStart2P-Regular.ttf')


# ---------------------------------------------------------------- la paleta de Daily Challenge
def atari(tono, lum):
    """atari(hue, lum) de core/palette.js: 16 tonos x 8 luminancias, en (r, g, b)."""
    tono &= 15; lum &= 7
    if tono == 0:
        v = round(lum * 34)
        return (v, v, v)
    h = (55 - (tono - 1) * 24 + 720) % 360
    r, g, b = colorsys.hls_to_rgb(h / 360, (14 + lum * 10) / 100, (90 - lum * 5) / 100)
    return (round(r * 255), round(g * 255), round(b * 255))


PAL = {k: atari(*v) for k, v in {
    'black': (0, 0), 'dgray': (0, 2), 'gray': (0, 4), 'lgray': (0, 6), 'white': (0, 7), 'yellow': (1, 6),
    'orange': (2, 5), 'red': (4, 4), 'dred': (4, 2), 'pink': (5, 6), 'purple': (7, 4), 'blue': (9, 4),
    'lblue': (10, 6), 'cyan': (11, 6), 'green': (13, 4), 'lgreen': (13, 6), 'dgreen': (13, 2)}.items()}
NEGRO = (0, 0, 0)
BLANCO = (255, 255, 255)
# cada tipo de paso con su color: el de las barras, el de su línea de código y el de su contador
TONO = {'compara': 1, 'cambia': 4, 'fija': 13, 'fin': 13, 'marca': 7, 'pasada': 11, 'linea': 11}
VIVO = {'compara': PAL['yellow'], 'cambia': PAL['red'], 'fija': PAL['lgreen'], 'fin': PAL['lgreen'],
        'marca': PAL['purple'], 'pasada': PAL['cyan'], 'linea': PAL['cyan']}
SINTAXIS = {'kw': PAL['pink'], 'func': PAL['cyan'], 'type': PAL['cyan'], 'builtin': PAL['orange'],
            'number': PAL['lgreen'], 'string': PAL['lblue'], 'comment': PAL['gray'], 'punct': PAL['lgray'],
            'ident': PAL['white'], 'ws': PAL['white']}
ROTULOS = {'es': {'serie': 'ALGORITMOS EN PIXEL', 'compara': 'COMPARACIONES', 'cambia': 'INTERCAMBIOS',
                  'numeros': 'NÚMEROS', 'cuadrado': 'EL TRABAJO CRECE AL CUADRADO',
                  'leccion': 'LA LECCIÓN, CON ESTE MISMO CÓDIGO:', 'gratis': 'GRATIS · SIN CUENTA'}}


def mezcla(a, b, x):
    return tuple(round(a[i] + (b[i] - a[i]) * x) for i in range(3))


# ---------------------------------------------------------------- texto pixel
_F8 = ImageFont.truetype(PIXEL, 8)
ACENTOS = {'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U'}
_mascaras = {}


def mascara(s, k):
    """`s` en Press Start 2P a 8k px, sin suavizar: cada píxel de la fuente es un cuadro de k x k. Lleva tres
    renglones de aire arriba para el acento de las mayúsculas: la fuente encoge Á É Í Ó Ú para que quepan en sus
    8 px («LECCIÓN» se leía «LECCIóN»), así que va la mayúscula entera y el acento encima, como pintar() de
    comercial.py."""
    if (s, k) not in _mascaras:
        im = Image.new('L', (8 * len(s), 11), 0)
        d = ImageDraw.Draw(im); d.fontmode = '1'
        d.text((0, 3), ''.join(ACENTOS.get(c, c) for c in s), font=_F8, fill=255)
        for i, c in enumerate(s):
            if c in ACENTOS:
                im.putpixel((8 * i + 4, 0), 255); im.putpixel((8 * i + 3, 1), 255)
        _mascaras[(s, k)] = im.resize((im.width * k, im.height * k), Image.NEAREST)
    return _mascaras[(s, k)]


def texto(im, x, y, s, color, k=3, ancla='l'):
    """Escribe `s` con lo alto de sus letras en `y`; `x` es su izquierda, su centro ('m') o su derecha ('r')."""
    if not s:
        return
    m = mascara(s, k)
    x0 = x - {'l': 0, 'm': m.width // 2, 'r': m.width}[ancla]
    im.paste(color, (round(x0), round(y) - 3 * k), m)


# ---------------------------------------------------------------- el código, con los colores de la lección
KW = set(('break case catch class const continue default delete do else export extends false finally for function '
          'if import in instanceof let new null of return static super switch this throw true try typeof '
          'undefined var void while yield async await').split())
BUILTIN = set(('console Math JSON Array Object Map Set WeakMap String Number Boolean Infinity NaN Date Symbol '
               'Promise Error parseInt parseFloat structuredClone').split())
REGLAS = [(r'//.*', 'comment'), (r'"(?:\\.|[^"\\])*"?', 'string'), (r"'(?:\\.|[^'\\])*'?", 'string'),
          (r'`(?:\\.|[^`\\])*`?', 'string'), (r'(?:0x[\da-fA-F]+|\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?n?)', 'number'),
          (r'[A-Za-z_$][\w$]*', 'ident'), (r'[ \t]+', 'ws'), (r'[^\sA-Za-z_$\d]', 'punct')]
REGLAS = [(re.compile(r), c) for r, c in REGLAS]


def resaltar(linea):
    """Un renglón en tramos (texto, clase): el mismo tokenizador que src/lib/aprende/resaltar.ts."""
    tramos, resto = [], linea
    while resto:
        for rx, clase in REGLAS:
            m = rx.match(resto)
            if not m or not m.group(0):
                continue
            t, c = m.group(0), clase
            if c == 'ident':
                c = ('kw' if t in KW else 'builtin' if t in BUILTIN else 'type' if t[0].isupper()
                     else 'func' if re.match(r'\s*\(', resto[len(t):]) else 'ident')
            tramos.append((t, c)); resto = resto[len(t):]
            break
    return tramos


# ---------------------------------------------------------------- el chip de sonido (core/audio.js, en numpy)
def nota(buf, t, f, dur, onda='square', vol=0.15, hasta=None):
    """Chip.note(): una nota con ataque de 5 ms, que se sostiene hasta el 60 % y se apaga en exponencial;
    `hasta` desliza la frecuencia (exponencialRampToValueAtTime)."""
    i0 = int(t * SR); n = int(dur * SR)
    if i0 < 0 or n <= 0 or i0 >= len(buf):
        return
    n = min(n, len(buf) - i0); tt = np.arange(n) / SR
    fr = f * (hasta / f) ** (tt / dur) if hasta else np.full(n, float(f))
    fase = 2 * np.pi * np.cumsum(fr) / SR
    w = np.sign(np.sin(fase)) if onda == 'square' else 2 / np.pi * np.arcsin(np.sin(fase))
    sube = 0.0001 * (vol / 0.0001) ** (np.minimum(tt, 0.005) / 0.005)
    baja = vol * (0.0001 / vol) ** (np.maximum(tt - dur * 0.6, 0) / (dur * 0.4))
    env = np.where(tt < 0.005, sube, np.where(tt < dur * 0.6, vol, baja))
    buf[i0:i0 + n] += (w * env).astype(np.float32)


_ruido = np.random.default_rng(7).uniform(-1, 1, SR).astype(np.float32)


def ruido(buf, t, dur, vol=0.2, pasa_altos=1000):
    """Chip.noise(): ruido blanco con un filtro pasa-altos y caída exponencial."""
    i0 = int(t * SR); n = min(int(dur * SR), len(buf) - i0)
    if i0 < 0 or n <= 0:
        return
    x = _ruido[:n].copy()
    a = 1 / (1 + 2 * np.pi * pasa_altos / SR)   # pasa-altos de un polo
    y = np.empty_like(x); prev_x = prev_y = 0.0
    for i in range(n):
        prev_y = a * (prev_y + x[i] - prev_x); prev_x = x[i]; y[i] = prev_y
    buf[i0:i0 + n] += y * vol * (0.0001 / vol) ** (np.arange(n) / SR / dur)


DO_MAYOR = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19]


def tono_de(v, minimo=1):
    """La nota de un valor: la escala de do mayor desde do5, como las cerezas de Mr. Do! en DC."""
    m = 72 + DO_MAYOR[max(0, min(len(DO_MAYOR) - 1, v - minimo))]
    return 440 * 2 ** ((m - 69) / 12)


def chiptune(dur, bpm=112):
    """Una base suave y propia, hecha por receta como las procedurales de DC (core/music.js): bajo en triángulo
    con el patrón x...x.x., arpegio en triángulo una octava arriba y un charles apenas; do–sol–lam–fa."""
    buf = np.zeros(int(dur * SR) + SR, dtype=np.float32)
    paso = 60 / bpm / 2
    acordes = [(48, (60, 64, 67)), (43, (59, 62, 67)), (45, (57, 60, 64)), (41, (57, 60, 65))]
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    for s in range(int(dur / paso) + 1):
        t = s * paso; bajo, tonos = acordes[(s // 8) % 4]; p = s % 8
        if 'x...x.x.'[p] == 'x':
            nota(buf, t, hz(bajo), paso * 1.6, 'triangle', 0.30)
        nota(buf, t, hz(tonos[[0, 1, 2, 1][p % 4]] + 12), paso * 0.9, 'triangle', 0.07)
        if p % 2:
            ruido(buf, t, 0.03, 0.025, 6000)
    return buf[:int(dur * SR)]


# ---------------------------------------------------------------- dónde va cada cosa (1080x1920)
K_CODIGO, LINEA_H = 3, 36          # el código a 24 px: el tamaño de los Shorts de ttcode
PANEL_X0, PANEL_X1, PANEL_Y0 = 40, 1040, 168
CABECERA = 44
CODIGO_X = 100                     # a la izquierda, el ▶ de la línea que corre
BASE_Y = 1150                      # el piso de las barras
ESC_X0, ESC_X1 = 80, 1000          # de dónde a dónde van las barras
TECHO = 822                        # lo más alto que llega una barra (abajo de los contadores)
# El cuadro de diálogo de LeIA (comercial.py, escenas `completo`) va de 1270 a 1590, con la placa del nombre
# desde 1244: nada importante abajo de 1230. Lo de abajo de 1590 lo tapan el título y los botones de YouTube.


class Fondo:
    """El vídeo de fondo de un algoritmo. `escenas`: [{t0, dur, vista, eventos (con t0 y dur), resalta, filas,
    complejidad}], en segundos del vídeo; `cola`: los segundos de sonido que siguen al vídeo (la tarjeta final)."""

    def __init__(self, alg, lang, escenas, cola=0.0):
        self.alg, self.lang, self.escenas = alg, lang, escenas
        self.r = ROTULOS[lang]
        self.valores = list(alg.ARREGLO); self.n = len(self.valores)
        self.lineas = alg.CODIGO.split('\n')
        largo = max(map(len, self.lineas))
        if CODIGO_X + 8 * K_CODIGO * largo > PANEL_X1 - 20:
            raise SystemExit(f'una línea del código mide {largo} caracteres: a 24 px caben {(PANEL_X1 - 20 - CODIGO_X) // 24}')
        self.codigo_y = PANEL_Y0 + CABECERA + 16
        self.panel_y1 = self.codigo_y + len(self.lineas) * LINEA_H + 14
        self.cont_y = self.panel_y1 + 18
        self.techo = max(TECHO, self.cont_y + 96)
        self.unidad = min(40, (BASE_Y - self.techo) // max(self.valores))
        self.slot = (ESC_X1 - ESC_X0) / self.n
        self.ancho_barra = int(self.slot * 0.76 / 4) * 4
        self.duracion = escenas[-1]['t0'] + escenas[-1]['dur']
        self.cola = cola
        self.eventos = [e for s in escenas for e in s['eventos']]
        self.base = self.pintar_base()
        self.capa_codigo, self.alfa_codigo = self.pintar_codigo()
        # cuándo aparece por primera vez cada fila de la tabla y la O grande (se quedan en las escenas siguientes)
        self.filas_t, self.complejidad_t = {}, None
        for s in escenas:
            for fila, f in s.get('filas', []):
                self.filas_t.setdefault(fila, s['t0'] + f * s['dur'])
            if s.get('complejidad') is not None and self.complejidad_t is None:
                self.complejidad_t = s['t0'] + s['complejidad'] * s['dur']

    # -------------------------------------------------- lo que no cambia
    def pintar_base(self):
        im = Image.new('RGB', (W, H), NEGRO); d = ImageDraw.Draw(im)
        texto(im, W // 2, 84, self.r['serie'], PAL['cyan'], 3, 'm')
        texto(im, W // 2, 118, self.alg.TITULO[self.lang], PAL['white'], 4, 'm')
        # la ventana del editor: azul marino de Atari, con su barra de título
        x0, y0, x1, y1 = PANEL_X0, PANEL_Y0, PANEL_X1, self.panel_y1
        d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=atari(9, 3))
        d.rectangle([x0 + 4, y0 + 4, x1 - 5, y1 - 5], fill=atari(9, 0))
        d.rectangle([x0 + 4, y0 + 4, x1 - 5, y0 + CABECERA - 1], fill=atari(9, 1))
        texto(im, x0 + 24, y0 + 14, self.alg.ARCHIVO, PAL['lgray'], 3)
        for i, c in enumerate(('red', 'yellow', 'lgreen')):
            cx = x1 - 96 + 28 * i
            d.rectangle([cx, y0 + 16, cx + 15, y0 + 31], fill=PAL[c])
        # los rótulos de los contadores
        for clave, cx in self.columnas():
            texto(im, cx, self.cont_y, self.rotulo(clave), PAL['gray'], 3, 'm')
        # el piso de las barras
        d.rectangle([ESC_X0 - 16, BASE_Y, ESC_X1 + 15, BASE_Y + 3], fill=PAL['dgray'])
        return im

    def rotulo(self, clave):
        return self.alg.VARIABLE[0][self.lang] if clave == 'var' else self.r[clave]

    def columnas(self):
        return [('var', 190), ('compara', 530), ('cambia', 870)]

    def pintar_codigo(self):
        """El código con sus colores, en una capa aparte: el resaltado de la línea va debajo."""
        capa = Image.new('RGB', (W, H), NEGRO); alfa = Image.new('L', (W, H), 0)
        for n, linea in enumerate(self.lineas):
            x, y = CODIGO_X, self.codigo_y + n * LINEA_H + 6
            for t, c in resaltar(linea):
                if c != 'ws':
                    m = mascara(t, K_CODIGO)
                    capa.paste(SINTAXIS[c], (x, y - 3 * K_CODIGO), m); alfa.paste(255, (x, y - 3 * K_CODIGO), m)
                x += 8 * K_CODIGO * len(t)
        return capa, alfa

    # -------------------------------------------------- el estado en el segundo t
    def escena_en(self, t):
        for s in self.escenas:
            if t < s['t0'] + s['dur']:
                return s
        return self.escenas[-1]

    def cuadros(self):
        """Los cuadros en orden; el estado de las barras avanza con los pasos que ya empezaron."""
        a = list(range(self.n))          # a[pos] = qué barra está en esa casilla
        fijas, destellos, vars_ = set(), {}, {}
        cuenta = {'compara': 0, 'cambia': 0}; ultimo_mas = {'compara': -9, 'cambia': -9}
        pendientes = list(self.eventos); actual = None
        for f in range(int(round(self.duracion * FPS))):
            t = f / FPS
            while pendientes and pendientes[0]['t0'] <= t + 1e-6:
                e = pendientes.pop(0); actual = e
                vars_.update(e.get('vars', {}))
                if e['tipo'] in cuenta:
                    cuenta[e['tipo']] += 1; ultimo_mas[e['tipo']] = e['t0']
                if e['tipo'] == 'cambia':
                    a[e['j']], a[e['k']] = a[e['k']], a[e['j']]
                elif e['tipo'] == 'fija':
                    fijas.add(e['k']); destellos[e['k']] = e['t0']
            yield self.cuadro(t, self.escena_en(t), actual, a, fijas, destellos, vars_, cuenta, ultimo_mas)

    # -------------------------------------------------- un cuadro
    def cuadro(self, t, esc, e, a, fijas, destellos, vars_, cuenta, ultimo_mas):
        im = self.base.copy(); d = ImageDraw.Draw(im)
        vista = esc['vista']; f = (t - esc['t0']) / esc['dur']
        # 1. el resaltado del código: el del paso que corre o el que pide la escena
        lineas, tipo = [], None
        if vista == 'codigo':
            for ls, desde, tp in esc.get('resalta', []):
                if f >= desde:
                    lineas, tipo = ls, tp
        elif e is not None and vista == 'pasos':
            tipo, ls = e['tipo'], e.get('lineas', [])
            if len(ls) > 1 and e['dur'] >= 0.6:   # despacio: una línea tras otra (t = a[j]; a[j] = …; a[j + 1] = t)
                i = min(len(ls) - 1, int((t - e['t0']) / (e['dur'] * 0.8 / len(ls))))
                lineas = [ls[i]]
            else:
                lineas = ls
        for n in lineas:
            y = self.codigo_y + (n - 1) * LINEA_H
            d.rectangle([PANEL_X0 + 4, y, PANEL_X1 - 5, y + LINEA_H - 1], fill=atari(TONO[tipo], 1))
            d.rectangle([PANEL_X0 + 4, y, PANEL_X0 + 9, y + LINEA_H - 1], fill=VIVO[tipo])
            texto(im, 62, y + 6, '▶', BLANCO, 3)
        im.paste(self.capa_codigo, (0, 0), self.alfa_codigo)
        # 2. los contadores
        for clave, cx in self.columnas():
            if clave == 'var':
                v = vars_.get(self.alg.VARIABLE[1]); s = f'{self.alg.VARIABLE[1]} = {v if v is not None else "-"}'
                color = PAL['cyan']
            else:
                s = str(cuenta[clave]); color = VIVO[clave]
                if t - ultimo_mas[clave] < 0.16 or (vista == 'cuenta' and clave == 'compara' and esc is self.escenas_cuenta()[0]
                                                   and int(t * 4) % 2 == 0):
                    color = BLANCO
            texto(im, cx, self.cont_y + 34, s, color, 5, 'm')
        # 3. las barras, o lo que las tapa
        if vista in ('cuenta', 'enlace'):
            self.barras(im, d, t, None, a, fijas, destellos, apagadas=True)
            entra = min(1, (t - self.primera(vista)['t0']) / 0.22)
            (self.cuenta if vista == 'cuenta' else self.enlace)(im, d, t, entra)
        else:
            self.barras(im, d, t, e if vista == 'pasos' else None, a, fijas, destellos,
                        cae=esc if vista == 'inicio' else None)
        return im

    def escenas_cuenta(self):
        return [s for s in self.escenas if s['vista'] == 'cuenta'] or [None]

    def primera(self, vista):
        return next(s for s in self.escenas if s['vista'] == vista)

    def cx(self, pos):
        return ESC_X0 + self.slot * (pos + 0.5)

    def barras(self, im, d, t, e, a, fijas, destellos, cae=None, apagadas=False):
        tipo = e['tipo'] if e else None
        jk = (e['j'], e['k']) if e and tipo in ('compara', 'cambia') else ()
        anim = 0
        if tipo == 'cambia':
            anim = min(1, (t - e['t0']) / max(0.08, min(0.42, e['dur'] * 0.7)))
            anim = anim * anim * (3 - 2 * anim)   # suave al salir y al llegar
        fin = e if tipo == 'fin' else None
        for pos in range(self.n):
            v = self.valores[a[pos]]; x = self.cx(pos); brinco = 0
            if pos in jk and tipo == 'cambia' and anim < 1:   # vienen de la casilla de la otra
                otra = jk[1] if pos == jk[0] else jk[0]
                x = self.cx(otra) + (self.cx(pos) - self.cx(otra)) * anim
                if pos == jk[1]:   # la que va a la derecha (la mayor) brinca por encima de la otra
                    brinco = min(28, BASE_Y - v * self.unidad - self.techo) * math.sin(math.pi * anim)
            color = PAL['lblue']
            if pos in fijas:
                color = PAL['lgreen']
            if pos in jk:
                color = VIVO[tipo]
            if e and tipo == 'marca' and pos == e['k']:
                color = VIVO['marca']
            if pos in destellos and 0 <= t - destellos[pos] < 0.14:
                color = BLANCO
            if fin is not None:   # el barrido final, de izquierda a derecha
                dt = t - fin['t0'] - pos * 0.07
                if 0 <= dt < 0.12:
                    color = BLANCO
            dy = 0
            if cae is not None:   # las barras caen una por una al empezar
                dt = t - cae['t0'] - 0.15 - pos * 0.09
                if dt < 0:
                    continue
                dy = -int(360 * max(0, 1 - dt / 0.22) ** 2)
            if apagadas:
                color = mezcla(color, NEGRO, 0.75)
            self.barra(im, d, x, v, color, brinco - dy)
            # las flechas de j y j+1, quietas en sus casillas
            if pos in jk:
                nombre = 'j' if pos == jk[0] else 'j+1'
                texto(im, self.cx(pos), BASE_Y + 14, '▲', VIVO[tipo], 3, 'm')
                texto(im, self.cx(pos), BASE_Y + 44, nombre, VIVO[tipo], 3, 'm')
            if e and tipo == 'marca' and pos == e['k']:
                texto(im, x, BASE_Y - v * self.unidad - 40, e.get('rol', ''), VIVO['marca'], 3, 'm')

    def barra(self, im, d, cx, v, color, alza=0):
        """Una barra con bisel de pixel art: luz arriba y a la izquierda, sombra a la derecha; su valor adentro."""
        bw = self.ancho_barra; x0 = round(cx - bw / 2); x1 = x0 + bw
        y1 = round(BASE_Y - alza); y0 = y1 - v * self.unidad; p = 6
        d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=color)
        d.rectangle([x0, y0, x1 - 1, y0 + 3], fill=mezcla(color, BLANCO, 0.5))
        d.rectangle([x0, y0, x0 + p - 1, y1 - 1], fill=mezcla(color, BLANCO, 0.35))
        d.rectangle([x1 - p, y0 + 4, x1 - 1, y1 - 1], fill=mezcla(color, NEGRO, 0.35))
        k = 4 if v * self.unidad >= 40 else 3
        texto(im, round(cx), y1 - 4 - 8 * k, str(v), mezcla(color, NEGRO, 0.85), k, 'm')

    # -------------------------------------------------- por qué es lento, y la lección
    def ventana(self, d, entra):
        """La ventana que tapa las barras: entra de arriba abajo en 0.22 s."""
        x0, y0, x1, y1 = ESC_X0 - 20, self.techo - 4, ESC_X1 + 20, BASE_Y + 76
        y1 = y0 + round((y1 - y0) * entra)
        if y1 - y0 > 8:
            d.rectangle([x0, y0, x1, y1], fill=PAL['dgray'])
            d.rectangle([x0 + 4, y0 + 4, x1 - 4, y1 - 4], fill=NEGRO)
        return x0, y0, x1, y1

    def cuenta(self, im, d, t, entra):
        x0, y0, x1, y1 = self.ventana(d, entra)
        if entra < 1:
            return
        texto(im, 400, y0 + 30, self.r['numeros'], PAL['gray'], 3, 'r')
        texto(im, x1 - 40, y0 + 30, self.r['compara'], PAL['gray'], 3, 'r')
        miles = lambda x: f'{x:,}'.replace(',', ' ')
        for i, n in enumerate(self.alg.FILAS):
            if i in self.filas_t and t >= self.filas_t[i]:
                y = y0 + 78 + 62 * i
                texto(im, 400, y, miles(n), PAL['white'], 5, 'r')
                texto(im, x1 - 40, y, miles(self.alg.comparaciones(n)), PAL['yellow'], 5, 'r')
        if self.complejidad_t is not None and t >= self.complejidad_t:
            texto(im, W // 2, y0 + 280, self.alg.COMPLEJIDAD, PAL['red'], 7, 'm')
            texto(im, W // 2, y0 + 350, self.r['cuadrado'], PAL['lgray'], 3, 'm')

    def enlace(self, im, d, t, entra):
        x0, y0, x1, y1 = self.ventana(d, entra)
        if entra < 1:
            return
        texto(im, W // 2, y0 + 60, self.r['leccion'], PAL['lgray'], 3, 'm')
        url = 'ayotl.dev/aprende'; w = 8 * 5 * len(url)
        d.rectangle([W // 2 - w // 2 - 36, y0 + 118, W // 2 + w // 2 + 35, y0 + 222], fill=PAL['cyan'])
        texto(im, W // 2, y0 + 150, url, NEGRO, 5, 'm')
        texto(im, W // 2, y0 + 262, f'/aprende/algoritmos/{self.alg.CLAVE}', PAL['cyan'], 3, 'm')
        texto(im, W // 2, y0 + 318, self.r['gratis'], PAL['gray'], 3, 'm')

    # -------------------------------------------------- el sonido
    def sonido(self):
        """La chiptune de base y, encima, un sonido por paso (los de DC: blip, cereza, eat, start, perder, win)."""
        largo = self.duracion + self.cola
        base = chiptune(largo) * 0.29   # la base, unos 30 dB bajo cero: 16 o 17 dB abajo de la voz de LeIA
        sfx = np.zeros(int(largo * SR) + SR, dtype=np.float32)
        a = list(self.valores)   # los valores en su orden, para la nota de cada barra
        for s in self.escenas:
            if s['vista'] == 'inicio':
                for pos in range(self.n):   # cada barra suena al caer
                    nota(sfx, s['t0'] + 0.15 + pos * 0.09 + 0.22, tono_de(self.valores[pos]), 0.06, 'triangle', 0.35)
        for e in self.eventos:
            t0 = e['t0']
            if e['tipo'] == 'compara':
                nota(sfx, t0, tono_de(a[e['j']]), 0.045, 'square', 0.11)
                nota(sfx, t0 + 0.055, tono_de(a[e['k']]), 0.045, 'square', 0.11)
            elif e['tipo'] == 'cambia':
                nota(sfx, t0, tono_de(a[e['j']]), 0.11, 'square', 0.10, hasta=tono_de(a[e['k']]))
                ruido(sfx, t0, 0.04, 0.10, 3000)
                a[e['j']], a[e['k']] = a[e['k']], a[e['j']]
            elif e['tipo'] == 'fija':   # 'eat' de DC
                nota(sfx, t0, 660, 0.06, 'square', 0.14); nota(sfx, t0 + 0.06, 990, 0.08, 'square', 0.14)
            elif e['tipo'] == 'marca':
                nota(sfx, t0, 720, 0.03, 'triangle', 0.2)
            elif e['tipo'] == 'fin':   # el barrido y 'win'
                for pos in range(self.n):
                    nota(sfx, t0 + pos * 0.07, tono_de(a[pos]), 0.07, 'square', 0.11)
                for i, fr in enumerate([523, 659, 784, 1046, 784, 1046]):
                    nota(sfx, t0 + self.n * 0.07 + 0.08 + i * 0.09, fr, 0.09, 'square', 0.14)
        for i, ts in sorted(self.filas_t.items()):   # 'blip' al salir cada fila de la tabla
            nota(sfx, ts, 880, 0.04, 'square', 0.13)
        if self.complejidad_t is not None:   # 'perder': lento es malo
            for i, fr in enumerate([440, 392, 330, 262]):
                nota(sfx, self.complejidad_t + i * 0.1, fr, 0.12, 'square', 0.12)
        if any(s['vista'] == 'enlace' for s in self.escenas):   # 'start'
            t0 = self.primera('enlace')['t0']
            for i, fr in enumerate([440, 550, 660, 880]):
                nota(sfx, t0 + 0.1 + i * 0.07, fr, 0.07, 'square', 0.13)
        if any(s['vista'] in ('cuenta',) for s in self.escenas):
            t0 = self.primera('cuenta')['t0']   # la ventana que se abre: un 'pop'
            ruido(sfx, t0, 0.05, 0.12, 2500); nota(sfx, t0, 500, 0.04, 'triangle', 0.25, hasta=900)
        n = int(largo * SR)
        mezcla_ = base[:n] + sfx[:n]
        fade = int(0.6 * SR); mezcla_[-fade:] *= np.linspace(1, 0, fade)
        # sin normalizar: armar.py le pasa a comercial.py `volumen` = este RMS, así que suena tal cual
        return mezcla_ / max(1.0, np.abs(mezcla_).max() / 0.95)

    # -------------------------------------------------- a disco
    def guardar(self, mp4, wav, cuadros_png=None):
        """fondo.mp4 (mudo) y fondo.wav, y devuelve el RMS del sonido. Con `cuadros_png` {segundo: ruta}, guarda
        además esos cuadros."""
        cmd = [FF, '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS),
               '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', '-r', str(FPS), mp4]
        p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
        quiero = {round(s * FPS): r for s, r in (cuadros_png or {}).items()}
        for i, im in enumerate(self.cuadros()):
            if i in quiero:
                im.save(quiero[i])
            p.stdin.write(im.tobytes())
        p.stdin.close(); p.wait()
        if p.returncode:
            raise SystemExit('ffmpeg no pudo escribir ' + mp4)
        audio = self.sonido()
        with wave.open(wav, 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
            w.writeframes((audio * 32767).astype('<i2').tobytes())
        return float(np.sqrt(np.mean(audio ** 2)))   # el RMS: comercial.py lo lleva a `volumen`

    def cuadros_sueltos(self, segundos):
        """Sólo algunos cuadros, para revisar sin armar el vídeo."""
        quiero = {round(s * FPS): s for s in segundos}
        for i, im in enumerate(self.cuadros()):
            if i in quiero:
                yield quiero[i], im
            if i > max(quiero):
                return


def logo(ruta):
    """El logo de la tarjeta final, en pixel art a 1x (comercial.py lo agranda sin suavizar): ocho barras en
    escalera con los tonos de la paleta y «ALGORITMOS / EN PIXEL»."""
    im = Image.new('RGBA', (80, 41), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for i, tono in enumerate([4, 2, 1, 15, 13, 11, 9, 7]):
        alto = 4 + 2 * i
        d.rectangle([1 + 10 * i, 18 - alto, 8 + 10 * i, 17], fill=atari(tono, 5) + (255,))
    for s, y, c in (('ALGORITMOS', 22, PAL['white']), ('EN PIXEL', 33, PAL['cyan'])):
        m = mascara(s, 1).crop((0, 3, 8 * len(s), 11))
        im.paste(c + (255,), ((80 - m.width) // 2, y), m)
    im.save(ruta)
