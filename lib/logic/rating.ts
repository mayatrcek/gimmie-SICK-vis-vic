import type { Rating, RatingLabel, Row, Spot, WindRel } from "@/lib/types";
import {
  COL,
  KN,
  RAIN,
  RAIN_DAYS,
  RAIN_DECAY,
  RANK,
  SHELTER_GALE,
  SHELTER_KMH,
  SWELL,
  SWELL_BIG,
  WIND,
  WIND_FLOOR,
  WIND_GALE,
} from "../data/thresholds.ts";

export function rate(label: RatingLabel): Rating {
  return { label, col: COL[label], rank: RANK[label] };
}

export function compass(d: number | null): string {
  if (d == null || isNaN(d)) return "";
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round((d % 360) / 45) % 8];
}

export function windRel(from: number | null, onshore: number | null): WindRel {
  if (from == null || onshore == null) return { kind: "", label: "" };
  const diff = Math.abs((((from - onshore + 540) % 360) - 180)); // 0 = blowing straight onshore
  if (diff <= 60) return { kind: "on", label: "onshore" };
  if (diff >= 120) return { kind: "off", label: "offshore" };
  return { kind: "cross", label: "cross" };
}

// First rung whose ceiling the value fits under, else `above`.
function ladder(x: number, rungs: readonly (readonly [number, number])[], above: number): number {
  for (const [lim, val] of rungs) if (x <= lim) return val;
  return above;
}

// Decayed sum of the rain leading up to day `i` of `rain` (mm per day, oldest
// first, past days included). Yesterday's 40mm is still in the water; last
// week's mostly isn't — RAIN_DECAY per day older is the whole model.
export function runoffIndex(rain: (number | null)[], i: number): number {
  let sum = 0;
  for (let d = 0; d <= RAIN_DAYS; d++) {
    const v = rain[i - d];
    if (v != null) sum += v * RAIN_DECAY ** d;
  }
  return sum;
}

// Runoff costs vis, but never more than a couple of points — it muddies a good
// day, it doesn't turn one into a 1.
export const rainPenalty = (runoff: number | null): number =>
  runoff == null ? 0 : runoff >= RAIN.HEAVY ? 2 : runoff >= RAIN.MODERATE ? 1 : 0;

// 0-10 per-slot score. Ladders and their calibration live in thresholds.ts;
// swell period is deliberately absent — Maya's examples show it neither
// rescuing a big day nor spoiling a small one.
export function score10(
  s: Spot,
  h: number | null,
  w: number | null,
  wdir: number | null,
  runoff: number | null,
): number | null {
  // Sheltered water is wind and nothing else — no swell to read, no protected
  // side to work, and neither the tidal race nor last week's rain is allowed to
  // pull the number down (both come out as warnings in visNotes instead).
  // Scored straight off km/h; the ocean ladders below convert to knots.
  if (s.sheltered) return w == null ? 7 : ladder(w, SHELTER_KMH, SHELTER_GALE);

  const kts = w == null ? null : w / KN;
  if (h == null) return null;
  let sc = ladder(h, SWELL, SWELL_BIG);
  if (sc >= WIND_FLOOR && kts != null) {
    const pen = ladder(kts, WIND, WIND_GALE);
    sc -= windRel(wdir, s.onshore).kind === "off" ? Math.floor(pen / 2) : pen;
  }
  // Spots that are murky as a rule already price dirty water into their score;
  // there, rain is a note rather than a deduction.
  if (!s.murky) sc -= rainPenalty(runoff);
  return Math.max(1, Math.min(10, Math.round(sc)));
}

// Plain-English vis warnings for a spot on a given day: what the past week's
// rain is likely to have done, plus any standing dirty-water caveat.
export function visNotes(s: Spot, runoff: number | null): string[] {
  const out: string[] = [];
  const mm = runoff == null ? 0 : Math.round(runoff);
  if (runoff == null) {
    // nothing to say
  } else if (runoff >= RAIN.HEAVY) {
    out.push(
      `Heavy rain about (${mm}mm of runoff banked over the past week). Expect a brown plume out of the creeks and river mouths, a murky top few metres, and vis that stays poor for a couple of days after the sky clears.`,
    );
  } else if (runoff >= RAIN.MODERATE) {
    out.push(
      `Recent rain (${mm}mm of runoff over the past week) will have knocked the vis back — worst near outlets and in the surface layer, better once you're down and away from the shore.`,
    );
  } else if (runoff >= RAIN.TRACE) {
    out.push(
      `A bit of rain about (${mm}mm of runoff over the past week). Mostly clean, but expect some murk hanging around creek and river mouths.`,
    );
  } else {
    out.push(`Barely any rain in the past week (${mm}mm of runoff) — runoff shouldn't be hurting the vis.`);
  }
  if (s.murky === "river") {
    out.push(
      "River/estuary mouth: tannic, tea-coloured water is normal here and it goes dirty fast after rain. Rate it on the wind, not on the hope of a clear-water day.",
    );
  } else if (s.murky === "bay") {
    out.push(
      "Top of the bay: silty, regularly dirty water. The Yarra and Werribee outflows keep this end murky rain or not, so treat any vis you get as a bonus.",
    );
  } else if (s.murky === "silt") {
    out.push(
      "Silty by nature: a big tidal exchange over mudflats and mangroves keeps this water milky most of the time. A few metres is a good day here — go on the tail of a neap tide and at slack, and expect it to thicken after rain or a blow.",
    );
  }
  if (s.tidal) out.push("Strong tidal current through here — dive it on slack water or not at all.");
  return out;
}

