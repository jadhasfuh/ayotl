# Programa Beta: cómo funciona

## La regla

**14 plazas.** Cuando se llenan, el formulario deja de aceptar altas nuevas y
enseña un aviso con el correo de contacto; quien ya está dentro puede seguir
corrigiendo sus datos. El cupo vive en `ayotl.programa.cupo`.

Cada tester gana, **por día**, según en cuántas apps hizo algo real ese día:

| Apps ese día | Paga |
|---|---|
| 1 | 5 MXN |
| 2 | 10 MXN |
| 3 | **20 MXN** |

El salto de 10 a 20 es a propósito: lo que hace falta para la prueba cerrada
de Play es que tengan las tres instaladas y en uso, así que la tercera app
vale lo que las dos primeras juntas. Los importes están en
`ayotl.programa.tarifa_1/2/3` y el cálculo, en la vista `ayotl.dias_resumen`
(un día de un tester, con cuántas apps tocó y lo que vale). `ayotl.saldos`
suma eso, no multiplica.

Se paga todo junto al terminar la prueba, por CoDi o transferencia.

Además, al apuntarse se lleva **un mes de JLPTest completo**: `/api/beta`
llama a `ayotl.dar_cortesia`, que escribe una fila en `public.cortesias`
(la tabla que jlptest ya consulta) por el correo de Google del tester. Es la
única vez que este esquema escribe fuera de `ayotl`, y es una fila, no DDL.
Si la persona ya tenía una cortesía más larga, no se le recorta. Los días
están en `ayotl.programa.dias_cortesia`.

«Algo real» es lo que las apps ya guardan; no hubo que tocarlas:

| App | Cuenta | Qué cuenta como día |
|---|---|---|
| JLPTest | código al correo (Supabase Auth) | ≥ 1 repaso (`progreso.datos.hechosPorDia`) o ≥ 1 respuesta de examen (`resultados`) |
| Daily Challenge | anónimo + **Google** opcional | ≥ 1 partida (`arcade.partidas`) |
| Mercadito | teléfono + PIN, **otra Supabase** | ≥ 1 pedido suyo, o una sesión iniciada ese día (se cruza por teléfono) |

## Cómo se cruza

jlptest (`public`), Daily Challenge (`arcade`) y este esquema (`ayotl`)
comparten base y `auth`. `ayotl.registrar_dia(fecha)` toma el correo de
Google de cada tester (`email_google`, o `email` si no puso otro), lo busca en
`auth.users`, y con ese id mira jlptest y arcade. Una fila por tester, día y
app en `ayotl.dias_prueba`, con la evidencia (`{"repasos": 12}`,
`{"partidas": 2, "mejor": 340}`, `{"manual": true}`).

Un cron de `pg_cron` (`ayotl-registrar-dia`, 12:00 UTC = 6:00 de México)
lo corre a diario para el día anterior. Es idempotente: repetirlo actualiza
la evidencia, no duplica. El panel tiene un botón para correrlo a mano.

**Mercadito va por otro camino**, porque está en otra Supabase y se entra con
teléfono, no con Google: un segundo cron (`ayotl-mercadito`, 6:10) pega con
`pg_net` a `/api/cron/mercadito` de ayotl.dev con la cabecera
`X-Cron-Secret`, y ese endpoint abre la base de Mercadito con `pg`
(`MERCADITO_DATABASE_URL`, sólo lectura) y cruza el teléfono del tester con
sus pedidos y sus sesiones.

Dos cosas que costaron una tarde: esa URL tiene que ser la del **session
pooler** (puerto 5432), porque la conexión directa del proyecto es sólo IPv6
y desde Railway da `timeout expired`; y su **API de Supabase no sirve**, que
era la alternativa obvia para no copiar la contraseña: el PostgREST de ese
proyecto lleva caído quién sabe cuánto («Could not query the database for the
schema cache») y nadie se había enterado porque Mercadito se conecta con `pg`
y nunca la usa. La fecha de la sesión sale de `expires_at` menos
los 30 días que dura; es aproximada, así que el pedido manda cuando hay los
dos. El botón «Cruzar actividad» del panel hace las dos cosas.

**El periodo manda.** `ayotl.programa.inicio` y `fin` acotan el programa: un
día fuera no se registra ni se paga (`ayotl.en_periodo`). Vacíos, cuenta
cualquier día. Se ponen así:

```sql
update ayotl.programa set inicio = '2026-09-25', fin = '2026-10-08';
```

**Cada alta avisa por correo** a `hola@ayotl.dev` (Resend), con los datos del
tester y un enlace al panel; si Resend falla, el alta ya está guardada.

`ayotl.saldos` (vista): días distintos × tarifa − `ayotl.pagos`.

Trampa: jlptest guarda `hechosPorDia` con la fecha **UTC** del navegador, así
que un repaso a las 8 pm de Sahuayo cae bajo el día siguiente. Cada día de
estudio sigue contando una vez, sólo desplazado; no se corrige.

## Lo que el formulario exige según las apps

| Si marca… | Hace falta | Por qué |
|---|---|---|
| Mercadito | **WhatsApp** | Esa app vive en otra base y se entra con teléfono; sin él no hay con qué cruzar sus días |
| Daily Challenge | **Cuenta de Gmail** | Se entra con «Entrar con Google»; con otro correo no se sabe quién jugó |
| JLPTest | nada más | El código de acceso llega a cualquier correo |

