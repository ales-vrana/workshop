"use client";

import { useEffect, useState } from "react";
import { Calendar, Monitor } from "lucide-react";
import { WORKSHOP, getViditelneTerminy, type TerminView } from "@/lib/config";

/**
 * Všechny vypsané termíny přímo v hero, ne jen nejbližší.
 *
 * Důvod: kdo vidí jen „pátek 11:30" a ten mu nevyhovuje, na tlačítko
 * neklikne a o nedělním termínu se nedozví.
 *
 * Seznam se po načtení v prohlížeči přepočítá podle aktuálního času,
 * takže proběhlý termín zmizí i bez nového nasazení stránky.
 *
 * Každý řádek je odkaz na sekci #terminy, kde je tlačítko k registraci.
 */

const MAX_TERMINU = 3;

export function HeroTerminy({
  initial,
  center = false,
}: {
  initial: TerminView[];
  /** true = vždy na střed (závěrečná sekce), jinak na desktopu vlevo (hero) */
  center?: boolean;
}) {
  // Výchozí stav ze serveru, aby se HTML při načtení shodovalo (bez hydration chyby)
  const [terminy, setTerminy] = useState<TerminView[]>(initial);

  useEffect(() => {
    setTerminy(getViditelneTerminy());
  }, []);

  const zobrazit = terminy.slice(0, MAX_TERMINU);
  const zarovnani = center ? "items-center" : "items-center lg:items-start";

  return (
    <div className={`flex flex-col ${zarovnani} gap-2 text-[15px] sm:text-base text-white/85`}>
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-white/70 shrink-0" aria-hidden />
        <span className="font-bold text-white">
          {zobrazit.length === 0
            ? "Nové termíny připravuji"
            : zobrazit.length === 1
              ? "Termín:"
              : "Termíny:"}
        </span>
      </div>

      {zobrazit.length > 0 && (
        <ul className={`flex flex-col ${zarovnani} gap-1.5`}>
          {zobrazit.map((t) => (
            <li key={t.id}>
              <a
                href="#terminy"
                className="font-medium hover:text-white underline-offset-4 decoration-white/30 hover:underline"
              >
                {t.dateFull}, {t.timeRange}
              </a>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2">
        <Monitor className="h-4 w-4 text-white/70 shrink-0" aria-hidden />
        <span className="font-medium">online přes {WORKSHOP.platform}</span>
      </div>
    </div>
  );
}
