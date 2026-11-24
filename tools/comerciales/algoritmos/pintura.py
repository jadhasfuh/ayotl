"""La vista de pintura de «Algoritmos en pixel» (24-nov-2026): un lienzo que se rellena, con su pila al lado.

Como la rejilla del laberinto (rejilla.py), pero lo que cambia es el color de las casillas: un lienzo de papel con una
raya negra; el bote de pintura pica una casilla y el relleno pinta todas las del mismo color que estén conectadas por
arriba, abajo y los lados. A la derecha va la pila de pie, con las casillas pendientes (fila,columna) del color con el
que se pintan; la de arriba es la siguiente que sale. El último relleno puede ir con una cola: sin pila, cada paso
pinta una capa entera y se ve la onda.

FondoPintura hereda de renderizador.Fondo el editor con el código, la línea que corre y el enlace. No lleva contadores
(columnas() vacía): con 14 renglones de código cabe un lienzo de 11 x 13 a 38 px.

El archivo del algoritmo (relleno.py es el modelo) la pide con VISTA = 'pintura' y además trae:
- LIENZO: las filas del dibujo ('X' la raya, '.' el papel); PUERTA: la casilla que nadie toca (parpadea al nombrarla);
- ROTULOS: {'pila', 'cima', 'vacia', 'cola', 'ondas', 'casillas' (con {}), 'igual'}, por idioma.

Los pasos (todos pueden llevar `lineas` y `color`, el tipo con el que se pinta su línea de código):
- clic {c, pinta, cola?}: el bote cae en esa casilla con ese color de la paleta; con `cola`, lo que sigue son ondas;
- empieza {c}: se pinta la primera y entra a la pila;
- sale {c}: sale la de arriba (marco blanco mientras mira a sus vecinas);
- ya {c, fuera}: esa vecina no es del color viejo: marco rojo (si cae fuera del lienzo no hay casilla que marcar);
- entra {c}: se pinta y entra a la pila;
- onda {cs, d}: se pinta una capa entera;
- termina {n}: ya no queda nadie: cuántas casillas se pintaron.
"""
import renderizador as R
from renderizador import PAL, NEGRO, BLANCO, atari, en, mezcla, nota, ruido, suave, texto

CELDA = 38
LIENZO_X0 = 56
PANEL_X0, PANEL_X1 = 620, 1030
CAJA_W, CAJA_H, HUECO = 190, 56, 6     # una caja de la pila
PISO = 1196                            # el fondo del tubo (abajo del 1244 va la placa de LeIA)
PAPEL = atari(0, 7)
RAYA = atari(0, 1)
# el bote: el asa, el balde y la pintura que cae (la 'p' va del color con el que pinta)
BOTE = ['....aaaa......', '...a....a.....', '..a......a....', '.gggggggggg...', 'gpppppppppgg..', 'gggggggggggpp.', '.gwwgggggg..pp',
        '.gwwgggggg...p', '.gwwgggggg...p', '.gggggggg....p', '..gggggg......']


