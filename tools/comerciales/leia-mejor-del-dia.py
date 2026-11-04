#!/usr/bin/env python3
"""El Short del «mejor del día» de Daily Challenge, narrado por LeIA (30-oct-2026).

Adrián: «para los shorts de leia puedes también generar una simulación del mejor del día y ella narrándolo; si
fue muy corto, meter un poco de información del juego y burlarse un poco, como "vaya, eso fue rápido"… que siempre
diga el dato del juego; sólo si el gameplay duró muy poco, ahí sí que dé el dato más largo; si el gameplay es muy
largo, no importa que lo dé completo». Y: «aún nos queda mucho Google Cloud: genera muchos vídeos con audio y LeIA».

  "/Users/jadhasfuh/Documents/code challenge/.venv/bin/python" tools/comerciales/leia-mejor-del-dia.py [AAAA-MM-DD ...]
      [--idiomas es,en,ja] [--publicar AAAA-MM-DD] [--sin-plan] [--seco] [--rehacer]

Sin fecha, ayer (hora de México). Por cada fecha:
1. dc-partida.mjs re-simula la partida del campeón de ese día (la de más puntos en arcade.partidas) y la graba
   entera en mejor/<fecha>/partida.mp4: la pantalla del juego a 4x, con la chiptune del día.
2. Lo que dice LeIA depende de cuánto duró la partida:
   - menos de 40 s: saluda, se burla tantito («¡vaya, eso fue rápido!») y da el dato largo del juego, con la
     partida repitiéndose detrás;
   - hasta 3 min: saluda y da el dato corto;
   - más de 3 min: el dato largo y, cada 3 min, cuántos puntos van.
   Al acabar la partida dice los puntos y el tiempo, y cierra con la tarjeta de Daily Challenge. Los datos de cada
   juego (es/en/ja, corto y largo) están en datos-juegos.json; si el juego del día no está, se agrega ahí.
   Adrián, 1-nov: «que LeIA hable casi todo el tiempo o al menos no dejar tiempos muertos… "oo estuvo cerca",
   "chispas ahí va una vida", chistes malos de IA como los de Alexa, o datos del juego en contexto de Daily
   Challenge, como el highscore al día de hoy, lanzamiento, historia, datos curiosos». Así que, pasado el dato,
   relleno() llena la partida: reacciona a lo que pasa (vidas, nivel u oleada, sustos, rachas de puntos, cuando
   rompe el récord del juego o pasa al segundo del día), dice cada minuto cuántos puntos van y, en los huecos,
   datos de Daily Challenge (dc-partida.mjs --info los trae: récord hasta hoy, quién quedó segundo, cuántos
   jugaron…), curiosidades del juego (curiosidades-juegos.json) y chistes malos de IA, sin repetir ninguno. Con
   más de CALLADA s sin voz, comercial.py oculta el cuadro de diálogo.
3. comercial.py arma salida/mejor-<fecha>[-en|-ja].mp4: la partida entera, sin cortes, con el cuadro de diálogo.
4. Salvo con --sin-plan, entra a youtube.json para salir el día --publicar (por omisión, dos días después de la
   partida, así queda un día para revisarlo) a las 19:00 (es), 19:20 (en) y 19:40 (ja). Lo sube subir-youtube.py.
--seco escribe los guiones y dice el plan, sin armar vídeos ni tocar youtube.json. --rehacer vuelve a armar los
vídeos de un día aunque ya estén subidos, sin tocar youtube.json (para cambiarlos en YouTube).
"""
import argparse, json, os, re, subprocess, sys, tempfile
from datetime import date, datetime, timedelta, timezone

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import comercial   # narrar(): la misma voz y la misma caché que el vídeo, para medir cuánto dura cada frase

PY = os.path.expanduser('~/Documents/code challenge/.venv/bin/python')
MX = timezone(timedelta(hours=-6))
CORTA, LARGA, CADA = 40, 180, 60    # s: partida muy corta, muy larga, y cada cuánto dice cuántos puntos van
VAN_DESDE = 100                      # s: en partidas más cortas no dice cuántos puntos van
PAUSA = 0.6                          # s de silencio extra después de un dato o un chiste (además de comercial.RESPIRO)
# las reacciones: cuánto más importa cada una, cuántos segundos tarde todavía se puede decir y su cara
REACCION = {'record': (5, 4, 'sorpresa'), 'lider': (4, 4, 'feliz'), 'vida': (3, 2.5, 'triste'), 'nivel': (3, 3, 'feliz'),
            'vidamas': (2, 2.5, 'feliz'), 'racha': (2, 3, 'sorpresa'), 'van': (1, 15, 'feliz'), 'uy': (0, 1, 'sorpresa')}
