"""La vista de punteros de «Algoritmos en pixel» (20-nov-2026): un arreglo ordenado en barras, con izq, der y medio.

Las barras de renderizador.py sirven para ordenar: se comparan de dos en dos y se cambian de lugar. Una búsqueda no
mueve nada: el arreglo ya viene ordenado (una escalera) y lo que se mueve son los punteros. Aquí cada barra lleva
su número encima (de dos cifras: dentro de la barra no cabe), el que se busca es una raya punteada a su altura (así
se ve de lejos si el de en medio es más chico o más grande), y lo que se descarta se apaga despacio. FondoPunteros
hereda de renderizador.Fondo el editor con el código, la línea que corre, los contadores, la tabla con la O grande
y el enlace; lo suyo es el dibujo de abajo, sus pasos y su sonido.

El archivo del algoritmo (busqueda.py es el modelo) la pide con VISTA = 'punteros' y además trae:
- ARREGLO: los valores, ya ordenados (16 caben con números de dos cifras);
- VARIABLE: la de la izquierda de los contadores; su nombre en `vars` es también el que se busca (la raya);
- MARCAS: los punteros. Los que van con 'abajo': 'izq' (su rótulo crece hacia la izquierda de su flecha) o 'der'
  (hacia la derecha) se dibujan bajo el piso, y así caben aunque estén pegados o en la misma casilla; el que va con
  'arriba' (medio) pinta su barra y lleva su rótulo encima del número.
En CONTADORES, `compara` cuenta las miradas de la búsqueda y `cambia` las de mirar uno por uno (sale «-» hasta que
cuenta la primera).

Los pasos (todos pueden llevar `lineas`, `vars`, `marcas` y `cuenta`, como los de las barras):
- marca: sólo mueve los punteros (y las variables);
- rango [izq, der, None]: el tramo donde todavía puede estar; lo que queda fuera se apaga en 0.35 s, y con None se
  vuelven a encender todas;
- compara {j}: mira la barra j contra lo que se busca; arriba sale la cuenta («56 < 63») hasta la siguiente; suma
  una mirada;
- fija {k}: ¡encontrado! (verde, con la fanfarria de ganar de DC);
- pasada {k}: mirar uno por uno: la barra k se ilumina y queda marcada (con `cuenta`: ['cambia'] suma al segundo
  contador);
- linea: sólo mueve el resaltado del código.
"""
import math
from PIL import ImageDraw

import renderizador as R
from renderizador import PAL, NEGRO, BLANCO, atari, mezcla, suave, texto, nota, ruido

ESC_X0, ESC_X1 = 72, 1032       # de dónde a dónde van las barras (a la izquierda, el número que se busca)
BASE_Y = R.BASE_Y               # el piso (1150): debajo van las flechas de izq y der, hasta ~1218
ALTO_MIN, ALTO_MAX = 24, 252    # lo que mide la barra más baja y la más alta
APAGA = 0.35                    # lo que tarda en apagarse lo descartado
CUENTA_Y = 744                  # la cuenta de la mirada («56 < 63»), entre los contadores y las barras
MIRADA = atari(11, 4)           # una barra que ya se miró, uno por uno


