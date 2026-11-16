#!/usr/bin/env python3
"""Arma un Short de «¿Lo conoces?» (la trama de un juego retro poco conocido, contada por LeIA con la fórmula de
Adrián del 14-nov-2026) a partir de su ficha: lo-conoces/<juego>.json, con los hechos y sus fuentes, las escenas
(un dibujo pixel propio por escena, en lo-conoces/<juego>/, y lo que dice LeIA en es/en/ja) y el cierre.

  "/Users/jadhasfuh/Documents/code challenge/.venv/bin/python" tools/comerciales/lo-conoces/armar.py sweet-home [es en ja] [--seco]

Escribe salida/<clave>[-en|-ja].json (el guion de comercial.py) y arma salida/<clave>[-en|-ja].mp4. No toca
youtube.json: es un piloto hasta que Adrián apruebe el formato.
"""
import json, os, subprocess, sys

AQUI = os.path.dirname(os.path.abspath(__file__)); COM = os.path.dirname(AQUI)
VOZ = {'es': ('es-US-Chirp3-HD-Achernar', 'es-US'), 'en': ('en-US-Chirp3-HD-Achernar', 'en-US'), 'ja': ('ja-JP-Chirp3-HD-Achernar', 'ja-JP')}
MARCA = {'es': ('Un reto nuevo cada día', 'Gratis, en el navegador y sin descargar'), 'en': ('A new challenge every day', 'Free, in your browser, no download'),
         'ja': ('毎日新しいチャレンジ', '無料・ブラウザで・ダウンロード不要')}


def renglones(texto, lang):
    """Cuántos renglones ocupa en el cuadro de diálogo vertical de comercial.py (642 px: 23 letras de Press Start a
    27 px, o 26 caracteres japoneses a 24 px). Caben 5: el sexto se sale del cuadro y comercial.py no avisa."""
    if lang == 'ja':
        return -(-len(texto) // 26)
    n, largo = 1, 0
    for palabra in texto.split():
        if largo and largo + 1 + len(palabra) > 23:
            n += 1; largo = len(palabra)
        else:
            largo += (1 if largo else 0) + len(palabra)
    return n


def guion(ficha, juego, lang):
    clave = ficha['clave'] + ('' if lang == 'es' else '-' + lang)
    escenas = []
    for e in ficha['escenas'] + [ficha['pregunta']]:   # una escena de comercial.py por frase, con el mismo dibujo y el mismo título
        for frase in e[lang]['frases']:
            escenas.append({'imagen': os.path.join(AQUI, juego, e['imagen']), 'ancho': 750, 'radio': 12, 'cara': e['cara'], 'texto': e[lang]['texto'], 'voz': frase})
    escenas.append({'final': True, 'cara': 'guino', **ficha['cierre'][lang]})
    for e in escenas:
        if renglones(e.get('dice') or e['voz'], lang) > 5:
            sys.exit(f"{clave}: no cabe en el cuadro de diálogo (más de 5 renglones): {e['voz']}")
    return clave, {
        'fuente': 'pixel-ja' if lang == 'ja' else 'pixel', 'salida': os.path.join(COM, 'salida', clave + '.mp4'), 'voz': VOZ[lang][0], 'idioma': VOZ[lang][1],
        'bpm': 84, 'acercamiento': False, 'presentadora': {'nombre': 'LeIA', 'caras': os.path.join(COM, 'avatar')},
        'colores': {'fondo': '#000000', 'acento': '#f0c850', 'texto': '#ffffff', 'tenue': '#9a9aa8', 'sobre_acento': '#000000', 'borde': '#3a3a48'},
        'marca': {'logo': os.path.join(COM, 'dc', 'logo.png'), 'logo_ancho': 944, 'lema': MARCA[lang][0], 'sitio': 'dailychallenge.click', 'pie': MARCA[lang][1]},
        'escenas': escenas}


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    juego = args[0]; idiomas = args[1:] or ['es']
    ficha = json.load(open(os.path.join(AQUI, juego + '.json'), encoding='utf-8'))
    for lang in idiomas:
        clave, g = guion(ficha, juego, lang)
        ruta = os.path.join(COM, 'salida', clave + '.json')
        json.dump(g, open(ruta, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print(clave, '->', ruta, flush=True)
        if '--seco' not in sys.argv:
            subprocess.run([sys.executable, os.path.join(COM, 'comercial.py'), ruta], check=True)


if __name__ == '__main__':
    main()
