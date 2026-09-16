import { Section } from "@/components/ui/Section";

const SITUACE = [
  {
    num: "1",
    headline: "Vedeš tým a nechceš mít všechna řešení",
    body: (
      <>
        Lidé za tebou přicházejí s problémy. Chceš podpořit jejich samostatnost a cítit se jistěji
        při vedení rozhovorů.
      </>
    ),
    highlight:
      "Vyzkoušíš si otázky, které druhému dávají prostor promyslet vlastní řešení.",
  },
  {
    num: "2",
    headline: "Chceš naslouchat a lépe rozumět druhým",
    body: (
      <>
        Napadne tě řešení a nabídneš radu. Někdy ale chceš nejprve lépe porozumět tomu, co druhý
        člověk potřebuje.
      </>
    ),
    highlight:
      "Zažiješ rozdíl mezi poskytováním rad a koučovacím rozhovorem.",
  },
  {
    num: "3",
    headline: "Zvažuješ vlastní koučovací praxi",
    body: (
      <>
        Koučování tě láká jako budoucí profese nebo plán B. Chceš poznat roli kouče před
        rozhodnutím o výcviku.
      </>
    ),
    highlight:
      "Poznáš koučování z obou stran a uděláš si konkrétnější představu o výuce v CoachVille.",
  },
  {
    num: "4",
    headline: "Koučování tě zajímá, ale zatím si nevěříš",
    body: (
      <>
        Nemusíš předem vědět, jak vést koučovací rozhovor. Přicházíš se učit, ne předvést výkon.
      </>
    ),
    highlight:
      "Dostaneš jednoduchý postup a otázky, o které se můžeš opřít.",
  },
];

export function Pochybnosti() {
  return (
    <Section id="situace" tone="white">
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <h2 className="h-section text-h2 text-navy-600 mb-4">
          Chceš s lidmi lépe mluvit a lépe jim rozumět?
        </h2>
        <p className="text-base sm:text-lg text-dark/70">
          Možná chceš lépe vést tým, jistěji zvládat pracovní rozhovory nebo poznat koučování jako
          budoucí profesi. Na lekci můžeš začít vlastní zkušeností.
        </p>
      </div>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
        {SITUACE.map((item) => (
          <article key={item.num} className="card flex flex-col">
            <div className="flex items-center gap-4 mb-5">
              <div className="num-badge">#{item.num}</div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-navy-600 mb-4 leading-snug text-balance">
              {item.headline}
            </h3>
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
