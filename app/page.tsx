import { Hero } from "@/components/Hero";
import { ReferenceLekce } from "@/components/ReferenceLekce";
import { PoznavateSe } from "@/components/PoznavateSe";
import { ProcKoucovani } from "@/components/ProcKoucovani";
import { SCimOdejdete } from "@/components/SCimOdejdete";
import { NemuzesToPokazit } from "@/components/NemuzesToPokazit";
import { Zkusenosti } from "@/components/Zkusenosti";
import { ProcPraxi } from "@/components/ProcPraxi";
import { DveHodiny } from "@/components/DveHodiny";
import { OLektorovi } from "@/components/OLektorovi";
import { StudentiVycviku } from "@/components/StudentiVycviku";
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
 * Pořadí sekcí 11/2026 (problem aware akviziční publikum, úhel „Lidé za vámi
 * chodí pro radu" z WON analýz ACC+PCC): zrcadlo situace → proč koučování →
 * s čím odejdete → důkaz z lekce → bezpečí → jak to probíhá → jak učíme →
 * videoreference → lektor → reference z výcviku → termíny → FAQ → závěr.
 */
export const revalidate = 3600;

export default function HomePage() {
  return (
    <main>
      {/* Hero - bez Reveal, je nad foldem */}
      <Hero />

      {/* Poznáváte se? - hned pod hero, problem aware člověk se tu pozná */}
      <PoznavateSe />

      {/* Most: proč je koučování odpověď na to, co člověk cítí */}
      <Reveal>
        <ProcKoucovani />
      </Reveal>

      <Reveal>
        <SCimOdejdete />
      </Reveal>

      {/* Reference z lekce - důkaz hned za tím, co si člověk odnese */}
      <ReferenceLekce />

      {/* Bezpečí: pochybnost o sobě je nejčastější brzda */}
      <Reveal>
        <NemuzesToPokazit />
      </Reveal>

      <Reveal>
        <DveHodiny />
      </Reveal>
      <Reveal>
        <ProcPraxi />
      </Reveal>

      {/* Videoreference */}
      <Reveal>
        <Zkusenosti />
      </Reveal>

      <Reveal>
        <OLektorovi />
      </Reveal>

      {/* Reference z výcviku - až za lektorem, mluví o kroku po lekci */}
      <Reveal>
        <StudentiVycviku />
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
