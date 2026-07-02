import type { RatingLabel } from "@/lib/types";

// Rating thresholds (easy to tweak). Ported from app.js TH.
export const TH = {
  SWELL_GREAT: 1.0,
  SWELL_MARG: 1.5,
  PERIOD_GOOD: 13,
  PERIOD_VHIGH: 14,
  WIND_LIGHT: 15,
  WIND_STRONG: 22,
  RAIN_HEAVY: 15,
};

// Rating colours — the concrete hex from cirrus.css :root (--amazing/--good/--marg/--poor).
// Hardcoded (not read via getComputedStyle) so it works server- and client-side.
export const COL: Record<RatingLabel, string> = {
  Amazing: "#2bc48a",
  Good: "#2e7def",
  Marginal: "#ff7a3d",
  Poor: "#e5484d",
};

export const RANK: Record<RatingLabel, number> = {
  Amazing: 4,
  Good: 3,
  Marginal: 2,
  Poor: 1,
};
