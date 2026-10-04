import { Section } from "@/components/ui/Section";
import { CTAButton } from "@/components/ui/CTAButton";
import { FileText } from "lucide-react";

/**
 * „S čím odejdete" - tři otázky místo dvanácti bodů programu.
 *
 * Nahrazuje sekce „Co tě čeká" a „Program". Důvod: dvanáct bodů popisovalo,
 * co se bude dít (produkt), ale žádný neodpovídal na to, s jakou odpovědí
 * člověk odejde. Tyhle tři otázky jsou ty, které dvouhodinová lekce
 * skutečně umí zodpovědět - „uživím se tím?" mezi ně nepatří, ta patří
 * do strategie a do příběhů absolventů.
 */

const ODPOVEDI = [
  {
    otazka: "„Mám na to?“",
    text: "Povedete skutečný koučovací rozhovor podle jednoduchého postupu. Ne teoreticky - s dalším účastníkem a na skutečné téma. Většina lidí je překvapená, co zvládne napoprvé.",
  },
  {
    otazka: "„Jak to vlastně vypadá?“",
    text: "Uvidíte Aleše koučovat naživo. Ne ukázku ze záznamu, ale živý rozhovor, ve kterém uvidíte, co kouč dělá, kdy mlčí a proč se neptá na to, co byste čekali.",
  },
  {
    otazka: "„Dá se to zvládnout vedle práce nebo po pauze?“",
    text: "Uslyšíte lidi, kteří začínali přesně odtud: při plném úvazku, po rodičovské, po výpovědi.",
  },
];

export function SCimOdejdete() {
  return (
    <Section id="s-cim-odejdete" tone="white">
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
        <p className="h-label mb-3">S čím odejdete</p>
        <h2 className="h-section text-h2 text-navy-600">
          Tři otázky, na které za dvě hodiny dostanete odpověď
        </h2>
      </div>

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-3 max-w-5xl mx-auto">
        {ODPOVEDI.map((o) => (
          <article key={o.otazka} className="card flex flex-col">
            <h3 className="text-xl sm:text-2xl font-bold text-navy-600 leading-snug mb-4">
              {o.otazka}
            </h3>
            <p className="text-base text-dark/75 leading-relaxed">{o.text}</p>
          </article>
        ))}
      </div>

      <div className="max-w-3xl mx-auto mt-8 sm:mt-10">
        <div className="highlight-box flex items-start gap-3">
          <FileText className="h-5 w-5 text-gold-600 shrink-0 mt-0.5" aria-hidden />
          <p className="text-dark/80">
            Odnesete si PDF s pěti koučovacími otázkami, se kterými můžete
            pracovat hned druhý den.
          </p>
        </div>
      </div>

      <div className="text-center mt-8 sm:mt-10">
        <CTAButton href="#terminy" ariaLabel="Chci si to zkusit - vybrat termín">
          Chci si to zkusit
        </CTAButton>
      </div>
    </Section>
  );
}
