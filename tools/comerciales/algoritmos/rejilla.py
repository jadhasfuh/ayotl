"""La vista de rejilla de «Algoritmos en pixel» (21-nov-2026): un laberinto que se recorre, con su cola al lado.

Las barras de renderizador.py sirven para un arreglo; un laberinto es una rejilla de casillas (un grafo en el que
cada casilla abierta es vecina de las abiertas de arriba, abajo y los lados). A la izquierda va el laberinto: los
muros en azul de Atari, cada casilla visitada del color de su capa y con su distancia, la que acaba de salir de la
cola con marco blanco y la que se revisa y ya tenía número, con marco rojo. A la derecha va la cola ENTERA: el
arreglo `cola` de la lección, con lo que ya salió apagado y la flecha de `cabeza` bajo el siguiente (nadie se
mueve, como en el truco del episodio de la cola). Como la cola se llena en orden de distancia, se ve por capas: una
tira de colores. Cuando la BFS llega a la salida, la cola deja su lugar a la cuenta de los pasos: el camino de
vuelta se pinta de blanco casilla por casilla, y después el de una DFS se traza encima en naranja.

FondoRejilla hereda de renderizador.Fondo el editor con el código, la línea que corre y el enlace. No lleva
contadores (columnas() vacía): así caben 16 renglones de código y, debajo, un laberinto de 9 x 11 a 40 px.

El archivo del algoritmo (laberinto.py es el modelo) la pide con VISTA = 'rejilla' y además trae:
- LAB: las filas del laberinto ('#' muro, '.' abierta), INI y FIN: (fila, columna) de la entrada y la salida;
- ROTULOS: {'cola', 'cabeza', 'pasos' (con {}), 'corto', 'capas'}, por idioma;
- en el guion, `remate`: la fracción de esa escena en la que sale «por capas: el más corto».

Los pasos (todos pueden llevar `lineas` y `color`, el tipo con el que se pinta su línea de código):
- empieza {c, d}: la entrada recibe su 0 y entra a la cola;
- sale {c, d}: sale de la cola (cabeza avanza) y su casilla queda con marco blanco;
- ya {c}: esa vecina ya tenía número: marco rojo, no entra;
- entra {c, d}: la vecina nueva recibe su distancia y entra al final de la cola;
- llega {c}: la que salió es la salida: destello y fanfarria;
- camino {c}: una casilla más del camino de vuelta (la primera es la salida);
- devuelve {pasos}: el camino completo;
- dfs {c, i}: una casilla más del camino de la DFS, en naranja.
"""
from PIL import ImageDraw

import renderizador as R
from renderizador import PAL, NEGRO, BLANCO, atari, en, mezcla, nota, ruido, suave, texto

CELDA = 40                        # el lado de una casilla
LAB_X0 = 60                       # la izquierda del laberinto (a su izquierda, la flecha de la entrada)
PANEL_X0, PANEL_X1 = 540, 1030    # la cola, y después la cuenta de los pasos
CAJA, PASO_CAJA, POR_FILA, FILA_CAJAS = 46, 49, 10, 70   # las cajas de la cola: lado, de una a otra, por renglón
ABAJO = 1226                      # nada abajo de aquí: desde 1244 va la placa de LeIA
MURO = atari(9, 2)
SIN_VER = atari(0, 1)


def capa(d):
    """El color de la capa d: un arcoíris de la paleta que empieza en el cian de la entrada."""
    return atari((10 - d) % 15 + 1, 5)


