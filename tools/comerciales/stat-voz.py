#!/usr/bin/env python3
"""La voz de LeIA para el Daily Stat (27-oct-2026): dos frases por dato, grabadas con Google (Chirp 3 HD
Achernar, la de LeIA) en daily challenge/public/content/stats/voz/<id>-1.mp3 (el título, al teclearse la
cabecera) y <id>-2.mp3 (el remate). El servidor de DC las mezcla al generar el reel (tools/stat-reel.js);
si un dato no tiene voz, el reel sale como antes. Idempotente: sólo graba lo que falte.

  python3 tools/comerciales/stat-voz.py [--rehacer]

Lo que se dice sale de stats.json: el título y el subtítulo tal cual («Las empresas más viejas, y qué hacían
cuando nacieron») y el remate. Los números se leen como están: Chirp los dice bien en español.
"""
import hashlib, json, os, shutil, sys, tempfile

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import comercial as C

DC = os.path.expanduser('~/Documents/daily challenge')
STATS = os.path.join(DC, 'public/content/stats/stats.json')
VOZ = os.path.join(DC, 'public/content/stats/voz')
NOMBRE, IDIOMA = 'es-US-Chirp3-HD-Achernar', 'es-US'


def frases(s):
    titulo = f"{s['titulo']} {s['subtitulo']}".strip()
    titulo = titulo[0] + titulo[1:].lower() if titulo.isupper() else titulo
    return [f'Daily Stat. {titulo}.', s['remate']]


def main():
    rehacer = '--rehacer' in sys.argv
    stats = json.load(open(STATS, encoding='utf-8'))['stats']
    os.makedirs(VOZ, exist_ok=True)
    hechas = 0
    with tempfile.TemporaryDirectory() as tmp:
        os.chmod(tmp, 0o700)
        cab = os.path.join(tmp, 'h.txt')
        with open(cab, 'w') as h:
            h.write(f'X-Goog-Api-Key: {C.clave()}\n')
        os.chmod(cab, 0o600)
        for s in stats:
            for k, texto in enumerate(frases(s), 1):
                destino = os.path.join(VOZ, f"{s['id']}-{k}.mp3")
                if os.path.exists(destino) and not rehacer:
                    continue
                C.narrar(texto, NOMBRE, IDIOMA, cab)   # queda en la caché de comercial.py, por huella
                huella = hashlib.sha1(f'{NOMBRE}|{IDIOMA}|{texto}'.encode()).hexdigest()[:20]
                shutil.copy(os.path.join(C.CACHE, huella + '.mp3'), destino); hechas += 1
    print(f'{len(stats)} datos, {hechas} frases grabadas, en {VOZ}')


if __name__ == '__main__':
    main()
