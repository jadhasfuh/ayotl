"""La pila (stack) con los paréntesis que cierran bien: «Algoritmos en pixel» (16-nov-2026). El formato está
explicado en burbuja.py; lo que cambia es la vista: VISTA = 'cajas' (cajas.py), que en vez de barras dibuja la
cinta con la cadena y una pila de cajas. Es el modelo para la cola (FORMA = 'cola').

El programa recorre la cadena: lo que abre se mete a la pila; al cerrar se saca lo de arriba, que tiene que ser
su pareja. Dos casos, los de la lección: `([{}])` (tres entran, tres salen: true) y `([)]` (al llegar el `)`
arriba hay un `[`: false). Antes, una demostración sin programa: entran 1, 2 y 3 y salen 3, 2 y 1.
"""

CLAVE = 'pila'
VISTA = 'cajas'
FORMA = 'pila'
TITULO = {'es': 'LA PILA (STACK)', 'en': 'THE STACK'}
EPISODIO = {'es': 'Estructuras: la pila', 'en': 'Data structures: stack'}   # el lema de la tarjeta final
ARCHIVO = 'pila.js'
# la lección no está en /aprende/algoritmos, sino en el curso de estructuras de datos (comprobadas el 16-nov: 200)
RUTA = {'es': '/aprende/estructuras-de-datos/pilas', 'en': '/en/learn/estructuras-de-datos/pilas'}

# El de la lección «pilas» (src/lib/aprende/estructuras/u03-pilas-y-colas.ts, «Paréntesis que cierran bien»), con
# las mismas palabras y en el mismo orden: allá tres renglones pasan de 37 caracteres (el de `pareja`, el `if`
# de los que abren y el `return false` con su comentario), así que aquí van partidos en dos y sin los dos
# comentarios. Si cambia uno, cambia el otro.
CODIGO = '''function balanceado(s) {
  const pareja =
    { ")": "(", "]": "[", "}": "{" };
  const pila = [];
  for (const c of s) {
    if (c === "(" || c === "[" ||
        c === "{") pila.push(c);
    else if (c in pareja) {
      if (pila.pop() !== pareja[c])
        return false;
    }
  }
  return pila.length === 0;
}'''

ARREGLO = ['([{}])', '([)]']   # los casos: el primero cierra bien (3 push, 3 pop); el segundo falla en el `)`
PAREJA = {')': '(', ']': '[', '}': '{'}
VARIABLE = ({'es': 'LETRA', 'en': 'CHAR'}, 'c')
CONTADORES = {'compara': {'es': 'PUSH (METE)', 'en': 'PUSH'}, 'cambia': {'es': 'POP (SACA)', 'en': 'POP'}}
ROTULO_CAJAS = {'es': 'PILA', 'en': 'STACK'}
ROTULO_CINTA = {'es': 'LA CADENA s', 'en': 'THE STRING s'}
# cada pareja de un color, para que se vea de lejos quién cierra a quién (en la fuente pixel `(` y `{` se parecen)
COLORES = {'(': 'yellow', ')': 'yellow', '[': 'pink', ']': 'pink', '{': 'cyan', '}': 'cyan'}


def pasos(casos):
    """La demostración (entran 1, 2 y 3; salen 3, 2 y 1: no suman a los contadores, todavía no corre nada) y luego
    lo mismo que CODIGO con cada caso, paso por paso. `lineas`: las que corren en ese paso (de 1 en adelante)."""
    for v in (1, 2, 3):
        yield {'tipo': 'mete', 'v': v, 'lineas': [7], 'cuenta': []}
    for _ in range(3):
        yield {'tipo': 'saca', 'lineas': [9], 'cuenta': []}
    for s in casos:
        yield {'tipo': 'caso', 'texto': s, 'lineas': [1, 4]}
        pila = []; falla = False
        for i, c in enumerate(s):
            yield {'tipo': 'lee', 'i': i, 'lineas': [5], 'vars': {'c': c}}
            # la pregunta va en su paso y la caja se mueve en el siguiente: el contador suma cuando corre su línea
            if c in '([{':
                yield {'tipo': 'linea', 'color': 'mete', 'lineas': [6]}
                pila.append(c)
                yield {'tipo': 'mete', 'v': c, 'de': i, 'lineas': [7]}
            elif c in PAREJA:
                yield {'tipo': 'linea', 'color': 'saca', 'lineas': [8]}
                if not pila:   # pop() de una pila vacía da undefined: tampoco es su pareja
                    falla = True
                else:
                    arriba = pila.pop(); falla = arriba != PAREJA[c]
                    yield {'tipo': 'saca', 'con': i, 'ok': not falla, 'lineas': [9]}
                if falla:
                    yield {'tipo': 'resultado', 'valor': 'false', 'ok': False, 'color': 'mal', 'lineas': [10]}
                    break
        if not falla:
            bien = not pila
            yield {'tipo': 'resultado', 'valor': 'true' if bien else 'false', 'ok': bien, 'lineas': [13],
                   **({} if bien else {'color': 'mal'})}


# meter o sacar no depende de cuántas cajas haya: siempre es mover lo de arriba
TABLA = {'columnas': [{'es': 'CAJAS', 'en': 'BOXES'}, {'es': 'PASOS: METER O SACAR', 'en': 'STEPS: PUSH OR POP'}],
         'filas': [[3, 1], [1000, 1], [100000, 1]], 'colores': ['white', 'lgreen']}
