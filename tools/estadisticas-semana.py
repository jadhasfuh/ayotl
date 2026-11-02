#!/usr/bin/env python3
"""Las estadísticas de la semana de todas las apps, en un solo reporte (Adrián, 2-nov-2026: «dame las estadísticas
de todas las apps de la última semana» y «pon las mejoras que detectes para estas estadísticas»).

  "/Users/jadhasfuh/Documents/code challenge/.venv/bin/python" tools/estadisticas-semana.py [--hasta AAAA-MM-DD] [--sin-youtube]

La semana son los 7 días de México que acaban en --hasta (por omisión, ayer), y se compara con la anterior.
De dónde sale cada cosa (ninguna llave se imprime):
- Visitas de los 7 sitios: ayotl.visitas_por_dia / visitantes / visitas (la base compartida, llave secreta de
  jlptest/.env.local). Las apps nativas (Kazan, War Zone, La procesión) no cuentan: su dominio es localhost.
- Daily Challenge: arcade.partidas (las del reto: partidas, jugadores, reintentos), perfiles nuevos y prácticas.
- jlptest: perfiles nuevos y el evento «cuenta» de ayotl.eventos.
- War Zone: warzone.salas y jugadores, con la llave pública del juego (como el juego mismo).
- Kazan: /rondas del servidor (desde el 2-nov-2026 apunta cada ronda del reto: personas, aparatos, entradas).
- Mercadito: menu_eventos y altas de su propia base (~/.pgpass, línea 1), sólo conteos.
- YouTube: el canal y sus vídeos con el permiso de ttcode. La API de datos no da vistas por semana, así que cada
  corrida guarda una foto de las vistas de cada vídeo en tools/estadisticas/ (fuera de git) y la semana sale de
  restar la foto más cercana de 7 días antes; sin foto previa, sólo los totales y lo publicado en la semana.
No cubre: descargas de Play y de la App Store, ingresos de AdMob ni alcance en Facebook e Instagram (sus consolas).
"""
import argparse, glob, json, os, re, ssl, subprocess, sys, urllib.request
from collections import Counter, defaultdict
from datetime import date, datetime, timedelta, timezone

import certifi

AQUI = os.path.dirname(os.path.abspath(__file__))
FOTOS = os.path.join(AQUI, 'estadisticas')
MX = timezone(timedelta(hours=-6))
CTX = ssl.create_default_context(cafile=certifi.where())
HOME = os.path.expanduser('~')


def llaves():
    env = {}
    for l in open(f'{HOME}/Documents/jlptest/.env.local', encoding='utf-8'):
        k, _, v = l.strip().partition('=')
        if k in ('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SECRET_KEY'):
            env[k] = v.strip('"\'')
    pub = re.search(r"['\"](sb_publishable_[^'\"]+)['\"]", open(f'{HOME}/Documents/daily challenge/public/warzone/net-config.js').read()).group(1)
    return env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SECRET_KEY'], pub


URL, KEY, PUB = llaves()


def rest(ruta, perfil='public', llave=None):
    """Todas las filas (de mil en mil), o {'error': …} si PostgREST se niega."""
    filas, desde = [], 0
    while True:
        req = urllib.request.Request(f'{URL}/rest/v1/{ruta}', headers={'apikey': llave or KEY, 'Accept-Profile': perfil, 'Range': f'{desde}-{desde + 999}'})
        try:
            r = json.load(urllib.request.urlopen(req, context=CTX, timeout=30))
        except urllib.error.HTTPError as e:
            return {'error': e.code}
        filas += r
        if len(r) < 1000:
            return filas
        desde += 1000


