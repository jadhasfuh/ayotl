#!/usr/bin/env python3
"""Lo que LeIA dice de nuevo cada día, escrito con la API de Claude (14-nov-2026).

Adrián: «podemos empezar con LeIA y el contenido de Daily con los créditos, límite a 100». El plan Max trae 100 USD
de crédito de API al mes (se pierde lo que no se gasta); la organización de la consola no tiene método de pago, así
que al acabarse el crédito la API contesta con error y aquí no pasa nada: LeIA sigue con sus plantillas.

Sin llave: el SDK toma la sesión de `ant auth login` (~/.config/anthropic). Si no hay sesión, no hay red o se pasa
el tope del mes, frescos() devuelve None y leia-mejor-del-dia.py arma el vídeo igual que antes.

  "/Users/jadhasfuh/Documents/code challenge/.venv/bin/python" tools/comerciales/leia_ia.py [AAAA-MM-DD] [--rehacer]
      escribe (o lee) mejor/<fecha>/ia.json, lo imprime y dice cuánto costó y cuánto va del mes
  ... leia_ia.py --gasto      sólo cuánto va del mes

Qué pide, una vez por partida y en los tres idiomas a la vez:
- chistes: chistes malos de IA nuevos, de preferencia con el juego del día (los de plantilla se repetían cada 11 días);
- comentarios: lo que LeIA comenta de ESA partida, sólo con los datos que le pasamos (puntos por tramo, vidas,
  rondas, el segundo lugar, el récord anterior…), cada uno con el segundo desde el que ya se puede decir. Nada de historia del juego: eso sale de datos-juegos.json y
  curiosidades-juegos.json, que están revisados.
Lo que ya dijo en días pasados va en ia-dichos.json para que no se repita. Cada llamada se apunta en ia-gasto.jsonl.
"""
import json, os, re, sys
from datetime import date, datetime, timedelta, timezone

AQUI = os.path.dirname(os.path.abspath(__file__))
MX = timezone(timedelta(hours=-6))
MODELO = 'claude-opus-5-5'
# USD por millón de tokens (lista de precios del 3-nov-2026): entrada, salida, escribir caché, leer caché
PRECIO = {'claude-opus-5-5': (4.0, 20.0, 5.0, 0.20)}
TOPE_MES = 100.0            # USD: el crédito mensual del plan; pasado esto ni se intenta
GASTO = os.path.join(AQUI, 'ia-gasto.jsonl')
DICHOS = os.path.join(AQUI, 'ia-dichos.json')
RECORDAR = 60               # cuántos chistes pasados se le mandan para que no los repita
LARGO = {'es': 170, 'en': 170, 'ja': 80}   # letras por frase: más largo no cabe en un hueco de la partida
FICHAS = ('nombre', 'juego', 'dc', 'leia')

