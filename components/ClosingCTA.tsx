import { Section } from "@/components/ui/Section";
import { CTAButton } from "@/components/ui/CTAButton";
import { Check, Calendar, Clock, Monitor } from "lucide-react";
import { WORKSHOP } from "@/lib/config";

/**
 * Závěr v Alešově hlase.
 *
 * Metafora plavání zůstává, „rozhodnutí, které ovlivní další roky" je pryč -
 * J2 na hraně tíhu nepotřebuje. Místo cenové kotvy je rozpis toho, co je
 * v ceně (bez vyčíslení v korunách, u školy s ICF akreditací by nafouknutý
 * balík poškodil důvěru víc, než kolik by přinesl).
 */

const V_CENE = [
  `Živá lekce s MCC koučem (${WORKSHOP.duration}, bez záznamu - jste u toho naživo)`,
  "Praxe v roli kouče i v roli klienta",
  "PDF s pěti koučovacími otázkami do další praxe",
  `Skupina maximálně ${WORKSHOP.capacity} lidí`,
];

export function ClosingCTA() {
  return (
    <Section id="koupit" tone="navy">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="h-section text-h2 text-white mb-6">
          Plavat se taky nenaučíte z knihy o plavání
        </h2>

        <p className="text-base sm:text-lg text-white/85 leading-relaxed mb-5 max-w-2xl mx-auto">
          Můžete si přečíst všechno o technice a pořád nebudete vědět, jestli
          vás voda unese.
        </p>

        <p className="text-base sm:text-lg text-white/85 leading-relaxed mb-10 max-w-2xl mx-auto">
          Za dvě hodiny to budete vědět. Jestli zjistíte, že to pro vás není,
          máte za sebou dvě hodiny, které stály za to.{" "}
          <strong className="text-white">Jestli ano, víte, kam dál.</strong>
        </p>

        {/* Co je v ceně */}
        <div className="rounded-2xl bg-white/5 border border-white/15 p-6 sm:p-8 max-w-2xl mx-auto mb-8 text-left">
          <p className="h-label text-gold-400 mb-5">Co je v ceně</p>
          <ul className="space-y-3">
            {V_CENE.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="h-5 w-5 shrink-0 text-gold-300 mt-0.5" aria-hidden />
                <span className="text-white/90 text-base sm:text-lg">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Info row */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-white/85 mb-8 text-sm sm:text-base font-medium">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-white/70" aria-hidden />
            {WORKSHOP.dateFull}
          </div>
          <div className="hidden sm:block h-4 w-px bg-white/25" aria-hidden />
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-white/70" aria-hidden />
            {WORKSHOP.timeRange}
          </div>
          <div className="hidden sm:block h-4 w-px bg-white/25" aria-hidden />
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-white/70" aria-hidden />
            {WORKSHOP.platform}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <CTAButton href="#terminy" variant="on-dark" className="w-full sm:w-auto">
            Chci si to zkusit
          </CTAButton>
          <p className="text-sm text-white/75 max-w-md">
            {WORKSHOP.price}. Když vás první hodina nechytne, vrátíme vám je.
            Bez vysvětlování.
          </p>
          <p className="text-xs text-white/55">
            Po platbě dostanete e-mailem odkaz na {WORKSHOP.platform} a krátkou přípravu.
          </p>
        </div>
      </div>
    </Section>
  );
}
