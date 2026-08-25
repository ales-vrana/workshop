"use client";

import { useEffect, useRef } from "react";
import { WORKSHOP } from "@/lib/config";

/**
 * Odešle do Meta Pixelu událost Purchase.
 * Používá se POUZE na stránce /dekujeme, kam Stripe přesměruje po zaplacení.
 *
 * PageView řeší komponenta MetaPixel v layoutu — tahle přidává jen konverzi.
 */
export function MetaPixelPurchase() {
  const sent = useRef(false);

  useEffect(() => {
    if (!WORKSHOP.metaPixelId) return;
    if (sent.current) return;

    // fbq se načítá asynchronně — počkáme, až bude k dispozici (max 10 s)
    let attempts = 0;
    const timer = setInterval(() => {
      const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;

      if (fbq) {
        clearInterval(timer);
        sent.current = true;
        fbq("track", "Purchase", {
          value: WORKSHOP.priceNumber,
          currency: WORKSHOP.currency,
          content_name: WORKSHOP.name,
          content_type: "product",
        });
      } else if (++attempts > 50) {
        clearInterval(timer);
      }
    }, 200);

    return () => clearInterval(timer);
  }, []);

  return null;
}
