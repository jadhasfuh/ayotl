# Lo publicado: qué salió, dónde y qué copia local ya no existe

Registro central de los vídeos de los productos. Sirve para dos cosas:
- **No regenerar** una copia de algo que ya salió.
- **No repetir contenido.**

Antes de generar o publicar un vídeo, buscarlo aquí y en el registro de su producto.

Al borrar copias locales para liberar disco, se anota aquí qué era cada vídeo. El 16-oct-2026 el disco quedó al 99 %: las copias locales de lo ya publicado sobran y se pueden borrar.

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

**Al 27-oct-2026:** subidos y programados hasta el 9-nov. Los ids de cada uno están en su `challenges/<sección>/<reto>/meta.json` y en `src/content/retos.json` de ayotl, así que la tabla de arriba ya no se sigue llenando a mano. Falta subir los dos vídeos del 10-nov (`lru-cache`).

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

## YouTube: vídeos de juegos y de jlptest (canal de Adrián), 18:00

- **El plan:** `ayotl/tools/comerciales/youtube.json`. Al subirse, cada vídeo apunta ahí su id. Los sube `subir-youtube.py` según la cuota del día.
- **Las fechas:**
  - 28 y 29-oct: jlptest N5, el largo y el short;
  - 30 y 31-oct: DC, la semana;
  - 1 y 2-nov: War Zone, CPU contra CPU;
  - 3 y 4-nov: Kazan, 8 CPU.
- **Estado al 27-oct:** todavía no se ha subido ninguno. Los mp4 están en `tools/comerciales/salida/`, que no va a git, y la copia en `~/Desktop/videos-leia/`.

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
