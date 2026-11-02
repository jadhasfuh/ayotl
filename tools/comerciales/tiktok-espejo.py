#!/usr/bin/env python3
"""TikTok como espejo de YouTube (Adrián, 30-oct-2026: «este TikTok será un espejo de YouTube»). TikTok no deja
publicar por API en una cuenta propia (sin auditoría todo sale «solo yo» y la revisión rechaza las apps de uso
personal), así que Adrián los programa a mano en TikTok Studio, que deja programar hasta 10 días antes.

Esto arma ~/Desktop/tiktok/: los vídeos que salen en YouTube en los próximos 10 días, clonados con cp -c (no
ocupan disco) y con la fecha y la hora en el nombre, y textos.html con el título y la descripción que tienen en
YouTube, un botón para copiarlos juntos (TikTok sólo tiene descripción; sin el #shorts) y una casilla para marcar
los ya programados.

  "/Users/jadhasfuh/Documents/code challenge/.venv/bin/python" tools/comerciales/tiktok-espejo.py [--desde AAAA-MM-DD]
      [--retos-desde AAAA-MM-DD] [--seco]

--desde: la primera fecha (para no repetir lo de la tanda anterior); sin ella, dentro de 20 minutos.
--retos-desde: la primera fecha sólo para los retos de ttcode, que se programan semanas antes y no se marcan
  (2-nov-2026: los retos ya estaban programados hasta el 9-nov y los mejores del día atrasados podían salir
  desde ese mismo día: --retos-desde 2026-11-10 sin --desde).
--seco: sólo la lista, sin copiar ni escribir la página.

Qué entra: el Short de cada reto de ttcode (13:00; el horizontal es el mismo vídeo y en TikTok saldría repetido),
de ayotl/public/media/retos/, y los vídeos de LeIA de youtube.json (18:00, 18:20 y 18:40, en es/en/ja), de
salida/ o, los Shorts en español, de public/marketing de DC. Los títulos y las descripciones salen de la API de
YouTube (1 unidad de cuota cada 50 vídeos, con el permiso de ttcode); lo que aún no está subido, de youtube.json
con la misma descripción que le pondrá subir-youtube.py. Un vídeo que ya no está en la compu sale en la página
con el enlace a YouTube Studio para bajarlo (menú ⋮ → Descargar).

Los atrasados (1-nov-2026): lo de youtube.json que entra a una tanda queda marcado con `en_tiktok` (cuándo sale
allí). El mejor del día se arma dos días antes de salir y una tanda abarca 10, así que sale en YouTube sin haber
entrado a ninguna: la siguiente tanda lo mete a su misma hora, en el primer día libre desde el suyo y en orden
(Adrián, 30-oct: «a su misma hora pero en los días siguientes»); los de esa serie que salen dentro de la tanda
también se forman, para no adelantarse a los viejos. Nada sale en TikTok antes que en YouTube, y lo que no cabe
queda para la tanda siguiente. Como leia-mejor-del-dia.py y subir-youtube.py, escribe youtube.json: nunca a la vez.
"""
import datetime as dt, glob, html, importlib.util, json, os, re, subprocess, sys, urllib.parse

HOME = os.path.expanduser('~')
COM = os.path.dirname(os.path.abspath(__file__))
AYOTL = os.path.dirname(os.path.dirname(COM))
TTCODE = f'{HOME}/Documents/code challenge'
DCMK = f'{HOME}/Documents/daily challenge/public/marketing'
FFMPEG = f'{HOME}/Documents/daily challenge/node_modules/ffmpeg-static/ffmpeg'
SALIDA = f'{HOME}/Desktop/tiktok'
MX = dt.timezone(dt.timedelta(hours=-6))   # México centro, sin horario de verano desde 2022
AHORA = dt.datetime.now(MX)
DESDE = AHORA + dt.timedelta(minutes=20)    # TikTok pide al menos 15 minutos
if '--desde' in sys.argv:
    DESDE = max(DESDE, dt.datetime.fromisoformat(sys.argv[sys.argv.index('--desde') + 1] + 'T00:00:00-06:00'))
