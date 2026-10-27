#!/usr/bin/env python3
"""Los guiones de los vídeos de vocabulario N5 de jlptest (27-oct-2026), sacados del banco de la app:
  - jlptest-n5-largo.json: 100 palabras en 10 capítulos, para el canal (horizontal). Cada palabra: el
    japonés, un hueco para repetirla, otra vez el japonés y el significado en español.
  - jlptest-n5-short.json: 10 palabras de todos los días, para Shorts y reels (vertical).
Cada palabra se busca en jlptest/data/dist/vocabulario.json (escritura + lectura, N5): si no está, para.
La voz japonesa lee la LECTURA (kana), no los kanji, para que no se equivoque de lectura.

  python3 tools/comerciales/jlptest-n5.py && python3 tools/comerciales/comercial.py tools/comerciales/jlptest-n5-largo.json
"""
import json, os, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
BANCO = json.load(open(os.path.expanduser('~/Documents/jlptest/data/dist/vocabulario.json'), encoding='utf-8'))
JA = {'voz': 'ja-JP-Neural2-B', 'idioma': 'ja-JP'}   # la narradora japonesa de la app

# (escritura, lectura, significado en español, corto y claro)
CAPITULOS = [
    ('La familia', [('家族', 'かぞく', 'familia'), ('父', 'ちち', 'mi padre'), ('母', 'はは', 'mi madre'),
                    ('お父さん', 'おとうさん', 'papá'), ('お母さん', 'おかあさん', 'mamá'), ('兄', 'あに', 'hermano mayor'),
                    ('姉', 'あね', 'hermana mayor'), ('弟', 'おとうと', 'hermano menor'), ('妹', 'いもうと', 'hermana menor'),
                    ('両親', 'りょうしん', 'padres')]),
    ('Personas y cuerpo', [('人', 'ひと', 'persona'), ('友達', 'ともだち', 'amigo'), ('男', 'おとこ', 'hombre'),
                           ('女', 'おんな', 'mujer'), ('頭', 'あたま', 'cabeza'), ('顔', 'かお', 'cara'), ('目', 'め', 'ojo'),
                           ('口', 'くち', 'boca'), ('手', 'て', 'mano'), ('足', 'あし', 'pie, pierna')]),
    ('Comida y bebida', [('ご飯', 'ごはん', 'arroz, comida'), ('パン', 'パン', 'pan'), ('肉', 'にく', 'carne'),
                         ('魚', 'さかな', 'pescado'), ('野菜', 'やさい', 'verdura'), ('果物', 'くだもの', 'fruta'),
                         ('卵', 'たまご', 'huevo'), ('お茶', 'おちゃ', 'té'), ('牛乳', 'ぎゅうにゅう', 'leche'),
                         ('朝御飯', 'あさごはん', 'desayuno')]),
    ('La casa', [('家', 'いえ', 'casa'), ('部屋', 'へや', 'cuarto, habitación'), ('台所', 'だいどころ', 'cocina'),
                 ('トイレ', 'トイレ', 'baño'), ('机', 'つくえ', 'escritorio'), ('椅子', 'いす', 'silla'),
                 ('テーブル', 'テーブル', 'mesa'), ('ドア', 'ドア', 'puerta'), ('窓', 'まど', 'ventana'), ('時計', 'とけい', 'reloj')]),
    ('La ropa', [('服', 'ふく', 'ropa'), ('シャツ', 'シャツ', 'camisa'), ('ズボン', 'ズボン', 'pantalones'),
                 ('スカート', 'スカート', 'falda'), ('靴', 'くつ', 'zapatos'), ('靴下', 'くつした', 'calcetines'),
                 ('帽子', 'ぼうし', 'sombrero, gorra'), ('コート', 'コート', 'abrigo'), ('ネクタイ', 'ネクタイ', 'corbata'),
                 ('財布', 'さいふ', 'cartera')]),
    ('La ciudad', [('駅', 'えき', 'estación'), ('電車', 'でんしゃ', 'tren'), ('車', 'くるま', 'coche'),
                   ('自転車', 'じてんしゃ', 'bicicleta'), ('地下鉄', 'ちかてつ', 'metro'), ('飛行機', 'ひこうき', 'avión'),
                   ('公園', 'こうえん', 'parque'), ('図書館', 'としょかん', 'biblioteca'), ('病院', 'びょういん', 'hospital'),
                   ('郵便局', 'ゆうびんきょく', 'oficina de correos')]),
    ('El tiempo', [('今', 'いま', 'ahora'), ('今日', 'きょう', 'hoy'), ('明日', 'あした', 'mañana'), ('昨日', 'きのう', 'ayer'),
                   ('毎日', 'まいにち', 'todos los días'), ('朝', 'あさ', 'la mañana'), ('夜', 'よる', 'la noche'),
                   ('時間', 'じかん', 'tiempo, horas'), ('いつも', 'いつも', 'siempre'), ('もう', 'もう', 'ya')]),
    ('Verbos de todos los días', [('行く', 'いく', 'ir'), ('来る', 'くる', 'venir'), ('帰る', 'かえる', 'volver a casa'),
                                  ('食べる', 'たべる', 'comer'), ('飲む', 'のむ', 'beber'), ('見る', 'みる', 'ver, mirar'),
                                  ('聞く', 'きく', 'escuchar, preguntar'), ('話す', 'はなす', 'hablar'), ('読む', 'よむ', 'leer'),
                                  ('書く', 'かく', 'escribir')]),
    ('Adjetivos', [('大きい', 'おおきい', 'grande'), ('小さい', 'ちいさい', 'pequeño'), ('新しい', 'あたらしい', 'nuevo'),
                   ('古い', 'ふるい', 'viejo (cosas)'), ('高い', 'たかい', 'alto, caro'), ('安い', 'やすい', 'barato'),
                   ('おいしい', 'おいしい', 'rico, delicioso'), ('面白い', 'おもしろい', 'interesante, divertido'),
                   ('忙しい', 'いそがしい', 'ocupado'), ('好き', 'すき', 'que te gusta')]),
    ('Clima y naturaleza', [('天気', 'てんき', 'el tiempo (clima)'), ('雨', 'あめ', 'lluvia'), ('雪', 'ゆき', 'nieve'),
                            ('晴れ', 'はれ', 'cielo despejado'), ('空', 'そら', 'cielo'), ('海', 'うみ', 'mar'),
                            ('山', 'やま', 'montaña'), ('川', 'かわ', 'río'), ('犬', 'いぬ', 'perro'), ('猫', 'ねこ', 'gato')]),
]
CORTO = [('水', 'みず', 'agua'), ('ご飯', 'ごはん', 'arroz, comida'), ('食べる', 'たべる', 'comer'), ('飲む', 'のむ', 'beber'),
         ('行く', 'いく', 'ir'), ('帰る', 'かえる', 'volver a casa'), ('今日', 'きょう', 'hoy'), ('明日', 'あした', 'mañana'),
         ('友達', 'ともだち', 'amigo'), ('好き', 'すき', 'que te gusta')]


