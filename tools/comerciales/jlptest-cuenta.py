#!/usr/bin/env python3
"""La cuenta regresiva al JLPT (27-oct-2026): un reel vertical por día hasta el examen (domingo 6-dic-2026),
para IG/FB de jlptest y como Short. Cada uno: «faltan N días», un consejo corto, la palabra del día (con la
voz japonesa de la app leyendo el kana, y su ejemplo si el banco lo tiene) y el cierre con la marca.

  python3 tools/comerciales/jlptest-cuenta.py            # escribe los guiones en cuenta/*.json
  python3 tools/comerciales/jlptest-cuenta.py --render   # y genera los mp4 que falten en cuenta/mp4/

Las palabras salen del banco (jlptest/data/dist/vocabulario.json): del N5 al N3, con ejemplo, rodando por
nivel (N5, N4, N3, N5…), sin repetir las del short de vocabulario, con una semilla fija para que la lista no
cambie entre corridas. Los mp4 se copian a jlptest/public/social/cuenta/ y el índice lo lee la serie
«cuenta» de /api/social/publicar (20:00 MX).
"""
import json, os, random, re, subprocess, sys
from datetime import date, timedelta

AQUI = os.path.dirname(os.path.abspath(__file__))
SAL = os.path.join(AQUI, 'cuenta'); os.makedirs(os.path.join(SAL, 'mp4'), exist_ok=True)
JL = os.path.expanduser('~/Documents/jlptest')
EXAMEN = date(2026, 12, 6)
PRIMERO = date(2026, 10, 29)       # el primer reel; el último, el día del examen
JA = {'voz': 'ja-JP-Neural2-B', 'idioma': 'ja-JP'}
YA_USADAS = {'水', 'ご飯', '食べる', '飲む', '行く', '帰る', '今日', '明日', '友達', '好き'}

# un consejo por día, corto (lo dice la narradora y se lee en pantalla); se repiten en ciclo si faltan
CONSEJOS = [
    'Hoy, diez palabras nuevas. No más: diez que no se te olviden.',
    'Lee una noticia corta en japonés y toca lo que no entiendas.',
    'Haz un test de gramática aunque sea de cinco preguntas.',
    'Repasa lo que fallaste ayer antes de aprender algo nuevo.',
    'Escucha un audio dos veces: la primera sin leer, la segunda leyendo.',
    'Hoy toca kanji: cinco, con sus lecturas, y escríbelos a mano.',
    'Un examen simulado completo. Cronómetro y sin pausas.',
    'Repasa partículas: は, が, を, に. Son puntos seguros.',
    'Lee en voz alta: ayuda a la escucha más de lo que parece.',
    'Hoy, descansa la vista: sólo audio, en el camino o lavando los trastes.',
    'Revisa tus mazos: lo que marcaste difícil vuelve hoy.',
    'Escribe tres frases con las palabras de ayer.',
    'Practica el 聴解: la escucha es donde más se pierde tiempo en el examen.',
    'Gramática de contraste: けど, のに, ても. Una frase con cada una.',
    'Hoy, lectura larga. Sin diccionario la primera vez.',
    'Contadores: 人, 本, 枚, 個. Cuenta lo que hay en tu cuarto.',
    'Un test rápido en el teléfono mientras esperas. Cinco minutos cuentan.',
    'Repasa los kanji de los días de la semana y las fechas.',
    'Hoy, verbos: forma て de diez verbos, sin mirar.',
    'Escucha una noticia y resúmela en una frase, en japonés.',
]


def banco():
    V = json.load(open(os.path.join(JL, 'data/dist/vocabulario.json'), encoding='utf-8'))
    E = json.load(open(os.path.join(JL, 'data/dist/ejemplos.json'), encoding='utf-8'))
    return V, E


def limpiar_ruby(s):
    """El ejemplo trae furigana en <ruby>漢字<rt>かんじ</rt></ruby>: para la pantalla se deja el kanji;
    para la voz, el kana (así no se equivoca de lectura)."""
    pantalla = re.sub(r'<ruby>(.*?)<rt>.*?</rt></ruby>', r'\1', s)
    voz = re.sub(r'<ruby>.*?<rt>(.*?)</rt></ruby>', r'\1', s)
    return pantalla.replace(' ', ''), voz.replace(' ', '')


def elegir(V, E, n):
    rnd = random.Random('cuenta-jlpt-2026')
    por_nivel = {k: [] for k in ('N5', 'N4', 'N3')}
    for v in V:
        if v.get('jlpt') in por_nivel and str(v['id']) in E and v['escritura'] not in YA_USADAS and v['pos'] != 'num' \
           and '~' not in v['escritura'] and len(v['es']) < 40 and len(limpiar_ruby(E[str(v['id'])])[0]) <= 24 \
           and v['kanji'] and v['pos'] in ('n', 'v1', 'v5r', 'v5k', 'v5u', 'v5s', 'v5m', 'v5g', 'v5b', 'adj', 'adj-na', 'vs'):   # con kanji y de categoría clara
            por_nivel[v['jlpt']].append(v)
    for l in por_nivel.values():
        rnd.shuffle(l)
    out, k = [], 0
    while len(out) < n:
        nivel = ('N5', 'N4', 'N3')[k % 3]; k += 1
        if por_nivel[nivel]:
            out.append(por_nivel[nivel].pop())
    return out


