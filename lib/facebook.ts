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

/** Kampaň, sada i kreativa: v názvu musí být „workshop“, jinak se v Engine nepočítá. */
export function isWorkshopNamed(ad: Pick<FacebookAdInsight, "ad_name" | "campaign_name" | "adset_name">): boolean {
  const hay = `${ad.ad_name} ${ad.campaign_name} ${ad.adset_name}`.toLowerCase();
  return hay.includes("workshop");
}

export async function fetchFacebookAdInsights(): Promise<{
  ads: FacebookAdInsight[];
  hiddenCount: number;
  error: string | null;
}> {
  const token = process.env.FB_ACCESS_TOKEN;
  let account = process.env.FB_AD_ACCOUNT_ID || "";
  if (!token || !account) {
    return { ads: [], hiddenCount: 0, error: "missing_config" };
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
    type InsightsPage = {
      error?: { message?: string };
      data?: Array<Record<string, unknown>>;
      paging?: { next?: string };
    };

    const rows: Array<Record<string, unknown>> = [];
    let url: string | null = `https://graph.facebook.com/v21.0/${account}/insights?${params.toString()}`;
    let pages = 0;
    while (url && pages < 15) {
      pages += 1;
      const res = await fetch(url, { cache: "no-store" });
      const json = (await res.json()) as InsightsPage;
      if (!res.ok) {
        return {
          ads: [],
          hiddenCount: 0,
          error: json.error?.message || `Facebook API ${res.status}`,
        };
      }
      rows.push(...(json.data || []));
      url = json.paging?.next || null;
    }

    const all: FacebookAdInsight[] = rows.map((row) => {
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
    const ads = all.filter(isWorkshopNamed);
    return { ads, hiddenCount: all.length - ads.length, error: null };
  } catch (err) {
    return {
      ads: [],
      hiddenCount: 0,
      error: err instanceof Error ? err.message : "Facebook API selhalo",
    };
  }
}
