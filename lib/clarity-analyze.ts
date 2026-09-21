export type ClarityMetric = {
  name: string;
  rows: Array<Record<string, string | number>>;
};

export type ClarityFinding = {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "ok";
  title: string;
  body: string;
  action: string;
};

export type ClaritySignal = {
  label: string;
  value: string;
  tone: "bad" | "warn" | "ok" | "neutral";
};

export type ClarityAnalysis = {
  signals: ClaritySignal[];
  findings: ClarityFinding[];
  metricNames: string[];
};

function toNum(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(",", ".").replace(/\s/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function findMetric(metrics: ClarityMetric[], needles: string[]): ClarityMetric | undefined {
  const want = needles.map(norm);
  return metrics.find((m) => want.some((w) => norm(m.name).includes(w)));
}

type KeyPred = (nk: string) => boolean;

function numBy(row: Record<string, string | number> | undefined, pred: KeyPred): number | null {
  if (!row) return null;
  for (const [k, v] of Object.entries(row)) {
    if (pred(norm(k))) {
      const n = toNum(v);
      if (n != null) return n;
    }
  }
  return null;
}

function sumBy(rows: Array<Record<string, string | number>>, pred: KeyPred): number | null {
  let total = 0;
  let any = false;
  for (const row of rows) {
    const n = numBy(row, pred);
    if (n != null) {
      total += n;
      any = true;
    }
  }
  return any ? total : null;
}

function weightedBy(
  rows: Array<Record<string, string | number>>,
  valuePred: KeyPred,
  weightPred: KeyPred,
): number | null {
  let num = 0;
  let den = 0;
  for (const row of rows) {
    const v = numBy(row, valuePred);
    if (v == null) continue;
    const w = numBy(row, weightPred);
    const weight = w != null && w > 0 ? w : 1;
    num += v * weight;
    den += weight;
  }
  return den > 0 ? num / den : null;
}

const isSessionCount: KeyPred = (nk) =>
  (nk.includes("session") && nk.includes("count") && !nk.includes("bot") && !nk.includes("user")) ||
  nk === "sessions" ||
  nk === "sessioncount";

const isBotCount: KeyPred = (nk) => nk.includes("bot") && (nk.includes("count") || nk.includes("session"));

const isUserCount: KeyPred = (nk) =>
  !nk.includes("bot") &&
  ((nk.includes("user") && nk.includes("count")) || nk === "users" || nk === "uniqueusers");

const isPagesPerSession: KeyPred = (nk) => nk.includes("page") && nk.includes("session");

const isScrollDepth: KeyPred = (nk) =>
  nk.includes("scroll") && !nk.includes("excessive") && (nk.includes("depth") || nk.includes("average") || nk.includes("percent"));

const isEngageTime: KeyPred = (nk) =>
  (nk.includes("active") && nk.includes("time")) ||
  (nk.includes("engagement") && nk.includes("time")) ||
  nk === "averagetime" ||
  nk === "totaltime" ||
  nk === "avgtime";

const isPercent: KeyPred = (nk) =>
  nk.includes("percent") || nk.includes("percentage") || nk === "rate" || nk === "subtotal" || nk === "ratio";

const isGenericCount: KeyPred = (nk) =>
  nk.includes("count") || nk === "value" || nk === "total" || nk === "subtotal";

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** 0–1 poměr (boti/sessions) → procentní body. */
function ratioToPct(n: number): number {
  return round1(n * 100);
}

/** Scroll z API: 0–1 ber jako zlomek, 32 jako 32 %. */
function scrollToPct(n: number): number {
  if (n >= 0 && n <= 1) return ratioToPct(n);
  return round1(n);
}

function fmtPctPoints(n: number | null): string {
  if (n == null) return "—";
  return `${round1(n)} %`;
}

function fmtNum(n: number | null): string {
  if (n == null) return "—";
  return Math.round(n).toLocaleString("cs-CZ");
}

function fmtTime(n: number | null): string {
  if (n == null) return "—";
  const sec = n > 600 ? n / 1000 : n;
  if (sec < 60) return `${Math.round(sec)} s`;
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m} min ${s} s`;
}

function toneFromPct(pct: number | null, badFrom: number, warnFrom: number): ClaritySignal["tone"] {
  if (pct == null) return "neutral";
  if (pct >= badFrom) return "bad";
  if (pct >= warnFrom) return "warn";
  return "ok";
}

function rowKeys(metrics: ClarityMetric[]): string {
  const keys = new Set<string>();
  for (const m of metrics) {
    for (const row of m.rows.slice(0, 2)) {
      for (const k of Object.keys(row)) keys.add(`${m.name}.${k}`);
    }
  }
  return [...keys].slice(0, 24).join(", ");
}

/** Vrací procentní body 0–100 (ne 0–1). */
function frictionRate(metric: ClarityMetric | undefined, sessions: number | null): number | null {
  if (!metric || metric.rows.length === 0) return null;
  const pct = weightedBy(metric.rows, isPercent, isSessionCount);
  if (pct != null) return round1(pct);
  const count = sumBy(metric.rows, isGenericCount);
  if (count != null && sessions && sessions > 0) return ratioToPct(count / sessions);
  return null;
}

function deviceMobileShare(metrics: ClarityMetric[]): number | null {
  const device = findMetric(metrics, ["device"]);
  if (!device || device.rows.length === 0) return null;
  let mobile = 0;
  let all = 0;
  for (const row of device.rows) {
    const sessions = numBy(row, isSessionCount) ?? numBy(row, isPercent) ?? numBy(row, isGenericCount);
    if (sessions == null) continue;
    const label = Object.values(row)
      .filter((v) => typeof v === "string" && toNum(v) == null)
      .join(" ")
      .toLowerCase();
    all += sessions;
    if (/mobile|phone|android|ios|iphone/.test(label)) mobile += sessions;
  }
  if (all <= 0) return null;
  return mobile / all;
}

/**
 * Fixture ve tvaru Data Export API (Microsoft sample + typické friction metriky).
 * Používá se v testech; v produkci jdou živá data.
 */
export function sampleClarityMetrics(kind: "friction" | "healthy" | "traffic-only" | "docs-traffic"): ClarityMetric[] {
  if (kind === "docs-traffic") {
    return [
      {
        name: "Traffic",
        rows: [
          {
            totalSessionCount: "9554",
            totalBotSessionCount: "8369",
            distantUserCount: "189733",
            PagesPerSessionPercentage: 1.0931,
            OS: "Other",
          },
          {
            totalSessionCount: "291942",
            totalBotSessionCount: "31076",
            distantUserCount: "212836",
            PagesPerSessionPercentage: 2.2609,
            OS: "Android",
          },
        ],
      },
    ];
  }
  if (kind === "traffic-only") {
    return [
      {
        name: "Traffic",
        rows: [{ totalSessionCount: "1745", distinctUserCount: "1412", pagesPerSession: 1.08 }],
      },
    ];
  }
  if (kind === "healthy") {
    return [
      {
        name: "Traffic",
        rows: [{ totalSessionCount: "800", distinctUserCount: "720", totalBotSessionCount: "40", pagesPerSession: 1.4 }],
      },
      { name: "Scroll Depth", rows: [{ averageScrollDepth: 62 }] },
      { name: "Engagement Time", rows: [{ activeTime: 48 }] },
      { name: "Rage Click Count", rows: [{ sessionsCount: "16", sessionsWithMetricPercentage: 2 }] },
      { name: "Dead Click Count", rows: [{ sessionsWithMetricPercentage: 5 }] },
      { name: "Quickback Click", rows: [{ sessionsWithMetricPercentage: 8 }] },
      { name: "Excessive Scroll", rows: [{ sessionsWithMetricPercentage: 4 }] },
      { name: "Error Click Count", rows: [{ sessionsWithMetricPercentage: 0.4 }] },
      { name: "Device", rows: [{ Device: "Mobile", totalSessionCount: "500" }, { Device: "Desktop", totalSessionCount: "300" }] },
    ];
  }
  return [
    {
      name: "Traffic",
      rows: [{ totalSessionCount: "1745", distinctUserCount: "1412", totalBotSessionCount: "210", pagesPerSession: 1.08 }],
    },
    { name: "Scroll Depth", rows: [{ averageScrollDepth: 32 }] },
    { name: "Engagement Time", rows: [{ activeTime: 12 }] },
    { name: "Rage Click Count", rows: [{ sessionsCount: "140", sessionsWithMetricPercentage: 8 }] },
    { name: "Dead Click Count", rows: [{ sessionsWithMetricPercentage: 14 }] },
    { name: "Quickback Click", rows: [{ sessionsWithMetricPercentage: 28 }] },
    { name: "Excessive Scroll", rows: [{ sessionsWithMetricPercentage: 16 }] },
    { name: "Error Click Count", rows: [{ sessionsWithMetricPercentage: 1 }] },
    { name: "Script Error Count", rows: [{ sessionsWithMetricPercentage: 0.5 }] },
    { name: "Device", rows: [{ Device: "Mobile", totalSessionCount: "1390" }, { Device: "Desktop", totalSessionCount: "355" }] },
  ];
}

export function analyzeClarity(metrics: ClarityMetric[]): ClarityAnalysis {
  const traffic = findMetric(metrics, ["traffic"]);
  const trafficRows = traffic?.rows ?? [];
  const sessions = trafficRows.length ? sumBy(trafficRows, isSessionCount) : null;
  const bots = trafficRows.length ? sumBy(trafficRows, isBotCount) : null;
  const users = trafficRows.length ? sumBy(trafficRows, isUserCount) : null;
  const pages = trafficRows.length ? weightedBy(trafficRows, isPagesPerSession, isSessionCount) : null;
  const botShare = sessions && sessions > 0 && bots != null ? bots / sessions : null;

  const scrollM = findMetric(metrics, ["scroll depth", "scrolldepth"]);
  const scroll = scrollM ? weightedBy(scrollM.rows, isScrollDepth, isSessionCount) ?? numBy(scrollM.rows[0], isScrollDepth) : null;

  const engageM = findMetric(metrics, ["engagement time", "engagementtime"]);
  const engage = engageM
    ? weightedBy(engageM.rows, isEngageTime, isSessionCount) ?? numBy(engageM.rows[0], isEngageTime)
    : null;

  const rage = frictionRate(findMetric(metrics, ["rage click"]), sessions);
  const dead = frictionRate(findMetric(metrics, ["dead click"]), sessions);
  const quickback = frictionRate(findMetric(metrics, ["quickback"]), sessions);
  const excessive = frictionRate(findMetric(metrics, ["excessive scroll"]), sessions);
  const errors = frictionRate(findMetric(metrics, ["error click"]), sessions);
  const scripts = frictionRate(findMetric(metrics, ["script error"]), sessions);
  const mobileShare = deviceMobileShare(metrics);

  const pBot = botShare != null ? ratioToPct(botShare) : null;
  const pScroll = scroll != null ? scrollToPct(scroll) : null;
  const pMobile = mobileShare != null ? ratioToPct(mobileShare) : null;
  const pRage = rage;
  const pDead = dead;
  const pQb = quickback;
  const pExcess = excessive;
  const pErr = errors;
  const pScript = scripts;

  const signals: ClaritySignal[] = [
    { label: "Sessions (3 dny)", value: fmtNum(sessions), tone: "neutral" },
    { label: "Lidi (ne boti)", value: fmtNum(users), tone: "neutral" },
    {
      label: "Podíl botů",
      value: fmtPctPoints(pBot),
      tone: toneFromPct(pBot, 50, 25),
    },
    {
      label: "Hloubka scrollu",
      value: fmtPctPoints(pScroll),
      tone: pScroll == null ? "neutral" : pScroll < 40 ? "bad" : pScroll < 55 ? "warn" : "ok",
    },
    {
      label: "Čas na stránce",
      value: fmtTime(engage),
      tone:
        engage == null
          ? "neutral"
          : (engage > 600 ? engage / 1000 : engage) < 20
            ? "bad"
            : (engage > 600 ? engage / 1000 : engage) < 40
              ? "warn"
              : "ok",
    },
    { label: "Rage click", value: fmtPctPoints(pRage), tone: toneFromPct(pRage, 8, 4) },
    { label: "Dead click", value: fmtPctPoints(pDead), tone: toneFromPct(pDead, 15, 8) },
    { label: "Rychlý odchod", value: fmtPctPoints(pQb), tone: toneFromPct(pQb, 25, 15) },
  ];

  const findings: ClarityFinding[] = [];
  const engageSec = engage == null ? null : engage > 600 ? engage / 1000 : engage;
  const parsedFriction = [rage, dead, quickback, scroll, engage, excessive, errors, scripts].some((x) => x != null);
  const n = sessions ?? 0;

  if (pBot != null && pBot >= 40 && n >= 50) {
    findings.push({
      id: "clarity-bots",
      severity: "high",
      title: "Hodně botích sessions v Clarity",
      body: `${pBot} % z ${fmtNum(sessions)} sessions jsou boti. Čísla v Clarity (i Facebook LPV) přeceňují zájem lidí. First-party funnel v Engine je spolehlivější.`,
      action: "Nekalibruj kampaň podle surových sessions. Sleduj InitiateCheckout a waitlist, ne zobrazení stránky.",
    });
  }

  if (pQb != null && pQb >= 20 && n >= 40) {
    findings.push({
      id: "clarity-quickback",
      severity: "critical",
      title: "Lidi hned odcházejí (quickback)",
      body: `${pQb} % sessions skončí rychlým návratem. U Facebook cold traffic to skoro vždycky znamená, že reklama slibuje něco jiného než H1 „Z korporátu k práci, která dává smysl.“`,
      action: "Srovnej text 2–3 nejtočenějších workshop reklam s H1 a podtitulkem. Buď změň reklamu, nebo headline na stejný slib.",
    });
  }

  if (pScroll != null && pScroll < 45 && n >= 40) {
    findings.push({
      id: "clarity-scroll",
      severity: "critical",
      title: "Mělký scroll — termíny lidi nevidí",
      body: `Průměrná hloubka scrollu je ${pScroll} %. Na dlouhé landing page to znamená, že většina nedoroluje k sekci Termíny. Problém je nad foldem (slib, CTA, první dojem), ne výběr kreativy.`,
      action: "Dej termín, cenu 199 Kč a tlačítko Koupit výš. Na mobilu musí CTA jít nad ohyb bez scrollu.",
    });
  }

  if (pRage != null && pRage >= 5 && n >= 40) {
    findings.push({
      id: "clarity-rage",
      severity: "high",
      title: "Rage clicky — něco vypadá rozbitě",
      body: `${pRage} % sessions má rage click (opakované klikání ze vzteku). Nejčastěji cena, neklikací „tlačítko“, nebo prvek, který vypadá jako odkaz.`,
      action: "Zvětši hit-area zeleného Koupit, sjednoť cenu s tlačítkem, zkontroluj, že karusel referencí neschovává CTA.",
    });
  }

  if (pDead != null && pDead >= 10 && n >= 40) {
    findings.push({
      id: "clarity-dead",
      severity: "medium",
      title: "Dead clicky — falešné odkazy",
      body: `${pDead} % sessions kliká na místa, která nejsou klikací. Lidé hledají akci a narážejí na dekoraci (karty, podtržený text, fotky).`,
      action: "Karty v „Co zažiješ“ a citace udělej klikací na #terminy, nebo jim vem vzhled odkazu.",
    });
  }

  if (engageSec != null && engageSec < 20 && n >= 40) {
    findings.push({
      id: "clarity-short",
      severity: "high",
      title: "Na stránce vydrží pod 20 sekund",
      body: `Průměrný čas je ${fmtTime(engage)}. To je jen první pohled, ne čtení nabídky. Cold traffic z Facebooku nenašel důvod zůstat.`,
      action: "První dvě věty musí opakovat slib z reklamy a hned říct cenu, čas a co si odnese. Teorie dolů.",
    });
  }

  if (pExcess != null && pExcess >= 12 && n >= 40) {
    findings.push({
      id: "clarity-excess-scroll",
      severity: "medium",
      title: "Excessive scroll — hledají a nenacházejí",
      body: `${pExcess} % sessions scrolluje přeskakovaně. Typicky hledají cenu, termín nebo „co dostanu“ a stránka to schovává.`,
      action: "Cenu a nejbližší termín opakuj v hero i u CTA. Nenech lidi lovit informace v polovině stránky.",
    });
  }

  if ((pErr != null && pErr >= 5) || (pScript != null && pScript >= 5)) {
    findings.push({
      id: "clarity-errors",
      severity: "high",
      title: "Chyby na stránce berou konverze",
      body: `Error click ${pErr ?? "—"} %, script error ${pScript ?? "—"} %. Když se rozbije tlačítko nebo modal, Facebook traffic koupit nemůže.`,
      action: "Oprav JS u tlačítka Koupit a waitlist modalu. CTA musí otevřít Stripe, modal musí uložit kontakt.",
    });
  }

  if (pages != null && pages < 1.15 && n >= 40) {
    findings.push({
      id: "clarity-single-page",
      severity: "low",
      title: "Skoro nikdo nejde dál než na landing",
      body: `${pages.toFixed(2)} stránky na session. Thank-you skoro nikdo nevidí — nákupy se nedějí, nebo se po Stripe nevrací.`,
      action: "Ověř Stripe redirect na /dekujeme/<termin>. Po zaplacení musí skončit na děkovací stránce.",
    });
  }

  if (pMobile != null && pMobile >= 70 && n >= 40) {
    findings.push({
      id: "clarity-mobile",
      severity: "medium",
      title: "Většina návštěv je z mobilu",
      body: `${pMobile} % sessions je mobil. Desktop layout klame: co vypadá v pořádku na monitoru, na telefonu schovává cenu a Koupit pod ohybem.`,
      action: "Udělej mobilní hero: H1, 199 Kč, nejbližší termín a tlačítko Koupit bez scrollu.",
    });
  }

  if (findings.length === 0 && parsedFriction && n >= 20) {
    findings.push({
      id: "clarity-no-red-flag",
      severity: "ok",
      title: "Clarity nehlásí silný třecí bod",
      body: "Rage/dead/quickback a scroll nejsou v červených pásmech. Úzké hrdlo je spíš nabídka (termín, cena, důvěra) než rozbitá stránka. Sleduj first-party funnel: CTA → checkout → waitlist.",
      action: "Drž message match reklamy s H1 a sbírej InitiateCheckout. Nekopej do layoutu bez nového signálu.",
    });
  }

  if (!parsedFriction && n >= 20) {
    findings.push({
      id: "clarity-partial-parse",
      severity: "low",
      title: "Sessions jsou, tření API nepopsalo",
      body: `Engine vidí ${fmtNum(sessions)} sessions, ale rage/scroll/quickback v odpovědi nenašel. Metriky: ${metrics.map((m) => m.name).join(", ") || "—"}. Pole: ${rowKeys(metrics) || "—"}.`,
      action: "Ber first-party funnel (scroll k termínům, CTA, checkout). Až API pošle friction metriky, objeví se tady samy.",
    });
  }

  if (n < 20 && metrics.length > 0) {
    findings.push({
      id: "clarity-low-n",
      severity: "low",
      title: "Málo sessions na silný závěr",
      body: "API vrací data, ale vzorek je malý. Ber zjištění jako směr, ne jako A/B výsledek.",
      action: "Pusť workshop kampaň s UTM a vrať se za 2–3 dny.",
    });
  }

  if (metrics.length === 0) {
    findings.push({
      id: "clarity-empty",
      severity: "low",
      title: "Clarity API nevrátilo žádnou metriku",
      body: "Token prošel, ale pole metrics je prázdné. Engine nemá z čeho skládat zjištění.",
      action: "Počkej na cache (3 h) nebo zkontroluj, že token patří k projektu ykej9fbehc.",
    });
  }

  return {
    signals,
    findings,
    metricNames: metrics.map((m) => m.name),
  };
}