class FondoRejilla(R.Fondo):
    PARPADEA = None

    def columnas(self):
        return []   # sin contadores

    def medidas(self):
        alg = self.alg
        self.n = 0   # sin barras (estado() de renderizador cuenta con él)
        self.lab = list(alg.LAB); self.filas, self.cols = len(self.lab), len(self.lab[0])
        self.ini, self.fin = tuple(alg.INI), tuple(alg.FIN)
        self.techo = self.panel_y1 + 16
        self.lab_y0 = self.techo + 12
        self.lab_x1 = LAB_X0 + self.cols * CELDA
        if self.lab_y0 + self.filas * CELDA > ABAJO - 16 or self.lab_x1 > PANEL_X0 - 36:
            raise SystemExit(f'el laberinto no cabe: el código llega a {self.panel_y1} y el laberinto mide '
                             f'{self.filas} x {self.cols} casillas de {CELDA} px')
        largo = sum(e['tipo'] in ('empieza', 'entra') for e in self.eventos)
        renglones = -(-largo // POR_FILA)
        self.cajas_y0 = self.lab_y0 + 44
        if self.cajas_y0 + renglones * FILA_CAJAS > ABAJO:
            raise SystemExit(f'la cola llega a {largo}: no cabe en {renglones} renglones de cajas')
        self.rot = {k: en(v, self.lang) for k, v in alg.ROTULOS.items()}
        self.remate_t = None
        for s in self.escenas:
            if s['guion'].get('remate') is not None and self.remate_t is None:
                self.remate_t = s['t0'] + s['guion']['remate'] * s['dur']
        self.devuelve_t = next((e['t0'] for e in self.eventos if e['tipo'] == 'devuelve'), None)

    def centro(self, c):
        return LAB_X0 + c[1] * CELDA + CELDA // 2, self.lab_y0 + c[0] * CELDA + CELDA // 2

    def pintar_piso(self, im, d):
        pass   # el laberinto cae al empezar: se dibuja en cada cuadro

    def ventana(self, d, entra):
        """La que tapa el dibujo (el enlace): tan ancha como el laberinto y la cola juntos."""
        x0, y0, x1, y1 = 40, self.techo - 4, R.W - 40, ABAJO
        y1 = y0 + round((y1 - y0) * entra)
        if y1 - y0 > 8:
            d.rectangle([x0, y0, x1, y1], fill=PAL['dgray'])
            d.rectangle([x0 + 4, y0 + 4, x1 - 4, y1 - 4], fill=NEGRO)
        return x0, y0, x1, y1

    # -------------------------------------------------- el estado
    def estado(self):
        st = super().estado()
        st.update({'dist': {}, 'entro': {}, 'cola': [], 'cabeza': 0, 'cabeza_t': -9, 'actual': None,
                   'llego': None, 'camino': {}, 'camino_t0': None, 'dfs': [], 'pasos': None})
        return st

    def aplicar(self, e, st):
        tipo = e['tipo']; t0 = e['t0']
        if tipo in ('empieza', 'entra'):
            st['dist'][e['c']] = e['d']; st['entro'][e['c']] = t0; st['cola'].append(e['c'])
        elif tipo == 'sale':
            st['cabeza'] += 1; st['cabeza_t'] = t0; st['actual'] = (e['c'], t0)
        elif tipo == 'llega':
            st['llego'] = t0
        elif tipo == 'camino':
            if st['camino_t0'] is None:
                st['camino_t0'] = t0; st['actual'] = None
            st['camino'][e['c']] = t0
        elif tipo == 'devuelve':
            st['pasos'] = (e['pasos'], t0)
        elif tipo == 'dfs':
            st['dfs'].append((e['c'], t0))

    # -------------------------------------------------- un cuadro
    def dibujo(self, im, d, t, e, st, cae=None, apagadas=False):
        ver = (lambda c: mezcla(c, NEGRO, 0.75)) if apagadas else (lambda c: c)
        tipo = e['tipo'] if e else None
        # cuánto se apaga lo que no es el camino, desde que empieza a dibujarse de vuelta
        apaga = 0.0 if st['camino_t0'] is None else 0.55 * suave((t - st['camino_t0']) / 0.4)
        for y in range(self.filas):
            dy = 0
            if cae is not None:   # las filas caen una por una al empezar
                dt = t - cae['t0'] - 0.15 - y * 0.07
                if dt < 0:
                    continue
                dy = -int(260 * max(0, 1 - dt / 0.22) ** 2)
            for x in range(self.cols):
                self.casilla(im, d, t, (y, x), st, dy, apaga, ver)
        if cae is not None and t - cae['t0'] < 0.15 + self.filas * 0.07 + 0.22:
            return self.pintar_cola(im, d, t, st, ver, cae)
        # la entrada y la salida: una flecha que entra y otra que sale
        _, yi = self.centro(self.ini); _, yf = self.centro(self.fin)
        texto(im, LAB_X0 - 28, yi - 12, '▶', ver(PAL['cyan']), 3)
        sal = PAL['lgreen']
        if st['llego'] is not None and int((t - st['llego']) * 8) % 2 == 0 and t - st['llego'] < 0.9:
            sal = BLANCO
        texto(im, self.lab_x1 + 6, yf - 12, '▶', ver(sal), 3)
        # la que acaba de salir de la cola, y la vecina que ya tenía número
        if st['actual'] is not None:
            c, t0 = st['actual']; cx, cy = self.centro(c)
            self.marco(d, cx, cy, ver(BLANCO), 4)
        if tipo == 'ya':
            cx, cy = self.centro(e['c']); self.marco(d, cx, cy, ver(PAL['red']), 4)
        # el camino de la DFS, en naranja, encima de todo
        if st['dfs']:
            pts = [self.centro(c) for c, _ in st['dfs']]
            for (ax, ay), (bx, by) in zip(pts, pts[1:]):
                d.rectangle([min(ax, bx) - 3, min(ay, by) - 3, max(ax, bx) + 2, max(ay, by) + 2], fill=ver(PAL['orange']))
            hx, hy = pts[-1]; c_ = BLANCO if t - st['dfs'][-1][1] < 0.1 else PAL['orange']
            d.rectangle([hx - 7, hy - 7, hx + 6, hy + 6], fill=ver(c_))
        if st['camino_t0'] is None:
            self.pintar_cola(im, d, t, st, ver)
        else:
            self.cuenta_pasos(im, d, t, st, ver)

    def casilla(self, im, d, t, c, st, dy, apaga, ver):
        y, x = c
        x0 = LAB_X0 + x * CELDA; y0 = self.lab_y0 + y * CELDA + dy; x1, y1 = x0 + CELDA - 1, y0 + CELDA - 1
        if self.lab[y][x] == '#':   # un ladrillo con luz arriba y a la izquierda
            d.rectangle([x0, y0, x1, y1], fill=ver(MURO))
            d.rectangle([x0, y0, x1, y0 + 3], fill=ver(mezcla(MURO, BLANCO, 0.3)))
            d.rectangle([x0, y0, x0 + 3, y1], fill=ver(mezcla(MURO, BLANCO, 0.18)))
            d.rectangle([x0 + 4, y1 - 3, x1, y1], fill=ver(mezcla(MURO, NEGRO, 0.45)))
            return
        if c not in st['dist']:   # abierta y sin visitar: un punto en el suelo
            d.rectangle([x0 + 17, y0 + 17, x0 + 22, y0 + 22], fill=ver(SIN_VER))
            return
        dist = st['dist'][c]; dt = t - st['entro'][c]
        color = capa(dist)
        if c in st['camino']:
            color = BLANCO if t - st['camino'][c] >= 0.12 else PAL['yellow']
        else:
            color = mezcla(color, NEGRO, apaga)
        if dt < 0.1:
            color = BLANCO
        m = 2 + round(12 * (1 - suave(dt / 0.15)))   # entra creciendo
        a0, b0, a1, b1 = x0 + m, y0 + m, x1 - m, y1 - m
        d.rectangle([a0, b0, a1, b1], fill=ver(color))
        if m <= 3:
            d.rectangle([a0, b0, a1, b0 + 2], fill=ver(mezcla(color, BLANCO, 0.45)))
            d.rectangle([a0 + 3, b1 - 2, a1, b1], fill=ver(mezcla(color, NEGRO, 0.3)))
            texto(im, x0 + CELDA // 2, y0 + 12, str(dist), ver(mezcla(color, NEGRO, 0.88)), 2, 'm')

    def marco(self, d, cx, cy, color, g):
        x0, y0 = cx - CELDA // 2, cy - CELDA // 2; x1, y1 = x0 + CELDA - 1, y0 + CELDA - 1
        for a, b, c_, e_ in ((x0, y0, x1, y0 + g - 1), (x0, y1 - g + 1, x1, y1), (x0, y0, x0 + g - 1, y1), (x1 - g + 1, y0, x1, y1)):
            d.rectangle([a, b, c_, e_], fill=color)

    def pintar_cola(self, im, d, t, st, ver, cae=None):
        """El arreglo `cola` entero: lo ya atendido apagado, la que acaba de salir con marco, la flecha de cabeza."""
        texto(im, PANEL_X0, self.lab_y0 + 4, self.rot['cola'], ver(PAL['lgray']), 3)
        texto(im, PANEL_X1, self.lab_y0 + 8, self.rot['cabeza'], ver(PAL['cyan']), 2, 'r')
        if cae is not None:
            return
        cola, cab = st['cola'], st['cabeza']
        for i, c in enumerate(cola):
            x0 = PANEL_X0 + (i % POR_FILA) * PASO_CAJA; y0 = self.cajas_y0 + (i // POR_FILA) * FILA_CAJAS
            dist = st['dist'][c]; color = capa(dist); dt = t - st['entro'][c]
            if i < cab - 1 or (i == cab - 1 and st['actual'] is None):
                color = mezcla(color, NEGRO, 0.68)
            if dt < 0.1:
                color = BLANCO
            m = round(10 * (1 - suave(dt / 0.15)))
            if i == cab - 1 and st['actual'] is not None:
                d.rectangle([x0 - 4, y0 - 4, x0 + CAJA + 3, y0 + CAJA + 3], fill=ver(BLANCO))
            d.rectangle([x0 + m, y0 + m, x0 + CAJA - 1 - m, y0 + CAJA - 1 - m], fill=ver(color))
            if m == 0:
                d.rectangle([x0, y0, x0 + CAJA - 1, y0 + 3], fill=ver(mezcla(color, BLANCO, 0.45)))
                d.rectangle([x0 + 4, y0 + CAJA - 4, x0 + CAJA - 1, y0 + CAJA - 1], fill=ver(mezcla(color, NEGRO, 0.3)))
                texto(im, x0 + CAJA // 2, y0 + 15, str(dist), ver(mezcla(color, NEGRO, 0.88)), 2, 'm')
        if cola and cab < len(cola):   # la flecha de cabeza, bajo la siguiente que sale
            x = PANEL_X0 + (cab % POR_FILA) * PASO_CAJA + CAJA // 2
            antes = cab - 1
            if antes >= 0 and antes // POR_FILA == cab // POR_FILA:   # se desliza desde la anterior
                xa = PANEL_X0 + (antes % POR_FILA) * PASO_CAJA + CAJA // 2
                x = xa + (x - xa) * suave((t - st['cabeza_t']) / 0.12)
            y = self.cajas_y0 + (cab // POR_FILA) * FILA_CAJAS + CAJA + 6
            texto(im, x, y, '▲', ver(PAL['cyan']), 2, 'm')

    def cuenta_pasos(self, im, d, t, st, ver):
        """Ya en la salida: los pasos del camino de la BFS (crecen mientras se dibuja de vuelta) y los de la DFS."""
        y0 = self.lab_y0
        n = len(st['camino']) - 1
        if n >= 0:
            texto(im, PANEL_X0, y0 + 8, 'BFS', ver(PAL['lgray']), 4)
            c = BLANCO
            if st['pasos'] and t - st['pasos'][1] < 0.16:
                c = PAL['yellow']
            texto(im, PANEL_X0, y0 + 52, self.rot['pasos'].format(n), ver(c), 5)
        if st['dfs']:
            m = len(st['dfs']) - 1
            texto(im, PANEL_X0, y0 + 130, 'DFS', ver(PAL['orange']), 4)
            texto(im, PANEL_X0, y0 + 174, self.rot['pasos'].format(m), ver(PAL['orange']), 5)
        if self.remate_t is not None and t >= self.remate_t:
            c = BLANCO if t - self.remate_t < 0.14 else PAL['lgreen']
            texto(im, PANEL_X0, y0 + 262, self.rot['capas'], ver(PAL['lgray']), 3)
            texto(im, PANEL_X0, y0 + 300, self.rot['corto'], ver(c), 4)

    # -------------------------------------------------- el sonido
    def sonido_pasos(self, sfx):
        """Cada fila al caer; al entrar a la cola, una nota que sube con la distancia (la onda suena cada vez más
        aguda); al salir, un tic; la que ya tenía número, un roce; 'eat' y 'win' de DC en la salida; el camino de
        vuelta baja nota por nota; la DFS, más grave, en cuadrada."""
        hz = lambda d: 330 * 2 ** (d / 9)
        for s in self.escenas:
            if s['vista'] == 'inicio':
                for y in range(self.filas):
                    nota(sfx, s['t0'] + 0.15 + y * 0.07 + 0.22, 220 * 2 ** (y / 8), 0.06, 'triangle', 0.3)
        for e in self.eventos:
            t0, tipo = e['t0'], e['tipo']
            if tipo in ('empieza', 'entra'):
                nota(sfx, t0, hz(e['d']), 0.06, 'triangle', 0.3)
            elif tipo == 'sale':
                nota(sfx, t0, 1200, 0.02, 'square', 0.05); ruido(sfx, t0, 0.02, 0.04, 4000)
            elif tipo == 'ya':
                nota(sfx, t0, 140, 0.04, 'square', 0.05)
            elif tipo == 'llega':
                nota(sfx, t0, 660, 0.06, 'square', 0.14); nota(sfx, t0 + 0.06, 990, 0.08, 'square', 0.14)
                for i, fr in enumerate([523, 659, 784, 1046, 784, 1046]):
                    nota(sfx, t0 + 0.2 + i * 0.09, fr, 0.09, 'square', 0.14)
            elif tipo == 'camino':
                nota(sfx, t0, hz(self.alg_dist(e['c'])) * 1.5, 0.05, 'square', 0.09)
            elif tipo == 'devuelve':
                for i, fr in enumerate([880, 1174, 1568]):
                    nota(sfx, t0 + i * 0.05, fr, 0.07, 'triangle', 0.25)
                nota(sfx, t0 + 0.15, 1568, 0.18, 'square', 0.15)
            elif tipo == 'dfs':
                nota(sfx, t0, 110 * 2 ** (e['i'] / 12), 0.05, 'square', 0.07)
        if self.remate_t is not None:   # 'fruta': el más corto
            for i, fr in enumerate([880, 1174, 1568]):
                nota(sfx, self.remate_t + i * 0.05, fr, 0.07, 'triangle', 0.25)

    def alg_dist(self, c):
        return next((e['d'] for e in self.eventos if e['tipo'] in ('empieza', 'entra') and e['c'] == c), 0)
