"use client";

import { useState } from "react";
import { Section } from "@/components/ui/Section";
import { ChevronDown } from "lucide-react";
import { WORKSHOP } from "@/lib/config";

const QA = [
  {
    q: "Jsem teď bez práce nebo na rodičovské. Je to pro mě?",
    a: "Ano. Část lidí přichází právě ve chvíli, kdy jim jedna kapitola skončila a další ještě nezačala. Na lekci nepotřebujete zaměstnání ani téma z korporátu - stačí běžná situace, kterou zrovna řešíte.",
  },
  {
    q: "Přijdu po práci úplně vyčerpaná. Zvládnu to?",
    a: "Lekce není přednáška, kterou je potřeba vydržet. Většinu času mluvíte nebo posloucháte jednoho člověka. Lidé obvykle odcházejí s větší energií, než s jakou přišli.",
  },
  {
    q: "Co když je moje téma osobní?",
    a: "Téma si volíte sami a stačí běžná pracovní situace. Nic citlivého otevírat nemusíte a rozhovory ve dvojicích se nenahrávají.",
  },
  {
    q: "Potřebuji předchozí zkušenosti?",
    a: "Ne. Praktickou částí vás provedeme a dostanete jednoduchý postup pro první rozhovor.",
  },
  {
    q: "Co když mi to vůbec nepůjde?",
    a: "To je legitimní výsledek. Dvě hodiny jsou tu právě proto, abyste to zjistili dřív, než se rozhodnete o čemkoli dalším. A když po první hodině budete mít pocit, že to pro vás není, peníze vám vrátíme.",
  },
  {
    q: "Partner říká, že je to jen marketing.",
    a: "Rozumím. Proto to stojí " + WORKSHOP.price + " a proto vracíme peníze po první hodině. Přijďte se podívat sami.",
  },
  {
    q: "Bude na lekci nějaký prodejní pitch?",
    a: "Ne. Smyslem lekce je dát vám zážitek, který se sám prodá nebo neprodá. Pokud po ní budete chtít vědět, jak pokračovat, řekneme si všechny možnosti. Pokud ne, odnesete si zkušenost a pět otázek, které můžete použít hned zítra.",
  },
  {
    q: "Musím mít zapnutou kameru?",
    a: "Ano. Lekce je interaktivní, koučujete a jste koučováni - to bez kamery nejde. Nikdo vás přitom nehodnotí. Připojit se můžete z počítače, tabletu i telefonu.",
  },
  {
    q: "Mohu přijít jen na část?",
    a: "Ne, počítejte s celými dvěma hodinami. Lekce se nenahrává a obě role - kouče i klienta - se dají zažít jenom naživo.",
  },
  {
    q: `Lekce je ${WORKSHOP.timeRange}. Stihnu to po práci?`,
    a: `Pokud se připojíte v ${WORKSHOP.joinTime}, jste v pohodě. V průběhu první hodiny je v pořádku si vzít občerstvení, ve druhé hodině praktikujeme, takže tam se hodí být plně přítomní.`,
  },
  {
    q: "Mám už koučovací výcvik za sebou. Má smysl přijít?",
    a: "Ano, pokud chcete osobně poznat přístup CoachVille. Počítejte s úvodní lekcí přístupnou i začátečníkům. Pokud hledáte návaznost na ICF certifikaci nebo rozvoj vlastní praxe, napište Alešovi na ales@coachville.eu se svou situací.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section id="faq" tone="white">
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <p className="h-label mb-3">FAQ</p>
        <h2 className="h-section text-h2 text-navy-600">Otázky, které dostávám nejčastěji</h2>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="divide-y divide-navy-100/60 rounded-2xl border border-navy-100/60 bg-white shadow-soft overflow-hidden">
          {QA.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx}>
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-4 text-left p-5 sm:p-6 hover:bg-cream transition-colors focus-visible:bg-cream"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${idx}`}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                >
                  <span className="font-semibold text-base sm:text-lg text-navy-700">{item.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-navy-600 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>
                <div
                  id={`faq-panel-${idx}`}
                  role="region"
                  className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96" : "max-h-0"}`}
                >
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-base text-dark/80 leading-relaxed">
                    {item.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Máte další otázku */}
        <div className="mt-8 text-center">
          <p className="text-sm sm:text-base text-dark/70">
            Máte další otázku, která tu není?{" "}
            <a
              href={`mailto:${WORKSHOP.contactEmail}?subject=Workshop%20kou%C4%8Dov%C3%A1n%C3%AD%20-%20dotaz`}
              className="text-teal-500 hover:text-teal-600 font-semibold underline-offset-4 hover:underline"
            >
              Napište mi přímo →
            </a>
          </p>
        </div>
      </div>
    </Section>
  );
}
