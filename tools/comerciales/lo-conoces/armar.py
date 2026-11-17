#!/usr/bin/env python3
"""Arma un Short de «¿Lo conoces?» (la trama de un juego retro poco conocido, contada por LeIA con la fórmula de
Adrián del 14-nov-2026) a partir de su ficha: lo-conoces/<juego>.json, con los hechos y sus fuentes, las escenas
(un dibujo pixel propio por escena, en lo-conoces/<juego>/, y lo que dice LeIA en es/en/ja) y el cierre.

  "/Users/jadhasfuh/Documents/code challenge/.venv/bin/python" tools/comerciales/lo-conoces/armar.py sweet-home [es en ja] [--seco]
      [--publicar AAAA-MM-DD]

Escribe salida/<clave>[-en|-ja].json (el guion de comercial.py) y arma salida/<clave>[-en|-ja].mp4. Con --publicar
no arma nada: apunta en youtube.json los vídeos ya armados y revisados, ese día a las 13:00 (es), 13:20 (en) y 13:40
(ja), con el título y la descripción de `youtube` en la ficha (app `loconoces`), y manda el español a Instagram y
Facebook con dc-social.py (--sin-social para no hacerlo). Los sube subir-youtube.py. Como
los demás, escribe youtube.json: nunca a la vez. Adrián aprobó el formato con el piloto de Sweet Home (16-nov-2026).
"""
import json, os, subprocess, sys

AQUI = os.path.dirname(os.path.abspath(__file__)); COM = os.path.dirname(AQUI)
VOZ = {'es': ('es-US-Chirp3-HD-Achernar', 'es-US'), 'en': ('en-US-Chirp3-HD-Achernar', 'en-US'), 'ja': ('ja-JP-Chirp3-HD-Achernar', 'ja-JP')}
HORA = {'es': '13:00', 'en': '13:20', 'ja': '13:40'}
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
        # el título, en un renglón: con dos, la tarjeta baja y el cuadro de diálogo le tapa el borde (Snatcher, 17-nov-2026)
        ancho = sum(1 if ord(ch) > 0x2E7F else 0.5 for ch in e.get('texto', '')) if lang == 'ja' else len(e.get('texto', ''))   # en japonés, lo latino mide la mitad
        if ancho > (13 if lang == 'ja' else 23):
            sys.exit(f"{clave}: el título no cabe en un renglón ({ancho:g} letras): {e['texto']}")
        if renglones(e.get('dice') or e['voz'], lang) > 5:
            sys.exit(f"{clave}: no cabe en el cuadro de diálogo (más de 5 renglones): {e['voz']}")
    return clave, {
        'fuente': 'pixel-ja' if lang == 'ja' else 'pixel', 'salida': os.path.join(COM, 'salida', clave + '.mp4'), 'voz': VOZ[lang][0], 'idioma': VOZ[lang][1],
        'bpm': 84, 'acercamiento': False, 'presentadora': {'nombre': 'LeIA', 'caras': os.path.join(COM, 'avatar')},
        'colores': {'fondo': '#000000', 'acento': '#f0c850', 'texto': '#ffffff', 'tenue': '#9a9aa8', 'sobre_acento': '#000000', 'borde': '#3a3a48'},
        'marca': {'logo': os.path.join(COM, 'dc', 'logo.png'), 'logo_ancho': 944, 'lema': MARCA[lang][0], 'sitio': 'dailychallenge.click', 'pie': MARCA[lang][1]},
        'escenas': escenas}


def planear(ficha, idiomas, fecha):
    ruta = os.path.join(COM, 'youtube.json'); plan = json.load(open(ruta, encoding='utf-8'))
    for lang in idiomas:
        clave = ficha['clave'] + ('' if lang == 'es' else '-' + lang)
        if not os.path.exists(os.path.join(COM, 'salida', clave + '.mp4')):
            sys.exit(f'falta salida/{clave}.mp4: ármalo antes de --publicar')
        v = {'clave': clave, 'app': 'loconoces', 'video': f'salida/{clave}.mp4', 'categoria': '20', 'publicar': f'{fecha}T{HORA[lang]}:00-06:00', **ficha['youtube'][lang]}
        if lang != 'es':
            v['idioma'] = lang
        viejo = next((x for x in plan if x['clave'] == clave), None)
        if viejo and viejo.get('id'):
            sys.exit(f'{clave} ya está subido ({viejo["id"]}): no se toca')
        plan = [x for x in plan if x['clave'] != clave] + [v]
        print(f"  plan: {clave} sale el {v['publicar']}")
    json.dump(plan, open(ruta, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    # el español también a Instagram y Facebook, ese día a las 13:00 (el hueco de los anuncios de Daily Challenge): el
    # 16-nov-2026 los tres primeros no estaban apuntados y hubo que mandarlos a mano. Si el hueco está ocupado, dc-social
    # se niega y lo dice: se le busca otro día con `dc-social.py <clave> --hueco anuncio --dia AAAA-MM-DD`.
    if 'es' in idiomas and '--sin-social' not in sys.argv:
        subprocess.run([sys.executable, os.path.join(COM, 'dc-social.py'), ficha['clave'], '--hueco', 'anuncio'])


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    fecha = sys.argv[sys.argv.index('--publicar') + 1] if '--publicar' in sys.argv else None
    args = [a for a in args if a != fecha]
    juego = args[0]; idiomas = args[1:] or ['es']
    ficha = json.load(open(os.path.join(AQUI, juego + '.json'), encoding='utf-8'))
    if fecha:
        return planear(ficha, idiomas, fecha)
    for lang in idiomas:
        clave, g = guion(ficha, juego, lang)
        ruta = os.path.join(COM, 'salida', clave + '.json')
        json.dump(g, open(ruta, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print(clave, '->', ruta, flush=True)
        if '--seco' not in sys.argv:
            subprocess.run([sys.executable, os.path.join(COM, 'comercial.py'), ruta], check=True)


if __name__ == '__main__':
    main()
