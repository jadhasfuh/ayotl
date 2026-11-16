#!/usr/bin/env python3
"""Las escenas pixel de «¿Lo conoces?» para Portopia (ポートピア連続殺人事件), dibujadas aquí con código: nada de
capturas, carátulas ni sprites del juego. Lienzos de 150x150 a 5x (750x750), como arte_sweet_home.py, de donde salen
las herramientas. El único texto dentro del dibujo es el nombre del juego, los años y el símbolo del sistema.

  "/Users/jadhasfuh/Documents/code challenge/.venv/bin/python" tools/comerciales/lo-conoces/arte_portopia.py
"""
import os, random
import arte_sweet_home as b
from arte_sweet_home import lienzo, guardar, texto, persona, cielo, NEGRO, T

b.SALIDA = os.path.join(b.AQUI, 'portopia')
ORO, ROJO, CREMA, GRIS = (240, 200, 80), (214, 48, 48), (236, 230, 206), (154, 154, 168)
JEFE, YASU = (176, 150, 104), (60, 96, 180)   # la gabardina del Jefe y el traje de Yasu


def estrellas(d, semilla=5, n=40):
    r = random.Random(semilla)
    for _ in range(n):
        d.point((r.randrange(T), r.randrange(T)), fill=(40, 36, 70))


def jefe(d, x, y, espalda=True):
    """El Jefe, de gabardina y sombrero (en el juego no se le ve: aquí, casi siempre de espaldas)."""
    persona(d, x, y, JEFE, espalda=espalda)
    d.rectangle([x - 1, y - 21, x + 8, y - 20], fill=(90, 70, 44)); d.rectangle([x + 1, y - 23, x + 6, y - 21], fill=(90, 70, 44))
    d.rectangle([x, y - 6, x + 7, y - 3], fill=JEFE)


def escena_puerto():
    im, d = lienzo(b.NOCHE); cielo(d)
    r = random.Random(21)
    x = 0
    while x < T:   # la ciudad al fondo
        an, al = r.randrange(8, 16), r.randrange(14, 34)
        d.rectangle([x, 100 - al, x + an, 100], fill=NEGRO)
        for wy in range(100 - al + 3, 98, 5):
            for wx in range(x + 2, x + an - 1, 4):
                if r.random() < .35:
                    d.point((wx, wy), fill=ORO)
        x += an + 1
    # la torre del puerto: una torre roja de celosía, angosta de en medio
    for y in range(34, 101):
        k = abs(y - 62) / 38; m = round(3 + 6 * k * k + (2 if y < 40 else 0))
        d.point([(38 - m, y), (38 + m, y)], fill=ROJO)
        if y % 6 == 0:
            d.line([(38 - m, y), (38 + m, y)], fill=(150, 30, 36))
    d.rectangle([32, 36, 44, 40], fill=ROJO); d.rectangle([35, 37, 41, 38], fill=ORO); d.line([(38, 26), (38, 34)], fill=ROJO)
    # el mar, el barco y el muelle
    d.rectangle([0, 100, T, T], fill=(10, 20, 54))
    for _ in range(46):
        wx, wy = r.randrange(T), r.randrange(103, T)
        d.line([(wx, wy), (wx + 3, wy)], fill=(22, 38, 84))
    d.polygon([(98, 108), (146, 108), (140, 116), (104, 116)], fill=NEGRO); d.rectangle([112, 100, 132, 108], fill=(30, 30, 44))
    for wx in range(115, 131, 5):
        d.point((wx, 104), fill=ORO)
    d.rectangle([122, 94, 125, 100], fill=(30, 30, 44))
    d.polygon([(0, 124), (104, 124), (116, T), (0, T)], fill=(52, 46, 44)); d.line([(0, 124), (104, 124)], fill=(80, 72, 66))
    for px in (12, 40, 68, 96):
        d.rectangle([px, 120, px + 2, 126], fill=(30, 26, 26))
    # la patrulla, con su luz, y los dos detectives
    d.rectangle([14, 133, 44, 141], fill=(232, 232, 236)); d.rectangle([20, 127, 37, 133], fill=(232, 232, 236)); d.rectangle([14, 137, 44, 141], fill=(24, 24, 34))
    d.rectangle([22, 129, 27, 132], fill=(120, 170, 220)); d.rectangle([30, 129, 35, 132], fill=(120, 170, 220))
    d.rectangle([26, 124, 30, 126], fill=ROJO); d.point([(24, 123), (32, 123), (28, 121)], fill=(250, 120, 120))
    d.ellipse([17, 139, 23, 145], fill=NEGRO); d.ellipse([35, 139, 41, 145], fill=NEGRO)
    jefe(d, 62, 147); persona(d, 78, 146, YASU, espalda=True)
    guardar(im, '1-puerto.png')


