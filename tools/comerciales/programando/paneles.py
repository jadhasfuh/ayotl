"""Los dibujos de la derecha de «Programando …» (armar.py): la pantalla del juego y, debajo o encima, lo que explica LeIA.

Cada panel es una función (im, d, x) que dibuja en un lienzo de PA_W x PA_H (el panel derecho) y `x` trae lo que hace
falta: `img` (la pantalla del juego, 160x192), `e` (el estado del juego: body, dir, tick, interval, score, held…), `u`
(qué fracción del renglón va), `tt` (segundos desde que empezó), `datos` (lo que dice el guion), `paso` (segundos desde
que cambió la lista), `antes` (la lista de antes) y `lang`. Con franja: la pantalla a 2x y un diagrama debajo.
"""
import math
from PIL import Image, ImageDraw
import renderizador as R
from renderizador import PAL, texto, atari, mezcla

PA_W, PA_H = 496, 644
NEGRO, BLANCO = (0, 0, 0), (255, 255, 255)
OSCURO = atari(9, 0)
VERDE, VERDEC, ROJO, CIAN, AMAR, GRIS, GRISC, NARANJA = (PAL['green'], PAL['lgreen'], PAL['red'], PAL['cyan'], PAL['yellow'],
                                                        PAL['gray'], PAL['lgray'], PAL['orange'])
FX, FY, FW, FH = 8, 448, 480, 188         # la franja del diagrama
T = {'es': {'pantalla': 'PANTALLA', 'largo': 'LARGO', 'cabeza': 'CABEZA', 'entra': 'ENTRA', 'sale': 'SALE', 'cuadro': 'CUADRO',
            'tarde': 'TARDE', 'pronto': 'PRONTO', 'ticks': 'TICKS', 'mueve': 'SE MUEVE', 'libres': 'LIBRES', 'libre': 'LIBRE',
            'ocupada': 'OCUPADA', 'fuera': 'FUERA', 'fruta': 'FRUTA', 'con': 'CON PIXELATED', 'sin': 'SIN ÉL', 'puntos': 'PUNTOS',
            'cada': 'CADA', 'cola': 'LA COLA', 'sevan': 'SE VA AL MISMO TIEMPO', 'vive': 'SIGUE VIVA', 'muere': 'FIN DEL JUEGO',
            'mide': 'MIDE 4', 'casilla': 'CASILLA', 'pixel': 'PÍXEL'},
     'en': {'pantalla': 'SCREEN', 'largo': 'LENGTH', 'cabeza': 'HEAD', 'entra': 'IN', 'sale': 'OUT', 'cuadro': 'FRAME',
            'tarde': 'LATE', 'pronto': 'EARLY', 'ticks': 'TICKS', 'mueve': 'IT MOVES', 'libres': 'FREE', 'libre': 'FREE',
            'ocupada': 'TAKEN', 'fuera': 'OUTSIDE', 'fruta': 'FRUIT', 'con': 'WITH PIXELATED', 'sin': 'WITHOUT', 'puntos': 'POINTS',
            'cada': 'EVERY', 'cola': 'THE TAIL', 'sevan': 'LEAVES ON THE SAME STEP', 'vive': 'STILL ALIVE', 'muere': 'GAME OVER',
            'mide': 'LENGTH 4', 'casilla': 'CELL', 'pixel': 'PIXEL'}}


def pega(im, img, k, ox, oy):
    """La pantalla del juego a escala entera, con su marco."""
    d = ImageDraw.Draw(im)
    d.rectangle([ox - 4, oy - 4, ox + 160 * k + 3, oy + 192 * k + 3], fill=PAL['dgray'])
    im.paste(img.resize((160 * k, 192 * k), Image.NEAREST), (ox, oy))


def grande(im, d, x):
    pega(im, x['img'], 3, 8, 56)


def chica(im, x):
    """La pantalla a 2x; devuelve dónde cae una casilla."""
    pega(im, x['img'], 2, 88, 54)
    return lambda cx, cy: (88 + cx * 20, 54 + 32 + cy * 20)


