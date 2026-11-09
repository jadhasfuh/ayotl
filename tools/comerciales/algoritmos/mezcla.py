"""Ordenamiento por mezcla (merge sort): «Algoritmos en pixel» (9-nov-2026). El formato está explicado en burbuja.py.

El código trabaja con copias (slice) y escribe el resultado en v; en el dibujo todo pasa en las mismas barras:
cada llamada es un tramo (lo de fuera se apaga) partido a la mitad, y al mezclar, cuando la cabeza de la segunda
mitad (b) es menor, salta adelante de lo que queda de la primera (a); si no, la de a ya está en su lugar. Así se
ve igual que v[k] = …: un renglón por casilla escrita. Las llamadas con un solo número no se dibujan (regresan
en la línea 2). Las comparaciones que cuenta son las de dos números: cuando a se acaba, a[i] es undefined y
a[i] <= b[j] da false sin comparar nada (lo explica la lección).
"""

CLAVE = 'mezcla'
TITULO = {'es': 'ORDENAMIENTO POR MEZCLA', 'en': 'MERGE SORT'}
EPISODIO = {'es': 'Ordenar: la mezcla', 'en': 'Sorting: merge sort'}
ARCHIVO = 'mezcla.js'

# El mismo de la lección (src/lib/aprende/algoritmos/a01-ordenar.ts): si cambia uno, cambia el otro.
CODIGO = '''function mezcla(v) {
  if (v.length < 2) return v;
  const m = Math.floor(v.length / 2);
  const a = mezcla(v.slice(0, m));
  const b = mezcla(v.slice(m));
  let i = 0, j = 0;
  for (let k = 0; k < v.length; k++) {
    if (j >= b.length || a[i] <= b[j])
      v[k] = a[i++];
    else v[k] = b[j++];
  }
  return v;
}'''

ARREGLO = [5, 2, 8, 3, 7, 1, 6, 4]   # 17 comparaciones y 24 escrituras
VARIABLE = ({'es': 'TAMAÑO', 'en': 'SIZE'}, 'tam', '{}')
CONTADORES = {'cambia': {'es': 'ESCRITURAS', 'en': 'WRITES'}}


def pasos(v):
    arr = list(v)

    def llamada(ini, fin):   # el tramo [ini, fin)
        tam = fin - ini
        if tam < 2:
            return
        mid = ini + tam // 2
        yield {'tipo': 'rango', 'rango': [ini, fin - 1, mid], 'lineas': [2, 3], 'vars': {'tam': tam}}
        yield from llamada(ini, mid)
        yield from llamada(mid, fin)
        yield {'tipo': 'rango', 'rango': [ini, fin - 1, mid], 'lineas': [6], 'vars': {'tam': tam}, 'ordenados': []}
        a, b = arr[ini:mid], arr[mid:fin]
        i = j = 0
        for k in range(tam):
            pk = ini + k
            escribe = {'orden_mas': pk, 'cuenta': ['cambia']}
            if i < len(a) and j < len(b):
                pb = pk + len(a) - i   # la cabeza de b, detrás de lo que queda de a
                yield {'tipo': 'compara', 'lineas': [8], 'j': pk, 'k': pb, 'flechas': [(pk, 'a[i]'), (pb, 'b[j]')]}
                if a[i] <= b[j]:
                    yield dict(escribe, tipo='coloca', k=pk, lineas=[9]); i += 1
                else:
                    arr.insert(pk, arr.pop(pb))
                    yield dict(escribe, tipo='mueve', de=pb, a=pk, lineas=[10]); j += 1
            elif i < len(a):   # b ya se acabó
                yield dict(escribe, tipo='coloca', k=pk, lineas=[9]); i += 1
            else:              # a ya se acabó: la cabeza de b ya está en su lugar
                yield dict(escribe, tipo='coloca', k=pk, lineas=[10]); j += 1

    yield from llamada(0, len(arr))
    yield {'tipo': 'fin', 'lineas': [12]}


# Comparaciones de burbuja y de mezcla: el arreglo del vídeo y, con 100 y 1 000, los números al azar de la
# lección (semilla 42).
TABLA = {'columnas': [{'es': 'NÚMEROS', 'en': 'NUMBERS'}, {'es': 'BURBUJA', 'en': 'BUBBLE'}, {'es': 'MEZCLA', 'en': 'MERGE'}],
         'filas': [[8, 28, 17], [100, 4950, 542], [1000, 499500, 8714]], 'colores': ['white', 'red', 'lgreen']}
