import type { Rating, RatingLabel, Row, WindRel } from "@/lib/types";
import { COL, RANK, TH } from "../data/thresholds.ts";

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

// Maya's rules:
//   Amazing  -> swell <1m AND good period AND light wind
//   Marginal -> swell 1-1.5m, OR (<1m AND very high period), OR strong onshore wind
//   Poor     -> swell >1.5m
//   Good     -> otherwise (swell <1m, not marginal, but not quite amazing)
//   Heavy recent rain downgrades one tier (runoff = poor viz).
export function classify(
  h: number | null,
  p: number | null,
  w: number | null,
  windFrom: number | null,
  onshore: number | null,
  rainEff: number | null,
  sheltered: boolean,
): Rating {
  if (sheltered) {
    // inside the bay: no ocean swell, so rate on wind chop + recent rain only
    let lbl: RatingLabel;
    if (w == null) lbl = "Good";
    else if (w < TH.WIND_LIGHT) lbl = "Amazing";
    else if (w < TH.WIND_STRONG) lbl = "Good";
    else lbl = "Marginal";
    if (rainEff != null && rainEff >= TH.RAIN_HEAVY) {
      if (lbl === "Amazing") lbl = "Good";
      else if (lbl === "Good") lbl = "Marginal";
    }
    return rate(lbl);
  }
  if (h == null) return rate("Marginal");
  const rel = windRel(windFrom, onshore);
  const strongOnshore = rel.kind === "on" && w != null && w >= TH.WIND_STRONG;
  if (h > TH.SWELL_MARG) return rate("Poor");
  const isMarginal =
    h >= TH.SWELL_GREAT ||
    (h < TH.SWELL_GREAT && p != null && p >= TH.PERIOD_VHIGH) ||
    strongOnshore;
  let label: RatingLabel;
  if (isMarginal) {
    label = "Marginal";
  } else {
    const lightWind = w != null && w < TH.WIND_LIGHT;
    const goodPeriod = p == null ? true : p < TH.PERIOD_GOOD;
    label = lightWind && goodPeriod ? "Amazing" : "Good";
  }
  if (rainEff != null && rainEff >= TH.RAIN_HEAVY) {
    if (label === "Amazing") label = "Good";
    else if (label === "Good") label = "Marginal";
  }
  return rate(label);
}

// ponytail: 0-10 per-slot score, a heuristic restatement of classify()'s tiers
// using the same TH thresholds — tune the weights, not the structure.
export function score10(
  h: number | null,
  p: number | null,
  w: number | null,
  windFrom: number | null,
  onshore: number | null,
  rainEff: number | null,
  sheltered: boolean,
): number | null {
  let s: number;
  if (sheltered) {
    s = w == null ? 7 : w < TH.WIND_LIGHT ? 10 : w < TH.WIND_STRONG ? 7 : 4;
  } else {
    if (h == null) return null;
    s = 10 - Math.min(7, Math.max(0, (h - 0.3) * 4.5));
    if (p != null) s -= p >= TH.PERIOD_VHIGH ? 2 : p >= TH.PERIOD_GOOD ? 1 : 0;
    if (w != null && w >= TH.WIND_STRONG) s -= windRel(windFrom, onshore).kind === "on" ? 3 : 2;
    else if (w != null && w >= TH.WIND_LIGHT) s -= 1;
  }
  if (rainEff != null && rainEff >= TH.RAIN_HEAVY) s -= 2;
  return Math.max(0, Math.min(10, Math.round(s)));
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

export function tomorrowRating(rows: Row[] | null): Rating {
  if (!rows || !rows.length) return EMPTY;
  for (const r of rows) if (dname(r.date) === "Tomorrow") return r.rating;
  return rows[0].rating;
}
