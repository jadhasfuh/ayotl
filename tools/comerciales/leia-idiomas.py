#!/usr/bin/env python3
"""Las versiones en inglés y japonés de los vídeos de LeIA (27-oct-2026): de cada guion en español (dc-semana-*,
warzone-cpu-*, kazan-cpu-*) salen <clave>-en.json y <clave>-ja.json con los mismos clips, caras y duraciones y
el texto traducido (lo de pantalla, lo que dice, los capítulos y la tarjeta de la marca). Adrián: «copias de los
vídeos de LeIA para inglés y japonés, para tener las 3 versiones en YouTube».

  python3 tools/comerciales/leia-idiomas.py            # escribe los guiones
  python3 tools/comerciales/leia-idiomas.py --render   # y genera los mp4 que falten (salida/<clave>-<idioma>.mp4)

La voz es la misma Achernar de LeIA en cada idioma (Chirp 3 HD en-US y ja-JP). En japonés los nombres y las
direcciones se dicen en katakana (`voz`) y se escriben en latino (`dice`); el texto va en Misaki, la pixel
japonesa (`fuente: pixel-ja`). Las escenas con `dur` fija avisan al generar si la voz no cabe: acortar la frase.
"""
import json, os, subprocess, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
VOZ = {'en': ('en-US-Chirp3-HD-Achernar', 'en-US'), 'ja': ('ja-JP-Chirp3-HD-Achernar', 'ja-JP')}
FUENTE = {'en': 'pixel', 'ja': 'pixel-ja'}

MARCA = {
    'dc': {'en': {'lema': 'A new challenge every day', 'pie': 'Free, in the browser, no download'},
           'ja': {'lema': '毎日新しいチャレンジ', 'pie': '無料・ブラウザで・ダウンロード不要'}},
    'warzone': {'en': {'lema': 'Turn-based artillery', 'pie': 'Free, in the browser, no download'},
                'ja': {'lema': 'ターン制の砲撃バトル', 'pie': '無料・ブラウザで・ダウンロード不要'}},
    'kazan': {'en': {'lema': 'Real-time strategy', 'pie': 'Free, in the browser'},
              'ja': {'lema': 'リアルタイムストラテジー', 'pie': '無料・ブラウザで遊べる'}},
}

# por vídeo e idioma, una entrada por escena en el mismo orden que el guion en español:
# (texto en pantalla, lo que dice, lo que se escribe si es distinto, capítulo)
E = {}
E['dc-semana-short'] = {
 'en': [
  ('A week in Daily Challenge', "Hi! I'm LeIA. This is the latest week of Daily Challenge: a different retro game every day.", None, None),
  ('TUESDAY · GALAGA', 'Tuesday: Galaga. Shoot down the formation as it dives.', None, None),
  ('WEDNESDAY · MR. DO!', 'Wednesday: Mr. Do! Squash the monsters with apples.', None, None),
  ('THURSDAY · JEWELS', 'Thursday: Jewels. Match three gems, and chain those combos.', None, None),
  ('FRIDAY · BURGERTIME', 'Friday: BurgerTime. Build burgers without getting caught.', None, None),
  ('SATURDAY · PAC-MAN', 'Saturday: Pac-Man. The classic.', None, None),
  ('SUNDAY · RALLY-X', 'Sunday: Rally-X, with the red cars right on your tail.', None, None),
  ('MONDAY · ASTEROIDS', "And Monday: Asteroids. Those rocks won't break themselves!", None, None),
  (None, 'And tomorrow? Surprise. Play free at dailychallenge dot click.', 'And tomorrow? Surprise. Play free at dailychallenge.click', None),
 ],
 'ja': [
  ('Daily Challengeの一週間', 'こんにちは！レイアです。今週のデイリーチャレンジは、毎日ちがうレトロゲーム。', 'こんにちは！LeIAです。今週のDaily Challengeは、毎日ちがうレトロゲーム。', None),
  ('火曜日 · GALAGA', '火曜日はギャラガ。急降下してくる編隊を撃ち落とせ。', None, None),
  ('水曜日 · MR. DO!', '水曜日はミスター・ドゥ！リンゴでモンスターをつぶせ。', None, None),
  ('木曜日 · JEWELS', '木曜日はジュエルズ。同じ宝石を三つそろえて、コンボをつなげよう。', None, None),
  ('金曜日 · BURGERTIME', '金曜日はバーガータイム。つかまらずにハンバーガーを作れ。', None, None),
  ('土曜日 · PAC-MAN', '土曜日はパックマン。おなじみの名作。', None, None),
  ('日曜日 · RALLY-X', '日曜日はラリーX。赤い車がすぐ後ろに迫る。', None, None),
  ('月曜日 · ASTEROIDS', 'そして月曜日はアステロイド。岩はひとりでに割れないよ！', None, None),
  (None, '明日は？お楽しみに。デイリーチャレンジ・ドット・クリックで無料で遊べます。', '明日は？お楽しみに。dailychallenge.click で無料で遊べます。', None),
 ]}
