import assert from "node:assert/strict";
import {
  equalExposurePair,
  funnelCompareRows,
  formatDurationCs,
  formatRelPct,
  windowsForWaves,
  type LaunchWave,
} from "../lib/waves";
import type { FunnelCounts } from "../lib/db";

function wave(id: number, name: string, started_at: string): LaunchWave {
  return { id, name, started_at, notes: null, created_at: started_at };
}

const empty: FunnelCounts = {
  visits: 0,
  uniqueVisitors: 0,
  viewContent: 0,
  scroll50: 0,
  scrollTerminy: 0,
  heroShowDates: 0,
  ctaClick: 0,
  initiateCheckout: 0,
  waitlist: 0,
  purchases: 0,
};

{
  const now = new Date("2026-09-22T08:00:00.000Z");
  const wins = windowsForWaves(
    [
      wave(2, "B", "2026-09-21T20:48:40.000Z"),
      wave(1, "A", "2026-09-21T19:54:38.000Z"),
      wave(0, "0", "2020-01-01T00:00:00.000Z"),
    ],
    now,
  );
  assert.equal(wins.length, 3);
  assert.equal(wins[1].wave.name, "A");
  assert.equal(wins[1].to.toISOString(), "2026-09-21T20:48:40.000Z");
  assert.equal(wins[2].to.toISOString(), now.toISOString());

  const pair = equalExposurePair(wins, now);
  assert.ok(pair);
  assert.equal(pair!.current.wave.name, "B");
  assert.equal(pair!.previous.wave.name, "A");
  // A trvala ~54 min, B už běží déle → okno = délka A
  const aMs = new Date("2026-09-21T20:48:40.000Z").getTime() - new Date("2026-09-21T19:54:38.000Z").getTime();
  assert.equal(pair!.exposureMs, aMs);
  assert.equal(pair!.previous.to.toISOString(), "2026-09-21T20:48:40.000Z");
  assert.equal(pair!.current.to.toISOString(), new Date(new Date("2026-09-21T20:48:40.000Z").getTime() + aMs).toISOString());
}

{
  assert.equal(formatDurationCs(54 * 60 * 1000), "54 min");
  assert.match(formatDurationCs(10 * 3600 * 1000), /10 h/);
  assert.equal(formatRelPct(12, 8), "+50 %");
  assert.equal(formatRelPct(6, 8), "-25 %");
}

{
  const rows = funnelCompareRows(
    { ...empty, uniqueVisitors: 100, heroShowDates: 20, visits: 120 },
    { ...empty, uniqueVisitors: 100, heroShowDates: 10, visits: 110 },
  );
  const hero = rows.find((r) => r.id === "hero")!;
  assert.equal(hero.currentRate, 0.2);
  assert.equal(hero.previousRate, 0.1);
}

console.log("wave-compare ok");