SISTEMA = """Escribes lo que dice LeIA, la presentadora de los vídeos cortos de Daily Challenge (dailychallenge.click): \
un sitio con un minijuego arcade nuevo cada día, donde todos juegan el mismo juego y gana quien haga más puntos. \
En cada vídeo se ve entera la partida del mejor jugador de ese día y LeIA la va comentando con voz sintética, \
dentro de un cuadro de diálogo de juego de rol con letra pixel.

LeIA es una inteligencia artificial y lo dice sin pena: alegre, un poco burlona, cariñosa con quien juega, y \
aficionada a los chistes malos (juegos de palabras de computadoras, de IA o del juego del día, del tipo «¿Qué le \
dijo un bit a otro bit? Nos vemos en el bus»). Habla a un público general, también niños: nada grosero, nada de \
política, religión, marcas ajenas ni personas reales, y nunca se burla del jugador de forma hiriente.

Vas a recibir los datos de una partida y devolverás, para español (de México), inglés y japonés:
- `chistes`: 3 chistes malos nuevos. Al menos uno debe salir del juego del día (su tema, sus piezas, su nombre). \
Cada idioma lleva su propio chiste pensado en ese idioma: un juego de palabras casi nunca sobrevive a la \
traducción, así que no traduzcas, escribe otro que funcione. En japonés, ダジャレ.
- `comentarios`: 4 comentarios sobre ESTA partida, apoyados sólo en los datos recibidos (cuántos puntos llevaba a \
la mitad, en qué segundo perdió una vida, por cuánto le ganó al segundo, cuánto mejoró el récord…). Cada uno trae \
el mismo comentario en los tres idiomas, dicho con naturalidad en cada uno, y `desde_segundo`: el segundo de la \
partida a partir del cual ya se puede decir, que es el del último momento que menciona (si habla de lo que pasó \
entre el segundo 67 y el 100, es 100; si vale para toda la partida, como el récord anterior, es 0). El programa lo \
dice en el primer hueco que encuentre después de ese segundo, así que escríbelo en pasado, como quien acaba de \
verlo. Que al menos dos se puedan decir en la primera mitad de la partida. Como mucho dos cifras por comentario: \
se oyen, no se leen. No inventes nada que no esté en los datos, no supongas causas ni intenciones (por qué subió o bajó el ritmo, qué \
estaba pensando) y no cuentes historia \
ni curiosidades del juego: eso ya lo dice LeIA con textos revisados. No repitas lo que ya va a decir (viene en \
`ya_dice`): ni el puntaje final con su tiempo, ni quién quedó segundo, ni cuántas personas jugaron. Tampoco \
adelantes cómo acaba la partida ni el puntaje final: quien ve el vídeo todavía no lo sabe. Cada comentario se \
entiende solo.

Cómo se escribe cada frase:
- Se oye en voz alta: frases cortas, de una o dos oraciones, sin paréntesis, sin emojis, sin comillas raras, sin \
listas. Máximo 170 letras en español e inglés y 80 en japonés.
- Los chistes no llevan introducción («¿te cuento un chiste?»): eso lo pone el programa.
- Para nombrar al jugador, al juego, al sitio o a ella misma usa estas fichas tal cual, con llaves: {nombre}, \
{juego}, {dc}, {leia}. El programa las cambia por el nombre escrito y por su pronunciación. No escribas esos \
nombres de otra forma y no uses llaves para nada más.
- Los números van con cifras; los de cuatro cifras o más, con coma de millares (2,117).
- En japonés usa です/ます con tono alegre (como una presentadora de juegos), kanji de uso común y nada de \
alfabeto latino fuera de las fichas."""


def _gastado(mes=None):
    """Lo gastado (USD) en el mes `AAAA-MM` de la bitácora; por omisión, el mes en curso."""
    mes = mes or datetime.now(MX).strftime('%Y-%m')
    total = 0.0
    if os.path.exists(GASTO):
        for linea in open(GASTO, encoding='utf-8'):
            try:
                r = json.loads(linea)
            except ValueError:
                continue
            if str(r.get('cuando', '')).startswith(mes):
                total += r.get('usd', 0.0)
    return total


def _apuntar(para, modelo, uso):
    """Una línea en ia-gasto.jsonl con los tokens y lo que costó la llamada. Devuelve los USD."""
    ent, sal, esc, lee = PRECIO.get(modelo, PRECIO[MODELO])
    u = lambda k: getattr(uso, k, None) or 0
    usd = (u('input_tokens') * ent + u('output_tokens') * sal
           + u('cache_creation_input_tokens') * esc + u('cache_read_input_tokens') * lee) / 1e6
    with open(GASTO, 'a', encoding='utf-8') as f:
        f.write(json.dumps({'cuando': datetime.now(MX).isoformat(timespec='seconds'), 'para': para, 'modelo': modelo,
                            'entrada': u('input_tokens'), 'salida': u('output_tokens'), 'usd': round(usd, 5)}) + '\n')
    return usd


def _resumen(info, datos):
    """Los datos de la partida que ve el modelo: sólo lo que LeIA puede comentar sin inventar."""
    mk = info.get('marcador') or []; T = info['fin']; ctx = info.get('contexto') or {}
    en = lambda s: mk[min(int(s), len(mk) - 1)] if mk else None
    j = datos['juegos'][info['juego']]
    return {
        'juego': info['titulo'], 'de_que_trata': re.sub(r'\{([^|{}]+)\|[^{}]+\}', r'\1', j['es']['largo']),
        'fecha': info['fecha'], 'puntaje_final': info['puntaje'], 'duracion_s': round(T),
        'puntos_al_segundo': {str(round(T * f)): en(T * f) for f in (0.25, 0.5, 0.75)},
        'eventos': [{k: v for k, v in e.items() if k in ('t', 'tipo', 'quedan', 'n', 'campo')} for e in info.get('eventos', [])][:40],
        'record_anterior_del_juego': ctx.get('record_antes'),
        'segundo_lugar': ctx.get('segundo'), 'jugadores_ese_dia': ctx.get('jugadores'),
        'intento_numero': ctx.get('intento'), 'dias_que_ha_ganado_el_jugador': ctx.get('dias_ganados'),
        'ya_dice': ['el puntaje final y cuánto duró la partida', 'quién quedó en segundo lugar y con cuántos puntos',
                    'cuántas personas jugaron ese día', 'en qué intento lo logró', 'cuántos días ha ganado',
                    'cuando pierde una vida o pasa de nivel, en el momento', 'el récord del juego',
                    'cuántas veces ha salido ese juego como juego del día'],
    }