Lo comprueba el formulario, el servidor (`esquemaRegistro`) y la base
(`testers_mercadito_telefono` y `testers_daily_google`, como `not valid` para
no invalidar las altas anteriores a la regla). `ayotl.testers_incompletos`
lista a quien le falte algo; el panel lo marca en rojo como «sin WhatsApp».

## Lo que hay que pedirle a cada tester

Esto es lo que hace posible el cruce. Sin el punto 1, un tester no suma días.

1. **Un solo correo de Google** para todo: el de la cuenta de Play con la que
   se inscribe a la prueba, el que escribe para entrar a JLPTest, y el botón
   «Google» de Daily Challenge (si se queda anónimo, no hay forma de saber que
   es él). Lo pone en el formulario de ayotl.dev/beta como «Correo de Google
   Play» si es distinto del de contacto.
2. Para Mercadito, su **WhatsApp** (mismo campo del formulario): entra con ese
   teléfono y es a donde se le paga por CoDi.
3. Instalar las apps **desde Play** con el enlace de la prueba cerrada, y no
   desinstalarlas durante los 14 días.

## Los enlaces

Cada app tiene dos direcciones en Play y **no son intercambiables**:

| App | Paquete | Enlace de inscripción (el que se manda) | Ficha |
|---|---|---|---|
| Daily Challenge | `click.dailychallenge.twa` | https://play.google.com/apps/testing/click.dailychallenge.twa | https://play.google.com/store/apps/details?id=click.dailychallenge.twa |
| JLPTest | `org.jlptest.twa` | https://play.google.com/apps/testing/org.jlptest.twa | https://play.google.com/store/apps/details?id=org.jlptest.twa |
| Mercadito | `mx.mercadito.cx` | ya está publicada, no hace falta | https://play.google.com/store/apps/details?id=mx.mercadito.cx |

El de `/apps/testing/` es el que hay que mandar: es donde la persona acepta
ser tester. El de `/store/apps/details` **sólo abre después de aceptar**;
mientras no lo haya hecho (o si la cuenta no está en la lista de testers) le
sale «no encontrada», que es la confusión de siempre.

Comprobado el 2026-09-22: las fichas de Daily Challenge y JLPTest dan 404 sin
sesión, que es lo normal en una prueba cerrada; la de Mercadito abre, porque
ya está publicada.

Texto para mandarles (WhatsApp):

> Hola. Te apunto como tester de mis apps. Son 14 días (del 22 de septiembre
> al 5 de octubre) y te pago por cada día que las uses: 5 pesos si usas una,
> 10 si usas dos y 20 si usas las tres ese día. Te lo pago todo junto al
> final, por CoDi o transferencia. Con las tres son hasta 280 pesos. Además
> te doy un mes gratis de JLPTest completo. Pasos:
>
> 1) Apúntate en https://ayotl.dev/beta con tu nombre, correo y WhatsApp (el
>    WhatsApp hace falta para Mercadito, que se entra con el teléfono, y para
>    pagarte). En «Correo de Google Play» pon tu cuenta de Gmail: es con la
>    que voy a ver tu actividad y con la que se entra a Daily Challenge; si
>    usas otra, ese día no cuenta.
> 2) Acepta ser tester con estos dos enlaces, **con esa misma cuenta**:
>    Daily Challenge · https://play.google.com/apps/testing/click.dailychallenge.twa
>    JLPTest · https://play.google.com/apps/testing/org.jlptest.twa
>    En cada uno sale un botón «Become a tester» / «Convertirme en tester».
> 3) Ya aceptado, instala desde Play (el enlace de descarga aparece en esa
>    misma página; tarda unos minutos en activarse la primera vez).
> 4) Entra en las apps con ese mismo correo: en JLPTest te llega un código al
>    correo; en Daily Challenge toca «Entrar con Google» (si te quedas como
>    invitado, no puedo saber que eres tú).
> 5) Úsalas un ratito cada día: un repaso en JLPTest, una partida en Daily
>    Challenge y abrir Mercadito basta para que cuente el día entero (20).
> 6) No desinstales las apps durante los 14 días, que es lo que Google mira.
>    Y si algo falla o se ve raro, mándamelo por aquí.

## Google Play: la prueba cerrada

Las cuentas personales de desarrollador creadas después de noviembre de 2023
necesitan **12 testers inscritos durante 14 días seguidos** en una prueba
cerrada antes de poder pedir producción. Google mira la inscripción y que la
app siga instalada; la actividad diaria es tu criterio para pagar, no el suyo.

En Play Console → app → Testing → Closed testing → track «Alpha» (o el que
sea) → Testers: crear una lista con los 12 correos de Google (los
`email_google` de `ayotl.testers`) y copiar el enlace de inscripción, que es
el que va en el mensaje de arriba. Cuando pasen los 14 días, en el panel
principal aparece «Apply for production access».

Mercadito ya está aprobada: sus testers son sólo para probar, sin plazo.

## El panel

`https://ayotl.dev/admin/testers`, con la contraseña de `ADMIN_SECRETO`
(Railway). Cuadrícula de días × tester × app (verde = hubo actividad; pasar
el ratón enseña la evidencia; pulsar una letra marca o quita el día a mano),
saldos, registro de pagos y botón para cruzar una fecha.

Por `psql`, lo mismo:

```sql
select * from ayotl.saldos order by saldo desc;
select * from ayotl.dias_prueba where fecha >= current_date - 14 order by fecha, tester;
select * from ayotl.registrar_dia('2026-09-25');      -- cruzar un día a mano
insert into ayotl.pagos (tester, monto, medio, referencia) values (3, 280, 'codi', 'folio…');
```
