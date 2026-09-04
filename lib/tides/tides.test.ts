// Self-check for the harmonic tide prediction. Run: node lib/tides/tides.test.ts
//
// The reference heights are the Bureau's own predictions for 2026, recovered
// from the ABSLMP gauge files as (sea level − residual). 2026 was NOT in the
// fit window (2022–2025), so this checks prediction, not memory: if the
// constituent speeds, the nodal factors or the epoch drift, these blow up.
import assert from "node:assert";
import { predict } from "./harmonics.ts";
import type { TideModel } from "./harmonics.ts";
import { melbourneMs, stationFor } from "./series.ts";

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

// Inside Port Phillip the bay turns hours after the ocean outside, so a site
// past the Heads must not end up on the open-coast gauge (South Channel Fort
// read 3.5 h early when it did).
assert.equal(stationFor("fort")!.station, "Williamstown");
assert.equal(stationFor("ryepier")!.station, "Williamstown");
assert.equal(stationFor("lonsdale")!.station, "Lorne"); // Point Lonsdale, outside

// Sites with no gauge nearby fall back to the corrected model.
assert.equal(stationFor("normanbay"), null); // Wilsons Prom
assert.equal(stationFor("schanck"), null); // Mornington back beach

// Open-Meteo hands back Melbourne local time with no offset on it, and the
// harmonics only work in UTC — so this conversion has to survive both sides of
// the DST switch.
assert.equal(new Date(melbourneMs("2026-01-15T12:00")).toISOString(), "2026-01-15T01:00:00.000Z"); // AEDT
assert.equal(new Date(melbourneMs("2026-07-15T12:00")).toISOString(), "2026-07-15T02:00:00.000Z"); // AEST

console.log("tides.test.ts: ok");
