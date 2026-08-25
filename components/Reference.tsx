import { Section } from "@/components/ui/Section";
import { Quote } from "lucide-react";

/**
 * Textové reference účastníků — jeden sloupec, optimalizováno pro čtení
 * na mobilu i na desktopu.
 *
 * Chceš citaci ubrat nebo přidat? Edituj pole REFERENCE níže.
 */

const REFERENCE = [
  {
    text: "Mohla jsem si prakticky vyzkoušet krátký koučovací rozhovor a zjistila jsem, že to není takový bubák, jak jsem si myslela. Největším nepřítelem je vlastní pochybnost a vnitřní kritik. Ujasnila jsem si, že to může být moje cesta.",
    author: "Hana Svatošová",
  },
  {
    text: "Potvrdila jsem si, že je to směr, který mě velmi zajímá a kterému se chci profesně věnovat. Vyvrátili jste mi několik předsudků a překážek, které jsem vnímala na cestě k tomu stát se koučem.",
    author: "Veronika Březinová",
  },
  {
    text: "Zajímavá pro mě byla zkouška koučování, kdy jsem zjistil, že mám tendence neustále radit. Uvědomil jsem si, že otázky, na které odpovídám „nevím“, nejvíc pomůžou objevit to, co hledám.",
    author: "David Homolka",
  },
  {
    text: "Možnost vyzkoušet si koučování, kdy je člověk na začátku a najednou zjistí, že je schopný se naladit na vlnu partnera, se kterým si koučování zkouší. Nepopsatelně úžasný zážitek.",
    author: "Lenka Musilová",
  },
  {
    text: "Uvědomila jsem si, že je pro mě náročné vést rozhovor, sledovat klíčová slova a klást otevřené otázky. Už ale vím, na co se mám zaměřit a v čem se zdokonalit. Atmosféra byla příjemná, přátelská.",
    author: "Eva Rosecká",
  },
  {
    text: "Uvědomil jsem si sílu aktivního poslechu a to, že má snaha pomoct není v radě, ale dát tomu druhému šanci si na to přijít sám.",
    author: "Vít Kučera",
  },
  {
    text: "Nejvíce mě bavilo praktické cvičení — ať ukázka koučování, nebo když jsme si sami zkoušeli roli kouče. Workshop mi potvrdil, že role kouče není tak jednoduchá, jak si někdo může myslet.",
    author: "Hana Masaříková",
  },
  {
    text: "Nejvíc se mi líbily praktické ukázky, kdy jsme si mohli koučování vyzkoušet ve dvojicích. Líbilo se mi, že Aleš si na nic nehraje, je uvolněný a věrohodný.",
    author: "Petra Věchtová",
  },
];

export function Reference() {
  return (
    <Section id="reference" tone="cream">
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <h2 className="h-display text-h2 text-navy-600">
          Co řekli účastníci o workshopu?
        </h2>
      </div>

      <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6">
        {REFERENCE.map((r) => (
          <figure
            key={r.author}
            className="relative bg-white rounded-2xl border border-navy-100/50 shadow-soft p-6 sm:p-8"
          >
            <Quote
              className="absolute top-5 right-5 h-8 w-8 sm:h-10 sm:w-10 text-teal-400/15"
              aria-hidden
            />
            <blockquote className="relative text-base sm:text-lg text-dark/85 leading-relaxed">
              „{r.text}“
            </blockquote>
            <figcaption className="mt-4 text-sm sm:text-base font-semibold text-navy-600">
              — {r.author}
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
