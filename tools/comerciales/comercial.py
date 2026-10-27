#!/usr/bin/env python3
"""Comerciales con narración para las apps de Ayotl (26-oct-2026).

Adrián: «generar algunos comerciales de cada app con audio», uno por semana. Cada comercial es un reel
vertical de 1080x1920: escenas con una pantalla real de la app (capturada aparte, a 1080x1920) y una frase
en pantalla, narración con voz neuronal de Google (Chirp 3 HD) y una música suave que baja cuando habla
la voz; al final, la tarjeta de la marca. Cada escena dura lo que su frase, más un respiro.

  python3 tools/comerciales/comercial.py tools/comerciales/jlptest.json

El guion es un JSON: salida, voz, idioma, colores, marca y escenas ({imagen, texto, voz} y una final
{final: true, voz}). La clave de Google (GOOGLE_TTS_KEY, la de la cuenta de prueba que vence el
25-ene-2027) se lee de jlptest/.env.local y va en una cabecera desde un archivo temporal: nunca se imprime.
Necesita el Python de ttcode (pillow, numpy, imageio-ffmpeg). Las llamadas van con curl (certificados).
"""
import base64, json, math, os, subprocess, sys, tempfile
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import imageio_ffmpeg

W, H, FPS = 1080, 1920, 30
SR = 48000
FUNDIDO = 0.35          # cruce entre escenas (s)
RESPIRO = 0.55          # silencio después de cada frase (s)
AVENIR = '/System/Library/Fonts/Avenir Next.ttc'
FF = imageio_ffmpeg.get_ffmpeg_exe()


def fuente(peso, tam):
    idx = {'heavy': 8, 'bold': 0, 'demi': 2, 'medium': 5, 'regular': 7}[peso]
    return ImageFont.truetype(AVENIR, tam, index=idx)


def color(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


# ---------------------------------------------------------------- voz
def clave():
    ruta = os.path.expanduser('~/Documents/jlptest/.env.local')
    for linea in open(ruta, encoding='utf-8'):
        if linea.startswith('GOOGLE_TTS_KEY='):
            return linea.split('=', 1)[1].strip().strip('"\'')
    sys.exit('falta GOOGLE_TTS_KEY en jlptest/.env.local')


def narrar(texto, voz, idioma, cabecera, tmp, n):
    cuerpo = json.dumps({'input': {'text': texto}, 'voice': {'languageCode': idioma, 'name': voz},
                         'audioConfig': {'audioEncoding': 'MP3', 'sampleRateHertz': 24000}})
    r = subprocess.run(['curl', '-sS', 'https://texttospeech.googleapis.com/v1/text:synthesize',
                        '-H', '@' + cabecera, '-H', 'Content-Type: application/json', '-d', cuerpo],
                       capture_output=True, text=True)
    d = json.loads(r.stdout or '{}')
    if 'audioContent' not in d:
        sys.exit('Google no devolvió audio: ' + json.dumps(d)[:200])
    mp3 = os.path.join(tmp, f'v{n}.mp3')
    open(mp3, 'wb').write(base64.b64decode(d['audioContent']))
    crudo = subprocess.run([FF, '-loglevel', 'error', '-i', mp3, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'],
                           capture_output=True, check=True).stdout
    return np.frombuffer(crudo, dtype=np.int16).astype(np.float32) / 32768


# ---------------------------------------------------------------- música
def musica(dur, bpm=92):
    """Un colchón suave en do mayor (I–V–vi–IV): acordes largos y un arpegio de pulsos."""
    n = int(dur * SR); t = np.arange(n) / SR; m = np.zeros(n, dtype=np.float32)
    acordes = [[261.63, 329.63, 392.0], [196.0, 246.94, 293.66], [220.0, 261.63, 329.63], [174.61, 220.0, 261.63]]
    compas = 4 * 60 / bpm
    for k in range(int(dur / compas) + 1):
        a = acordes[k % 4]; t0 = k * compas; i0 = int(t0 * SR); i1 = min(n, int((t0 + compas) * SR))
        if i0 >= n:
            break
        tt = t[i0:i1] - t0
        env = np.minimum(1, tt / 0.8) * np.minimum(1, (compas - tt) / 0.6)
        for f in a:
            m[i0:i1] += 0.05 * env * (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * f * 1.003 * tt))
        for p in range(8):   # arpegio en corcheas, una octava arriba
            j0 = int((t0 + p * compas / 8) * SR); k_ = int(0.5 * SR)
            if j0 + k_ > n:
                break
            f = a[p % 3] * 2; ttt = np.arange(k_) / SR
            m[j0:j0 + k_] += 0.035 * np.exp(-ttt * 7) * np.sin(2 * np.pi * f * ttt)
    fade = int(1.2 * SR)
    m[:fade] *= np.linspace(0, 1, fade); m[-fade:] *= np.linspace(1, 0, fade)
    return m


# ---------------------------------------------------------------- dibujo
def redondear(im, r):
    mask = Image.new('L', im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, im.size[0] - 1, im.size[1] - 1], r, fill=255)
    out = Image.new('RGBA', im.size); out.paste(im, (0, 0), mask); return out


