"""Ordenamiento por selección: «Algoritmos en pixel» (9-nov-2026). El formato está explicado en burbuja.py.

El mínimo que va encontrando es una marca (morada, con «min» debajo) que se mueve de barra en barra; al final de
cada vuelta se cambia al frente y esa casilla queda fija. Siempre son n - 1 intercambios (también los de una barra
consigo misma, que el código hace igual) y n(n - 1)/2 comparaciones.
"""

CLAVE = 'seleccion'
TITULO = {'es': 'ORDENAMIENTO POR SELECCIÓN', 'en': 'SELECTION SORT'}
EPISODIO = {'es': 'Ordenar: la selección', 'en': 'Sorting: selection sort'}
ARCHIVO = 'seleccion.js'

# El mismo de la lección (src/lib/aprende/algoritmos/a01-ordenar.ts): si cambia uno, cambia el otro.
CODIGO = '''function seleccion(a) {
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      if (a[j] < a[min]) min = j;
    }
    const t = a[i];
    a[i] = a[min];
    a[min] = t;
  }
  return a;
}'''

ARREGLO = [5, 2, 8, 3, 7, 1, 6, 4]   # 28 comparaciones y 7 intercambios
VARIABLE = ({'es': 'PASADA', 'en': 'PASS'}, 'i')
MARCAS = {'min': {'color': 'marca', 'barra': True}}


def pasos(a):
    a = list(a)
    n = len(a)
    for i in range(n - 1):
        yield {'tipo': 'marca', 'lineas': [3, 4], 'marcas': {'min': i}, 'vars': {'i': i}}
        m = i
        for j in range(i + 1, n):
            yield {'tipo': 'compara', 'lineas': [6], 'j': j, 'k': m, 'flechas': [(j, 'j')]}
            if a[j] < a[m]:
                m = j
                yield {'tipo': 'marca', 'lineas': [6], 'marcas': {'min': m}}
        a[i], a[m] = a[m], a[i]
        yield {'tipo': 'cambia', 'lineas': [8, 9, 10], 'j': i, 'k': m, 'marcas': {'min': i}, 'flechas': []}
        yield {'tipo': 'fija', 'k': i, 'lineas': [3], 'marcas': {'min': None}}
    yield {'tipo': 'fija', 'k': n - 1, 'lineas': [12]}
    yield {'tipo': 'fin', 'lineas': [12]}


TABLA = {'columnas': [{'es': 'NÚMEROS', 'en': 'NUMBERS'}, {'es': 'COMPARACIONES', 'en': 'COMPARISONS'},
                      {'es': 'INTERCAMBIOS', 'en': 'SWAPS'}],
         'filas': [[n, n * (n - 1) // 2, n - 1] for n in (8, 100, 1000)], 'colores': ['white', 'yellow', 'red']}
COMPLEJIDAD = 'O(n²)'
LEYENDA = {'es': 'Y SÓLO n - 1 INTERCAMBIOS', 'en': 'AND ONLY n - 1 SWAPS'}

GUION = {'es': [
    {'vista': 'inicio', 'cara': 'feliz', 'dice': '¿Y si buscas el más chico y lo pones primero? ¡Ordenamiento por selección!'},
    {'vista': 'codigo', 'cara': 'pensando', 'resalta': [([4], 0.12, 'marca'), ([6], 0.36, 'compara'), ([8, 9, 10], 0.7, 'cambia')],
     'dice': 'En cada vuelta busca el mínimo de lo que falta y lo cambia al frente.'},
    {'pasos': 3, 'cara': 'pensando', 'dice': 'Empieza con el 5, pero el 2 es menor: nuevo mínimo.',
     'voz': 'Empieza con el cinco, pero el dos es menor: nuevo mínimo.'},
    {'pasos': 5, 'cara': 'sorpresa', 'dice': 'Sigue buscando, ¡y el 1 es todavía menor!', 'voz': 'Sigue buscando, ¡y el uno es todavía menor!'},
    {'pasos': 4, 'cara': 'feliz', 'dice': 'Lo cambia al frente: el 1 ya está en su lugar.', 'voz': 'Lo cambia al frente: el uno ya está en su lugar.'},
    {'pasos': -2, 'cara': 'normal', 'dice': 'Y repite con lo que falta: cada vuelta acomoda uno más.'},
    {'pasos': 'resto', 'cara': 'feliz', 'dice': '¡Listo, ordenados!'},
    {'vista': 'cuenta', 'filas': [(0, 0.1), (1, 0.55), (2, 0.65)], 'cara': 'sorpresa',
     'dice': 'Sólo 7 intercambios, pero siempre 28 comparaciones, aunque ya esté ordenada.',
     'voz': 'Sólo siete intercambios, pero siempre veintiocho comparaciones, aunque ya esté ordenada.'},
    {'vista': 'cuenta', 'complejidad': 0.25, 'cara': 'pensando',
     'dice': 'Por eso es O(n²), aunque mueve muy poco: útil si escribir cuesta caro.',
     'voz': 'Por eso es o de ene cuadrada, aunque mueve muy poco: útil si escribir cuesta caro.'},
    {'vista': 'enlace', 'cara': 'guino', 'dice': 'Pruébalo tú en la lección: ayotl.dev/aprende',
     'voz': 'Pruébalo tú en la lección: áyotl punto dev, diagonal aprende.'},
    {'final': True, 'cara': 'guino', 'dice': '¿Ya estás suscrito? Síguenos para más.'},
], 'en': [
    {'vista': 'inicio', 'cara': 'feliz', 'dice': 'What if you find the smallest and put it first? That is selection sort!'},
    {'vista': 'codigo', 'cara': 'pensando', 'resalta': [([4], 0.12, 'marca'), ([6], 0.36, 'compara'), ([8, 9, 10], 0.7, 'cambia')],
     'dice': 'Each pass finds the minimum of what is left and swaps it to the front.'},
    {'pasos': 3, 'cara': 'pensando', 'dice': 'It starts with the 5, but the 2 is smaller: new minimum.',
     'voz': 'It starts with the five, but the two is smaller: new minimum.'},
    {'pasos': 5, 'cara': 'sorpresa', 'dice': 'It keeps looking, and the 1 is even smaller!', 'voz': 'It keeps looking, and the one is even smaller!'},
    {'pasos': 4, 'cara': 'feliz', 'dice': 'Swap it to the front: the 1 is now in place.', 'voz': 'Swap it to the front: the one is now in place.'},
    {'pasos': -2, 'cara': 'normal', 'dice': 'Then repeat with the rest: each pass places one more.'},
    {'pasos': 'resto', 'cara': 'feliz', 'dice': 'Done, all sorted!'},
    {'vista': 'cuenta', 'filas': [(0, 0.1), (1, 0.55), (2, 0.65)], 'cara': 'sorpresa',
     'dice': 'Only 7 swaps, but always 28 comparisons, even if it is already sorted.',
     'voz': 'Only seven swaps, but always twenty-eight comparisons, even if it is already sorted.'},
    {'vista': 'cuenta', 'complejidad': 0.25, 'cara': 'pensando',
     'dice': 'That is why it is O(n²), though it moves very little: handy when writing is costly.',
     'voz': 'That is why it is O of n squared, though it moves very little: handy when writing is costly.'},
    {'vista': 'enlace', 'cara': 'guino', 'dice': 'Try it yourself in the lesson: ayotl.dev/en/learn',
     'voz': 'Try it yourself in the lesson, at Ah-yotl dot dev.'},
    {'final': True, 'cara': 'guino', 'dice': 'Are you subscribed yet? Follow us for more.'},
]}
