import { CopyButton } from "@/components/CopyButton";
import {
  getCreatives,
  getFunnel,
  getHypotheses,
  getWaitlist,
  persistMode,
} from "@/lib/db";
import { fetchFacebookAdInsights, facebookConfigured } from "@/lib/facebook";
import { buildRecommendations } from "@/lib/recommendations";
import { apiUrl, BASE_PATH, CLARITY_URL } from "@/lib/paths";
import { HypothesesForm, HypothesisStatus } from "./HypothesesForm";

export const dynamic = "force-dynamic";

function pct(part: number, whole: number): string {
  if (!whole) return "—";
  return `${Math.round((part / whole) * 100)} %`;
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("cs-CZ");
}

const NAV = [
  { href: "#funnel", label: "Funnel" },
  { href: "#kreativy", label: "Kreativy" },
  { href: "#waitlist", label: "Waitlist" },
  { href: "#doporuceni", label: "Doporučení" },
  { href: "#clarity", label: "Clarity" },
  { href: "#facebook", label: "Facebook" },
  { href: "#hypotezy", label: "Hypotézy" },
];

export default async function EnginePage() {
  const mode = persistMode();
  const [funnel, creatives, waitlist, hypotheses, fb] = await Promise.all([
    getFunnel(),
    getCreatives(),
    getWaitlist(),
    getHypotheses(),
    fetchFacebookAdInsights(),
  ]);

  const recs = buildRecommendations(funnel, creatives, {
    hasFbToken: facebookConfigured(),
    hasStripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    persistMode: mode,
  });

  const emails = waitlist.map((w) => w.email).join("\n");
  const visitors = funnel.uniqueVisitors || funnel.visits;

  const steps = [
    { label: "Návštěvy", value: funnel.visits, hint: `${funnel.uniqueVisitors} unikátních` },
    { label: "Scroll 50 %", value: funnel.scroll50, hint: pct(funnel.scroll50, visitors) },
    { label: "Viděli termíny", value: funnel.scrollTerminy, hint: pct(funnel.scrollTerminy, visitors) },
    { label: "Klik CTA", value: funnel.ctaClick, hint: pct(funnel.ctaClick, visitors) },
    { label: "Checkout", value: funnel.initiateCheckout, hint: pct(funnel.initiateCheckout, visitors) },
    { label: "Nákupy", value: funnel.purchases, hint: "Stripe webhook" },
  ];

  return (
    <div className="min-h-screen">
      <header className="bg-navy-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-gold-400 font-bold">CoachVille · interní</p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold">Workshop Engine</h1>
            <p className="mt-2 text-sm text-white/70 max-w-2xl">
              Pilotní cockpit: nejdřív první konverze (message–landing fit), teprve potom soutěž kreativ.
              Data jsou first-party, ne Facebook.
            </p>
          </div>
          <p className="text-xs text-white/50">
            úložiště: {mode === "neon" ? "Neon" : mode === "file" ? "lokální soubor" : "není"}
          </p>
        </div>
        <nav className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex gap-4 overflow-x-auto text-sm font-semibold">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="text-white/80 hover:text-white whitespace-nowrap">
                {n.label}
              </a>
            ))}
          </div>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        <section id="funnel" className="scroll-mt-6">
          <h2 className="text-lg font-extrabold text-navy-700">Funnel</h2>
          <p className="text-sm text-dark/60 mt-1 mb-4">
            Unikátní návštěvníci na kroku, kromě surových page_view. Waitlist je zvlášť — není nákup, ale proxy zájem.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {steps.map((s) => (
              <div key={s.label} className="rounded-2xl bg-white border border-navy-100/70 p-4 shadow-soft">
                <p className="text-[11px] uppercase tracking-wider text-navy-500 font-bold">{s.label}</p>
                <p className="mt-2 text-2xl font-extrabold text-navy-800">{s.value}</p>
                <p className="mt-1 text-xs text-dark/50">{s.hint}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-2xl bg-white border border-navy-100/70 p-4 shadow-soft flex items-baseline justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-navy-500 font-bold">Waitlist</p>
              <p className="mt-2 text-2xl font-extrabold text-navy-800">{funnel.waitlist}</p>
            </div>
            <p className="text-sm text-dark/60">„Nevyhovuje mi termín“ — Lead pro Meta</p>
          </div>
        </section>

        <section id="kreativy" className="scroll-mt-6">
          <h2 className="text-lg font-extrabold text-navy-700">Kreativy (UTM)</h2>
          <p className="text-sm text-dark/60 mt-1 mb-4">
            Řádky podle <code className="text-navy-700">utm_content</code> (má to být <code>{"{{ad.id}}"}</code>).
            Dokud jsou nákupy nula, řadíme podle checkoutu a waitlistu.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-navy-100/70 bg-white shadow-soft">
            <table className="min-w-full text-sm">
              <thead className="bg-cream text-left text-[11px] uppercase tracking-wider text-navy-600">
                <tr>
                  {["Kampaň", "Kreativa", "Návštěvy", "CTA", "Checkout", "Waitlist", "Nákupy", "CVR"].map((h) => (
                    <th key={h} className="px-4 py-3 font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {creatives.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-dark/50">
                      Zatím žádné eventy. Otevři landing s UTM a klikni.
                    </td>
                  </tr>
                ) : (
                  creatives.map((c) => {
                    const fbAd = fb.ads.find((a) => a.ad_id === c.utm_content);
                    const cvr =
                      c.uniqueVisitors > 0
                        ? `${Math.round(((c.purchases || c.checkout || c.waitlist) / c.uniqueVisitors) * 1000) / 10} %`
                        : "—";
                    return (
                      <tr key={c.key} className="border-t border-navy-50">
                        <td className="px-4 py-3">{c.utm_campaign}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-navy-800">{c.utm_content}</div>
                          {fbAd && (
                            <div className="text-xs text-dark/50 mt-0.5">
                              {fbAd.ad_name} · {fbAd.spend.toFixed(0)} Kč · freq {fbAd.frequency.toFixed(1)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {c.visits}
                          <span className="text-dark/40"> / {c.uniqueVisitors}</span>
                        </td>
                        <td className="px-4 py-3">{c.cta}</td>
                        <td className="px-4 py-3">{c.checkout}</td>
                        <td className="px-4 py-3">{c.waitlist}</td>
                        <td className="px-4 py-3">{c.purchases}</td>
                        <td className="px-4 py-3">{cvr}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section id="waitlist" className="scroll-mt-6">
          <div className="flex flex-wrap items-center gap-3 justify-between mb-4">
            <div>
              <h2 className="text-lg font-extrabold text-navy-700">Waitlist</h2>
              <p className="text-sm text-dark/60 mt-1">
                Lidé, kteří chtějí jiný termín. E-maily posílej ručně, dokud nebude automat.
              </p>
            </div>
            <div className="flex gap-2">
              <CopyButton text={emails} label="Kopírovat e-maily" />
              <a
                href={apiUrl("/api/engine/waitlist-csv")}
                className="inline-flex items-center text-xs font-semibold rounded-md px-2.5 py-1.5 border border-teal-400/30 text-teal-700 bg-white hover:bg-teal-50 min-h-[36px]"
              >
                Stáhnout CSV
              </a>
            </div>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-navy-100/70 bg-white shadow-soft">
            <table className="min-w-full text-sm">
              <thead className="bg-cream text-left text-[11px] uppercase tracking-wider text-navy-600">
                <tr>
                  {["Kdy", "Jméno", "E-mail", "Telefon", "Kreativa"].map((h) => (
                    <th key={h} className="px-4 py-3 font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {waitlist.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-dark/50">
                      Zatím prázdné. Vyzkoušej formulář „Nevyhovuje mi žádný termín“.
                    </td>
                  </tr>
                ) : (
                  waitlist.map((w) => (
                    <tr key={w.id} className="border-t border-navy-50">
                      <td className="px-4 py-3 whitespace-nowrap text-dark/60">{formatWhen(w.created_at)}</td>
                      <td className="px-4 py-3 font-semibold">{w.jmeno}</td>
                      <td className="px-4 py-3">{w.email}</td>
                      <td className="px-4 py-3">{w.telefon || "—"}</td>
                      <td className="px-4 py-3">{w.utm_content || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section id="doporuceni" className="scroll-mt-6">
          <h2 className="text-lg font-extrabold text-navy-700">Doporučení</h2>
          <p className="text-sm text-dark/60 mt-1 mb-4">
            Pravidla, ne magie. Cíl MVP: najít cestu k první konverzi, ne vybrat vítěznou reklamu.
          </p>
          <div className="grid gap-4">
            {recs.map((r) => (
              <article
                key={r.id}
                className={`rounded-2xl border bg-white p-5 shadow-soft ${
                  r.severity === "critical"
                    ? "border-red-200"
                    : r.severity === "high"
                      ? "border-gold-200"
                      : "border-navy-100/70"
                }`}
              >
                <p className="text-[11px] uppercase tracking-wider font-bold text-navy-500">{r.severity}</p>
                <h3 className="mt-1 font-extrabold text-navy-800">{r.title}</h3>
                <p className="mt-2 text-sm text-dark/70 leading-relaxed">{r.body}</p>
                <p className="mt-3 text-sm font-semibold text-navy-700">Další krok: {r.action}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="clarity" className="scroll-mt-6 rounded-2xl border border-navy-100/70 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-extrabold text-navy-700">Microsoft Clarity</h2>
          <p className="text-sm text-dark/70 mt-2 leading-relaxed">
            Nahrávky už běží (projekt <code>ykej9fbehc</code>). Engine do nich posílá custom tagy{" "}
            <code>utm_content</code>, <code>utm_campaign</code> a <code>visitor_id</code>. Data Export API napojíme, až
            bude token — teď stačí koukat ručně.
          </p>
          <ul className="mt-4 text-sm text-dark/80 list-disc pl-5 space-y-1">
            <li>Prvních 10 sekund: čtou H1, nebo hned bounce?</li>
            <li>Rage click u ceny / tlačítka Koupit</li>
            <li>Odchod před sekcí Termíny</li>
            <li>Filtr nahrávek podle custom tagu utm_content = id reklamy</li>
          </ul>
          <a
            href={CLARITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary mt-5 inline-flex"
          >
            Otevřít Clarity
          </a>
        </section>

        <section id="facebook" className="scroll-mt-6 rounded-2xl border border-navy-100/70 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-extrabold text-navy-700">Facebook Ads</h2>
          {!facebookConfigured() ? (
            <>
              <p className="text-sm text-dark/70 mt-2 leading-relaxed">
                Token ještě není. Funnel z landing page běží bez něj. Až doplníš{" "}
                <code>FB_ACCESS_TOKEN</code> a <code>FB_AD_ACCOUNT_ID</code>, tady uvidíš spend, CTR, CPC a frequency
                po reklamě (párování přes <code>utm_content = ad.id</code>).
              </p>
              <p className="text-sm font-semibold text-navy-700 mt-3">
                Návod: <code>{BASE_PATH}</code> repo → <code>docs/FACEBOOK-API-SETUP.md</code>
              </p>
            </>
          ) : fb.error ? (
            <p className="text-sm text-red-600 mt-2">Facebook API: {fb.error}</p>
          ) : fb.ads.length === 0 ? (
            <p className="text-sm text-dark/60 mt-2">API je napojené, za posledních 30 dní nejsou insights.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-cream text-left text-[11px] uppercase tracking-wider text-navy-600">
                  <tr>
                    {["Ad", "Spend", "Impr.", "Clicks", "CTR", "CPC", "Freq", "LPV"].map((h) => (
                      <th key={h} className="px-3 py-2 font-bold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fb.ads.map((a) => (
                    <tr key={a.ad_id} className="border-t border-navy-50">
                      <td className="px-3 py-2">
                        <div className="font-semibold">{a.ad_name}</div>
                        <div className="text-xs text-dark/50">{a.ad_id}</div>
                      </td>
                      <td className="px-3 py-2">{a.spend.toFixed(0)}</td>
                      <td className="px-3 py-2">{a.impressions}</td>
                      <td className="px-3 py-2">{a.clicks}</td>
                      <td className="px-3 py-2">{a.ctr.toFixed(2)} %</td>
                      <td className="px-3 py-2">{a.cpc.toFixed(2)}</td>
                      <td className="px-3 py-2">{a.frequency.toFixed(2)}</td>
                      <td className="px-3 py-2">{a.landing_page_views}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section id="hypotezy" className="scroll-mt-6 rounded-2xl border border-navy-100/70 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-extrabold text-navy-700">Hypotézy</h2>
          <p className="text-sm text-dark/60 mt-1">
            Zapisuj, co testuješ. A/B runner headlineů přijde až ve fázi 2 — nejdřív potřebujeme checkout.
          </p>
          <HypothesesForm />
          <ul className="mt-6 space-y-3">
            {hypotheses.length === 0 && (
              <li className="text-sm text-dark/50">Zatím žádná hypotéza.</li>
            )}
            {hypotheses.map((h) => (
              <li key={h.id} className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between border border-navy-50 rounded-xl px-4 py-3">
                <div>
                  <p className="font-semibold text-navy-800">{h.text}</p>
                  <p className="text-xs text-dark/50 mt-1">
                    {h.metric || "bez metru"} · {formatWhen(h.created_at)}
                  </p>
                </div>
                <HypothesisStatus id={h.id} status={h.status} />
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