def escena_cuarto():
    im, d = lienzo((44, 40, 56))
    for x in range(0, T, 30):
        d.line([(x, 0), (x, 84)], fill=(52, 48, 66))
    d.rectangle([0, 84, T, T], fill=(70, 50, 40))                      # el piso de madera
    for y in range(92, T, 9):
        d.line([(0, y), (T, y)], fill=(84, 60, 46))
    d.rectangle([0, 80, T, 84], fill=(30, 26, 36))
    # la puerta, cerrada, con la llave puesta por dentro
    d.rectangle([20, 22, 56, 84], fill=(24, 18, 16)); d.rectangle([23, 25, 53, 84], fill=(110, 70, 40))
    d.rectangle([27, 30, 49, 50], outline=(84, 52, 30)); d.rectangle([27, 56, 49, 80], outline=(84, 52, 30))
    d.ellipse([44, 52, 50, 58], fill=ORO); d.rectangle([50, 54, 60, 55], fill=ORO); d.rectangle([57, 56, 57, 58], fill=ORO); d.rectangle([60, 56, 60, 58], fill=ORO)
    d.ellipse([58, 44, 68, 54], outline=ORO); d.point([(63, 40), (70, 43), (72, 50)], fill=ORO)   # el brillo: ahí está
    # la ventana, con reja
    d.rectangle([92, 24, 130, 58], fill=(16, 20, 48), outline=(24, 18, 16), width=2)
    for wx in range(98, 130, 7):
        d.line([(wx, 26), (wx, 56)], fill=(120, 120, 134))
    d.line([(94, 41), (128, 41)], fill=(120, 120, 134))
    # el escritorio y la lámpara
    d.rectangle([96, 70, 140, 76], fill=(96, 60, 34)); d.rectangle([98, 76, 102, 96], fill=(70, 44, 26)); d.rectangle([134, 76, 138, 96], fill=(70, 44, 26))
    d.polygon([(118, 58), (130, 58), (127, 64), (121, 64)], fill=ORO); d.line([(124, 64), (124, 70)], fill=(120, 120, 134))
    # la silueta de gis en el piso
    gis = (232, 232, 236)
    d.ellipse([34, 100, 44, 110], outline=gis)
    d.line([(44, 107), (70, 112), (74, 122), (70, 132), (46, 126), (42, 116), (44, 107)], fill=gis)
    d.line([(52, 109), (58, 96), (64, 98), (62, 110)], fill=gis); d.line([(50, 127), (44, 140), (50, 142), (58, 129)], fill=gis)
    d.line([(74, 118), (96, 114), (97, 119), (75, 124)], fill=gis); d.line([(71, 130), (92, 138), (90, 143), (68, 134)], fill=gis)
    for i, (mx, my) in enumerate([(110, 102), (104, 128), (20, 116)]):   # los letreritos de las pruebas
        d.polygon([(mx, my + 8), (mx + 4, my), (mx + 8, my + 8)], fill=ORO); texto(d, (mx + 4, my + 13), str(i + 1), ORO, 8)
    guardar(im, '2-cuarto.png')


def escena_sospechosos():
    im, d = lienzo((34, 30, 44))
    d.rectangle([0, 112, T, T], fill=(46, 38, 44))
    for y in range(118, T, 9):
        d.line([(0, y), (T, y)], fill=(56, 46, 52))
    # el corcho, con cuatro fotos, sus signos de pregunta y los hilos rojos
    d.rectangle([14, 12, 136, 98], fill=(84, 56, 34)); d.rectangle([17, 15, 133, 95], fill=(160, 114, 68))
    r = random.Random(4)
    for _ in range(90):
        d.point((r.randrange(18, 133), r.randrange(16, 95)), fill=(140, 98, 58))
    fotos = [(24, 22), (58, 30), (92, 20), (106, 58)]
    centro = (52, 78)
    for fx, fy in fotos:
        d.line([(fx + 9, fy + 12), centro], fill=ROJO)
    for fx, fy in fotos:
        d.rectangle([fx, fy, fx + 18, fy + 24], fill=CREMA); d.rectangle([fx + 2, fy + 2, fx + 16, fy + 17], fill=(60, 60, 80))
        d.ellipse([fx + 6, fy + 4, fx + 12, fy + 10], fill=NEGRO); d.rectangle([fx + 4, fy + 11, fx + 14, fy + 17], fill=NEGRO)
        texto(d, (fx + 10, fy + 6), '?', ORO, 8)
        d.point((fx + 9, fy + 1), fill=ROJO); d.point((fx + 10, fy + 1), fill=ROJO)
    d.rectangle([40, 68, 64, 88], fill=CREMA)
    for ly in range(72, 86, 4):
        d.line([(43, ly), (61, ly)], fill=(120, 110, 100))
    d.ellipse([50, 76, 54, 80], fill=ROJO)
    # el Jefe manda (de espaldas) y Yasu señala
    jefe(d, 30, 146); persona(d, 104, 140, YASU)
    d.line([(103, 128), (94, 118)], fill=YASU); d.point((93, 117), fill=b.PIEL)
    guardar(im, '3-sospechosos.png')


