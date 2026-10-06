import { Section } from "@/components/ui/Section";
import { HeroReference } from "@/components/HeroReference";

/**
 * Původní karusel 25 referencí z výcviku, přesunutý z hero níž na stránku.
 *
 * Nahoře na stránce jsou teď reference z ukázkové lekce (to je to, co si
 * návštěvník kupuje). Tyhle mluví o výcviku, tedy o kroku, který teprve
 * může následovat - proto patří až za lektora.
 */
export function StudentiVycviku() {
  return (
    <Section id="studenti-vycviku" tone="navy" className="!bg-navy-900">
      <div className="max-w-2xl mx-auto text-center mb-8 sm:mb-10">
        <p className="h-label text-gold-400 mb-3">Po lekci</p>
        <h2 className="h-section text-h2 text-white">
          A co říkají ti, kdo pokračovali do výcviku
        </h2>
      </div>

      <div className="max-w-xl mx-auto">
        <HeroReference bezStitku />
      </div>
    </Section>
  );
}
