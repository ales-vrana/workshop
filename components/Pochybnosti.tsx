import { Section } from "@/components/ui/Section";

const SITUACE = [
  {
    num: "1",
    headline: '„Práce mi dává míň, než mi bere."',
    body: (
      <>
        Možná ti to v posledních měsících přijde čím dál víc. Ten pocit, že trávíš dny děláním věcí,
        které ti nedávají smysl. A přemýšlíš — co s tím?
        <br /><br />
        Koučování je profese postavená na <strong>lidském kontaktu</strong>. Tady AI ani algoritmy
        nepomůžou. Workshop ti ukáže, jestli je tohle směr, kterým se chceš vydat.
      </>
    ),
    highlight:
      "Co konkrétně na workshopu: První 20minutová koučovací zkušenost ti řekne víc o tvých přirozených předpokladech, než ti řekne pohovor s kariérním poradcem.",
  },
  {
    num: "2",
    headline: '„Lidi mi často přijdou pro radu. A baví mě to."',
    body: (
      <>
        Možná jsi v práci nebo v okruhu přátel ten/ta, kdo umí naslouchat. Lidi ti přicházejí
        s problémy, ty jim pomáháš najít řešení. A užíváš si to.
        <br /><br />
        Tohle není náhoda. Je to dovednost, kterou koučování formálně rozvíjí. Workshop ti ukáže,
        jaký rozdíl je mezi <em>„dávat rady"</em> a <em>„koučovat"</em> — a co tě baví víc.
      </>
    ),
    highlight:
      "Co konkrétně: V druhé hodině si vyzkoušíš koučovat reálného člověka. Žádné modelové situace. Reálný rozhovor, reálná zpětná vazba.",
  },
  {
    num: "3",
    headline: '„Chci porozumět tomu, jak koučování funguje."',
    body: (
      <>
        Většina lidí má o koučování pouze knihy, podcasty, příběhy z YouTube. To je{" "}
        <em>přečtené koučování</em>. Není to <em>zažité koučování</em>.
        <br /><br />
        Rozdíl je obrovský — jako rozdíl mezi přečtením kuchařky a vlastním vařením. Workshop je
        tvoje první vlastní příprava jídla.
      </>
    ),
    highlight:
      "Co konkrétně: Uvidíš živou ukázku koučování s držitelem nejvyšší ICF MCC certifikace. Co vidíš v knihách jako „ideál", uvidíš v praxi.",
  },
  {
    num: "4",
    headline: '„Chci se naučit lépe vést tým, partnera, sebe."',
    body: (
      <>
        Koučovací dovednosti nejsou jen pro profesionální kouče. Jsou pro každého, kdo chce lépe
        rozumět druhým — i sám sobě. Manažeři, rodiče, partneři, učitelé. Tyhle dovednosti změní
        každý rozhovor, který povedeš.
        <br /><br />
        Workshop ti dá konkrétní nástroje, které <strong>můžeš použít už druhý den</strong> v práci nebo doma.
      </>
    ),
    highlight:
      'Co konkrétně: PDF „5 koučovacích otázek, které můžeš použít hned zítra" je součástí workshopu. Jednoduché otázky, které vedou hlubší rozhovor.',
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
