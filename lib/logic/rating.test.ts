// Self-check for the rating logic. Run: node lib/logic/rating.test.ts
// (Node 24 strips TS types natively; uses relative imports so no alias resolver needed.)
import assert from "node:assert";
import { classify, compass, windRel } from "./rating.ts";

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

console.log("rating.test.ts: all assertions passed");
