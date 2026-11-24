#!/usr/bin/env python3
"""Arma un vídeo largo de «Programando …» (piloto del 24-nov-2026): LeIA programa un juego de Daily Challenge paso a paso.

  "/Users/jadhasfuh/Documents/code challenge/.venv/bin/python" tools/comerciales/programando/armar.py snake1
      [--idioma es|en] [--cuadros 3,9.5] [--hojas] [--revisar]

Adrián (9 y 14-nov-2026): «tutoriales muy largos explicando todo el código del minijuego con gráficos», «programando los
juegos de Daily Challenge paso a paso». Horizontal, 1920x1080: a la izquierda el editor, donde el código se escribe solo;
a la derecha la pantalla del programa, que corre de verdad (correr.mjs ejecuta el mismo código que se ve), con un dibujo
que explica lo que dice LeIA (paneles.py); abajo, su cuadro de diálogo (comercial.py) y una barra con los capítulos. Todo
en Press Start 2P, con la paleta y los sonidos de Daily Challenge, como «Algoritmos en pixel» (algoritmos/renderizador.py).

1. Lee programando/<nombre>.py (snake1.py es el modelo): las versiones del código y el guion, renglón por renglón.
2. Mide la voz de cada renglón (comercial.narrar, con su caché); cada renglón dura su voz más el respiro, en cuadros
   enteros. Lo que se escribe cabe en ese tiempo.
3. Corre los programas (correr.mjs) lo que dura cada uno y guarda sus cuadros en programando/<clave>/ (fuera de git).
4. Dibuja el fondo (fondo.mp4, mudo) y su sonido (fondo.wav), y arma con comercial.py en salida/programando-<clave>.mp4.
5. Revisa que el audio y el vídeo midan lo mismo.
--cuadros guarda esos segundos del fondo en PNG; --hojas, un cuadro por renglón en hojas de doce; --revisar, sólo los
datos que dice LeIA (líneas, casillas, puntos) y la línea de tiempo. Ninguna de las tres arma el vídeo.
"""
import argparse, difflib, importlib, json, math, os, re, subprocess, sys, tempfile, wave
import numpy as np
from PIL import Image, ImageDraw

AQUI = os.path.dirname(os.path.abspath(__file__))
COMERCIALES = os.path.dirname(AQUI)
for ruta in (COMERCIALES, os.path.join(COMERCIALES, 'algoritmos'), AQUI):
    sys.path.insert(0, ruta)
import comercial   # noqa: E402
import renderizador as R   # noqa: E402
from renderizador import PAL, atari, mascara, mezcla, nota, resaltar, ruido, texto   # noqa: E402
import paneles   # noqa: E402

W, H, FPS, SR = 1920, 1080, 30, 48000
PY = os.path.expanduser('~/Documents/code challenge/.venv/bin/python')
VOZ = {'es': ('es-US-Chirp3-HD-Achernar', 'es-US'), 'en': ('en-US-Chirp3-HD-Achernar', 'en-US')}
SUF = {'es': '', 'en': '-en'}
MARCA = {'es': {'sitio': 'ayotl.dev/aprende', 'pie': 'Juega Snake en dailychallenge.click'},
         'en': {'sitio': 'ayotl.dev/en/learn', 'pie': 'Play Snake at dailychallenge.click'}}
COLORES = {'fondo': '#000000', 'acento': '#93e2dd', 'texto': '#ffffff', 'tenue': '#9a9aa8', 'sobre_acento': '#000000', 'borde': '#3a3a48'}
ROT = {'es': {'intro': 'Qué vamos a programar', 'cierre': 'Lo que viene en la parte 2', 'puntos': 'PUNTOS', 'frutas': 'FRUTAS', 'largo': 'LARGO',
              'cada': 'TICKS POR PASO', 'lineas': 'LÍNEAS', 'nuestro': 'EL NUESTRO', 'dc': 'DAILY CHALLENGE', 'total': 'EN TOTAL'},
       'en': {'intro': "What we're building", 'cierre': "What's in part 2", 'puntos': 'POINTS', 'frutas': 'FRUIT', 'largo': 'LENGTH',
              'cada': 'TICKS PER STEP', 'lineas': 'LINES', 'nuestro': 'OURS', 'dc': 'DAILY CHALLENGE', 'total': 'IN TOTAL'}}

# dónde va cada cosa
ED = (16, 64, 1392, 708)            # el editor
PA = (1408, 64)                     # el panel derecho (paneles.PA_W x PA_H)
K, LINEA, CHAR = 3, 34, 24          # el código a 24 px
TAB = 48
COD_X, COD_Y = 78, TAB + 10         # dentro del editor
EW, EH = ED[2] - ED[0], ED[3] - ED[1]
VIS = (EH - COD_Y - 6) // LINEA     # renglones que caben
NEGRO, BLANCO = (0, 0, 0), (255, 255, 255)


