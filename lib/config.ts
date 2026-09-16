/**
 * Centrální config.
 *
 * ⚠️ NEEDITOVAT pro běžné změny.
 *    Termíny  → lib/workshop-terminy.ts
 *    Ostatní  → lib/workshop-params.ts
 *
 * Tento soubor jen odvozuje formátované hodnoty pro UI, kalendáře a schema.org.
 */

import { PARAMS } from "./workshop-params";
import { TERMINY, type Termin } from "./workshop-terminy";

// NBSP - zabraňuje rozdělení „199 Kč" nebo „6. 10. 2026" na konci řádku
const NBSP = " ";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Pomocné funkce
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
  const newH = ((Math.floor(total / 60) % 24) + 24) % 24;
  const newM = ((total % 60) + 60) % 60;
  return `${pad2(newH)}:${pad2(newM)}`;
}

function parseISODate(dateISO: string) {
  const [year, month, day] = dateISO.split("-");
  return { day: String(parseInt(day, 10)), month: String(parseInt(month, 10)), year };
}

/**
 * Posun časové zóny v daném okamžiku, v milisekundách.
 *
 * Nepoužíváme pravidlo „duben až září = letní čas". Přechod na zimní čas
 * je poslední říjnovou nedělí, takže workshop 20. 10. ještě běží v letním
 * čase a 3. 11. už v zimním. Ručně napsané pravidlo by posunulo
 * kalendářovou událost o hodinu. Intl zná skutečná pravidla.
 */
function tzOffsetMs(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts: Record<string, number> = {};
  for (const p of dtf.formatToParts(date)) {
    if (p.type !== "literal") parts[p.type] = parseInt(p.value, 10);
  }

  const asUTC = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour === 24 ? 0 : parts.hour,
    parts.minute,
    parts.second,
  );

  return asUTC - date.getTime();
}

/** Místní čas v Praze → skutečný okamžik (timestamp v ms) */
function toTimestamp(dateISO: string, time: string): number {
  const [y, mo, d] = dateISO.split("-").map(Number);
  const { h, m } = parseTime(time);
  const naive = Date.UTC(y, mo - 1, d, h, m, 0);

  // Dvě iterace stačí i pro hodiny těsně u přechodu času
  let offset = tzOffsetMs(new Date(naive), PARAMS.timeZone);
  let ts = naive - offset;
  offset = tzOffsetMs(new Date(ts), PARAMS.timeZone);
  return naive - offset;
}

/** „+02:00" nebo „+01:00" podle skutečného posunu v ten den */
function offsetString(dateISO: string, time: string): string {
  const ts = toTimestamp(dateISO, time);
  const offsetMinutes = tzOffsetMs(new Date(ts), PARAMS.timeZone) / 60000;
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  return `${sign}${pad2(Math.floor(abs / 60))}:${pad2(abs % 60)}`;
}

function toLocalISO(dateISO: string, time: string): string {
  return `${dateISO}T${time}:00${offsetString(dateISO, time)}`;
}

function toUTCStamp(dateISO: string, time: string): string {
  const d = new Date(toTimestamp(dateISO, time));
  return (
    `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}` +
    `T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}00Z`
  );
}

function formatDuration(minutes: number, hasQA: boolean): string {
  const hours = minutes / 60;
  let text: string;
  if (Number.isInteger(hours)) {
    if (hours === 1) text = "1 hodina";
    else if (hours >= 2 && hours <= 4) text = `${hours} hodiny`;
    else text = `${hours} hodin`;
  } else {
    text = `${hours.toString().replace(".", ",")} hodiny`;
  }
  return hasQA ? `${text} + Q&A` : text;
}

