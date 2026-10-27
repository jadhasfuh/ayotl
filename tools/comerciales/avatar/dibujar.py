#!/usr/bin/env python3
"""LeIA, la presentadora de los vídeos de juegos (27-oct-2026). Adrián: «un avatar de una chica anime en 16
bits… caras diferentes para normal, sorpresa, enojo, tristeza»; de nombre «algo como leIA», y «que se parezca
lo más posible a Anna de jlptest: pelo negro y largo, ojos más pequeños» (jlptest/docs/libro/ilustraciones/
retrato-anna.png: pelo lacio con flequillo recto, lentes redondos, mirada tranquila de párpados caídos, cara
larga y cuello largo). Retrato de 64x64 hecho a mano con primitivas sin suavizar (como un sprite de SNES:
paleta corta, contorno oscuro), una imagen por cara en avatar/leia-<cara>.png. Sin animación de boca: en el
vídeo sólo cambia la cara según la frase.

Desde el 27-oct LeIA es la de la IA (generar-ia.py, a partir del retrato de Anna); esta versión hecha a mano
queda en avatar/mano/ por si hace falta sin API.

  python3 tools/comerciales/avatar/dibujar.py     (y avatar/muestra.png con todas, a 6x, para revisar)
"""
import os
from PIL import Image, ImageDraw

AQUI = os.path.dirname(os.path.abspath(__file__))
N = 64
P = {   # paleta
    'contorno': (22, 20, 30), 'piel': (250, 222, 204), 'piel2': (226, 184, 164), 'rubor': (246, 160, 170),
    'pelo': (28, 28, 40), 'pelo2': (54, 56, 82), 'pelo3': (92, 100, 150),
    'ojo': (36, 32, 48), 'brillo': (255, 255, 255), 'blanco': (246, 246, 250), 'lentes': (150, 156, 186),
    'ropa': (232, 232, 240), 'ropa2': (186, 186, 204),
    'boca': (168, 92, 104), 'lagrima': (130, 210, 255), 'vena': (220, 50, 70),
}


def base(d):
    """Lo que no cambia con la cara: pelo largo de atrás, ropa, cuello, cara, flequillo recto y lentes."""
    # pelo de atrás: una melena lacia que cae por los dos lados hasta abajo
    d.ellipse([12, 3, 51, 42], fill=P['pelo'])
    d.polygon([(12, 22), (21, 22), (22, 63), (9, 63)], fill=P['pelo'])
    d.polygon([(42, 22), (51, 22), (55, 63), (41, 63)], fill=P['pelo'])
    # ropa clara, como en el retrato de Anna, con el cuello abierto
    d.polygon([(4, 63), (12, 57), (25, 54), (32, 59), (39, 54), (52, 57), (60, 63)], fill=P['ropa'])
    d.line([(25, 54), (32, 59), (39, 54)], fill=P['ropa2'])
    d.polygon([(4, 63), (12, 57), (16, 63)], fill=P['ropa2']); d.polygon([(60, 63), (52, 57), (48, 63)], fill=P['ropa2'])
    # el pelo cae por delante de los hombros
    d.polygon([(13, 40), (21, 40), (22, 63), (11, 63)], fill=P['pelo'])
    d.polygon([(42, 40), (50, 40), (53, 63), (41, 63)], fill=P['pelo'])
    # cuello largo
    d.rectangle([28, 42, 35, 56], fill=P['piel']); d.rectangle([28, 44, 35, 46], fill=P['piel2'])
    # cara larga, con la barbilla en punta
    d.polygon([(19, 21), (44, 21), (44, 34), (40, 42), (34, 47), (29, 47), (23, 42), (19, 34)], fill=P['piel'])
    d.ellipse([19, 11, 44, 37], fill=P['piel'])
    d.line([(23, 42), (29, 47), (34, 47), (40, 42)], fill=P['piel2'])
    # flequillo recto a la altura de las cejas, con el borde un poco disparejo, y los mechones de los lados
    d.ellipse([15, 4, 48, 26], fill=P['pelo'])
    d.rectangle([16, 12, 47, 22], fill=P['pelo'])
    for x, y in ((17, 24), (20, 23), (24, 25), (27, 23), (31, 24), (35, 23), (38, 25), (42, 23), (45, 24)):
        d.line([(x, 22), (x, y)], fill=P['pelo']); d.line([(x + 1, 22), (x + 1, y - 1)], fill=P['pelo'])
    d.polygon([(16, 18), (21, 20), (21, 36), (19, 44), (16, 42)], fill=P['pelo'])
    d.polygon([(47, 18), (42, 20), (42, 36), (44, 44), (47, 42)], fill=P['pelo'])
    for x in (23, 30, 37):   # brillo del pelo negro
        d.line([(x, 8), (x + 4, 7)], fill=P['pelo3'])
    d.line([(26, 15), (26, 19)], fill=P['pelo2']); d.line([(37, 14), (37, 18)], fill=P['pelo2'])
    # nariz
    d.point([(32, 35), (32, 36)], fill=P['piel2'])


