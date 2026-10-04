import { Section } from "@/components/ui/Section";
import { X, Check } from "lucide-react";

/**
 * „Proč praxí, a ne teorií" - přesvědčení značky a vymezení proti starému
 * způsobu učení. Nahrazuje citát o rozvoji a nových obzorech (slova, která
 * podle dat nerozlišují kupce od nekupců).
 *
 * Nepřítel je pasivní učení, ne konkrétní konkurenční škola - záměrně.
 */

const SROVNANI = [
  { stare: "Posloucháte přednášku", nove: "Vedete rozhovor" },
  { stare: "Dozvíte se, co koučování je", nove: "Zjistíte, jestli vám jde" },
  { stare: "Odejdete s poznámkami", nove: "Odejdete s vlastní zkušeností" },
  { stare: "Rozhodujete se podle popisu", nove: "Rozhodujete se podle zážitku" },
];

export function ProcPraxi() {
  return (
    <Section id="proc-praxi" tone="navy">
      <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
        <p className="h-label text-gold-400 mb-3">Jak to učíme</p>
        <h2 className="h-section text-h2 text-white mb-5">
          Koučování se nedá naučit posloucháním
        </h2>
        <p className="text-base sm:text-lg text-white/80 leading-relaxed">
          O koučování si můžete přečíst všechno a pořád nebudete vědět, jestli
          vám to jde. To se pozná jediným způsobem - když si sednete a povedete
          rozhovor.
        </p>
      </div>

      <div className="max-w-3xl mx-auto grid gap-4 sm:gap-0 sm:grid-cols-2 sm:rounded-2xl sm:overflow-hidden sm:border sm:border-white/15">
        <div className="sm:bg-white/5 p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/50 mb-5">
            Běžný kurz
          </p>
          <ul className="space-y-4">
            {SROVNANI.map((r) => (
              <li key={r.stare} className="flex items-start gap-3">
                <X className="h-5 w-5 text-white/35 shrink-0 mt-0.5" aria-hidden />
                <span className="text-base text-white/60">{r.stare}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="sm:bg-white/[0.12] p-5 sm:p-7 rounded-2xl sm:rounded-none border border-white/15 sm:border-0 sm:border-l sm:border-white/15">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-gold-400 mb-5">
            Ukázková lekce CoachVille
          </p>
          <ul className="space-y-4">
            {SROVNANI.map((r) => (
              <li key={r.nove} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-gold-300 shrink-0 mt-0.5" aria-hidden />
                <span className="text-base text-white font-medium">{r.nove}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
