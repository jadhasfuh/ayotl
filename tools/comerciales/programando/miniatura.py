#!/usr/bin/env python3
"""La miniatura (1280x720) de un vídeo de «Programando …»: el título en pixel, el código apagado de fondo, la serpiente y LeIA.

  "/Users/jadhasfuh/Documents/code challenge/.venv/bin/python" tools/comerciales/programando/miniatura.py snake1 [--idioma en]
"""
import argparse, importlib, os, sys
AQUI = os.path.dirname(os.path.abspath(__file__)); COMERCIALES = os.path.dirname(AQUI)
for ruta in (COMERCIALES, os.path.join(COMERCIALES, 'algoritmos'), AQUI):
    sys.path.insert(0, ruta)
from PIL import Image, ImageDraw
import miniaturas
import renderizador as R
from renderizador import PAL, atari, mascara, mezcla, resaltar, texto

W, H = 1280, 720
ap = argparse.ArgumentParser(); ap.add_argument('video'); ap.add_argument('--idioma', default='es'); a = ap.parse_args()
mod = importlib.import_module(a.video); t1, t2, t3 = mod.TITULO[a.idioma]
im = Image.new('RGB', (W, H), atari(9, 0)); d = ImageDraw.Draw(im)
# el código de verdad, apagado, de fondo
ls = mod.FINAL['snake.js'].split('\n'); i0 = next(i for i, l in enumerate(ls) if 'update(mask)' in l)
for n, l in enumerate(ls[i0:i0 + 20]):
    x = 300
    for t, c in resaltar(l):
        if c != 'ws':
            m = mascara(t, 3); im.paste(mezcla(R.SINTAXIS[c], atari(9, 0), 0.5), (x, 10 + n * 36 - 9), m)
        x += 24 * len(t)
# más oscuro a la izquierda, donde va el título
velo = Image.new('L', (W, H), 0); dv = ImageDraw.Draw(velo)
for x in range(W):
    dv.line([(x, 0), (x, H)], fill=max(0, round(245 * (1 - x / 1150))))
im.paste(Image.new('RGB', (W, H), (2, 4, 16)), (0, 0), velo); d = ImageDraw.Draw(im)


def grande(x, y, s, color, k):
    """Letra pixel con borde negro."""
    m = mascara(s, k)
    for dx in (-k, 0, k):
        for dy in (-k, 0, k):
            im.paste((0, 0, 0), (x + dx, y - 3 * k + dy), m)
    im.paste(color, (x, y - 3 * k), m)


grande(48, 56, t1, PAL['cyan'], 8 if len(t1) < 12 else 7)
grande(48, 156, t2, PAL['lgreen'], 19)
grande(52, 340, t3, PAL['yellow'], 8)
# la serpiente, de casillas de 48, que sale por la izquierda y va hacia la fruta
celdas = [(-1, 1), (0, 1), (1, 1), (2, 1), (3, 1), (3, 0), (4, 0), (5, 0), (6, 0), (6, 1), (7, 1), (8, 1), (9, 1)]
L, X0, Y0 = 56, 36, 470
for i, (x, y) in enumerate(celdas):
    c = PAL['lgreen'] if i == len(celdas) - 1 else PAL['green']; p = (X0 + x * L, Y0 + y * L)
    d.rectangle([p[0] - 5, p[1] - 5, p[0] + L + 3, p[1] + L + 3], fill=(0, 0, 0))
for i, (x, y) in enumerate(celdas):
    c = PAL['lgreen'] if i == len(celdas) - 1 else PAL['green']; p = (X0 + x * L, Y0 + y * L)
    d.rectangle([p[0], p[1], p[0] + L - 3, p[1] + L - 3], fill=c, outline=mezcla(c, (0, 0, 0), 0.3), width=5)
d.rectangle([X0 + 11 * L - 14, Y0 + L + 8, X0 + 11 * L + 26, Y0 + L + 47], fill=PAL['red'], outline=(0, 0, 0), width=4)
grande(52, 640, mod.SUBTITULO[a.idioma], PAL['white'], 4)
l = miniaturas.leia('feliz', 512).convert('RGBA'); im.paste(l, (W - l.size[0] + 10, H - l.size[1]), l)
ruta = os.path.join(COMERCIALES, 'salida', f"programando-{mod.CLAVE}{'' if a.idioma == 'es' else '-' + a.idioma}.jpg")
im.save(ruta, quality=92); print(ruta)