def lentes(d):
    """Los lentes redondos y finos de Anna, encima de los ojos."""
    for cx in (26, 38):
        d.ellipse([cx - 5, 25, cx + 5, 35], outline=P['lentes'])
    d.line([(31, 29), (33, 29)], fill=P['lentes'])
    d.line([(20, 29), (21, 29)], fill=P['lentes']); d.line([(43, 29), (44, 29)], fill=P['lentes'])


def ojo(d, cx, forma, mira=(0, 0)):
    """Un ojo pequeño en x=cx (fila 30). formas: tranquilo (párpado caído), abierto, cerrado (^), entrecerrado,
    triste, guino."""
    y = 30
    if forma in ('cerrado', 'guino'):
        d.line([(cx - 3, y + 1), (cx - 1, y - 1), (cx + 1, y - 1), (cx + 3, y + 1)], fill=P['contorno']); return
    if forma == 'abierto':     # sorpresa: redondo, con blanco alrededor
        d.rectangle([cx - 2, y - 2, cx + 2, y + 2], fill=P['blanco'])
        d.rectangle([cx - 1 + mira[0], y - 1, cx + mira[0], y + 1], fill=P['ojo'])
        d.line([(cx - 3, y - 3), (cx + 3, y - 3)], fill=P['contorno']); return
    # tranquilo / entrecerrado / triste: el párpado cae sobre un ojo oscuro de 2 de alto
    alto = {'tranquilo': 2, 'entrecerrado': 1, 'triste': 2}[forma]
    d.rectangle([cx - 2, y, cx + 2, y + alto - 1], fill=P['blanco'])
    d.rectangle([cx - 1 + mira[0], y, cx + 1 + mira[0], y + alto - 1], fill=P['ojo'])
    if forma == 'tranquilo':
        d.point([(cx + mira[0], y)], fill=P['brillo'])
    afuera = -1 if cx < 32 else 1
    if forma == 'triste':      # el párpado baja hacia fuera
        d.line([(cx - 3 * afuera, y - 1), (cx + 3 * afuera, y)], fill=P['contorno'])
    else:
        d.line([(cx - 3, y - 1), (cx + 3, y - 1)], fill=P['contorno'])
        d.point([(cx + 3 * afuera, y)], fill=P['contorno'])   # el rabito del párpado caído


def cejas(d, tipo):
    """Asoman bajo el flequillo (fila 25) sólo cuando la cara las necesita."""
    y = 25
    for cx, lado in ((26, -1), (38, 1)):
        if tipo == 'arriba':
            d.line([(cx - 2, y - 1), (cx + 2, y - 1)], fill=P['pelo2'])
        elif tipo == 'enojo':      # bajan hacia el centro
            d.line([(cx - 3, y - 1 if lado < 0 else y + 1), (cx + 3, y + 1 if lado < 0 else y - 1)], fill=P['contorno'])
        elif tipo == 'triste':     # suben hacia el centro
            d.line([(cx - 3, y + 1 if lado < 0 else y - 1), (cx + 3, y - 1 if lado < 0 else y + 1)], fill=P['pelo2'])


