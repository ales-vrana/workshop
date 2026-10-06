"use client";

import { useCallback, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Section } from "@/components/ui/Section";

/**
 * Karusel referencí z ukázkové lekce - hned pod hero.
 *
 * Návrh podle připomínek:
 * - žádná animace, přepnutí je okamžité,
 * - šipky jsou velké a výrazné (48 px, plná tlačítka s rámečkem), ne skryté,
 * - písmo citace je od 18 px výš, aby se dalo pohodlně číst na telefonu,
 * - všechny citace leží ve stejné buňce gridu, takže výška bloku je stále
 *   stejná a stránka pod ním nepodskakuje při přepnutí,
 * - na mobilu funguje i přejetí prstem.
 *
 * Výběr citací: handpick z 96 zpětných vazeb podle pravidel věrohodného
 * social proofu - konkrétnost místo superlativů, různé typy přínosu,
 * muži i ženy, včetně dvou hodnocení 9/10 a jedné přiznané obtíže.
 * Texty jsou zkrácené vypuštěním, smysl beze změny.
 */

type Citace = { quote: string; name: string };

const REFERENCE: Citace[] = [
  {
    quote: "Zjistila jsem, že to není takový bubák, jak jsem si myslela. Největším nepřítelem je vlastní pochybnost a vnitřní kritik.",
    name: "Hana Svatošová",
  },
  {
    quote: "Odpovědi většinou dobře známe, ale je potřeba někdo druhý, aby nám je ukázal. A ty nejjednodušší věci bývají překvapivě nejefektivnější.",
    name: "Bára Hálová",
  },
  {
    quote: "Uvědomil jsem si, že nechám na zkoušku svým zaměstnancům více pravomocí, aby některé záležitosti rozhodli oni.",
    name: "Radek Miklík",
  },
  {
    quote: "Uvědomila jsem si, co dělám v komunikaci s kolegy špatně. Jak jim podsouvám otázky a očekávám, že odpoví to, co chci slyšet.",
    name: "Ingrid Tacinová",
  },
  {
    quote: "Zaujalo mě, jak jednoduché otázky vedou k hlubokým odpovědím. Možnost vyzkoušet si obě role byla velmi poučná.",
    name: "Michal Drexler",
  },
  {
    quote: "Uvědomila jsem si, že je pro mě náročné vést rozhovor a klást otevřené otázky. Ale už vím, na co se mám zaměřit.",
    name: "Eva Rosecká",
  },
  {
    quote: "Uvědomil jsem si, že koučování může být pro mě cesta. A ne nutně v roli kouče, ale i v roli koučovaného.",
    name: "Adam Veřmiřovský",
  },
  {
    quote: "Workshop mi potvrdil dvě věci: že role kouče není tak jednoduchá, jak si někdo může myslet, a že chci být koučem.",
    name: "Hana Masaříková",
  },
  {
    quote: "Dal mi vhled do toho, co je koučování podle daného standardu s tradicí. Že to není žádný hej počkej.",
    name: "Lukáš Berka",
  },
  {
    quote: "Člověk je na začátku a najednou zjistí, že se dokáže naladit na vlnu partnera, se kterým si koučování zkouší. Nepopsatelně úžasný zážitek!",
    name: "Lenka Musilová",
  },
];

const SWIPE_MIN_PX = 45;

export function ReferenceLekce() {
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
    if (Math.abs(dx) > SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy) * 1.5 && Date.now() - start.t < 600) {
      posun(dx < 0 ? 1 : -1);
    }
  };

  const sipka =
    "flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-full border-2 border-navy-600 text-navy-600 bg-white " +
    "hover:bg-navy-600 hover:text-white active:bg-navy-700 active:text-white " +
    "focus-visible:ring-4 focus-visible:ring-navy-400/30 touch-manipulation shrink-0";

  return (
    <Section id="reference-lekce" tone="white" className="!py-10 sm:!py-14 lg:!py-16">
      <div className="max-w-3xl mx-auto">
        <p className="h-label text-center mb-6 sm:mb-8">Co si lidé odnesli z ukázkové lekce</p>

        <div
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="rounded-2xl bg-cream border border-navy-100/60 px-5 py-7 sm:px-10 sm:py-9"
        >
          <Quote className="h-8 w-8 sm:h-9 sm:w-9 text-gold-500 mx-auto mb-4" aria-hidden />

          {/* Všechny citace ve stejné buňce gridu → pevná výška, žádné poskakování */}
          <div className="grid">
            {REFERENCE.map((r, i) => (
              <figure
                key={i}
                aria-hidden={i !== index}
                className={`col-start-1 row-start-1 text-center ${
                  i === index ? "" : "invisible"
                }`}
              >
                <blockquote className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-dark/90">
                  „{r.quote}&#8220;
                </blockquote>
                <figcaption className="mt-5 text-base sm:text-lg font-bold text-navy-700">
                  {r.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        {/* Ovládání - velké šipky, stejné na mobilu i na desktopu */}
        <div className="mt-6 flex items-center justify-center gap-5 sm:gap-7">
          <button type="button" onClick={() => posun(-1)} aria-label="Předchozí reference" className={sipka}>
            <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
          </button>

          <span className="text-base sm:text-lg font-bold tabular-nums text-navy-600 select-none w-16 text-center">
            {index + 1} / {REFERENCE.length}
          </span>

          <button type="button" onClick={() => posun(1)} aria-label="Další reference" className={sipka}>
            <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
          </button>
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          Reference {index + 1} z {REFERENCE.length}: {REFERENCE[index].quote} {REFERENCE[index].name}
        </p>

        <p className="mt-5 text-center text-sm text-dark/55">
          Zpětné vazby účastníků ukázkových lekcí
        </p>
      </div>
    </Section>
  );
}
