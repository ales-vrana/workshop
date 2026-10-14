/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  REGISTRACE NA UKÁZKOVOU LEKCI ZDARMA                            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Sem vložte adresu z Zapieru:
 *   Zapier → Create Zap → trigger „Webhooks by Zapier" → „Catch Hook"
 *   → zkopírujte „Your webhook URL" (začíná https://hooks.zapier.com/…)
 *
 * Jeden webhook slouží pro všechny termíny. Který termín si člověk vybral,
 * posílá formulář jako pole „termin_datum", takže při přidání nového
 * termínu v lib/workshop-terminy.ts se v Zapieru nic měnit nemusí.
 *
 * Dokud je adresa prázdná, formulář nic neztratí: otevře návštěvníkovi
 * e-mail s vyplněnými údaji adresovaný na kontaktní e-mail workshopu.
 */
export const REGISTRACE_WEBHOOK_URL = "";
