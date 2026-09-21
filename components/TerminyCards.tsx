"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, Monitor, ArrowRight } from "lucide-react";
import { getViditelneTerminy, WORKSHOP, type TerminView } from "@/lib/config";

/**
 * Karty termínů se Stripe odkazy. Bez nadpisu a bez paddingu sekce —
 * dá se vložit jak do #terminy, tak do závěrečné #koupit.
 */
export function TerminyCards({ terminy: incoming }: { terminy?: TerminView[] } = {}) {
  const [local, setLocal] = useState<TerminView[]>(() => incoming ?? getViditelneTerminy());

  useEffect(() => {
    if (incoming) {
      setLocal(incoming);
      return;
    }
    setLocal(getViditelneTerminy(Date.now()));
    const timer = setInterval(() => setLocal(getViditelneTerminy(Date.now())), 60_000);
    return () => clearInterval(timer);
  }, [incoming]);

  if (local.length === 0) return null;

  return (
    <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
      {local.map((t, idx) => (
        <article
          key={t.id}
          className={`flex flex-col bg-white rounded-2xl p-6 sm:p-7 shadow-soft transition-all hover:shadow-card-hover hover:-translate-y-1 ${
            idx === 0 ? "border-2 border-navy-600" : "border border-navy-100/60"
          }`}
        >
          {idx === 0 && (
            <p className="inline-flex self-start items-center rounded-full bg-gold-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold-700 mb-4">
              Nejbližší termín
            </p>
          )}

          <p className="text-xl sm:text-2xl font-bold text-navy-600 leading-tight mb-1">
            {t.dayOfWeek} {t.dateShort}
          </p>

          <div className="mt-3 space-y-2 text-sm sm:text-base text-dark/70">
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-navy-400 shrink-0" aria-hidden />
              {t.timeRange}
            </p>
            <p className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-navy-400 shrink-0" aria-hidden />
              online přes {WORKSHOP.platform}
            </p>
            <p className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-navy-400 shrink-0" aria-hidden />
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
              data-termin-id={t.id}
              data-engine-checkout="1"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex w-full items-center justify-center gap-2 px-5 py-4 bg-cta-500 hover:bg-cta-600 active:bg-cta-700 text-white font-bold uppercase tracking-wider text-sm rounded-lg shadow-soft transition-all min-h-[52px] touch-manipulation focus-visible:ring-4 focus-visible:ring-cta-500/40"
            >
              Koupit vstupenku
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
