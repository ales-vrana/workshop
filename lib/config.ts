/**
 * Centrální config — odvozuje formátované hodnoty z lib/workshop-params.ts.
 *
 * ⚠️ NEMĚNIT TENTO SOUBOR pro běžné změny parametrů workshopu.
 *    Edituj pouze lib/workshop-params.ts.
 *
 * Tento soubor jen *odvozuje* formátované varianty pro UI, kalendáře, schema.org atd.
 */

import { PARAMS } from "./workshop-params";

// NBSP (non-breaking space) — zabraňuje rozdělení např. "1 000 Kč" na konci řádku
const NBSP = " ";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Pomocné funkce — výpočty času, formátování
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function parseTime(t: string): { h: number; m: number } {
  const [h, m] = t.split(":").map(Number);
  return { h, m };
}

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function addMinutes(time: string, minutes: number): string {
  const { h, m } = parseTime(time);
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${pad2(newH)}:${pad2(newM)}`;
}

/** "2026-06-02" -> "02" / "6" / "2026" */
function parseISODate(dateISO: string): { day: string; month: string; year: string; dayNum: number; monthNum: number; yearNum: number } {
  const [year, month, day] = dateISO.split("-");
  return {
    day: String(parseInt(day, 10)),
    month: String(parseInt(month, 10)),
    year,
    dayNum: parseInt(day, 10),
    monthNum: parseInt(month, 10),
    yearNum: parseInt(year, 10),
  };
}

/** "2026-06-02" + "17:00" -> "2026-06-02T17:00:00+02:00" (Europe/Prague, DST aware via offset) */
function toLocalISO(dateISO: string, time: string): string {
  // Prague je UTC+1 (zimní čas) nebo UTC+2 (letní čas).
  // Pro datumy v období od poslední neděle v březnu do poslední neděle v října = UTC+2.
  // Pro 2.6.2026 = letní čas = UTC+2.
  // Pro jednoduchost u většiny workshopů (jaro–podzim) používáme +02:00.
  const date = new Date(`${dateISO}T${time}:00`);
  const month = parseInt(dateISO.split("-")[1], 10);
  const isDST = month >= 4 && month <= 9; // hrubý odhad — workshopy obvykle v sezóně
  const offset = isDST ? "+02:00" : "+01:00";
  return `${dateISO}T${time}:00${offset}`;
}

/** "2026-06-02" + "17:00" -> "20260602T150000Z" (UTC, DST aware) */
function toUTCStamp(dateISO: string, time: string): string {
  const month = parseInt(dateISO.split("-")[1], 10);
  const isDST = month >= 4 && month <= 9;
  const offsetHours = isDST ? 2 : 1;
  const { h, m } = parseTime(time);
  const utcH = (h - offsetHours + 24) % 24;
  const datePart = dateISO.replace(/-/g, "");
  return `${datePart}T${pad2(utcH)}${pad2(m)}00Z`;
}

/** "120" minut -> "2 hodiny" / "150" min -> "2,5 hodiny" / "60" min -> "1 hodina" */
function formatDuration(minutes: number, hasQA: boolean): string {
  const hours = minutes / 60;
  let text: string;
  if (Number.isInteger(hours)) {
    if (hours === 1) text = "1 hodina";
    else if (hours >= 2 && hours <= 4) text = `${hours} hodiny`;
    else text = `${hours} hodin`;
  } else {
    // Desetinná čísla — používáme "X,Y hodiny"
    const formatted = hours.toString().replace(".", ",");
    text = `${formatted} hodiny`;
  }
  return hasQA ? `${text} + Q&A` : text;
}

/** "120" minut -> "2h" / "150" min -> "2,5h" — kompaktní zápis */
function formatDurationShort(minutes: number): string {
  const hours = minutes / 60;
  if (Number.isInteger(hours)) return `${hours}h`;
  return `${hours.toString().replace(".", ",")}h`;
}

/** 599 -> "599 Kč" / 1000 -> "1 000 Kč" (NBSP) */
function formatPrice(amount: number): string {
  const formatted = amount.toLocaleString("cs-CZ").replace(/\s/g, NBSP);
  return `${formatted}${NBSP}Kč`;
}

/** "2026-06-02" -> "úterý 2. 6. 2026" (s NBSP) */
function formatDateFull(dateISO: string, dayOfWeek: string): string {
  const { day, month, year } = parseISODate(dateISO);
  return `${dayOfWeek} ${day}.${NBSP}${month}.${NBSP}${year}`;
}

/** "2026-06-02" -> "2. 6. 2026" (bez dne, s NBSP) */
function formatDateShort(dateISO: string): string {
  const { day, month, year } = parseISODate(dateISO);
  return `${day}.${NBSP}${month}.${NBSP}${year}`;
}

/** "2026-06-02" -> "2-6-2026" (pro filename .ics) */
function formatDateForFilename(dateISO: string): string {
  const { day, month, year } = parseISODate(dateISO);
  return `${day}-${month}-${year}`;
}

/** "17:00" + "19:00" -> "17:00 – 19:00" (s en-dash a NBSP) */
function formatTimeRange(start: string, end: string): string {
  return `${start}${NBSP}–${NBSP}${end}`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Výpočet odvozených hodnot
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const startTime = PARAMS.startTime;
const endTime = addMinutes(startTime, PARAMS.durationMinutes);
const joinTime = addMinutes(startTime, -5); // 5 min před začátkem

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Exportovaný WORKSHOP objekt — používaj ho ve všech komponentech
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const WORKSHOP = {
  // ─── Názvy ───
  title: `Workshop: ${PARAMS.workshopName}`,
  name: PARAMS.workshopName,
  calendarEventTitle: PARAMS.calendarEventTitle,

  // ─── Datum a čas ───
  dateFull: formatDateFull(PARAMS.dateISO, PARAMS.dayOfWeek),     // "úterý 2. 6. 2026"
  dateShort: formatDateShort(PARAMS.dateISO),                     // "2. 6. 2026"
  dateWithoutDay: formatDateShort(PARAMS.dateISO),                // alias
  dayOfWeek: PARAMS.dayOfWeek,                                    // "úterý"
  dateFilename: formatDateForFilename(PARAMS.dateISO),            // "2-6-2026"

  /** ISO datum bez času — "2026-06-02" */
  dateISORaw: PARAMS.dateISO,

  /** ISO start lokální — "2026-06-02T17:00:00+02:00" — pro schema.org */
  dateISO: toLocalISO(PARAMS.dateISO, startTime),

  /** ISO konec lokální — "2026-06-02T19:00:00+02:00" — pro schema.org */
  dateISOEnd: toLocalISO(PARAMS.dateISO, endTime),

  /** UTC start — "20260602T150000Z" — pro Google Calendar URL */
  dateUTCStart: toUTCStamp(PARAMS.dateISO, startTime),

  /** UTC konec — "20260602T170000Z" — pro Google Calendar URL */
  dateUTCEnd: toUTCStamp(PARAMS.dateISO, endTime),

  /** Outlook lokální start — "2026-06-02T17:00:00" — bez TZ suffixu */
  dateOutlookStart: `${PARAMS.dateISO}T${startTime}:00`,
  dateOutlookEnd: `${PARAMS.dateISO}T${endTime}:00`,

  // ─── Časy ───
  timeStart: startTime,                                           // "17:00"
  timeEnd: endTime,                                               // "19:00"
  timeRange: formatTimeRange(startTime, endTime),                 // "17:00 – 19:00"
  joinTime,                                                       // "16:55"

  // ─── Délka ───
  duration: formatDuration(PARAMS.durationMinutes, PARAMS.hasQA), // "2 hodiny"
  durationShort: formatDurationShort(PARAMS.durationMinutes),     // "2h"
  durationMinutes: PARAMS.durationMinutes,                        // 120
  hasQA: PARAMS.hasQA,

  // ─── Cena ───
  price: formatPrice(PARAMS.priceCZK),                            // "599 Kč"
  priceNumber: PARAMS.priceCZK,                                   // 599
  currency: PARAMS.currency,                                      // "CZK"

  // ─── Kapacita ───
  capacity: PARAMS.capacity,                                      // 16
  spotsLeft: PARAMS.spotsLeft,                                    // 16
  spotsLabel: `${PARAMS.spotsLeft} / ${PARAMS.capacity}`,         // "16 / 16"

  /**
   * True jen pokud `spotsLeft <= scarcityThreshold` (default ≤ 9).
   * Použij v komponentech: `{WORKSHOP.showSpotsScarcity && <div>Zbývá X míst</div>}`
   */
  showSpotsScarcity: PARAMS.spotsLeft <= PARAMS.scarcityThreshold,

  // ─── Platforma ───
  platform: PARAMS.platform,                                      // "Zoom"
  timeZone: PARAMS.timeZone,                                      // "Europe/Prague"

  // ─── Externí URL (z .env) ───
  zoomUrl: process.env.NEXT_PUBLIC_ZOOM_URL || "https://us02web.zoom.us/j/89790199665",
  zoomId: process.env.NEXT_PUBLIC_ZOOM_ID || "897 9019 9665",
  zoomPassword: process.env.NEXT_PUBLIC_ZOOM_PASSWORD || "",
  paymentLink:
    process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ||
    "https://buy.stripe.com/3cI00i1YQ3dZ3a6gA1ejK1J",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "ales@coachville.eu",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://workshop.coachville.eu",
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COACH info — statické, neměnit pro běžné případy
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

// Helper exports
export const isPaymentLinkConfigured =
  !WORKSHOP.paymentLink.includes("REPLACE_ME") &&
  WORKSHOP.paymentLink.startsWith("https://buy.stripe.com/");
