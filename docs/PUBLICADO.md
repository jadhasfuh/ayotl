# Lo publicado: qué salió, dónde y qué copia local ya no existe

Registro central de los vídeos de los productos. Sirve para dos cosas:
- **No regenerar** una copia de algo que ya salió.
- **No repetir contenido.**

Antes de generar o publicar un vídeo, buscarlo aquí y en el registro de su producto.

Al borrar copias locales para liberar disco, se anota aquí qué era cada vídeo. El 16-oct-2026 el disco quedó al 99 %: las copias locales de lo ya publicado sobran y se pueden borrar.

**30-oct-2026, disco lleno otra vez (Claude Code no podía correr nada): borrados 218 vídeos locales, 805 MB** (Adrián: «revisa qué vídeos ya publicaste y bórralos, deja sólo las referencias de cómo los hiciste»). Se fue: los vídeos de LeIA y tráileres que ya tienen id en `tools/comerciales/youtube.json` (y su copia en `~/Desktop/videos-leia`), los crudos de `tools/comerciales/warzone-cpu/`, las copias de la cuenta regresiva en `tools/comerciales/cuenta/mp4/` (las que usa el cron siguen en jlptest.org), los mp4 de ttcode con sus dos ids en `meta.json` y la recopilación vol. 1 (`l7Iuj_ZTStU`), las pruebas locales del Daily Stat de los 23 datos publicados (8 al 30-oct), los crudos de los reels 15-17 de Mercadito y el reel de War Zone del 11-oct (`territorio war/shots/anuncio-warzone.mp4`; la copia que se sirve está en DC `public/marketing`). Se quedan: los 6 vídeos de Kazan para YouTube (suben el 31-oct y 1-nov, y sus crudos en `tools/comerciales/kazan-cpu/`), el tráiler de War Zone en Google Play (sin publicar como reel), todo lo que sirven los sitios para los posts programados y las recetas (guiones, JSON, miniaturas, ids). Rehacer cualquiera: su guion sigue en el repo de su producto.

## ttcode (retos de código): YouTube

**Dónde está el registro:** `challenges/<sección>/<slug>/meta.json`, en `youtube.desktop` / `youtube.mobile` y `published`. También en `src/content/retos.json` de ayotl.

**Copias locales:** los mp4 de `out/<sección>/<slug>/` sobran desde el 16-oct-2026 y se pueden borrar. Se quedan el código, el enunciado, `youtube.txt` y las miniaturas.

**Cómo se comprobó:** cada id respondía en `https://www.youtube.com/oembed?...`. Un 200 es público; un 403 es privado, programado con publishAt a las 13:00 de México del día. Los 38 existían.

**Qué no hacer:** no volver a renderizar estos retos. `subir-pendientes` decide por los ids del meta.json, no por los mp4, así que no los vuelve a subir.

**Instagram y Facebook:** ttcode nunca publicó ahí, porque no tiene código de Meta. Para sacarlos como reel habría que renderizarlos otra vez, o usar el Short de YouTube.

