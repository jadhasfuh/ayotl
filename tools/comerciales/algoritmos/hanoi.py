"""Las Torres de Hanói (la recursión): «Algoritmos en pixel» / «LeIA enseña programación» (27-nov-2026, para el 2-dic). El
formato está explicado en burbuja.py y la vista, en torres.py: tres postes con sus discos y, a la derecha, la pila de llamadas.

El gancho es una torre de cinco a media solución (los cuatro chicos ya en B): el grande cruza y los cuatro lo siguen. Luego
las dos reglas con tres discos (uno que intenta ir sobre uno más chico y no puede), el truco con los dos de arriba movidos
de bloque, y el programa de verdad: cada llamada entra a la pila, la de cero discos es el caso base, y la pila se vacía
con los siete movimientos. Al final, la tabla de 2ⁿ − 1 y la leyenda de los 64 discos.

Todo lo calcula correr(), que hace lo mismo que CODIGO; aquí abajo se comprueba que n discos dan 2ⁿ − 1 movimientos, que
ninguno pone un disco grande sobre uno chico, que la torre acaba entera en el destino y que la pila nunca pasa de n + 1.

Los hechos (Wikipedia en inglés, «Tower of Hanoi», y en español, «Torres de Hanói», consultadas el 27-nov-2026): la inventó
el matemático francés Édouard Lucas en 1883 (en las dos); la leyenda que venía con el juego: unos sacerdotes en un templo
mueven 64 discos de oro y, cuando acaben, se acaba el mundo; a un movimiento por segundo son 2⁶⁴ − 1 segundos, unos 585 mil
millones de años (la inglesa; la española cuenta otra versión de la leyenda, con 100 discos, y no da esa cifra: va la de
64, que es la del folleto de Lucas). La cuenta de los años se comprueba abajo.
"""
import itertools

CLAVE = 'hanoi'
VISTA = 'torres'
TITULO = {'es': 'LAS TORRES DE HANÓI', 'en': 'THE TOWER OF HANOI'}
EPISODIO = {'es': 'Recursión: Torres de Hanói', 'en': 'Recursion: Tower of Hanoi'}   # el lema de la tarjeta final (caben 26 letras)
ARCHIVO = 'hanoi.js'
RUTA = {'es': '/aprende/algoritmos/torres-de-hanoi', 'en': '/en/learn/algoritmos/torres-de-hanoi'}

# El mismo de la lección (src/lib/aprende/algoritmos/a05-recursion.ts, HANOI): si cambia uno, cambia el otro.
# mover(n, desde, hasta), que imprime el movimiento, va sólo en la lección. El primer renglón mide 38 caracteres: a 24 px
# caben 38 (renderizador.py lo revisa).
CODIGO = '''function hanoi(n, desde, hasta, aux) {
  if (n === 0) return;
  hanoi(n - 1, desde, aux, hasta);
  mover(n, desde, hasta);
  hanoi(n - 1, aux, hasta, desde);
}'''

ARREGLO = []
VARIABLE = ('', 'n', '{}')   # sin contadores de los de siempre: la vista lleva los suyos
ROTULOS = {'movimientos': {'es': 'MOVIMIENTOS', 'en': 'MOVES'}, 'pila': {'es': 'PILA DE LLAMADAS', 'en': 'CALL STACK'},
           'vacia': {'es': 'VACÍA', 'en': 'EMPTY'}, 'base': {'es': 'CASO BASE', 'en': 'BASE CASE'},
           'regla1': {'es': ['1. UN DISCO', 'A LA VEZ'], 'en': ['1. ONE DISK', 'AT A TIME']},
           'regla2': {'es': ['2. NUNCA UNO', 'GRANDE SOBRE', 'UNO CHICO'], 'en': ['2. NEVER A', 'BIG ONE ON', 'A SMALL ONE']},
           'oro': {'es': '64 DISCOS DE ORO', 'en': '64 GOLDEN DISKS'},
           'lucas': {'es': 'ÉDOUARD LUCAS · 1883', 'en': 'ÉDOUARD LUCAS · 1883'},
           'por_segundo': {'es': 'UN DISCO POR SEGUNDO:', 'en': 'ONE MOVE PER SECOND:'},
           'segundos': {'es': 'SEGUNDOS', 'en': 'SECONDS'},
           'anios': {'es': '≈ 585 MIL MILLONES DE AÑOS', 'en': '≈ 585 BILLION YEARS'}}


def movimientos(n, desde='A', hasta='C', aux='B'):
    """Los movimientos (disco, desde, hasta) que hace CODIGO, uno por uno (perezoso: con 64 no se acaba nunca)."""
    if n == 0:
        return
    yield from movimientos(n - 1, desde, aux, hasta)
    yield (n, desde, hasta)
    yield from movimientos(n - 1, aux, hasta, desde)