def _limpia(frase, lang):
    """La frase lista para marcar(), o None si no sirve: sin llaves que no sean las fichas, del largo que cabe y,
    en japonés, sin alfabeto latino. Los millares van como {2,117|2117} para que la voz no lea la coma."""
    s = ' '.join(str(frase).split())
    if not s or len(s) > LARGO[lang]:
        return None
    resto = re.sub(r'\{(%s)\}' % '|'.join(FICHAS), '', s)
    if '{' in resto or '}' in resto or '|' in resto:
        return None
    if lang == 'ja' and re.search(r'[A-Za-z]', resto):
        return None
    return re.sub(r'(?<![\d,{|])(\d{1,3}(?:,\d{3})+)(?![\d,}|])', lambda m: '{%s|%s}' % (m.group(1), m.group(1).replace(',', '')), s)


def poner(frase, valores):
    """Las fichas de una frase de la IA cambiadas por su {escrito|dicho}, como marcar() pero sin str.format: una
    frase del modelo no es una plantilla nuestra y no debe poder romper el guion."""
    def ficha(m):
        v = valores.get(m.group(1))
        if not v or v[1] is None:
            return m.group(0)
        return v[0] if v[0] == v[1] else '{%s|%s}' % v
    return re.sub(r'\{(%s)\}' % '|'.join(FICHAS), ficha, frase)


def sirve(frase, valores):
    """Que no quede ninguna ficha sin poner (un jugador sin pronunciación en japonés, por ejemplo)."""
    return not re.search(r'\{(%s)\}' % '|'.join(FICHAS), poner(frase, valores))


