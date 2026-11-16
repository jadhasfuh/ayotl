"""La vista de cajas de «Algoritmos en pixel» (16-nov-2026): una pila o una cola, en vez de las barras.

Las barras de renderizador.py sirven para ordenar un arreglo; una pila no se ordena: se le mete y se le saca. Aquí
los datos son cajas que entran a un contenedor y salen de él, y arriba a la izquierda va la «cinta»: la entrada
que el programa recorre letra por letra, con una flecha en la que lee. FondoCajas hereda de renderizador.Fondo el
editor con el código, la línea que corre, los contadores, la tabla con la O grande y el enlace; lo suyo es el
dibujo de abajo, sus pasos y su sonido.

El archivo del algoritmo (pila.py es el modelo) la pide con VISTA = 'cajas' y además trae:
- FORMA: 'pila' (un tubo de pie a la derecha: se entra y se sale por arriba) o 'cola' (un tubo acostado abajo: se
  entra por la derecha y se sale por la izquierda, y las demás avanzan un lugar);
- ARREGLO: las entradas de la cinta, una por caso (la primera está desde el principio; [] si no hay cinta);
- ROTULO_CAJAS y ROTULO_CINTA: los letreros del contenedor y de la cinta, por idioma; ROTULO_RESULTADO;
- COLORES: {texto de la caja: color de la paleta}, si cada clase de caja lleva el suyo (los paréntesis, cada
  pareja de un color: así se ve de lejos quién cierra a quién);
- USOS: {titulo, filas: [(renglón, explicación)]}, la ventana de «para qué sirve» (vista 'usos' del guion, que
  dice con `usos` = [(fila, desde qué fracción)] cuándo sale cada una).
En CONTADORES, `compara` es el rótulo de lo que entra y `cambia` el de lo que sale (los nombres son los de las
barras).

Los pasos (todos pueden llevar `lineas`, `vars` y `cuenta`, como los de las barras):
- caso {texto}: empieza otra llamada: esa entrada en la cinta, el contenedor vacío y los contadores en cero;
- lee {i}: la flecha pasa a la letra i de la cinta;
- mete {v, de?}: entra una caja que dice `v`; con `de` sale volando de esa letra de la cinta;
- saca {con?, ok?}: sale una caja (la de arriba de la pila, la del frente de la cola). Con `con`, la letra `con`
  de la cinta se le pone al lado y `ok` dice si son pareja: verde y se van, o rojo y ahí se quedan;
- resultado {valor, ok}: lo que devuelve el programa, en grande (verde si `ok`, rojo si no; con 'color': 'mal'
  su línea también va en rojo);
- linea: sólo mueve el resaltado del código.
Si un paso trae varias líneas y dura lo bastante, el código las recorre una por una (renderizador.cuadro) y la
caja se mueve cuando llega la última: `pila.push(c)` se ilumina y en ese momento cae la caja.
"""
import math
import renderizador as R
from renderizador import PAL, VIVO, NEGRO, BLANCO, W, atari, en, mezcla, nota, ruido, suave, texto, tono_de

CAJA_W, CAJA_H, HUECO = 160, 72, 4   # una caja, y el aire entre dos
PISO = 1190                          # el fondo del contenedor (su letrero va debajo; el diálogo de LeIA, desde 1244)
CELDA, PASO_CINTA, CINTA_X = 80, 88, 80   # la cinta: el lado de una celda, de una a la siguiente y su izquierda
FONDO_CELDA = atari(9, 1)


