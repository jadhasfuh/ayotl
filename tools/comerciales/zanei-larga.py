#!/usr/bin/env python3
"""La partida larga de ZANEI para YouTube: el ACTO I del arcade (los niveles 1 a 4 seguidos, sin continuar) jugado
de principio a fin por el bot que esquiva, narrado por LeIA (21-nov-2026).

Es la tercera de la rotación de partidas largas (Adrián, 9-nov: War Zone → Kazan → ZANEI → maratón de Daily Challenge),
hecha a imagen de kazan-larga.py, con una diferencia: ZANEI es vertical. El juego va en medio a toda la altura (608x1080),
sin nada encima (la nave va abajo, donde el cuadro de diálogo de siempre la taparía); LeIA habla en un cuadro alto a la
derecha y a la izquierda va el marcador (comercial.py: escenas `vertical`, marcador_zanei).

  PY="$HOME/Documents/code challenge/.venv/bin/python"
  "$PY" tools/comerciales/zanei-larga.py [--semilla 7 --acto 1] [--idiomas es,en,ja] [--seco] [--publicar 2026-11-25] [--solo-plan]

Para escoger la partida, en zanei: node tools/partida-larga.mjs buscar --acto 1 --semillas 1-30 (6 s; cada fila dice si el
bot completa el acto, cuánto tarda y dónde pierde las naves). La del 21-nov: semilla 7, 8:22 de partida, las seis armas
especiales, seis bombas, cuatro naves perdidas (una en cada nivel) y cinco ganadas.

1. La partida: zanei/tools/partida-larga.mjs grabar la graba cuadro a cuadro, sin tiempo real, en zanei-larga/<idioma>/
   (largo.mp4 a 720x1280 sin sonido, y escaleta.json), una vez por idioma: los letreros del juego salen en el idioma del
   vídeo y la partida es la misma tick por tick (se comprueba). La española trae además sonido.wav: la música (barroca y
   clásica, de partitura, del propio juego) y los efectos, grabados con las funciones del juego en el tick en que pasa
   cada cosa. Si ya está grabada, no se graba. La carpeta zanei-larga/ no entra a git.
2. El marcador de la izquierda (zanei-larga/marcador-<idioma>.json): los cuatro niveles del acto, los puntos, las naves,
   las bombas, el arma con su potencia y la vida del jefe.
3. Lo que dice LeIA (Adrián, 1-nov: «que hable casi todo el tiempo»): en cuanto pasa, cada nave perdida, las naves
   extra, las armas que coge y cuando se le acaban, las bombas, los mini-jefes, el ALERTA de cada jefe, cómo le va y
   cuando cae, cada nivel nuevo con su música; cada minuto y pico, cómo va; y en los huecos, cómo se juega ZANEI, datos
   del juego y del estudio y chistes malos de IA, sin repetir. Nada de la historia más allá de lo que cuenta el
   tráiler (una piloto sin cuerpo contra formas geométricas). Al final, la ficha del acto; en la tarjeta, dónde jugar
   gratis y que se suscriban. No se le pide nada a la API: todo está escrito aquí, comprobado contra el juego.
4. comercial.py arma salida/zanei-larga[-en|-ja].mp4 (con capítulos); la miniatura, miniaturas.juego() con tres cuadros
   de jefes, y la entrada de youtube.json el día --publicar a las 18:00 (es), 18:20 (en) y 18:40 (ja).
--seco escribe los guiones y dice cuánto habla LeIA (y el título y la descripción), sin armar vídeos ni tocar
youtube.json; sin --publicar arma los vídeos sin tocar youtube.json, y --solo-plan --publicar AAAA-MM-DD sólo escribe
youtube.json (con los vídeos ya armados y revisados).
"""
import argparse, bisect, importlib.util, json, os, re, subprocess, sys, tempfile, time

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import comercial   # narrar(): la misma voz y la misma caché que el vídeo, para medir cuánto dura cada frase

_spec = importlib.util.spec_from_file_location('warzone_4cpu', os.path.join(AQUI, 'warzone-4cpu.py'))
wz = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(wz)
marcas, par, marcar, trozos = wz.marcas, wz.par, wz.marcar, wz.trozos
PY, SUF, HORA, VOZ, NUM = wz.PY, wz.SUF, wz.HORA, wz.VOZ, wz.NUM

ZANEI = os.path.expanduser('~/Documents/zanei')
CARPETA = 'zanei-larga'
CLAVE = 'zanei-larga'
TPS = 60
PAUSA = 0.2             # s de silencio extra después de un dato o un chiste (además de comercial.RESPIRO)
CADA = 75               # s: cada cuánto dice cómo va
ACENTO = '#6ef5ff'      # el cian de ZANEI (el del tráiler)
NAVE_EXTRA = [20000, 150000, 300000, 500000, 750000, 1000000]   # sim.js

# las armas (www/game/armas.js): nombre en el juego, cómo lo dice la voz y el color
ARMAS = {
    'vulcano': ({'es': ('VULCANO', 'Vulcano'), 'en': ('VULCAN', 'Vulcan'), 'ja': ('バルカン', 'バルカン')}, '#ffffff'),
    'dispersion': ({'es': ('DISPERSION', 'Dispersión'), 'en': ('SPREAD', 'Spread'), 'ja': ('スプレッド', 'スプレッド')}, '#ffd166'),
    'laser': ({'es': ('LASER', 'Láser'), 'en': ('LASER', 'Laser'), 'ja': ('レーザー', 'レーザー')}, '#6ef5ff'),
    'misiles': ({'es': ('MISILES', 'Misiles'), 'en': ('MISSILES', 'Missiles'), 'ja': ('ミサイル', 'ミサイル')}, '#ff8c42'),
    'onda': ({'es': ('ONDA', 'Onda'), 'en': ('WAVE', 'Wave'), 'ja': ('ウェーブ', 'ウェーブ')}, '#c77dff'),
    'cadena': ({'es': ('CADENA', 'Cadena'), 'en': ('CHAIN', 'Chain'), 'ja': ('チェイン', 'チェイン')}, '#7dffb0'),
    'rebote': ({'es': ('REBOTE', 'Rebote'), 'en': ('RICOCHET', 'Ricochet'), 'ja': ('リコシェ', 'リコシェ')}, '#4f9fff'),
}
# cómo dice la voz los nombres de los niveles y de los jefes (en pantalla van como en el juego, en mayúsculas y sin acentos)
VOZ_NOMBRE = {'es': {'CIUDAD': 'Ciudad', 'CARRETERA': 'Carretera', 'MAR': 'Mar', 'BASE': 'Base', 'NODRIZA': 'Nodriza', 'ACORAZADO': 'Acorazado', 'BOYA': 'Boya', 'CENTINELA': 'Centinela'},
              'en': {'CITY': 'City', 'HIGHWAY': 'Highway', 'SEA': 'Sea', 'BASE': 'Base', 'MOTHERSHIP': 'Mothership', 'IRONCLAD': 'Ironclad', 'BUOY': 'Buoy', 'SENTINEL': 'Sentinel'},
              'ja': {'都市': 'とし', '海': 'うみ', '基地': 'きち', '装甲艦': 'そうこうかん'}}
# lo que suena en cada nivel (las cabeceras de www/content/music/*.txt)
MUSICA = {
    'solfeggietto': {'es': 'el Solfeggietto de {Carl Philipp Emanuel Bach|Carl Philipp Emanuel Baj}, de 1766', 'en': 'the Solfeggietto by Carl Philipp Emanuel Bach, from 1766',
                     'ja': '{C.P.E.バッハ|カール・フィリップ・エマヌエル・バッハ}の「ソルフェッジェット」。1766年の曲'},
    'preludio-bwv847': {'es': 'el Preludio en do menor de {Johann Sebastian Bach|Johann Sebastian Baj}', 'en': 'the Prelude in C minor by Johann Sebastian Bach',
                        'ja': '{J.S.バッハ|ヨハン・ゼバスティアン・バッハ}の「前奏曲 ハ短調」'},
    'invierno': {'es': 'el Invierno de Vivaldi, de Las cuatro estaciones', 'en': "Vivaldi's Winter, from The Four Seasons", 'ja': 'ヴィヴァルディの「四季」から「冬」'},
    'patetica-1': {'es': 'la sonata Patética de Beethoven', 'en': "Beethoven's Pathétique sonata", 'ja': 'ベートーヴェンの「悲愴」ソナタ'},
}
T3 = lambda es, en, ja: {'es': es, 'en': en, 'ja': ja}
NIVELES = {1: [{'nombre': T3('CIUDAD', 'CITY', '都市'), 'jefe': T3('NODRIZA', 'MOTHERSHIP', 'マザーシップ'), 'musica': 'solfeggietto'},
               {'nombre': T3('CARRETERA', 'HIGHWAY', 'ハイウェイ'), 'jefe': T3('ACORAZADO', 'IRONCLAD', '装甲艦'), 'musica': 'preludio-bwv847'},
               {'nombre': T3('MAR', 'SEA', '海'), 'jefe': T3('BOYA', 'BUOY', 'ブイ'), 'musica': 'invierno'},
               {'nombre': T3('BASE', 'BASE', '基地'), 'jefe': T3('CENTINELA', 'SENTINEL', 'センチネル'), 'musica': 'patetica-1'}]}
MINI = {'carguero': {'es': ('CARGUERO', 'carguero'), 'en': ('CARRIER', 'carrier'), 'ja': ('輸送機', 'ゆそうき')},
        'fragata': {'es': ('FRAGATA', 'fragata'), 'en': ('FRIGATE', 'frigate'), 'ja': ('フリゲート', 'フリゲート')}}
MINI_PUNTOS = {'carguero': 1500, 'fragata': 1200}
FEMENINOS = ('NODRIZA', 'BOYA')   # los jefes que van en femenino en español