def corto(es):
    es = re.sub(r'\s*\([^)]*\)', '', es)
    return es.split(';')[0].split(',')[0].strip()


def guiones():
    V, E = banco()
    dias = (EXAMEN - PRIMERO).days + 1
    palabras = elegir(V, E, dias)
    indice = []
    for i in range(dias):
        fecha = PRIMERO + timedelta(days=i); faltan = (EXAMEN - fecha).days
        v = palabras[i]; ej_p, ej_v = limpiar_ruby(E[str(v['id'])]); consejo = CONSEJOS[i % len(CONSEJOS)]
        if faltan == 0:
            arriba, abajo, voz1 = 'Hoy es el día', 'JLPT · 6 de diciembre', 'Hoy es el día. Respira, lee cada pregunta dos veces, y confía en lo que practicaste. ¡Mucha suerte!'
        elif faltan == 1:
            arriba, abajo, voz1 = 'Falta', 'día para el JLPT', 'Falta un día. Hoy no estudies nada nuevo: repasa ligero, prepara tu identificación, y duerme bien.'
        else:
            arriba, abajo, voz1 = 'Faltan', 'días para el JLPT', f'Faltan {faltan} días para el JLPT. {consejo}'
        escenas = [{'texto': 'Cuenta regresiva', 'cuenta': {'numero': str(faltan), 'arriba': arriba, 'abajo': abajo}, 'voz': voz1}]
        if faltan > 0:
            escenas.append({'texto': f'Palabra del día · {v["jlpt"]}', 'palabra': {'jp': v['escritura'], 'lectura': v['lectura'], 'es': corto(v['es'])},
                            'voces': [{'texto': 'La palabra de hoy:', 'despues': 0.3}, {'texto': v['lectura'], **JA, 'despues': 0.8},
                                      {'texto': v['lectura'], **JA, 'despues': 0.4}, {'texto': corto(v['es'])}]})
            escenas.append({'texto': 'En una frase', 'palabra': {'jp': ej_p, 'lectura': '', 'es': ''},
                            'voces': [{'texto': ej_v, **JA, 'despues': 0.6}, {'texto': ej_v, **JA}]})
        escenas.append({'final': True, 'voz': 'El examen simulado y la primera sección de cada nivel son gratis, en jota ele pe test punto org.'})
        clave = f'cuenta-{faltan:02d}'
        g = {'salida': os.path.join(SAL, 'mp4', clave + '.mp4'), 'voz': 'es-US-Chirp3-HD-Aoede', 'idioma': 'es-US', 'bpm': 88,
             'colores': {'fondo': '#161826', 'acento': '#9184d9', 'texto': '#ffffff', 'tenue': '#8a8aa0'},
             'marca': {'nombre': 'jlptest', 'punto': '#d7263d', 'lema': 'Prepara el JLPT', 'sitio': 'jlptest.org', 'pie': 'Examen simulado gratis'},
             'escenas': escenas}
        json.dump(g, open(os.path.join(SAL, clave + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        pie = (f'Faltan {faltan} días para el JLPT. {consejo}\n\nPalabra del día ({v["jlpt"]}): {v["escritura"]} ({v["lectura"]}), {corto(v["es"])}.\n\n'
               f'El examen simulado y la primera sección de cada nivel son gratis en jlptest.org\n\n#JLPT #{v["jlpt"]} #japonés #日本語 #nihongo #jlptest'
               if faltan > 1 else
               ('Falta un día para el JLPT. Repasa ligero, prepara tu identificación y duerme bien.\n\nMucha suerte mañana.\n\n#JLPT #japonés #日本語 #nihongo #jlptest' if faltan == 1
                else 'Hoy es el JLPT. Respira, lee cada pregunta dos veces y confía en lo que practicaste. ¡Mucha suerte!\n\n#JLPT #japonés #日本語 #nihongo #jlptest'))
        indice.append({'archivo': clave + '.mp4', 'orden': i + 1, 'item_id': clave, 'nivel': v['jlpt'] if faltan else None, 'tipo': 'cuenta', 'fecha': fecha.isoformat(), 'pie': pie})
    json.dump(indice, open(os.path.join(SAL, 'indice.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'{dias} guiones, del {PRIMERO} al {EXAMEN}; palabras:', ' '.join(v['escritura'] for v in palabras[:12]), '…')


def render():
    py = os.path.expanduser('~/Documents/code challenge/.venv/bin/python')
    for f in sorted(os.listdir(SAL)):
        if not f.endswith('.json') or f == 'indice.json':
            continue
        mp4 = os.path.join(SAL, 'mp4', f[:-5] + '.mp4')
        if os.path.exists(mp4):
            continue
        subprocess.run([py, os.path.join(AQUI, 'comercial.py'), os.path.join(SAL, f)], check=True)


if __name__ == '__main__':
    guiones()
    if '--render' in sys.argv:
        render()
