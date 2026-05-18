// Centrální konfigurace stránky — všechny snadno měnitelné parametry
// NBSP (non-breaking space) v cenách a datech zabraňuje rozdělení na konci řádku
const NBSP = " ";

export const WORKSHOP = {
  title: "Workshop: Zažij koučování a začni koučovat už teď",
  dateFull: `pátek 22.${NBSP}5.${NBSP}2026`,
  dateShort: `22.${NBSP}5.${NBSP}2026`,
  dateISO: "2026-05-22T17:30:00+02:00",
  dateISOEnd: "2026-05-22T20:00:00+02:00",
  dateUTCStart: "20260522T153000Z",
  dateUTCEnd: "20260522T180000Z",
  timeRange: `17:30${NBSP}–${NBSP}20:00`,
  duration: "2,5 hodiny + Q&A",
  price: `1${NBSP}000${NBSP}Kč`,
  priceNumber: 1000,
  currency: "CZK",
  capacity: 16,
  platform: "Zoom",
  zoomUrl: process.env.NEXT_PUBLIC_ZOOM_URL || "https://us02web.zoom.us/j/89790199665",
  zoomId: process.env.NEXT_PUBLIC_ZOOM_ID || "897 9019 9665",
  zoomPassword: process.env.NEXT_PUBLIC_ZOOM_PASSWORD || "",
  paymentLink:
    process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ||
    "https://buy.stripe.com/3cI00i1YQ3dZ3a6gA1ejK1J",
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

export const isPaymentLinkConfigured = !WORKSHOP.paymentLink.includes("REPLACE_ME") && WORKSHOP.paymentLink.startsWith("https://buy.stripe.com/");
