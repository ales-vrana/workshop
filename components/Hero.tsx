import { CTAButton } from "@/components/ui/CTAButton";
import { HeroReference } from "@/components/HeroReference";
import { WORKSHOP, COACH } from "@/lib/config";

/**
 * Hero sekce.
 *
 * Pořadí na mobilu: štítek → H1 → podtitulek → formát → TLAČÍTKO → cena
 * → řádek s lektorem → úvodní odstavec → garance.
 * Na desktopu dva sloupce 7:5, vpravo portrét lektora s MCC odznakem
 * a pod ním garance. Nejbližší termín v hero schováváme — hypotéza, že
 * konkrétní datum lidi odrazuje dřív, než si vyberou z nabídky.
 *
 * Seznam „Program" je v samostatné sekci components/Program.tsx.
 */

export function Hero() {
  return (
    <header className="relative isolate overflow-hidden text-white">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-navy-900" aria-hidden />
        <img
          src="/workshop/hero.jpg"
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-overlay" aria-hidden />
      </div>

      <div className="container-x relative pt-8 pb-3 sm:pt-16 sm:pb-14 lg:pt-12 lg:pb-16">
        {/* ── Dva sloupce: text | portrét ── */}
        {/* items-stretch: levý sloupec je stejně vysoký jako pravý, takže blok s CTA
            jde přitlačit ke spodní hraně a nad ním vznikne místo pro karusel */}
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12 items-stretch">
          {/* Levý sloupec */}
          <div className="lg:col-span-7 text-center lg:text-left flex flex-col">
            {/* H1: delší věta než dřív, proto 4 krátké řádky a menší strop
                velikosti — při původním clamp(3.875rem) se první řádek lámal. */}
            <h1 className="lg:-mt-2">
              <span className="block h-display text-[28px] leading-[1.1] sm:text-[clamp(2rem,4.6vw,2.75rem)] text-white">
                <span className="block">Za 2 hodiny</span>
                <span className="block">budeš vědět,</span>
                <span className="block">jestli je koučování</span>
                <span className="block">tvoje cesta.</span>
              </span>
            </h1>

            {/* Podtitulek - na mobilu menší, aby se CTA vešlo nad ohyb */}
            <p className="mt-4 sm:mt-6 text-base sm:text-xl lg:text-2xl text-white/85 leading-snug font-medium">
              Uvidíš živé koučování, vyzkoušíš si roli kouče i&nbsp;klienta a&nbsp;poznáš, jestli
              ti sedí, jak učíme. Nemusíš mít předchozí zkušenosti, přijít můžeš i&nbsp;s&nbsp;nejistotou.
            </p>

            {/* Citace studentů */}
            <div className="mt-4 lg:mt-8">
              <HeroReference />
            </div>

            {/* Zbylý volný prostor: odtlačí blok s CTA ke spodní hraně hero */}
            <div className="hidden lg:block flex-1" aria-hidden />

            {/* TLAČÍTKO: scroll k termínům. Měří se jako hero_show_dates. */}
            <div className="mt-3 sm:mt-5 flex flex-col items-center lg:items-start gap-3">
              <CTAButton
                id="hero-cta"
                href="#terminy"
                variant="on-dark"
                arrow="down"
                className="w-full sm:w-auto group !text-[17px] sm:!text-base whitespace-nowrap !tracking-wide sm:!tracking-wider"
                ariaLabel="Vybrat termín · 199 Kč"
              >
                Vybrat termín · 199 Kč
              </CTAButton>
              <p className="text-[13px] text-white/70 text-center lg:text-left">
                2 hodiny živě na Zoomu · max 16 míst · garance vrácení peněz
              </p>
            </div>

            {/* Úvodní odstavec jen na desktopu — na mobilu by zvedl hero přes ohyb. */}
            <p className="mt-6 hidden lg:block text-lg text-white/75 leading-relaxed max-w-2xl">
              Vyzkoušej si, jak vést rozhovor, ve kterém druhému pomáháš najít vlastní řešení. Za dvě
              hodiny uvidíš živé koučování, vyzkoušíš si roli kouče i klienta a poznáš, jak se
              v CoachVille učíme praxí.
            </p>
          </div>

          {/* Pravý sloupec - portrét (jen desktop) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col items-center">
            <div className="relative w-[380px] max-w-full">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden ring-4 ring-white/10 shadow-lifted bg-navy-900">
                <img
                  src="/workshop/ales-vrana-portrait.jpg"
                  alt={`Portrét: ${COACH.fullName}`}
                  width={662}
                  height={850}
                  fetchPriority="high"
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-5 -left-5 h-[88px] w-[88px] rounded-full bg-white shadow-lifted ring-4 ring-navy-900/40 overflow-hidden">
                <img
                  src="/workshop/icf-mcc-badge.webp"
                  alt="Odznak ICF Master Certified Coach (MCC)"
                  width={88}
                  height={88}
                  className="h-full w-full object-contain p-1.5"
                />
              </div>
            </div>
            <p className="mt-8 text-lg font-bold text-white text-center">{COACH.fullName}</p>
            <p className="mt-1 text-sm text-white/70 text-center">
              hlavní trenér CoachVille · {COACH.certification}
            </p>

            {/* Garance pod fotkou */}
            <div className="mt-6 w-full max-w-[380px] rounded-2xl bg-navy-900/55 backdrop-blur-md border border-white/15 px-5 py-4">
              <Garance />
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}

/** Garance: na desktopu pod fotkou lektora, na mobilu na konci textu */
function Garance() {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="text-xs sm:text-sm text-white/85 max-w-md font-medium">
        Max {WORKSHOP.capacity} míst <span className="text-white/40 mx-1">·</span> Garance: po 60 minutách vrácení 100 % ceny bez otázek
      </p>
      <p className="text-xs text-white/60 max-w-md">Bez papírování, bez otázek.</p>
    </div>
  );
}
