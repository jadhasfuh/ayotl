import type { Metadata } from "next";
import Link from "next/link";
import { Cabecera } from "@/components/Cabecera";
import { ruta } from "@/lib/idioma";
import { idiomaDe } from "@/lib/paginas";
import { sitio } from "@/lib/sitio";

type Props = { params: Promise<{ idioma: string }> };

/**
 * El research statement, sólo en inglés.
 *
 * Única página del sitio que no se traduce, y a posta: su lector es un
 * profesor japonés o un evaluador de la beca, no alguien de Sahuayo. Se sirve
 * igual en las dos direcciones para no romper el enrutado por idioma, con la
 * canónica apuntando siempre a /research.
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Research · Ayotl",
    description:
      "Informal messaging commerce in small Mexican cities: four data sources, aggregation-by-design privacy, and a platform that pivoted to the channel it was competing with.",
    alternates: { canonical: `${sitio()}/research` },
  };
}

export default async function Research({ params }: Props) {
  const idioma = await idiomaDe(params);
  return (
    <>
      <a href="#contenido" className="salto">Skip to content</a>
      <Cabecera idioma={idioma} pagina="notas" />
      <main id="contenido" className="seccion">
        <div className="contenedor">
          <div className="prosa" lang="en">
            <h1>Research</h1>
            <p className="grande">
              How do you give a business numbers when its real sales channel is an informal
              one — WhatsApp, a phone call, word of mouth — without taking away the channel
              that actually works for it?
            </p>

            <h2>The problem</h2>
            <p>
              Mexican micro-enterprises are usually described as un-digitalised. The
              description is wrong in an interesting way: they <em>are</em> digital, through
              messaging. One in three small businesses says it built itself on WhatsApp, and
              more than 65 % of Mexican online shoppers have bought through a chat. What that
              channel doesn&rsquo;t produce is structured data — so the business never learns
              when its demand arrives, what is asked for most, or how many people looked at
              its menu and didn&rsquo;t order.
            </p>
            <p>
              I ran into this from the inside. <Link href={ruta("inicio", idioma)}>Mercadito</Link>,
              a platform I built, started as a delivery marketplace with a 5–8 % commission.
              On 24 August 2026 it stopped operating deliveries and was redesigned around the
              channel that had beaten it: orders now leave for the business&rsquo;s own
              WhatsApp. The commission code is still in the repository, switched off behind a
              flag — a model walked and abandoned, dated and auditable. The same pattern shows
              up in public reviews of the local competitor, where customers describe couriers
              phoning the restaurant to place the order by hand.
            </p>

            <h2>Four data sources</h2>
            <ul>
              <li>
                <b>Event-level telemetry of the WhatsApp menu channel</b>, one row per menu
                open and per order sent, prospective since 28 September 2026.
              </li>
              <li>
                <b>A prospective delivery logbook</b>, from October 2026: an instrumented
                field diary a courier fills in himself at the end of each day.
              </li>
              <li>
                <b>Timestamped table and point-of-sale records</b>, already running — the only
                orders the platform sees end to end.
              </li>
              <li>
                <b>A public corpus of 1,167 reviews</b> of five delivery apps: the local
                competitor plus Uber Eats and DiDi Food as a national baseline.
              </li>
            </ul>

            <h2>Aggregation by design</h2>
            <p>
              Personal data is not anonymised after the fact; it is not captured. Amount bands
              instead of tickets, neighbourhood instead of street address, time-of-day band
              instead of the customer&rsquo;s clock, a random session id that expires in 24
              hours and is never linked to an account. Participating businesses are told what
              is measured and can opt out by email without losing anything — the notice and
              the exclusion route are public at{" "}
              <a href="https://mercadito.cx/piloto" rel="noopener">mercadito.cx/piloto</a>.
            </p>

            <h2>Why Japan</h2>
            <p>
              Not because Japan solved this. It didn&rsquo;t: it has its own shuttered
              shopping streets and its SMEs lag on digital transformation. Japan is the
              world&rsquo;s most instructive laboratory precisely because it faces the same
              structural problem — ageing owners, informal channels, succession gaps — while
              having produced the most systematic policy response anywhere: shōtengai
              revitalisation programmes, subsidies for adopting digital tools, and a national
              SME productivity programme. Both its successes and its failures are documented,
              and both are what I want to study and adapt.
            </p>

            <p className="nota-pie">
              Adrián Ceja Rentería · Sahuayo, Michoacán, Mexico. Applicant to the JICA
              Knowledge Co-Creation Program (Information Science and Engineering, Ritsumeikan
              University). Written up in Spanish as{" "}
              <Link href={`${ruta("notas", idioma)}/mercadito-se-vuelve-gratuito`}>
                a technical note
              </Link>.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