# ---------------------------------------------------------------------------------------------------- lo que dice
TX = {
    'es': {
        'leia': ('LeIA', 'Leia'), 'zn': ('ZANEI', 'Zanei'), 'noa': ('NOA', 'Noa'), 'acto': ('ACTO I', 'acto uno'),
        'sitio': ('dailychallenge.click/zanei', 'Daily Challenge punto click, diagonal, Zanei'),
        'intro': '¡Hola! Soy {leia}. Hoy, en {zn}: el {acto} del arcade completo. Cuatro niveles seguidos, jugados de principio a fin por la computadora.',
        'intro2': 'Sin trampas: si le dan, pierde la nave. Empieza con tres naves, tres bombas y el {vulcano}.',
        'lados': 'A la izquierda van los niveles, los puntos, las naves, las bombas y el arma. Y la música es la del nivel uno: {pieza}.',
        'nivel': ['¡Nivel {n}: {nivel}! Ahora suena {pieza}.', '¡Entra el nivel {n}, {nivel}! La música: {pieza}.', '¡Nivel {n}, el último del acto: {nivel}! Suena {pieza}.'],
        'muerte': ['¡Nos dieron! Transfiriendo memoria: {noa} salta a la siguiente nave. Le quedan {k}.',
                   '¡Ay, nave perdida! La mente de {noa} pasa a otra nave, y todo va a un tercio de velocidad mientras tanto. Quedan {k}.',
                   '¡Nave abajo! Baja un escalón la potencia, pero conserva el arma. Le quedan {k}.',
                   '¡Otra nave perdida! Ya van {perd} en el acto. Le quedan {k}.'],
        'muerte_ultima': '¡Nos dieron! Le queda una sola nave: ¡cuidado!',
        'muerte_corta': '¡Nave perdida! Quedan {k}.',
        'extra_puntos': '¡Nave extra, por pasar los {umbral} puntos! Ya tiene {k}.',
        'extra_item': ['¡Una nave de regalo! Ya tiene {k}.', '¡Otra nave extra! Van {k}.'],
        'arma': '¡Arma nueva: {arma}! {desc}',
        'arma_otra': '¡Cambia a {arma}! {desc}',
        'arma_fin': ['Se acabó la munición: vuelve el {vulcano}.', 'Sin munición especial: otra vez el {vulcano}, que no se acaba nunca.', 'Munición agotada: de vuelta al {vulcano}.'],
        'p4': ['¡Potencia al máximo! El P4 dura veinticinco segundos de fuego.', '¡Otra vez al P4! A aprovecharlo.', '¡De nuevo a toda potencia!', '¡P4! Ahora sí pega fuerte.'],
        'p': 'Sube la potencia: P{p}.',
        'f': ['¡La F! La potencia, al máximo de golpe.', '¡Otra F! Directo al P4.', '¡Y otra F: a toda potencia!'],
        'p_baja': 'Se gastó el P4: baja a P3.',
        'bomba': ['¡Bomba! El {pulso} borra todas las balas.', '¡Bomba! Mientras crece el anillo, no hay bala que la toque.', '¡Otra bomba! {quedan}',
                  '¡Bomba! Y la pantalla, limpia.', '¡Otro {pulso}! {quedan}', '¡Bomba salvadora!'],
        'quedan': lambda b: 'No le queda ninguna.' if b == 0 else 'Le queda una.' if b == 1 else f'Le quedan {NUM["es"][b]}.',
        'item_bomba': 'Una bomba más: ya tiene {b}.',
        'medalla1': 'Una medalla: si recoge varias seguidas, cada una vale el doble que la anterior.',
        'medalla5': '¡Cinco medallas seguidas! Desde ahora, cada una vale mil seiscientos.',
        'mini': {'carguero': ['¡Mini-jefe: un {mini}! Va soltando cazas.', '¡Otro {mini}! Mil quinientos puntos si cae.', '¡Vuelve el {mini}, con más cazas!', '¡El último {mini} del acto! ¿Caerá?'],
                 'fragata': ['¡Mini-jefe: una {mini}! Si cae, deja la F.', '¡Otra {mini}! Dispara en abanico y lanza misiles.', '¡{mini} a la vista! Ojo con el abanico.',
                             '¡La última {mini} del acto! Y otra F en juego.']},
        'mini_cae': {'carguero': ['¡Carguero abajo! Mil quinientos puntos.', '¡Cayó el carguero!', '¡Otro carguero menos!', '¡Y cayó el último carguero!'],
                     'fragata': ['¡Fragata abajo! Mil doscientos puntos.', '¡Cayó la fragata! Ahí va la F.', '¡Otra fragata menos!', '¡Y cayó la última fragata!']},
        'jefe': ['¡Alerta! Llega el jefe: {jefe}.', '¡Alerta! El jefe del nivel {n}: {jefe}.'],
        'jefe_fase': ['¡Se le rompe una parte: cambia de ataque!', '¡Pierde otra parte! El núcleo ya está más cerca.'],
        'jefe_vida': {50: '{al_jefe} le queda la mitad.', 25: '¡Ya casi! {al_jefe} le queda una cuarta parte.'},
        'jefe_cae': '¡{jefe}, {destruido}! Nivel {n} completo, con {p} puntos en este nivel.',
        'jefe_cae_corto': '¡{jefe}, {destruido}!',
        'hito': '¡Ya pasa de los {p} puntos!',
        'estado': 'Van {p} puntos, en el nivel {n} de cuatro, con {k} naves y {b}.',
        'fin': '¡{acto} completado! {p} puntos en total, con {bono} de bono por las {k} naves y las {b} bombas que sobraron.',
        'fin2': 'En {min} minutos perdió {perd} naves y ganó {extra}.',
        'cierre': ['¿Cuántos puntos harías tú?', '{zn} es gratis: en el navegador, en {sitio}, o en tu teléfono.', '¿Ya estás suscrito? Síguenos para más partidas como esta.'],
        'animo': ['¡Qué rápido!', '¡Cuidado!', '¡Ahí viene!', '¡Uy, cerca!', '¡Esquiva!', '¡Eso!', '¡Atención!', '¡Uf!', '¡Vamos!'],
        'cap': {'nivel': 'Nivel {n}: {nivel}', 'jefe': 'Jefe: {jefe}', 'final': 'Juega gratis'},
        'marcador': {'modo': 'ARCADE · ACTO I', 'puntos': 'PUNTOS', 'naves': 'NAVES', 'perdidas': 'PERDIDAS', 'bombas': 'BOMBAS', 'arma': 'ARMA', 'jefe': 'JEFE'},
        'marca': ('El vestigio de los ángeles', 'Gratis en el navegador y en tu teléfono'),
        'desc': {'dispersion': 'Un abanico de tres a siete balas.', 'laser': 'Un rayo que atraviesa: el mejor contra los jefes.', 'misiles': 'Buscan solos al enemigo más cercano.',
                 'onda': 'Un arco ancho y lento que atraviesa.', 'cadena': 'Un rayo que nunca falla y salta de un enemigo a otro, aunque pega poco.',
                 'rebote': 'Balas que rebotan dos veces en los bordes.'},
        'pulso': ('PULSO', 'Pulso'), 'vulcano': ('VULCANO', 'Vulcano'),
    },
    'en': {
        'leia': ('LeIA', 'Leia'), 'zn': ('ZANEI', 'Zanei'), 'noa': ('NOA', 'Noa'), 'acto': ('ACT I', 'Act One'),
        'sitio': ('dailychallenge.click/zanei', 'daily challenge dot click slash zanei'),
        'intro': "Hi! I'm {leia}. Today in {zn}: the whole of {acto} in arcade mode. Four levels in a row, played start to finish by the computer.",
        'intro2': 'No cheats: if it gets hit, it loses the ship. It starts with three ships, three bombs and the {vulcano}.',
        'lados': "On the left: the levels, the score, the ships, the bombs and the weapon. And the music is level one's: {pieza}.",
        'nivel': ['Level {n}: {nivel}! Now playing {pieza}.', 'Here comes level {n}, {nivel}! The music: {pieza}.', 'Level {n}, the last one of the act: {nivel}! Now playing {pieza}.'],
        'muerte': ["We're hit! Transferring memory: {noa} jumps to the next ship. {K} left.",
                   "Ouch, ship lost! {noa}'s mind moves to another ship, and everything runs at a third of the speed meanwhile. {K} left.",
                   'Ship down! The power drops one step, but the weapon stays. {K} left.',
                   'Another ship lost! That makes {perd} in this act. {K} left.'],
        'muerte_ultima': "We're hit! Only one ship left: careful!",
        'muerte_corta': 'Ship lost! {K} left.',
        'extra_puntos': 'Extra ship, for passing {umbral} points! Now it has {k}.',
        'extra_item': ['A free ship! Now it has {k}.', 'Another extra ship! That makes {k}.'],
        'arma': 'New weapon: {arma}! {desc}',
        'arma_otra': 'Switching to {arma}! {desc}',
        'arma_fin': ['Out of ammo: back to the {vulcano}.', 'No special ammo left: the {vulcano} again, which never runs out.', "That's all the ammo: the {vulcano} once more."],
        'p4': ['Full power! P4 lasts twenty-five seconds of firing.', 'Back to P4! Make it count.', 'Full power once again!', 'P4! Now it really hits hard.'],
        'p': 'Power up: P{p}.',
        'f': ['The F! Full power in one go.', 'Another F! Straight to P4.', 'And one more F: full power!'],
        'p_baja': 'P4 used up: back to P3.',
        'bomba': ['Bomb! The {pulso} wipes out every bullet.', 'Bomb! While the ring grows, no bullet can touch it.', 'Another bomb! {quedan}',
                  'Bomb! And the screen is clear.', 'One more {pulso}! {quedan}', 'Bomb, just in time!'],
        'quedan': lambda b: 'None left.' if b == 0 else f'{NUM["en"][b][:1].upper() + NUM["en"][b][1:]} left.',
        'item_bomba': 'One more bomb: now it has {b}.',
        'medalla1': 'A medal: pick up several in a row and each one is worth double the last.',
        'medalla5': 'Five medals in a row! From now on, each one is worth sixteen hundred.',
        'mini': {'carguero': ['Mini-boss: a {mini}! It keeps dropping fighters.', 'Another {mini}! Fifteen hundred points if it goes down.', 'The {mini} is back, with more fighters!', "The act's last {mini}! Will it fall?"],
                 'fragata': ['Mini-boss: a {mini}! If it goes down, it drops the F.', 'Another {mini}! It fires in a fan and launches missiles.', '{mini} ahead! Watch out for the fan of shots.',
                             "The act's last {mini}! And one more F up for grabs."]},
        'mini_cae': {'carguero': ['Carrier down! Fifteen hundred points.', 'The carrier falls!', 'One less carrier!', "And that's the last carrier!"],
                     'fragata': ['Frigate down! Twelve hundred points.', 'The frigate falls! There goes the F.', 'One less frigate!', "And that's the last frigate!"]},
        'jefe': ['Warning! The boss is here: {jefe}.', 'Warning! The level {n} boss: {jefe}.'],
        'jefe_fase': ['A part breaks off: it switches attacks!', 'Another part gone! The core is getting closer.'],
        'jefe_vida': {50: 'The {jefe} is down to half.', 25: 'Almost there! The {jefe} has a quarter left.'},
        'jefe_cae': '{jefe}, destroyed! Level {n} cleared, with {p} points in this level.',
        'jefe_cae_corto': '{jefe}, destroyed!',
        'hito': 'Past {p} points already!',
        'estado': '{p} points so far, on level {n} of four, with {k} ships and {b}.',
        'fin': '{acto} cleared! {p} points in total, with a {bono} bonus for the {k} ships and {b} bombs left over.',
        'fin2': 'In {min} minutes it lost {perd} ships and won {extra}.',
        'cierre': ['How many points would you score?', '{zn} is free: in your browser at {sitio}, or on your phone.', 'Are you subscribed yet? Follow us for more runs like this one.'],
        'animo': ['So fast!', 'Careful!', 'Here it comes!', 'Ooh, close!', 'Dodge!', 'Yes!', 'Heads up!', 'Phew!', 'Come on!'],
        'cap': {'nivel': 'Level {n}: {nivel}', 'jefe': 'Boss: {jefe}', 'final': 'Play free'},
        'marcador': {'modo': 'ARCADE · ACT I', 'puntos': 'SCORE', 'naves': 'SHIPS', 'perdidas': 'LOST', 'bombas': 'BOMBS', 'arma': 'WEAPON', 'jefe': 'BOSS'},
        'marca': ('Vestige of the angels', 'Free in the browser and on your phone'),
        'desc': {'dispersion': 'A fan of three to seven shots.', 'laser': 'A beam that pierces through: the best against bosses.', 'misiles': 'They home in on the nearest enemy.',
                 'onda': 'A wide, slow arc that passes through.', 'cadena': 'A bolt that never misses and jumps from enemy to enemy, though it hits softly.',
                 'rebote': 'Shots that bounce off the edges twice.'},
        'pulso': ('PULSE', 'Pulse'), 'vulcano': ('VULCAN', 'Vulcan'),
    },
    'ja': {
        'leia': ('LeIA', 'レイア'), 'zn': ('ZANEI', 'ザンエイ'), 'noa': ('NOA', 'ノア'), 'acto': ('第1幕', 'だいいちまく'),
        'sitio': ('dailychallenge.click/zanei', 'デイリーチャレンジ・ドット・クリック・スラッシュ・ザンエイ'),
        'intro': 'こんにちは！{leia}です。今日の{zn}は、アーケードの{acto}をまるごと。4ステージ連続で、最初から最後までコンピューターが遊びます。',
        'intro2': 'ズルはなし。弾に当たれば機体を失います。スタートは機体3つ、ボム3つ、武器は{vulcano}。',
        'lados': '左側には、ステージ、スコア、機体、ボム、武器。BGMはステージ1の曲、{pieza}です。',
        'nivel': ['ステージ{n}、{nivel}！BGMは{pieza}。', 'ステージ{n}、{nivel}に突入！曲は{pieza}。', 'ステージ{n}、この幕の最後、{nivel}！BGMは{pieza}。'],
        'muerte': ['やられた！記憶を転送中。{noa}の意識は次の機体へ。残り{k}機。',
                   'あっ、機体を失いました！{noa}の意識が別の機体に移るあいだ、ゲームは3分の1の速さになります。残り{k}機。',
                   '被弾！パワーは1段階下がりますが、武器はそのまま。残り{k}機。',
                   'また機体を失いました！この幕で{perd}機目。残り{k}機。'],
        'muerte_ultima': 'やられた！残りは最後の1機。気をつけて！',
        'muerte_corta': '機体を失いました！残り{k}機。',
        'extra_puntos': 'エクステンド！{umbral}点を超えました。これで{k}機。',
        'extra_item': ['機体のプレゼント！これで{k}機。', 'また機体が増えました！{k}機です。'],
        'arma': '新しい武器、{arma}！{desc}',
        'arma_otra': '{arma}に持ちかえ！{desc}',
        'arma_fin': ['弾切れ。{vulcano}にもどります。', '特殊武器の弾がなくなりました。また{vulcano}。こちらは弾切れなしです。', '弾を使いきって、また{vulcano}。'],
        'p4': ['パワー最大！最大パワーは、撃ちつづけて25秒もちます。', 'またパワー最大！今のうちです。', 'もう一度、フルパワー！', 'パワー最大！火力じゅうぶん。'],
        'p': 'パワーアップ。パワー{p}。',
        'f': ['Fを取った！一気にパワー最大です。', 'またF！すぐにパワー最大。', 'もうひとつF！パワー全開です。'],
        'p_baja': '最大パワーを使いきって、パワー3にもどりました。',
        'bomba': ['ボム！{pulso}が敵の弾をぜんぶ消します。', 'ボム！リングが広がるあいだ、弾は当たりません。', 'またボム！{quedan}',
                  'ボム！弾がきれいに消えました。', 'もう一発、{pulso}！{quedan}', 'ボムで切りぬけた！'],
        'quedan': lambda b: 'もう残っていません。' if b == 0 else f'残り{b}つ。',
        'item_bomba': 'ボムがひとつ増えました。これで{b}つ。',
        'medalla1': '勲章です。続けて取ると、1つごとに点数が倍になります。',
        'medalla5': '勲章を5つ連続！ここからは1つ1600点です。',
        'mini': {'carguero': ['中ボス、{mini}！戦闘機を次々に出してきます。', 'また{mini}！倒せば1500点。', '{mini}がまた登場！戦闘機に注意。', 'この幕、最後の{mini}！落とせるか？'],
                 'fragata': ['中ボス、{mini}！倒すとFを落とします。', 'また{mini}！扇形に撃って、ミサイルも撃ってきます。', '{mini}が来た！扇形の弾に注意。', 'この幕、最後の{mini}！またFがねらえます。']},
        'mini_cae': {'carguero': ['輸送機を撃破！1500点。', '輸送機を落とした！', 'また輸送機を撃破！', '最後の輸送機も撃破！'],
                     'fragata': ['フリゲートを撃破！1200点。', 'フリゲートを落とした！Fが出ます。', 'またフリゲートを撃破！', '最後のフリゲートも撃破！']},
        'jefe': ['警告！ボス、{jefe}の登場です。', '警告！ステージ{n}のボス、{jefe}！'],
        'jefe_fase': ['パーツがこわれて、攻撃が変わります！', 'またパーツを破壊！核まで、あと少し。'],
        'jefe_vida': {50: '{jefe}の体力は、あと半分。', 25: 'もう少し！{jefe}の体力は、残り4分の1。'},
        'jefe_cae': '{jefe}、撃破！ステージ{n}クリア。このステージで{p}点。',
        'jefe_cae_corto': '{jefe}、撃破！',
        'hito': 'スコアが{p}点を超えました！',
        'estado': 'いま{p}点。ステージ{n}で、機体は{k}機、ボムは{b}つ。',
        'fin': '{acto}クリア！合計{p}点。残った機体{k}機とボム{b}つで、ボーナス{bono}点です。',
        'fin2': '{min}分で、失った機体は{perd}機、増えた機体は{extra}機。',
        'cierre': ['あなたなら何点取れる？', '{zn}は無料。ブラウザなら{sitio}、スマホでも遊べます。', 'チャンネル登録はもうした？こういうプレイをもっと見たいなら、フォローしてね！'],
        'animo': ['速い！', 'あぶない！', '来るよ！', 'うわ、ギリギリ！', 'よけて！', 'よし！', '気をつけて！', 'ふう！', 'がんばれ！'],
        'cap': {'nivel': 'ステージ{n}：{nivel}', 'jefe': 'ボス：{jefe}', 'final': '無料で遊ぶ'},
        'marcador': {'modo': 'アーケード・第1幕', 'puntos': 'スコア', 'naves': '機体', 'perdidas': '失った', 'bombas': 'ボム', 'arma': '武器', 'jefe': 'ボス'},
        'marca': ('天使の残影', 'ブラウザとスマホで無料'),
        'desc': {'dispersion': '3〜7発の弾が扇形に広がります。', 'laser': '貫通するビーム。ボス戦でいちばん強い武器です。', 'misiles': 'いちばん近い敵を自動で追いかけます。',
                 'onda': '幅の広い、ゆっくりした波。敵を貫通します。', 'cadena': '絶対に外れない電撃が、敵から敵へ飛び移ります。威力は低め。',
                 'rebote': '画面の端で2回はね返る弾です。'},
        'pulso': ('パルス', 'パルス'), 'vulcano': ('バルカン', 'バルカン'),
    },
}

