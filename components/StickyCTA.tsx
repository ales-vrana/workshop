"use client";

import { useEffect, useState } from "react";
import { WORKSHOP } from "@/lib/config";

export function StickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => {
      // Show after user scrolled past 600px (cca konec hero sekce)
      setVisible(window.scrollY > 600);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      {/* MOBILE: full-width bottom bar */}
      <div
        className={`sticky-cta sm:hidden ${visible ? "visible" : ""}`}
        role="region"
        aria-label="Rychlé CTA"
      >
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-gold-600 font-bold leading-none">
              Zbývá {WORKSHOP.spotsLabel} míst
            </p>
            <p className="text-sm font-bold text-navy-600 truncate mt-1">
              {WORKSHOP.price} • {WORKSHOP.duration}
            </p>
          </div>
          <a
            href={WORKSHOP.paymentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-3 bg-teal-400 hover:bg-teal-500 active:bg-teal-600 text-white font-bold text-sm rounded-lg shadow-soft min-h-[44px] whitespace-nowrap"
          >
            Zajisti si místo
          </a>
        </div>
      </div>

      {/* DESKTOP: centered floating pill */}
      <div
        className={`sticky-cta-desktop hidden sm:block ${visible ? "visible" : ""}`}
        role="region"
        aria-label="Rychlé CTA"
      >
        <div className="mx-auto max-w-content px-6 lg:px-8 pb-4 lg:pb-6">
          <div className="mx-auto max-w-2xl rounded-2xl bg-white/95 backdrop-blur-md shadow-lifted border border-navy-100/60 px-5 py-4 flex items-center gap-5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/15 px-2.5 py-1 text-[11px] uppercase tracking-wider text-gold-600 font-bold">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-gold-500 opacity-60 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500" />
                  </span>
                  Zbývá {WORKSHOP.spotsLabel} míst
                </span>
                <span className="text-xs text-dark/60 font-medium">
                  {WORKSHOP.dateShort} • {WORKSHOP.timeRange}
                </span>
              </div>
              <p className="text-base lg:text-lg font-bold text-navy-700 truncate">
                Workshop koučování — {WORKSHOP.price} • {WORKSHOP.duration}
              </p>
            </div>
            <a
              href={WORKSHOP.paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 lg:px-6 py-3 lg:py-3.5 bg-teal-400 hover:bg-teal-500 active:bg-teal-600 text-white font-bold text-sm lg:text-base rounded-lg shadow-soft hover:shadow-lifted hover:-translate-y-0.5 transition-all min-h-[48px] whitespace-nowrap focus-visible:ring-4 focus-visible:ring-teal-400/40"
            >
              Zajisti si místo →
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
