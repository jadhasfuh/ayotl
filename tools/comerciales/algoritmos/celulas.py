"""La vista del Juego de la vida de «Algoritmos en pixel» (24-nov-2026): un tablero de casillas vivas y muertas.

FondoCelulas hereda de renderizador.Fondo el editor con el código, la línea que corre y el enlace; no lleva los contadores
de siempre. Arriba del tablero van la generación y cuántas hay vivas (o el nombre de lo que se ve). El archivo del
algoritmo (vida.py es el modelo) la pide con VISTA = 'celulas' y trae ROTULOS {'gen', 'vivas', 'nace', 'sigue', 'muere',
'vecinas', 'quieto', …}, por idioma.

Los pasos (todos pueden llevar `lineas` y `color`, el tipo con el que se pinta su línea de código):
- caso {vivas, filas, cols, rotulo?}: un tablero nuevo, con sus casillas vivas (las casillas miden lo que quepa);
- mira {c, n, fin}: la casilla c y sus ocho vecinas; las vivas se cuentan una por una;
- dice {c, n, fin}: qué le toca (fin: nace, sigue o muere); se queda marcada hasta la siguiente generación;
- genera {nacen, mueren, g, n}: la generación siguiente;
- pone {cs, rotulo}: aparecen unas casillas más, con su letrero debajo.
"""
import renderizador as R
from renderizador import PAL, NEGRO, BLANCO, atari, en, mezcla, nota, ruido, suave, texto

X0, X1, ABAJO = 40, 1040, 1222        # el área del tablero (abajo del 1244 va la placa de LeIA)
CABEZA = 50                           # el renglón de arriba: la generación y las vivas
FIN = {'nace': PAL['lgreen'], 'sigue': PAL['cyan'], 'muere': PAL['red']}
VIVA = PAL['lgreen']