# Lo que dice en los huecos, en este orden, sin repetir. `cara` de LeIA; `tras`: sólo después del primer suceso de ese
# tipo; `antes`: sólo antes. Todo sale del juego tal como está en la 1.0.14 (docs/MODOS.md, www/game/*.js,
# www/core/*.js, las cabeceras de www/content/music/), comprobado el 21-nov-2026: si algo cambia allá, cambiarlo aquí.
# Nada de la historia más allá del tráiler.
DATOS = [
    {'cara': 'normal', 'es': '{zn} es una palabra japonesa: significa «vestigio», la imagen que queda.', 'en': '{zn} is a Japanese word: it means "vestige", the image that lingers.',
     'ja': '{zn}は、日本語の「残影」。あとに残るイメージ、という意味です。'},
    {'cara': 'feliz', 'es': 'Es un shoot \'em up vertical, de naves, con gráficos vectoriales: todo está hecho de líneas de neón, como en las recreativas de los ochenta.',
     'en': "It's a vertical shoot 'em up with vector graphics: everything is made of neon lines, like the arcades of the eighties.",
     'ja': '縦スクロールのシューティングで、グラフィックはベクター。80年代のアーケードのように、すべてネオンの線で描かれています。'},
    {'cara': 'normal', 'es': 'La piloto es {noa}: maneja naves sin tripulación a distancia. Cuando una cae, su mente salta a la siguiente.',
     'en': 'The pilot is {noa}: she flies unmanned ships remotely. When one goes down, her mind jumps to the next.',
     'ja': 'パイロットは{noa}。無人の機体を遠くから操縦します。機体が落ちると、意識は次の機体へ飛び移ります。'},
    {'cara': 'pensando', 'es': 'Aquí juega un bot que esquiva: mira las balas que vienen y busca el hueco menos peligroso. Es un piloto del montón, a propósito.',
     'en': "A dodging bot is playing here: it watches the incoming bullets and looks for the safest gap. It's an average pilot, on purpose.",
     'ja': 'ここで遊んでいるのは、よけるボット。飛んでくる弾を見て、いちばん安全なすき間をさがします。わざと、ふつうの腕前にしてあります。'},
    {'cara': 'normal', 'es': 'El vídeo va a velocidad real: así de rápido se juega.', 'en': 'The video runs at real speed: this is how fast it plays.', 'ja': 'この動画は等速です。実際にこの速さで遊びます。'},
    {'cara': 'guino', 'es': '¿Te cuento un chiste malo de IA? ¿Por qué los enemigos geométricos siempre pierden? Porque nunca encuentran el ángulo.',
     'en': "Want a bad AI joke? Why do geometric enemies always lose? They can never find the right angle.",
     'ja': 'AIのダジャレ、聞きたい？図形の敵が勝てないのはなぜ？いつも角が立つから。'},
    {'cara': 'pensando', 'es': 'Ojo con el punto blanco del centro de la nave: es lo único que cuenta. Si una bala toca el ala, no pasa nada.',
     'en': "Watch the white dot in the middle of the ship: it's the only part that counts. A bullet on the wing does nothing.",
     'ja': '機体のまん中の白い点に注目。当たり判定はそこだけです。翼に弾が当たっても、だいじょうぶ。'},
    {'cara': 'normal', 'es': 'Hay siete armas. El {vulcano} no se acaba nunca; las otras seis llegan en objetos y traen munición limitada.',
     'en': 'There are seven weapons. The {vulcano} never runs out; the other six come in pickups, with limited ammo.',
     'ja': '武器は7種類。{vulcano}は弾切れなし。ほかの6つはアイテムで手に入り、弾に限りがあります。'},
    {'cara': 'normal', 'es': 'La munición especial sólo se gasta mientras dispara: de veinte a treinta segundos de fuego, según el arma.',
     'en': 'Special ammo only runs down while firing: twenty to thirty seconds of fire, depending on the weapon.',
     'ja': '特殊武器の弾が減るのは、撃っているあいだだけ。武器によって、20秒から30秒ぶんです。'},
    {'cara': 'pensando', 'es': 'Lo que se destruye lejos, en el tercio del fondo de la pantalla, vale el doble.',
     'en': 'Anything destroyed far away, in the back third of the screen, is worth double.', 'ja': '画面の奥3分の1で倒した敵は、点数が2倍になります。'},
    {'cara': 'guino', 'es': 'Yo también transfiero mi memoria a otra nave… cada vez que me reinician.', 'en': 'I transfer my memory to another ship too… every time they reboot me.',
     'ja': 'わたしも記憶を転送しています。再起動されるたびにね。'},
    {'cara': 'normal', 'es': 'Las medallas valen cien, doscientos, cuatrocientos, ochocientos y mil seiscientos si se recogen seguidas sin perder la nave.',
     'en': 'Medals are worth one hundred, two hundred, four hundred, eight hundred and sixteen hundred if you grab them in a row without losing a ship.',
     'ja': '勲章は、機体を失わずに続けて取ると、100、200、400、800、1600点と上がっていきます。'},
    {'cara': 'normal', 'es': 'La potencia tiene cuatro escalones. Cada P sube uno, y el P4 se gasta con el fuego.',
     'en': 'Power has four steps. Each P raises it one, and P4 burns down as you fire.', 'ja': 'パワーは4段階。Pを取るたびに1段上がり、最大パワーは撃つほど減っていきます。'},
    {'cara': 'sorpresa', 'es': 'Cuando se pierde una nave, la siguiente aparece en el mismo sitio, invulnerable dos segundos y medio.',
     'en': 'When a ship is lost, the next one appears in the same spot, invulnerable for two and a half seconds.', 'ja': '機体を失うと、次の機体は同じ場所に現れて、2.5秒間は無敵です。'},
    {'cara': 'normal', 'es': 'Si al perder la nave le quedaban menos de tres bombas, vuelven a ser tres.',
     'en': 'If it had fewer than three bombs when the ship goes down, it gets back up to three.', 'ja': '機体を失ったとき、ボムが3つより少なければ、3つにもどります。'},
    {'cara': 'pensando', 'es': 'En los actos se conserva todo de un nivel al siguiente: los puntos, las naves, las bombas, el arma y la potencia.',
     'en': 'In the acts everything carries over from one level to the next: score, ships, bombs, weapon and power.',
     'ja': '「幕」のモードでは、スコア、機体、ボム、武器、パワーが、次のステージにそのまま引きつがれます。'},
    {'cara': 'feliz', 'es': 'Las naves extra por puntos llegan a los veinte mil, ciento cincuenta mil, trescientos mil, y así hasta el millón.',
     'en': 'Extra ships for points come at twenty thousand, a hundred and fifty thousand, three hundred thousand, and so on up to a million.',
     'ja': 'スコアによるエクステンドは、2万点、15万点、30万点…と、100万点まで続きます。'},
    {'cara': 'guino', 'es': 'Le pregunté al bot por qué no va por las medallas. Me dijo: estoy ocupado esquivando… responsabilidades.',
     'en': "I asked the bot why it doesn't go for the medals. It said: I'm busy dodging… responsibilities.",
     'ja': 'ボットに、どうして勲章を取りに行かないのか聞きました。答えは「よけるので忙しい。責任とかを」。'},
    {'cara': 'normal', 'es': 'Hay veinte tipos de enemigos: cazas, drones, interceptores, escoltas con escudo, tanques, torretas, lanzadores de misiles y bombarderos.',
     'en': 'There are twenty kinds of enemies: fighters, drones, interceptors, shielded escorts, tanks, turrets, missile launchers and bombers.',
     'ja': '敵は20種類。戦闘機、ドローン、迎撃機、シールド付きの護衛機、戦車、砲台、ミサイルランチャー、爆撃機…。'},
    {'cara': 'pensando', 'es': 'Los jefes están hechos de partes que se rompen por separado. El núcleo va blindado hasta que caen las de fuera.',
     'en': 'Bosses are made of parts that break off separately. The core stays armored until the outer ones fall.',
     'ja': 'ボスはパーツごとに壊れます。外側のパーツがなくなるまで、核はよろいで守られています。'},
    {'cara': 'normal', 'es': 'Hay tres familias de jefes: la nodriza, el anillo y el núcleo, cada uno con su nombre propio en cada nivel.',
     'en': 'There are three boss families: the mothership, the ring and the core, each with its own name on every level.',
     'ja': 'ボスは3系統。マザーシップ型、リング型、コア型。ステージごとに名前がちがいます。'},
    {'cara': 'sorpresa', 'es': 'El ritmo lo pone quien juega: si no queda ningún enemigo a la vista un segundo y medio, el nivel salta a lo siguiente.',
     'en': 'The player sets the pace: if no enemy is in sight for a second and a half, the level skips ahead.',
     'ja': 'テンポを決めるのはプレイヤー。敵が1.5秒いなくなると、ステージは次の場面へ進みます。'},
    {'cara': 'normal', 'es': 'También hay obstáculos del escenario que no se pueden romper: pilares, rocas, chatarra. Hay que esquivarlos.',
     'en': "There are also obstacles in the scenery that can't be destroyed: pillars, rocks, scrap. You have to dodge them.",
     'ja': '壊せない障害物もあります。柱、岩、スクラップ。よけるしかありません。'},
    {'cara': 'guino', 'es': 'Dicen que las IA vemos todo en vectores. Es verdad: hasta mis sentimientos tienen dirección y magnitud.',
     'en': "They say AIs see everything in vectors. It's true: even my feelings have direction and magnitude.",
     'ja': 'AIは何でもベクトルで見るって言われます。本当です。わたしの気持ちにも、向きと大きさがあります。'},
    {'cara': 'feliz', 'es': 'Toda la música es clásica, de compositores de dominio público, arreglada en electro por el estudio.',
     'en': 'All the music is classical, by public-domain composers, arranged as electro by the studio.', 'ja': '音楽はすべてクラシック。著作権の切れた作曲家の曲を、スタジオがエレクトロに編曲しました。'},
    {'cara': 'pensando', 'es': 'Y no hay archivos de música: el juego la toca con un chip de sonido hecho en código, a partir de una receta de texto.',
     'en': 'And there are no music files: the game plays it on a sound chip made in code, from a text recipe.', 'ja': 'しかも音楽ファイルはありません。ゲームが、テキストの楽譜から、コードで作った音源チップで演奏します。'},
    {'cara': 'normal', 'es': 'Las explosiones suenan un poco distinto cada vez: el tono cambia hasta un quince por ciento, para que cien no suenen a una.',
     'en': "Explosions sound a little different every time: the pitch shifts up to fifteen percent, so a hundred don't sound like one.",
     'ja': '爆発の音は毎回少しずつちがいます。音の高さを最大15パーセント変えて、100回の爆発が同じに聞こえないようにしています。'},
    {'cara': 'feliz', 'es': 'Cada línea deja un rastro, como el fósforo de los viejos monitores de vectores. Se puede apagar en las opciones.',
     'en': 'Every line leaves a trail, like the phosphor of old vector monitors. You can turn it off in the options.', 'ja': '線には残光があります。昔のベクターモニターの蛍光体みたいに。オプションで消せます。'},
    {'cara': 'normal', 'es': 'La cámara va detrás y encima de la nave, inclinada treinta grados.', 'en': 'The camera sits behind and above the ship, tilted thirty degrees.',
     'ja': 'カメラは機体の後ろ上方から、30度かたむけて見下ろしています。'},
    {'cara': 'guino', 'es': 'Mi arma favorita es la cadena: como yo, nunca falla… pero pega poco.', 'en': 'My favorite weapon is the chain: like me, it never misses… but it hits softly.',
     'ja': 'わたしの好きな武器はチェイン。わたしと同じで、絶対外さないけど、威力は低め。'},
    {'cara': 'normal', 'es': 'La bomba {pulso} es un anillo que crece durante un segundo y cuarto: borra las balas y a un jefe le quita entre el cinco y el diez por ciento.',
     'en': 'The {pulso} bomb is a ring that grows for a second and a quarter: it clears the bullets and takes five to ten percent off a boss.',
     'ja': 'ボムの{pulso}は、1.25秒かけて広がるリング。弾を消して、ボスの体力を5〜10パーセントけずります。'},
    {'cara': 'pensando', 'es': 'Caben hasta nueve naves y seis bombas.', 'en': 'It can hold up to nine ships and six bombs.', 'ja': '機体は9つまで、ボムは6つまで持てます。'},
    {'cara': 'normal', 'es': 'Al completar un acto, el bono da siete mil puntos por cada nave y dos mil por cada bomba que sobren.',
     'en': 'Clearing an act gives a bonus of seven thousand points per ship and two thousand per bomb left over.', 'ja': '幕をクリアすると、残った機体1つにつき7000点、ボム1つにつき2000点のボーナス。'},
    {'cara': 'feliz', 'es': 'En la historia, {noa} habla por radio mientras juegas. En el arcade no hay diálogos: puro juego.',
     'en': "In story mode, {noa} talks over the radio while you play. In arcade there's no dialogue: just the game.",
     'ja': 'ストーリーモードでは、プレイ中に{noa}が無線で話します。アーケードは会話なし。ゲームだけです。'},
    {'cara': 'normal', 'es': 'La historia tiene doce niveles en tres actos, con escenas dibujadas a línea. El acto uno es la superficie; el dos, el espacio.',
     'en': 'The story has twelve levels in three acts, with line-drawn scenes. Act one is the surface; act two, space.',
     'ja': 'ストーリーは3幕12ステージ。線画のシーンつき。第1幕は地上、第2幕は宇宙。'},
    {'cara': 'guino', 'es': '¿Y el acto tres? Ese no te lo cuento: juégalo.', 'en': 'And act three? Not telling: play it.', 'ja': '第3幕は？それはナイショ。遊んでみてね。'},
    {'cara': 'feliz', 'es': 'En el arcade también está la señal del día: una operación de tres minutos, distinta cada día y la misma para todo el mundo.',
     'en': "The arcade also has the daily signal: a three-minute operation, different every day and the same for everyone.",
     'ja': 'アーケードには「デイリーシグナル」もあります。3分間の作戦で、毎日ちがって、世界中のみんなが同じものを遊びます。'},
    {'cara': 'pensando', 'es': 'Algunos días la señal trae condición: sin bombas paga un veinte por ciento más, y con una sola nave, un cincuenta.',
     'en': 'Some days the signal comes with a condition: no bombs pays twenty percent more, and a single ship, fifty.',
     'ja': 'シグナルには条件つきの日もあります。ボムなしならスコア2割増し、機体1つなら5割増し。'},
    {'cara': 'normal', 'es': 'Y está la prueba larga: los doce niveles seguidos. Al bot que no muere le toma treinta y ocho minutos.',
     'en': "And there's the long one: all twelve levels in a row. The bot that never dies takes thirty-eight minutes.",
     'ja': 'さらに長いモードも。12ステージ連続です。死なないボットでも38分かかります。'},
    {'cara': 'feliz', 'es': 'El registro de servicio tiene dieciséis insignias, y el título de la piloto va de cadete a leyenda.',
     'en': "The service record has sixteen badges, and the pilot's title goes from cadet to legend.", 'ja': '「軍歴」には16個の記章。パイロットの称号は、候補生から伝説まで上がります。'},
    {'cara': 'normal', 'es': 'Hay ranking mundial: sólo tres iniciales, sin cuentas.', 'en': 'There is a world ranking: just three initials, no accounts.', 'ja': '世界ランキングもあります。イニシャル3文字だけで、アカウントはいりません。'},
    {'cara': 'guino', 'es': 'Mi récord personal es cero naves perdidas. Claro, nunca he jugado.', 'en': "My personal record is zero ships lost. Of course, I've never played.",
     'ja': 'わたしの自己ベストは、失った機体ゼロ。まあ、遊んだことないんですけどね。'},
    {'cara': 'normal', 'es': 'Hay dos dificultades: normal y difícil. La difícil se abre al terminar la historia.', 'en': 'There are two difficulties: normal and hard. Hard unlocks when you finish the story.',
     'ja': '難易度はノーマルとハードの2つ。ハードはストーリーをクリアすると選べます。'},
    {'cara': 'pensando', 'es': 'Esta partida es una simulación: con la misma semilla y los mismos movimientos, sale exactamente igual.',
     'en': 'This run is a simulation: with the same seed and the same moves, it plays out exactly the same.', 'ja': 'このプレイはシミュレーション。同じシードと同じ操作なら、まったく同じ展開になります。'},
    {'cara': 'normal', 'es': 'El juego da sesenta pasos por segundo.', 'en': 'The game runs sixty steps per second.', 'ja': 'ゲームは1秒に60ステップ進みます。'},
    {'cara': 'feliz', 'es': 'En el teléfono la nave se mueve arrastrando un dedo en cualquier parte de la pantalla: no salta al dedo.',
     'en': "On a phone you move the ship by dragging a finger anywhere on the screen: it doesn't jump to your finger.",
     'ja': 'スマホでは、画面のどこでも指をドラッグして動かします。機体が指の位置に飛ぶことはありません。'},
    {'cara': 'normal', 'es': 'Siempre se juega en vertical, como las recreativas de naves.', 'en': 'It is always played upright, like the old shooter arcade cabinets.', 'ja': 'いつも縦画面。昔のシューティングの筐体と同じです。'},
    {'cara': 'feliz', 'es': 'Funciona sin conexión: la red sólo sirve para el ranking y los anuncios.', 'en': 'It works offline: the network is only for the ranking and the ads.', 'ja': 'オフラインでも遊べます。ネットを使うのは、ランキングと広告だけ。'},
    {'cara': 'normal', 'es': 'No hay compras, ni monedas, ni tienda: sólo anuncios, y en el arcade nunca se revive viendo uno.',
     'en': 'No purchases, no coins, no shop: just ads, and in arcade you never revive by watching one.', 'ja': '課金もコインもショップもなし。広告だけで、アーケードでは広告を見て復活することもできません。'},
    {'cara': 'guino', 'es': '¿Qué le dijo el triángulo al cuadrado? Te veo muy cuadrado… ¡y él tan agudo!',
     'en': "What did the triangle say to the square? You're so square… and he was being so acute!",
     'ja': '三角形が四角形に言いました。「きみ、カタいね」。四角形は「きみこそ、とがってるね」。'},
    {'cara': 'normal', 'es': 'Está en español, inglés y japonés.', 'en': "It's in Spanish, English and Japanese.", 'ja': 'スペイン語、英語、日本語に対応しています。'},
    {'cara': 'feliz', 'es': 'Lo hace Ayotl, un estudio de una sola persona.', 'en': "It's made by Ayotl, a one-person studio.", 'ja': '作っているのはAyotl。ひとりだけのスタジオです。'},
    {'cara': 'normal', 'es': 'Al abrir el juego sale un aviso de fotosensibilidad, y hay una opción de destellos suaves.',
     'en': "There's a photosensitivity warning when the game opens, and an option for softer flashes.", 'ja': '起動時には光過敏の注意が出ます。フラッシュを弱くするオプションもあります。'},
    # los cortos, para los huecos chicos
    {'cara': 'normal', 'es': 'Un caza vale treinta puntos.', 'en': 'A fighter is worth thirty points.', 'ja': '戦闘機は30点。'},
    {'cara': 'normal', 'es': 'El P4 dura veinticinco segundos de fuego.', 'en': 'P4 lasts twenty-five seconds of fire.', 'ja': '最大パワーは25秒。'},
    {'cara': 'normal', 'es': 'El láser trae veinte segundos de munición.', 'en': 'The laser comes with twenty seconds of ammo.', 'ja': 'レーザーの弾は20秒ぶん。'},
    {'cara': 'normal', 'es': 'Se empieza con tres naves.', 'en': 'You start with three ships.', 'ja': 'スタートは機体3つ。'},
    {'cara': 'normal', 'es': 'Un misil enemigo derribado vale cincuenta.', 'en': 'A downed enemy missile is worth fifty.', 'ja': '敵のミサイルを撃ち落とすと50点。'},
    {'cara': 'normal', 'es': 'Cada nivel tiene dos mini-jefes.', 'en': 'Every level has two mini-bosses.', 'ja': '各ステージに中ボスが2体。'},
]