| Fecha | Reto | Largo (16:9) | Short (9:16) |
|---|---|---|---|
| 2026-10-07 | basic/fizzbuzz | `pjdpC_bPKYM` | `FcMi_4EOTXY` |
| 2026-10-08 | interview/two-sum | `lii9DW3MCPs` | `8mLoZH239Qs` |
| 2026-10-09 | interview/valid-parentheses | `mH4Ds9j14_4` | `a1kEpfupweY` |
| 2026-10-10 | interview/best-time-to-buy-and-sell-stock | `kiBpouy37G0` | `rtY4ckaWIW4` |
| 2026-10-11 | interview/valid-anagram | `ZPhfwJEArM0` | `-pKzPyYwkvE` |
| 2026-10-12 | interview/contains-duplicate | `OW1t_FehloU` | `xiwmw19U86Y` |
| 2026-10-13 | interview/climbing-stairs | `pkJMX92epBE` | `U7pELlQdLAc` |
| 2026-10-14 | interview/reverse-linked-list | `UAxK13RGXQY` | `fQccugaQpVc` |
| 2026-10-15 | interview/valid-palindrome | `ABPqktxS_0s` | `PsJpMzlbLKo` |
| 2026-10-16 | interview/merge-two-sorted-lists | `czTiM5MRinM` | `otDWoYS0FLw` |
| 2026-10-17 | interview/maximum-subarray | `QbG3rKuwnQk` | `hSudYE3KWPk` |
| 2026-10-18 | interview/linked-list-cycle | `ExXzSHhvc1M` | `bhVGwzE_YUM` |
| 2026-10-19 | interview/maximum-depth-of-binary-tree | `ze2vS10vgPs` | `9IceJYWbqhY` |
| 2026-10-20 | interview/invert-binary-tree | `WabTQPrg_B4` | `IVMIngy1Tu4` |
| 2026-10-21 | interview/container-with-most-water | `mX-zVq_sdao` | `xrpRY3QP81Q` |
| 2026-10-22 | interview/longest-substring-without-repeating-characters | `de9jOB8svyk` | `o0yPKYgth1E` |
| 2026-10-23 | interview/product-of-array-except-self | `OJICFt7pOzk` | `OSlG8Ihvb44` |
| 2026-10-24 | interview/number-of-islands | `IHn8dlRUd1w` | `gs4mN4SRGrU` |
| 2026-10-25 | interview/search-in-rotated-sorted-array | `YgqPlU9-kfk` | `CQ8_5ULO5QU` |

**Al 27-oct-2026:** subidos y programados hasta el 9-nov. Los ids de cada uno están en su `challenges/<sección>/<reto>/meta.json` y en `src/content/retos.json` de ayotl, así que la tabla de arriba ya no se sigue llenando a mano. Se subieron el 28-oct los dos vídeos del 10-nov (`lru-cache`). **Al 1-nov-2026:** subidos y programados hasta el 17-nov (la tanda del 11 al 17: reverse-a-string, fibonacci-series, print-odd-even-with-two-threads, prime-number-check, first-non-repeating-character, armstrong-number y producer-consumer) y la recopilación `interview-vol-2` (retos 21 a 40, 22.7 min), que sale el 17-nov a las 13:00 (`XgXubD8raWc`; vol. 1: `l7Iuj_ZTStU`, 28-oct).

## Daily Stat (dato del día de Daily Challenge): Instagram y Facebook, 11:00 de México

**Cómo se genera:** lo genera el servidor al momento (`/stat/<fecha>/reel.mp4`). No hay copias locales.

**Dónde está el registro:**
- qué dato sale cada día: `public/content/stats/stats.json`. Son 40 datos, hasta el 16-nov-2026 (nunca se repite uno);
- qué ya salió: tabla `arcade.publicaciones` (Supabase).

**Nuevos datos:** que no repitan los del JSON.

## Reel de la partida de Daily Challenge: Instagram y Facebook, 19:00

Lo genera el servidor (`/dia/...`). El registro está en `arcade.publicaciones`.

## War Zone

**Walkthrough de la campaña:**
- **Dónde salió:** YouTube, https://youtu.be/Z9Wk3C4A0Ts, el 13-oct-2026.
- **Cómo se generó:** `node tools/walkthrough.js`, con las semillas que guarda la memoria del proyecto.
- **Copia local:** ya no existe (`shots/walkthrough-warzone.mp4`).

**Anuncio de 20 s:**
- **Dónde salió:** el 11-oct-2026 a las 20:10, como reel en Instagram (`18130590430778925`) y como vídeo en Facebook (`1101872208999474`).
- **Copia local:** la de `shots/anuncio-warzone.mp4` sobra.
- **Copia que se queda:** `daily challenge/public/marketing/warzone-reel.mp4`. Daily Challenge la sirve, y otro anuncio igual sería repetir.

## Anuncios de Daily Challenge: Instagram y Facebook, 13:00