E['warzone-cpu-short'] = {
 'en': [
  ('BOMB · INTO THE VOID', 'Look at this! A bomb from Chato… and Cuca goes into the void!', None, None),
  ('HEADSHOT', 'Headshot! Right in the head.', None, None),
  ('GRENADE', 'Nena strikes back… bye, Beto!', None, None),
  ('226 PIXELS', 'Rudy flies two hundred twenty-six pixels!', None, None),
  ('RED WINS', 'And in the end, hard mode shows no mercy. Red wins!', None, None),
  (None, 'CPU versus CPU in War Zone. Play free: dailychallenge dot click, slash warzone.', 'CPU vs CPU in War Zone. Play free: dailychallenge.click/warzone', None),
 ],
 'ja': [
  ('爆弾 · 奈落へ', '見て！チャトの爆弾で…ククが奈落へ！', None, None),
  ('ヘッドショット', 'ヘッドショット！頭に直撃。', None, None),
  ('手りゅう弾', 'ネナの反撃…さよなら、ベト！', None, None),
  ('226ピクセル', 'ルディが二百二十六ピクセル吹っ飛んだ！', None, None),
  ('赤の勝ち', '最後は、ハードが容赦なし。赤の勝ち！', None, None),
  (None, 'ウォーゾーンでCPU対CPU。デイリーチャレンジ・ドット・クリック、スラッシュ、ウォーゾーンで無料。', 'War ZoneでCPU対CPU。無料で遊べます: dailychallenge.click/warzone', None),
 ]}
E['kazan-cpu-short'] = {
 'en': [
  ('KAZAN · 8 CPU', "Hi! I'm LeIA. On this Kazan island, eight computers play on their own.", None, None),
  ('FIRST ARMY', 'Yellow builds an army and goes looking for a fight.', None, None),
  ('ERUPTION', 'But the volcano wakes up, and the lava starts flowing!', None, None),
  ('PURPLE FALLS', 'Yellow shows no mercy: one city after another.', None, None),
  ('ONE NATION LEFT', 'And in the end, a single nation remains. Would your city hold?', None, None),
  (None, 'Play free at kazan dot dailychallenge dot click.', 'Play free at kazan.dailychallenge.click', None),
 ],
 'ja': [
  ('KAZAN · CPU 8体', 'こんにちは！レイアです。このカザンの島では、コンピューター八つが勝手に戦います。', 'こんにちは！LeIAです。このKazanの島では、コンピューター8つが勝手に戦います。', None),
  ('最初の軍', '黄色が軍をそろえて、戦いに出る。', None, None),
  ('噴火', 'でも火山が目を覚まし、溶岩が流れ出す！', None, None),
  ('紫が落ちる', '黄色は容赦なし。街をひとつずつ。', None, None),
  ('残るは一国', '最後に残るのは一国だけ。あなたの街はもつ？', None, None),
  (None, 'カザン・ドット・デイリーチャレンジ・ドット・クリックで無料で遊べます。', 'kazan.dailychallenge.click で無料で遊べます。', None),
 ]}
