/**
 * Jedna statická citace v hero. Další citace z pole jsou v #citace.
 * První položka je výchozí; jinou citaci lze podat propem `quote`.
 */

export type HeroQuote = { quote: string; name: string };

export const HERO_QUOTES: HeroQuote[] = [
  { quote: "Trénink doporučuji. Je vymyšlen seriózně, má dobrý systém, který přináší výsledky.", name: "Zora Cejnková" },
  { quote: "Cítila jsem bezpečí zeptat se na cokoli, na co jsem narazila.", name: "Mona Martinů" },
  { quote: "Je skvělé, že od prvního momentu jsme vrženi do praxe.", name: "Zuzana Bergerová" },
  { quote: "Děkuji, že mohu nevědět a chybovat.", name: "Alena Best" },
  { quote: "Získal jsem nástroje ke konstruktivnější komunikaci. Výcvik byl skvělý.", name: "Viliam Vala" },
  { quote: "Je postaven z velké části na okamžité praxi. Praktikuješ okamžitě.", name: "Jana Plecháčová" },
  { quote: "Myslím, že se to odrazilo i na mých vztazích, méně hodnotím, více se umím nacítit na druhého člověka.", name: "Petra Vicherová" },
  { quote: "V první řadě jde o propracovaný systém, ve kterém má osoba možnost sebereflexe, osobního růstu a osobní transformace.", name: "Gita Zuskačová" },
  { quote: "Uvědomění, že jsme si všichni opravdu podobní, máme podobné sny, obavy, motivace. Dobrý start k sebeuvědomění.", name: "Daniel Verner" },
  { quote: "Trénink je dobře strukturovaný a člověk má skutečně pocit zhodnocených peněz.", name: "Eva Balíková" },
  { quote: "Hezky poskládané informace, podrobný návod, jasně dané techniky, hodně tréninku.", name: "Květa Kuklová" },
  { quote: "Způsob výuky, který je zaměřen prakticky a rozvíjí mnohem víc než výuka ze skript.", name: "Barbora Eliášová" },
  { quote: "Osamostatnila jsem se ve svém (předtím) korporátním mindsetu.", name: "Alžběta Sládek Široká" },
  { quote: "Uvědomil jsem si, že se zlepšuju, že je to lepší a rychlejší metoda než běžné školní postupy.", name: "Martin Černek" },
  { quote: "Je mi v této nehodnotící komunitě dobře. Můžeš tu odložit všechny masky a role a otevřít se bez obav na maximum.", name: "Kateřina Pořízková" },
  { quote: "Podařilo se mi dostat z mindsetu ‚řešitelky problému' na nastavení na ‚prozkoumávajícího průvodce s nadhledem'.", name: "Martina Michková" },
  { quote: "Skvělá komunita, praxe na prvním místě, kvalitní materiál a vedení, možnost ptát se na cokoliv.", name: "David Hůrka" },
  { quote: "Moc se mi líbí Alešova přímá komunikace, provokativní otázky a způsob, jakým nás vede k vlastnímu uvědomění.", name: "Andrea Djurevska" },
  { quote: "Líbí se mi, jak Aleš dokáže reagovat na všechny dotazy a skvěle je zodpovědět. I ta chvíle ticha, kterou si nechá a až potom trefně odpoví.", name: "Kateřina Dedek" },
  { quote: "Veľký rešpekt k Alešovmu vedeniu lekcií, k jeho radám nám začínajúcim koučom, k jeho pohotovosti a podpore.", name: "Mária Lipková" },
  { quote: "Z pedagogického hlediska odvedl Aleš skvělou práci a ani u jednoho setkání jsem se nenudila.", name: "Adéla Vaníková" },
  { quote: "Konečně mi to připadalo ne jako ve škole, ale opravdu učení hrou. A tak to má být.", name: "Michaela Danielová" },
  { quote: "Baví mě výcvik, jak je vedený. Je to skvěle hravě propracované, a hlavně interaktivní a zaměřené na praxi od začátku.", name: "Markéta Růžičková" },
  { quote: "Alešovy tréninky jsou neskutečné. Jsou skvěle strukturované, akční a plné zajímavých myšlenek. Klidné, nehodnotící, bezpečné.", name: "Jana Seidlmanová" },
  { quote: "Je to velmi profesionálně vedené, podporující prostředí, parta úžasných lidí. Je to prostě zdravě návykové.", name: "Zuzana Malá" },
];

export function HeroReference({ quote = HERO_QUOTES[0] }: { quote?: HeroQuote }) {
  return (
    <div className="w-full max-w-xl mx-auto lg:mx-0">
      <p className="h-label text-gold-400 !text-[11px] sm:!text-xs mb-2.5">Co říkají studenti</p>
      <figure className="rounded-2xl bg-navy-900/55 backdrop-blur-md border border-white/15 shadow-lifted px-4 py-4 sm:px-6 sm:py-5 text-left">
        <blockquote className="text-[15px] sm:text-base lg:text-[17px] leading-[1.55] text-white/90">
          „{quote.quote}&#8220;
        </blockquote>
        <figcaption className="mt-2.5 text-[13px] sm:text-sm font-bold text-gold-300">
          {quote.name}
        </figcaption>
      </figure>
    </div>
  );
}