**Dónde está el registro:**
- el calendario es `daily challenge/public/content/anuncios/calendario.txt`;
- cada clip está en `public/marketing/<clip>.mp4`, con su pie en `<clip>.txt`;
- lo que ya salió está en `arcade.publicaciones` (tipo `anuncio`).

| Fecha | Clip | Qué es |
|---|---|---|
| 29-oct | `leia-semana` | LeIA presenta la última semana de juegos |
| 31-oct | `leia-warzone-cpu` | War Zone, CPU contra CPU, con LeIA |
| 3-nov | `comercial-dc` | comercial de DC (voz Algenib) |
| 5-nov | `leia-kazan-cpu` | Kazan con 8 CPU, con LeIA |
| 10-nov | `comercial-warzone` | sale `comercial-warzone-play` si la ficha de Play ya es pública |
| 17-nov | `comercial-kazan` | comercial de Kazan (voz Despina) |

**Carteles pixel art (imagen JPEG, fuera del calendario y sin fila en `arcade.publicaciones`):** se disparan a mano con
`/api/cron/social?tipo=cartel&clip=<clip>` (imagen en `public/marketing/<clip>.jpg`, pie en `public/content/anuncios/<clip>.txt`),
van a Instagram y Facebook. Para repetir uno: SQL `net.http_post` con la llave del Vault (`~/Desktop/carteles-tiendas.sql`).

| Fecha | Cartel | Qué es |
|---|---|---|
| 29-oct | `kazan-app-store` | Kazan ya está en la App Store (id 6826747985) |
| 29-oct | `dc-google-play` | Daily Challenge ya es pública en Google Play |
| 30-oct | `warzone-google-play` | War Zone ya es pública en Google Play (SQL en `~/Desktop/cartel-warzone-play.sql`) |

## YouTube: vídeos de juegos y de jlptest (canal de Adrián), 18:00

