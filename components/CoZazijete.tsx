import { Section } from "@/components/ui/Section";
import { Eye, UserCheck, Heart, Sparkles, Map, Wrench } from "lucide-react";

const KARTY = [
  {
    icon: Eye,
    headline: "ŽIVÁ UKÁZKA KOUČOVÁNÍ NAŽIVO",
    body: "Uvidíš koučování, jak vypadá u držitele nejvyšší ICF certifikace MCC. Můžeš se přihlásit jako klient ukázky a zažít koučování přímo se mnou. Co vidíš v knihách jako ideální, uvidíš v praxi.",
  },
  {
    icon: UserCheck,
    headline: "VYZKOUŠÍŠ SI ROLI KOUČE",
    body: "Pravděpodobně poprvé budeš v roli kouče. Dostaneš jasnou strukturu, jak vést koučovací rozhovor, a okamžitě ji zkusíš. Zjistíš, jak ti tato role sedí — fyzicky, emočně, mentálně.",
  },
  {
    icon: Heart,
    headline: "ZAŽIJEŠ KOUČOVÁNÍ JAKO KLIENT",
    body: "Druhá strana zkušenosti. Někdo tě bude koučovat na téma, které si vybereš. V bezpečném prostředí. Zjistíš, jak silný zážitek to může být — a proč si stále více lidí ze všech sfér společnosti najímá svého kouče.",
  },
  {
    icon: Sparkles,
    headline: "PRACUJEŠ NA SVÉM SKUTEČNÉM TÉMATU",
    body: "Žádné modelové situace. Pracuješ s reálným tématem, které je důležité právě teď ve tvém životě nebo práci. Možná odejdeš s posunem, který jsi nečekal/a — workshop je živá praxe, ne simulace.",
  },
  {
    icon: Map,
    headline: "JAK KOUČOVÁNÍ POUŽÍVAT V PRÁCI I DOMA",
    body: "Mnoho lidí chce koučovací dovednosti používat ve své současné práci — v rozhovorech s kolegy, ve vedení týmu, s partnerem, s dětmi. Někoho zaujme natolik, že chce postupně koučovat profesionálně. Ukážu ti obě cesty — ať si vybereš, která dává smysl pro tvůj život.",
  },
  {
    icon: Wrench,
    headline: "5 KOUČOVACÍCH KONVERZACÍ PO WORKSHOPU",
    body: "Bez studených kontaktů. Bez prodejních triků. Konkrétní postup, jak můžeš už druhý den s někým dalším udělat první koučovací konverzaci. Otázky, které můžeš položit, a jak získat užitečnou zpětnou vazbu.",
  },
];

export function CoZazijete() {
  return (
    <Section id="co-zazijete" tone="white">
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <p className="h-label mb-3">Co tě čeká</p>
        <h2 className="h-display text-h2 text-navy-600">
          Co přesně se za ty 3 hodiny stane
        </h2>
      </div>

      <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {KARTY.map((karta, idx) => {
          const Icon = karta.icon;
          const num = String(idx + 1).padStart(2, "0");
          return (
            <article
              key={idx}
              className="card group relative overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 hover:border-teal-400/40"
            >
              <div
                aria-hidden
                className="absolute -top-4 -right-2 text-[7rem] sm:text-[8rem] font-extrabold leading-none text-gold-500/8 select-none pointer-events-none"
              >
                {num}
              </div>

              <div className="relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-teal-400/15 text-teal-500 group-hover:bg-teal-400 group-hover:text-white transition-colors">
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <span className="text-sm font-bold text-gold-500 tracking-wider">{num}</span>
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
