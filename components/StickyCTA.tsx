"use client";

import { useEffect, useState } from "react";
import { WORKSHOP } from "@/lib/config";

/**
 * Sticky lišta s CTA.
 *
 * Zobrazí se po scrollY > 120. Skryje se, když je v obraze #terminy
 * (IntersectionObserver, threshold 0.1), aby nestála vedle karet termínů.
 */
export function StickyCTA() {
  const [scrolled, setScrolled] = useState(false);
  const [terminyInView, setTerminyInView] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const terminy = document.getElementById("terminy");
    let obs: IntersectionObserver | null = null;
    if (terminy) {
      obs = new IntersectionObserver(
        ([entry]) => setTerminyInView(entry.isIntersecting),
        { threshold: 0.1 },
      );
      obs.observe(terminy);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      obs?.disconnect();
    };
  }, []);

  const visible = scrolled && !terminyInView;
  const linkTabIndex = visible ? undefined : -1;

  return (
    <>
      {/* MOBILE: full-width bottom bar */}
      <div
        className={`sticky-cta sm:hidden ${visible ? "visible" : ""}`}
        role="region"
        aria-label="Rychlé CTA"
        aria-hidden={!visible}
        inert={!visible ? true : undefined}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            {WORKSHOP.showSpotsScarcity ? (
              <p className="text-[11px] uppercase tracking-wider text-gold-600 font-bold leading-none">
                Zbývá {WORKSHOP.spotsLabel} míst
              </p>
            ) : (
              <p className="text-[11px] uppercase tracking-wider text-navy-500 font-bold leading-none">
                Nejbližší: {WORKSHOP.dayOfWeek} {WORKSHOP.dateDayMonth}
              </p>
            )}
            <p className="text-sm font-bold text-navy-600 truncate mt-1">
              {WORKSHOP.price} · {WORKSHOP.duration} online
            </p>
          </div>
          <a
            href="#terminy"
            tabIndex={linkTabIndex}
            className="inline-flex items-center justify-center px-4 py-3 bg-cta-500 hover:bg-cta-600 active:bg-cta-700 text-white font-bold text-sm uppercase tracking-wide rounded-lg shadow-soft min-h-[44px] whitespace-nowrap"
          >
            Vybrat termín · 199 Kč
          </a>
        </div>
      </div>

      {/* DESKTOP: centered floating pill */}
      <div
        className={`sticky-cta-desktop hidden sm:block ${visible ? "visible" : ""}`}
        role="region"
        aria-label="Rychlé CTA"
        aria-hidden={!visible}
        inert={!visible ? true : undefined}
      >
        <div className="mx-auto max-w-content px-6 lg:px-8 pb-4 lg:pb-6">
          <div className="mx-auto max-w-2xl rounded-2xl bg-white/95 backdrop-blur-md shadow-lifted border border-navy-100/60 px-5 py-4 flex items-center gap-5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                {WORKSHOP.showSpotsScarcity && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/15 px-2.5 py-1 text-[11px] uppercase tracking-wider text-gold-600 font-bold">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-gold-500 opacity-60 animate-ping" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500" />
                    </span>
                    Zbývá {WORKSHOP.spotsLabel} míst
                  </span>
                )}
                <span className="text-xs text-dark/60 font-medium">
                  nejbližší termín: {WORKSHOP.dayOfWeek} {WORKSHOP.dateShort} · {WORKSHOP.timeRange}
                </span>
              </div>
              <p className="text-base lg:text-lg font-bold text-navy-700 truncate">
                Ukázková lekce koučování · {WORKSHOP.price} · {WORKSHOP.duration}
              </p>
            </div>
            <a
              href="#terminy"
              tabIndex={linkTabIndex}
              className="inline-flex items-center justify-center px-5 lg:px-6 py-3 lg:py-3.5 bg-cta-500 hover:bg-cta-600 active:bg-cta-700 text-white font-bold text-sm lg:text-base uppercase tracking-wide rounded-lg shadow-soft hover:shadow-lifted hover:-translate-y-0.5 transition-all min-h-[48px] whitespace-nowrap focus-visible:ring-4 focus-visible:ring-cta-500/40"
            >
              Vybrat termín · 199 Kč
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
