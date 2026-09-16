/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║   SPOLEČNÉ PARAMETRY WORKSHOPU                                   ║
 * ║                                                                  ║
 * ║   Termíny (datum, čas, Stripe odkaz) se NEEDITUJÍ zde,           ║
 * ║   ale v souboru lib/workshop-terminy.ts                          ║
 * ║                                                                  ║
 * ║   Zde nastavujete věci, které platí pro všechny termíny:         ║
 * ║   cenu, kapacitu, Zoom, názvy, pixel a kontaktní e-mail.         ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

export const PARAMS = {
  // ━━━ CENA A KAPACITA (platí pro všechny termíny) ━━━

  /** Výchozí cena workshopu v Kč. U konkrétního termínu se dá přebít polem priceCZK. */
  priceCZK: 199,

  /** Maximální kapacita jednoho termínu */
  capacity: 16,

  /**
   * Práh pro zobrazování hlášky „Zbývá X / Y míst".
   * Zobrazí se jen u termínu, kde spotsLeft <= scarcityThreshold.
   * Vyšší počty nezobrazujeme - prázdný workshop nemá čím přesvědčovat.
   */
  scarcityThreshold: 9,

  /**
   * Kolik hodin po skončení workshopu má termín zmizet ze stránky.
   * 3 = termín je vidět ještě tři hodiny po konci, pak se sám skryje.
   */
  hideTerminHoursAfterEnd: 3,

  /** Pokud true, k délce se přidá „+ Q&A" v zobrazovaných textech */
  hasQA: false,

  // ━━━ NÁZVY ━━━

  /** Marketingový název workshopu (na webu, v e-mailech, v pixelu) */
  workshopName: "Zažij koučování v roli kouče i klienta",

  /** Title kalendářové události (Google / Apple / Outlook) */
  calendarEventTitle: "Workshop Zažij koučování v roli kouče i klienta",

  // ━━━ ZOOM (jedna společná místnost pro všechny termíny) ━━━

  /** Odkaz na Zoom místnost */
  zoomUrl: "https://us02web.zoom.us/j/2316373579",

  /** Meeting ID (pro zobrazení na stránce Děkujeme) */
  zoomId: "231 637 3579",

  /** Heslo do meetingu - nechte prázdné (""), pokud meeting heslo nemá */
  zoomPassword: "",

  // ━━━ SBĚR KONTAKTŮ (formulář „Nevyhovuje mi žádný termín") ━━━

  /**
   * Zapier webhook (Webhooks by Zapier → Catch Hook).
   * Sem se pošle jméno, e-mail a telefon zájemce.
   * Prázdný řetězec = formulář se přepne na odeslání e-mailem.
   */
  leadWebhookUrl: "",

  // ━━━ MĚŘICÍ KÓDY ━━━

  /** Meta (Facebook) Pixel ID - prázdný řetězec = pixel se nevloží */
  metaPixelId: "884397061610419",

  // ━━━ TECHNICKÉ KONSTANTY (obvykle neměnit) ━━━

  /** Měna pro Stripe + schema.org */
  currency: "CZK" as const,

  /** Platforma workshopu */
  platform: "Zoom",

  /** Časová zóna pro kalendářové eventy */
  timeZone: "Europe/Prague",
} as const;
