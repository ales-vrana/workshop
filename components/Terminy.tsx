"use client";

import { useEffect, useState } from "react";
import { Section } from "@/components/ui/Section";
import { Calendar, Clock, Monitor, ArrowRight, CalendarX } from "lucide-react";
import { getViditelneTerminy, VSECHNY_TERMINY, WORKSHOP, type TerminView } from "@/lib/config";
import { ZajemceModal } from "@/components/ZajemceModal";

/**
 * Sekce s vypsanými termíny.
 *
 * Filtrování běží na klientovi podle skutečného času v prohlížeči.
 * Důvod: HTML může být v cache (Vercel, prohlížeč, sdílený odkaz),
 * takže server nemusí vědět, že termín už proběhl. Klient to ví vždy.
 *
 * Aby stránka nebyla při prvním vykreslení prázdná, vyjdeme ze stavu
 * spočítaného na serveru a po hydrataci ho přepočítáme.
 */
export function Terminy() {
  const [terminy, setTerminy] = useState<TerminView[]>(() => getViditelneTerminy());

  useEffect(() => {
    setTerminy(getViditelneTerminy(Date.now()));

    // Kdyby někdo nechal stránku otevřenou přes okamžik skrytí termínu
    const timer = setInterval(() => setTerminy(getViditelneTerminy(Date.now())), 60_000);
    return () => clearInterval(timer);
  }, []);

  const prazdno = terminy.length === 0;

  return (
    <Section id="terminy" tone="white" className="!pb-28 sm:!pb-32">
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <p className="h-label mb-3">Termíny</p>
        <h2 className="h-display text-h2 text-navy-600">
          {prazdno ? "Nové termíny právě připravuji" : "Vyber si termín, který ti sedí"}
        </h2>
        {!prazdno && (
          <p className="mt-4 text-base sm:text-lg text-dark/70">
            Všechny termíny {WORKSHOP.duration} online, max {WORKSHOP.capacity} lidí,{" "}
            {WORKSHOP.price}. Vyber si podle svého kalendáře.
          </p>
        )}
      </div>

      {prazdno ? (
        <div className="max-w-xl mx-auto text-center bg-cream rounded-2xl border border-navy-100/60 p-8 sm:p-10">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-navy-100/60 text-navy-600 mb-5">
            <CalendarX className="h-7 w-7" aria-hidden />
          </div>
          <p className="text-base sm:text-lg text-dark/80 leading-relaxed mb-6">
            Aktuálně nemám vypsaný žádný volný termín. Nech mi kontakt a jakmile vypíšu nový,
            ozvu se ti dřív, než ho dám na web.
          </p>
          <ZajemceModal triggerLabel="Chci vědět o novém termínu" />
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {terminy.map((t, idx) => (
              <article
                key={t.id}
                className={`flex flex-col bg-white rounded-2xl p-6 sm:p-7 shadow-soft transition-all hover:shadow-card-hover hover:-translate-y-1 ${
                  idx === 0 ? "border-2 border-teal-400" : "border border-navy-100/60"
                }`}
              >
                {idx === 0 && (
                  <p className="inline-flex self-start items-center rounded-full bg-teal-400/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-teal-600 mb-4">
                    Nejbližší termín
                  </p>
                )}

                <p className="text-xl sm:text-2xl font-bold text-navy-600 leading-tight mb-1">
                  {t.dayOfWeek} {t.dateShort}
                </p>

                <div className="mt-3 space-y-2 text-sm sm:text-base text-dark/70">
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-teal-500 shrink-0" aria-hidden />
                    {t.timeRange}
                  </p>
                  <p className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-teal-500 shrink-0" aria-hidden />
                    online přes {WORKSHOP.platform}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-teal-500 shrink-0" aria-hidden />
                    {t.duration}
                  </p>
                </div>

                {t.showSpotsScarcity && (
                  <p className="mt-4 text-sm font-bold text-gold-600">
                    Zbývá {t.spotsLabel} míst
                  </p>
                )}

                <div className="mt-auto pt-6">
                  <p className="text-2xl font-extrabold text-navy-700 mb-3">{t.price}</p>
                  <a
                    href={t.paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex w-full items-center justify-center gap-2 px-5 py-4 bg-teal-400 hover:bg-teal-500 active:bg-teal-600 text-white font-bold uppercase tracking-wider text-sm rounded-lg shadow-soft transition-all min-h-[52px] touch-manipulation focus-visible:ring-4 focus-visible:ring-teal-400/40"
                  >
                    Chci to zažít
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      aria-hidden
                    />
                  </a>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-10">
            <p className="text-sm sm:text-base text-dark/70 mb-2">
              Garance: pokud po první hodině necítíš přínos, vrátím ti 100 % ceny.
            </p>
            <ZajemceModal />
          </div>
        </>
      )}

      {/* Upozornění jen ve vývoji - když termín nemá vyplněný Stripe odkaz */}
      {process.env.NODE_ENV !== "production" &&
        VSECHNY_TERMINY.some((t) => t.paymentLink.includes("ZDE_VLOZ")) && (
          <p className="mt-8 text-center text-sm font-bold text-red-600">
            Pozor: některý termín nemá vyplněný Stripe odkaz (lib/workshop-terminy.ts)
          </p>
        )}
    </Section>
  );
}