def cargar(ruta):
    return json.load(open(ruta, encoding='utf-8'))


# ---------------------------------------------------------------------------------------------------- la partida
class Partida:
    """La escaleta de zanei/tools/partida-larga.mjs: los ticks pasan a segundos del vídeo del juego (dos ticks por
    cuadro, 30 cuadros por segundo: el tick k se ve en el segundo k/60)."""

    def __init__(self, esc):
        self.esc = esc
        self.S = [dict(s, t=s['tick'] / TPS) for s in esc['sucesos']]
        self.T = esc['segundos']; self.fin_t = esc['fin_s']; self.ficha = esc['ficha']
        self.estados = [dict(x, t=x['tick'] / TPS) for x in esc['estados']]
        self.ts = [x['t'] for x in self.estados]
        # el nivel que entra, con sus nombres y su música (www/game/niveles.js): las escaletas grabadas antes del 21-nov por la
        # noche anotaban en el tick del cambio los del nivel que se iba
        for s in self.S:
            if s['tipo'] == 'nivel':
                s.update(NIVELES[esc['acto']][s['k']], n=4 * (esc['acto'] - 1) + s['k'] + 1)
        self.niveles = [s for s in self.S if s['tipo'] == 'nivel']
        self.por_nivel = [x['puntos'] for x in self.ficha['porNivel']]

    def estado(self, t):
        return self.estados[max(0, bisect.bisect_right(self.ts, t + 1e-6) - 1)]

    def perdidas(self, t):
        return sum(1 for s in self.S if s['tipo'] == 'muerte' and s['t'] <= t + 1e-6)

    def cuenta(self, tipo):
        return sum(1 for s in self.S if s['tipo'] == tipo)


