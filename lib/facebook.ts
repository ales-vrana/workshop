export type FacebookAdInsight = {
  ad_id: string;
  ad_name: string;
  campaign_name: string;
  adset_name: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  frequency: number;
  landing_page_views: number;
  error?: string;
};

export function facebookConfigured(): boolean {
  return Boolean(process.env.FB_ACCESS_TOKEN && process.env.FB_AD_ACCOUNT_ID);
}

function num(v: unknown): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "0"));
  return Number.isFinite(n) ? n : 0;
}

export async function fetchFacebookAdInsights(): Promise<{
  ads: FacebookAdInsight[];
  error: string | null;
}> {
  const token = process.env.FB_ACCESS_TOKEN;
  let account = process.env.FB_AD_ACCOUNT_ID || "";
  if (!token || !account) {
    return { ads: [], error: "missing_config" };
  }
  if (!account.startsWith("act_")) account = `act_${account}`;

  const params = new URLSearchParams({
    access_token: token,
    level: "ad",
    date_preset: "last_30d",
    limit: "100",
    fields: [
      "ad_id",
      "ad_name",
      "campaign_name",
      "adset_name",
      "spend",
      "impressions",
      "clicks",
      "ctr",
      "cpc",
      "cpm",
      "frequency",
      "actions",
    ].join(","),
  });

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${account}/insights?${params.toString()}`,
      { cache: "no-store" },
    );
    const json = (await res.json()) as {
      error?: { message?: string };
      data?: Array<Record<string, unknown>>;
    };
    if (!res.ok) {
      return { ads: [], error: json.error?.message || `Facebook API ${res.status}` };
    }
    const ads: FacebookAdInsight[] = (json.data || []).map((row) => {
      const actions = Array.isArray(row.actions) ? (row.actions as Array<{ action_type: string; value: string }>) : [];
      const lpv = actions.find((a) => a.action_type === "landing_page_view" || a.action_type === "omni_landing_page_view");
      return {
        ad_id: String(row.ad_id || ""),
        ad_name: String(row.ad_name || ""),
        campaign_name: String(row.campaign_name || ""),
        adset_name: String(row.adset_name || ""),
        spend: num(row.spend),
        impressions: num(row.impressions),
        clicks: num(row.clicks),
        ctr: num(row.ctr),
        cpc: num(row.cpc),
        cpm: num(row.cpm),
        frequency: num(row.frequency),
        landing_page_views: num(lpv?.value),
      };
    });
    return { ads, error: null };
  } catch (err) {
    return { ads: [], error: err instanceof Error ? err.message : "Facebook API selhalo" };
  }
}
