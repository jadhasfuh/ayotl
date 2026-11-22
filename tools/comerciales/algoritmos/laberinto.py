"""El laberinto con búsqueda en anchura (BFS): «Algoritmos en pixel» / «LeIA enseña programación» (21-nov-2026,
para el 26-nov). El formato está explicado en burbuja.py y la vista, en rejilla.py: el laberinto a la izquierda, con
cada casilla visitada del color de su capa y su distancia, y a la derecha la cola entera (el arreglo `cola` con su
índice `cabeza`, el truco del episodio de la cola del 22-nov).

El laberinto (9 x 11) tiene dos caminos de la entrada a la salida: arriba una serpiente de 20 pasos y abajo un
pasillo de 12 con cuatro bolsas sin salida. La BFS los explora a la vez, capa por capa, y llega a la salida por el
de 12; luego el camino se dibuja de vuelta con `de` (de dónde vino cada casilla). El remate: una DFS con el mismo
orden de vecinos (arriba, derecha, abajo, izquierda) se mete primero por la serpiente y da 20; la BFS, por ir por
capas, siempre da el más corto en pasos.
"""

CLAVE = 'laberinto'
VISTA = 'rejilla'
TITULO = {'es': 'EL LABERINTO (BFS)', 'en': 'THE MAZE (BFS)'}
EPISODIO = {'es': 'Recorrer: el laberinto', 'en': 'Traversal: the maze'}   # el lema de la tarjeta final
ARCHIVO = 'laberinto.js'
RUTA = {'es': '/aprende/algoritmos/laberinto-bfs', 'en': '/en/learn/algoritmos/laberinto-bfs'}

# El mismo de la lección (src/lib/aprende/algoritmos/a03-recorrer.ts, BFS): si cambia uno, cambia el otro. Las
# casillas son textos "fila,columna" y vecinos(c) (sólo en la lección) da las abiertas de al lado, en este orden:
# arriba, derecha, abajo, izquierda. 16 renglones: sin contadores debajo (rejilla.py) caben con el laberinto.
CODIGO = '''function bfs(ini, fin) {
  const de = { [ini]: ini };
  const cola = [ini]; let cabeza = 0;
  while (cabeza < cola.length) {
    const c = cola[cabeza++];
    if (c === fin) break;
    for (const v of vecinos(c)) {
      if (v in de) continue;
      de[v] = c; cola.push(v);
    }
  }
  const camino = [fin];
  while (camino[0] !== ini)
    camino.unshift(de[camino[0]]);
  return camino;
}'''

# el de la lección, letra por letra ('#' muro, '.' abierta); la entrada y la salida, en los huecos del borde
LAB = ['###########',
       '#...#...#.#',
       '#.#.#.#.#.#',
       '#.#...#...#',
       '..#######..',
       '#.........#',
       '#.#.###.#.#',
       '#.#...#.#.#',
       '###########']
INI, FIN = (4, 0), (4, 10)
ARREGLO = LAB
VARIABLE = ('', 'c', '{}')   # sin contadores: la vista no los dibuja
ROTULOS = {'cola': {'es': 'COLA', 'en': 'QUEUE'}, 'cabeza': {'es': '▲ cabeza', 'en': '▲ cabeza (head)'},
           'pasos': {'es': '{} PASOS', 'en': '{} STEPS'}, 'corto': {'es': 'EL MÁS CORTO', 'en': 'THE SHORTEST'},
           'capas': {'es': 'POR CAPAS', 'en': 'LAYER BY LAYER'}}


def vecinos(c):
    """Las de la lección: arriba, derecha, abajo, izquierda, sólo las abiertas (fuera del laberinto no hay nada)."""
    y, x = c
    for f, k in ((y - 1, x), (y, x + 1), (y + 1, x), (y, x - 1)):
        if 0 <= f < len(LAB) and 0 <= k < len(LAB[0]) and LAB[f][k] == '.':
            yield (f, k)


def dfs():
    """El camino de una búsqueda en profundidad recursiva con los mismos vecinos (la de la lección): el primero que
    encuentra, no el más corto."""
    visto, camino = {INI}, [INI]

    def ir(c):
        if c == FIN:
            return True
        for v in vecinos(c):
            if v not in visto:
                visto.add(v); camino.append(v)
                if ir(v):
                    return True
                camino.pop()
        return False
    ir(INI)
    return camino


