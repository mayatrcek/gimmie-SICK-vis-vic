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
  ],
  // open coast west of Cape Otway, where the range drops to about a metre
  portland: ["portland", "portfairy", "warrnambool"],
  // the top and east of Port Phillip, where the gauge sits: our prediction lands
  // within 5 min of published tide times here, so these need no correction
  williamstown: [
    "stleonards", "portarlington", "morningtonpier", "ricketts", "cerberus", "williamstown",
  ],
  // Western Port, where the embayment amplifies the tide to nearly 3 m
  "stony-point": [
    "flinderspier", "cowes", "stonypoint", "crawfish", "rhyll", "newhaven", "tortoise",
    "corinella", "ycw",
  ],
};

// Port Phillip is a tidal wave crawling in through the Heads and dying as it
// goes: high water is ~20 min behind the open coast at Point Lonsdale, an hour
// at Portsea, two and a half at Rye, three and a half up in the South Channel,
// and the range falls away with it. No gauge inside the bay is published except
// Williamstown, so the entrance and the southern shore ride the Lorne gauge —
// which carries the ocean's shape, and fits South Channel to 6 min once shifted
// — with the offset and range each site actually has.
//
// The numbers are the classic secondary-port correction: minutes behind Lorne,
// and range as a fraction of Lorne's. They come from comparing published tide
// predictions site by site against this model over 4-10 Sep 2026, so treat them
// as approximations from the gauges, not measurements. Sites without their own
// published times take their nearest neighbour's (Portsea Hole ← Portsea Pier,
// Chinaman's Hat ← South Channel Fort, Popes Eye ← Queenscliff).
type Secondary = { station: string; lagMin: number; scale: number };
const SECONDARY: Record<string, Secondary> = {
  lonsdalewall: { station: "lorne", lagMin: 20, scale: 0.7 },
  queenscliffpier: { station: "lorne", lagMin: 56, scale: 0.43 },
  popeseye: { station: "lorne", lagMin: 56, scale: 0.43 },
  portseapier: { station: "lorne", lagMin: 97, scale: 0.7 },
  portseahole: { station: "lorne", lagMin: 97, scale: 0.7 },
  sorrentopier: { station: "lorne", lagMin: 141, scale: 0.7 },
  blairgowrie: { station: "lorne", lagMin: 166, scale: 0.36 },
  ryepier: { station: "lorne", lagMin: 186, scale: 0.36 },
  fort: { station: "lorne", lagMin: 210, scale: 0.7 },
  chinamans: { station: "lorne", lagMin: 210, scale: 0.7 },
};

const STATION_OF: Record<string, string> = {};
for (const [station, ids] of Object.entries(BY_STATION)) for (const id of ids) STATION_OF[id] = station;

export function stationFor(spotId: string): TideModel | null {
  const sec = SECONDARY[spotId];
  if (sec) return MODELS[sec.station];
  const key = STATION_OF[spotId];
  return key ? MODELS[key] : null;
}

// What a site's tide row is named after: its own gauge, or the place the
// correction was worked out for.
export function refFor(spotId: string): string | null {
  const m = stationFor(spotId);
  return m ? m.station : null;
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
// harmonic prediction where a gauge stands in for the site (shifted and damped
// if it's a secondary port), the delay-corrected model everywhere else. `ref`
// names the source for the table heading.
export function tideSeries(
  spotId: string,
  mtime: string[],
  modelled: (number | null)[],
): { tide: number[]; ref: string } {
  const model = stationFor(spotId);
  if (!model) return { tide: delayed(modelled), ref: "modelled" };
  const sec = SECONDARY[spotId];
  const lag = (sec?.lagMin ?? 0) * 60000;
  const scale = sec?.scale ?? 1;
  // scale about the gauge's mean level: the tide is damped on the way in, the
  // level it's damped towards isn't
  const tide = mtime.map((t) => model.z0 + scale * (predict(model, melbourneMs(t) - lag) - model.z0));
  return { tide, ref: model.station };
}