def escena_teclado():
    im, d = lienzo((22, 20, 36)); estrellas(d, 9, 30)
    caja, sombra, verde = (204, 196, 170), (150, 142, 120), (90, 240, 130)
    d.rectangle([24, 14, 126, 92], fill=sombra); d.rectangle([24, 14, 124, 90], fill=caja)          # el monitor
    d.rectangle([32, 22, 116, 80], fill=(6, 22, 12)); d.rectangle([32, 22, 116, 80], outline=(40, 36, 30), width=2)
    texto(d, (38, 30), '>', verde, 8, 'la'); texto(d, (50, 30), '? ? ?', (50, 150, 84), 8, 'la')
    texto(d, (38, 46), '>', verde, 8, 'la'); texto(d, (50, 46), '? ? ?', (50, 150, 84), 8, 'la')
    texto(d, (38, 62), '>', verde, 8, 'la'); d.rectangle([50, 62, 56, 69], fill=verde)              # el cursor
    d.rectangle([106, 84, 112, 86], fill=ROJO)
    d.rectangle([64, 92, 86, 100], fill=sombra)
    d.rectangle([16, 104, 134, 132], fill=sombra); d.rectangle([16, 104, 132, 130], fill=caja)      # el teclado
    for fila in range(4):
        for k in range(13 - (fila == 3) * 4):
            kx = 21 + k * 8 + fila * 2 + (fila == 3) * 12; ky = 108 + fila * 6
            d.rectangle([kx, ky, kx + 5 + (fila == 3 and k == 4) * 24, ky + 3], fill=(70, 66, 60))
            if fila == 3 and k == 4:
                break
    guardar(im, '4-teclado.png')


def escena_casete():
    im, d = lienzo((16, 14, 34)); estrellas(d)
    # un casete genérico (los juegos de esas computadoras venían en cinta): dibujo nuestro, no la carátula
    d.rectangle([18, 30, 132, 100], fill=(30, 30, 40)); d.rectangle([20, 32, 130, 98], fill=(58, 58, 72))
    d.rectangle([26, 38, 124, 68], fill=CREMA); d.rectangle([26, 38, 124, 41], fill=ROJO)
    texto(d, (75, 49), 'PORTOPIA', (30, 26, 40))
    d.rectangle([44, 74, 106, 92], fill=(16, 16, 24))
    for cx in (58, 92):
        d.ellipse([cx - 7, 76, cx + 7, 90], fill=(200, 200, 212)); d.ellipse([cx - 3, 80, cx + 3, 86], fill=(16, 16, 24))
    d.rectangle([66, 80, 84, 86], fill=(90, 60, 40))
    for sx, sy in ((23, 35), (126, 35), (23, 94), (126, 94)):
        d.point((sx, sy), fill=(150, 150, 164))
    d.polygon([(44, 98), (106, 98), (100, 104), (50, 104)], fill=(30, 30, 40))
    texto(d, (75, 112), '1983', ORO, 16)
    d.rectangle([64, 134, 86, 147], fill=(238, 238, 238)); d.ellipse([71, 136, 79, 144], fill=ROJO)
    guardar(im, '5-casete.png')


def escena_legado():
    im, d = lienzo((16, 14, 34)); estrellas(d, 13, 60)
    # 1983: una lupa. 1986: una espada y un escudo (genéricos)
    d.ellipse([14, 36, 44, 66], outline=ORO, width=3); d.ellipse([20, 42, 38, 60], fill=(60, 90, 140)); d.line([(22, 50), (28, 44)], fill=(160, 200, 240))
    d.line([(40, 62), (54, 76)], fill=(150, 104, 60), width=4)
    plata = (210, 214, 226)
    d.rectangle([108, 28, 112, 66], fill=plata); d.polygon([(108, 28), (110, 22), (112, 28)], fill=plata); d.line([(110, 30), (110, 64)], fill=(150, 154, 170))
    d.rectangle([100, 66, 120, 69], fill=ORO); d.rectangle([108, 70, 112, 78], fill=(120, 80, 44)); d.rectangle([107, 78, 113, 80], fill=ORO)
    d.polygon([(118, 44), (140, 44), (140, 60), (129, 72), (118, 60)], fill=(60, 96, 180), outline=plata)
    d.rectangle([128, 48, 130, 64], fill=ORO); d.rectangle([122, 53, 136, 55], fill=ORO)
    texto(d, (34, 92), '1983', GRIS); texto(d, (118, 92), '1986', ORO)
    d.line([(58, 95), (88, 95)], fill=ORO, width=2); d.polygon([(88, 90), (96, 95), (88, 100)], fill=ORO)
    # abajo, la pista: los dos juegos son del mismo autor
    d.rectangle([20, 114, 130, 136], fill=(26, 24, 46), outline=(90, 90, 104))
    persona(d, 28, 134, (70, 150, 90)); d.line([(42, 125), (120, 125)], fill=ORO); d.line([(42, 129), (100, 129)], fill=GRIS)
    guardar(im, '6-legado.png')


if __name__ == '__main__':
    escena_puerto(); escena_cuarto(); escena_sospechosos(); escena_teclado(); escena_casete(); escena_legado()
    print('listo:', sorted(os.listdir(b.SALIDA)))
