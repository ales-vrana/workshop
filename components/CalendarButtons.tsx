"use client";

import { useEffect, useState } from "react";
import { googleCalendarUrl, outlookCalendarUrl, icsDataUrl } from "@/lib/calendar";

/**
 * Trojice tlačítek pro přidání do kalendáře:
 * Google / Outlook / Apple+iCal (.ics).
 *
 * Generujeme URL na client side (icsDataUrl potřebuje window pro base64 encode).
 */
export function CalendarButtons() {
  const [icsHref, setIcsHref] = useState<string>("");

  useEffect(() => {
    setIcsHref(icsDataUrl());
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Google */}
      <a
        href={googleCalendarUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-4 bg-white border-2 border-navy-100/60 hover:border-teal-400 hover:bg-cream rounded-xl transition-all min-h-[64px] touch-manipulation group focus-visible:border-teal-400"
        aria-label="Přidat do Google Calendar (otevře se v novém okně)"
      >
        <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-[#4285F4] text-white flex items-center justify-center font-bold text-lg" aria-hidden>
          G
        </span>
        <span className="flex-1 text-left">
          <span className="block text-sm font-semibold text-navy-700 leading-tight">Google</span>
          <span className="block text-xs text-dark/55 mt-0.5">Otevřít kalendář</span>
        </span>
      </a>

      {/* Outlook */}
      <a
        href={outlookCalendarUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-4 bg-white border-2 border-navy-100/60 hover:border-teal-400 hover:bg-cream rounded-xl transition-all min-h-[64px] touch-manipulation group focus-visible:border-teal-400"
        aria-label="Přidat do Outlook Calendar (otevře se v novém okně)"
      >
        <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-[#0078D4] text-white flex items-center justify-center font-bold text-lg" aria-hidden>
          O
        </span>
        <span className="flex-1 text-left">
          <span className="block text-sm font-semibold text-navy-700 leading-tight">Outlook</span>
          <span className="block text-xs text-dark/55 mt-0.5">Otevřít kalendář</span>
        </span>
      </a>

      {/* Apple / .ics download */}
      <a
        href={icsHref || "#"}
        download="workshop-koucovani-19-5-2026.ics"
        className="flex items-center gap-3 p-4 bg-white border-2 border-navy-100/60 hover:border-teal-400 hover:bg-cream rounded-xl transition-all min-h-[64px] touch-manipulation group focus-visible:border-teal-400"
        aria-label="Stáhnout .ics soubor pro Apple Calendar nebo jinou aplikaci"
      >
        <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-dark text-white flex items-center justify-center font-bold text-lg" aria-hidden>

        </span>
        <span className="flex-1 text-left">
          <span className="block text-sm font-semibold text-navy-700 leading-tight">Apple / iCal</span>
          <span className="block text-xs text-dark/55 mt-0.5">.ics soubor</span>
        </span>
      </a>
    </div>
  );
}
