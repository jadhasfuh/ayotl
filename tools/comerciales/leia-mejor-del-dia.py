#!/usr/bin/env python3
"""El Short del «mejor del día» de Daily Challenge, narrado por LeIA (30-oct-2026).

Adrián: «para los shorts de leia puedes también generar una simulación del mejor del día y ella narrándolo; si
fue muy corto, meter un poco de información del juego y burlarse un poco, como "vaya, eso fue rápido"… que siempre
diga el dato del juego; sólo si el gameplay duró muy poco, ahí sí que dé el dato más largo; si el gameplay es muy
largo, no importa que lo dé completo». Y: «aún nos queda mucho Google Cloud: genera muchos vídeos con audio y LeIA».

  "/Users/jadhasfuh/Documents/code challenge/.venv/bin/python" tools/comerciales/leia-mejor-del-dia.py [AAAA-MM-DD ...]
      [--idiomas es,en,ja] [--publicar AAAA-MM-DD] [--sin-plan] [--seco]

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
3. comercial.py arma salida/mejor-<fecha>[-en|-ja].mp4: la partida entera, sin cortes, con el cuadro de diálogo.
4. Salvo con --sin-plan, entra a youtube.json para salir el día --publicar (por omisión, dos días después de la
   partida, así queda un día para revisarlo) a las 19:00 (es), 19:20 (en) y 19:40 (ja). Lo sube subir-youtube.py.
--seco escribe los guiones y dice el plan, sin armar vídeos ni tocar youtube.json.
"""
import argparse, json, os, re, subprocess, sys, tempfile
from datetime import date, datetime, timedelta, timezone

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import comercial   # narrar(): la misma voz y la misma caché que el vídeo, para medir cuánto dura cada frase

PY = os.path.expanduser('~/Documents/code challenge/.venv/bin/python')
MX = timezone(timedelta(hours=-6))
CORTA, LARGA, CADA = 40, 180, 180   # s: partida muy corta, muy larga, y cada cuánto dice cuántos puntos van
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
    return f'{m}分' if lang == 'ja' else f"{m} {'minutos' if lang == 'es' else 'minutes'}"


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
    nombre_voz = (datos['nombres'].get(info['nombre']) or {}).get(lang)
    if not nombre_voz and lang != 'ja':
        nombre_voz = info['nombre'].title()
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

    for cara, m in lineas:
        decir(cara, m)
    if not corta:
        if larga:   # cada 3 min, cuántos puntos van
            for k in range(1, int((T - 30) // CADA) + 1):
                m = k * CADA
                if m - t > 0.5:
                    tramo(m - t)
                van = dict(valores, min=(minutos(m // 60, lang),) * 2,
                           pts=(f"{info['marcador'][min(m, len(info['marcador']) - 1)]:,}", str(info['marcador'][min(m, len(info['marcador']) - 1)])))
                decir('sorpresa' if k % 2 else 'feliz', marcar(tx['van'][(k - 1) % len(tx['van'])], van))
        if T - 0.3 - t > 0.5:   # la partida sigue, sin voz, hasta que se acaba
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
    a = ap.parse_args()
    fechas = a.fechas or [(datetime.now(MX).date() - timedelta(days=1)).isoformat()]
    idiomas = a.idiomas.split(',')
    datos = json.load(open(os.path.join(AQUI, 'datos-juegos.json'), encoding='utf-8'))
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
            idiomas_f = [l for l in idiomas if f'mejor-{fecha}{SUF[l]}' not in hechos]
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
                if a.sin_plan:
                    continue
                v = entrada(fecha, lang, info, datos, publicar, segundos)
                if v.get('miniatura'):
                    miniatura(fecha, lang, info, video[:-4] + '.png')
                plan = json.load(open(plan_ruta, encoding='utf-8'))
                plan = [x for x in plan if x['clave'] != v['clave']] + [v]
                json.dump(plan, open(plan_ruta, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
                print(f"  plan: {v['clave']} sale el {v['publicar']}")


if __name__ == '__main__':
    main()
