#!/usr/bin/env python3
"""La partida larga de Kazan para YouTube: una isla jugada sólo por computadoras, de la primera obra a la última
nación en pie, narrada por LeIA (15-nov-2026).

Es la segunda de la rotación de partidas largas (Adrián, 9-nov: War Zone → Kazan → ZANEI → maratón de Daily Challenge)
y está hecha a imagen de warzone-4cpu.py: el juego arriba a 1280x720 sin nada encima, el cuadro de diálogo de LeIA
debajo y, a los lados, un marcador de las naciones.

  PY="$HOME/Documents/code challenge/.venv/bin/python"
  "$PY" tools/comerciales/kazan-larga.py [--semilla 2 --bioma nieve --naciones 8 --minutos 20] [--idiomas es,en,ja]
        [--seco] [--publicar 2026-11-17] [--solo-plan]

Para escoger la partida: KAZAN_BUSCAR_NACIONES=6,8 node tools/comerciales/kazan-cpu/grabar-cpu.mjs buscar 1-12 (tarda
unos 10 min; cada fila dice cuándo cae cada nación y de qué). La del 15-nov, con el motor de la VERSION_SIM 21: nieve,
semilla 2, 8 naciones, 20 min: siete conquistas, tres bases tragadas por la lava y una sola nación en pie a los 18:27.

1. La partida: kazan-cpu/grabar-cpu.mjs (KAZAN_LARGA=1, KAZAN_ESCALA=4) la graba en kazan-larga/<idioma>/ (largo.mp4 a
   1280x720, sin sonido, y escaleta.json), una vez por idioma: los letreros del juego salen en el idioma del vídeo y
   la partida es la misma cuadro por cuadro. Si ya está grabada, no se graba. La carpeta kazan-larga/ no entra a git.
2. El sonido: Kazan no tiene música, sólo efectos. kazan-larga/efectos.wav los trae tocados por el propio
   www/sonido.js del juego (grabar-cpu.mjs sonido) en el cuadro en que pasa cada cosa; va de fondo y baja cuando habla
   LeIA. No se le pone música.
3. El marcador de los lados (kazan-larga/marcador-<idioma>.json): cada nación con sus puntos, sus tropas y sus
   edificios, SIN BASE si la lava se la tragó, y la que cayó, cuándo y por quién. Lo pinta comercial.py
   (marcador_naciones) en las escenas `arriba`.
4. Lo que dice LeIA (Adrián, 1-nov: «que hable casi todo el tiempo»): en cuanto pasa, cada caída (quién conquistó a
   quién, o la lava), la erupción, cuánto ha avanzado la lava, las bases que se traga y las que se fundan lejos; los
   ejércitos que salen y lo que enfoca la cámara; cada minuto y pico, cómo va; y en los huecos, cómo se juega Kazan,
   datos del juego y chistes malos de IA, sin repetir. Al final, quién gana; en la tarjeta, dónde jugar gratis y que
   se suscriban.
5. comercial.py arma salida/kazan-larga[-en|-ja].mp4 (con capítulos); la miniatura sale de miniaturas.juego() y la
   entrada de youtube.json, el día --publicar a las 18:00 (es), 18:20 (en) y 18:40 (ja). Lo sube subir-youtube.py.
--seco escribe los guiones y dice cuánto habla LeIA (y el título y la descripción que llevaría), sin armar vídeos ni
tocar youtube.json; sin --publicar arma los vídeos sin tocar youtube.json, y --solo-plan --publicar AAAA-MM-DD sólo
escribe youtube.json (con los vídeos ya armados y revisados).
"""
import argparse, bisect, colorsys, importlib.util, json, os, subprocess, sys, tempfile, time
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import comercial   # narrar(): la misma voz y la misma caché que el vídeo, para medir cuánto dura cada frase

# de la partida larga de War Zone: las marcas {se lee|se dice}, las páginas que caben en el cuadro de diálogo y las voces
_spec = importlib.util.spec_from_file_location('warzone_4cpu', os.path.join(AQUI, 'warzone-4cpu.py'))
wz = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(wz)
marcas, par, marcar, paginas = wz.marcas, wz.par, wz.marcar, wz.paginas
PY, SUF, HORA, VOZ, NUM = wz.PY, wz.SUF, wz.HORA, wz.VOZ, wz.NUM

CARPETA = 'kazan-larga'
CLAVE = 'kazan-larga'
PAUSA = 0.25            # s de silencio extra después de un dato o un chiste (además de comercial.RESPIRO)
CADA = 80               # s: cada cuánto dice cómo va la partida
ACENTO = '#f2a03d'      # el naranja de Kazan
# los colores de las naciones, como www/render.js (COL_JUG: tono y luminancia de la paleta del 2600) y sus nombres
COL_JUG = [(1, 6), (9, 6), (5, 6), (0, 7), (2, 5), (4, 5), (7, 5), (11, 6), (14, 6), (0, 4)]
COLORES = ['AMARILLA', 'AZUL', 'ROSA', 'BLANCA', 'NARANJA', 'ROJA', 'MORADA', 'CIAN', 'LIMA', 'GRIS']
# cómo se llama cada nación: en el marcador, como en los letreros del juego (www/idioma.js); en lo que dice LeIA,
# (corto, largo), cada uno (se lee, se dice)
NACION = {
    'es': {'marcador': COLORES,
           'dice': [(x, x) for x in ['la amarilla', 'la azul', 'la rosa', 'la blanca', 'la naranja', 'la roja', 'la morada', 'la cian', 'la lima', 'la gris']]},
    'en': {'marcador': ['YELLOW', 'BLUE', 'PINK', 'WHITE', 'ORANGE', 'RED', 'PURPLE', 'CYAN', 'LIME', 'GREY'],
           'dice': [(x, x) for x in ['Yellow', 'Blue', 'Pink', 'White', 'Orange', 'Red', 'Purple', 'Cyan', 'Lime', 'Grey']]},
    'ja': {'marcador': ['黄', '青', 'ピンク', '白', 'オレンジ', '赤', '紫', '水色', '黄緑', '灰'],
           'dice': [(('黄', 'きいろ'), ('黄の国', 'きいろのくに')), (('青', 'あお'), ('青の国', 'あおのくに')), (('ピンク', 'ピンク'), ('ピンクの国', 'ピンクのくに')),
                    (('白', 'しろ'), ('白の国', 'しろのくに')), (('オレンジ', 'オレンジ'), ('オレンジの国', 'オレンジのくに')), (('赤', 'あか'), ('赤の国', 'あかのくに')),
                    (('紫', 'むらさき'), ('紫の国', 'むらさきのくに')), (('水色', 'みずいろ'), ('水色の国', 'みずいろのくに')),
                    (('黄緑', 'きみどり'), ('黄緑の国', 'きみどりのくに')), (('灰', 'はいいろ'), ('灰の国', 'はいいろのくに'))]},
}

