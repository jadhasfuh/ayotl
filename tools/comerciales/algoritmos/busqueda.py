"""La búsqueda binaria: «Algoritmos en pixel» / «LeIA enseña programación» (20-nov-2026, para el 24-nov). El formato
está explicado en burbuja.py y la vista, en punteros.py: las barras de un arreglo ordenado, la raya del que se busca
y los punteros izq, der y medio.

El gancho es el de adivinar un número del 1 al 100 en 7 preguntas. Luego busca el 63 en 16 números ordenados: mira
el 42 (chico: se apaga la izquierda), el 71 (grande: se apaga la derecha), el 56 (chico) y el 63, en 4 miradas;
uno por uno, desde el principio, habrían sido 11. La tabla da el peor caso de las dos (floor(log2 n) + 1 miradas
de la binaria: 5 con 16, 7 con 100 y 20 con un millón) y el remate es O(log n), con la condición de siempre: la
lista tiene que estar ordenada.
"""

CLAVE = 'busqueda'
VISTA = 'punteros'
TITULO = {'es': 'BÚSQUEDA BINARIA', 'en': 'BINARY SEARCH'}
EPISODIO = {'es': 'Buscar: la búsqueda binaria', 'en': 'Searching: binary search'}   # el lema de la tarjeta final
ARCHIVO = 'buscar.js'
RUTA = {'es': '/aprende/algoritmos/busqueda-binaria', 'en': '/en/learn/algoritmos/busqueda-binaria'}

# El mismo de la lección (src/lib/aprende/algoritmos/a02-buscar.ts, BUSCAR): si cambia uno, cambia el otro. Allá
# `const medio = Math.floor((izq + der) / 2);` va en un renglón; aquí mide 46 letras y va partido en dos.
CODIGO = '''function buscar(a, x) {
  let izq = 0, der = a.length - 1;
  while (izq <= der) {
    const medio =
      Math.floor((izq + der) / 2);
    if (a[medio] === x) return medio;
    if (a[medio] < x) izq = medio + 1;
    else der = medio - 1;
  }
  return -1;
}'''

ARREGLO = [4, 9, 13, 18, 25, 31, 37, 42, 50, 56, 63, 71, 77, 84, 90, 97]
OBJETIVO = 63   # en la casilla 10: 4 miradas (42, 71, 56, 63); uno por uno, 11
VARIABLE = ({'es': 'BUSCO', 'en': 'TARGET'}, 'x', '{}')
CONTADORES = {'compara': {'es': 'BINARIA', 'en': 'BINARY'}, 'cambia': {'es': 'UNA POR UNA', 'en': 'ONE BY ONE'}}
MARCAS = {'izq': {'abajo': 'izq', 'color': 'pasada'}, 'der': {'abajo': 'der', 'color': 'pasada'},
          'medio': {'arriba': True, 'color': 'compara'}}


def pasos(v):
    """Lo mismo que CODIGO buscando OBJETIVO, y después la búsqueda de uno por uno, contada aparte."""
    a, x = list(v), OBJETIVO
    izq, der = 0, len(a) - 1
    yield {'tipo': 'marca', 'lineas': [2], 'marcas': {'izq': izq, 'der': der}, 'rango': [izq, der, None], 'vars': {'x': x}}
    while izq <= der:
        medio = (izq + der) // 2
        yield {'tipo': 'marca', 'lineas': [4, 5], 'marcas': {'medio': medio}}
        yield {'tipo': 'compara', 'lineas': [6], 'j': medio, 'k': medio}
        if a[medio] == x:
            yield {'tipo': 'fija', 'k': medio, 'lineas': [6], 'marcas': {'izq': None, 'der': None}}
            hallado = medio
            break
        if a[medio] < x:
            izq = medio + 1
            yield {'tipo': 'rango', 'lineas': [7], 'marcas': {'izq': izq, 'medio': None}, 'rango': [izq, der, None]}
        else:
            der = medio - 1
            yield {'tipo': 'rango', 'lineas': [8], 'marcas': {'der': der, 'medio': None}, 'rango': [izq, der, None]}
    # uno por uno, desde el principio (no es el código de arriba: sólo cuenta)
    yield {'tipo': 'linea', 'lineas': [], 'rango': None, 'marcas': {'medio': None}}
    for k in range(hallado + 1):
        yield {'tipo': 'pasada', 'k': k, 'lineas': [], 'cuenta': ['cambia'], 'peso': 1.0}


def miradas(n):
    """Las que hace CODIGO en el peor caso con n números: floor(log2 n) + 1."""
    return n.bit_length()


TABLA = {'columnas': [{'es': 'NÚMEROS', 'en': 'NUMBERS'}, {'es': 'UNA POR UNA', 'en': 'ONE BY ONE'},
                      {'es': 'BINARIA', 'en': 'BINARY'}],
         'filas': [[n, n, miradas(n)] for n in (16, 100, 1000000)], 'colores': ['white', 'red', 'lgreen'],
         'derechas': [370, 720, 1010], 'k': 4}
COMPLEJIDAD = 'O(log n)'
LEYENDA = {'es': 'SÓLO SI LA LISTA ESTÁ ORDENADA', 'en': 'ONLY IF THE LIST IS SORTED'}

RESALTA = [([4, 5], 0.08, 'marca'), ([6], 0.4, 'compara'), ([7], 0.62, 'rango'), ([8], 0.8, 'rango')]

