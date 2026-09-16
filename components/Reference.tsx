import { Section } from "@/components/ui/Section";
import { Quote } from "lucide-react";

/**
 * Textové reference účastníků - jeden sloupec, optimalizováno pro čtení
 * na mobilu i na desktopu.
 *
 * Chceš citaci ubrat nebo přidat? Edituj pole REFERENCE níže.
 */

const REFERENCE = [
  {
    text: "Zajímavá pro mě byla zkouška koučování, kdy jsem zjistil, že mám tendence neustále radit. Uvědomil jsem si, že otázky, na které odpovídám „nevím“, nejvíc pomůžou objevit to, co hledám.",
    author: "David Homolka",
  },
  {
    text: "Uvědomil jsem si sílu aktivního poslechu a to, že má snaha pomoct není v radě, ale dát tomu druhému šanci si na to přijít sám.",
    author: "Vít Kučera",
  },
  {
    text: "Nejvíc se mi líbily praktické ukázky, kdy jsme si mohli koučování vyzkoušet ve dvojicích. Líbilo se mi, že Aleš si na nic nehraje, je uvolněný a věrohodný.",
    author: "Petra Věchtová",
  },
];

export function Reference() {
  return (
    <Section id="citace" tone="cream">
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <h2 className="h-section text-h2 text-navy-600">
          Co si lidé odnesli z předchozích workshopů
        </h2>
      </div>

      <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6">
        {REFERENCE.map((r) => (
          <figure
            key={r.author}
            className="relative bg-white rounded-2xl border border-navy-100/50 shadow-soft p-6 sm:p-8"
          >
            <Quote
              className="absolute top-5 right-5 h-8 w-8 sm:h-10 sm:w-10 text-navy-600/10"
              aria-hidden
            />
            <blockquote className="relative text-base sm:text-lg text-dark/85 leading-relaxed">
              „{r.text}“
            </blockquote>
            <figcaption className="mt-4 text-sm sm:text-base font-semibold text-navy-600">
              - {r.author}
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
