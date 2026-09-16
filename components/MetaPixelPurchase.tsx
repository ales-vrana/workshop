"use client";

import { useEffect, useRef } from "react";
import { WORKSHOP } from "@/lib/config";

/**
 * Odešle do Meta Pixelu událost Purchase.
 * Používá se POUZE na thank-you stránkách, kam Stripe přesměruje po zaplacení.
 *
 * PageView řeší komponenta MetaPixel v layoutu - tahle přidává jen konverzi.
 */
export function MetaPixelPurchase({
  value = WORKSHOP.priceNumber,
  terminId,
}: {
  /** Cena konkrétního termínu */
  value?: number;
  /** Id termínu - pošle se do Facebooku jako content_ids, ať víš, který termín prodává */
  terminId?: string;
}) {
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
        fbq("track", "Purchase", {
          value,
          currency: WORKSHOP.currency,
          content_name: WORKSHOP.name,
          content_type: "product",
          ...(terminId ? { content_ids: [terminId] } : {}),
        });
      } else if (++attempts > 50) {
        clearInterval(timer);
      }
    }, 200);

    return () => clearInterval(timer);
  }, [value, terminId]);

  return null;
}
