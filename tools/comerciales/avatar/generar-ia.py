#!/usr/bin/env python3
"""LeIA con IA de imágenes (27-oct-2026). Adrián: «usa la cara de Anna de jlptest como base, y si se puede la
línea que se vea un poquito pixel, como si fuera vista en un Sega Genesis o Neo Geo, NEC PC…».

Con la API de OpenAI (images/edits): primero la cara normal a partir del retrato de Anna
(jlptest/docs/libro/ilustraciones/retrato-anna.png) y luego cada expresión a partir de esa cara, para que sea
siempre la misma chica. Después se pasa a pixel de verdad: 128x128 con paleta corta (como un retrato de
novela visual de PC-98) y se guarda como avatar/leia-<cara>.png; muestra-ia.png las enseña todas.

  python3 tools/comerciales/avatar/generar-ia.py <archivo con la cabecera Authorization> [cara ...]

La llave nunca va en la línea de comandos ni en el repo: la cabecera se lee de un archivo (curl -H @archivo).
Sin caras, hace las siete; con nombres, sólo esas (la normal tiene que existir para las demás).
"""
import base64, json, os, subprocess, sys
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
CRUDO = os.path.join(AQUI, 'ia')            # lo que devuelve la API, a 1024 (para rehacer el pixelado sin pagar)
ANNA = os.path.expanduser('~/Documents/jlptest/docs/libro/ilustraciones/retrato-anna.png')
MODELO = 'gpt-image-2'
LADO, COLORES = 128, 48
RECORTE = (190, 80, 894, 784)   # de los 1024 de la API: la cara y los hombros, más cerca (para el cuadro de diálogo)

BASE = ("Use the woman in the reference drawing as the character. Recreate her as a 16-bit era anime pixel art "
        "portrait, like a Japanese PC-98 / Sega Genesis / Neo Geo / NEC PC-88 visual novel character portrait. Keep her "
        "identity: long straight black hair with blunt, slightly jagged bangs at eyebrow level, hair falling past the "
        "shoulders, thin round silver glasses, small calm half-lidded eyes, narrow face with a pointed chin, long neck, "
        "simple light grey crew-neck top. Expression: calm and neutral, with a faint slight smile. Framing: head and "
        "shoulders, centered, facing the viewer, the face large in the frame, like a dialogue box portrait. Style: "
        "visible square pixels, crisp dark pixel outlines, limited palette of about 32 colors, subtle ordered dithering "
        "in the shadows, soft skin shading, no blur. Plain dark navy blue background. No text, no border.")
CARAS = {
    'feliz': 'a big happy smile with both eyes closed in upward arcs, a light blush on the cheeks',
    'sorpresa': 'surprised: eyes wide open, eyebrows raised, a small round open mouth',
    'enojo': 'annoyed and angry: eyebrows angled down toward the center, narrowed eyes, a small frown, a small red anger mark near the top of the forehead',
    'triste': 'sad: eyebrows tilted up in the middle, droopy eyes, a small tear on one cheek, a downturned mouth',
    'pensando': 'thinking: eyes looking up to one side, mouth flat, one small sweat drop near the temple',
    'guino': 'a playful wink: one eye closed, the other eye open, a small smile with the tip of the tongue out',
}
CAMBIO = ("Same character, same pixel art style, same palette, same framing, same background, same clothes, same "
          "short neck and same pose as the reference image. Change ONLY the facial expression to: {}.")
# Adrián (27-oct): «haz el cuello un poco más corto en todas; en el estilo del retrato está bien, pero para el
# avatar mantén proporciones». Se corrige la normal que ya le gustó y de ella salen las demás.
CUELLO = ("Same character, same pixel art style, same palette, same framing, same background, same hair, same glasses, "
          "same clothes and same expression as the reference image. The only change: make the neck shorter, with natural "
          "anime proportions instead of the elongated neck of the original artwork, so the chin sits closer to the "
          "collar of the top. Keep everything else identical.")


def editar(cab, imagen, prompt, destino):
    r = subprocess.run(['curl', '-sS', 'https://api.openai.com/v1/images/edits', '-H', '@' + cab,
                        '-F', f'model={MODELO}', '-F', f'image=@{imagen}', '-F', f'prompt={prompt}',
                        '-F', 'size=1024x1024', '-F', 'quality=high'], capture_output=True, text=True)
    d = json.loads(r.stdout or '{}')
    if 'data' not in d:
        sys.exit('la API no devolvió imagen: ' + json.dumps(d.get('error', d))[:300])
    open(destino, 'wb').write(base64.b64decode(d['data'][0]['b64_json']))


def pixelar(origen, destino):
    """A 128x128 con paleta corta y sin suavizar: el pixel de verdad (lo de la API sólo lo imita)."""
    im = Image.open(origen).convert('RGB').crop(RECORTE).resize((LADO, LADO), Image.LANCZOS)
    im = im.quantize(colors=COLORES, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGBA')
    im.save(destino)


def main():
    cab = sys.argv[1]
    pedidas = sys.argv[2:] or ['normal', *CARAS]
    os.makedirs(CRUDO, exist_ok=True)
    ref = os.path.join(CRUDO, 'anna-ref.png')
    if not os.path.exists(ref):   # el retrato de Anna, cuadrado y en RGB
        a = Image.open(ANNA).convert('RGB'); lado = max(a.size)
        c = Image.new('RGB', (lado, lado), (255, 255, 255)); c.paste(a, ((lado - a.size[0]) // 2, (lado - a.size[1]) // 2)); c.save(ref)
    normal = os.path.join(CRUDO, 'leia-normal.png')
    for cara in pedidas:
        crudo = os.path.join(CRUDO, f'leia-{cara}.png')
        print('…', cara, flush=True)
        if cara == 'normal':
            editar(cab, ref, BASE, crudo)
        elif cara == 'cuello':   # la normal con el cuello más corto: la anterior queda como leia-normal-v1.png
            os.replace(normal, os.path.join(CRUDO, 'leia-normal-v1.png'))
            editar(cab, os.path.join(CRUDO, 'leia-normal-v1.png'), CUELLO, normal)
            pixelar(normal, os.path.join(AQUI, 'leia-normal.png')); continue
        else:
            editar(cab, normal, CAMBIO.format(CARAS[cara]), crudo)
        pixelar(crudo, os.path.join(AQUI, f'leia-{cara}.png'))
    # la muestra: todas, a 3x
    nombres = ['normal', *CARAS]
    hechas = [n for n in nombres if os.path.exists(os.path.join(AQUI, f'leia-{n}.png'))]
    m = Image.new('RGBA', (len(hechas) * (LADO * 3 + 12), LADO * 3), (24, 28, 60, 255))
    for i, n in enumerate(hechas):
        m.alpha_composite(Image.open(os.path.join(AQUI, f'leia-{n}.png')).convert('RGBA').resize((LADO * 3, LADO * 3), Image.NEAREST), (i * (LADO * 3 + 12), 0))
    m.save(os.path.join(AQUI, 'muestra-ia.png'))
    print('listo:', ', '.join(hechas))


if __name__ == '__main__':
    main()
