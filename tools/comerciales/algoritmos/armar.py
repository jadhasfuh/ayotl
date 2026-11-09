#!/usr/bin/env python3
"""Arma un Short de «Algoritmos en pixel» (9-nov-2026): un algoritmo con su código, su animación y LeIA.

  "/Users/jadhasfuh/Documents/code challenge/.venv/bin/python" tools/comerciales/algoritmos/armar.py burbuja
      [--idioma es] [--cuadros 3,9.5]

1. Lee algoritmos/<nombre>.py: el código (el mismo de la lección de ayotl.dev/aprende), el arreglo, pasos() y
   el guion de LeIA (ver burbuja.py, que es el modelo).
2. Mide cuánto tarda la voz de cada renglón (comercial.narrar: la misma voz y la misma caché que el vídeo, en
   ~/Documents/ayotl-voces). Cada escena dura su voz más el respiro de comercial.py, en cuadros enteros, o más si
   sus pasos no caben a buen ritmo; los pasos se reparten en ese tiempo según PESO. Así lo que se ve va con lo
   que dice: «¿5 es mayor que 2?» sale mientras esas dos barras están en amarillo.
3. renderizador.Fondo saca el vídeo mudo (fondo.mp4) y su sonido (fondo.wav), y el logo de la tarjeta final, en
   algoritmos/<nombre>/ (fuera de git).
4. Escribe el guion de comercial.py (escenas `completo` seguidas, con `continua`, y la tarjeta final) y lo arma
   en salida/algoritmos-<nombre>[-<idioma>].mp4.
5. Revisa que el audio y el vídeo duren lo mismo y saca la hoja de seis cuadros (…-hoja.png, a la mitad).
Con --cuadros sólo guarda esos segundos del fondo en PNG, sin armar nada (para probar el dibujo).

Para el siguiente algoritmo: copia burbuja.py con otro nombre, cambia CODIGO (y su lección), ARREGLO, pasos() y
GUION, y corre armar.py con ese nombre. Si necesita algo que las barras no tienen (un árbol, dos arreglos), se
agrega su vista o su tipo de paso en renderizador.py.
"""
import argparse, importlib, json, math, os, re, subprocess, sys, tempfile

AQUI = os.path.dirname(os.path.abspath(__file__))
COMERCIALES = os.path.dirname(AQUI)
sys.path.insert(0, COMERCIALES); sys.path.insert(0, AQUI)
import comercial   # noqa: E402  narrar() y RESPIRO: los mismos que usará el vídeo
import renderizador as R   # noqa: E402

PY = os.path.expanduser('~/Documents/code challenge/.venv/bin/python')
VOZ = {'es': ('es-US-Chirp3-HD-Achernar', 'es-US'), 'en': ('en-US-Chirp3-HD-Achernar', 'en-US'), 'ja': ('ja-JP-Chirp3-HD-Achernar', 'ja-JP')}
SUF = {'es': '', 'en': '-en', 'ja': '-ja'}
# cuánto pesa cada tipo de paso al repartir el tiempo de una escena, y lo menos que puede durar para que se vea
PESO = {'pasada': 0.35, 'compara': 1.0, 'cambia': 1.0, 'fija': 0.7, 'marca': 0.6, 'linea': 0.5, 'fin': 3.0}
MINIMO = {'pasada': 0.08, 'compara': 0.1, 'cambia': 0.12, 'fija': 0.12, 'marca': 0.1, 'linea': 0.08, 'fin': 1.3}
# la tarjeta final (la de comercial.py): la serie y la dirección de las lecciones
MARCA = {'es': {'lema': None, 'sitio': 'ayotl.dev/aprende', 'pie': 'Gratis, sin cuenta y en el navegador'}}
COLORES = {'fondo': '#000000', 'acento': '#93e2dd', 'texto': '#ffffff', 'tenue': '#9a9aa8', 'sobre_acento': '#000000',
           'borde': '#3a3a48'}   # los de Daily Challenge (dc-semana-short.json)


def cuadros_enteros(s):
    return math.ceil(s * R.FPS - 1e-6) / R.FPS