HASTA = AHORA + dt.timedelta(days=10, minutes=-30)   # y como mucho 10 días
RETOS_DESDE = DESDE
if '--retos-desde' in sys.argv:
    RETOS_DESDE = max(DESDE, dt.datetime.fromisoformat(sys.argv[sys.argv.index('--retos-desde') + 1] + 'T00:00:00-06:00'))
SECO = '--seco' in sys.argv

# Los Shorts en español de LeIA también los sirve DC para Instagram: copia por si salida/ ya se limpió.
COPIAS = {'dc-semana-short': f'{DCMK}/leia-semana.mp4', 'warzone-cpu-short': f'{DCMK}/leia-warzone-cpu.mp4',
          'kazan-cpu-short': f'{DCMK}/leia-kazan-cpu.mp4'}
IDIOMAS = {'es': 'Español', 'en': 'Inglés', 'ja': 'Japonés'}
INICIO = dt.datetime.fromisoformat('2026-10-30T18:00:00-06:00')   # la primera tanda; lo de antes no va a TikTok
# la serie de una clave: sin el idioma ni la fecha («mejor-2026-11-01-en» → «mejor»)
serie = lambda clave: re.sub(r'-\d{4}-\d{2}-\d{2}$', '', re.sub(r'-(en|ja)$', '', clave))

items = []
for ruta in glob.glob(f'{TTCODE}/challenges/*/*/meta.json'):
    m = json.load(open(ruta, encoding='utf-8'))
    if not m.get('published') or not (m.get('youtube') or {}).get('mobile'):
        continue
    cuando = dt.datetime.fromisoformat(m['published'] + 'T13:00:00-06:00')
    if RETOS_DESDE <= cuando <= HASTA:
        items.append({'clave': f"reto {m['slug']}", 'cuando': cuando, 'yt_cuando': cuando, 'id': m['youtube']['mobile'],
                      'idioma': 'en', 'ia': False, 'origen': f"{AYOTL}/public/media/retos/{m['slug']}.mp4"})
en_tanda, cola = [], []
for v in json.load(open(f'{COM}/youtube.json', encoding='utf-8')):
    cuando = dt.datetime.fromisoformat(v['publicar'])
    if v.get('en_tiktok') or not INICIO <= cuando <= HASTA:
        continue
    origen = f"{COM}/{v['video']}"
    if not os.path.exists(origen):
        origen = COPIAS.get(v['clave'], origen)
    # los de LeIA: su imagen y su voz son de IA, TikTok pide marcarlo
    (cola if cuando < DESDE else en_tanda).append({'clave': v['clave'], 'cuando': cuando, 'yt_cuando': cuando, 'id': v.get('id'),
                                                    'idioma': v.get('idioma', 'es'), 'ia': True, 'origen': origen, 'plan': v})
atrasadas = {serie(x['clave']) for x in cola}
cola += [x for x in en_tanda if serie(x['clave']) in atrasadas]
items += [x for x in en_tanda if serie(x['clave']) not in atrasadas]
ocupado = {x['cuando'] for x in items}
for x in sorted(cola, key=lambda x: (x['yt_cuando'], x['clave'])):
    dia = max(DESDE, x['yt_cuando']).date()
    while (hueco := dt.datetime.combine(dia, x['yt_cuando'].timetz())) <= HASTA:
        if hueco >= DESDE and hueco >= x['yt_cuando'] and hueco not in ocupado:
            x['cuando'], x['atrasado'] = hueco, True
            ocupado.add(hueco)
            items.append(x)
            break
        dia += dt.timedelta(days=1)

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
cred = Credentials.from_authorized_user_file(f'{HOME}/.config/ttcode/youtube-token.json', ['https://www.googleapis.com/auth/youtube'])
if cred.expired and cred.refresh_token:
    try:
        cred.refresh(Request())   # sin guardarlo: el archivo del token es de ttcode, que lo renueva él
    except Exception as e:
        sys.exit(f'el permiso de YouTube venció ({e}): «ttcode.py subir-pendientes» lo vuelve a pedir')
yt = build('youtube', 'v3', credentials=cred)
ids = [x['id'] for x in items if x['id']]
datos = {}
for i in range(0, len(ids), 50):
    for v in yt.videos().list(part='snippet,status,contentDetails', id=','.join(ids[i:i + 50])).execute().get('items', []):
        datos[v['id']] = v


