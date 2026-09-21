import { Hero } from "@/components/Hero";
import { Terminy } from "@/components/Terminy";
import { CoachQuote } from "@/components/CoachQuote";
import { Pochybnosti } from "@/components/Pochybnosti";
import { ProKoho } from "@/components/ProKoho";
import { CoZazijete } from "@/components/CoZazijete";
import { Program } from "@/components/Program";
import { NemuzesToPokazit } from "@/components/NemuzesToPokazit";
import { OLektorovi } from "@/components/OLektorovi";
import { Zkusenosti } from "@/components/Zkusenosti";
import { Reference } from "@/components/Reference";
import { FAQ } from "@/components/FAQ";
import { ClosingCTA } from "@/components/ClosingCTA";
import { StickyCTA } from "@/components/StickyCTA";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Stránka se na serveru přegeneruje každou hodinu, aby termíny, které
 * proběhly, zmizely i z HTML v cache. Filtrování navíc běží i v prohlížeči
 * (komponenta Terminy), takže návštěvník nikdy neuvidí starý termín.
 */
export const revalidate = 3600;

export default function HomePage() {
  return (
    <main>
      {/* Hero - bez Reveal, je nad foldem */}
      <Hero />

      {/* Termíny hned pod hero, ať rozhodovací bod je v 1. obrazovce.
          Bez Reveal: sem vedou hero i sticky CTA, musí být vidět okamžitě. */}
      <Terminy />

      {/* „Co tě čeká" pod termíny - bez Reveal, je blízko foldu */}
      <CoZazijete />

      {/* Ostatní sekce dostávají scroll-triggered fade-in */}
      <Reveal>
        <CoachQuote />
      </Reveal>

      {/* Sociální důkaz před argumentací: textové citace, pak videoreference */}
      <Reveal>
        <Reference />
      </Reveal>
      <Reveal>
        <Zkusenosti />
      </Reveal>

      <Reveal>
        <Pochybnosti />
      </Reveal>
      <Reveal>
        <ProKoho />
      </Reveal>
      <Reveal>
        <Program />
      </Reveal>
      <Reveal>
        <NemuzesToPokazit />
      </Reveal>
      <Reveal>
        <OLektorovi />
      </Reveal>
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
