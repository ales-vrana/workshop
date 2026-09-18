import { Check } from "lucide-react";
import { Section } from "@/components/ui/Section";

/**
 * Sekce „Program" - původně rámeček v hero, nyní samostatná sekce
 * na místě, kde dřív byla sekce „Co tě čeká" (ta se přesunula pod hero).
 * Texty položek beze změny.
 */
const VALUE_ITEMS = [
  {
    title: "Živá ukázková lekce s Alešem Vránou, MCC",
    sub: "Dvě hodiny vedené praxe na Zoomu",
  },
  {
    title: "Živá ukázka koučování",
    sub: "Uvidíš práci s otázkami a nasloucháním",
  },
  {
    title: "Záznam lekce k pozdějšímu studiu",
    sub: "Praktické rozhovory ve dvojicích se nenahrávají",
  },
  {
    title: "Koučovací rozhovor pro další praktikování",
    sub: "Otázky pro další procvičování rozhovorů v období po lekci, získáš více zkušeností",
  },
  {
    title: "Praxe v roli kouče i klienta",
    sub: "S jednoduchým postupem a vlastním tématem",
  },
  {
    title: "Případové studie koučů ve výcviku",
    sub: "Poznáš zkušenosti z různých fází výcviku",
  },
];

export function Program() {
  return (
    <Section id="program" tone="navy" className="!bg-navy-900">
      <div className="max-w-2xl lg:max-w-4xl mx-auto">
        <div className="rounded-2xl bg-navy-900/55 backdrop-blur-md border border-white/15 p-6 sm:p-8 shadow-lifted">
          <p className="h-label text-gold-400 mb-5">Program:</p>
          <ul className="grid gap-4 lg:grid-cols-2 lg:gap-x-8">
            {VALUE_ITEMS.map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <div className="shrink-0 mt-1">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gold-500/25 ring-1 ring-gold-400/40">
                    <Check className="h-3.5 w-3.5 text-gold-300" aria-hidden />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-white text-base sm:text-lg">{item.title}</p>
                  <p className="text-sm sm:text-base text-white/70 mt-0.5">{item.sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
