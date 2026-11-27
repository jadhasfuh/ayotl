"""La vista de las Torres de Hanói de «Algoritmos en pixel» (27-nov-2026): tres postes con discos y, a la derecha, la pila de
llamadas.

FondoTorres hereda de renderizador.Fondo el editor con el código, la línea que corre y el enlace; no lleva los contadores de
siempre. Los postes van abajo, a todo lo ancho; arriba, a la izquierda, «MOVIMIENTOS k / 2ⁿ − 1» y, al vaciarse la pila, la
cuenta 2ⁿ − 1 = k (o las dos reglas), y a la derecha la pila de llamadas de pie, con una caja por llamada
hanoi(n,desde,hasta,aux) del color de su disco (las de cero discos, grises): la de arriba es la que corre (marco blanco), las
de abajo esperan (apagadas). Abajo de los postes, una flecha del color de la llamada que corre, de su poste `desde` a su
poste `hasta`. Cada movimiento se ve: el disco sube, cruza y baja.

El archivo del algoritmo (hanoi.py es el modelo) la pide con VISTA = 'torres' y trae ROTULOS {'movimientos', 'pila', 'vacia',
'base', 'regla1', 'regla2', 'oro', 'lucas', 'por_segundo', 'segundos', 'anios'} por idioma, TABLA y LEYENDA (la ventana
'cuenta', con 2ⁿ − 1 arriba), LEYENDA_N y movimientos(n) (la ventana 'leyenda': la torre de 64 discos de oro, que mueve
uno por segundo; un renglón del guion con `segundos` y `anios` dice desde qué fracción salen la cuenta y los años).

Los pasos (todos pueden llevar `lineas` y `color`, el tipo con el que se pinta su línea de código):
- torre {n, postes?, hechos?, gancho?, pila?, cuenta?, reglas?}: una torre nueva de n discos (cae disco por disco en A, o
  ya repartida en `postes`); con `pila`, la pila de llamadas (si no, el contador va en medio); con `cuenta`, el contador
  de movimientos; con `reglas`, las dos reglas a la izquierda;
- disco {n, desde, hasta, suma?, completa?, regla?}: un movimiento (con `suma` False no cuenta: es la demostración);
  `completa`: el último, con un destello y la fanfarria;
- prohibe {n, desde, hasta}: el disco va, no puede bajar sobre uno más chico («NO», en rojo) y regresa;
- bloque {k, desde, hasta, rotulo}: los k de arriba se mueven juntos (el truco, sin la recursión todavía);
- llama {n, desde, hasta, aux}: una llamada entra a la pila;
- base: la de arriba (n = 0) no tiene nada que mover: «CASO BASE», y sale;
- vuelve: la de arriba termina y sale.
"""
import itertools

import renderizador as R
from renderizador import PAL, NEGRO, BLANCO, W, atari, en, mezcla, nota, ruido, suave, texto

X0, X1 = 40, 1040
PILA_X0, PILA_X1 = 646, 1034          # el tubo de la pila, arriba a la derecha
CAJA_H, HUECO = 52, 6
PISO_PILA = 846                       # el fondo del tubo; abajo de él, los postes
PISO = 1146                           # el piso de los postes (abajo del 1244 va la placa de LeIA)
COLOR_DISCO = [atari(1, 6), atari(2, 5), atari(5, 5), atari(7, 5), atari(9, 5), atari(11, 5)]   # del 1 (el chico) al 6
GRIS = atari(0, 3)
MADERA = atari(2, 2)
ORO = [atari(1, 6), atari(2, 5)]


def color_disco(n):
    return GRIS if n == 0 else COLOR_DISCO[(n - 1) % len(COLOR_DISCO)]


