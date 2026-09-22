import type { FunnelCounts } from "./db";

/**
 * Sekvenční „vlny“ (ship-and-compare), ne souběžný A/B split.
 *
 * Industry praxe (Amplitude annotations, Mixpanel date compare, pre-post):
 * 1. Událost patří vlně podle času (kdy byla stránka v dané verzi).
 * 2. Nová vs předchozí se srovnává ve STEJNÉ DÉLCE od startu každé vlny —
 *    jinak 2 dny nové copy prohrají s 3 týdny staré jen kvůli objemu.
 * 3. U konverzí čteme sazby (unikátní návštěvníci), ne jen kusy.
 * 4. Pod 30 unikátních je „ještě brzy“, ne výsledek testu.
 */

export const MIN_SAMPLE = 30;

export type LaunchWave = {
  id: number;
  name: string;
  started_at: string;
  notes: string | null;
  created_at: string;
};

export type WaveWindow = {
  wave: LaunchWave;
  from: Date;
  to: Date;
};

export type ExposurePair = {
  current: WaveWindow;
  previous: WaveWindow;
  exposureMs: number;
};

export function windowsForWaves(waves: LaunchWave[], now = new Date()): WaveWindow[] {
  const sorted = [...waves].sort(
    (a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime(),
  );
  return sorted.map((wave, i) => ({
    wave,
    from: new Date(wave.started_at),
    to: i + 1 < sorted.length ? new Date(sorted[i + 1].started_at) : now,
  }));
}

export function equalExposurePair(windows: WaveWindow[], now = new Date()): ExposurePair | null {
  if (windows.length < 2) return null;
  const current = windows[windows.length - 1];
  const previous = windows[windows.length - 2];
  const currentElapsed = Math.max(
    0,
    Math.min(now.getTime(), current.to.getTime()) - current.from.getTime(),
  );
  const previousElapsed = Math.max(0, previous.to.getTime() - previous.from.getTime());
  const exposureMs = Math.min(currentElapsed, previousElapsed);
  if (exposureMs <= 0) return null;
  return {
    current: { ...current, to: new Date(current.from.getTime() + exposureMs) },
    previous: { ...previous, to: new Date(previous.from.getTime() + exposureMs) },
    exposureMs,
  };
}

export function formatDurationCs(ms: number): string {
  const min = Math.round(ms / 60000);
  if (min < 90) return `${Math.max(1, min)} min`;
  const h = Math.round(min / 60);
  if (h < 48) return `${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return "1 den";
  if (d >= 2 && d <= 4) return `${d} dny`;
  return `${d} dní`;
}

export type CompareKind = "count" | "rate";

export type CompareRow = {
  id: string;
  label: string;
  kind: CompareKind;
  currentAbs: number;
  previousAbs: number;
  currentRate: number | null;
  previousRate: number | null;
};

function rate(part: number, whole: number): number | null {
  if (!whole) return null;
  return part / whole;
}

export function funnelCompareRows(current: FunnelCounts, previous: FunnelCounts): CompareRow[] {
  const cVis = current.uniqueVisitors || current.visits;
  const pVis = previous.uniqueVisitors || previous.visits;
  return [
    {
      id: "visitors",
      label: "Unikátní návštěvy",
      kind: "count",
      currentAbs: current.uniqueVisitors,
      previousAbs: previous.uniqueVisitors,
      currentRate: null,
      previousRate: null,
    },
    {
      id: "visits",
      label: "Zobrazení stránky",
      kind: "count",
      currentAbs: current.visits,
      previousAbs: previous.visits,
      currentRate: null,
      previousRate: null,
    },
    {
      id: "hero",
      label: "Hero CTA (zobrazit termíny)",
      kind: "rate",
      currentAbs: current.heroShowDates,
      previousAbs: previous.heroShowDates,
      currentRate: rate(current.heroShowDates, cVis),
      previousRate: rate(previous.heroShowDates, pVis),
    },
    {
      id: "scroll",
      label: "Viděli termíny",
      kind: "rate",
      currentAbs: current.scrollTerminy,
      previousAbs: previous.scrollTerminy,
      currentRate: rate(current.scrollTerminy, cVis),
      previousRate: rate(previous.scrollTerminy, pVis),
    },
    {
      id: "cta",
      label: "Klik na koupi",
      kind: "rate",
      currentAbs: current.ctaClick,
      previousAbs: previous.ctaClick,
      currentRate: rate(current.ctaClick, cVis),
      previousRate: rate(previous.ctaClick, pVis),
    },
    {
      id: "checkout",
      label: "Checkout",
      kind: "rate",
      currentAbs: current.initiateCheckout,
      previousAbs: previous.initiateCheckout,
      currentRate: rate(current.initiateCheckout, cVis),
      previousRate: rate(previous.initiateCheckout, pVis),
    },
    {
      id: "purchases",
      label: "Nákupy",
      kind: "rate",
      currentAbs: current.purchases,
      previousAbs: previous.purchases,
      currentRate: rate(current.purchases, cVis),
      previousRate: rate(previous.purchases, pVis),
    },
    {
      id: "waitlist",
      label: "Waitlist",
      kind: "rate",
      currentAbs: current.waitlist,
      previousAbs: previous.waitlist,
      currentRate: rate(current.waitlist, cVis),
      previousRate: rate(previous.waitlist, pVis),
    },
  ];
}

export function deltaTone(row: CompareRow): "up" | "down" | "flat" {
  const cur = row.kind === "rate" ? row.currentRate : row.currentAbs;
  const prev = row.kind === "rate" ? row.previousRate : row.previousAbs;
  if (cur == null || prev == null) return "flat";
  const diff = cur - prev;
  if (Math.abs(diff) < 1e-9) return "flat";
  if (row.id === "visitors" || row.id === "visits") {
    return "flat";
  }
  return diff > 0 ? "up" : "down";
}

export function formatPctPoints(current: number | null, previous: number | null): string {
  if (current == null || previous == null) return "—";
  const pp = (current - previous) * 100;
  const sign = pp > 0 ? "+" : "";
  return `${sign}${pp.toFixed(1).replace(".", ",")} pp`;
}

export function formatRelPct(current: number, previous: number): string {
  if (!previous) return current ? "nové" : "—";
  const rel = ((current - previous) / previous) * 100;
  const sign = rel > 0 ? "+" : "";
  return `${sign}${Math.round(rel)} %`;
}

export function formatRate(value: number | null): string {
  if (value == null) return "—";
  return `${(value * 100).toFixed(1).replace(".", ",")} %`;
}

export function formatWhenPrague(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("cs-CZ", { timeZone: "Europe/Prague" });
}