def jugar(n, movs, postes=None):
    """Los postes después de esos movimientos; truena si alguno rompe una regla."""
    postes = postes or {'A': list(range(n, 0, -1)), 'B': [], 'C': []}
    for d, de, a in movs:
        assert postes[de] and postes[de][-1] == d, (d, de, postes)            # sólo el de arriba, uno a la vez
        assert not postes[a] or postes[a][-1] > d, (d, a, postes)             # nunca uno grande sobre uno chico
        postes[a].append(postes[de].pop())
    return postes


def correr(n, desde, hasta, aux, linea, ev):
    """Lo mismo que CODIGO, paso por paso, con la pila de llamadas: `llama` entra a la pila (desde la línea que llama), `base`
    es hanoi(0), que no hace nada y sale, `disco` es mover() y `vuelve`, el fin de una llamada que sí movió."""
    ev.append({'tipo': 'llama', 'n': n, 'desde': desde, 'hasta': hasta, 'aux': aux, 'lineas': [linea], 'color': 'mete',
               **({'peso': 0.5} if n == 0 else {})})
    if n == 0:
        ev.append({'tipo': 'base', 'lineas': [2], 'color': 'lee'})
        return
    correr(n - 1, desde, aux, hasta, 3, ev)
    ev.append({'tipo': 'disco', 'n': n, 'desde': desde, 'hasta': hasta, 'lineas': [4], 'color': 'compara'})
    correr(n - 1, aux, hasta, desde, 5, ev)
    ev.append({'tipo': 'vuelve', 'n': n, 'lineas': [6], 'color': 'saca'})


# lo que se dice: 2ⁿ − 1 movimientos, sin romper reglas, y la torre entera en el destino
for _n in range(1, 13):
    _m = list(movimientos(_n))
    assert len(_m) == 2 ** _n - 1
    assert jugar(_n, _m) == {'A': [], 'B': [], 'C': list(range(_n, 0, -1))}
_ev = []
correr(3, 'A', 'C', 'B', 1, _ev)
assert [(e['n'], e['desde'], e['hasta']) for e in _ev if e['tipo'] == 'disco'] == list(movimientos(3))
assert sum(e['tipo'] == 'llama' for e in _ev) == 2 ** 4 - 1          # 15 llamadas: 7 que mueven y 8 de cero discos
_alto = _max = 0
for _e in _ev:
    _alto += {'llama': 1, 'base': -1, 'vuelve': -1}.get(_e['tipo'], 0); _max = max(_max, _alto)
assert _alto == 0 and _max == 3 + 1                                  # la pila nunca pasa de n + 1
# la leyenda: 2⁶⁴ − 1 segundos, en años de 365.25 días, son unos 585 mil millones
SEGUNDOS_64 = 2 ** 64 - 1
assert SEGUNDOS_64 == 18_446_744_073_709_551_615 and round(SEGUNDOS_64 / (365.25 * 86400) / 1e9) == 585
assert list(itertools.islice(movimientos(64), 3)) == [(1, 'A', 'B'), (2, 'A', 'C'), (1, 'B', 'C')]

GANCHO_N, GANCHO_DESDE = 5, 15     # el gancho: cinco discos, con los quince primeros ya hechos (los cuatro chicos en B)
LEYENDA_N = 64
TABLA = {'columnas': [{'es': 'DISCOS', 'en': 'DISKS'}, {'es': 'MOVIMIENTOS', 'en': 'MOVES'}],
         'filas': [[n, 2 ** n - 1] for n in (3, 4, 10, 20)], 'colores': ['white', 'yellow']}
COMPLEJIDAD = 'O(2^n)'     # no se dibuja así: la vista pinta 2ⁿ − 1 con su exponente
LEYENDA = {'es': 'CADA DISCO MÁS: EL DOBLE + 1', 'en': 'EACH EXTRA DISK: DOUBLE + 1'}


