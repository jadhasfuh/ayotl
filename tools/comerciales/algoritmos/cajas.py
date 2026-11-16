"""La vista de cajas de «Algoritmos en pixel» (16-nov-2026): una pila o una cola, en vez de las barras.

Las barras de renderizador.py sirven para ordenar un arreglo; una pila no se ordena: se le mete y se le saca. Aquí
los datos son cajas que entran a un contenedor y salen de él, y arriba a la izquierda va la «cinta»: la entrada
que el programa recorre letra por letra, con una flecha en la que lee. FondoCajas hereda de renderizador.Fondo el
editor con el código, la línea que corre, los contadores, la tabla con la O grande y el enlace; lo suyo es el
dibujo de abajo, sus pasos y su sonido.

El archivo del algoritmo (pila.py y cola.py son los modelos) la pide con VISTA = 'cajas' y además trae:
- FORMA: 'pila' (un tubo de pie a la derecha: se entra y se sale por arriba) o 'cola' (un tubo acostado abajo: se
  entra por atrás, la derecha, y se sale por delante, la izquierda; las demás avanzan un lugar, con una flecha
  encima de cada una mientras se recorren). En la cola las cajas son tan anchas como quepan (200 px con tres):
  caben nombres de cuatro letras a 40 px;
- ARREGLO: las entradas de la cinta, una por caso (la primera está desde el principio; [] si no hay cinta);
- ROTULO_CAJAS y ROTULO_CINTA: los letreros del contenedor y de la cinta, por idioma; ROTULO_RESULTADO;
  ROTULO_EXTREMOS: los de las dos puntas de la cola (DELANTE y ATRÁS);
- INDICE: {titulo, codigo, valores, nombre, O, leyenda}, la ventana de «un índice que avanza» (vista 'indice'
  del guion, con `avanza` = [fracciones en las que el índice da un paso] y `remate` = cuándo sale la O grande):
  las cajas no se mueven, se mueve la flecha;
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
- imprime {texto}: un renglón más en la consola (lo que escribe console.log; el texto puede ir por idioma). La
  consola va donde iría la cinta: un episodio lleva una o la otra;
- linea: sólo mueve el resaltado del código.
Si un paso trae varias líneas y dura lo bastante, el código las recorre una por una (renderizador.cuadro) y la
caja se mueve cuando llega la última: `pila.push(c)` se ilumina y en ese momento cae la caja.
"""
import math
import renderizador as R
from renderizador import PAL, VIVO, NEGRO, BLANCO, W, atari, en, mascara, mezcla, nota, ruido, suave, texto, tono_de

