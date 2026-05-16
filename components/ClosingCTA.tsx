import { Section } from "@/components/ui/Section";
import { CTAButton } from "@/components/ui/CTAButton";
import { Calendar, Clock, Monitor, Check } from "lucide-react";
import { WORKSHOP } from "@/lib/config";

export function ClosingCTA() {
  return (
    <Section id="koupit" tone="navy">
      <div className="max-w-3xl mx-auto text-center">
        <p className="h-label text-gold-400 mb-3">Závěrečné CTA</p>
        <h2 className="h-display text-h2 text-white mb-6">
          Tři hodiny, které se nedají získat z knih
        </h2>
        <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-10 max-w-2xl mx-auto">
          Koučování je dovednost, kterou si nelze přečíst. Stejně jako nelze přečíst plavání.
          Můžeš se o něm dozvědět hodně. Ale dokud se nevykoupeš, nevíš, jak ti to půjde.
          <br /><br />
          <strong className="text-white">Tenhle workshop je tvoje první ponoření.</strong>
        </p>

        <ul className="text-left space-y-4 max-w-2xl mx-auto mb-10">
          <li className="flex items-start gap-3">
            <Check className="h-6 w-6 shrink-0 text-teal-300 mt-0.5" aria-hidden />
            <span className="text-white/90 text-base sm:text-lg">
              <strong className="text-teal-300">3 hodiny živé praxe</strong> — v roli kouče i klienta
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="h-6 w-6 shrink-0 text-teal-300 mt-0.5" aria-hidden />
            <span className="text-white/90 text-base sm:text-lg">
              <strong className="text-teal-300">S ICF MCC koučem</strong> — držitelem nejvyšší světové certifikace
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="h-6 w-6 shrink-0 text-teal-300 mt-0.5" aria-hidden />
            <span className="text-white/90 text-base sm:text-lg">
              <strong className="text-teal-300">Max 16 lidí</strong> — malá skupina, osobní pozornost
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="h-6 w-6 shrink-0 text-teal-300 mt-0.5" aria-hidden />
            <span className="text-white/90 text-base sm:text-lg">
              <strong className="text-teal-300">Garance:</strong> pokud po 60 minutách necítíš přínos, vrátím ti 100 % ceny
            </span>
          </li>
        </ul>

        <div className="rounded-xl bg-gold-500/15 border border-gold-500/30 px-5 py-4 max-w-2xl mx-auto mb-10">
          <p className="text-base sm:text-lg font-semibold text-gold-300">
            Záznam, PDF s 5 koučovacími otázkami a přístup do Q&amp;A skupiny zůstávají tvoje navždy.
          </p>
        </div>

        {/* Info row */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-white/85 mb-8 text-sm sm:text-base font-medium">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-teal-300" aria-hidden />
            {WORKSHOP.dateFull}
          </div>
          <div className="hidden sm:block h-4 w-px bg-white/25" aria-hidden />
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-teal-300" aria-hidden />
            {WORKSHOP.timeRange}
          </div>
          <div className="hidden sm:block h-4 w-px bg-white/25" aria-hidden />
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-teal-300" aria-hidden />
            {WORKSHOP.platform}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <CTAButton href={WORKSHOP.paymentLink} variant="on-dark" className="w-full sm:w-auto">
            Zajisti si své místo — {WORKSHOP.price}
          </CTAButton>
          <p className="text-xs text-white/60">
            Maximální kapacita {WORKSHOP.capacity} účastníků. Po platbě dostaneš e-mailem Zoom link a krátkou přípravu.
          </p>
        </div>
      </div>
    </Section>
  );
}
