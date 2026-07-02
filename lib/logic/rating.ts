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
