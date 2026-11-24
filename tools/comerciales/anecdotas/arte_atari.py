#!/usr/bin/env python3
"""Las escenas pixel de la primera anécdota de TI (Atari y el entierro de 1983), dibujadas aquí con código: nada de
logotipos, carátulas ni fotos. Lienzos de 150x150 a 5x (750x750), con las herramientas de lo-conoces/arte_sweet_home.py.
Lo único escrito dentro de los dibujos son años y cifras, para que sirvan en los dos idiomas.

  "/Users/jadhasfuh/Documents/code challenge/.venv/bin/python" tools/comerciales/anecdotas/arte_atari.py
"""
import os, random, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(AQUI), 'lo-conoces'))
import arte_sweet_home as b
from arte_sweet_home import lienzo, guardar, texto, NEGRO, T

b.SALIDA = os.path.join(AQUI, 'atari')
ARENA, ARENA2, ARENA3 = (206, 162, 96), (176, 132, 74), (138, 100, 58)
CREMA, GRIS, PLATA, ORO, ROJO = (236, 230, 206), (154, 154, 168), (206, 210, 224), (240, 200, 80), (214, 60, 48)
MADERA, MADERA2 = (126, 78, 40), (96, 58, 30)
COLORES = ((214, 60, 48), (70, 120, 200), (240, 170, 50), (90, 170, 90), (180, 90, 180), (220, 120, 60))


def atardecer(d, suelo=104):
    for y0, c in ((0, (92, 62, 120)), (26, (170, 86, 110)), (50, (230, 130, 96)), (72, (248, 182, 112))):
        d.rectangle([0, y0, T, T], fill=c)
    d.ellipse([104, 50, 130, 76], fill=(255, 226, 150))
    d.polygon([(0, suelo), (0, 86), (18, 74), (34, 86), (52, 70), (74, 88), (96, 78), (118, 90), (150, 76), (150, suelo)], fill=(110, 66, 96))   # la sierra
    d.rectangle([0, suelo, T, T], fill=ARENA)
    r = random.Random(4)
    for _ in range(90):
        x, y = r.randrange(T), r.randrange(suelo + 2, T); d.line([(x, y), (x + r.randrange(1, 5), y)], fill=r.choice((ARENA2, ARENA3)))


