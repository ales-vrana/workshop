import { unstable_cache } from "next/cache";

export type ClarityMetric = {
  name: string;
  rows: Array<Record<string, string | number>>;
};

export function clarityConfigured(): boolean {
  return Boolean(process.env.CLARITY_API_TOKEN);
}

async function fetchClarityLiveInsightsUncached(): Promise<{
  metrics: ClarityMetric[];
  error: string | null;
}> {
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
    const json = (await res.json()) as Array<{ metricName?: string; information?: Array<Record<string, unknown>> }>;
    const metrics: ClarityMetric[] = (Array.isArray(json) ? json : []).map((m) => ({
      name: String(m.metricName || "metric"),
      rows: (m.information || []).map((row) => {
        const out: Record<string, string | number> = {};
        for (const [k, v] of Object.entries(row)) {
          if (typeof v === "number") out[k] = v;
          else out[k] = String(v ?? "");
        }
        return out;
      }),
    }));
    return { metrics, error: null };
  } catch (err) {
    return { metrics: [], error: err instanceof Error ? err.message : "Clarity API selhalo" };
  }
}

/** Max 10 volání denně — cache na 6 hodin. */
export const fetchClarityLiveInsights = unstable_cache(
  fetchClarityLiveInsightsUncached,
  ["clarity-live-insights-v1"],
  { revalidate: 6 * 60 * 60 },
);

export function pickTrafficSummary(metrics: ClarityMetric[]): {
  sessions: string;
  users: string;
  pagesPerSession: string;
} | null {
  const traffic = metrics.find((m) => m.name.toLowerCase() === "traffic");
  const row = traffic?.rows[0];
  if (!row) return null;
  return {
    sessions: String(row.totalSessionCount ?? "—"),
    users: String(row.distantUserCount ?? "—"),
    pagesPerSession: row.PagesPerSessionPercentage != null ? String(row.PagesPerSessionPercentage) : "—",
  };
}
