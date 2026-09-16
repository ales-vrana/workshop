import { Section } from "@/components/ui/Section";
import { Trophy, GraduationCap } from "lucide-react";
import { COACH } from "@/lib/config";

const BADGES = [
  {
    icon: Trophy,
    title: "ICF Master Certified Coach",
    sub: "Držitel nejvyšší mezinárodní certifikace, 14 let praxe v oboru",
  },
  {
    icon: GraduationCap,
    title: "Hlavní trenér CoachVille",
    sub: "Provede tě živou ukázkou i praktickým cvičením, abys poznal/a koučování na vlastní zkušenosti.",
  },
];

export function OLektorovi() {
  return (
    <Section id="lektor" tone="dark">
      <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
        <p className="h-label text-gold-400 mb-3">Lektor</p>
        <h2 className="h-section text-h2 text-white mb-4">
          S kým lekci zažiješ
        </h2>
        <p className="text-base sm:text-lg text-white/70">
          Praktickou ukázkovou lekcí tě provede:
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid sm:grid-cols-[auto,1fr] gap-8 sm:gap-12 items-start">
          <div className="flex flex-col items-center sm:items-start gap-5">
            <div className="relative w-40 h-40 sm:w-52 sm:h-52 lg:w-60 lg:h-60 rounded-2xl overflow-hidden ring-4 ring-white/10 shadow-lifted">
              <img
                src="/workshop/ales-vrana-portrait.jpg"
                alt={`Portrét: ${COACH.fullName}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* ICF MCC odznak - stejný rámeček i velikost jako fotka */}
            <div className="relative w-40 h-40 sm:w-52 sm:h-52 lg:w-60 lg:h-60 rounded-2xl overflow-hidden ring-4 ring-white/10 shadow-lifted bg-white">
              <img
                src="/workshop/icf-mcc-badge.png"
                alt="Odznak ICF Master Certified Coach (MCC) - Credentials & Standards"
                className="absolute inset-0 w-full h-full object-contain p-4"
              />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6">{COACH.fullName}</h3>

            <ul className="space-y-5">
              {BADGES.map((badge, idx) => {
                const Icon = badge.icon;
                return (
                  <li key={idx} className="flex items-start gap-4">
                    <div className="shrink-0 flex items-center justify-center h-11 w-11 rounded-lg bg-gold-500/15 text-gold-400 ring-1 ring-gold-500/20">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-base sm:text-lg leading-tight">
                        {badge.title}
                      </p>
                      <p className="text-base text-white/70 mt-1 leading-relaxed">{badge.sub}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