def linea_de_tiempo(alg, lang, medir):
    """Las escenas del fondo (con sus pasos ya en el tiempo) y el renglón de la tarjeta final."""
    cola = list(alg.pasos(alg.ARREGLO)); escenas, final, t = [], None, 0.0
    for r in alg.GUION[lang]:
        voz = r.get('voz', r['dice'])
        dura = medir(voz)
        if r.get('final'):
            final = dict(r, voz=voz, voz_dur=dura); continue
        k = r.get('pasos', 0)
        k = len(cola) if k == 'resto' else (len(cola) + k if k < 0 else k)
        tomados, cola = cola[:k], cola[k:]
        minimo = sum(MINIMO[e['tipo']] for e in tomados)
        dur = cuadros_enteros(max(dura + comercial.RESPIRO + 0.004, minimo, r.get('dur', 0)))
        if tomados:   # los pasos, repartidos en lo que dura la escena
            total = sum(PESO[e['tipo']] for e in tomados); x = t
            for e in tomados:
                e['t0'] = x; e['dur'] = dur * PESO[e['tipo']] / total; x += e['dur']
        escenas.append({'t0': t, 'dur': dur, 'vista': r.get('vista', 'pasos' if tomados else 'codigo'),
                        'eventos': tomados, 'resalta': r.get('resalta', []), 'filas': r.get('filas', []),
                        'complejidad': r.get('complejidad'), 'cara': r.get('cara', 'normal'), 'voz': voz,
                        'dice': r['dice'], 'voz_dur': dura})
        t += dur
    if cola:
        sys.exit(f'al guion le faltan {len(cola)} pasos por repartir (el último renglón con pasos puede ser «resto»)')
    return escenas, final


def guion(alg, lang, escenas, final, video, wav, rms, logo, salida):
    m = MARCA[lang]
    escenas_g = []
    for i, s in enumerate(escenas):
        e = {'video': video, 'desde': s['t0'], 'completo': True, 'pixel': True, 'dur': s['dur'], 'cara': s['cara'], 'voz': s['voz']}
        if s['dice'] != s['voz']:
            e['dice'] = s['dice']
        if i:
            e['continua'] = True   # el mismo vídeo, sin cruce
        escenas_g.append(e)
    e = {'final': True, 'cara': final.get('cara', 'guino'), 'voz': final['voz']}
    if final['dice'] != final['voz']:
        e['dice'] = final['dice']
    escenas_g.append(e)
    return {
        'fuente': 'pixel', 'salida': salida, 'voz': VOZ[lang][0], 'idioma': VOZ[lang][1],
        'presentadora': {'nombre': 'LeIA', 'caras': os.path.join(COMERCIALES, 'avatar')},
        'colores': COLORES, 'acercamiento': False,
        'marca': {'logo': logo, 'logo_ancho': 720, 'lema': m['lema'] or alg.EPISODIO[lang], 'sitio': m['sitio'], 'pie': m['pie']},
        # los blips y la chiptune del fondo, tal como salen del renderizador (`volumen` = su RMS: comercial.py no
        # los reescala); con `agacha` 0.4 los blips se siguen oyendo mientras habla LeIA
        'musica': {'archivo': wav, 'desde': 0, 'volumen': round(rms, 6), 'agacha': 0.4},
        'escenas': escenas_g,
    }


def medir_salida(mp4):
    """(segundos de vídeo, segundos de audio) del mp4 armado: los cuadros y las muestras, contados."""
    r = subprocess.run([R.FF, '-i', mp4, '-map', '0:v:0', '-f', 'null', '-'], capture_output=True, text=True)
    cuadros = int(re.findall(r'frame=\s*(\d+)', r.stderr)[-1])
    crudo = subprocess.run([R.FF, '-loglevel', 'error', '-i', mp4, '-map', '0:a:0', '-f', 's16le', '-ac', '1', '-ar', '48000', '-'],
                           capture_output=True, check=True).stdout
    return cuadros / R.FPS, len(crudo) / 2 / 48000


