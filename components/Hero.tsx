import { ArrowDown } from "lucide-react";
import { CTAButton } from "@/components/ui/CTAButton";
import { HeroReference } from "@/components/HeroReference";
import { WORKSHOP, COACH, getViditelneTerminy } from "@/lib/config";

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

/** 1 termín / 2-4 termíny / 5+ termínů (krátký tvar pro štítek) */
function pocetTerminu(n: number): string {
  if (n === 1) return "1 termín";
  if (n >= 2 && n <= 4) return `${n} termíny`;
  return `${n} termínů`;
}

export function Hero() {
  const terminy = getViditelneTerminy();

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

      <div className="container-x relative pt-12 pb-12 sm:pt-16 sm:pb-14 lg:pt-12 lg:pb-16">
        {/* ── Dva sloupce: text | portrét ── */}
        {/* items-stretch: levý sloupec je stejně vysoký jako pravý, takže blok s CTA
            jde přitlačit ke spodní hraně a nad ním vznikne místo pro karusel */}
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12 items-stretch">
          {/* Levý sloupec */}
          <div className="lg:col-span-7 text-center lg:text-left flex flex-col">
            {/* H1 - pevné zalomení na tři řádky */}
            <h1 className="lg:-mt-2">
              <span className="block h-display text-[28px] leading-[1.1] sm:text-[clamp(2.125rem,6.6vw,3.875rem)] text-white">
                <span className="block">Z korporátu</span>
                <span className="block">k práci, která</span>
                <span className="block">dává smysl.</span>
              </span>
            </h1>

            {/* Podtitulek - na mobilu menší, aby se CTA vešlo nad ohyb */}
            <p className="mt-4 sm:mt-6 text-base sm:text-xl lg:text-2xl text-white/85 leading-snug font-medium">
              Ukázková lekce ICF akreditovaného výcviku CoachVille pro všechny, které zajímá
              koučování, leadership, osobní a&nbsp;profesní rozvoj.
            </p>

            {/* Karusel s referencemi */}
            <div className="mt-6 lg:mt-8">
              <HeroReference />
            </div>

            {/* Zbylý volný prostor: odtlačí blok s CTA ke spodní hraně hero */}
            <div className="hidden lg:block flex-1" aria-hidden />

            {/* Odkaz na podrobnosti níže na stránce */}
            <a
              href="#co-zazijete"
              className="mt-5 sm:mt-6 inline-flex items-center gap-2 text-sm text-white/75 hover:text-white transition-colors group/more"
            >
              <ArrowDown className="h-4 w-4 shrink-0 transition-transform group-hover/more:translate-y-0.5" aria-hidden />
              <span className="underline underline-offset-4 decoration-white/30 group-hover/more:decoration-white/70">
                více informací o lekci - níže na stránce
              </span>
            </a>

            {/* TLAČÍTKO: scroll k termínům. Měří se jako hero_show_dates. */}
            <div className="mt-4 sm:mt-5 flex flex-col items-center lg:items-start gap-3">
              <CTAButton
                id="hero-cta"
                href="#terminy"
                variant="on-dark"
                arrow="down"
                className="w-full sm:w-auto group !text-white sm:!text-navy-950 !text-[17px] sm:!text-base"
                ariaLabel="Zobrazit termíny ukázkové lekce"
              >
                Zobrazit termíny
              </CTAButton>
              <p className="text-[13px] text-white/70 text-center lg:text-left">
                {WORKSHOP.price}
                {terminy.length > 0 && <> · {pocetTerminu(terminy.length)}</>}
                {" "}· garance vrácení peněz
              </p>
            </div>

            {/* Řádek důvěry s lektorem - jen mobil/tablet, na desktopu je portrét vpravo */}
            <div className="mt-6 flex justify-center lg:hidden">
              <div className="inline-flex items-center gap-3 max-w-[320px] text-left">
                <div className="relative shrink-0">
                  <img
                    src="/workshop/ales-vrana-portrait.jpg"
                    alt={`Portrét: ${COACH.fullName}`}
                    width={56}
                    height={56}
                    fetchPriority="high"
                    className="h-14 w-14 rounded-full object-cover object-top ring-2 ring-white/20"
                  />
                  <img
                    src="/workshop/icf-mcc-badge.webp"
                    alt="ICF MCC"
                    width={24}
                    height={24}
                    className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-full bg-white ring-2 ring-navy-900 object-contain p-px"
                  />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-white leading-tight">{COACH.fullName}</p>
                  <p className="text-[13px] text-white/70 leading-tight mt-0.5">hlavní trenér CoachVille</p>
                </div>
              </div>
            </div>

            {/* Úvodní odstavec */}
            <p className="mt-6 text-base sm:text-lg text-white/75 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Vyzkoušej si, jak vést rozhovor, ve kterém druhému pomáháš najít vlastní řešení. Za dvě
              hodiny uvidíš živé koučování, vyzkoušíš si roli kouče i klienta a poznáš, jak se
              v CoachVille učíme praxí.
            </p>

            {/* Garance - jen mobil/tablet (na desktopu pod fotkou vpravo) */}
            <div className="mt-8 lg:hidden">
              <Garance />
            </div>
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
