/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║   TERMÍNY WORKSHOPU - jediný soubor, který editujete            ║
 * ║                                                                  ║
 * ║   Chcete vypsat nový termín? Přidejte položku do pole TERMINY.   ║
 * ║   Termín, který proběhl, se ze stránky skryje sám (3 h po konci).║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * ━━━ JAK PŘIDAT NOVÝ TERMÍN ━━━
 *
 * 1) Zkopírujte celý blok { ... } a vložte ho na konec pole.
 * 2) Dejte mu NOVÉ id - nikdy nepoužívejte id, které už jednou existovalo.
 *    Id je součástí adresy thank-you stránky, takže staré odkazy
 *    v e-mailech a ve Stripe musí vždy ukazovat na správný termín.
 * 3) Vyplňte datum, den v týdnu, čas a Stripe odkaz.
 * 4) Ve Stripe u daného Payment Linku nastavte
 *    After payment → Redirect na:
 *
 *        https://poznej.coachville.eu/workshop/dekujeme/<id>
 *
 *    Například pro id "termin-1":
 *        https://poznej.coachville.eu/workshop/dekujeme/termin-1
 *
 * ━━━ POZOR NA ID ━━━
 *
 * Id se NEPŘEČÍSLOVÁVÁ. Když termin-1 proběhne, nechte ho v poli
 * (nebo ho smažte), ale nové termíny dostávají termin-4, termin-5 atd.
 * Nikdy nepřiřazujte id "termin-1" jinému datu - jinak by lidé
 * s odkazem na původní termín viděli cizí přihlašovací údaje.
 */

export interface Termin {
  /** Trvalý identifikátor - je součástí adresy /dekujeme/<id>. Nikdy neměnit ani nerecyklovat. */
  id: string;

  /** Datum workshopu ve formátu YYYY-MM-DD */
  dateISO: string;

  /** Český název dne v týdnu (malými písmeny) */
  dayOfWeek: string;

  /** Čas začátku ve formátu HH:MM (24h) */
  startTime: string;

  /** Délka v minutách */
  durationMinutes: number;

  /** Stripe Payment Link pro tento konkrétní termín */
  paymentLink: string;

  /** Cena v Kč. Nepovinné - když chybí, použije se výchozí cena z workshop-params.ts */
  priceCZK?: number;

  /** Volná místa. Nepovinné - když chybí, bere se kapacita (tedy plný počet). */
  spotsLeft?: number;

  /**
   * Vlastní Zoom pro tento termín. Nepovinné.
   * Když chybí, použije se společná místnost z workshop-params.ts.
   */
  zoomUrl?: string;
  zoomId?: string;
  zoomPassword?: string;
}

export const TERMINY: Termin[] = [
  {
    id: "termin-1",
    dateISO: "2026-10-11",
    dayOfWeek: "neděle",
    startTime: "18:00",
    durationMinutes: 120,
    paymentLink: "https://buy.stripe.com/fZu00i0UMbKvdOKerTejK2y",
  },
  {
    id: "termin-2",
    dateISO: "2026-10-01",
    dayOfWeek: "čtvrtek",
    startTime: "19:00",
    durationMinutes: 120,
    paymentLink: "https://buy.stripe.com/dRm8wOcDuaGr9yu4RjejK2v",
  },
  {
    id: "termin-3",
    dateISO: "2026-09-27",
    dayOfWeek: "neděle",
    startTime: "19:00",
    durationMinutes: 120,
    paymentLink: "https://buy.stripe.com/5kQ14mavm3dZ4ea4RjejK2u",
  },
];