def partir(d, texto, f, ancho):
    # en líneas parejas: con el mismo número de líneas, la que deje el renglón más largo más corto
    lineas = []
    for parrafo in texto.split('\n'):
        p = parrafo.split(' ')
        if d.textlength(parrafo, font=f) <= ancho or len(p) < 2:
            lineas.append(parrafo); continue
        mejor = min(range(1, len(p)), key=lambda k: max(d.textlength(' '.join(p[:k]), font=f), d.textlength(' '.join(p[k:]), font=f)))
        lineas += [' '.join(p[:mejor]), ' '.join(p[mejor:])]
    return lineas


class Escena:
    def __init__(self, e, g):
        self.e, self.g = e, g
        self.fondo = color(g['colores']['fondo'])
        if e.get('final'):
            return
        im = Image.open(e['imagen']).convert('RGB')
        self.ancho = 700   # para que la parte de abajo (el pie y los botones de Instagram) no tape la pantalla
        alto = round(im.size[1] * self.ancho / im.size[0])
        self.tarjeta = redondear(im.resize((self.ancho, alto), Image.LANCZOS), 40)
        sombra = Image.new('RGBA', (self.ancho + 80, alto + 80), (0, 0, 0, 0))
        ImageDraw.Draw(sombra).rounded_rectangle([40, 50, self.ancho + 40, alto + 40], 40, fill=(0, 0, 0, 150))
        self.sombra = sombra.filter(ImageFilter.GaussianBlur(22))

    def cuadro(self, f):   # f: 0..1 dentro de la escena
        g = self.g; c = g['colores']
        im = Image.new('RGB', (W, H), self.fondo); d = ImageDraw.Draw(im)
        if self.e.get('final'):
            return self.final(im, d, f)
        # el texto arriba, con una raya del color de la marca
        ft = fuente('bold', 70); y = 230
        for linea in partir(d, self.e['texto'], ft, W - 160):
            d.text((W / 2, y), linea, font=ft, fill=color(c['texto']), anchor='ma'); y += 88
        d.rounded_rectangle([W / 2 - 60, y + 14, W / 2 + 60, y + 22], 4, fill=color(c['acento']))
        # la pantalla, con un acercamiento lento
        z = 1 + 0.035 * f
        tw = round(self.ancho * z); th = round(self.tarjeta.size[1] * z)
        tar = self.tarjeta.resize((tw, th), Image.BILINEAR)
        x0 = (W - tw) // 2; y0 = y + 80 - round((th - self.tarjeta.size[1]) / 2)
        im.paste(self.sombra.resize((tw + 80, th + 80)), (x0 - 40, y0 - 40), self.sombra.resize((tw + 80, th + 80)))
        im.paste(tar, (x0, y0), tar)
        return im

    def final(self, im, d, f):
        g = self.g; c = g['colores']; m = g['marca']
        a = min(1, f * 3)   # aparece en el primer tercio
        def mezcla(col):
            base = self.fondo; col = color(col)
            return tuple(round(base[i] + (col[i] - base[i]) * a) for i in range(3))
        fm = fuente('heavy', 150); w = d.textlength(m['nombre'], font=fm)
        d.text(((W - w) / 2 - 20, 700), m['nombre'], font=fm, fill=mezcla(c['texto']))
        r = 20; cx = (W + w) / 2 + 10; cy = 700 + 128
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=mezcla(m.get('punto', c['acento'])))
        d.text((W / 2, 930), m['lema'], font=fuente('demi', 64), fill=mezcla(c['acento']), anchor='ma')
        fs = fuente('bold', 72); ws = d.textlength(m['sitio'], font=fs)
        d.rounded_rectangle([W / 2 - ws / 2 - 50, 1080, W / 2 + ws / 2 + 50, 1210], 65, fill=mezcla(c['acento']))
        d.text((W / 2, 1100), m['sitio'], font=fs, fill=mezcla(c['fondo']), anchor='ma')
        if m.get('pie'):
            d.text((W / 2, 1300), m['pie'], font=fuente('medium', 44), fill=mezcla(c['tenue']), anchor='ma')
        return im


