import { Section } from "@/components/ui/Section";

const SITUACE = [
  {
    num: "1",
    headline: "Zvažuješ změnu, ale nechceš rozhodovat naslepo",
    body: (
      <>
        Koučování tě přitahuje jako možná nová cesta, ale zatím nevíš, jak se v roli kouče budeš
        skutečně cítit.
      </>
    ),
    highlight:
      "Na workshopu si to ověříš bez velkého rozhodnutí a bez závazku pokračovat.",
  },
  {
    num: "2",
    headline: "Rád/a lidem nasloucháš, ale rady často nefungují",
    body: (
      <>
        Možná za tebou lidé chodí, když něco řeší.
      </>
    ),
    highlight:
      "Na workshopu poznáš rozdíl mezi radou, běžným rozhovorem a koučovací konverzací.",
  },
  {
    num: "3",
    headline: "Vedeš lidi a chceš, aby více přemýšleli sami",
    body: (
      <>
        Chceš klást lepší otázky, rozvíjet samostatnost lidí a nemuset pokaždé přinášet všechna
        řešení.
      </>
    ),
    highlight:
      "Vyzkoušíš si základ rozhovoru, který můžeš použít v práci.",
  },
  {
    num: "4",
    headline: "Koučování tě zajímá, ale nejsi si jistý/á, zda bys to zvládl/a",
    body: (
      <>
        Nemusíš mít talent ani zkušenosti.
      </>
    ),
    highlight:
      "Dostaneš jednoduchý postup a zjistíš, jak se učíš přímo v praxi.",
  },
];

export function Pochybnosti() {
  return (
    <Section id="situace" tone="white">
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <p className="h-label mb-3">Pro koho je to</p>
        <h2 className="h-display text-h2 text-navy-600 mb-4">
          Možná to znáš
        </h2>
        <p className="text-base sm:text-lg text-dark/70">
          Tyhle čtyři situace popisují, jak většina lidí přichází ke koučování.
          Pokud aspoň v jedné poznáváš sebe, workshop je pro tebe.
        </p>
      </div>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
        {SITUACE.map((item) => (
          <article key={item.num} className="card flex flex-col">
            <div className="flex items-center gap-4 mb-5">
              <div className="num-badge">#{item.num}</div>
            </div>
            <h3 className="text-h3 font-bold text-navy-600 mb-4 leading-snug">{item.headline}</h3>
            <div className="text-base text-dark/80 leading-relaxed mb-5">{item.body}</div>
            <div className="highlight-box mt-auto">
              <p className="text-dark"><strong>{item.highlight}</strong></p>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
