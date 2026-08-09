// Self-check for the rating logic. Run: node lib/logic/rating.test.ts
// (Node 24 strips TS types natively; uses relative imports so no alias resolver needed.)
import assert from "node:assert";
import type { Spot } from "../types.ts";
import {
  compass,
  dayRating,
  rainPenalty,
  runoffIndex,
  score10,
  scoreCol,
  swellCol,
  tideExtremes,
  visNotes,
  windCol,
  windRel,
} from "./rating.ts";
import { COL, KN } from "../data/thresholds.ts";

const spot = (o: Partial<Spot> = {}): Spot => ({
  id: "t",
  name: "t",
  lat: -38.4,
  lon: 144.8,
  region: "t",
  onshore: 200,
  sheltered: false,
  ...o,
});

// The 22 rated scenarios from sources/docs/gimmie_sick_vis_rating_examples.xlsx.
// Wind is in knots there and km/h here, hence the KN multiply. Anything that
// stops matching means the ladders in thresholds.ts drifted off Maya's calls.
const CASES: [string, Spot, number | null, number, number, number][] = [
  //  name                     spot                              h     kn  wdir  expected
  ["Pyramid Rock (offshore)", spot({ onshore: 185 }), 0.8, 12, 315, 8],
  ["Seal Rock", spot({ onshore: 185 }), 2.2, 25, 225, 1],
  ["Point Leo", spot({ onshore: 170 }), 0.5, 8, 170, 10],
  ["Flinders", spot({ onshore: 170 }), 3.0, 30, 225, 1],
  ["Cape Schanck", spot({ onshore: 180 }), 1.2, 15, 270, 5],
  ["13th Beach", spot(), 1.5, 20, 225, 2],
  ["Portland (offshore, 15s)", spot(), 2.5, 18, 315, 1],
  ["Point Lonsdale", spot(), 1.8, 22, 135, 2],
  ["Lorne", spot(), 0.9, 6, 200, 8],
  ["Apollo Bay", spot(), 3.5, 28, 270, 1],
  ["Wilsons Prom", spot(), 1.0, 10, 225, 7],
  ["Rye back beach", spot({ onshore: 185 }), 2.0, 24, 180, 1],
  ["Torquay Point", spot(), 1.6, 16, 225, 2],
  ["Bells Beach", spot(), 2.8, 20, 225, 1],
  ["Sorrento", spot({ onshore: 185 }), 2.4, 26, 225, 1],
  ["Kilcunda", spot(), 1.4, 18, 270, 2],
  ["Portsea (storm)", spot({ onshore: 185 }), 4.0, 32, 225, 1],
];

for (const [name, s, h, kn, wdir, want] of CASES) {
  assert.equal(score10(s, h, kn * KN, wdir, 0), want, `${name}: expected ${want}`);
}

// --- Sheltered water -------------------------------------------------------
// The sheet's five sheltered rows (Barwon 10kn=10, Blairgowrie 12kn=8,
// Mallacoota 8kn=10, Glenelg 5kn=10, San Remo 14kn=3) are SUPERSEDED: Maya
// re-specified these in km/h, with 15 km/h as the hinge and 46 km/h a 1.
// A bay pile is exposed on every side, so wind bites much harder than the
// original knot-based ratings allowed.
const bay = spot({ sheltered: true });
// 20 km/h -> 4 is Maya's own number; the steep 15-22 band exists to hit it.
for (const [kmh, want] of [[5, 10], [8, 10], [11, 9], [13, 8], [15, 7], [16, 6], [19, 5], [20, 4], [22, 4], [28, 3], [38, 2], [46, 1], [70, 1]]) {
  assert.equal(score10(bay, null, kmh, 0, 0), want, `sheltered ${kmh} km/h: expected ${want}`);
}
// The hinge, stated as the rule rather than the table: 15 and under dives well,
// anything over it doesn't.
for (let kmh = 0; kmh <= 15; kmh++) assert.ok(score10(bay, null, kmh, 0, 0)! >= 7, `${kmh} km/h should be 7+`);
for (let kmh = 16; kmh <= 120; kmh++) assert.ok(score10(bay, null, kmh, 0, 0)! <= 6, `${kmh} km/h should be 6 or less`);

// Period is gone from the score on purpose: a long-period 2.5m day is still a 1,
// and a short-period 0.5m day is still a 10 (both asserted above via Portland
// and Point Leo). Height alone drives the ocean ladder.

