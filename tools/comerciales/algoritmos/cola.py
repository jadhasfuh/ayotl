"""La cola (queue) con la fila de la tortillería: «Algoritmos en pixel» (16-nov-2026). El formato está explicado
en burbuja.py y la vista, en cajas.py (pila.py es su otro modelo): aquí FORMA = 'cola', un tubo acostado al que
se entra por atrás (la derecha) y del que se sale por delante.

El programa no recorre nada: llegan Ana, Beto y Caro (push), se atiende a Ana (shift), llega Dani y queda atrás,
se atiende a Beto y esperan Caro y Dani. No hay cinta; en su lugar va la consola con lo que escribe console.log.
Antes, una demostración sin programa (entran 1, 2 y 3 y sale el 1) para la pregunta del principio. El remate es
el de la lección: cada shift recorre a todos los que quedan (la tabla, O(n)) y el truco es un índice `cabeza` que
avanza sin mover a nadie (la ventana del índice, O(1)).
"""

CLAVE = 'cola'
VISTA = 'cajas'
FORMA = 'cola'
TITULO = {'es': 'LA COLA (QUEUE)', 'en': 'THE QUEUE'}
EPISODIO = {'es': 'Estructuras: la cola', 'en': 'Data structures: queue'}   # el lema de la tarjeta final
ARCHIVO = 'cola.js'
# la lección está en el curso de estructuras de datos (comprobadas el 16-nov: 200)
RUTA = {'es': '/aprende/estructuras-de-datos/colas', 'en': '/en/learn/estructuras-de-datos/colas'}

# El primero de la lección «colas» (src/lib/aprende/estructuras/u03-pilas-y-colas.ts, «Se entra por atrás, se sale
# por delante»), cada idioma con el suyo, que allá sólo cambian los textos. En español los dos renglones de
# `console.log("atiendo a", fila.shift());` miden 39 letras y van partidos en dos; en inglés ("serving") miden 37
# y van enteros: por eso los pasos de abajo dicen sus líneas por idioma. Si cambia uno, cambia el otro.
CODIGO = {'es': '''const fila = [];
fila.push("Ana");
fila.push("Beto");
fila.push("Caro");

console.log("atiendo a",
  fila.shift());
fila.push("Dani");
console.log("atiendo a",
  fila.shift());
console.log("esperan:", fila);''',
          'en': '''const fila = [];
fila.push("Ana");
fila.push("Beto");
fila.push("Caro");

console.log("serving", fila.shift());
fila.push("Dani");
console.log("serving", fila.shift());
console.log("waiting:", fila);'''}

ARREGLO = []   # sin cinta: los nombres están en el programa
# la variable de la izquierda: a cuántos recorrió el último shift (todos los que quedaban)
VARIABLE = ({'es': 'SE RECORREN', 'en': 'THEY MOVE'}, 'm', '{}')
CONTADORES = {'compara': {'es': 'PUSH (LLEGA)', 'en': 'PUSH'}, 'cambia': {'es': 'SHIFT (SALE)', 'en': 'SHIFT'}}
ROTULO_CAJAS = {'es': 'COLA', 'en': 'QUEUE'}
COLORES = {'Ana': 'yellow', 'Beto': 'pink', 'Caro': 'cyan', 'Dani': 'orange'}   # cada quien con su color


def impreso(arreglo):
    """Un arreglo como lo escribe console.log en la lección (public/aprende/ejecutor.js, igual que Node)."""
    return '[ ' + ', '.join(f"'{x}'" for x in arreglo) + ' ]' if arreglo else '[]'