def cartucho(d, x, y, color=ROJO, gastado=False, esc=1):
    """Un cartucho genérico: la caja negra con su etiqueta de color."""
    an, al = 15 * esc, 18 * esc
    d.rectangle([x, y, x + an, y + al], fill=(34, 32, 38)); d.rectangle([x, y, x + an, y + esc], fill=(70, 68, 78))
    d.rectangle([x + 2 * esc, y + 4 * esc, x + an - 2 * esc, y + al - 4 * esc], fill=color)
    d.rectangle([x + 2 * esc, y + 4 * esc, x + an - 2 * esc, y + 6 * esc], fill=CREMA)
    for i in range(3):
        d.rectangle([x + (3 + 4 * i) * esc, y + al - 2 * esc, x + (4 + 4 * i) * esc + esc, y + al - esc], fill=(70, 68, 78))
    if gastado:
        r = random.Random(x * 31 + y)
        for _ in range(9 * esc):
            px, py = x + r.randrange(an), y + r.randrange(al); d.rectangle([px, py, px + esc, py + esc // 2], fill=r.choice((ARENA2, ARENA3, (90, 84, 76))))


def camion(d, x, y, color, e=1.0):
    """Un tráiler visto de lado, con el piso en y."""
    k = lambda v: round(v * e)
    d.rectangle([x, y - k(30), x + k(48), y - k(6)], fill=(226, 222, 212), outline=(120, 116, 112))
    for i in range(1, 6):
        d.line([(x + k(8 * i), y - k(29)), (x + k(8 * i), y - k(7))], fill=(198, 192, 182))
    d.rectangle([x + k(50), y - k(24), x + k(66), y - k(6)], fill=color); d.rectangle([x + k(57), y - k(22), x + k(64), y - k(14)], fill=(170, 210, 230))
    d.rectangle([x + k(66), y - k(12), x + k(69), y - k(6)], fill=color); d.rectangle([x + k(52), y - k(34), x + k(54), y - k(24)], fill=GRIS)
    d.rectangle([x, y - k(6), x + k(68), y - k(4)], fill=(60, 58, 64))
    for cx in (8, 17, 40, 56, 63):
        d.ellipse([x + k(cx) - k(4), y - k(8), x + k(cx) + k(4), y], fill=(24, 24, 28)); d.ellipse([x + k(cx) - k(1), y - k(5), x + k(cx) + k(1), y - k(3)], fill=GRIS)


def escena_camiones():
    im, d = lienzo((0, 0, 0)); atardecer(d, 96)
    camion(d, 76, 108, (60, 110, 180), .62); camion(d, 20, 122, (200, 150, 50), .8); camion(d, 62, 146, ROJO, 1.12)
    for x, y in ((6, 120), (10, 116), (46, 142), (52, 138), (56, 143)):   # el polvo
        d.ellipse([x, y, x + 6, y + 4], fill=(224, 188, 132))
    d.rectangle([8, 84, 10, 100], fill=(90, 60, 40)); d.rectangle([0, 76, 28, 86], fill=(70, 120, 70), outline=CREMA)   # el letrero verde, sin texto
    for i in range(2):
        d.line([(4, 79 + 4 * i), (24 - 6 * i, 79 + 4 * i)], fill=CREMA)
    texto(d, (75, 14), '1983', CREMA, 24)
    guardar(im, '1-camiones.png')


def aplanadora(d, x, y):
    d.rectangle([x + 6, y - 30, x + 40, y - 14], fill=(236, 184, 40)); d.rectangle([x + 14, y - 46, x + 34, y - 30], fill=(236, 184, 40))
    d.rectangle([x + 17, y - 43, x + 31, y - 32], fill=(150, 200, 220)); d.rectangle([x + 36, y - 40, x + 39, y - 30], fill=(70, 66, 60))
    d.rounded_rectangle([x, y - 14, x + 42, y], 6, fill=(48, 46, 50))
    for i in range(4):
        d.ellipse([x + 3 + 10 * i, y - 12, x + 11 + 10 * i, y - 3], fill=(96, 92, 92))
    d.polygon([(x + 46, y - 22), (x + 56, y - 26), (x + 60, y), (x + 48, y)], fill=(180, 176, 170)); d.line([(x + 40, y - 18), (x + 48, y - 14)], fill=(90, 84, 76), width=3)


def escena_cemento():
    im, d = lienzo((0, 0, 0)); atardecer(d, 64)
    aplanadora(d, 12, 66)
    d.polygon([(116, 16), (146, 10), (146, 32), (122, 36)], fill=(190, 190, 196)); d.line([(118, 18), (124, 34)], fill=(120, 120, 130), width=2)   # la revolvedora
    d.polygon([(112, 34), (124, 34), (110, 66), (98, 66)], fill=(150, 150, 156))                                                                 # el chorro de cemento
    d.rectangle([0, 64, T, 82], fill=(158, 158, 164)); d.rectangle([0, 64, T, 66], fill=(190, 190, 196))
    r = random.Random(9)
    for _ in range(60):
        d.point((r.randrange(T), r.randrange(68, 82)), fill=r.choice(((130, 130, 136), (184, 184, 190))))
    d.rectangle([0, 82, T, T], fill=(92, 66, 44))
    for _ in range(80):
        x, y = r.randrange(T), r.randrange(84, T); d.line([(x, y), (x + 3, y)], fill=(74, 52, 34))
    for fila in range(4):   # los cartuchos aplastados
        for col in range(9):
            x, y = col * 17 + r.randrange(-3, 4), 86 + fila * 16 + r.randrange(-2, 3); an, al = r.randrange(11, 16), r.randrange(6, 11)
            d.polygon([(x, y + r.randrange(3)), (x + an, y + r.randrange(3)), (x + an - r.randrange(3), y + al), (x + r.randrange(3), y + al)], fill=(36, 34, 40))
            d.rectangle([x + 3, y + 3, x + an - 4, y + al - 2], fill=COLORES[(fila * 3 + col) % 6])
    guardar(im, '2-cemento.png')


def consola(d, x, y, an=60, corona=False):
    """Una consola genérica: la caja oscura con el frente de madera, sus palancas y la ranura."""
    d.polygon([(x + 6, y), (x + an - 6, y), (x + an, y + 16), (x, y + 16)], fill=(30, 28, 32))
    for i in range(4):
        d.line([(x + 8 + i * 2, y + 3 + 3 * i), (x + an - 8 - i * 2, y + 3 + 3 * i)], fill=(52, 50, 56))
    d.rectangle([x + an // 2 - 10, y + 3, x + an // 2 + 10, y + 7], fill=NEGRO)
    for i in (0, 1, 4, 5):
        px = x + 8 + i * ((an - 18) // 5); d.rectangle([px, y - 3, px + 1, y + 2], fill=PLATA)
    d.rectangle([x, y + 16, x + an, y + 27], fill=MADERA); d.rectangle([x, y + 16, x + an, y + 17], fill=(160, 104, 58))
    for i in range(3):
        d.line([(x + 4, y + 20 + 3 * i), (x + an - 4 - 7 * i, y + 20 + 3 * i)], fill=MADERA2)
    if corona:
        cx = x + an // 2
        d.polygon([(cx - 13, y - 6), (cx - 15, y - 22), (cx - 6, y - 13), (cx, y - 25), (cx + 6, y - 13), (cx + 15, y - 22), (cx + 13, y - 6)], fill=ORO)
        d.rectangle([cx - 13, y - 8, cx + 13, y - 5], fill=(206, 160, 40))
        for px in (-8, 0, 8):
            d.rectangle([cx + px - 1, y - 8, cx + px + 1, y - 6], fill=ROJO)


def escena_reina():
    im, d = lienzo((20, 18, 44)); r = random.Random(2)
    for _ in range(40):
        d.point((r.randrange(T), r.randrange(70)), fill=(90, 86, 140))
    consola(d, 45, 34, corona=True)
    # la cuenta: 12 pilas de cartuchos contra 10 consolas
    d.rectangle([0, 138, T, T], fill=(36, 32, 66))
    for i in range(12):
        x, y = 8 + (i % 4) * 16, 122 - (i // 4) * 17; d.rectangle([x, y, x + 13, y + 15], fill=(34, 32, 38), outline=(70, 68, 78)); d.rectangle([x + 2, y + 4, x + 11, y + 11], fill=ORO)
    for i in range(10):
        x, y = 82 + (i % 3) * 22, 126 - (i // 3) * 12; d.rectangle([x, y, x + 19, y + 5], fill=(30, 28, 32)); d.rectangle([x, y + 6, x + 19, y + 10], fill=MADERA)
    texto(d, (40, 141), '12 M', ORO, 8); texto(d, (114, 141), '10 M', PLATA, 8)
    guardar(im, '3-reina.png')


def escena_semanas():
    im, d = lienzo((34, 30, 52)); d.rectangle([0, 118, T, T], fill=(58, 46, 60))
    d.rectangle([10, 14, 66, 70], fill=CREMA, outline=(120, 110, 100)); d.rectangle([10, 14, 66, 24], fill=ROJO)   # el calendario: cinco semanas
    for s in range(5):
        for dia in range(7):
            x, y = 14 + dia * 7, 29 + s * 8; d.rectangle([x, y, x + 5, y + 5], fill=(214, 206, 180))
            if s < 4 or dia < 4:
                d.line([(x, y), (x + 5, y + 5)], fill=ROJO); d.line([(x + 5, y), (x, y + 5)], fill=ROJO)
    texto(d, (38, 15), '5', CREMA, 8)
    d.ellipse([84, 16, 112, 44], fill=CREMA, outline=(90, 84, 76)); d.line([(98, 30), (98, 20)], fill=NEGRO); d.line([(98, 30), (106, 34)], fill=NEGRO)   # el reloj
    d.rectangle([118, 20, 142, 46], fill=(16, 20, 44), outline=(90, 84, 110)); d.ellipse([130, 24, 138, 32], fill=(236, 232, 200))                       # la ventana, de noche
    d.rectangle([14, 112, 140, 118], fill=MADERA); d.rectangle([20, 118, 25, 146], fill=MADERA2); d.rectangle([128, 118, 133, 146], fill=MADERA2)        # el escritorio
    d.rectangle([78, 72, 126, 110], fill=(206, 200, 186)); d.rectangle([83, 76, 121, 102], fill=(10, 24, 18))                                             # la pantalla
    for i, an in enumerate((26, 18, 30, 12, 22, 16)):
        d.line([(86, 80 + 4 * i), (86 + an, 80 + 4 * i)], fill=(90, 220, 120))
    d.rectangle([72, 107, 108, 111], fill=(120, 116, 108))
    for i, (x, y) in enumerate(((18, 108), (30, 108), (24, 102))):   # las tazas de café
        d.rectangle([x, y, x + 8, y + 4 if i < 2 else y + 5], fill=CREMA); d.rectangle([x + 1, y, x + 7, y], fill=(80, 50, 30))
    d.rectangle([44, 84, 64, 112], fill=(70, 110, 160)); d.rectangle([47, 66, 61, 84], fill=b.PIEL); d.rectangle([45, 62, 62, 70], fill=(70, 46, 34)); d.rectangle([45, 66, 47, 78], fill=(70, 46, 34))   # el programador
    d.rectangle([56, 74, 60, 76], fill=NEGRO); d.rectangle([52, 79, 60, 83], fill=(70, 46, 34)); d.rectangle([60, 94, 78, 99], fill=(70, 110, 160)); d.rectangle([76, 98, 82, 106], fill=b.PIEL)
    d.rectangle([40, 100, 48, 146], fill=(44, 40, 56)); d.rectangle([40, 118, 66, 124], fill=(44, 40, 56)); d.rectangle([50, 124, 64, 146], fill=(40, 44, 70))
    guardar(im, '4-semanas.png')


def escena_leyenda():
    im, d = lienzo((0, 0, 0)); b.cielo(d)
    d.polygon([(0, 104), (0, 90), (30, 78), (60, 92), (90, 80), (120, 94), (150, 84), (150, 104)], fill=(24, 20, 44)); d.rectangle([0, 104, T, T], fill=(70, 52, 40))
    for x in range(0, T, 9):
        d.line([(x, 112 + x % 5), (x + 4, 112 + x % 5)], fill=(56, 40, 32))
    d.polygon([(75, 108), (64, 134), (86, 134)], fill=(240, 130, 40)); d.polygon([(75, 118), (69, 134), (81, 134)], fill=(250, 220, 110))   # la fogata
    d.line([(60, 138), (90, 132)], fill=(96, 58, 30), width=3); d.line([(60, 132), (90, 138)], fill=(96, 58, 30), width=3)
    b.persona(d, 34, 136, (90, 140, 200)); b.persona(d, 108, 136, (200, 110, 70)); b.persona(d, 48, 146, (120, 160, 90), 3, True)
    d.ellipse([52, 20, 118, 74], fill=CREMA); d.ellipse([46, 74, 58, 84], fill=CREMA); d.ellipse([40, 88, 46, 94], fill=CREMA)                  # lo que cuentan
    d.polygon([(60, 64), (110, 64), (104, 56), (66, 56)], fill=ARENA2); cartucho(d, 66, 36, (90, 170, 90)); texto(d, (98, 36), '?', ROJO, 16)
    guardar(im, '5-leyenda.png')


def escena_excavadora():
    im, d = lienzo((150, 200, 232)); d.rectangle([0, 60, T, T], fill=ARENA); d.polygon([(0, 60), (30, 48), (70, 58), (110, 46), (150, 60)], fill=ARENA2)
    r = random.Random(12)
    d.polygon([(58, 92), (150, 88), (150, 150), (40, 150)], fill=ARENA3)                                                                        # el hoyo
    for _ in range(46):
        x, y = r.randrange(56, 146), r.randrange(104, 148); d.line([(x, y), (x + 4, y)], fill=(112, 80, 46))
    for i in range(13):                                                                                                                         # lo que asoma
        x, y = 58 + (i * 23) % 82, 112 + (i * 17) % 30; d.rectangle([x, y, x + 9, y + 6], fill=(36, 34, 40)); d.rectangle([x + 2, y + 2, x + 7, y + 4], fill=COLORES[i % 6])
    d.rounded_rectangle([6, 80, 48, 94], 6, fill=(48, 46, 50)); d.rectangle([12, 56, 44, 80], fill=(236, 150, 40)); d.rectangle([14, 42, 32, 60], fill=(236, 150, 40)); d.rectangle([17, 45, 30, 57], fill=(150, 200, 220))
    d.line([(42, 62), (78, 22)], fill=(236, 150, 40), width=6); d.line([(78, 22), (104, 62)], fill=(236, 150, 40), width=5)                     # el brazo
    d.polygon([(94, 60), (120, 60), (116, 80), (98, 80)], fill=(120, 116, 112))
    for i in range(4):
        d.polygon([(98 + 5 * i, 80), (102 + 5 * i, 80), (100 + 5 * i, 85)], fill=(120, 116, 112))
    cartucho(d, 96, 44, (90, 170, 90), True); cartucho(d, 108, 48, ROJO, True)
    for x, y in ((90, 88), (112, 90), (124, 84)):
        d.ellipse([x, y, x + 12, y + 7], fill=(226, 196, 144))
    for i, c in enumerate(((90, 140, 200), (200, 70, 90), (240, 200, 80), (90, 170, 90))):                                                       # los que miran
        b.persona(d, 8 + i * 11, 146, c, i % 2, True)
    texto(d, (116, 8), '2014', (40, 60, 90), 16)
    guardar(im, '6-excavadora.png')


def escena_museo():
    im, d = lienzo((46, 40, 58)); d.rectangle([0, 116, T, T], fill=(96, 78, 84))
    for x in (6, 126):   # las columnas
        d.rectangle([x, 20, x + 18, 116], fill=(206, 200, 190)); d.rectangle([x - 3, 14, x + 21, 20], fill=(226, 222, 214)); d.rectangle([x - 3, 112, x + 21, 118], fill=(226, 222, 214))
        for i in range(3):
            d.line([(x + 4 + 5 * i, 22), (x + 4 + 5 * i, 110)], fill=(176, 170, 160))
    d.polygon([(66, 0), (84, 0), (112, 108), (38, 108)], fill=(74, 66, 84)); d.polygon([(70, 0), (80, 0), (98, 108), (52, 108)], fill=(104, 94, 106))   # la luz
    d.rectangle([48, 96, 102, 140], fill=(228, 222, 212)); d.rectangle([44, 92, 106, 97], fill=(244, 240, 232)); d.rectangle([62, 108, 88, 118], fill=ORO, outline=(150, 110, 40))
    for i in range(2):
        d.line([(66, 111 + 4 * i), (84 - 6 * i, 111 + 4 * i)], fill=(120, 88, 30))
    cartucho(d, 60, 53, (90, 170, 90), True, 2)
    d.rectangle([50, 42, 100, 92], outline=(190, 220, 236)); d.line([(55, 46), (55, 70)], fill=(220, 238, 248)); d.line([(57, 46), (57, 58)], fill=(220, 238, 248))   # la vitrina
    for i, c in enumerate(((90, 140, 200), (200, 110, 70))):
        b.persona(d, 22 + i * 96, 146, c, 0, True)
    guardar(im, '7-museo.png')


def escena_pala():
    im, d = lienzo((0, 0, 0)); atardecer(d, 96)
    d.ellipse([40, 108, 116, 140], fill=ARENA3); d.ellipse([46, 112, 110, 136], fill=(92, 66, 44))
    cartucho(d, 62, 92, (70, 120, 200), False, 2)
    d.chord([40, 108, 116, 140], 12, 168, fill=ARENA3); d.chord([46, 112, 110, 134], 20, 160, fill=(92, 66, 44))   # la orilla de enfrente lo tapa
    d.polygon([(44, 128), (112, 128), (104, 137), (52, 137)], fill=ARENA3)
    d.polygon([(112, 78), (126, 78), (128, 94), (119, 104), (110, 94)], fill=GRIS); d.rectangle([117, 40, 121, 80], fill=MADERA); d.rectangle([111, 34, 127, 40], fill=MADERA)
    for i, (x, y) in enumerate(((28, 112), (34, 108), (22, 116), (38, 116))):
        d.ellipse([x, y, x + 12, y + 8], fill=ARENA2 if i % 2 else ARENA3)
    texto(d, (36, 22), '?', CREMA, 24)
    guardar(im, '8-pala.png')


if __name__ == '__main__':
    for f in (escena_camiones, escena_cemento, escena_reina, escena_semanas, escena_leyenda, escena_excavadora, escena_museo, escena_pala):
        f()
    print('listo:', b.SALIDA)