def formula(im, x, y, partes, color, k, ancla='m'):
    """Un texto con exponentes: `partes` = [(texto, es_exponente)]; el exponente va a poco más de la mitad, levantado."""
    ke = max(2, k // 2 + 1)
    ancho = sum(8 * (ke if sup else k) * len(s) for s, sup in partes)
    x0 = x - {'l': 0, 'm': ancho // 2, 'r': ancho}[ancla]
    for s, sup in partes:
        kk = ke if sup else k
        texto(im, x0, y - (round(k * 3.2) if sup else 0), s, color, kk)
        x0 += 8 * kk * len(s)


def miles(v, lang):
    return f'{v:,}'.replace(',', ' ' if lang == 'es' else ',')


class FondoTorres(R.Fondo):
    PARPADEA = None

    def columnas(self):
        return []

    def medidas(self):
        self.n = 0
        self.techo = self.panel_y1 + 16
        self.rot = {k: en(v, self.lang) for k, v in self.alg.ROTULOS.items()}
        self.ventanas['leyenda'] = self.leyenda
        # cuándo salen, en la leyenda, la cuenta de los segundos y los años
        self.segundos_t = self.anios_t = self.leyenda_t = None
        for s in self.escenas:
            g = s['guion']
            if s['vista'] == 'leyenda' and self.leyenda_t is None:
                self.leyenda_t = s['t0']
            if 'segundos' in g and self.segundos_t is None:
                self.segundos_t = s['t0'] + g['segundos'] * s['dur']
            if 'anios' in g and self.anios_t is None:
                self.anios_t = s['t0'] + g['anios'] * s['dur']
        # la torre de la leyenda mueve un disco por segundo: los primeros de hanoi(64), como el programa
        if self.leyenda_t is not None:
            fin = max(s['t0'] + s['dur'] for s in self.escenas if s['vista'] == 'leyenda')
            k = int(fin - self.leyenda_t) + 1
            self.leyenda_movs = list(itertools.islice(self.alg.movimientos(self.alg.LEYENDA_N), k))
        # lo más alto que llega la pila (para el tubo): una caja de aire arriba, para el letrero del caso base
        alto = tope = 0
        for e in self.eventos:
            alto = 0 if e['tipo'] == 'torre' else alto + (e['tipo'] == 'llama') - (e['tipo'] in ('base', 'vuelve'))
            tope = max(tope, alto)
        self.capacidad = tope + 1
        self.tubo_y0 = PISO_PILA - self.capacidad * (CAJA_H + HUECO) - HUECO
        if self.tubo_y0 < self.techo + 34:
            raise SystemExit(f'la pila llega a {tope}: el tubo no cabe entre el código ({self.panel_y1}) y los postes')

    def pintar_piso(self, im, d):
        pass

    def ventana(self, d, entra):
        """La que tapa el dibujo: a todo lo ancho, como la del Juego de la vida."""
        x0, y0, x1, y1 = X0, self.techo - 4, X1, 1226
        y1 = y0 + round((y1 - y0) * entra)
        if y1 - y0 > 8:
            d.rectangle([x0, y0, x1, y1], fill=PAL['dgray'])
            d.rectangle([x0 + 4, y0 + 4, x1 - 4, y1 - 4], fill=NEGRO)
        return x0, y0, x1, y1

    # -------------------------------------------------- el estado
    def estado(self):
        st = super().estado()
        st.update({'postes': {'A': [], 'B': [], 'C': []}, 'nd': 0, 'gancho': False, 'pila_on': False, 'cuenta_on': False,
                   'reglas': False, 'reglas_t': {}, 't_torre': -9, 'caen': False, 'hechos': 0, 'mas_t': -9, 'mov': None,
                   'pila': [], 'saliendo': [], 'base': None, 'formula_t': None, 'brillo': None})
        return st

    def aplicar(self, e, st):
        tipo, t0 = e['tipo'], e['t0']
        if tipo == 'torre':
            n = e['n']
            postes = e.get('postes') or {'A': list(range(n, 0, -1)), 'B': [], 'C': []}
            st.update({'postes': {p: list(v) for p, v in postes.items()}, 'nd': n, 'gancho': bool(e.get('gancho')),
                       'pila_on': bool(e.get('pila')), 'cuenta_on': bool(e.get('cuenta')), 'reglas': bool(e.get('reglas')),
                       'reglas_t': {}, 't_torre': t0, 'caen': not e.get('postes'), 'hechos': e.get('hechos', 0),
                       'mov': None, 'pila': [], 'saliendo': [], 'base': None, 'formula_t': None, 'brillo': None})
        elif tipo in ('disco', 'bloque', 'prohibe'):
            de, a = e['desde'], e['hasta']; P = st['postes']
            k = e.get('k', 1)
            discos = P[de][-k:]
            anim = e['dur'] * (0.94 if tipo == 'prohibe' else 0.85) if tipo != 'bloque' else min(1.1, e['dur'] * 0.8)
            st['mov'] = {'tipo': tipo, 'discos': discos, 'desde': de, 'hasta': a, 'i0': len(P[de]) - k, 'i1': len(P[a]),
                         't0': t0, 'anim': anim, 'rotulo': e.get('rotulo')}
            if tipo != 'prohibe':
                del P[de][-k:]
                P[a].extend(discos)
            if 'regla' in e:
                st['reglas_t'][e['regla']] = t0
            if tipo == 'disco' and e.get('suma', True):
                st['hechos'] += 1; st['mas_t'] = t0
            if e.get('completa'):
                st['brillo'] = t0 + anim
        elif tipo == 'llama':
            st['pila'].append({'n': e['n'], 'desde': e['desde'], 'hasta': e['hasta'], 'aux': e['aux'], 't0': t0})
        elif tipo == 'base':
            caja = st['pila'].pop()
            st['base'] = (caja, len(st['pila']), t0, e['dur'])
        elif tipo == 'vuelve':
            caja = st['pila'].pop()
            st['saliendo'].append((caja, len(st['pila']), t0))
            if not st['pila'] and st['cuenta_on']:
                st['formula_t'] = t0

    # -------------------------------------------------- la geometría
    def postes_x(self, st):
        return {p: X0 + (X1 - X0) * (i + 0.5) / 3 for i, p in enumerate('ABC')}, (X1 - X0) / 3

    def medida_discos(self, st):
        """El alto de un disco y el ancho de cada uno (del 1, el chico, al n): la torre, con el disco en el aire, cabe
        abajo de la pila (o del contador, en el gancho; las reglas y el truco ya tienen la medida de cuando sale la pila)."""
        n = st['nd']; _, slot = self.postes_x(st)
        arriba = self.techo + 130 if st['gancho'] else PISO_PILA + 14
        alto = min(56, (PISO - arriba - 26) // (n + 2))
        wmax = int(slot * 0.92) // 4 * 4; wmin = max(56, int(slot * 0.3)) // 4 * 4
        anchos = {d: wmin + round((wmax - wmin) * (d - 1) / max(1, n - 1) / 4) * 4 for d in range(1, n + 1)}
        return alto, anchos

    def tope_poste(self, st):
        alto, _ = self.medida_discos(st)
        return PISO - (st['nd'] + 1) * alto - 10

    # -------------------------------------------------- un cuadro
    def dibujo(self, im, d, t, e, st, cae=None, apagadas=False):
        if not st['nd']:
            return
        ver = (lambda c: mezcla(c, NEGRO, 0.75)) if apagadas else (lambda c: c)
        xs, slot = self.postes_x(st); alto, anchos = self.medida_discos(st)
        tope = self.tope_poste(st)
        # el piso y los postes
        d.rectangle([X0 + 4, PISO, X1 - 4, PISO + 13], fill=ver(MADERA))
        d.rectangle([X0 + 4, PISO, X1 - 4, PISO + 3], fill=ver(mezcla(MADERA, BLANCO, 0.25)))
        for p, cx in xs.items():
            d.rectangle([round(cx) - 6, tope, round(cx) + 5, PISO - 1], fill=ver(atari(0, 4)))
            d.rectangle([round(cx) - 6, tope, round(cx) - 3, PISO - 1], fill=ver(atari(0, 6)))
        # la llamada que corre: sus postes y la flecha de `desde` a `hasta`
        activa = None
        if st['pila_on'] and not apagadas:
            if st['base'] is not None and t < st['base'][2] + st['base'][3]:
                activa = st['base'][0]
            elif st['pila']:
                activa = st['pila'][-1]
        for p, cx in xs.items():
            c = PAL['gray']
            if activa and activa['n'] and p in (activa['desde'], activa['hasta']):
                c = color_disco(activa['n'])
            texto(im, cx, PISO + 26, p, ver(c), 4, 'm')
        if activa and activa['n']:
            self.flecha(d, xs[activa['desde']], xs[activa['hasta']], PISO + 70, color_disco(activa['n']))
        # los discos quietos
        mov = st['mov']
        moviendo = mov is not None and t < mov['t0'] + mov['anim']
        quietos_fuera = set(mov['discos']) if moviendo else set()   # el que va en el aire no se pinta en su poste
        for p, cx in xs.items():
            for i, dsc in enumerate(st['postes'][p]):
                if dsc in quietos_fuera:
                    continue
                dy = 0
                if st['caen']:   # al salir la torre, caen uno por uno, el grande primero
                    dt = t - st['t_torre'] - 0.05 - i * 0.09
                    if dt < 0:
                        continue
                    dy = -int(320 * max(0, 1 - dt / 0.22) ** 2)
                color = color_disco(dsc)
                if st['brillo'] is not None and p == 'C' and 0 <= t - st['brillo'] - (len(st['postes'][p]) - 1 - i) * 0.06 < 0.1:
                    color = BLANCO
                self.disco(im, d, cx, PISO - i * alto + dy, anchos[dsc], alto, dsc, ver(color))
        if moviendo:
            self.movimiento(im, d, t, st, xs, alto, anchos, tope, ver)
        # arriba: el contador, la cuenta 2ⁿ − 1 o las reglas (a la izquierda de la pila, o en medio)
        cx = (X0 + PILA_X0) / 2 if st['pila_on'] else W / 2
        y = self.techo + 4
        if st['cuenta_on']:
            texto(im, cx, y, self.rot['movimientos'], ver(PAL['gray']), 3, 'm')
            total = 2 ** st['nd'] - 1
            c = BLANCO if t - st['mas_t'] < 0.12 else (PAL['lgreen'] if st['hechos'] == total else PAL['cyan'])
            texto(im, cx, y + 44, f"{st['hechos']} / {total}", ver(c), 6, 'm')
            if st['formula_t'] is not None and t >= st['formula_t']:
                c = BLANCO if t - st['formula_t'] < 0.14 else PAL['yellow']
                formula(im, cx, y + 136, [('2', False), (str(st['nd']), True), (f" – 1 = {total}", False)], ver(c), 4)
        elif st['reglas']:   # en dos columnas, la 1 a la izquierda y la 2 a la derecha
            for r, rx in ((1, X0 + 10), (2, W // 2 + 40)):
                if r in st['reglas_t'] and t >= st['reglas_t'][r]:
                    c = BLANCO if t - st['reglas_t'][r] < 0.12 else (PAL['cyan'] if r == 1 else PAL['orange'])
                    for i, linea in enumerate(self.rot[f'regla{r}']):
                        texto(im, rx, y + 20 + i * 46, linea, ver(c), 4)
        # la pila de llamadas
        if st['pila_on']:
            self.pintar_pila(im, d, t, st, ver, apagadas)

    def disco(self, im, d, cx, abajo, ancho, alto, n, color):
        """Un disco con bisel de pixel art y su número; `abajo` es su orilla de abajo."""
        x0 = round(cx - ancho / 2); x1 = x0 + ancho - 1; y1 = round(abajo) - 1; y0 = y1 - alto + 3
        d.rectangle([x0 - 2, y0 - 2, x1 + 2, y1], fill=NEGRO)
        d.rectangle([x0, y0, x1, y1 - 2], fill=color)
        d.rectangle([x0, y0, x1, y0 + 3], fill=mezcla(color, BLANCO, 0.5))
        d.rectangle([x0, y0, x0 + 5, y1 - 2], fill=mezcla(color, BLANCO, 0.3))
        d.rectangle([x1 - 5, y0 + 4, x1, y1 - 2], fill=mezcla(color, NEGRO, 0.35))
        d.rectangle([x0 + 4, y1 - 6, x1, y1 - 2], fill=mezcla(color, NEGRO, 0.35))
        k = 4 if alto >= 44 else 3
        if alto >= 20:
            texto(im, round(cx), (y0 + y1) / 2 - 4 * k + 1, str(n), mezcla(color, NEGRO, 0.85), k, 'm')

    def flecha(self, d, xa, xb, y, color):
        """Una flecha de pixel de `xa` a `xb`, a la altura `y`."""
        s = 1 if xb > xa else -1
        xa, xb = round(xa + s * 26), round(xb - s * 26)
        d.rectangle([min(xa, xb), y - 2, max(xa, xb), y + 2], fill=color)
        for i in range(8):
            d.rectangle([xb - s * i * 2 - (1 if s > 0 else 0), y - 8 + i, xb - s * i * 2 + (0 if s > 0 else 1), y + 8 - i], fill=color)

    def trayecto(self, x0, y0, x1, y1, ytope, a):
        """Sube de y0 a ytope, cruza de x0 a x1 y baja a y1, a lo largo del camino con arranque y frenado suaves."""
        l1, l2, l3 = max(0, y0 - ytope), abs(x1 - x0), max(0, y1 - ytope)
        s = suave(a) * (l1 + l2 + l3)
        if s < l1:
            return x0, y0 - s
        s -= l1
        if s < l2:
            return x0 + (x1 - x0) * s / max(1, l2), ytope
        return x1, ytope + min(l3, s - l2)

    def movimiento(self, im, d, t, st, xs, alto, anchos, tope, ver):
        """El disco (o el bloque) que va de un poste a otro; el prohibido llega, no baja y regresa."""
        m = st['mov']; a = (t - m['t0']) / m['anim']
        x0, x1 = xs[m['desde']], xs[m['hasta']]
        y0 = PISO - m['i0'] * alto
        ytope = tope - 16
        rojo = False
        if m['tipo'] == 'prohibe':
            y1 = PISO - m['i1'] * alto - 14   # se queda arriba del más chico, sin tocarlo
            if a < 0.4:
                x, y = self.trayecto(x0, y0, x1, y1, ytope, a / 0.4)
            elif a < 0.72:
                x, y = x1, y1; rojo = True
                ya = y1 - alto - 30
                if int((a - 0.4) / 0.32 * 6) % 2 == 0:
                    texto(im, x1, ya - 64, 'NO', ver(PAL['red']), 8, 'm')
            else:
                x, y = self.trayecto(x1, y1, x0, y0, ytope, (a - 0.72) / 0.28)
        else:
            y1 = PISO - m['i1'] * alto
            x, y = self.trayecto(x0, y0, x1, y1, ytope, a)
        for j, dsc in enumerate(m['discos']):
            c = color_disco(dsc)
            if rojo and int(t * 10) % 2 == 0:
                c = PAL['red']
            self.disco(im, d, x, y - j * alto, anchos[dsc], alto, dsc, ver(c))
        if m['tipo'] == 'bloque':   # el bloque: un marco punteado y su rótulo (n − 1 o n)
            k = len(m['discos']); w = max(anchos[dsc] for dsc in m['discos']) + 24
            bx0, bx1 = round(x - w / 2), round(x + w / 2); by1 = round(y) + 6; by0 = by1 - k * alto - 12
            for xx in range(bx0, bx1, 16):
                d.rectangle([xx, by0, min(bx1, xx + 7), by0 + 3], fill=ver(BLANCO)); d.rectangle([xx, by1 - 3, min(bx1, xx + 7), by1], fill=ver(BLANCO))
            for yy in range(by0, by1, 16):
                d.rectangle([bx0, yy, bx0 + 3, min(by1, yy + 7)], fill=ver(BLANCO)); d.rectangle([bx1 - 3, yy, bx1, min(by1, yy + 7)], fill=ver(BLANCO))
            texto(im, round(x), by0 - 40, m['rotulo'], ver(PAL['yellow']), 4, 'm')

    def caja_xy(self, k):
        return PILA_X0 + 8, PISO_PILA - (k + 1) * (CAJA_H + HUECO)

    def caja(self, im, d, k, c, t, color, activa, encoge=0.0, dy=0):
        x, y = self.caja_xy(k); y -= dy
        w = PILA_X1 - PILA_X0 - 16
        m = round(w * 0.5 * encoge); mv = round(CAJA_H * 0.5 * encoge)
        x0, y0, x1, y1 = x + m, y + mv, x + w - 1 - m, y + CAJA_H - 1 - mv
        if x1 <= x0 or y1 <= y0:
            return
        if activa:
            d.rectangle([x0 - 5, y0 - 5, x1 + 5, y1 + 5], fill=BLANCO)
            d.rectangle([x0 - 2, y0 - 2, x1 + 2, y1 + 2], fill=NEGRO)
        d.rectangle([x0, y0, x1, y1], fill=color)
        d.rectangle([x0, y0, x1, y0 + 3], fill=mezcla(color, BLANCO, 0.45))
        d.rectangle([x0, y1 - 3, x1, y1], fill=mezcla(color, NEGRO, 0.3))
        if encoge < 0.3:
            s = f"hanoi({c['n']},{c['desde']},{c['hasta']},{c['aux']})"
            texto(im, (x0 + x1) // 2, y0 + 15, s, mezcla(color, NEGRO, 0.85), 3, 'm')

    def pintar_pila(self, im, d, t, st, ver, apagadas):
        """El tubo con las llamadas: la de arriba corre; las demás esperan, apagadas."""
        texto(im, (PILA_X0 + PILA_X1) // 2, self.techo + 4, self.rot['pila'], ver(PAL['lgray']), 3, 'm')
        x0, x1 = PILA_X0, PILA_X1
        for a, b, c_, e_ in ((x0, self.tubo_y0, x0 + 3, PISO_PILA + 3), (x1 - 4, self.tubo_y0, x1 - 1, PISO_PILA + 3),
                             (x0, PISO_PILA, x1 - 1, PISO_PILA + 3)):
            d.rectangle([a, b, c_, e_], fill=ver(PAL['gray']))
        base = st['base'] if st['base'] is not None and t < st['base'][2] + st['base'][3] else None
        arriba = len(st['pila']) - 1 if base is None else None
        for k, c in enumerate(st['pila']):
            dt = t - c['t0']
            dy = round(110 * (1 - suave(dt / 0.14)))   # entra desde arriba
            color = color_disco(c['n'])
            if dt < 0.06:
                color = BLANCO
            elif k != arriba:
                color = mezcla(color, NEGRO, 0.5)   # espera
            self.caja(im, d, k, c, t, ver(color), k == arriba and not apagadas, dy=dy)
        if base is not None:   # hanoi(0): gris, «CASO BASE», y sale encogiéndose
            c, k, t0, dur = base
            sale = t0 + dur - min(0.16, dur * 0.35)
            enc = suave((t - sale) / min(0.16, dur * 0.35)) if t > sale else 0
            self.caja(im, d, k, c, t, ver(BLANCO if t - t0 < 0.06 else GRIS), enc == 0 and not apagadas, encoge=enc)
            if enc == 0:
                _, y = self.caja_xy(k)
                texto(im, (x0 + x1) // 2, y - 40, self.rot['base'], ver(PAL['cyan']), 3, 'm')
        for c, k, t0 in st['saliendo']:   # las que terminaron: se encogen y se apagan
            a = (t - t0) / 0.18
            if 0 <= a < 1:
                self.caja(im, d, k, c, t, ver(mezcla(color_disco(c['n']), NEGRO, 0.5 * a)), False, encoge=suave(a))
        if not st['pila'] and base is None:
            texto(im, (x0 + x1) // 2, PISO_PILA - 40, self.rot['vacia'], ver(PAL['gray']), 3, 'm')

    # -------------------------------------------------- las ventanas: la cuenta y la leyenda
    def cuenta(self, im, d, t, entra):
        x0, y0, x1, y1 = self.ventana(d, entra)
        if entra < 1:
            return
        if self.complejidad_t is not None and t >= self.complejidad_t:
            c = BLANCO if t - self.complejidad_t < 0.12 else PAL['yellow']
            formula(im, W // 2, y0 + 72, [('2', False), ('n', True), (' – 1', False)], c, 9)
            texto(im, W // 2, y0 + 190, en(self.alg.LEYENDA, self.lang), PAL['lgray'], 3, 'm')
        tabla = self.alg.TABLA
        der = [380, x1 - 60]
        for col, x in zip(tabla['columnas'], der):
            texto(im, x, y0 + 280, en(col, self.lang), PAL['gray'], 3, 'r')
        colores = [PAL[c] for c in tabla['colores']]
        for i, fila in enumerate(tabla['filas']):
            if i in self.filas_t and t >= self.filas_t[i]:
                for v, x, c in zip(fila, der, colores):
                    texto(im, x, y0 + 340 + i * 88, miles(v, self.lang), BLANCO if t - self.filas_t[i] < 0.1 else c, 5, 'r')

    def leyenda(self, im, d, t, entra):
        x0, y0, x1, y1 = self.ventana(d, entra)
        if entra < 1:
            return
        texto(im, W // 2, y0 + 40, self.rot['oro'], PAL['yellow'], 5, 'm')
        texto(im, W // 2, y0 + 100, self.rot['lucas'], PAL['lgray'], 3, 'm')
        # la torre de 64: un disco por segundo, el mismo orden que el programa
        n = self.alg.LEYENDA_N; h = 4; base = y0 + 430
        xs = {p: x0 + (x1 - x0) * (i + 0.5) / 3 for i, p in enumerate('ABC')}
        anchos = {k: 28 + round((290 - 28) * (k - 1) / (n - 1) / 2) * 2 for k in range(1, n + 1)}
        tope = base - n * h - 26
        d.rectangle([x0 + 30, base, x1 - 30, base + 9], fill=MADERA)
        for cx in xs.values():
            d.rectangle([round(cx) - 3, tope, round(cx) + 2, base - 1], fill=atari(0, 4))
        postes = {'A': list(range(n, 0, -1)), 'B': [], 'C': []}
        dt = t - self.leyenda_t - 0.6
        hechos = max(0, min(len(self.leyenda_movs), int(dt) + 1)) if dt >= 0 else 0
        moviendo = None
        for i, (dsc, de, a) in enumerate(self.leyenda_movs[:hechos]):
            postes[a].append(postes[de].pop())
            if i == hechos - 1 and dt - i < 0.5:
                moviendo = (dsc, de, a, (dt - i) / 0.5)
        for p, cx in xs.items():
            for i, dsc in enumerate(postes[p]):
                if moviendo and dsc == moviendo[0]:
                    continue
                self.lingote(d, cx, base - i * h, anchos[dsc], dsc)
        if moviendo:
            dsc, de, a, f = moviendo
            x, y = self.trayecto(xs[de], base - len(postes[de]) * h, xs[a], base - (len(postes[a]) - 1) * h, tope - 10, f)
            self.lingote(d, x, y, anchos[dsc], dsc)
        # cuántos segundos, y cuántos años
        if self.segundos_t is not None and t >= self.segundos_t:
            c = BLANCO if t - self.segundos_t < 0.12 else PAL['cyan']
            texto(im, W // 2, y0 + 476, self.rot['por_segundo'], PAL['gray'], 3, 'm')
            formula(im, W // 2, y0 + 534, [('2', False), ('64', True), (' – 1 ' + self.rot['segundos'], False)], c, 4)
            texto(im, W // 2, y0 + 596, '= ' + miles(self.alg.SEGUNDOS_64, self.lang), BLANCO, 3, 'm')
        if self.anios_t is not None and t >= self.anios_t:
            c = BLANCO if t - self.anios_t < 0.12 else PAL['yellow']
            texto(im, W // 2, y0 + 660, self.rot['anios'], c, 4, 'm')

    def lingote(self, d, cx, abajo, ancho, k):
        """Un disco de oro de la leyenda: 4 px de alto, en dos tonos alternados para que se cuenten."""
        x0 = round(cx - ancho / 2); y1 = round(abajo) - 1
        d.rectangle([x0, y1 - 3, x0 + ancho - 1, y1], fill=ORO[k % 2])

    # -------------------------------------------------- el sonido
    def sonido_pasos(self, sfx):
        """Cada disco al caer; al moverse, una nota (más aguda cuanto más chico) y el golpe al bajar; el prohibido, un zumbido;
        las llamadas, un «pop» que sube al entrar y baja al salir; el caso base, un tic; y al completar la torre, «win»."""
        for e in self.eventos:
            t0, tipo = e['t0'], e['tipo']
            if tipo == 'torre' and not e.get('postes'):
                for i in range(e['n']):
                    nota(sfx, t0 + 0.05 + i * 0.09 + 0.22, 220 * 2 ** (i / 6), 0.06, 'triangle', 0.3)
            elif tipo in ('disco', 'bloque'):
                n = e.get('n', 3)
                anim = e['dur'] * 0.85 if tipo == 'disco' else min(1.1, e['dur'] * 0.8)
                f = 1046 / 2 ** ((n - 1) * 3 / 12) if tipo == 'disco' else 330
                nota(sfx, t0, f, min(0.08, anim * 0.4), 'square', 0.09, hasta=f * 1.5)
                ruido(sfx, t0 + anim * 0.96, 0.03, 0.08, 1800); nota(sfx, t0 + anim * 0.96, f / 2, 0.05, 'triangle', 0.25)
                if e.get('completa'):
                    for i, fr in enumerate([523, 659, 784, 1046, 784, 1046]):
                        nota(sfx, t0 + anim + 0.12 + i * 0.09, fr, 0.09, 'square', 0.14)
            elif tipo == 'prohibe':
                anim = e['dur'] * 0.94
                nota(sfx, t0, 880, 0.06, 'square', 0.09, hasta=1100)
                ta = t0 + anim * 0.4
                nota(sfx, ta, 150, 0.32, 'square', 0.12, hasta=110); ruido(sfx, ta, 0.08, 0.06, 900)
                for i, fr in enumerate([440, 392, 330]):
                    nota(sfx, ta + 0.36 + i * 0.1, fr, 0.1, 'square', 0.1)
            elif tipo == 'llama':
                nota(sfx, t0, 320 if e['n'] else 520, 0.05, 'triangle', 0.18, hasta=640 if e['n'] else 900)
            elif tipo == 'base':
                nota(sfx, t0, 1200, 0.03, 'square', 0.06); nota(sfx, t0 + 0.05, 1600, 0.03, 'square', 0.05)
            elif tipo == 'vuelve':
                nota(sfx, t0, 640, 0.05, 'triangle', 0.18, hasta=300)

    def sonido_ventanas(self, sfx):
        """La ventana que se abre, cada fila de la tabla, un tic por disco de la leyenda (uno por segundo), los años y el enlace."""
        for vista in ('cuenta', 'leyenda'):
            if any(s['vista'] == vista for s in self.escenas):
                t0 = self.primera(vista)['t0']
                ruido(sfx, t0, 0.05, 0.12, 2500); nota(sfx, t0, 500, 0.04, 'triangle', 0.25, hasta=900)
        for i, ts in sorted(self.filas_t.items()):
            nota(sfx, ts, 660 * 2 ** (i / 4), 0.05, 'square', 0.12)
        if self.leyenda_t is not None:
            for i in range(len(self.leyenda_movs)):
                nota(sfx, self.leyenda_t + 0.6 + i + 0.48, 1318, 0.03, 'triangle', 0.18)
        if self.segundos_t is not None:
            nota(sfx, self.segundos_t, 880, 0.05, 'square', 0.12)
        if self.anios_t is not None:
            for i, fr in enumerate([440, 392, 330, 262]):
                nota(sfx, self.anios_t + i * 0.1, fr, 0.12, 'square', 0.12)
        if any(s['vista'] == 'enlace' for s in self.escenas):   # 'start'
            t0 = self.primera('enlace')['t0']
            for i, fr in enumerate([440, 550, 660, 880]):
                nota(sfx, t0 + 0.1 + i * 0.07, fr, 0.07, 'square', 0.13)
