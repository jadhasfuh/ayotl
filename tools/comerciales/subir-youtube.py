#!/usr/bin/env python3
"""Sube a YouTube (el canal de Adrián, el mismo de los retos de ttcode) los vídeos de youtube.json que aún no
tengan id, programados a su fecha: privados con publishAt, que YouTube hace públicos a esa hora.

  "/Users/jadhasfuh/Documents/code challenge/.venv/bin/python" tools/comerciales/subir-youtube.py [--max 15] [--solo prefijo] [--seco]

Usa ttcode/youtube.py (el permiso OAuth vive allí y vence cada 7 días mientras la app de Google Cloud esté en
«Prueba»: si venció, abre el navegador para volver a darlo). Cuota: desde el 1-jun-2026 (historial de cambios
de la API) videos.insert tiene su propia cubeta de 100 subidas al día; el update, la miniatura y la lista
(50 cada uno) salen de las 10 000 unidades de todo lo demás: unos 66 vídeos al día. Antes una subida costaba
1 600 y no cabían más de 5. Lo que topa ahora es el límite diario del canal, que YouTube no publica
(uploadLimitExceeded): con ese error, o con el de cuota, se para y lo demás sube al día siguiente. El id se
apunta en youtube.json.

Adrián, 27-oct-2026: el título empieza con la app en mayúsculas («DAILY CHALLENGE: Semana del 20/10 al 26/10»,
«JLPTEST: Vocabulario N5»); la descripción lleva los enlaces a la página y, cuando la app ya es pública en la
tienda, a Google Play y a la App Store (se comprueba al subir: la ficha de Play da 200, la de Apple sale en
el lookup de iTunes); y cada vídeo va a la lista de reproducción de su app («Daily Challenge» ya existía; las
otras se crean solas). Cada entrada del plan dice su `app` (dc, warzone, kazan, jlptest) y, si no es en español, su `idioma` (en, ja: las
versiones de los vídeos de LeIA, que salen el mismo día que la española, a las 18:20 y 18:40). Los capítulos salen
de <vídeo>.capitulos.json si existe. Una entrada con id y `"actualizar": true` no se sube: se le cambian
título, descripción y lista (p. ej. la que Adrián subió a mano) y se le quita la marca.
"""
import json, os, subprocess, sys
from datetime import datetime, timedelta, timezone

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.expanduser('~/Documents/code challenge'))
PLAN = os.path.join(AQUI, 'youtube.json')

APPS = {
    'dc': {'nombre': 'Daily Challenge', 'web': 'https://dailychallenge.click', 'juega': 'juega', 'play': 'click.dailychallenge.twa', 'ios': None},
    'warzone': {'nombre': 'War Zone', 'web': 'https://dailychallenge.click/warzone', 'juega': 'juega', 'play': 'dev.ayotl.warzone', 'ios': 'dev.ayotl.warzone'},
    'kazan': {'nombre': 'Kazan', 'web': 'https://kazan.dailychallenge.click', 'juega': 'juega', 'play': 'dev.ayotl.kazan', 'ios': 'dev.ayotl.kazan'},
    'zanei': {'nombre': 'ZANEI', 'web': 'https://dailychallenge.click/zanei', 'juega': 'juega', 'play': 'dev.ayotl.zanei', 'ios': 'dev.ayotl.zanei'},
    'jlptest': {'nombre': 'jlptest', 'web': 'https://jlptest.org', 'juega': 'practica', 'play': 'org.jlptest.twa', 'ios': None},
    # «Algoritmos en pixel» (9-nov-2026): Shorts con su lección en ayotl.dev/aprende; una lista por idioma
    'algoritmos': {'nombre': 'Algoritmos', 'web': 'https://ayotl.dev/aprende/algoritmos', 'juega': 'aprende', 'play': None, 'ios': None},
    'algorithms': {'nombre': 'Algorithms', 'web': 'https://ayotl.dev/en/learn/algoritmos', 'juega': 'aprende', 'play': None, 'ios': None},
}
# los textos fijos de la descripción por idioma del vídeo (`idioma` en la entrada; sin él, español)
TEXTOS = {
    'es': {'juega': '▶ Juega gratis en el navegador', 'practica': '▶ Practica gratis', 'play': '📱 Android, en Google Play', 'ios': '🍎 iPhone y iPad, en la App Store',
           'capitulos': 'Capítulos', 'mas': 'Más apps y juegos de Ayotl', 'aprende': '▶ El curso, con el código y ejercicios, gratis'},
    'en': {'juega': '▶ Play free in the browser', 'practica': '▶ Practice for free', 'play': '📱 Android, on Google Play', 'ios': '🍎 iPhone and iPad, on the App Store',
           'capitulos': 'Chapters', 'mas': 'More apps and games by Ayotl', 'aprende': '▶ The course, with the code and exercises, free'},
    'ja': {'juega': '▶ ブラウザで無料で遊べます', 'practica': '▶ 無料で練習', 'play': '📱 Android（Google Play）', 'ios': '🍎 iPhone・iPad（App Store）',
           'capitulos': 'チャプター', 'mas': 'Ayotlのほかのアプリとゲーム', 'aprende': '▶ コースとコード・練習問題（無料）'},
}
_tiendas = {}


def minuto(t):
    t = int(round(t)); return f'{t // 60}:{t % 60:02d}'


def en_play(paquete):
    """La ficha pública de Google Play, si ya existe (200); antes, 404."""
    r = subprocess.run(['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '20',
                        f'https://play.google.com/store/apps/details?id={paquete}&hl=es'], capture_output=True, text=True)
    return f'https://play.google.com/store/apps/details?id={paquete}' if r.stdout.strip() == '200' else None


