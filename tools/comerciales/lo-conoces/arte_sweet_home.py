#!/usr/bin/env python3
"""Las escenas pixel del piloto de «¿Lo conoces?» (Sweet Home), dibujadas aquí con código: nada de capturas,
carátulas ni sprites del juego. Cada escena es un lienzo de 150x150 que se guarda a 5x (750x750, vecino más
cercano: el tamaño de la tarjeta en el vídeo, para que no se emborrone) en lo-conoces/sweet-home/. El único texto dentro del dibujo es el título del juego y los años: lo demás
va en `texto` del guion, para que el mismo dibujo sirva en español, inglés y japonés.

  "/Users/jadhasfuh/Documents/code challenge/.venv/bin/python" tools/comerciales/lo-conoces/arte_sweet_home.py
"""
import os, random
from PIL import Image, ImageDraw, ImageFont

AQUI = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.join(AQUI, 'sweet-home')
PIXEL = os.path.expanduser('~/Documents/daily challenge/src/fonts/PressStart2P-Regular.ttf')
T, LADO = 150, 750

NOCHE, NOCHE2, NOCHE3 = (10, 10, 28), (18, 16, 46), (30, 24, 66)
LUNA, NEGRO, VENTANA, APAGADA = (236, 232, 200), (6, 6, 14), (240, 200, 80), (26, 26, 44)
PASTO, PASTO2 = (18, 34, 28), (26, 46, 36)
PIEL, PELO = (232, 184, 140), (30, 22, 20)
# los cinco, de izquierda a derecha: encendedor, cámara, botiquín, llave y aspiradora
GENTE = [((60, 96, 180), 0), ((70, 150, 90), 0), ((196, 64, 64), 0), ((232, 120, 170), 3), ((226, 186, 60), 0)]


def lienzo(fondo, t=T):
    im = Image.new('RGB', (t, t), fondo); d = ImageDraw.Draw(im); d.fontmode = '1'
    return im, d


def guardar(im, nombre):
    os.makedirs(SALIDA, exist_ok=True)
    assert LADO % im.size[0] == 0
    im.resize((LADO, LADO), Image.NEAREST).save(os.path.join(SALIDA, nombre))   # siempre 750x750: 150 a 5x o 125 a 6x


def texto(d, xy, t, color, tam=8, ancla='mt'):
    d.text(xy, t, font=ImageFont.truetype(PIXEL, tam), fill=color, anchor=ancla)


def persona(d, x, y, color, chica=0, espalda=False):
    """Una persona de 8x20 con los pies en y (chica: cuántos px más baja)."""
    y0 = y - 20 + chica
    d.rectangle([x + 1, y0, x + 6, y0 + 5], fill=PIEL)                      # cabeza
    d.rectangle([x + 1, y0, x + 6, y0 + (5 if espalda else 1)], fill=PELO)  # pelo
    d.point([(x + 1, y0 + 2), (x + 6, y0 + 2)], fill=PELO)
    if not espalda:
        d.point([(x + 2, y0 + 3), (x + 5, y0 + 3)], fill=NEGRO)             # ojos
    d.rectangle([x, y0 + 6, x + 7, y - 6], fill=color)                      # cuerpo
    d.rectangle([x - 1, y0 + 7, x - 1, y - 9], fill=color); d.rectangle([x + 8, y0 + 7, x + 8, y - 9], fill=color)
    d.rectangle([x + 1, y - 5, x + 2, y], fill=(34, 34, 52)); d.rectangle([x + 5, y - 5, x + 6, y], fill=(34, 34, 52))


def encendedor(d, x, y):
    d.rectangle([x + 4, y + 6, x + 8, y + 12], fill=(170, 170, 184)); d.rectangle([x + 4, y + 5, x + 8, y + 6], fill=(110, 110, 124))
    d.polygon([(x + 6, y), (x + 4, y + 4), (x + 8, y + 4)], fill=(240, 130, 40)); d.point((x + 6, y + 3), fill=(250, 230, 120))


def camara(d, x, y):
    d.rectangle([x, y + 4, x + 12, y + 11], fill=(52, 52, 66)); d.rectangle([x + 2, y + 2, x + 5, y + 3], fill=(52, 52, 66))
    d.ellipse([x + 4, y + 5, x + 9, y + 10], fill=(150, 190, 230), outline=(16, 16, 24)); d.point((x + 11, y + 5), fill=(240, 200, 80))


