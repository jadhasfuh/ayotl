"""El Juego de la vida (Conway): «Algoritmos en pixel» / «LeIA enseña programación» (24-nov-2026, para el 30-nov). El formato
está explicado en burbuja.py y la vista, en celulas.py: un tablero de casillas vivas y muertas, generación por generación.

Tres en fila (el parpadeador), con sus vecinas contadas una por una; el bloque, que no cambia; el planeador, que camina; y
la pistola de planeadores de Gosper, que dispara uno cada 30 generaciones. Todo lo calcula siguiente(), la misma regla de
la lección; que el planeador quede igual una casilla más abajo y a la derecha cada cuatro generaciones y que la pistola
repita cada 30 se comprueba aquí abajo. Los hechos: John Conway; Martin Gardner lo publicó en Scientific American en octubre
de 1970; Bill Gosper encontró la pistola ese mismo noviembre (Wikipedia en inglés, «Conway's Game of Life» y «Gun (cellular
automaton)»).
"""

CLAVE = 'vida'
VISTA = 'celulas'
TITULO = {'es': 'EL JUEGO DE LA VIDA', 'en': 'THE GAME OF LIFE'}
EPISODIO = {'es': 'El Juego de la vida', 'en': 'The Game of Life'}   # el lema de la tarjeta final (caben 26 letras)
ARCHIVO = 'vida.js'
RUTA = {'es': '/aprende/algoritmos/juego-de-la-vida', 'en': '/en/learn/algoritmos/juego-de-la-vida'}

# El mismo de la lección (src/lib/aprende/algoritmos/a04-simular.ts, SIGUIENTE): si cambia uno, cambia el otro.
# ocho(y, x), las ocho de alrededor, va sólo en la lección.
CODIGO = '''function siguiente(m) {
  return m.map((fila, y) =>
    fila.map((viva, x) => {
      let n = 0;
      for (const [i, j] of ocho(y, x))
        n += m[i]?.[j] ?? 0;
      if (n === 3) return 1;
      return viva && n === 2 ? 1 : 0;
    }));
}'''

ARREGLO = []
VARIABLE = ('', 'c', '{}')   # sin contadores de los de siempre: la vista lleva los suyos
ROTULOS = {'gen': {'es': 'GENERACIÓN', 'en': 'GENERATION'}, 'vivas': {'es': 'VIVAS', 'en': 'ALIVE'},
           'nace': {'es': 'NACE', 'en': 'BORN'}, 'sigue': {'es': 'SIGUE', 'en': 'STAYS'}, 'muere': {'es': 'MUERE', 'en': 'DIES'},
           'vecinas': {'es': 'VECINAS', 'en': 'NEIGHBORS'},
           'quieto': {'es': 'NO CAMBIA', 'en': 'NO CHANGE'}, 'planeador': {'es': 'EL PLANEADOR', 'en': 'THE GLIDER'},
           'pistola': {'es': 'UNA PISTOLA DE PLANEADORES', 'en': 'A GLIDER GUN'}}


def ocho(y, x):
    return [(y + i, x + j) for i in (-1, 0, 1) for j in (-1, 0, 1) if i or j]


def vecinas(vivas, c):
    return sum(v in vivas for v in ocho(*c))


def siguiente(vivas, filas, cols):
    """Lo mismo que CODIGO, con el tablero como conjunto de casillas vivas (fuera del tablero no hay nadie)."""
    nuevo = set()
    for y in range(filas):
        for x in range(cols):
            n = vecinas(vivas, (y, x))
            if n == 3 or ((y, x) in vivas and n == 2):
                nuevo.add((y, x))
    return nuevo


def dibujo(filas, dy=0, dx=0):
    return {(y + dy, x + dx) for y, f in enumerate(filas) for x, c in enumerate(f) if c == 'o'}


PARPADEADOR = dibujo(['ooo'])
BLOQUE = dibujo(['oo', 'oo'])
PLANEADOR = dibujo(['.o.', '..o', 'ooo'])
# la pistola de Gosper, 36 x 9
PISTOLA = dibujo(['........................o...........',
                  '......................o.o...........',
                  '............oo......oo............oo',
                  '...........o...o....oo............oo',
                  'oo........o.....o...oo..............',
                  'oo........o...o.oo....o.o...........',
                  '..........o.....o.......o...........',
                  '...........o...o....................',
                  '............oo......................'])

# lo que se dice de ellos
_v = set(PLANEADOR)
for _ in range(4):
    _v = siguiente({(y + 3, x + 3) for y, x in _v}, 12, 12); _v = {(y - 3, x - 3) for y, x in _v}
assert _v == {(y + 1, x + 1) for y, x in PLANEADOR}                     # una más abajo y una más a la derecha
_g = {(y + 12, x + 2) for y, x in PISTOLA}; _h = set(_g); _cuantos = []
for _k in range(90):
    _h = siguiente(_h, 120, 120); _cuantos.append(len(_h))
