// Self-check for the rating logic. Run: node lib/logic/rating.test.ts
// (Node 24 strips TS types natively; uses relative imports so no alias resolver needed.)
import assert from "node:assert";
import { classify, compass, dayRating, score10, scoreCol, tideExtremes, windRel } from "./rating.ts";

// Amazing: small swell, good period, light wind, no rain.
assert.equal(classify(0.5, 10, 10, 200, 200, 0, false).label, "Amazing");
// Good: small swell but stronger wind (18 km/h).
assert.equal(classify(0.5, 10, 18, 200, 200, 0, false).label, "Good");
// Marginal: swell in the 1.0–1.5 m band.
assert.equal(classify(1.2, 10, 10, 200, 200, 0, false).label, "Marginal");
// Poor: swell over the marginal ceiling.
assert.equal(classify(2.0, 10, 10, 200, 200, 0, false).label, "Poor");
// Very-high period downgrades an otherwise-small day to Marginal.
assert.equal(classify(0.6, 15, 10, 200, 200, 0, false).label, "Marginal");
// Strong onshore wind pushes small clean swell to Marginal.
assert.equal(classify(0.5, 10, 25, 200, 200, 0, false).label, "Marginal");
// Heavy rain downgrades one tier (Amazing -> Good).
assert.equal(classify(0.5, 10, 10, 200, 200, 20, false).label, "Good");
// Sheltered bay: rated on wind chop only; light wind -> Amazing.
assert.equal(classify(null, null, 8, null, 0, 0, true).label, "Amazing");
// Sheltered bay: strong wind -> Marginal.
assert.equal(classify(null, null, 25, null, 0, 0, true).label, "Marginal");

// windRel: onshore vs offshore vs cross.
assert.equal(windRel(200, 200).kind, "on");
assert.equal(windRel(20, 200).kind, "off");
assert.equal(windRel(110, 200).kind, "cross");

// compass buckets.
assert.equal(compass(0), "N");
assert.equal(compass(90), "E");
assert.equal(compass(null), "");

// score10 tracks classify's tiers: perfect slot scores 10, big swell scores low.
assert.equal(score10(0.3, 10, 5, 200, 20, 0, false), 10);
assert.ok(score10(2.0, 10, 10, 200, 200, 0, false)! <= 3);
// Strong onshore wind costs more than strong offshore.
assert.ok(score10(0.5, 10, 25, 200, 200, 0, false)! < score10(0.5, 10, 25, 20, 200, 0, false)!);
// Sheltered: wind-driven; null wave data doesn't null the score.
assert.equal(score10(null, null, 8, null, 0, 0, true), 10);
// Band colours match tiers at the edges.
assert.equal(scoreCol(10), "#2f6e4f");
assert.equal(scoreCol(0), "#a8200d");

// tideExtremes finds the hump and the dip.
const mt = ["2026-07-16T00:00", "2026-07-16T01:00", "2026-07-16T02:00", "2026-07-16T03:00", "2026-07-16T04:00"];
const marks = tideExtremes(mt, [0.2, 0.8, 0.5, 0.1, 0.6]);
assert.deepEqual(
  marks.map((m) => [m.kind, m.time]),
  [["H", "01:00"], ["L", "03:00"]],
);

// dayRating: mode of the day's hourly buckets, not a single worst-case slot.
assert.equal(dayRating([8, 8, 8, 6, 6]).label, "Amazing");
assert.equal(dayRating([3, 3, 3, 8, 8]).label, "Marginal");
assert.equal(dayRating([]).label, "Marginal");

console.log("rating.test.ts: all assertions passed");
