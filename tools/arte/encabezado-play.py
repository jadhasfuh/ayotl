# Encabezado (4096x2304) e icono (512x512) de la página del desarrollador de Ayotl en Google Play (4-nov-2026).
# El encabezado sale de gpt-image-2 con el generador de ZANEI (~/Documents/zanei/tools/arte/generar.py) y la llave de OpenAI
# en OPENAI_API_KEY (sólo en local, nunca en el repo); correr con el venv de ttcode y SSL_CERT_FILE=$(python -m certifi), porque
# el Python del sistema no trae certificados. Luego recorte centrado a 16:9 y escala a 4096x2304 (encabezado-final). El icono es
# public/icono.svg sobre el crema del sitio (#f6f1e7), renderizado con Chrome sin ventana a 512x512. Resultados en ~/Documents/ayotl-medios/ayotl/.

# Encabezado de la página del desarrollador de Ayotl en Google Play: dos variantes con gpt-image-2 (misma receta que la portada de ZANEI).
import sys, os
sys.path.insert(0, '/Users/jadhasfuh/Documents/zanei/tools/arte')
import generar
SAL = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'encabezado'); os.makedirs(SAL, exist_ok=True)
BASE = ("Wide painted illustration in the style of early-1980s science-fiction anime cel art with soft airbrush shading: "
        "a large old turtle rests on a mossy rock at the shore of a calm highland lake at dusk, seen from behind at a three-quarter angle, "
        "looking toward the horizon. Across the water, a small volcanic island with a thin plume of smoke lit orange from inside. "
        "High in the dark teal sky, a sleek dart-shaped fighter ship drawn as a glowing cyan neon wireframe leaves a thin light trail among the first stars. "
        "Along the far shore, a line of tiny warm candle lights of a night procession. "
        "Palette: cream and pale gold sky near the horizon, forest green hills, deep teal water with reflections, warm earth browns; "
        "quiet, dignified mood; vintage printed poster texture; no text, no letters, no logos, no watermark, no people in the foreground. ")
TRABAJOS = {
  'encabezado-a': BASE + "Composition: the turtle in the lower left third, the island in the right third, lots of open sky in the upper middle.",
  'encabezado-b': BASE + "Composition: the turtle small and centered low, the lake wide, the island on the left, the ship trail crossing the upper right; the center kept calm and uncluttered.",
}
for nombre in (sys.argv[1:] or TRABAJOS):
    generar.generar(os.path.join(SAL, nombre + '.png'), TRABAJOS[nombre], 'high', None, '1536x1024')
    print('hecho', nombre, flush=True)

# ---- recorte y escala ----
# Del 1536x1024 de gpt-image-2 al encabezado de Play: recorte centrado a 16:9 y escala a 4096x2304, PNG de 24 bits sin alfa.
import os, sys
from PIL import Image
SP = os.path.dirname(os.path.abspath(__file__)); D = os.path.join(SP, 'encabezado')
for n in sorted(x for x in os.listdir(D) if x.endswith('.png') and '-4096' not in x):
    im = Image.open(os.path.join(D, n)).convert('RGB'); w, h = im.size
    H = round(w * 9 / 16); y0 = (h - H) // 2
    rec = im.crop((0, y0, w, y0 + H)).resize((4096, 2304), Image.LANCZOS)
    sal = os.path.join(D, n.replace('.png', '-4096.png')); rec.save(sal, optimize=True)
    rec.resize((1024, 576), Image.LANCZOS).save(os.path.join(D, n.replace('.png', '-vista.png')))
    print(n, im.size, '→', rec.size, round(os.path.getsize(sal) / 1048576, 1), 'MB')
