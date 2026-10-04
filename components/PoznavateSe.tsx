import { Section } from "@/components/ui/Section";

/**
 * „Poznáváte se?" - tři situace J1, J2 a J4.
 *
 * Tohle je mechanismus, díky kterému může jedna stránka obsloužit tři různé
 * situace, aniž by hero muselo být obecné: hero nese společnou větu,
 * tady se každý najde ve své. Formulace vycházejí z jazyka kupců
 * (dataset v2, 394 strategií) - popisujeme scénu, nediagnostikujeme čtenáře.
 *
 * Nahrazuje původní sekce „Pro koho" (role) a „Situace".
 */

const SITUACE = [
  {
    title: "Něco skončilo.",
    body: "Práce, projekt, rodičovská, kapitola, která vás držela. Poprvé po letech máte čas - a nechcete ho dát něčemu, co nedává smysl.",
  },
  {
    title: "Práce bere víc, než vrací.",
    body: "Telefon v šest ráno i o víkendu. Večer, kdy už nezbývá nic na vlastní život. Nejde o to vydržet. Jde o to, že takhle to dál nechcete.",
  },
  {
    title: "Navenek je všechno v pořádku.",
    body: "Slušná práce, jistý příjem, žádná krize. Jen tiché vědomí, že takhle dalších deset let nechcete.",
  },
];

export function PoznavateSe() {
  return (
    <Section id="poznavate-se" tone="cream">
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <p className="h-label mb-3">Poznáváte se?</p>
        <h2 className="h-section text-h2 text-navy-600">
          Tři situace, ze kterých k nám lidé chodí nejčastěji
        </h2>
      </div>

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-3 max-w-5xl mx-auto">
        {SITUACE.map((s) => (
          <article
            key={s.title}
            className="flex flex-col bg-white rounded-2xl border border-navy-100/60 shadow-soft p-6 sm:p-7"
          >
            <h3 className="text-lg sm:text-xl font-bold text-navy-600 leading-snug mb-3">
              {s.title}
            </h3>
            <p className="text-base text-dark/75 leading-relaxed">{s.body}</p>
          </article>
        ))}
      </div>

      <p className="text-center text-base sm:text-lg text-navy-700 font-medium mt-8 sm:mt-10 max-w-2xl mx-auto">
        Nemusíte mít rozhodnuto. Přicházíte si to vyzkoušet.
      </p>
    </Section>
  );
}
