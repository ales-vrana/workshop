import type { Metadata } from "next";
import { DekujemeObsah } from "@/components/DekujemeObsah";
import { nejblizsiTermin, WORKSHOP } from "@/lib/config";

/**
 * Záložní thank-you stránka bez uvedeného termínu.
 *
 * Ukazuje NEJBLIŽŠÍ termín. Slouží starým Stripe odkazům a e-mailům,
 * které ještě míří na /dekujeme bez identifikátoru.
 *
 * Nové Payment Links směrujte vždy na /dekujeme/<id termínu>,
 * aby účastník viděl údaje ke svému datu.
 *
 * revalidate = po hodině se stránka na serveru přegeneruje, takže
 * „nejbližší termín" nezůstane zamrzlý na starém datu.
 */
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const termin = nejblizsiTermin();
  return {
    title: "Děkujeme - vaše místo na workshop je rezervováno | CoachVille",
    description: `Platba potvrzena. Vidíme se ${termin.dateFullLocative} na workshopu „${WORKSHOP.name}". Uložte si termín do kalendáře a najdete tu i Zoom odkaz.`,
    robots: { index: false, follow: false },
  };
}

export default function ThankYouFallbackPage() {
  return <DekujemeObsah termin={nejblizsiTermin()} />;
}
