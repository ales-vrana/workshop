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
 * ━━━ ŠTÍTEK „POSLEDNÍ MÍSTA" ━━━
 *
 * Každý termín má řádek   posledniMista: "ANO"   nebo   posledniMista: "NE".
 * Při "ANO" se u termínu zobrazí štítek „Poslední místa" (v kartě termínu
 * nahoře a v seznamu termínů v úvodu stránky). Při "NE" se nezobrazí nic.
 * Pište velkými písmeny a v uvozovkách, přesně "ANO" nebo "NE".
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

  /** Stripe Payment Link (u lekce zdarma se nepoužívá, nechte jak je) */
  paymentLink: string;

  /**
   * Štítek „Poslední místa": "ANO" = zobrazit, "NE" = nezobrazit.
   * Nepovinné - když řádek chybí, bere se jako "NE".
   */
  posledniMista?: "ANO" | "NE";

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
    id: "termin-2",
    dateISO: "2026-10-30",
    dayOfWeek: "pátek",
    startTime: "12:00",
    durationMinutes: 90,
    paymentLink: "https://buy.stripe.com/dRm8wOcDuaGr9yu4RjejK2v",
    posledniMista: "NE",
  },
  {
    id: "termin-3",
    dateISO: "2026-11-01",
    dayOfWeek: "Neděle",
    startTime: "19:30",
    durationMinutes: 90,
    paymentLink: "https://buy.stripe.com/5kQ14mavm3dZ4ea4RjejK2u",
    posledniMista: "NE",
  },
  {
    id: "termin-1",
    dateISO: "2026-10-25",
    dayOfWeek: "neděle",
    startTime: "19:00",
    durationMinutes: 90,
    paymentLink: "https://buy.stripe.com/fZu00i0UMbKvdOKerTejK2y",
    posledniMista: "NE",
  },
];