# ---------------------------------------------------------------------------------------------------- lo que dice
TX = {
    'es': {
        'leia': ('LeIA', 'Leia'), 'kz': ('Kazan', 'Kazan'),
        'sitio': ('kazan.dailychallenge.click', 'Kazan punto Daily Challenge punto click'),
        'isla': {'bosque': 'una isla de bosque', 'nieve': 'una isla nevada', 'desierto': 'una isla de desierto', 'pantano': 'una isla de pantano'},
        'intro': '¡Hola! Soy {leia}. Hoy, en {kz}: {isla}, un volcán y {n} naciones, todas jugadas por la computadora.',
        'intro2': 'Cada una empieza con una base y cuatro obreros. Sólo puede quedar una.',
        'lados': 'Fíjate en los lados: ahí están las {n} naciones, con sus puntos, sus tropas y sus edificios.',
        'y': ' y ',
        'cae_conq': ['¡Cae {v}! {Q} le destruye la base y la conquista.', '¡{Q} conquista a {v}! Le tumbó su última base.', '¡Adiós a {v}! {Q} acaba con su base.'],
        'cae_media': '¡Cae {v}! La conquista {q}.',
        'ayuda': 'También le pegaba {lista}.',
        'cae_lava_remata': '¡Cae {v}! La lava ya le había quitado la base, y {q} acaba con su última gente.',
        'cae_lava': '¡Cae {v}! Sin base y sin gente: se la llevó el volcán.',
        'corta': '¡Cae {v}!',
        'quedan_n': 'Quedan {k} naciones.', 'quedan_2': 'Quedan dos: {a} contra {b}.',
        'erupcion': '¡El volcán hace erupción! Desde ahora, la lava baja y se come la isla, casilla por casilla.',
        'antes': 'Ojo con el reloj de arriba: falta muy poco para la erupción.',
        'lava': {25: 'La lava ya cubre la cuarta parte de la isla.', 50: '¡Media isla ya es lava!', 75: '¡Tres cuartas partes de la isla ya son lava! Casi no queda dónde pararse.'},
        'sin_base': ['¡La lava se traga la base de {v}! Pero no cae todavía: sigue viva mientras le quede gente.',
                     '¡Y la lava se come la base de {v}! Si le queda un obrero, puede fundar otra lejos.',
                     '¡Otra base bajo la lava: la de {v}! Sin base, pero sigue en la partida.'],
        'se_acerca': ['La lava se acerca a la base de {v}.', 'Ojo: la lava ya está junto a la base de {v}.'],
        'con_base': ['¡{V} vuelve a tener base! Un obrero fundó otra, lejos de la lava.', '¡{V} se salva! Ya terminó su base nueva.', '¡Y {v} también tiene base otra vez!'],
        'base_nueva': ['{V} se muda: termina otra base, lejos de la lava.', '{V} ya tiene una segunda base, por si llega la lava.', 'Base nueva para {v}, más lejos del volcán.',
                       '{V} funda otra base más lejos.'],
        'ejercito1': 'Sale el primer ejército: {j} manda {m} tropas contra {c}.',
        'ejercito': ['{J} manda {m} tropas contra {c}.', 'Otro ejército en marcha: {m} tropas de {j} van por {c}.', '{J} ataca a {c} con {m} tropas.'],
        'primer_disparo': 'Primer disparo de la partida: es de {j}.',
        'primera': {'tanque': '{J} saca el primer tanque de la partida.', 'artilleria': 'Primera artillería de la partida: es de {j}.', 'dron': 'El primer dron de la partida es de {j}.',
                    'cuartel': '{J} ya tiene cuartel: de ahí salen las tropas.', 'fabrica': '{J} levanta la primera fábrica: vienen los tanques.',
                    'fortin': '{J} construye el primer fortín de la partida.'},
        'ciudad': ['Esta es la ciudad de {j}.', 'Ahora vemos la ciudad de {j}.'],
        'combate': ['Hay combate junto a la base de {j}.', 'Disparos cerca de la base de {j}.', 'Pelea junto a la ciudad de {j}.'],
        'asedio': ['Atacan la base de {v}: ¿aguantará?', '¡Van por la base de {v}!', 'La base de {v} está bajo fuego.'],
        'estado': 'Minuto {min} de juego. Quedan {k} naciones; va primero {x}, con {p} puntos.',
        'fin': '¡Y se acabó: {g} conquista a {v} y se queda con la isla! Gana {g}, con {p} puntos.',
        'fin_tiempo': '¡Se acabó el tiempo! Gana {g}, con {p} puntos.',
        'cierre_mvp': 'En {min} minutos de juego, {g} conquistó a {k} naciones.',
        'cierre': ['¿Tu ciudad aguantaría al volcán?', '{kz} es gratis: juega en el navegador, en {sitio}, o en Android y iPhone.', '¿Ya estás suscrito? Síguenos para más partidas como esta.'],
        'animo': ['¡Qué nervios!', '¡Ahí viene!', '¡Esto se pone bueno!', '¡Atención!', '¡Uy, uy, uy!', '¡Ojo aquí!', '¡A ver quién aguanta!', '¡Uf!', '¡Vamos!'],
        'velocidad': 'El vídeo va acelerado: las conquistas, a una vez y media; los combates, al triple; y lo demás, a seis veces la velocidad del juego.',
        'bioma': {'bosque': 'Hay cuatro tipos de isla: bosque, nieve, desierto y pantano. Esta es de bosque.', 'nieve': 'Hay cuatro tipos de isla: bosque, nieve, desierto y pantano. Esta es de nieve.',
                  'desierto': 'Hay cuatro tipos de isla: bosque, nieve, desierto y pantano. Esta es de desierto.', 'pantano': 'Hay cuatro tipos de isla: bosque, nieve, desierto y pantano. Esta es de pantano.'},
        'cap': {'inicio': '{N} naciones', 'ejercito': 'El primer ejército', 'erupcion': 'La erupción', 'cae': 'Cae {v}', 'sin_base': 'La lava se traga una base', 'final': 'Juega gratis'},
        'marcador': {'tropas': 'TROPAS', 'edificios': 'EDIF', 'sin_base': 'SIN BASE', 'gana': 'GANA', 'cayo': 'CAYÓ {t}', 'por': 'POR LA {x}', 'lava': 'POR LA LAVA'},
        'marca': ('Estrategia en tiempo real', 'Gratis en el navegador, Android y iPhone'),
    },
    'en': {
        'leia': ('LeIA', 'Leia'), 'kz': ('Kazan', 'Kazan'),
        'sitio': ('kazan.dailychallenge.click', 'kazan dot dailychallenge dot click'),
        'isla': {'bosque': 'a forest island', 'nieve': 'a snowy island', 'desierto': 'a desert island', 'pantano': 'a swamp island'},
        'intro': "Hi! I'm {leia}. Today in {kz}: {isla}, a volcano and {n} nations, all played by the computer.",
        'intro2': 'Each one starts with a base and four workers. Only one can be left standing.',
        'lados': 'Check the sides of the screen: there are the {n} nations, with their points, their troops and their buildings.',
        'y': ' and ',
        'cae_conq': ['{V} falls! {Q} destroys its base and conquers it.', '{Q} conquers {V}! That was its last base.', 'Goodbye, {V}! {Q} takes down its base.'],
        'cae_media': '{V} falls! Conquered by {Q}.',
        'ayuda': '{lista} had a hand in it too.',
        'cae_lava_remata': '{V} falls! The lava had already taken its base, and {Q} finishes off its last people.',
        'cae_lava': '{V} falls! No base and no people left: the volcano took it.',
        'corta': '{V} falls!',
        'quedan_n': '{K} nations left.', 'quedan_2': 'Two left: {a} against {b}.',
        'erupcion': 'The volcano erupts! From now on, the lava spreads and eats the island, tile by tile.',
        'antes': 'Keep an eye on the clock up top: the eruption is almost here.',
        'lava': {25: 'The lava now covers a quarter of the island.', 50: 'Half the island is lava now!', 75: "Three quarters of the island is lava! There's almost nowhere left to stand."},
        'sin_base': ["The lava swallows {V}'s base! But it hasn't fallen yet: it stays alive as long as it has people.",
                     "And the lava eats {V}'s base! If it still has a worker, it can found another one far away.",
                     "Another base under the lava: {V}'s! No base, but still in the match."],
        'se_acerca': ["The lava is closing in on {V}'s base.", "Watch out: the lava is right next to {V}'s base."],
        'con_base': ['{V} has a base again! A worker founded a new one, away from the lava.', '{V} is saved! Its new base is finished.', 'And {V} has a base again too!'],
        'base_nueva': ['{V} is moving out: it finishes another base, away from the lava.', '{V} now has a second base, in case the lava comes.', 'A new base for {V}, farther from the volcano.',
                       '{V} founds another base farther away.'],
        'ejercito1': 'The first army is out: {J} sends {m} troops against {C}.',
        'ejercito': ['{J} sends {m} troops against {C}.', 'Another army on the march: {m} troops from {J} are heading for {C}.', '{J} attacks {C} with {m} troops.'],
        'primer_disparo': 'First shot of the match: it comes from {J}.',
        'primera': {'tanque': '{J} rolls out the first tank of the match.', 'artilleria': 'First artillery of the match: it belongs to {J}.', 'dron': 'The first drone of the match belongs to {J}.',
                    'cuartel': '{J} already has barracks: that is where troops come from.', 'fabrica': '{J} builds the first factory: tanks are coming.',
                    'fortin': '{J} builds the first fort of the match.'},
        'ciudad': ["This is {J}'s city.", "Now we're looking at {J}'s city."],
        'combate': ["There's fighting next to {J}'s base.", "Shots fired near {J}'s base.", "A battle by {J}'s city."],
        'asedio': ["{V}'s base is under attack: will it hold?", "They're going for {V}'s base!", "{V}'s base is under fire."],
        'estado': 'Minute {min} of the game. {K} nations left; {x} is in the lead, with {p} points.',
        'fin': "And it's over: {g} conquers {v} and takes the island! {g} wins, with {p} points.",
        'fin_tiempo': "Time is up! {g} wins, with {p} points.",
        'cierre_mvp': 'In {min} minutes of play, {g} conquered {k} nations.',
        'cierre': ['Would your city survive the volcano?', '{kz} is free: play in your browser at {sitio}, or on Android and iPhone.', 'Are you subscribed yet? Follow us for more matches like this one.'],
        'animo': ['This is tense!', 'Here it comes!', "It's getting good!", 'Heads up!', 'Oh boy, oh boy!', 'Watch this!', "Let's see who holds out!", 'Uh-oh!', 'Come on!'],
        'velocidad': "The video is sped up: conquests at one and a half times, battles at triple, and everything else at six times the game's speed.",
        'bioma': {'bosque': 'There are four kinds of island: forest, snow, desert and swamp. This one is forest.', 'nieve': 'There are four kinds of island: forest, snow, desert and swamp. This one is snow.',
                  'desierto': 'There are four kinds of island: forest, snow, desert and swamp. This one is desert.', 'pantano': 'There are four kinds of island: forest, snow, desert and swamp. This one is swamp.'},
        'cap': {'inicio': '{N} nations', 'ejercito': 'The first army', 'erupcion': 'The eruption', 'cae': '{V} falls', 'sin_base': 'The lava swallows a base', 'final': 'Play free'},
        'marcador': {'tropas': 'TROOPS', 'edificios': 'BLDG', 'sin_base': 'NO BASE', 'gana': 'WINS', 'cayo': 'FELL {t}', 'por': 'BY {x}', 'lava': 'BY THE LAVA'},
        'marca': ('Real-time strategy', 'Free in the browser, on Android and iPhone'),
    },
    'ja': {
        'leia': ('LeIA', 'レイア'), 'kz': ('Kazan', 'カザン'),
        'sitio': ('kazan.dailychallenge.click', 'カザン・ドット・デイリーチャレンジ・ドット・クリック'),
        'isla': {'bosque': '森の島', 'nieve': '雪の島', 'desierto': '砂漠の島', 'pantano': '沼の島'},
        'intro': 'こんにちは！{leia}です。今日の{kz}は、{isla}と火山、そして{n}か国。ぜんぶコンピューターが動かします。',
        'intro2': 'どの国も、本拠地ひとつと作業員4人からスタート。最後に残れるのは1か国だけです。',
        'lados': '画面の左右を見てね。{n}か国のポイント、兵の数、建物の数が出ています。',
        'y': 'と',
        'cae_conq': ['{V}が陥落！{Q}が本拠地をこわして征服しました。', '{Q}が{V}を征服！最後の本拠地が落ちました。', 'さよなら、{V}！{Q}が本拠地を落としました。'],
        'cae_media': '{V}が陥落！{Q}が征服しました。',
        'ayuda': '{lista}も攻めていました。',
        'cae_lava_remata': '{V}が陥落！本拠地はもう溶岩にのまれていて、{Q}が最後の兵をたおしました。',
        'cae_lava': '{V}が陥落！本拠地も人もなくなりました。火山のしわざです。',
        'corta': '{V}が陥落！',
        'quedan_n': '残りは{k}か国。', 'quedan_2': '残りは2か国。{a}対{b}です。',
        'erupcion': '火山が噴火！ここからは溶岩が流れ出して、島を1マスずつのみこんでいきます。',
        'antes': '上の時計に注目。もうすぐ噴火です。',
        'lava': {25: '溶岩が島の4分の1をおおいました。', 50: '島の半分がもう溶岩です！', 75: '島の4分の3が溶岩に！もう立つ場所がほとんどありません。'},
        'sin_base': ['{V}の本拠地が溶岩にのまれた！でも、まだ陥落ではありません。人が残っているかぎり生きています。',
                     '溶岩が{V}の本拠地をのみこんだ！作業員が1人でも残っていれば、遠くに建て直せます。',
                     'また本拠地が溶岩の下に。今度は{V}！本拠地はなくても、まだ試合に残っています。'],
        'se_acerca': ['溶岩が{V}の本拠地にせまっています。', '注意。溶岩はもう{V}の本拠地のすぐそばです。'],
        'con_base': ['{V}に本拠地がもどった！作業員が、溶岩から遠い場所に建て直しました。', '{V}、助かりました！新しい本拠地が完成です。', '{V}にも、また本拠地ができました！'],
        'base_nueva': ['{V}が引っこし。溶岩から遠い場所に、もうひとつ本拠地を建てました。', '{V}に2つ目の本拠地ができました。溶岩が来ても安心です。', '{V}に新しい本拠地。火山からもっと遠い場所です。',
                       '{V}が、もっと遠くに本拠地を建てました。'],
        'ejercito1': '最初の軍が出発！{J}が{m}人の兵を{C}に向かわせました。',
        'ejercito': ['{J}が{m}人の兵を{C}に送りました。', 'また軍が動きます。{J}の兵{m}人が{C}へ。', '{J}が{m}人で{C}を攻めます。'],
        'primer_disparo': 'この試合の最初の一発は、{J}です。',
        'primera': {'tanque': '{J}が、この試合で最初の戦車を出しました。', 'artilleria': 'この試合で最初の砲兵は、{J}です。', 'dron': 'この試合で最初のドローンは、{J}です。',
                    'cuartel': '{J}にもう兵舎ができました。兵はここで訓練します。', 'fabrica': '{J}が最初の工場を建てました。戦車が来ますよ。',
                    'fortin': '{J}が、この試合で最初の砦を建てました。'},
        'ciudad': ['ここは{J}の都市です。', '今うつっているのは{J}の都市。'],
        'combate': ['{J}の本拠地の近くで戦いです。', '{J}の本拠地のそばで撃ち合い。', '{J}の都市の近くでバトル中。'],
        'asedio': ['{V}の本拠地が攻められています。たえられるか？', '{V}の本拠地があぶない！', '{V}の本拠地が集中砲火をあびています。'],
        'estado': 'ゲーム開始から{min}分。残りは{k}か国。トップは{x}、{p}点です。',
        'fin': '試合終了！{g}が{v}を征服して、島を手に入れました！勝ったのは{g}、{p}点です。',
        'fin_tiempo': 'タイムアップ！勝ったのは{g}、{p}点です。',
        'cierre_mvp': 'ゲーム時間{min}分で、{g}は{k}か国を征服しました。',
        'cierre': ['あなたの都市は、火山にたえられる？', '{kz}は無料。ブラウザなら{sitio}、AndroidとiPhoneでも遊べます。', 'チャンネル登録はもうした？こういう対戦をもっと見たいなら、フォローしてね！'],
        'animo': ['ドキドキするね！', '来るよ！', 'おもしろくなってきた！', '注目！', 'うわー、どうなる？', 'ここ、見てて！', 'だれが生き残る？', 'あぶない！', 'がんばれ！'],
        'velocidad': 'この動画は早送りです。征服の場面は1.5倍、戦いは3倍、ほかは6倍の速さです。',
        'bioma': {'bosque': '島は4種類。森、雪、砂漠、沼。今回は森の島です。', 'nieve': '島は4種類。森、雪、砂漠、沼。今回は雪の島です。',
                  'desierto': '島は4種類。森、雪、砂漠、沼。今回は砂漠の島です。', 'pantano': '島は4種類。森、雪、砂漠、沼。今回は沼の島です。'},
        'cap': {'inicio': '{N}か国', 'ejercito': '最初の軍', 'erupcion': '噴火', 'cae': '{V}が陥落', 'sin_base': '溶岩が本拠地をのみこむ', 'final': '無料で遊ぶ'},
        'marcador': {'tropas': '兵', 'edificios': '建物', 'sin_base': '本拠地なし', 'gana': '勝ち', 'cayo': '陥落 {t}', 'por': '{x}が征服', 'lava': '溶岩で陥落'},
        'marca': ('リアルタイムストラテジー', 'ブラウザ・Android・iPhoneで無料'),
    },
}

