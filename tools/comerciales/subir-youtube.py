#!/usr/bin/env python3
"""Sube a YouTube (el canal de Adrián, el mismo de los retos de ttcode) los vídeos de youtube.json que aún no
tengan id, programados a su fecha: privados con publishAt, que YouTube hace públicos a esa hora.

  "/Users/jadhasfuh/Documents/code challenge/.venv/bin/python" tools/comerciales/subir-youtube.py [--max 3] [--seco]

Usa ttcode/youtube.py (el permiso OAuth vive allí y vence cada 7 días mientras la app de Google Cloud esté en
«Prueba»: si venció, abre el navegador para volver a darlo). Cuota: 10 000 al día; cada subida cuesta 1 600,
más 50 del update, 50 de la miniatura y 50 de la lista: caben 5 al día, y menos si ese día también suben
retos de ttcode. El id se apunta en youtube.json.

Adrián, 27-oct-2026: el título empieza con la app en mayúsculas («DAILY CHALLENGE: Semana del 20/10 al 26/10»,
«JLPTEST: Vocabulario N5»); la descripción lleva los enlaces a la página y, cuando la app ya es pública en la
tienda, a Google Play y a la App Store (se comprueba al subir: la ficha de Play da 200, la de Apple sale en
el lookup de iTunes); y cada vídeo va a la lista de reproducción de su app («Daily Challenge» ya existía; las
otras se crean solas). Cada entrada del plan dice su `app` (dc, warzone, kazan, jlptest). Los capítulos salen
de <vídeo>.capitulos.json si existe. Una entrada con id y `"actualizar": true` no se sube: se le cambian
título, descripción y lista (p. ej. la que Adrián subió a mano) y se le quita la marca.
"""
import json, os, subprocess, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.expanduser('~/Documents/code challenge'))
PLAN = os.path.join(AQUI, 'youtube.json')

APPS = {
    'dc': {'nombre': 'Daily Challenge', 'web': 'https://dailychallenge.click', 'juega': 'Juega gratis en el navegador',
           'play': 'click.dailychallenge.twa', 'ios': None},
    'warzone': {'nombre': 'War Zone', 'web': 'https://dailychallenge.click/warzone', 'juega': 'Juega gratis en el navegador',
                'play': 'dev.ayotl.warzone', 'ios': 'dev.ayotl.warzone'},
    'kazan': {'nombre': 'Kazan', 'web': 'https://kazan.dailychallenge.click', 'juega': 'Juega gratis en el navegador',
              'play': 'dev.ayotl.kazan', 'ios': 'dev.ayotl.kazan'},
    'jlptest': {'nombre': 'jlptest', 'web': 'https://jlptest.org', 'juega': 'Practica gratis',
                'play': 'org.jlptest.twa', 'ios': None},
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
    r = subprocess.run(['curl', '-s', '--max-time', '20', f'https://itunes.apple.com/lookup?bundleId={bundle}'], capture_output=True, text=True)
    try:
        res = json.loads(r.stdout).get('results') or []
    except ValueError:
        res = []
    return res[0].get('trackViewUrl') if res else None


def enlaces(app):
    """Las líneas de enlaces de una app: la página siempre; las tiendas, cuando ya son públicas."""
    a = APPS[app]
    if app not in _tiendas:
        _tiendas[app] = (en_play(a['play']) if a['play'] else None, en_app_store(a['ios']) if a['ios'] else None)
    play, ios = _tiendas[app]
    lineas = [f"▶ {a['juega']}: {a['web']}"]
    if play:
        lineas.append(f'📱 Android, en Google Play: {play}')
    if ios:
        lineas.append(f'🍎 iPhone y iPad, en la App Store: {ios}')
    return '\n'.join(lineas)


def descripcion(v):
    partes = [v['descripcion'].rstrip(), enlaces(v['app'])]
    caps = os.path.join(AQUI, v['video'][:-4] + '.capitulos.json')
    if os.path.exists(caps):
        lista = json.load(open(caps, encoding='utf-8'))
        if len(lista) >= 3 and lista[0]['t'] == 0:   # YouTube pide empezar en 0:00 y al menos tres
            partes.append('Capítulos\n' + '\n'.join(f"{minuto(c['t'])} {c['titulo']}" for c in lista))
    partes.append('Más apps y juegos de Ayotl: https://ayotl.dev')
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
    tope = int(sys.argv[sys.argv.index('--max') + 1]) if '--max' in sys.argv else 3
    seco = '--seco' in sys.argv
    plan = json.load(open(PLAN, encoding='utf-8'))
    pendientes = [v for v in plan if not v.get('id')]
    cambios = [v for v in plan if v.get('id') and v.get('actualizar')]
    print(f'{len(pendientes)} por subir (esta vez hasta {tope}); {len(cambios)} por actualizar')
    for v in cambios + pendientes[:tope]:
        revisar(v)
    if seco:
        for v in cambios + pendientes[:tope]:
            print('\n==', v['clave'], v['publicar'], '| lista:', APPS[v['app']]['nombre']); print(v['titulo']); print(descripcion(v))
        return
    from ttcode.youtube import actualizar_video, subir_video
    for v in cambios:
        print('== actualizar', v['clave'], v['id'])
        actualizar_video(v['id'], v['titulo'], descripcion(v), v['etiquetas'], categoria=v['categoria'], idioma='es',
                         lista=APPS[v['app']]['nombre'])
        del v['actualizar']
        json.dump(plan, open(PLAN, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    for v in pendientes[:tope]:
        mp4 = os.path.join(AQUI, v['video'])
        if not os.path.exists(mp4):
            print('falta', mp4); continue
        print('==', v['clave'], '->', v['publicar'])
        mini = os.path.join(AQUI, v['miniatura']) if v.get('miniatura') else None
        v['id'] = subir_video(v['titulo'], descripcion(v), v['etiquetas'], mp4, mini, programar=v['publicar'],
                              categoria=v['categoria'], idioma='es', lista=APPS[v['app']]['nombre'])
        json.dump(plan, open(PLAN, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('listo')


if __name__ == '__main__':
    main()
