import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_IDIOMA, esIdioma, idiomaDeCabecera, type Idioma } from "@/lib/idioma";

/**
 * Enruta el idioma sin ensuciar las URL.
 *
 * Las páginas viven en `src/app/[idioma]/…`, pero al público el español se
 * le sirve sin prefijo (`/beta`) y el inglés con `/en` (`/en/beta`). Aquí se
 * reescribe `/beta` → `/es/beta` por dentro (el navegador no lo ve) y se
 * traduce el único slug distinto: `/en/about` → `/en/acerca`.
 *
 * Las direcciones internas que alguien teclee a mano (`/es/beta`,
 * `/en/acerca`) redirigen a la canónica, para que el buscador vea una sola.
 *
 * La cookie guarda el idioma de la última página vista: sirve para que la
 * raíz mande a `/en` a quien prefiera inglés **la primera vez** y nunca más,
 * porque si no el selector "Español" desde `/en` entraría en bucle.
 */
export function proxy(req: NextRequest) {
  // Una sola dirección buena: sin www. Copiado de jlptest, incluida la trampa
  // del puerto: detrás del proxy de Railway `.host` arrastraría el 8080.
  const host = req.headers.get("host") ?? "";
  if (host.startsWith("www.")) {
    const destino = req.nextUrl.clone();
    destino.hostname = host.slice(4).split(":")[0];
    destino.port = "";
    destino.protocol = "https:";
    return NextResponse.redirect(destino, 308);
  }

  const { pathname } = req.nextUrl;
  const cookie = req.cookies.get(COOKIE_IDIOMA)?.value;

  if (pathname === "/es" || pathname.startsWith("/es/")) {
    const destino = req.nextUrl.clone();
    destino.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(destino, 308);
  }
  // Las rutas internas en inglés llevan el nombre español de la carpeta; si
  // alguien las teclea, se le manda a la dirección pública.
  const INTERNAS_EN: Record<string, string> = { "/en/acerca": "/en/about", "/en/negocios": "/en/business", "/en/notas": "/en/notes" };
  if (INTERNAS_EN[pathname]) {
    const destino = req.nextUrl.clone();
    destino.pathname = INTERNAS_EN[pathname];
    return NextResponse.redirect(destino, 308);
  }
  if (pathname === "/" && !esIdioma(cookie)
      && idiomaDeCabecera(req.headers.get("accept-language")) === "en") {
    const destino = req.nextUrl.clone();
    destino.pathname = "/en";
    return NextResponse.redirect(destino, 302);
  }

  let idioma: Idioma;
  let interno: string;
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    idioma = "en";
    const PUBLICAS_EN: Record<string, string> = { "/en/about": "/en/acerca", "/en/business": "/en/negocios", "/en/notes": "/en/notas" };
    // Las notas cuelgan de la sección: /en/notes/<id> -> /en/notas/<id>
    interno = PUBLICAS_EN[pathname]
      ?? (pathname.startsWith("/en/notes/") ? pathname.replace("/en/notes/", "/en/notas/") : pathname);
  } else {
    idioma = "es";
    interno = pathname === "/" ? "/es" : `/es${pathname}`;
  }

  let res: NextResponse;
  if (interno === pathname) {
    res = NextResponse.next();
  } else {
    const url = req.nextUrl.clone();
    url.pathname = interno;
    res = NextResponse.rewrite(url);
  }
  if (cookie !== idioma) {
    res.cookies.set(COOKIE_IDIOMA, idioma, {
      path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax",
    });
  }
  return res;
}

export const config = {
  // Sólo páginas: ni la API, ni lo estático, ni las imágenes generadas.
  matcher: ["/((?!api|_next|og|icono|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|ico|jpg|webp|txt|xml|json)$).*)"],
};
