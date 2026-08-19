import { Section } from "@/components/ui/Section";
import { ShieldCheck } from "lucide-react";

/**
 * Odstranění sociálního rizika — nejčastější tichá námitka před workshopem
 * ("co když se ztrapním, co když to udělám špatně").
 */

const JISTOTY = [
  "Dostaneš jednoduchý postup a konkrétní otázky.",
  "Nikdo tě nebude známkovat ani hodnotit.",
  "Nemusíš otevírat citlivé osobní téma — můžeš pracovat s běžnou pracovní situací.",
  "Praktické rozhovory ve dvojicích se nenahrávají.",
  "Úkolem není „koučovat správně“, ale zjistit, jak se v této roli cítíš.",
];

export function NemuzesToPokazit() {
  return (
    <Section id="nemuzes-pokazit" tone="cream">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-2xl bg-white border border-navy-100/60 shadow-soft p-6 sm:p-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-teal-400/15 text-teal-500 shrink-0">
              <ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
            </div>
            <h2 className="h-display text-h2 text-navy-600 leading-tight">
              Nemůžeš to pokazit
            </h2>
          </div>

          <ul className="space-y-4">
            {JISTOTY.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span
                  className="mt-2 h-2 w-2 rounded-full bg-teal-400 shrink-0"
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
