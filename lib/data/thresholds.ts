import type { RatingLabel } from "@/lib/types";

// Open-Meteo hands us wind in km/h; every threshold below is in knots, because
// that's the unit Maya's rated examples are in.
export const KN = 1.852;

// Everything here is calibrated against the 22 rated Victorian scenarios in
// sources/docs/gimmie_sick_vis_rating_examples.xlsx. Three findings drove the
// rewrite of the old swell/period/wind tiers:
//   * swell height dominates, and it falls off a cliff — 1.2 m is a 6, 1.4 m is
//     a 2, and 2 m+ is a 1 no matter how clean the water or how light the wind.
//   * period neither rescues nor ruins a day (Portland 2.5 m/15 s offshore = 1;
//     Torquay 1.6 m/13 s clear = 2), so it no longer feeds the score at all.
//   * murky river/estuary water isn't a downgrade — those spots rate on wind and
//     just get told they're dirty.
// Ladders read as [inclusive ceiling, score] — the odd-looking ceilings (1.9,
// 9, 11) are where Maya's own calls put the step, so don't round them off.
export const SWELL: readonly (readonly [number, number])[] = [
  [0.6, 10],
  [1.0, 8],
  [1.2, 6],
  [1.3, 4],
  [1.9, 2],
];
export const SWELL_BIG = 1; // 2 m and over: stay away

// Wind penalty in knots, subtracted from the swell score. Offshore counts half
// ("good diving on the protected side from westerlies"). Only applied while the
// swell still allows a dive at all — see WIND_FLOOR.
export const WIND: readonly (readonly [number, number])[] = [
  [9, 0],
  [20, 1],
  [25, 3],
];
export const WIND_GALE = 5;
// Below this swell score the day is already written off by height alone, and
// wind stops mattering (Torquay 1.6 m/16 kn and Pt Lonsdale 1.8 m/22 kn both = 2).
export const WIND_FLOOR = 4;

// Sheltered water (bay, estuary, inlet): wind and nothing else. Somewhere like
// South Channel Fort is a speck in the middle of the bay — wind reaches it from
// every direction, so there's no protected side to work and no swell to read.
// Nothing else may deduct from these spots; tidal current and runoff are real,
// but they're warnings (see visNotes), not points.
//
// NB: this one ladder is in KM/H, not knots — it came straight from Maya in the
// units the forecast table displays, and it supersedes the five sheltered rows
// in the rating spreadsheet (which were knots and much more generous). 15 km/h
// is the hinge: at or under it dives well (7+), and a 46 km/h day on an exposed
// bay pile is a 1.
// The fall-off from 15 to 22 km/h is deliberately steep — three points across
// seven km/h, so 20 km/h is a 4. Chop builds fast on a pile with no lee, and a
// gentler curve here read far too optimistic. Don't smooth it out.
export const SHELTER_KMH: readonly (readonly [number, number])[] = [
  [8, 10],
  [11, 9],
  [13, 8],
  [15, 7], // hinge
  [17, 6],
  [19, 5],
  [22, 4], // 20 km/h lands here
  [28, 3],
  [38, 2],
];
export const SHELTER_GALE = 1;

// Runoff index: rain summed over the past week, each day older decayed by
// RAIN_DECAY. Bands are in mm of that decayed total.
export const RAIN_DECAY = 0.75;
export const RAIN_DAYS = 7;
export const RAIN = { TRACE: 5, MODERATE: 15, HEAVY: 40 };

// Rating colours — the concrete hex from overworld.css :root (--amazing/--good/--marg/--poor).
// Hardcoded (not read via getComputedStyle) so it works server- and client-side.
export const COL: Record<RatingLabel, string> = {
  Amazing: "#2f6e4f",
  Good: "#2e5dd6",
  Marginal: "#e2522e",
  Poor: "#a8200d",
};

export const RANK: Record<RatingLabel, number> = {
  Amazing: 4,
  Good: 3,
  Marginal: 2,
  Poor: 1,
};
