import { WORKSHOP } from "@/lib/config";

const EVENT_TITLE = "Workshop koučování: Půjde mi to vůbec?";
const EVENT_DESCRIPTION = `3hodinový online workshop s Alešem Vránou (ICF MCC).

Zoom odkaz: ${WORKSHOP.zoomUrl}
Meeting ID: ${WORKSHOP.zoomId}
Heslo: ${WORKSHOP.zoomPassword}

Připojte se 5 minut před začátkem (18:25). Workshop je interaktivní — zapněte si kameru a připravte si téma, které právě řešíte.

Otázky? ${WORKSHOP.contactEmail}`;

const EVENT_LOCATION = `Online přes Zoom — ${WORKSHOP.zoomUrl}`;

/**
 * Google Calendar URL — otevře v prohlížeči formulář s pre-fillem.
 * Dokumentace: https://github.com/InteractionDesignFoundation/add-event-to-calendar-docs/blob/main/services/google.md
 */
export function googleCalendarUrl(): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: EVENT_TITLE,
    dates: `${WORKSHOP.dateUTCStart}/${WORKSHOP.dateUTCEnd}`,
    details: EVENT_DESCRIPTION,
    location: EVENT_LOCATION,
    ctz: "Europe/Prague",
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
}

/**
 * Outlook Web (Office 365) deeplink — otevře v prohlížeči.
 * Funguje pro outlook.live.com i outlook.office.com.
 */
export function outlookCalendarUrl(): string {
  // Outlook potřebuje ISO formát bez "Z" suffixu a v lokálním čase
  const start = "2026-05-19T18:30:00";
  const end = "2026-05-19T21:30:00";
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: EVENT_TITLE,
    body: EVENT_DESCRIPTION,
    startdt: start,
    enddt: end,
    location: EVENT_LOCATION,
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generuje obsah .ics souboru pro Apple Calendar, Outlook Desktop,
 * Thunderbird a další iCalendar-kompatibilní aplikace.
 *
 * RFC 5545 standard.
 * https://datatracker.ietf.org/doc/html/rfc5545
 */
export function buildIcsFileContent(): string {
  // Escape pro iCal — speciální znaky musí být escapovány
  const escape = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

  // UID musí být jedinečné — používáme termín + doménu
  const uid = `workshop-2026-05-19@coachville.eu`;
  // DTSTAMP = kdy byl event vygenerován (povinné)
  const dtstamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  // Reminder 1 hodina před začátkem
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CoachVille Europe//Workshop//CS",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${WORKSHOP.dateUTCStart}`,
    `DTEND:${WORKSHOP.dateUTCEnd}`,
    `SUMMARY:${escape(EVENT_TITLE)}`,
    `DESCRIPTION:${escape(EVENT_DESCRIPTION)}`,
    `LOCATION:${escape(EVENT_LOCATION)}`,
    `URL:${WORKSHOP.zoomUrl}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escape("Workshop koučování za 1 hodinu — připravte se a otevřete Zoom v 18:25")}`,
    "TRIGGER:-PT1H",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Data URL pro stažení .ics souboru — funguje na všech zařízeních
 * bez potřeby server endpointu.
 */
export function icsDataUrl(): string {
  const content = buildIcsFileContent();
  // base64 encoded — zachová Unicode (čeština)
  // V browseru použijeme TextEncoder + btoa pomocí Uint8Array
  if (typeof window !== "undefined") {
    const bytes = new TextEncoder().encode(content);
    const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
    const base64 = btoa(binary);
    return `data:text/calendar;charset=utf-8;base64,${base64}`;
  }
  // Server-side fallback (Node.js)
  const base64 = Buffer.from(content, "utf-8").toString("base64");
  return `data:text/calendar;charset=utf-8;base64,${base64}`;
}