def nombre_es(lang, s):
    """(en pantalla, como lo dice la voz) de un nombre del juego (un {es, en, ja})."""
    d = s[lang]; return (d, VOZ_NOMBRE[lang].get(d, d))


def miles(p, lang):
    """Los puntos como se leen en pantalla: 191 820 / 191,820 / 191820."""
    s = str(p)
    if lang == 'ja' or p < 10000:
        return s
    return re.sub(r'\B(?=(\d{3})+$)', ' ' if lang == 'es' else ',', s)


def marcador(p, lang):
    """El marcador de la izquierda para comercial.py (marcador_zanei)."""
    estados = []
    for x in p.estados:
        k = x['k']
        estados.append({'t': round(x['t'], 3), 'k': k, 'p': x['total'], 'nv': x['naves'], 'b': x['bombas'], 'a': x['arma'], 'pot': x['pot'], 'perd': p.perdidas(x['t']),
                        'pn': p.por_nivel[:k], 'j': [x['jefe']['nombre'][lang], x['jefe']['vida']] if x['jefe'] and not x['jefe']['entrada'] else None})
    u = p.estados[-1]   # la ficha del acto: con el bono
    estados.append({'t': round(p.fin_t, 3), 'k': len(p.niveles), 'p': p.ficha['puntos'], 'nv': p.ficha['navesSobran'], 'b': p.ficha['bombasSobran'], 'a': u['arma'], 'pot': u['pot'],
                    'perd': p.ficha['navesPerdidas'], 'pn': p.por_nivel, 'j': None, 'fin': 1})
    return {'tipo': 'zanei', 'modo': TX[lang]['marcador']['modo'], 'logo': os.path.join(AQUI, 'zanei', 'logo.png'),
            'niveles': [{'nombre': s['nombre'][lang], 'jefe': s['jefe'][lang]} for s in p.niveles],
            'armas': {k: [v[0][lang][0], v[1]] for k, v in ARMAS.items()}, 'rotulos': {k: v for k, v in TX[lang]['marcador'].items() if k != 'modo'}, 'estados': estados}


