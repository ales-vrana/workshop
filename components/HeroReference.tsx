"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Karusel referencí v hero sekci.
 *
 * Návrh vychází z toho, že většina lidí přichází z reklamy na mobilu:
 * - karta má na všech slidech stejnou výšku (grid stacking - všechny citace
 *   leží ve stejné buňce, výšku určí ta nejdelší), takže se tlačítko pod ní
 *   nikdy neposune a nehrozí omylem kliknuté CTA;
 * - ovládání je na jednom řádku se štítkem, aby nezabíralo další místo;
 * - na mobilu se přepíná hlavně prstem, šipky jsou jen doplněk;
 * - automatika se po prvním ručním zásahu vypne a respektuje
 *   prefers-reduced-motion.
 */

type Reference = { quote: string; name: string };

const REFERENCE: Reference[] = [
  { quote: "Alešovy tréninky jsou neskutečné. Jsou skvěle strukturované, akční a plné zajímavých myšlenek. Klidné, nehodnotící, bezpečné.", name: "Jana Seidlmanová" },
  { quote: "Cítila jsem bezpečí zeptat se na cokoli, na co jsem narazila.", name: "Mona Martinů" },
  { quote: "Moc se mi líbí Alešova přímá komunikace, provokativní otázky a způsob, jakým nás vede k vlastnímu uvědomění.", name: "Andrea Djurevska" },
  { quote: "Konečně mi to připadalo ne jako ve škole, ale opravdu učení hrou. A tak to má být.", name: "Michaela Danielová" },
  { quote: "Je mi v této nehodnotící komunitě dobře. Můžeš tu odložit všechny masky a role a otevřít se bez obav na maximum.", name: "Kateřina Pořízková" },
  { quote: "Líbí se mi, jak Aleš dokáže reagovat na všechny dotazy a skvěle je zodpovědět. I ta chvíle ticha, kterou si nechá a až potom trefně odpoví.", name: "Kateřina Dedek" },
  { quote: "Děkuji, že mohu nevědět a chybovat.", name: "Alena Best" },
  { quote: "Uvědomění, že jsme si všichni opravdu podobní, máme podobné sny, obavy, motivace. Dobrý start k sebeuvědomění.", name: "Daniel Verner" },
  { quote: "Veľký rešpekt k Alešovmu vedeniu lekcií, k jeho radám nám začínajúcim koučom, k jeho pohotovosti a podpore.", name: "Mária Lipková" },
  { quote: "Je to velmi profesionálně vedené, podporující prostředí, parta úžasných lidí. Je to prostě zdravě návykové.", name: "Zuzana Malá" },
  { quote: "Z pedagogického hlediska odvedl Aleš skvělou práci a ani u jednoho setkání jsem se nenudila.", name: "Adéla Vaníková" },
  { quote: "Baví mě výcvik, jak je vedený. Je to skvěle hravě propracované, a hlavně interaktivní a zaměřené na praxi od začátku.", name: "Markéta Růžičková" },
];

const AUTO_MS = 6500;
const SWIPE_MIN_PX = 45;

export function HeroReference() {
  const [index, setIndex] = useState(0);
  const [autoOn, setAutoOn] = useState(true);
  const [paused, setPaused] = useState(false);
  const touch = useRef<{ x: number; y: number; t: number } | null>(null);

  useEffect(() => {
    if (!autoOn || paused) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % REFERENCE.length),
      AUTO_MS
    );
    return () => window.clearInterval(id);
  }, [autoOn, paused]);

  /** Ruční přepnutí automatiku natrvalo vypne - uživatel si čte sám. */
  const posun = useCallback((krok: number) => {
    setAutoOn(false);
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
    <div
      className="w-full max-w-xl mx-auto lg:mx-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Štítek a ovládání na jednom řádku - šetří na mobilu celý řádek */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <p className="h-label text-gold-400 !text-[11px] sm:!text-xs">Co říkají studenti</p>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => posun(-1)}
            aria-label="Předchozí reference"
            className="flex items-center justify-center h-9 w-9 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15 transition-colors focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <span className="text-[11px] tabular-nums text-white/50 w-9 text-center select-none">
            {index + 1}/{REFERENCE.length}
          </span>
          <button
            type="button"
            onClick={() => posun(1)}
            aria-label="Další reference"
            className="flex items-center justify-center h-9 w-9 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15 transition-colors focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      {/* Karta: všechny citace ve stejné buňce gridu → jednotná výška bez poskakování */}
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="grid rounded-2xl bg-navy-900/55 backdrop-blur-md border border-white/15 shadow-lifted px-4 py-4 sm:px-6 sm:py-5"
      >
        {REFERENCE.map((r, i) => (
          <figure
            key={r.name}
            aria-hidden={i !== index}
            className={`col-start-1 row-start-1 text-left transition-opacity duration-500 ${
              i === index ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <blockquote className="text-[15px] sm:text-base lg:text-[17px] leading-[1.55] text-white/90">
              „{r.quote}&#8220;
            </blockquote>
            <figcaption className="mt-2.5 text-[13px] sm:text-sm font-bold text-gold-300">
              {r.name}
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        Reference {index + 1} z {REFERENCE.length}: {aktualni.quote} {aktualni.name}
      </p>
    </div>
  );
}