# Lo que dice en los huecos, en este orden, sin repetir. `cara` de LeIA; `fase`: 'antes' (sólo antes de la erupción) o
# 'despues' (sólo después). Todo sale del juego (docs/KAZAN-HOY.md, sim/sim.js, sim/ia.js y los textos de www/) tal como
# está en la VERSION_SIM 21, comprobado el 15-nov-2026: si algo cambia allá, cambiarlo aquí.
DATOS = [
    {'cara': 'normal', 'es': '{kz} significa «volcán» en japonés.', 'en': '{kz} means "volcano" in Japanese.', 'ja': '{kz}は、日本語の「火山」です。そのままですね。'},
    {'cara': 'normal', 'fase': 'antes', 'es': 'Cada nación empieza igual: tres obreros van a la madera y uno al hierro.',
     'en': 'Every nation starts the same way: three workers go for wood and one for iron.', 'ja': 'どの国も最初は同じ。作業員3人が木を、1人が鉄を集めます。'},
    {'cara': 'pensando', 'fase': 'antes', 'es': 'El cráter se ve desde el principio: el minimapa lo marca con un monte naranja.',
     'en': 'You can see the crater from the start: the minimap marks it with an orange mountain.', 'ja': '火口は最初から見えています。ミニマップのオレンジ色の山がそれです。'},
    {'cara': 'pensando', 'fase': 'antes', 'es': 'El volcán hace erupción a la cuarta parte de la partida. Aquí, a los cinco minutos de juego.',
     'en': 'The volcano erupts a quarter of the way into the match. Here, that is five minutes in.', 'ja': '火山は試合の4分の1がすぎたころに噴火します。今回はゲーム時間で5分後です。', 'solo_minutos': 20},
    {'cara': 'guino', 'es': '¿Te cuento un chiste malo de IA? ¿Por qué el volcán nunca gana una discusión? Porque siempre explota.',
     'en': 'Want to hear a bad AI joke? Why does the volcano never win an argument? It always blows its top.', 'ja': 'AIのダジャレ、聞きたい？火山が口げんかに勝てないのはなぜ？すぐ噴火しちゃうから。'},
    {'cara': 'normal', 'es': 'Hay tres recursos: madera, hierro y comida. La comida sale sola: la base da una por segundo, y cada granja, dos más.',
     'en': 'There are three resources: wood, iron and food. Food comes by itself: the base gives one per second, and each farm two more.',
     'ja': '資源は3つ。木、鉄、食料です。食料は自動でふえます。本拠地が毎秒1、農場ひとつで毎秒2。'},
    {'cara': 'normal', 'es': 'Los obreros talan el bosque y cargan doce por viaje. Cada árbol da ciento veinte de madera.',
     'en': 'Workers chop the forest and carry twelve per trip. Each tree gives a hundred and twenty wood.', 'ja': '作業員は森を切って、1回に12ずつ運びます。木1本で、木材は120。'},
    {'cara': 'pensando', 'es': 'La computadora mira su ciudad cada dos segundos y manda órdenes, como un jugador.',
     'en': 'The computer looks at its city every two seconds and gives orders, just like a player.', 'ja': 'コンピューターは2秒ごとに自分の都市を見て、プレイヤーと同じように命令を出します。'},
    {'cara': 'normal', 'es': 'La computadora ataca cuando junta ocho tropas o más, y lleva un médico por cada cinco.',
     'en': 'The computer attacks once it has eight troops or more, and it brings one medic for every five.', 'ja': 'コンピューターは、兵が8人以上そろうと攻めます。5人につきメディックを1人つれていきます。'},
    {'cara': 'guino', 'es': 'Le pregunté a la computadora por qué ataca con ocho tropas. Me dijo: porque con siete no completo el byte.',
     'en': "I asked the computer why it attacks with eight troops. It said: with seven, I'm one bit short of a byte.", 'ja': 'コンピューターに聞きました。なぜ8人で攻めるの？「7人だと、1バイトに1ビット足りないから」だそうです。'},
    {'cara': 'normal', 'es': 'El cuartel entrena soldados, francotiradores, motos, médicos y exploradores.',
     'en': 'The barracks train soldiers, snipers, bikes, medics and scouts.', 'ja': '兵舎では、兵士、スナイパー、バイク、メディック、スカウトを訓練できます。'},
    {'cara': 'normal', 'es': 'La fábrica arma tanques, artillería y drones.', 'en': 'The factory builds tanks, artillery and drones.', 'ja': '工場では、戦車、砲兵、ドローンを作れます。'},
    {'cara': 'pensando', 'es': 'El tanque aguanta mucho y pega el doble a los edificios, pero es lento.',
     'en': 'The tank can take a lot and hits buildings twice as hard, but it is slow.', 'ja': '戦車はとても丈夫で、建物へのダメージは2倍。でも足がおそいです。'},
    {'cara': 'feliz', 'es': 'Hay diez colores de nación, y ninguno es verde, para que no se pierdan en el pasto.',
     'en': 'There are ten nation colors, and none of them is green, so they never get lost in the grass.', 'ja': '国の色は10色。緑はありません。草の上で見えなくなるからです。'},
    {'cara': 'guino', 'es': 'A mí la lava no me asusta: yo vivo en la nube.', 'en': "Lava doesn't scare me: I live in the cloud.", 'ja': '溶岩なんてこわくないよ。わたし、クラウドに住んでるから。'},
    {'cara': 'pensando', 'fase': 'despues', 'es': 'La lava avanza por tierra, y el agua la para. Lo que pisa, muere: edificios y tropas de a pie.',
     'en': 'The lava moves over land, and water stops it. Whatever it touches dies: buildings and troops on foot.', 'ja': '溶岩は陸の上を進み、水で止まります。ふれたものは、建物も歩く兵も、おしまいです。'},
    {'cara': 'sorpresa', 'fase': 'despues', 'es': 'Por delante de la lava caen piedras ardiendo: avisan por dónde viene.',
     'en': 'Burning rocks fall ahead of the lava: they warn you where it is coming from.', 'ja': '溶岩の前には、燃える岩がふってきます。溶岩がどこから来るかの合図です。'},
    {'cara': 'pensando', 'fase': 'despues', 'es': 'Si la lava se come tu base, no pierdes todavía: sigues con la gente que te quede, y un obrero puede fundar otra base lejos.',
     'en': "If the lava eats your base, you haven't lost yet: you carry on with the people you have left, and a worker can found another base far away.",
     'ja': '溶岩に本拠地をのまれても、まだ負けではありません。残った人で続けられて、作業員がいれば遠くに建て直せます。'},
    {'cara': 'normal', 'fase': 'despues', 'es': 'Fundar otra base cuesta trescientos de madera y ciento cincuenta de hierro. Se pueden tener dos a la vez.',
     'en': 'Founding another base costs three hundred wood and a hundred and fifty iron. You can have two at a time.', 'ja': '新しい本拠地は、木300と鉄150。同時に2つまで持てます。'},
    {'cara': 'guino', 'es': 'Yo también hago erupción… cuando se me acaba la memoria.', 'en': 'I erupt too… when I run out of memory.', 'ja': 'わたしも噴火します。メモリーが足りなくなったときに。'},
    {'cara': 'pensando', 'fase': 'despues', 'es': 'La computadora también se muda: cuando la lava va a llegar a su base, ahorra y funda otra en un sitio seguro.',
     'en': 'The computer moves out too: when the lava is about to reach its base, it saves up and founds another one somewhere safe.',
     'ja': 'コンピューターも引っこしします。溶岩が本拠地に近づくと、資源をためて、安全な場所に建て直します。'},
    {'cara': 'normal', 'es': 'Una nación cae cuando el enemigo destruye su última base… o cuando se queda sin base y sin gente.',
     'en': 'A nation falls when the enemy destroys its last base… or when it is left with no base and no people.', 'ja': '国が陥落するのは、敵に最後の本拠地をこわされたとき。または、本拠地も人もなくなったときです。'},
    {'cara': 'normal', 'es': 'Los puntos: quinientos por tener base, cuarenta por cada edificio y diez por cada lugar de población ocupado.',
     'en': 'The points: five hundred for having a base, forty for each building and ten for each population slot in use.', 'ja': 'ポイントは、本拠地があれば500、建物ひとつで40、人口1人ぶんで10です。'},
    {'cara': 'triste', 'es': 'Una nación caída se queda sólo con la mitad de sus puntos.', 'en': 'A fallen nation keeps only half of its points.', 'ja': '陥落した国のポイントは、半分になります。'},
    {'cara': 'guino', 'es': 'Mi estrategia favorita es la del volcán: no hacer nada un rato… y luego arrasar con todo.',
     'en': "My favorite strategy is the volcano's: do nothing for a while… and then wipe out everything.", 'ja': 'わたしの好きな作戦は、火山と同じ。しばらく何もしないで…あとで全部もっていく。'},
    {'cara': 'pensando', 'es': 'La artillería destroza edificios desde lejos, pero de cerca no puede disparar: hay que cubrirla.',
     'en': "Artillery wrecks buildings from far away, but it can't fire up close: it needs cover.", 'ja': '砲兵は遠くから建物をこわせます。でも近くの敵は撃てないので、守ってあげないといけません。'},
    {'cara': 'normal', 'es': 'El dron vuela sobre el agua, las montañas y la lava. Sólo lo bajan las torres y los francotiradores.',
     'en': 'The drone flies over water, mountains and lava. Only towers and snipers can shoot it down.', 'ja': 'ドローンは水も山も溶岩も飛びこえます。落とせるのは塔とスナイパーだけ。'},
    {'cara': 'feliz', 'es': 'El médico no pelea: cura al herido más cercano, y va solo hacia él.',
     'en': "The medic doesn't fight: it heals the nearest wounded unit, and walks over on its own.", 'ja': 'メディックは戦いません。いちばん近いけが人のところへ自分で行って、回復します。'},
    {'cara': 'normal', 'es': 'La torre dispara sola a seis casillas, y defiende aunque no estés.',
     'en': "The tower fires on its own at six tiles, and defends even when you're away.", 'ja': '塔は6マス先まで自動で撃ちます。あなたがいなくても守ってくれます。'},
    {'cara': 'guino', 'es': 'Dicen que las IA no sentimos nada. Pero cuando cae una base… se me cae un bit.',
     'en': "They say AIs don't feel anything. But when a base falls… I drop a bit.", 'ja': 'AIは何も感じないって言われます。でも本拠地が落ちると…ビットもひとつ落ちます。'},
    {'cara': 'normal', 'es': 'En el fortín caben seis soldados o francotiradores, que disparan desde dentro. Vacío, no dispara.',
     'en': "The fort holds six soldiers or snipers, who fire from inside. Empty, it doesn't fire.", 'ja': '砦には兵士かスナイパーが6人まで入って、中から撃ちます。空っぽだと撃ちません。'},
    {'cara': 'pensando', 'es': 'El mercado cambia cien de madera por veinticinco de hierro. Es la salida cuando se acaba el mineral.',
     'en': 'The market trades a hundred wood for twenty-five iron. It is the way out when the ore runs dry.', 'ja': '市場では、木100を鉄25にかえられます。鉱石がなくなったときのたよりです。'},
    {'cara': 'normal', 'es': 'El bosque no se cruza: hay que rodearlo o talarlo. Sirve de muralla barata.',
     'en': "You can't walk through the forest: you go around it or chop it down. It makes a cheap wall.", 'ja': '森は通りぬけられません。回りこむか、切るか。安上がりな壁にもなります。'},
    {'cara': 'pensando', 'fase': 'despues', 'es': 'Donde la lava va a llegar pronto, no se puede construir.', 'en': "You can't build where the lava is about to arrive.", 'ja': '溶岩がもうすぐ来る場所には、建物を建てられません。'},
    {'cara': 'guino', 'es': 'El volcán y yo nos parecemos: los dos nos calentamos cuando trabajamos mucho.',
     'en': 'The volcano and I are alike: we both heat up when we work too hard.', 'ja': '火山とわたしは似ています。がんばりすぎると、どっちも熱くなる。'},
    {'cara': 'feliz', 'es': 'Aquí vemos toda la isla, pero cuando juegas hay niebla de guerra: sólo ves alrededor de lo tuyo.',
     'en': 'Here we can see the whole island, but when you play there is fog of war: you only see around your own units.', 'ja': 'ここでは島ぜんぶが見えますが、遊ぶときは「戦場の霧」があって、自分のまわりしか見えません。'},
    {'cara': 'normal', 'es': 'El explorador no pelea, pero corre más que nadie y ve lejos: sirve para encontrar a los demás.',
     'en': "The scout doesn't fight, but it outruns everyone and sees far: it is how you find the others.", 'ja': 'スカウトは戦いませんが、だれよりも速く走って遠くまで見えます。ほかの国をさがす役です。'},
    {'cara': 'normal', 'es': 'La casa da lugar para seis más de población. El tope son doscientos.',
     'en': 'A house makes room for six more population. The cap is two hundred.', 'ja': '家ひとつで人口が6ふえます。上限は200です。'},
    {'cara': 'pensando', 'es': 'Esta partida es una simulación: con la misma semilla, sale exactamente igual.',
     'en': 'This match is a simulation: with the same seed, it plays out exactly the same.', 'ja': 'この試合はシミュレーション。同じシードなら、まったく同じ試合になります。'},
    {'cara': 'guino', 'es': '¿Cuál es el colmo de un obrero de {kz}? Talar todo el bosque… y que la lava se quede con la madera.',
     'en': "What's the worst luck for a {kz} worker? Chopping down the whole forest… and the lava gets the wood.", 'ja': '{kz}の作業員のいちばんの不運は？森をぜんぶ切ったのに、木を溶岩に持っていかれること。'},
    {'cara': 'feliz', 'es': '{kz} no tiene música: sólo efectos de chip. Cada tropa suena distinto al disparar.',
     'en': '{kz} has no music: just chip sound effects. Every troop sounds different when it fires.', 'ja': '{kz}に音楽はありません。チップ音の効果音だけ。兵の種類ごとに撃つ音がちがいます。'},
    {'cara': 'normal', 'fase': 'despues', 'es': 'Al final de la partida, la lava tapa el ochenta y cinco por ciento de la tierra.',
     'en': 'By the end of the match, the lava covers eighty-five percent of the land.', 'ja': '試合の終わりには、溶岩が陸の85パーセントをおおいます。'},
    {'cara': 'normal', 'es': 'La moto es rápida: caza obreros y francotiradores. Contra torres y tanques, le va mal.',
     'en': 'The bike is fast: it hunts workers and snipers. Against towers and tanks, not so much.', 'ja': 'バイクは速くて、作業員やスナイパーをねらいます。塔や戦車には弱いです。'},
    {'cara': 'pensando', 'es': 'Los muros tapan el paso… también a tus tropas: hay que dejar un hueco.',
     'en': 'Walls block the way… for your own troops too: you have to leave a gap.', 'ja': '壁は道をふさぎます。自分の兵もです。すき間をあけておきましょう。'},
    {'cara': 'guino', 'es': 'Si la lava llega hasta mi servidor, que conste que yo avisé.', 'en': 'If the lava reaches my server, let the record show I warned you.', 'ja': '溶岩がわたしのサーバーまで来たら…ちゃんと警告はしましたからね。'},
    {'cara': 'feliz', 'es': 'Tú puedes jugar contra la computadora: de uno a nueve rivales, en partidas de veinte, treinta, cuarenta y cinco o sesenta minutos.',
     'en': 'You can play against the computer: from one to nine rivals, in matches of twenty, thirty, forty-five or sixty minutes.',
     'ja': 'あなたもコンピューターと対戦できます。相手は1か国から9か国まで、試合は20分、30分、45分、60分からえらべます。'},
    {'cara': 'feliz', 'es': 'En línea está el reto de la isla: hasta doce naciones en la misma isla, con dos rondas por semana.',
     'en': 'Online there is the island challenge: up to twelve nations on the same island, with two rounds a week.', 'ja': 'オンラインには「島のチャレンジ」があります。同じ島に最大12か国、週に2ラウンドです。'},
    {'cara': 'normal', 'es': 'En el reto de la isla, tu ciudad sigue cuando te vas: los obreros recogen y las tropas defienden.',
     'en': 'In the island challenge, your city keeps going when you leave: workers gather and troops defend.', 'ja': '島のチャレンジでは、ログアウトしても都市は動きつづけます。作業員は集め、兵は守ります。'},
    {'cara': 'normal', 'es': 'También hay salas con código, para jugar con tus amigos.', 'en': 'There are also rooms with a code, to play with your friends.', 'ja': 'コードで入れるルームもあって、友だちと遊べます。'},
    {'cara': 'pensando', 'es': 'El francotirador dispara lejos y ve lejos, pero es frágil.', 'en': 'The sniper shoots far and sees far, but it is fragile.', 'ja': 'スナイパーは遠くまで撃てて遠くまで見えます。でも、打たれ弱いです。'},
    {'cara': 'normal', 'es': 'Los obreros también reparan: cada diez de vida cuestan uno de madera.',
     'en': 'Workers also repair: every ten health costs one wood.', 'ja': '作業員は修理もできます。HP10につき、木が1かかります。'},
    {'cara': 'normal', 'es': 'La base tiene novecientos de vida: es el edificio más resistente.', 'en': 'The base has nine hundred health: it is the toughest building.', 'ja': '本拠地のHPは900。いちばん丈夫な建物です。'},
    {'cara': 'feliz', 'es': 'En el teléfono se juega con el dedo: tocas para elegir, arrastras para marcar un área y tocas a dónde van.',
     'en': 'On a phone you play with your finger: tap to select, drag to mark an area, and tap where they should go.', 'ja': 'スマホでは指で遊びます。タップでえらんで、ドラッグで範囲をかこんで、行き先をタップ。'},
    {'cara': 'normal', 'es': 'El radar ve a catorce casillas.', 'en': 'The radar sees fourteen tiles away.', 'ja': 'レーダーは14マス先まで見えます。'},
    {'cara': 'feliz', 'es': '{kz} es gratis: en el navegador, en Android y en iPhone.', 'en': '{kz} is free: in the browser, on Android and on iPhone.', 'ja': '{kz}は無料。ブラウザ、Android、iPhoneで遊べます。'},
    {'cara': 'normal', 'es': 'El soldado es barato y rápido de entrenar: seis segundos.', 'en': 'The soldier is cheap and quick to train: six seconds.', 'ja': '兵士は安くて、訓練もたったの6秒です。'},
    # los cortos, para los huecos chicos
    {'cara': 'normal', 'es': 'Un muro cuesta diez de madera.', 'en': 'A wall costs ten wood.', 'ja': '壁は、木10で建てられます。'},
    {'cara': 'normal', 'es': 'Un obrero cuesta treinta de comida.', 'en': 'A worker costs thirty food.', 'ja': '作業員ひとりは、食料30です。'},
    {'cara': 'pensando', 'es': 'El tanque ocupa tres lugares de población.', 'en': 'A tank takes up three population slots.', 'ja': '戦車1台で、人口を3つ使います。'},
    {'cara': 'normal', 'es': 'Cada casilla mide ocho píxeles.', 'en': 'Each tile is eight pixels wide.', 'ja': '1マスは8ピクセルです。'},
    {'cara': 'normal', 'es': 'El juego da diez pasos por segundo.', 'en': 'The game runs ten steps per second.', 'ja': 'ゲームは1秒に10ステップ進みます。'},
    {'cara': 'normal', 'es': 'El fortín tiene seiscientos de vida.', 'en': 'The fort has six hundred health.', 'ja': '砦のHPは600です。'},
    {'cara': 'normal', 'es': 'Armar un tanque tarda dieciocho segundos.', 'en': 'Building a tank takes eighteen seconds.', 'ja': '戦車を作るには18秒かかります。'},
    {'cara': 'normal', 'es': 'La torre tiene doscientos veinte de vida.', 'en': 'The tower has two hundred and twenty health.', 'ja': '塔のHPは220です。'},
    {'cara': 'normal', 'es': 'Una granja cuesta cuarenta de madera.', 'en': 'A farm costs forty wood.', 'ja': '農場は、木40で建てられます。'},
    {'cara': 'normal', 'es': 'Una casa cuesta cincuenta de madera.', 'en': 'A house costs fifty wood.', 'ja': '家は、木50で建てられます。'},
    {'cara': 'pensando', 'es': 'El dron cuesta veinte de hierro y diez de comida.', 'en': 'A drone costs twenty iron and ten food.', 'ja': 'ドローンは、鉄20と食料10です。'},
    {'cara': 'normal', 'es': 'Una base nueva tarda cuarenta segundos en levantarse.', 'en': 'A new base takes forty seconds to build.', 'ja': '新しい本拠地を建てるには40秒かかります。'},
]


