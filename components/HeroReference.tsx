"use client";

import { useCallback, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Ruční karusel referencí v hero sekci.
 *
 * Všech 25 citací zůstává tady — uživatel listuje šipkami nebo prstem.
 * Automatické přepínání je vypnuté (nesoutěží o pozornost s CTA).
 * Zobrazuje se jen aktuální citace, aby karta nenafoukla hero přes ohyb.
 */

type Reference = { quote: string; name: string };

const REFERENCE: Reference[] = [
  { quote: "Trénink doporučuji. Je vymyšlen seriózně, má dobrý systém, který přináší výsledky.", name: "Zora Cejnková" },
  { quote: "Cítila jsem bezpečí zeptat se na cokoli, na co jsem narazila.", name: "Mona Martinů" },
  { quote: "Je skvělé, že od prvního momentu jsme vrženi do praxe.", name: "Zuzana Bergerová" },
  { quote: "Děkuji, že mohu nevědět a chybovat.", name: "Alena Best" },
  { quote: "Získal jsem nástroje ke konstruktivnější komunikaci. Výcvik byl skvělý.", name: "Viliam Vala" },
  { quote: "Je postaven z velké části na okamžité praxi. Praktikuješ okamžitě.", name: "Jana Plecháčová" },
  { quote: "Myslím, že se to odrazilo i na mých vztazích, méně hodnotím, více se umím nacítit na druhého člověka.", name: "Petra Vicherová" },
  { quote: "V první řadě jde o propracovaný systém, ve kterém má osoba možnost sebereflexe, osobního růstu a osobní transformace.", name: "Gita Zuskačová" },
  { quote: "Uvědomění, že jsme si všichni opravdu podobní, máme podobné sny, obavy, motivace. Dobrý start k sebeuvědomění.", name: "Daniel Verner" },
  { quote: "Trénink je dobře strukturovaný a člověk má skutečně pocit zhodnocených peněz.", name: "Eva Balíková" },
  { quote: "Hezky poskládané informace, podrobný návod, jasně dané techniky, hodně tréninku.", name: "Květa Kuklová" },
  { quote: "Způsob výuky, který je zaměřen prakticky a rozvíjí mnohem víc než výuka ze skript.", name: "Barbora Eliášová" },
  { quote: "Osamostatnila jsem se ve svém (předtím) korporátním mindsetu.", name: "Alžběta Sládek Široká" },
  { quote: "Uvědomil jsem si, že se zlepšuju, že je to lepší a rychlejší metoda než běžné školní postupy.", name: "Martin Černek" },
  { quote: "Je mi v této nehodnotící komunitě dobře. Můžeš tu odložit všechny masky a role a otevřít se bez obav na maximum.", name: "Kateřina Pořízková" },
  { quote: "Podařilo se mi dostat z mindsetu ‚řešitelky problému' na nastavení na ‚prozkoumávajícího průvodce s nadhledem'.", name: "Martina Michková" },
  { quote: "Skvělá komunita, praxe na prvním místě, kvalitní materiál a vedení, možnost ptát se na cokoliv.", name: "David Hůrka" },
  { quote: "Moc se mi líbí Alešova přímá komunikace, provokativní otázky a způsob, jakým nás vede k vlastnímu uvědomění.", name: "Andrea Djurevska" },
  { quote: "Líbí se mi, jak Aleš dokáže reagovat na všechny dotazy a skvěle je zodpovědět. I ta chvíle ticha, kterou si nechá a až potom trefně odpoví.", name: "Kateřina Dedek" },
  { quote: "Veľký rešpekt k Alešovmu vedeniu lekcií, k jeho radám nám začínajúcim koučom, k jeho pohotovosti a podpore.", name: "Mária Lipková" },
  { quote: "Z pedagogického hlediska odvedl Aleš skvělou práci a ani u jednoho setkání jsem se nenudila.", name: "Adéla Vaníková" },
  { quote: "Konečně mi to připadalo ne jako ve škole, ale opravdu učení hrou. A tak to má být.", name: "Michaela Danielová" },
  { quote: "Baví mě výcvik, jak je vedený. Je to skvěle hravě propracované, a hlavně interaktivní a zaměřené na praxi od začátku.", name: "Markéta Růžičková" },
  { quote: "Alešovy tréninky jsou neskutečné. Jsou skvěle strukturované, akční a plné zajímavých myšlenek. Klidné, nehodnotící, bezpečné.", name: "Jana Seidlmanová" },
  { quote: "Je to velmi profesionálně vedené, podporující prostředí, parta úžasných lidí. Je to prostě zdravě návykové.", name: "Zuzana Malá" },
];

const SWIPE_MIN_PX = 45;

export function HeroReference() {
  const [index, setIndex] = useState(0);
  const touch = useRef<{ x: number; y: number; t: number } | null>(null);

  const posun = useCallback((krok: number) => {
    setIndex((i) => (i + krok + REFERENCE.length) % REFERENCE.length);
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return void (touch.current = null);
    const t = e.changedTouches[0];
    touch.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    // Poměr os: svislé rolování stránky nesmí přepínat reference
    if (Math.abs(dx) > SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy) * 1.5 && Date.now() - start.t < 600) {
      posun(dx < 0 ? 1 : -1);
    }
  };

  const aktualni = REFERENCE[index];

  return (
    <div className="w-full max-w-xl mx-auto lg:mx-0">
      {/* Štítek a ovládání na jednom řádku - šetří na mobilu celý řádek */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <p className="h-label text-gold-400 !text-[11px] sm:!text-xs">Co říkají studenti</p>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => posun(-1)}
            aria-label="Předchozí reference"
            className="flex items-center justify-center h-11 w-11 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15 transition-colors focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <span className="text-[11px] tabular-nums text-white/50 min-w-[2.75rem] text-center select-none" aria-hidden>
            {index + 1}/{REFERENCE.length}
          </span>
          <button
            type="button"
            onClick={() => posun(1)}
            aria-label="Další reference"
            className="flex items-center justify-center h-11 w-11 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15 transition-colors focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="rounded-2xl bg-navy-900/55 backdrop-blur-md border border-white/15 shadow-lifted px-4 py-4 sm:px-6 sm:py-5"
      >
        <figure className="text-left">
          <blockquote className="text-[15px] sm:text-base lg:text-[17px] leading-[1.55] text-white/90">
            „{aktualni.quote}&#8220;
          </blockquote>
          <figcaption className="mt-2.5 text-[13px] sm:text-sm font-bold text-gold-300">
            {aktualni.name}
          </figcaption>
        </figure>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        Reference {index + 1} z {REFERENCE.length}: {aktualni.quote} {aktualni.name}
      </p>
    </div>
  );
}
