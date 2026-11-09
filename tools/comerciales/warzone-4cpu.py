#!/usr/bin/env python3
"""La partida larga de War Zone para YouTube: cuatro equipos de la computadora, todos contra todos, narrada por LeIA
(9-nov-2026).

Adrián, 9-nov: los retos de ttcode se acaban (el último sale el 24-nov) y desde ahora va una partida larga simulada
de un juego cada 2 o 3 días, en rotación: War Zone → Kazan → ZANEI → maratón de Daily Challenge. Ésta es la de War
Zone, con 4 equipos (el juego los admite desde el 6-nov) en uno de los mapas nuevos.

  PY="$HOME/Documents/code challenge/.venv/bin/python"
  "$PY" tools/comerciales/warzone-4cpu.py cuatrofrentes 5 [--n 4] [--publicar 2026-11-12] [--idiomas es,en,ja]
        [--seco] [--sin-plan]

Para escoger mapa y semilla, en territorio war: node tools/anuncio.js --partida cuatrofrentes,archipielago,edificio
--buscar --semillas 1-12 --n 4 --equipos 4 (las de nota alta: mucha acción, sin muerte súbita y un final de uno solo;
mirar también en «fuera» que los equipos no caigan todos juntos).

1. La partida: tools/anuncio.js --partida de territorio war la graba en warzone-4cpu-<mapa>/<idioma>/ (largo.mp4 a
   1280x720 con el sonido del juego, y escaleta.json), una vez por idioma: los letreros del juego (TURNO, las armas,
   GANA…) salen en el idioma del vídeo, y la partida es la misma cuadro por cuadro. Si ya está grabada, no se graba.
2. El marcador de los lados (marcador-<idioma>.json): cada equipo con sus soldados, la vida de cada uno y quién tira,
   sacado de la escaleta. Lo pinta comercial.py en las escenas `arriba`: el juego va arriba sin nada encima y el
   cuadro de diálogo debajo (en una partida larga LeIA habla casi todo el tiempo, y encima del juego taparía lo de
   abajo, que en War Zone es donde caen al vacío; Adrián, 30-oct: «tapa la acción»).
3. Lo que dice LeIA (Adrián, 1-nov: «que hable casi todo el tiempo»): en cuanto pasa, cada baja (quién, con qué, si
   fue a la cabeza o al vacío y cuántos le quedan a ese equipo), los equipos que quedan fuera, los vuelos largos, los
   golpes fuertes y las rachas; cada minuto y medio, cómo va; y en los huecos, el mapa y los equipos al principio,
   datos del juego y de las armas, y chistes malos de IA, sin repetir. Al final, quién gana; en la tarjeta, quién
   eliminó a más, dónde jugar gratis y que se suscriban (Adrián, 31-oct).
4. comercial.py arma salida/warzone-4cpu-<mapa>[-en|-ja].mp4 (con capítulos); la miniatura sale de miniaturas.juego()
   y la entrada de youtube.json, el día --publicar a las 18:00 (es), 18:20 (en) y 18:40 (ja): el mejor del día de
   Daily Challenge va a las 19:00. Lo sube subir-youtube.py.
--seco escribe los guiones y dice cuánto habla LeIA, sin armar vídeos ni tocar youtube.json; sin --publicar arma los
vídeos sin tocar youtube.json, y --solo-plan --publicar AAAA-MM-DD sólo escribe youtube.json (con los vídeos ya armados y
revisados).
"""
import argparse, colorsys, json, os, re, subprocess, sys, tempfile, time, unicodedata

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import comercial   # narrar(): la misma voz y la misma caché que el vídeo, para medir cuánto dura cada frase

PY = os.path.expanduser('~/Documents/code challenge/.venv/bin/python')
WZ = os.path.expanduser('~/Documents/territorio war')
SUF = {'es': '', 'en': '-en', 'ja': '-ja'}
HORA = {'es': '18:00', 'en': '18:20', 'ja': '18:40'}
VOZ = {'es': ('es-US-Chirp3-HD-Achernar', 'es-US'), 'en': ('en-US-Chirp3-HD-Achernar', 'en-US'), 'ja': ('ja-JP-Chirp3-HD-Achernar', 'ja-JP')}
PAUSA = 0.45            # s de silencio extra después de un dato o un chiste (además de comercial.RESPIRO)
CADA = 90               # s: cada cuánto dice cómo va la partida
TONO = [9, 4, 12, 1]    # el tono Atari de cada equipo (battle.js, COLOR_EQUIPO): azul, rojo, verde, amarillo
# el cuadro de diálogo de comercial.py en horizontal: el texto empieza a la derecha del retrato (128 px a 2x) y caben
# 4 renglones de Press Start 2P a 30 px, o 3 de PixelMplus12 (32 → 36 px) si lleva kana o kanji; lo demás va en páginas
ANCHO_DIALOGO = 1920 - 60 - 40 - (60 + 22 + 256 + 40)