def pasos(_):
    """Lo mismo que CODIGO, paso por paso; luego el camino de vuelta y, aparte, el de la DFS (sin código)."""
    de, dist = {INI: INI}, {INI: 0}
    cola, cabeza = [INI], 0
    yield {'tipo': 'empieza', 'lineas': [2, 3], 'color': 'mete', 'c': INI, 'd': 0}
    while cabeza < len(cola):
        c = cola[cabeza]; cabeza += 1
        yield {'tipo': 'sale', 'lineas': [5], 'color': 'saca', 'c': c, 'd': dist[c]}
        if c == FIN:
            yield {'tipo': 'llega', 'lineas': [6], 'color': 'fija', 'c': c, 'd': dist[c]}
            break
        for v in vecinos(c):
            if v in de:
                yield {'tipo': 'ya', 'lineas': [8], 'color': 'mal', 'c': v}
                continue
            de[v] = c; dist[v] = dist[c] + 1; cola.append(v)
            yield {'tipo': 'entra', 'lineas': [9], 'color': 'mete', 'c': v, 'd': dist[v]}
    camino = [FIN]
    yield {'tipo': 'camino', 'lineas': [12], 'color': 'linea', 'c': FIN}
    while camino[0] != INI:
        camino.insert(0, de[camino[0]])
        yield {'tipo': 'camino', 'lineas': [13, 14], 'color': 'linea', 'c': camino[0]}
    yield {'tipo': 'devuelve', 'lineas': [15], 'color': 'fija', 'pasos': len(camino) - 1}
    for i, c in enumerate(dfs()):
        yield {'tipo': 'dfs', 'lineas': [], 'c': c, 'i': i}


# cuántos pasos lleva cada renglón del guion: hasta que empieza a salir de la cola la primera casilla de tal capa
_EV = list(pasos(LAB))


def _sale(d):
    return next(i for i, e in enumerate(_EV) if e['tipo'] == 'sale' and e['d'] >= d)


_LLEGA = next(i for i, e in enumerate(_EV) if e['tipo'] == 'sale' and e['c'] == FIN)
_CAMINO = next(i for i, e in enumerate(_EV) if e['tipo'] == 'camino')
_DFS = next(i for i, e in enumerate(_EV) if e['tipo'] == 'dfs')
CORTO = _EV[_DFS - 1]['pasos']            # 12
LARGO = len(_EV) - _DFS - 1               # 20
CAPA_FIN = _EV[_LLEGA]['d']               # 12
TROZOS = [_sale(1), _sale(2) - _sale(1), _sale(4) - _sale(2), _sale(7) - _sale(4), _LLEGA - _sale(7),
          _CAMINO - _LLEGA, _DFS - _CAMINO, len(_EV) - _DFS]
assert (CORTO, LARGO, CAPA_FIN) == (12, 20, 12), (CORTO, LARGO, CAPA_FIN)

RESALTA = [([3], 0.05, 'mete'), ([5], 0.35, 'saca'), ([9], 0.62, 'mete')]
RESALTA_FIN = [([5], 0.1, 'saca'), ([9], 0.45, 'mete')]

