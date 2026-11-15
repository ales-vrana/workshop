import { Section } from "@/components/ui/Section";

/**
 * „Proč praxí, a ne teorií" - přesvědčení značky a vymezení proti starému
 * způsobu učení. Nahrazuje citát o rozvoji a nových obzorech (slova, která
 * podle dat nerozlišují kupce od nekupců).
 *
 * Nepřítel je pasivní učení, ne konkrétní konkurenční škola - záměrně.
 *
 * 11/2026: zkráceno na nadpis a jeden odstavec. Srovnávací tabulka
 * „běžný kurz vs. lekce" mluvila k lidem, kteří už školy porovnávají;
 * problem aware publikum z akviziční reklamy tam ještě není.
 */

export function ProcPraxi() {
  return (
    <Section id="proc-praxi" tone="navy">
      <div className="max-w-3xl mx-auto text-center">
        <p className="h-label text-gold-300 mb-3">Jak to učíme</p>
        <h2 className="h-section text-h2 text-white mb-5">
          Koučování se nedá naučit posloucháním
        </h2>
        <p className="text-base sm:text-lg text-white/80 leading-relaxed">
          O koučování si můžete přečíst všechno a pořád nebudete vědět, jestli
          vám to jde. To se pozná jediným způsobem - když si sednete a povedete
          rozhovor.
        </p>
      </div>
    </Section>
  );
}