function formatDurationShort(minutes: number): string {
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours}h` : `${hours.toString().replace(".", ",")}h`;
}

function formatPrice(amount: number): string {
  return `${amount.toLocaleString("cs-CZ").replace(/\s/g, NBSP)}${NBSP}Kč`;
}

function formatDateFull(dateISO: string, dayOfWeek: string): string {
  const { day, month, year } = parseISODate(dateISO);
  return `${dayOfWeek} ${day}.${NBSP}${month}.${NBSP}${year}`;
}

/**
 * Den v týdnu ve správném tvaru pro věty typu „Vidíme se ___".
 * Předložka je součástí textu, protože středa a čtvrtek mají „ve".
 *
 * Den se počítá z datumu, ne z ručně zapsaného `dayOfWeek` -
 * takže i kdyby v souboru termínů byl den napsaný špatně, věta bude správná.
 */
const DNY_S_PREDLOZKOU = [
  "v neděli", // 0
  "v pondělí",
  "v úterý",
  "ve středu",
  "ve čtvrtek",
  "v pátek",
  "v sobotu",
] as const;

function dayWithPreposition(dateISO: string): string {
  const { day, month, year } = parseISODate(dateISO);
  const weekday = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))).getUTCDay();
  return DNY_S_PREDLOZKOU[weekday];
}

/** „v neděli 20. 9. 2026" / „ve středu 23. 9. 2026" */
function formatDateFullLocative(dateISO: string): string {
  const { day, month, year } = parseISODate(dateISO);
  return `${dayWithPreposition(dateISO)} ${day}.${NBSP}${month}.${NBSP}${year}`;
}

function formatDateShort(dateISO: string): string {
  const { day, month, year } = parseISODate(dateISO);
  return `${day}.${NBSP}${month}.${NBSP}${year}`;
}

/** „6. 10." - krátký tvar pro badge a sticky lištu */
function formatDateDayMonth(dateISO: string): string {
  const { day, month } = parseISODate(dateISO);
  return `${day}.${NBSP}${month}.`;
}

function formatDateForFilename(dateISO: string): string {
  const { day, month, year } = parseISODate(dateISO);
  return `${day}-${month}-${year}`;
}

function formatTimeRange(start: string, end: string): string {
  return `${start}${NBSP}-${NBSP}${end}`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Odvozený termín - vše, co UI potřebuje o jednom termínu
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface TerminView {
  id: string;
  /** Adresa thank-you stránky, např. „/dekujeme/termin-1" */
  thankYouPath: string;

  dateISORaw: string;
  dateFull: string;
  /** „v neděli 20. 9. 2026" - do vět „Vidíme se ___", předložka je uvnitř */
  dateFullLocative: string;
  /** „v neděli" / „ve středu" - samotný den s předložkou */
  dayLocative: string;
  dateShort: string;
  dateDayMonth: string;
  dateFilename: string;
  dayOfWeek: string;

  /** ISO s časovou zónou - pro schema.org */
  dateISO: string;
  dateISOEnd: string;
  /** UTC stamp pro Google Calendar */
  dateUTCStart: string;
  dateUTCEnd: string;
  /** Lokální ISO bez zóny - pro Outlook deeplink */
  dateOutlookStart: string;
  dateOutlookEnd: string;

  timeStart: string;
  timeEnd: string;
  timeRange: string;
  /** Čas připojení, 5 minut před začátkem */
  joinTime: string;

  duration: string;
  durationShort: string;
  durationMinutes: number;

  price: string;
  priceNumber: number;

  capacity: number;
  spotsLeft: number;
  spotsLabel: string;
  showSpotsScarcity: boolean;

  paymentLink: string;
  zoomUrl: string;
  zoomId: string;
  zoomPassword: string;

  /** Okamžik, kdy se termín přestane zobrazovat (konec + hideTerminHoursAfterEnd) */
  hideAfterMs: number;
}

export function buildTermin(t: Termin): TerminView {
  const endTime = addMinutes(t.startTime, t.durationMinutes);
  const priceNumber = t.priceCZK ?? PARAMS.priceCZK;
  const spotsLeft = t.spotsLeft ?? PARAMS.capacity;

  const hideAfterMs =
    toTimestamp(t.dateISO, endTime) + PARAMS.hideTerminHoursAfterEnd * 60 * 60 * 1000;

  return {
    id: t.id,
    thankYouPath: `/dekujeme/${t.id}`,

    dateISORaw: t.dateISO,
    dateFull: formatDateFull(t.dateISO, t.dayOfWeek),
    dateFullLocative: formatDateFullLocative(t.dateISO),
    dayLocative: dayWithPreposition(t.dateISO),
    dateShort: formatDateShort(t.dateISO),
    dateDayMonth: formatDateDayMonth(t.dateISO),
    dateFilename: formatDateForFilename(t.dateISO),
    dayOfWeek: t.dayOfWeek,

    dateISO: toLocalISO(t.dateISO, t.startTime),
    dateISOEnd: toLocalISO(t.dateISO, endTime),
    dateUTCStart: toUTCStamp(t.dateISO, t.startTime),
    dateUTCEnd: toUTCStamp(t.dateISO, endTime),
    dateOutlookStart: `${t.dateISO}T${t.startTime}:00`,
    dateOutlookEnd: `${t.dateISO}T${endTime}:00`,

    timeStart: t.startTime,
    timeEnd: endTime,
    timeRange: formatTimeRange(t.startTime, endTime),
    joinTime: addMinutes(t.startTime, -5),

    duration: formatDuration(t.durationMinutes, PARAMS.hasQA),
    durationShort: formatDurationShort(t.durationMinutes),
    durationMinutes: t.durationMinutes,

    price: formatPrice(priceNumber),
    priceNumber,

    capacity: PARAMS.capacity,
    spotsLeft,
    spotsLabel: `${spotsLeft} / ${PARAMS.capacity}`,
    showSpotsScarcity: spotsLeft <= PARAMS.scarcityThreshold,

    paymentLink: t.paymentLink,
    zoomUrl: t.zoomUrl ?? PARAMS.zoomUrl,
    zoomId: t.zoomId ?? PARAMS.zoomId,
    zoomPassword: t.zoomPassword ?? PARAMS.zoomPassword,

    hideAfterMs,
  };
}

/** Všechny termíny ze souboru, seřazené od nejbližšího data */
export const VSECHNY_TERMINY: TerminView[] = TERMINY
  .map(buildTermin)
  .sort((a, b) => a.hideAfterMs - b.hideAfterMs);

/**
 * Termíny, které se mají zobrazit v daném okamžiku.
 *
 * Volá se jak na serveru (při buildu / revalidaci), tak v prohlížeči.
 * V prohlížeči je výsledek vždy aktuální, i kdyby HTML v cache bylo starší.
 */
export function getViditelneTerminy(nowMs: number = Date.now()): TerminView[] {
  return VSECHNY_TERMINY.filter((t) => t.hideAfterMs > nowMs);
}

/** Najde termín podle id - pro thank-you stránku */
export function najdiTermin(id: string): TerminView | undefined {
  return VSECHNY_TERMINY.find((t) => t.id === id);
}

/** Nejbližší viditelný termín. Když žádný není, vrátí poslední známý (kvůli metadatům). */
export function nejblizsiTermin(nowMs: number = Date.now()): TerminView {
  return getViditelneTerminy(nowMs)[0] ?? VSECHNY_TERMINY[VSECHNY_TERMINY.length - 1];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WORKSHOP - společné údaje + nejbližší termín
//
// Existující komponenty používají WORKSHOP.dateFull, .price, .timeRange atd.
// Aby fungovaly dál, ukazuje WORKSHOP na NEJBLIŽŠÍ termín.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const nejblizsi = nejblizsiTermin();

export const WORKSHOP = {
  // ─── Názvy ───
  title: `Workshop: ${PARAMS.workshopName}`,
  name: PARAMS.workshopName,
  calendarEventTitle: PARAMS.calendarEventTitle,

  // ─── Nejbližší termín (zpětná kompatibilita komponent) ───
  ...nejblizsi,

  // ─── Společné ───
  platform: PARAMS.platform,
  timeZone: PARAMS.timeZone,
  currency: PARAMS.currency,
  metaPixelId: PARAMS.metaPixelId,
  leadWebhookUrl: PARAMS.leadWebhookUrl,
  scarcityThreshold: PARAMS.scarcityThreshold,
  hasQA: PARAMS.hasQA,

  // ─── Kontakty a URL z .env ───
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "ales@coachville.eu",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://workshop.coachville.eu",
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COACH
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

/** Upozornění v dev režimu, když některý termín nemá vyplněný Stripe odkaz */
export const terminyBezPlatby = VSECHNY_TERMINY.filter(
  (t) => !/^https:\/\/(buy|book)\.stripe\.com\//.test(t.paymentLink),
);

export const isPaymentLinkConfigured = terminyBezPlatby.length === 0;
