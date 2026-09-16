import { WORKSHOP, type TerminView } from "@/lib/config";

/**
 * Generátory kalendářových odkazů pro KONKRÉTNÍ termín.
 * Termín se předává jako parametr, protože každá thank-you stránka
 * patří jinému datu.
 */

function eventTitle(): string {
  return WORKSHOP.calendarEventTitle;
}

function eventDescription(t: TerminView): string {
  const heslo = t.zoomPassword ? `\nHeslo: ${t.zoomPassword}` : "";
  return `${t.duration} online workshop s Alešem Vránou (ICF MCC).

Zoom odkaz: ${t.zoomUrl}
Meeting ID: ${t.zoomId}${heslo}

Připojte se 5 minut před začátkem (${t.joinTime}). Workshop je interaktivní - zapněte si kameru a připravte si téma, které právě řešíte.

Otázky? ${WORKSHOP.contactEmail}`;
}

function eventLocation(t: TerminView): string {
  return `Online přes ${WORKSHOP.platform} - ${t.zoomUrl}`;
}

/** Google Calendar - otevře v prohlížeči formulář s předplněnou událostí */
export function googleCalendarUrl(t: TerminView): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: eventTitle(),
    dates: `${t.dateUTCStart}/${t.dateUTCEnd}`,
    details: eventDescription(t),
    location: eventLocation(t),
    ctz: WORKSHOP.timeZone,
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
}

/** Outlook Web deeplink */
export function outlookCalendarUrl(t: TerminView): string {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: eventTitle(),
    body: eventDescription(t),
    startdt: t.dateOutlookStart,
    enddt: t.dateOutlookEnd,
    location: eventLocation(t),
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Obsah .ics souboru (RFC 5545) pro Apple Calendar, Outlook Desktop a další.
 * https://datatracker.ietf.org/doc/html/rfc5545
 */
export function buildIcsFileContent(t: TerminView): string {
  const escape = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

  // UID je jedinečné na termín - kalendáře tak nepřepíšou jinou událost
  const uid = `workshop-${t.id}-${t.dateISORaw}@coachville.eu`;
  const dtstamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CoachVille Europe//Workshop//CS",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${t.dateUTCStart}`,
    `DTEND:${t.dateUTCEnd}`,
    `SUMMARY:${escape(eventTitle())}`,
    `DESCRIPTION:${escape(eventDescription(t))}`,
    `LOCATION:${escape(eventLocation(t))}`,
    `URL:${t.zoomUrl}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escape(`Workshop koučování za 1 hodinu - připravte se a otevřete Zoom v ${t.joinTime}`)}`,
    "TRIGGER:-PT1H",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Data URL pro stažení .ics - funguje bez server endpointu */
export function icsDataUrl(t: TerminView): string {
  const content = buildIcsFileContent(t);
  if (typeof window !== "undefined") {
    const bytes = new TextEncoder().encode(content);
    const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
    return `data:text/calendar;charset=utf-8;base64,${btoa(binary)}`;
  }
  const base64 = Buffer.from(content, "utf-8").toString("base64");
  return `data:text/calendar;charset=utf-8;base64,${base64}`;
}