GUION = {'es': [
    {'vista': 'inicio', 'cara': 'feliz',
     'dice': 'Piensa un número del 1 al 100: lo adivino en 7 preguntas, con la búsqueda binaria.',
     'voz': 'Piensa un número del uno al cien: lo adivino en siete preguntas, con la búsqueda binaria.'},
    {'vista': 'codigo', 'cara': 'pensando', 'resalta': RESALTA,
     'dice': 'Mira el de en medio y tira la mitad donde no puede estar.'},
    {'pasos': 3, 'cara': 'pensando', 'dice': 'Busco el 63. El de en medio es el 42: muy chico.',
     'voz': 'Busco el sesenta y tres. El de en medio es el cuarenta y dos: muy chico.'},
    {'pasos': 1, 'cara': 'sorpresa', 'dice': 'Está ordenada: todo lo de su izquierda es menor. ¡Fuera esa mitad!'},
    {'pasos': 3, 'cara': 'normal', 'dice': 'Ahora el 71: muy grande. Se apaga la derecha.',
     'voz': 'Ahora el setenta y uno: muy grande. Se apaga la derecha.'},
    {'pasos': 3, 'cara': 'pensando', 'dice': 'El 56: chico. Ya sólo queda uno.',
     'voz': 'El cincuenta y seis: chico. Ya sólo queda uno.'},
    {'pasos': 3, 'cara': 'feliz', 'dice': '¡Es el 63! Lo encontré en 4 miradas.',
     'voz': '¡Es el sesenta y tres! Lo encontré en cuatro miradas.'},
    {'pasos': 'resto', 'cara': 'sorpresa', 'dice': 'Mirando uno por uno desde el principio, habrían sido 11.',
     'voz': 'Mirando uno por uno desde el principio, habrían sido once.'},
    {'vista': 'cuenta', 'filas': [(0, 0.1), (1, 0.3), (2, 0.62)], 'cara': 'sorpresa',
     'dice': 'Y en el peor caso: con 100 números, 7 miradas. Con un millón, ¡sólo 20!',
     'voz': 'Y en el peor caso: con cien números, siete miradas. Con un millón, ¡sólo veinte!'},
    {'vista': 'cuenta', 'complejidad': 0.3, 'cara': 'pensando',
     'dice': 'Cada mirada tira la mitad: O(log n). Pero sólo si la lista está ordenada.',
     'voz': 'Cada mirada tira la mitad: o de log ene. Pero sólo si la lista está ordenada.'},
    {'vista': 'enlace', 'cara': 'guino', 'dice': 'Pruébalo tú en la lección: ayotl.dev/aprende',
     'voz': 'Pruébalo tú en la lección: áyotl punto dev, diagonal aprende.'},
    {'final': True, 'cara': 'guino', 'dice': '¿Ya estás suscrito? Síguenos para más.'},
], 'en': [
    {'vista': 'inicio', 'cara': 'feliz',
     'dice': "Think of a number from 1 to 100: I'll guess it in 7 questions, with binary search.",
     'voz': "Think of a number from one to a hundred: I'll guess it in seven questions, with binary search."},
    {'vista': 'codigo', 'cara': 'pensando', 'resalta': RESALTA,
     'dice': "Look at the middle one. If it's not it, throw away the half where it can't be."},
    {'pasos': 3, 'cara': 'pensando', 'dice': "I'm looking for 63. The middle one is 42: too small.",
     'voz': "I'm looking for sixty-three. The middle one is forty-two: too small."},
    {'pasos': 1, 'cara': 'sorpresa', 'dice': "It's sorted, so everything to its left is smaller. That half is out!"},
    {'pasos': 3, 'cara': 'normal', 'dice': 'Now 71: too big. The right side goes dark.',
     'voz': 'Now seventy-one: too big. The right side goes dark.'},
    {'pasos': 3, 'cara': 'pensando', 'dice': '56: too small again. Only one is left.',
     'voz': 'Fifty-six: too small again. Only one is left.'},
    {'pasos': 3, 'cara': 'feliz', 'dice': "It's 63! Found in 4 looks.", 'voz': "It's sixty-three! Found in four looks."},
    {'pasos': 'resto', 'cara': 'sorpresa', 'dice': 'Checking one by one from the start, it would have taken 11.',
     'voz': 'Checking one by one from the start, it would have taken eleven.'},
    {'vista': 'cuenta', 'filas': [(0, 0.1), (1, 0.3), (2, 0.6)], 'cara': 'sorpresa',
     'dice': 'And in the worst case: 7 looks for 100 numbers. For a million, just 20!',
     'voz': 'And in the worst case: seven looks for a hundred numbers. For a million, just twenty!'},
    {'vista': 'cuenta', 'complejidad': 0.3, 'cara': 'pensando',
     'dice': 'Each look cuts the rest in half: O(log n). But only on a sorted list.',
     'voz': 'Each look cuts the rest in half: O of log n. But only on a sorted list.'},
    {'vista': 'enlace', 'cara': 'guino', 'dice': 'Try it yourself in the lesson: ayotl.dev/en/learn',
     'voz': 'Try it yourself in the lesson, at Ah-yotl dot dev.'},
    {'final': True, 'cara': 'guino', 'dice': 'Are you subscribed yet? Follow us for more.'},
]}