def cargar(ruta):
    return json.load(open(ruta, encoding='utf-8'))


# ---------------------------------------------------------------------------------------------------- la partida
def color_nacion(j):
    """atari(tono, lum) de www/render.js, en RGB."""
    tono, lum = COL_JUG[j % len(COL_JUG)]
    if tono == 0:
        return [round(lum * 34)] * 3
    h = (55 - (tono - 1) * 24 + 720) % 360; l = (14 + lum * 10) / 100; s = (90 - lum * 5) / 100
    return [round(x * 255) for x in colorsys.hls_to_rgb(h / 360, l, s)]


class Partida:
    """El detalle de la partida larga (escaleta.json → `larga`, de kazan-cpu/grabar-cpu.mjs con KAZAN_LARGA=1): los
    tiempos son segundos del vídeo del juego, y son los mismos en los tres idiomas."""

    def __init__(self, esc):
        self.esc = esc; L = self.L = esc['larga']
        self.N = len(L['naciones']); self.S = L['sucesos']
        self.T = L['segundos']; self.fin_t = L['fin_s']; self.erupcion = L['erupcion_s']
        self.estados = L['estados']; self.ts = [x['t'] for x in self.estados]
        self.caen = [s for s in self.S if s['tipo'] == 'cae']
        self.fin = next(s for s in self.S if s['tipo'] == 'fin')
        self.gana = self.fin['gana']
        self.puntos_fin = next(r['puntos'] for r in self.fin['tabla'] if r['id'] == self.gana)

    def estado(self, t):
        return self.estados[max(0, bisect.bisect_right(self.ts, t + 1e-6) - 1)]

    def vivas(self, t):
        return [j for j, n in enumerate(self.estado(t)['n']) if n['vivo']]

    def conquistas(self):
        """Cuántas naciones conquistó cada una."""
        k = {}
        for c in self.caen:
            if c['por'] == 'enemigos' and c['quien'] is not None:
                k[c['quien']] = k.get(c['quien'], 0) + 1
        return k


