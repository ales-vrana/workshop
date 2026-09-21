"use client";

import { useEffect, useState } from "react";
import { Section } from "@/components/ui/Section";
import { CalendarX } from "lucide-react";
import { getViditelneTerminy, VSECHNY_TERMINY, WORKSHOP, type TerminView } from "@/lib/config";
import { ZajemceModal } from "@/components/ZajemceModal";
import { TerminyCards } from "@/components/TerminyCards";

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
        <h2 className="h-section text-h2 text-navy-600">
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
          <TerminyCards terminy={terminy} />

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