E['dc-semana-largo'] = {
 'en': [
  ('A week in Daily Challenge', "Hi! I'm LeIA. In Daily Challenge there's a new challenge every day: a retro game, the same level for everyone, and one leaderboard.", None, 'What is Daily Challenge'),
  ('A new challenge every day', "Get the best score of the day, and the winning run gets recorded. These are last week's.", None, None),
  ('TUESDAY · GALAGA', 'Tuesday was Galaga: the formation dives at you, and you have to shoot it down before it reaches you.', None, 'Galaga'),
  ('WEDNESDAY · MR. DO!', 'Wednesday, Mr. Do! You dig the orchard, collect cherries, and squash monsters with apples.', None, 'Mr. Do!'),
  ('THURSDAY · JEWELS', 'Thursday, Jewels: three matching gems in a row, and if you chain combos, the score explodes.', None, 'Jewels'),
  ('FRIDAY · BURGERTIME', 'BurgerTime Friday. You walk over the ingredients to build burgers while they chase you.', None, 'BurgerTime'),
  ('SATURDAY · PAC-MAN', 'Saturday, Pac-Man. No introduction needed: maze, dots and ghosts.', None, 'Pac-Man'),
  ('SUNDAY · RALLY-X', 'Rally-X Sunday: ten flags to collect, with the red cars right on your tail.', None, 'Rally-X'),
  ('MONDAY · ASTEROIDS', "And Monday, Asteroids. Turn, thrust, and blast the rocks to pieces. Don't crash!", None, 'Asteroids'),
  (None, "Which game is up tomorrow? Come in and find out. It's free, in the browser, at dailychallenge dot click.", "Which game is up tomorrow? Come in and find out. It's free, in the browser: dailychallenge.click", 'Play free'),
 ],
 'ja': [
  ('Daily Challengeの一週間', 'こんにちは！レイアです。デイリーチャレンジは毎日新しいチャレンジ。レトロゲームひとつ、みんな同じステージ、ランキングはひとつ。', 'こんにちは！LeIAです。Daily Challengeは毎日新しいチャレンジ。レトロゲームひとつ、みんな同じステージ、ランキングはひとつ。', 'Daily Challengeとは'),
  ('毎日新しいチャレンジ', 'その日の最高得点をとると、プレイが記録に残ります。これが先週の記録です。', None, None),
  ('火曜日 · GALAGA', '火曜日はギャラガ。急降下してくる編隊を、届く前に撃ち落とす。', None, 'ギャラガ'),
  ('水曜日 · MR. DO!', '水曜日はミスター・ドゥ！畑を掘ってサクランボを集め、リンゴでモンスターをつぶす。', None, 'ミスター・ドゥ'),
  ('木曜日 · JEWELS', '木曜日はジュエルズ。同じ宝石を三つ並べて、コンボをつなげば得点が跳ね上がる。', None, 'ジュエルズ'),
  ('金曜日 · BURGERTIME', '金曜日はバーガータイム。追われながら、具材を踏んでハンバーガーを作る。', None, 'バーガータイム'),
  ('土曜日 · PAC-MAN', '土曜日はパックマン。説明はいらない。迷路、ドット、ゴースト。', None, 'パックマン'),
  ('日曜日 · RALLY-X', '日曜日はラリーX。旗を十本集める。赤い車がすぐ後ろに。', None, 'ラリーX'),
  ('月曜日 · ASTEROIDS', 'そして月曜日はアステロイド。回って、加速して、岩を砕く。ぶつからないで！', None, 'アステロイド'),
  (None, '明日のゲームは？入って確かめて。ブラウザで無料、デイリーチャレンジ・ドット・クリック。', '明日のゲームは？入って確かめて。ブラウザで無料: dailychallenge.click', '無料で遊ぶ'),
 ]}
