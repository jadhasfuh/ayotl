#!/usr/bin/env python3
"""Las escenas pixel de «¿Lo conoces?» para Snatcher (Konami, PC-8801 y MSX2, 1988), dibujadas aquí con código: nada
de capturas, carátulas ni sprites del juego. Lienzos de 150x150 a 5x (750x750), con las herramientas de
arte_sweet_home.py y el detective de arte_portopia.py. El único texto dentro del dibujo es el nombre del juego, el
del escuadrón y los años.

  "/Users/jadhasfuh/Documents/code challenge/.venv/bin/python" tools/comerciales/lo-conoces/arte_snatcher.py
"""
import os, random
import arte_sweet_home as b
import arte_portopia as pt
from arte_sweet_home import lienzo, guardar, texto, NEGRO, T

b.SALIDA = os.path.join(b.AQUI, 'snatcher')   # después de importar arte_portopia, que pone la suya
ORO, ROJO, CREMA, GRIS, PLATA = (240, 200, 80), (214, 48, 48), (236, 230, 206), (154, 154, 168), (206, 210, 224)
ROSA, CIAN, MORADO = (240, 90, 170), (90, 220, 230), (110, 60, 150)
PIEL = b.PIEL


def robot(d, x, y):
    """El robot que acompaña al detective: una cajita con un ojo, antena y dos patas (dibujo nuestro)."""
    d.rectangle([x, y - 12, x + 9, y - 4], fill=(120, 130, 150)); d.rectangle([x, y - 12, x + 9, y - 11], fill=PLATA)
    d.rectangle([x + 3, y - 9, x + 6, y - 7], fill=NEGRO); d.point((x + 5, y - 8), fill=ROJO)
    d.line([(x + 5, y - 13), (x + 5, y - 17)], fill=GRIS); d.point((x + 5, y - 18), fill=CIAN)
    d.rectangle([x + 1, y - 4, x + 2, y], fill=(80, 86, 104)); d.rectangle([x + 7, y - 4, x + 8, y], fill=(80, 86, 104))
    d.rectangle([x, y, x + 3, y], fill=(80, 86, 104)); d.rectangle([x + 6, y, x + 9, y], fill=(80, 86, 104))


def escena_ciudad():
    im, d = lienzo((14, 8, 30))
    r = random.Random(42)
    for y0, c in ((0, (14, 8, 30)), (50, (26, 12, 46)), (90, (44, 18, 62))):
        d.rectangle([0, y0, T, T], fill=c)
    x = 0
    while x < T:   # los rascacielos, con ventanas y letreros de neón
        an, al = r.randrange(12, 24), r.randrange(50, 108)
        d.rectangle([x, 122 - al, x + an, 122], fill=(10, 8, 20))
        for wy in range(122 - al + 4, 118, 6):
            for wx in range(x + 2, x + an - 1, 4):
                if r.random() < .4:
                    d.point((wx, wy), fill=r.choice((ORO, CIAN, ROSA)))
        if r.random() < .6:
            ny = 122 - al + r.randrange(8, 30); col = r.choice((ROSA, CIAN))
            d.rectangle([x + 2, ny, x + an - 2, ny + 6], outline=col); d.line([(x + 4, ny + 3), (x + an - 4, ny + 3)], fill=col)
        x += an + 1
    d.polygon([(96, 34), (118, 34), (122, 38), (92, 38)], fill=(60, 60, 80)); d.rectangle([100, 30, 112, 34], fill=(90, 220, 230))   # un coche que vuela
    d.point([(92, 39), (122, 39)], fill=ROSA)
    d.rectangle([0, 122, T, T], fill=(20, 14, 30))                                                # la calle mojada
    for _ in range(40):
        wx = r.randrange(T); wy = r.randrange(124, T); d.line([(wx, wy), (wx + 4, wy)], fill=r.choice(((60, 30, 80), (30, 60, 80))))
    for _ in range(70):                                                                           # la lluvia
        wx = r.randrange(T); wy = r.randrange(0, 120); d.line([(wx, wy), (wx - 1, wy + 3)], fill=(70, 70, 110))
    pt.jefe(d, 70, 146)
    guardar(im, '1-ciudad.png')


