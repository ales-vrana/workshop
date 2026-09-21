import type { ClarityAnalysis } from "@/lib/clarity-analyze";
import { CLARITY_URL } from "@/lib/paths";

const SEV: Record<string, string> = {
  critical: "kritické",
  high: "vysoké",
  medium: "střední",
  low: "nízké",
  ok: "v pořádku",
};

export function ClarityInsights({
  configured,
  error,
  analysis,
}: {
  configured: boolean;
  error: string | null;
  analysis: ClarityAnalysis | null;
}) {
  return (
    <section id="clarity" className="scroll-mt-6 rounded-2xl border border-navy-100/70 bg-white p-6 shadow-soft">
      <h2 className="text-lg font-extrabold text-navy-700">Microsoft Clarity</h2>
      <p className="text-sm text-dark/60 mt-1">
        Engine z rage clicků, scrollu a odchodů skládá, co změnit na landing / v reklamě. Nahrávky nemusíš
        procházet ručně — stejná zjištění jsou i v Doporučeních.
      </p>
      {!configured ? (
        <>
          <p className="text-sm text-dark/70 mt-3 leading-relaxed">
            Token chybí. Nahrávky na webu běží, ale Engine z nich nemůže počítat.
          </p>
          <p className="text-xs text-dark/50 mt-2">docs/CLARITY-API-SETUP.md</p>
        </>
      ) : error && error !== "missing_config" ? (
        <p className="text-sm text-red-600 mt-3">Clarity API: {error}</p>
      ) : analysis ? (
        <>
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {analysis.signals.map((s) => (
              <div
                key={s.label}
                className={`rounded-xl border p-4 ${
                  s.tone === "bad"
                    ? "border-red-200 bg-red-50"
                    : s.tone === "warn"
                      ? "border-gold-200 bg-gold-50/40"
                      : "border-navy-100 bg-cream/50"
                }`}
              >
                <p className="text-[11px] uppercase tracking-wider font-bold text-navy-500">{s.label}</p>
                <p className="mt-1 text-2xl font-extrabold text-navy-800">{s.value}</p>
              </div>
            ))}
          </div>
          <h3 className="mt-6 text-base font-extrabold text-navy-700">Zjištění z chování na stránce</h3>
          <div className="mt-3 grid gap-3">
            {analysis.findings.map((f) => (
              <article
                key={f.id}
                className={`rounded-xl border p-4 ${
                  f.severity === "critical"
                    ? "border-red-200"
                    : f.severity === "high"
                      ? "border-gold-200"
                      : "border-navy-100/70"
                }`}
              >
                <p className="text-[11px] uppercase tracking-wider font-bold text-navy-500">
                  {SEV[f.severity] ?? f.severity}
                </p>
                <h4 className="mt-1 font-extrabold text-navy-800">{f.title}</h4>
                <p className="mt-2 text-sm text-dark/70 leading-relaxed">{f.body}</p>
                <p className="mt-2 text-sm font-semibold text-navy-700">Další krok: {f.action}</p>
              </article>
            ))}
          </div>
          {analysis.metricNames.length > 0 && (
            <p className="mt-4 text-xs text-dark/40">
              API vrátilo metriky: {analysis.metricNames.join(", ")} (UTC, 3 dny, cache až 3 h).
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-dark/60 mt-3">Token je nastavený, ale API nevrátilo metriky.</p>
      )}
      <a href={CLARITY_URL} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-5 inline-flex">
        Otevřít nahrávky v Clarity
      </a>
    </section>
  );
}
