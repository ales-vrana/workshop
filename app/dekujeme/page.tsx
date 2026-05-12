import type { Metadata } from "next";
import Link from "next/link";
import { Check, Calendar, Video, Sparkles, Mail, ExternalLink, ArrowLeft } from "lucide-react";
import { CalendarButtons } from "@/components/CalendarButtons";
import { CopyButton } from "@/components/CopyButton";
import { WORKSHOP, COACH } from "@/lib/config";

export const metadata: Metadata = {
  title: "Děkujeme — vaše místo na workshop je rezervováno | CoachVille",
  description:
    'Platba potvrzena. Vidíme se 19. 5. 2026 na workshopu „Půjde mi koučování?". Uložte si termín do kalendáře a najdete tu i Zoom odkaz.',
  robots: { index: false, follow: false }, // Thank-you page se neindexuje
};

const PREP_STEPS = [
  {
    title: "Tichý prostor + zapnutá kamera",
    body: "Workshop je interaktivní — budete koučovat i být koučováni. Bez kamery a klidného prostředí nepůjde se plně účastnit.",
  },
  {
    title: "Téma, které právě řešíte",
    body: "Připravte si jednu konkrétní situaci ze života — kariéra, vztahy, rozhodnutí. S ní budete pracovat ve dvojici.",
  },
  {
    title: "Papír a tužka (volitelné)",
    body: "Spousta účastníků si během workshopu zapisuje postřehy a otázky, které je napadnou. Užitečné pro zpětnou reflexi.",
  },
  {
    title: "Den před: vypněte notifikace",
    body: "Workshop staví na hluboké pozornosti. 3 hodiny offline od Slacku/emailu udělají obrovský rozdíl ve výsledku.",
  },
];

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-cream">
      {/* HERO se success indikátorem */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 to-navy-600 text-white">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-teal-400/15 to-transparent" />
        </div>

        <div className="container-x relative pt-16 pb-12 sm:pt-20 sm:pb-16 text-center max-w-2xl mx-auto">
          {/* Success check */}
          <div className="inline-flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-green-500 shadow-lifted ring-8 ring-white/10 animate-fade-up">
            <Check className="h-10 w-10 sm:h-12 sm:w-12 text-white" strokeWidth={3} aria-hidden />
          </div>

          <h1 className="mt-6 sm:mt-8 h-display text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
            Vaše místo
            <br />
            je rezervováno
          </h1>

          <p className="mt-4 text-base sm:text-lg text-white/85 font-medium">
            Vidíme se v {WORKSHOP.dateFull} v 18:30.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-teal-400/15 border border-teal-300/30 px-4 py-2">
            <Mail className="h-4 w-4 text-teal-200" aria-hidden />
            <span className="text-xs sm:text-sm font-medium text-teal-100">
              Potvrzení jsme poslali na váš e-mail
            </span>
          </div>
        </div>
      </section>

      {/* OBSAH — 3 karty */}
      <section className="container-x py-12 sm:py-14 max-w-2xl mx-auto space-y-5 sm:space-y-6">

        {/* Karta 1 — Kalendář */}
        <article className="bg-white rounded-2xl shadow-soft p-6 sm:p-8 border-t-4 border-gold-500">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-label text-gold-500">Krok 1 — uložte si termín</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-navy-600 mb-3 leading-tight">
            <Calendar className="inline h-6 w-6 mr-2 align-text-bottom" aria-hidden />
            Přidat workshop do kalendáře
          </h2>
          <p className="text-sm sm:text-base text-dark/70 mb-5 leading-relaxed">
            <strong className="text-navy-700">{WORKSHOP.title}</strong>
            <br />
            {WORKSHOP.dateFull} • {WORKSHOP.timeRange} • online přes {WORKSHOP.platform}
          </p>

          <CalendarButtons />

          <p className="text-xs text-dark/55 mt-4 italic">
            Kalendář vám 1 hodinu předem pošle připomenutí. Doporučujeme.
          </p>
        </article>

        {/* Karta 2 — Zoom */}
        <article className="bg-white rounded-2xl shadow-soft p-6 sm:p-8 border-t-4 border-teal-400">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-label text-gold-500">Krok 2 — odkaz na workshop</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-navy-600 mb-3 leading-tight">
            <Video className="inline h-6 w-6 mr-2 align-text-bottom" aria-hidden />
            Připojte se přes Zoom
          </h2>
          <p className="text-sm sm:text-base text-dark/70 mb-5 leading-relaxed">
            Otevřete tento odkaz <strong className="text-navy-700">v {WORKSHOP.dateFull} ve 18:25</strong>{" "}
            (5 minut před začátkem). Tentýž odkaz jsme vám poslali i e-mailem pro jistotu.
          </p>

          <a
            href={WORKSHOP.zoomUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full sm:w-auto group inline-flex"
          >
            <Video className="h-5 w-5" aria-hidden />
            <span>Otevřít Zoom workshop</span>
            <ExternalLink className="h-4 w-4 opacity-70" aria-hidden />
          </a>

          {/* URL k zkopírování */}
          <div className="mt-5 flex items-center gap-3 p-3 sm:p-4 bg-cream rounded-xl border border-navy-100/40">
            <code className="flex-1 text-xs sm:text-sm text-navy-700 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
              {WORKSHOP.zoomUrl}
            </code>
            <CopyButton text={WORKSHOP.zoomUrl} label="Kopírovat" copiedLabel="Zkopírováno" />
          </div>

          {/* ID + heslo (heslo jen pokud je nastavené) */}
          <div className={`mt-4 grid grid-cols-1 ${WORKSHOP.zoomPassword ? "sm:grid-cols-2" : ""} gap-3 text-sm`}>
            <div className="flex items-center justify-between p-3 bg-cream rounded-lg border border-navy-100/40">
              <span className="text-dark/60">Meeting ID:</span>
              <span className="font-semibold text-navy-700 font-mono">{WORKSHOP.zoomId}</span>
            </div>
            {WORKSHOP.zoomPassword && (
              <div className="flex items-center justify-between p-3 bg-cream rounded-lg border border-navy-100/40">
                <span className="text-dark/60">Heslo:</span>
                <span className="font-semibold text-navy-700 font-mono">{WORKSHOP.zoomPassword}</span>
              </div>
            )}
          </div>
        </article>

        {/* Karta 3 — Příprava */}
        <article className="bg-white rounded-2xl shadow-soft p-6 sm:p-8 border-t-4 border-navy-600">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-label text-gold-500">Krok 3 — krátká příprava</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-navy-600 mb-2 leading-tight">
            <Sparkles className="inline h-6 w-6 mr-2 align-text-bottom" aria-hidden />
            3 minuty na přípravu pro nejlepší zážitek
          </h2>
          <p className="text-sm sm:text-base text-dark/70 mb-5 leading-relaxed">
            Workshop je intenzivní 3hodinová živá praxe. Krátká příprava zvedne hodnotu výrazně.
          </p>

          <ol className="space-y-4">
            {PREP_STEPS.map((step, idx) => (
              <li key={idx} className="flex gap-3 sm:gap-4">
                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-teal-400/15 text-teal-600 font-bold text-sm ring-1 ring-teal-400/30">
                  {idx + 1}
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="font-semibold text-navy-700 text-base leading-tight mb-1">{step.title}</p>
                  <p className="text-sm text-dark/70 leading-relaxed">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </article>

        {/* Karta 4 — Pomoc */}
        <article className="bg-navy-50 rounded-2xl p-6 sm:p-8 border border-navy-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-label text-gold-500">Cokoliv řešíte</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-navy-600 mb-3 leading-tight">
            <Mail className="inline h-5 w-5 mr-2 align-text-bottom" aria-hidden />
            Nemůžete tento termín? Otázka? Napište.
          </h2>
          <p className="text-sm sm:text-base text-dark/75 leading-relaxed">
            Napište mi na{" "}
            <a
              href={`mailto:${WORKSHOP.contactEmail}?subject=Workshop%2019.%205.%20-%20dotaz`}
              className="text-teal-600 font-semibold underline-offset-4 hover:underline break-words"
            >
              {WORKSHOP.contactEmail}
            </a>
            {" "}— najdeme řešení. Přesun na další termín, vrácení peněz nebo cokoliv jiného. Bez papírování, bez stresu.
          </p>
          <p className="text-sm text-dark/60 mt-3">
            — {COACH.fullName}
          </p>
        </article>

        {/* Zpět odkaz */}
        <div className="text-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-dark/55 hover:text-navy-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Zpět na hlavní stránku workshopu
          </Link>
        </div>
      </section>
    </main>
  );
}
