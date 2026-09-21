"use client";

import { useEffect, useRef } from "react";
import {
  getClientAttribution,
  isStripePaymentUrl,
  mergeAttribution,
  persistClientAttribution,
  readUtmFromSearch,
  withAttribution,
  type Attribution,
} from "@/lib/attribution";
import { apiUrl } from "@/lib/paths";

function newEventId(): string {
  return crypto.randomUUID();
}

function fbqTrack(event: string, params?: Record<string, unknown>, eventId?: string) {
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  if (!fbq) return;
  if (eventId) {
    fbq("track", event, params || {}, { eventID: eventId });
  } else {
    fbq("track", event, params || {});
  }
}

function setClarityTags(attr: Attribution) {
  const clarity = (window as unknown as { clarity?: (...args: unknown[]) => void }).clarity;
  if (!clarity) return;
  clarity("set", "visitor_id", attr.visitorId);
  const u = attr.last.utm_content || attr.first.utm_content ? attr.last : attr.first;
  if (u.utm_content) clarity("set", "utm_content", u.utm_content);
  if (u.utm_campaign) clarity("set", "utm_campaign", u.utm_campaign);
  if (u.utm_source) clarity("set", "utm_source", u.utm_source);
  if (u.utm_term) clarity("set", "utm_term", u.utm_term);
}

function sendTrack(
  attr: Attribution,
  eventType: string,
  extra?: { eventId?: string; meta?: Record<string, unknown> },
) {
  const body = JSON.stringify({
    visitorId: attr.visitorId,
    eventType,
    eventId: extra?.eventId,
    path: window.location.pathname + window.location.search,
    meta: extra?.meta || {},
    attribution: attr,
  });
  const url = apiUrl("/api/track");
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon(url, blob)) return;
  }
  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  });
}

function captureAttribution(): Attribution {
  const incoming = readUtmFromSearch(window.location.search);
  const existing = getClientAttribution();
  const attr = mergeAttribution(existing, incoming);
  persistClientAttribution(attr);
  return attr;
}

function closestAnchor(target: EventTarget | null): HTMLAnchorElement | null {
  const el = target as Element | null;
  return el?.closest?.("a") ?? null;
}

function isStripeAnchor(a: HTMLAnchorElement): boolean {
  const href = a.getAttribute("href") || "";
  return isStripePaymentUrl(href) || isStripePaymentUrl(a.href);
}

/** Rewrite Stripe Payment Links so hover / inspect already shows UTM + visitor id. */
function patchStripeHref(a: HTMLAnchorElement, attr: Attribution): string {
  const source = a.href || a.getAttribute("href") || "";
  if (!source || !isStripePaymentUrl(source)) return source;
  const attributed = withAttribution(source, attr);
  if (a.getAttribute("href") !== attributed) {
    a.setAttribute("href", attributed);
  }
  return attributed;
}

function patchAllStripeLinks(attr: Attribution): void {
  document.querySelectorAll("a[href], a[data-engine-checkout]").forEach((el) => {
    const a = el as HTMLAnchorElement;
    if (isStripeAnchor(a)) patchStripeHref(a, attr);
  });
}

export function AttributionTracker() {
  const sent = useRef(false);
  const lastCheckout = useRef<{ key: string; at: number } | null>(null);

  useEffect(() => {
    if (window.location.pathname.includes("/engine")) return;

    const attr = captureAttribution();
    setClarityTags(attr);

    if (!sent.current) {
      sent.current = true;
      const viewId = newEventId();
      sendTrack(attr, "page_view", { eventId: viewId });
      const contentId = newEventId();
      fbqTrack(
        "ViewContent",
        {
          content_name: document.title,
          content_type: "product",
        },
        contentId,
      );
      sendTrack(attr, "view_content", { eventId: contentId });
    }

    const currentAttr = () => getClientAttribution() || attr;

    let patchFrame = 0;
    const schedulePatch = () => {
      if (patchFrame) return;
      patchFrame = requestAnimationFrame(() => {
        patchFrame = 0;
        patchAllStripeLinks(currentAttr());
      });
    };

    patchAllStripeLinks(attr);
    schedulePatch();
    const delayedPatch = window.setTimeout(() => patchAllStripeLinks(currentAttr()), 0);
    const delayedPatch2 = window.setTimeout(() => patchAllStripeLinks(currentAttr()), 250);

    const mo = new MutationObserver(schedulePatch);
    mo.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["href"],
    });

    const onScroll = () => {
      const doc = document.documentElement;
      const scrolled = (window.scrollY + window.innerHeight) / Math.max(doc.scrollHeight, 1);
      if (scrolled >= 0.5) {
        window.removeEventListener("scroll", onScroll);
        sendTrack(currentAttr(), "scroll_50");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const terminy = document.getElementById("terminy");
    let terminyObs: IntersectionObserver | null = null;
    if (terminy) {
      terminyObs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            sendTrack(currentAttr(), "scroll_terminy");
            terminyObs?.disconnect();
          }
        },
        { threshold: 0.2 },
      );
      terminyObs.observe(terminy);
    }

    const trackInitiateCheckout = (a: HTMLAnchorElement, current: Attribution, attributed: string) => {
      const key = `${current.visitorId}:${attributed}`;
      const now = Date.now();
      const prev = lastCheckout.current;
      if (prev && prev.key === key && now - prev.at < 2000) return;
      lastCheckout.current = { key, at: now };

      const eventId = newEventId();
      const terminId = a.getAttribute("data-termin-id") || undefined;
      fbqTrack(
        "InitiateCheckout",
        {
          currency: "CZK",
          content_ids: terminId ? [terminId] : undefined,
        },
        eventId,
      );
      sendTrack(current, "initiate_checkout", {
        eventId,
        meta: { terminId, href: attributed },
      });
    };

    const onPointerDown = (event: PointerEvent) => {
      const a = closestAnchor(event.target);
      if (!a || !isStripeAnchor(a)) return;
      patchStripeHref(a, currentAttr());
    };

    const onClick = (event: MouseEvent) => {
      const a = closestAnchor(event.target);
      if (!a) return;
      const href = a.getAttribute("href") || "";
      const current = currentAttr();

      if (a.id === "hero-cta") {
        sendTrack(current, "hero_show_dates", { meta: { href, source: "hero" } });
        return;
      }

      if (href.startsWith("#terminy") || href.endsWith("#terminy") || href.startsWith("#koupit")) {
        sendTrack(current, "cta_click", { meta: { href } });
        return;
      }

      if (!isStripeAnchor(a)) return;

      const attributed = patchStripeHref(a, current);
      trackInitiateCheckout(a, current, attributed);
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("click", onClick, true);
    return () => {
      if (patchFrame) cancelAnimationFrame(patchFrame);
      window.clearTimeout(delayedPatch);
      window.clearTimeout(delayedPatch2);
      window.removeEventListener("scroll", onScroll);
      terminyObs?.disconnect();
      mo.disconnect();
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return null;
}
