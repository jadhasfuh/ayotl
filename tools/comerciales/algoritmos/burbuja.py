"""Ordenamiento por burbuja: el episodio piloto de «Algoritmos en pixel» (9-nov-2026).

Un archivo por algoritmo. renderizador.py y armar.py sólo usan lo de aquí:
- CLAVE: el nombre de la salida (salida/algoritmos-<CLAVE>.mp4) y de su carpeta de trabajo;
- TITULO: el rótulo de arriba, por idioma; ARCHIVO: el nombre que sale en la barra del editor;
- CODIGO: el programa en JavaScript. Es el MISMO de la lección de /aprende
  (src/lib/aprende/algoritmos/a01-ordenar.ts): si cambia uno, cambia el otro;
- ARREGLO: los valores de las barras (de 8 a 10, del 1 al 10, para que se lean en el teléfono);
- VARIABLE: la variable que sale a la izquierda de los contadores (rótulo por idioma, nombre en `vars`);
- pasos(a): lo que hace el programa, paso por paso (ver renderizador.TIPOS);
- comparaciones(n), FILAS y COMPLEJIDAD: la tabla de «por qué es lento»;
- GUION: lo que dice LeIA, renglón por renglón, con lo que se ve mientras lo dice.
"""

CLAVE = 'burbuja'
TITULO = {'es': 'ORDENAMIENTO POR BURBUJA'}
EPISODIO = {'es': 'Ordenar: la burbuja'}   # el lema de la tarjeta final
ARCHIVO = 'burbuja.js'

# Ninguna línea pasa de 37 caracteres: a 24 px (Press Start 2P x3) caben en el ancho del teléfono.
CODIGO = '''function burbuja(a) {
  const n = a.length;
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < n - i; j++) {
      if (a[j] > a[j + 1]) {
        const t = a[j];
        a[j] = a[j + 1];
        a[j + 1] = t;
      }
    }
  }
  return a;
}'''

ARREGLO = [5, 2, 8, 3, 7, 1, 6, 4]   # 28 comparaciones y 15 intercambios
VARIABLE = ({'es': 'PASADA'}, 'i')


def pasos(a):
    """Lo mismo que CODIGO, contado paso por paso. `lineas`: las que corren en ese paso (de 1 en adelante)."""
    a = list(a)
    n = len(a)
    for i in range(1, n):
        yield {'tipo': 'pasada', 'lineas': [3], 'vars': {'i': i}}
        for j in range(n - i):
            yield {'tipo': 'compara', 'lineas': [5], 'j': j, 'k': j + 1, 'vars': {'i': i, 'j': j}}
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                yield {'tipo': 'cambia', 'lineas': [6, 7, 8], 'j': j, 'k': j + 1, 'vars': {'i': i, 'j': j}}
        yield {'tipo': 'fija', 'k': n - i, 'lineas': [3]}   # la pasada i deja en su lugar al de la casilla n - i
    yield {'tipo': 'fija', 'k': 0, 'lineas': [12]}           # el que queda solo al principio también
    yield {'tipo': 'fin', 'lineas': [12]}


def comparaciones(n):
    """Las que hace CODIGO con n números, estén como estén: (n-1) + (n-2) + … + 1."""
    return n * (n - 1) // 2


FILAS = [8, 100, 1000]
COMPLEJIDAD = 'O(n²)'

# Lo que dice LeIA. Cada renglón es una página del cuadro de diálogo y dura lo que su voz (más el respiro de
# comercial.py). Lo que se ve mientras lo dice:
# - `pasos`: los siguientes pasos del algoritmo, repartidos en lo que dura la voz (un número; negativo = todos
#   menos esos últimos; 'resto' = todos los que quedan);
# - `vista`: 'inicio' (caen las barras), 'codigo' (sólo se resaltan líneas: `resalta` = [(líneas, desde qué
#   fracción, tipo)]), 'cuenta' (la tabla: `filas` = [(fila, desde qué fracción)], `complejidad` = desde qué
#   fracción sale la O grande) o 'enlace' (la dirección de la lección);
# - `final`: la tarjeta de cierre de comercial.py (sin cuadro de diálogo).
# `dice` es lo que se lee; `voz`, lo que se pronuncia, si cambia («áyotl punto dev», «píxel», «o de ene cuadrada»).
GUION = {'es': [
    {'vista': 'inicio', 'cara': 'feliz',
     'dice': '¿Cómo ordena una computadora una lista? ¡Con la burbuja!'},
    {'vista': 'codigo', 'cara': 'pensando', 'resalta': [([5], 0.2, 'compara'), ([6, 7, 8], 0.68, 'cambia')],
     'dice': 'La idea: si dos vecinos están al revés, se cambian.'},
    {'pasos': 2, 'cara': 'pensando', 'dice': '¿5 es mayor que 2?', 'voz': '¿Cinco es mayor que dos?'},
    {'pasos': 1, 'cara': 'feliz', 'dice': '¡Sí, se cambian!'},
    {'pasos': 1, 'cara': 'normal', 'dice': '5 y 8 ya están en orden.', 'voz': 'Cinco y ocho ya están en orden.'},
    {'pasos': 10, 'cara': 'sorpresa', 'dice': 'Y el 8 va subiendo, como una burbuja.', 'voz': 'Y el ocho va subiendo, como una burbuja.'},
    {'pasos': 1, 'cara': 'feliz', 'dice': 'Primera pasada: el más grande ya llegó.'},
    {'pasos': -2, 'cara': 'normal', 'dice': 'Y se repite: cada pasada acomoda uno más.'},
    {'pasos': 'resto', 'cara': 'feliz', 'dice': '¡Listo, ordenados!'},
    {'vista': 'cuenta', 'filas': [(0, 0.12), (1, 0.6), (2, 0.68)], 'cara': 'sorpresa',
     'dice': '¡Pero fueron 28 comparaciones para sólo 8 números! Con mil, ¡medio millón!',
     'voz': '¡Pero fueron veintiocho comparaciones para sólo ocho números! Con mil, ¡medio millón!'},
    {'vista': 'cuenta', 'complejidad': 0.66, 'cara': 'pensando',
     'dice': 'Doble de datos, cuatro veces el trabajo: O(n²).',
     'voz': 'Doble de datos, cuatro veces el trabajo: o de ene cuadrada.'},
    {'vista': 'enlace', 'cara': 'guino', 'dice': 'Pruébalo tú en la lección: ayotl.dev/aprende',
     'voz': 'Pruébalo tú en la lección: áyotl punto dev, diagonal aprende.'},
    {'final': True, 'cara': 'guino', 'dice': '¿Ya estás suscrito? Síguenos para más.'},
]}
