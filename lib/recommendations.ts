import type { CreativeRow, FunnelCounts } from "./db";
import type { ClarityAnalysis } from "./clarity-analyze";

export type Recommendation = {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  body: string;
  action: string;
};

export function buildRecommendations(
  funnel: FunnelCounts,
  creatives: CreativeRow[],
  opts: {
    hasFbToken: boolean;
    hasStripeWebhook: boolean;
    persistMode: string;
    clarity?: ClarityAnalysis | null;
  },
): Recommendation[] {
  const recs: Recommendation[] = [];
  const visitors = funnel.uniqueVisitors || funnel.visits;
  const pct = (n: number) => (visitors > 0 ? Math.round((n / visitors) * 100) : 0);

  recs.push({
    id: "lpv-to-checkout",
    severity: funnel.purchases >= 50 ? "low" : "critical",
    title:
      funnel.purchases >= 50
        ? "Dost nákupů: zvaž optimalizaci kampaně na Purchase"
        : "Kampaň nesmí zůstat na zobrazení stránky",
    body:
      funnel.purchases >= 50
        ? "Máš objem nákupů, na kterém Meta umí učit. Purchase může nahradit InitiateCheckout."
        : "Cold traffic na Landing Page Views hledá levné kliky, ne kupující. Pixel teď umí InitiateCheckout a Lead — to je signál mezi klikem a platbou. Přepni Sales kampaň na InitiateCheckout, teprve po ~50 nákupech na Purchase.",
    action: "Ads Manager → kampaň workshopu → Conversion → InitiateCheckout. Postup v docs/FACEBOOK-API-SETUP.md.",
  });

  if (visitors >= 30 && pct(funnel.heroShowDates) < 12) {
    recs.push({
      id: "hero-copy",
      severity: "critical",
      title: "Hero tlačítko skoro nikdo nemačká — problém je textace nad foldem",
      body: `Jen ${pct(funnel.heroShowDates)} % návštěvníků kliklo na „Zobrazit termíny“ (${funnel.heroShowDates} z ${visitors}). Termíny teď v hero nejsou, takže odchod není kvůli konkrétnímu datu. Úzké hrdlo je H1 / podtitulek / slib reklamy.`,
      action: "Srovnej text 2–3 nejtočenějších reklam s H1 „Z korporátu k práci, která dává smysl.“ Neměň seznam termínů, dokud hero klik neporoste.",
    });
  }

  if (visitors >= 30 && pct(funnel.scrollTerminy) < 35) {
    recs.push({
      id: "scroll-terminy",
      severity: "high",
      title: "Lidi nedorolují k termínům",
      body: `Jen ${pct(funnel.scrollTerminy)} % návštěvníků vidělo sekci termínů (${funnel.scrollTerminy} z ${visitors}). U cold traffic z Facebooku to skoro vždycky znamená mismatch slibu v reklamě a headline na stránce, nebo CTA příliš nízko. Neřeš zatím, která kreativa vyhrává.`,
      action: "Srovnej text reklamy s H1 „Z korporátu k práci, která dává smysl.“ CTA v hero je Zobrazit termíny — když ho nemačkají, je to copy, ne datum.",
    });
  }

  if (visitors >= 30 && pct(funnel.ctaClick) < 8 && pct(funnel.scrollTerminy) >= 35 && pct(funnel.heroShowDates) >= 12) {
    recs.push({
      id: "cta-weak",
      severity: "high",
      title: "Termíny vidí, ale nekličkají na koupi",
      body: `Scroll k termínům je ${pct(funnel.scrollTerminy)} %, CTA klik jen ${pct(funnel.ctaClick)} %. Úzké hrdlo je nabídka (cena, termín, důvěra), ne první dojem z reklamy.`,
      action: "Zvětši tlačítko Koupit, sjednoť cenu s CTA, přidej termín a garanci přímo u tlačítka.",
    });
  }

  if (funnel.initiateCheckout >= 8 && funnel.purchases === 0) {
    recs.push({
      id: "checkout-drop",
      severity: "critical",
      title: "Stripe se otevírá, webhook nevidí platbu",
      body: `${funnel.initiateCheckout} lidí kliklo na platbu a 0 nákupů v Engine. Buď opravdu nedokončí checkout, nebo webhook ještě není zapnutý.`,
      action: opts.hasStripeWebhook
        ? "Ve Stripe Dashboardu ověř nedokončené session. Zjednoduš Stripe stránku (jen karta, předvyplněný e-mail)."
        : "Doplň STRIPE_WEBHOOK_SECRET a endpoint /workshop/api/stripe/webhook — bez něj Engine nákup neuvidí.",
    });
  }

  if (funnel.waitlist >= 5 && funnel.purchases === 0) {
    recs.push({
      id: "waitlist-not-ads",
      severity: "medium",
      title: "Zájem je, termíny nesedí",
      body: `${funnel.waitlist} lidí nechalo kontakt, protože jim nevyhovuje termín. To není problém kreativy. Až vypíšeš nový termín, napiš jim ručně z karty Waitlist.`,
      action: "Otevři Waitlist, zkopíruj e-maily, vypiš termín a ozvi se dřív, než ho dáš do reklamy.",
    });
  }

  const paid = creatives.filter((c) => c.utm_content && c.utm_content !== "(bez UTM)");
  const organicish = creatives.find((c) => c.utm_content === "(bez UTM)");
  if (visitors >= 20 && paid.length === 0 && (organicish?.visits || 0) > 0) {
    recs.push({
      id: "missing-utm",
      severity: "critical",
      title: "Reklamy nepřicházejí s UTM — Engine nevidí kreativy",
      body: "Návštěvy jsou, ale bez utm_content. Meta parametr {{ad.id}} v URL reklamy ještě není nasazený, nebo lidé chodí mimo kampaň.",
      action: "Do každé reklamy vlož URL z docs/WORKSHOP-ENGINE.md (utm_content={{ad.id}}).",
    });
  }

  if (paid.length > 0) {
    const worst = [...paid].sort((a, b) => {
      const rate = (r: CreativeRow) =>
        r.uniqueVisitors > 0 ? (r.checkout + r.waitlist) / r.uniqueVisitors : 0;
      return rate(a) - rate(b);
    })[0];
    if (worst && worst.uniqueVisitors >= 15 && worst.checkout + worst.waitlist === 0) {
      recs.push({
        id: "creative-mismatch",
        severity: "high",
        title: `Kreativa ${worst.utm_content} nese návštěvy bez záměru`,
        body: `${worst.uniqueVisitors} návštěv z utm_content=${worst.utm_content}, nula checkoutu i waitlistu. Typický message mismatch: reklama slibuje něco jiného než landing.`,
        action: "Srovnej copy této reklamy s H1. Tuto kreativu pauzni, dokud nesedí slib.",
      });
    }
  }

  if (opts.clarity?.findings.length) {
    for (const f of opts.clarity.findings) {
      if (f.severity === "ok" || f.severity === "low") continue;
      recs.push({
        id: f.id,
        severity: f.severity,
        title: f.title,
        body: f.body,
        action: f.action,
      });
    }
  }

  if (!opts.hasFbToken) {
    recs.push({
      id: "fb-token",
      severity: "medium",
      title: "Facebook API ještě není připojené",
      body: "Spend, CTR, frequency a cílení v Engine uvidíš až po tokenu. Landing data (funnel, UTM) jedou i bez něj.",
      action: "Projdi docs/FACEBOOK-API-SETUP.md a vlož FB_ACCESS_TOKEN + FB_AD_ACCOUNT_ID na Vercel.",
    });
  }

  if (opts.persistMode === "file") {
    recs.push({
      id: "file-mode",
      severity: "low",
      title: "Lokální režim: data jsou v souboru, ne v Neon",
      body: "Teď se ukládá do .data/engine.json. Na Vercel to nepřežije — před ostrým provozem nastav DATABASE_URL.",
      action: "Vytvoř Neon projekt, DATABASE_URL do Vercel env, redeploy.",
    });
  }

  if (opts.persistMode === "none") {
    recs.push({
      id: "no-db",
      severity: "critical",
      title: "Chybí DATABASE_URL — nic se neukládá",
      body: "Waitlist, funnel i nákupy potřebují Neon Postgres.",
      action: "Doplň DATABASE_URL (Neon) na Vercel a v .env.local.",
    });
  }

  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  recs.sort((a, b) => order[a.severity] - order[b.severity]);
  return recs;
}