COMPLEJIDAD = 'O(1)'
LEYENDA = {'es': 'NO IMPORTA EL TAMAÑO DE LA PILA', 'en': 'NO MATTER HOW TALL THE STACK'}
# para qué sirve: la ventana de la vista 'usos' (renglón grande, explicación chica)
USOS = {'titulo': {'es': 'TAMBIÉN SON PILAS:', 'en': 'THESE ARE STACKS TOO:'},
        'filas': [({'es': 'DESHACER (CTRL+Z)', 'en': 'UNDO (CTRL+Z)'},
                   {'es': 'QUITA LO ÚLTIMO QUE HICISTE', 'en': 'REMOVES THE LAST THING YOU DID'}),
                  ({'es': 'EL BOTÓN DE ATRÁS', 'en': 'THE BACK BUTTON'},
                   {'es': 'VUELVE A LA ÚLTIMA PÁGINA', 'en': 'RETURNS TO THE LAST PAGE'})]}

# Lo que dice LeIA (ver burbuja.py). Los pasos: 3 + 3 de la demostración; cada letra son tres (leerla, la pregunta
# y meter o sacar), así que el primer caso son 1 (caso) + 9 (los tres que abren) + 9 (los tres que cierran) + 1
# (true), y el segundo, 1 + 6 + 3 + 1 (false).
GUION = {'es': [
    {'vista': 'inicio', 'cara': 'feliz',
     'dice': '¿Cómo sabe tu editor que te faltó cerrar una llave? ¡Con una pila!'},
    {'pasos': 3, 'cara': 'normal', 'dice': 'Una pila es una torre: con push, cada caja entra por arriba.'},
    {'pasos': 3, 'cara': 'sorpresa', 'dice': 'Y con pop sale la de arriba: ¡la última que entró!'},
    {'vista': 'codigo', 'cara': 'pensando', 'resalta': [([6, 7], 0.04, 'mete'), ([8, 9], 0.36, 'saca')],
     'dice': 'Si abre, se mete. Si cierra, se saca la de arriba: ¡tiene que ser su pareja!'},
    {'pasos': 10, 'cara': 'normal', 'dice': 'Abre, abre y abre: los tres van a la pila.'},
    {'pasos': 3, 'cara': 'pensando', 'dice': 'Cierra la llave: ¿qué hay arriba? ¡Su pareja!'},
    {'pasos': 6, 'cara': 'feliz', 'dice': 'El corchete y el paréntesis también encuentran a su pareja.'},
    {'pasos': 1, 'cara': 'feliz', 'dice': 'Pila vacía: ¡todo cerró bien!'},
    {'pasos': 7, 'cara': 'pensando', 'dice': '¿Y este otro? Abre paréntesis, abre corchete…'},
    {'pasos': 'resto', 'cara': 'sorpresa',
     'dice': 'Cierra el paréntesis, ¡pero arriba hay un corchete! Está mal cerrado.'},
    {'vista': 'usos', 'usos': [(0, 0.12), (1, 0.4)], 'cara': 'feliz',
     'dice': 'Así funcionan deshacer y el botón de atrás: sale lo último que entró.'},
    {'vista': 'cuenta', 'filas': [(0, 0.1), (1, 0.42), (2, 0.55)], 'complejidad': 0.8, 'cara': 'pensando',
     'dice': 'Y meter o sacar es un solo paso, haya tres cajas o cien mil: O(1).',
     'voz': 'Y meter o sacar es un solo paso, haya tres cajas o cien mil: o de uno.'},
    {'vista': 'enlace', 'cara': 'guino', 'dice': 'Pruébalo tú en la lección: ayotl.dev/aprende',
     'voz': 'Pruébalo tú en la lección: áyotl punto dev, diagonal aprende.'},
    {'final': True, 'cara': 'guino', 'dice': '¿Ya estás suscrito? Síguenos para más.'},
]}

GUION['en'] = [
    {'vista': 'inicio', 'cara': 'feliz',
     'dice': 'How does your editor know you forgot to close a brace? With a stack!'},
    {'pasos': 3, 'cara': 'normal', 'dice': 'A stack is a tower: push puts each box on top.'},
    {'pasos': 3, 'cara': 'sorpresa', 'dice': 'And pop takes the top one off: the last one in!'},
    {'vista': 'codigo', 'cara': 'pensando', 'resalta': [([6, 7], 0.04, 'mete'), ([8, 9], 0.36, 'saca')],
     'dice': 'An opener gets pushed. A closer pops the top one: it has to be its partner!'},
    {'pasos': 10, 'cara': 'normal', 'dice': 'Open, open, open: all three go on the stack.'},
    {'pasos': 3, 'cara': 'pensando', 'dice': "A closing brace: what's on top? Its partner!"},
    {'pasos': 6, 'cara': 'feliz', 'dice': 'The bracket and the parenthesis find their partners too.'},
    {'pasos': 1, 'cara': 'feliz', 'dice': 'Empty stack: everything closed properly!'},
    {'pasos': 7, 'cara': 'pensando', 'dice': 'What about this one? Open parenthesis, open bracket…'},
    {'pasos': 'resto', 'cara': 'sorpresa',
     'dice': "A closing parenthesis, but there's a bracket on top! Not properly closed."},
    {'vista': 'usos', 'usos': [(0, 0.12), (1, 0.4)], 'cara': 'feliz',
     'dice': "That's how undo and the back button work: last in, first out."},
    {'vista': 'cuenta', 'filas': [(0, 0.1), (1, 0.42), (2, 0.55)], 'complejidad': 0.8, 'cara': 'pensando',
     'dice': 'And push or pop is a single step, with three boxes or a hundred thousand: O(1).',
     'voz': 'And push or pop is a single step, with three boxes or a hundred thousand: O of one.'},
    {'vista': 'enlace', 'cara': 'guino', 'dice': 'Try it yourself in the lesson: ayotl.dev/en/learn',
     'voz': 'Try it yourself in the lesson, at Ah-yotl dot dev.'},
    {'final': True, 'cara': 'guino', 'dice': 'Are you subscribed yet? Follow us for more.'},
]
