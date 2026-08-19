import { Section } from "@/components/ui/Section";

const SITUACE = [
  {
    num: "1",
    headline: "Uvažuješ o změně práce nebo podnikání",
    body: (
      <>
        Možná to zvažuješ už dlouho. Práci věnuješ každý rok <strong>2 000 hodin</strong> svého času.
        Je to pro tebe investice s dobrou emoční i finanční návratností? Nebo ti práce bere víc, než dává?
        <br /><br />
        Na tomto workshopu můžeš objevit novou cestu. Nemusíš udělat skok. Můžeš získávat platící
        klienty i při současné práci. Vybuduješ si tak svůj <strong>Plán B</strong>.
      </>
    ),
    highlight:
      "Co konkrétně na tomto workshopu: Uděláš si vlastní zkušenost a ověříš si, jestli je koučování směr, kterým chceš jít dál.",
  },
  {
    num: "2",
    headline: "Rád/a lidem nasloucháš",
    body: (
      <>
        Možná jsi v práci nebo v okruhu přátel ten/ta, kdo umí naslouchat. Nemusíš být extrovert,
        abys byl/a dobrým koučem. <strong>Naslouchání je základem.</strong>
        <br /><br />
        V přátelské konverzaci si lidé dávají vzájemně rady. Ty však fungují zřídkakdy. Kouči lidem
        neradí. Díky koučovacím metodám a dovednostem můžeš své naslouchání rozšířit o účinné
        postupy, které přinášejí lidem výsledky.
      </>
    ),
    highlight:
      "Co konkrétně: V druhé hodině si vyzkoušíš koučovat člověka. Použiješ první metodické otázky a poznáš, jak moc se liší koučovací konverzace od přátelské konverzace.",
  },
  {
    num: "3",
    headline: "Chci pochopit mechaniku získávání klientů",
    body: (
      <>
        Platící klienti jsou základem prosperující praxe. Kouči však nic nevnucují. Mají{" "}
        <strong>etický způsob, jak budovat vztahy</strong>. Když si s tebou někdo vyzkouší koučovací
        setkání, může se sám rozhodnout, jestli chce ve spolupráci pokračovat, nebo ne.
      </>
    ),
    highlight:
      "Co konkrétně: Ukážeme si, jak systém CoachVille pomáhá koučům budovat koučovací praxi. Nejsou to náhody — jsou to postupy, díky kterým i ty můžeš získávat klienty, aniž bys musel/a být obchodníkem nebo se vnucovat.",
  },
  {
    num: "4",
    headline: "Transformace: Konec náročnosti i přetížení",
    body: (
      <>
        Koučovací metody a dovednosti nejsou jen pro profesionální kouče. Jsou pro každého, kdo chce
        lépe rozumět druhým — i sám sobě. Pro každého, kdo se chce rozvíjet.
        <br /><br />
        Pokud prožíváš náročné období, období změny nebo vysokého pracovního vytížení — zjistíš, jak
        ti koučování může pomoct. Představ si, že účastí ve výcviku nebudeš dostávat další domácí
        úkoly a zvyšovat své přetížení. <strong>Naopak.</strong> V tréninku jsi pravidelně koučovaný
        a díky tomu se můžeš zaměřit na to, co je pro tebe náročné a obtížné.
      </>
    ),
    highlight:
      "Workshop ti dá zkušenost, že učení může být zábavné, interaktivní a současně hluboké.",
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