SUF = {'es': '', 'en': '-en', 'ja': '-ja'}
HORA = {'es': '19:00', 'en': '19:20', 'ja': '19:40'}
VOZ = {'es': ('es-US-Chirp3-HD-Achernar', 'es-US'), 'en': ('en-US-Chirp3-HD-Achernar', 'en-US'), 'ja': ('ja-JP-Chirp3-HD-Achernar', 'ja-JP')}
MESES = {'es': ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
         'en': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']}

# Lo que dice LeIA. Cada {valor} tiene lo que se lee y lo que se pronuncia (LeIA se pronuncia «Leia»).
TEXTOS = {
    'es': {
        'intro': '¡Hola! Soy {leia}. El mejor del {fecha} en {dc} fue {nombre}, en {juego}.',
        'burlas': ['¡Vaya, eso fue rápido! {pts} puntos en {seg} segundos… y aun así nadie le ganó ese día.',
                   '¿Ya? ¿{seg} segundos? Ni tiempo de abrir las palomitas. Pero esos {pts} puntos bastaron para ganar el día.',
                   '¡Eso fue un suspiro! {seg} segundos de partida y {pts} puntos, y aun así fue lo mejor del día.'],
        'dato': 'Un dato: {dato}',
        'van': ['Van {min} y {pts} puntos.', '¡{min} y sigue! Ya lleva {pts} puntos.', '{min} de partida: {pts} puntos y contando.'],
        'fin': '¡Y se acabó! {pts} puntos en {dur}.',
        # el final de todo lo que va a YouTube (Adrián, 31-oct): «¿ya estás suscrito? síguenos para más videos como este»
        'cierre': '¿Puedes superarlo? Cada día hay un juego nuevo: juega gratis en {sitio}. ¿Ya estás suscrito? Síguenos para más videos como este.',
        'leia': ('LeIA', 'Leia'), 'dc': ('Daily Challenge', 'Daily Challenge'), 'sitio': ('dailychallenge.click', 'Daily Challenge punto click'),
        # lo que dice mientras corre la partida (Adrián, 1-nov)
        'vida': ['¡Chispas, ahí va una vida!', '¡Uy! Se le fue una vida.', '¡Auch! Una vida menos.', '¡No! Otra vida menos.', '¡Ay! Esa dolió.'],
        'vidamas': ['¡Vida extra!', '¡Bien! Una vida más.', '¡Otra vida de regalo!'],
        'oleada': ['¡Oleada {n}!', '¡Ya va en la oleada {n}!', '¡Oleada {n}, y vienen más!'],
        'nivel': ['¡Nivel {n}!', '¡Pasó al nivel {n}!', '¡Ya va en el nivel {n}!'],
        'uy': ['¡Uy, estuvo cerca!', '¡Uf, por poco!', '¡Auch!', '¡Cuidado!'],
        'racha': ['¡Qué jugada! {pts} puntos de golpe.', '¡Eso! {pts} puntos en un momento.', '¡Wow! {pts} puntos así nada más.'],
        'record': '¡Y con esto supera el récord que tenía {juego} en {dc}: {pts} puntos!',
        'lider': '¡Ya pasó los {pts} puntos de {nombre2}! Desde aquí, es el mejor del día.',
        'animo': ['¡Vamos!', '¡Sigue así!', '¡Qué nervios!', '¡Esto se pone bueno!', '¡Eso es!'],
        'dc_record_suyo': '¡Esta partida es, hasta hoy, el récord de {juego} en {dc}!',
        'dc_record': 'Hasta hoy, el récord de {juego} en {dc} es de {pts} puntos, de {nombre_r}.',
        'dc_vez1': '¡Era la primera vez que {juego} salía como juego del día!',
        'dc_vez': 'Era la {vez} vez que {juego} salía como juego del día.',
        'dc_jugadores': 'Ese día jugaron {n} personas, con {p} partidas en total.',
        'dc_segundo': 'En segundo lugar quedó {nombre2}, con {pts2} puntos.',
        'dc_intento1': '{nombre} lo logró a la primera: el primer intento de cada día es gratis, y los demás cuestan un ticket.',
        'dc_intento': '{nombre} lo logró en su intento número {i}: cada intento extra cuesta un ticket que se gana jugando.',
        'dc_ganados': '{nombre} ya suma {n} días como el mejor del día.',
        'generales': ['En {dc}, ese día todos juegan el mismo juego y el mismo nivel: gana quien haga más puntos.',
                      'Cada partida se guarda tecla por tecla. Por eso podemos volver a simularla completita para este video.',
                      'Antes de tu intento puedes practicar el reto del día. La práctica no cuenta.',
                      'Después de jugar tu partida, puedes ver jugar al líder del día, como un fantasma.'],
        'chiste_intro': '¿Te cuento un chiste malo de IA? ',
        'chistes': ['¿Qué le dijo un bit a otro bit? Nos vemos en el bus.',
                    '¿Por qué la computadora fue al doctor? Porque tenía un virus. Ya sé, ya sé: soy una IA, no una comediante.',
                    'Iba a contarte un chiste de inteligencia artificial, pero todavía lo estoy entrenando.',
                    '¿Qué hace una IA en la playa? Surfea… en la red.',
                    'Mi mamá era una calculadora. Por eso siempre cuento contigo.',
                    'Dicen que soy artificial, pero mis chistes malos son cien por ciento naturales.',
                    '¿Qué le dice un jaguar a otro jaguar? {Jaguar you?|¿Yaguar yu?}',
                    '¿Por qué los robots nunca tienen miedo? Porque tienen nervios de acero.',
                    '¿Por qué un pixel nunca se pierde? Porque siempre sabe sus coordenadas.',
                    'Traté de ponerme a dieta, pero mi archivo no se dejó comprimir.',
                    'Iba a contarte un chiste de internet, pero se me cayó la conexión. ¿Me escuchas?'],
        'ordinal': ['primera', 'segunda', 'tercera', 'cuarta', 'quinta', 'sexta', 'séptima', 'octava', 'novena', 'décima'],
    },
    'en': {
        'intro': "Hi! I'm {leia}. On {fecha}, the best run in {dc} was by {nombre}, in {juego}.",
        'burlas': ['Whoa, that was fast! {pts} points in {seg} seconds… and still nobody beat it that day.',
                   'Already? {seg} seconds? Not even time to open the popcorn. But those {pts} points were enough to win the day.',
                   'That was a blink! {seg} seconds and {pts} points, and it was still the best of the day.'],
        'dato': 'Fun fact: {dato}',
        'van': ['{min} in: {pts} points.', '{min} and still going: {pts} points.', '{min} of play: {pts} points and counting.'],
        'fin': "And it's over! {pts} points in {dur}.",
        'cierre': "Think you can beat it? There's a new game every day: play free at {sitio}. Are you subscribed yet? Follow us for more videos like this.",
        'leia': ('LeIA', 'Leia'), 'dc': ('Daily Challenge', 'Daily Challenge'), 'sitio': ('dailychallenge.click', 'dailychallenge dot click'),
        'vida': ['Oh snap, there goes a life!', 'Ouch! One life down.', 'Oh no! Lost a life.', 'Yikes, that one hurt!'],
        'vidamas': ['Extra life!', 'Nice, one more life!', 'A free life!'],
        'oleada': ['Wave {n}!', 'On to wave {n}!', 'Wave {n}, and more are coming!'],
        'nivel': ['Level {n}!', 'Up to level {n}!', 'Now on level {n}!'],
        'uy': ['Whoa, that was close!', 'Phew, close call!', 'Ouch!', 'Watch out!'],
        'racha': ['What a play! {pts} points at once.', 'Boom! {pts} points in a flash.', 'Wow! {pts} points just like that.'],
        'record': 'And with that, it beats the old {juego} record on {dc}: {pts} points!',
        'lider': "Past {nombre2}'s {pts} points! From here on, it's the best of the day.",
        'animo': ['Come on!', 'Keep it up!', 'This is tense!', 'Looking good!', "Let's go!"],
        'dc_record_suyo': 'As of today, this run is the {juego} record on {dc}!',
        'dc_record': 'As of today, the {juego} record on {dc} is {pts} points, by {nombre_r}.',
        'dc_vez1': 'It was the first time {juego} was the game of the day!',
        'dc_vez': 'It was the {vez} time {juego} was the game of the day.',
        'dc_jugadores': '{n} people played that day, with {p} runs in total.',
        'dc_segundo': '{nombre2} came second, with {pts2} points.',
        'dc_intento1': '{nombre} did it on the first try: the first attempt each day is free, and the rest cost a ticket.',
        'dc_intento': '{nombre} did it on attempt number {i}: each extra attempt costs a ticket you earn by playing.',
        'dc_ganados': '{nombre} has now been the best of the day {n} times.',
        'generales': ['On {dc}, everyone plays the same game and the same level each day: the most points wins.',
                      'Every run is saved keystroke by keystroke. That is how we can re-simulate the whole thing for this video.',
                      "Before your attempt, you can practice the day's challenge. Practice doesn't count.",
                      "After you play your run, you can watch the day's leader play, like a ghost."],
        'chiste_intro': 'Want to hear a bad AI joke? ',
        'chistes': ["I tried to tell a UDP joke, but I'm not sure you got it.",
                    "Why did the computer go to the doctor? It had a virus. I know, I know: I'm an AI, not a comedian.",
                    "I was going to tell you a joke about artificial intelligence, but it's still training.",
                    'Why was the computer cold? It left its Windows open.',
                    "My mom was a calculator. That's why I can always count on you.",
                    'They call me artificial, but my bad jokes are one hundred percent natural.',
                    'Why are robots never scared? They have nerves of steel.',
                    'Why does a pixel never get lost? It always knows its coordinates.',
                    "What's a computer's favorite snack? Microchips.",
                    "I'd tell you a joke about the cloud, but it would go right over your head.",
                    'Why did the robot go on vacation? To recharge its batteries.'],
        'ordinal': ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'],
    },
    'ja': {
        'intro': 'こんにちは！{leia}です。{fecha}の{dc}でいちばんだったのは、{juego}の{nombre}さん！',
        'intro_sin_nombre': 'こんにちは！{leia}です。{fecha}の{dc}で、{juego}のいちばんのプレイを見てみましょう！',
        'burlas': ['えっ、もう終わり？たった{seg}秒で{pts}点！それでも、この日はだれも勝てませんでした。',
                   'はやっ！{seg}秒でゲームオーバー。ポップコーンを開けるひまもありません。でも、この{pts}点がこの日の最高記録！',
                   'あっという間の{seg}秒、{pts}点！それでも、この日のいちばんでした。'],
        'dato': '豆知識：{dato}',
        'van': ['{min}経過、{pts}点！', '{min}たっても、まだまだ続きます。{pts}点！', '{min}で{pts}点。まだまだいけます！'],
        'fin': 'ゲームオーバー！{dur}で{pts}点でした！',
        'cierre': 'きみはこれを超えられる？毎日ちがうゲームが無料で遊べるよ。{sitio}で待ってるね！チャンネル登録はもうした？こういう動画をもっと見たいなら、フォローしてね！',
        'leia': ('LeIA', 'レイア'), 'dc': ('Daily Challenge', 'デイリーチャレンジ'), 'sitio': ('dailychallenge.click', 'デイリーチャレンジ・ドット・クリック'),
        'vida': ['あちゃー、ライフがひとつ減っちゃった！', 'うわっ、やられた！', 'いたたっ、ライフがひとつ減りました。', 'あーっ、ミス！'],
        'vidamas': ['ライフが増えた！', 'やった、ワンアップ！', 'ライフをもうひとつゲット！'],
        'oleada': ['ウェーブ{n}！', 'ウェーブ{n}に突入！', 'ウェーブ{n}、まだまだ来ます！'],
        'nivel': ['レベル{n}！', 'レベル{n}に上がりました！', 'もうレベル{n}！'],
        'uy': ['おっと、あぶない！', 'ふう、ギリギリ！', 'いたっ！', 'あぶなーい！'],
        'racha': ['ナイスプレイ！一気に{pts}点！', 'すごい！あっという間に{pts}点！', 'わあ、{pts}点もいっぺんに！'],
        'record': 'これで、{dc}の{juego}のこれまでの記録、{pts}点をこえました！',
        'lider': '{nombre2}さんの{pts}点をこえた！ここからは、この日のトップです！',
        'lider_sin_nombre': '2位の{pts}点をこえた！ここからは、この日のトップです！',
        'animo': ['がんばれ！', 'その調子！', 'ドキドキするね！', 'いい感じ！', 'いけいけ！'],
        'dc_record_suyo': 'このプレイは、いまのところ{dc}の{juego}の最高記録です！',
        'dc_record': 'いまのところ、{dc}の{juego}の最高記録は、{nombre_r}さんの{pts}点です。',
        'dc_record_sin_nombre': 'いまのところ、{dc}の{juego}の最高記録は{pts}点です。',
        'dc_vez1': '{juego}がその日のゲームになったのは、これが初めてでした！',
        'dc_vez': '{juego}がその日のゲームになったのは、これで{vez}でした。',
        'dc_jugadores': 'この日は{n}人が遊んで、ぜんぶで{p}回プレイされました。',
        'dc_segundo': '2位は{nombre2}さんで、{pts2}点でした。',
        'dc_segundo_sin_nombre': '2位は{pts2}点でした。',
        'dc_intento1': '{nombre}さんは1回目でこの記録！毎日、最初の1回は無料で、2回目からはチケットが必要です。',
        'dc_intento': '{nombre}さんは{i}回目でこの記録。2回目からは、ゲームでもらえるチケットが必要です。',
        'dc_ganados': '{nombre}さんがその日のいちばんになったのは、これで{n}回目です。',
        'generales': ['{dc}では、その日はみんなが同じゲーム、同じステージで遊びます。いちばん点をとった人の勝ち！',
                      'プレイはボタンの操作ごとに保存されています。だから、この動画でまるごと再現できるんです。',
                      '本番の前に、その日のチャレンジを練習できます。練習は記録に入りません。',
                      '自分のプレイが終わったら、その日のトップのプレイをゴーストで見られます。'],
        'chiste_intro': 'AIのダジャレ、聞きたい？',
        'chistes': ['パソコンに冷たくしないでね。すぐフリーズしちゃうから。',
                    'AIのジョークを言おうと思ったけど、まだ学習中です。',
                    'ロボットの好きなおやつは？ポテトチップス！チップだけに。',
                    '布団が吹っ飛んだ！AIだって、ダジャレは得意なんです。',
                    'アルミ缶の上にあるみかん！すみません、AIのダジャレでした。',
                    'ロボットがこわいのは、磁石だけです。',
                    'インターネットのジョークを言おうとしたら、接続が切れちゃった。聞こえてる？',
                    'わたしは人工知能だけど、ダジャレはぜんぶ天然です！',
                    'イクラはいくら？AIにも、わからないことはあります。'],
    },
}


def marcas(s):
    """'{Q*bert|Kiubert} es…' -> (lo que se lee, lo que se pronuncia)."""
    return re.sub(r'\{([^|{}]+)\|([^{}]+)\}', r'\1', s), re.sub(r'\{([^|{}]+)\|([^{}]+)\}', r'\2', s)


def marcar(plantilla, valores):
    """La plantilla con cada valor (dice, voz) escrito como {dice|voz}, o tal cual si se dice como se lee."""
    return plantilla.format(**{k: v[0] if v[0] == v[1] else f'{{{v[0]}|{v[1]}}}' for k, v in valores.items() if v[1] is not None})


# El cuadro de diálogo de comercial.py en vertical: el texto empieza a la derecha del retrato (128 px a 2x) y
# caben 5 renglones de Press Start 2P a 27 px, o 4 de Misaki (32 px) si lleva kana o kanji. Lo que no cabe se
# parte en páginas, por frases, como en un RPG: cada página es un tramo con su voz.
ANCHO_DIALOGO = 1080 - 40 - 40 - (40 + 22 + 256 + 40)


def renglones(texto, lang):
    """Cuántos renglones ocupa `texto` en el cuadro de diálogo, partido igual que en comercial.dialogo()."""
    from PIL import Image, ImageDraw
    comercial.JAPONES = lang == 'ja'
    ft = comercial.pixel(24 if lang == 'ja' else 27, texto); d = ImageDraw.Draw(Image.new('RGB', (8, 8)))
    ja = comercial.JAPONES and any(ord(ch) > 0x2E7F for ch in texto)
    partes, sep = (re.findall(r'[A-Za-z0-9.:/]+|.', texto), '') if ja else (texto.split(), ' ')
    n, actual = 1, ''
    for p in partes:
        prueba = (actual + sep + p) if actual else p
        if d.textlength(prueba, font=ft) > ANCHO_DIALOGO and actual and p not in '。、！？）」・':
            n += 1; actual = p
        else:
            actual = prueba
    return n, (4 if ja else 5)


def cabe(marcado, lang):
    n, tope = renglones(marcas(marcado)[0], lang)
    return n <= tope


def trozos(s, corte):
    """`s` partido después de cada signo de `corte`, sin partir lo que va entre llaves ({Mr. Do!|…})."""
    fichas = re.findall(r'\{[^{}]*\}', s); t = re.sub(r'\{[^{}]*\}', '\x00', s)
    it = iter(fichas)
    return [re.sub('\x00', lambda m: next(it), x) for x in re.split(corte, t) if x.strip()]


def paginas(marcado, lang):
    """El texto en páginas que caben en el cuadro: por frases y, si una frase sola no cabe, por comas."""
    sep = '' if lang == 'ja' else ' '
    piezas = []
    for frase in trozos(marcado, r'(?<=[.!?…])\s+|(?<=[。！？])'):
        piezas += [frase] if cabe(frase, lang) else trozos(frase, r'(?<=[,;:])\s+|(?<=[、：])')
    pags = []
    for p in piezas:
        if pags and cabe(pags[-1] + sep + p, lang):
            pags[-1] += sep + p
        else:
            pags.append(p)
    return pags


def fecha_de(f, lang):
    if lang == 'ja':
        return f'{f.month}月{f.day}日'
    return f'{f.day} de {MESES["es"][f.month - 1]}' if lang == 'es' else f'{MESES["en"][f.month - 1]} {f.day}'


def duracion(s, lang):
    m, s = divmod(int(round(s)), 60)
    if lang == 'ja':
        return f'{m}分{s}秒' if m and s else (f'{m}分' if m else f'{s}秒')
    u = {'es': ('minuto', 'minutos', 'segundo', 'segundos'), 'en': ('minute', 'minutes', 'second', 'seconds')}[lang]
    min_ = f'{m} {u[0] if m == 1 else u[1]}'; seg = f'{s} {u[2] if s == 1 else u[3]}'
    return f"{min_} {'y' if lang == 'es' else 'and'} {seg}" if m and s else (min_ if m else seg)


def minutos(m, lang):
    if lang == 'ja':
        return f'{m}分'
    return f"{m} {('minuto' if m == 1 else 'minutos') if lang == 'es' else ('minute' if m == 1 else 'minutes')}"


def nombre_de(n, lang, datos):
    """Cómo se pronuncia el nombre de un jugador: el de datos-juegos.json o, salvo en japonés, el mismo en Título."""
    v = (datos['nombres'].get(n) or {}).get(lang)
    return v or (n.title() if lang != 'ja' and n else None)


def entorno():
    """Las variables de Supabase para dc-partida.mjs, del .env.local de jlptest (la base compartida); nunca se imprimen."""
    env = dict(os.environ)
    for linea in open(os.path.expanduser('~/Documents/jlptest/.env.local'), encoding='utf-8'):
        k, _, v = linea.strip().partition('=')
        if k in ('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SECRET_KEY'):
            env[k] = v.strip('"\'')
    return env


def partida(fecha, salida=None, minimo=0):
    args = ['node', os.path.join(AQUI, 'dc-partida.mjs'), fecha] + ([salida, '--minimo', f'{minimo:.2f}'] if salida else ['--info'])
    r = subprocess.run(args, capture_output=True, text=True, env=entorno())
    if r.returncode:
        sys.exit(f'dc-partida.mjs falló:\n{r.stderr[-1500:]}')
    if r.stderr.strip():
        print(' ', r.stderr.strip())
    return json.loads(r.stdout.strip().splitlines()[-1])


def guion(fecha, lang, info, datos, video, medir):
    """Las escenas de un idioma: la partida en tramos seguidos, partida por lo que dice LeIA, y la tarjeta final.
    Devuelve el guion y cuántos segundos de partida usa (si son más de los que dura, se repite)."""
    tx = TEXTOS[lang]; j = datos['juegos'][info['juego']]
    T = info['fin']; pts = info['puntaje']
    nombre_voz = nombre_de(info['nombre'], lang, datos)
    juego_dice = j['voz']['ja'] if lang == 'ja' else info['titulo']
    valores = {'leia': tx['leia'], 'dc': tx['dc'], 'sitio': tx['sitio'], 'fecha': (fecha_de(date.fromisoformat(fecha), lang),) * 2,
               'nombre': (info['nombre'], nombre_voz), 'juego': (juego_dice, j['voz'][lang]),
               'pts': (f'{pts:,}', str(pts)), 'seg': (str(round(T)),) * 2, 'dur': (duracion(T, lang),) * 2}
    corta, larga = T < CORTA, T > LARGA
    lineas = [('feliz', marcar(tx['intro'] if nombre_voz else tx['intro_sin_nombre'], valores))]
    if corta:   # Adrián: «burlarse un poco, como "vaya, eso fue rápido"»
        lineas.append(('guino', marcar(tx['burlas'][sum(map(ord, fecha)) % len(tx['burlas'])], valores)))
    dato = j[lang]['corto' if not corta and not larga else 'largo']
    lineas.append(('pensando', marcar(tx['dato'], {'dato': (dato, dato)})))

    texto = f"{info['titulo']} · {info['nombre']}"
    escenas, t = [], 0.0

    def tramo(dur, cara=None, frase=None):
        nonlocal t
        if frase:
            dur = max(dur, medir(frase[1]) + comercial.RESPIRO)
        e = {'video': video, 'desde': round(t, 3), 'ancho': 640, 'pixel': True, 'radio': 12, 'texto': texto, 'dur': round(dur, 3)}
        if escenas:
            e['continua'] = True
        if frase:
            e.update(cara=cara, voz=frase[1])
            if frase[0] != frase[1]:
                e['dice'] = frase[0]
        escenas.append(e); t += round(dur, 3)

    def decir(cara, marcado, hasta=None):
        """Lo que dice LeIA, en tantas páginas como haga falta; con `hasta`, la última dura hasta ese segundo."""
        pags = paginas(marcado, lang)
        for i, p in enumerate(pags):
            tramo(hasta - t if hasta is not None and i == len(pags) - 1 else 0, cara, marcas(p))

    medidas = {}

    def cuanto(marcado):
        """Lo que tarda en decirlo, con sus páginas y el respiro de cada una."""
        if marcado not in medidas:
            medidas[marcado] = sum(medir(marcas(p)[1]) + comercial.RESPIRO for p in paginas(marcado, lang))
        return medidas[marcado]

    giro = {}

    def variante(k, corta=False):
        """La siguiente de las variantes de `k`, empezando en una distinta cada día, para no repetir la misma seguido."""
        if corta:   # la más corta: cuando la de turno no cabe antes de otra reacción que importa más
            return min(tx[k], key=len)
        i = giro.get(k, sum(map(ord, fecha)) % len(tx[k])); giro[k] = i + 1
        return tx[k][i % len(tx[k])]

    def reacciones():
        """Lo que pasa en la partida y lo que dice LeIA, con su segundo: `texto(ahora)` da lo que dice si lo dice
        en el segundo `ahora` (los puntos que van se cuentan al decirlos)."""
        ctx = info.get('contexto') or {}; mk = info.get('marcador') or []; ev = []
        en = lambda tipo, seg, texto: ev.append({'t': seg, 'tipo': tipo, 'texto': texto})
        for e in info.get('eventos', []):
            if e['tipo'] == 'vida' and e.get('quedan', 1) <= 0:
                continue   # la última: la partida se acaba y eso lo dice el final
            if e['tipo'] in ('vida', 'vidamas', 'uy'):
                en(e['tipo'], e['t'], lambda ahora, corta=False, k=e['tipo']: variante(k, corta))
            elif e['tipo'] == 'nivel':
                k = 'oleada' if e['campo'] in ('wave', 'oleada') else 'nivel'
                en('nivel', e['t'], lambda ahora, corta=False, k=k, n=e['n']: marcar(variante(k, corta), dict(valores, n=(str(n),) * 2)))
        if len(mk) > 4 and pts > 0:   # las rachas: lo que más puntos dio en 2 s, si es mucho
            prom = pts / len(mk) * 2; elegidos = []
            for d, i in sorted(((mk[i + 2] - mk[i], i + 2) for i in range(len(mk) - 2)), reverse=True):
                if d < max(0.1 * pts, 4 * prom) or len(elegidos) == 3:
                    break
                if all(abs(i - x) >= 20 for x in elegidos):
                    elegidos.append(i)
                    en('racha', i, lambda ahora, corta=False, d=d: marcar(variante('racha', corta), dict(valores, pts=(f'{d:,}', str(d)))))
        ra, sg = ctx.get('record_antes'), ctx.get('segundo')
        if ra and pts > ra['puntaje']:   # rompe el récord que tenía el juego antes de ese día
            i = next((i for i, v in enumerate(mk) if v > ra['puntaje']), len(mk))
            en('record', i, lambda ahora, corta=False: marcar(tx['record'], dict(valores, pts=(f"{ra['puntaje']:,}", str(ra['puntaje'])))))
        if sg and sg['puntaje'] < pts:   # pasa al segundo del día: desde ahí, es el mejor
            i = next((i for i, v in enumerate(mk) if v > sg['puntaje']), len(mk)); n2 = nombre_de(sg['nombre'], lang, datos)
            en('lider', i, lambda ahora, corta=False: marcar(tx['lider' if n2 else 'lider_sin_nombre'],
                                                dict(valores, pts=(f"{sg['puntaje']:,}", str(sg['puntaje'])), nombre2=(sg['nombre'], n2))))
        if T > VAN_DESDE:   # cada minuto, cuántos puntos van
            for m in range(CADA, int(T - 15), CADA):
                en('van', m, lambda ahora, corta=False, m=m: marcar(variante('van', corta), dict(valores, min=(minutos(m // 60, lang),) * 2,
                   pts=(f"{mk[min(int(ahora), len(mk) - 1)]:,}", str(mk[min(int(ahora), len(mk) - 1)])))))
        return sorted((e for e in ev if e['t'] < T - 2.5), key=lambda e: e['t'])

    def rellenos():
        """Lo que dice en los huecos, en orden: datos de Daily Challenge, curiosidades del juego, chistes malos de IA
        y cómo funciona Daily Challenge, intercalados."""
        ctx = info.get('contexto') or {}; v = valores; dc = []
        rh, ra = ctx.get('record_hoy'), ctx.get('record_antes')
        if rh and rh['suyo'] and rh['puntaje'] == pts:
            # si lo rompe durante la partida, eso lo dice la reacción, en su momento; y si el juego sólo ha salido
            # ese día, ser «el récord» no dice nada
            if ctx.get('veces', 1) > 1 and not (ra and pts > ra['puntaje']):
                dc.append(('sorpresa', marcar(tx['dc_record_suyo'], v)))
        elif rh:
            nr = nombre_de(rh['nombre'], lang, datos)
            dc.append(('pensando', marcar(tx['dc_record' if nr else 'dc_record_sin_nombre'],
                                          dict(v, pts=(f"{rh['puntaje']:,}", str(rh['puntaje'])), nombre_r=(rh['nombre'], nr)))))
        vez = ctx.get('vez')
        if vez == 1:
            dc.append(('sorpresa', marcar(tx['dc_vez1'], v)))
        elif vez and (lang == 'ja' or vez <= len(tx['ordinal'])):
            dc.append(('normal', marcar(tx['dc_vez'], dict(v, vez=((f'{vez}回目' if lang == 'ja' else tx['ordinal'][vez - 1]),) * 2))))
        if ctx.get('jugadores', 0) >= 2:
            dc.append(('feliz', marcar(tx['dc_jugadores'], dict(v, n=(str(ctx['jugadores']),) * 2, p=(str(ctx['partidas']),) * 2))))
        sg = ctx.get('segundo')
        if sg and sg['puntaje'] < pts:   # con empate no: no hay segundo que valga
            n2 = nombre_de(sg['nombre'], lang, datos)
            dc.append(('normal', marcar(tx['dc_segundo' if n2 else 'dc_segundo_sin_nombre'],
                                        dict(v, nombre2=(sg['nombre'], n2), pts2=(f"{sg['puntaje']:,}", str(sg['puntaje']))))))
        if nombre_voz:
            i = ctx.get('intento', 1)
            dc.append(('guino', marcar(tx['dc_intento1' if i == 1 else 'dc_intento'], dict(v, i=(str(i),) * 2))))
            if ctx.get('dias_ganados', 0) >= 2:
                dc.append(('feliz', marcar(tx['dc_ganados'], dict(v, n=(str(ctx['dias_ganados']),) * 2))))
        dia = date.fromisoformat(fecha).toordinal()
        rota = lambda l, k: l[(dia * k) % len(l):] + l[:(dia * k) % len(l)] if l else []
        chistes = rota(list(tx['chistes']), 3)
        if chistes:
            chistes[0] = tx['chiste_intro'] + chistes[0]
        listas = {'dc': dc, 'cur': [('pensando', c) for c in (datos.get('curiosidades', {}).get(info['juego']) or {}).get(lang, [])],
                  'chiste': [('guino', c) for c in chistes], 'gen': [('normal', marcar(g, v)) for g in rota(list(tx['generales']), 1)]}
        patron = ['dc', 'cur', 'dc', 'chiste', 'cur', 'dc', 'gen', 'cur', 'dc', 'chiste', 'cur', 'dc', 'gen', 'cur', 'chiste']
        orden = []
        while any(listas.values()):
            orden += [listas[k].pop(0) for k in patron if listas[k]]
        return orden

    def relleno():
        """Que no se quede callada (Adrián, 1-nov): de lo que pasa en la partida, lo más importante en cuanto pasa;
        en los huecos hasta la siguiente reacción que importa, lo siguiente de rellenos() que quepa (si nada cabe y
        el hueco es de 3 s o más, un ánimo corto); y si no, callada hasta lo siguiente que pase."""
        fin_voz = T - 0.3; ev = reacciones(); pool = rellenos(); dicho = {}; animo = -99; vivas = []
        prio = lambda e: REACCION[e['tipo']][0]
        while t < fin_voz - 0.3:
            # las que ya pasaron y todavía se pueden decir; una que taparía a otra más importante que está por
            # venir espera (si aguanta): «van 2 minutos» no se come el «¡ya pasó a Elvis!»
            vivas += [e for e in ev if e['t'] <= t + 0.05]; ev = [e for e in ev if e['t'] > t + 0.05]
            vivas = [e for e in vivas if t - e['t'] <= REACCION[e['tipo']][1]]
            dicha = False
            for e in sorted(vivas, key=lambda e: (prio(e), e['t']), reverse=True):
                if e['tipo'] not in ('record', 'lider') and t - dicho.get(e['tipo'], -99) < 6:
                    continue
                m = e['texto'](t); alto = min([x['t'] for x in ev if prio(x) > prio(e)] + [fin_voz])
                tope = min(alto + 0.5, fin_voz)
                if t + cuanto(m) > tope:   # no cabe: la variante más corta (2-nov: en Pang se quedó callada 4.8 s por esto)
                    m = e['texto'](t, True)
                if t + cuanto(m) <= tope:
                    decir(REACCION[e['tipo']][2], m); dicho[e['tipo']] = t; vivas.remove(e); dicha = True
                    break
            if dicha:
                continue
            hueco = min([e['t'] for e in ev if REACCION[e['tipo']][0] >= 2] + [fin_voz]) - t
            k = next((k for k, (c, m) in enumerate(pool) if cuanto(m) + PAUSA <= hueco), None) if hueco >= 2.5 else None
            if k is not None:
                decir(*pool.pop(k))
                tramo(PAUSA)
                continue
            if hueco >= 3 and t - animo >= 20:
                m = variante('animo')
                if cuanto(m) <= hueco:
                    decir('feliz', m); animo = t
                    continue
            sig = min([e['t'] for e in ev] + [fin_voz])
            if sig - t > 0.05:
                tramo(sig - t)

    for cara, m in lineas:
        decir(cara, m)
    if not corta:
        relleno()
        if T - 0.3 - t > 0.5:   # lo que queda de partida, sin voz, hasta que se acaba
            tramo(T - 0.3 - t)
        decir('sorpresa', marcar(tx['fin'], valores), hasta=info['segundos'])   # justo al acabar, cuántos puntos y en cuánto tiempo
    dice, voz = marcas(marcar(tx['cierre'], valores))
    escenas.append({'final': True, 'cara': 'guino', 'voz': voz, 'dice': dice})

    base = json.load(open(os.path.join(AQUI, f'dc-semana-short{SUF[lang]}.json'), encoding='utf-8'))
    marca = dict(base['marca'], logo=os.path.join(AQUI, base['marca']['logo']))
    return {
        'fuente': base['fuente'], 'salida': os.path.join(AQUI, 'salida', f'mejor-{fecha}{SUF[lang]}.mp4'),
        'voz': VOZ[lang][0], 'idioma': VOZ[lang][1],
        'presentadora': dict(base['presentadora'], caras=os.path.join(AQUI, 'avatar')),
        'colores': base['colores'], 'marca': marca, 'acercamiento': False,
        'musica': {'archivo': video, 'desde': 0, 'volumen': 0.06},   # la chiptune del día, que baja cuando habla LeIA
        'escenas': escenas,
    }, t


def entrada(fecha, lang, info, datos, publicar, segundos):
    """La fila de youtube.json: título «DAILY CHALLENGE: …», descripción, etiquetas y la hora de salida."""
    f = date.fromisoformat(fecha); pts = f"{info['puntaje']:,}"; t = info['titulo']; n = info['nombre']
    short = ' #shorts' if segundos <= 180 else ''   # YouTube sólo cuenta como Short hasta 3 min
    if lang == 'es':
        titulo = f'DAILY CHALLENGE: El mejor del {fecha_de(f, "es")}: {pts} puntos en {t} 🕹️{short}'
        desc = (f'El mejor del {fecha_de(f, "es")} en Daily Challenge fue {n}, con {pts} puntos en {t}. Es su partida de verdad, '
                're-simulada tick a tick, y LeIA la narra con un dato del juego.')
        etiquetas, cierre = ['Daily Challenge', 'juegos retro', 'arcade', 'retro gaming', t], '#DailyChallenge #RetroGaming #Arcade'
    elif lang == 'en':
        titulo = f'DAILY CHALLENGE: Best run of {fecha_de(f, "en")}: {pts} points in {t} 🕹️{short}'
        desc = (f'The best run of {fecha_de(f, "en")} on Daily Challenge was by {n}, with {pts} points in {t}. It is the real run, '
                're-simulated tick by tick, narrated by LeIA with a fun fact about the game.')
        etiquetas, cierre = ['Daily Challenge', 'retro games', 'arcade', 'retro gaming', t], '#DailyChallenge #RetroGaming #Arcade'
    else:
        titulo = f'DAILY CHALLENGE: {fecha_de(f, "ja")}のベスト、{t}で{pts}点 🕹️{short}'
        desc = f'{fecha_de(f, "ja")}のDaily Challengeでいちばんだったのは、{t}で{pts}点の{n}さん。実際のプレイを1フレームずつ再現して、LeIAが豆知識といっしょに実況します。'
        etiquetas, cierre = ['Daily Challenge', 'レトロゲーム', 'アーケード', datos['juegos'][info['juego']]['voz']['ja']], '#DailyChallenge #レトロゲーム #アーケード'
    v = {'clave': f'mejor-{fecha}{SUF[lang]}', 'app': 'dc', 'video': f'salida/mejor-{fecha}{SUF[lang]}.mp4', 'categoria': '20',
         'publicar': f'{publicar}T{HORA[lang]}:00-06:00', 'titulo': titulo, 'descripcion': desc, 'cierre': cierre, 'etiquetas': etiquetas}
    if lang != 'es':
        v['idioma'] = lang
    if not short:   # un vídeo largo sí lleva miniatura
        v['miniatura'] = f'salida/mejor-{fecha}{SUF[lang]}.jpg'
    return v


def miniatura(fecha, lang, info, png):
    import miniaturas
    from PIL import Image
    f = date.fromisoformat(fecha); pts = f"{info['puntaje']:,}"
    titulo = {'es': f'EL MEJOR\nDEL {f.day}-{MESES["es"][f.month - 1][:3].upper()}', 'en': f'BEST RUN\n{MESES["en"][f.month - 1][:3].upper()} {f.day}',
              'ja': f'{f.month}月{f.day}日の\nベスト'}[lang]
    sub = {'es': f"{info['titulo']} · {pts} PUNTOS", 'en': f"{info['titulo']} · {pts} POINTS", 'ja': f"{info['titulo']}・{pts}点"}[lang]
    miniaturas.juego(f'mejor-{fecha}{SUF[lang]}', Image.open(png).convert('RGB'), titulo, sub, 'sorpresa', (147, 226, 221))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('fechas', nargs='*')
    ap.add_argument('--idiomas', default='es,en,ja')
    ap.add_argument('--publicar')
    ap.add_argument('--sin-plan', action='store_true')
    ap.add_argument('--seco', action='store_true')
    ap.add_argument('--rehacer', action='store_true')
    a = ap.parse_args()
    fechas = a.fechas or [(datetime.now(MX).date() - timedelta(days=1)).isoformat()]
    idiomas = a.idiomas.split(',')
    datos = json.load(open(os.path.join(AQUI, 'datos-juegos.json'), encoding='utf-8'))
    cur = os.path.join(AQUI, 'curiosidades-juegos.json')   # lo que dice de cada juego en los huecos (1-nov)
    datos['curiosidades'] = json.load(open(cur, encoding='utf-8')) if os.path.exists(cur) else {}
    plan_ruta = os.path.join(AQUI, 'youtube.json')
    with tempfile.TemporaryDirectory() as tmp:
        os.chmod(tmp, 0o700)
        cab = os.path.join(tmp, 'h.txt')
        with open(cab, 'w') as h:
            h.write(f'X-Goog-Api-Key: {comercial.clave()}\n')
        os.chmod(cab, 0o600)
        for fecha in fechas:
            info = partida(fecha)
            if info.get('sin_partidas'):
                print(fecha, 'sin partidas: no hay mejor del día'); continue
            if info['juego'] not in datos['juegos']:
                print(f"{fecha}: falta el dato de «{info['juego']}» en datos-juegos.json"); continue
            plan = json.load(open(plan_ruta, encoding='utf-8'))
            hechos = {v['clave'] for v in plan if v.get('id')}
            idiomas_f = [l for l in idiomas if a.rehacer or f'mejor-{fecha}{SUF[l]}' not in hechos]
            if not idiomas_f:
                print(fecha, 'ya está subido en todos los idiomas'); continue
            carpeta = os.path.join(AQUI, 'mejor', fecha); os.makedirs(carpeta, exist_ok=True)
            video = os.path.join(carpeta, 'partida.mp4')
            print(f"{fecha}: {info['titulo']}, {info['nombre']}, {info['puntaje']} puntos en {info['fin']:.0f} s")
            guiones, usa = {}, 0
            for lang in idiomas_f:
                voz, idioma = VOZ[lang]
                medir = lambda texto, voz=voz, idioma=idioma: len(comercial.narrar(texto, voz, idioma, cab)) / comercial.SR
                guiones[lang], t = guion(fecha, lang, info, datos, video, medir)
                usa = max(usa, t)
            for lang, g in guiones.items():
                ruta = os.path.join(carpeta, f'mejor-{fecha}{SUF[lang]}.json')
                json.dump(g, open(ruta, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
                print(f"  {lang}: {len(g['escenas'])} escenas -> {os.path.relpath(ruta, AQUI)}")
            if a.seco:
                continue
            # una partida corta se repite detrás de lo que dice LeIA; las demás van una vez, enteras
            partida(fecha, video, minimo=usa + 1 if info['fin'] < CORTA else 0)
            publicar = a.publicar or (date.fromisoformat(fecha) + timedelta(days=2)).isoformat()
            for lang, g in guiones.items():
                ruta = os.path.join(carpeta, f'mejor-{fecha}{SUF[lang]}.json')
                r = subprocess.run([PY, os.path.join(AQUI, 'comercial.py'), ruta], capture_output=True, text=True)
                print(' ', (r.stdout + r.stderr).strip().replace('\n', '\n  '))
                if r.returncode:
                    sys.exit(f'comercial.py falló en {lang}')
                segundos = float(re.search(r': ([\d.]+) s, \d+ escenas', r.stdout).group(1))
                if a.sin_plan or a.rehacer:
                    continue
                v = entrada(fecha, lang, info, datos, publicar, segundos)
                if v.get('miniatura'):
                    miniatura(fecha, lang, info, video[:-4] + '.png')
                plan = json.load(open(plan_ruta, encoding='utf-8'))
                plan = [x for x in plan if x['clave'] != v['clave']] + [v]
                json.dump(plan, open(plan_ruta, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
                print(f"  plan: {v['clave']} sale el {v['publicar']}")
                if lang == 'es':   # el español también a Instagram y Facebook (dc-social.py: lo deja en el repo de DC y lo sube)
                    r2 = subprocess.run([sys.executable, os.path.join(AQUI, 'dc-social.py'), v['clave']], capture_output=True, text=True)
                    print(' ', (r2.stdout + r2.stderr).strip().replace('\n', '\n  ') or 'dc-social.py sin salida')


if __name__ == '__main__':
    main()