class FondoCelulas(R.Fondo):
    PARPADEA = None

    def columnas(self):
        return []

    def medidas(self):
        self.n = 0
        self.techo = self.panel_y1 + 16
        self.rot = {k: en(v, self.lang) for k, v in self.alg.ROTULOS.items()}

    def pintar_piso(self, im, d):
        pass

    def ventana(self, d, entra):
        x0, y0, x1, y1 = 40, self.techo - 4, R.W - 40, 1226
        y1 = y0 + round((y1 - y0) * entra)
        if y1 - y0 > 8:
            d.rectangle([x0, y0, x1, y1], fill=PAL['dgray'])
            d.rectangle([x0 + 4, y0 + 4, x1 - 4, y1 - 4], fill=NEGRO)
        return x0, y0, x1, y1

    # -------------------------------------------------- el estado
    def estado(self):
        st = super().estado()
        st.update({'vivas': {}, 'muertas': {}, 'dim': None, 'g': 0, 't_caso': -9, 'rotulo': None, 'mira': None, 'dichas': [], 'pone': None, 'rapido': False})
        return st

    def aplicar(self, e, st):
        tipo, t0 = e['tipo'], e['t0']
        if tipo == 'caso':
            st.update({'vivas': {c: t0 for c in e['vivas']}, 'muertas': {}, 'dim': (e['filas'], e['cols']), 'g': 0, 't_caso': t0,
                       'rotulo': e.get('rotulo'), 'mira': None, 'dichas': [], 'pone': None, 'gancho': bool(e.get('gancho'))})
        elif tipo == 'mira':
            st['mira'] = dict(e, hecho=None)
        elif tipo == 'dice':
            st['mira'] = dict(e, hecho=t0); st['dichas'].append((e['c'], e['fin']))
        elif tipo == 'genera':
            st['mira'] = None; st['dichas'] = []; st['g'] = e['g']; st['rapido'] = e['dur'] < 0.2
            st['muertas'] = {c: t0 for c in e['mueren']}
            for c in e['mueren']:
                st['vivas'].pop(tuple(c), None)
            for c in e['nacen']:
                st['vivas'][tuple(c)] = t0
        elif tipo == 'pone':
            for c in e['cs']:
                st['vivas'][tuple(c)] = t0
            st['pone'] = (e['cs'], e['rotulo'], t0)

    # -------------------------------------------------- un cuadro
    def marco(self, st):
        """La casilla mide lo que quepa: su lado y la esquina del tablero, centrado."""
        f, c = st['dim']; y0 = self.techo + CABEZA
        lado = min((X1 - X0) // c, (ABAJO - y0) // f)
        return lado, X0 + ((X1 - X0) - lado * c) // 2, y0 + ((ABAJO - y0) - lado * f) // 2

    def dibujo(self, im, d, t, e, st, cae=None, apagadas=False):
        if st['dim'] is None:
            return
        ver = (lambda c: mezcla(c, NEGRO, 0.75)) if apagadas else (lambda c: c)
        lado, ox, oy = self.marco(st); filas, cols = st['dim']
        fino = max(1, lado // 20)
        d.rectangle([ox - 4, oy - 4, ox + cols * lado + 3, oy + filas * lado + 3], fill=ver(atari(9, 2)))
        d.rectangle([ox, oy, ox + cols * lado - 1, oy + filas * lado - 1], fill=ver(atari(9, 0)))
        for k in range(1, cols):
            d.rectangle([ox + k * lado - fino, oy, ox + k * lado - 1, oy + filas * lado - 1], fill=ver(atari(9, 1)))
        for k in range(1, filas):
            d.rectangle([ox, oy + k * lado - fino, ox + cols * lado - 1, oy + k * lado - 1], fill=ver(atari(9, 1)))
        caja = lambda c: (ox + c[1] * lado, oy + c[0] * lado)
        rapido = st['rapido']
        for c, t0 in st['muertas'].items():   # la que muere se apaga encogiéndose
            a = suave((t - t0) / (0.08 if rapido else 0.3))
            if a < 1:
                self.celula(d, caja(c), lado, ver(mezcla(mezcla(VIVA, NEGRO, 0.55) if rapido else PAL['red'], atari(9, 0), a)), a * 0.4)
        entrada = t - st['t_caso']
        for c, t0 in st['vivas'].items():
            dt = t - t0
            if entrada < 0.5 and t0 == st['t_caso'] and not st.get('gancho'):   # al salir el tablero, las casillas crecen
                a = 1 - suave(dt / 0.25)
            else:
                a = 0.5 * (1 - suave(dt / (0.05 if rapido else 0.22)))
            color = BLANCO if not rapido and dt < 0.1 and t0 != st['t_caso'] else VIVA
            self.celula(d, caja(c), lado, ver(color), a)
        # lo que ya se dijo de cada una, hasta la siguiente generación
        for c, fin in st['dichas']:
            self.recuadro(d, caja(c), lado, ver(FIN[fin]), max(3, lado // 12))
        if st['mira'] and not apagadas:
            self.cuenta_vecinas(im, d, t, st, caja, lado)
        if st['pone'] and not apagadas:
            cs, r, t0 = st['pone']
            xs = [caja(c)[0] for c in cs]; ys = [caja(c)[1] for c in cs]
            if t - t0 > 0.4:
                texto(im, (min(xs) + max(xs) + lado) // 2, max(ys) + lado + 18, self.rot[r], PAL['yellow'], 3, 'm')
        # el renglón de arriba
        y = self.techo + 4
        if st['rotulo']:
            texto(im, R.W // 2, y, self.rot[st['rotulo']], ver(PAL['yellow']), 3, 'm')
            texto(im, X0, y, str(st['g']), ver(PAL['cyan']), 3)
        elif not st.get('gancho'):
            texto(im, X0, y, f"{self.rot['gen']} {st['g']}", ver(PAL['cyan']), 3)
            texto(im, X1, y, f"{self.rot['vivas']} {len(st['vivas'])}", ver(VIVA), 3, 'r')

    def celula(self, d, p, lado, color, encoge=0.0):
        """Una casilla viva con su bisel; `encoge` (0 a 1) la achica hacia su centro."""
        m = max(1, lado // 14) + round(lado * 0.45 * encoge)
        x0, y0, x1, y1 = p[0] + m, p[1] + m, p[0] + lado - 1 - m, p[1] + lado - 1 - m
        if x1 <= x0:
            return
        d.rectangle([x0, y0, x1, y1], fill=color)
        g = max(1, lado // 10)
        if lado > 14 and x1 - x0 > 3 * g:
            d.rectangle([x0, y0, x1, y0 + g - 1], fill=mezcla(color, BLANCO, 0.45)); d.rectangle([x0, y0, x0 + g - 1, y1], fill=mezcla(color, BLANCO, 0.3))
            d.rectangle([x0, y1 - g + 1, x1, y1], fill=mezcla(color, NEGRO, 0.3)); d.rectangle([x1 - g + 1, y0 + g, x1, y1], fill=mezcla(color, NEGRO, 0.3))

    def recuadro(self, d, p, lado, color, g):
        x0, y0, x1, y1 = p[0], p[1], p[0] + lado - 1, p[1] + lado - 1
        for a, b, c_, e_ in ((x0, y0, x1, y0 + g - 1), (x0, y1 - g + 1, x1, y1), (x0, y0, x0 + g - 1, y1), (x1 - g + 1, y0, x1, y1)):
            d.rectangle([a, b, c_, e_], fill=color)

    def cuenta_vecinas(self, im, d, t, st, caja, lado):
        """Las ocho de alrededor; las vivas se numeran conforme se cuentan. A la derecha, cuántas van y qué le toca."""
        m = st['mira']; c = m['c']; oc = self.alg.ocho(*c)
        t0 = m['t0'] if m['hecho'] is None else m['t0'] - 9
        por = max(0.04, min(0.16, m['dur'] / 10))
        van = 0
        for k, v in enumerate(oc):
            if t - t0 < k * por:
                break
            viva = v in st['vivas']
            self.recuadro(d, caja(v), lado, BLANCO if viva else atari(9, 5), max(2, lado // 16))
            if viva:
                van += 1
                x, y = caja(v); k_ = max(2, lado // 18)
                texto(im, x + lado // 2, y + lado // 2 - 4 * k_, str(van), NEGRO, k_, 'm')
        fin = m['fin']
        self.recuadro(d, caja(c), lado, PAL['yellow'] if m['hecho'] is None else FIN[fin], max(4, lado // 9))
        x = caja((0, 12))[0]; y = caja((2, 0))[1]
        texto(im, x, y, self.rot['vecinas'], PAL['lgray'], 4, 'm')
        texto(im, x, y + 60, str(van), PAL['yellow'], 12, 'm')
        if m['hecho'] is not None:
            texto(im, x, y + 190, self.rot[fin], BLANCO if t - m['hecho'] < 0.1 else FIN[fin], 6, 'm')

    # -------------------------------------------------- el sonido
    def sonido_pasos(self, sfx):
        """Un tic por generación (más agudo cuantas más nacen), una nota por vecina contada y 'eat' o 'perder' según le toque."""
        for e in self.eventos:
            t0, tipo = e['t0'], e['tipo']
            if tipo == 'caso':
                ruido(sfx, t0, 0.05, 0.10, 2500); nota(sfx, t0, 500, 0.04, 'triangle', 0.25, hasta=900)
            elif tipo == 'mira':
                por = max(0.04, min(0.16, e['dur'] / 10))
                for k in range(8):
                    nota(sfx, t0 + k * por, 520, 0.025, 'square', 0.05)
            elif tipo == 'dice':
                if e['fin'] == 'nace':
                    nota(sfx, t0, 660, 0.06, 'square', 0.13); nota(sfx, t0 + 0.06, 990, 0.08, 'square', 0.13)
                elif e['fin'] == 'muere':
                    nota(sfx, t0, 300, 0.16, 'square', 0.12, hasta=110)
                else:
                    nota(sfx, t0, 600, 0.08, 'triangle', 0.25)
            elif tipo == 'genera':
                rapido = e['dur'] < 0.2
                nota(sfx, t0, 262 * 2 ** (min(24, len(e['nacen'])) / 12), 0.03 if rapido else 0.06, 'triangle', 0.14 if rapido else 0.28)
            elif tipo == 'pone':
                nota(sfx, t0, 880, 0.05, 'square', 0.12); nota(sfx, t0 + 0.06, 1174, 0.07, 'square', 0.12)
