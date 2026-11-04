import type { Nota } from "./notas";

/**
 * Los tres dominios que abrían para unos y para otros no (3 y 4-nov-2026): mercadito.cx, jlptest.org y
 * dailychallenge.click tenían la raíz en el DNS de Hostinger apuntando a Railway con un ALIAS, y los tres
 * dejaron de resolver a medias con un día de diferencia. Primera versión el 4-nov por la mañana (sólo Mercadito,
 * a partir del relato de Adrián); reescrita ese mediodía, cuando jlptest y Daily Challenge ya estaban en
 * Cloudflare, con la receta completa de la mudanza. El id se conserva porque la URL ya existía.
 */
export const NOTA_DNS: Nota = {
  id: "dns-a-medias-mercadito",
  fecha: "2026-11-04",
  proyecto: "ayotl",
  titulo: {
    es: "Tres dominios que abrían para unos y para otros no",
    en: "Three domains that opened for some and not for others",
  },
  entradilla: {
    es: "El servidor estaba perfecto y el chequeo decía «success» toda la noche. Aun así, para Cloudflare, OpenDNS y el verificador de Google, mercadito.cx no existía. Al día siguiente le pasó a jlptest.org, y a mediodía le estaba pasando a dailychallenge.click sin que nadie lo supiera. Era el DNS, los tres estaban en el mismo sitio, y esto es lo que aprendimos al moverlos.",
    en: "The server was fine and the health check said \"success\" all night. Still, for Cloudflare, OpenDNS and Google's checker, mercadito.cx did not exist. The next day it happened to jlptest.org, and by midday it was happening to dailychallenge.click without anyone knowing. It was DNS, all three lived in the same place, and this is what we learned moving them.",
  },
  cuerpo: [
    { tipo: "h2", texto: { es: "Qué pasó", en: "What happened" } },
    { tipo: "p", texto: {
      es: "La noche del 3 de noviembre, Google Play rechazó la app de Mercadito porque su verificador no pudo abrir la URL de la política de privacidad. La política estaba en línea. Dos teléfonos abrían la página sin problema, por caché; Cloudflare, OpenDNS y el verificador de Google, no. El servidor en Railway estaba perfecto y el chequeo de salud en GitHub había dicho «success» toda la noche. Si esa revisión no hubiera estado en curso, la caída parcial habría seguido hasta que algún negocio dijera «no me abre el menú».",
      en: "On the night of 3 November, Google Play rejected the Mercadito app because its checker couldn't open the privacy policy URL. The policy was online. Two phones opened the page fine, from cache; Cloudflare, OpenDNS and Google's checker didn't. The server on Railway was fine and the health check on GitHub had said \"success\" all night. Had that review not been in progress, the partial outage would have gone on until some business said \"the menu won't open\".",
    } },
    { tipo: "p", texto: {
      es: "A la mañana siguiente le tocó a jlptest.org, con los mismos síntomas. Y al correr las comprobaciones sobre el tercer dominio de la casa, dailychallenge.click estaba fallando en ese preciso momento: los dos servidores de nombres de Hostinger devolvían SERVFAIL en siete de cada ocho consultas del registro A de la raíz; Cloudflare, Google y OpenDNS ya no lo resolvían, y sólo Quad9 seguía contestando desde su caché. Ninguna queja, ningún aviso. La única huella era que la publicación automática de la mañana había salido en Facebook y no en Instagram: Instagram descarga la imagen desde el dominio, y no pudo resolverlo.",
      en: "The next morning it was jlptest.org's turn, with the same symptoms. And when the checks were run on the third domain of the family, dailychallenge.click was failing at that very moment: Hostinger's two name servers returned SERVFAIL on seven of every eight queries for the A record at the apex; Cloudflare, Google and OpenDNS no longer resolved it, and only Quad9 was still answering from its cache. No complaints, no warning. The only trace was that the morning's automatic post had gone out on Facebook and not on Instagram: Instagram fetches the image from the domain, and couldn't resolve it.",
    } },
    { tipo: "p", texto: {
      es: "A las 12:40 del 4 de noviembre los tres dominios estaban en Cloudflare y resolvían en todos los resolvedores públicos; tres minutos después, los registros de .org y .click ya apuntaban a los servidores de nombres nuevos.",
      en: "By 12:40 on 4 November all three domains were on Cloudflare and resolved on every public resolver; three minutes later, the .org and .click registries already pointed at the new name servers.",
    } },
    { tipo: "h2", texto: { es: "Por qué", en: "Why" } },
    { tipo: "p", texto: {
      es: "Los tres dominios apuntaban a Railway con un registro ALIAS en la raíz, en el DNS de Hostinger. Railway te da un nombre, no una IP; en un subdominio eso se resuelve con un CNAME normal, pero el estándar DNS no permite CNAME en la raíz, así que algunos proveedores ofrecen un «ALIAS» que resuelve el nombre por detrás y devuelve la IP cada vez que alguien pregunta. Hostinger lo ofrece, y Railway documenta que ahí no funciona de forma confiable. Esa resolución fue la que falló, en los tres, con un día de diferencia.",
      en: "All three domains pointed at Railway with an ALIAS record at the apex, in Hostinger's DNS. Railway gives you a name, not an IP; on a subdomain that resolves with a normal CNAME, but the DNS standard doesn't allow a CNAME at the apex, so some providers offer an \"ALIAS\" that resolves the name behind the scenes and returns the IP every time someone asks. Hostinger offers it, and Railway documents that it doesn't work reliably there. That resolution is what broke, on all three, a day apart.",
    } },
    { tipo: "p", texto: {
      es: "La falla fue silenciosa y parcial. Los servidores de Hostinger seguían contestando el SOA, las TXT y los NS; sólo el registro A de la raíz devolvía SERVFAIL, y no siempre: una de cada ocho consultas salía bien. Como los resolvedores grandes tienen varios puntos de presencia y guardan caché, unos seguían dando la IP y otros no. Nadie recibió un aviso, ni de Hostinger, ni de Railway, ni del chequeo de salud, porque el servidor estaba perfecto y el chequeo le preguntaba a un resolvedor que todavía tenía la respuesta en caché. Un fallo de DNS se ve desde fuera como cualquier otra cosa: como «política de privacidad inválida», o como un reel que no sale en Instagram.",
      en: "The failure was silent and partial. Hostinger's servers kept answering the SOA, the TXT and the NS records; only the A record at the apex returned SERVFAIL, and not always: one query in eight came back fine. Since the big resolvers have several points of presence and keep caches, some kept giving the IP and others didn't. Nobody got a warning, not from Hostinger, not from Railway, not from the health check, because the server was fine and the check was asking a resolver that still had the answer cached. From the outside, a DNS failure looks like anything else: like \"invalid privacy policy\", or like a reel that doesn't show up on Instagram.",
    } },
    { tipo: "h2", texto: { es: "Cómo se arregla", en: "How it gets fixed" } },
    { tipo: "p", texto: {
      es: "En dos pasos, y en este orden. Primero el parche: cambiar el ALIAS por un registro A con la IP que el nombre de Railway devuelve en ese momento, con TTL de cinco minutos. Funciona en minutos, pero es frágil, porque Railway no promete que esa IP sea fija: de hecho, entre la mañana y el mediodía el nombre de uno de los dominios ya devolvía otra. Sirve para sostener el dominio mientras se hace el arreglo, y para que los resolvedores que sigan preguntándole al proveedor viejo durante la mudanza reciban respuesta.",
      en: "In two steps, in this order. First the patch: replace the ALIAS with an A record holding the IP the Railway name returns at that moment, with a five-minute TTL. It works within minutes, but it's fragile, because Railway doesn't promise that IP stays fixed: in fact, between the morning and midday the name of one of the domains was already returning a different one. It keeps the domain up while the real fix is done, and gives an answer to the resolvers that keep asking the old provider during the move.",
    } },
    { tipo: "p", texto: {
      es: "Después el arreglo: mover el DNS a Cloudflare, que sí aplana el CNAME en la raíz y que Railway soporta explícitamente. Es gratis y no mueve el dominio de registrador: sólo cambian los servidores de nombres. Lo que aprendimos haciéndolo tres veces en un día:",
      en: "Then the fix: move DNS to Cloudflare, which does flatten the CNAME at the apex and which Railway supports explicitly. It's free and doesn't move the domain away from the registrar: only the name servers change. What we learned doing it three times in one day:",
    } },
    { tipo: "lista", puntos: {
      es: [
        "El escaneo automático de Cloudflare no es un inventario. De los nueve registros de Daily Challenge encontró cuatro: el www y las TXT de la raíz. No vio el ALIAS (no puede), ni el CNAME del subdominio de Kazan, ni las TXT con las que Railway verifica cada dominio. Hay que abrir la zona del registrador y compararla registro por registro antes de cambiar nada.",
        "Cada dominio personalizado tiene su propio destino en Railway. El de la raíz no es el de www ni el del subdominio: son tres nombres distintos de up.railway.app, y la raíz tiene que ir al suyo. El CNAME en la raíz lo acepta Cloudflare y lo aplana solo.",
        "Todo con la nube gris, «DNS only». Con el proxy encendido, el certificado lo intentaría dar Cloudflare y Railway dejaría de poder renovar el suyo.",
        "Las TXT de verificación de Railway (_railway-verify y las de cada subdominio) se copian también. No cuestan nada y evitan tener que volver a verificar el dominio.",
        "Antes de cambiar los servidores de nombres, preguntarle directamente al de Cloudflare por cada registro (dig @alec.ns.cloudflare.com …). Si contesta bien ahí, la mudanza no puede salir mal; si no, todavía no se ha roto nada.",
        "Con el parche puesto en el proveedor viejo, el cambio de servidores de nombres no tiene ventana de caída. Para .org y .click el registro se actualizó en minutos; Cloudflare avisa por correo cuando la zona queda activa.",
        "Si el dominio manda o recibe correo, los registros de correo van en la misma lista. jlptest.org manda sus correos de acceso con Resend y tenía cuatro (SPF, DKIM, DMARC y el MX de los rebotes) que el escaneo tampoco habría encontrado todos; se copiaron y se comprobaron uno por uno en el servidor nuevo. Un dominio que resuelve pero ya no firma su correo es la misma falla silenciosa con otro disfraz.",
      ],
      en: [
        "Cloudflare's automatic scan is not an inventory. Of Daily Challenge's nine records it found four: the www and the TXT records at the apex. It didn't see the ALIAS (it can't), nor the CNAME of Kazan's subdomain, nor the TXT records Railway uses to verify each domain. Open the registrar's zone and compare it record by record before changing anything.",
        "Every custom domain has its own target on Railway. The apex's isn't the www's nor the subdomain's: they're three different up.railway.app names, and the apex has to go to its own. Cloudflare accepts the CNAME at the apex and flattens it by itself.",
        "Everything with the grey cloud, \"DNS only\". With the proxy on, Cloudflare would try to serve the certificate and Railway could no longer renew its own.",
        "Railway's verification TXT records (_railway-verify and the ones for each subdomain) get copied too. They cost nothing and save having to verify the domain again.",
        "Before changing the name servers, ask Cloudflare's server directly for each record (dig @alec.ns.cloudflare.com …). If it answers correctly there, the move can't go wrong; if it doesn't, nothing is broken yet.",
        "With the patch in place at the old provider, the name-server change has no outage window. For .org and .click the registry updated within minutes; Cloudflare emails when the zone goes active.",
        "If the domain sends or receives email, the mail records go on the same list. jlptest.org sends its sign-in emails through Resend and had four (SPF, DKIM, DMARC and the bounce MX) that the scan wouldn't have found in full either; they were copied and checked one by one on the new server. A domain that resolves but no longer signs its email is the same silent failure in a different disguise.",
      ],
    } },
    { tipo: "h2", texto: { es: "Qué hacer distinto", en: "What to do differently" } },
    { tipo: "lista", puntos: {
      es: [
        "Antes de apuntar una raíz a un PaaS (Railway, Render, Fly, Vercel…), leer su página de dominios y la lista de proveedores DNS que no soportan aplanado o ALIAS. Si el registrador está en la lista, no usar su DNS: Cloudflare, en «DNS only», desde el día uno, o poner el sitio en www y redirigir la raíz. Hostinger, GoDaddy, Route 53, Azure DNS y Squarespace estaban en la lista de Railway.",
        "Registrador y DNS son dos cosas. Comprar el dominio donde se quiera, pero llevar el DNS a un proveedor hecho para eso.",
        "Nunca un A fijo a un PaaS, salvo como parche con TTL corto y anotado para quitarlo.",
        "Cuando un dominio de la familia falle, revisar a sus hermanos esa misma hora y moverlos todos, no sólo al que se rompió. Daily Challenge llevaba horas caído a medias y nadie lo sabía; se encontró porque se buscó.",
        "Vigilar el DNS, no sólo el servidor. Un chequeo externo que resuelva cada dominio desde varios resolvedores (1.1.1.1, 8.8.8.8, 9.9.9.9) y abra la URL cada pocos minutos habría avisado antes que Google. Hay servicios gratuitos; uno basta por proyecto.",
        "Cuando algo falle «a medias», a unos sí y a otros no, sospechar del DNS primero.",
        "Cuando una tienda, Google o un cliente diga «no abre», no quedarse con su diagnóstico. «Política inválida» era un síntoma; el problema no estaba en la política.",
      ],
      en: [
        "Before pointing an apex at a PaaS (Railway, Render, Fly, Vercel…), read its domains page and the list of DNS providers that don't support flattening or ALIAS. If the registrar is on the list, don't use its DNS: Cloudflare, in \"DNS only\", from day one, or put the site on www and redirect the apex. Hostinger, GoDaddy, Route 53, Azure DNS and Squarespace were on Railway's list.",
        "Registrar and DNS are two different things. Buy the domain wherever you like, but take the DNS to a provider built for it.",
        "Never a fixed A record to a PaaS, except as a patch with a short TTL, noted down so it gets removed.",
        "When one domain in the family fails, check its siblings that same hour and move all of them, not just the one that broke. Daily Challenge had been half down for hours and nobody knew; it was found because someone looked.",
        "Watch the DNS, not just the server. An external check that resolves each domain from several resolvers (1.1.1.1, 8.8.8.8, 9.9.9.9) and opens the URL every few minutes would have warned before Google did. There are free services; one per project is enough.",
        "When something fails \"halfway\", for some and not for others, suspect DNS first.",
        "When a store, Google or a customer says \"it won't open\", don't settle for their diagnosis. \"Invalid policy\" was a symptom; the problem wasn't in the policy.",
      ],
    } },
    { tipo: "h2", texto: { es: "Los comandos", en: "The commands" } },
    { tipo: "codigo", texto: `# ¿contesta el servidor que manda? (SERVFAIL = la falla)
dig @atlas.dns-parking.com dailychallenge.click A

# ¿coinciden los resolvedores públicos?
dig @1.1.1.1 dailychallenge.click A
dig @8.8.8.8 dailychallenge.click A

# ¿el servidor sirve si lo alcanzas directo, sin DNS?
curl --resolve dailychallenge.click:443:<IP> https://dailychallenge.click/`, pie: {
      es: "Tres comandos lo resuelven en un minuto. Si el tercero funciona y el primero no, el problema es DNS y no el código.",
      en: "Three commands settle it in a minute. If the third one works and the first one doesn't, the problem is DNS, not the code.",
    } },
    { tipo: "codigo", texto: `# los hermanos, de un tirón: un SERVFAIL en cualquiera es la falla
for d in mercadito.cx jlptest.org dailychallenge.click; do
  for r in 1.1.1.1 8.8.8.8 9.9.9.9; do
    echo "$d @$r: $(dig @$r $d A +time=3 +tries=1 | grep -o 'status: [A-Z]*')"
  done
done

# antes de cambiar los servidores de nombres: ¿la zona nueva contesta bien?
dig @alec.ns.cloudflare.com dailychallenge.click A
dig @alec.ns.cloudflare.com kazan.dailychallenge.click CNAME
dig @alec.ns.cloudflare.com _railway-verify.dailychallenge.click TXT

# después: ¿ya cambió en el registro?
dig +short NS dailychallenge.click @8.8.8.8`, pie: {
      es: "El bucle tarda un minuto y da nueve respuestas; vale la pena correrlo cada vez que un dominio de la familia dé un susto, y mejor aún, que lo corra solo un chequeo externo. Los otros tres se corren una vez, antes y después de la mudanza.",
      en: "The loop takes a minute and gives nine answers; worth running every time one domain in the family gives a scare, and better still, have an external check run it on its own. The other three run once, before and after the move.",
    } },
    { tipo: "p", texto: {
      es: "Y una lección de otro tipo, que apareció en el camino: lo que no se mira no se actualiza. El manifest del sitio de Mercadito y su política de privacidad seguían describiendo el reparto a domicilio dos meses y medio después de quitarlo. Cada vez que un producto cambia de modelo, conviene una lista corta de «textos fuera de la app» (política, tiendas, manifest, metadatos, correos automáticos) para revisarlos el mismo día.",
      en: "And a lesson of another kind that showed up along the way: what isn't looked at doesn't get updated. Mercadito's site manifest and its privacy policy were still describing home delivery two and a half months after it was removed. Every time a product changes its model, it pays to keep a short list of \"texts outside the app\" (policy, stores, manifest, metadata, automatic emails) and review them the same day.",
    } },
  ],
};
