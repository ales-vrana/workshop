// Centrální konfigurace stránky — všechny snadno měnitelné parametry
// NBSP (non-breaking space) v cenách a datech zabraňuje rozdělení na konci řádku
const NBSP = " ";

export const WORKSHOP = {
  title: "Workshop: Zažij koučování a začni koučovat už teď",
  dateFull: `úterý 19.${NBSP}5.${NBSP}2026`,
  dateShort: `19.${NBSP}5.${NBSP}2026`,
  dateISO: "2026-05-19T18:30:00+02:00",
  dateISOEnd: "2026-05-19T21:30:00+02:00",
  dateUTCStart: "20260519T163000Z",
  dateUTCEnd: "20260519T193000Z",
  timeRange: `18:30${NBSP}–${NBSP}21:30`,
  duration: "3 hodiny",
  price: `1${NBSP}500${NBSP}Kč`,
  priceNumber: 1500,
  currency: "CZK",
  capacity: 16,
  platform: "Zoom",
  zoomUrl: process.env.NEXT_PUBLIC_ZOOM_URL || "https://us02web.zoom.us/j/89790199665",
  zoomId: process.env.NEXT_PUBLIC_ZOOM_ID || "897 9019 9665",
  zoomPassword: process.env.NEXT_PUBLIC_ZOOM_PASSWORD || "",
  paymentLink:
    process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ||
    "https://buy.stripe.com/REPLACE_ME",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "ales@coachville.eu",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://workshop.coachville.eu",
} as const;

export const COACH = {
  name: "Aleš Vrána",
  titles: "MCC, MBA",
  fullName: "Aleš Vrána, MCC, MBA",
  certification: "ICF Master Certified Coach",
  yearsOfPractice: 14,
  coachingHours: "4 700+",
  trainees: "600+",
  mccCountInCzechia: 6,
} as const;

export const isPaymentLinkConfigured = !WORKSHOP.paymentLink.includes("REPLACE_ME");