assert len(PISTOLA) == 36 and _cuantos[29] == 41 and _cuantos[59] == 46 and _cuantos[89] == 51   # cinco más (un planeador) cada 30

MUNDO = (80, 110)
PISTOLA_TABLERO = (23, 38)      # filas y columnas: con casillas de 26 px llena el ancho
CHICO = (9, 17)                 # el del parpadeador y el bloque
PLAN = (11, 17)                 # el del planeador


def pasos(_):
    def caso(vivas, dim, rotulo=None):
        return {'tipo': 'caso', 'lineas': [1], 'color': 'linea', 'vivas': sorted(vivas), 'filas': dim[0], 'cols': dim[1], 'rotulo': rotulo}

    def genera(vivas, dim, g, lineas=(), mundo=None):
        # `mundo`: el tablero de la pistola es más grande que lo que se ve, para que los planeadores sigan de largo
        n = siguiente(vivas, *(mundo or dim))
        se_ve = lambda cs: sorted(c for c in cs if c[0] < dim[0] and c[1] < dim[1])
        return n, {'tipo': 'genera', 'lineas': list(lineas), 'color': 'mete', 'nacen': se_ve(n - vivas), 'mueren': se_ve(vivas - n), 'g': g, 'n': len(se_ve(n))}

    # el gancho: la pistola, ya andando
    v = {(y + 2, x + 1) for y, x in PISTOLA}
    for _k in range(50):
        v = siguiente(v, *MUNDO)
    yield dict(caso(v, PISTOLA_TABLERO), gancho=True, lineas=[])
    for g in range(1, 33):
        v, e = genera(v, PISTOLA_TABLERO, 50 + g, mundo=MUNDO); yield dict(e, lineas=[])
    # el parpadeador, casilla por casilla (y el bloque a su derecha, que sale después)
    par = {(4, x) for x in (3, 4, 5)}
    v = set(par)
    yield caso(v, CHICO)
    for c in ((4, 4), (4, 3), (4, 5), (3, 4), (5, 4)):
        n = vecinas(v, c); viva = c in v
        fin = 'nace' if n == 3 and not viva else 'sigue' if n == 3 or (viva and n == 2) else 'muere'
        yield {'tipo': 'mira', 'lineas': [5, 6], 'color': 'lee', 'c': c, 'n': n, 'fin': fin}
        yield {'tipo': 'dice', 'lineas': [7] if n == 3 else [8], 'color': {'nace': 'mete', 'sigue': 'lee', 'muere': 'mal'}[fin], 'c': c, 'n': n, 'fin': fin}
    yield {'tipo': 'linea', 'lineas': [2, 3], 'color': 'linea', 'peso': 1.3}   # todavía el viejo
    v, e = genera(v, CHICO, 1, [2, 3]); yield e
    for g in range(2, 8):
        v, e = genera(v, CHICO, g, [2, 3]); yield e
    # el bloque
    v = v | {(y + 4, x + 12) for y, x in BLOQUE}
    yield {'tipo': 'pone', 'lineas': [], 'cs': sorted((y + 4, x + 12) for y, x in BLOQUE), 'rotulo': 'quieto'}
    for g in range(8, 14):
        v, e = genera(v, CHICO, g, [2, 3]); yield e
    # el planeador
    v = {(y + 1, x + 1) for y, x in PLANEADOR}
    yield caso(v, PLAN, 'planeador')
    for g in range(1, 25):
        v, e = genera(v, PLAN, g, [2, 3]); yield e
    # la pistola, desde el principio
    v = {(y + 2, x + 1) for y, x in PISTOLA}
    yield caso(v, PISTOLA_TABLERO, 'pistola')
    for g in range(1, 121):
        v, e = genera(v, PISTOLA_TABLERO, g, [2, 3], MUNDO); yield e


# cuántos pasos lleva cada renglón del guion
_EV = list(pasos(None))
_CASO = [i for i, e in enumerate(_EV) if e['tipo'] == 'caso']
_PONE = next(i for i, e in enumerate(_EV) if e['tipo'] == 'pone')
_GEN1 = next(i for i, e in enumerate(_EV) if e['tipo'] == 'genera' and i > _CASO[1])
_TIROS = 64     # generaciones de la pistola en su primer renglón: se ven salir dos planeadores
TROZOS = [_CASO[1], 2, 1, 4, 4, 2, _PONE - _GEN1 - 1, _CASO[2] - _PONE, _CASO[3] - _CASO[2], 1 + _TIROS, len(_EV) - _CASO[3] - 1 - _TIROS]
assert sum(TROZOS) == len(_EV)

RESALTA = [([2, 3], 0.1, 'linea'), ([4, 5, 6], 0.6, 'lee')]
RESALTA_FIN = [([7], 0.25, 'mete'), ([8], 0.62, 'lee')]