def segundos_iso(d):
    m = re.fullmatch(r'P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', d or '')
    if not m:
        return None
    dd, h, mi, s = (int(x or 0) for x in m.groups())
    return ((dd * 24 + h) * 60 + mi) * 60 + s


def duracion(ruta):
    r = subprocess.run([FFMPEG, '-hide_banner', '-i', ruta], capture_output=True, text=True)
    m = re.search(r'Duration: (\d+):(\d+):([\d.]+)', r.stderr)
    return int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3]) if m else None


spec = importlib.util.spec_from_file_location('subir_youtube', f'{COM}/subir-youtube.py')
subir = importlib.util.module_from_spec(spec)
spec.loader.exec_module(subir)

sin_shorts = lambda s: re.sub(r'[ \t]{2,}', ' ', re.sub(r'(?i)\s*#shorts\b', '', s)).strip()
avisos = []
for x in items:
    v = datos.get(x['id']) if x['id'] else None
    if x['id'] and not v:
        avisos.append(f"{x['clave']}: YouTube no devolvió {x['id']}")
    if v:
        x['titulo'], x['descripcion'] = v['snippet']['title'], v['snippet']['description']
        x['yt_seg'] = segundos_iso(v['contentDetails'].get('duration'))
        x['yt_estado'] = v['status']['privacyStatus']
        if v['status'].get('publishAt'):
            cuando = dt.datetime.fromisoformat(v['status']['publishAt'].replace('Z', '+00:00')).astimezone(MX)
            if cuando != x['yt_cuando']:
                avisos.append(f"{x['clave']}: en YouTube sale el {cuando:%d-%m %H:%M}, no el {x['yt_cuando']:%d-%m %H:%M}")
                x['yt_cuando'] = cuando
                if not x.get('atrasado'):
                    x['cuando'] = cuando
    else:
        x['titulo'], x['descripcion'] = x['plan']['titulo'], subir.descripcion(x['plan'])
        x['yt_seg'], x['yt_estado'] = None, 'sin subir'
    x['tiktok'] = sin_shorts(x['titulo']) + '\n\n' + sin_shorts(x['descripcion'])
    if len(x['tiktok']) > 4000:
        avisos.append(f"{x['clave']}: el texto para TikTok pasa de 4000 caracteres ({len(x['tiktok'])})")
    x['nombre'] = f"{x['cuando']:%m-%d %H.%M} {x['clave']}.mp4"
    x['existe'] = os.path.exists(x['origen'])
    if x['existe'] and x['yt_seg'] is not None:
        seg = duracion(x['origen'])
        if seg is not None and abs(seg - x['yt_seg']) > 1.5:
            avisos.append(f"{x['clave']}: el archivo dura {seg:.1f} s y el de YouTube {x['yt_seg']} s: ¿es otro vídeo?")
items.sort(key=lambda x: (x['cuando'], x['clave']))

for x in items:
    atraso = f"(YouTube {x['yt_cuando']:%d-%m}) " if x.get('atrasado') else ''
    print(f"{x['cuando']:%a %d-%m %H:%M}  {'OK   ' if x['existe'] else 'FALTA'}  {x['clave']:<40} {x['yt_estado']:<10} {atraso}{x['titulo'][:56]}")
for a in avisos:
    print('OJO', a)
if SECO or not items:
    sys.exit(0)

DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
e = html.escape
tarjetas, dia_actual = [], None
for n, x in enumerate(items):
    dia = f"{DIAS[x['cuando'].weekday()].capitalize()} {x['cuando'].day}-{MESES[x['cuando'].month - 1]}"
    if dia != dia_actual:
        tarjetas.append(f'<h2>{e(dia)}</h2>')
        dia_actual = dia
    chips = f'<span class="chip">{IDIOMAS[x["idioma"]]}</span>' + ('<span class="chip ia">Marcar «Contenido generado por IA»</span>' if x['ia'] else '')
    if x.get('atrasado'):
        chips += f'<span class="chip">En YouTube salió el {x["yt_cuando"].day}-{MESES[x["yt_cuando"].month - 1]}</span>'
    studio = f'https://studio.youtube.com/video/{x["id"]}/edit' if x['id'] else ''
    if x['existe']:
        medio = f'<video controls preload="metadata" src="{urllib.parse.quote(x["nombre"])}"></video>'
    else:
        medio = ('<div class="falta"><b>Falta el vídeo.</b> Ya no está en la compu, pero sí en YouTube. '
                 + (f'Ábrelo en <a href="{studio}" target="_blank" rel="noopener">YouTube Studio</a>, ' if studio else '')
                 + 'menú ⋮ → Descargar, y súbelo desde Descargas.</div>')
    tarjetas.append(f'''<article class="tarjeta" data-k="{e(x['clave'])}">
  <header><span class="hora">{x['cuando']:%H:%M}</span><span class="archivo">{e(x['nombre'])}</span>{chips}
    <label class="hecho"><input type="checkbox"> Programado</label></header>
  <div class="cuerpo">{medio}
    <div class="textos">
      <p class="rotulo">Título en YouTube</p><textarea readonly rows="2" id="t{n}">{e(x['titulo'])}</textarea>
      <p class="rotulo">Descripción en YouTube</p><textarea readonly rows="7" id="d{n}">{e(x['descripcion'])}</textarea>
      <textarea hidden id="k{n}">{e(x['tiktok'])}</textarea>
      <div class="botones"><button data-c="k{n}" class="principal">Copiar para TikTok</button><button data-c="t{n}">Copiar título</button><button data-c="d{n}">Copiar descripción</button></div>
    </div>
  </div>
</article>''')