COMPLEJIDAD = 'O(n log n)'
LEYENDA = {'es': 'n EN CADA UNO DE log n NIVELES', 'en': 'n ON EACH OF log n LEVELS'}

GUION = {'es': [
    {'vista': 'inicio', 'cara': 'feliz', 'dice': '¿Se puede ordenar comparando mucho menos? ¡Sí: con el ordenamiento por mezcla!'},
    {'vista': 'codigo', 'cara': 'pensando', 'resalta': [([3], 0.08, 'pasada'), ([4, 5], 0.3, 'pasada'), ([7, 8, 9, 10], 0.62, 'compara')],
     'dice': 'Parte la lista a la mitad, ordena cada mitad y luego las mezcla.'},
    {'pasos': 3, 'cara': 'normal', 'dice': 'Parte y parte, hasta pedazos de uno: ésos ya están ordenados.'},
    {'pasos': 4, 'cara': 'pensando', 'dice': 'Para mezclar compara las cabezas: el 2 es menor y va primero.',
     'voz': 'Para mezclar compara las cabezas: el dos es menor y va primero.'},
    {'pasos': 13, 'cara': 'feliz', 'dice': 'Luego mezcla mitades cada vez más grandes.'},
    {'pasos': 'resto', 'cara': 'sorpresa', 'dice': 'Y así, hasta mezclar la lista completa.'},
    {'vista': 'cuenta', 'filas': [(0, 0.1), (1, 0.45), (2, 0.55)], 'cara': 'sorpresa',
     'dice': 'Sólo 17 comparaciones. Y con mil números, unas 8 700 contra medio millón.',
     'voz': 'Sólo diecisiete comparaciones. Y con mil números, unas ocho mil setecientas contra medio millón.'},
    {'vista': 'cuenta', 'complejidad': 0.55, 'cara': 'pensando',
     'dice': 'Cada nivel recorre la lista una vez, y hay log n niveles: O(n log n).',
     'voz': 'Cada nivel recorre la lista una vez, y hay log de ene niveles: o de ene log ene.'},
    {'vista': 'enlace', 'cara': 'guino', 'dice': 'Pruébalo tú en la lección: ayotl.dev/aprende',
     'voz': 'Pruébalo tú en la lección: áyotl punto dev, diagonal aprende.'},
    {'final': True, 'cara': 'guino', 'dice': '¿Ya estás suscrito? Síguenos para más.'},
], 'en': [
    {'vista': 'inicio', 'cara': 'feliz', 'dice': 'Can you sort with far fewer comparisons? Yes: with merge sort!'},
    {'vista': 'codigo', 'cara': 'pensando', 'resalta': [([3], 0.08, 'pasada'), ([4, 5], 0.3, 'pasada'), ([7, 8, 9, 10], 0.62, 'compara')],
     'dice': 'Split the list in half, sort each half, then merge them.'},
    {'pasos': 3, 'cara': 'normal', 'dice': 'Split and split, down to pieces of one: those are already sorted.'},
    {'pasos': 4, 'cara': 'pensando', 'dice': 'To merge, compare the two heads: the 2 is smaller, so it goes first.',
     'voz': 'To merge, compare the two heads: the two is smaller, so it goes first.'},
    {'pasos': 13, 'cara': 'feliz', 'dice': 'Then it merges bigger and bigger halves.'},
    {'pasos': 'resto', 'cara': 'sorpresa', 'dice': 'All the way up to the whole list.'},
    {'vista': 'cuenta', 'filas': [(0, 0.1), (1, 0.45), (2, 0.55)], 'cara': 'sorpresa',
     'dice': 'Only 17 comparisons. And with a thousand numbers, about 8,700 versus half a million.',
     'voz': 'Only seventeen comparisons. And with a thousand numbers, about eight thousand seven hundred versus half a million.'},
    {'vista': 'cuenta', 'complejidad': 0.55, 'cara': 'pensando',
     'dice': 'Each level walks the list once, and there are log n levels: O(n log n).',
     'voz': 'Each level walks the list once, and there are log n levels: O of n log n.'},
    {'vista': 'enlace', 'cara': 'guino', 'dice': 'Try it yourself in the lesson: ayotl.dev/en/learn',
     'voz': 'Try it yourself in the lesson, at Ah-yotl dot dev.'},
    {'final': True, 'cara': 'guino', 'dice': 'Are you subscribed yet? Follow us for more.'},
]}
