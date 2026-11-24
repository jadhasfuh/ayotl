"""Lo que usa el archivo de cada vídeo de «Programando …» (snake1.py es el modelo): las versiones del código y los renglones."""


def _donde(texto, ancla):
    """El renglón que lleva `ancla`: tiene que haber uno y sólo uno."""
    ls = texto.split('\n')
    cuales = [i for i, l in enumerate(ls) if ancla in l]
    if len(cuales) != 1:
        raise SystemExit(f'«{ancla}» está en {len(cuales)} renglones')
    return ls, cuales[0]


def tras(texto, ancla, nuevo, quita=0):
    """El texto con `nuevo` después del renglón que lleva `ancla` (y quitando los `quita` que le siguen)."""
    ls, i = _donde(texto, ancla)
    return '\n'.join(ls[:i + 1] + nuevo.split('\n') + ls[i + 1 + quita:])


def antes(texto, ancla, nuevo):
    """El texto con `nuevo` antes del renglón que es `ancla`, entero, o que la lleva."""
    ls = texto.split('\n')
    cuales = [i for i, l in enumerate(ls) if l == ancla] or [i for i, l in enumerate(ls) if ancla in l]
    if len(cuales) != 1:
        raise SystemExit(f'«{ancla}» está en {len(cuales)} renglones')
    return '\n'.join(ls[:cuales[0]] + nuevo.split('\n') + ls[cuales[0]:])


def cambia(texto, viejo, nuevo):
    """El texto con el renglón `viejo` (entero) cambiado por `nuevo`."""
    ls = texto.split('\n')
    cuales = [i for i, l in enumerate(ls) if l == viejo]
    if len(cuales) != 1:
        raise SystemExit(f'«{viejo}» está en {len(cuales)} renglones')
    return '\n'.join(ls[:cuales[0]] + nuevo.split('\n') + ls[cuales[0] + 1:])


def P(dice, voz=None, cara='normal', ed=None, ve=None, resalta=(), corre=None, corre2=None, panel=None, vista='editor',
      cap=None, dur=0, final=False):
    """Un renglón de lo que dice LeIA y lo que se ve mientras:
    - `dice` (lo que se lee) y `voz` (lo que se pronuncia, si es otra cosa), `cara`;
    - `ed`: (archivo, versión nueva) o una lista: se escribe en el editor; `ve`: el archivo que se enseña, si no es ése;
    - `resalta`: [(texto del renglón, o (del, al), fracción del renglón en la que empieza)];
    - `corre`: lo que corre a la derecha: {'id', 'desde' (fracción en la que arranca), 'teclas': [(segundo, code, cuánto)],
      'manual': [(segundo, js)], 'semilla', 'bot', 'quieto', 'lento' (cuántas veces más despacio), 'dc'} la primera vez, y
      su id en los renglones en los que sigue (si no se dice, se queda en su último cuadro); `corre2`, la de la derecha en
      la vista «dos»;
    - `panel`: el dibujo de la derecha (armar.py, PANELES) y sus datos; sin él, la pantalla a 3x;
    - `vista`: editor, portada, juego o dos; `cap`: el capítulo que empieza; `dur`: lo menos que dura."""
    return {'dice': dice, 'voz': voz or dice, 'cara': cara, 'ed': [ed] if isinstance(ed, tuple) else list(ed or []), 've': ve,
            'resalta': list(resalta), 'corre': corre, 'corre2': corre2, 'panel': panel, 'vista': vista, 'cap': cap, 'dur': dur,
            'final': final}