class FondoPunteros(R.Fondo):
    # en la tabla parpadea el contador de las miradas de la búsqueda: es el que nombra LeIA
    PARPADEA = 'compara'

    def medidas(self):
        self.valores = list(self.alg.ARREGLO); self.n = len(self.valores)
        if self.valores != sorted(self.valores):
            raise SystemExit('el arreglo de una búsqueda binaria tiene que venir ordenado')
        self.slot = (ESC_X1 - ESC_X0) / self.n
        self.ancho_barra = int(self.slot * 0.76 / 4) * 4
        self.vmax = max(self.valores)

    def alto(self, v):
        return 4 * round((ALTO_MIN + (ALTO_MAX - ALTO_MIN) * v / self.vmax) / 4)

    def cx(self, pos):
        return ESC_X0 + self.slot * (pos + 0.5)

    def pintar_piso(self, im, d):
        d.rectangle([ESC_X0 - 8, BASE_Y, ESC_X1 + 7, BASE_Y + 3], fill=PAL['dgray'])

    # -------------------------------------------------- el estado
    def estado(self):
        st = super().estado()
        st.update({'apaga': {}, 'mirada': {}, 'hallado': None, 'cuenta_txt': None})
        return st

    def aplicar(self, e, st):
        tipo = e['tipo']
        self.contar(e, st)
        for nombre, pos in e.get('marcas', {}).items():
            if pos is None:
                st['marcas'].pop(nombre, None)
            else:
                st['marcas'][nombre] = pos
        if 'rango' in e:
            nuevo = e['rango']
            if nuevo is None:   # todas encendidas otra vez
                st['apaga'] = {}
            else:
                for pos in range(self.n):
                    if not (nuevo[0] <= pos <= nuevo[1]) and pos not in st['apaga']:
                        st['apaga'][pos] = e['t0']
            st['rango'] = nuevo
            if nuevo is None:
                st['cuenta_txt'] = None
        if tipo == 'compara':
            v, x = self.valores[e['j']], st['vars'].get(self.var_nombre)
            signo = '=' if v == x else '<' if v < x else '>'
            st['cuenta_txt'] = (f'{v} {signo} {x}', e['t0'], signo)
        elif tipo == 'fija':
            st['hallado'] = (e['k'], e['t0'])
        elif tipo == 'pasada' and 'k' in e:
            st['mirada'][e['k']] = e['t0']

    # -------------------------------------------------- un cuadro
    def cuadro(self, t, esc, e, st):
        im = super().cuadro(t, esc, e, st)
        if st['cuenta']['cambia'] == 0:   # «uno por uno» todavía no cuenta: un guion en vez de un cero
            d = ImageDraw.Draw(im); cx = dict(self.columnas())['cambia']; y = self.cont_y + 34
            d.rectangle([cx - 80, y - 15, cx + 80, y + 40], fill=NEGRO)
            texto(im, cx, y, '-', R.VIVO['cambia'], 5, 'm')
        return im

    def dibujo(self, im, d, t, e, st, cae=None, apagadas=False):
        tipo = e['tipo'] if e else None
        medio = st['marcas'].get('medio')
        hallado = st['hallado']
        rotulos = []   # (x, y, texto, color): los números van encima de la raya del que se busca
        for pos in range(self.n):
            v = self.valores[pos]
            color, letra = R.BARRA, PAL['white']
            if pos in st['mirada']:
                color = MIRADA
                if 0 <= t - st['mirada'][pos] < 0.12:
                    color = BLANCO
            if pos == medio:
                color = letra = R.VIVO['compara']
                if tipo == 'compara' and e['j'] == pos and t - e['t0'] < 0.14:
                    color = BLANCO
            if hallado and pos == hallado[0]:
                color = letra = PAL['lgreen']
                if 0 <= t - hallado[1] < 0.16:
                    color = BLANCO
            dy = 0
            if cae is not None:   # las barras caen una por una al empezar
                dt = t - cae['t0'] - 0.15 - pos * 0.06
                if dt < 0:
                    continue
                dy = -int(360 * max(0, 1 - dt / 0.22) ** 2)
            if pos in st['apaga']:   # descartada: se apaga despacio
                f = 0.8 * suave((t - st['apaga'][pos]) / APAGA)
                color, letra = mezcla(color, NEGRO, f), mezcla(letra, NEGRO, f)
            if apagadas:
                color, letra = mezcla(color, NEGRO, 0.75), mezcla(letra, NEGRO, 0.75)
            y0 = self.barra_lisa(d, self.cx(pos), v, color, -dy)
            rotulos.append((self.cx(pos), y0 - 32, str(v), letra))
        if apagadas:
            for x, y, s, c in rotulos:
                texto(im, x, y, s, c, 3, 'm')
            return
        x = st['vars'].get(self.var_nombre)
        if x is not None and cae is None:   # el que se busca: una raya punteada a su altura
            y = BASE_Y - self.alto(x)
            for xx in range(ESC_X0 - 8, ESC_X1 + 8, 24):
                d.rectangle([xx, y - 2, xx + 13, y + 1], fill=PAL['orange'])
            texto(im, ESC_X0 - 14, y - 12, str(x), PAL['orange'], 3, 'r')
        for xx, y, s, c in rotulos:
            texto(im, xx, y, s, c, 3, 'm')
        if cae is not None:
            return
        # el tramo donde todavía puede estar: una raya en el piso
        rango = st['rango']
        if rango and rango[0] <= rango[1]:
            x0 = round(self.cx(rango[0]) - self.slot / 2) + 4; x1 = round(self.cx(rango[1]) + self.slot / 2) - 4
            d.rectangle([x0, BASE_Y, x1, BASE_Y + 5], fill=PAL['cyan'])
        # los punteros: izq y der abajo (cada rótulo hacia su lado), medio encima de su número
        for nombre, pos in st['marcas'].items():
            cfg = self.marcas_cfg.get(nombre, {})
            color = R.VIVO[cfg.get('color', 'pasada')]; s = cfg.get('texto', nombre); cx = self.cx(pos)
            if cfg.get('arriba'):
                y = BASE_Y - self.alto(self.valores[pos]) - 32 - 58
                texto(im, cx, y, s, color, 3, 'm')
            else:
                texto(im, cx, BASE_Y + 14, '▲', color, 3, 'm')
                # en la misma casilla que el otro, cada rótulo se aparta del todo hacia su lado
                junto = st['marcas'].get('der' if cfg.get('abajo') == 'izq' else 'izq') == pos
                if cfg.get('abajo') == 'izq':
                    texto(im, cx + (-10 if junto else 12), BASE_Y + 44, s, color, 3, 'r')
                else:
                    texto(im, cx + (10 if junto else -12), BASE_Y + 44, s, color, 3, 'l')
        # mirando uno por uno: la flecha bajo la que se mira
        if tipo == 'pasada' and 'k' in e:
            texto(im, self.cx(e['k']), BASE_Y + 14, '▲', PAL['cyan'], 3, 'm')
        # la cuenta de la mirada
        if st['cuenta_txt']:
            s, t0, signo = st['cuenta_txt']
            c = PAL['lgreen'] if signo == '=' else R.VIVO['compara']
            if t - t0 < 0.14:
                c = BLANCO
            texto(im, R.W // 2, CUENTA_Y, s, c, 4, 'm')

    def ventana(self, d, entra):
        """La de renderizador, pero tan ancha como estas barras (llegan más a los lados)."""
        x0, y0, x1, y1 = ESC_X0 - 20, self.techo - 4, ESC_X1 + 20, BASE_Y + 76
        y1 = y0 + round((y1 - y0) * entra)
        if y1 - y0 > 8:
            d.rectangle([x0, y0, x1, y1], fill=PAL['dgray'])
            d.rectangle([x0 + 4, y0 + 4, x1 - 4, y1 - 4], fill=NEGRO)
        return x0, y0, x1, y1

    def barra_lisa(self, d, cx, v, color, alza=0):
        """Una barra con el bisel de las de renderizador, sin número adentro (va encima). Devuelve su techo."""
        bw = self.ancho_barra; x0 = round(cx - bw / 2); x1 = x0 + bw
        y1 = round(BASE_Y - alza); y0 = y1 - self.alto(v); p = 6
        d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=color)
        d.rectangle([x0, y0, x1 - 1, y0 + 3], fill=mezcla(color, BLANCO, 0.5))
        d.rectangle([x0, y0, x0 + p - 1, y1 - 1], fill=mezcla(color, BLANCO, 0.35))
        d.rectangle([x1 - p, y0 + 4, x1 - 1, y1 - 1], fill=mezcla(color, NEGRO, 0.35))
        return y0

    # -------------------------------------------------- el sonido
    def sonido_pasos(self, sfx):
        hz = lambda pos: 330 * 2 ** (pos / self.n * 1.5)   # la escalera también sube en el sonido
        for s in self.escenas:
            if s['vista'] == 'inicio':
                for pos in range(self.n):
                    nota(sfx, s['t0'] + 0.15 + pos * 0.06 + 0.22, hz(pos), 0.05, 'triangle', 0.3)
        for e in self.eventos:
            t0, tipo = e['t0'], e['tipo']
            if tipo == 'marca' and 'medio' in e.get('marcas', {}) and e['marcas']['medio'] is not None:
                nota(sfx, t0, 720, 0.03, 'triangle', 0.2)
            elif tipo == 'marca':
                nota(sfx, t0, 520, 0.03, 'triangle', 0.18)
            elif tipo == 'compara':
                nota(sfx, t0, hz(e['j']), 0.05, 'square', 0.11)
                nota(sfx, t0 + 0.06, hz(e['j']), 0.05, 'square', 0.11)
            elif tipo == 'rango' and e.get('rango'):   # lo descartado se apaga: un «fiu» que baja
                nota(sfx, t0, 700, 0.28, 'triangle', 0.22, hasta=180)
                ruido(sfx, t0, 0.06, 0.05, 2500)
            elif tipo == 'fija':   # 'eat' y 'win' de DC
                nota(sfx, t0, 660, 0.06, 'square', 0.14); nota(sfx, t0 + 0.06, 990, 0.08, 'square', 0.14)
                for i, fr in enumerate([523, 659, 784, 1046, 784, 1046]):
                    nota(sfx, t0 + 0.2 + i * 0.09, fr, 0.09, 'square', 0.14)
            elif tipo == 'pasada' and 'k' in e:
                nota(sfx, t0, hz(e['k']), 0.04, 'square', 0.08)
