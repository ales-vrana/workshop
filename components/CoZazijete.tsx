import { Section } from "@/components/ui/Section";
import { Eye, UserCheck, Heart, Sparkles, Map, Wrench } from "lucide-react";

const KARTY = [
  {
    icon: Eye,
    headline: "Uvidíš koučování v praxi",
    body: "Aleš předvede živý koučovací rozhovor. Budeš sledovat práci s otázkami a nasloucháním i rozdíl mezi koučováním a poskytováním rad.",
  },
  {
    icon: UserCheck,
    headline: "Vyzkoušíš si roli kouče",
    body: "Dostaneš jednoduchý postup a konkrétní otázky. Ve dvojici s dalším účastníkem si vyzkoušíš, jak podpořit člověka v hledání vlastního řešení.",
  },
  {
    icon: Heart,
    headline: "Zažiješ rozhovor jako klient",
    body: "Další účastník tě bude koučovat na téma, které si vybereš. Poznáš, jak na tebe působí otázky a prostor pro přemýšlení z druhé strany rozhovoru.",
  },
  {
    icon: Sparkles,
    headline: "Přineseš si vlastní téma",
    body: "Můžeš pracovat s běžnou situací z práce nebo života. Téma si volíš ty a nemusíš otevírat nic citlivého ani osobního.",
  },
  {
    icon: Map,
    headline: "Poznáš způsob učení v CoachVille",
    body: "Zažiješ vedenou praxi. Získáš konkrétnější představu, zda ti náš způsob výuky sedí a co se chceš dál učit.",
  },
  {
    icon: Wrench,
    headline: "Odneseš si otázky pro další praxi",
    body: "Dostaneš PDF s pěti koučovacími otázkami. Můžeš se k nim vracet a dál procvičovat způsob vedení rozhovoru, který si na lekci vyzkoušíš.",
  },
];

export function CoZazijete() {
  return (
    <Section id="co-zazijete" tone="white">
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <p className="h-label mb-3">Co tě čeká</p>
        <h2 className="h-display text-h2 text-navy-600">
          Co během lekce zažiješ
        </h2>
      </div>

      <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {KARTY.map((karta, idx) => {
          const Icon = karta.icon;
          return (
            <article
              key={idx}
              className="card group relative overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 hover:border-teal-400/40"
            >
              <div className="relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-teal-400/15 text-teal-500 group-hover:bg-teal-400 group-hover:text-white transition-colors">
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-bold uppercase tracking-wide text-navy-600 mb-3 leading-tight">
                  {karta.headline}
                </h3>
                <p className="text-sm sm:text-base text-dark/75 leading-relaxed">{karta.body}</p>
              </div>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
