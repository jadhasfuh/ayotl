# Programa Beta: cómo funciona

## La regla

**14 plazas.** Cuando se llenan, el formulario de alta se sustituye por uno
de **lista de espera** que pide sólo nombre y correo (`ayotl.espera`), para
avisar cuando se abra un lugar o empiece otra ronda; quien ya está dentro
puede seguir corrigiendo sus datos. Pasa igual si las plazas se agotan
mientras alguien rellenaba el formulario largo: en vez de un error, se le
ofrece la lista. El cupo vive en `ayotl.programa.cupo` y el panel enseña
cuánta gente espera detrás.

Cada tester gana, **por día**, según en cuántas apps hizo algo real ese día:

| Apps ese día | Paga |
|---|---|
| 1 | 5 MXN |
| 2 | **15 MXN** |

El salto es a propósito: lo que hace falta para la prueba cerrada de Play es
que tengan las dos instaladas y en uso, así que la segunda app vale el
triple que la primera. Los importes están en
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

**Mercadito quedó fuera del programa** (23-sep-2026): ya está publicada en las
tiendas, así que no necesita la prueba cerrada de Play ni tiene sentido pagar
por probarla. Su cruce por teléfono sigue en el código
(`src/lib/mercadito.ts`, `/api/cron/mercadito`) pero el cron está
desprogramado; volver a meterla es añadirla a `APPS_BETA`, al `check` de
`apps` y reprogramar el cron.

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
día fuera no se registra (`ayotl.en_periodo`) y tampoco se suma, porque
`ayotl.dias_resumen` filtra por esas fechas. Lo registrado fuera de rango se
queda como historia en `dias_prueba`, pero no se paga. Vacíos, cuenta
cualquier día. Se ponen así:

```sql
update ayotl.programa set inicio = '2026-09-24', fin = '2026-10-07';
```

**Cada alta avisa por correo** a `hola@ayotl.dev` (Resend), con los datos del
tester y un enlace al panel; si Resend falla, el alta ya está guardada.

`ayotl.saldos` (vista): días distintos × tarifa − `ayotl.pagos`.

Trampa: jlptest guarda `hechosPorDia` con la fecha **UTC** del navegador, así
que un repaso a las 8 pm de Sahuayo cae bajo el día siguiente. Cada día de
estudio sigue contando una vez, sólo desplazado; no se corrige.

## Lo que el formulario exige siempre

| Dato | Por qué |
|---|---|
| **WhatsApp** | Es como se paga (CoDi) y como se le avisa |
| **Cuenta de Gmail** | Es con la que se acepta la prueba cerrada en Play y con la que se entra a Daily Challenge |

Empezaron siendo condicionales (según las apps marcadas) y quedaban altas a
medias: cinco de las seis primeras entraron sin teléfono. Ahora hacen falta
siempre. Lo comprueba el formulario, el servidor (`esquemaRegistro`) y la
base (`testers_telefono` y `testers_google`, como `not valid` para no
invalidar esas altas anteriores). `ayotl.testers_incompletos` lista a quien
le falte algo y el panel lo marca en rojo.

### Cuando alguien ya tiene cuenta con otro correo

Pasa, y pasó el primer día: el correo con el que se apunta (el de Google,
que es el que vale para Play y para Daily Challenge) no tiene por qué ser el
de su cuenta vieja de JLPTest. Para eso está `ayotl.testers.correos_extra`:
correos adicionales del mismo tester, que el cruce también mira.

```sql
update ayotl.testers
   set correos_extra = correos_extra || '{sucuenta.vieja@hotmail.com}'
 where email = 'suyo@gmail.com';
select * from ayotl.registrar_dia(current_date);   -- para recontar hoy
```

Si alguien dice «hice un examen y no me contó», esto es lo primero que hay
que mirar: con qué correo entró a la app.

**Ningún correo puede estar en dos testers.** Un disparador
(`testers_correos_unicos`) compara los correos de la fila —contacto, Google
y extra— contra los de todos los demás y rechaza el choque; si no, dos
personas podrían apuntar la misma cuenta y las dos cobrarían su actividad.
El formulario lo cuenta con un mensaje claro («ese correo ya está apuntado
por otra persona»), y volver a apuntarse con el propio correo de contacto
sigue funcionando: eso es una actualización, no un choque.

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
| Mercadito | `mx.mercadito.cx` | fuera del programa: ya está publicada | https://play.google.com/store/apps/details?id=mx.mercadito.cx |

El de `/apps/testing/` es el que hay que mandar: es donde la persona acepta
ser tester. El de `/store/apps/details` **sólo abre después de aceptar**;
mientras no lo haya hecho (o si la cuenta no está en la lista de testers) le
sale «no encontrada», que es la confusión de siempre.

Comprobado el 2026-09-22: las fichas de Daily Challenge y JLPTest dan 404 sin
sesión, que es lo normal en una prueba cerrada; la de Mercadito abre, porque
ya está publicada.

Texto para mandarles (WhatsApp):