def escena_snatcher():
    im, d = lienzo((18, 12, 28)); pt.estrellas(d, 3, 30)
    # una cara partida: media de persona, media de máquina
    d.rectangle([45, 30, 105, 112], fill=PIEL)
    d.rectangle([75, 30, 105, 112], fill=(150, 156, 172))                       # la mitad de metal
    d.rectangle([41, 22, 109, 36], fill=b.PELO); d.rectangle([41, 30, 46, 70], fill=b.PELO); d.rectangle([104, 30, 109, 60], fill=(110, 116, 132))
    d.rectangle([54, 56, 66, 62], fill=CREMA); d.rectangle([58, 56, 62, 62], fill=(60, 40, 30))          # el ojo humano
    d.rectangle([52, 50, 68, 51], fill=b.PELO)
    d.rectangle([82, 52, 98, 66], fill=(30, 30, 44)); d.rectangle([87, 57, 93, 61], fill=ROJO); d.point((90, 59), fill=(250, 200, 200))   # el ojo de máquina
    d.rectangle([70, 70, 74, 82], fill=(200, 150, 110)); d.rectangle([75, 70, 79, 82], fill=(110, 116, 132))                              # la nariz
    d.rectangle([56, 92, 74, 95], fill=(170, 80, 80))
    for i in range(5):                                                                                   # los dientes de metal
        d.rectangle([76 + i * 5, 90, 79 + i * 5, 97], fill=CREMA); d.rectangle([76 + i * 5, 90, 79 + i * 5, 97], outline=(60, 60, 74))
    d.line([(75, 30), (75, 112)], fill=NEGRO); d.line([(75, 44), (71, 48), (75, 52)], fill=NEGRO); d.line([(75, 84), (79, 88), (75, 92)], fill=NEGRO)
    for px, py in ((84, 40), (96, 44), (100, 74), (84, 104), (98, 100)):                                 # tornillos
        d.point((px, py), fill=(60, 60, 74))
    d.rectangle([45, 112, 105, 150], fill=(40, 50, 90)); d.polygon([(60, 112), (75, 126), (90, 112)], fill=CREMA)
    texto(d, (24, 60), '?', ROSA, 16); texto(d, (128, 60), '?', CIAN, 16)
    guardar(im, '2-snatcher.png')


def escena_junker():
    im, d = lienzo((22, 26, 44))
    for x in range(0, T, 25):
        d.line([(x, 0), (x, 104)], fill=(30, 34, 56))
    d.rectangle([0, 104, T, T], fill=(40, 44, 60))
    for y in range(112, T, 9):
        d.line([(0, y), (T, y)], fill=(50, 54, 72))
    # la pantalla del cuartel
    d.rectangle([30, 18, 120, 62], fill=(10, 14, 24), outline=GRIS, width=2)
    texto(d, (75, 28), 'JUNKER', CIAN, 8)
    for i, an in enumerate((60, 44, 52)):
        d.line([(40, 44 + i * 5), (40 + an, 44 + i * 5)], fill=(40, 110, 120))
    d.rectangle([112, 56, 116, 58], fill=ROJO)
    pt.jefe(d, 58, 138, espalda=False)
    d.rectangle([67, 124, 72, 125], fill=(60, 60, 74)); d.rectangle([71, 124, 72, 127], fill=(60, 60, 74))   # la pistola
    robot(d, 86, 138)
    guardar(im, '3-junker.png')