# ---------------------------------------------------------------- lo que se escribe
class Tecleo:
    """El paso de una versión de un archivo a otra, letra por letra."""
    def __init__(self, archivo, viejo, nuevo):
        self.archivo, self.a, self.b = archivo, (viejo.split('\n') if viejo else []), nuevo.split('\n')
        n, self.tramos = 0, []
        for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, self.a, self.b, autojunk=False).get_opcodes():
            c = sum(len(l.strip()) + 1 for l in self.b[j1:j2]) if tag in ('insert', 'replace') else 0
            self.tramos.append((tag, i1, i2, j1, j2, n, n + c)); n += c
        self.total = max(1, n)

    def en(self, n):
        """Los renglones con `n` letras escritas, el cursor (renglón, columna) y los renglones nuevos."""
        ls, cursor, nuevas = [], None, set()
        for tag, i1, i2, j1, j2, c0, c1 in self.tramos:
            if tag == 'equal':
                ls += self.a[i1:i2]
            elif tag == 'delete':
                if n < c0:
                    ls += self.a[i1:i2]
            elif n <= c0 and n < self.total:   # todavía no se llega ahí
                ls += self.a[i1:i2]
                if cursor is None:
                    cursor = (max(0, len(ls) - 1), len(ls[-1]) if ls else 0)
            else:
                q = n - c0
                for l in self.b[j1:j2]:
                    if q <= 0:
                        break
                    s = l.strip(); m = len(l) - len(l.lstrip())
                    ls.append(l if q > len(s) else l[:m + int(q)]); nuevas.add(len(ls) - 1)
                    if n < c1:
                        cursor = (len(ls) - 1, len(ls[-1]))
                    q -= len(s) + 1
        return ls, cursor, nuevas


# ---------------------------------------------------------------- la línea de tiempo
def linea_de_tiempo(mod, lang, medir):
    escenas, final, f, docs, activo = [], None, 0, {}, None
    for p in mod.GUION:
        dice, voz = (p['dice'][lang], p['voz'][lang]) if isinstance(p['dice'], dict) else (p['dice'], p['voz'])
        vd = medir(voz)
        if p['final']:
            final = dict(p, dice=dice, voz=voz, voz_dur=vd); continue
        n = math.ceil(max(vd + comercial.RESPIRO + 0.004, p['dur']) * FPS - 1e-6)
        s = dict(p, dice=dice, voz=voz, voz_dur=vd, f0=f, n=n, t0=f / FPS, seg=n / FPS)
        # lo que se escribe: cada archivo en su trozo, según cuántas letras tenga
        s['tecleos'] = []
        eds = [(a, Tecleo(a, docs.get(a, ''), v)) for a, v in p['ed']]
        total = sum(t.total for _, t in eds)
        if total:
            rapidez = max(total / (s['seg'] * 0.80), 30)   # letras por segundo
            if rapidez > 150:
                print(f'  ojo: «{dice[:40]}…» escribe a {rapidez:.0f} letras por segundo')
            x = 0.2
            for a, t in eds:
                s['tecleos'].append((x, x + t.total / rapidez, t)); x += t.total / rapidez
                docs = dict(docs, **{a: '\n'.join(t.b)}); activo = a
        if p['ve']:
            activo = p['ve']
        s['docs'], s['activo'] = docs, activo
        escenas.append(s); f += n
    # las corridas: de cuándo a cuándo, con qué código y qué teclas
    corridas = {}
    for s in escenas:
        for campo in ('corre', 'corre2'):
            c = s[campo]
            if not c:
                continue
            if isinstance(c, str):
                c = {'id': c}
            if c['id'] not in corridas:
                ini = s['f0'] + round(c.get('desde', 0) * s['n'])
                corridas[c['id']] = {'ini': ini, 'fin': 0, 'teclas': [], 'manual': [], 'docs': s['docs'],
                                     **{k: c[k] for k in ('semilla', 'bot', 'quieto', 'lento', 'dc') if k in c}}
                base = ini
            else:
                base = s['f0']
            r = corridas[c['id']]; r['fin'] = s['f0'] + s['n']
            for seg, code, dura in c.get('teclas', []):
                q = base - r['ini'] + round(seg * FPS); r['teclas'] += [[q, code, True], [q + max(1, round(dura * FPS)), code, False]]
            r['manual'] += [[base - r['ini'] + round(seg * FPS), js] for seg, js in c.get('manual', [])]
            s[campo] = c['id']
    return escenas, final, corridas, f


class Corrida:
    """Lo que pintó un programa, cuadro por cuadro."""
    def __init__(self, base, ini):
        j = json.load(open(base + '.json')); self.j, self.ini = j, ini
        self.px = np.fromfile(base + '.bin', dtype=np.uint8).reshape(j['imagenes'], j['alto'], j['ancho'])
        self.pal = np.array(j['paleta'], dtype=np.uint8); self.n = len(j['cuadros']); self.im = {}
        # cuándo cambió el cuerpo por última vez y cómo era antes
        self.cambios, ult, antes, previo = [], -999, None, None
        for k in range(self.n):
            b = [(q['x'], q['y']) for q in self.estado(k).get('body', [])]
            if previo is not None and b != previo:
                if abs(b[0][0] - previo[0][0]) + abs(b[0][1] - previo[0][1]) == 1:   # un paso, no una puesta a mano
                    ult, antes = k, previo
            previo = b; self.cambios.append((ult, antes))

    def _k(self, f):
        return max(0, min(self.n - 1, f - self.ini))

    def estado(self, k):
        return self.j['estados'][self.j['estado'][k]]

    def en(self, f):
        """(número de imagen, imagen, estado, segundos desde el último paso, cuerpo de antes) en el cuadro f del vídeo."""
        k = self._k(f); i = self.j['cuadros'][k]
        if i not in self.im:
            if len(self.im) > 60:
                self.im.clear()
            self.im[i] = Image.fromarray(self.pal[self.px[i]], 'RGB')
        ult, antes = self.cambios[k]
        return i, self.im[i], self.estado(k), (max(0, f - self.ini) - ult) / FPS, antes


