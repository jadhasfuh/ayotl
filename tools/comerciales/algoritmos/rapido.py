"""Ordenamiento rápido (quicksort, partición de Lomuto): «Algoritmos en pixel» (9-nov-2026). El formato está
explicado en burbuja.py.

Cada llamada es un tramo (lo de fuera se apaga); el pivote es el último del tramo (marca morada, «p») y el puntero
i (cian, sin pintar su barra) marca dónde va el siguiente menor. Al final el pivote se cambia a la casilla i y
queda fijo; los tramos de un solo número quedan fijos al entrar.
"""

CLAVE = 'rapido'
TITULO = {'es': 'ORDENAMIENTO RÁPIDO', 'en': 'QUICKSORT'}
EPISODIO = {'es': 'Ordenar: el rápido', 'en': 'Sorting: quicksort'}
ARCHIVO = 'rapido.js'

# El mismo de la lección (src/lib/aprende/algoritmos/a01-ordenar.ts): si cambia uno, cambia el otro.
CODIGO = '''function rapido(a, ini, fin) {
  if (ini >= fin) return;
  const p = a[fin];
  let i = ini;
  for (let j = ini; j < fin; j++) {
    if (a[j] < p) {
      [a[i], a[j]] = [a[j], a[i]];
      i++;
    }
  }
  [a[i], a[fin]] = [a[fin], a[i]];
  rapido(a, ini, i - 1);
  rapido(a, i + 1, fin);
}'''

ARREGLO = [5, 2, 8, 3, 7, 1, 6, 4]   # 15 comparaciones y 9 intercambios
VARIABLE = ({'es': 'PIVOTE', 'en': 'PIVOT'}, 'p')
MARCAS = {'p': {'color': 'marca', 'barra': True}, 'i': {'color': 'pasada', 'barra': False}}


def pasos(v):
    a = list(v)

    def llamada(ini, fin):
        if ini > fin:
            return
        yield {'tipo': 'rango', 'rango': [ini, fin, None], 'lineas': [2]}
        if ini == fin:
            yield {'tipo': 'fija', 'k': ini, 'lineas': [2]}
            return
        p = a[fin]
        yield {'tipo': 'marca', 'lineas': [3, 4], 'marcas': {'p': fin, 'i': ini}, 'vars': {'p': p}}
        i = ini
        for j in range(ini, fin):
            yield {'tipo': 'compara', 'lineas': [6], 'j': j, 'k': fin, 'flechas': [(j, 'j')]}
            if a[j] < p:
                a[i], a[j] = a[j], a[i]
                yield {'tipo': 'cambia', 'lineas': [7], 'j': i, 'k': j, 'flechas': [(j, 'j')]}
                yield {'tipo': 'linea', 'lineas': [8], 'marcas': {'i': i + 1}}
                i += 1
        a[i], a[fin] = a[fin], a[i]
        yield {'tipo': 'cambia', 'lineas': [11], 'j': i, 'k': fin, 'marcas': {'p': i, 'i': None}, 'flechas': []}
        yield {'tipo': 'fija', 'k': i, 'lineas': [11], 'marcas': {'p': None}}
        yield from llamada(ini, i - 1)
        yield from llamada(i + 1, fin)

    yield from llamada(0, len(a) - 1)
    yield {'tipo': 'fin', 'lineas': []}


# Comparaciones de burbuja y del rápido: el arreglo del vídeo y, con 100 y 1 000, los números al azar de la
# lección (semilla 42).
TABLA = {'columnas': [{'es': 'NÚMEROS', 'en': 'NUMBERS'}, {'es': 'BURBUJA', 'en': 'BUBBLE'}, {'es': 'RÁPIDO', 'en': 'QUICK'}],
         'filas': [[8, 28, 15], [100, 4950, 690], [1000, 499500, 10811]], 'colores': ['white', 'red', 'lgreen']}
COMPLEJIDAD = 'O(n log n)'
LEYENDA = {'es': 'EN PROMEDIO; SI NO, O(n²)', 'en': 'ON AVERAGE; WORST CASE O(n²)'}

