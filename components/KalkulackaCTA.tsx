import { Section } from "@/components/ui/Section";
import { CTAButton } from "@/components/ui/CTAButton";
import { TrendingUp, Calculator, ArrowRight } from "lucide-react";
import { WORKSHOP } from "@/lib/config";

/**
 * "Dveře A" — pro lidi zvažující koučování JAKO PROFESI.
 * Sazby kouče v ČR + emotional hook + CTA na workshop.
 *
 * Tarify (1 000 / 2-3 000 / 4-5 000 Kč) jsou tržní data ČR, ne workshop parametry —
 * pokud se trh změní, edituj zde přímo v tomto souboru.
 */

const SAZBY = [
  {
    label: "Ve výcviku",
    rate: "1 000 Kč/hod",
    sub: "začínající kouč v ICF výcviku",
  },
  {
    label: "Po ACC/PCC certifikaci",
    rate: "2–3 000 Kč/hod",
    sub: "certifikovaný ICF kouč",
  },
  {
    label: "Na úrovni MCC",
    rate: "4–5 000 Kč/hod",
    sub: "nejvyšší světová certifikace ICF",
  },
];

export function KalkulackaCTA() {
  return (
    <Section id="kalkulacka" tone="navy">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <p className="h-label text-gold-400 mb-3">Dveře A — Koučování jako profese</p>
          <h2 className="h-display text-h2 text-white mb-5">
            Zvažuješ koučování jako profesi?
            <br />
            <span className="text-teal-300">Přijď si to spočítat i zažít.</span>
          </h2>
        </div>

        {/* Sazby grid */}
        <div className="grid gap-4 sm:gap-5 sm:grid-cols-3 mb-10">
          {SAZBY.map((s, idx) => (
            <article
              key={s.label}
              className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/15 p-5 sm:p-6 text-center transition-all hover:bg-white/10 hover:border-teal-400/40"
            >
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-teal-400/20 ring-1 ring-teal-300/40 mb-3">
                <TrendingUp className="h-5 w-5 text-teal-200" aria-hidden />
              </div>
              <p className="text-xs uppercase tracking-wider text-gold-300 font-bold mb-2">
                {s.label}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold text-white mb-1">
                {s.rate}
              </p>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                {s.sub}
              </p>
            </article>
          ))}
        </div>

        {/* Body */}
        <div className="max-w-2xl mx-auto space-y-5 text-base sm:text-lg text-white/85 leading-relaxed">
          <p>
            Profesionální kouč v ČR si účtuje <strong className="text-teal-300">1 000 Kč/hod ve výcviku</strong>,{" "}
            <strong className="text-teal-300">2–3 000 Kč po certifikaci ICF</strong> a{" "}
            <strong className="text-teal-300">4–5 000 Kč na nejvyšší úrovni</strong>.
            Čísla si můžeš spočítat v naší kalkulačce.
          </p>

          <p>
            Ale jedno číslo ti žádná kalkulačka nedá:{" "}
            <strong className="text-gold-300">jak se budeš cítit, až poprvé povedeš koučovací rozhovor.</strong>{" "}
            Přesně to zjistíš na workshopu.
          </p>

          <p>
            A pokud po něm budeš chtít pokračovat, ukážu ti{" "}
            <strong className="text-white">celou cestu až k mezinárodní certifikaci</strong> —
            včetně toho, jak ji financovat a kde vzít první klienty.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-10 sm:mt-12 flex flex-col items-center gap-4">
          <CTAButton href="#koupit" variant="on-dark" className="w-full sm:w-auto group">
            <span>Zažij to na workshopu — {WORKSHOP.price}</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden />
          </CTAButton>
          <p className="text-xs sm:text-sm text-white/60 flex items-center gap-2 text-center">
            <Calculator className="h-4 w-4 text-teal-300 shrink-0" aria-hidden />
            Cesta od prvního koučovacího rozhovoru po MCC certifikaci se dá rozplánovat na 3–5 let
          </p>
        </div>
      </div>
    </Section>
  );
}
