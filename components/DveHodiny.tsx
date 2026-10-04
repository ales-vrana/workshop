import { Eye, Users, Repeat } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { WORKSHOP } from "@/lib/config";

/**
 * Infografika „Dvě hodiny, tři kroky".
 *
 * Nahrazuje v hero velký portrét lektora: problem aware návštěvník potřebuje
 * v první obrazovce vědět, co se bude dít, ne kdo to vede (portrét je níž
 * v sekci „S kým lekci zažijete", v hero zůstal jen mikrořádek důvěry).
 *
 * Záměrně bez minutáže - časy by byly vymyšlené. Pořadí kroků je jisté.
 *
 * variant="compact" - do hero, na tmavém pozadí
 * variant="full"    - samostatná sekce s delším popisem
 */

const KROKY = [
  {
    icon: Eye,
    title: "Uvidíte",
    short: "živý koučovací rozhovor",
    long: "Aleš povede skutečný koučovací rozhovor s jedním z účastníků. Ne ukázku ze záznamu. Uvidíte, co kouč dělá, kdy mlčí a proč se neptá na to, co byste čekali.",
  },
  {
    icon: Users,
    title: "Vyzkoušíte",
    short: "roli kouče ve dvojici",
    long: "Dostanete jednoduchý postup a konkrétní otázky. Ve dvojici s dalším účastníkem povedete rozhovor na skutečné téma. Většina lidí je překvapená, co zvládne napoprvé.",
  },
  {
    icon: Repeat,
    title: "Zažijete",
    short: "rozhovor i jako klient",
    long: "Prohodíte si role. Poznáte, jak otázky působí z druhé strany a co se stane, když vám někdo dá prostor přemýšlet nahlas.",
  },
];

export function DveHodinyCompact() {
  return (
    <div className="w-full max-w-md mx-auto lg:mx-0">
      <p className="h-label text-gold-400 mb-4">
        {WORKSHOP.duration}, tři kroky
      </p>

      <ol className="relative space-y-4">
        {/* spojnice kroků */}
        <span
          className="absolute left-5 top-6 bottom-6 w-px bg-gradient-to-b from-gold-400/50 via-gold-400/30 to-transparent"
          aria-hidden
        />

        {KROKY.map((krok, i) => {
          const Icon = krok.icon;
          return (
            <li
              key={krok.title}
              className="relative flex items-center gap-4 rounded-2xl bg-navy-900/55 backdrop-blur-md border border-white/15 px-4 py-3.5"
            >
              <div className="relative shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-gold-500/20 ring-1 ring-gold-400/40 text-gold-300">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-base sm:text-lg font-bold text-white leading-tight">
                  <span className="text-gold-300/70 tabular-nums mr-1.5">{i + 1}.</span>
                  {krok.title}
                </p>
                <p className="text-sm text-white/70 leading-tight mt-0.5">{krok.short}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function DveHodiny() {
  return (
    <Section id="jak-probiha" tone="white">
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
        <p className="h-label mb-3">Jak to probíhá</p>
        <h2 className="h-section text-h2 text-navy-600">
          Dvě hodiny, tři kroky
        </h2>
        <p className="mt-4 text-base sm:text-lg text-dark/70">
          Žádná přednáška, kterou je potřeba vydržet. Většinu času mluvíte nebo
          posloucháte jednoho člověka.
        </p>
      </div>

      <ol className="grid gap-5 sm:gap-6 lg:grid-cols-3 max-w-5xl mx-auto">
        {KROKY.map((krok, i) => {
          const Icon = krok.icon;
          return (
            <li key={krok.title} className="card flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-navy-100/40 text-navy-600">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <p className="text-sm font-bold uppercase tracking-wider text-gold-700">
                  Krok {i + 1}
                </p>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-navy-600 mb-3">
                {krok.title}
              </h3>
              <p className="text-base text-dark/75 leading-relaxed">{krok.long}</p>
            </li>
          );
        })}
      </ol>

      <p className="text-center text-sm sm:text-base text-dark/60 mt-8 max-w-2xl mx-auto">
        Lekce se nenahrává. Obě role se dají zažít jenom naživo, proto počítejte
        s celými {WORKSHOP.duration.toLowerCase()}.
      </p>
    </Section>
  );
}