def casilla(d, p, lado=20, color=BLANCO, ancho=2, relleno=None):
    d.rectangle([p[0], p[1], p[0] + lado - 1, p[1] + lado - 1], outline=color, width=ancho, fill=relleno)


def rejilla(im, p, color=atari(9, 2)):
    d = ImageDraw.Draw(im)
    for c in range(17):
        d.line([p(c, 0), p(c, 17)], fill=color)
    for f in range(18):
        d.line([p(0, f), p(16, f)], fill=color)


def nada(im, d, x):
    pega(im, Image.new('RGB', (160, 192)), 3, 8, 56)


def archivos(im, d, x):
    """Los cinco archivos y qué hace cada uno; el del que se habla, en color (datos: [(nombre, qué hace)], cuál)."""
    lista, cual = x['datos'][0][x['lang']], x['datos'][1]
    for i, (nombre, hace) in enumerate(lista):
        if x['datos'][1] == 0 and x['u'] < i * 0.09:
            break
        y = 64 + i * 116; on = i == cual
        d.rectangle([32, y, 463, y + 91], fill=atari(9, 1) if on else OSCURO, outline=CIAN if on else atari(9, 3), width=4)
        texto(im, 56, y + 18, nombre, BLANCO if on else GRIS, 3); texto(im, 56, y + 58, hace, AMAR if on else atari(9, 5), 2)


