#!/usr/bin/env python3
"""Comprueba que el CODIGO de cada episodio de «Algoritmos en pixel» sea el de su lección de ayotl.dev/aprende
(16-nov-2026; Adrián: «que los códigos estén en ayotl en los vídeos correspondientes»). La regla de la serie es que
el vídeo enseña el MISMO programa que la lección: cuando un renglón no cabe en el teléfono se parte en dos, pero no
se reescribe. Así que se comparan sin espacios, sin saltos y sin comentarios: el del vídeo tiene que estar entero
dentro del archivo de la lección.

  python3 tools/comerciales/algoritmos/revisar-codigo.py     # sale con 1 si alguno no cuadra
"""
import glob, importlib.util, os, re, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(AQUI, '..', '..', '..'))
LECCIONES = glob.glob(os.path.join(RAIZ, 'src/lib/aprende/*/*.ts'))
sys.path.insert(0, AQUI)


def plano(s):
    return re.sub(r'\s+', '', re.sub(r'//[^\n]*', '', s))


def main():
    fuentes = {os.path.relpath(f, RAIZ): plano(open(f, encoding='utf-8').read().replace('\\n', '\n').replace('\\"', '"')) for f in LECCIONES}
    mal = 0
    for ruta in sorted(glob.glob(os.path.join(AQUI, '*.py'))):
        nombre = os.path.basename(ruta)[:-3]
        if nombre in ('armar', 'renderizador', 'cajas', 'revisar-codigo'):
            continue
        spec = importlib.util.spec_from_file_location(nombre, ruta); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
        codigos = m.CODIGO if isinstance(m.CODIGO, dict) else {'es': m.CODIGO}
        for lang, c in codigos.items():
            donde = [f for f, t in fuentes.items() if plano(c) in t]
            print(f"{nombre:10} {lang}  {'en ' + donde[0] if donde else 'NO ESTÁ EN NINGUNA LECCIÓN'}")
            mal += not donde
    sys.exit(1 if mal else 0)


if __name__ == '__main__':
    main()