class FondoPintura(R.Fondo):
    PARPADEA = None

    def columnas(self):
        return []   # sin contadores

    def medidas(self):
        alg = self.alg
        self.n = 0   # sin barras
        self.lienzo = list(alg.LIENZO); self.filas, self.cols = len(self.lienzo), len(self.lienzo[0])
        self.techo = self.panel_y1 + 16
        self.y0 = self.techo + 18
        self.x1 = LIENZO_X0 + self.cols * CELDA
        if self.y0 + self.filas * CELDA > 1216 or self.x1 > PANEL_X0 - 24:
            raise SystemExit(f'el lienzo no cabe: el código llega a {self.panel_y1} y mide {self.filas} x {self.cols} casillas de {CELDA} px')
        n = tope = 0
        for e in self.eventos:
            n = 0 if e['tipo'] == 'clic' else n + (e['tipo'] in ('empieza', 'entra')) - (e['tipo'] == 'sale')
            tope = max(tope, n)
        self.capacidad = max(4, tope)
        self.tubo_y0 = PISO - self.capacidad * (CAJA_H + HUECO) - HUECO
        if self.tubo_y0 < self.y0 + 40:
            raise SystemExit(f'la pila llega a {tope}: el tubo no cabe')
        self.tubo_x0 = PANEL_X0 + 8
        self.rot = {k: en(v, self.lang) for k, v in alg.ROTULOS.items()}
        self.puerta = tuple(alg.PUERTA)

    def pintar_piso(self, im, d):
        pass   # el lienzo cae al empezar: se dibuja en cada cuadro

    def ventana(self, d, entra):
        """La que tapa el dibujo (el enlace): tan ancha como el lienzo y la pila juntos."""
        x0, y0, x1, y1 = 40, self.techo - 4, R.W - 40, 1226
        y1 = y0 + round((y1 - y0) * entra)
        if y1 - y0 > 8:
            d.rectangle([x0, y0, x1, y1], fill=PAL['dgray'])
            d.rectangle([x0 + 4, y0 + 4, x1 - 4, y1 - 4], fill=NEGRO)
        return x0, y0, x1, y1

    # -------------------------------------------------- el estado
    def estado(self):
        st = super().estado()
        st.update({'color': {}, 'entro': {}, 'pila': [], 'sacada': None, 'actual': None, 'pinta': None, 'clic': None,
                   'cola': False, 'fin': None, 'hechas': []})
        return st

    def aplicar(self, e, st):
        tipo = e['tipo']; t0 = e['t0']
        if tipo == 'clic':
            st['pinta'] = PAL[e['pinta']]; st['clic'] = (e['c'], t0); st['pila'] = []; st['fin'] = None
            st['actual'] = st['sacada'] = None; st['cola'] = bool(e.get('cola'))
        elif tipo in ('empieza', 'entra'):
            st['color'][e['c']] = st['pinta']; st['entro'][e['c']] = t0; st['pila'].append((e['c'], t0))
        elif tipo == 'sale':
            st['pila'].pop(); st['sacada'] = (e['c'], t0, len(st['pila'])); st['actual'] = e['c']
        elif tipo == 'onda':
            for c in e['cs']:
                st['color'][c] = st['pinta']; st['entro'][c] = t0
        elif tipo == 'termina':
            st['fin'] = (e['n'], t0); st['actual'] = st['sacada'] = None
            st['hechas'].append((st['pinta'], e['n']))

    # -------------------------------------------------- un cuadro
    def dibujo(self, im, d, t, e, st, cae=None, apagadas=False):
        ver = (lambda c: mezcla(c, NEGRO, 0.75)) if apagadas else (lambda c: c)
        tipo = e['tipo'] if e else None
        if cae is None:   # el marco del lienzo
            d.rectangle([LIENZO_X0 - 6, self.y0 - 6, self.x1 + 5, self.y0 + self.filas * CELDA + 5], fill=ver(PAL['gray']))
        for y in range(self.filas):
            dy = 0
            if cae is not None:   # las filas caen una por una al empezar
                dt = t - cae['t0'] - 0.15 - y * 0.06
                if dt < 0:
                    continue
                dy = -int(260 * max(0, 1 - dt / 0.22) ** 2)
            for x in range(self.cols):
                self.casilla(d, t, (y, x), st, dy, ver)
        if cae is not None:
            if t - cae['t0'] > 0.15 + self.filas * 0.06 + 0.3:   # el bote se asoma, esperando
                self.bote(d, (6, 6), PAL['orange'], ver, -8 + 4 * (int(t * 4) % 2))
            return self.pintar_pila(im, d, t, st, ver, vacia=True)
        # la puerta: parpadea mientras LeIA la nombra (al terminar la pared)
        if st['fin'] and not st['cola'] and len(st['hechas']) == 1 and 1.2 < t - st['fin'][1] and int(t * 5) % 2 == 0:
            for c in (self.puerta, (self.puerta[0] + 1, self.puerta[1])):
                self.marco(d, c, ver(PAL['red']), 4)
        if tipo == 'ya' and not e.get('fuera'):
            self.marco(d, e['c'], ver(PAL['red']), 4)
        if st['actual'] is not None:
            self.marco(d, st['actual'], ver(NEGRO), 5); self.marco(d, st['actual'], ver(BLANCO), 3)
        if st['clic'] and t - st['clic'][1] < 1.1 and not apagadas:   # el bote que pica
            dt = t - st['clic'][1]
            self.bote(d, st['clic'][0], st['pinta'], ver, -int(90 * max(0, 1 - dt / 0.18) ** 2))
        self.pintar_pila(im, d, t, st, ver)

    def xy(self, c):
        return LIENZO_X0 + c[1] * CELDA, self.y0 + c[0] * CELDA

    def casilla(self, d, t, c, st, dy, ver):
        x0, y0 = self.xy(c); y0 += dy; x1, y1 = x0 + CELDA - 1, y0 + CELDA - 1
        if self.lienzo[c[0]][c[1]] == 'X':
            d.rectangle([x0, y0, x1, y1], fill=ver(RAYA))
            d.rectangle([x0, y0, x1, y0 + 3], fill=ver(mezcla(RAYA, BLANCO, 0.18)))
            return
        d.rectangle([x0, y0, x1, y1], fill=ver(PAPEL))
        d.rectangle([x1, y0, x1, y1], fill=ver(atari(0, 6))); d.rectangle([x0, y1, x1, y1], fill=ver(atari(0, 6)))
        if c in st['color']:
            dt = t - st['entro'][c]; color = st['color'][c]
            m = round(CELDA * 0.42 * (1 - suave(dt / 0.16)))   # la pintura se extiende desde el centro
            d.rectangle([x0 + m, y0 + m, x1 - m, y1 - m], fill=ver(BLANCO if dt < 0.05 else color))
            if m == 0:   # la cuadrícula, apenas
                d.rectangle([x1, y0, x1, y1], fill=ver(mezcla(color, NEGRO, 0.14)))
                d.rectangle([x0, y1, x1, y1], fill=ver(mezcla(color, NEGRO, 0.14)))

    def marco(self, d, c, color, g):
        x0, y0 = self.xy(c); x1, y1 = x0 + CELDA - 1, y0 + CELDA - 1
        for a, b, c_, e_ in ((x0, y0, x1, y0 + g - 1), (x0, y1 - g + 1, x1, y1), (x0, y0, x0 + g - 1, y1), (x1 - g + 1, y0, x1, y1)):
            d.rectangle([a, b, c_, e_], fill=color)

    def bote(self, d, c, pinta, ver, dy):
        """El bote de pintura: la gota cae en la casilla (la punta de la pintura queda en su centro)."""
        k = 5; x, y = self.xy(c); x += CELDA // 2 - 13 * k - k // 2; y += CELDA // 2 - 10 * k + dy
        colores = {'a': atari(0, 5), 'g': atari(0, 4), 'w': atari(0, 6), 'p': pinta}
        for j, fila in enumerate(BOTE):
            for i, ch in enumerate(fila):
                if ch != '.':
                    d.rectangle([x + i * k - 2, y + j * k - 2, x + i * k + k + 1, y + j * k + k + 1], fill=ver(NEGRO))
        for j, fila in enumerate(BOTE):
            for i, ch in enumerate(fila):
                if ch != '.':
                    d.rectangle([x + i * k, y + j * k, x + i * k + k - 1, y + j * k + k - 1], fill=ver(colores[ch]))

    def lugar(self, k):
        """La izquierda y lo alto de la caja k de la pila (la 0 es la de abajo)."""
        return self.tubo_x0 + HUECO + 4, PISO - (k + 1) * (CAJA_H + HUECO)

    def caja(self, im, d, x, y, c, color, ver):
        d.rectangle([x, y, x + CAJA_W - 1, y + CAJA_H - 1], fill=ver(color))
        d.rectangle([x, y, x + CAJA_W - 1, y + 3], fill=ver(mezcla(color, BLANCO, 0.45)))
        d.rectangle([x, y + CAJA_H - 4, x + CAJA_W - 1, y + CAJA_H - 1], fill=ver(mezcla(color, NEGRO, 0.3)))
        texto(im, x + CAJA_W // 2, y + 17, f'{c[0]},{c[1]}', ver(mezcla(color, NEGRO, 0.88)), 3, 'm')

    def pintar_pila(self, im, d, t, st, ver, vacia=False):
        """La pila de pie, o el letrero de la cola; y, al terminar, cuántas casillas se pintaron con cada color."""
        y = self.y0
        if st['cola']:
            texto(im, PANEL_X0, y + 4, self.rot['cola'], ver(PAL['lgray']), 3)
            texto(im, PANEL_X0, y + 48, self.rot['ondas'], ver(PAL['cyan']), 5)
            for i, (color, n) in enumerate(st['hechas']):
                yy = y + 130 + i * 58
                d.rectangle([PANEL_X0, yy, PANEL_X0 + 35, yy + 35], fill=ver(color))
                texto(im, PANEL_X0 + 52, yy + 6, self.rot['casillas'].format(n), ver(BLANCO), 3)
            if st['fin'] and t - st['fin'][1] > 0.5:
                c = BLANCO if t - st['fin'][1] < 0.64 else PAL['lgreen']
                texto(im, PANEL_X0, y + 130 + 3 * 58 + 22, self.rot['igual'], ver(c), 3)
            return
        texto(im, PANEL_X0, y + 4, self.rot['pila'], ver(PAL['lgray']), 4)
        x0, x1 = self.tubo_x0, self.tubo_x0 + CAJA_W + 2 * HUECO + 8
        for a, b, c_, e_ in ((x0, self.tubo_y0, x0 + 3, PISO + 3), (x1 - 4, self.tubo_y0, x1 - 1, PISO + 3), (x0, PISO, x1 - 1, PISO + 3)):
            d.rectangle([a, b, c_, e_], fill=ver(PAL['gray']))
        if vacia:
            return
        for k, (c, t0) in enumerate(st['pila']):
            x, yy = self.lugar(k); dt = t - t0
            yy -= round(120 * (1 - suave(dt / 0.16)))   # cae desde arriba
            self.caja(im, d, x, yy, c, BLANCO if dt < 0.06 else st['pinta'], ver)
        if st['sacada'] is not None:   # la que salió, arriba y a la derecha, mientras mira a sus vecinas
            c, t0, k = st['sacada']; a = suave((t - t0) / 0.14)
            x, yy = self.lugar(k); xf, yf = x1 + 18, self.y0 + 52
            xs, ys = round(x + (xf - x) * a), round(yy + (yf - yy) * a)
            d.rectangle([xs - 4, ys - 4, xs + 131, ys + CAJA_H + 3], fill=ver(BLANCO))
            d.rectangle([xs, ys, xs + 127, ys + CAJA_H - 1], fill=ver(st['pinta']))
            texto(im, xs + 64, ys + 17, f'{c[0]},{c[1]}', ver(mezcla(st['pinta'], NEGRO, 0.88)), 3, 'm')
        if st['pila']:   # la siguiente que sale: la de arriba
            x, yy = self.lugar(len(st['pila']) - 1)
            texto(im, x1 + 14, yy + 17, self.rot['cima'], ver(PAL['cyan']), 3)
        if st['fin']:
            n, t0 = st['fin']; c = PAL['yellow'] if t - t0 < 0.16 else BLANCO
            texto(im, (x0 + x1) // 2, PISO - 70, self.rot['vacia'], ver(PAL['gray']), 3, 'm')
            texto(im, PANEL_X0, self.y0 + 62, self.rot['casillas'].format(n), ver(c), 4)

    # -------------------------------------------------- el sonido
    def sonido_pasos(self, sfx):
        """Cada fila al caer; el bote al picar; al pintarse, una nota que sube con cada casilla; al salir, un tic; la que
        no es del color viejo, un roce; al vaciarse la pila, 'eat'; las ondas, un barrido; y al final, 'win'."""
        for s in self.escenas:
            if s['vista'] == 'inicio':
                for y in range(self.filas):
                    nota(sfx, s['t0'] + 0.15 + y * 0.06 + 0.22, 220 * 2 ** (y / 8), 0.05, 'triangle', 0.28)
        i = 0
        for e in self.eventos:
            t0, tipo = e['t0'], e['tipo']
            if tipo == 'clic':
                i = 0; ruido(sfx, t0 + 0.16, 0.08, 0.16, 1200); nota(sfx, t0 + 0.16, 500, 0.08, 'triangle', 0.3, hasta=240)
            elif tipo in ('empieza', 'entra'):
                nota(sfx, t0, 330 * 2 ** (i / 10), 0.06, 'triangle', 0.3); i += 1
            elif tipo == 'sale':
                nota(sfx, t0, 1200, 0.02, 'square', 0.05); ruido(sfx, t0, 0.02, 0.04, 4000)
            elif tipo == 'ya':
                nota(sfx, t0, 140, 0.04, 'square', 0.05)
            elif tipo == 'onda':
                nota(sfx, t0, 262 * 2 ** (e['d'] / 11), 0.07, 'triangle', 0.26); ruido(sfx, t0, 0.03, 0.04, 3000)
            elif tipo == 'termina':
                if e.get('cola'):
                    for k, fr in enumerate([523, 659, 784, 1046, 784, 1046]):
                        nota(sfx, t0 + 0.1 + k * 0.09, fr, 0.09, 'square', 0.14)
                else:
                    nota(sfx, t0, 660, 0.06, 'square', 0.14); nota(sfx, t0 + 0.06, 990, 0.08, 'square', 0.14)