def en_app_store(bundle):
    """La ficha de la App Store, si la app ya está publicada (el lookup de iTunes la devuelve)."""
    r = subprocess.run(['curl', '-s', '--max-time', '20', f'https://itunes.apple.com/lookup?bundleId={bundle}&country=us'], capture_output=True, text=True)
    try:
        res = json.loads(r.stdout).get('results') or []
    except ValueError:
        res = []
    # la ficha sin país ni ?uo=4: Apple manda a la tienda de quien la abre
    return f"https://apps.apple.com/app/id{res[0]['trackId']}" if res and res[0].get('trackId') else None


def enlaces(app, idioma='es'):
    """Las líneas de enlaces de una app: la página siempre; las tiendas, cuando ya son públicas."""
    a = APPS[app]; t = TEXTOS[idioma]
    if app not in _tiendas:
        _tiendas[app] = (en_play(a['play']) if a['play'] else None, en_app_store(a['ios']) if a['ios'] else None)
    play, ios = _tiendas[app]
    lineas = [f"{t[a['juega']]}: {a['web']}"]
    if play:
        lineas.append(f"{t['play']}: {play}")
    if ios:
        lineas.append(f"{t['ios']}: {ios}")
    return '\n'.join(lineas)


def descripcion(v):
    idioma = v.get('idioma', 'es'); t = TEXTOS[idioma]
    partes = [v['descripcion'].rstrip(), enlaces(v['app'], idioma)]
    caps = os.path.join(AQUI, v['video'][:-4] + '.capitulos.json')
    if os.path.exists(caps):
        lista = json.load(open(caps, encoding='utf-8'))
        if len(lista) >= 3 and lista[0]['t'] == 0:   # YouTube pide empezar en 0:00 y al menos tres
            partes.append(t['capitulos'] + '\n' + '\n'.join(f"{minuto(c['t'])} {c['titulo']}" for c in lista))
    partes.append(f"{t['mas']}: https://ayotl.dev")
    if v.get('cierre'):
        partes.append(v['cierre'])
    return '\n\n'.join(partes)


def revisar(v):
    if len(v['titulo']) > 100:
        sys.exit(f"{v['clave']}: el título pasa de 100 caracteres ({len(v['titulo'])})")
    if v.get('app') not in APPS:
        sys.exit(f"{v['clave']}: sin app conocida ({v.get('app')})")
    if not v['titulo'].startswith(APPS[v['app']]['nombre'].upper() + ':'):
        print(f"  ojo: {v['clave']} no empieza con «{APPS[v['app']]['nombre'].upper()}:»")


def main():
    tope = int(sys.argv[sys.argv.index('--max') + 1]) if '--max' in sys.argv else 15
    seco = '--seco' in sys.argv
    solo = sys.argv[sys.argv.index('--solo') + 1] if '--solo' in sys.argv else ''   # sólo las claves que empiezan así
    plan = json.load(open(PLAN, encoding='utf-8'))
    # por fecha de salida: el «mejor del día» se agrega cada mañana al final del plan y sale antes que lo programado para después
    pendientes = sorted((v for v in plan if not v.get('id') and v['clave'].startswith(solo)), key=lambda v: v['publicar'])
    ahora = datetime.now(timezone.utc) + timedelta(minutes=20)
    vencidos = [v for v in pendientes if datetime.fromisoformat(v['publicar']) < ahora]
    for v in vencidos:
        print(f"  ojo: {v['clave']} tenía que salir el {v['publicar']}: no se sube; cámbiale `publicar` en youtube.json")
    pendientes = [v for v in pendientes if v not in vencidos]
    cambios = [v for v in plan if v.get('id') and v.get('actualizar')]
    print(f'{len(pendientes)} por subir (esta vez hasta {tope}); {len(cambios)} por actualizar')
    for v in cambios + pendientes[:tope]:
        revisar(v)
    if seco:
        for v in cambios + pendientes[:tope]:
            print('\n==', v['clave'], v['publicar'], '| lista:', APPS[v['app']]['nombre']); print(v['titulo']); print(descripcion(v))
        return
    from googleapiclient.errors import HttpError
    from ttcode.youtube import actualizar_video, subir_video
    for v in cambios:
        print('== actualizar', v['clave'], v['id'])
        actualizar_video(v['id'], v['titulo'], descripcion(v), v['etiquetas'], categoria=v['categoria'], idioma=v.get('idioma', 'es'),
                         lista=APPS[v['app']]['nombre'])
        del v['actualizar']
        json.dump(plan, open(PLAN, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    for v in pendientes[:tope]:
        mp4 = os.path.join(AQUI, v['video'])
        if not os.path.exists(mp4):
            print('falta', mp4); continue
        print('==', v['clave'], '->', v['publicar'])
        mini = os.path.join(AQUI, v['miniatura']) if v.get('miniatura') else None
        try:
            v['id'] = subir_video(v['titulo'], descripcion(v), v['etiquetas'], mp4, mini, programar=v['publicar'],
                                  categoria=v['categoria'], idioma=v.get('idioma', 'es'), lista=APPS[v['app']]['nombre'])
        except HttpError as e:
            # el tope diario del canal o la cuota: lo que falta se sube mañana
            if 'uploadlimitexceeded' in str(e).lower() or 'quota' in str(e).lower():
                print(f'  tope del día ({e.status_code}): lo demás se sube mañana')
                break
            raise
        json.dump(plan, open(PLAN, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('listo')


if __name__ == '__main__':
    main()