def comprobar(jp, lectura):
    hay = [v for v in BANCO if v['escritura'] == jp and v['lectura'] == lectura]
    if not hay:
        sys.exit(f'{jp} ({lectura}) no está en el banco')
    if not any(v['jlpt'] == 'N5' for v in hay):
        print(f'  ojo: {jp} ({lectura}) es {hay[0]["jlpt"]}, no N5')


COMUN = {
    'voz': 'es-US-Chirp3-HD-Aoede', 'idioma': 'es-US',
    'colores': {'fondo': '#161826', 'acento': '#9184d9', 'texto': '#ffffff', 'tenue': '#8a8aa0'},
    'marca': {'nombre': 'jlptest', 'punto': '#d7263d', 'lema': 'Prepara el JLPT', 'sitio': 'jlptest.org', 'pie': 'Empieza gratis'},
}

# el largo
escenas = [
    {'texto': 'Vocabulario JLPT N5', 'palabra': {'jp': '日本語', 'lectura': 'にほんご', 'es': '100 palabras esenciales'},
     'capitulo': 'Introducción',
     'voz': 'Cien palabras esenciales del N5, en diez temas. Escucha cada palabra, repítela en voz alta, y escúchala otra vez.'},
]
n = 0
for c, (titulo, palabras) in enumerate(CAPITULOS, 1):
    escenas.append({'texto': f'Capítulo {c}', 'palabra': {'jp': titulo, 'lectura': '', 'es': f'{len(palabras)} palabras'},
                    'capitulo': titulo, 'voz': f'{titulo}.', 'dur': 2.6})
    for jp, lectura, es in palabras:
        comprobar(jp, lectura); n += 1
        escenas.append({'texto': titulo, 'palabra': {'jp': jp, 'lectura': lectura, 'es': es, 'num': f'{n} / 100'},
                        'voces': [{'texto': lectura, **JA, 'despues': 1.9}, {'texto': lectura, **JA, 'despues': 0.5}, {'texto': es}]})
escenas.append({'final': True, 'capitulo': 'Sigue practicando',
                'voz': 'Practica estas palabras, con su audio y ejemplos, en jota ele pe test punto org. La primera sección de cada nivel es gratis.'})
json.dump({**COMUN, 'formato': 'horizontal', 'bpm': 76, 'volumen_musica': 0.6,
           'salida': '~/Documents/ayotl/tools/comerciales/salida/jlptest-n5-largo.mp4', 'escenas': escenas},
          open(os.path.join(AQUI, 'jlptest-n5-largo.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

# el corto
escenas = [{'texto': '10 palabras del N5', 'palabra': {'jp': '毎日', 'lectura': 'まいにち', 'es': 'que usarás todos los días'},
            'voz': 'Diez palabras del N5 que vas a usar todos los días.'}]
for k, (jp, lectura, es) in enumerate(CORTO, 1):
    comprobar(jp, lectura)
    escenas.append({'texto': '10 palabras del N5', 'palabra': {'jp': jp, 'lectura': lectura, 'es': es, 'num': f'{k} / 10'},
                    'voces': [{'texto': lectura, **JA, 'despues': 0.4}, {'texto': es}]})
escenas.append({'final': True, 'voz': 'Más palabras, con su audio, en jota ele pe test punto org.'})
json.dump({**COMUN, 'bpm': 84, 'salida': '~/Documents/ayotl/tools/comerciales/salida/jlptest-n5-short.mp4', 'escenas': escenas},
          open(os.path.join(AQUI, 'jlptest-n5-short.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'guiones listos: {n} palabras en el largo, {len(CORTO)} en el corto')