def pasos(_):
    """La demostración (entran 1, 2 y 3 y sale el 1: no suman a los contadores) y luego lo mismo que CODIGO, paso
    por paso. `lineas` va por idioma desde el primer console.log, que en español ocupa dos renglones."""
    L = lambda es, en: {'es': [es], 'en': [en]}
    for v in (1, 2, 3):
        yield {'tipo': 'mete', 'v': v, 'cuenta': []}
    yield {'tipo': 'saca', 'cuenta': []}
    yield {'tipo': 'caso', 'texto': '', 'lineas': [1]}
    fila = []
    for i, nombre in enumerate(('Ana', 'Beto', 'Caro')):
        fila.append(nombre)
        yield {'tipo': 'mete', 'v': nombre, 'lineas': [2 + i]}

    def atiende(shift, log):   # primero corre fila.shift() y luego console.log escribe lo que salió
        sale = fila.pop(0)
        yield {'tipo': 'saca', 'lineas': shift, 'vars': {'m': len(fila)}}
        yield {'tipo': 'imprime', 'texto': {'es': f'atiendo a {sale}', 'en': f'serving {sale}'}, 'lineas': log}

    # «¿a quién atiendo?»: la línea se queda un momento antes de que corra el shift (`peso`: más tiempo que otra)
    yield {'tipo': 'linea', 'color': 'imprime', 'lineas': L(6, 6), 'peso': 1.2}
    yield from atiende(L(7, 6), L(6, 6))
    fila.append('Dani')
    yield {'tipo': 'mete', 'v': 'Dani', 'lineas': L(8, 7)}
    yield from atiende(L(10, 8), L(9, 8))
    yield {'tipo': 'imprime', 'texto': {'es': 'esperan: ' + impreso(fila), 'en': 'waiting: ' + impreso(fila)},
           'lineas': L(11, 9)}


# por qué shift sale caro: recorre a todos los que quedan (con 2 en la fila, 2; con cien mil, cien mil)
TABLA = {'columnas': [{'es': 'QUEDAN', 'en': 'LEFT IN LINE'}, {'es': 'shift RECORRE A', 'en': 'shift MOVES'}],
         'filas': [[2, 2], [1000, 1000], [100000, 100000]], 'colores': ['white', 'orange']}
COMPLEJIDAD = 'O(n)'
COMPLEJIDAD_MALA = True   # en rojo y con el sonido de perder, como las n²
LEYENDA = {'es': 'CADA shift RECORRE A TODOS', 'en': 'EVERY shift MOVES EVERYONE'}
# el truco de la lección («Una cola O(1) con un índice»): la línea es la de su clase Cola
INDICE = {'titulo': {'es': 'EL TRUCO: UN ÍNDICE QUE AVANZA', 'en': 'THE TRICK: AN INDEX THAT ADVANCES'},
          'codigo': 'const x = this.datos[this.cabeza++];', 'valores': ['Ana', 'Beto', 'Caro', 'Dani'],
          'nombre': 'cabeza', 'O': 'O(1)', 'leyenda': {'es': 'NADIE SE MUEVE', 'en': 'NOBODY MOVES'}}
USOS = {'titulo': {'es': 'TAMBIÉN SON COLAS:', 'en': 'THESE ARE QUEUES TOO:'},
        'filas': [({'es': 'LA COLA DE IMPRESIÓN', 'en': 'THE PRINT QUEUE'},
                   {'es': 'IMPRIME EN ORDEN DE LLEGADA', 'en': 'PRINTS IN ORDER OF ARRIVAL'}),
                  ({'es': 'TUS MENSAJES', 'en': 'YOUR MESSAGES'},
                   {'es': 'LLEGAN EN EL ORDEN EN QUE SALIERON', 'en': 'ARRIVE IN THE ORDER THEY WERE SENT'}),
                  ({'es': 'RECORRER UN LABERINTO', 'en': 'EXPLORING A MAZE'},
                   {'es': 'POR CAPAS: MUY PRONTO, AQUÍ', 'en': 'LAYER BY LAYER: COMING SOON'})]}

