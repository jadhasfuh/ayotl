"""Ordenamiento por inserción: «Algoritmos en pixel» (9-nov-2026). El formato está explicado en burbuja.py.

La x que se inserta va en el hueco que deja cada número que se recorre: en el dibujo, recorrer a[j] a la derecha
es lo mismo que cambiarlo de lugar con la x. El segundo contador cuenta esos movimientos (a[j + 1] = a[j]).
"""

CLAVE = 'insercion'
TITULO = {'es': 'ORDENAMIENTO POR INSERCIÓN', 'en': 'INSERTION SORT'}
EPISODIO = {'es': 'Ordenar: la inserción', 'en': 'Sorting: insertion sort'}
ARCHIVO = 'insercion.js'

# El mismo de la lección (src/lib/aprende/algoritmos/a01-ordenar.ts): si cambia uno, cambia el otro.
CODIGO = '''function insercion(a) {
  for (let i = 1; i < a.length; i++) {
    const x = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > x) {
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = x;
  }
  return a;
}'''

ARREGLO = [5, 2, 8, 3, 7, 1, 6, 4]   # 20 comparaciones y 15 movimientos
VARIABLE = ({'es': 'VALOR', 'en': 'VALUE'}, 'x')
CONTADORES = {'cambia': {'es': 'MOVIMIENTOS', 'en': 'MOVES'}}
MARCAS = {'x': {'color': 'marca', 'barra': True}}


def pasos(a):
    a = list(a)
    for i in range(1, len(a)):
        x = a[i]
        yield {'tipo': 'marca', 'lineas': [3, 4], 'marcas': {'x': i}, 'vars': {'x': x}, 'ordenados': [0, i]}
        j = i - 1
        while j >= 0:
            yield {'tipo': 'compara', 'lineas': [5], 'j': j, 'k': j + 1, 'flechas': [(j, 'j')]}
            if a[j] <= x:
                break
            a[j + 1], a[j] = a[j], x   # a[j] se recorre y la x queda en el hueco
            yield {'tipo': 'cambia', 'lineas': [6, 7], 'j': j, 'k': j + 1, 'marcas': {'x': j}, 'flechas': []}
            j -= 1
        yield {'tipo': 'coloca', 'k': j + 1, 'lineas': [9], 'marcas': {'x': None}, 'ordenados': [0, i]}
    yield {'tipo': 'fin', 'lineas': [11]}


# Con 1 000 números: ya ordenados (1 a 1 000), al azar (los de la lección: semilla 42) y al revés.
TABLA = {'columnas': [{'es': 'LISTA DE 1 000', 'en': 'LIST OF 1,000'}, {'es': 'COMPARACIONES', 'en': 'COMPARISONS'}],
         'filas': [[{'es': 'ORDENADA', 'en': 'SORTED'}, 999], [{'es': 'REVUELTA', 'en': 'SHUFFLED'}, 246736],
                   [{'es': 'AL REVÉS', 'en': 'REVERSED'}, 499500]]}
COMPLEJIDAD = 'O(n²)'
LEYENDA = {'es': 'Y O(n) SI YA VIENE ORDENADA', 'en': 'AND O(n) IF IT IS ALREADY SORTED'}

GUION = {'es': [
    {'vista': 'inicio', 'cara': 'feliz',
     'dice': '¿Cómo acomodas las cartas en tu mano? Así funciona el ordenamiento por inserción.'},
    {'vista': 'codigo', 'cara': 'pensando', 'resalta': [([3], 0.15, 'marca'), ([5], 0.42, 'compara'), ([6, 7], 0.64, 'cambia')],
     'dice': 'Toma el siguiente número y lo recorre a la izquierda hasta encontrar su lugar.'},
    {'pasos': 4, 'cara': 'normal', 'dice': 'Toma el 2: el 5 es mayor, así que se recorre.',
     'voz': 'Toma el dos: el cinco es mayor, así que se recorre.'},
    {'pasos': 3, 'cara': 'feliz', 'dice': 'El 8 ya es mayor que el 5: se queda.', 'voz': 'El ocho ya es mayor que el cinco: se queda.'},
    {'pasos': 7, 'cara': 'sorpresa', 'dice': 'El 3 se mete entre el 2 y el 5.', 'voz': 'El tres se mete entre el dos y el cinco.'},
    {'pasos': -1, 'cara': 'normal', 'dice': 'Y así con cada uno: lo de la izquierda siempre queda ordenado.'},
    {'pasos': 'resto', 'cara': 'feliz', 'dice': '¡Listo, ordenados!'},
    {'vista': 'cuenta', 'filas': [(0, 0.35)], 'cara': 'sorpresa',
     'dice': 'Si la lista ya viene ordenada, casi no compara: ¡es rapidísimo!'},
    {'vista': 'cuenta', 'filas': [(1, 0.08), (2, 0.3)], 'complejidad': 0.6, 'cara': 'pensando',
     'dice': 'Pero revuelta o al revés, sigue siendo O(n²).', 'voz': 'Pero revuelta o al revés, sigue siendo o de ene cuadrada.'},
    {'vista': 'enlace', 'cara': 'guino', 'dice': 'Pruébalo tú en la lección: ayotl.dev/aprende',
     'voz': 'Pruébalo tú en la lección: áyotl punto dev, diagonal aprende.'},
    {'final': True, 'cara': 'guino', 'dice': '¿Ya estás suscrito? Síguenos para más.'},
], 'en': [
    {'vista': 'inicio', 'cara': 'feliz', 'dice': 'How do you sort the cards in your hand? That is insertion sort.'},
    {'vista': 'codigo', 'cara': 'pensando', 'resalta': [([3], 0.15, 'marca'), ([5], 0.42, 'compara'), ([6, 7], 0.64, 'cambia')],
     'dice': 'Take the next number and slide it left until it finds its place.'},
    {'pasos': 4, 'cara': 'normal', 'dice': 'Take the 2: the 5 is bigger, so it shifts over.',
     'voz': 'Take the two: the five is bigger, so it shifts over.'},
    {'pasos': 3, 'cara': 'feliz', 'dice': 'The 8 is already bigger than the 5: it stays.',
     'voz': 'The eight is already bigger than the five: it stays.'},
    {'pasos': 7, 'cara': 'sorpresa', 'dice': 'The 3 slips in between the 2 and the 5.',
     'voz': 'The three slips in between the two and the five.'},
    {'pasos': -1, 'cara': 'normal', 'dice': 'And so on: the left side always stays sorted.'},
    {'pasos': 'resto', 'cara': 'feliz', 'dice': 'Done, all sorted!'},
    {'vista': 'cuenta', 'filas': [(0, 0.35)], 'cara': 'sorpresa',
     'dice': 'If the list is already sorted, it barely compares: super fast!'},
    {'vista': 'cuenta', 'filas': [(1, 0.08), (2, 0.3)], 'complejidad': 0.6, 'cara': 'pensando',
     'dice': 'But shuffled or reversed, it is still O(n²).', 'voz': 'But shuffled or reversed, it is still O of n squared.'},
    {'vista': 'enlace', 'cara': 'guino', 'dice': 'Try it yourself in the lesson: ayotl.dev/en/learn',
     'voz': 'Try it yourself in the lesson, at Ah-yotl dot dev.'},
    {'final': True, 'cara': 'guino', 'dice': 'Are you subscribed yet? Follow us for more.'},
]}