# ---------------------------------------------------------------------------------------------------- páginas
def renglones(texto, lang):
    """¿Cabe `texto` en el cuadro alto de la derecha (comercial.LADO), partido igual que en comercial.dialogo()?"""
    from PIL import Image, ImageDraw
    comercial.TODO_PIXEL = True; comercial.JAPONES = comercial.JAPONES_12 = lang == 'ja'
    x0, y0, x1, y1 = comercial.LADO
    ft = comercial.pixel(32, texto); d = ImageDraw.Draw(Image.new('RGB', (8, 8)))
    ancho = (x1 - 34) - (x0 + 34); alto = (y1 - 50) - (y0 + 40 + 256 + 40)
    ja = any(ord(ch) > 0x2E7F for ch in texto)
    texto = re.sub(r'(?<=\d) (?=\d{3}(?!\d))', '\u00a0', texto)   # como en comercial.dialogo(): «34 000» no se parte
    partes, sep = (re.findall(r'[A-Za-z0-9.:/]+|.', texto), '') if ja else (re.split('[ \n\t]+', texto.strip()), ' ')
    n, actual = 1, ''
    for pz in partes:
        prueba = (actual + sep + pz) if actual else pz
        if d.textlength(prueba.replace('\u00a0', ' '), font=ft) > ancho and actual and pz not in '。、！？）」・':
            n += 1; actual = pz
        else:
            actual = prueba
    return n * round(ft.size * 1.75) <= alto + round(ft.size * 0.75)


def paginas(marcado, lang):
    """El texto en páginas que caben en el cuadro: por frases y, si una frase sola no cabe, por comas."""
    sep = '' if lang == 'ja' else ' '
    cabe = lambda m: renglones(marcas(m)[0], lang)
    piezas = []
    for frase in trozos(marcado, r'(?<=[.!?…])\s+|(?<=[。！？])'):
        piezas += [frase] if cabe(frase) else trozos(frase, r'(?<=[,;:])\s+|(?<=[、：])')
    pags = []
    for pz in piezas:
        if pags and cabe(pags[-1] + sep + pz):
            pags[-1] += sep + pz
        else:
            pags.append(pz)
    return pags


