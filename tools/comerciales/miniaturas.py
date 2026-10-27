#!/usr/bin/env python3
"""Miniaturas de 1280x720 para los vídeos largos de YouTube (27-oct-2026): texto grande, la marca y, en los
de juegos, LeIA con su cara (avatar/leia-<cara>.png, a 6x sin suavizar). Deja salida/<nombre>.jpg.

  python3 tools/comerciales/miniaturas.py
"""
import os, subprocess
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg

AQUI = os.path.dirname(os.path.abspath(__file__))
SAL = os.path.join(AQUI, 'salida')
AVENIR = '/System/Library/Fonts/Avenir Next.ttc'
JAPONESA = os.path.expanduser('~/Documents/jlptest/fuentes/ipaexg.ttf')
PIXEL = os.path.expanduser('~/Documents/daily challenge/src/fonts/PressStart2P-Regular.ttf')
FF = imageio_ffmpeg.get_ffmpeg_exe()
W, H = 1280, 720


def av(peso, tam):
    return ImageFont.truetype(AVENIR, tam, index={'heavy': 8, 'bold': 0, 'demi': 2}[peso])


def cuadro(video, t, recorte=None):
    """Un cuadro de un vídeo (para el fondo)."""
    b = subprocess.run([FF, '-loglevel', 'error', '-ss', str(t), '-i', video, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True).stdout
    import io
    im = Image.open(io.BytesIO(b)).convert('RGB')
    return im.crop(recorte) if recorte else im


def leia(cara, alto=440):
    im = Image.open(os.path.join(AQUI, 'avatar', f'leia-{cara}.png')).convert('RGBA')
    # el retrato de la IA trae fondo azul liso: se quita rellenando desde las esquinas de arriba, para recortarla
    for xy in ((0, 0), (im.size[0] - 1, 0), (0, im.size[1] // 2), (im.size[0] - 1, im.size[1] // 2)):
        if im.getpixel(xy)[3]:
            ImageDraw.floodfill(im, xy, (0, 0, 0, 0), thresh=60)
    k = max(1, alto // im.size[1])   # a escala entera (el retrato de la IA mide 128)
    return im.resize((im.size[0] * k, im.size[1] * k), Image.NEAREST)


def jlptest():
    im = Image.new('RGB', (W, H), (22, 24, 38)); d = ImageDraw.Draw(im)
    d.text((80, 90), 'JLPT N5', font=av('bold', 64), fill=(145, 132, 217))
    d.text((74, 160), '100', font=av('heavy', 250), fill=(255, 255, 255))
    d.text((80, 430), 'palabras esenciales', font=av('heavy', 76), fill=(255, 255, 255))
    d.text((80, 530), 'con audio · escucha y repite', font=av('demi', 46), fill=(170, 170, 190))
    fj = ImageFont.truetype(JAPONESA, 170)
    d.text((1000, 340), '日本語', font=fj, fill=(255, 255, 255), anchor='mm')
    d.text((1000, 215), 'にほんご', font=ImageFont.truetype(JAPONESA, 50), fill=(150, 150, 170), anchor='mm')
    fm = av('heavy', 62); w = d.textlength('jlptest', font=fm)   # la marca, con su punto rojo
    d.text((1000 - w / 2 - 10, 560), 'jlptest', font=fm, fill=(255, 255, 255), anchor='ls')
    d.ellipse([1000 + w / 2 - 4, 540, 1000 + w / 2 + 14, 558], fill=(215, 38, 61))
    im.save(os.path.join(SAL, 'jlptest-n5-largo.jpg'), quality=92)


def juego(nombre, fondo, titulo, sub, cara, acento, logo=None):
    """Fondo de partida oscurecido, el título en letra pixel y LeIA a la derecha."""
    im = fondo.resize((W, round(fondo.size[1] * W / fondo.size[0])), Image.NEAREST)
    if im.size[1] < H:
        im = fondo.resize((round(fondo.size[0] * H / fondo.size[1]), H), Image.NEAREST)
    im = im.crop((0, 0, W, H)).convert('RGBA')
    velo = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dv = ImageDraw.Draw(velo)
    for x in range(W):   # más oscuro a la izquierda, donde va el texto
        dv.line([(x, 0), (x, H)], fill=(0, 0, 0, round(215 - 120 * x / W)))
    im.alpha_composite(velo)
    d = ImageDraw.Draw(im)
    y = 120
    if logo:   # el logo del juego, en pixel art: se agranda sin suavizar
        lg = Image.open(os.path.join(AQUI, logo)).convert('RGBA'); k = min(300 / lg.size[1], 620 / lg.size[0])
        lg = lg.resize((round(lg.size[0] * k), round(lg.size[1] * k)), Image.NEAREST); im.alpha_composite(lg, (60, 40)); y = 70 + lg.size[1]
    for linea in titulo.split('\n'):
        d.text((70, y), linea, font=ImageFont.truetype(PIXEL, 74), fill=(255, 255, 255), stroke_width=4, stroke_fill=(0, 0, 0)); y += 110
    d.text((74, y + 20), sub, font=av('heavy', 52), fill=acento, stroke_width=3, stroke_fill=(0, 0, 0))
    l = leia(cara); im.alpha_composite(l, (W - l.size[0] - 20, H - l.size[1]))
    d.text((W - 250, 40), 'LeIA', font=ImageFont.truetype(PIXEL, 40), fill=acento, stroke_width=3, stroke_fill=(0, 0, 0))
    im.convert('RGB').save(os.path.join(SAL, f'{nombre}.jpg'), quality=92)


if __name__ == '__main__':
    os.makedirs(SAL, exist_ok=True)
    jlptest()
    fondo = cuadro(os.path.join(AQUI, 'dc/reels/pacman.mp4'), 3.0, (60, 470, 1020, 1568))
    juego('dc-semana-largo', fondo, '7 DÍAS\n7 JUEGOS', 'Daily Challenge', 'sorpresa', (147, 226, 221))
    import sys
    t = float(sys.argv[sys.argv.index('--wz') + 1]) if '--wz' in sys.argv else 138.6
    fondo = cuadro(os.path.join(AQUI, 'warzone-cpu/largo-editado.mp4'), t)
    juego('warzone-cpu-largo', fondo, 'CPU vs CPU', '4 contra 4 en el volcán', 'sorpresa', (232, 224, 122), logo='warzone/logo.png')
    fondo = cuadro(os.path.join(AQUI, 'kazan-cpu/largo.mp4'), 295.0, (0, 30, 960, 438))
    juego('kazan-cpu-largo', fondo, '8 CPU\n1 VOLCÁN', 'sólo una sobrevive', 'sorpresa', (242, 160, 61), logo='kazan/logo.png')
    print('miniaturas en', SAL)
