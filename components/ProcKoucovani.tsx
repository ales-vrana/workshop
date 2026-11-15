import { Section } from "@/components/ui/Section";
import { Check } from "lucide-react";

/**
 * Most mezi „Poznáváte se?" a lekcí (11/2026).
 *
 * Problem aware člověk z akviziční reklamy ví, že chce pracovat s lidmi,
 * ale koučování jako cestu často nezná (žádný z pěti kupujících ACC+PCC
 * nepřišel s tím, že chce být koučem). Tři řádky vysvětlí, proč je
 * koučování odpověď, a lekci představí jako nejjednodušší první krok.
 * Bez příjmových čísel a slibů.
 */

const BODY = [
  "Pomáháte lidem najít jejich vlastní odpovědi. Neradíte, ptáte se.",
  "Online, z domova, nejdřív vedle současné práce.",
  "S mezinárodní certifikací ICF jako uznávaná profese, ne koníček.",
];

export function ProcKoucovani() {
  return (
    <Section id="proc-koucovani" tone="navy">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <p className="h-label text-gold-300 mb-3">Proč koučování</p>
          <h2 className="h-section text-h2 text-white">
            Koučování je práce s lidmi, která se dá dělat profesionálně
          </h2>
        </div>

        <ul className="space-y-4 max-w-2xl mx-auto">
          {BODY.map((b) => (
            <li key={b} className="flex items-start gap-3">
              <Check className="h-5 w-5 shrink-0 text-gold-300 mt-1" aria-hidden />
              <span className="text-base sm:text-lg text-white/85 leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>

        <p className="text-center text-base sm:text-lg text-white font-semibold mt-8 sm:mt-10">
          Ukázková lekce je nejjednodušší způsob, jak zjistit, jestli je to pro vás.
        </p>
      </div>
    </Section>
  );
}