def correr(corridas, orden, carpeta):
    """Corre los programas con correr.mjs (los que no estén ya, con la misma huella)."""
    import hashlib
    trabajos, salen = [], {}
    nucleo = open(os.path.join(AQUI, 'correr.mjs'), 'rb').read()
    for cid, r in corridas.items():
        t = {'cuadros': r['fin'] - r['ini'], **{k: r[k] for k in ('teclas', 'manual', 'semilla', 'bot', 'quieto', 'lento', 'dc') if k in r}}
        if 'dc' not in t:
            t['archivos'] = [[a, r['docs'][a]] for a in orden if a in r['docs']]
        huella = hashlib.sha1(nucleo + json.dumps(t, sort_keys=True).encode()).hexdigest()[:12]
        t['salida'] = os.path.join(carpeta, f'{cid}-{huella}'); salen[cid] = t['salida']
        if not os.path.exists(t['salida'] + '.json'):
            for viejo in os.listdir(carpeta):   # lo de antes de esta corrida ya no sirve
                if re.fullmatch(re.escape(cid) + r'-[0-9a-f]{12}\.(bin|json)', viejo):
                    os.remove(os.path.join(carpeta, viejo))
            trabajos.append(t)
    if trabajos:
        ruta = os.path.join(carpeta, 'trabajos.json'); json.dump(trabajos, open(ruta, 'w'))
        r = subprocess.run(['node', os.path.join(AQUI, 'correr.mjs'), ruta], capture_output=True, text=True)
        if r.returncode:
            sys.exit('correr.mjs: ' + r.stderr[-1500:])
    return {cid: Corrida(b, corridas[cid]['ini']) for cid, b in salen.items()}


# ---------------------------------------------------------------- el editor
HTML = [(re.compile(r), c) for r, c in [(r'"[^"]*"', 'string'), (r'</?!?[a-z]+', 'kw'), (r'>', 'kw'), (r'[a-z-]+(?=[:=])', 'func'),
                                        (r'\d+px|\d+', 'number'), (r'[a-z-]+', 'ident'), (r'[ \t]+', 'ws'), (r'.', 'punct')]]


def tramos_html(l):
    out = []
    while l:
        for rx, c in HTML:
            m = rx.match(l)
            if m:
                out.append((m.group(0), c)); l = l[m.end():]; break
    return out


_tramos = {}


def tramos(archivo, l):
    k = (archivo.endswith('.html'), l)
    if k not in _tramos:
        _tramos[k] = tramos_html(l) if k[0] else resaltar(l)
    return _tramos[k]


FONDO_ED, FONDO_TAB = atari(9, 0), atari(9, 1)


def editor(archivo, abiertos, ls, nuevas, marcadas, cursor, parpadea, scroll):
    im = Image.new('RGB', (EW, EH), atari(9, 3)); d = ImageDraw.Draw(im)
    d.rectangle([4, 4, EW - 5, EH - 5], fill=FONDO_ED); d.rectangle([4, 4, EW - 5, TAB - 1], fill=FONDO_TAB)
    x = 4
    for a in abiertos:   # las pestañas
        w = 16 * len(a) + 40
        if a == archivo:
            d.rectangle([x, 4, x + w - 1, TAB - 1], fill=FONDO_ED); d.rectangle([x, 4, x + w - 1, 8], fill=PAL['cyan'])
        texto(im, x + 20, 19, a, BLANCO if a == archivo else PAL['gray'], 2); x += w + 2
    for i, c in enumerate(('red', 'yellow', 'lgreen')):
        d.rectangle([EW - 96 + 28 * i, 18, EW - 81 + 28 * i, 33], fill=PAL[c])
    # el código, en su ventana
    vent = Image.new('RGB', (EW - 8, EH - COD_Y - 4), FONDO_ED); q = ImageDraw.Draw(vent)
    px = round(scroll * LINEA)
    for n, l in enumerate(ls):
        y = n * LINEA - px
        if y < -LINEA or y > vent.height:
            continue
        if n in marcadas:
            q.rectangle([0, y, vent.width, y + LINEA - 1], fill=mezcla(atari(1, 1), FONDO_ED, 0.4)); q.rectangle([0, y, 5, y + LINEA - 1], fill=PAL['yellow'])
        elif n in nuevas:
            q.rectangle([0, y, 5, y + LINEA - 1], fill=PAL['green'])
        num = str(n + 1); texto(vent, 52, y + 9, num, PAL['yellow'] if n in marcadas else atari(9, 4), 2, 'r')
        cx = COD_X - 4
        for t, c in tramos(archivo, l):
            if c != 'ws':
                m = mascara(t, K); vent.paste(R.SINTAXIS[c], (cx, y + 5 - 3 * K), m)
            cx += CHAR * len(t)
    if cursor and parpadea:
        cy = cursor[0] * LINEA - px; cx = COD_X - 4 + CHAR * cursor[1]
        q.rectangle([cx, cy + 3, cx + 14, cy + LINEA - 5], fill=PAL['lgreen'])
    im.paste(vent, (4, COD_Y))
    if len(ls) > VIS:   # la barra de desplazamiento
        alto = EH - COD_Y - 12; h = round(alto * VIS / len(ls)); y = COD_Y + round((alto - h) * scroll / (len(ls) - VIS))
        d.rectangle([EW - 14, y, EW - 8, y + h], fill=atari(9, 4))
    return im


