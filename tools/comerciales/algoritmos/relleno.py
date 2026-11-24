"""El relleno (flood fill): «Algoritmos en pixel» / «LeIA enseña programación» (24-nov-2026, para el 28-nov). El formato
está explicado en burbuja.py y la vista, en pintura.py: una casita en un lienzo de papel y, al lado, la pila.

La pared (19 casillas) se pinta paso por paso con la pila del código; luego el techo, más aprisa, para enseñar por qué
son cuatro vecinas y no ocho (las rayas del techo van en diagonal: con las esquinas, la pintura se saldría); y el cielo,
con una cola en vez de la pila: pinta en ondas, pero queda el mismo dibujo. La puerta también es blanca y nadie la
toca: no está conectada. El remate es verdad: Qix, en Daily Challenge, rellena cada pedazo del tablero con una pila
como ésta (cerrar(), en public/arcade/games/qix.js) para saber cuáles no tienen al bicho.
"""

CLAVE = 'relleno'
VISTA = 'pintura'
TITULO = {'es': 'EL RELLENO (FLOOD FILL)', 'en': 'FLOOD FILL'}
EPISODIO = {'es': 'Recorrer: el relleno', 'en': 'Traversal: flood fill'}   # el lema de la tarjeta final
ARCHIVO = 'relleno.js'
RUTA = {'es': '/aprende/algoritmos/relleno', 'en': '/en/learn/algoritmos/relleno'}

# El mismo de la lección (src/lib/aprende/algoritmos/a03-recorrer.ts, RELLENO): si cambia uno, cambia el otro.
# `mapa` (filas de letras) y lados(y, x) (arriba, derecha, abajo, izquierda) van sólo en la lección.
CODIGO = '''function rellenar(f, c, nuevo) {
  const viejo = mapa[f][c];
  if (viejo === nuevo) return;
  const pila = [[f, c]];
  mapa[f][c] = nuevo;
  while (pila.length > 0) {
    const [y, x] = pila.pop();
    for (const [i, j] of lados(y, x))
      if (mapa[i]?.[j] === viejo) {
        mapa[i][j] = nuevo;
        pila.push([i, j]);
      }
  }
}'''

# el de la lección: 'X' la raya negra, '.' el papel
LIENZO = ['.............',
          '......X......',
          '.....X.X.....',
          '....X...X....',
          '...X.....X...',
          '..XXXXXXXXX..',
          '..X.......X..',
          '..X.XXX...X..',
          '..X.X.X...X..',
          '..X.X.X...X..',
          '..XXXXXXXXX..']
ARREGLO = LIENZO
VARIABLE = ('', 'c', '{}')   # sin contadores: la vista no los dibuja
# dónde se pica cada vez y con qué color de la paleta; la puerta es la casilla blanca que no está conectada
PARED, TECHO, CIELO, PUERTA = (6, 6), (4, 6), (0, 0), (8, 5)
COLOR = {'pared': 'orange', 'techo': 'red', 'cielo': 'lblue'}
ROTULOS = {'pila': {'es': 'PILA', 'en': 'STACK'}, 'cima': {'es': '◀ sale', 'en': '◀ next'},
           'cola': {'es': 'CON UNA COLA', 'en': 'WITH A QUEUE'}, 'ondas': {'es': 'EN ONDAS', 'en': 'IN WAVES'},
           'casillas': {'es': '{} CASILLAS', 'en': '{} CELLS'}, 'igual': {'es': 'EL MISMO DIBUJO', 'en': 'SAME PICTURE'},
           'vacia': {'es': 'VACÍA', 'en': 'EMPTY'}}


def lados(c):
    """Los de la lección: arriba, derecha, abajo, izquierda (también los que caen fuera)."""
    y, x = c
    return [(y - 1, x), (y, x + 1), (y + 1, x), (y, x - 1)]


def es(m, c):
    """Lo que hay en la casilla, o None si cae fuera del lienzo (undefined, en el código)."""
    y, x = c
    return m[y][x] if 0 <= y < len(m) and 0 <= x < len(m[0]) else None


