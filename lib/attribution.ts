export const ATTR_COOKIE = "cv_attr";
export const ATTR_MAX_AGE_SEC = 90 * 24 * 60 * 60;

export type UtmFields = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  fbclid: string;
};

export type Attribution = {
  visitorId: string;
  first: UtmFields;
  last: UtmFields;
};

export const EMPTY_UTM: UtmFields = {
  utm_source: "",
  utm_medium: "",
  utm_campaign: "",
  utm_content: "",
  utm_term: "",
  fbclid: "",
};

const UTM_KEYS: (keyof Omit<UtmFields, "fbclid">)[] = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
];

export function emptyUtm(): UtmFields {
  return { ...EMPTY_UTM };
}

export function utmHasValue(u: UtmFields): boolean {
  return Boolean(
    u.utm_source ||
      u.utm_medium ||
      u.utm_campaign ||
      u.utm_content ||
      u.utm_term ||
      u.fbclid,
  );
}

export function readUtmFromSearch(search: string | URLSearchParams): UtmFields {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  const u = emptyUtm();
  for (const key of UTM_KEYS) {
    u[key] = (params.get(key) || "").trim();
  }
  u.fbclid = (params.get("fbclid") || "").trim();
  return u;
}

function coalesceUtm(base: UtmFields, incoming: UtmFields): UtmFields {
  const out = { ...base };
  for (const key of UTM_KEYS) {
    if (incoming[key]) out[key] = incoming[key];
  }
  if (incoming.fbclid) out.fbclid = incoming.fbclid;
  return out;
}

export function mergeAttribution(existing: Attribution | null, incoming: UtmFields): Attribution {
  const visitorId = existing?.visitorId || crypto.randomUUID();
  if (!existing) {
    return {
      visitorId,
      first: { ...incoming },
      last: utmHasValue(incoming) ? { ...incoming } : emptyUtm(),
    };
  }
  const first = utmHasValue(existing.first)
    ? existing.first
    : utmHasValue(incoming)
      ? { ...incoming }
      : existing.first;
  const last = utmHasValue(incoming) ? coalesceUtm(existing.last, incoming) : existing.last;
  return { visitorId, first, last };
}

export function parseAttributionCookie(raw: string | null | undefined): Attribution | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Attribution;
    if (!data || typeof data.visitorId !== "string" || !data.visitorId) return null;
    return {
      visitorId: data.visitorId,
      first: { ...EMPTY_UTM, ...data.first },
      last: { ...EMPTY_UTM, ...data.last },
    };
  } catch {
    return null;
  }
}

export function serializeAttributionCookie(attr: Attribution): string {
  return JSON.stringify(attr);
}

/** Last-touch má přednost (reklama, ze které šel právě teď). */
export function effectiveUtm(attr: Attribution): UtmFields {
  return utmHasValue(attr.last) ? attr.last : attr.first;
}

/**
 * Stripe Payment Link přijímá client_reference_id a utm_*.
 * https://docs.stripe.com/payment-links/url-parameters
 */
export function withAttribution(paymentUrl: string, attr: Attribution): string {
  const url = new URL(paymentUrl);
  url.searchParams.set("client_reference_id", attr.visitorId);
  const utm = effectiveUtm(attr);
  for (const key of UTM_KEYS) {
    if (utm[key]) url.searchParams.set(key, utm[key]);
  }
  return url.toString();
}

export function isStripePaymentUrl(href: string): boolean {
  try {
    const host = new URL(href, "https://example.com").hostname;
    return host === "buy.stripe.com" || host === "book.stripe.com";
  } catch {
    return false;
  }
}

export function getClientAttribution(): Attribution | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${ATTR_COOKIE}=([^;]*)`));
  if (!match) {
    try {
      return parseAttributionCookie(localStorage.getItem(ATTR_COOKIE));
    } catch {
      return null;
    }
  }
  try {
    return parseAttributionCookie(decodeURIComponent(match[1]));
  } catch {
    return parseAttributionCookie(localStorage.getItem(ATTR_COOKIE));
  }
}

export function persistClientAttribution(attr: Attribution): void {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(serializeAttributionCookie(attr));
  document.cookie = `${ATTR_COOKIE}=${value}; Max-Age=${ATTR_MAX_AGE_SEC}; Path=/; SameSite=Lax`;
  try {
    localStorage.setItem(ATTR_COOKIE, serializeAttributionCookie(attr));
  } catch {
    // private mode
  }
}