GUION = {'es': [
    {'pasos': TROZOS[0], 'cara': 'sorpresa', 'dice': 'Este tablero se mueve solo. Nadie lo está jugando.'},
    {'vista': 'codigo', 'cara': 'pensando', 'resalta': RESALTA,
     'dice': 'Es el Juego de la vida, de John Conway: cada casilla está viva o muerta.',
     'voz': 'Es el Juego de la vida, de John Cónuey: cada casilla está viva o muerta.'},
    {'pasos': TROZOS[1], 'cara': 'normal', 'dice': 'Cada una mira a sus ocho vecinas y cuenta las vivas.'},
    {'pasos': TROZOS[2], 'cara': 'normal', 'dice': 'Con dos, se queda como está.'},
    {'pasos': TROZOS[3], 'cara': 'triste', 'dice': 'Con una o ninguna, muere de sola.'},
    {'pasos': TROZOS[4], 'cara': 'feliz', 'dice': 'Con tres, nace. Con más de tres, muere amontonada.'},
    {'pasos': TROZOS[5], 'cara': 'pensando', 'dice': 'Todas a la vez: el tablero nuevo se hace mirando el viejo.'},
    {'pasos': TROZOS[6], 'cara': 'feliz', 'dice': 'Y así, tres en fila giran para siempre.'},
    {'pasos': TROZOS[7], 'cara': 'normal', 'dice': 'Un cuadro de dos por dos no cambia nunca.'},
    {'pasos': TROZOS[8], 'cara': 'feliz', 'dice': 'Estas cinco caminan: cada cuatro generaciones, una casilla en diagonal.'},
    {'pasos': TROZOS[9], 'cara': 'sorpresa', 'dice': 'Y esto es una pistola: dispara un planeador cada 30 generaciones.',
     'voz': 'Y esto es una pistola: dispara un planeador cada treinta generaciones.'},
    {'pasos': TROZOS[10], 'cara': 'pensando', 'dice': 'Con piezas así, alguien ya armó una computadora adentro.'},
    {'vista': 'codigo', 'resalta': RESALTA_FIN, 'cara': 'guino', 'dice': 'Y todo sale de dos renglones: con tres, vive; con dos, sigue igual.'},
    {'vista': 'enlace', 'cara': 'guino', 'dice': 'Pruébalo tú en la lección: ayotl.dev/aprende',
     'voz': 'Pruébalo tú en la lección: áyotl punto dev, diagonal aprende.'},
    {'final': True, 'cara': 'guino', 'dice': '¿Ya estás suscrito? Síguenos para más.'},
], 'en': [
    {'pasos': TROZOS[0], 'cara': 'sorpresa', 'dice': 'This board moves on its own. Nobody is playing it.'},
    {'vista': 'codigo', 'cara': 'pensando', 'resalta': RESALTA,
     'dice': "It's John Conway's Game of Life: every cell is alive or dead."},
    {'pasos': TROZOS[1], 'cara': 'normal', 'dice': 'Each one looks at its eight neighbors and counts the live ones.'},
    {'pasos': TROZOS[2], 'cara': 'normal', 'dice': 'With two, it stays as it is.'},
    {'pasos': TROZOS[3], 'cara': 'triste', 'dice': 'With one or none, it dies of loneliness.'},
    {'pasos': TROZOS[4], 'cara': 'feliz', 'dice': 'With three, it is born. With more, it dies of crowding.'},
    {'pasos': TROZOS[5], 'cara': 'pensando', 'dice': 'All at once: the new board is built by looking only at the old one.'},
    {'pasos': TROZOS[6], 'cara': 'feliz', 'dice': 'And so three in a row keep spinning forever.'},
    {'pasos': TROZOS[7], 'cara': 'normal', 'dice': 'A two-by-two square never changes.'},
    {'pasos': TROZOS[8], 'cara': 'feliz', 'dice': 'These five can walk: one cell diagonally, every four generations.'},
    {'pasos': TROZOS[9], 'cara': 'sorpresa', 'dice': 'And this is a gun: it fires a glider every 30 generations.',
     'voz': 'And this is a gun: it fires a glider every thirty generations.'},
    {'pasos': TROZOS[10], 'cara': 'pensando', 'dice': 'With parts like these, someone has built a computer inside it.'},
    {'vista': 'codigo', 'resalta': RESALTA_FIN, 'cara': 'guino', 'dice': 'And it all comes from two lines: with three, alive; with two, no change.'},
    {'vista': 'enlace', 'cara': 'guino', 'dice': 'Try it yourself in the lesson: ayotl.dev/en/learn',
     'voz': 'Try it yourself in the lesson, at Ah-yotl dot dev.'},
    {'final': True, 'cara': 'guino', 'dice': 'Are you subscribed yet? Follow us for more.'},
]}