def botiquin(d, x, y):
    d.rectangle([x, y + 4, x + 12, y + 12], fill=(238, 238, 238)); d.rectangle([x + 4, y + 2, x + 8, y + 3], outline=(170, 170, 184))
    d.rectangle([x + 5, y + 5, x + 7, y + 11], fill=(214, 48, 48)); d.rectangle([x + 3, y + 7, x + 9, y + 9], fill=(214, 48, 48))


def llave(d, x, y):
    oro = (240, 200, 80)
    d.ellipse([x, y + 3, x + 6, y + 9], outline=oro); d.ellipse([x + 1, y + 4, x + 5, y + 8], outline=oro)
    d.rectangle([x + 6, y + 5, x + 12, y + 6], fill=oro); d.rectangle([x + 9, y + 7, x + 9, y + 9], fill=oro); d.rectangle([x + 12, y + 7, x + 12, y + 9], fill=oro)


def aspiradora(d, x, y):
    d.ellipse([x, y + 5, x + 9, y + 12], fill=(200, 70, 70)); d.rectangle([x + 2, y + 12, x + 3, y + 13], fill=NEGRO); d.rectangle([x + 6, y + 12, x + 7, y + 13], fill=NEGRO)
    d.line([(x + 8, y + 6), (x + 11, y + 2), (x + 12, y + 9)], fill=(170, 170, 184)); d.rectangle([x + 10, y + 10, x + 13, y + 11], fill=(110, 110, 124))


COSAS = [encendedor, camara, botiquin, llave, aspiradora]


def cielo(d, rayo=False):
    for y0, c in ((0, NOCHE), (48, NOCHE2), (84, NOCHE3)):
        d.rectangle([0, y0, T, T], fill=c)
    r = random.Random(7)
    for _ in range(46):
        d.point((r.randrange(T), r.randrange(92)), fill=(200, 200, 230) if r.random() < .6 else (120, 120, 170))
    d.ellipse([110, 12, 132, 34], fill=LUNA); d.ellipse([116, 16, 121, 21], fill=(206, 200, 168)); d.ellipse([123, 24, 127, 28], fill=(206, 200, 168))
    if rayo:
        d.line([(28, 0), (22, 18), (30, 20), (20, 44), (26, 46), (18, 62)], fill=(250, 246, 200), width=2)


def mansion(d, luces=True):
    d.rectangle([0, 112, T, T], fill=PASTO)
    r = random.Random(3)
    for _ in range(60):
        d.point((r.randrange(T), r.randrange(113, T)), fill=PASTO2)
    d.polygon([(66, 150), (84, 150), (79, 112), (71, 112)], fill=(44, 42, 50))                 # el camino
    d.rectangle([30, 64, 120, 112], fill=NEGRO)                                                 # el cuerpo
    d.polygon([(26, 64), (75, 40), (124, 64)], fill=NEGRO)                                      # el techo
    d.rectangle([96, 30, 114, 64], fill=NEGRO); d.polygon([(93, 30), (105, 14), (117, 30)], fill=NEGRO)   # la torre
    d.rectangle([38, 46, 44, 60], fill=NEGRO)                                                   # la chimenea
    enc = {(0, 1), (1, 3), (0, 4)} if luces else set()
    for f in range(2):
        for c in range(6):
            x, y = 36 + c * 14, 70 + f * 18
            if f == 1 and c in (2, 3):
                continue
            d.rectangle([x, y, x + 7, y + 9], fill=VENTANA if (f, c) in enc else APAGADA)
            d.line([(x + 4, y), (x + 4, y + 9)], fill=NEGRO); d.line([(x, y + 5), (x + 7, y + 5)], fill=NEGRO)
    d.rectangle([101, 38, 108, 48], fill=VENTANA if luces else APAGADA); d.line([(105, 38), (105, 48)], fill=NEGRO)
    d.rectangle([68, 92, 82, 112], fill=(40, 26, 20)); d.line([(75, 92), (75, 112)], fill=NEGRO); d.point((73, 103), fill=VENTANA)
    # el árbol seco
    d.line([(12, 112), (12, 84)], fill=NEGRO, width=3); d.line([(12, 92), (4, 80)], fill=NEGRO); d.line([(13, 88), (22, 76)], fill=NEGRO)
    d.line([(22, 76), (25, 70)], fill=NEGRO); d.line([(4, 80), (2, 72)], fill=NEGRO); d.line([(12, 84), (10, 74)], fill=NEGRO)


