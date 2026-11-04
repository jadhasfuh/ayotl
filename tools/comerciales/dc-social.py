#!/usr/bin/env python3
"""Manda a Instagram y Facebook (la página de Daily Challenge) un vídeo de LeIA en español que ya va a YouTube.

    python3 tools/comerciales/dc-social.py <clave de youtube.json> [<clave>…] [--dia AAAA-MM-DD] [--seco] [--sin-push]

Adrián, 3-nov-2026: «el que se programa de LeIA en español del Daily Challenge, Kazan, etc. a YouTube, también lánzalo
al face/insta, solo el español, no se está lanzando». Lo publica el cron social de DC (tipo `leia`, 13:10 de México):
lee public/content/anuncios/leia.txt («AAAA-MM-DD  clip»), sube public/marketing/<clip>.mp4 como reel a Instagram y
Facebook con el pie de public/content/anuncios/<clip>.txt. Este script deja todo eso en el repo de DC y lo sube:

1. Toma la entrada de youtube.json (sólo las de español: sin `idioma`); el clip se llama leia-<clave>.
2. Copia el mp4 a public/marketing/leia-<clave>.mp4 y escribe el pie (descripción + cierre + «Juega gratis…»).
3. Añade «<día>  leia-<clave>» a leia.txt (el día: --dia, o el de `publicar` de YouTube: el mismo día, a las 13:10).
4. Commit y push de Daily Challenge DESDE UN WORKTREE SOBRE origin/main (el main local de DC puede llevar trabajo
   sin push, como el Daily Stat), y borra el worktree. Con --sin-push deja el worktree para mirarlo.

El mejor del día (leia-mejor-del-dia.py) lo llama solo para el español. Los pasados ya publicados en YouTube se
pueden mandar también, uno por día, con --dia.
"""
import json, os, shutil, subprocess, sys
from datetime import date

AQUI = os.path.dirname(os.path.abspath(__file__))
DC = os.path.expanduser('~/Documents/daily challenge')
GIT = '/opt/homebrew/bin/git'
WT = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'dc-social-worktree')
CIERRE = {'dc': 'Juega gratis en dailychallenge.click', 'kazan': 'Juega gratis en kazan.dailychallenge.click', 'warzone': 'Juega gratis en dailychallenge.click/warzone'}


def git(*args, cwd=DC):
    return subprocess.run([GIT, *args], cwd=cwd, check=True, capture_output=True, text=True).stdout.strip()


def pie_de(v):
    """El pie para Instagram y Facebook: la descripción de YouTube (sin el #shorts del título) y el cierre."""
    partes = [v.get('descripcion', '').strip()]
    partes.append(CIERRE.get(v.get('app', 'dc'), CIERRE['dc']))
    if v.get('cierre'): partes.append(v['cierre'].strip())
    return '\n\n'.join(p for p in partes if p) + '\n'


def main():
    args = sys.argv[1:]
    seco = '--seco' in args; sin_push = '--sin-push' in args
    dia = None
    if '--dia' in args: i = args.index('--dia'); dia = args[i + 1]; del args[i:i + 2]
    claves = [a for a in args if not a.startswith('--')]
    if not claves: print(__doc__); sys.exit(2)
    plan = json.load(open(os.path.join(AQUI, 'youtube.json'), encoding='utf-8'))
    por_clave = {v['clave']: v for v in plan}
    trabajos = []
    for clave in claves:
        v = por_clave.get(clave)
        if not v: sys.exit(f'MAL: {clave} no está en youtube.json')
        if v.get('idioma'): sys.exit(f'MAL: {clave} no es la versión en español (idioma {v["idioma"]}); a Instagram y Facebook va sólo el español')
        mp4 = os.path.join(AQUI, v['video'])
        if not os.path.exists(mp4): sys.exit(f'MAL: no está el vídeo {mp4}')
        d = dia or (v.get('publicar') or '')[:10] or date.today().isoformat()
        trabajos.append((clave, v, mp4, d))
        print(f'{clave}: sale en Instagram y Facebook el {d} a las 13:10 MX ({os.path.getsize(mp4) // 1024} KB)')
    if seco: return
    # el worktree sobre origin/main
    if os.path.exists(WT): git('worktree', 'remove', '--force', WT)
    git('worktree', 'prune'); git('fetch', '-q', 'origin'); git('worktree', 'add', '-q', '--detach', WT, 'origin/main')
    cal = os.path.join(WT, 'public', 'content', 'anuncios', 'leia.txt')
    lineas = open(cal, encoding='utf-8').read().splitlines() if os.path.exists(cal) else ['# Vídeos de LeIA en español a Instagram y Facebook («AAAA-MM-DD  clip»): el cron de las 13:10 MX', '# (/api/cron/social?tipo=leia) publica public/marketing/<clip>.mp4 con el pie de <clip>.txt. Los deja tools/comerciales/dc-social.py (ayotl).']
    for clave, v, mp4, d in trabajos:
        clip = f'leia-{clave}'
        shutil.copyfile(mp4, os.path.join(WT, 'public', 'marketing', f'{clip}.mp4'))
        with open(os.path.join(WT, 'public', 'content', 'anuncios', f'{clip}.txt'), 'w', encoding='utf-8') as f: f.write(pie_de(v))
        lineas = [l for l in lineas if not l.split()[1:2] == [clip]]   # si ya estaba, se cambia de día
        lineas.append(f'{d}  {clip}')
    cuerpo = [l for l in lineas if l and not l.startswith('#')]; cabeza = [l for l in lineas if l.startswith('#')]
    with open(cal, 'w', encoding='utf-8') as f: f.write('\n'.join(cabeza + sorted(cuerpo)) + '\n')
    git('add', 'public/marketing', 'public/content/anuncios', cwd=WT)
    msg = 'LeIA a Instagram y Facebook: ' + ', '.join(f'{c} el {d}' for c, _, _, d in trabajos) + '\n\nCo-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>'
    git('commit', '-q', '-m', msg, cwd=WT)
    if sin_push: print('sin push: el worktree queda en', WT); return
    git('push', '-q', 'origin', 'HEAD:main', cwd=WT)
    print('subido a Daily Challenge:', git('log', '--oneline', '-1', cwd=WT)[:60])
    git('worktree', 'remove', '--force', WT)


if __name__ == '__main__':
    main()
