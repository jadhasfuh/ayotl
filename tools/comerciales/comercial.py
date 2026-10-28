#!/usr/bin/env python3
"""Comerciales y vídeos con narración para las apps de Ayotl (26/27-oct-2026).

Adrián: «generar algunos comerciales de cada app con audio», uno por semana; y el 27-oct, vídeos para
YouTube (Shorts y largos para el canal) e Instagram/Facebook con las partidas de los juegos. Cada vídeo son
escenas con una frase en pantalla y narración con voz neuronal de Google (Chirp 3 HD), sobre una música
suave que baja cuando habla la voz (o el sonido del juego); al final, la tarjeta de la marca. Cada escena
dura lo que su voz, más un respiro (o `dur`, si es más).

  python3 tools/comerciales/comercial.py tools/comerciales/jlptest.json

El guion es un JSON:
- `salida`, `voz`, `idioma`, `colores`, `marca`, `escenas`; opcionales `formato` («vertical», 1080x1920, o
  «horizontal», 1920x1080), `bpm`, `musica` ({archivo, desde, volumen}: el sonido de un vídeo).
- Una escena: `texto` (arriba) y su voz, que es `voz` (una frase con la voz del guion) o `voces` (una lista
  de {texto, voz?, idioma?, despues?}: varias frases seguidas, p. ej. el narrador en español y la palabra
  en japonés), o ninguna (sin narración; entonces dura `dur`). Lo que se ve:
  - `imagen` o `video` (+ `desde`, `recorte` [x, y, an, al], `ancho`, `pixel`, `radio`): la pantalla en
    una tarjeta debajo del texto;
  - `completo: true` con `video`: el vídeo llena el cuadro y el texto va abajo, en una franja;
  - `palabra: {jp, lectura, es, num?}`: la tarjeta de una palabra en japonés (fuente IPAex de jlptest);
  - `cuenta: {numero, arriba, abajo}`: el número en grande (la cuenta regresiva al JLPT), con una línea
    arriba y otra abajo;
  - `final: true`: la tarjeta de la marca.
  `capitulo` en una escena la apunta en `<salida>.capitulos.json` (minuto y título) para la descripción.
- `presentadora` ({nombre, caras}: la carpeta con <nombre en minúsculas>-<cara>.png de 64x64): mientras habla
  sale un cuadro de diálogo de RPG de 16 bits con su retrato, la cara de la escena (`cara`: normal, feliz,
  sorpresa, enojo, triste, pensando, guino) y lo que dice escribiéndose al ritmo de la voz (`dice`, si lo que
  se lee no es lo que se pronuncia: «jota ele pe test» se lee jlptest). Adrián, 27-oct: como los canales de
  gameplays con avatar.
La clave de Google (GOOGLE_TTS_KEY, la de la cuenta de prueba que vence el 25-ene-2027) se lee de
jlptest/.env.local y va en una cabecera desde un archivo temporal: nunca se imprime. Necesita el Python de
ttcode (pillow, numpy, imageio-ffmpeg). Las llamadas van con curl (el Python del sistema no trae certificados).
"""
import base64, hashlib, json, os, subprocess, sys, tempfile
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import imageio_ffmpeg

W, H, FPS = 1080, 1920, 30          # el formato lo cambia main() si el guion es horizontal
SR = 48000
FUNDIDO = 0.35          # cruce entre escenas (s)
RESPIRO = 0.55          # silencio después de cada frase (s)
AVENIR = '/System/Library/Fonts/Avenir Next.ttc'
JAPONESA = os.path.expanduser('~/Documents/jlptest/fuentes/ipaexg.ttf')
PIXEL = os.path.expanduser('~/Documents/daily challenge/src/fonts/PressStart2P-Regular.ttf')   # la del diálogo
FF = imageio_ffmpeg.get_ffmpeg_exe()
CACHE = os.path.expanduser('~/Documents/ayotl-voces')   # lo ya narrado, por huella (texto, voz, idioma)


def fuente(peso, tam):
    idx = {'heavy': 8, 'bold': 0, 'demi': 2, 'medium': 5, 'regular': 7}[peso]
    return ImageFont.truetype(AVENIR, tam, index=idx)