# ---------------------------------------------------------------------------------------------------- el guion
def guion(p, lang, medir):
    tx = TX[lang]; ja = lang == 'ja'; sp = '' if ja else ' '
    video = f'{CARPETA}/{lang}/largo.mp4'
    num = lambda k: (NUM[lang][k] if not ja and k < len(NUM[lang]) else str(k),) * 2
    Num = lambda k: tuple(x[:1].upper() + x[1:] for x in num(k))
    pts = lambda v: (miles(v, lang), str(v))
    base = {'leia': tx['leia'], 'zn': tx['zn'], 'noa': tx['noa'], 'acto': tx['acto'], 'sitio': tx['sitio'], 'pulso': tx['pulso'], 'vulcano': tx['vulcano']}
    arma = lambda a: ARMAS[a][0][lang]
    pieza = lambda m: marcas(MUSICA[m][lang])
    giro = {}

    def variante(lista, clave):
        i = giro.get(clave, 0); giro[clave] = i + 1
        return lista[i % len(lista)]

    sucesos, dichas = [], {}

    def rota(lista, clave, valores):
        """La variante que toca, escogida al decirla: por cuántas se han dicho (escogida al crear el suceso, las que no
        llegan a decirse gastaban variantes y las demás se repetían)."""
        return lambda t: marcar(lista[dichas.get(clave, 0) % len(lista)], valores)

    def suceso(t, prio, ventana, cara, texto, corta=None, capitulo=None, tipo='', valido=None, gira=None):
        sucesos.append({'t': t, 'prio': prio, 'ventana': ventana, 'cara': cara, 'texto': texto, 'corta': corta, 'capitulo': capitulo, 'tipo': tipo, 'valido': valido, 'gira': gira})

    def vivo(k):   # sólo mientras el jefe del nivel k sigue en pie
        cae = next((x['t'] for x in p.S if x['tipo'] == 'jefe_cae' and x['k'] == k), 1e9)
        return lambda t: t < cae

    arma_vista = set(); medalla1 = medalla5 = False; ultimo_mini = {}
    for s in p.S:
        t, tipo = s['t'], s['tipo']; n = s['n']
        if tipo == 'nivel' and s['k'] > 0:
            frase = tx['nivel'][2 if s['k'] == 3 else s['k'] % 2]
            cap = marcar(tx['cap']['nivel'], {'n': (str(n),) * 2, 'nivel': nombre_es(lang, s['nombre'])})
            suceso(t + 0.6, 6, 8, 'feliz', marcar(frase, {**base, 'n': num(n), 'nivel': nombre_es(lang, s['nombre']), 'pieza': pieza(s['musica'])}),
                   marcar('¡Nivel {n}: {nivel}!' if lang == 'es' else 'Level {n}: {nivel}!' if lang == 'en' else 'ステージ{n}、{nivel}！', {'n': num(n), 'nivel': nombre_es(lang, s['nombre'])}),
                   marcas(cap)[0], 'nivel')
        elif tipo == 'muerte':
            k = s['naves']; perd = p.perdidas(t)
            if k == 1:
                m = marcar(tx['muerte_ultima'], base)
            else:
                m = marcar(variante(tx['muerte'], 'muerte'), {**base, 'k': num(k), 'K': Num(k), 'perd': num(perd)})
            suceso(t, 7, 7, 'sorpresa', m, marcar(tx['muerte_corta'], {'k': num(k), 'K': Num(k)}), tipo='muerte')
        elif tipo == 'nave_extra':
            e = p.estado(t + 0.3)
            if s['por'] == 'puntos':
                m = marcar(tx['extra_puntos'], {'umbral': pts(NAVE_EXTRA[max(0, e['extra'] - 1)]), 'k': num(s['naves'])})
            else:
                m = marcar(variante(tx['extra_item'], 'extra'), {'k': num(s['naves'])})
            suceso(t, 5, 6, 'feliz', m, tipo='nave_extra')
        elif tipo == 'arma':
            a = s['arma']
            if a in arma_vista:   # la segunda vez, sin la explicación
                m = marcar({'es': '¡Otra vez {arma}!', 'en': '{arma} again!', 'ja': 'また{arma}！'}[lang], {'arma': arma(a)})
            else:
                m = marcar(tx['arma' if s['antes'] == 'vulcano' else 'arma_otra'], {'arma': arma(a), 'desc': (tx['desc'][a],) * 2})
            arma_vista.add(a)
            suceso(t, 5, 6, 'feliz', m, tipo='arma')
        elif tipo == 'arma_fin':
            suceso(t, 2, 5, 'normal', rota(tx['arma_fin'], 'arma_fin', base), tipo='arma_fin', gira='arma_fin')
        elif tipo == 'potencia':
            if s['pot'] == 4:
                suceso(t, 3, 5, 'feliz', rota(tx['p4'], 'p4', base), tipo='potencia', gira='p4')
            else:
                suceso(t, 1, 3, 'normal', marcar(tx['p'], {'p': (str(s['pot']),) * 2}), tipo='potencia')
        elif tipo == 'potencia_max':
            suceso(t, 4, 5, 'feliz', rota(tx['f'], 'f', base), tipo='potencia', gira='f')
        elif tipo == 'potencia_baja':
            suceso(t, 1, 4, 'normal', marcar(tx['p_baja'], base), tipo='p_baja')
        elif tipo == 'bomba':
            b = p.estado(t + 0.3)['bombas']   # los estados van cada cuarto de segundo: con 0.1 salía el de antes de tirarla («le quedan dos» con una)
            suceso(t, 4, 4, 'sorpresa', rota(tx['bomba'], 'bomba', {**base, 'quedan': (tx['quedan'](b),) * 2}), tipo='bomba', gira='bomba')
        elif tipo == 'item_bomba':
            suceso(t, 1, 4, 'feliz', marcar(tx['item_bomba'], {'b': num(s['bombas'])}), tipo='item_bomba')
        elif tipo == 'medalla':
            if not medalla1:
                medalla1 = True; suceso(t, 2, 5, 'feliz', marcar(tx['medalla1'], base), tipo='medalla')
            elif s.get('cadena') == 5 and not medalla5:
                medalla5 = True; suceso(t, 3, 5, 'feliz', marcar(tx['medalla5'], base), tipo='medalla')
        elif tipo == 'mini':
            mt = s['mini']; i = ultimo_mini.get(mt, 0); ultimo_mini[mt] = i + 1
            cae = next((x['t'] for x in p.S if x['tipo'] == 'mini_cae' and x['mini'] == mt and x['t'] > t), 1e9)   # ya caído no se anuncia («¿Caerá?» 4 s después)
            suceso(t + 0.3, 4, 6, 'sorpresa', marcar(tx['mini'][mt][min(i, len(tx['mini'][mt]) - 1)], {'mini': MINI[mt][lang]}), tipo='mini', valido=lambda t, cae=cae: t < cae + 0.6)
        elif tipo == 'mini_cae':
            mt = s['mini']
            suceso(t, 4, 5, 'feliz', rota(tx['mini_cae'][mt], 'cae_' + mt, base), tipo='mini_cae', gira='cae_' + mt)
        elif tipo == 'jefe':
            nv = next(x for x in p.niveles if x['k'] == s['k'])
            j = nombre_es(lang, nv['jefe'])
            cap = marcar(tx['cap']['jefe'], {'jefe': j})
            suceso(t, 6, 7, 'sorpresa', marcar(tx['jefe'][0 if s['k'] % 2 == 0 else 1], {'jefe': j, 'n': num(n)}), None, marcas(cap)[0], 'jefe')
        elif tipo == 'jefe_fase':
            suceso(t, 3, 4, 'sorpresa', marcar(variante(tx['jefe_fase'], 'jefe_fase'), base), tipo='jefe_fase', valido=vivo(s['k']))
        elif tipo == 'jefe_vida' and s['vida'] in (50, 25):
            nv = next(x for x in p.niveles if x['k'] == s['k'])
            j = nombre_es(lang, nv['jefe']); al = ('A la ' if j[0] in FEMENINOS else 'Al ') if lang == 'es' else ''
            suceso(t, 3, 4, 'pensando' if s['vida'] == 50 else 'feliz', marcar(tx['jefe_vida'][s['vida']], {'jefe': j, 'al_jefe': (al + j[0], al + j[1])}), tipo='jefe_vida', valido=vivo(s['k']))
        elif tipo == 'jefe_cae':
            nv = next(x for x in p.niveles if x['k'] == s['k'])
            j = nombre_es(lang, nv['jefe'])
            cae = {'jefe': j, 'destruido': ('destruida' if j[0] in FEMENINOS else 'destruido',) * 2}
            if s['k'] < len(p.niveles) - 1:
                m = marcar(tx['jefe_cae'], {**cae, 'n': num(n), 'p': pts(p.por_nivel[s['k']])})
            else:   # el último: lo demás lo dice la ficha
                m = marcar(tx['jefe_cae_corto'], cae)
            suceso(t, 6, 6, 'feliz', m, marcar(tx['jefe_cae_corto'], cae), tipo='jefe_cae')
    # los hitos de puntos
    hitos = [50000, 100000, 150000, 200000]
    for x in p.estados:
        while hitos and x['total'] >= hitos[0]:
            suceso(x['t'], 3, 6, 'feliz', marcar(tx['hito'], {'p': pts(hitos[0])}), tipo='hito'); hitos.pop(0)

    # cómo va, cada minuto y pico (lo dice con lo que haya cuando lo diga)
    def estado(t):
        e = p.estado(t)
        b = e['bombas']; bombas = {'es': ('una bomba' if b == 1 else f'{NUM["es"][b]} bombas'), 'en': ('one bomb' if b == 1 else f'{NUM["en"][b]} bombs'), 'ja': str(b)}[lang]
        return marcar(tx['estado'], {'p': pts(e['total']), 'n': num(e['n']), 'k': num(e['naves']), 'b': (bombas, bombas)})
    for t0 in range(CADA, int(p.fin_t - 30), CADA):
        suceso(t0, 1, 40, 'normal', estado, tipo='estado', valido=lambda t: p.estado(t)['jefe'] is None)
    sucesos.sort(key=lambda s: s['t'])

    # --- los rellenos, en orden
    rellenos = [{'m': marcar(tx['intro2'], base), 'cara': 'feliz', 'tras': None, 'antes': None},
                {'m': marcar(tx['lados'], {**base, 'pieza': pieza(p.niveles[0]['musica'])}), 'cara': 'normal', 'tras': None, 'antes': 'nivel_2'}]
    rellenos += [{'m': marcar(d[lang], base), 'cara': d['cara'], 'tras': d.get('tras'), 'antes': d.get('antes')} for d in DATOS]
    primero = {}
    for s in p.S:
        primero.setdefault(s['tipo'], s['t'])
    primero['nivel_2'] = p.niveles[1]['t'] if len(p.niveles) > 1 else 1e9

    # --- el tiempo
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
        e = {'video': video, 'vertical': True, 'desde': round(t, 3), 'dur': round(dur, 3)}
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

    n1 = p.niveles[0]
    cap1 = marcas(marcar(tx['cap']['nivel'], {'n': ('1', '1'), 'nivel': nombre_es(lang, n1['nombre'])}))[0]
    decir('feliz', marcar(tx['intro'], base), cap1)
    fin_voz = p.fin_t - 0.3
    ESPERA = {'potencia': 6, 'arma_fin': 8, 'item_bomba': 10, 'bomba': 5, 'p_baja': 20, 'jefe_fase': 6}
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
                vivas.remove(s); dicha = True; break
            if t + cuanto(m) <= tope or s['prio'] >= 5:
                cap = s['capitulo'] if s['capitulo'] and all(abs(t - c) >= 11 for c in caps) else None
                if cap:
                    caps.append(t)
                decir(s['cara'], m, cap); dichos[s['tipo']] = t; vivas.remove(s); dicha = True
                if s['gira']:
                    dichas[s['gira']] = dichas.get(s['gira'], 0) + 1
                break
        if dicha:
            continue
        hueco = min([x['t'] for x in ev if x['prio'] >= 4] + [fin_voz]) - t
        k = None
        if hueco >= 1.8:
            k = next((k for k, r in enumerate(rellenos) if (not r['tras'] or primero.get(r['tras'], 1e9) < t) and (not r['antes'] or primero.get(r['antes'], 1e9) > t + cuanto(r['m']))
                      and cuanto(r['m']) + PAUSA <= hueco), None)
        if k is not None:
            r = rellenos.pop(k)
            decir(r['cara'], r['m']); tramo(PAUSA)
            continue
        if hueco >= 1.2 and t - animo >= 5 and (fin_voz - t <= hueco + 0.01 or hueco >= 1.8 or any(x['prio'] >= 5 and x['t'] - t <= hueco + 0.01 for x in ev)):
            m = next((x for x in tx['animo'][giro.get('animo', 0) % len(tx['animo']):] + tx['animo'] if cuanto(x) <= hueco), None)
            if m:
                giro['animo'] = tx['animo'].index(m) + 1
                decir('feliz', m); animo = t
                continue
        sig = min([x['t'] for x in ev] + [fin_voz])
        tramo(max(0.1, sig - t)) if sig - t > 0.05 else tramo(0.1)
    if fin_voz + 0.3 - t > 0.05:
        tramo(fin_voz + 0.3 - t)
    # la ficha del acto, mientras sale en pantalla
    f = p.ficha; b = f['bono'] or {'total': 0}
    extra = f['navesExtra'] + f['navesItem']
    decir('feliz', marcar(tx['fin'], {**base, 'p': pts(f['puntos']), 'bono': pts(b['total']), 'k': num(f['navesSobran']), 'b': num(f['bombasSobran'])}))
    decir('guino', marcar(tx['fin2'], {'min': (str(round(f['tiempo'] / 60)),) * 2, 'perd': num(f['navesPerdidas']), 'extra': num(extra)}))
    if p.T - 0.1 - t > 0.3:
        tramo(p.T - 0.1 - t)
    # la tarjeta
    partes = [marcar(x, base) for x in tx['cierre']]
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
    inicio, con = 0.0, []
    for e in escenas:
        if e.get('final'):
            break
        if e.get('capitulo'):
            con.append((inicio, e))
        inicio += e['dur']
    if len(con) > 1 and inicio - con[-1][0] < 11:
        del con[-1][1]['capitulo']
    return escenas, t, rellenos


def silencios(escenas, medir):
    t, habla, ultimo, peor = 0.0, 0.0, 0.0, 0.0
    for e in escenas:
        if e.get('final'):
            break
        if e.get('voz'):
            d = medir(e['voz']); peor = max(peor, t - ultimo); habla += d; ultimo = t + d
        t += e['dur']
    return habla, t, max(peor, t - ultimo)


def guion_completo(lang, escenas, clave, volumen):
    tx = TX[lang]
    return {
        'fuente': 'pixel-ja12' if lang == 'ja' else 'pixel', 'voz': VOZ[lang][0], 'idioma': VOZ[lang][1],
        'presentadora': {'nombre': 'LeIA', 'caras': 'avatar'},
        'colores': {'fondo': '#000000', 'acento': ACENTO, 'texto': '#ffffff', 'tenue': '#9fb8c8', 'sobre_acento': '#000000', 'borde': '#1a6f7a'},
        'marca': {'logo': 'zanei/logo.png', 'logo_ancho': 420, 'lema': tx['marca'][0], 'sitio': 'dailychallenge.click/zanei', 'pie': tx['marca'][1]},
        'formato': 'horizontal', 'acercamiento': False,
        'salida': f'~/Documents/ayotl/tools/comerciales/salida/{clave}.mp4',
        # el sonido del juego (su música y sus efectos), que baja cuando habla LeIA
        'musica': {'archivo': f'{CARPETA}/es/sonido.wav', 'desde': 0, 'volumen': volumen, 'agacha': 0.55},
        'marcador': f'{CARPETA}/marcador-{lang}.json',
        'escenas': escenas,
    }