E['warzone-cpu-largo'] = {
 'en': [
  ('WAR ZONE · CPU VS CPU', "Hi! I'm LeIA. Today in War Zone: a battle on the volcano, four against four, and both computers fight on their own. Blue plays on normal, and Red on hard.", None, 'The battle'),
  ('BLUE 3 · RED 4', 'Whoa! Rudy opens with the laser, and Nino falls first.', None, 'First down'),
  ('BLUE 3 · RED 3', 'But Chato answers with a bomb… and Cuca flies into the void! Three on three.', None, None),
  ('BLUE 3 · RED 3', 'Every explosion eats the ground. On the volcano, nobody is safe.', None, None),
  ('BLUE 2 · RED 3', 'Oh no! A bomb from Tito sends Chato flying a hundred and fifty-eight pixels.', None, 'Chato into the void'),
  ('BLUE 1 · RED 3', 'Headshot by Rudy! Nena is alone against three.', None, 'Headshot'),
  ('BLUE 1 · RED 2', "But Nena doesn't give up. Grenade… and Beto into the void!", None, 'Nena against everyone'),
  ('BLUE 1 · RED 1', 'Another one! Rudy flies two hundred twenty-six pixels. One on one: Nena versus Tito.', None, 'One on one'),
  ('BLUE 1 · RED 1', 'Tito plays on hard, and it shows: every grenade of his hurts.', None, None),
  ('BLUE 1 · RED 1', "Nena is down to six health. It's her last chance…", None, None),
  ('RED WINS', 'And Tito finishes her. Red wins!', None, 'Red wins'),
  (None, 'Dare to face hard mode? Play free in the browser: dailychallenge dot click, slash warzone.', 'Dare to face hard mode? Play free in the browser: dailychallenge.click/warzone', 'Play free'),
 ],
 'ja': [
  ('WAR ZONE · CPU対CPU', 'こんにちは！レイアです。今日のウォーゾーンは火山で四対四。コンピューター同士の戦いです。青はノーマル、赤はハード。', 'こんにちは！LeIAです。今日のWar Zoneは火山で4対4。コンピューター同士の戦いです。青はノーマル、赤はハード。', '戦い'),
  ('青3 · 赤4', 'おっと！ルディのレーザーで、ニノが最初に倒れる。', None, '最初の脱落'),
  ('青3 · 赤3', 'でもチャトが爆弾で返す…ククが奈落へ！三対三。', None, None),
  ('青3 · 赤3', '爆発のたびに地面が削れる。火山では誰も安全じゃない。', None, None),
  ('青2 · 赤3', 'ああ！ティトの爆弾で、チャトが百五十八ピクセル吹っ飛ぶ。', None, 'チャトが奈落へ'),
  ('青1 · 赤3', 'ルディのヘッドショット！ネナはひとりで三人を相手に。', None, 'ヘッドショット'),
  ('青1 · 赤2', 'でもネナはあきらめない。手りゅう弾…ベトが奈落へ！', None, 'ネナ対全員'),
  ('青1 · 赤1', 'もう一発！ルディが二百二十六ピクセル飛ぶ。一対一、ネナ対ティト。', None, '一対一'),
  ('青1 · 赤1', 'ティトはハード。手りゅう弾の一発一発が痛い。', None, None),
  ('青1 · 赤1', 'ネナの体力は残り六。最後のチャンス…', None, None),
  ('赤の勝ち', 'ティトがとどめ。赤の勝ち！', None, '赤の勝ち'),
  (None, 'ハードに挑戦する？ブラウザで無料。デイリーチャレンジ・ドット・クリック、スラッシュ、ウォーゾーン。', 'ハードに挑戦する？ブラウザで無料: dailychallenge.click/warzone', '無料で遊ぶ'),
 ]}