// Wind only bites while the swell still allows a dive — at 1.6m it's already a 2.
assert.equal(score10(spot(), 1.6, 5 * KN, 200, 0), score10(spot(), 1.6, 30 * KN, 200, 0));
// Offshore counts half: same swell and speed, better score than onshore.
assert.ok(score10(spot(), 1.0, 25 * KN, 20, 0)! > score10(spot(), 1.0, 25 * KN, 200, 0)!);

// runoffIndex: today's rain in full, older days decayed (0.75/day).
assert.equal(runoffIndex([0, 0, 10], 2), 10);
assert.equal(Math.round(runoffIndex([0, 10, 0], 2) * 100) / 100, 7.5);
// Rain outside the window doesn't count.
assert.equal(runoffIndex([100, 0, 0, 0, 0, 0, 0, 0, 0], 8), 0);

// Rain costs a point or two on clean-water coast, and nothing where it's murky anyway.
assert.equal(rainPenalty(0), 0);
assert.equal(rainPenalty(20), 1);
assert.equal(rainPenalty(60), 2);
assert.equal(score10(spot(), 0.5, 5 * KN, 200, 60), 8); // 10 - 2
assert.equal(score10(spot({ sheltered: true, murky: "river" }), null, 8, 0, 60), 10);

// Sheltered water is wind and nothing else: same wind, same score, whatever the
// runoff, the tidal race, or the wind direction (nowhere to hide on a bay pile).
const fort = spot({ sheltered: true, tidal: true });
assert.equal(score10(fort, null, 26, 0, 0), score10(fort, null, 26, 0, 80));
assert.equal(score10(fort, null, 26, 45, 0), score10(fort, null, 26, 225, 0));

// visNotes: always says something about rain, plus the standing caveats.
assert.match(visNotes(spot(), 60)[0], /Heavy rain/);
assert.match(visNotes(spot(), 20)[0], /Recent rain/);
assert.match(visNotes(spot(), 8)[0], /bit of rain/);
assert.match(visNotes(spot(), 0)[0], /Barely any rain/);
assert.match(visNotes(spot({ murky: "river" }), 0)[1], /tannic/);
assert.match(visNotes(spot({ murky: "bay" }), 0)[1], /Top of the bay/);
assert.match(visNotes(spot({ murky: "silt" }), 0)[1], /Silty by nature/);
assert.match(visNotes(spot({ sheltered: true, tidal: true }), 0)[1], /slack water/);

// windRel: onshore vs offshore vs cross.
assert.equal(windRel(200, 200).kind, "on");
assert.equal(windRel(20, 200).kind, "off");
assert.equal(windRel(110, 200).kind, "cross");
// Shoreless sites (mid-bay pinnacles, walls) have no on/off answer.
assert.equal(windRel(200, null).kind, "");

// compass buckets.
assert.equal(compass(0), "N");
assert.equal(compass(90), "E");
assert.equal(compass(null), "");

// Band colours match tiers at the edges.
assert.equal(scoreCol(10), "#2f6e4f");
assert.equal(scoreCol(1), "#a8200d");

// Cell colours ride the same ladders as the score — a green number can never
// sit under a red rating.
assert.equal(swellCol(0.5), COL.Amazing);
assert.equal(swellCol(1.25), COL.Marginal);
assert.equal(swellCol(2.5), COL.Poor);
assert.equal(swellCol(null), "");
assert.equal(windCol(spot(), 5 * KN), COL.Amazing); // 5 kn
assert.equal(windCol(spot(), 22 * KN), COL.Marginal); // 22 kn — third rung
assert.equal(windCol(spot(), 32 * KN), COL.Poor); // above the ladder
assert.equal(windCol(spot({ sheltered: true }), 10), COL.Amazing); // 10 km/h on a pile
assert.equal(windCol(spot({ sheltered: true }), 25), COL.Marginal); // a 3 on SHELTER_KMH
assert.equal(windCol(spot({ sheltered: true }), 30), COL.Poor);
assert.equal(windCol(spot(), null), "");

// Two cells showing the same number must show it in the same colour — colour
// off the rounded value the cell displays, never the raw one.
const byShown: Record<string, Set<string>> = {};
for (let raw = 0.4; raw < 2.1; raw += 0.01) {
  const shown = raw.toFixed(1);
  (byShown[shown] ??= new Set()).add(swellCol(+shown));
}
for (const [shown, cols] of Object.entries(byShown)) {
  assert.equal(cols.size, 1, `height ${shown} rendered in ${cols.size} colours`);
}

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
