import { Quote } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { COACH } from "@/lib/config";

export function CoachQuote() {
  return (
    <Section tone="cream">
      <div className="max-w-3xl mx-auto">
        <div className="grid sm:grid-cols-[auto,1fr] gap-6 sm:gap-8 items-start">
          <div className="flex justify-center sm:justify-start">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-4 ring-white shadow-lifted bg-navy-100">
              <img
                src="/workshop/ales-vrana.jpg"
                alt={`Portrét: ${COACH.fullName}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
          <div>
            <Quote className="h-8 w-8 text-gold-500 mb-3" aria-hidden />
            <blockquote className="text-lg sm:text-xl text-dark leading-relaxed">
              <p>
                <span className="font-semibold">
                  Toto setkání je pro tebe, pokud tě zajímá rozvoj a chceš se rozvíjet.
                </span>{" "}
                Odneseš si uvědomění o sobě, která ti otevře nové obzory. Pokud tě někdy zajímalo,
                jak vypadá koučování v praxi, zvažuješ další kariérní krok, nebo jsi v roli
                manažera a chceš posun - jsi tu správně, rezervuj si svůj termín.
              </p>
            </blockquote>
            <footer className="mt-4 text-sm sm:text-base text-navy-700 font-semibold">
              - {COACH.fullName}
            </footer>
          </div>
        </div>
      </div>
    </Section>
  );
}