GUION = {'es': [
    {'vista': 'inicio', 'cara': 'feliz',
     'dice': '¿Cómo encuentra una computadora la salida más corta? ¡Con una cola!'},
    {'vista': 'codigo', 'cara': 'pensando', 'resalta': RESALTA,
     'dice': 'Es la BFS, la búsqueda en anchura: explora por capas.',
     'voz': 'Es la be, efe, ese, la búsqueda en anchura: explora por capas.'},
    {'pasos': TROZOS[0], 'cara': 'normal', 'dice': 'La entrada va a la cola con un 0. Sale, y su vecino entra con un 1.',
     'voz': 'La entrada va a la cola con un cero. Sale, y su vecino entra con un uno.'},
    {'pasos': TROZOS[1], 'cara': 'sorpresa', 'dice': 'Aquí se parte en dos: los dos entran atrás, con un 2.',
     'voz': 'Aquí se parte en dos: los dos entran atrás, con un dos.'},
    {'pasos': TROZOS[2], 'cara': 'pensando',
     'dice': 'La de atrás ya tiene número: no vuelve a entrar.'},
    {'pasos': TROZOS[3], 'cara': 'feliz', 'dice': 'Sale primero el que llegó antes: los 4, luego los 5. ¡Por capas!',
     'voz': 'Sale primero el que llegó antes: los cuatro, luego los cinco. ¡Por capas!'},
    {'pasos': TROZOS[4], 'cara': 'normal',
     'dice': 'El índice cabeza sólo avanza. Y la onda crece pareja por los dos caminos.'},
    {'pasos': TROZOS[5] + TROZOS[6], 'cara': 'feliz',
     'dice': '¡La salida, en la capa 12! Cada casilla anotó de dónde vino: de vuelta, el camino.',
     'voz': '¡La salida, en la capa doce! Cada casilla anotó de dónde vino: de vuelta, el camino.'},
    {'pasos': TROZOS[7], 'cara': 'sorpresa',
     'dice': 'Una DFS, que va a lo hondo, no lo garantiza: aquí da 20.',
     'voz': 'Una de, efe, ese, que va a lo hondo, no lo garantiza: aquí da veinte.'},
    {'vista': 'codigo', 'resalta': RESALTA_FIN, 'remate': 0.15, 'cara': 'pensando',
     'dice': 'Por ir por capas, la BFS siempre da el camino más corto en pasos.',
     'voz': 'Por ir por capas, la be, efe, ese, siempre da el camino más corto en pasos.'},
    {'vista': 'enlace', 'cara': 'guino', 'dice': 'Pruébalo tú en la lección: ayotl.dev/aprende',
     'voz': 'Pruébalo tú en la lección: áyotl punto dev, diagonal aprende.'},
    {'final': True, 'cara': 'guino', 'dice': '¿Ya estás suscrito? Síguenos para más.'},
], 'en': [
    {'vista': 'inicio', 'cara': 'feliz', 'dice': 'How does a computer find the shortest way out? With a queue!'},
    {'vista': 'codigo', 'cara': 'pensando', 'resalta': RESALTA,
     'dice': "It's BFS, breadth-first search: it explores in layers.",
     'voz': "It's B F S, breadth-first search: it explores in layers."},
    {'pasos': TROZOS[0], 'cara': 'normal', 'dice': 'The entrance joins the queue with a 0. Out it comes; its neighbor goes in with a 1.',
     'voz': 'The entrance joins the queue with a zero. Out it comes; its neighbor goes in with a one.'},
    {'pasos': TROZOS[1], 'cara': 'sorpresa', 'dice': 'Here it splits in two: both join the back, with a 2.',
     'voz': 'Here it splits in two: both join the back, with a two.'},
    {'pasos': TROZOS[2], 'cara': 'pensando',
     'dice': 'The one behind already has a number, so it stays out.'},
    {'pasos': TROZOS[3], 'cara': 'feliz', 'dice': 'First in, first out: all the 4s, then the 5s. It goes in layers!',
     'voz': 'First in, first out: all the fours, then the fives. It goes in layers!'},
    {'pasos': TROZOS[4], 'cara': 'normal',
     'dice': 'The head index just moves ahead. And the wave grows evenly down both paths.'},
    {'pasos': TROZOS[5] + TROZOS[6], 'cara': 'feliz',
     'dice': 'The exit, in layer 12! Each cell noted where it came from: walk back for the path.',
     'voz': 'The exit, in layer twelve! Each cell noted where it came from: walk back for the path.'},
    {'pasos': TROZOS[7], 'cara': 'sorpresa',
     'dice': "A DFS, which dives deep, doesn't guarantee that: here it takes 20.",
     'voz': "A D F S, which dives deep, doesn't guarantee that: here it takes twenty."},
    {'vista': 'codigo', 'resalta': RESALTA_FIN, 'remate': 0.15, 'cara': 'pensando',
     'dice': 'Going layer by layer, BFS always finds the path with the fewest steps.',
     'voz': 'Going layer by layer, B F S always finds the path with the fewest steps.'},
    {'vista': 'enlace', 'cara': 'guino', 'dice': 'Try it yourself in the lesson: ayotl.dev/en/learn',
     'voz': 'Try it yourself in the lesson, at Ah-yotl dot dev.'},
    {'final': True, 'cara': 'guino', 'dice': 'Are you subscribed yet? Follow us for more.'},
]}