- **El plan:** `ayotl/tools/comerciales/youtube.json`. Al subirse, cada vídeo apunta ahí su id. Los sube `subir-youtube.py` según la cuota del día.
- **Las fechas:**
  - 28 y 29-oct: jlptest N5, el largo y el short;
  - DC, la semana: el largo ya salió el 27-oct (Adrián, desde Studio: https://youtu.be/D9vSbcUIHtY, también en la ficha de Play); el short, el 31-oct;
  - 1 y 2-nov: War Zone, CPU contra CPU;
  - 3 y 4-nov: Kazan, 8 CPU;
  - desde el 31-oct, todos los días: **el mejor del día**. Es la partida del campeón de Daily Challenge, entera y narrada por LeIA. Sale dos días después de jugarse, a las 19:00 (es), 19:20 (en) y 19:40 (ja). Las claves son `mejor-<fecha>[-en|-ja]`. Lo arma `leia-mejor-del-dia.py` cada mañana. Las partidas se rehacen desde `arcade.partidas`, así que el mp4 sobra en cuanto está en YouTube y en TikTok.
- **Estado al 30-oct (noche):** subidos y programados todos, también los seis de Kazan (3 y 4-nov), que subieron esa noche y ya están procesados. Ese día fueron 11 subidas: la cuota de la API ya no limita a 5, porque desde el 1-jun-2026 subir tiene su propio cupo de 100 al día. Desde el 31-oct sólo queda el mejor del día, que sube cada mañana. El del 29 no alcanzó su hora (la Mac pasó dormida el 31-oct) y salió el 1-nov a las 17:00, 17:20 y 17:40, antes del del 30 (19:00). Los mp4 de Kazan en `salida/` y sus crudos en `kazan-cpu/` se borraron el 30-oct en la noche (13 vídeos, 481 MB); se quedan las recetas. War Zone ya es pública en Google Play: sus vídeos nuevos llevan el enlace y a los cuatro que ya estaban (el CPU largo y los tres tráileres) se les puso el 30-oct. Los mp4 están en `tools/comerciales/salida/`, que no va a git. Su copia de `~/Desktop/videos-leia/` se borró el 30-oct, cuando ya estaban programados en TikTok.

## Tráileres de las fichas de Play (YouTube, subidos por Adrián el 27-oct)

| App | Vídeo | Fuente |
|---|---|---|
| Daily Challenge | https://youtu.be/D9vSbcUIHtY | `tools/comerciales/dc-semana-largo.json` (LeIA, 7 días) |
| War Zone | https://youtu.be/A5wIP6_OnHg | `trailer-warzone.json` (LeIA, 48 s) |
| Kazan | https://youtu.be/qz9cRh8ILt8 | `trailer-kazan.json` (LeIA, 56 s) |
| jlptest | https://youtu.be/YHSgSiGq2bk | `trailer-jlptest.json` (pantallas, 36 s) |

Van en el campo «Video» de cada ficha de Play. No se vuelven a subir.

**Versiones en inglés y japonés (generadas y subidas por Adrián el 28-oct, públicas, y puestas en la ficha de Play):** `leia-idiomas.py` también traduce los tráileres (`trailer-warzone-en/ja.json`, `trailer-kazan-en/ja.json`, `trailer-jlptest-en.json`; jlptest sólo en inglés porque la app es en español e inglés). Los mp4 se borraron con la limpieza del 30-oct; se rehacen con su guion. El de Daily Challenge ya tiene sus versiones en el plan de YouTube (`dc-semana-largo-en`, 30-oct, y `-ja`).

| App | Inglés | Japonés |
|---|---|---|
| War Zone | https://youtu.be/Xw9UBKnriOQ (`trailer-warzone-en.mp4`, 48 s) | https://youtu.be/gWjfnu3iw_w (`trailer-warzone-ja.mp4`, 48 s) |
| Kazan | https://youtu.be/9_eHseYivD0 (`trailer-kazan-en.mp4`, 56 s) | https://youtu.be/-UeC1hv7tLo (`trailer-kazan-ja.mp4`, 56 s) |
| jlptest | https://youtu.be/po5QagWF2kE (`trailer-jlptest-en.mp4`, 32 s) | — |

Los ocho están en `youtube.json` con su id (28-oct, noche): título «APP: …», descripción con el enlace al juego, etiquetas, categoría (20 juegos, 27 jlptest), idioma y lista de su app. Cuando una tienda se haga pública, ponerles `"actualizar": true` y correr `subir-youtube.py --max 0` para que la descripción gane el enlace a Play o App Store. Tarjetas y pantallas finales: no hay API, y un enlace externo en ellas pide el Programa de Partners; se hacen a mano en Studio (suscribirse, vídeo o lista).

## TikTok: espejo del canal de YouTube, programado a mano en TikTok Studio

- **Qué va:** lo mismo que en YouTube, a la misma hora y con el mismo título y la misma descripción (en TikTok van juntos en la descripción, sin `#shorts`): el Short de cada reto de ttcode a las 13:00 y los vídeos de LeIA a las 18:00, 18:20 y 18:40 (es/en/ja). El Daily Stat no va, porque no está en YouTube.
- **Cómo se arma:** `tools/comerciales/tiktok-espejo.py` deja en `~/Desktop/tiktok/` los vídeos de los próximos 10 días y `textos.html`.
- **Al 30-oct:** Adrián programó la primera tanda, del 30-oct a las 18:00 al 9-nov a las 13:00. Son 28 vídeos: 10 retos (de `coin-change` a `subsets-permutations`) y 18 de LeIA (la semana de DC, War Zone CPU y Kazan CPU, largos y Shorts en los tres idiomas). Diez los bajó de YouTube Studio porque la limpieza de ese día ya los había borrado. Los de Kazan llevan el texto que tendrán en YouTube, donde suben el 31-oct y el 1-nov.
- **Copias locales:** el 30-oct, ya programados, se borraron 33 vídeos (387 MB): los 18 de la carpeta, las copias de Kazan en `~/Desktop/videos-leia/` y los Daily Stat que se hicieron para TikTok antes de descartarlo. Los de la carpeta son clones (`cp -c`) y casi no ocupaban espacio aparte. Los originales de Kazan en `tools/comerciales/salida/` y sus crudos en `tools/comerciales/kazan-cpu/` sobran en cuanto estén en YouTube. Se quedan `public/media/retos/` (los sirve ayotl.dev) y `public/marketing` de DC (los publica el cron).
- **Siguiente tanda:** `--desde 2026-11-10`, antes del 10-nov. Trae los retos del 10 al 19-nov y, desde el 1-nov, los mejores del día que ya salieron en YouTube, a su misma hora en los días siguientes (marcados con `en_tiktok` en youtube.json).

## Mercadito: Instagram (@mercadito.cx) y página de Facebook, 18:30

**Al 27-oct-2026:**
- el calendario manda: `mercadito/src/lib/reels.ts`, uno por día, del 13-oct al 9-nov (reels 01 a 29);
- las copias y los pies están en `~/Desktop/mercadito-reels/`, cada tanda con su LEEME;
- la tabla de abajo es la historia de la primera tanda.

**Dónde está el registro:**
- calendario y archivos: `mercadito/src/lib/reels.ts` y `public/reels/`, en git. Ahí viven los vídeos que el cron publica;
- duplicados: antes de publicar, el cron compara el primer renglón con lo ya publicado.

| Fecha | Reel | Estado |
|---|---|---|
| 13-oct | 01 «¿Se te antoja una quesabirria?» | publicado |
| 14-oct | 02 «¿Se te antoja una hamburguesa?» | publicado |
| 15-oct | 03 «Este mensaje no lo escribí yo» | publicado |
| 16-oct | 04 «¿Antojo de tacos?» | publicado |
| 17-oct | 05 «¿Se te antojan unas enchiladas?» | programado |
| 18-oct | 06 «¿Está abierto?» | programado |
| 19-oct | 08 «¿Se te antoja una pizza?» | programado |
| 20-oct | 07 «Pídelo a tu gusto» | programado |

**Copias que sobran de los cuatro ya publicados:**
- las del Escritorio (`~/Desktop/mercadito-reels/01-04`);
- las grabaciones crudas de esos cuatro, que dejó el generador de reels, menos su `plan.json`.

**Copias que se quedan:**
- las versiones anteriores que nombraban negocios: nunca salieron;
- las de 05-08 hasta que salgan.

## jlptest: reel del reto, Instagram y página, 17:30

**Dónde está el registro:**
- los mp4: `jlptest/public/social/reels/`, en git. El sitio los sirve al cron;
- qué salió: tabla `publicaciones`.

**Copias locales:** no se borra nada, porque son la fuente del cron.

**Fuera de la serie del reto:**
- el 19 (27-oct) es el comercial de jlptest;
- el 21 (29-oct) es el de 10 palabras del N5;
- los retos se recorrieron, así que la tanda 5 llega al 14-nov.

## Compilaciones de la app (lo que se guarda)

Se guardan sólo las dos últimas versiones de cada app.

**Mercadito** (`mercadito/builds/`):
- se quedan los AAB 1.0.87 y 1.0.88 y los IPA 1.0.81 y 1.0.83;
- sobran los AAB 1.0.79, 1.0.80, 1.0.81 y 1.0.83 y los IPA 1.0.79 y 1.0.80.

**War Zone:**
- en el Escritorio está `warzone-1.0.21-22.aab`, que se sube cuando Google apruebe la 1.0.20 en producción;
- la iOS 1.0.21 (24) ya está en App Store Connect;
- el tráiler de lanzamiento en Play (es/en) espera en `~/Desktop/warzone-trailer-play/`.

**Daily Challenge:** producción en Play concedida el 27-oct. Se publica la 1.0.3 (vc 4) desde la biblioteca de la consola.

**jlptest:** la 1.0.7 (vc 9), firmada, está en `~/Desktop/jlptest-1.0.7-9.aab` y va a la prueba cerrada.

**La procesión de los dormidos:** `~/Desktop/procesion-1.0.0-1.aab` / `.apk`.

**jlptest y Daily Challenge:** son TWA de menos de 1 MB y no se tocaron.
