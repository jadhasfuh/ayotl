#!/usr/bin/env python3
"""Las escenas pixel de «¿Lo conoces?» para Clock Tower (Human, Super Famicom, 1995), dibujadas aquí con código: nada
de capturas, carátulas ni sprites del juego. Lienzos de 150x150 a 5x (750x750), con las herramientas de
arte_sweet_home.py. El único texto dentro del dibujo es el nombre del juego y los años.

  "/Users/jadhasfuh/Documents/code challenge/.venv/bin/python" tools/comerciales/lo-conoces/arte_clock_tower.py
"""
import os, random
import arte_sweet_home as b
from arte_sweet_home import lienzo, guardar, texto, cielo, NEGRO, T

b.SALIDA = os.path.join(b.AQUI, 'clock-tower')
ORO, ROJO, CREMA, GRIS, PLATA = (240, 200, 80), (214, 48, 48), (236, 230, 206), (154, 154, 168), (206, 210, 224)
PIEL = b.PIEL
# Jennifer y sus tres amigas: (vestido, pelo)
NINAS = [((90, 120, 200), (40, 30, 30)), ((200, 90, 110), (150, 90, 40)), ((110, 170, 110), (220, 190, 110)), ((180, 140, 200), (90, 50, 30))]


def nina(d, x, y, vestido, pelo, espalda=False, punteada=False):
    """Una niña de 8x19 con los pies en y: pelo largo y vestido. `punteada`: sólo el contorno (la que ya no está)."""
    y0 = y - 19
    if punteada:
        for px, py in [(x + 1, y0), (x + 3, y0), (x + 5, y0), (x, y0 + 2), (x + 7, y0 + 2), (x, y0 + 5), (x + 7, y0 + 5), (x - 1, y0 + 9),
                       (x + 8, y0 + 9), (x - 2, y0 + 13), (x + 9, y0 + 13), (x - 2, y - 4), (x + 9, y - 4), (x, y - 4), (x + 3, y - 4), (x + 6, y - 4),
                       (x + 1, y - 1), (x + 6, y - 1)]:
            d.point((px, py), fill=(120, 120, 150))
        return
    d.rectangle([x + 1, y0, x + 6, y0 + 5], fill=PIEL)
    d.rectangle([x, y0, x + 7, y0 + (6 if espalda else 1)], fill=pelo)                       # el pelo, largo
    d.rectangle([x, y0 + 2, x, y0 + 9], fill=pelo); d.rectangle([x + 7, y0 + 2, x + 7, y0 + 9], fill=pelo)
    if espalda:
        d.rectangle([x + 1, y0 + 6, x + 6, y0 + 9], fill=pelo)
    else:
        d.point([(x + 2, y0 + 3), (x + 5, y0 + 3)], fill=NEGRO)
    d.polygon([(x + 1, y0 + 7), (x + 6, y0 + 7), (x + 9, y - 4), (x - 2, y - 4)], fill=vestido)   # el vestido
    if espalda:
        d.rectangle([x + 2, y0 + 7, x + 5, y0 + 9], fill=pelo)
    d.rectangle([x + 1, y - 3, x + 2, y], fill=CREMA); d.rectangle([x + 5, y - 3, x + 6, y], fill=CREMA)


def tijeras(d, x, y, k=1):
    """Unas tijeras abiertas de unos 22 px de alto con la punta arriba, en (x, y) el centro del tornillo."""
    d.line([(x, y), (x - 5 * k, y - 16 * k)], fill=PLATA, width=2); d.line([(x, y), (x + 5 * k, y - 16 * k)], fill=PLATA, width=2)
    d.line([(x, y), (x - 4 * k, y + 7 * k)], fill=GRIS, width=2); d.line([(x, y), (x + 4 * k, y + 7 * k)], fill=GRIS, width=2)
    d.ellipse([x - 7 * k, y + 5 * k, x - 2 * k, y + 10 * k], outline=GRIS); d.ellipse([x + 2 * k, y + 5 * k, x + 7 * k, y + 10 * k], outline=GRIS)
    d.point((x, y), fill=ORO)


def acechador(d, x, y):
    """La figura de las tijeras: una silueta chica, más clara que su sombra para que se vea, con las tijeras en alto."""
    c = (84, 70, 108)
    d.rectangle([x, y - 12, x + 7, y - 4], fill=c); d.rectangle([x + 1, y - 18, x + 6, y - 12], fill=c)
    d.rectangle([x + 1, y - 4, x + 2, y], fill=c); d.rectangle([x + 5, y - 4, x + 6, y], fill=c)
    d.rectangle([x + 1, y - 18, x + 6, y - 17], fill=(30, 22, 40))
    d.point([(x + 2, y - 15), (x + 5, y - 15)], fill=ROJO)
    d.line([(x + 7, y - 10), (x + 12, y - 16)], fill=c, width=2)
    tijeras(d, x + 13, y - 20)


