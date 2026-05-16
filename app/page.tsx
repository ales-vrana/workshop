import { Hero } from "@/components/Hero";
import { CoachQuote } from "@/components/CoachQuote";
import { Pochybnosti } from "@/components/Pochybnosti";
import { ProKoho } from "@/components/ProKoho";
import { CoZazijete } from "@/components/CoZazijete";
import { OLektorovi } from "@/components/OLektorovi";
import { Zkusenosti } from "@/components/Zkusenosti";
import { FAQ } from "@/components/FAQ";
import { ClosingCTA } from "@/components/ClosingCTA";
import { StickyCTA } from "@/components/StickyCTA";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/ui/Reveal";

export default function HomePage() {
  return (
    <main>
      {/* Hero — bez Reveal, je nad foldem */}
      <Hero />

      {/* Ostatní sekce dostávají scroll-triggered fade-in */}
      <Reveal>
        <CoachQuote />
      </Reveal>
      <Reveal>
        <Pochybnosti />
      </Reveal>
      <Reveal>
        <ProKoho />
      </Reveal>
      <Reveal>
        <CoZazijete />
      </Reveal>
      <Reveal>
        <OLektorovi />
      </Reveal>
      <Reveal>
        <Zkusenosti />
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