GUION = {'es': [
    {'vista': 'inicio', 'cara': 'feliz', 'dice': 'Muchas bibliotecas lo usan por dentro: ¡el ordenamiento rápido, quicksort!'},
    {'vista': 'codigo', 'cara': 'pensando',
     'resalta': [([3], 0.1, 'marca'), ([6], 0.3, 'compara'), ([7, 8], 0.48, 'cambia'), ([11], 0.74, 'fija')],
     'dice': 'Elige un pivote y pone a su izquierda a los menores. Al final, el pivote queda en su lugar.'},
    {'pasos': 2, 'cara': 'normal', 'dice': 'El pivote es el último: el 4.', 'voz': 'El pivote es el último: el cuatro.'},
    {'pasos': 4, 'cara': 'pensando', 'dice': '¿5 es menor? No. ¿Y el 2? Sí: se va a la izquierda.',
     'voz': '¿Cinco es menor? No. ¿Y el dos? Sí: se va a la izquierda.'},
    {'pasos': 11, 'cara': 'sorpresa', 'dice': 'Igual con los demás, y al final el 4 queda en su lugar.',
     'voz': 'Igual con los demás, y al final el cuatro queda en su lugar.'},
    {'pasos': -1, 'cara': 'feliz', 'dice': 'Luego hace lo mismo con cada lado.'},
    {'pasos': 'resto', 'cara': 'feliz', 'dice': '¡Listo, ordenados!'},
    {'vista': 'cuenta', 'filas': [(0, 0.1), (1, 0.45), (2, 0.55)], 'cara': 'sorpresa',
     'dice': 'Sólo 15 comparaciones. Con mil números, unas 10 800 contra medio millón.',
     'voz': 'Sólo quince comparaciones. Con mil números, unas diez mil ochocientas contra medio millón.'},
    {'vista': 'cuenta', 'complejidad': 0.25, 'cara': 'pensando',
     'dice': 'En promedio, O(n log n). Con un mal pivote, O(n²).',
     'voz': 'En promedio, o de ene log ene. Con un mal pivote, o de ene cuadrada.'},
    {'vista': 'enlace', 'cara': 'guino', 'dice': 'Pruébalo tú en la lección: ayotl.dev/aprende',
     'voz': 'Pruébalo tú en la lección: áyotl punto dev, diagonal aprende.'},
    {'final': True, 'cara': 'guino', 'dice': '¿Ya estás suscrito? Síguenos para más.'},
], 'en': [
    {'vista': 'inicio', 'cara': 'feliz', 'dice': 'Many libraries use it under the hood: quicksort!'},
    {'vista': 'codigo', 'cara': 'pensando',
     'resalta': [([3], 0.1, 'marca'), ([6], 0.3, 'compara'), ([7, 8], 0.48, 'cambia'), ([11], 0.74, 'fija')],
     'dice': 'Pick a pivot and move the smaller ones to its left. In the end, the pivot lands in its place.'},
    {'pasos': 2, 'cara': 'normal', 'dice': 'The pivot is the last one: the 4.', 'voz': 'The pivot is the last one: the four.'},
    {'pasos': 4, 'cara': 'pensando', 'dice': 'Is 5 smaller? No. And the 2? Yes: it goes to the left.',
     'voz': 'Is five smaller? No. And the two? Yes: it goes to the left.'},
    {'pasos': 11, 'cara': 'sorpresa', 'dice': 'Same for the rest, and in the end the 4 lands in its place.',
     'voz': 'Same for the rest, and in the end the four lands in its place.'},
    {'pasos': -1, 'cara': 'feliz', 'dice': 'Then it does the same with each side.'},
    {'pasos': 'resto', 'cara': 'feliz', 'dice': 'Done, all sorted!'},
    {'vista': 'cuenta', 'filas': [(0, 0.1), (1, 0.45), (2, 0.55)], 'cara': 'sorpresa',
     'dice': 'Only 15 comparisons. With a thousand numbers, about 10,800 versus half a million.',
     'voz': 'Only fifteen comparisons. With a thousand numbers, about ten thousand eight hundred versus half a million.'},
    {'vista': 'cuenta', 'complejidad': 0.25, 'cara': 'pensando',
     'dice': 'On average, O(n log n). With a bad pivot, O(n²).',
     'voz': 'On average, O of n log n. With a bad pivot, O of n squared.'},
    {'vista': 'enlace', 'cara': 'guino', 'dice': 'Try it yourself in the lesson: ayotl.dev/en/learn',
     'voz': 'Try it yourself in the lesson, at Ah-yotl dot dev.'},
    {'final': True, 'cara': 'guino', 'dice': 'Are you subscribed yet? Follow us for more.'},
]}