# Los nombres de la CPU (battle.js, NOMBRES y NOMBRES_DE_LA_CASA): cómo se escriben en lo que dice LeIA y cómo los
# dice la voz japonesa (en español e inglés, como se escriben)
NOMBRES = {
    'PACO': ('Paco', 'パコ'), 'LOLA': ('Lola', 'ロラ'), 'KIKO': ('Kiko', 'キコ'), 'TITO': ('Tito', 'ティト'), 'MEMO': ('Memo', 'メモ'),
    'NENA': ('Nena', 'ネナ'), 'RUDY': ('Rudy', 'ルディ'), 'BETO': ('Beto', 'ベト'), 'CHUY': ('Chuy', 'チュイ'), 'LUPE': ('Lupe', 'ルペ'),
    'NACHO': ('Nacho', 'ナチョ'), 'PINA': ('Pina', 'ピナ'), 'MOCO': ('Moco', 'モコ'), 'TACO': ('Taco', 'タコ'), 'CUCA': ('Cuca', 'クカ'),
    'BUBA': ('Buba', 'ブバ'), 'PEPE': ('Pepe', 'ペペ'), 'TOÑO': ('Toño', 'トニョ'), 'RICO': ('Rico', 'リコ'), 'LALO': ('Lalo', 'ラロ'),
    'MIMI': ('Mimi', 'ミミ'), 'CHATO': ('Chato', 'チャト'), 'ZETA': ('Zeta', 'セタ'), 'JOJO': ('Jojo', 'ジョジョ'), 'NINO': ('Nino', 'ニノ'),
    'ROCO': ('Roco', 'ロコ'), 'DUDU': ('Dudu', 'ドゥドゥ'), 'PILI': ('Pili', 'ピリ'),
    'LIOBAS': ('Liobas', 'リオバス'), 'CHUCHE EL AGUILA': ('Chuche el Águila', 'チュチェ・エル・アギラ'),
    'MANUEL GALVEZ': ('Manuel Gálvez', 'マヌエル・ガルベス'), 'EL TORERO': ('El Torero', 'エル・トレロ'), 'MILANGO': ('Milango', 'ミランゴ'),
    'MARTA MANTECAS': ('Marta Mantecas', 'マルタ・マンテカス'), 'APATZINGAN': ('Apatzingán', 'アパツィンガン'),
    'SOCORRITO': ('Socorrito', 'ソコリート'), 'LA BICHONGA': ('La Bichonga', 'ラ・ビチョンガ'),
}
CASA = ['LIOBAS', 'CHUCHE EL AGUILA', 'MANUEL GALVEZ', 'EL TORERO', 'MILANGO', 'MARTA MANTECAS', 'APATZINGAN', 'SOCORRITO', 'LA BICHONGA']
MAPAS = {
    'cuatrofrentes': {'es': ('Cuatro Frentes',) * 2, 'en': ('Four Fronts',) * 2, 'ja': ('四方の砦', 'しほうのとりで')},
    'archipielago': {'es': ('Archipiélago',) * 2, 'en': ('Archipelago',) * 2, 'ja': ('群島', 'ぐんとう')},
    'edificio': {'es': ('Edificio',) * 2, 'en': ('Building',) * 2, 'ja': ('ビル', 'ビル')},
}
NUM = {'es': ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis'],
       'en': ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen']}

# ---------------------------------------------------------------------------------------------------- lo que dice
TX = {
    'es': {
        'leia': ('LeIA', 'Leia'), 'wz': ('War Zone', 'Guar Zon'),
        'sitio': ('dailychallenge.click/warzone', 'Daily Challenge punto click, barra Guar Zon'),
        'equipos': [('azul', 'el azul', 'El azul'), ('rojo', 'el rojo', 'El rojo'), ('verde', 'el verde', 'El verde'), ('amarillo', 'el amarillo', 'El amarillo')],
        'armas': {'granada': 'la granada', 'rifle': 'el rifle', 'bota': 'la bota', 'bazuca': 'la bazuca', 'franco': 'el francotirador',
                  'bomba': 'la bomba', 'pico': 'el pico', 'plataforma': 'la plataforma', 'muro': 'el muro', 'harakiri': 'el hara kiri',
                  'laser': 'el láser', 'lanzagranadas': 'el lanzagranadas'},
        'intro': '¡Hola! Soy {leia}. Hoy, en {wz}: cuatro equipos, todos contra todos, en el mapa {mapa}. Las cuatro computadoras juegan solas, y todas en difícil.',
        'intro2': 'Azul, rojo, verde y amarillo, con {n} soldados cada uno. Sólo un equipo puede quedar en pie.',
        'plantel': ['En {el_eq} están {lista}.', 'Por {el_eq} juegan {lista}.'],
        'y': ' y ',
        'mapa': {'cuatrofrentes': 'El mapa es {mapa}: dos fuertes de tierra con su escalera de roca, un puente alto en medio y, en el centro, una garganta que da al vacío.',
                 'archipielago': 'El mapa es {mapa}: cuatro islas de tapa plana y el mar en medio. Caer al agua es morir.',
                 'edificio': 'El mapa es {mapa}: dos equipos empiezan afuera, uno a cada lado, y dos adentro, en el primer y el segundo piso.'},
        'headshot': ['¡Headshot! {autor} le da en la cabeza a {victima} con {arma}.', '¡A la cabeza! {victima} cae con {arma_de}.', '¡Tiro a la cabeza! {autor} elimina a {victima}.'],
        'laser': ['¡El láser! {autor} lo tenía guardado, y {victima} cae de un solo disparo.', '¡Zas, el láser de {autor}! {victima} queda fuera.'],
        'vuelo_vacio': ['¡{victima} sale volando {dist} píxeles… y cae al vacío! Fue {arma_de}.', '¡Qué vuelo! {victima} recorre {dist} píxeles por el aire y se va al vacío, por {arma_de}.'],
        'vacio': ['¡{victima} se cae al vacío! Fue {arma_de}.', '¡Al vacío! {Arma_de} deja a {victima} sin piso.'],
        'explota': ['¡{victima} cae con {arma_de}!', '¡Bum! {Arma_de} acaba con {victima}.', '¡Fuera {victima}! {Arma_de} no perdona.'],
        'tiro': ['¡{autor} remata a {victima} con {arma}!', '¡{victima} cae! Tiro de {autor}, con {arma}.'],
        'bota': ['¡Patada de {autor}, y {victima} cae!'],
        'propio': ['¡Ay, no! {victima} cae con su propio disparo.'],
        'amigo': ['¡Uy, fuego amigo! {Arma_de} se lleva a {victima}, de su mismo equipo.'],
        'subita': ['La muerte súbita se lleva a {victima}.'],
        'harakiri': ['¡Hara kiri! {autor} se sacrifica, y se lleva a {victima}.'],
        'doble': ['¡Doble baja! {Arma_de} se lleva a {victimas}.', '¡Dos de un solo golpe! {Arma_de} acaba con {victimas}.'],
        'doble_vacio': ['¡Doble baja! {Arma_de} manda al vacío a {victimas}.'],
        'triple': ['¡Triple baja! {Arma_de} se lleva a {victimas}.'],
        'corta': {'headshot': '¡Headshot a {victima}!', 'vacio': '¡{victima}, al vacío!', 'otra': '¡Cae {victima}!', 'varias': '¡Caen {victimas}!'},
        'queda_n': ['Al {eq} le quedan {n}.', '{El_eq} se queda con {n}.'],
        'queda_1': ['Al {eq} le queda uno solo: {ultimo}.', '{El_eq} se queda sólo con {ultimo}.'],
        'fuera': ['¡Y {el_eq} queda fuera!', '¡{El_eq} queda fuera de la partida!'],
        'siguen3': 'Quedan tres equipos: {lista}.',
        'siguen2': 'Quedan dos equipos: {a} contra {b}.',
        'uno_contra_uno': '¡Uno contra uno! {s1} contra {s2}.',
        'vuelo': ['¡Uf! {quien} sale volando {dist} píxeles, pero aterriza.', '¡Qué vuelo! {quien} recorre {dist} píxeles por el aire… y sigue en pie.', '¡Allá va {quien}! {dist} píxeles de vuelo, y se levanta.'],
        'golpe': ['¡Auch! {quien} pierde {dano} de vida.', '¡Eso dolió! A {quien} le quedan {vida} de vida.', '¡Uy! {dano} de daño para {quien}.'],
        'casi': ['¡{quien} sigue en pie con {vida} de vida! Por un pelo.', '¡Por poco! A {quien} le quedan {vida} de vida.'],
        'racha': ['{quien} ya lleva {k} bajas.', '¡{quien} va que vuela: {k} bajas!', '{quien} suma {k} bajas. ¡Cuidado con {el_eq}!'],
        'subita_aviso': '¡Muerte súbita! Desde ahora, todos pierden vida en cada turno.',
        'estado': 'Llevamos {min}. Quedan {total} soldados: {detalle}.',
        'estado_eq': '{el_eq} con {n}',
        'min': lambda m2: ('minuto y medio' if m2 == 3 else f"{NUM['es'][m2 // 2] if m2 // 2 < 17 else m2 // 2} minutos" + (' y medio' if m2 % 2 else '')),
        'fin1': '¡Y se acabó: gana {el_eq}! {quien} queda en pie, con {vida} de vida.',
        'finN': '¡Y se acabó: gana {el_eq}, con {lista} en pie!',
        'empate': '¡Y se acabó! Nadie queda en pie: es un empate.',
        'cierre_mvp': 'En {turnos} turnos, {mvp} eliminó a {k} rivales.',
        'cierre': ['¿Te atreves contra la computadora?', 'Juega gratis en el navegador, en {sitio}, o en Android y iPhone.', '¿Ya estás suscrito? Síguenos para más partidas como esta.'],
        'animo': ['¡Vamos!', '¡Qué nervios!', '¡Esto se pone bueno!', '¡Uy, uy, uy!', '¡A ver quién se anima!'],
        'casa': 'Algunos nombres de la computadora son de la casa: {lista}…',
        'cap': {'inicio': 'Cuatro equipos', 'primera': 'Primera baja', 'doble': 'Doble baja', 'fuera': 'Fuera {el_eq}', 'final': 'Juega gratis'},
        'marcador': {'fuera': 'FUERA', 'gana': 'GANA'},
    },
    'en': {
        'leia': ('LeIA', 'Leia'), 'wz': ('War Zone', 'War Zone'),
        'sitio': ('dailychallenge.click/warzone', 'dailychallenge dot click, slash war zone'),
        'equipos': [('Blue',) * 3, ('Red',) * 3, ('Green',) * 3, ('Yellow',) * 3],
        'armas': {'granada': 'grenade', 'rifle': 'rifle', 'bota': 'boot', 'bazuca': 'bazooka', 'franco': 'sniper rifle', 'bomba': 'bomb',
                  'pico': 'pickaxe', 'plataforma': 'platform', 'muro': 'wall', 'harakiri': 'hara-kiri', 'laser': 'laser', 'lanzagranadas': 'grenade launcher'},
        'intro': "Hi! I'm {leia}. Today in {wz}: four teams, every team for itself, on the {mapa} map. All four teams are played by the computer, on hard.",
        'intro2': 'Blue, Red, Green and Yellow, with {n} soldiers each. Only one team can be left standing.',
        'plantel': ['On {el_eq}: {lista}.', 'Playing for {el_eq}: {lista}.'],
        'y': ' and ',
        'mapa': {'cuatrofrentes': 'The map is {mapa}: two earth forts with rock stairs, a high bridge in the middle and, at the center, a gorge that drops into the void.',
                 'archipielago': 'The map is {mapa}: four flat-topped islands with the sea in between. Falling in the water means death.',
                 'edificio': 'The map is {mapa}: two teams start outside, one on each side, and two inside, on the first and second floors.'},
        'headshot': ['Headshot! {autor} hits {victima} right in the head with the {arma}.', "Right in the head! {victima} goes down to {autor_s} {arma}.", 'Clean headshot! {autor} takes out {victima}.'],
        'laser': ['The laser! {autor} was saving it, and {victima} goes down in one shot.', "Zap! {autor_s} laser takes out {victima}."],
        'vuelo_vacio': ["{victima} flies {dist} pixels… and into the void! That was {autor_s} {arma}.", "What a flight! {victima} travels {dist} pixels and drops into the void, thanks to {autor_s} {arma}."],
        'vacio': ["{victima} falls into the void! That was {autor_s} {arma}.", "Into the void! {autor_s} {arma} knocks {victima} off the edge."],
        'explota': ["{victima} goes down to {autor_s} {arma}!", "Boom! {autor_s} {arma} takes out {victima}.", "{victima} is out! {autor_s} {arma} shows no mercy."],
        'tiro': ['{autor} finishes off {victima} with the {arma}!', '{victima} is down! {autor} with the {arma}.'],
        'bota': ['A kick from {autor}, and {victima} is down!'],
        'propio': ['Oh no! {victima} goes down to their own shot.'],
        'amigo': ["Friendly fire! {autor_s} {arma} takes out {victima}, a teammate."],
        'subita': ['Sudden death claims {victima}.'],
        'harakiri': ['Hara-kiri! {autor} goes down fighting and takes {victima} along.'],
        'doble': ["Double kill! {autor_s} {arma} takes out {victimas}.", "Two in one shot! {autor_s} {arma} gets {victimas}."],
        'doble_vacio': ["Double kill! {autor_s} {arma} sends {victimas} into the void."],
        'triple': ["Triple kill! {autor_s} {arma} takes out {victimas}."],
        'corta': {'headshot': 'Headshot on {victima}!', 'vacio': '{victima}, into the void!', 'otra': '{victima} is down!', 'varias': '{victimas} are down!'},
        'queda_n': ['{El_eq} has {n} left.', '{El_eq} is down to {n}.'],
        'queda_1': ['{El_eq} has just one left: {ultimo}.', '{El_eq} is down to {ultimo} alone.'],
        'fuera': ['And {el_eq} is out!', '{El_eq} is out of the match!'],
        'siguen3': 'Three teams left: {lista}.',
        'siguen2': 'Two teams left: {a} against {b}.',
        'uno_contra_uno': 'One on one! {s1} against {s2}.',
        'vuelo': ['Whoa! {quien} flies {dist} pixels, but lands.', 'What a flight! {quien} travels {dist} pixels through the air… and is still standing.', 'There goes {quien}! {dist} pixels of air time, and back up again.'],
        'golpe': ['Ouch! {quien} loses {dano} health.', 'That hurt! {quien} is down to {vida} health.', 'Oof! {dano} damage to {quien}.'],
        'casi': ['{quien} is still standing with {vida} health! By a hair.', 'Close one! {quien} is down to {vida} health.'],
        'racha': ['{quien} already has {k} kills.', '{quien} is on fire: {k} kills!', '{quien} has {k} kills. Watch out for {el_eq}!'],
        'subita_aviso': 'Sudden death! From now on, everyone loses health every turn.',
        'estado': '{min} in. {Total} soldiers left: {detalle}.',
        'estado_eq': '{el_eq} with {n}',
        'min': lambda m2: ('A minute and a half' if m2 == 3 else f"{NUM['en'][m2 // 2].capitalize() if m2 // 2 < 17 else m2 // 2}" + (' and a half minutes' if m2 % 2 else ' minutes')),
        'fin1': "And it's over: {el_eq} wins! {quien} is the last one standing, with {vida} health.",
        'finN': "And it's over: {el_eq} wins, with {lista} still standing!",
        'empate': "And it's over! Nobody is left standing: it's a draw.",
        'cierre_mvp': 'In {turnos} turns, {mvp} took out {k} rivals.',
        'cierre': ['Think you can beat the computer?', 'Play free in the browser at {sitio}, or on Android and iPhone.', 'Are you subscribed yet? Follow us for more matches like this one.'],
        'animo': ['Come on!', 'This is tense!', "It's getting good!", 'Oh boy, oh boy!', "Who's next?"],
        'casa': 'Some of the computer’s soldiers have house names: {lista}…',
        'cap': {'inicio': 'Four teams', 'primera': 'First down', 'doble': 'Double kill', 'fuera': '{El_eq} is out', 'final': 'Play free'},
        'marcador': {'fuera': 'OUT', 'gana': 'WINS'},
    },
    'ja': {
        'leia': ('LeIA', 'レイア'), 'wz': ('War Zone', 'ウォーゾーン'),
        'sitio': ('dailychallenge.click/warzone', 'デイリーチャレンジ・ドット・クリック、スラッシュ、ウォーゾーン'),
        'equipos': [(('青チーム', 'あおチーム'),) * 3, (('赤チーム', 'あかチーム'),) * 3, (('緑チーム', 'みどりチーム'),) * 3, (('黄チーム', 'きいろチーム'),) * 3],
        'armas': {'granada': 'グレネード', 'rifle': 'ライフル', 'bota': 'ブーツ', 'bazuca': 'バズーカ', 'franco': 'スナイパー', 'bomba': ('爆弾', 'ばくだん'),
                  'pico': 'ツルハシ', 'plataforma': ('足場', 'あしば'), 'muro': ('壁', 'かべ'), 'harakiri': 'ハラキリ', 'laser': 'レーザー', 'lanzagranadas': 'ランチャー'},
        'intro': 'こんにちは！{leia}です。今日の{wz}は、4チームのバトルロイヤル。マップは{mapa}です。4チームともコンピューターが、しかもハードで戦います。',
        'intro2': '青、赤、緑、黄。各チーム{n}人の兵士で、最後まで生き残れるのは1チームだけ。',
        'plantel': ['{el_eq}は{lista}。', '{el_eq}のメンバーは{lista}。'],
        'y': 'と',
        'mapa': {'cuatrofrentes': 'マップは{mapa}。岩の階段がある土の砦が2つ、まん中に高い橋、そして中央には奈落へつづく谷があります。',
                 'archipielago': 'マップは{mapa}。平らな島が4つ、あいだは海。海に落ちたらアウトです。',
                 'edificio': 'マップは{mapa}。2チームは外の左右から、2チームはビルの中の2階と3階からスタートします。'},
        'headshot': ['ヘッドショット！{autor}が{arma}で{victima}の頭を撃ちぬきました！', '頭に命中！{victima}、{autor}の{arma}にやられました。', 'ヘッドショット！{autor}が{victima}をたおしました。'],
        'laser': ['レーザー！{autor}がとっておきの一発で{victima}をたおしました！', '出た、{autor}のレーザー！{victima}、一撃でダウン！'],
        'vuelo_vacio': ['{victima}が{dist}ピクセルふっ飛んで…奈落へ！{autor}の{arma}です。', 'すごい飛びっぷり！{victima}、{dist}ピクセル飛んで奈落に落ちました。{autor}の{arma}！'],
        'vacio': ['{victima}、奈落に落ちました！{autor}の{arma}です。', '奈落へまっさかさま！{autor}の{arma}で{victima}が落ちました。'],
        'explota': ['{autor}の{arma}で{victima}がダウン！', 'ドカーン！{autor}の{arma}が{victima}をたおしました。', '{victima}、脱落！{autor}の{arma}は容赦なし。'],
        'tiro': ['{autor}が{arma}で{victima}にとどめ！', '{victima}がダウン！{autor}の{arma}です。'],
        'bota': ['{autor}のキックで{victima}がダウン！'],
        'propio': ['あちゃー！{victima}、自分の攻撃でダウン…'],
        'amigo': ['あっ、同士討ち！{autor}の{arma}が、仲間の{victima}をたおしちゃいました。'],
        'subita': ['サドンデスで{victima}がダウン。'],
        'harakiri': ['ハラキリ！{autor}が身をすてて{victima}を道づれに！'],
        'doble': ['ダブルキル！{autor}の{arma}で{victimas}がダウン！', '一発で2人！{autor}の{arma}が{victimas}をまとめてたおしました！'],
        'doble_vacio': ['ダブルキル！{autor}の{arma}で{victimas}が奈落へ！'],
        'triple': ['トリプルキル！{autor}の{arma}で{victimas}がダウン！'],
        'corta': {'headshot': '{victima}にヘッドショット！', 'vacio': '{victima}、奈落へ！', 'otra': '{victima}、ダウン！', 'varias': '{victimas}がダウン！'},
        'queda_n': ['{eq}は残り{n}人。', '{eq}、あと{n}人です。'],
        'queda_1': ['{eq}は{ultimo}ひとりだけ。', '{eq}に残るのは{ultimo}だけです。'],
        'fuera': ['これで{eq}は全滅！', '{eq}、脱落です！'],
        'siguen3': '残るは{lista}の3チーム。',
        'siguen2': '残り2チーム！{a}対{b}です。',
        'uno_contra_uno': '一騎打ち！{s1}対{s2}！',
        'vuelo': ['うわっ！{quien}が{dist}ピクセルふっ飛んだけど、着地！', 'すごい飛距離！{quien}、{dist}ピクセル飛んでもまだ生きてます。', '{quien}が{dist}ピクセル飛ばされた！でも立ち上がります。'],
        'golpe': ['いたっ！{quien}に{dano}のダメージ。', '痛そう！{quien}の残りHPは{vida}。', 'うわっ、{quien}に{dano}ダメージ！'],
        'casi': ['{quien}、HP{vida}でギリギリ生きてます！', 'あぶない！{quien}の残りHPは{vida}だけ。'],
        'racha': ['{quien}、これで{k}人目！', '{quien}が絶好調！もう{k}人たおしました。', '{quien}、{k}キル目！{eq}に注目です。'],
        'subita_aviso': 'サドンデス！ここからは毎ターン、全員のHPが減っていきます。',
        'estado': '{min}経過。残りの兵士は{total}人：{detalle}。',
        'estado_eq': '{eq}{n}人',
        'min': lambda m2: f"{m2 // 2}分" + ('半' if m2 % 2 else ''),
        'fin1': '試合終了！勝ったのは{eq}！{quien}がHP{vida}で生き残りました！',
        'finN': '試合終了！勝ったのは{eq}！{lista}が生き残りました！',
        'empate': '試合終了！だれも残らず、引き分けです。',
        'cierre_mvp': '{turnos}ターンで、{mvp}が{k}人をたおしました。',
        'cierre': ['コンピューターに挑戦してみる？', 'ブラウザで無料：{sitio}。AndroidとiPhoneでも遊べます。', 'チャンネル登録はもうした？こういう対戦をもっと見たいなら、フォローしてね！'],
        'animo': ['がんばれ！', 'ドキドキするね！', 'おもしろくなってきた！', 'うわー、どうなる？', '次はだれだ？'],
        'casa': 'コンピューターの兵士には、おなじみの名前もあります。{lista}…',
        'cap': {'inicio': '4チームのバトル', 'primera': '最初の脱落', 'doble': 'ダブルキル', 'fuera': '{eq}脱落', 'final': '無料で遊ぶ'},
        'marcador': {'fuera': '脱落', 'gana': '勝ち'},
    },
}

# Lo que dice en los huecos, en este orden, sin repetir (el plantel de cada equipo, el mapa y los nombres de la casa se
# arman aparte). `cara` de LeIA; `desde`/`hasta`, el segundo de la partida en que puede ir. Comprobado contra el juego el
# 9-nov (weapons.js, ai.js, battle.js, campaign.js, maps.js): si algo cambia allá, cambiarlo aquí.
DATOS = [
    {'cara': 'feliz', 'hasta': 120,
     'es': 'Fíjate en los lados: ahí están los cuatro equipos, sus soldados y la vida de cada uno. La flechita marca quién tira.',
     'en': "Check the sides of the screen: there are the four teams, their soldiers and everyone's health. The little arrow shows who's shooting.",
     'ja': '画面の左右を見てね。4つのチームと兵士たち、それぞれのHPが出ています。矢印は今撃っている兵士です。'},
    {'cara': 'normal', 'es': 'Cada turno, el soldado camina un poco, elige un arma, apunta y dispara. Luego le toca al siguiente equipo.',
     'en': "Each turn, a soldier walks a bit, picks a weapon, aims and fires. Then it's the next team's turn.",
     'ja': '1ターンでできるのは、少し歩いて、武器をえらんで、狙って撃つこと。そして次のチームの番です。'},
    {'cara': 'guino', 'es': '¿Te cuento un chiste malo de IA? ¿Por qué la granada no tiene amigos? Porque siempre explota.',
     'en': "Want to hear a bad AI joke? Why doesn't the grenade have any friends? It always blows up.",
     'ja': 'AIのダジャレ、聞きたい？グレネードに友だちがいないのはなぜ？すぐキレて爆発するから。'},
    {'cara': 'pensando', 'es': 'Un tiro a la cabeza con rifle, francotirador o láser mata de un solo golpe, tenga la vida que tenga.',
     'en': 'A headshot with the rifle, the sniper rifle or the laser kills in one hit, no matter how much health is left.',
     'ja': 'ライフル、スナイパー、レーザーで頭を撃たれたら、HPがいくつあっても一発でアウトです。'},
    {'cara': 'pensando', 'es': 'En difícil, la computadora falla cuando mucho por tres grados, y cuatro de cada diez turnos busca la cabeza.',
     'en': 'On hard, the computer misses by three degrees at most, and four turns out of ten it goes for the head.',
     'ja': 'ハードのコンピューターは、ずれても3度まで。しかも10ターンに4回は頭をねらってきます。'},
    {'cara': 'normal', 'es': 'Los equipos juegan en orden: azul, rojo, verde y amarillo. Al que se queda sin soldados, se lo saltan.',
     'en': 'Teams play in order: Blue, Red, Green and Yellow. A team with no soldiers left gets skipped.',
     'ja': 'チームの順番は青、赤、緑、黄。兵士がいなくなったチームは飛ばされます。'},
    {'cara': 'triste', 'es': 'Caer al vacío también es morir, aunque tengas cien de vida.',
     'en': 'Falling into the void is also death, even with a hundred health.',
     'ja': '奈落に落ちても、もちろんアウト。HPが100あってもです。'},
    {'cara': 'pensando', 'es': 'La granada nunca se acaba y tarda tres segundos en explotar: le da tiempo de rebotar.',
     'en': 'Grenades never run out, and they take three seconds to go off: plenty of time to bounce.',
     'ja': 'グレネードは使いほうだい。爆発まで3秒あるので、はねてころがります。'},
    {'cara': 'guino', 'es': 'Iba a contarte un chiste de inteligencia artificial, pero todavía lo estoy entrenando.',
     'en': "I was going to tell you a joke about artificial intelligence, but it's still training.",
     'ja': 'AIのジョークを言おうと思ったけど、まだ学習中です。'},
    {'cara': 'sorpresa', 'es': 'La bomba hace la explosión más grande del juego, pero cada equipo sólo trae dos.',
     'en': 'The bomb makes the biggest explosion in the game, but each team only gets two.',
     'ja': '爆弾はゲームでいちばん大きな爆発。でも、1チーム2個だけです。'},
    {'cara': 'normal', 'es': 'Cada explosión se come el terreno: el mapa cambia en cada turno.',
     'en': 'Every explosion eats away the ground: the map changes every turn.',
     'ja': '爆発するたびに地形がけずれて、マップはどんどん変わっていきます。'},
    {'cara': 'pensando', 'es': 'El francotirador atraviesa: si hay dos en fila, les da a los dos. Sólo trae dos balas.',
     'en': 'The sniper rifle goes right through: line up two soldiers and it hits both. It only has two bullets.',
     'ja': 'スナイパーの弾はつらぬきます。2人ならんでいたら2人とも。弾は2発だけ。'},
    {'cara': 'guino', 'es': 'Dicen que soy artificial, pero mis chistes malos son cien por ciento naturales.',
     'en': 'They call me artificial, but my bad jokes are one hundred percent natural.',
     'ja': 'わたしは人工知能だけど、ダジャレはぜんぶ天然です！'},
    {'cara': 'normal', 'es': 'La bazuca explota en cuanto toca algo. Hay tres por equipo.',
     'en': 'The bazooka blows up the moment it touches anything. Three per team.',
     'ja': 'バズーカは何かに当たったしゅんかんに爆発。1チーム3発です。'},
    {'cara': 'feliz', 'es': '{wz} se ve como un juego de Atari 2600: la paleta tiene ciento veintiocho colores, como la consola.',
     'en': '{wz} looks like an Atari 2600 game: the palette has a hundred and twenty-eight colors, just like the console.',
     'ja': '{wz}はアタリ2600風。パレットは本物のゲーム機と同じ128色です。'},
    {'cara': 'pensando', 'es': 'La computadora casi nunca dispara si puede herir a los suyos. Casi.',
     'en': 'The computer almost never fires if it could hurt its own team. Almost.',
     'ja': 'コンピューターは、仲間に当たりそうなときはほとんど撃ちません。ほとんど、ね。'},
    {'cara': 'sorpresa', 'es': 'El láser se gana en la campaña: un solo disparo, de cien de daño.',
     'en': 'The laser is unlocked in the campaign: a single shot, a hundred damage.',
     'ja': 'レーザーはキャンペーンで手に入ります。1発だけ、ダメージは100。'},
    {'cara': 'guino', 'es': '¿Por qué los robots nunca tienen miedo? Porque tienen nervios de acero.',
     'en': 'Why are robots never scared? They have nerves of steel.',
     'ja': 'ロボットがこわいのは、磁石だけです。'},
    {'cara': 'normal', 'es': 'El rifle es infinito y quita veinte… pero a la cabeza, mata.',
     'en': 'The rifle never runs out and does twenty damage… but a headshot kills.',
     'ja': 'ライフルは撃ちほうだいでダメージ20。でも頭に当たれば一撃です。'},
    {'cara': 'feliz', 'es': '{wz} tiene campaña: diez misiones, y al final, el General Huesos, que llega en helicóptero.',
     'en': '{wz} has a campaign: ten missions, and at the end, General Bones, who shows up in a helicopter.',
     'ja': '{wz}にはキャンペーンもあります。全10ミッション。最後にはヘリコプターでジェネラル・ホネが登場！'},
    {'cara': 'pensando', 'es': 'La bota casi no quita vida, pero empuja. Junto a un barranco, es la más peligrosa.',
     'en': "The boot barely does damage, but it pushes. Next to a cliff, it's the deadliest weapon.",
     'ja': 'ブーツのダメージは少しだけ。でもけとばせるので、がけの近くではいちばんこわい武器です。'},
    {'cara': 'normal', 'es': 'También hay retos, con medallas de bronce, plata y oro.',
     'en': 'There are also challenges, with bronze, silver and gold medals.',
     'ja': 'チャレンジモードもあって、銅・銀・金のメダルがもらえます。'},
    {'cara': 'guino', 'es': '¿Qué hace una IA en una guerra de artillería? Calcula la parábola perfecta… y luego falla igual.',
     'en': 'What does an AI do in an artillery war? Calculates the perfect arc… and misses anyway.',
     'ja': 'AIが砲撃戦でなにをするか？完ぺきな放物線を計算して…それでも外します。'},
    {'cara': 'feliz', 'es': 'En línea pueden jugar hasta cuatro personas, cada una con su equipo. O dos contra dos.',
     'en': 'Online, up to four people can play, each with their own team. Or two on two.',
     'ja': 'オンラインでは最大4人まで。1人1チームでも、2対2でも遊べます。'},
    {'cara': 'normal', 'es': 'Con el pico se cavan túneles, y con la plataforma y el muro, se construye.',
     'en': 'The pickaxe digs tunnels, and the platform and the wall let you build.',
     'ja': 'ツルハシでトンネルをほって、足場と壁で地形を作れます。'},
    {'cara': 'feliz', 'es': 'En Batalla se arma cualquier combinación: humanos o computadoras, de dos a cuatro equipos. Así se armó esta partida.',
     'en': "In Battle mode you can set up any combination: humans or computers, from two to four teams. That's how this match was made.",
     'ja': 'バトルモードでは、人間とコンピューターを自由に組み合わせて2〜4チームで対戦できます。この試合もそうやって作りました。'},
    {'cara': 'guino', 'es': '¿Por qué un pixel nunca se pierde? Porque siempre sabe sus coordenadas.',
     'en': 'Why does a pixel never get lost? It always knows its coordinates.',
     'ja': 'ピクセルが迷子にならないのはなぜ？いつも自分の座標を知っているから。'},
    {'cara': 'sorpresa', 'es': 'Y está el hara kiri: un solo uso, y se lleva a quien esté detrás.',
     'en': "And there's the hara-kiri: one use only, and it takes down whoever is behind you.",
     'ja': 'それからハラキリ。1回だけ使えて、うしろにいる相手を道づれにします。'},
    {'cara': 'normal', 'es': 'Cada soldado empieza con cien de vida. Las barras de arriba son la vida de cada equipo.',
     'en': "Every soldier starts with a hundred health. The bars at the top are each team's health.",
     'ja': '兵士のHPは最初100。上のバーはチームごとのHPです。'},
    {'cara': 'feliz', 'es': 'Cada mapa tiene su música, y toda es de la familia del hardcore: gabber, breakcore, frenchcore…',
     'en': "Every map has its own track, and they're all from the hardcore family: gabber, breakcore, frenchcore…",
     'ja': 'マップごとに曲があって、ぜんぶハードコア系。ガバ、ブレイクコア、フレンチコア…'},
    {'cara': 'guino', 'es': 'Mi mamá era una calculadora. Por eso siempre cuento contigo.',
     'en': "My mom was a calculator. That's why I can always count on you.",
     'ja': 'パソコンに冷たくしないでね。すぐフリーズしちゃうから。'},
    {'cara': 'pensando', 'es': 'Si la partida se alarga, llega la muerte súbita: con cuatro equipos, desde el turno ochenta todos pierden vida en cada turno.',
     'en': 'If the match drags on, sudden death kicks in: with four teams, from turn eighty everyone loses health every turn.',
     'ja': '試合が長びくとサドンデス。4チームなら80ターン目から、毎ターン全員のHPが減っていきます。'},
    {'cara': 'feliz', 'es': 'Los soldados llevan gorros: casco, gorra, afro, sombrero de copa… y se desbloquean jugando.',
     'en': 'The soldiers wear hats: helmet, cap, afro, top hat… and you unlock them by playing.',
     'ja': '兵士は帽子をかぶっています。ヘルメット、キャップ、アフロ、シルクハット…遊ぶほど増えていきます。'},
    {'cara': 'normal', 'es': 'El lanzagranadas se gana en los retos: suelta tres granadas de un jalón.',
     'en': 'The grenade launcher is unlocked in the challenges: it fires three grenades at once.',
     'ja': 'ランチャーはチャレンジで手に入ります。グレネードを3つ同時に発射！'},
    {'cara': 'guino', 'es': 'Si yo jugara, elegiría la bota. No hace mucho daño, pero empuja… como mis chistes.',
     'en': "If I played, I'd pick the boot. Not much damage, but it really pushes… like my jokes.",
     'ja': 'わたしが遊ぶならブーツをえらぶかな。ダメージは少ないけど、ぐいぐい押す。わたしのダジャレみたいに。'},
    {'cara': 'pensando', 'es': 'Esta partida es una simulación: con la misma semilla, sale exactamente igual, turno por turno.',
     'en': 'This match is a simulation: with the same seed, it plays out exactly the same, turn by turn.',
     'ja': 'この試合はシミュレーション。同じシードなら、1ターンずつまったく同じ試合になります。'},
    {'cara': 'normal', 'es': 'Mientras la computadora apunta, aquí lo adelantamos al doble. Todo lo demás va a velocidad normal.',
     'en': 'While the computer aims, we speed it up to double here. Everything else is at normal speed.',
     'ja': 'コンピューターが狙っているあいだだけ2倍速にしています。ほかはふつうの速さです。'},
    {'cara': 'feliz', 'es': 'Los soldados se burlan: ¡ja, ja! cuando cae un rival, y ¡grrr! cuando les dan.',
     'en': 'The soldiers taunt each other: ha ha! when a rival falls, and grrr! when they get hit.',
     'ja': '兵士たちは挑発もします。相手がたおれたら「ハハ」、撃たれたら「ぐぬぬ」。'},
    {'cara': 'guino', 'es': 'Traté de ponerme a dieta, pero mi archivo no se dejó comprimir.',
     'en': "I tried to go on a diet, but my file wouldn't compress.",
     'ja': 'アルミ缶の上にあるみかん！すみません、AIのダジャレでした。'},
    {'cara': 'normal', 'es': 'Cada equipo trae lo mismo: granadas, rifle y bota sin límite, y lo demás, contado.',
     'en': 'Every team brings the same kit: unlimited grenades, rifle and boot, and everything else is limited.',
     'ja': 'どのチームも装備は同じ。グレネード、ライフル、ブーツは無限で、ほかは数に限りがあります。'},
    {'cara': 'pensando', 'es': 'Con cuatro equipos, el que más pega no siempre gana: a veces gana el que nadie está mirando.',
     'en': "With four teams, the hardest hitter doesn't always win: sometimes it's the one nobody is watching.",
     'ja': '4チーム戦では、いちばん強いチームが勝つとはかぎりません。ノーマークのチームが勝つこともあります。'},
    {'cara': 'feliz', 'es': 'En la pausa se cambia el estilo: Atari, o vector, con puras líneas.',
     'en': 'From the pause menu you can switch styles: Atari, or vector, all lines.',
     'ja': 'ポーズメニューで見た目を変えられます。アタリ風か、線だけのベクター風。'},
    {'cara': 'normal', 'es': 'El reloj está apagado: la computadora se toma el tiempo que quiera para pensar.',
     'en': 'The timer is off: the computer can take as long as it wants to think.',
     'ja': 'タイマーはオフ。コンピューターは好きなだけ考えられます。'},
    {'cara': 'feliz', 'es': '{wz} es gratis en el navegador, en Android y en iPhone.',
     'en': '{wz} is free in the browser, on Android and on iPhone.',
     'ja': '{wz}はブラウザ、Android、iPhoneで無料で遊べます。'},
    {'cara': 'normal', 'es': 'Ahora todos esperan su turno. La paciencia también es un arma.',
     'en': 'Now everyone waits for their turn. Patience is a weapon too.',
     'ja': 'みんな自分の番を待っています。がまんも武器のひとつです。'},
]
# lo del mapa, después del plantel (sólo el del mapa que toca)
DATOS_MAPA = {
    'cuatrofrentes': [
        {'cara': 'sorpresa', 'es': 'Ojo con la garganta del centro: dieciséis píxeles de ancho, y abajo, nada.',
         'en': 'Watch out for the gorge in the middle: sixteen pixels wide, and nothing below.', 'ja': '中央の谷に注意。はばは16ピクセル、その下には何もありません。'},
        {'cara': 'pensando', 'es': 'Desde el puente alto se ve todo… y a ti también te ven todos.',
         'en': 'From the high bridge you can see everything… and everyone can see you.', 'ja': '高い橋の上からは全部見わたせます。でも、みんなからも丸見えです。'},
        {'cara': 'normal', 'es': 'Las almenas de los fuertes cubren un poco contra los tiros rectos. Un poco.',
         'en': 'The battlements on the forts give a little cover from straight shots. A little.', 'ja': '砦の胸壁は、まっすぐな弾を少しだけ防いでくれます。少しだけ。'},
    ],
    'archipielago': [
        {'cara': 'sorpresa', 'es': 'Entre isla e isla hay dieciséis píxeles de mar, y en el centro, una piedra para saltar.',
         'en': 'Between the islands there are sixteen pixels of sea, and in the middle, a stepping stone.', 'ja': '島と島のあいだの海は16ピクセル。まん中には飛び石があります。'},
        {'cara': 'pensando', 'es': 'Arriba hay dos repisas de roca: desde ahí se tira mejor… y se cae más lejos.',
         'en': 'Up top there are two rock ledges: better aim from there… and a longer fall.', 'ja': '上には岩の出っぱりが2つ。狙いやすいけど、落ちたら遠いです。'},
    ],
    'edificio': [
        {'cara': 'sorpresa', 'es': 'Afuera de cada puerta hay un foso al vacío. Se salta… si no te empujan.',
         'en': "Outside each door there's a pit into the void. You can jump it… unless someone pushes you.", 'ja': '入口の外には奈落への穴。ジャンプでこえられます…押されなければ。'},
        {'cara': 'pensando', 'es': 'A la azotea no sale nadie, pero se puede subir por la escalera de la izquierda.',
         'en': 'Nobody starts on the rooftop, but you can climb up by the stairs on the left.', 'ja': '屋上からスタートするチームはないけど、左の階段からのぼれます。'},
    ],
}


# ---------------------------------------------------------------------------------------------------- marcas
def marcas(s):
    """'{Chuche el Aguila|チュチェ・エル・アギラ}…' -> (lo que se lee, lo que se pronuncia)."""
    return re.sub(r'\{([^|{}]*)\|([^{}]*)\}', r'\1', s), re.sub(r'\{([^|{}]*)\|([^{}]*)\}', r'\2', s)


def par(v):
    return v if isinstance(v, tuple) else (v, v)


def marcar(plantilla, valores):
    """La plantilla con cada valor (dice, voz) escrito como {dice|voz}, o tal cual si se dice como se lee."""
    return plantilla.format(**{k: (lambda d, v: d if d == v else f'{{{d}|{v}}}')(*par(x)) for k, x in valores.items()})


def sin_acentos(s):
    return ''.join(ch for ch in unicodedata.normalize('NFD', s) if unicodedata.category(ch) != 'Mn')


def trozos(s, corte):
    """`s` partido después de cada signo de `corte`, sin partir lo que va entre llaves."""
    fichas = re.findall(r'\{[^{}]*\}', s); t = re.sub(r'\{[^{}]*\}', '\x00', s)
    it = iter(fichas)
    return [re.sub('\x00', lambda m: next(it), x) for x in re.split(corte, t) if x.strip()]


def renglones(texto, lang):
    """Cuántos renglones ocupa `texto` en el cuadro de diálogo horizontal, partido igual que en comercial.dialogo()."""
    from PIL import Image, ImageDraw
    comercial.TODO_PIXEL = True; comercial.JAPONES = comercial.JAPONES_12 = lang == 'ja'
    ft = comercial.pixel(32 if lang == 'ja' else 30, texto); d = ImageDraw.Draw(Image.new('RGB', (8, 8)))
    ja = comercial.JAPONES and any(ord(ch) > 0x2E7F for ch in texto)
    partes, sep = (re.findall(r'[A-Za-z0-9.:/]+|.', texto), '') if ja else (texto.split(), ' ')
    n, actual = 1, ''
    for p in partes:
        prueba = (actual + sep + p) if actual else p
        if d.textlength(prueba, font=ft) > ANCHO_DIALOGO and actual and p not in '。、！？）」・':
            n += 1; actual = p
        else:
            actual = prueba
    return n <= (3 if ja else 4)


def paginas(marcado, lang):
    """El texto en páginas que caben en el cuadro: por frases y, si una frase sola no cabe, por comas."""
    sep = '' if lang == 'ja' else ' '
    cabe = lambda m: renglones(marcas(m)[0], lang)
    piezas = []
    for frase in trozos(marcado, r'(?<=[.!?…])\s+|(?<=[。！？])'):
        piezas += [frase] if cabe(frase) else trozos(frase, r'(?<=[,;:])\s+|(?<=[、：])')
    pags = []
    for p in piezas:
        if pags and cabe(pags[-1] + sep + p):
            pags[-1] += sep + p
        else:
            pags.append(p)
    return pags


# ---------------------------------------------------------------------------------------------------- la partida
def color_equipo(tono, lum=6):
    """atari(tono, lum) de palette.js, en RGB."""
    h = (55 - (tono - 1) * 24 + 720) % 360; l = (14 + lum * 10) / 100; s = (90 - lum * 5) / 100
    return [round(x * 255) for x in colorsys.hls_to_rgb(h / 360, l, s)]


class Partida:
    """La escaleta de tools/anuncio.js --partida (la española: los tiempos son los mismos en los tres idiomas)."""

    def __init__(self, esc):
        self.esc = esc; self.E = esc['eventos']
        self.equipos = [q['nombre'] for q in esc['equipos']]
        self.soldados = [q['monigotes'] for q in esc['equipos']]
        self.donde = {n: (e, k) for e, ns in enumerate(self.soldados) for k, n in enumerate(ns)}
        self.fin = next((e for e in self.E if e['tipo'] == 'fin'), None)
        self.T = esc['largo']['segundos']
        self.muertes = [e for e in self.E if e['tipo'] in ('muere', 'cae_al_vacio')]
        self.grupos = self.agrupar()

    def quien(self, s):
        """'CHUCHE EL AGUILA (AZUL)' -> 'CHUCHE EL AGUILA'."""
        return s.rsplit(' (', 1)[0] if s else None

    def vivos_en(self, t):
        v = [len(s) for s in self.soldados]
        for e in self.muertes:
            if e['t'] <= t + 1e-6:
                v = e['vivos']
        return v

    def agrupar(self):
        """Las bajas por disparo: las que causó el mismo tiro, con quién tiró, con qué, si fue a la cabeza, si salió
        volando al vacío, y cómo quedan los equipos."""
        grupos, disparo, actual = [], None, None
        vuelos = {}
        for e in self.E:
            if e['tipo'] == 'disparo':
                disparo = e
            elif e['tipo'] == 'sale_volando':
                vuelos[self.quien(e['quien'])] = e
            elif e['tipo'] in ('muere', 'cae_al_vacio'):
                v = self.quien(e['quien'])
                if actual and actual['disparo'] is disparo and e['t'] - actual['t_muerte'] <= 4:
                    g = actual
                else:
                    g = actual = {'disparo': disparo, 't_muerte': e['t'], 'victimas': [], 'cabeza': set()}
                    grupos.append(g)
                vu = vuelos.get(v)
                g['victimas'].append({'nombre': v, 'equipo': self.donde[v][0], 'vacio': e['tipo'] == 'cae_al_vacio', 'por': e.get('por'),
                                      'vuelo': vu['distancia'] if vu and vu['termina'] != 'aterriza' and e['t'] - vu['t'] <= 3 else 0,
                                      't_vuelo': vu['t'] if vu and e['t'] - vu['t'] <= 3 else None})
                g['vivos'] = e['vivos']; g['t_fin'] = e['t']
        # los headshots: el evento va en el mismo segundo que la muerte
        for e in self.E:
            if e['tipo'] == 'headshot':
                v = self.quien(e['a'])
                for g in grupos:
                    if any(x['nombre'] == v for x in g['victimas']) and abs(g['t_muerte'] - e['t']) < 0.5:
                        g['cabeza'].add(v)
        for g in grupos:
            g['autor'] = self.quien(g['disparo']['quien']) if g['disparo'] else None
            g['arma'] = g['disparo']['id'] if g['disparo'] else None
            g['t'] = min([g['t_muerte']] + [x['t_vuelo'] for x in g['victimas'] if x['t_vuelo'] is not None and x['vuelo'] >= 40])
        return grupos

    def bajas(self):
        """Cuántos eliminó cada soldado (sin contar los suyos)."""
        k = {}
        for g in self.grupos:
            if not g['autor']:
                continue
            ea = self.donde[g['autor']][0]
            k[g['autor']] = k.get(g['autor'], 0) + sum(1 for x in g['victimas'] if x['equipo'] != ea and not x['por'])
        return k


def marcador(p, esc_l, lang):
    """El marcador de los lados para comercial.py: los nombres de los equipos como en el juego, en ese idioma."""
    hp = [[100] * len(s) for s in p.soldados]; activo = None; gana = None
    estados = [{'t': 0, 'hp': [list(x) for x in hp], 'activo': None, 'gana': None}]
    for e in p.E:
        tipo = e['tipo']
        if tipo == 'turno':
            activo = list(p.donde[p.quien(e['quien'])])
        elif tipo == 'golpe':
            for g in e['golpes']:
                i, k = p.donde[p.quien(g['quien'])]; hp[i][k] = max(0, g['vida'])
        elif tipo in ('muere', 'cae_al_vacio'):
            i, k = p.donde[p.quien(e['quien'])]; hp[i][k] = 0
        elif tipo in ('muerte_subita', 'subita'):
            hp = [[max(0, v - e['dano']) if v > 0 else 0 for v in eq] for eq in hp]
        elif tipo == 'fin':
            activo = None; gana = p.equipos.index(e['ganador']) if e['ganador'] in p.equipos else None
        else:
            continue
        estados.append({'t': e['t'], 'hp': [list(x) for x in hp], 'activo': activo, 'gana': gana})
    return {'equipos': [{'nombre': q['nombre'], 'color': color_equipo(TONO[i])} for i, q in enumerate(esc_l['equipos'])],
            'soldados': p.soldados, 'hp0': 100, 'fuera': TX[lang]['marcador']['fuera'], 'gana': TX[lang]['marcador']['gana'], 'estados': estados}


# ---------------------------------------------------------------------------------------------------- el guion
def guion(p, mapa, lang, carpeta, medir, n):
    tx = TX[lang]
    video = f'{carpeta}/{lang}/largo.mp4'
    nom = lambda n_: (NOMBRES.get(n_, (n_.title(), n_))[0],) * 2 if lang != 'ja' else (sin_acentos(NOMBRES.get(n_, (n_.title(),))[0]), NOMBRES.get(n_, (None, n_))[1])
    def eq(i):   # las formas del nombre de un equipo
        f = tx['equipos'][i]
        return {'eq': par(f[0]), 'el_eq': par(f[1]), 'El_eq': par(f[2])}
    def arma(a):
        return par(tx['armas'].get(a, a or ''))
    def lista(items):
        items = [par(x) for x in items]
        if len(items) == 1:
            return items[0]
        y = tx['y']
        return tuple((', ' if lang != 'ja' else '、').join(x[j] for x in items[:-1]) + y + items[-1][j] for j in (0, 1))
    num = lambda k: (NUM[lang][k] if lang != 'ja' and k < len(NUM[lang]) else str(k),) * 2
    base = {'leia': tx['leia'], 'wz': tx['wz'], 'sitio': tx['sitio'], 'mapa': MAPAS[mapa][lang], 'n': num(n)}
    giro = {}

    def variante(k, semilla=0):
        """La siguiente de las variantes de `k`, para no repetir la misma seguido."""
        l = tx[k]; i = giro.get(k, semilla % len(l)); giro[k] = i + 1
        return l[i % len(l)]

    # --- las reacciones: lo que pasa en la partida, con su segundo, su peso y hasta cuándo se puede decir
    sucesos = []
    def suceso(t, prio, ventana, cara, texto, corta=None, capitulo=None, tipo=''):
        sucesos.append({'t': t, 'prio': prio, 'ventana': ventana, 'cara': cara, 'texto': texto, 'corta': corta, 'capitulo': capitulo, 'tipo': tipo})

    bajas_de = {}; caps = [0.0]; fin_t = p.fin['t'] if p.fin else p.T
    final = p.grupos[-1] if p.grupos and sum(1 for v in p.grupos[-1]['vivos'] if v) <= 1 else None
    for gi, g in enumerate(p.grupos):
        vs = g['victimas']; a = g['autor']; ea = p.donde[a][0] if a else None
        val = {'autor': nom(a) if a else ('', ''), 'arma': arma(g['arma'])}
        if lang == 'es':
            val['arma_de'] = tuple(f'{arma(g["arma"])[j]} de {nom(a)[j]}' for j in (0, 1)) if a else arma(g['arma'])
            val['Arma_de'] = tuple(x[:1].upper() + x[1:] for x in val['arma_de'])
        if lang == 'en':
            val['autor_s'] = tuple(f"{x}'" if x.endswith('s') else f"{x}'s" for x in nom(a)) if a else ('', '')
        if len(vs) == 1:
            v = vs[0]; val['victima'] = nom(v['nombre']); val['dist'] = (str(v['vuelo']),) * 2
            if v['por']:
                k = 'subita'
            elif a == v['nombre']:
                k = 'propio'
            elif ea == v['equipo']:
                k = 'amigo'
            elif g['arma'] == 'harakiri':
                k = 'harakiri'
            elif g['arma'] == 'laser':
                k = 'laser'
            elif v['nombre'] in g['cabeza']:
                k = 'headshot'
            elif v['vacio']:
                k = 'vuelo_vacio' if v['vuelo'] >= 40 else 'vacio'
            elif g['arma'] == 'bota':
                k = 'bota'
            elif g['arma'] in ('rifle', 'franco'):
                k = 'tiro'
            else:
                k = 'explota'
            corta = tx['corta']['headshot' if v['nombre'] in g['cabeza'] else 'vacio' if v['vacio'] else 'otra']
        else:
            val['victimas'] = lista([nom(v['nombre']) for v in vs])
            k = 'triple' if len(vs) >= 3 else 'doble_vacio' if all(v['vacio'] for v in vs) else 'doble'
            corta = tx['corta']['varias']
        texto = marcar(variante(k, gi), {**base, **val})
        corta = marcar(corta, {**base, **val})
        # cómo queda el equipo de las víctimas (si son de uno solo) y si queda fuera
        eqs = {v['equipo'] for v in vs}; fuera = [i for i in sorted(eqs) if g['vivos'][i] == 0]; sp = '' if lang == 'ja' else ' '
        if len(eqs) == 1 and not fuera:
            i = vs[0]['equipo']; quedan = g['vivos'][i]
            if quedan == 1:
                ultimo = next(n_ for k_, n_ in enumerate(p.soldados[i]) if n_ not in {x['nombre'] for gg in p.grupos[:gi + 1] for x in gg['victimas']})
                texto += sp + marcar(variante('queda_1', gi), {**eq(i), 'ultimo': nom(ultimo)})
            else:
                texto += sp + marcar(variante('queda_n', gi), {**eq(i), 'n': num(quedan)})
        for i in fuera:
            texto += sp + marcar(variante('fuera', gi), eq(i))
        if a and ea not in eqs:   # las bajas de quien tiró (para las rachas y el cierre)
            bajas_de[a] = bajas_de.get(a, 0) + len(vs)
        if g is final:
            continue   # la última va con el final
        cap = None
        if gi == 0:
            cap = tx['cap']['primera']
        elif fuera:
            cap = marcas(marcar(tx['cap']['fuera'], eq(fuera[0])))[0]
        elif len(vs) >= 2:
            cap = tx['cap']['doble']
        suceso(g['t'], 6, 9, 'sorpresa' if len(vs) > 1 or vs[0]['nombre'] in g['cabeza'] or vs[0]['vacio'] else 'enojo', texto, corta, cap, 'baja')
        if fuera:   # quiénes siguen
            vivos = g['vivos']; siguen = [i for i, x in enumerate(vivos) if x > 0]
            if len(siguen) == 3:
                m = marcar(tx['siguen3'], {'lista': lista([eq(i)['el_eq'] for i in siguen])})
            elif len(siguen) == 2:
                i1, i2 = siguen
                if vivos[i1] == 1 and vivos[i2] == 1:
                    s1, s2 = [next(n_ for n_ in p.soldados[i] if n_ not in {x['nombre'] for gg in p.grupos[:gi + 1] for x in gg['victimas']}) for i in siguen]
                    m = marcar(tx['uno_contra_uno'], {'s1': nom(s1), 's2': nom(s2)})
                else:
                    m = marcar(tx['siguen2'], {'a': eq(i1)['el_eq'], 'b': eq(i2)['el_eq']})
            else:
                m = None
            if m:
                suceso(g['t_fin'] + 0.2, 5, 14, 'pensando', m, tipo='siguen')
        if a and ea not in eqs and bajas_de[a] >= 2:
            k_ = bajas_de[a]
            suceso(g['t_fin'] + 0.5, 2, 30, 'feliz', marcar(variante('racha', gi), {'quien': nom(a), 'k': num(k_), **eq(ea)}), tipo='racha')
    # vuelos largos que aterrizan y golpes fuertes que no matan
    muere_en = {}
    for e in p.muertes:
        muere_en[p.quien(e['quien'])] = e['t']
    # (el golpe va antes que su vuelo en la escaleta: el vuelo se anota al aterrizar, con el cuadro en que salió)
    vuelan = {(p.quien(e['quien']), round(e['t'])) for e in p.E if e['tipo'] == 'sale_volando' and e['termina'] == 'aterriza' and e['distancia'] >= 60}
    for e in p.E:
        if e['tipo'] == 'sale_volando' and e['termina'] == 'aterriza' and e['distancia'] >= 60:
            q = p.quien(e['quien'])
            if muere_en.get(q, 1e9) - e['t'] > 4:
                suceso(e['t'], 3, 3, 'sorpresa', marcar(variante('vuelo'), {'quien': nom(q), 'dist': (str(e['distancia']),) * 2}), tipo='vuelo')
        elif e['tipo'] == 'golpe':
            for gl in e['golpes']:
                q = p.quien(gl['quien'])
                if gl['vida'] > 0 and gl['dano'] >= 30 and muere_en.get(q, 1e9) - e['t'] > 3 and (q, round(e['t'])) not in vuelan:
                    if gl['vida'] <= 15:
                        suceso(e['t'], 3, 4, 'sorpresa', marcar(variante('casi'), {'quien': nom(q), 'vida': (str(gl['vida']),) * 2}), tipo='casi')
                    elif gl['dano'] >= 40:
                        suceso(e['t'], 2, 3, 'triste', marcar(variante('golpe'), {'quien': nom(q), 'dano': (str(gl['dano']),) * 2, 'vida': (str(gl['vida']),) * 2}), tipo='golpe')
        elif e['tipo'] == 'muerte_subita':
            suceso(e['t'], 5, 8, 'sorpresa', marcar(tx['subita_aviso'], base), tipo='subita')
    # cómo va, cada minuto y medio (lo dice con lo que quede cuando lo diga)
    def estado(t):
        v = p.vivos_en(t); m2 = max(2, round(t / 30))
        det = lista([marcar(tx['estado_eq'], {**eq(i), 'n': num(x)}) for i, x in enumerate(v) if x > 0])
        return marcar(tx['estado'], {'min': (tx['min'](m2),) * 2, 'total': num(sum(v)), 'Total': tuple(x[:1].upper() + x[1:] for x in num(sum(v))), 'detalle': det})
    for t0 in range(CADA, int(fin_t - 40), CADA):
        suceso(t0, 1, 45, 'normal', estado, tipo='estado')
    sucesos.sort(key=lambda s: s['t'])

    # --- los rellenos, en orden: lo que va al principio (los lados, el mapa, los equipos) y luego DATOS
    rellenos = []
    def relleno(m, cara, desde=0, hasta=1e9, valido=None):
        rellenos.append({'m': m, 'cara': cara, 'desde': desde, 'hasta': hasta, 'valido': valido})
    d0 = DATOS[0]; relleno(marcar(d0[lang], base), d0['cara'], hasta=d0.get('hasta', 1e9))
    relleno(marcar(tx['mapa'][mapa], base), 'normal', hasta=150)
    for i, s in enumerate(p.soldados):   # el plantel de cada equipo, mientras sigan todos
        relleno(marcar(tx['plantel'][i % 2], {**eq(i), 'lista': lista([nom(x) for x in s])}), 'feliz', hasta=150,
                valido=lambda t, i=i: p.vivos_en(t)[i] == len(p.soldados[i]))
    casa = [x for x in CASA if any(x in s for s in p.soldados)]
    for k, dm in enumerate(DATOS_MAPA.get(mapa, [])):
        relleno(marcar(dm[lang], base), dm['cara'], desde=30 + 60 * k)
    if len(casa) >= 3:
        relleno(marcar(tx['casa'], {'lista': lista([nom(x) for x in casa[:4]])}), 'guino', desde=60)
    for d in DATOS[1:]:
        relleno(marcar(d[lang], base), d['cara'], desde=d.get('desde', 0), hasta=d.get('hasta', 1e9))

    # --- el tiempo: lo que pasa en cuanto pasa; en los huecos, lo siguiente que quepa
    escenas, t = [], 0.0
    medidas = {}

    def cuanto(m):
        if m not in medidas:
            medidas[m] = sum(medir(marcas(x)[1]) + comercial.RESPIRO + 0.02 for x in paginas(m, lang))
        return medidas[m]

    def tramo(dur, cara=None, frase=None, capitulo=None, extra=None):
        nonlocal t
        if frase:
            dur = max(dur, medir(frase[1]) + comercial.RESPIRO + 0.02)
        e = {'video': video, 'arriba': True, 'ancho': 1280, 'desde': round(t, 3), 'dur': round(dur, 3)}
        if escenas:
            e['continua'] = True
        if frase:
            e.update(cara=cara, voz=frase[1])
            if frase[0] != frase[1]:
                e['dice'] = frase[0]
        if capitulo:
            e['capitulo'] = capitulo
        e.update(extra or {})
        escenas.append(e); t += round(dur, 3)

    def decir(cara, marcado, capitulo=None, hasta=None):
        pags = paginas(marcado, lang)
        for i, pg in enumerate(pags):
            tramo(hasta - t if hasta is not None and i == len(pags) - 1 else 0, cara, marcas(pg), capitulo if i == 0 else None)

    # el saludo, sobre el primer turno
    t = 0.0
    decir('feliz', marcar(tx['intro'], base), tx['cap']['inicio'])
    decir('feliz', marcar(tx['intro2'], base))
    fin_voz = (final['t'] if final else fin_t) - 0.2
    vivas, ev, animo, dichos = [], list(sucesos), -99.0, {}
    while t < fin_voz - 0.3:
        vivas += [s for s in ev if s['t'] <= t + 0.05]; ev = [s for s in ev if s['t'] > t + 0.05]
        vivas = [s for s in vivas if t - s['t'] <= s['ventana']]
        dicha = False
        for s in sorted(vivas, key=lambda s: (s['prio'], -s['t']), reverse=True):
            m = s['texto'](t) if callable(s['texto']) else s['texto']
            alto = min([x['t'] for x in ev if x['prio'] > s['prio']] + [fin_voz])
            tope = min(alto + 0.6, fin_voz + 0.3)
            if t + cuanto(m) > tope and s['corta']:
                m = s['corta']
            if s['tipo'] in ('golpe', 'vuelo', 'casi') and t - dichos.get(s['tipo'], -99) < 8:
                vivas.remove(s); dicha = True; break   # no dos «¡auch!» seguidos
            if t + cuanto(m) <= tope or s['prio'] >= 5:   # una baja se dice siempre, aunque empuje lo que sigue
                cap = s['capitulo'] if s['capitulo'] and all(abs(t - c) >= 11 for c in caps) else None
                if cap:
                    caps.append(t)
                decir(s['cara'], m, cap); dichos[s['tipo']] = t; vivas.remove(s); dicha = True
                break
        if dicha:
            continue
        hueco = min([x['t'] for x in ev if x['prio'] >= 3] + [fin_voz]) - t
        k = None
        if hueco >= 2.5:
            k = next((k for k, r in enumerate(rellenos) if r['desde'] <= t <= r['hasta'] and (not r['valido'] or r['valido'](t))
                      and cuanto(r['m']) + PAUSA <= hueco), None)
        if k is not None:
            r = rellenos.pop(k)
            decir(r['cara'], r['m']); tramo(PAUSA)
            continue
        if hueco >= 2.5 and t - animo >= 25:
            m = variante('animo')
            if cuanto(m) <= hueco:
                decir('feliz', m); animo = t
                continue
        sig = min([x['t'] for x in ev] + [fin_voz])
        tramo(max(0.1, sig - t)) if sig - t > 0.05 else tramo(0.1)
    if final and final['t'] - t > 0.05:   # la última baja, en cuanto pasa
        tramo(final['t'] - t)
    elif fin_voz - t > 0.05:
        tramo(fin_voz - t)
    # el final: la última baja y quién gana, en un solo renglón, y la partida hasta que se acaba
    kills = p.bajas()
    if p.fin and p.fin['ganador']:
        ig = p.equipos.index(p.fin['ganador']); quedan = [p.quien(q['quien']) for q in p.fin['quedan']]
        if len(quedan) == 1:
            m = marcar(tx['fin1'], {**eq(ig), 'quien': nom(quedan[0]), 'vida': (str(p.fin['quedan'][0]['vida']),) * 2})
        else:
            m = marcar(tx['finN'], {**eq(ig), 'lista': lista([nom(x) for x in quedan])})
    else:
        m = marcar(tx['empate'], base)
    if final:
        vs = final['victimas']
        k = 'varias' if len(vs) > 1 else 'headshot' if vs[0]['nombre'] in final['cabeza'] else 'vacio' if vs[0]['vacio'] else 'otra'
        m = marcar(tx['corta'][k], {'victima': nom(vs[0]['nombre']), 'victimas': lista([nom(v['nombre']) for v in vs])}) + (' ' if lang != 'ja' else '') + m
    decir('feliz', m)
    if p.T - 0.1 - t > 0.3:   # los ganadores festejan hasta que acaba el vídeo del juego
        tramo(p.T - 0.1 - t)
    # la tarjeta: quién eliminó a más, dónde jugar y que se suscriban, cada cosa en su página
    partes = [marcar(x, base) for x in tx['cierre']]
    if kills:
        mvp = max(kills, key=lambda x: (kills[x], x in [p.quien(q['quien']) for q in (p.fin or {}).get('quedan', [])]))
        if kills[mvp] >= 3:
            partes[0] = marcar(tx['cierre_mvp'], {'turnos': (str(p.fin['turnos']),) * 2, 'mvp': nom(mvp), 'k': num(kills[mvp])}) + (' ' if lang != 'ja' else '') + partes[0]
    for i, pg in enumerate(pg for parte in partes for pg in paginas(parte, lang)):
        dice, voz = marcas(pg)
        e = {'final': True, 'cara': 'guino', 'voz': voz}
        if dice != voz:
            e['dice'] = dice
        if i == 0:
            e['capitulo'] = tx['cap']['final']
        else:
            e['continua'] = True
        escenas.append(e)
    # los capítulos de YouTube duran 10 s o más: el último de la partida no puede quedar pegado a la tarjeta
    inicio, con = 0.0, []
    for e in escenas:
        if e.get('final'):
            break
        if e.get('capitulo'):
            con.append((inicio, e))
        inicio += e['dur']
    if len(con) > 1 and inicio - con[-1][0] < 11:
        del con[-1][1]['capitulo']
    habla = sum(medir(e['voz']) for e in escenas if e.get('voz') and not e.get('final'))
    return escenas, habla, t


def guion_completo(p, mapa, lang, carpeta, escenas, clave):
    acento = '#e8e07a'
    marca = {'es': ('Artillería por turnos', 'Gratis en el navegador, Android y iPhone'),
             'en': ('Turn-based artillery', 'Free in the browser, on Android and iPhone'),
             'ja': ('ターン制の砲撃バトル', 'ブラウザ・Android・iPhoneで無料')}[lang]
    return {
        # el japonés en PixelMplus12 (kanji de 11), no en Misaki (kanji de 7: manchas); ver comercial.pixel()
        'fuente': 'pixel-ja12' if lang == 'ja' else 'pixel', 'voz': VOZ[lang][0], 'idioma': VOZ[lang][1],
        'presentadora': {'nombre': 'LeIA', 'caras': 'avatar'},
        'colores': {'fondo': '#000000', 'acento': acento, 'texto': '#ffffff', 'tenue': '#9a9aa8', 'sobre_acento': '#000000', 'borde': '#3a3a48'},
        'marca': {'logo': 'warzone/logo.png', 'logo_ancho': 744, 'lema': marca[0], 'sitio': 'dailychallenge.click/warzone', 'pie': marca[1]},
        'formato': 'horizontal', 'acercamiento': False,
        'salida': f'~/Documents/ayotl/tools/comerciales/salida/{clave}.mp4',
        'musica': {'archivo': f'{carpeta}/{lang}/largo.mp4', 'desde': 0, 'volumen': 0.09},   # el sonido del juego, que baja cuando habla LeIA
        'marcador': f'{carpeta}/marcador-{lang}.json',
        'escenas': escenas,
    }


# ---------------------------------------------------------------------------------------------------- YouTube
def entrada(p, mapa, lang, clave, publicar):
    r = p.esc['resumen']; mn = MAPAS[mapa][lang][0]
    kills = p.bajas(); quedan = [p.quien(q['quien']) for q in (p.fin or {}).get('quedan', [])]
    gana = TX[lang]['equipos'][p.equipos.index(p.fin['ganador'])] if p.fin and p.fin['ganador'] else None
    mvp = max(kills, key=lambda x: (kills[x], x in quedan)) if kills else None
    nombre = lambda x: NOMBRES.get(x, (x.title(),))[0]
    if lang == 'es':
        titulo = f'WAR ZONE: 4 computadoras, todos contra todos en {mn} (partida completa)'
        resumen = (f"{NUM['es'][r['headshots']] if r['headshots'] < 17 else r['headshots']} tiros a la cabeza, "
                   f"{NUM['es'][r['alVacio']] if r['alVacio'] < 17 else r['alVacio']} soldados al vacío"
                   + (f" y a {nombre(mvp)}, del {gana[0]}, que eliminó a {NUM['es'][kills[mvp]]} rivales" if mvp and gana and kills[mvp] >= 3 else ''))
        desc = (f'Cuatro equipos jugados por la computadora, todos en difícil y todos contra todos, en {mn}, uno de los mapas nuevos de War Zone. '
                f'LeIA comenta {resumen}. A los lados van los cuatro equipos con sus soldados. La música es la del juego.\n\n'
                'War Zone es artillería por turnos con estilo Atari 2600: de dos a cuatro equipos, humanos o computadoras, en el mismo teléfono o en línea.\n\n'
                'LeIA es la presentadora de los juegos de Ayotl.')
        etiquetas = ['War Zone', 'artillería por turnos', 'juego retro', 'Atari 2600', 'CPU vs CPU', 'todos contra todos', '4 equipos', 'indie game', 'Daily Challenge']
        cierre = '#WarZone #RetroGaming #Atari2600 #Videojuegos #IndieGame'
    elif lang == 'en':
        titulo = f'WAR ZONE: 4 computers, free-for-all on {mn} (full match)'
        resumen = (f"{NUM['en'][r['headshots']] if r['headshots'] < 17 else r['headshots']} headshots, "
                   f"{NUM['en'][r['alVacio']] if r['alVacio'] < 17 else r['alVacio']} soldiers into the void"
                   + (f" and {nombre(mvp)}, from {gana[0]}, taking out {NUM['en'][kills[mvp]]} rivals" if mvp and gana and kills[mvp] >= 3 else ''))
        desc = (f'Four teams played by the computer, all on hard and every team for itself, on {mn}, one of the new War Zone maps. '
                f"With LeIA's commentary: {resumen}. The four teams and their soldiers are on the sides. The music is the game's own.\n\n"
                'War Zone is turn-based artillery with an Atari 2600 look: two to four teams, humans or computers, on one phone or online.\n\n'
                "LeIA is the host of Ayotl's games.")
        etiquetas = ['War Zone', 'artillery game', 'turn-based', 'CPU vs CPU', 'free for all', '4 teams', 'retro games', 'Atari 2600']
        cierre = '#WarZone #Artillery #RetroGaming #IndieGame'
    else:
        titulo = f'WAR ZONE: コンピューター4チームのバトルロイヤル、{mn}（フル対戦）'
        resumen = (f"ヘッドショット{r['headshots']}回、奈落に落ちた兵士{r['alVacio']}人"
                   + (f"、そして{kills[mvp]}人をたおした{gana[0][0]}の{sin_acentos(nombre(mvp))}" if mvp and gana and kills[mvp] >= 3 else ''))
        desc = (f'War Zoneの新しいマップ「{mn}」で、コンピューターが動かす4チームが、全員ハードでバトルロイヤル。'
                f'{resumen}。LeIAが実況します。画面の左右には4チームの兵士たち。音楽はゲームのもの。\n\n'
                'War ZoneはAtari 2600風のターン制砲撃ゲーム：2〜4チーム、人間でもコンピューターでも、1台のスマホでもオンラインでも。\n\n'
                'LeIAはAyotlのゲームの案内役です。')
        etiquetas = ['War Zone', '砲撃ゲーム', 'ターン制', 'CPU対CPU', 'バトルロイヤル', 'レトロゲーム']
        cierre = '#WarZone #砲撃ゲーム #レトロゲーム #インディーゲーム'
    v = {'clave': clave, 'app': 'warzone', 'video': f'salida/{clave}.mp4', 'miniatura': f'salida/{clave}.jpg', 'categoria': '20',
         'publicar': f'{publicar}T{HORA[lang]}:00-06:00', 'titulo': titulo, 'descripcion': desc, 'cierre': cierre, 'etiquetas': etiquetas}
    if lang != 'es':
        v['idioma'] = lang
    return v


def miniatura(p, lang, clave, carpeta):
    import miniaturas
    from PIL import ImageFont
    if lang == 'ja':   # el japonés en PixelMplus12, como en el vídeo (Misaki deja los kanji en manchas); sólo en este proceso
        latina = miniaturas.pixel
        miniaturas.pixel = lambda tam, texto: (ImageFont.truetype(comercial.PIXELMPLUS, max(12, round(tam * 1.15 / 12) * 12))
                                               if any(ord(ch) > 0x2E7F for ch in texto) else latina(tam, texto))
    # el fondo: la baja de más de uno, o la última, en el cuadro en que explota
    g = max(p.grupos, key=lambda g: (len(g['victimas']), -g['t'])) if p.grupos else None
    t = (g['t'] + 0.15) if g else p.T / 2
    fondo = miniaturas.cuadro(os.path.join(AQUI, carpeta, lang, 'largo.mp4'), t)
    titulo = {'es': '4 EQUIPOS\n1 GANADOR', 'en': '4 TEAMS\n1 WINNER', 'ja': '4チーム\n勝者は1つ'}[lang]
    mn = p.mapa_nombre[lang]
    sub = {'es': f'{mn} · partida completa', 'en': f'{mn} · full match', 'ja': f'{mn}・フル対戦'}[lang]
    miniaturas.juego(clave, fondo, titulo, sub, 'sorpresa', (232, 224, 122), logo='warzone/logo.png')


# ---------------------------------------------------------------------------------------------------- main
def grabar(mapa, semilla, n, lang, dir_):
    print(f'  grabando la partida en {lang} (tools/anuncio.js --partida)…')
    r = subprocess.run(['node', 'tools/anuncio.js', '--partida', mapa, '--semilla', str(semilla), '--n', str(n), '--equipos', '4',
                        '--idioma', lang, '--escala', '4', '--cortos', '0', '--salida', dir_], cwd=WZ, capture_output=True, text=True)
    if r.returncode:
        sys.exit(f'la grabación falló:\n{(r.stdout + r.stderr)[-1500:]}')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('mapa'); ap.add_argument('semilla', type=int)
    ap.add_argument('--n', type=int, default=4)
    ap.add_argument('--publicar')
    ap.add_argument('--idiomas', default='es,en,ja')
    ap.add_argument('--seco', action='store_true')
    ap.add_argument('--sin-plan', action='store_true')
    ap.add_argument('--solo-plan', action='store_true', help='no arma los vídeos (ya están en salida/): sólo escribe youtube.json')
    a = ap.parse_args()
    idiomas = a.idiomas.split(',')
    carpeta = f'warzone-4cpu-{a.mapa}'
    base = os.path.join(AQUI, carpeta)
    for lang in ['es'] + [l for l in idiomas if l != 'es']:   # la española siempre: de ahí salen los tiempos
        dir_ = os.path.join(base, lang)
        if not os.path.exists(os.path.join(dir_, 'largo.mp4')):
            grabar(a.mapa, a.semilla, a.n, lang, dir_)
    esc = json.load(open(os.path.join(base, 'es', 'escaleta.json'), encoding='utf-8'))
    if esc['mapa'] != a.mapa or esc['semilla'] != a.semilla or len(esc['equipos']) != 4:
        sys.exit(f"la grabación de {carpeta} es otra partida ({esc['mapa']}, semilla {esc['semilla']}): bórrala o cambia de carpeta")
    p = Partida(esc); p.mapa_nombre = {l: MAPAS[a.mapa][l][0] for l in TX}
    json.dump(esc, open(os.path.join(base, 'escaleta.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f"{a.mapa}, semilla {a.semilla}: {esc['resumen']['segundos']} s, {esc['resumen']['turnos']} turnos, gana {esc['ganador']}")
    plan_ruta = os.path.join(AQUI, 'youtube.json')
    with tempfile.TemporaryDirectory() as tmp:
        os.chmod(tmp, 0o700)
        cab = os.path.join(tmp, 'h.txt')
        with open(cab, 'w') as h:
            h.write(f'X-Goog-Api-Key: {comercial.clave()}\n')
        os.chmod(cab, 0o600)
        for lang in idiomas:
            esc_l = json.load(open(os.path.join(base, lang, 'escaleta.json'), encoding='utf-8'))
            if [(e['t'], e['tipo']) for e in esc_l['eventos']] != [(e['t'], e['tipo']) for e in esc['eventos']]:
                sys.exit(f'la grabación en {lang} no es la misma partida que la española')
            json.dump(marcador(p, esc_l, lang), open(os.path.join(base, f'marcador-{lang}.json'), 'w', encoding='utf-8'), ensure_ascii=False)
            voz, idioma = VOZ[lang]

            def medir(texto, voz=voz, idioma=idioma):
                """Lo que dura la frase (y queda en la caché para el vídeo). Google a veces contesta 503: se reintenta."""
                for intento in range(4):
                    try:
                        return len(comercial.narrar(texto, voz, idioma, cab)) / comercial.SR
                    except SystemExit as e:
                        if intento == 3 or not any(x in str(e) for x in ('503', 'UNAVAILABLE', '429', '500')):
                            raise
                        time.sleep(15 * (intento + 1))
            clave = f'{carpeta}{SUF[lang]}'
            escenas, habla, usa = guion(p, a.mapa, lang, carpeta, medir, a.n)
            g = guion_completo(p, a.mapa, lang, carpeta, escenas, clave)
            ruta = os.path.join(AQUI, f'{clave}.json')
            json.dump(g, open(ruta, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            print(f'  {lang}: {len(escenas)} escenas, LeIA habla {habla:.0f} de {usa:.0f} s de partida ({100 * habla / max(1, usa):.0f} %) -> {os.path.relpath(ruta, AQUI)}')
            if a.seco:
                continue
            if not a.solo_plan:
                r = subprocess.run([PY, os.path.join(AQUI, 'comercial.py'), ruta], capture_output=True, text=True)
                print(' ', (r.stdout + r.stderr).strip().replace('\n', '\n  '))
                if r.returncode:
                    sys.exit(f'comercial.py falló en {lang}')
                miniatura(p, lang, clave, carpeta)
            elif not os.path.exists(os.path.join(AQUI, 'salida', f'{clave}.mp4')):
                sys.exit(f'falta salida/{clave}.mp4: ármalo antes de --solo-plan')
            if a.sin_plan or not a.publicar:
                continue
            v = entrada(p, a.mapa, lang, clave, a.publicar)
            plan = json.load(open(plan_ruta, encoding='utf-8'))
            if any(x['clave'] == clave and x.get('id') for x in plan):
                print(f'  plan: {clave} ya está subido; no se toca'); continue
            plan = [x for x in plan if x['clave'] != clave] + [v]
            json.dump(plan, open(plan_ruta, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            print(f"  plan: {clave} sale el {v['publicar']}")


if __name__ == '__main__':
    main()
