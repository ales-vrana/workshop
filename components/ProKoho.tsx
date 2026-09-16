import { Section } from "@/components/ui/Section";
import { Briefcase, Users, Compass, Target } from "lucide-react";

const PROFILY = [
  {
    icon: Briefcase,
    title: "Manažeři, lídři a lidé z HR",
    sub: "Chceš lépe vést rozhovory a rozvíjet samostatnost lidí.",
  },
  {
    icon: Target,
    title: "Zájemci o profesi kouče",
    sub: "Zvažuješ koučovací praxi nebo profesní plán B.",
  },
  {
    icon: Users,
    title: "Živnostníci a další profesionálové",
    sub: "Pracuješ s lidmi a chceš rozšířit svůj způsob vedení rozhovorů.",
  },
  {
    icon: Compass,
    title: "Absolventi koučovacího výcviku",
    sub: "Chceš poznat přístup CoachVille pro své další vzdělávání.",
  },
];

export function ProKoho() {
  return (
    <Section id="pro-koho" tone="white">
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <p className="h-label mb-3">Pro koho je ukázková lekce</p>
        <h2 className="h-display text-h2 text-navy-600">
          Koučování můžeš využít různými směry
        </h2>
      </div>

      <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {PROFILY.map((p, idx) => {
          const Icon = p.icon;
          return (
            <article
              key={idx}
              className="flex items-start gap-4 p-5 sm:p-6 bg-cream rounded-2xl border border-navy-100/40 transition-all hover:bg-white hover:shadow-soft hover:border-teal-400/30"
            >
              <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-teal-400/15 text-teal-500">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="font-semibold text-navy-700 text-base sm:text-lg leading-tight mb-1">
                  {p.title}
                </p>
                <p className="text-sm text-dark/65 leading-relaxed">{p.sub}</p>
              </div>
            </article>
          );
        })}
      </div>

      <p className="text-center text-base sm:text-lg text-navy-700 mt-10 max-w-2xl mx-auto font-medium">
        Nemusíš mít rozhodnuto, kterým směrem půjdeš.
      </p>
    </Section>
  );
}