def renglones(ls, que):
    """Los renglones que llevan un texto, o los que van de un texto a otro."""
    if isinstance(que, tuple):
        a = next((i for i, l in enumerate(ls) if que[0] in l), None)
        b = next((i for i, l in enumerate(ls) if i >= (a or 0) and que[1] in l), None)
        return set(range(a, b + 1)) if a is not None and b is not None else set()
    return {i for i, l in enumerate(ls) if que in l}


# ---------------------------------------------------------------- el vídeo
class Fondo:
    def __init__(self, mod, lang, escenas, corridas, total, cola):
        self.mod, self.lang, self.escenas, self.corridas, self.total, self.cola = mod, lang, escenas, corridas, total, cola
        self.rot = ROT[lang]; self.caps = mod.CAPITULOS[lang]
        # los capítulos: [(cuadro en que empieza, número, nombre)]
        self.inicios = [(0, None, '')] + [(s['f0'], s['cap'], self.caps[s['cap']]) for s in escenas if s['cap'] is not None]
        cierre = next((s['f0'] for s in escenas if s['vista'] == 'dos'), None)
        if cierre:
            self.inicios.append((cierre, None, self.rot['cierre'].upper()))
        self.snake = self.culebra()

    # ------------------------------------------------ lo de siempre: el título, el capítulo y la barra de abajo
    def marco(self, cap):
        im = Image.new('RGB', (W, H), NEGRO)
        a, b, c = self.mod.TITULO[self.lang]
        texto(im, 24, 22, f'{a} {b}', PAL['cyan'], 3); texto(im, 24 + 24 * len(f'{a} {b} '), 22, c, PAL['gray'], 3)
        _, num, nombre = cap
        s = f'{num + 1} {nombre}' if num is not None else nombre
        texto(im, W - 24, 22, s, BLANCO, 3, 'r')
        return im

    def barra(self, im, f):
        """Los capítulos, del largo que duran; lo que va, en color."""
        d = ImageDraw.Draw(im); X0, X1, Y = 24, W - 24, 1058
        pts = [i for i, _, _ in self.inicios] + [self.total]
        x = lambda q: X0 + round((X1 - X0) * q / self.total)
        for a, b in zip(pts, pts[1:]):
            xa, xb = x(a) + 2, x(b) - 3
            d.rectangle([xa, Y, xb, Y + 9], fill=PAL['dgray'])
            if f >= a:
                d.rectangle([xa, Y, max(xa, min(xb, x(f))), Y + 9], fill=PAL['cyan'] if f < b else atari(11, 3))

    def culebra(self):
        """Una serpiente pixel para la portada y el logo."""
        im = Image.new('RGB', (46, 18), NEGRO); d = ImageDraw.Draw(im)
        for i, (x, y) in enumerate([(0, 2), (0, 1), (0, 0), (1, 0), (2, 0), (2, 1), (2, 2), (3, 2), (4, 2), (4, 1), (5, 1)]):
            d.rectangle([x * 6, y * 6, x * 6 + 5, y * 6 + 5], fill=PAL['lgreen'] if i == 10 else PAL['green'])
            d.rectangle([x * 6, y * 6, x * 6 + 5, y * 6 + 5], outline=mezcla(PAL['green'], NEGRO, 0.35))
        d.rectangle([40, 7, 43, 10], fill=PAL['red'])
        return im

    # ------------------------------------------------ las vistas sin editor
    def portada(self, im, f, s):
        a, b, c = self.mod.TITULO[self.lang]; d = ImageDraw.Draw(im)
        d.rectangle([0, 0, W, 715], fill=NEGRO)
        texto(im, 350, 110, a, PAL['cyan'], 6, 'm'); texto(im, 350, 196, b, PAL['lgreen'], 12, 'm')
        texto(im, 350, 336, c, PAL['yellow'], 5, 'm')
        im.paste(self.snake.resize((46 * 10, 18 * 10), Image.NEAREST), (120, 440))
        texto(im, 350, 652, self.mod.SUBTITULO[self.lang], PAL['gray'], 3, 'm')
        _, img, _, _, _ = self.corridas[s['corre']].en(f)
        paneles.pega(im, img, 3, 720, 84)
        for i, n in enumerate(self.caps):
            y = 92 + i * 56
            texto(im, 1300, y, f'{i + 1:2}', atari(9, 5), 3); texto(im, 1372, y, n, BLANCO, 3)

    def juego(self, im, f, s):
        d = ImageDraw.Draw(im); d.rectangle([0, 56, W, 715], fill=NEGRO)
        _, img, e, _, _ = self.corridas[s['corre']].en(f)
        paneles.pega(im, img, 3, 720, 84)
        datos = [(self.rot['puntos'], e['score'], PAL['white'], 6), (self.rot['frutas'], e['eaten'], PAL['red'], 5),
                 (self.rot['largo'], len(e['body']), PAL['lgreen'], 5), (self.rot['cada'], e['interval'], PAL['yellow'], 5)]
        for i, (r, v, c, k) in enumerate(datos):
            y = 100 + i * 150
            texto(im, 60, y, r, PAL['gray'], 3); texto(im, 60, y + 46, str(v), c, k)
        texto(im, 1290, 100, self.rot['lineas'], PAL['gray'], 3)
        fin = {a: len(t.split('\n')) for a, t in self.mod.FINAL.items()}
        for i, a in enumerate(self.mod.ORDEN):
            y = 160 + i * 78
            texto(im, 1290, y, a, BLANCO, 3); texto(im, 1860, y, str(fin[a]), PAL['cyan'], 3, 'r')
            d.rectangle([1290, y + 34, 1290 + round(570 * fin[a] / self.mod.TOTAL), y + 41], fill=atari(11, 4))
        texto(im, 1290, 580, self.rot['total'], PAL['gray'], 3); texto(im, 1860, 572, str(self.mod.TOTAL), PAL['yellow'], 5, 'r')

    def dos(self, im, f, s):
        d = ImageDraw.Draw(im); d.rectangle([0, 56, W, 715], fill=NEGRO)
        for cid, x, r, c in ((s['corre'], 300, self.rot['nuestro'], PAL['lgreen']), (s['corre2'], 1140, self.rot['dc'], PAL['yellow'])):
            _, img, _, _, _ = self.corridas[cid].en(f)
            texto(im, x + 240, 74, r, c, 3, 'm'); paneles.pega(im, img, 3, x, 120)

    # ------------------------------------------------ los cuadros, en orden
    def cuadros(self, quiero=None):
        """Genera (cuadro, imagen, si cambió). Con `quiero`, sólo dibuja esos cuadros (pero recorre todos: el
        desplazamiento del editor depende de lo anterior)."""
        scroll, es = {}, 0
        marcos, previo = {}, None; im = None; kb = None
        corrida_p = None   # la última corrida del panel: si el renglón no dice nada, se queda en su último cuadro
        for f in range(self.total):
            while f >= self.escenas[es]['f0'] + self.escenas[es]['n']:
                es += 1
            s = self.escenas[es]; tt = (f - s['f0']) / FPS; u = tt / s['seg']
            # el editor: qué archivo, hasta dónde va lo escrito y qué se resalta
            arch, ls, cursor, nuevas = s['activo'], None, None, set()
            for x0, x1, t in s['tecleos']:
                if tt >= x0 or t is s['tecleos'][0][2]:
                    n = t.total * max(0, min(1, (tt - x0) / (x1 - x0)))
                    arch = t.archivo; ls, cursor, nuevas = t.en(n)
            if ls is None and arch:
                ls = s['docs'][arch].split('\n')
            marcadas, foco = set(), None
            if ls is not None:
                for que, desde in s['resalta']:
                    if u >= desde:
                        marcadas = renglones(ls, que)
                if cursor:
                    foco = (cursor[0] - 2, cursor[0] + 2)
                elif marcadas:
                    foco = (min(marcadas) - 1, max(marcadas) + 1)
                # el desplazamiento
                v = scroll.get(arch, (0.0, 0.0)); meta = v[1]; tope = max(0, len(ls) - VIS)
                if foco:
                    if foco[0] < meta + 1:
                        meta = foco[0] - (3 if not cursor else 5)
                    elif foco[1] > meta + VIS - 2:
                        meta = foco[1] - VIS + (5 if not cursor else 6)
                meta = max(0, min(tope, meta)); pos = v[0] + (meta - v[0]) * 0.22
                if abs(pos - meta) < 0.02:
                    pos = meta
                scroll[arch] = (pos, meta)
            if s['corre'] and f >= self.corridas[s['corre']].ini:
                corrida_p = s['corre']
            elif f and s['vista'] == 'editor' and self.escenas[es - 1]['vista'] != 'editor' and f == s['f0']:
                corrida_p = None   # al abrir el editor por primera vez, nada de lo que se veía en la portada
            if quiero is not None and f not in quiero:
                continue
            # lo que se ve: si nada cambió, el mismo cuadro
            cap = max((c for c in self.inicios if c[0] <= f), key=lambda c: c[0])
            run = self.corridas.get(corrida_p)
            if s['vista'] == 'editor':
                i, img, e, paso, antes = run.en(f) if run else (-1, Image.new('RGB', (160, 192)), {}, 9, None)
                nombre, datos = (s['panel'][0], s['panel'][1:]) if s['panel'] else (None, ())
                abiertos = [a for a in self.mod.ORDEN if a in s['docs']]
                parpadea = bool(cursor)
                ke = (arch, tuple(ls or ()), frozenset(marcadas), cursor, parpadea, round(scroll.get(arch, (0, 0))[0] * LINEA), frozenset(nuevas), len(abiertos))
                kp = (corrida_p, i, nombre, f if nombre in paneles.ANIMADOS else 0, json.dumps(e) if nombre else '')
            else:
                ke = kp = None
                i = run.en(f)[0] if run else -1
                if s['vista'] == 'dos':
                    i = (i, self.corridas[s['corre2']].en(f)[0])
            bx = round((W - 48) * f / self.total)
            clave = (s['vista'], cap[0], ke, kp, i if s['vista'] != 'editor' else 0, bx)
            if clave == previo and im is not None:
                yield f, im, False; continue
            if cap[0] not in marcos:
                marcos[cap[0]] = self.marco(cap)
            if previo is None or previo[0] != s['vista'] or previo[1] != cap[0] or quiero is not None:
                im = marcos[cap[0]].copy(); previo = None
            if s['vista'] == 'editor':
                if previo is None or previo[2] != ke:
                    im.paste(editor(arch, abiertos, ls or [], nuevas, marcadas, cursor, parpadea, scroll.get(arch, (0, 0))[0]), ED[:2])
                if previo is None or previo[3] != kp:
                    pa = Image.new('RGB', (paneles.PA_W, paneles.PA_H), NEGRO); d = ImageDraw.Draw(pa)
                    d.rectangle([0, 0, paneles.PA_W - 1, paneles.PA_H - 1], outline=PAL['dgray'], width=3)
                    paneles.PANELES[nombre](pa, d, {'img': img, 'e': e, 'u': u, 'tt': tt, 'datos': datos, 'paso': paso, 'antes': antes, 'lang': self.lang})
                    r = paneles.TITULOS[self.lang].get(nombre) or f"{paneles.T[self.lang]['pantalla']} 160x192"
                    d.rectangle([3, 3, paneles.PA_W - 4, 44], fill=FONDO_TAB); texto(pa, 16, 16, r, PAL['lgray'], 2)
                    im.paste(pa, PA)
            else:
                getattr(self, s['vista'])(im, f, s)
            self.barra(im, f)
            previo = clave
            yield f, im, True

    # ------------------------------------------------ el sonido
    def sonido(self):
        largo = self.total / FPS + self.cola
        base = musica([i / FPS for i, _, _ in self.inicios], largo)
        sfx = np.zeros(int(largo * SR) + SR, dtype=np.float32)
        for s in self.escenas:
            for x0, x1, t in s['tecleos']:   # las teclas: un clic cada tres letras, sin pasar de 14 por segundo
                cuantos = min(t.total // 3, int((x1 - x0) * 14))
                for k in range(cuantos):
                    ruido(sfx, s['t0'] + x0 + (x1 - x0) * k / max(1, cuantos), 0.012, 0.035 + 0.015 * (k % 3), 4200)
            for _, desde in s['resalta']:
                nota(sfx, s['t0'] + desde * s['seg'], 880, 0.03, 'square', 0.05)
            if s['cap'] is not None:   # 'start'
                for i, fr in enumerate([440, 550, 660, 880]):
                    nota(sfx, s['t0'] + 0.02 + i * 0.07, fr, 0.07, 'square', 0.11)
        for cid, r in self.corridas.items():
            visto = [s for s in self.escenas if cid in (s['corre'], s['corre2'])]
            principal = any(s['corre'] == cid for s in visto)
            for k, nombre in r.j['sonidos']:
                t = (r.ini + k) / FPS
                if principal and any(s['f0'] <= r.ini + k < s['f0'] + s['n'] for s in visto):
                    efecto(sfx, t, nombre)
            if cid in ('lenta', 'ocho', 'vive', 'muere'):   # un paso que se oye
                for k in range(1, r.n):
                    if r.cambios[k][0] == k:
                        nota(sfx, (r.ini + k) / FPS, 520, 0.04, 'triangle', 0.22)
        n = int(largo * SR); m = base[:n] + sfx[:n]
        fade = int(0.8 * SR); m[-fade:] *= np.linspace(1, 0, fade)
        return m / max(1.0, np.abs(m).max() / 0.95)

    def guardar(self, mp4, wav):
        cmd = [R.FF, '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
               '-c:v', 'libx264', '-preset', 'fast', '-crf', '13', '-g', '30', '-pix_fmt', 'yuv420p', '-r', str(FPS), mp4]
        p = subprocess.Popen(cmd, stdin=subprocess.PIPE); crudo = b''
        for f, im, cambio in self.cuadros():
            if cambio:
                crudo = im.tobytes()
            p.stdin.write(crudo)
            if f % 1800 == 0:
                print(f'  fondo: {f / FPS:.0f} s de {self.total / FPS:.0f}', flush=True)
        p.stdin.close(); p.wait()
        if p.returncode:
            raise SystemExit('ffmpeg no pudo escribir ' + mp4)
        audio = self.sonido()
        with wave.open(wav, 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((audio * 32767).astype('<i2').tobytes())
        return float(np.sqrt(np.mean(audio ** 2)))


def efecto(buf, t, nombre):
    """Los de core/audio.js de Daily Challenge, más bajos."""
    if nombre == 'eat':
        nota(buf, t, 660, 0.06, 'square', 0.13); nota(buf, t + 0.06, 990, 0.08, 'square', 0.13)
    elif nombre == 'die':
        nota(buf, t, 400, 0.5, 'square', 0.16, hasta=50); ruido(buf, t + 0.1, 0.4, 0.12, 400)
    elif nombre == 'fruta':
        for i, fr in enumerate([880, 1174, 1568]):
            nota(buf, t + i * 0.05, fr, 0.07, 'triangle', 0.2)


# la base: cada capítulo con sus acordes y su paso, para que ocho minutos no sean la misma vuelta (como la de
# renderizador.chiptune: bajo y arpegio en triángulo y un charles apenas)
ACORDES = [[(48, (60, 64, 67)), (43, (59, 62, 67)), (45, (57, 60, 64)), (41, (57, 60, 65))],   # do sol lam fa
           [(45, (57, 60, 64)), (41, (57, 60, 65)), (48, (60, 64, 67)), (43, (59, 62, 67))],   # lam fa do sol
           [(41, (57, 60, 65)), (43, (59, 62, 67)), (40, (59, 64, 67)), (45, (57, 60, 64))],   # fa sol mim lam
           [(38, (57, 62, 65)), (43, (59, 62, 67)), (48, (60, 64, 67)), (45, (57, 60, 64))],   # rem sol do lam
           [(48, (60, 64, 67)), (45, (57, 60, 64)), (38, (57, 62, 65)), (43, (59, 62, 67))]]   # do lam rem sol
BAJOS, ARPEGIOS = ['x...x.x.', 'x..x..x.', 'x.x...x.'], [(0, 1, 2, 1), (0, 2, 1, 2), (2, 1, 0, 1)]


def musica(cortes, largo):
    buf = np.zeros(int(largo * SR) + 2 * SR, dtype=np.float32)
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    for c, (t0, t1) in enumerate(zip(cortes, cortes[1:] + [largo])):
        bpm = 104 + (c * 5) % 16; paso = 60 / bpm / 2; ac = ACORDES[c % len(ACORDES)]; baj, arp = BAJOS[c % 3], ARPEGIOS[(c + c // 3) % 3]
        for s in range(int((t1 - t0) / paso)):
            t = t0 + s * paso; bajo, tonos = ac[(s // 8) % 4]; p = s % 8
            if baj[p] == 'x':
                nota(buf, t, hz(bajo), paso * 1.6, 'triangle', 0.30)
            nota(buf, t, hz(tonos[arp[p % 4]] + 12), paso * 0.9, 'triangle', 0.07)
            if p % 2:
                ruido(buf, t, 0.03, 0.022, 6000)
    return buf[:int(largo * SR)] * 0.27


def logo(ruta, lang, mod, culebra):
    """El logo de la tarjeta final, a 1x (comercial.py lo agranda sin suavizar)."""
    a, b, c = mod.TITULO[lang]
    im = Image.new('RGBA', (96, 50), (0, 0, 0, 0))
    cul = culebra.convert('RGBA'); px = np.array(cul); px[(px[..., :3].sum(axis=2) == 0)] = 0
    cul = Image.fromarray(px); im.paste(cul, (25, 0), cul)
    for s, y, color in ((a, 24, PAL['white']), (f'{b}', 38, PAL['lgreen'])):
        m = mascara(s, 1).crop((0, 3, 8 * len(s), 11)); im.paste(color + (255,), ((96 - m.width) // 2, y), m)
    im.save(ruta)


def guion(mod, lang, escenas, final, video, wav, rms, ruta_logo, salida):
    m = MARCA[lang]; es = []
    for i, s in enumerate(escenas):
        e = {'video': video, 'desde': s['t0'], 'completo': True, 'pixel': True, 'dur': s['seg'], 'cara': s['cara'], 'voz': s['voz']}
        if s['dice'] != s['voz']:
            e['dice'] = s['dice']
        if i:
            e['continua'] = True
        if i == 0:
            e['capitulo'] = ROT[lang]['intro']
        elif s['cap'] is not None:
            e['capitulo'] = mod.CAPITULOS[lang][s['cap']].capitalize()
        elif s['vista'] == 'dos' and escenas[i - 1]['vista'] != 'dos':
            e['capitulo'] = ROT[lang]['cierre']
        es.append(e)
    e = {'final': True, 'cara': final['cara'], 'voz': final['voz']}
    if final['dice'] != final['voz']:
        e['dice'] = final['dice']
    es.append(e)
    return {'fuente': 'pixel', 'formato': 'horizontal', 'salida': salida, 'voz': VOZ[lang][0], 'idioma': VOZ[lang][1],
            'presentadora': {'nombre': 'LeIA', 'caras': os.path.join(COMERCIALES, 'avatar')}, 'colores': COLORES, 'acercamiento': False,
            'marca': {'logo': ruta_logo, 'logo_ancho': 520, 'lema': mod.LEMA[lang], 'sitio': m['sitio'], 'pie': m['pie']},
            'musica': {'archivo': wav, 'desde': 0, 'volumen': round(rms, 6), 'agacha': 0.4}, 'escenas': es}


def hojas(fondo, escenas, carpeta, suf):
    """Un cuadro por renglón (al 85 %), doce por hoja."""
    quiero = {s['f0'] + min(s['n'] - 1, round(s['n'] * 0.85)): k for k, s in enumerate(escenas)}
    salen, n = [], 0
    hoja, rutas = None, []
    for f, im, _ in fondo.cuadros(set(quiero)):
        if n % 12 == 0:
            hoja = Image.new('RGB', (640 * 3 + 40, 400 * 4 + 10), (24, 24, 32))
        x, y = 10 + (n % 3) * 650, 8 + (n // 3 % 4) * 400
        texto(hoja, x + 2, y + 4, f'{quiero[f]}  {f / FPS:.1f} s', (230, 230, 240), 2)
        hoja.paste(im.crop((0, 0, W, H)).resize((640, 360), Image.LANCZOS), (x, y + 28)); n += 1
        if n % 12 == 0 or n == len(quiero):
            ruta = os.path.join(carpeta, f'hoja{suf}-{(n - 1) // 12}.png'); hoja.save(ruta); rutas.append(ruta)
    return rutas


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('video'); ap.add_argument('--idioma', default='es'); ap.add_argument('--cuadros')
    ap.add_argument('--hojas', action='store_true'); ap.add_argument('--revisar', action='store_true')
    a = ap.parse_args()
    mod = importlib.import_module(a.video); lang = a.idioma
    carpeta = os.path.join(AQUI, mod.CLAVE); os.makedirs(carpeta, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        os.chmod(tmp, 0o700); cab = os.path.join(tmp, 'h.txt')
        with open(cab, 'w') as h:
            h.write(f'X-Goog-Api-Key: {comercial.clave()}\n')   # la llave nunca se imprime
        os.chmod(cab, 0o600)
        medir = lambda v: len(comercial.narrar(v, *VOZ[lang], cab)) / comercial.SR
        escenas, final, corridas, total = linea_de_tiempo(mod, lang, medir)
    final_dur = max(4.0, final['voz_dur'] + comercial.RESPIRO + 1.2)
    print(f'{mod.CLAVE} ({lang}): {len(escenas)} renglones, {total / FPS:.1f} s + {final_dur:.1f} s de tarjeta = {0.5 + total / FPS + final_dur:.1f} s')
    if a.revisar:
        for s in escenas:
            print(f"  {s['t0']:6.1f} +{s['seg']:4.1f}  {s['vista']:7} {(s['panel'] or ('-',))[0]:11} {str(s['corre'] or '-'):9} {s['dice']}")
    runs = correr(corridas, mod.ORDEN, carpeta)
    fondo = Fondo(mod, lang, escenas, runs, total, final_dur + 0.5)
    suf = SUF[lang]
    if a.revisar:
        return
    if a.cuadros:
        quiero = {min(total - 1, round(float(q) * FPS)) for q in a.cuadros.split(',')}
        for f, im, _ in fondo.cuadros(quiero):
            ruta = os.path.join(carpeta, f'cuadro-{f / FPS:06.1f}{suf}.png'); im.save(ruta); print(' ', ruta)
        return
    if a.hojas:
        for r in hojas(fondo, escenas, carpeta, suf):
            print(' ', r)
        return
    video, wav, ruta_logo = (os.path.join(carpeta, n) for n in (f'fondo{suf}.mp4', f'fondo{suf}.wav', f'logo{suf}.png'))
    salida = os.path.join(COMERCIALES, 'salida', f'programando-{mod.CLAVE}{suf}.mp4')
    logo(ruta_logo, lang, mod, fondo.snake)
    rms = fondo.guardar(video, wav)
    g = guion(mod, lang, escenas, final, video, wav, rms, ruta_logo, salida)
    ruta_g = os.path.join(carpeta, f'programando-{mod.CLAVE}{suf}.json')
    json.dump(g, open(ruta_g, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    r = subprocess.run([PY, os.path.join(COMERCIALES, 'comercial.py'), ruta_g], capture_output=True, text=True)
    print(' ', (r.stdout + r.stderr).strip().replace('\n', '\n  '))
    if r.returncode:
        sys.exit('comercial.py falló')
    if 'ojo' in r.stdout:
        print('  AVISO: alguna voz no cupo en su escena')
    sonda = subprocess.run([R.FF, '-i', salida, '-map', '0:v:0', '-c', 'copy', '-f', 'null', '-'], capture_output=True, text=True).stderr
    sv = int(re.findall(r'frame=\s*(\d+)', sonda)[-1]) / FPS
    crudo = subprocess.run([R.FF, '-loglevel', 'error', '-i', salida, '-map', '0:a:0', '-f', 's16le', '-ac', '1', '-ar', '8000', '-'], capture_output=True, check=True).stdout
    sa = len(crudo) / 2 / 8000
    print(f'  vídeo {sv:.2f} s, audio {sa:.2f} s ({"iguales" if abs(sv - sa) < 0.1 else "DISTINTOS"}): {salida}')


if __name__ == '__main__':
    main()