def disquete(d, x, y, lado, etiqueta=None, num=None, punteado=False):
    """Un disquete de 5¼ genérico: la funda negra, el agujero y la ranura; o sólo su contorno punteado."""
    if punteado:
        for i in range(0, lado, 4):
            d.point([(x + i, y), (x + i, y + lado), (x, y + i), (x + lado, y + i)], fill=GRIS)
        return
    d.rectangle([x, y, x + lado, y + lado], fill=(26, 26, 32), outline=(70, 70, 84))
    c = lado // 2; rr = max(4, lado // 7)
    d.ellipse([x + c - rr, y + c - rr, x + c + rr, y + c + rr], fill=(90, 70, 50)); d.ellipse([x + c - rr // 2, y + c - rr // 2, x + c + rr // 2, y + c + rr // 2], fill=(16, 14, 34))
    d.rounded_rectangle([x + c - 2, y + lado - lado // 3, x + c + 2, y + lado - 4], 2, fill=(90, 70, 50))
    d.rectangle([x + lado - 3, y + lado // 4, x + lado, y + lado // 4 + 3], fill=(16, 14, 34))
    if etiqueta:
        d.rectangle([x + 4, y + 4, x + lado - 4, y + lado // 4 + 4], fill=CREMA); d.rectangle([x + 4, y + 4, x + lado - 4, y + 6], fill=ROSA)
        texto(d, (x + c, y + 10), etiqueta, (30, 26, 40), 8)
    if num:
        d.rectangle([x + 4, y + 4, x + 16, y + 16], fill=CREMA); texto(d, (x + 10, y + 6), num, (30, 26, 40), 8)


def escena_continuara():
    im, d = lienzo((16, 14, 34)); pt.estrellas(d, 21, 50)
    disquete(d, 8, 50, 40, num='1'); disquete(d, 55, 50, 40, num='2'); disquete(d, 102, 50, 40, punteado=True)
    texto(d, (122, 62), '?', ORO, 16)
    d.line([(20, 106), (130, 106)], fill=GRIS); d.rectangle([20, 103, 88, 109], fill=CIAN); d.rectangle([20, 103, 130, 109], outline=GRIS)   # la barra: hasta ahí llega
    for i in range(3):
        d.rectangle([98 + i * 10, 120, 102 + i * 10, 124], fill=ORO)   # …
    guardar(im, '4-continuara.png')


def escena_disquete():
    im, d = lienzo((16, 14, 34)); pt.estrellas(d)
    disquete(d, 35, 22, 80, etiqueta='SNATCHER')
    texto(d, (75, 112), '1988', ORO, 16)
    d.rectangle([64, 134, 86, 147], fill=(238, 238, 238)); d.ellipse([71, 136, 79, 144], fill=ROJO)
    guardar(im, '5-disquete.png')


def escena_legado():
    im, d = lienzo((16, 14, 34)); pt.estrellas(d, 13, 60)
    # 1982: una claqueta de cine. 1988: el disquete
    d.rectangle([14, 52, 56, 80], fill=(30, 30, 40), outline=CREMA)
    d.polygon([(14, 50), (56, 42), (56, 48), (14, 56)], fill=CREMA)
    for i in range(4):
        d.polygon([(18 + i * 10, 49), (23 + i * 10, 48), (20 + i * 10, 54), (15 + i * 10, 55)], fill=(30, 30, 40))
    for ly in (60, 66, 72):
        d.line([(19, ly), (51, ly)], fill=GRIS)
    disquete(d, 98, 44, 38)
    texto(d, (35, 92), '1982', GRIS); texto(d, (117, 92), '1988', ORO)
    d.line([(62, 64), (84, 64)], fill=ORO, width=2); d.polygon([(84, 59), (92, 64), (84, 69)], fill=ORO)
    robot(d, 70, 138)
    guardar(im, '6-legado.png')


if __name__ == '__main__':
    escena_ciudad(); escena_snatcher(); escena_junker(); escena_continuara(); escena_disquete(); escena_legado()
    print('listo:', sorted(os.listdir(b.SALIDA)))
