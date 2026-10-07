# Fuentes autoalojadas

Descargadas una vez de Google Fonts (subconjunto `latin`, el mismo que pedía
`next/font/google`) y cargadas con `next/font/local`. Antes el build las
bajaba de fonts.googleapis.com en cada compilación, y si Google no contestaba
en ese minuto el deploy entero reventaba: le pasó a Mercadito el 5-oct-2026
(commit 3cd632b de ese repo).

| Archivo | Familia | Pesos | Licencia |
|---|---|---|---|
| `inter-latin.woff2` | Inter v20 (variable) | 100-900 | SIL OFL 1.1 |
| `literata-500-latin.woff2` | Literata v40 | 500 | SIL OFL 1.1 |
| `martian-mono-400-latin.woff2` | Martian Mono v6 | 400 | SIL OFL 1.1 |
| `press-start-2p-latin.woff2` | Press Start 2P v16 | 400 | SIL OFL 1.1 |

Para añadir un peso o un subconjunto: pedir la hoja a
`https://fonts.googleapis.com/css2?family=...` con un User-Agent de Chrome
(si no, devuelve TTF) y bajar el `.woff2` del bloque `/* latin */`.
