import { Section } from "@/components/ui/Section";
import { ShieldCheck } from "lucide-react";

/**
 * Odstranění sociálního rizika - nejčastější tichá námitka před workshopem
 * ("co když se ztrapním, co když to udělám špatně").
 */

const JISTOTY = [
  "Nemusíš předem umět koučovat. Dostaneš jednoduchý postup a konkrétní otázky.",
  "Nikdo tě nebude známkovat. Přicházíš si koučování vyzkoušet.",
  "Téma si vybíráš ty. Stačí běžná pracovní situace.",
  "Praktické rozhovory ve dvojicích se nenahrávají.",
  "Cílem je získat vlastní zkušenost s koučovacím rozhovorem.",
];

export function NemuzesToPokazit() {
  return (
    <Section id="nemuzes-pokazit" tone="cream">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-2xl bg-white border border-navy-100/60 shadow-soft p-6 sm:p-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-navy-100/40 text-navy-600 shrink-0">
              <ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
            </div>
            <h2 className="h-section text-h2 text-navy-600 leading-tight">
              Můžeš přijít i s nejistotou
            </h2>
          </div>

          <ul className="space-y-4">
            {JISTOTY.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span
                  className="mt-2 h-2 w-2 rounded-full bg-gold-500 shrink-0"
                  aria-hidden
                />
                <p className="text-base sm:text-lg text-dark/80 leading-relaxed">{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