listos = sum(1 for x in items if x['existe'])
faltan = len(items) - listos
pagina = f'''<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>TikTok espejo de YouTube</title>
<style>
:root {{ --fondo:#f6f5f2; --tarjeta:#fff; --texto:#1d1d1f; --suave:#6b6b70; --borde:#dcdad4; --acento:#e1306c; --ia:#5b4bd6; --falta:#b3261e; color-scheme: light dark; }}
@media (prefers-color-scheme: dark) {{ :root {{ --fondo:#151517; --tarjeta:#1f1f22; --texto:#ececef; --suave:#a0a0a8; --borde:#34343a; --acento:#ff5c8a; --ia:#9d92ff; --falta:#ff8a80; }} }}
* {{ box-sizing: border-box; }}
body {{ margin:0; background:var(--fondo); color:var(--texto); font:15px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }}
main {{ max-width: 980px; margin: 0 auto; padding: 24px 16px 80px; }}
h1 {{ font-size: 22px; margin: 0 0 6px; }}
h2 {{ font-size: 17px; margin: 28px 0 10px; }}
.resumen {{ color: var(--suave); margin: 0 0 14px; }}
ol.pasos {{ background: var(--tarjeta); border: 1px solid var(--borde); border-radius: 10px; padding: 12px 16px 12px 34px; margin: 0; }}
ol.pasos li {{ margin: 3px 0; }}
.tarjeta {{ background: var(--tarjeta); border: 1px solid var(--borde); border-radius: 10px; padding: 12px; margin: 10px 0; }}
.tarjeta.listo {{ opacity: .55; }}
header {{ display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; margin-bottom: 10px; }}
.hora {{ font-weight: 700; font-size: 17px; }}
.archivo {{ font-family: ui-monospace, Menlo, monospace; font-size: 13px; color: var(--suave); }}
.chip {{ font-size: 12px; border: 1px solid var(--borde); border-radius: 99px; padding: 1px 8px; }}
.chip.ia {{ border-color: var(--ia); color: var(--ia); }}
.hecho {{ margin-left: auto; font-size: 14px; cursor: pointer; white-space: nowrap; }}
.cuerpo {{ display: grid; grid-template-columns: 150px 1fr; gap: 14px; align-items: start; }}
video {{ width: 150px; max-height: 268px; background: #000; border-radius: 6px; }}
.falta {{ font-size: 13px; color: var(--falta); border: 1px dashed var(--falta); border-radius: 6px; padding: 8px; }}
.falta a {{ color: inherit; }}
.rotulo {{ margin: 0 0 3px; font-size: 12px; color: var(--suave); }}
textarea {{ width: 100%; font: 13px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: var(--texto); background: var(--fondo); border: 1px solid var(--borde); border-radius: 6px; padding: 6px 8px; margin-bottom: 8px; resize: vertical; }}
.botones {{ display: flex; flex-wrap: wrap; gap: 8px; }}
button {{ font: inherit; font-size: 14px; padding: 6px 12px; border-radius: 8px; border: 1px solid var(--borde); background: var(--tarjeta); color: var(--texto); cursor: pointer; }}
button.principal {{ background: var(--acento); border-color: var(--acento); color: #fff; font-weight: 600; }}
button.ok {{ outline: 2px solid #2e9d4f; }}
@media (max-width: 600px) {{ .cuerpo {{ grid-template-columns: 1fr; }} video {{ width: 100%; max-height: 420px; }} .hecho {{ margin-left: 0; }} }}
</style></head>
<body><main>
<h1>TikTok: espejo de YouTube</h1>
<p class="resumen">{listos} vídeos listos en esta carpeta{f', {faltan} por bajar de YouTube Studio' if faltan else ''}. Misma hora que en YouTube (hora de México); lo que ya salió allí y aún no está aquí, como el mejor del día, va a su misma hora en los días siguientes. Hecho el {AHORA:%d-%m-%Y %H:%M}.</p>
<ol class="pasos">
  <li>En TikTok Studio, <b>Subir</b> y arrastra el vídeo de esta carpeta (el nombre empieza con la fecha y la hora).</li>
  <li><b>Copiar para TikTok</b> y pégalo en la descripción: es el título y la descripción de YouTube, sin el #shorts.</li>
  <li>Activa <b>Programar</b> y pon el día y la hora de la tarjeta. TikTok deja programar hasta 10 días antes.</li>
  <li>En los de LeIA, en «Mostrar más», activa <b>Contenido generado por IA</b>: su imagen y su voz son de IA.</li>
  <li>Marca <b>Programado</b> aquí para no repetir. Ya programado, el vídeo se puede borrar de la carpeta: TikTok guarda su copia.</li>
</ol>
{''.join(tarjetas)}
</main>
<script>
const CLAVE = 'tiktok-programados';
let hechos = {{}};
try {{ hechos = JSON.parse(localStorage.getItem(CLAVE) || '{{}}'); }} catch (e) {{}}
document.querySelectorAll('.tarjeta').forEach(t => {{
  const caja = t.querySelector('.hecho input'), k = t.dataset.k;
  caja.checked = !!hechos[k]; t.classList.toggle('listo', caja.checked);
  caja.addEventListener('change', () => {{
    hechos[k] = caja.checked; t.classList.toggle('listo', caja.checked);
    try {{ localStorage.setItem(CLAVE, JSON.stringify(hechos)); }} catch (e) {{}}
  }});
}});
document.querySelectorAll('button[data-c]').forEach(b => b.addEventListener('click', async () => {{
  const texto = document.getElementById(b.dataset.c).value;
  try {{ await navigator.clipboard.writeText(texto); }}
  catch (e) {{
    const t = document.createElement('textarea'); t.value = texto; document.body.appendChild(t); t.select();
    document.execCommand('copy'); t.remove();
  }}
  const antes = b.textContent; b.textContent = 'Copiado'; b.classList.add('ok');
  setTimeout(() => {{ b.textContent = antes; b.classList.remove('ok'); }}, 1400);
}}));
</script>
</body></html>
'''
os.makedirs(SALIDA, exist_ok=True)
for x in items:
    if x['existe']:
        subprocess.run(['cp', '-c', x['origen'], os.path.join(SALIDA, x['nombre'])], check=True)
with open(os.path.join(SALIDA, 'textos.html'), 'w', encoding='utf-8') as f:
    f.write(pagina)
# lo que entró a esta tanda queda marcado: no se repite ni se da por atrasado en la siguiente
marcas = {x['clave']: x['cuando'].isoformat() for x in items if 'plan' in x}
plan = json.load(open(f'{COM}/youtube.json', encoding='utf-8'))
for v in plan:
    if v['clave'] in marcas:
        v['en_tiktok'] = marcas[v['clave']]
json.dump(plan, open(f'{COM}/youtube.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'listo: {listos} vídeos y textos.html en {SALIDA}' + (f'; {faltan} por bajar de YouTube Studio' if faltan else ''))