def color(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def horizontal():
    return W > H


# ---------------------------------------------------------------- voz
def clave():
    ruta = os.path.expanduser('~/Documents/jlptest/.env.local')
    for linea in open(ruta, encoding='utf-8'):
        if linea.startswith('GOOGLE_TTS_KEY='):
            return linea.split('=', 1)[1].strip().strip('"\'')
    sys.exit('falta GOOGLE_TTS_KEY en jlptest/.env.local')


def narrar(texto, voz, idioma, cabecera):
    """Audio de una frase (mono, SR). Se guarda por huella: volver a armar un vídeo no vuelve a pagarla."""
    os.makedirs(CACHE, exist_ok=True)
    huella = hashlib.sha1(f'{voz}|{idioma}|{texto}'.encode()).hexdigest()[:20]
    mp3 = os.path.join(CACHE, huella + '.mp3')
    if not os.path.exists(mp3):
        cuerpo = json.dumps({'input': {'text': texto}, 'voice': {'languageCode': idioma, 'name': voz},
                             'audioConfig': {'audioEncoding': 'MP3', 'sampleRateHertz': 24000}})
        r = subprocess.run(['curl', '-sS', 'https://texttospeech.googleapis.com/v1/text:synthesize',
                            '-H', '@' + cabecera, '-H', 'Content-Type: application/json', '-d', cuerpo],
                           capture_output=True, text=True)
        d = json.loads(r.stdout or '{}')
        if 'audioContent' not in d:
            sys.exit('Google no devolvió audio: ' + json.dumps(d)[:200])
        open(mp3, 'wb').write(base64.b64decode(d['audioContent']))
    crudo = subprocess.run([FF, '-loglevel', 'error', '-i', mp3, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'],
                           capture_output=True, check=True).stdout
    return np.frombuffer(crudo, dtype=np.int16).astype(np.float32) / 32768


def voz_de(e, g, cab):
    """La voz de una escena: una frase, varias seguidas (con su silencio `despues`), o nada."""
    if e.get('voces'):
        partes = []
        for v in e['voces']:
            partes.append(narrar(v['texto'], v.get('voz', g['voz']), v.get('idioma', g['idioma']), cab))
            partes.append(np.zeros(int(v.get('despues', 0.35) * SR), dtype=np.float32))
        return np.concatenate(partes[:-1])
    if e.get('voz'):
        return narrar(e['voz'], g['voz'], g['idioma'], cab)
    return np.zeros(0, dtype=np.float32)


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


class Clip:
    """Un trozo de vídeo como pantalla: desde `desde` s, recortado a `recorte` [x, y, an, al] y escalado a
    `ancho` x `alto` (o a la proporción del recorte). Los cuadros se leen en orden con ffmpeg (el bucle
    principal pide siempre hacia adelante); si el trozo se acaba, se queda en el último, o con `hasta`
    vuelve a `desde` (en bucle: el reel de un día de DC trae ~8 s de partida y luego su tarjeta)."""
    def __init__(self, ruta, desde, recorte, ancho, dur, pixel=False, alto=None, hasta=None):
        if not recorte:   # el vídeo entero
            sonda = subprocess.run([FF, '-i', ruta], capture_output=True, text=True).stderr
            import re
            an, al = map(int, re.search(r'Video:.*?(\d{2,5})x(\d{2,5})', sonda).groups()); recorte = [0, 0, an, al]
        x, y, an, al = recorte
        self.ancho, self.alto = ancho, alto or round(al * ancho / an / 2) * 2
        self.filtro = f'crop={an}:{al}:{x}:{y},scale={self.ancho}:{self.alto}:flags={"neighbor" if pixel else "lanczos"},fps={FPS}'   # pixel: sin suavizar
        self.ruta, self.desde, self.largo = ruta, desde, (hasta - desde if hasta else dur + 0.5)
        self.bucle = bool(hasta)
        self.abrir()
        self.n, self.ultimo = -1, None
        self.cuadro(0)

    def abrir(self):
        self.p = subprocess.Popen([FF, '-loglevel', 'error', '-ss', str(self.desde), '-t', f'{self.largo:.2f}', '-i', self.ruta,
                                   '-vf', self.filtro, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                                  stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)   # se corta a media lectura

    def cuadro(self, k):
        while self.n < k:
            b = self.p.stdout.read(self.ancho * self.alto * 3)
            if len(b) < self.ancho * self.alto * 3:
                if not self.bucle:
                    break
                self.p.kill(); self.abrir(); continue   # otra vuelta desde `desde`
            self.ultimo = Image.frombytes('RGB', (self.ancho, self.alto), b); self.n += 1
        return self.ultimo


class Escena:
    def __init__(self, e, g, dur, voz_dur=0):
        self.e, self.g, self.dur, self.voz_dur = e, g, dur, voz_dur
        self.fondo = color(g['colores']['fondo'])
        self.fija = None   # el cuadro, si no cambia (la tarjeta de una palabra)
        if e.get('final') or e.get('palabra') or e.get('cuenta'):
            return
        if e.get('completo'):   # el vídeo llena el cuadro
            self.clip = Clip(e['video'], e.get('desde', 0), e.get('recorte'), W, dur, e.get('pixel', False), alto=H, hasta=e.get('hasta'))
            return
        # ancho de la pantalla: en vertical, 700 para una de teléfono, para que el pie y los botones de
        # Instagram no la tapen; las de juego, apaisadas, caben más anchas
        self.ancho = e.get('ancho', 700 if not horizontal() else 1400)
        if e.get('video'):
            self.clip = Clip(e['video'], e.get('desde', 0), e.get('recorte'), self.ancho, dur, e.get('pixel', False), hasta=e.get('hasta'))
            alto = self.clip.alto
        else:
            self.clip = None
            im = Image.open(e['imagen']).convert('RGB')
            if e.get('recorte'):
                x, y, an, al = e['recorte']; im = im.crop((x, y, x + an, y + al))
            alto = round(im.size[1] * self.ancho / im.size[0])
            self.imagen = im.resize((self.ancho, alto), Image.LANCZOS)
        self.radio = e.get('radio', 40)
        self.mascara = Image.new('L', (self.ancho, alto), 0)
        ImageDraw.Draw(self.mascara).rounded_rectangle([0, 0, self.ancho - 1, alto - 1], self.radio, fill=255)
        sombra = Image.new('RGBA', (self.ancho + 80, alto + 80), (0, 0, 0, 0))
        ImageDraw.Draw(sombra).rounded_rectangle([40, 50, self.ancho + 40, alto + 40], self.radio, fill=(0, 0, 0, 150))
        self.sombra = sombra.filter(ImageFilter.GaussianBlur(22))

    def tarjeta(self, f):
        im = self.clip.cuadro(round(f * self.dur * FPS)) if self.clip else self.imagen
        t = im.convert('RGBA'); t.putalpha(self.mascara); return t

    def cuadro(self, f):   # f: 0..1 dentro de la escena
        im = self.dibujo(f)
        if self.g.get('presentadora') and self.voz_dur and not self.e.get('final'):
            self.dialogo(im, f * self.dur)
        return im

    def abajo(self):
        """Hasta dónde puede bajar la pantalla: con presentadora, deja sitio al cuadro de diálogo."""
        if horizontal():
            return H - (350 if self.g.get('presentadora') else 40)
        return 1100 if self.g.get('presentadora') else 1560

    def dibujo(self, f):
        g = self.g; c = g['colores']
        if self.e.get('completo'):
            return self.completo(f)
        if self.fija is not None:
            return self.fija.copy()
        im = Image.new('RGB', (W, H), self.fondo); d = ImageDraw.Draw(im)
        if self.e.get('final'):
            return self.final(im, d, f)
        if self.e.get('palabra'):
            self.fija = self.palabra(im, d); return self.fija.copy()
        if self.e.get('cuenta'):
            self.fija = self.cuenta(im, d); return self.fija.copy()
        # el texto arriba, con una raya del color de la marca
        ft = fuente('bold', 70 if not horizontal() else 60); y = 230 if not horizontal() else 70
        for linea in partir(d, self.e['texto'], ft, W - 160):
            d.text((W / 2, y), linea, font=ft, fill=color(c['texto']), anchor='ma'); y += 88 if not horizontal() else 76
        d.rounded_rectangle([W / 2 - 60, y + 14, W / 2 + 60, y + 22], 4, fill=color(c['acento']))
        # la pantalla, con un acercamiento lento; una apaisada va centrada en el hueco que queda
        tar = self.tarjeta(f); z = 1 + 0.035 * f
        tw = round(tar.size[0] * z); th = round(tar.size[1] * z)
        tar = tar.resize((tw, th), Image.BILINEAR)
        if horizontal():
            arriba = round((y + 50 + self.abajo() - self.mascara.size[1]) / 2)
        else:
            arriba = y + 80 if tar.size[1] > 1000 else round((y + 60 + self.abajo() - self.mascara.size[1]) / 2)
        x0 = (W - tw) // 2; y0 = arriba - round((th - self.mascara.size[1]) / 2)
        som = self.sombra.resize((tw + 80, th + 80))
        im.paste(som, (x0 - 40, y0 - 40), som)
        im.paste(tar, (x0, y0), tar)
        if c.get('borde'):   # sobre fondo negro, una pantalla de juego negra no se distingue sin él
            d.rounded_rectangle([x0 - 3, y0 - 3, x0 + tw + 2, y0 + th + 2], round(self.radio * z) + 3, outline=color(c['borde']), width=3)
        if self.e.get('nota'):   # una línea chica debajo de la pantalla
            d.text((W / 2, y0 + th + 50), self.e['nota'], font=fuente('medium', 44), fill=color(c['tenue']), anchor='ma')
        return im

    def completo(self, f):
        """El vídeo a todo el cuadro y, si hay texto, una franja abajo que entra y sale."""
        im = self.clip.cuadro(round(f * self.dur * FPS)).copy()
        texto = self.e.get('texto')
        if texto and self.g.get('presentadora'):
            d = ImageDraw.Draw(im, 'RGBA'); c = self.g['colores']; ft = ImageFont.truetype(PIXEL, 26)
            w = d.textlength(texto, font=ft)
            y0 = self.e.get('etiqueta_y', 120)   # debajo de la barra de vida de los juegos (16 px del lienzo a 6x)
            d.rectangle([40, y0, 40 + w + 40, y0 + 60], fill=(*self.fondo, 210))
            d.rectangle([40, y0, 48, y0 + 60], fill=color(c['acento']))
            d.text((68, y0 + 30), texto, font=ft, fill=color(c['texto']), anchor='lm')
        elif texto:
            t = f * self.dur; visible = min(1, t / 0.4, (self.e.get('rotulo', self.dur) - t) / 0.4)
            if visible > 0:
                c = self.g['colores']; d = ImageDraw.Draw(im, 'RGBA')
                ft = fuente('bold', 52 if horizontal() else 60)
                w = d.textlength(texto, font=ft); alto = 96
                y0 = H - (150 if horizontal() else 520)
                x0 = 80 if horizontal() else (W - w) / 2 - 40
                fondo = (*self.fondo, round(200 * visible))
                d.rounded_rectangle([x0, y0, x0 + w + 80, y0 + alto], 18, fill=fondo)
                d.rectangle([x0, y0, x0 + 10, y0 + alto], fill=(*color(c['acento']), round(255 * visible)))
                d.text((x0 + 45, y0 + alto / 2), texto, font=ft, fill=(*color(c['texto']), round(255 * visible)), anchor='lm')
        return im

    def dialogo(self, im, t):
        """El cuadro de diálogo de RPG: aparece al empezar la voz, el texto se escribe a su ritmo y al acabar
        parpadea el ▼. El retrato con la cara de la escena va a la izquierda y el nombre en una placa."""
        pr = self.g['presentadora']; c = self.g['colores']
        aparece = min(1, max(0, (t + 0.05) / 0.2))
        if aparece <= 0:
            return
        if horizontal():
            x0, y0, x1, y1, tam = 60, H - 330, W - 60, H - 36, 30
        else:
            x0, y0, x1, y1, tam = 40, 1150, W - 40, 1470, 27
        d = ImageDraw.Draw(im, 'RGBA')
        # la ventana: borde blanco doble y fondo azul de SNES, un poco transparente
        a = round(235 * aparece)
        d.rectangle([x0, y0, x1, y1], fill=(14, 20, 62, a))
        d.rectangle([x0, y0, x1, y1], outline=(255, 255, 255, a), width=5)
        d.rectangle([x0 + 9, y0 + 9, x1 - 9, y1 - 9], outline=(120, 140, 220, a), width=2)
        # el retrato
        cara = Image.open(os.path.join(pr['caras'], f"{pr['nombre'].lower()}-{self.e.get('cara', 'normal')}.png")).convert('RGBA')
        lado = cara.size[0] * max(1, 256 // cara.size[0])   # a escala entera, cerca de 256 px (64 x4, 128 x2)
        px, py = x0 + 22, y0 + (y1 - y0 - lado) // 2
        cara = cara.resize((lado, lado), Image.NEAREST)
        d.rectangle([px - 6, py - 6, px + lado + 5, py + lado + 5], fill=(40, 52, 120, a), outline=(255, 255, 255, a), width=3)
        if aparece < 1:
            cara.putalpha(cara.getchannel('A').point(lambda v: round(v * aparece)))
        im.paste(cara, (px, py), cara)
        # la placa del nombre, montada en el borde de arriba
        fn = ImageFont.truetype(PIXEL, 24); wn = d.textlength(pr['nombre'], font=fn)
        nx = px + lado + 40
        d.rectangle([nx, y0 - 26, nx + wn + 36, y0 + 18], fill=(*color(c['acento']), a), outline=(255, 255, 255, a), width=4)
        r_, g_, b_ = color(c['acento']); claro = 0.299 * r_ + 0.587 * g_ + 0.114 * b_ > 150   # con acento claro, letra oscura
        d.text((nx + 18, y0 - 4), pr['nombre'], font=fn, fill=((20, 20, 30, a) if claro else (255, 255, 255, a)), anchor='lm')
        # el texto, escribiéndose: termina un poco antes que la voz
        texto = self.e.get('dice') or self.e.get('voz') or ''
        ft = ImageFont.truetype(PIXEL, tam); tx = px + lado + 40; ancho = x1 - 40 - tx
        lineas, actual = [], ''
        for palabra in texto.split():
            prueba = (actual + ' ' + palabra).strip()
            if d.textlength(prueba, font=ft) > ancho and actual:
                lineas.append(actual); actual = palabra
            else:
                actual = prueba
        lineas.append(actual)
        cuantas = round(len(texto) * min(1, max(0, (t - 0.15) / max(0.3, self.voz_dur * 0.92))))
        y = y0 + 58; resto = cuantas
        for linea in lineas:
            if resto <= 0:
                break
            d.text((tx, y), linea[:resto], font=ft, fill=(255, 255, 255, a))
            resto -= len(linea) + 1; y += round(tam * 1.75)
        if cuantas >= len(texto) and int(t * 3) % 2 == 0:   # el ▼ de «sigue»
            vx, vy = x1 - 50, y1 - 46
            d.polygon([(vx, vy), (vx + 22, vy), (vx + 11, vy + 14)], fill=(255, 255, 255, a))

    def cuenta(self, im, d):
        """La cuenta regresiva: «faltan», el número enorme, «días para el JLPT»."""
        c = self.g['colores']; q = self.e['cuenta']
        cx, cy = W / 2, H / 2 - (0 if horizontal() else 120)
        d.text((cx, cy - (300 if horizontal() else 360)), q['arriba'], font=fuente('demi', 64 if horizontal() else 72), fill=color(c['tenue']), anchor='mm')
        tam = 560 if horizontal() else 640
        fn = fuente('heavy', tam); w = d.textlength(q['numero'], font=fn)
        d.text((cx, cy + tam * 0.36), q['numero'], font=fn, fill=color(c['texto']), anchor='ms')
        d.rounded_rectangle([cx - w / 2, cy + tam * 0.44, cx + w / 2, cy + tam * 0.44 + 12], 6, fill=color(c['acento']))
        d.text((cx, cy + (400 if horizontal() else 480)), q['abajo'], font=fuente('bold', 64 if horizontal() else 76), fill=color(c['acento']), anchor='mm')
        return im

    def palabra(self, im, d):
        """La tarjeta de una palabra: el japonés grande, la lectura encima y el significado debajo."""
        c = self.g['colores']; p = self.e['palabra']
        cx, cy = W / 2, H / 2 - (0 if horizontal() else 80)
        if p.get('num'):
            d.text((cx, cy - (330 if horizontal() else 520)), p['num'], font=fuente('demi', 44), fill=color(c['tenue']), anchor='mm')
        if self.e.get('texto'):
            d.text((cx, cy - (260 if horizontal() else 430)), self.e['texto'], font=fuente('bold', 50), fill=color(c['acento']), anchor='mm')
        tam = 230 if horizontal() else 250
        if len(p['jp']) > 8:   # una frase, no una palabra: más chica y, si no cabe, en dos líneas por la coma o la mitad
            tam = 110 if horizontal() else 96
            fj = ImageFont.truetype(JAPONESA, tam)
            if d.textlength(p['jp'], font=fj) > W - 160:
                corte = p['jp'].find('、') + 1 or len(p['jp']) // 2
                p = {**p, 'jp': p['jp'][:corte] + '\n' + p['jp'][corte:]}
            d.multiline_text((cx, cy), p['jp'], font=fj, fill=color(c['texto']), anchor='mm', align='center', spacing=28)
            if p.get('es'):
                d.text((cx, cy + 200), p['es'], font=fuente('demi', 60), fill=color(c['acento']), anchor='mm')
            return im
        fj = ImageFont.truetype(JAPONESA, tam)
        while d.textlength(p['jp'], font=fj) > W - 200 and tam > 90:
            tam -= 10; fj = ImageFont.truetype(JAPONESA, tam)
        if p.get('lectura') and p['lectura'] != p['jp']:
            d.text((cx, cy - tam * 0.62), p['lectura'], font=ImageFont.truetype(JAPONESA, 64), fill=color(c['tenue']), anchor='ms')
        d.text((cx, cy), p['jp'], font=fj, fill=color(c['texto']), anchor='mm')
        d.text((cx, cy + tam * 0.62 + 40), p['es'], font=fuente('demi', 64 if horizontal() else 70), fill=color(c['acento']), anchor='mm')
        return im

    def final(self, im, d, f):
        g = self.g; c = g['colores']; m = g['marca']
        a = min(1, f * 3)   # aparece en el primer tercio
        def mezcla(col):
            base = self.fondo; col = color(col)
            return tuple(round(base[i] + (col[i] - base[i]) * a) for i in range(3))
        # posiciones: las del vertical (1920 de alto) o, en horizontal, las mismas apretadas al centro
        Y = (lambda y: y) if not horizontal() else (lambda y: round(540 + (y - 1100) * 0.62))
        if m.get('logo'):   # la imagen del logo (pixel art: se agranda sin suavizar)
            lg = Image.open(m['logo']).convert('RGBA'); k = min(m.get('logo_ancho', 760) / lg.size[0], (420 if not horizontal() else 260) / lg.size[1])
            lg = lg.resize((round(lg.size[0] * k), round(lg.size[1] * k)), Image.NEAREST)
            lg.putalpha(lg.getchannel('A').point(lambda v: round(v * a)))
            im.paste(lg, ((W - lg.size[0]) // 2, Y(880) - lg.size[1]), lg)
        else:
            tam = 150 if not horizontal() else 120
            while True:
                fm = fuente('heavy', tam); w = d.textlength(m['nombre'], font=fm)
                if w <= W - 200 or tam <= 60:
                    break
                tam -= 6
            d.text(((W - w) / 2 - (20 if m.get('punto') else 0), Y(850)), m['nombre'], font=fm, fill=mezcla(c['texto']), anchor='ls')
            if m.get('punto'):
                r = 20; cx = (W + w) / 2 + 10; cy = Y(850) - r
                d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=mezcla(m['punto']))
        d.text((W / 2, Y(930)), m['lema'], font=fuente('demi', 64 if not horizontal() else 52), fill=mezcla(c['acento']), anchor='ma')
        if m.get('insignia'):
            # la insignia oficial de la tienda, tal cual (sólo se escala, con suavizado), en lugar de la píldora
            # del sitio, y la nota de marca abajo, como piden las reglas de la insignia de Google Play
            ins = Image.open(m['insignia']).convert('RGBA'); k = m.get('insignia_ancho', 560 if not horizontal() else 420) / ins.size[0]
            ins = ins.resize((round(ins.size[0] * k), round(ins.size[1] * k)), Image.LANCZOS)
            ins.putalpha(ins.getchannel('A').point(lambda v: round(v * a)))
            im.paste(ins, ((W - ins.size[0]) // 2, Y(1040)), ins)
            if m.get('legal'):
                d.text((W / 2, Y(1480)), m['legal'], font=fuente('regular', 30 if not horizontal() else 24), fill=mezcla(c['tenue']), anchor='ma')
        else:
            t0 = 72 if not horizontal() else 58
            fs = fuente('bold', t0); ws = d.textlength(m['sitio'], font=fs)
            if ws > W - 200:
                fs = fuente('bold', round(t0 * (W - 200) / ws)); ws = d.textlength(m['sitio'], font=fs)
            alto = 130 if not horizontal() else 104
            d.rounded_rectangle([W / 2 - ws / 2 - 50, Y(1080), W / 2 + ws / 2 + 50, Y(1080) + alto], alto / 2, fill=mezcla(c['acento']))
            d.text((W / 2, Y(1080) + alto / 2), m['sitio'], font=fs, fill=mezcla(c.get('sobre_acento', c['fondo'])), anchor='mm')
        if m.get('pie'):
            d.text((W / 2, Y(1300 if not m.get('insignia') else 1320)), m['pie'], font=fuente('medium', 44 if not horizontal() else 36), fill=mezcla(c['tenue']), anchor='ma')
        return im


def main():
    global W, H
    g = json.load(open(sys.argv[1], encoding='utf-8'))
    if g.get('formato') == 'horizontal':
        W, H = 1920, 1080
    base = os.path.dirname(os.path.abspath(sys.argv[1]))
    for e in g['escenas']:
        for k in ('imagen', 'video'):
            if e.get(k):
                e[k] = os.path.join(base, os.path.expanduser(e[k]))
    if g.get('musica'):
        g['musica']['archivo'] = os.path.join(base, os.path.expanduser(g['musica']['archivo']))
    for k in ('logo', 'insignia'):
        if g['marca'].get(k):
            g['marca'][k] = os.path.join(base, os.path.expanduser(g['marca'][k]))
    if g.get('presentadora'):
        g['presentadora']['caras'] = os.path.join(base, os.path.expanduser(g['presentadora'].get('caras', 'avatar')))
    with tempfile.TemporaryDirectory() as tmp:
        os.chmod(tmp, 0o700)
        cab = os.path.join(tmp, 'h.txt')
        with open(cab, 'w') as h:
            h.write(f'X-Goog-Api-Key: {clave()}\n')
        os.chmod(cab, 0o600)
        voces = [voz_de(e, g, cab) for e in g['escenas']]
        # duraciones: la voz más un respiro; la final, al menos 4 s
        # (`dur` en una escena la alarga, para seguir los cortes de un vídeo)
        durs = [max(len(v) / SR + RESPIRO + (1.2 if e.get('final') else 0) if len(v) else 0, e.get('dur', 0)) for v, e in zip(voces, g['escenas'])]
        durs[-1] = max(durs[-1], 4.0)
        for i, (v, e, d_) in enumerate(zip(voces, g['escenas'], durs)):
            if e.get('dur') and d_ > e['dur'] + 0.01:
                print(f'  ojo: la voz de la escena {i + 1} ({len(v) / SR:.2f} s) no cabe en sus {e["dur"]} s')
            if d_ <= 0:
                sys.exit(f'la escena {i + 1} no tiene voz ni dur')
        inicio = [0.5]
        for d_ in durs[:-1]:
            inicio.append(inicio[-1] + d_)
        total = inicio[-1] + durs[-1]
        print(f'  {len(durs)} escenas, {total:.1f} s')
        # audio: música con la voz encima; la música baja mientras hay voz
        n = int(total * SR); voz = np.zeros(n, dtype=np.float32); hay = np.zeros(n, dtype=np.float32)
        for v, t0 in zip(voces, inicio):
            i0 = int((t0 + 0.15) * SR); k = min(len(v), n - i0)
            if k > 0:
                voz[i0:i0 + k] += v[:k]; hay[i0:i0 + k] = 1
        suav = int(0.25 * SR)
        hay = np.convolve(hay, np.ones(suav) / suav, mode='same')
        if g.get('musica'):   # el sonido de un vídeo (el del juego), desde que empieza la primera escena
            mu = g['musica']
            crudo = subprocess.run([FF, '-loglevel', 'error', '-ss', str(mu.get('desde', 0)), '-i', mu['archivo'],
                                    '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
            pista = np.frombuffer(crudo, dtype=np.int16).astype(np.float32) / 32768
            pista *= mu.get('volumen', 0.07) / max(1e-6, np.sqrt(np.mean(pista ** 2)))
            fondo_ = np.zeros(n, dtype=np.float32); i0 = int(mu.get('en', inicio[0]) * SR); k = min(len(pista), n - i0)
            fondo_[i0:i0 + k] = pista[:k]
            fade = int(0.8 * SR); fondo_[-fade:] *= np.linspace(1, 0, fade)
        else:
            fondo_ = musica(total, g.get('bpm', 92)) * g.get('volumen_musica', 1.0)
        mus = fondo_ * (0.9 - 0.62 * np.clip(hay, 0, 1))
        mezcla = voz * 0.95 + mus
        mezcla /= max(1e-6, np.abs(mezcla).max() / 0.89)
        wav = os.path.join(tmp, 'mezcla.wav')
        crudo = (np.repeat(mezcla[:, None], 2, axis=1) * 32767).astype('<i2').tobytes()
        subprocess.run([FF, '-loglevel', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-', wav],
                       input=crudo, check=True)
        # capítulos, para la descripción de YouTube
        salida = os.path.expanduser(g['salida']); os.makedirs(os.path.dirname(salida), exist_ok=True)
        caps = [{'t': round(t0 if i else 0, 1), 'titulo': e['capitulo']} for i, (e, t0) in enumerate(zip(g['escenas'], inicio)) if e.get('capitulo')]
        if caps:
            json.dump(caps, open(salida[:-4] + '.capitulos.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        # vídeo: las escenas se abren una a una (un clip abierto lee de ffmpeg) y la siguiente, para el cruce
        cmd = [FF, '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS),
               '-i', '-', '-i', wav, '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p',
               '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', '-shortest', salida]
        p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
        abiertas = {}
        def escena(j):
            if j not in abiertas:
                abiertas[j] = Escena(g['escenas'][j], g, durs[j], len(voces[j]) / SR)
                for viejo in [x for x in abiertas if x < j - 1]:
                    del abiertas[viejo]
            return abiertas[j]
        fondo = Image.new('RGB', (W, H), color(g['colores']['fondo']))
        for k in range(int(total * FPS)):
            t = k / FPS
            i = max(0, max(j for j, t0 in enumerate(inicio) if t0 <= t) if t >= inicio[0] else 0)
            if t < inicio[0]:
                im = escena(0).cuadro(0); a = t / inicio[0]
                im = Image.blend(fondo, im, a)
            else:
                f = (t - inicio[i]) / durs[i]
                im = escena(i).cuadro(min(1, f))
                # cruce con la siguiente al final de la escena
                if i + 1 < len(durs) and t > inicio[i + 1] - FUNDIDO:
                    a = (t - (inicio[i + 1] - FUNDIDO)) / FUNDIDO
                    im = Image.blend(im, escena(i + 1).cuadro(0), min(1, a))
                if i == len(durs) - 1 and total - t < 0.6:
                    im = Image.blend(fondo, im, max(0, (total - t) / 0.6))
            p.stdin.write(im.tobytes())
        p.stdin.close(); p.wait()
        print(f'{salida}: {total:.1f} s, {len(durs)} escenas' + (f', {len(caps)} capítulos' if caps else ''))


if __name__ == '__main__':
    main()
