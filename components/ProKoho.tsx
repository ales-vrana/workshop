import { Section } from "@/components/ui/Section";
import { Briefcase, Users, Compass, HeartHandshake, Rocket, Bot } from "lucide-react";

const PROFILY = [
  {
    icon: Briefcase,
    title: "Manažeři, lídři, HR profesionálové",
    sub: "kteří chtějí lépe vést — sebe i druhé",
  },
  {
    icon: Users,
    title: "Lidé, kteří se o koučování zajímají",
    sub: "ale nikdy ho neviděli v praxi zblízka",
  },
  {
    icon: Compass,
    title: "Lidé na kariérní křižovatce",
    sub: "kteří hledají směr s lidským kontaktem",
  },
  {
    icon: HeartHandshake,
    title: "Terapeuti, lektoři, mentoři",
    sub: "kteří chtějí rozšířit svoje nástroje o koučování",
  },
  {
    icon: Rocket,
    title: "Podnikatelé hledající druhý směr",
    sub: "kteří chtějí budovat příjem ze smysluplné práce",
  },
  {
    icon: Bot,
    title: "Profesionálové v oborech, které proměňuje AI",
    sub: "kteří chtějí budovat na tom, co AI nenahradí — hluboké lidské porozumění",
  },
];

export function ProKoho() {
  return (
    <Section id="pro-koho" tone="white">
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <p className="h-label mb-3">Pro koho je workshop</p>
        <h2 className="h-display text-h2 text-navy-600">
          Workshop je pro tebe, pokud jsi
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

      <p className="text-center text-sm text-dark/55 mt-8 italic max-w-xl mx-auto">
        Pokud nic z toho nesedí — workshop pravděpodobně není pro tebe. To je v pořádku.
      </p>
    </Section>
  );
}