def marcador(p, lang):
    """El marcador de los lados para comercial.py (marcador_naciones)."""
    rot = TX[lang]['marcador']; nombres = NACION[lang]['marcador']
    nota = {}
    for c in p.caen:
        por = rot['por'].format(x=nombres[c['quien']]) if c['por'] == 'enemigos' and c['quien'] is not None else \
            rot['por'].format(x=nombres[c['remata']]) if c.get('remata') is not None else rot['lava']
        nota[c['j']] = [rot['cayo'].format(t=c['juego']), por]
    estados = []
    for x in p.estados:
        fin = x['t'] >= p.fin_t - 1e-6 and p.fin['motivo'] == 'ultimo'
        estados.append({'t': x['t'], 'n': [dict({'v': int(n['vivo']), 'sb': int(n['sinBase']), 'p': n['puntos'], 'tr': n['tropas'], 'ed': n['edificios']},
                                              **({'nota': nota[j]} if not n['vivo'] and j in nota else {}), **({'gana': 1} if fin and j == p.gana else {}))
                                         for j, n in enumerate(x['n'])]})
    return {'tipo': 'naciones', 'naciones': [{'nombre': nombres[j], 'color': color_nacion(j)} for j in range(p.N)],
            'rotulos': {k: rot[k] for k in ('tropas', 'edificios', 'sin_base', 'gana')},
            'pmax': max(n['puntos'] for x in p.estados for n in x['n']), 'estados': estados}


