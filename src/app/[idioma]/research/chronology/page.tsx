import type { Metadata } from "next";
import Link from "next/link";
import { Cabecera } from "@/components/Cabecera";
import { idiomaDe } from "@/lib/paginas";
import { sitio } from "@/lib/sitio";

type Props = { params: Promise<{ idioma: string }> };

/**
 * El extracto público de la cronología de correcciones.
 *
 * Existe por una promesa que no se podía cumplir: el anteproyecto decía que
 * el historial era verificable «en el repositorio público», y el repositorio
 * de Mercadito es privado —tiene datos de negocios reales—. En vez de
 * suavizar la frase a «acceso a petición», se publica el método: el código
 * sigue cerrado y lo que el evaluador abre y lee es esto.
 *
 * Apartados 1, 5, 6 y 8 del documento interno. Fuera queda el 3, los arreglos
 * de cobro: es honestidad interna que vale dentro del equipo y ruido para un
 * lector externo.
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Chronology of corrections · Ayotl",
    description:
      "The times we discovered the platform could not see something we believed it could — dated and hashed, from the research instrument's own history.",
    alternates: { canonical: `${sitio()}/en/research/chronology` },
  };
}

export default async function Chronology({ params }: Props) {
  const idioma = await idiomaDe(params);
  return (
    <>
      <a href="#contenido" className="salto">Skip to content</a>
      <Cabecera idioma={idioma} pagina="notas" />
      <main id="contenido" className="seccion">
        <div className="contenedor">
          <div className="prosa" lang="en">
            <h1>What we kept finding was missing</h1>
            <p className="grande">
              A chronology of corrections to the research instrument. This is not a changelog:
              it is the list of the times we discovered that the platform <em>could not see</em>
              {" "}something we believed it could.
            </p>
            <p>
              It is worth reading for one reason. A project whose thesis is that informal
              commerce <em>produces no structured data</em> spent six months running into that
              same problem inside its own platform — and each finding carries a date and a
              commit hash. 512 commits since 12 April 2026; 76 of them titled <code>fix</code>.
            </p>

            <h2>A model adopted and abandoned</h2>
            <p>
              Mercadito launched as a delivery marketplace charging a 5–8 % commission. On
              <b> 24 August 2026</b> (<code>dbdc382</code>) it stopped operating deliveries:
              orders composed on a digital menu now leave for the business&rsquo;s own WhatsApp,
              and the platform never touches the money.
            </p>
            <p>
              The commission code was not deleted. It remains in the repository behind a feature
              flag, and that is the primary evidence of the proposal: a model that was adopted
              and abandoned, with a date and a hash, is worth more than any claim about it.
            </p>

            <h2>Counters were not data</h2>
            <p>
              The platform had counted menu opens and orders since the beginning — but only as
              running totals. They say <em>how many</em> and never <em>when</em>, and a
              cumulative total cannot be un-aggregated afterwards. Every day without a time
              series was a day lost for good.
            </p>
            <p>
              On <b>28 September 2026</b> (<code>ecbe979</code>) that changed: one row per menu
              open and per order sent, with a timestamp, an origin, a 24-hour random session id
              and an amount band — plus the business&rsquo;s one-tap confirmation that the order
              actually arrived. Without that confirmation the order counter was measuring
              intentions and we were calling them sales.
            </p>

            <h2>The instrument itself was blind</h2>
            <p>
              The most instructive part, and the one worth telling plainly: <b>three times in
              four days the series turned out to be blind to an entire channel</b>. All three
              were corrected the same day they were found — which is the only moment when
              correcting a series costs nothing.
            </p>
            <table>
              <thead>
                <tr><th>Date</th><th>What the series could not see</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>28 Sep</td>
                  <td>The <b>native app</b> sends the same beacon, but <code>origin</code> had no
                      such value: all of its traffic fell into &ldquo;unknown&rdquo;.</td>
                </tr>
                <tr>
                  <td>28 Sep</td>
                  <td>A <b>printed QR code</b> and a link pasted into WhatsApp both arrive without
                      a referrer. New codes are now printed with a marker; the ones already stuck
                      on tables are not, and that limitation is declared.</td>
                </tr>
                <tr>
                  <td>1 Oct</td>
                  <td><b>Facebook and Instagram</b> — the largest channel — fell into
                      &ldquo;unknown&rdquo; or &ldquo;link&rdquo;. Facebook&rsquo;s in-app browser
                      rarely sends a referrer at all.</td>
                </tr>
              </tbody>
            </table>
            <p>Two corrections of the same kind, elsewhere:</p>
            <ul>
              <li>
                <code>8bb59a7</code> — The menu search <b>ignored category names</b>: searching
                &ldquo;hamburguesa&rdquo; in a menu with an entire hamburger section returned
                &ldquo;no results&rdquo;. It lost the order <em>and</em> would have filled the
                empty-search table with catalogue gaps that do not exist.
              </li>
              <li>
                <code>b081891</code> — The courier board&rsquo;s rate limit sat <em>before</em>
                validation, so anyone mistyping their phone number burned their attempts
                correcting their own mistake.
              </li>
            </ul>

            <h2>What the data corrected about us</h2>
            <p>
              The last stretch is not bugs. These are assumptions of ours that the data
              contradicted, on <b>1 October 2026</b>:
            </p>
            <ul>
              <li>
                <b>The catalogue was not where we were looking.</b> Products are generic and
                shared; a business&rsquo;s catalogue lives in the price table — which was already
                a history, so catalogue growth had been datable all along and nobody had noticed.
              </li>
              <li>
                <b>&ldquo;A single order&rdquo; came from the wrong table.</b> 51 orders left
                through the menu to WhatsApp: 452 menu opens, 11.3 % conversion, 18 of 33
                businesses with at least one.
              </li>
              <li>
                <b>Catalogue size predicts nothing.</b> Correlation with menu opens:
                <b> +0.07</b>. The largest catalogue (168 products) has 4 views and zero orders.
              </li>
              <li>
                <b>The platform&rsquo;s business type is not the trade.</b> 49 of 52 are
                &ldquo;market&rdquo;, which only says what they use. The catalogue-size
                hypothesis cannot be tested with that variable: it is not that it comes out
                negative — there is nothing to cross it with.
              </li>
              <li>
                <b>Assisted loading turned out to be constant.</b> All 33 catalogues were loaded
                with help, so there is no cross to run. And that says more: if setting it up was
                never the business&rsquo;s own effort, then the 19 who loaded nothing did not
                even send the photographs.
              </li>
            </ul>

            <p className="nota-pie">
              Extracted from the project&rsquo;s private repository; full commit history
              available to evaluators on request. Related:{" "}
              <Link href="/en/research">the research statement</Link> and{" "}
              <a href="https://mercadito.cx/piloto" rel="noopener">the pilot&rsquo;s public notice</a>.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