CAJA_W, CAJA_H, HUECO = 160, 72, 4   # una caja de la pila (las de la cola se miden en medidas()), y el aire entre dos
RENGLONES = 3                        # los de la consola
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
        self.caja_w, self.caja_h = CAJA_W, CAJA_H
        self.hay_consola = any(e['tipo'] == 'imprime' for e in self.eventos)
        if self.hay_consola and self.casos:
            raise SystemExit('la consola va donde la cinta: el episodio lleva una o la otra')
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
        else:   # la cola: acostada, abajo; delante (por donde se sale) a la izquierda
            cap = self.capacidad
            # a la izquierda del tubo queda el lugar de la que atienden, del ancho de una caja: de 60 a 910
            self.caja_w = min(200, (812 - 4 * cap) // (cap + 1) // 8 * 8)
            ancho = cap * (self.caja_w + HUECO) + 8
            x0 = 60 + self.caja_w + 30
            self.tubo = (x0, PISO - CAJA_H - 16, x0 + ancho, PISO)
            cy = PISO - 8 - CAJA_H // 2
            self.boca = (x0 + ancho + 16 + self.caja_w // 2, cy)       # entran por atrás (la derecha)
            self.fuera = (W + self.caja_w // 2 + 8, cy)                # la que no viene de la cinta llega de fuera
            self.salida = (60 + self.caja_w // 2, cy)                  # y salen por delante
            self.junto = (self.salida[0], cy - CAJA_H - 8)
            self.fuga = self.salida                                    # la que atienden se apaga ahí mismo
            self.resultado_xy = (830, self.cinta_y + 4)
            self.rotulo_xy = ((self.tubo[0] + self.tubo[2]) // 2, PISO + 12)
            extremos = en(getattr(alg, 'ROTULO_EXTREMOS', {'es': ('DELANTE', 'ATRÁS'), 'en': ('FRONT', 'BACK')}), lang)
            self.rotulo_extremos = extremos if 24 * (sum(map(len, extremos)) + len(self.rotulo_cajas) + 4) <= ancho else None
        # la letra de las cajas, la misma para todas: la que deja entrar al texto más largo
        largo_caja = max([len(str(e['v'])) for e in self.eventos if e['tipo'] == 'mete'] + [1])
        self.k_caja = max(2, min(7, (self.caja_w - 24) // (8 * largo_caja)))
        # la consola: arriba, donde iría la cinta
        self.consola = (60, self.techo + 42, W - 60, self.techo + 42 + 16 + 44 * RENGLONES)
        largo_consola = max([len(en(e['texto'], lang)) for e in self.eventos if e['tipo'] == 'imprime'] + [1])
        self.k_consola = 4 if largo_consola * 32 <= W - 160 else 3
        if self.forma == 'pila':
            arriba, abajo = min(self.boca[1], self.junto[1]) - CAJA_H // 2 - 4, PISO
        elif self.hay_consola:
            arriba, abajo = self.consola[1] - 32, self.consola[3] + 52   # debajo van las flechas de las que se recorren
        else:
            arriba, abajo = self.cinta_y - 36, self.cinta_y + CELDA + 60 + 52
        if arriba < self.techo or (self.forma == 'cola' and abajo > self.tubo[1]) or largo_consola * 24 > W - 160:
            raise SystemExit(f'el código es muy largo para la vista de cajas: los contadores llegan a {self.techo} '
                             f'y el dibujo no cabe debajo (quítale renglones al código o cajas al ejemplo)')
        # cuándo sale cada renglón de la ventana de usos
        self.usos_t = {}
        for s in self.escenas:
            for fila, f in s.get('usos', []):
                self.usos_t.setdefault(fila, s['t0'] + f * s['dur'])
        self.ventanas['usos'] = self.usos
        # la ventana del índice: cuándo da cada paso y cuándo sale su O grande
        self.indice_t, self.remate_t = [], None
        for s in self.escenas:
            if s['vista'] == 'indice':
                g = s.get('guion', {})
                self.indice_t += [s['t0'] + f * s['dur'] for f in g.get('avanza', [])]
                if g.get('remate') is not None and self.remate_t is None:
                    self.remate_t = s['t0'] + g['remate'] * s['dur']
        self.ventanas['indice'] = self.indice

    def lugar(self, k):
        """El centro de la caja k del contenedor (la 0 es la de abajo de la pila o el frente de la cola)."""
        if self.forma == 'pila':
            return (self.boca[0], PISO - HUECO - CAJA_H // 2 - k * (CAJA_H + HUECO))
        return (self.tubo[0] + 4 + HUECO + self.caja_w // 2 + k * (self.caja_w + HUECO), self.boca[1])

    def celda_xy(self, i):
        """El centro de la letra i de la cinta."""
        return (CINTA_X + self.paso_cinta * i + self.celda // 2, self.cinta_y + self.celda // 2)

    def color_de(self, s):
        return self.colores.get(s, R.BARRA)

    def tiempos(self, e):
        """(cuándo empieza a moverse la caja de un paso, cuánto tarda en llegar, cuándo acaba el paso). Si el código
        recorre sus líneas una por una, la caja espera a la última (la misma cuenta que renderizador.cuadro)."""
        ls = en(e.get('lineas', []), self.lang); t0 = e['t0']
        if len(ls) > 1 and e['dur'] >= 0.6:
            t0 += (len(ls) - 1) * e['dur'] * 0.8 / len(ls)
        fin = e['t0'] + e['dur']
        if e['tipo'] == 'mete':   # la que llega a la cola desde fuera viene de más lejos: con calma, que se vea llegar
            tope = 0.9 if self.forma == 'cola' and 'de' not in e else 0.5
            return t0, max(0.12, min(tope, (fin - t0) * 0.75)), fin
        return t0, max(0.12, min(0.4, (fin - t0) * 0.4)), fin

    # -------------------------------------------------- lo que no cambia
    def pintar_piso(self, im, d):
        """El contenedor (un tubo abierto por donde entran las cajas) y los letreros."""
        x0, y0, x1, y1 = self.tubo; g = PAL['dgray']
        if self.forma == 'pila':
            d.rectangle([x0 - 6, y0, x0 - 1, y1 + 5], fill=g); d.rectangle([x1, y0, x1 + 5, y1 + 5], fill=g)
            d.rectangle([x0 - 6, y1, x1 + 5, y1 + 5], fill=g)
        else:
            d.rectangle([x0, y0 - 6, x1, y0 - 1], fill=g); d.rectangle([x0, y1, x1, y1 + 5], fill=g)
            if self.rotulo_extremos:   # por dónde se sale y por dónde se entra
                texto(im, x0, self.rotulo_xy[1], self.rotulo_extremos[0], PAL['gray'], 3)
                texto(im, x1, self.rotulo_xy[1], self.rotulo_extremos[1], PAL['gray'], 3, 'r')
        texto(im, self.rotulo_xy[0], self.rotulo_xy[1], self.rotulo_cajas, PAL['lgray' if self.forma == 'cola' else 'gray'], 3, 'm')
        if self.casos:
            texto(im, CINTA_X, self.cinta_y - 36, self.rotulo_cinta, PAL['gray'], 3)
        if self.hay_consola:   # una ventana como la del editor, más sobria
            cx0, cy0, cx1, cy1 = self.consola
            texto(im, cx0 + 4, cy0 - 32, en(getattr(self.alg, 'ROTULO_CONSOLA', {'es': 'CONSOLA', 'en': 'CONSOLE'}), self.lang),
                  PAL['gray'], 3)
            d.rectangle([cx0, cy0, cx1 - 1, cy1 - 1], fill=g); d.rectangle([cx0 + 4, cy0 + 4, cx1 - 5, cy1 - 5], fill=NEGRO)

    # -------------------------------------------------- el estado
    def estado(self):
        return {'cinta': self.casos[0] if self.casos else '', 'cinta_t': -9, 'i': None, 'cajas': [], 'par': None,
                'resultado': None, 'consola': [], 'vars': {}, 'cuenta': {'compara': 0, 'cambia': 0},
                'mas': {'compara': -9, 'cambia': -9}}

    def aplicar(self, e, st):
        tipo = e['tipo']
        if tipo == 'caso':   # otra llamada: todo limpio
            if e['texto'] != st['cinta']:
                st['cinta_t'] = e['t0']   # la cinta nueva cae letra por letra
            st.update(cinta=e['texto'], i=None, cajas=[], par=None, resultado=None, consola=[], vars={},
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
        elif tipo == 'imprime':
            st['consola'] = (st['consola'] + [(en(e['texto'], self.lang), e['t0'])])[-RENGLONES:]

    # -------------------------------------------------- un cuadro
    def dibujo(self, im, d, t, e, st, cae=None, apagadas=False):
        ver = (lambda c: mezcla(c, NEGRO, 0.75)) if apagadas else (lambda c: c)
        self.cinta(im, d, t, st, cae, ver)
        for i, (s, t0) in enumerate(st['consola']):   # lo impreso: el renglón nuevo destella y luego queda en blanco
            nuevo = i == len(st['consola']) - 1
            color = VIVO['imprime'] if t - t0 < 0.16 else BLANCO if nuevo else PAL['lgray']
            texto(im, self.consola[0] + 24, self.consola[1] + 16 + 44 * i, s, ver(color), self.k_consola)
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
            if tipo == 'saca' and self.forma == 'cola' and 0 <= t - ta < min(fin - ta, 1.1):   # ésta también se recorrió
                texto(im, ax, self.tubo[1] - 40, '←', ver(VIVO['saca']), 3, 'm')
        if tipo == 'mete':   # la que entra: de su letra a la boca y de la boca a su lugar
            s = cajas[-1]; destino = self.lugar(n - 1); color = ver(self.color_de(s))
            if x >= 1:
                self.caja(im, d, *destino, s, BLANCO if t - ta - tarda < 0.1 else color)
            elif x >= 0:
                origen = self.celda_xy(e['de']) if 'de' in e else self.boca
                tramos = [origen, self.boca, destino]
                f = suave(x * 2) if x < 0.5 else suave(x * 2 - 1)
                a, b = tramos[0:2] if x < 0.5 else tramos[1:3]
                if self.forma == 'cola' and 'de' not in e:   # llega de fuera de la pantalla, de corrido
                    a, b, f = self.fuera, destino, suave(x)
                self.caja(im, d, a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, s, color, borde=VIVO['mete'])
        elif tipo == 'saca' and t < fin:   # la que sale, y la que la cierra
            s = e['sale']; origen = self.lugar(n if self.forma == 'pila' else 0)
            ok = e.get('ok'); f = suave(x); color = ver(self.color_de(s))
            if x < 0:   # todavía no le toca: sigue en su lugar
                self.caja(im, d, *origen, s, color)
            elif 'con' not in e:   # sale sola: a la boca y se va, apagándose
                a, b = (origen, self.boca if self.forma == 'pila' else self.salida)
                cx, cy = a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f
                espera = 0.25 if self.forma == 'pila' else (fin - ta - tarda) * 0.45   # a la que atienden se le ve un rato
                ido = max(0.0, min(1.0, (t - ta - tarda - espera) / max(0.1, (fin - ta - tarda - espera) * 0.6)))
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
        x0, y0 = round(cx - self.caja_w / 2), round(cy - self.caja_h / 2); x1, y1 = x0 + self.caja_w, y0 + self.caja_h; p = 6
        if borde:
            d.rectangle([x0 - 4, y0 - 4, x1 + 3, y1 + 3], fill=borde)
        d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=color)
        d.rectangle([x0, y0, x1 - 1, y0 + 3], fill=mezcla(color, BLANCO, 0.5))
        d.rectangle([x0, y0, x0 + p - 1, y1 - 1], fill=mezcla(color, BLANCO, 0.35))
        d.rectangle([x1 - p, y0 + 4, x1 - 1, y1 - 1], fill=mezcla(color, NEGRO, 0.35))
        k = min(self.k_caja, max(2, (self.caja_w - 24) // (8 * max(1, len(s)))))
        texto(im, round(cx), y0 + (self.caja_h - 8 * k) // 2 + k // 2, s, mezcla(color, NEGRO, 0.85), k, 'm')

    # -------------------------------------------------- para qué sirve
    def usos(self, im, d, t, entra):
        x0, y0, x1, y1 = self.ventana(d, entra)
        if entra < 1:
            return
        u = self.alg.USOS; filas = u['filas']
        y = lambda f: y0 + round((y1 - y0) * f)
        texto(im, W // 2, y(0.09), en(u['titulo'], self.lang), PAL['gray'], 3, 'm')
        arriba, alto = (0.24, 0.76 / len(filas)) if len(filas) < 3 else (0.2, 0.8 / len(filas))   # con tres, más juntas
        for i, (grande, chico) in enumerate(filas):
            if i in self.usos_t and t >= self.usos_t[i]:
                color = BLANCO if t - self.usos_t[i] < 0.12 else (PAL['yellow'], PAL['cyan'], PAL['pink'])[i % 3]
                texto(im, W // 2, y(arriba + alto * i), en(grande, self.lang), color, 5, 'm')
                texto(im, W // 2, y(arriba + alto * i) + 58, en(chico, self.lang), PAL['lgray'], 3, 'm')

    # -------------------------------------------------- un índice que avanza
    def indice(self, im, d, t, entra):
        """Las mismas cajas, quietas, y una flecha con el nombre del índice que da un paso cada vez que sale una: las
        que ya salieron se apagan y nadie se mueve. Arriba, la línea de código; abajo, la O grande y su renglón."""
        x0, y0, x1, y1 = self.ventana(d, entra)
        if entra < 1:
            return
        cfg = self.alg.INDICE; valores = [str(v) for v in cfg['valores']]
        y = lambda f: y0 + round((y1 - y0) * f)
        texto(im, W // 2, y(0.07), en(cfg['titulo'], self.lang), PAL['gray'], 3, 'm')
        codigo = en(cfg['codigo'], self.lang); x = W // 2 - 12 * len(codigo)
        for tramo, clase in R.resaltar(codigo):   # con los colores del editor
            if clase != 'ws':
                im.paste(R.SINTAXIS[clase], (x, y(0.175) - 9), mascara(tramo, 3))
            x += 24 * len(tramo)
        paso = self.caja_w + 8
        cxs = [W // 2 + round((i - (len(valores) - 1) / 2) * paso) for i in range(len(valores))]
        dados = [ti for ti in self.indice_t if t >= ti]
        p = min(len(dados), len(valores) - 1)
        for i, s in enumerate(valores):
            color = self.color_de(s)
            self.caja(im, d, cxs[i], y(0.385), s, mezcla(color, NEGRO, 0.72) if i < p else color,
                      borde=VIVO['lee'] if i == p else None)
        fx = cxs[p]
        if dados and p > 0:   # la flecha se desliza a la caja siguiente
            fx = cxs[p - 1] + (cxs[p] - cxs[p - 1]) * suave((t - dados[-1]) / 0.25)
        nombre = f"{cfg['nombre']} = {p}"
        texto(im, fx, y(0.385) + self.caja_h // 2 + 12, '▲', VIVO['lee'], 3, 'm')
        texto(im, min(max(fx, x0 + 24 + 12 * len(nombre)), x1 - 24 - 12 * len(nombre)), y(0.385) + self.caja_h // 2 + 42,
              nombre, BLANCO if dados and t - dados[-1] < 0.14 else VIVO['lee'], 3, 'm')
        if self.remate_t is not None and t >= self.remate_t:
            texto(im, W // 2, y(0.69), en(cfg['O'], self.lang), PAL['lgreen'], 7, 'm')
            texto(im, W // 2, y(0.86), en(cfg['leyenda'], self.lang), PAL['lgray'], 3, 'm')

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
        if any(s['vista'] == 'indice' for s in self.escenas):   # su ventana, un tic por paso y 'fruta' con la O
            t0 = self.primera('indice')['t0']
            ruido(sfx, t0, 0.05, 0.12, 2500); nota(sfx, t0, 500, 0.04, 'triangle', 0.25, hasta=900)
            for i, ts in enumerate(self.indice_t):
                nota(sfx, ts, tono_de(i + 3), 0.06, 'triangle', 0.35)
            if self.remate_t is not None:
                for i, fr in enumerate([880, 1174, 1568]):
                    nota(sfx, self.remate_t + i * 0.05, fr, 0.07, 'triangle', 0.25)
                nota(sfx, self.remate_t + 0.15, 1568, 0.18, 'square', 0.15)
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
            elif tipo == 'imprime':   # dos teclas
                nota(sfx, t0, 880, 0.03, 'square', 0.10); nota(sfx, t0 + 0.06, 1174, 0.04, 'square', 0.10)
            elif tipo == 'resultado':
                if e.get('ok', True):   # 'win'
                    for i, fr in enumerate([523, 659, 784, 1046, 784, 1046]):
                        nota(sfx, t0 + 0.05 + i * 0.09, fr, 0.09, 'square', 0.14)
                else:   # un zumbido grave
                    nota(sfx, t0 + 0.05, 196, 0.16, 'square', 0.13); nota(sfx, t0 + 0.24, 147, 0.3, 'square', 0.13)
