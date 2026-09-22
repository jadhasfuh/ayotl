# Programa Beta: cómo funciona

## La regla

Un tester gana **20 MXN por cada día** en que hizo algo real en al menos una
de las apps que está probando. Se paga al terminar la prueba, por CoDi o
transferencia. La tarifa vive en `ayotl.programa.tarifa_dia`.

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
sus pedidos y sus sesiones. La fecha de la sesión sale de `expires_at` menos
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

Texto para mandarles (WhatsApp):

> Hola. Te apunto como tester de mis apps. Son 14 días y te pago 20 pesos por
> cada día que uses alguna de ellas (te lo pago al final, por CoDi o
> transferencia). Pasos:
> 1) Apúntate en https://ayotl.dev/beta con tu nombre, correo y WhatsApp. En
>    «Correo de Google Play» pon la cuenta de Google de tu teléfono.
> 2) Acepta la prueba con este enlace de Play: [enlace de la prueba cerrada]
>    (con esa misma cuenta de Google).
> 3) Instala las apps desde Play y entra con ese mismo correo de Google:
>    en JLPTest te llega un código al correo; en Daily Challenge toca «Entrar
>    con Google». Si no entras con esa cuenta, ese día no cuenta.
> 4) Úsalas un ratito cada día: un repaso en JLPTest o una partida en Daily
>    Challenge basta. Y si algo falla, me lo mandas por aquí.

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
