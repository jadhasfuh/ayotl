#!/usr/bin/env python3
"""Sube a YouTube (el canal de Adrián, el mismo de los retos de ttcode) los vídeos de youtube.json que aún no
tengan id, programados a su fecha: privados con publishAt, que YouTube hace públicos a esa hora.

  "/Users/jadhasfuh/Documents/code challenge/.venv/bin/python" tools/comerciales/subir-youtube.py [--max 3] [--seco]

Usa ttcode/youtube.py (el permiso OAuth vive allí y vence cada 7 días mientras la app de Google Cloud esté en
«Prueba»: si venció, abre el navegador para volver a darlo). Cuota: 10 000 al día; cada subida cuesta 1 600,
más 50 del update y 50 de la miniatura: caben 5 al día, y menos si ese día también suben retos de ttcode.
La descripción lleva los capítulos de <vídeo>.capitulos.json si existe. El id se apunta en youtube.json.
"""
import json, os, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.expanduser('~/Documents/code challenge'))
PLAN = os.path.join(AQUI, 'youtube.json')


def minuto(t):
    t = int(round(t)); return f'{t // 60}:{t % 60:02d}'


def descripcion(v):
    d = v['descripcion'].rstrip()
    caps = os.path.join(AQUI, v['video'][:-4] + '.capitulos.json')
    if os.path.exists(caps):
        lista = json.load(open(caps, encoding='utf-8'))
        if len(lista) >= 3 and lista[0]['t'] == 0:   # YouTube pide empezar en 0:00 y al menos tres
            d += '\n\nCapítulos\n' + '\n'.join(f"{minuto(c['t'])} {c['titulo']}" for c in lista)
    if v.get('cierre'):
        d += '\n\n' + v['cierre']
    return d


def main():
    tope = int(sys.argv[sys.argv.index('--max') + 1]) if '--max' in sys.argv else 3
    seco = '--seco' in sys.argv
    plan = json.load(open(PLAN, encoding='utf-8'))
    pendientes = [v for v in plan if not v.get('id')]
    print(f'{len(pendientes)} por subir; esta vez hasta {tope}')
    if seco:
        for v in pendientes[:tope]:
            print('\n==', v['clave'], v['publicar']); print(v['titulo']); print(descripcion(v))
        return
    from ttcode.youtube import subir_video
    for v in pendientes[:tope]:
        mp4 = os.path.join(AQUI, v['video'])
        if not os.path.exists(mp4):
            print('falta', mp4); continue
        print('==', v['clave'], '->', v['publicar'])
        mini = os.path.join(AQUI, v['miniatura']) if v.get('miniatura') else None
        v['id'] = subir_video(v['titulo'], descripcion(v), v['etiquetas'], mp4, mini, programar=v['publicar'],
                              categoria=v['categoria'], idioma='es')
        json.dump(plan, open(PLAN, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('listo')


if __name__ == '__main__':
    main()
