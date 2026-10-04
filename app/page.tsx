import { Hero } from "@/components/Hero";
import { PoznavateSe } from "@/components/PoznavateSe";
import { SCimOdejdete } from "@/components/SCimOdejdete";
import { NemuzesToPokazit } from "@/components/NemuzesToPokazit";
import { Reference } from "@/components/Reference";
import { Zkusenosti } from "@/components/Zkusenosti";
import { ProcPraxi } from "@/components/ProcPraxi";
import { DveHodiny } from "@/components/DveHodiny";
import { OLektorovi } from "@/components/OLektorovi";
import { Terminy } from "@/components/Terminy";
import { FAQ } from "@/components/FAQ";
import { ClosingCTA } from "@/components/ClosingCTA";
import { StickyCTA } from "@/components/StickyCTA";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Stránka se na serveru přegeneruje každou hodinu, aby termíny, které
 * proběhly, zmizely i z HTML v cache. Filtrování navíc běží i v prohlížeči
 * (komponenta Terminy), takže návštěvník nikdy neuvidí starý termín.
 *
 * Pořadí sekcí podle schválené textace pro J1, J2 a J4 (4. 10. 2026):
 * zrcadlo situace → s čím odejdete → bezpečí → důkaz → přesvědčení →
 * jak to probíhá → lektor → termín a cena → FAQ → závěr.
 */
export const revalidate = 3600;

export default function HomePage() {
  return (
    <main>
      {/* Hero - bez Reveal, je nad foldem */}
      <Hero />

      {/* Poznáváte se? - tři situace, kvůli nim člověk pozná, že je tu správně */}
      <PoznavateSe />

      <Reveal>
        <SCimOdejdete />
      </Reveal>

      {/* Bezpečí nahoře: pochybnost o sobě je nejčastější brzda */}
      <Reveal>
        <NemuzesToPokazit />
      </Reveal>

      {/* Sociální důkaz: textové citace, pak videoreference */}
      <Reveal>
        <Reference />
      </Reveal>
      <Reveal>
        <Zkusenosti />
      </Reveal>

      <Reveal>
        <ProcPraxi />
      </Reveal>
      <Reveal>
        <DveHodiny />
      </Reveal>
      <Reveal>
        <OLektorovi />
      </Reveal>

      {/* Termíny až tady - stránka je nejdřív o něm, pak o nákupu.
          Všechna tlačítka a sticky lišta sem vedou kotvou #terminy. */}
      <Terminy />

      <Reveal>
        <FAQ />
      </Reveal>
      <Reveal>
        <ClosingCTA />
      </Reveal>
      <Footer />
      <StickyCTA />
    </main>
  );
}
