/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║   JEDINÝ SOUBOR PRO ZMĚNU PARAMETRŮ WORKSHOPU                    ║
 * ║                                                                  ║
 * ║   ⚡ Pokud chceš změnit datum / čas / délku / cenu workshopu,     ║
 * ║      uprav jen hodnoty v tomto souboru.                          ║
 * ║      Všechny ostatní soubory si je vezmou automaticky.           ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Formáty:
 *   - dateISO:        "YYYY-MM-DD" (např. "2026-06-02")
 *   - startTime:      "HH:MM" 24h formát (např. "17:00")
 *   - durationMinutes: celé minuty (např. 120 pro 2 hodiny)
 *   - hasQA:          true/false — pokud true, k délce se přidá "+ Q&A"
 *   - priceCZK:       číslo bez Kč (např. 599)
 *   - capacity:       max počet účastníků (např. 16)
 *   - spotsLeft:      momentální volná místa (manuální, např. 16)
 *   - dayOfWeek:      český název dne (např. "úterý", "pátek")
 *
 * Vše ostatní (formátování, výpočty časů konce, NBSP v ceně, atd.)
 * je odvozené automaticky v lib/config.ts.
 */

export const PARAMS = {
  // ━━━ ZÁKLADNÍ PARAMETRY ━━━

  /** Datum workshopu — formát YYYY-MM-DD */
  dateISO: "2026-09-01",

  /** Český název dne v týdnu (malými písmeny) */
  dayOfWeek: "úterý",

  /** Čas začátku workshopu — formát HH:MM (24h) */
  startTime: "19:30",

  /** Délka workshopu v minutách */
  durationMinutes: 120,

  /** Pokud true, k délce se přidá "+ Q&A" v zobrazovaných textech */
  hasQA: false,

  /** Cena workshopu v CZK (jen číslo, bez Kč) */
  priceCZK: 300,

  /** Maximální kapacita workshopu */
  capacity: 16,

  /** Momentální volná místa — manuálně upravuj */
  spotsLeft: 16,

  /**
   * Práh pro zobrazování scarcity hlášky „Zbývá X / Y míst".
   * Hláška se zobrazí POUZE pokud `spotsLeft <= scarcityThreshold`.
   * Default 9 = "zbývá 9 a méně" je real scarcity, vše vyšší je marketingový bullshit.
   *
   * Když je workshop plný 16/16 nebo 14/16, raději nic neukazujeme než
   * vzbuzovat dojem, že nikdo o workshop nestojí.
   */
  scarcityThreshold: 9,

  // ━━━ NÁZVY ━━━

  /** Marketingový název workshopu (na webu, emailech) */
  workshopName: "Zažij koučování a začni koučovat už teď",

  /** Title v kalendáři (přidáno do Google/Apple/Outlook) */
  calendarEventTitle: "Workshop Zažij koučování v roli kouče i klienta",

  // ━━━ PLATBA (edituj přímo zde — projeví se na všech CTA tlačítkách) ━━━

  /** Stripe Payment Link — cíl všech tlačítek „Zajisti si své místo" */
  paymentLink: "https://book.stripe.com/9B68wO8ne7uf9yu3NfejK27",

  // ━━━ ZOOM (edituj přímo zde, projeví se na webu i v kalendáři) ━━━

  /** Odkaz na Zoom místnost */
  zoomUrl: "https://us02web.zoom.us/j/2316373579",

  /** Meeting ID (pro zobrazení na stránce Děkujeme) */
  zoomId: "2316373579",

  /** Heslo do meetingu — nech prázdné (""), pokud meeting heslo nemá */
  zoomPassword: "",

  // ━━━ TECHNICKÉ KONSTANTY (obvykle neměnit) ━━━

  /** Měna pro Stripe + schema.org */
  currency: "CZK" as const,

  /** Platforma workshopu */
  platform: "Zoom",

  /** Časová zóna pro kalendářové eventy */
  timeZone: "Europe/Prague",
} as const;
