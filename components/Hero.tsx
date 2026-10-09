import { Calendar, Clock, Monitor, ArrowDown } from "lucide-react";
import { CTAButton } from "@/components/ui/CTAButton";
import { DveHodinyCompact } from "@/components/DveHodiny";
import { WORKSHOP, COACH, getViditelneTerminy, type TerminView } from "@/lib/config";

/**
 * Hero sekce - verze pro problem aware publikum (J1, J2, J4), vykání.
 *
 * Pořadí na mobilu: H1 (zrcadlo situace) → podtitulek (co to je a co z toho mám)
 * → metařádek (parametry) → mikrořádek důvěry → TLAČÍTKO → zkouška místo garance
 * → nejbližší termín → infografika dvou hodin.
 *
 * Velký portrét lektora je pryč: v první obrazovce potřebuje návštěvník vědět
 * věci o sobě a o akci, ne o lektorovi. Zůstal mikrořádek s MCC (jediný tvrdý
 * rozlišovací prvek), velká fotka je v sekci „S kým lekci zažijete".
 *
 * Cena je záměrně až pod tlačítkem - první čísla na stránce jsou
 * „2 hodiny" a „16 lidí".
 */

export function Hero() {
  const terminy = getViditelneTerminy();
  const nejblizsi = terminy[0];

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

      <div className="container-x relative pt-12 pb-12 sm:pt-16 sm:pb-14 lg:pt-14 lg:pb-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12 items-start">
          {/* Levý sloupec - text a akce */}
          <div className="lg:col-span-7 text-center lg:text-left flex flex-col">
            <h1 className="lg:-mt-2">
              <span className="block h-display text-[28px] leading-[1.1] sm:text-[clamp(2.125rem,6.6vw,3.875rem)] text-white">
                Zažijte koučování na vlastní kůži.
              </span>
              {/* Druhá věta menší a ve zlaté - čte se jako pokračování, ne jako druhý nadpis */}
              <span className="block mt-3 sm:mt-4 text-xl sm:text-2xl lg:text-[1.75rem] leading-snug font-bold text-gold-300">
                Nejdřív se dívejte, pak to zkusíte.
              </span>
            </h1>

            <p className="mt-4 sm:mt-6 text-base sm:text-xl lg:text-2xl text-white/85 leading-snug font-medium">
              Dvě hodiny online, po kterých budete vědět, jestli je koučování
              cesta, kterou hledáte. Bez teorie a&nbsp;bez skoku do prázdna.
            </p>

            <p className="mt-4 text-sm sm:text-base text-white/70">
              Ukázková lekce výcviku CoachVille · {WORKSHOP.duration} · online
              přes {WORKSHOP.platform} · max {WORKSHOP.capacity} lidí
            </p>

            {/* Mikrořádek důvěry - MCC je jediný tvrdý rozlišovací prvek */}
            <div className="mt-5 flex justify-center lg:justify-start">
              <div className="inline-flex items-center gap-2.5">
                <div className="relative shrink-0">
                  <img
                    src="/workshop/ales-vrana-portrait.jpg"
                    alt=""
                    width={40}
                    height={40}
                    fetchPriority="high"
                    className="h-10 w-10 rounded-full object-cover object-top ring-2 ring-white/20"
                  />
                  <img
                    src="/workshop/icf-mcc-badge.webp"
                    alt=""
                    width={18}
                    height={18}
                    className="absolute -bottom-0.5 -right-0.5 h-[18px] w-[18px] rounded-full bg-white ring-2 ring-navy-900 object-contain p-px"
                  />
                </div>
                <p className="text-[13px] sm:text-sm text-white/80 text-left leading-tight">
                  Vede <strong className="font-bold text-white">{COACH.fullName}</strong>
                  <br className="sm:hidden" />
                  <span className="sm:before:content-['_·_']">
                    ICF Master Certified Coach · 14 let praxe
                  </span>
                </p>
              </div>
            </div>

            {/* Tlačítko + vpravo nejbližší termín */}
            <div className="mt-6 flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-10">
              <div className="flex flex-col items-center lg:items-start gap-3">
                <CTAButton
                  id="hero-cta"
                  href="#terminy"
                  variant="on-dark"
                  className="w-full sm:w-auto group !text-[17px] sm:!text-base"
                  ariaLabel="Chci si to zkusit - vybrat termín ukázkové lekce"
                >
                  Chci si to zkusit
                </CTAButton>
                <p className="text-[13px] sm:text-sm text-white/75 text-center lg:text-left max-w-xs">
                  {WORKSHOP.price}. Když vás první hodina nechytne, vrátíme vám je.
                  Bez vysvětlování.
                </p>
              </div>

              <div className="flex justify-center lg:justify-start lg:pt-1">
                <TerminInfo nejblizsi={nejblizsi} />
              </div>
            </div>

            {/* Odkaz na podrobnosti níže */}
            <a
              href="#poznavate-se"
              className="mt-7 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors group/more self-center lg:self-start"
            >
              <ArrowDown
                className="h-4 w-4 shrink-0 transition-transform group-hover/more:translate-y-0.5"
                aria-hidden
              />
              <span className="underline underline-offset-4 decoration-white/30 group-hover/more:decoration-white/70">
                více o lekci níže na stránce
              </span>
            </a>
          </div>

          {/* Pravý sloupec - infografika místo portrétu, pod ní akreditace */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end gap-4 lg:pt-2">
            <DveHodinyCompact />

            {/* Akreditace ICF Level 3 - samostatný velký odznak pod kroky,
                bez rámečku. Bílá dlaždice je jen podklad, protože originál
                loga má bílé pozadí; odsazení je malé, aby bílé plochy bylo
                co nejméně. */}
            <div className="w-full max-w-md flex flex-col items-center gap-4 pt-2">
              <img
                src="/workshop/icf-level3-badge.png"
                alt="Odznak ICF Level 3 - akreditované vzdělávání koučů"
                width={176}
                height={176}
                loading="lazy"
                className="h-36 w-36 sm:h-44 sm:w-44 rounded-2xl bg-white p-1.5 object-contain shadow-lifted"
              />
              <p className="text-base sm:text-lg text-white/85 leading-snug text-center max-w-xs">
                CoachVille je jediný výcvik s nejvyšší akreditací{" "}
                <strong className="font-bold text-white">ICF Level 3</strong> v ČR a&nbsp;SK.
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/** Nejbližší termín: vedle tlačítka na desktopu, pod ním na mobilu */
function TerminInfo({ nejblizsi }: { nejblizsi: TerminView | undefined }) {
  return (
    <div className="flex flex-col items-center lg:items-start gap-2 text-[15px] sm:text-base text-white/85">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-white/70 shrink-0" aria-hidden />
        <span className="font-medium">
          {nejblizsi ? <>Nejbližší: {nejblizsi.dateFull}</> : <>Nové termíny připravuji</>}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-white/70 shrink-0" aria-hidden />
        <span className="font-medium">
          {nejblizsi ? nejblizsi.timeRange : WORKSHOP.timeRange}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Monitor className="h-4 w-4 text-white/70 shrink-0" aria-hidden />
        <span className="font-medium">{WORKSHOP.platform}</span>
      </div>
    </div>
  );
}