def medidas(im, d, x):
    """La pantalla vacía con sus medidas."""
    o = Image.new('RGB', (160, 192), (16, 16, 24)); pega(im, o, 2, 112, 84)
    d.line([(112, 70), (431, 70)], fill=CIAN, width=3)
    for q in (112, 429):
        d.line([(q, 62), (q, 78)], fill=CIAN, width=3)
    d.rectangle([236, 58, 308, 82], fill=NEGRO); texto(im, 272, 58, '160', CIAN, 3, 'm')
    d.line([(96, 84), (96, 467)], fill=CIAN, width=3)
    for q in (84, 466):
        d.line([(88, q), (104, q)], fill=CIAN, width=3)
    d.rectangle([60, 262, 132, 288], fill=NEGRO); texto(im, 96, 264, '192', CIAN, 3, 'm')
    if x['u'] > 0.55:
        texto(im, FX + FW // 2, 512, 'x 3', AMAR, 5, 'm')
        texto(im, FX + FW // 2, 576, '480 x 576', BLANCO, 3, 'm')


def borroso(im, d, x):
    """Lo mismo agrandado con y sin pixelated."""
    chico = Image.new('RGB', (26, 18)); q = ImageDraw.Draw(chico)
    for i, c in enumerate((VERDE, VERDE, VERDEC)):
        q.rectangle([2 + i * 6, 9, 7 + i * 6, 14], fill=c)
    q.rectangle([18, 3, 21, 6], fill=ROJO)
    for k, (nombre, filtro, y) in enumerate((('con', Image.NEAREST, 92), ('sin', Image.BICUBIC, 380))):
        if k and x['u'] < 0.42:
            break
        texto(im, 248, y - 32, T[x['lang']][nombre], VERDEC if not k else ROJO, 3, 'm')
        g = chico.resize((26 * 15, 18 * 12), filtro)
        d.rectangle([49, y - 3, 49 + 26 * 15 + 5, y + 18 * 12 + 2], fill=PAL['dgray']); im.paste(g, (52, y))


def rectangulo(im, d, x):
    """rect(x, y, w, h, color) o, con «todo», el de la pantalla entera."""
    o = Image.new('RGB', (160, 192), (16, 16, 24)); q = ImageDraw.Draw(o)
    todo = x['datos'] and x['datos'][0] == 'todo'
    if todo:
        q.rectangle([0, 0, 159, round(191 * min(1, x['u'] * 2.5))], fill=atari(11, 2))
    else:
        q.rectangle([50, 70, 109, 109], fill=VERDE)
    pega(im, o, 2, 88, 54)
    X, Y, w, h = (88, 54, 320, 384) if todo else (188, 194, 120, 80)
    d.rectangle([X - 5, Y - 5, X + 5, Y + 5], fill=AMAR)
    texto(im, X + (14 if todo else -12), Y + (14 if todo else -36), 'x,y', AMAR, 3, 'l' if todo else 'm')
    if todo:
        texto(im, 248, 300, 'w = VW', CIAN, 3, 'm'); texto(im, 248, 340, 'h = VH', CIAN, 3, 'm')
    else:
        d.line([(X, Y + h + 12), (X + w, Y + h + 12)], fill=CIAN, width=3); texto(im, X + w // 2, Y + h + 24, 'w', CIAN, 3, 'm')
        d.line([(X + w + 12, Y), (X + w + 12, Y + h)], fill=CIAN, width=3); texto(im, X + w + 24, Y + h // 2 - 12, 'h', CIAN, 3)
        texto(im, X + w // 2, Y + h // 2 - 12, 'color', mezcla(VERDE, NEGRO, 0.75), 2, 'm')
    texto(im, 248, 500, 'clear(color)' if todo else 'rect(x, y, w, h,', BLANCO, 3, 'm')
    if not todo:
        texto(im, 248, 540, 'color)', BLANCO, 3, 'm')


def paleta(im, d, x):
    nombres = ['black', 'dgray', 'white', 'yellow', 'red', 'green', 'lgreen']
    for i, n in enumerate(nombres):
        if x['u'] < 0.06 + i * 0.1:
            break
        y = 66 + i * 80
        d.rectangle([40, y, 40 + 95, y + 59], fill=PAL[n] if n != 'black' else NEGRO, outline=GRIS, width=3)
        texto(im, 164, y + 20, n, BLANCO, 3)


def cuentas(im, d, x, lineas):
    """Renglones de cuentas en la franja, cada uno desde su fracción."""
    y = FY + 6
    for s, desde in lineas:
        if x['u'] >= desde:
            texto(im, 248, y + 14, s, AMAR if x['u'] - desde < 0.12 else BLANCO, 3, 'm')
        y += 60


def panel_rejilla(im, d, x):
    """El tablero y sus casillas; con 'hud', la franja del marcador."""
    p = chica(im, x)
    if len(x['datos']) > 1 and x['datos'][1] == 'hud':
        d.rectangle([88, 54, 407, 85], fill=PAL['dgray']); texto(im, 248, 62, 'HUD 16', BLANCO, 2, 'm')
    rejilla(im, p, atari(9, 3))
    u = min(1, x['tt'] / 1.2)
    for c in range(round(16 * u)):   # la primera fila y la primera columna
        casilla(d, p(c, 0), color=CIAN, ancho=1)
    for f in range(round(17 * u)):
        casilla(d, p(0, f), color=CIAN, ancho=1)
    cuentas(im, d, x, x['datos'][0])


def panel_casilla(im, d, x):
    p = chica(im, x); cx, cy = x['datos'][0]; t = T[x['lang']]
    d.rectangle([88, 54, 407, 85], fill=PAL['dgray'])
    rejilla(im, p, atari(9, 3))
    if x['u'] < 0.75 or int(x['tt'] * 4) % 2 == 0:
        casilla(d, p(cx, cy), relleno=VERDEC, color=BLANCO)
    a, b = p(cx, cy)
    for q in range(88, a, 8):
        d.line([(q, b + 10), (q + 3, b + 10)], fill=AMAR, width=2)
    for q in range(54, b, 8):
        d.line([(a + 10, q), (a + 10, q + 3)], fill=AMAR, width=2)
    texto(im, 248, FY + 6, f"{t['casilla']} ({cx}, {cy})", CIAN, 3, 'm')
    if x['u'] > 0.12:
        texto(im, 248, FY + 54, f'x = {cx} x 10 = {cx * 10}', BLANCO, 3, 'm')
    if x['u'] > 0.35:
        texto(im, 248, FY + 96, f'y = {cy} x 10 + 16 = {cy * 10 + 16}', BLANCO, 2 if len(f'y = {cy} x 10 + 16 = {cy * 10 + 16}') > 19 else 3, 'm')
    if x['u'] > 0.72:
        texto(im, 248, FY + 144, f"{t['pixel']} ({cx * 10}, {cy * 10 + 16})", AMAR, 3, 'm')


def caja(d, im, X, Y, w, h, s, color, abajo=None):
    d.rectangle([X, Y, X + w - 1, Y + h - 1], fill=mezcla(color, NEGRO, 0.35), outline=color, width=4)
    k = 3 if len(s) <= 4 else 2
    texto(im, X + w // 2, Y + h // 2 - 4 * k, s, BLANCO, k, 'm')
    if abajo is not None:
        texto(im, X + w // 2, Y + h + 10, abajo, GRIS, 2, 'm')


def panel_lista(im, d, x):
    """El cuerpo como lista de casillas; cuando cambia, la cabeza entra por la izquierda y la cola sale por la derecha."""
    datos = x['datos'] or (); t = T[x['lang']]
    if datos:   # la lista que dice el guion o, con {'pasos': [(fracción, lista)]}, cómo va cambiando
        if isinstance(datos[0], dict):
            vistos = [(f, l) for f, l in datos[0]['pasos'] if x['u'] >= f]
            cuerpo = [tuple(c) for c in vistos[-1][1]]
            previo = [tuple(c) for c in vistos[-2][1]] if len(vistos) > 1 else None
            paso = x['tt'] - vistos[-1][0] * x['tt'] / max(1e-6, x['u'])
            x = dict(x, e={})
        else:
            cuerpo, previo, paso = [tuple(c) for c in datos[0]], None, 9
        pega(im, x['img'] if x['e'].get('body') else Image.new('RGB', (160, 192)), 2, 88, 54)
        p = lambda cx, cy: (88 + cx * 20, 54 + 32 + cy * 20)
        rejilla(im, p, atari(9, 1))
        for i, c in enumerate(cuerpo):
            casilla(d, p(*c), color=BLANCO if i == 0 else VERDE, ancho=2, relleno=None if datos[-1] != 'dir' and not isinstance(datos[0], dict) else (VERDEC if i == 0 else VERDE))
        if datos[-1] == 'dir' and cuerpo:
            X, Y = p(cuerpo[0][0] + 1, cuerpo[0][1]); texto(im, X + 4 + 4 * (int(x['tt'] * 3) % 2), Y + 2, '▶', AMAR, 2)
    else:
        chica(im, x)
        cuerpo = [(b['x'], b['y']) for b in x['e'].get('body', [])]
        previo, paso = x['antes'], x['paso']
    n = len(cuerpo)
    texto(im, FX + 4, FY, 'body', CIAN, 3)
    if n:
        texto(im, FX + FW - 4, FY + 4, f"{t['largo']} {n}", BLANCO, 2, 'r')
    tira = Image.new('RGB', (FW, 140), NEGRO); q = ImageDraw.Draw(tira)
    w, h, hueco = 108, 64, 16
    a = R.suave(min(1, paso / 0.4))
    salio = bool(previo) and cuerpo == previo[:-1]             # sólo el pop
    movio = bool(previo) and paso < 0.4 and n >= len(previo)
    crecio = bool(previo) and n > len(previo)
    for i, c in enumerate(cuerpo[:5]):
        ix = i - 1 + a if movio else i
        color = VERDEC if i == 0 else VERDE
        if i == 0 and movio and a < 1:
            color = AMAR
        caja(q, tira, round(ix * (w + hueco)), 4, w, h, f'{c[0]},{c[1]}', color, f'[{i}]' if not movio else None)
    if (movio and not crecio or salio and paso < 0.4) and previo and len(previo) <= 4:   # la que sale
        i = len(previo) - 1; c = previo[-1]
        caja(q, tira, round((i + (0 if salio else a)) * (w + hueco)), 4 + round(60 * a), w, h, f'{c[0]},{c[1]}', mezcla(ROJO, NEGRO, 0.6 * a))
    im.paste(tira, (FX, FY + 36))
    dura = 1.6 if datos else 0.4   # en la del guion el rótulo se queda más
    if previo and paso < dura and n >= len(previo):
        texto(im, FX + 4, FY + 156, t['entra'], AMAR, 2)
    if previo and paso < dura and not crecio:
        texto(im, FX + FW - 4, FY + 156, t['sale'], ROJO, 2, 'r')
    if datos and datos[-1] == 'dir':
        texto(im, FX + 4, FY + 152, 'dir = { x: 1, y: 0 }', AMAR, 2)


def panel_acumulador(im, d, x):
    """El tiempo que se junta y los ticks que salen. Con una lista de milisegundos, cuadro por cuadro."""
    t = T[x['lang']]; dts = x['datos'][0] if x['datos'] else []
    tick = 1000 / 30; total = 400; esc = total / 70
    X0, Y0 = 48, 250
    acc, ticks, dt, hizo, f = 0.0, 0, None, 0, 1
    if dts:
        pos = min(len(dts) - 1e-6, x['u'] * (len(dts) + 0.4)); i = int(pos); f = pos - i
        for k in range(i):
            acc += dts[k]
            while acc >= tick - 1e-9:
                acc -= tick; ticks += 1
        dt = dts[i]; lleno = acc + dt * min(1, f / 0.45)
        if f > 0.6:
            lleno = acc + dt
            while lleno >= tick - 1e-9:
                lleno -= tick; ticks += 1; hizo += 1
        acc = lleno
    else:   # en ciclo, a 60 cuadros por segundo pero despacio
        pos = x['tt'] / 0.8; i = int(pos); f = pos - i
        acc = (i % 2) * 16.7 + 16.7 * min(1, f / 0.5); ticks = i // 2
        if i % 2 and f > 0.6:
            acc = 0.0; ticks += 1; hizo = 1
    texto(im, 248, 72, 'acc', CIAN, 5, 'm')
    if dt is not None:
        tono = ROJO if dt > 40 else AMAR if dt < 12 else GRISC
        texto(im, 248, 136, f"{t['cuadro']} {dt:g} ms" + (f" {t['tarde']}" if dt > 40 else f" {t['pronto']}" if dt < 12 else ''), tono, 2, 'm')
    d.rectangle([X0 - 4, Y0 - 4, X0 + total + 4, Y0 + 74], outline=GRIS, width=4)
    d.rectangle([X0, Y0, X0 + round(min(70, acc) * esc), Y0 + 70], fill=CIAN)
    m = X0 + round(tick * esc)
    d.line([(m, Y0 - 34), (m, Y0 + 92)], fill=AMAR, width=4)
    texto(im, m, Y0 - 60, 'TICK_MS', AMAR, 2, 'm')
    texto(im, 248, Y0 + 100, f'{acc:.1f} ms', BLANCO, 3, 'm')
    if hizo and f > 0.6:
        texto(im, 248, Y0 + 166, 'TICK!' if hizo == 1 else 'TICK! TICK!', VERDEC, 4, 'm')
    texto(im, 248, Y0 + 250, f"{t['ticks']}: {ticks}", BLANCO, 4, 'm')


def panel_ticks(im, d, x):
    chica(im, x); t = T[x['lang']]
    tick, n = x['e'].get('tick'), x['e'].get('interval', 8)
    if tick is None:
        tick = int(x['tt'] * 5)
    r = tick % n
    for i in range(8):
        v = (i + 1) % 8
        X = FX + 4 + i * 60; on = v == r and tick > 0
        col = VERDEC if v == 0 else CIAN
        d.rectangle([X, FY + 4, X + 51, FY + 55], fill=col if on else mezcla(col, NEGRO, 0.8), outline=col, width=3)
        texto(im, X + 26, FY + 18, str(v), NEGRO if on else col, 3, 'm')
    texto(im, 248, FY + 84, f'{tick} % 8 = {r}', BLANCO, 4, 'm')
    if r == 0 and tick > 0:
        texto(im, 248, FY + 142, t['mueve'], VERDEC, 4, 'm')


FLECHAS = [(8, '▶'), (4, '◀'), (2, '▼'), (1, '▲')]


def panel_bits(im, d, x):
    """Los cuatro bits del control: prendidos según el guion o según lo que está apretado."""
    datos = x['datos']
    if datos:   # las cuatro teclas, en grande
        m = 0
        for desde, v in datos[0]:
            if x['u'] >= desde:
                m = v
        for v, f, X, Y in ((1, '▲', 248, 80), (4, '◀', 116, 222), (2, '▼', 248, 222), (8, '▶', 380, 222)):
            on = bool(m & v)
            d.rectangle([X - 60, Y, X + 59, Y + 125], fill=AMAR if on else OSCURO, outline=AMAR if on else GRIS, width=5)
            d.rectangle([X - 60, Y + 108, X + 59, Y + 125], fill=mezcla(AMAR if on else GRIS, NEGRO, 0.45))
            texto(im, X, Y + 18, f, NEGRO if on else GRISC, 4, 'm'); texto(im, X, Y + 66, str(v), NEGRO if on else GRIS, 4, 'm')
    else:
        chica(im, x)
        m = x['e'].get('held', 0)
    for i, (v, f) in enumerate(FLECHAS):
        X = FX + 4 + i * 120; on = bool(m & v)
        d.rectangle([X, FY, X + 107, FY + 91], fill=AMAR if on else OSCURO, outline=AMAR if on else GRIS, width=4)
        texto(im, X + 30, FY + 34, f, NEGRO if on else GRIS, 3, 'm')
        texto(im, X + 76, FY + 34, str(v), NEGRO if on else GRISC, 3, 'm')
        texto(im, X + 54, FY + 102, '1' if on else '0', AMAR if on else GRIS, 3, 'm')
    texto(im, 248, FY + 146, f'mask = {m}', BLANCO, 4, 'm')


def panel_libres(im, d, x):
    """Las casillas libres (puntos), con la que se elige, o una prueba de isFree en tres casillas."""
    p = chica(im, x); t = T[x['lang']]; modo = x['datos'][0] if x['datos'] else None
    cuerpo = [(8, 8), (7, 8), (6, 8)]
    d.rectangle([88, 86, 407, 425], fill=NEGRO); rejilla(im, p, atari(9, 1))
    for i, c in enumerate(cuerpo):
        casilla(d, p(*c), color=VERDEC if i == 0 else VERDE, relleno=VERDEC if i == 0 else VERDE)
    if modo == 'prueba':
        casos = [((11, 4), 'libre', VERDEC, 0.05, 'true'), ((7, 8), 'ocupada', ROJO, 0.4, 'false'), ((15, 12), 'fuera', ROJO, 0.7, 'false')]
        ult = None
        for (c, nombre, col, desde, r) in casos:
            if x['u'] >= desde:
                q = p(*c) if nombre != 'fuera' else p(16, 12)
                casilla(d, q, color=col, ancho=3); ult = (c if nombre != 'fuera' else (16, 12), nombre, col, r)
        if not ult:
            return
        c, nombre, col, r = ult
        texto(im, 248, FY + 14, f'isFree({c[0]}, {c[1]})', BLANCO, 3, 'm'); texto(im, 248, FY + 64, r, col, 4, 'm')
        texto(im, 248, FY + 122, t[nombre], col, 3, 'm')
        return
    total = 16 * 17 - len(cuerpo); hasta = round(total * min(1, x['u'] / 0.7)) if modo is None else total; k = 0
    elegida = (12, 5); elige = modo == 'elige' and x['u'] > 0.12
    for f in range(17):
        for c in range(16):
            if (c, f) in cuerpo:
                continue
            k += 1
            if k > hasta:
                break
            X, Y = p(c, f)
            d.rectangle([X + 8, Y + 8, X + 11, Y + 11], fill=CIAN if not elige else atari(11, 2))
    if elige:
        X, Y = p(*elegida)
        if int(x['tt'] * 4) % 2 == 0 or x['u'] > 0.5:
            d.rectangle([X + 2, Y + 2, X + 17, Y + 17], fill=ROJO)
        texto(im, X + 10, Y - 24, t['fruta'], ROJO, 2, 'm')
    texto(im, 248, FY + 20, str(min(hasta, total)), CIAN, 8, 'm'); texto(im, 248, FY + 104, t['libres'], GRISC, 3, 'm')
    if elige and x['u'] > 0.5:
        texto(im, 248, FY + 148, '16 x 17 - 3 = 269', BLANCO, 2, 'm')


def panel_puntos(im, d, x):
    """Lo que vale una fruta según lo rápido que va."""
    t = T[x['lang']]
    texto(im, 60, 72, t['cada'], GRIS, 3); texto(im, 440, 72, t['puntos'], GRIS, 3, 'r')
    for i, n in enumerate((8, 7, 6, 5, 4, 3)):
        if x['u'] < 0.04 + i * 0.1:
            break
        y = 126 + i * 78; v = 10 + (8 - n) * 5
        d.rectangle([40, y, 40 + 64 * 1, y + 51], outline=CIAN, width=3); texto(im, 72, y + 14, str(n), CIAN, 3, 'm')
        d.rectangle([130, y + 12, 130 + v * 5, y + 39], fill=mezcla(VERDE, AMAR, i / 5))
        texto(im, 440, y + 10, str(v), BLANCO, 4, 'r')


def panel_letra(im, d, x):
    """Una letra de 3x5 en grande con sus unos y ceros, o la palabra entera en la franja."""
    from snake1 import FUENTE
    s = x['datos'][0]
    if len(s) == 1:
        g = FUENTE[s]; L = 72
        for f in range(5):
            for c in range(3):
                X, Y = 40 + c * (L + 6), 92 + f * (L + 6); on = g[f][c] == '1'
                visto = x['u'] * 22 > f * 3 + c
                d.rectangle([X, Y, X + L - 1, Y + L - 1], fill=(BLANCO if on and visto else OSCURO), outline=GRIS, width=2)
            texto(im, 320, 92 + f * (L + 6) + 20, "'" + g[f] + "'", AMAR if x['u'] * 22 > f * 3 else GRIS, 4)
        texto(im, 248, 520, f"'{s}' = 3 x 5", CIAN, 4, 'm')
        return
    k = 6; total = len(s) * 4; avance = min(total, int(x['u'] * total * 1.25)); ox = 248 - (total * k * 4) // 2 // 4 * 1
    o = Image.new('RGB', (total, 7)); q = o.load(); n = 0
    for i, ch in enumerate(s):
        for f in range(5):
            for c in range(3):
                if FUENTE[ch][f][c] == '1' and i * 4 + c <= avance:
                    q[i * 4 + c, f + 1] = BLANCO
    e = 23
    im.paste(o.resize((total * e, 7 * e), Image.NEAREST), (248 - total * e // 2, 150))
    for i in range(len(s) + 1):
        X = 248 - total * e // 2 + i * 4 * e
        d.line([(X, 140), (X, 150 + 7 * e + 12)], fill=atari(9, 4), width=2)
    if avance < total:
        X = 248 - total * e // 2 + avance * e; d.rectangle([X, 150, X + e - 1, 150 + 7 * e - 1], outline=AMAR, width=3)
    texto(im, 248, 372, '3 + 1 = 4', AMAR, 4, 'm')
    texto(im, 248, 440, 'x += 4', CIAN, 4, 'm')


def panel_cuadro(im, d, x):
    """La serpiente de cuatro en su cuadro de 2 x 2: la pantalla de cerca, con lo que pasa."""
    modo = x['datos'][0] if x['datos'] else None; t = T[x['lang']]; e = x['e']
    cerca = x['img'].crop((40, 66, 120, 136)).resize((80 * 6, 70 * 6), Image.NEAREST)   # columnas 4 a 11 y renglones 5 a 11
    d.rectangle([4, 52, 491, 479], fill=PAL['dgray']); im.paste(cerca, (8, 56))
    p = lambda cx, cy: (8 + (cx * 10 - 40) * 6, 56 + (16 + cy * 10 - 66) * 6)
    for c in range(4, 13):
        d.line([p(c, 5), (p(c, 5)[0], 475)], fill=atari(9, 1))
    for f in range(5, 13):
        d.line([(8, min(475, p(4, f)[1])), (487, min(475, p(4, f)[1]))], fill=atari(9, 1))
    cuerpo = [(b['x'], b['y']) for b in e.get('body', [])]
    for i, c in enumerate(cuerpo):
        X, Y = p(*c); texto(im, X + 30, Y + 18, str(i), mezcla(VERDE, NEGRO, 0.7), 3, 'm')
    if not modo and cuerpo:
        texto(im, 248, 500, t['mide'], BLANCO, 4, 'm')
        # el camino que quiere dar
        for k, c in enumerate([(8, 9), (7, 9), (7, 8), (8, 8)]):
            if int(x['tt'] * 4) % 4 == k:
                casilla(d, p(*c), 60, AMAR, 5)
    elif modo == 'muere':
        if e.get('over'):
            if int(x['tt'] * 5) % 2 == 0:
                casilla(d, p(*cuerpo[0]), 60, ROJO, 6)
            texto(im, 248, 506, t['muere'], ROJO, 4, 'm')
    elif modo == 'cola':
        if int(x['tt'] * 4) % 2 == 0:
            casilla(d, p(*cuerpo[-1]), 60, AMAR, 6)
        texto(im, 248, 494, t['cola'], AMAR, 4, 'm')
        X, Y = p(*cuerpo[0]); texto(im, X + 84, Y + 46, '▼', BLANCO, 3, 'm')      # la cabeza baja…
        X, Y = p(*cuerpo[-1]); texto(im, X - 2, Y + 70, '◀', AMAR, 3, 'm')        # …y la cola se va a la izquierda
        texto(im, 248, 556, t['sevan'], BLANCO, 2, 'm')
    elif modo == 'vive':
        texto(im, 248, 506, t['vive'], VERDEC, 4, 'm')


# el título del panel, cuando lo que se ve no es la pantalla del juego
TITULOS = {'es': {'archivos': 'LOS ARCHIVOS', 'medidas': 'EL CANVAS', 'borroso': 'AL AGRANDAR', 'rectangulo': 'EL PINCEL', 'paleta': 'LA PALETA', 'acumulador': 'EL RELOJ',
                  'puntos': 'LO QUE VALE UNA FRUTA', 'letra': 'LA FUENTE', 'bits': 'EL CONTROL', 'lista': 'LA LISTA', 'ticks': 'LOS TICKS',
                  'libres': 'LAS LIBRES', 'cuadro': 'DE CERCA', 'rejilla': 'LAS CASILLAS', 'casilla': 'DE CASILLA A PÍXEL'},
           'en': {'archivos': 'THE FILES', 'medidas': 'THE CANVAS', 'borroso': 'SCALED UP', 'rectangulo': 'THE BRUSH', 'paleta': 'THE PALETTE', 'acumulador': 'THE CLOCK',
                  'puntos': 'WHAT A FRUIT IS WORTH', 'letra': 'THE FONT', 'bits': 'THE CONTROLS', 'lista': 'THE LIST', 'ticks': 'THE TICKS',
                  'libres': 'THE FREE CELLS', 'cuadro': 'UP CLOSE', 'rejilla': 'THE CELLS', 'casilla': 'FROM CELL TO PIXEL'}}
PANELES = {None: grande, 'nada': nada, 'archivos': archivos, 'medidas': medidas, 'borroso': borroso, 'rectangulo': rectangulo, 'paleta': paleta,
           'rejilla': panel_rejilla, 'casilla': panel_casilla, 'lista': panel_lista, 'acumulador': panel_acumulador,
           'ticks': panel_ticks, 'bits': panel_bits, 'libres': panel_libres, 'puntos': panel_puntos, 'letra': panel_letra,
           'cuadro': panel_cuadro}
# los que cambian solos (hay que redibujarlos en cada cuadro); los demás, sólo cuando cambia la pantalla o el estado
ANIMADOS = {'archivos', 'medidas', 'borroso', 'rectangulo', 'paleta', 'rejilla', 'casilla', 'lista', 'acumulador', 'ticks', 'bits', 'libres',
            'puntos', 'letra', 'cuadro'}
