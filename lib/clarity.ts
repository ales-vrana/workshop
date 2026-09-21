import { unstable_cache } from "next/cache";
import { analyzeClarity, sampleClarityMetrics, type ClarityMetric } from "./clarity-analyze";

export type {
  ClarityMetric,
  ClarityFinding,
  ClaritySignal,
  ClarityAnalysis,
} from "./clarity-analyze";
export { analyzeClarity, sampleClarityMetrics };

export function clarityConfigured(): boolean {
  return Boolean(process.env.CLARITY_API_TOKEN);
}

export function parseClarityApiJson(json: unknown): ClarityMetric[] {
  const list = Array.isArray(json)
    ? json
    : json && typeof json === "object"
      ? ([
          "value",
          "data",
          "metrics",
          "result",
        ]
          .map((k) => (json as Record<string, unknown>)[k])
          .find((v) => Array.isArray(v)) as unknown[] | undefined) ?? []
      : [];

  return list.map((raw) => {
    const m = (raw ?? {}) as { metricName?: string; name?: string; information?: unknown; rows?: unknown };
    const info = m.information ?? m.rows;
    const rowsIn = Array.isArray(info) ? info : info && typeof info === "object" ? [info] : [];
    return {
      name: String(m.metricName || m.name || "metric"),
      rows: rowsIn.map((row) => {
        const out: Record<string, string | number> = {};
        if (row && typeof row === "object") {
          for (const [k, v] of Object.entries(row as Record<string, unknown>)) {
            if (typeof v === "number") out[k] = v;
            else out[k] = String(v ?? "");
          }
        }
        return out;
      }),
    };
  });
}

async function fetchClarityLiveInsightsUncached(): Promise<{
  metrics: ClarityMetric[];
  error: string | null;
}> {
  if (process.env.NODE_ENV !== "production" && process.env.CLARITY_DEBUG_FIXTURE === "1") {
    return { metrics: sampleClarityMetrics("friction"), error: null };
  }

  const token = process.env.CLARITY_API_TOKEN;
  if (!token) {
    return { metrics: [], error: "missing_config" };
  }

  try {
    const url = "https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=3";
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    if (res.status === 401 || res.status === 403) {
      return { metrics: [], error: "Token je neplatný nebo nemá práva (401/403)." };
    }
    if (res.status === 429) {
      return { metrics: [], error: "Clarity API: denní limit 10 požadavků. Zkus to za hodinu." };
    }
    if (!res.ok) {
      const text = await res.text();
      return { metrics: [], error: `Clarity API ${res.status}: ${text.slice(0, 180)}` };
    }
    const json: unknown = await res.json();
    return { metrics: parseClarityApiJson(json), error: null };
  } catch (err) {
    return { metrics: [], error: err instanceof Error ? err.message : "Clarity API selhalo" };
  }
}

/** Max 10 volání denně — cache na 3 hodiny (víc metrik, stejný jeden request). */
export const fetchClarityLiveInsights = unstable_cache(
  fetchClarityLiveInsightsUncached,
  ["clarity-live-insights-v3"],
  { revalidate: 3 * 60 * 60 },
);