def con_pila(m, ini, quien):
    """Lo mismo que CODIGO, paso por paso."""
    viejo, nuevo, n = es(m, ini), quien, 1
    yield {'tipo': 'clic', 'lineas': [2], 'color': 'linea', 'c': ini, 'pinta': COLOR[quien]}
    m[ini[0]][ini[1]] = nuevo; pila = [ini]
    yield {'tipo': 'empieza', 'lineas': [4, 5], 'color': 'mete', 'c': ini}
    while pila:
        c = pila.pop()
        yield {'tipo': 'sale', 'lineas': [7], 'color': 'saca', 'c': c}
        for v in lados(c):
            if es(m, v) != viejo:
                yield {'tipo': 'ya', 'lineas': [9], 'color': 'mal', 'c': v, 'fuera': es(m, v) is None}
                continue
            m[v[0]][v[1]] = nuevo; pila.append(v); n += 1
            yield {'tipo': 'entra', 'lineas': [10, 11], 'color': 'mete', 'c': v}
    yield {'tipo': 'termina', 'lineas': [6], 'color': 'fija', 'n': n}


def en_ondas(m, ini, quien):
    """El mismo relleno con una cola: se pinta capa por capa (cada paso, una capa entera)."""
    viejo, nuevo = es(m, ini), quien
    yield {'tipo': 'clic', 'lineas': [], 'c': ini, 'pinta': COLOR[quien], 'cola': True}
    m[ini[0]][ini[1]] = nuevo; capa, d, n = [ini], 0, 0
    while capa:
        n += len(capa)
        yield {'tipo': 'onda', 'lineas': [], 'cs': list(capa), 'd': d}
        sig = []
        for c in capa:
            for v in lados(c):
                if es(m, v) == viejo:
                    m[v[0]][v[1]] = nuevo; sig.append(v)
        capa, d = sig, d + 1
    yield {'tipo': 'termina', 'lineas': [], 'n': n, 'cola': True}


def pasos(_):
    m = [list(f) for f in LIENZO]; nombrada = False
    for e in con_pila(m, PARED, 'pared'):
        if e['tipo'] == 'ya' and e['c'] == PARED and not nombrada:   # la que ya se pintó: LeIA la nombra
            e['peso'] = 1.8; nombrada = True
        yield e
    yield from con_pila(m, TECHO, 'techo')
    yield from en_ondas(m, CIELO, 'cielo')


# cuántos pasos lleva cada renglón del guion
_EV = list(pasos(LIENZO))
_CLIC = [i for i, e in enumerate(_EV) if e['tipo'] == 'clic']
_FIN = [i for i, e in enumerate(_EV) if e['tipo'] == 'termina']
_SALE = [i for i, e in enumerate(_EV) if e['tipo'] == 'sale']
TROZOS = [_SALE[0], _SALE[1] - _SALE[0], _SALE[2] - _SALE[1], _FIN[0] - _SALE[2], 1,
          _CLIC[2] - _CLIC[1], len(_EV) - _CLIC[2]]
assert sum(TROZOS) == len(_EV)
N_PARED, N_TECHO, N_CIELO = (_EV[i]['n'] for i in _FIN)
assert (N_PARED, N_TECHO, N_CIELO) == (19, 9, 73), (N_PARED, N_TECHO, N_CIELO)
assert next(e for e in _EV[_SALE[0]:] if e['tipo'] == 'ya')['c'] == (5, 6)   # la raya de arriba de la pared

RESALTA = [([2], 0.05, 'linea'), ([8], 0.45, 'saca'), ([10, 11], 0.72, 'mete')]
RESALTA_FIN = [([6, 7], 0.05, 'saca'), ([9], 0.4, 'mal'), ([10, 11], 0.7, 'mete')]

