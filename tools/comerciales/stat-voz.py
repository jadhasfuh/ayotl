#!/usr/bin/env python3
"""La voz de LeIA para el Daily Stat (27-oct-2026): dos frases por dato, grabadas con Google (Chirp 3 HD
Achernar, la de LeIA) en daily challenge/public/content/stats/voz/<id>-1.mp3 (el título, al teclearse la
cabecera) y <id>-2.mp3 (el remate), más cierre.mp3, la misma invitación para todos en la pantalla final
(28-oct-2026; Adrián: que el reel termine diciendo que entren, no repitiendo el dato). El servidor de DC
las mezcla al generar el reel (tools/stat-reel.js); si un dato no tiene voz, el reel sale como antes.
Idempotente: sólo graba lo que falte.

  python3 tools/comerciales/stat-voz.py [--rehacer [id,id…]]

--rehacer a secas vuelve a grabar todo; con ids, sólo esos datos (al corregir su título o su remate). Con
DC_RAIZ=<carpeta> trabaja sobre otra copia de Daily Challenge (un worktree sobre origin/main).

Lo que se dice sale de stats.json: el título y el subtítulo tal cual («Las empresas más viejas, y qué hacían
cuando nacieron») y el remate. Los números se leen como están: Chirp los dice bien en español.
"""
import hashlib, json, os, re, shutil, statistics, subprocess, sys, tempfile

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import comercial as C

DC = os.environ.get('DC_RAIZ') or os.path.expanduser('~/Documents/daily challenge')   # DC_RAIZ: un worktree sobre origin/main (el main local suele ir atrasado)
STATS = os.path.join(DC, 'public/content/stats/stats.json')
VOZ = os.path.join(DC, 'public/content/stats/voz')
NOMBRE, IDIOMA = 'es-US-Chirp3-HD-Achernar', 'es-US'
CIERRE = 'Juega gratis en Daily Challenge punto click. ¡Y síguenos para el dato de mañana!'   # voz/cierre.mp3


def frases(s):
    # El título va en MAYÚSCULAS en stats.json y el subtítulo no: se baja el título solo. Antes se miraba si TODO
    # (título y subtítulo) iba en mayúsculas, que nunca pasa, y a la voz le llegaba «LOS KICKSTARTERS más grandes…»:
    # una palabra rara en mayúsculas la deletrea (16-nov-2026; Adrián: «leyó el título deletreado»).
    t = s['titulo'].strip()
    t = t[0] + t[1:].lower() if t.isupper() else t
    titulo = f"{t} {s['subtitulo']}".strip()
    return [f'Daily Stat. {titulo}.', s['remate']]


def revisar(stats):
    """Cuánto dura la voz del título por cada letra de su texto, contra la mediana. Una voz que deletrea tarda mucho
    más que una que lee (16-nov-2026: «LOS KICKSTARTERS…» medía 1.61 veces lo normal; las buenas, de 0.79 a 1.16).
    No sustituye a oírla, pero avisa sin tener que escuchar la tanda entera."""
    import imageio_ffmpeg
    ff = imageio_ffmpeg.get_ffmpeg_exe(); filas = []
    for s in stats:
        ruta = os.path.join(VOZ, f"{s['id']}-1.mp3")
        if not os.path.exists(ruta):
            continue
        m = re.search(r'Duration: (\d+):(\d+):([\d.]+)', subprocess.run([ff, '-i', ruta], capture_output=True, text=True).stderr)
        if m:
            filas.append((s['id'], (int(m[2]) * 60 + float(m[3])) / len(frases(s)[0])))
    if len(filas) < 5:
        return
    mediana = statistics.median(r for _, r in filas)
    raras = [(i, r / mediana) for i, r in filas if r > mediana * 1.3]
    for i, x in raras:
        print(f'  ojo: la voz de «{i}» dura {x:.2f} veces lo normal para sus letras: ¿deletrea algo? Escúchala')
    print(f'  duración por letra: mediana {mediana:.3f} s, {len(raras)} de {len(filas)} fuera de lo normal')


def main():
    rehacer = '--rehacer' in sys.argv
    sigue = sys.argv[sys.argv.index('--rehacer') + 1:] if rehacer else []
    solo = set(sigue[0].split(',')) if sigue and not sigue[0].startswith('-') else set()
    stats = json.load(open(STATS, encoding='utf-8'))['stats']
    os.makedirs(VOZ, exist_ok=True)
    hechas = 0
    with tempfile.TemporaryDirectory() as tmp:
        os.chmod(tmp, 0o700)
        cab = os.path.join(tmp, 'h.txt')
        with open(cab, 'w') as h:
            h.write(f'X-Goog-Api-Key: {C.clave()}\n')
        os.chmod(cab, 0o600)
        pendientes = [('cierre', CIERRE)]
        for s in stats:
            pendientes += [(f"{s['id']}-{k}", texto) for k, texto in enumerate(frases(s), 1)]
        for nombre, texto in pendientes:
            destino = os.path.join(VOZ, f'{nombre}.mp3')
            if os.path.exists(destino) and not (rehacer and (not solo or nombre.rsplit('-', 1)[0] in solo)):
                continue
            C.narrar(texto, NOMBRE, IDIOMA, cab)   # queda en la caché de comercial.py, por huella
            huella = hashlib.sha1(f'{NOMBRE}|{IDIOMA}|{texto}'.encode()).hexdigest()[:20]
            shutil.copy(os.path.join(C.CACHE, huella + '.mp3'), destino); hechas += 1
    print(f'{len(stats)} datos y el cierre, {hechas} frases grabadas, en {VOZ}')
    revisar(stats)


if __name__ == '__main__':
    main()
