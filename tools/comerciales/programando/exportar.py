#!/usr/bin/env python3
"""Deja el código de un vídeo de «Programando …» en ayotl.dev, para copiarlo y jugarlo (Adrián, 24-nov-2026: «sí, publica
para copiable en la página»): src/content/programando-<clave>.json, de donde lo lee la página
/aprende/<curso>/codigo/<parte> (src/lib/aprende/programando.ts).

  python3 tools/comerciales/programando/exportar.py snake1            # lo escribe
  python3 tools/comerciales/programando/exportar.py snake1 --revisar  # sale con 1 si la página no tiene lo del vídeo

La fuente es FINAL, en el archivo del vídeo: el mismo código que se ve escribirse. `junto` es ese código en un solo archivo
.html que se abre con doble clic: los módulos (type="module") necesitan un servidor. Es lo que corre en la página.
"""
import importlib, json, os, re, sys
AQUI = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, AQUI)
RAIZ = os.path.abspath(os.path.join(AQUI, '..', '..', '..'))


def junto(mod):
    """Los módulos pegados en el orden de carga, sin import ni export, dentro de la página."""
    partes = []
    for n in mod.ORDEN:
        if n.endswith('.js'):
            ls = [l for l in mod.FINAL[n].split('\n') if not re.match(r"import .* from '", l)]
            partes.append(f'// ---- {n}\n' + '\n'.join(ls).strip('\n').replace('\nexport ', '\n').removeprefix('export '))
    html = mod.FINAL['index.html']
    etiqueta = '<script type="module" src="main.js"></script>'
    assert html.count(etiqueta) == 1
    return html.replace(etiqueta, '<script>\n' + '\n\n'.join(partes) + '\n</script>')


def main():
    mod = importlib.import_module(sys.argv[1])
    d = {'archivos': [{'nombre': n, 'texto': mod.FINAL[n]} for n in mod.ORDEN], 'lineas': mod.TOTAL, 'junto': junto(mod)}
    texto = json.dumps(d, ensure_ascii=False, indent=1) + '\n'
    ruta = os.path.join(RAIZ, 'src', 'content', f'programando-{mod.CLAVE}.json')
    if '--revisar' in sys.argv:
        igual = os.path.exists(ruta) and open(ruta, encoding='utf-8').read() == texto
        print(ruta, 'al día' if igual else 'DISTINTO: correr exportar.py')
        sys.exit(0 if igual else 1)
    open(ruta, 'w', encoding='utf-8').write(texto)
    print(ruta, mod.TOTAL, 'líneas en', len(mod.ORDEN), 'archivos;', len(d['junto'].split('\n')), 'en uno')


if __name__ == '__main__':
    main()