def cambio(a, b):
    if not b:
        return ''
    return f' ({"+" if a >= b else ""}{round(100 * (a - b) / b)} % contra la anterior)'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--hasta')
    ap.add_argument('--sin-youtube', action='store_true')
    a = ap.parse_args()
    fin = date.fromisoformat(a.hasta) if a.hasta else datetime.now(MX).date() - timedelta(days=1)
    ini, ant = fin - timedelta(days=6), fin - timedelta(days=13)
    I, F, A = ini.isoformat(), fin.isoformat(), ant.isoformat()
    tz = lambda d: f'{d.isoformat()}T06:00:00Z'   # el día de México empieza a las 06:00 UTC
    T0, T1, TA = tz(ini), tz(fin + timedelta(days=1)), tz(ant)
    sem = lambda f: I <= f <= F
    previa = lambda f: A <= f < I
    print(f'# Estadísticas del {ini:%d-%m} al {fin:%d-%m-%Y}\n')

    # ---- visitas ----
    dias = rest(f'visitas_por_dia?select=*&fecha=gte.{A}&fecha=lte.{F}', 'ayotl')
    vis, visp, por_dia = defaultdict(lambda: [0, 0]), Counter(), Counter()
    for r in dias:
        if sem(r['fecha']):
            vis[r['sitio']][0] += r['visitantes']; vis[r['sitio']][1] += r['vistas']; por_dia[r['fecha']] += r['visitantes']
        elif previa(r['fecha']):
            visp[r['sitio']] += r['visitantes']
    print('## Visitas web (visitantes por día, sumados; vistas)')
    for s, (u, v) in sorted(vis.items(), key=lambda x: -x[1][0]):
        print(f'- {s}: {u} visitantes, {v} vistas{cambio(u, visp[s])}')
    print(f'- por día: ' + ', '.join(f'{d[8:]}: {n}' for d, n in sorted(por_dia.items())))
    gente = rest(f'visitantes?select=*&fecha=gte.{I}&fecha=lte.{F}', 'ayotl')
    pais, origen, movil = Counter(), Counter(), Counter()
    for r in gente:
        pais[r['pais']] += r['visitantes']; origen[r['origen']] += r['visitantes']; movil['móvil' if r['movil'] else 'escritorio'] += r['visitantes']
    print(f'- países: {", ".join(f"{p} {n}" for p, n in pais.most_common(6))}')
    print(f'- orígenes: {", ".join(f"{o} {n}" for o, n in origen.most_common(7))}')
    print(f'- móvil {movil["móvil"]}, escritorio {movil["escritorio"]}\n')

    # ---- Daily Challenge ----
    pa = rest(f'partidas?select=fecha,usuario,intento&fecha=gte.{A}&fecha=lte.{F}', 'arcade')
    x, xp = [p for p in pa if sem(p['fecha'])], [p for p in pa if previa(p['fecha'])]
    jug = len({p['usuario'] for p in x})
    perf = rest(f'perfiles?select=creado_en&creado_en=gte.{TA}&creado_en=lt.{T1}', 'arcade')
    nuevos = sum(p['creado_en'] >= T0 for p in perf)
    pr = rest(f'practicas?select=fecha,partidas&fecha=gte.{A}&fecha=lte.{F}', 'arcade')
    print('## Daily Challenge')
    print(f'- partidas del reto: {len(x)}{cambio(len(x), len(xp))}, de {jug} jugadores (antes {len({p["usuario"] for p in xp})}); {sum(p["intento"] > 1 for p in x)} con ticket')
    print(f'- perfiles nuevos: {nuevos} (antes {len(perf) - nuevos}); prácticas: {sum(p["partidas"] for p in pr if sem(p["fecha"]))}\n')

    # ---- jlptest ----
    jl = rest(f'perfiles?select=creado&creado=gte.{TA}&creado=lt.{T1}')
    ev = rest(f'eventos?select=fecha,evento,veces&fecha=gte.{I}&fecha=lte.{F}', 'ayotl')
    print('## jlptest')
    print(f'- cuentas nuevas: {sum(p["creado"] >= T0 for p in jl)} (antes {sum(p["creado"] < T0 for p in jl)}); total {len(rest("perfiles?select=id"))}')
    print(f'- evento «cuenta» en ayotl.eventos: {sum(e["veces"] for e in ev if e["evento"] == "cuenta")}\n')

    # ---- War Zone ----
    salas = rest(f'salas?select=estado,creada&creada=gte.{T0}&creada=lt.{T1}', 'warzone', PUB)
    jw = rest('jugadores?select=nombre,actualizado', 'warzone', PUB)
    pw = rest(f'partidas?select=*', 'warzone', PUB)
    print('## War Zone (en línea)')
    print(f'- salas creadas: {len(salas)} ({dict(Counter(s["estado"] for s in salas))}); partidas en línea terminadas (total): {len(pw) if isinstance(pw, list) else pw}')
    print(f'- nombres activos en la semana: {sum(T0 <= (j["actualizado"] or "") < T1 for j in jw)}\n')

    # ---- Kazan ----
    print('## Kazan (el reto de la isla)')
    try:
        k = json.load(urllib.request.urlopen('https://kazan.dailychallenge.click/rondas', context=CTX, timeout=20))
        ms = lambda t: datetime.fromtimestamp(t / 1000, MX)
        for r in [r for r in k['rondas'] if r.get('fin') and ini <= ms(r['fin']).date() <= fin + timedelta(days=1)] + ([k['actual']] if k.get('actual') else []):
            p = r.get('primero') or {}
            print(f'- ronda del {ms(r["inicio"]):%d-%m %H:%M}{" (en curso)" if not r.get("fin") else ""}: {r["personas"]} personas, {r["aparatos"]} aparatos, '
                  f'{r["entradas"]} entradas, máximo {r["pico"]} a la vez; va primero {p.get("nombre")}{" (CPU)" if p.get("cpu") else ""}')
    except Exception as e:
        print(f'- /rondas no contestó ({e.__class__.__name__}); el servidor anterior al 2-nov no lo tenía')
    print()

    # ---- Mercadito ----
    print('## Mercadito')
    mdb = subprocess.run(['awk', '-F:', 'NR==1{printf "postgresql://%s@%s:%s/%s",$4,$1,$2,$3}', f'{HOME}/.pgpass'], capture_output=True, text=True).stdout
    q = (f"select tipo, count(*), count(distinct session_id) from menu_eventos where created_at >= '{T0}' and created_at < '{T1}' group by 1 order by 2 desc;"
         f"select 'previa', count(*) from menu_eventos where created_at >= '{TA}' and created_at < '{T0}';"
         f"select 'usuarios', count(*) from usuarios where created_at >= '{T0}' and created_at < '{T1}';"
         f"select 'pedidos', count(*) from pedidos where created_at >= '{T0}' and created_at < '{T1}';")
    r = subprocess.run(['/opt/homebrew/opt/libpq/bin/psql', mdb, '-At', '-F', ' ', '-c', q], capture_output=True, text=True)
    for l in (r.stdout or r.stderr).strip().splitlines():
        print(f'- {l}')
    print()

    # ---- YouTube ----
    if a.sin_youtube:
        return
    sys.path.insert(0, f'{HOME}/Documents/code challenge')
    from ttcode.youtube import _servicio
    yt = _servicio()
    ch = yt.channels().list(part='statistics,contentDetails', mine=True).execute()['items'][0]
    up, ids, tok = ch['contentDetails']['relatedPlaylists']['uploads'], [], None
    while True:
        r = yt.playlistItems().list(part='contentDetails', playlistId=up, maxResults=50, pageToken=tok).execute()
        ids += [i['contentDetails']['videoId'] for i in r['items']]; tok = r.get('nextPageToken')
        if not tok:
            break
    vids = []
    for i in range(0, len(ids), 50):
        vids += yt.videos().list(part='snippet,statistics,status', id=','.join(ids[i:i + 50])).execute()['items']
    foto = {v['id']: int(v['statistics'].get('viewCount', 0)) for v in vids}
    os.makedirs(FOTOS, exist_ok=True)
    hoy = datetime.now(MX).date()
    json.dump({'fecha': hoy.isoformat(), 'vistas': foto, 'suscriptores': int(ch['statistics']['subscriberCount'])},
              open(os.path.join(FOTOS, f'youtube-{hoy}.json'), 'w'))
    app = lambda t: next((k for k in ('DAILY CHALLENGE', 'WAR ZONE', 'KAZAN', 'JLPTEST') if t.upper().startswith(k)), 'ttcode y otros')
    print(f'## YouTube ({ch["statistics"]["subscriberCount"]} suscriptores)')
    nuevos = [v for v in vids if T0 <= v['snippet']['publishedAt'] < T1 and v['status']['privacyStatus'] == 'public']
    porapp = defaultdict(lambda: [0, 0])
    for v in nuevos:
        porapp[app(v['snippet']['title'])][0] += 1; porapp[app(v['snippet']['title'])][1] += foto[v['id']]
    print(f'- salieron {len(nuevos)} vídeos con {sum(n for _, n in porapp.values())} vistas hasta hoy: ' + ', '.join(f'{k} {n} ({c})' for k, (c, n) in sorted(porapp.items(), key=lambda x: -x[1][1])))
    # la semana de verdad: contra la foto más cercana a 7 días antes
    antes = sorted(glob.glob(os.path.join(FOTOS, 'youtube-*.json')))
    base = [f for f in antes if f < os.path.join(FOTOS, f'youtube-{hoy - timedelta(days=6)}.json')]
    if base:
        b = json.load(open(base[-1]))
        ganadas = defaultdict(int)
        titulo = {v['id']: v['snippet']['title'] for v in vids}
        for i, n in foto.items():
            ganadas[app(titulo[i])] += n - b['vistas'].get(i, 0)
        print(f'- vistas ganadas desde el {b["fecha"]}: {sum(ganadas.values())} (' + ', '.join(f'{k} {n}' for k, n in sorted(ganadas.items(), key=lambda x: -x[1])) + f'); suscriptores {b["suscriptores"]} → {ch["statistics"]["subscriberCount"]}')
    else:
        print('- sin foto de hace una semana: desde la próxima corrida sale cuántas vistas ganó cada app en la semana')


if __name__ == '__main__':
    main()
