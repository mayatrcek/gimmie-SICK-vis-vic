import type { TideModel } from "./harmonics.ts";
import { predict } from "./harmonics.ts";
import lorne from "../data/tides/lorne.json" with { type: "json" };
import portland from "../data/tides/portland.json" with { type: "json" };
import stonyPoint from "../data/tides/stony-point.json" with { type: "json" };
import williamstown from "../data/tides/williamstown.json" with { type: "json" };

// Four fitted gauges (tools/fit-tides.ts). Hold-out RMS against the Bureau's own
// predictions: Lorne 2.7 cm, Stony Point 3.8 cm, Portland 1.3 cm.
const MODELS: Record<string, TideModel> = {
  lorne: lorne as TideModel,
  portland: portland as TideModel,
  "stony-point": stonyPoint as TideModel,
  williamstown: williamstown as TideModel,
};

// Which gauge each dive site borrows its tide from. Grouped by tidal regime,
// not by straight-line distance: the open coast, the Heads, the top of Port
// Phillip and Western Port all behave differently, and a site is only listed
// where the gauge genuinely stands in for it.
//
// Everything not listed here falls back to the calibrated model below —
// Wilsons Prom, Gippsland, the Mornington back beaches and the Phillip Island
// surf coast, none of which have a public gauge anywhere near.
const BY_STATION: Record<string, string[]> = {
  // open coast from Cape Otway east to the Heads
  lorne: [
    "bells", "winki", "janjuc", "torquay", "roadknight", "anglesea", "lorne", "apollo",
    "13th", "barwon", "oceangrove", "lonsdale", "princetown", "portcampbell",
    // just inside Port Phillip Heads the tide still tracks the open coast
    // (~1.4 m range, minutes behind Point Lonsdale) rather than the top of the bay
    "fort", "portseapier", "portseahole", "sorrentopier", "chinamans", "lonsdalewall",
    "queenscliffpier", "popeseye",
  ],
  // open coast west of Cape Otway, where the range drops to about a metre
  portland: ["portland", "portfairy", "warrnambool"],
  // the top and east of Port Phillip: half the range of the Heads, hours later
  williamstown: [
    "blairgowrie", "ryepier", "stleonards", "portarlington", "morningtonpier",
    "ricketts", "cerberus", "williamstown",
  ],
  // Western Port, where the embayment amplifies the tide to nearly 3 m
  "stony-point": [
    "flinderspier", "cowes", "stonypoint", "crawfish", "rhyll", "newhaven", "tortoise",
    "corinella", "ycw",
  ],
};

const STATION_OF: Record<string, string> = {};
for (const [station, ids] of Object.entries(BY_STATION)) for (const id of ids) STATION_OF[id] = station;

export function stationFor(spotId: string): TideModel | null {
  const key = STATION_OF[spotId];
  return key ? MODELS[key] : null;
}

// Open-Meteo's global tide model runs early everywhere on this coast. Regressing
// it against the Bureau's predictions over Jan–Jul 2026 puts the lead at 40 min
// at Lorne, 30 min at Portland and 80 min at Stony Point, with the amplitude
// near enough right once aligned (slope 0.98 at Lorne). So sites without a gauge
// get the open-coast correction: delay the series 40 minutes, leave it otherwise.
// On an hourly series that delay is just a weighted average of two samples.
const LAG_MIN = 40;

function delayed(v: (number | null)[]): number[] {
  const f = LAG_MIN / 60;
  return v.map((cur, i) => {
    const prev = i > 0 ? v[i - 1] : null;
    if (cur == null) return NaN;
    if (prev == null) return cur;
    return prev + (cur - prev) * (1 - f);
  });
}

// Melbourne-local timestamps ("2026-09-04T13:00", as Open-Meteo returns them
// with timezone=Australia/Melbourne) to epoch ms. Two passes so the hour either
// side of a DST switch lands on the right instant.
const MEL = new Intl.DateTimeFormat("en-US", {
  timeZone: "Australia/Melbourne",
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function melbourneOffset(ms: number): number {
  const p = MEL.formatToParts(new Date(ms));
  const g = (t: string) => +p.find((x) => x.type === t)!.value;
  return Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute")) - ms;
}

export function melbourneMs(local: string): number {
  const asUTC = Date.parse(local.length === 16 ? local + ":00Z" : local + "Z");
  const once = asUTC - melbourneOffset(asUTC);
  return asUTC - melbourneOffset(once);
}

// The tide series for one site, aligned to Open-Meteo's hourly timestamps:
// harmonic prediction where a gauge stands in for the site, the delay-corrected
// model everywhere else. `ref` names the source for the table heading.
export function tideSeries(
  spotId: string,
  mtime: string[],
  modelled: (number | null)[],
): { tide: number[]; ref: string } {
  const model = stationFor(spotId);
  if (model) return { tide: mtime.map((t) => predict(model, melbourneMs(t))), ref: model.station };
  return { tide: delayed(modelled), ref: "modelled" };
}