def pasos(_):
    # el gancho: la torre de cinco a media solución, hasta el final
    m5 = list(movimientos(GANCHO_N))
    yield {'tipo': 'torre', 'n': GANCHO_N, 'postes': jugar(GANCHO_N, m5[:GANCHO_DESDE]), 'hechos': GANCHO_DESDE,
           'gancho': True, 'cuenta': True, 'lineas': [], 'peso': 0.3}
    for i, (d, de, a) in enumerate(m5[GANCHO_DESDE:]):
        yield {'tipo': 'disco', 'n': d, 'desde': de, 'hasta': a, 'lineas': [], 'completa': i == len(m5) - GANCHO_DESDE - 1}
    # las reglas, con tres: el chico va a B, el mediano no puede ir encima, y el chico regresa
    yield {'tipo': 'torre', 'n': 3, 'reglas': True, 'lineas': []}
    yield {'tipo': 'disco', 'n': 1, 'desde': 'A', 'hasta': 'B', 'suma': False, 'regla': 1, 'lineas': []}
    yield {'tipo': 'prohibe', 'n': 2, 'desde': 'A', 'hasta': 'B', 'regla': 2, 'lineas': []}
    yield {'tipo': 'disco', 'n': 1, 'desde': 'B', 'hasta': 'A', 'suma': False, 'lineas': [], 'peso': 1.2}
    # el truco: los dos de arriba de bloque, el grande, y los dos encima (las líneas 3, 4 y 5)
    yield {'tipo': 'bloque', 'k': 2, 'desde': 'A', 'hasta': 'B', 'rotulo': 'n – 1', 'lineas': [3], 'color': 'mete'}
    yield {'tipo': 'bloque', 'k': 1, 'desde': 'A', 'hasta': 'C', 'rotulo': 'n', 'lineas': [4], 'color': 'compara'}
    yield {'tipo': 'bloque', 'k': 2, 'desde': 'B', 'hasta': 'C', 'rotulo': 'n – 1', 'lineas': [5], 'color': 'mete'}
    # el programa de verdad, con la pila de llamadas
    yield {'tipo': 'torre', 'n': 3, 'pila': True, 'cuenta': True, 'lineas': []}
    ev = []
    correr(3, 'A', 'C', 'B', 1, ev)
    ev[max(i for i, e in enumerate(ev) if e['tipo'] == 'disco')]['completa'] = True
    yield from ev


# cuántos pasos lleva cada renglón del guion
_EV = list(pasos(None))
_TORRE = [i for i, e in enumerate(_EV) if e['tipo'] == 'torre']
_BLOQUE = next(i for i, e in enumerate(_EV) if e['tipo'] == 'bloque')
_BASE = [i for i, e in enumerate(_EV) if e['tipo'] == 'base']
_VUELVE = [i for i, e in enumerate(_EV) if e['tipo'] == 'vuelve']
_DISCO = [i for i, e in enumerate(_EV) if e['tipo'] == 'disco' and i > _TORRE[2]]
TROZOS = [_TORRE[1],                         # el gancho
          _BLOQUE - _TORRE[1],               # las reglas
          _TORRE[2] - _BLOQUE,               # el truco
          3,                                 # la torre otra vez, hanoi(3) y hanoi(2)
          _BASE[0] - _TORRE[2] - 2,          # hanoi(1), hanoi(0) y el caso base
          _VUELVE[2] - _BASE[0],             # hanoi(1) mueve el chico y sale; hanoi(2) mueve el suyo, el chico encima, y sale
          len(_EV) - _VUELVE[2] - 1]         # el grande y los dos de arriba otra vez
assert sum(TROZOS) == len(_EV)
assert _EV[_TORRE[2] + 3]['tipo'] == 'llama' and _EV[_TORRE[2] + 3]['n'] == 1 and _DISCO[0] == _BASE[0] + 1
assert _EV[_VUELVE[2]]['n'] == 2 and _EV[_VUELVE[2] + 1]['tipo'] == 'disco' and _EV[_VUELVE[2] + 1]['n'] == 3

RESALTA_FIN = [([2], 0.05, 'lee'), ([3], 0.3, 'mete'), ([4], 0.52, 'compara'), ([5], 0.72, 'mete')]
# la tabla: las filas de 3 y 4 discos con «el doble y uno» (7 y 15); la fórmula, con «2 a la n», y las de 10 y 20 tras ella
CUENTA = {'filas': [(0, 0.04), (1, 0.3), (2, 0.66), (3, 0.78)], 'complejidad': 0.5}