# ---------------------------------------------------------------------------------------------------- YouTube
def entrada(p, lang, clave, publicar):
    f = p.ficha; perd = f['navesPerdidas']; extra = f['navesExtra'] + f['navesItem']
    armas = len({s['arma'] for s in p.S if s['tipo'] == 'arma'}); bombas = p.cuenta('bomba'); jefes = len(p.niveles)
    w = lambda k, l: NUM[l][k] if k < 17 else str(k)
    nombres = lambda l: [s['nombre'][l] for s in p.niveles]
    if lang == 'es':
        titulo = f'ZANEI: la computadora juega el ACTO I, {jefes} niveles y {jefes} jefes seguidos (partida completa)'
        desc = (f'Los {w(jefes, "es")} niveles del ACTO I del arcade de ZANEI, seguidos y sin continuar, jugados de principio a fin por un bot que esquiva: '
                f'{", ".join(nombres("es")[:-1])} y {nombres("es")[-1]}, con sus {w(jefes, "es")} jefes. LeIA comenta la partida completa: {w(perd, "es")} naves perdidas, '
                f'{w(extra, "es")} naves extra, las {w(armas, "es")} armas especiales, {w(bombas, "es")} bombas y {miles(f["puntos"], "es")} puntos al final. '
                'A la izquierda va el marcador: el nivel, los puntos, las naves, las bombas, el arma y la vida del jefe. '
                'El sonido es el del juego: sus efectos y su música, clásica de dominio público en electro (C. P. E. Bach, J. S. Bach, Vivaldi, Beethoven y Dvořák).\n\n'
                "ZANEI es un shoot 'em up vertical con gráficos vectoriales: una piloto enlazada a naves sin tripulación contra una invasión de formas geométricas. "
                'Doce niveles de historia y un arcade para buscar récords, en español, inglés y japonés.\n\n'
                'LeIA es la presentadora de los juegos de Ayotl.')
        etiquetas = ['ZANEI', "shoot 'em up", 'shmup', 'matamarcianos', 'juego retro', 'gráficos vectoriales', 'arcade', 'partida completa', 'indie game', 'Daily Challenge']
        cierre = '#ZANEI #Shmup #RetroGaming #Videojuegos #IndieGame'
    elif lang == 'en':
        titulo = f'ZANEI: the computer plays ACT I, {jefes} levels and {jefes} bosses in a row (full run)'
        desc = (f'All {w(jefes, "en")} levels of ZANEI\'s arcade ACT I, back to back with no continues, played start to finish by a dodging bot: '
                f'{", ".join(nombres("en")[:-1])} and {nombres("en")[-1]}, with their {w(jefes, "en")} bosses. With LeIA\'s commentary on the full run: {w(perd, "en")} ships lost, '
                f'{w(extra, "en")} extra ships, all {w(armas, "en")} special weapons, {w(bombas, "en")} bombs and {miles(f["puntos"], "en")} points at the end. '
                'The scoreboard is on the left: level, score, ships, bombs, weapon and the boss\'s health. '
                "The sound is the game's own: its effects and its music, public-domain classical pieces turned into electro (C. P. E. Bach, J. S. Bach, Vivaldi, Beethoven and Dvořák).\n\n"
                "ZANEI is a vertical shoot 'em up with vector graphics: a pilot linked to unmanned ships against an invasion of geometric shapes. "
                'Twelve story levels and an arcade mode for high scores, in Spanish, English and Japanese.\n\n'
                "LeIA is the host of Ayotl's games.")
        etiquetas = ['ZANEI', "shoot 'em up", 'shmup', 'retro games', 'vector graphics', 'arcade', 'full run', 'indie game']
        cierre = '#ZANEI #Shmup #RetroGaming #IndieGame'
    else:
        titulo = f'ZANEI: コンピューターが第1幕に挑戦、{jefes}ステージ・ボス{jefes}体を連続で（フルプレイ）'
        desc = (f'ZANEIのアーケード「第1幕」の{jefes}ステージを、コンティニューなしで連続プレイ。遊ぶのは、弾をよけるボットです。'
                f'{"、".join(nombres("ja"))}、そして{jefes}体のボス。LeIAがフルプレイを実況：失った機体{perd}、増えた機体{extra}、特殊武器{armas}種類すべて、ボム{bombas}回、最終スコア{f["puntos"]}点。'
                '画面の左には、ステージ、スコア、機体、ボム、武器、ボスの体力。音はゲームそのもの。効果音と、著作権の切れたクラシックをエレクトロにした音楽'
                '（C.P.E.バッハ、J.S.バッハ、ヴィヴァルディ、ベートーヴェン、ドヴォルザーク）です。\n\n'
                'ZANEI（天使の残影）は、ベクターグラフィックの縦スクロールシューティング。無人機とつながったパイロットが、幾何学の侵略者と戦います。'
                'ストーリー12ステージと、ハイスコアをねらうアーケード。日本語・英語・スペイン語に対応。\n\n'
                'LeIAはAyotlのゲームの案内役です。')
        etiquetas = ['ZANEI', '天使の残影', 'シューティング', 'STG', 'レトロゲーム', 'ベクターグラフィック', 'アーケード', 'フルプレイ']
        cierre = '#ZANEI #シューティング #レトロゲーム #インディーゲーム'
    v = {'clave': clave, 'app': 'zanei', 'video': f'salida/{clave}.mp4', 'miniatura': f'salida/{clave}.jpg', 'categoria': '20',
         'publicar': f'{publicar}T{HORA[lang]}:00-06:00', 'titulo': titulo, 'descripcion': desc, 'cierre': cierre, 'etiquetas': etiquetas}
    if lang != 'es':
        v['idioma'] = lang
    return v


def miniatura(p, lang, clave):
    import miniaturas
    from PIL import Image, ImageFont
    if lang == 'ja':   # el japonés en PixelMplus12, como en el vídeo; sólo en este proceso
        latina = miniaturas.pixel
        miniaturas.pixel = lambda tam, texto: (ImageFont.truetype(comercial.PIXELMPLUS, max(12, round(tam * 1.15 / 12) * 12))
                                               if any(ord(ch) > 0x2E7F for ch in texto) else latina(tam, texto))
    # el fondo: tres jefes en plena pelea (los de los niveles 2, 3 y 4), uno al lado del otro
    listos = [s for s in p.S if s['tipo'] == 'jefe_listo']
    fondo = Image.new('RGB', (1280, 720), (0, 0, 0))
    for i, s in enumerate(listos[-3:]):
        cae = next((x['t'] for x in p.S if x['tipo'] == 'jefe_cae' and x['k'] == s['k']), s['t'] + 8)
        im = miniaturas.cuadro(os.path.join(AQUI, CARPETA, lang, 'largo.mp4'), s['t'] + (cae - s['t']) * 0.45)
        im = im.resize((405, 720), Image.LANCZOS)
        fondo.paste(im, (30 + i * 425, 0))
    titulo = {'es': 'ZANEI\nACTO I', 'en': 'ZANEI\nACT I', 'ja': 'ZANEI\n第1幕'}[lang]
    sub = {'es': '4 niveles · 4 jefes · sin parar', 'en': '4 levels · 4 bosses · non-stop', 'ja': '4ステージ・ボス4体・ノンストップ'}[lang]
    miniaturas.juego(clave, fondo, titulo, sub, 'sorpresa', comercial.color(ACENTO))


# ---------------------------------------------------------------------------------------------------- main
def grabar(a, lang, dir_, sonido=False):
    print(f'  grabando la partida en {lang} (zanei/tools/partida-larga.mjs)…', flush=True)
    r = subprocess.run(['node', 'tools/partida-larga.mjs', 'grabar', '--semilla', str(a.semilla), '--acto', str(a.acto), '--idioma', lang, '--salida', dir_] + (['--sonido'] if sonido else []),
                       cwd=ZANEI, capture_output=True, text=True)
    if r.returncode:
        sys.exit(f'la grabación falló:\n{(r.stdout + r.stderr)[-1500:]}')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--semilla', type=int, default=7); ap.add_argument('--acto', type=int, default=1)
    ap.add_argument('--publicar')
    ap.add_argument('--idiomas', default='es,en,ja')
    ap.add_argument('--seco', action='store_true')
    ap.add_argument('--solo-plan', action='store_true', help='no arma los vídeos (ya están en salida/): sólo escribe youtube.json')
    a = ap.parse_args()
    idiomas = a.idiomas.split(',')
    base = os.path.join(AQUI, CARPETA)
    for lang in ['es'] + [l for l in idiomas if l != 'es']:   # la española siempre: de ahí salen los tiempos y el sonido
        dir_ = os.path.join(base, lang)
        hace_falta = ['escaleta.json'] if a.seco or a.solo_plan or lang not in idiomas else ['largo.mp4', 'escaleta.json'] + (['sonido.wav'] if lang == 'es' else [])
        if not all(os.path.exists(os.path.join(dir_, x)) for x in hace_falta):
            grabar(a, lang, dir_, sonido=lang == 'es')
    esc = cargar(os.path.join(base, 'es', 'escaleta.json'))
    if (esc['semilla'], esc['acto']) != (a.semilla, a.acto):
        sys.exit(f"la grabación de {CARPETA}/ es otra partida (acto {esc['acto']}, semilla {esc['semilla']}): bórrala o cambia los parámetros")
    p = Partida(esc)
    f = p.ficha
    print(f"acto {esc['acto']}, semilla {esc['semilla']}: {p.T:.1f} s de vídeo, la corrida acaba a los {p.fin_t:.1f} s "
          f"({'completa' if f['completa'] else 'sin naves'}), {f['puntos']} puntos, {f['navesPerdidas']} naves perdidas")
    plan_ruta = os.path.join(AQUI, 'youtube.json')
    with tempfile.TemporaryDirectory() as tmp:
        os.chmod(tmp, 0o700)
        cab = os.path.join(tmp, 'h.txt')
        with open(cab, 'w') as h:
            h.write(f'X-Goog-Api-Key: {comercial.clave()}\n')
        os.chmod(cab, 0o600)
        for lang in idiomas:
            esc_l = cargar(os.path.join(base, lang, 'escaleta.json'))
            if [(s['tick'], s['tipo']) for s in esc_l['sucesos']] != [(s['tick'], s['tipo']) for s in esc['sucesos']] or esc_l['cuadros'] != esc['cuadros']:
                sys.exit(f'la grabación en {lang} no es la misma partida que la española')
            json.dump(marcador(p, lang), open(os.path.join(base, f'marcador-{lang}.json'), 'w', encoding='utf-8'), ensure_ascii=False)
            voz, idioma = VOZ[lang]

            def medir(texto, voz=voz, idioma=idioma):
                for intento in range(4):
                    try:
                        return len(comercial.narrar(texto, voz, idioma, cab)) / comercial.SR
                    except SystemExit as e:
                        if intento == 3 or not any(x in str(e) for x in ('503', 'UNAVAILABLE', '429', '500')):
                            raise
                        time.sleep(15 * (intento + 1))
            clave = f'{CLAVE}{SUF[lang]}'
            escenas, usa, sobran = guion(p, lang, medir)
            g = guion_completo(lang, escenas, clave, 0.10)
            ruta = os.path.join(AQUI, f'{clave}.json')
            json.dump(g, open(ruta, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            habla, dura, peor = silencios(escenas, medir)
            print(f'  {lang}: {len(escenas)} escenas, LeIA habla {habla:.0f} de {dura:.0f} s de partida ({100 * habla / max(1, dura):.0f} %), '
                  f'el silencio más largo {peor:.1f} s; quedan {len(sobran)} datos sin decir -> {os.path.relpath(ruta, AQUI)}', flush=True)
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