# ---------------------------------------------------------------------------------------------------- el guion
def guion(p, lang, medir):
    tx = TX[lang]; L = p.L; ja = lang == 'ja'; sp = '' if ja else ' '
    video = f'{CARPETA}/{lang}/largo.mp4'

    def nac(j, largo=True):
        """Cómo se dice la nación j: (se lee, se dice). En japonés, 黄の国; en una lista, sólo 黄."""
        d = NACION[lang]['dice'][j % 10]
        return par(d[1] if largo else d[0]) if ja else d

    def formas(pref, j):
        """Las formas de una nación en una plantilla: {v} y {V} (con mayúscula al principio)."""
        a = nac(j); return {pref: a, pref.upper(): tuple(x[:1].upper() + x[1:] for x in a)}

    def lista(items):
        items = [par(x) for x in items]
        if len(items) == 1:
            return items[0]
        return tuple((', ' if not ja else '、').join(x[k] for x in items[:-1]) + tx['y'] + items[-1][k] for k in (0, 1))

    num = lambda k: (NUM[lang][k] if not ja and k < len(NUM[lang]) else str(k),) * 2
    Num = lambda k: tuple(x[:1].upper() + x[1:] for x in num(k))
    base = {'leia': tx['leia'], 'kz': tx['kz'], 'sitio': tx['sitio'], 'isla': (tx['isla'][L['bioma']],) * 2, 'n': num(p.N), 'N': Num(p.N)}
    giro = {}

    def variante(k, semilla=0):
        """La siguiente de las variantes de `k`, para no repetir la misma seguido."""
        l = tx[k]; i = giro.get(k, semilla % len(l)); giro[k] = i + 1
        return l[i % len(l)]

    # --- las reacciones: lo que pasa en la partida, con su segundo, su peso y hasta cuándo se puede decir
    sucesos = []

    def suceso(t, prio, ventana, cara, texto, corta=None, capitulo=None, tipo='', valido=None):
        sucesos.append({'t': t, 'prio': prio, 'ventana': ventana, 'cara': cara, 'texto': texto, 'corta': corta, 'capitulo': capitulo, 'tipo': tipo, 'valido': valido})

    viva = lambda j: (lambda t: j in p.vivas(t))
    ultima = p.caen[-1] if p.caen and p.fin['motivo'] == 'ultimo' and abs(p.caen[-1]['t'] - p.fin_t) < 0.5 else None
    for i, c in enumerate(p.caen):
        if c is ultima:
            continue   # la última va con el final
        v = formas('v', c['j'])
        quedan = len(p.vivas(c['t']))
        if c['por'] == 'enemigos' and c['quien'] is not None:
            m = marcar(variante('cae_conq', i), {**v, **formas('q', c['quien'])})
            media = marcar(tx['cae_media'], {**v, **formas('q', c['quien'])})
            if c['ayudan']:
                m += sp + marcar(tx['ayuda'], {'lista': lista([nac(a, False) for a in c['ayudan']])})
        elif c.get('remata') is not None:
            m = marcar(tx['cae_lava_remata'], {**v, **formas('q', c['remata'])}); media = marcar(tx['corta'], v)
        else:
            m = marcar(tx['cae_lava'], v); media = marcar(tx['corta'], v)
        if quedan == 2:
            a, b = p.vivas(c['t']); cola = marcar(tx['quedan_2'], {'a': nac(a, False), 'b': nac(b, False)})
        else:
            cola = marcar(tx['quedan_n'], {'k': num(quedan), 'K': Num(quedan)})
        # si otra cae enseguida, sólo lo justo; y cuántas quedan lo dice la segunda
        sig = p.caen[i + 1]['t'] - c['t'] if i + 1 < len(p.caen) else 99
        suceso(c['t'], 6, 9, 'sorpresa', media if sig < 6 else m + sp + cola, media if sig < 6 else marcar(tx['corta'], v), marcas(marcar(tx['cap']['cae'], v))[0], 'cae')
    suceso(p.erupcion, 6, 8, 'sorpresa', marcar(tx['erupcion'], base), None, tx['cap']['erupcion'], 'erupcion')
    suceso(p.erupcion - 8.5, 3, 2.5, 'pensando', marcar(tx['antes'], base), tipo='antes')
    con_base = {(s['tick'], s['j']) for s in p.S if s['tipo'] == 'con_base'}
    primero_ej = True; ultimo_ej = {}; n_sb = 0
    for s in p.S:
        tipo = s['tipo']; t = s['t']
        if tipo == 'sin_base':
            suceso(t, 5, 8, 'sorpresa', marcar(variante('sin_base'), formas('v', s['j'])), None, tx['cap']['sin_base'] if n_sb == 0 else None, 'sin_base', viva(s['j'])); n_sb += 1
        elif tipo == 'con_base':
            suceso(t, 4, 10, 'feliz', marcar(variante('con_base'), formas('v', s['j'])), tipo='con_base', valido=viva(s['j']))
        elif tipo == 'base_nueva' and (s['tick'], s['j']) not in con_base:
            suceso(t, 3, 8, 'pensando', marcar(variante('base_nueva'), formas('v', s['j'])), tipo='base_nueva', valido=viva(s['j']))
        elif tipo == 'lava':
            suceso(t, 4, 10, 'sorpresa' if s['pct'] >= 50 else 'pensando', marcar(tx['lava'][s['pct']], base), tipo='lava')
        elif tipo == 'ejercito' and s['n'] >= 8:
            val = {**formas('j', s['j']), **formas('c', s['contra']), 'm': num(s['n'])}
            if primero_ej:
                suceso(t, 4, 6, 'normal', marcar(tx['ejercito1'], val), None, tx['cap']['ejercito'], 'ejercito1'); primero_ej = False
            elif t - ultimo_ej.get((s['j'], s['contra']), -99) > 45:
                suceso(t, 2, 4, 'normal', marcar(variante('ejercito'), val), tipo='ejercito', valido=lambda t_, a=s['j'], b=s['contra']: a in p.vivas(t_) and b in p.vivas(t_))
            ultimo_ej[(s['j'], s['contra'])] = t
        elif tipo == 'primer_disparo':
            suceso(t, 2, 5, 'sorpresa', marcar(tx['primer_disparo'], formas('j', s['j'])), tipo='primera')
        elif tipo in ('primera_tropa', 'primer_edificio'):
            que = s.get('unidad') or s.get('edificio')
            if que in tx['primera']:
                suceso(t, 3 if tipo == 'primera_tropa' else 2, 6, 'normal', marcar(tx['primera'][que], formas('j', s['j'])), tipo='primera')
    # lo que enfoca la cámara
    for tm in L['tomas']:
        t0 = tm['desde'] + 0.8
        if tm['tipo'] == 'ciudad':
            suceso(t0, 2, 4, 'normal', marcar(variante('ciudad'), formas('j', tm['j'])), tipo='ciudad', valido=viva(tm['j']))
        elif tm['tipo'] == 'combate' and tm.get('junto', -1) >= 0:
            suceso(t0, 1, 5, 'normal', marcar(variante('combate'), formas('j', tm['junto'])), tipo='combate', valido=viva(tm['junto']))
        elif tm['tipo'] in ('conquista', 'final'):
            c = next((c for c in p.caen if tm['desde'] <= c['t'] <= tm['hasta'] + 0.1 and c['por'] == 'enemigos'), None)
            if c and c['t'] - t0 >= 7:
                suceso(t0, 3, min(6, c['t'] - t0 - 4), 'pensando', marcar(variante('asedio'), formas('v', c['j'])), tipo='asedio')
        elif tm['tipo'] == 'sinBase':
            s = next((s for s in p.S if s['tipo'] == 'sin_base' and tm['desde'] <= s['t'] <= tm['hasta'] + 0.1), None)
            if s and s['t'] - t0 >= 5:
                suceso(t0, 3, min(5, s['t'] - t0 - 3), 'pensando', marcar(variante('se_acerca'), formas('v', s['j'])), tipo='asedio')

    # cómo va, cada minuto y pico (lo dice con lo que haya cuando lo diga)
    def estado(t):
        e = p.estado(t); vivas = p.vivas(t)
        x = max(vivas, key=lambda j: e['n'][j]['puntos'])
        return marcar(tx['estado'], {'min': (str(e['tick'] // 600),) * 2, 'k': num(len(vivas)), 'K': Num(len(vivas)), 'x': nac(x), 'p': (str(e['n'][x]['puntos']),) * 2})
    for t0 in range(CADA, int(p.fin_t - 35), CADA):
        suceso(t0, 1, 40, 'normal', estado, tipo='estado', valido=lambda t: len(p.vivas(t)) >= 3)
    sucesos.sort(key=lambda s: s['t'])

    # --- los rellenos, en orden: los lados, la isla y luego DATOS
    rellenos = []

    def relleno(m, cara, fase=None):
        rellenos.append({'m': m, 'cara': cara, 'fase': fase})
    relleno(marcar(tx['bioma'][L['bioma']], base), 'normal')
    for k, d in enumerate(DATOS):
        if d.get('solo_minutos') and d['solo_minutos'] != L['minutos']:
            continue
        relleno(marcar(d[lang], base), d['cara'], d.get('fase'))
        if k == 12 and {v['x'] for v in L['velocidad']} == {0, 1.5, 3, 6}:
            relleno(marcar(tx['velocidad'], base), 'normal')

    # --- el tiempo: lo que pasa en cuanto pasa; en los huecos, lo siguiente que quepa
    escenas, t = [], 0.0
    medidas = {}

    def cuanto(m):
        if m not in medidas:
            medidas[m] = sum(medir(marcas(x)[1]) + comercial.RESPIRO + 0.02 for x in paginas(m, lang))
        return medidas[m]

    def tramo(dur, cara=None, frase=None, capitulo=None):
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
        escenas.append(e); t += round(dur, 3)

    def decir(cara, marcado, capitulo=None):
        for i, pg in enumerate(paginas(marcado, lang)):
            tramo(0, cara, marcas(pg), capitulo if i == 0 else None)

    decir('feliz', marcar(tx['intro'], base), marcas(marcar(tx['cap']['inicio'], base))[0])
    decir('feliz', marcar(tx['intro2'], base))
    decir('feliz', marcar(tx['lados'], base))
    fin_voz = (ultima['t'] if ultima else p.fin_t) - 0.2
    ESPERA = {'combate': 22, 'ejercito': 18, 'ciudad': 5, 'primera': 6, 'asedio': 8, 'base_nueva': 10}   # s entre dos del mismo tipo
    vivas, ev, animo, dichos, caps = [], list(sucesos), -99.0, {}, [0.0]
    while t < fin_voz - 0.3:
        vivas += [s for s in ev if s['t'] <= t + 0.05]; ev = [s for s in ev if s['t'] > t + 0.05]
        vivas = [s for s in vivas if t - s['t'] <= s['ventana'] and (not s['valido'] or s['valido'](t))]
        dicha = False
        for s in sorted(vivas, key=lambda s: (s['prio'], -s['t']), reverse=True):
            m = s['texto'](t) if callable(s['texto']) else s['texto']
            alto = min([x['t'] for x in ev if x['prio'] > s['prio'] or (x['prio'] == s['prio'] >= 6)] + [fin_voz])
            tope = min(alto + 0.6, fin_voz + 0.3)
            if t + cuanto(m) > tope and s['corta']:
                m = s['corta']
            if s['tipo'] in ESPERA and t - dichos.get(s['tipo'], -99) < ESPERA[s['tipo']]:
                vivas.remove(s); dicha = True; break   # no dos «hay combate» seguidos
            if t + cuanto(m) <= tope or s['prio'] >= 5:   # una caída se dice siempre, aunque empuje lo que sigue
                cap = s['capitulo'] if s['capitulo'] and all(abs(t - c) >= 11 for c in caps) else None
                if cap:
                    caps.append(t)
                decir(s['cara'], m, cap); dichos[s['tipo']] = t; vivas.remove(s); dicha = True
                break
        if dicha:
            continue
        hueco = min([x['t'] for x in ev if x['prio'] >= 4] + [fin_voz]) - t
        k = None
        if hueco >= 2.2:
            fase = 'antes' if t < p.erupcion - 6 else 'despues' if t > p.erupcion + 6 else 'erupcion'
            k = next((k for k, r in enumerate(rellenos) if (not r['fase'] or r['fase'] == fase) and (not r['fase'] == 'antes' or t + cuanto(r['m']) < p.erupcion - 4)
                      and cuanto(r['m']) + PAUSA <= hueco), None)
        if k is not None:
            r = rellenos.pop(k)
            decir(r['cara'], r['m']); tramo(PAUSA)
            continue
        if hueco >= 1.6 and t - animo >= 9 and (fin_voz - t <= hueco + 0.01 or hueco >= 2.2 or any(x['prio'] >= 5 and x['t'] - t <= hueco + 0.01 for x in ev)):   # un grito corto mientras llega lo que viene (o si, sin él, callaría unos 3 s)
            m = next((x for x in tx['animo'][giro.get('animo', 0) % len(tx['animo']):] + tx['animo'] if cuanto(x) <= hueco), None)
            if m:
                giro['animo'] = tx['animo'].index(m) + 1
                decir('feliz', m); animo = t
                continue
        sig = min([x['t'] for x in ev] + [fin_voz])
        tramo(max(0.1, sig - t)) if sig - t > 0.05 else tramo(0.1)
    if fin_voz + 0.2 - t > 0.05:   # la última caída, en cuanto pasa
        tramo(fin_voz + 0.2 - t)
    # el final: la última caída y quién gana, y la partida hasta que se acaba (el cartel del juego con la tabla)
    g = nac(p.gana); val = {'g': g, 'p': (str(p.puntos_fin),) * 2}
    if ultima:
        m = marcar(tx['fin'] if ultima['por'] == 'enemigos' and ultima['quien'] == p.gana else tx['fin_tiempo'], {**val, 'v': nac(ultima['j'])})
    else:
        m = marcar(tx['fin_tiempo'], val)
    decir('feliz', m)
    if p.T - 0.1 - t > 0.3:
        tramo(p.T - 0.1 - t)
    # la tarjeta: cuántas conquistó, dónde jugar y que se suscriban, cada cosa en su página
    partes = [marcar(x, base) for x in tx['cierre']]
    kc = p.conquistas().get(p.gana, 0)
    if kc >= 3:
        partes[0] = marcar(tx['cierre_mvp'], {'min': (str(round(p.fin['tick'] / 600)),) * 2, 'g': g, 'k': num(kc)}) + sp + partes[0]
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
    return escenas, t


def silencios(escenas, medir):
    """Cuánto habla LeIA durante la partida y el silencio más largo (entre el final de una frase y el principio de la
    siguiente), en segundos; sin la tarjeta final."""
    t, habla, ultimo, peor = 0.0, 0.0, 0.0, 0.0
    for e in escenas:
        if e.get('final'):
            break
        if e.get('voz'):
            d = medir(e['voz']); peor = max(peor, t - ultimo); habla += d; ultimo = t + d
        t += e['dur']
    return habla, t, max(peor, t - ultimo)


def volumen_efectos(ruta, pico=0.42):
    """El `volumen` (RMS) que hay que pedirle a comercial.py para que el golpe más fuerte de la pista de efectos quede
    en `pico`: los efectos son golpes sueltos, y con el volumen de una música sonarían a tope."""
    crudo = subprocess.run([comercial.FF, '-loglevel', 'error', '-i', ruta, '-f', 's16le', '-ac', '1', '-ar', str(comercial.SR), '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(crudo, dtype=np.int16).astype(np.float32) / 32768
    return round(float(pico * np.sqrt(np.mean(x ** 2)) / max(1e-6, np.abs(x).max())), 5)


def guion_completo(lang, escenas, clave, volumen):
    tx = TX[lang]
    return {
        # el japonés en PixelMplus12 (kanji de 11), no en Misaki (kanji de 7: manchas); ver comercial.pixel()
        'fuente': 'pixel-ja12' if lang == 'ja' else 'pixel', 'voz': VOZ[lang][0], 'idioma': VOZ[lang][1],
        'presentadora': {'nombre': 'LeIA', 'caras': 'avatar'},
        'colores': {'fondo': '#000000', 'acento': ACENTO, 'texto': '#ffffff', 'tenue': '#9a9aa8', 'sobre_acento': '#000000', 'borde': '#3a3a48'},
        'marca': {'logo': 'kazan/logo.png', 'logo_ancho': 684, 'lema': tx['marca'][0], 'sitio': 'kazan.dailychallenge.click', 'pie': tx['marca'][1]},
        'formato': 'horizontal', 'acercamiento': False,
        'salida': f'~/Documents/ayotl/tools/comerciales/salida/{clave}.mp4',
        # Kazan no tiene música: de fondo van sólo los efectos del juego, que bajan cuando habla LeIA
        'musica': {'archivo': f'{CARPETA}/efectos.wav', 'desde': 0, 'volumen': volumen, 'agacha': 0.55},
        'marcador': f'{CARPETA}/marcador-{lang}.json',
        'escenas': escenas,
    }


# ---------------------------------------------------------------------------------------------------- YouTube
def entrada(p, lang, clave, publicar):
    L = p.L; n = p.N; kc = p.conquistas(); conq = sum(kc.values()); sb = sum(1 for s in p.S if s['tipo'] == 'sin_base')
    mud = sum(1 for s in p.S if s['tipo'] == 'base_nueva'); mins = round(p.fin['tick'] / 600); em = L['minutos'] // 4   # la erupción, al 25 %
    nes = NUM['es'][n] if n < 17 else str(n); nen = NUM['en'][n] if n < 17 else str(n)
    w = lambda k, l: NUM[l][k] if k < 17 else str(k)
    if lang == 'es':
        isla = {'bosque': 'de bosque', 'nieve': 'nevada', 'desierto': 'de desierto', 'pantano': 'de pantano'}[L['bioma']]
        titulo = f'KAZAN: {n} computadoras, una isla {isla} y un volcán que se lo come todo (partida completa)'
        desc = (f'{nes.capitalize()} naciones jugadas por la computadora en una isla {isla}: construyen, entrenan ejércitos y se conquistan unas a otras, '
                f'y a los {w(em, "es")} minutos de juego despierta el volcán. LeIA comenta la partida completa: {w(conq, "es")} conquistas, {w(sb, "es")} bases tragadas por la lava, '
                f'{w(mud, "es")} bases fundadas lejos para huir de ella, y una sola nación en pie después de {mins} minutos de juego. '
                'A los lados van las naciones con sus puntos, sus tropas y sus edificios. El sonido es el del juego: efectos, sin música.\n\n'
                'Kazan es estrategia en tiempo real con estilo retro: levanta tu ciudad, arma tu ejército y escapa de la lava. '
                'Se juega solo contra la computadora, en salas con amigos o en el reto de la isla, en línea.\n\n'
                'LeIA es la presentadora de los juegos de Ayotl.')
        etiquetas = ['Kazan', 'estrategia en tiempo real', 'RTS', 'juego retro', 'pixel art', 'CPU vs CPU', 'volcán', 'partida completa', 'indie game', 'Daily Challenge']
        cierre = '#Kazan #Estrategia #RTS #RetroGaming #Videojuegos #IndieGame'
    elif lang == 'en':
        isla = {'bosque': 'forest', 'nieve': 'snowy', 'desierto': 'desert', 'pantano': 'swamp'}[L['bioma']]
        titulo = f'KAZAN: {n} computers, a {isla} island and a volcano that eats it all (full match)'
        desc = (f'{nen.capitalize()} nations played by the computer on a {isla} island: they build, train armies and conquer each other, '
                f'and {w(em, "en")} minutes into the game the volcano wakes up. With LeIA\'s commentary on the full match: {w(conq, "en")} conquests, {w(sb, "en")} bases swallowed by the lava, '
                f'{w(mud, "en")} bases founded far away to escape it, and a single nation left standing after {mins} minutes of play. '
                "The nations are on the sides, with their points, troops and buildings. The sound is the game's own: effects, no music.\n\n"
                'Kazan is real-time strategy with a retro look: build your city, raise your army and escape the lava. '
                'Play solo against the computer, in rooms with friends, or in the online island challenge.\n\n'
                "LeIA is the host of Ayotl's games.")
        etiquetas = ['Kazan', 'real-time strategy', 'RTS', 'retro games', 'pixel art', 'CPU vs CPU', 'volcano', 'full match', 'indie game']
        cierre = '#Kazan #RTS #Strategy #RetroGaming #IndieGame'
    else:
        isla = TX['ja']['isla'][L['bioma']]
        titulo = f'KAZAN: コンピューター{n}か国、{isla}、すべてをのみこむ火山（フル対戦）'
        desc = (f'{isla}で、コンピューターが動かす{n}か国が都市を建て、軍を育て、たがいに征服しあいます。そしてゲーム時間{em}分で火山が目を覚まします。'
                f'LeIAがフル対戦を実況：征服{conq}回、溶岩にのまれた本拠地{sb}つ、溶岩から逃げて建て直した本拠地{mud}つ、そしてゲーム時間{mins}分で残るのは1か国だけ。'
                '画面の左右には、各国のポイント・兵・建物。音はゲームの効果音だけで、音楽はありません。\n\n'
                'Kazanはレトロな見た目のリアルタイムストラテジー：都市を築き、軍を育て、溶岩から逃げろ。'
                'コンピューターとの対戦、友だちとのルーム、オンラインの「島のチャレンジ」で遊べます。\n\n'
                'LeIAはAyotlのゲームの案内役です。')
        etiquetas = ['Kazan', 'リアルタイムストラテジー', 'RTS', 'CPU対CPU', 'レトロゲーム', '火山', 'フル対戦']
        cierre = '#Kazan #RTS #レトロゲーム #インディーゲーム'
    v = {'clave': clave, 'app': 'kazan', 'video': f'salida/{clave}.mp4', 'miniatura': f'salida/{clave}.jpg', 'categoria': '20',
         'publicar': f'{publicar}T{HORA[lang]}:00-06:00', 'titulo': titulo, 'descripcion': desc, 'cierre': cierre, 'etiquetas': etiquetas}
    if lang != 'es':
        v['idioma'] = lang
    return v


def miniatura(p, lang, clave):
    import miniaturas
    from PIL import ImageFont
    if lang == 'ja':   # el japonés en PixelMplus12, como en el vídeo (Misaki deja los kanji en manchas); sólo en este proceso
        latina = miniaturas.pixel
        miniaturas.pixel = lambda tam, texto: (ImageFont.truetype(comercial.PIXELMPLUS, max(12, round(tam * 1.15 / 12) * 12))
                                               if any(ord(ch) > 0x2E7F for ch in texto) else latina(tam, texto))
    # el fondo: la vista general con media isla en lava (sólo el mundo, sin las barras del juego); si no hay, la erupción
    tm = next((x for x in p.L['tomas'] if x['tipo'] == 'lava50'), None) or next((x for x in p.L['tomas'] if x['tipo'] == 'lava25'), None)
    t = (tm['desde'] + tm['hasta']) / 2 if tm else p.erupcion + 2
    arriba, abajo = (56, 160) if lang == 'ja' else (40, 136)   # las barras del juego a 4x (en japonés, 14 y 40 px)
    fondo = miniaturas.cuadro(os.path.join(AQUI, CARPETA, lang, 'largo.mp4'), t, (0, arriba, 1280, 720 - abajo))
    n = p.N
    titulo = {'es': f'{n} NACIONES\n1 VOLCÁN', 'en': f'{n} NATIONS\n1 VOLCANO', 'ja': f'{n}か国\n火山ひとつ'}[lang]
    sub = {'es': 'sólo queda una · partida completa', 'en': 'only one survives · full match', 'ja': '残るのは1か国・フル対戦'}[lang]
    miniaturas.juego(clave, fondo, titulo, sub, 'sorpresa', comercial.color(ACENTO), logo='kazan/logo.png')


# ---------------------------------------------------------------------------------------------------- main
def grabar(a, lang, parte, dir_):
    print(f'  grabando {parte} en {lang} (kazan-cpu/grabar-cpu.mjs)…', flush=True)
    env = dict(os.environ, KAZAN_SEMILLA=str(a.semilla), KAZAN_BIOMA=a.bioma, KAZAN_NACIONES=str(a.naciones), KAZAN_MINUTOS=str(a.minutos),
               KAZAN_ESCALA='4', KAZAN_LARGA='1', KAZAN_IDIOMA=lang, KAZAN_SALIDA=dir_)
    r = subprocess.run(['node', os.path.join(AQUI, 'kazan-cpu', 'grabar-cpu.mjs'), parte], env=env, capture_output=True, text=True)
    if r.returncode or 'DISTINTA' in r.stdout or 'ffmpeg falló' in r.stdout:
        sys.exit(f'la grabación falló:\n{(r.stdout + r.stderr)[-1500:]}')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--semilla', type=int, default=2); ap.add_argument('--bioma', default='nieve')
    ap.add_argument('--naciones', type=int, default=8); ap.add_argument('--minutos', type=int, default=20)
    ap.add_argument('--publicar')
    ap.add_argument('--idiomas', default='es,en,ja')
    ap.add_argument('--seco', action='store_true')
    ap.add_argument('--solo-plan', action='store_true', help='no arma los vídeos (ya están en salida/): sólo escribe youtube.json')
    a = ap.parse_args()
    idiomas = a.idiomas.split(',')
    base = os.path.join(AQUI, CARPETA)
    # para el guion (--seco) y para el plan (--solo-plan) basta la escaleta: las grabaciones se pueden borrar cuando los
    # vídeos ya están armados (ocupan 130 MB por idioma y se rehacen solas, unos 13 min cada una)
    for lang in ['es'] + [l for l in idiomas if l != 'es']:   # la española siempre: de ahí salen los tiempos
        dir_ = os.path.join(base, lang)
        hace_falta = 'escaleta.json' if a.seco or a.solo_plan or lang not in idiomas else 'largo.mp4'
        if not os.path.exists(os.path.join(dir_, hace_falta)):
            grabar(a, lang, 'largo', dir_)
    if not (a.seco or a.solo_plan) and not os.path.exists(os.path.join(base, 'efectos.wav')):
        grabar(a, 'es', 'sonido', base)
    esc = cargar(os.path.join(base, 'es', 'escaleta.json'))
    L = esc['larga']
    if (L['semilla'], L['bioma'], len(L['naciones']), L['minutos']) != (a.semilla, a.bioma, a.naciones, a.minutos):
        sys.exit(f"la grabación de {CARPETA}/ es otra partida ({L['bioma']}, semilla {L['semilla']}, {len(L['naciones'])} naciones): bórrala o cambia los parámetros")
    p = Partida(esc)
    print(f"{L['bioma']}, semilla {L['semilla']}, {p.N} naciones: {L['segundos']} s de vídeo, acaba a los {p.fin['juego']} de juego ({p.fin['motivo']}), "
          f"gana {NACION['es']['dice'][p.gana][0]} con {p.puntos_fin} puntos")
    volumen = volumen_efectos(os.path.join(base, 'efectos.wav')) if os.path.exists(os.path.join(base, 'efectos.wav')) else 0.02
    plan_ruta = os.path.join(AQUI, 'youtube.json')
    with tempfile.TemporaryDirectory() as tmp:
        os.chmod(tmp, 0o700)
        cab = os.path.join(tmp, 'h.txt')
        with open(cab, 'w') as h:
            h.write(f'X-Goog-Api-Key: {comercial.clave()}\n')
        os.chmod(cab, 0o600)
        for lang in idiomas:
            esc_l = cargar(os.path.join(base, lang, 'escaleta.json'))['larga']
            if [(s['t'], s['tipo']) for s in esc_l['sucesos']] != [(s['t'], s['tipo']) for s in L['sucesos']]:
                sys.exit(f'la grabación en {lang} no es la misma partida que la española')
            json.dump(marcador(p, lang), open(os.path.join(base, f'marcador-{lang}.json'), 'w', encoding='utf-8'), ensure_ascii=False)
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
            clave = f'{CLAVE}{SUF[lang]}'
            escenas, usa = guion(p, lang, medir)
            g = guion_completo(lang, escenas, clave, volumen)
            ruta = os.path.join(AQUI, f'{clave}.json')
            json.dump(g, open(ruta, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            habla, dura, peor = silencios(escenas, medir)
            print(f'  {lang}: {len(escenas)} escenas, LeIA habla {habla:.0f} de {dura:.0f} s de partida ({100 * habla / max(1, dura):.0f} %), '
                  f'el silencio más largo {peor:.1f} s -> {os.path.relpath(ruta, AQUI)}', flush=True)
            if a.seco:
                v = entrada(p, lang, clave, a.publicar or 'AAAA-MM-DD')
                print(f"    título: {v['titulo']}\n    descripción: " + v['descripcion'].replace('\n', '\n      '))
                continue
            if not a.solo_plan:
                r = subprocess.run([PY, os.path.join(AQUI, 'comercial.py'), ruta], capture_output=True, text=True)
                print(' ', (r.stdout + r.stderr).strip().replace('\n', '\n  '), flush=True)
                if r.returncode:
                    sys.exit(f'comercial.py falló en {lang}')
                miniatura(p, lang, clave)
            elif not os.path.exists(os.path.join(AQUI, 'salida', f'{clave}.mp4')):
                sys.exit(f'falta salida/{clave}.mp4: ármalo antes de --solo-plan')
            if not a.publicar:
                continue
            v = entrada(p, lang, clave, a.publicar)
            plan = cargar(plan_ruta)
            if any(x['clave'] == clave and x.get('id') for x in plan):
                print(f'  plan: {clave} ya está subido; no se toca'); continue
            plan = [x for x in plan if x['clave'] != clave] + [v]
            json.dump(plan, open(plan_ruta, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            print(f"  plan: {clave} sale el {v['publicar']}")


if __name__ == '__main__':
    main()