def boca(d, tipo):
    cx, y = 32, 41
    if tipo == 'neutra':
        d.line([(cx - 2, y), (cx + 1, y)], fill=P['boca'])
    elif tipo == 'sonrisa':
        d.line([(cx - 2, y), (cx - 1, y + 1), (cx + 1, y + 1), (cx + 2, y)], fill=P['boca'])
    elif tipo == 'risa':
        d.polygon([(cx - 3, y - 1), (cx + 3, y - 1), (cx + 1, y + 2), (cx - 1, y + 2)], fill=P['boca'])
    elif tipo == 'o':
        d.rectangle([cx - 1, y - 1, cx + 1, y + 1], fill=P['boca'])
    elif tipo == 'enojo':
        d.line([(cx - 2, y + 1), (cx - 1, y), (cx + 1, y), (cx + 2, y + 1)], fill=P['boca'])
    elif tipo == 'triste':
        d.line([(cx - 2, y + 1), (cx - 1, y), (cx + 1, y), (cx + 2, y + 1)], fill=P['boca'])
        d.point([(cx + 3, y + 1)], fill=P['boca'])
    elif tipo == 'lado':       # media sonrisa
        d.line([(cx - 2, y), (cx + 1, y), (cx + 2, y - 1)], fill=P['boca'])


def rubor(d):
    for x0 in (21, 39):
        d.line([(x0, 37), (x0 + 3, 37)], fill=P['rubor'])


CARAS = {
    'normal':   dict(ojos=('tranquilo', 'tranquilo'), cejas=None, boca='lado'),
    'feliz':    dict(ojos=('cerrado', 'cerrado'), cejas='arriba', boca='risa', rubor=True),
    'sorpresa': dict(ojos=('abierto', 'abierto'), cejas='arriba', boca='o'),
    'enojo':    dict(ojos=('entrecerrado', 'entrecerrado'), cejas='enojo', boca='enojo', vena=True),
    'triste':   dict(ojos=('triste', 'triste'), cejas='triste', boca='triste', lagrima=True),
    'pensando': dict(ojos=('tranquilo', 'tranquilo'), mira=(1, 0), cejas=None, boca='neutra', gota=True),
    'guino':    dict(ojos=('tranquilo', 'guino'), cejas=None, boca='sonrisa', rubor=True),
}


def cara(nombre):
    c = CARAS[nombre]
    im = Image.new('RGBA', (N, N), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    base(d)
    if c.get('cejas'):
        cejas(d, c['cejas'])
    for cx, forma in zip((26, 38), c['ojos']):
        ojo(d, cx, forma, c.get('mira', (0, 0)))
    lentes(d)
    if c.get('rubor'):
        rubor(d)
    boca(d, c['boca'])
    if c.get('vena'):     # la venita del enojo, sobre el flequillo
        for dx, dy in ((0, 0), (2, 0), (0, 2), (2, 2)):
            d.line([(44 + dx, 8 + dy), (45 + dx, 9 + dy)], fill=P['vena'])
    if c.get('lagrima'):
        d.polygon([(22, 34), (23, 34), (24, 37), (23, 38), (22, 38), (21, 37)], fill=P['lagrima'])
    if c.get('gota'):     # la gotita de sudor de «a ver…»
        d.polygon([(46, 14), (47, 14), (49, 18), (47, 20), (45, 18)], fill=P['lagrima'])
    # contorno de 1 px por fuera de la silueta
    a = im.getchannel('A'); borde = Image.new('RGBA', (N, N), (0, 0, 0, 0)); bd = borde.load(); px = a.load()
    for y in range(N):
        for x in range(N):
            if px[x, y] == 0 and any(0 <= x + i < N and 0 <= y + j < N and px[x + i, y + j] for i, j in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                bd[x, y] = (*P['contorno'], 255)
    borde.alpha_composite(im)
    return borde


if __name__ == '__main__':
    caras = list(CARAS)
    muestra = Image.new('RGBA', (len(caras) * (N * 6 + 12), N * 6), (24, 28, 60, 255))
    for i, nombre in enumerate(caras):
        os.makedirs(os.path.join(AQUI, 'mano'), exist_ok=True)
        im = cara(nombre); im.save(os.path.join(AQUI, 'mano', f'leia-{nombre}.png'))
        muestra.alpha_composite(im.resize((N * 6, N * 6), Image.NEAREST), (i * (N * 6 + 12), 0))
    muestra.save(os.path.join(AQUI, 'mano', 'muestra.png'))
    print('caras:', ', '.join(caras))