def hoja(mp4, momentos, ruta):
    """Seis cuadros del vídeo armado, a la mitad (540x960), en una hoja de 3 x 2 con el segundo de cada uno."""
    from PIL import Image
    ims = []
    with tempfile.TemporaryDirectory() as tmp:
        for i, (t, _) in enumerate(momentos):
            png = os.path.join(tmp, f'{i}.png')
            subprocess.run([R.FF, '-loglevel', 'error', '-y', '-ss', f'{t:.3f}', '-i', mp4, '-frames:v', '1', png], check=True)
            ims.append(Image.open(png).convert('RGB').resize((540, 960), Image.LANCZOS))
    h = Image.new('RGB', (540 * 3 + 40, 960 * 2 + 30 + 2 * 44), (24, 24, 32))
    for i, (im, (t, nota)) in enumerate(zip(ims, momentos)):
        x, y = 10 + (i % 3) * 550, 10 + (i // 3) * (960 + 54)
        R.texto(h, x + 4, y + 8, f'{t:.1f} s  {nota}', (230, 230, 240), 2)
        h.paste(im, (x, y + 34))
    h.save(ruta)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('algoritmo')
    ap.add_argument('--idioma', default='es')
    ap.add_argument('--cuadros', help='segundos del fondo a guardar en PNG, sin armar el vídeo (p. ej. 2,9.5)')
    a = ap.parse_args()
    alg = importlib.import_module(a.algoritmo); lang = a.idioma
    trabajo = os.path.join(AQUI, alg.CLAVE); os.makedirs(trabajo, exist_ok=True)
    voz, idioma = VOZ[lang]
    with tempfile.TemporaryDirectory() as tmp:
        os.chmod(tmp, 0o700)
        cab = os.path.join(tmp, 'h.txt')
        with open(cab, 'w') as h:
            h.write(f'X-Goog-Api-Key: {comercial.clave()}\n')   # la llave nunca se imprime
        os.chmod(cab, 0o600)
        medir = lambda texto: len(comercial.narrar(texto, voz, idioma, cab)) / comercial.SR
        escenas, final = linea_de_tiempo(alg, lang, medir)
    fondo_dur = escenas[-1]['t0'] + escenas[-1]['dur']
    final_dur = max(4.0, final['voz_dur'] + comercial.RESPIRO + 1.2)   # la cuenta de comercial.py para la última
    print(f'{alg.CLAVE} ({lang}): {len(escenas)} escenas, {fondo_dur:.1f} s de fondo + {final_dur:.1f} s de tarjeta '
          f'= {0.5 + fondo_dur + final_dur:.1f} s')
    for s in escenas:
        print(f"  {s['t0']:5.1f} +{s['dur']:4.1f}  voz {s['voz_dur']:4.1f}  {s['vista']:7} {len(s['eventos']):2} pasos  {s['dice']}")
    fondo = R.Fondo(alg, lang, escenas, cola=final_dur + 0.5)
    suf = SUF[lang]
    if a.cuadros:
        for t, im in fondo.cuadros_sueltos([float(x) for x in a.cuadros.split(',')]):
            ruta = os.path.join(trabajo, f'cuadro-{t:05.1f}{suf}.png'); im.save(ruta); print(' ', ruta)
        return
    video, wav, logo = (os.path.join(trabajo, n) for n in (f'fondo{suf}.mp4', f'fondo{suf}.wav', 'logo.png'))
    R.logo(logo)
    rms = fondo.guardar(video, wav)
    salida = os.path.join(COMERCIALES, 'salida', f'algoritmos-{alg.CLAVE}{suf}.mp4')
    g = guion(alg, lang, escenas, final, video, wav, rms, logo, salida)
    ruta_g = os.path.join(trabajo, f'algoritmos-{alg.CLAVE}{suf}.json')
    json.dump(g, open(ruta_g, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    r = subprocess.run([PY, os.path.join(COMERCIALES, 'comercial.py'), ruta_g], capture_output=True, text=True)
    print(' ', (r.stdout + r.stderr).strip().replace('\n', '\n  '))
    if r.returncode:
        sys.exit('comercial.py falló')
    if 'ojo' in r.stdout:
        print('  AVISO: alguna voz no cupo en su escena: el fondo y la voz se desfasan')
    sv, sa = medir_salida(salida)
    print(f'  vídeo {sv:.3f} s, audio {sa:.3f} s ({"iguales" if abs(sv - sa) < 0.05 else "DISTINTOS"})')
    # la hoja: el gancho, la idea, una comparación, un intercambio, la O grande y la lección
    t = lambda i, f: 0.5 + escenas[i]['t0'] + f * escenas[i]['dur']
    pasos_i = [i for i, s in enumerate(escenas) if s['vista'] == 'pasos']
    compara = next(e for s in escenas for e in s['eventos'] if e['tipo'] == 'compara')
    cambia = next(e for s in escenas for e in s['eventos'] if e['tipo'] == 'cambia')
    cuenta_i = [i for i, s in enumerate(escenas) if s['vista'] == 'cuenta']
    enlace_i = [i for i, s in enumerate(escenas) if s['vista'] == 'enlace']
    momentos = [(t(0, 0.7), 'gancho'), (t(1, 0.75), 'idea'),
                (0.5 + compara['t0'] + 0.6 * compara['dur'], 'compara'),
                (0.5 + cambia['t0'] + 0.3 * cambia['dur'], 'intercambia'),
                (t(cuenta_i[-1], 0.9) if cuenta_i else t(pasos_i[-1], 0.9), 'O grande'),
                (t(enlace_i[0], 0.6) if enlace_i else 0.5 + fondo_dur + 2, 'la leccion')]
    hoja(salida, momentos, salida[:-4] + '-hoja.png')
    print(' ', salida[:-4] + '-hoja.png')


if __name__ == '__main__':
    main()