def escena_torre():
    im, d = lienzo(b.NOCHE); cielo(d)
    d.rectangle([0, 116, T, T], fill=b.PASTO)
    r = random.Random(8)
    for _ in range(60):
        d.point((r.randrange(T), r.randrange(117, T)), fill=b.PASTO2)
    d.polygon([(62, 150), (84, 150), (78, 116), (70, 116)], fill=(44, 42, 50))
    d.rectangle([14, 76, 136, 116], fill=NEGRO); d.polygon([(10, 76), (44, 58), (106, 58), (140, 76)], fill=NEGRO)   # la mansión
    d.rectangle([62, 22, 88, 76], fill=NEGRO); d.polygon([(58, 22), (75, 4), (92, 22)], fill=NEGRO)                    # la torre
    d.ellipse([66, 28, 84, 46], fill=CREMA, outline=ORO); d.line([(75, 37), (75, 30)], fill=NEGRO); d.line([(75, 37), (80, 39)], fill=NEGRO)
    for i in range(12):
        import math
        a = i * math.pi / 6
        d.point((75 + round(7 * math.sin(a)), 37 - round(7 * math.cos(a))), fill=NEGRO)
    for c in range(8):
        x = 20 + c * 14
        if 62 <= x <= 84:
            continue
        d.rectangle([x, 84, x + 7, 96], fill=b.VENTANA if c in (1, 6) else b.APAGADA); d.line([(x + 4, 84), (x + 4, 96)], fill=NEGRO)
    d.rectangle([68, 96, 82, 116], fill=(40, 26, 20)); d.line([(75, 96), (75, 116)], fill=NEGRO)
    d.rectangle([70, 54, 80, 68], fill=b.APAGADA); d.line([(75, 54), (75, 68)], fill=NEGRO)
    d.line([(138, 116), (138, 92)], fill=NEGRO, width=3); d.line([(138, 98), (146, 86)], fill=NEGRO); d.line([(138, 94), (130, 84)], fill=NEGRO)
    for i, (v, p) in enumerate(NINAS):
        nina(d, 44 + i * 16, 146 - (i % 2) * 3, v, p, espalda=True)
    guardar(im, '1-torre.png')