E['kazan-cpu-largo'] = {
 'en': [
  ('KAZAN · 8 CPU', "Hi! I'm LeIA. Today in Kazan: one island, one volcano, and eight nations played by the computer. Nobody controls them: they're on their own.", None, 'Eight nations'),
  ('2:24 · FIRST ARMY', 'At minute two, Yellow already sends its first army, against Pink.', None, 'First army'),
  ('3:41 · FIRST ATTACK', 'White attacks Orange, and four armies end up surrounding it.', None, None),
  ('5:00 · ERUPTION', 'And at minute five, the volcano wakes up!', None, 'The eruption'),
  ('ORANGE FALLS', 'With the lava coming down, White conquers Orange. First nation out.', None, 'Orange falls'),
  ('PINK HOLDS', 'Meanwhile, Yellow lays siege to Pink. The city holds… for now.', None, None),
  ('THE LAVA', "The lava swallows the red base. Without a base, its people won't last long.", None, 'The lava'),
  ('RED FALLS', 'And Red falls.', None, None),
  ('PINK FALLS', 'Yellow finally conquers Pink!', None, 'Yellow advances'),
  ('LAVA 25%', 'The lava already covers a quarter of the island. Space is running out.', None, None),
  ('PURPLE FALLS', "And Yellow conquers Purple too! That's three.", None, None),
  ('LAVA 50%', 'Half the island in lava. Yellow, White, Blue and Cyan remain.', None, 'Half the island in lava'),
  ('BLUE AND CYAN FALL', 'The lava swallows the blue base, and White takes Cyan.', None, None),
  ('LAVA 75%', 'Three quarters of the island in lava. Only two left: Yellow against White.', None, 'The end'),
  ('YELLOW WINS', 'Yellow wins! A single nation remains.', None, 'Yellow wins'),
  (None, 'Would your city hold? Play free at kazan dot dailychallenge dot click.', 'Would your city hold? Play free at kazan.dailychallenge.click', 'Play free'),
 ],
 'ja': [
  ('KAZAN · CPU 8体', 'こんにちは！レイアです。今日のカザンは、島ひとつ、火山ひとつ、そしてコンピューターが動かす八つの国。誰も操作しません。', 'こんにちは！LeIAです。今日のKazanは、島ひとつ、火山ひとつ、そしてコンピューターが動かす8つの国。誰も操作しません。', '八つの国'),
  ('2:24 · 最初の軍', '二分で、黄色がもう最初の軍をピンクへ送る。', None, '最初の軍'),
  ('3:41 · 最初の攻撃', '白がオレンジを攻め、四つの軍に囲まれてしまう。', None, None),
  ('5:00 · 噴火', 'そして五分、火山が目を覚ます！', None, '噴火'),
  ('オレンジが落ちる', '溶岩が迫るなか、白がオレンジを征服。最初の脱落。', None, 'オレンジが落ちる'),
  ('ピンクは耐える', 'その間、黄色がピンクを包囲。街はまだ…もっている。', None, None),
  ('溶岩', '溶岩が赤の本拠地を飲み込む。本拠地なしでは長くもたない。', None, '溶岩'),
  ('赤が落ちる', 'そして赤が落ちる。', None, None),
  ('ピンクが落ちる', '黄色がついにピンクを征服！', None, '黄色が進む'),
  ('溶岩 25%', '溶岩はもう島の四分の一。場所がなくなっていく。', None, None),
  ('紫が落ちる', '黄色は紫も征服！これで三つ。', None, None),
  ('溶岩 50%', '島の半分が溶岩。残るは黄色、白、青、シアン。', None, '島の半分が溶岩'),
  ('青とシアンが落ちる', '溶岩が青の本拠地を飲み込み、白がシアンを取る。', None, None),
  ('溶岩 75%', '島の四分の三が溶岩。残るは二つ、黄色対白。', None, '終わり'),
  ('黄色の勝ち', '黄色の勝ち！残るは一国。', None, '黄色の勝ち'),
  (None, 'あなたの街はもつ？カザン・ドット・デイリーチャレンジ・ドット・クリックで無料。', 'あなたの街はもつ？kazan.dailychallenge.click で無料で遊べます。', '無料で遊ぶ'),
 ]}


def guiones():
    hechos = []
    for clave, idiomas in E.items():
        app = clave.split('-')[0]
        base = json.load(open(os.path.join(AQUI, clave + '.json'), encoding='utf-8'))
        for idioma, escenas in idiomas.items():
            g = json.loads(json.dumps(base))
            assert len(escenas) == len(g['escenas']), f'{clave} {idioma}: {len(escenas)} escenas por {len(g["escenas"])}'
            g['voz'], g['idioma'] = VOZ[idioma]
            g['fuente'] = FUENTE[idioma]
            g['salida'] = os.path.join(os.path.dirname(base['salida']), f'{clave}-{idioma}.mp4')
            g['marca'].update(MARCA[app][idioma])
            for e, (texto, voz, dice, cap) in zip(g['escenas'], escenas):
                if texto is not None:
                    e['texto'] = texto
                e['voz'] = voz
                e.pop('dice', None)
                if dice:
                    e['dice'] = dice
                if cap:
                    e['capitulo'] = cap
                elif 'capitulo' in e:
                    e['capitulo'] = cap or e['capitulo']
            salida = os.path.join(AQUI, f'{clave}-{idioma}.json')
            json.dump(g, open(salida, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            hechos.append(salida)
    print(len(hechos), 'guiones')
    return hechos


def render(guiones_):
    py = os.path.expanduser('~/Documents/code challenge/.venv/bin/python')
    for g in guiones_:
        salida = os.path.expanduser(json.load(open(g, encoding='utf-8'))['salida'])
        if os.path.exists(salida):
            continue
        print('==', os.path.basename(g))
        subprocess.run([py, os.path.join(AQUI, 'comercial.py'), g], check=True)


if __name__ == '__main__':
    hechos = guiones()
    if '--render' in sys.argv:
        render(hechos)