> Hola. Te apunto como tester de mis apps. Son 14 días (del 24 de septiembre
> al 7 de octubre) y te pago por cada día que las uses: 5 pesos si usas una y
> 15 si usas las dos ese día. Te lo pago todo junto al final, por CoDi o
> transferencia. Con las dos son hasta 210 pesos. Además te doy un mes gratis
> de JLPTest completo. Pasos:
>
> 1) Apúntate en https://ayotl.dev/beta con tu nombre, correo y WhatsApp (el
>    WhatsApp es para pagarte por CoDi y para avisarte). En «Correo de
>    Google» pon tu cuenta de Gmail: es con la que voy a ver tu actividad y
>    con la que se entra a Daily Challenge; si usas otra, ese día no cuenta.
> 2) Acepta ser tester con estos dos enlaces, **con esa misma cuenta**:
>    Daily Challenge · https://play.google.com/apps/testing/click.dailychallenge.twa
>    JLPTest · https://play.google.com/apps/testing/org.jlptest.twa
>    En cada uno sale un botón «Become a tester» / «Convertirme en tester».
> 3) Ya aceptado, instala desde Play (el enlace de descarga aparece en esa
>    misma página; tarda unos minutos en activarse la primera vez).
> 4) Entra en las apps con ese mismo correo: en JLPTest te llega un código al
>    correo; en Daily Challenge toca «Entrar con Google» (si te quedas como
>    invitado, no puedo saber que eres tú).
> 5) Úsalas un ratito cada día: un repaso en JLPTest y una partida en Daily
>    Challenge, y ese día vale 15.
> 6) No desinstales las apps durante los 14 días, que es lo que Google mira.
>    Y si algo falla o se ve raro, mándamelo por aquí.
>
> Al apuntarte te doy un enlace tuyo (ayotl.dev/mi/…) donde ves los días que
> llevas y cuánto va sumando. Guárdalo.

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

## Los enlaces de cada tester

Cada tester tiene el suyo, `ayotl.dev/mi/<token>`, y se le enseña al
terminar de apuntarse (además de mandárselo por correo). En el panel, bajo
el nombre de cada uno, hay un «copiar su enlace» para pegarlo en WhatsApp.

Por SQL, si hace falta:

```sql
select nombre, 'https://ayotl.dev/mi/' || token as enlace from ayotl.testers;
```

Quien lo pierda puede pedirlo desde cualquier enlace roto: la página enseña
un formulario que se lo manda por correo.

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

## Anuncio para grupos de Facebook de Sahuayo

Los grupos no se pueden publicar por la Graph API (Meta cerró la Groups API en
2024), así que esto va copiado a mano. La página de Ayotl sí podría
automatizarse, como se hace en Daily Challenge y Mercadito.

**Antes de publicar, una advertencia que conviene tener presente:** Google
revisa que los testers de una prueba cerrada sean personas reales que usan la
app. Un anuncio público centrado en el pago («te pago por abrir mi app») es el
patrón que buscan al comprobar los 14 días, y hay grupos de intercambio de
testers que rechazan por eso. Por eso la versión recomendada habla de probar y
opinar, y menciona el apoyo económico como una línea más.

### Versión recomendada

> **Busco gente de Sahuayo para probar dos apps hechas aquí**
>
> Me llamo Adrián y desde Sahuayo hago software. Necesito que dos de mis
> apps las pruebe gente de verdad antes de publicarlas: JLPTest (para
> estudiar japonés) y Daily Challenge (un reto arcade nuevo cada día).
>
> Son 14 días, del 24 de septiembre al 7 de octubre. Lo único que pido es que
> las uses un ratito al día y me digas qué falla, qué no se entiende o qué te
> gustaría que hiciera.
>
> A cambio: un mes gratis de JLPTest completo, acceso a lo nuevo antes que
> nadie, tu nombre en los agradecimientos si quieres, y un apoyo de 5 pesos
> por día si usas una y 15 si usas las dos (se paga junto al final, por CoDi
> o transferencia).
>
> Hace falta un teléfono Android o iPhone, una cuenta de Gmail y WhatsApp.
>
> Apúntate aquí: https://ayotl.dev/beta (la página dice cuántos lugares
> quedan; son pocos).

### Versión corta, para bolsa de trabajo

> Busco gente de Sahuayo para probar durante 14 días dos apps hechas aquí
> (una de japonés y un juego diario).
> No es un empleo: son unos minutos al día usándolas y decirme qué falla.
> Incluye un mes gratis de JLPTest y un apoyo de 5 a 15 pesos por día usado,
> pagado al final por CoDi. Hace falta Android, Gmail y WhatsApp.
> https://ayotl.dev/beta

### Qué revisar después de publicar

- El cupo son **14 plazas contando la tuya**: 13 personas de fuera, que es
  margen de sobra sobre los 12 que exige Play por si alguien se cae. Se
  agotan solas: al llegarse al tope, `/beta` cambia el formulario por el de
  lista de espera. No hay que cerrar nada a mano.
- El anuncio no lleva el número de lugares escrito a mano a propósito: el que
  vale es el de la página, que se actualiza solo.
- En el panel, quien aparezca en rojo como «sin WhatsApp» no puede sumar días
  de Mercadito: hay que pedírselo.
- Conviene responder a cada alta por WhatsApp con los enlaces de la prueba
  cerrada de Play, que es el paso que de verdad cuenta para Google.