// Colour a forecast number by what that number alone does to the score, off the
// same ladders score10 uses rather than a second scale of its own. Pass the
// rounded value the cell displays. Empty string = no data, no colour.
export function swellCol(h: number | null): string {
  if (h == null || isNaN(h)) return "";
  return scoreCol(ladder(h, SWELL, SWELL_BIG));
}

// Wind is a penalty rather than a score on open coast, so its cells take the
// tier of the WIND rung they land on (≤9kn / ≤20kn / ≤25kn / above). Sheltered
// water scores straight off SHELTER_KMH, so that ladder answers directly.
const WIND_BAND: RatingLabel[] = ["Amazing", "Good", "Marginal", "Poor"];
export function windCol(s: Spot, w: number | null): string {
  if (w == null || isNaN(w)) return "";
  if (s.sheltered) return scoreCol(ladder(w, SHELTER_KMH, SHELTER_GALE));
  const i = WIND.findIndex(([lim]) => w / KN <= lim);
  return COL[WIND_BAND[i === -1 ? WIND.length : i]];
}

// score band -> the existing tier colour, so the page legend still applies.
export function scoreCol(n: number | null): string {
  if (n == null) return "#d7d4c8";
  return n >= 8 ? COL.Amazing : n >= 6 ? COL.Good : n >= 3 ? COL.Marginal : COL.Poor;
}

function scoreLabel(n: number | null): RatingLabel {
  if (n == null) return "Marginal";
  return n >= 8 ? "Amazing" : n >= 6 ? "Good" : n >= 3 ? "Marginal" : "Poor";
}

// Daily "rough guide" = the mode of that day's hourly score10 buckets, so the
// day tab agrees with what the hourly table underneath actually shows (rather
// than a separate classify() call off the day's max height/period, which can
// land on Marginal even when every visible hour reads Good).
export function dayRating(scores: (number | null)[]): Rating {
  const counts: Partial<Record<RatingLabel, number>> = {};
  let best: RatingLabel = "Marginal";
  let bestN = 0;
  for (const sc of scores) {
    const lbl = scoreLabel(sc);
    const n = (counts[lbl] = (counts[lbl] || 0) + 1);
    if (n > bestN) {
      bestN = n;
      best = lbl;
    }
  }
  return rate(best);
}

export type TideMark = { date: string; kind: "H" | "L"; time: string; height: number };

// Local extrema of the hourly sea-level series -> high/low tide marks.
export function tideExtremes(mtime: string[], tide: number[]): TideMark[] {
  const out: TideMark[] = [];
  for (let i = 1; i < tide.length - 1; i++) {
    const a = tide[i - 1], b = tide[i], c = tide[i + 1];
    if (a == null || b == null || c == null) continue;
    if ((b > a && b >= c) || (b < a && b <= c)) {
      out.push({
        date: mtime[i].slice(0, 10),
        kind: b > a ? "H" : "L",
        time: mtime[i].slice(11, 16),
        height: b,
      });
    }
  }
  return out;
}

const EMPTY: Rating = { label: "—", col: "#d7d4c8", rank: 0 };

// day name relative to today (Today/Tomorrow/short weekday).
export function dname(ds: string): string {
  const dt = new Date(ds + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((dt.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return (
    dt.toLocaleDateString(undefined, { weekday: "short" }) +
    " " +
    dt.getDate() +
    "/" +
    (dt.getMonth() + 1)
  );
}

export function todayRow(rows: Row[]): Row {
  for (const r of rows) if (dname(r.date) === "Today") return r;
  return rows[0];
}

export function todayRating(rows: Row[] | null): Rating {
  if (!rows || !rows.length) return EMPTY;
  return todayRow(rows).rating;
}
