"use client";

import { useState } from "react";
import { Section } from "@/components/ui/Section";
import { ChevronDown } from "lucide-react";
import { WORKSHOP } from "@/lib/config";

const QA = [
  {
    q: "Je to pro mě, i když se nechci stát profesionálním koučem?",
    a: "Ano. Přijít můžeš kvůli vedení lidí, práci v HR nebo dalším rozhovorům ve své současné profesi. Na lekci si vyzkoušíš koučovací přístup a zvážíš, zda ho chceš dál rozvíjet.",
  },
  {
    q: "Potřebuji předchozí zkušenosti?",
    a: "Ne. Praktickou částí tě provedeme a dostaneš jednoduchý postup pro první rozhovor.",
  },
  {
    q: "Co když mi to nebude sedět?",
    a: "Po prvních 60 minutách víš, jestli jsi správně. Pokud ne, odpoj se z workshopu, napiš mi email a vrátím 100 % ceny. Riziko beru na sebe.",
  },
  {
    q: "Musím mít zapnutou kameru?",
    a: "Ano. Workshop je interaktivní, koučuješ a jsi koučován/a - to bez kamery nejde. Připojit se můžeš z počítače, tabletu nebo telefonu, workshop probíhá na Zoomu.",
  },
  {
    q: "Mohu přijít jen na část?",
    a: "Pro zkušenost v obou rolích si vyhraď celé dvě hodiny. Záznam ti umožní vrátit se k nahrané části lekce, ale nenahradí vlastní praxi ve dvojici.",
  },
  {
    q: "Mám už koučovací výcvik za sebou. Má smysl přijít?",
    a: "Ano, pokud chceš osobně poznat přístup CoachVille. Počítej s úvodní lekcí přístupnou i začátečníkům. Pokud hledáš návaznost na ICF certifikaci nebo rozvoj vlastní praxe, napiš Alešovi na ales@coachville.eu se svou situací.",
  },
  {
    q: "Je to běžná lekce probíhajícího výcviku?",
    a: "Je to samostatná praktická ukázková lekce připravená pro zájemce. Umožní ti poznat náš způsob práce, aniž by ses nejprve přihlašoval/a do výcviku.",
  },
  {
    q: "Bude na workshopu nějaký prodejní pitch?",
    a: "Ne. Princip workshopu je dát ti zážitek, který se sám prodá nebo neprodá. Pokud po workshopu chceš vědět, jak pokračovat dál - řekneme si všechny možnosti. Pokud ne, máš zážitek a 5 nástrojů, které můžeš použít už zítra.",
  },
  {
    q: `Workshop ${WORKSHOP.timeRange}. Stihnu to po práci?`,
    a: `Pokud se připojíš v ${WORKSHOP.joinTime}, jsi v pohodě. V průběhu první hodiny je v pořádku si vzít občerstvení, ve druhé hodině budeme praktikovat, takže tam se hodí být plně přítomen/přítomna. Pokud potřebuješ skončit dříve, můžeš se podívat na zbytek workshopu ze záznamu.`,
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section id="faq" tone="white">
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <p className="h-label mb-3">FAQ</p>
        <h2 className="h-section text-h2 text-navy-600">Otázky před přihlášením</h2>
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
            Máš další otázku, která tu není?{" "}
            <a
              href={`mailto:${WORKSHOP.contactEmail}?subject=Workshop%20kou%C4%8Dov%C3%A1n%C3%AD%20-%20dotaz`}
              className="text-teal-500 hover:text-teal-600 font-semibold underline-offset-4 hover:underline"
            >
              Napiš mi přímo →
            </a>
          </p>
        </div>
      </div>
    </Section>
  );
}