GUION = {'es': [
    {'vista': 'inicio', 'cara': 'feliz', 'dice': '¿Cómo sabe el bote de pintura hasta dónde pintar?'},
    {'vista': 'codigo', 'cara': 'pensando', 'resalta': RESALTA,
     'dice': 'Se llama relleno: pinta una casilla y luego mira a sus cuatro vecinas.'},
    {'pasos': TROZOS[0], 'cara': 'normal', 'dice': 'Anota el color viejo, pinta la primera y la mete a una pila.'},
    {'pasos': TROZOS[1], 'cara': 'feliz', 'dice': 'Saca la de arriba: las vecinas blancas se pintan y entran. La raya negra, no.'},
    {'pasos': TROZOS[2], 'cara': 'pensando', 'dice': 'Y la que ya se pintó no es del color viejo: nadie entra dos veces.'},
    {'pasos': TROZOS[3], 'cara': 'normal', 'dice': 'Como es una pila, se va a lo hondo por un lado y luego regresa por lo que dejó.'},
    {'pasos': TROZOS[4], 'cara': 'pensando', 'dur': 5.0,
     'dice': 'Pila vacía: 19 casillas. La puerta también es blanca, pero no está conectada.',
     'voz': 'Pila vacía: diecinueve casillas. La puerta también es blanca, pero no está conectada.'},
    {'pasos': TROZOS[5], 'cara': 'normal',
     'dice': 'El techo: sólo cuatro vecinas. Con diagonales, la pintura se saldría por las esquinas.'},
    {'pasos': TROZOS[6], 'cara': 'sorpresa', 'dice': '¿Y con una cola? Pinta en ondas, pero el dibujo queda igual.'},
    {'vista': 'codigo', 'resalta': RESALTA_FIN, 'cara': 'pensando',
     'dice': 'Qix, en Daily Challenge, rellena así el tablero para saber qué pedazo es tuyo.',
     'voz': 'Kix, en Daily Challenge, rellena así el tablero para saber qué pedazo es tuyo.'},
    {'vista': 'enlace', 'cara': 'guino', 'dice': 'Pruébalo tú en la lección: ayotl.dev/aprende',
     'voz': 'Pruébalo tú en la lección: áyotl punto dev, diagonal aprende.'},
    {'final': True, 'cara': 'guino', 'dice': '¿Ya estás suscrito? Síguenos para más.'},
], 'en': [
    {'vista': 'inicio', 'cara': 'feliz', 'dice': 'How does the paint bucket know where to stop?'},
    {'vista': 'codigo', 'cara': 'pensando', 'resalta': RESALTA,
     'dice': "It's called flood fill: paint one cell, then look at its four neighbors."},
    {'pasos': TROZOS[0], 'cara': 'normal', 'dice': 'It notes the old color, paints the first cell and pushes it onto a stack.'},
    {'pasos': TROZOS[1], 'cara': 'feliz', 'dice': 'Pop the top one: white neighbors get painted and pushed. The black line stays out.'},
    {'pasos': TROZOS[2], 'cara': 'pensando', 'dice': "A painted cell isn't the old color anymore, so nobody goes in twice."},
    {'pasos': TROZOS[3], 'cara': 'normal', 'dice': "It's a stack, so it dives deep on one side, then comes back for what it left."},
    {'pasos': TROZOS[4], 'cara': 'pensando', 'dur': 5.0,
     'dice': "Empty stack: 19 cells. The door is white too, but it isn't connected.",
     'voz': "Empty stack: nineteen cells. The door is white too, but it isn't connected."},
    {'pasos': TROZOS[5], 'cara': 'normal',
     'dice': 'The roof: only four neighbors. With diagonals, the paint would leak out at the corners.'},
    {'pasos': TROZOS[6], 'cara': 'sorpresa', 'dice': 'And with a queue? It paints in waves, but you get the same picture.'},
    {'vista': 'codigo', 'resalta': RESALTA_FIN, 'cara': 'pensando',
     'dice': 'Qix, in Daily Challenge, fills the board like this to know which piece is yours.',
     'voz': 'Kicks, in Daily Challenge, fills the board like this to know which piece is yours.'},
    {'vista': 'enlace', 'cara': 'guino', 'dice': 'Try it yourself in the lesson: ayotl.dev/en/learn',
     'voz': 'Try it yourself in the lesson, at Ah-yotl dot dev.'},
    {'final': True, 'cara': 'guino', 'dice': 'Are you subscribed yet? Follow us for more.'},
]}