def escena_mansion():
    im, d = lienzo(NOCHE); cielo(d); mansion(d)
    for i, (c, ch) in enumerate(GENTE):   # el equipo, de espaldas, camino a la puerta
        persona(d, 44 + i * 13, 146 - (i % 2) * 3, c, ch, espalda=True)
    guardar(im, '1-mansion.png')


def escena_fantasma():
    im, d = lienzo((46, 28, 38))
    d.rectangle([0, 112, T, T], fill=(30, 18, 24))
    for y in range(116, T, 8):
        d.line([(0, y), (T, y)], fill=(40, 24, 32))
    for x in range(0, T, 25):                                   # el tapiz
        d.line([(x, 0), (x, 112)], fill=(54, 34, 46))
    d.rectangle([0, 104, T, 112], fill=(60, 38, 30))            # el zócalo
    # la puerta doble, tapiada y con cadena
    d.rectangle([46, 30, 104, 112], fill=(24, 14, 12)); d.rectangle([49, 33, 74, 112], fill=(96, 60, 34)); d.rectangle([76, 33, 101, 112], fill=(96, 60, 34))
    for x in (55, 82):
        d.rectangle([x, 40, x + 13, 66], outline=(70, 42, 24)); d.rectangle([x, 74, x + 13, 104], outline=(70, 42, 24))
    d.line([(44, 50), (106, 62)], fill=(130, 90, 50), width=5); d.line([(44, 88), (106, 76)], fill=(130, 90, 50), width=5)
    for x in range(48, 104, 4):
        d.point((x, 98 + (x // 4) % 2), fill=(190, 190, 204)); d.point((x + 1, 98 + (x // 4) % 2), fill=(120, 120, 134))
    # las grietas y los cascotes que caen
    d.line([(18, 0), (22, 14), (16, 26), (24, 40), (20, 52)], fill=NEGRO); d.line([(130, 0), (126, 18), (134, 30), (128, 46)], fill=NEGRO)
    d.line([(24, 40), (32, 44)], fill=NEGRO); d.line([(126, 18), (118, 22)], fill=NEGRO)
    r = random.Random(11)
    for _ in range(9):
        x, y = r.choice((r.randrange(6, 40), r.randrange(110, 144))), r.randrange(8, 100)
        d.rectangle([x, y, x + r.randrange(2, 5), y + r.randrange(1, 4)], fill=(110, 84, 80))
        d.line([(x + 1, y - 5), (x + 1, y - 2)], fill=(74, 52, 58))
    # el fantasma: resplandor, cuerpo que se deshace abajo, pelo largo
    for k, c in ((19, (62, 48, 78)), (16, (78, 68, 108))):
        d.ellipse([75 - k, 34 - k // 3, 75 + k, 98], fill=c)
    cuerpo = (206, 222, 250)
    d.polygon([(64, 58), (86, 58), (91, 92), (86, 88), (82, 96), (77, 89), (72, 97), (67, 88), (60, 93)], fill=cuerpo)
    d.rectangle([56, 62, 63, 65], fill=cuerpo); d.rectangle([87, 62, 94, 65], fill=cuerpo); d.rectangle([54, 64, 56, 70], fill=cuerpo); d.rectangle([94, 64, 96, 70], fill=cuerpo)
    d.rectangle([69, 44, 81, 58], fill=(226, 236, 252))
    d.rectangle([67, 41, 83, 46], fill=(28, 20, 48)); d.rectangle([65, 44, 68, 74], fill=(28, 20, 48)); d.rectangle([82, 44, 85, 74], fill=(28, 20, 48))
    d.rectangle([71, 50, 73, 51], fill=(170, 30, 40)); d.rectangle([77, 50, 79, 51], fill=(170, 30, 40)); d.rectangle([73, 55, 77, 55], fill=(40, 30, 60))
    for i, (c, ch) in enumerate(GENTE):   # el equipo, de espaldas, al frente
        persona(d, 30 + i * 21, 148 - (i % 2) * 2, c, ch, espalda=True)
    guardar(im, '2-fantasma.png')


def escena_cinco(caida=None):
    """Los cinco en fila, cada quien con su cosa encima; en un lienzo de 125 (a 6x) para que se vean más grandes."""
    im, d = lienzo(NEGRO, 125)
    d.rectangle([0, 0, 125, 90], fill=(26, 22, 40)); d.rectangle([0, 90, 125, 125], fill=(40, 30, 36))
    for x in range(0, 125, 25):
        d.line([(x, 0), (x, 90)], fill=(32, 28, 50))
    for y in range(97, 125, 8):
        d.line([(0, y), (125, y)], fill=(50, 38, 44))
    for i, (c, ch) in enumerate(GENTE):
        x = 4 + i * 25
        d.rectangle([x, 26, x + 17, 43], fill=(14, 12, 26), outline=(200, 200, 216) if i != caida else (90, 90, 104))
        if i == caida:
            d.line([(x + 5, 31), (x + 12, 38)], fill=(214, 48, 48), width=2); d.line([(x + 12, 31), (x + 5, 38)], fill=(214, 48, 48), width=2)
            # la lápida donde estaba
            d.rectangle([x + 3, 74, x + 14, 90], fill=(120, 120, 134)); d.ellipse([x + 3, 68, x + 14, 80], fill=(120, 120, 134))
            d.rectangle([x + 8, 73, x + 9, 85], fill=(60, 60, 74)); d.rectangle([x + 5, 76, x + 12, 77], fill=(60, 60, 74))
            d.rectangle([x + 1, 90, x + 16, 91], fill=(30, 22, 28))
            continue
        COSAS[i](d, x + 2, 28)
        d.line([(x + 8, 44), (x + 8, 54)], fill=(90, 90, 104))
        persona(d, x + 5, 90, c, ch)
        d.rectangle([x + 2, 91, x + 15, 92], fill=(30, 22, 28))
    guardar(im, '4-quien-muere.png' if caida is not None else '3-cinco.png')


def escena_cartucho():
    im, d = lienzo((16, 14, 34))
    r = random.Random(5)
    for _ in range(40):
        d.point((r.randrange(T), r.randrange(T)), fill=(40, 36, 70))
    # un cartucho genérico (dibujo nuestro, no la carátula): plástico, etiqueta con el nombre y la muesca
    d.rectangle([24, 30, 126, 98], fill=(60, 30, 40)); d.rectangle([22, 34, 128, 94], fill=(150, 40, 52))
    d.rectangle([22, 34, 128, 36], fill=(184, 70, 80)); d.rectangle([22, 92, 128, 94], fill=(104, 26, 38))
    d.rectangle([30, 42, 120, 78], fill=(236, 230, 206)); d.rectangle([30, 42, 120, 44], fill=(240, 200, 80))
    texto(d, (75, 50), 'SWEET', (40, 20, 30)); texto(d, (75, 62), 'HOME', (40, 20, 30))
    for x in range(34, 118, 12):
        d.rectangle([x, 84, x + 6, 88], fill=(104, 26, 38))
    d.rectangle([58, 98, 92, 102], fill=(60, 30, 40))
    texto(d, (75, 112), '1989', (240, 200, 80), 16)
    # la bandera: sólo salió en Japón
    d.rectangle([64, 134, 86, 147], fill=(238, 238, 238)); d.ellipse([71, 136, 79, 144], fill=(214, 48, 48))
    guardar(im, '5-cartucho.png')


def escena_legado():
    im, d = lienzo(NOCHE); cielo(d, rayo=True); mansion(d, luces=False)
    d.rectangle([0, 124, T, T], fill=NEGRO)
    texto(d, (26, 133), '1989', (154, 154, 168)); texto(d, (124, 133), '1996', (240, 200, 80))
    d.line([(50, 136), (96, 136)], fill=(240, 200, 80), width=2); d.polygon([(96, 131), (104, 136), (96, 141)], fill=(240, 200, 80))
    guardar(im, '6-legado.png')


if __name__ == '__main__':
    escena_mansion(); escena_fantasma(); escena_cinco(); escena_cinco(caida=2); escena_cartucho(); escena_legado()
    print('listo:', sorted(os.listdir(SALIDA)))
