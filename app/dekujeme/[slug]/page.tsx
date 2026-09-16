import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DekujemeObsah } from "@/components/DekujemeObsah";
import { VSECHNY_TERMINY, najdiTermin, WORKSHOP } from "@/lib/config";

/**
 * Thank-you stránka konkrétního termínu.
 *
 * Adresa: /dekujeme/<id termínu>, například /dekujeme/termin-1
 * Tuhle adresu vkládáte ve Stripe do „After payment → Redirect".
 *
 * Stránky se generují ze seznamu v lib/workshop-terminy.ts.
 * Neznámé id vrací 404, aby nikdo neviděl prázdnou stránku bez údajů.
 */

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return VSECHNY_TERMINY.map((t) => ({ slug: t.id }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const termin = najdiTermin(params.slug);

  if (!termin) {
    return {
      title: "Stránka nenalezena | CoachVille",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Děkujeme - místo na ${termin.dateShort} je rezervováno | CoachVille`,
    description: `Platba potvrzena. Vidíme se ${termin.dateFullLocative} v ${termin.timeStart} na workshopu „${WORKSHOP.name}". Uvnitř najdete Zoom odkaz i přidání do kalendáře.`,
    robots: { index: false, follow: false },
  };
}

export default function ThankYouTerminPage({ params }: { params: Params }) {
  const termin = najdiTermin(params.slug);

  if (!termin) notFound();

  return <DekujemeObsah termin={termin} />;
}
