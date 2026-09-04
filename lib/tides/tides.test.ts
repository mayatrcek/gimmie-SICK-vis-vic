// Self-check for the harmonic tide prediction. Run: node lib/tides/tides.test.ts
//
// The reference heights are the Bureau's own predictions for 2026, recovered
// from the ABSLMP gauge files as (sea level − residual). 2026 was NOT in the
// fit window (2022–2025), so this checks prediction, not memory: if the
// constituent speeds, the nodal factors or the epoch drift, these blow up.
import assert from "node:assert";
import { predict } from "./harmonics.ts";
import type { TideModel } from "./harmonics.ts";
import { melbourneMs, stationFor, tideSeries } from "./series.ts";

const REF: Record<string, [string, number][]> = {
  lorne: [
    ["2026-01-01T07:00Z", 1.136],
    ["2026-02-05T10:00Z", 0.556],
    ["2026-03-12T13:00Z", 1.149],
    ["2026-04-17T17:00Z", 1.192],
    ["2026-05-22T20:00Z", 1.747],
    ["2026-06-26T23:00Z", 2.184],
  ],
  stonypoint: [
    ["2026-01-01T07:00Z", 0.891],
    ["2026-02-05T15:00Z", 1.886],
    ["2026-03-12T23:00Z", 1.871],
    ["2026-04-17T07:00Z", 1.3],
    ["2026-05-22T15:00Z", 1.44],
    ["2026-06-26T23:00Z", 2.43],
  ],
};

for (const [spot, points] of Object.entries(REF)) {
  const model = stationFor(spot) as TideModel;
  assert.ok(model, `${spot} should map to a gauge`);
  let worst = 0;
  for (const [iso, expected] of points) {
    const got = predict(model, Date.parse(iso));
    worst = Math.max(worst, Math.abs(got - expected));
  }
  // the fitter reports 3-4 cm RMS against a whole hold-out year; 10 cm here is
  // a loose tripwire for a broken constituent, not a tightening target
  assert.ok(worst < 0.1, `${model.station}: worst error ${worst.toFixed(3)} m vs BOM`);
}

// Port Phillip is a wave crawling in through the Heads: without the secondary
// -port offsets, South Channel Fort read 3.5 h early. Published predictions for
// 4 Sep 2026 put its highs at 07:49 and 19:35 and its low at 13:23.
{
  const times: string[] = [];
  for (let m = 0; m < 24 * 60; m += 5)
    times.push(`2026-09-04T${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  const { tide } = tideSeries("fort", times, []);
  const turns: string[] = [];
  for (let i = 1; i < tide.length - 1; i++) {
    const [a, b, c] = [tide[i - 1], tide[i], tide[i + 1]];
    if ((b > a && b >= c) || (b < a && b <= c)) turns.push(times[i].slice(11));
  }
  const mins = (s: string) => +s.slice(0, 2) * 60 + +s.slice(3, 5);
  for (const want of ["07:49", "13:23", "19:35"]) {
    const off = Math.min(...turns.map((t) => Math.abs(mins(t) - mins(want))));
    assert.ok(off <= 20, `South Channel Fort: nearest turn is ${off} min from ${want}`);
  }
  // damped on the way in: about 1.4 m at the fort, not the open coast's 2 m
  const range = Math.max(...tide) - Math.min(...tide);
  assert.ok(range > 1.2 && range < 1.7, `fort range ${range.toFixed(2)} m`);
}
assert.equal(stationFor("lonsdale")!.station, "Lorne"); // Point Lonsdale, outside
assert.equal(stationFor("williamstown")!.station, "Williamstown");

// Sites with no gauge nearby fall back to the corrected model.
assert.equal(stationFor("normanbay"), null); // Wilsons Prom
assert.equal(stationFor("schanck"), null); // Mornington back beach

// Open-Meteo hands back Melbourne local time with no offset on it, and the
// harmonics only work in UTC — so this conversion has to survive both sides of
// the DST switch.
assert.equal(new Date(melbourneMs("2026-01-15T12:00")).toISOString(), "2026-01-15T01:00:00.000Z"); // AEDT
assert.equal(new Date(melbourneMs("2026-07-15T12:00")).toISOString(), "2026-07-15T02:00:00.000Z"); // AEST

console.log("tides.test.ts: ok");
