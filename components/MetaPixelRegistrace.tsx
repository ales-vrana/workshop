"use client";

import { useEffect, useRef } from "react";
import { WORKSHOP } from "@/lib/config";

/**
 * Konverze „CompleteRegistration" pro Meta Pixel.
 *
 * Nahrazuje dřívější „Purchase": lekce je zdarma, takže měříme registraci.
 * V Meta Ads je potřeba kampaně optimalizovat na tuto událost
 * (Dokončená registrace), jinak se budou dál učit na nákup, který už nenastane.
 */
export function MetaPixelRegistrace({ terminId }: { terminId?: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (!WORKSHOP.metaPixelId) return;
    if (sent.current) return;

    // fbq se načítá asynchronně - počkáme, až bude k dispozici (max 10 s)
    let attempts = 0;
    const timer = setInterval(() => {
      const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;

      if (fbq) {
        clearInterval(timer);
        sent.current = true;
        fbq("track", "CompleteRegistration", {
          content_name: WORKSHOP.name,
          status: "registrovano",
          value: 0,
          currency: WORKSHOP.currency,
          ...(terminId ? { content_ids: [terminId] } : {}),
        });
      } else if (++attempts > 50) {
        clearInterval(timer);
      }
    }, 200);

    return () => clearInterval(timer);
  }, [terminId]);

  return null;
}