GUION = {'es': [
    {'pasos': TROZOS[0], 'cara': 'sorpresa', 'dice': 'Pasar esta torre a otro poste parece fácil… hasta que ves las reglas.'},
    {'pasos': TROZOS[1], 'cara': 'normal', 'dice': 'Un disco a la vez, y nunca uno grande sobre uno chico.'},
    {'pasos': TROZOS[2], 'cara': 'pensando', 'dice': 'El truco: mueve los 2 de arriba al otro poste, luego el grande, y los 2 encima.',
     'voz': 'El truco: mueve los dos de arriba al otro poste, luego el grande, y los dos encima.'},
    {'pasos': TROZOS[3], 'cara': 'feliz', 'dice': '¿Y cómo mueve los 2? ¡Igual! La función se llama a sí misma.',
     'voz': '¿Y cómo mueve los dos? ¡Igual! La función se llama a sí misma.'},
    {'pasos': TROZOS[4], 'cara': 'pensando',
     'dice': 'Cada llamada espera en la pila. Con cero discos, nada que mover: es el caso base.'},
    {'pasos': TROZOS[5], 'cara': 'feliz', 'dice': 'La de 1 mueve el chico; la de 2, el suyo, y el chico encima.',
     'voz': 'La de uno mueve el chico; la de dos, el suyo, y el chico encima.'},
    {'pasos': TROZOS[6], 'cara': 'feliz', 'dice': 'El grande va a C, y los chicos lo siguen igual.',
     'voz': 'El grande va a la C, y los chicos lo siguen igual.'},
    {'cara': 'sorpresa', 'dice': '¡Pila vacía: 7 movimientos!', 'voz': '¡Pila vacía: siete movimientos!'},
    {'vista': 'cuenta', **CUENTA, 'cara': 'pensando',
     'dice': 'Cada disco más pide el doble y uno: son 2 a la n, menos 1.',
     'voz': 'Cada disco más pide el doble y uno: son dos a la ene, menos uno.'},
    {'vista': 'leyenda', 'cara': 'normal',
     'dice': 'Édouard Lucas las inventó en 1883, con una leyenda: en un templo mueven 64 discos de oro.',
     'voz': 'Eduar Lucas las inventó en mil ochocientos ochenta y tres, con una leyenda: en un templo mueven sesenta y cuatro discos de oro.'},
    {'vista': 'leyenda', 'segundos': 0.36, 'anios': 0.66, 'cara': 'sorpresa',
     'dice': 'Cuando acaben, se acaba el mundo. A un disco por segundo: ¡585 mil millones de años!',
     'voz': 'Cuando acaben, se acaba el mundo. A un disco por segundo: ¡quinientos ochenta y cinco mil millones de años!'},
    {'vista': 'codigo', 'resalta': RESALTA_FIN, 'cara': 'guino', 'dice': 'Y todo cabe en cuatro renglones.'},
    {'vista': 'enlace', 'cara': 'guino', 'dice': 'Pruébalo tú en la lección: ayotl.dev/aprende',
     'voz': 'Pruébalo tú en la lección: áyotl punto dev, diagonal aprende.'},
    {'final': True, 'cara': 'guino', 'dice': '¿Ya estás suscrito? Síguenos para más.'},
], 'en': [
    {'pasos': TROZOS[0], 'cara': 'sorpresa', 'dice': 'Moving this tower to another peg looks easy… until you see the rules.'},
    {'pasos': TROZOS[1], 'cara': 'normal', 'dice': 'One disk at a time, and never a big one on a small one.'},
    {'pasos': TROZOS[2], 'cara': 'pensando', 'dice': 'The trick: move the top 2 to the other peg, then the big one, then the 2 back on top.',
     'voz': 'The trick: move the top two to the other peg, then the big one, then the two back on top.'},
    {'pasos': TROZOS[3], 'cara': 'feliz', 'dice': 'And how does it move the 2? The same way! The function calls itself.',
     'voz': 'And how does it move the two? The same way! The function calls itself.'},
    {'pasos': TROZOS[4], 'cara': 'pensando',
     'dice': "Each call waits on the stack. Zero disks, nothing to move: that's the base case."},
    {'pasos': TROZOS[5], 'cara': 'feliz', 'dice': 'Call 1 moves the small disk; call 2 moves its own, then the small one on top.',
     'voz': 'Call one moves the small disk; call two moves its own, then the small one on top.'},
    {'pasos': TROZOS[6], 'cara': 'feliz', 'dice': 'The big one goes to C, and the small ones follow the same way.'},
    {'cara': 'sorpresa', 'dice': 'Empty stack: 7 moves!', 'voz': 'Empty stack: seven moves!'},
    {'vista': 'cuenta', **CUENTA, 'cara': 'pensando',
     'dice': 'Each extra disk takes double, plus one: 2 to the n, minus 1.',
     'voz': 'Each extra disk takes double, plus one: two to the n, minus one.'},
    {'vista': 'leyenda', 'cara': 'normal',
     'dice': 'Édouard Lucas invented it in 1883, with a legend: in a temple, priests move 64 golden disks.',
     'voz': 'Édouard Lucas invented it in eighteen eighty-three, with a legend: in a temple, priests move sixty-four golden disks.'},
    {'vista': 'leyenda', 'segundos': 0.36, 'anios': 0.66, 'cara': 'sorpresa',
     'dice': 'When they finish, the world ends. At one move per second: 585 billion years!',
     'voz': 'When they finish, the world ends. At one move per second: five hundred eighty-five billion years!'},
    {'vista': 'codigo', 'resalta': RESALTA_FIN, 'cara': 'guino', 'dice': 'And it all fits in four lines.'},
    {'vista': 'enlace', 'cara': 'guino', 'dice': 'Try it yourself in the lesson: ayotl.dev/en/learn',
     'voz': 'Try it yourself in the lesson, at Ah-yotl dot dev.'},
    {'final': True, 'cara': 'guino', 'dice': 'Are you subscribed yet? Follow us for more.'},
]}
