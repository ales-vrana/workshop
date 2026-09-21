import assert from "node:assert/strict";
import { analyzeClarity, sampleClarityMetrics } from "../lib/clarity-analyze";
import { buildRecommendations } from "../lib/recommendations";

function ids(kind: Parameters<typeof sampleClarityMetrics>[0]) {
  return analyzeClarity(sampleClarityMetrics(kind)).findings.map((f) => f.id);
}

function signal(kind: Parameters<typeof sampleClarityMetrics>[0], label: string) {
  const s = analyzeClarity(sampleClarityMetrics(kind)).signals.find((x) => x.label === label);
  assert.ok(s, `missing signal ${label}`);
  return s.value;
}

{
  const a = analyzeClarity(sampleClarityMetrics("docs-traffic"));
  assert.notEqual(signal("docs-traffic", "Sessions (3 dny)"), "—");
  assert.notEqual(signal("docs-traffic", "Lidi (ne boti)"), "—");
  assert.ok(ids("docs-traffic").includes("clarity-partial-parse"));
  assert.equal(a.findings.some((f) => f.id === "clarity-quickback"), false);
}

{
  const people = signal("traffic-only", "Lidi (ne boti)");
  assert.match(people, /1[\s\u00a0]?412/);
  assert.ok(ids("traffic-only").includes("clarity-partial-parse"));
}

{
  const a = analyzeClarity(sampleClarityMetrics("friction"));
  const want = [
    "clarity-quickback",
    "clarity-scroll",
    "clarity-rage",
    "clarity-dead",
    "clarity-short",
    "clarity-excess-scroll",
    "clarity-mobile",
  ];
  for (const id of want) {
    assert.ok(a.findings.some((f) => f.id === id), `expected finding ${id}, got ${a.findings.map((f) => f.id)}`);
  }
  assert.equal(signal("friction", "Rage click"), "8 %");
  assert.equal(signal("friction", "Rychlý odchod"), "28 %");
  assert.match(signal("friction", "Hloubka scrollu"), /32/);
  assert.notEqual(signal("friction", "Lidi (ne boti)"), "—");
}

{
  const a = analyzeClarity(sampleClarityMetrics("healthy"));
  assert.deepEqual(
    a.findings.map((f) => f.id),
    ["clarity-no-red-flag"],
  );
}

{
  const a = analyzeClarity([
    { name: "Traffic", rows: [{ totalSessionCount: "1000", distinctUserCount: "900" }] },
    { name: "Rage Click Count", rows: [{ rageClickCount: "90" }] },
  ]);
  const rage = a.signals.find((s) => s.label === "Rage click");
  assert.equal(rage?.value, "9 %");
  assert.ok(a.findings.some((f) => f.id === "clarity-rage"));
}

{
  const a = analyzeClarity([]);
  assert.ok(a.findings.some((f) => f.id === "clarity-empty"));
}

{
  const recs = buildRecommendations(
    {
      visits: 10,
      uniqueVisitors: 8,
      viewContent: 8,
      scroll50: 4,
      scrollTerminy: 3,
      heroShowDates: 2,
      ctaClick: 1,
      initiateCheckout: 0,
      waitlist: 0,
      purchases: 0,
    },
    [],
    {
      hasFbToken: true,
      hasStripeWebhook: true,
      persistMode: "neon",
      clarity: analyzeClarity(sampleClarityMetrics("friction")),
    },
  );
  assert.ok(recs.some((r) => r.id === "clarity-quickback"));
  assert.ok(recs.some((r) => r.id === "clarity-scroll"));
  assert.equal(recs.some((r) => r.id === "clarity-single-page" || r.id === "clarity-no-red-flag"), false);
}

console.log("clarity analysis tests ok");