def vestibulo(d):
    d.rectangle([0, 0, T, 96], fill=(40, 28, 44))
    for x in range(0, T, 30):
        d.line([(x, 0), (x, 96)], fill=(48, 34, 54))
    d.rectangle([0, 92, T, 96], fill=(70, 46, 34))
    for fy in range(96, T, 9):                                    # el piso de ajedrez
        for fx in range(0, T, 15):
            claro = ((fx // 15) + (fy // 9)) % 2 == 0
            d.rectangle([fx, fy, fx + 14, fy + 8], fill=(70, 62, 78) if claro else (30, 26, 38))


def escena_vestibulo():
    im, d = lienzo(NEGRO); vestibulo(d)
    for i in range(7):                                            # la escalera, al fondo
        d.rectangle([92 + i * 6, 90 - i * 8, 150, 96 - i * 8], fill=(90, 58, 40)); d.line([(92 + i * 6, 90 - i * 8), (150, 90 - i * 8)], fill=(120, 80, 54))
    d.line([(92, 78), (134, 22)], fill=(60, 38, 28), width=2)
    d.rectangle([14, 30, 48, 92], fill=(24, 16, 14)); d.rectangle([17, 33, 45, 92], fill=(84, 54, 34)); d.point((41, 64), fill=ORO)   # la puerta
    d.line([(75, 0), (75, 12)], fill=GRIS); d.rectangle([64, 12, 86, 15], fill=(110, 110, 124))                                        # el candelabro, apagado
    for x in (66, 75, 84):
        d.rectangle([x, 8, x, 12], fill=CREMA)
    for i, (v, p) in enumerate(NINAS[1:]):                        # donde estaban las tres amigas
        nina(d, 22 + i * 22, 132 + (i % 2) * 4, v, p, punteada=True)
        texto(d, (26 + i * 22, 100 + (i % 2) * 4), '?', (150, 150, 180), 8)
    nina(d, 104, 136, *NINAS[0]); texto(d, (108, 104), '!', ORO, 8)
    guardar(im, '2-vestibulo.png')


def escena_tijeras():
    im, d = lienzo(NEGRO); vestibulo(d)
    for x in (10, 62, 114):                                       # las puertas del pasillo
        d.rectangle([x, 34, x + 26, 92], fill=(24, 16, 14)); d.rectangle([x + 3, 37, x + 23, 92], fill=(84, 54, 34)); d.point((x + 20, 66), fill=ORO)
    d.rectangle([44, 20, 54, 34], fill=(60, 50, 30)); d.ellipse([46, 12, 52, 20], fill=ORO)   # un quinqué
    d.polygon([(8, 96), (40, 96), (64, 150), (0, 150)], fill=(14, 10, 20))                   # su sombra, larga
    acechador(d, 20, 128)
    nina(d, 112, 132, *NINAS[0])
    d.line([(100, 120), (106, 120)], fill=CREMA); d.line([(98, 126), (104, 126)], fill=CREMA)  # corre
    texto(d, (116, 100), '!', ROJO, 8)
    guardar(im, '3-tijeras.png')


def escena_escondite():
    im, d = lienzo(NEGRO)
    d.rectangle([0, 0, T, 100], fill=(30, 26, 44)); d.rectangle([0, 100, T, T], fill=(56, 40, 34))
    for y in range(108, T, 9):
        d.line([(0, y), (T, y)], fill=(68, 48, 40))
    # el ropero, entreabierto, con dos ojos adentro
    d.rectangle([20, 30, 66, 104], fill=(60, 38, 26)); d.rectangle([23, 33, 42, 101], fill=(96, 62, 40)); d.rectangle([47, 33, 63, 101], fill=(96, 62, 40))
    d.rectangle([43, 33, 46, 101], fill=NEGRO); d.point([(44, 58), (45, 58)], fill=CREMA); d.point((40, 68), fill=ORO); d.point((49, 68), fill=ORO)
    # la cama
    d.rectangle([84, 84, 142, 100], fill=(150, 60, 70)); d.rectangle([84, 76, 98, 86], fill=CREMA); d.rectangle([82, 70, 85, 104], fill=(70, 44, 30)); d.rectangle([141, 78, 144, 104], fill=(70, 44, 30))
    # la puerta abierta al fondo, con la silueta que pasa
    d.rectangle([98, 20, 128, 70], fill=(70, 60, 40)); d.rectangle([101, 23, 125, 70], fill=(200, 170, 90))
    d.rectangle([108, 46, 115, 62], fill=NEGRO); d.rectangle([109, 40, 114, 46], fill=NEGRO); d.rectangle([109, 62, 110, 70], fill=NEGRO); d.rectangle([113, 62, 114, 70], fill=NEGRO)
    d.line([(115, 50), (119, 44)], fill=NEGRO, width=2); d.line([(120, 44), (117, 30)], fill=NEGRO, width=2); d.line([(120, 44), (124, 30)], fill=NEGRO, width=2)
    # abajo, los nueve finales: nueve puertitas
    d.rectangle([0, 124, T, T], fill=NEGRO)
    for i in range(9):
        x = 10 + i * 15
        d.rectangle([x, 130, x + 9, 144], fill=(96, 62, 40), outline=ORO if i == 8 else GRIS); d.point((x + 7, 138), fill=ORO)
    guardar(im, '4-escondite.png')


def escena_cartucho():
    im, d = lienzo((16, 14, 34))
    r = random.Random(5)
    for _ in range(40):
        d.point((r.randrange(T), r.randrange(T)), fill=(40, 36, 70))
    # un cartucho genérico gris (dibujo nuestro, no la carátula)
    d.rounded_rectangle([20, 28, 130, 100], 6, fill=(90, 90, 104)); d.rounded_rectangle([22, 30, 128, 96], 5, fill=(176, 176, 190))
    d.rectangle([22, 30, 128, 33], fill=(206, 206, 218))
    d.rectangle([32, 40, 118, 80], fill=CREMA); d.rectangle([32, 40, 118, 43], fill=(110, 60, 150))
    texto(d, (75, 50), 'CLOCK', (40, 20, 50)); texto(d, (75, 64), 'TOWER', (40, 20, 50))
    for x in range(30, 122, 10):
        d.rectangle([x, 86, x + 5, 92], fill=(120, 120, 134))
    texto(d, (75, 112), '1995', ORO, 16)
    d.rectangle([64, 134, 86, 147], fill=(238, 238, 238)); d.ellipse([71, 136, 79, 144], fill=ROJO)
    guardar(im, '5-cartucho.png')


def escena_legado():
    im, d = lienzo((16, 14, 34))
    r = random.Random(13)
    for _ in range(60):
        d.point((r.randrange(T), r.randrange(T)), fill=(40, 36, 70))
    # 1985: una claqueta de cine. 1995: el cartucho
    d.rectangle([14, 52, 56, 80], fill=(30, 30, 40), outline=CREMA)
    d.polygon([(14, 50), (56, 42), (56, 48), (14, 56)], fill=CREMA)
    for i in range(4):
        d.polygon([(18 + i * 10, 49), (23 + i * 10, 48), (20 + i * 10, 54), (15 + i * 10, 55)], fill=(30, 30, 40))
    for ly in (60, 66, 72):
        d.line([(19, ly), (51, ly)], fill=GRIS)
    d.rounded_rectangle([96, 46, 138, 80], 4, fill=(176, 176, 190)); d.rectangle([102, 52, 132, 68], fill=CREMA); d.rectangle([102, 52, 132, 54], fill=(110, 60, 150))
    for x in range(102, 132, 8):
        d.rectangle([x, 72, x + 4, 76], fill=(120, 120, 134))
    texto(d, (35, 92), '1985', GRIS); texto(d, (117, 92), '1995', ORO)
    d.line([(62, 64), (84, 64)], fill=ORO, width=2); d.polygon([(84, 59), (92, 64), (84, 69)], fill=ORO)
    tijeras(d, 75, 128)
    guardar(im, '6-legado.png')


if __name__ == '__main__':
    escena_torre(); escena_vestibulo(); escena_tijeras(); escena_escondite(); escena_cartucho(); escena_legado()
    print('listo:', sorted(os.listdir(b.SALIDA)))