def frescos(fecha, info, datos, carpeta, rehacer=False, avisar=print, plantilla=None):
    """{'es': {'chistes': [frase…], 'comentarios': [{'texto', 'desde'}…]}, 'en': …, 'ja': …} para la partida, o None
    (`desde`: el segundo de la partida a partir del cual el comentario ya se puede decir). Lo guarda en
    <carpeta>/ia.json: rehacer el vídeo de un día no vuelve a gastar ni cambia lo que dice. `plantilla`: los chistes
    fijos de cada idioma, que también cuentan como ya contados."""
    ruta = os.path.join(carpeta, 'ia.json')
    if os.path.exists(ruta) and not rehacer:
        return json.load(open(ruta, encoding='utf-8'))
    va = _gastado()
    if va >= TOPE_MES:
        avisar(f'  IA: van {va:.2f} USD este mes (tope {TOPE_MES:.0f}): LeIA sigue con sus plantillas')
        return None
    try:
        import anthropic
        from pydantic import BaseModel
    except ImportError:
        avisar('  IA: falta el paquete anthropic en el entorno: LeIA sigue con sus plantillas')
        return None

    class Chistes(BaseModel):
        es: list[str]
        en: list[str]
        ja: list[str]

    class Comentario(BaseModel):
        desde_segundo: int
        es: str
        en: str
        ja: str

    class Frescos(BaseModel):
        chistes: Chistes
        comentarios: list[Comentario]

    dichos = json.load(open(DICHOS, encoding='utf-8')) if os.path.exists(DICHOS) else {}
    pedido = {'partida': _resumen(info, datos),
              'chistes_que_ya_conto': {l: list((plantilla or {}).get(l) or []) + (dichos.get(l) or [])[-RECORDAR:]
                                       for l in ('es', 'en', 'ja')}}
    try:
        r = anthropic.Anthropic(timeout=180.0).beta.messages.parse(
            model=MODELO, max_tokens=16000, system=SISTEMA,
            output_config={'effort': 'medium'}, output_format=Frescos,
            # si un clasificador de seguridad declina (raro con chistes de arcade), la API lo reintenta sola con otro modelo
            betas=['server-side-fallback-2026-07-01'], fallbacks='default',
            messages=[{'role': 'user', 'content': json.dumps(pedido, ensure_ascii=False, indent=1)}])
    except anthropic.AuthenticationError:
        avisar('  IA: sin sesión de la API (corre `ant auth login`): LeIA sigue con sus plantillas')
        return None
    except anthropic.PermissionDeniedError as e:
        avisar(f'  IA: la API no dio permiso ({e.message}): LeIA sigue con sus plantillas')
        return None
    except anthropic.RateLimitError:
        avisar('  IA: límite de la API por ahora: LeIA sigue con sus plantillas')
        return None
    except anthropic.APIStatusError as e:   # crédito agotado (400/402), 5xx…
        avisar(f'  IA: la API contestó {e.status_code} ({e.message}): LeIA sigue con sus plantillas')
        return None
    except anthropic.APIConnectionError:
        avisar('  IA: sin conexión con la API: LeIA sigue con sus plantillas')
        return None
    except Exception as e:   # sin sesión de `ant auth login` el SDK lanza TypeError; pase lo que pase, el vídeo del día sale
        sin = 'authentication method' in str(e)
        avisar('  IA: sin sesión de la API (corre `ant auth login`): LeIA sigue con sus plantillas' if sin
               else f'  IA: {type(e).__name__}: {str(e)[:200]}: LeIA sigue con sus plantillas')
        return None
    usd = _apuntar(f'leia {fecha}', r.model, r.usage)
    if r.stop_reason != 'end_turn' or r.parsed_output is None:
        avisar(f'  IA: la respuesta no sirvió ({r.stop_reason}): LeIA sigue con sus plantillas')
        return None
    crudo = r.parsed_output.model_dump()
    T = info['fin']; sale = {}
    for l in ('es', 'en', 'ja'):
        coms = [{'texto': _limpia(c[l], l), 'desde': max(0, min(int(c['desde_segundo']), int(T)))} for c in crudo['comentarios']]
        sale[l] = {'chistes': [x for x in (_limpia(f, l) for f in crudo['chistes'][l]) if x],
                   # uno que sólo se podría decir en los últimos 12 s ya no cabe: fuera
                   'comentarios': [c for c in coms if c['texto'] and c['desde'] <= T - 12]}
        tirados = len(crudo['chistes'][l]) - len(sale[l]['chistes']) + len(coms) - len(sale[l]['comentarios'])
        if tirados:
            avisar(f'  IA: {tirados} frases de {l} descartadas (largas, tardías, con llaves o con letras latinas)')
    os.makedirs(carpeta, exist_ok=True)
    json.dump(sale, open(ruta, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    for l in sale:
        dichos[l] = ((dichos.get(l) or []) + sale[l]['chistes'])[-300:]
    json.dump(dichos, open(DICHOS, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    avisar(f'  IA: {sum(len(v) for d in sale.values() for v in d.values())} frases nuevas de {r.model} '
           f'({usd:.3f} USD; van {va + usd:.2f} de {TOPE_MES:.0f} este mes)')
    return sale


def main():
    if '--gasto' in sys.argv:
        print(f'{_gastado():.2f} USD este mes (tope {TOPE_MES:.0f})'); return
    import importlib.util
    spec = importlib.util.spec_from_file_location('lm', os.path.join(AQUI, 'leia-mejor-del-dia.py'))
    lm = importlib.util.module_from_spec(spec); spec.loader.exec_module(lm)
    fechas = [x for x in sys.argv[1:] if not x.startswith('--')] or [(datetime.now(MX).date() - timedelta(days=1)).isoformat()]
    datos = json.load(open(os.path.join(AQUI, 'datos-juegos.json'), encoding='utf-8'))
    for fecha in fechas:
        date.fromisoformat(fecha)
        info = lm.partida(fecha)
        if info.get('sin_partidas'):
            print(fecha, 'sin partidas'); continue
        print(f"{fecha}: {info['titulo']}, {info['nombre']}, {info['puntaje']} puntos")
        r = frescos(fecha, info, datos, os.path.join(AQUI, 'mejor', fecha), rehacer='--rehacer' in sys.argv)
        if r:
            for l in ('es', 'en', 'ja'):
                for f in r[l]['chistes']:
                    print(f'  {l} chiste: {f}')
                for c in r[l]['comentarios']:
                    print(f"  {l} desde {c['desde']:>3} s: {c['texto']}")


if __name__ == '__main__':
    main()