def main():
    g = json.load(open(sys.argv[1], encoding='utf-8'))
    base = os.path.dirname(os.path.abspath(sys.argv[1]))
    for e in g['escenas']:
        if e.get('imagen'):
            e['imagen'] = os.path.join(base, os.path.expanduser(e['imagen']))
    with tempfile.TemporaryDirectory() as tmp:
        os.chmod(tmp, 0o700)
        cab = os.path.join(tmp, 'h.txt')
        with open(cab, 'w') as h:
            h.write(f'X-Goog-Api-Key: {clave()}\n')
        os.chmod(cab, 0o600)
        voces = [narrar(e['voz'], g['voz'], g['idioma'], cab, tmp, i) for i, e in enumerate(g['escenas'])]
        # duraciones: la frase más un respiro; la final, al menos 4 s
        durs = [len(v) / SR + RESPIRO + (1.2 if e.get('final') else 0) for v, e in zip(voces, g['escenas'])]
        durs[-1] = max(durs[-1], 4.0)
        inicio = [0.5]
        for d_ in durs[:-1]:
            inicio.append(inicio[-1] + d_)
        total = inicio[-1] + durs[-1]
        # audio: música con la voz encima; la música baja mientras hay voz
        n = int(total * SR); voz = np.zeros(n, dtype=np.float32); hay = np.zeros(n, dtype=np.float32)
        for v, t0 in zip(voces, inicio):
            i0 = int((t0 + 0.15) * SR); k = min(len(v), n - i0)
            voz[i0:i0 + k] += v[:k]; hay[i0:i0 + k] = 1
        suav = int(0.25 * SR)
        hay = np.convolve(hay, np.ones(suav) / suav, mode='same')
        mus = musica(total, g.get('bpm', 92)) * (0.9 - 0.62 * np.clip(hay, 0, 1))
        mezcla = voz * 0.95 + mus
        mezcla /= max(1e-6, np.abs(mezcla).max() / 0.89)
        wav = os.path.join(tmp, 'mezcla.wav')
        crudo = (np.repeat(mezcla[:, None], 2, axis=1) * 32767).astype('<i2').tobytes()
        subprocess.run([FF, '-loglevel', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-', wav],
                       input=crudo, check=True)
        # video
        escenas = [Escena(e, g) for e in g['escenas']]
        salida = os.path.expanduser(g['salida']); os.makedirs(os.path.dirname(salida), exist_ok=True)
        cmd = [FF, '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS),
               '-i', '-', '-i', wav, '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p',
               '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', '-shortest', salida]
        p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
        fondo = Image.new('RGB', (W, H), color(g['colores']['fondo']))
        for k in range(int(total * FPS)):
            t = k / FPS
            i = max(0, max(j for j, t0 in enumerate(inicio) if t0 <= t) if t >= inicio[0] else 0)
            if t < inicio[0]:
                im = escenas[0].cuadro(0); a = t / inicio[0]
                im = Image.blend(fondo, im, a)
            else:
                f = (t - inicio[i]) / durs[i]
                im = escenas[i].cuadro(min(1, f))
                # cruce con la siguiente al final de la escena
                if i + 1 < len(escenas) and t > inicio[i + 1] - FUNDIDO:
                    a = (t - (inicio[i + 1] - FUNDIDO)) / FUNDIDO
                    im = Image.blend(im, escenas[i + 1].cuadro(0), min(1, a))
                if i == len(escenas) - 1 and total - t < 0.6:
                    im = Image.blend(fondo, im, max(0, (total - t) / 0.6))
            p.stdin.write(im.tobytes())
        p.stdin.close(); p.wait()
        print(f'{salida}: {total:.1f} s, {len(escenas)} escenas')


if __name__ == '__main__':
    main()