class FondoCajas(R.Fondo):
    PARPADEA = None   # en la tabla no se nombra ningún contador
    COLOR_CUENTA = {'compara': 'mete', 'cambia': 'saca'}

    # -------------------------------------------------- dónde va cada cosa
    def medidas(self):
        alg, lang = self.alg, self.lang
        self.forma = getattr(alg, 'FORMA', 'pila')
        self.casos = [str(c) for c in alg.ARREGLO]
        self.colores = {k: PAL[v] for k, v in getattr(alg, 'COLORES', {}).items()}
        self.rotulo_cajas = en(getattr(alg, 'ROTULO_CAJAS', {'es': 'PILA', 'en': 'STACK'}), lang)
        self.rotulo_cinta = en(getattr(alg, 'ROTULO_CINTA', {'es': 'ENTRADA', 'en': 'INPUT'}), lang)
        self.rotulo_resultado = en(getattr(alg, 'ROTULO_RESULTADO', {'es': 'RESULTADO', 'en': 'RESULT'}), lang)
        # cuántas cajas llega a haber a la vez: de ese tamaño es el contenedor
        n = tope = 0
        for e in self.eventos:
            n = 0 if e['tipo'] == 'caso' else n + (e['tipo'] == 'mete') - (e['tipo'] == 'saca')
            tope = max(tope, n)
        self.capacidad = max(3, tope)
        largo = max([len(c) for c in self.casos] + [1])
        self.paso_cinta = min(PASO_CINTA, 520 // largo); self.celda = self.paso_cinta - 8
        self.cinta_y = self.techo + 44   # la cinta, arriba a la izquierda, con su letrero encima
        if self.forma == 'pila':
            cx = 830
            alto = self.capacidad * (CAJA_H + HUECO) + 8
            self.tubo = (cx - CAJA_W // 2 - 8, PISO - alto, cx + CAJA_W // 2 + 8, PISO)
            self.boca = (cx, PISO - alto - 16 - CAJA_H // 2)           # por donde entran y salen: arriba
            self.salida = (cx - CAJA_W // 2 - 2, self.boca[1])         # la que salió y, a su lado, la que la cierra
            self.junto = (cx + CAJA_W // 2 + 2, self.boca[1])
            self.fuga = (cx, self.boca[1] - 24)                        # la que sale sola se va hacia arriba
            self.resultado_xy = (CINTA_X + 260, self.cinta_y + CELDA + 96)
            self.rotulo_xy = (cx, PISO + 12)
        else:   # la cola: acostada, abajo; el frente a la izquierda
            ancho = self.capacidad * (CAJA_W + HUECO) + 8
            x0 = (W - ancho) // 2 + 40
            self.tubo = (x0, PISO - CAJA_H - 16, x0 + ancho, PISO)
            cy = PISO - 8 - CAJA_H // 2
            self.boca = (x0 + ancho + 20 + CAJA_W // 2, cy)            # entran por atrás (la derecha)
            self.salida = (x0 - 24 - CAJA_W // 2, cy)                  # y salen por el frente
            self.junto = (self.salida[0], cy - CAJA_H - 8)
            self.fuga = (self.salida[0] - 40, cy)
            self.resultado_xy = (830, self.cinta_y + 4)
            self.rotulo_xy = ((self.tubo[0] + self.tubo[2]) // 2, PISO + 12)
        arriba = min(self.boca[1], self.junto[1]) - CAJA_H // 2 - 4 if self.forma == 'pila' else self.cinta_y + CELDA + 60
        if arriba < self.techo or (self.forma == 'cola' and arriba > self.junto[1] - CAJA_H // 2):
            raise SystemExit(f'el código es muy largo para la vista de cajas: los contadores llegan a {self.techo} '
                             f'y el dibujo no cabe debajo (quítale renglones al código o cajas al ejemplo)')
        # cuándo sale cada renglón de la ventana de usos
        self.usos_t = {}
        for s in self.escenas:
            for fila, f in s.get('usos', []):
                self.usos_t.setdefault(fila, s['t0'] + f * s['dur'])
        self.ventanas['usos'] = self.usos

    def lugar(self, k):
        """El centro de la caja k del contenedor (la 0 es la de abajo de la pila o el frente de la cola)."""
        if self.forma == 'pila':
            return (self.boca[0], PISO - HUECO - CAJA_H // 2 - k * (CAJA_H + HUECO))
        return (self.tubo[0] + 4 + HUECO + CAJA_W // 2 + k * (CAJA_W + HUECO), self.boca[1])

    def celda_xy(self, i):
        """El centro de la letra i de la cinta."""
        return (CINTA_X + self.paso_cinta * i + self.celda // 2, self.cinta_y + self.celda // 2)

    def color_de(self, s):
        return self.colores.get(s, R.BARRA)

    def tiempos(self, e):
        """(cuándo empieza a moverse la caja de un paso, cuánto tarda en llegar, cuándo acaba el paso). Si el código
        recorre sus líneas una por una, la caja espera a la última (la misma cuenta que renderizador.cuadro)."""
        ls = e.get('lineas', []); t0 = e['t0']
        if len(ls) > 1 and e['dur'] >= 0.6:
            t0 += (len(ls) - 1) * e['dur'] * 0.8 / len(ls)
        fin = e['t0'] + e['dur']
        return t0, max(0.12, min(0.5 if e['tipo'] == 'mete' else 0.4, (fin - t0) * (0.75 if e['tipo'] == 'mete' else 0.4))), fin

    # -------------------------------------------------- lo que no cambia
    def pintar_piso(self, im, d):
        """El contenedor (un tubo abierto por donde entran las cajas) y los letreros."""
        x0, y0, x1, y1 = self.tubo; g = PAL['dgray']
        if self.forma == 'pila':
            d.rectangle([x0 - 6, y0, x0 - 1, y1 + 5], fill=g); d.rectangle([x1, y0, x1 + 5, y1 + 5], fill=g)
            d.rectangle([x0 - 6, y1, x1 + 5, y1 + 5], fill=g)
        else:
            d.rectangle([x0, y0 - 6, x1, y0 - 1], fill=g); d.rectangle([x0, y1, x1, y1 + 5], fill=g)
        texto(im, self.rotulo_xy[0], self.rotulo_xy[1], self.rotulo_cajas, PAL['gray'], 3, 'm')
        if self.casos:
            texto(im, CINTA_X, self.cinta_y - 36, self.rotulo_cinta, PAL['gray'], 3)

    # -------------------------------------------------- el estado
    def estado(self):
        return {'cinta': self.casos[0] if self.casos else '', 'cinta_t': -9, 'i': None, 'cajas': [], 'par': None,
                'resultado': None, 'vars': {}, 'cuenta': {'compara': 0, 'cambia': 0}, 'mas': {'compara': -9, 'cambia': -9}}

    def aplicar(self, e, st):
        tipo = e['tipo']
        if tipo == 'caso':   # otra llamada: todo limpio
            if e['texto'] != st['cinta']:
                st['cinta_t'] = e['t0']   # la cinta nueva cae letra por letra
            st.update(cinta=e['texto'], i=None, cajas=[], par=None, resultado=None, vars={},
                      cuenta={'compara': 0, 'cambia': 0})
        self.contar(e, st)
        if tipo == 'lee':
            st['i'] = e['i']
        elif tipo == 'mete':
            st['cajas'].append(str(e['v']))
        elif tipo == 'saca':
            e['sale'] = st['cajas'].pop(-1 if self.forma == 'pila' else 0)
            if e.get('ok') is False:   # las que no son pareja se quedan a la vista
                st['par'] = (e['sale'], st['cinta'][e['con']])
        elif tipo == 'resultado':
            st['resultado'] = (str(e['valor']), bool(e.get('ok', True)), e['t0'])

    # -------------------------------------------------- un cuadro
    def dibujo(self, im, d, t, e, st, cae=None, apagadas=False):
        ver = (lambda c: mezcla(c, NEGRO, 0.75)) if apagadas else (lambda c: c)
        self.cinta(im, d, t, st, cae, ver)
        tipo = e['tipo'] if e else None
        cajas = st['cajas']; n = len(cajas)
        ta, tarda, fin = self.tiempos(e) if tipo in ('mete', 'saca') else (0, 1, 0)
        x = (t - ta) / tarda
        # las que están quietas (en la cola, mientras sale la del frente, las demás avanzan un lugar)
        avanza = suave(x) if tipo == 'saca' and self.forma == 'cola' else 1
        for k, s in enumerate(cajas[:n - 1] if tipo == 'mete' else cajas):
            ax, ay = self.lugar(k)
            if avanza < 1:
                bx, by = self.lugar(k + 1); ax, ay = bx + (ax - bx) * avanza, by + (ay - by) * avanza
            self.caja(im, d, ax, ay, s, ver(self.color_de(s)))
        if tipo == 'mete':   # la que entra: de su letra a la boca y de la boca a su lugar
            s = cajas[-1]; destino = self.lugar(n - 1); color = ver(self.color_de(s))
            if x >= 1:
                self.caja(im, d, *destino, s, BLANCO if t - ta - tarda < 0.1 else color)
            elif x >= 0:
                origen = self.celda_xy(e['de']) if 'de' in e else self.boca
                tramos = [origen, self.boca, destino]
                f = suave(x * 2) if x < 0.5 else suave(x * 2 - 1)
                a, b = tramos[0:2] if x < 0.5 else tramos[1:3]
                self.caja(im, d, a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, s, color, borde=VIVO['mete'])
        elif tipo == 'saca' and t < fin:   # la que sale, y la que la cierra
            s = e['sale']; origen = self.lugar(n if self.forma == 'pila' else 0)
            ok = e.get('ok'); f = suave(x); color = ver(self.color_de(s))
            if x < 0:   # todavía no le toca: sigue en su lugar
                self.caja(im, d, *origen, s, color)
            elif 'con' not in e:   # sale sola: a la boca y se va, apagándose
                a, b = (origen, self.boca if self.forma == 'pila' else self.salida)
                cx, cy = a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f
                ido = max(0.0, min(1.0, (t - ta - tarda - 0.25) / max(0.1, (fin - ta - tarda - 0.25) * 0.6)))
                if ido < 1:
                    cx, cy = cx + (self.fuga[0] - b[0]) * ido, cy + (self.fuga[1] - b[1]) * ido
                    self.caja(im, d, cx, cy, s, mezcla(color, NEGRO, ido), borde=mezcla(VIVO['saca'], NEGRO, ido))
            else:
                otra = st['cinta'][e['con']]; desde = self.celda_xy(e['con'])
                p1 = (origen[0] + (self.salida[0] - origen[0]) * f, origen[1] + (self.salida[1] - origen[1]) * f)
                p2 = (desde[0] + (self.junto[0] - desde[0]) * f, desde[1] + (self.junto[1] - desde[1]) * f)
                borde = VIVO['saca']; c1, c2 = color, ver(self.color_de(otra))
                if x >= 1:   # ya están juntas: ¿son pareja?
                    dt = t - ta - tarda
                    borde = VIVO['fija'] if ok else VIVO['mal']
                    if ok and dt < 0.12:
                        c1 = c2 = BLANCO
                    if ok is False:   # un temblor que se apaga
                        tiembla = round(10 * math.sin(dt * 40) * max(0, 1 - dt / 0.5))
                        p1 = (p1[0] + tiembla, p1[1]); p2 = (p2[0] + tiembla, p2[1])
                    elif t > ta + (fin - ta) * 0.85:   # se van juntas
                        return self.resultado(im, t, st, ver)
                self.caja(im, d, *p1, s, c1, borde=borde); self.caja(im, d, *p2, otra, c2, borde=borde)
        elif st['par']:   # las que no fueron pareja, ahí siguen
            for xy, s in zip((self.salida, self.junto), st['par']):
                self.caja(im, d, *xy, s, ver(self.color_de(s)), borde=ver(VIVO['mal']))
        self.resultado(im, t, st, ver)

    def cinta(self, im, d, t, st, cae, ver):
        """La entrada, una celda por letra: la que se lee, con marco y flecha; las ya leídas, apagadas."""
        lado = self.celda; k = 6 if lado >= 72 else max(3, lado // 12)
        for i, ch in enumerate(st['cinta']):
            cx, cy = self.celda_xy(i); dy = 0
            t_cae = cae['t0'] + 0.15 if cae is not None else st['cinta_t']
            dt = t - t_cae - i * 0.09
            if dt < 0.3:   # las celdas caen una por una, al empezar y al cambiar de caso
                if dt < 0:
                    continue
                dy = -int(160 * max(0, 1 - dt / 0.22) ** 2)
            x0, y0 = cx - lado // 2, cy - lado // 2 + dy
            actual = st['i'] == i; leida = st['i'] is not None and i < st['i']
            d.rectangle([x0, y0, x0 + lado - 1, y0 + lado - 1], fill=ver(VIVO['lee'] if actual else atari(9, 3)))
            d.rectangle([x0 + 4, y0 + 4, x0 + lado - 5, y0 + lado - 5], fill=ver(atari(9, 2) if actual else FONDO_CELDA))
            color = self.color_de(ch)
            texto(im, cx, y0 + (lado - 8 * k) // 2 + k // 2, ch, ver(mezcla(color, NEGRO, 0.6) if leida else color), k, 'm')
        if st['i'] is not None and cae is None:
            cx, cy = self.celda_xy(st['i']); y = cy + lado // 2 + 8
            texto(im, cx, y, '▲', ver(VIVO['lee']), 3, 'm')
            texto(im, cx, y + 28, self.var_nombre, ver(VIVO['lee']), 3, 'm')

    def resultado(self, im, t, st, ver):
        """Lo que devolvió el programa, en grande."""
        if st['resultado']:
            valor, ok, t0 = st['resultado']; cx, y = self.resultado_xy
            texto(im, cx, y, self.rotulo_resultado, ver(PAL['gray']), 3, 'm')
            color = BLANCO if t - t0 < 0.14 else VIVO['resultado' if ok else 'mal']
            texto(im, cx, y + 36, valor, ver(color), 8, 'm')

    def caja(self, im, d, cx, cy, s, color, borde=None):
        """Una caja con el mismo bisel que las barras y su texto en medio; `borde`: un marco de ese color."""
        x0, y0 = round(cx - CAJA_W / 2), round(cy - CAJA_H / 2); x1, y1 = x0 + CAJA_W, y0 + CAJA_H; p = 6
        if borde:
            d.rectangle([x0 - 4, y0 - 4, x1 + 3, y1 + 3], fill=borde)
        d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=color)
        d.rectangle([x0, y0, x1 - 1, y0 + 3], fill=mezcla(color, BLANCO, 0.5))
        d.rectangle([x0, y0, x0 + p - 1, y1 - 1], fill=mezcla(color, BLANCO, 0.35))
        d.rectangle([x1 - p, y0 + 4, x1 - 1, y1 - 1], fill=mezcla(color, NEGRO, 0.35))
        k = max(2, min(7, (CAJA_W - 24) // (8 * max(1, len(s)))))
        texto(im, round(cx), y0 + (CAJA_H - 8 * k) // 2 + k // 2, s, mezcla(color, NEGRO, 0.85), k, 'm')

    # -------------------------------------------------- para qué sirve
    def usos(self, im, d, t, entra):
        x0, y0, x1, y1 = self.ventana(d, entra)
        if entra < 1:
            return
        u = self.alg.USOS; filas = u['filas']
        y = lambda f: y0 + round((y1 - y0) * f)
        texto(im, W // 2, y(0.09), en(u['titulo'], self.lang), PAL['gray'], 3, 'm')
        alto = 0.76 / len(filas)
        for i, (grande, chico) in enumerate(filas):
            if i in self.usos_t and t >= self.usos_t[i]:
                color = BLANCO if t - self.usos_t[i] < 0.12 else (PAL['yellow'], PAL['cyan'], PAL['pink'])[i % 3]
                texto(im, W // 2, y(0.24 + alto * i), en(grande, self.lang), color, 5, 'm')
                texto(im, W // 2, y(0.24 + alto * i) + 58, en(chico, self.lang), PAL['lgray'], 3, 'm')

    # -------------------------------------------------- el sonido
    def sonido_pasos(self, sfx):
        """Cada letra de la cinta al caer, un tic al leer, la caja que sube de tono al entrar y baja al salir (más
        aguda cuanto más alta la pila), 'eat' de DC si son pareja, 'perder' si no, y 'win' o un zumbido al final."""
        for s in self.escenas:
            if s['vista'] == 'inicio' and self.casos:
                for i in range(len(self.casos[0])):
                    nota(sfx, s['t0'] + 0.15 + i * 0.09 + 0.22, tono_de(i + 1), 0.06, 'triangle', 0.35)
            if s['vista'] == 'usos' and s is self.primera('usos'):   # la ventana que se abre: un 'pop'
                ruido(sfx, s['t0'], 0.05, 0.12, 2500); nota(sfx, s['t0'], 500, 0.04, 'triangle', 0.25, hasta=900)
        for ts in self.usos_t.values():
            nota(sfx, ts, 880, 0.04, 'square', 0.13)
        n = 0; cinta = self.casos[0] if self.casos else ''
        for e in self.eventos:
            t0, tipo = e['t0'], e['tipo']
            ta, tarda, _ = self.tiempos(e)
            if tipo == 'caso':
                if e['texto'] != cinta:
                    for i in range(len(e['texto'])):
                        nota(sfx, t0 + i * 0.09 + 0.22, tono_de(i + 1), 0.06, 'triangle', 0.3)
                else:
                    ruido(sfx, t0, 0.03, 0.05, 2500); nota(sfx, t0, 300, 0.04, 'triangle', 0.15, hasta=600)
                n = 0; cinta = e['texto']
            elif tipo == 'lee':
                nota(sfx, t0, 720, 0.03, 'triangle', 0.2)
            elif tipo == 'mete':
                n += 1
                nota(sfx, ta, tono_de(n) * 0.75, 0.10, 'square', 0.09, hasta=tono_de(n))
                ruido(sfx, ta + tarda, 0.04, 0.10, 1500); nota(sfx, ta + tarda, tono_de(n), 0.07, 'triangle', 0.35)
            elif tipo == 'saca':
                nota(sfx, ta, tono_de(n), 0.11, 'square', 0.10, hasta=tono_de(n) * 1.5); ruido(sfx, ta, 0.04, 0.10, 3000)
                n -= 1
                if e.get('ok') is True:   # 'eat'
                    nota(sfx, ta + tarda, 660, 0.06, 'square', 0.14); nota(sfx, ta + tarda + 0.06, 990, 0.08, 'square', 0.14)
                elif e.get('ok') is False:   # 'perder'
                    for i, fr in enumerate([440, 392, 330, 262]):
                        nota(sfx, ta + tarda + i * 0.1, fr, 0.12, 'square', 0.12)
            elif tipo == 'resultado':
                if e.get('ok', True):   # 'win'
                    for i, fr in enumerate([523, 659, 784, 1046, 784, 1046]):
                        nota(sfx, t0 + 0.05 + i * 0.09, fr, 0.09, 'square', 0.14)
                else:   # un zumbido grave
                    nota(sfx, t0 + 0.05, 196, 0.16, 'square', 0.13); nota(sfx, t0 + 0.24, 147, 0.3, 'square', 0.13)