# Lo que dice LeIA (ver burbuja.py). Los pasos: 4 de la demostración; 1 (const fila) + 3 que llegan; 2 por cada
# «atiendo a» (el shift y lo que escribe), y uno más antes del primero, para la pregunta; 1 de Dani; 1 del último
# console.log.
GUION = {'es': [
    {'pasos': 4, 'cara': 'feliz', 'dice': '¿Quién sigue en la fila de las tortillas? ¡El que llegó primero!'},
    {'pasos': 4, 'cara': 'normal', 'dice': 'Eso es una cola. Llegan Ana, Beto y Caro: con push se forman atrás.'},
    {'pasos': 3, 'cara': 'pensando', 'dice': '¿A quién atiendo? Con shift sale la de adelante: ¡Ana!'},
    {'pasos': 1, 'cara': 'normal', 'dice': 'Llega Dani y se forma hasta atrás.'},
    {'pasos': 2, 'cara': 'feliz', 'dice': 'Sigue Beto. ¡Aquí nadie se cuela!'},
    {'pasos': 'resto', 'cara': 'normal', 'dice': 'Y esperan Caro y Dani, en el orden en que llegaron.'},
    {'vista': 'cuenta', 'filas': [(0, 0.1), (1, 0.5), (2, 0.62)], 'complejidad': 0.82, 'cara': 'sorpresa',
     'dice': 'Pero ojo: cada shift recorre a todos los demás. Con cien mil en la fila, ¡cien mil pasos!'},
    {'vista': 'indice', 'avanza': [0.42, 0.6], 'remate': 0.8, 'cara': 'pensando',
     'dice': 'El truco: un índice, cabeza, que avanza solo. Nadie se mueve: O(1).',
     'voz': 'El truco: un índice, cabeza, que avanza solo. Nadie se mueve: o de uno.'},
    {'vista': 'usos', 'usos': [(0, 0.1), (1, 0.3), (2, 0.55)], 'cara': 'feliz',
     'dice': 'Así trabajan la impresora y tus mensajes. ¡Y así se recorre un laberinto! Eso viene pronto.'},
    {'vista': 'enlace', 'cara': 'guino', 'dice': 'Pruébalo tú en la lección: ayotl.dev/aprende',
     'voz': 'Pruébalo tú en la lección: áyotl punto dev, diagonal aprende.'},
    {'final': True, 'cara': 'guino', 'dice': '¿Ya estás suscrito? Síguenos para más.'},
]}

GUION['en'] = [
    {'pasos': 4, 'cara': 'feliz', 'dice': "Who's next in line for tortillas? Whoever got there first!"},
    {'pasos': 4, 'cara': 'normal', 'dice': "That's a queue. Ana, Beto and Caro arrive: push sends them to the back."},
    {'pasos': 3, 'cara': 'pensando', 'dice': 'Who do I serve? Shift takes the one in front: Ana!'},
    {'pasos': 1, 'cara': 'normal', 'dice': 'Dani arrives and goes to the very back.'},
    {'pasos': 2, 'cara': 'feliz', 'dice': 'Beto is next. No cutting in line!'},
    {'pasos': 'resto', 'cara': 'normal', 'dice': 'Caro and Dani are waiting, in the order they arrived.'},
    {'vista': 'cuenta', 'filas': [(0, 0.1), (1, 0.5), (2, 0.62)], 'complejidad': 0.82, 'cara': 'sorpresa',
     'dice': 'But watch out: every shift moves everyone else. A hundred thousand in line, a hundred thousand steps!'},
    {'vista': 'indice', 'avanza': [0.42, 0.6], 'remate': 0.8, 'cara': 'pensando',
     'dice': 'The trick: an index, cabeza (the head), that just moves ahead. Nobody moves: O(1).',
     'voz': 'The trick: an index, the head, that just moves ahead. Nobody moves: O of one.'},
    {'vista': 'usos', 'usos': [(0, 0.1), (1, 0.3), (2, 0.55)], 'cara': 'feliz',
     'dice': "That's how printers and your messages work. And how you explore a maze! That's coming soon."},
    {'vista': 'enlace', 'cara': 'guino', 'dice': 'Try it yourself in the lesson: ayotl.dev/en/learn',
     'voz': 'Try it yourself in the lesson, at Ah-yotl dot dev.'},
    {'final': True, 'cara': 'guino', 'dice': 'Are you subscribed yet? Follow us for more.'},
]
