// NOAA CoastWatch ERDDAP griddap image + metadata helpers (ported from app.js).
export const BASE = "https://coastwatch.pfeg.noaa.gov/erddap/griddap/";
// ACSPO L3S lives on the main CoastWatch host (pfeg only 302-redirects to it).
export const SST_BASE = "https://coastwatch.noaa.gov/erddap/griddap/";
export const SST_DS = "noaacwLEOACSPOSSTL3SnrtCDaily";
export const LAT = "(-44):(-37.5)";
export const LON = "(140):(151)";

type Stretch = { min?: number | null; max?: number | null; bump?: number };

// NOAA 403s UA-less requests (Node's fetch sends no User-Agent; browsers and
// curl do). Server routes must fetch ERDDAP through this. Cached hourly;
// pass `false` for absolute-date URLs, whose data never changes once published.
export const erddapFetch = (url: string, revalidate: number | false = 3600) =>
  fetch(url, {
    headers: { "User-Agent": "gimmie-sick-vis" },
    next: { revalidate },
  });

// Colour bar: stretched to a local min/max when known, else auto (Rainbow).
function colorBar({ min, max }: Stretch): string {
  return min != null && max != null
    ? `Rainbow%7C%7C%7C${min}%7C${max}%7C`
    : "Rainbow%7C%7C%7C%7C%7C";
}

// Daily grid values sit at 12:00Z; no day = latest available.
const sstTime = (day?: string) => (day ? `(${day}T12:00:00Z)` : "(last)");

// SST data region — chlorophyll's box cut off at Tasmania's north coast
// (southern Tas + Southern Ocean water dragged the percentile stretch wide
// and washed out local contrast). Optional stride thins CSV pulls.
export const SST_REGION: [[number, number], [number, number]] = [
  [-41.2, 139.5],
  [-33.8, 150.8],
];
const region = (stride = 0, lat0 = SST_REGION[0][0], lat1 = SST_REGION[1][0]) => {
  const s = stride ? `:${stride}` : "";
  return `%5B(${lat0})${s}:(${lat1})%5D%5B(139.5)${s}:(150.8)%5D`;
};

// ACSPO SST as a transparent PNG data grid (no axes/legend), for a map overlay.
// Real 2 km retrievals: cloudy cells are NaN → transparent. Height keeps
// 2 px per 0.02° grid cell; `lat` narrows to one latitude strip (the map
// draws the overlay strip-wise so the equirectangular grid lines up with
// leaflet's mercator basemap).
export function sstURL(
  s: Stretch = {},
  day?: string,
  lat: [number, number] = [SST_REGION[0][0], SST_REGION[1][0]],
): string {
  return (
    SST_BASE +
    SST_DS +
    `.transparentPng?sea_surface_temperature%5B${sstTime(day)}%5D` +
    region(0, lat[0], lat[1]) +
    "&.draw=surface&.vars=longitude%7Clatitude%7Csea_surface_temperature&.colorBar=" +
    colorBar(s) +
    "&.land=over&.size=1130%7C" +
    (Math.round((lat[1] - lat[0]) * 100) + (s.bump || 0))
  );
}

// Averages the SST column of an ERDDAP griddap .csv response
// (2 header rows, then time,latitude,longitude,sst; NaN over land/cloud).
export function meanFromCsv(csv: string): number | null {
  let sum = 0;
  let n = 0;
  for (const line of csv.trim().split("\n").slice(2)) {
    const v = Number(line.split(",").pop());
    if (Number.isFinite(v)) {
      sum += v;
      n++;
    }
  }
  return n ? sum / n : null;
}

// Same region as sstURL, strided to keep the CSV small. Feeds the colour
// stretch; no day = latest grid time.
export function sstStretchURL(stride = 10, day?: string): string {
  return (
    SST_BASE + SST_DS + `.csv?sea_surface_temperature%5B${sstTime(day)}%5D` + region(stride)
  );
}

// Colour-stretch endpoints from a region CSV: 2nd/98th percentile, rounded
// to 0.1 °C. Percentiles (not mean±1) because the region spans ~7 °C — a
// fixed window would clip most of it; outlier cells shouldn't set the ends.
export function stretchFromCsv(csv: string): { min: number; max: number } | null {
  const vals = csv
    .trim()
    .split("\n")
    .slice(2)
    .map((l) => Number(l.split(",").pop()))
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  if (!vals.length) return null;
  const p = (f: number) => Math.round(vals[Math.floor(f * (vals.length - 1))] * 10) / 10;
  return { min: p(0.02), max: p(0.98) };
}

// Gallery card image — framed to the chlorophyll cards' coords (wider than
// the SST map region, down to southern Tasmania) so both galleries' cards
// read identically. Southern water clamps to the cold end of the stretch.
export function sstThumbURL(s: Stretch = {}, day?: string): string {
  return (
    SST_BASE +
    SST_DS +
    `.transparentPng?sea_surface_temperature%5B${sstTime(day)}%5D%5B(-44.2):(-33.8)%5D%5B(139.5):(150.8)%5D` +
    "&.draw=surface&.vars=longitude%7Clatitude%7Csea_surface_temperature&.colorBar=" +
    colorBar(s) +
    "&.land=over&.size=256%7C305"
  );
}

// Same card via /api/sst-thumb, the cached proxy the gallery actually loads.
export const sstThumbSrc = ({ min, max }: Stretch, day: string) =>
  `/api/sst-thumb?day=${day}` + (min != null && max != null ? `&min=${min}&max=${max}` : "");

// SST read for the map's click probe — ERDDAP picks the grid cell nearest
// the coordinates; the CSV parses with meanFromCsv. Optional radius `r`
// (degrees) averages a small box instead, so shoreline points still get a
// reading from nearby water cells (nearest cell alone is often land/cloud).
export function sstPointURL(lat: number, lon: number, day?: string, r = 0): string {
  const dim = (v: number) => (r ? `(${v - r}):(${v + r})` : `(${v})`);
  return (
    SST_BASE +
    SST_DS +
    `.csv?sea_surface_temperature%5B${sstTime(day)}%5D%5B${dim(lat)}%5D%5B${dim(lon)}%5D`
  );
}

// Per-cell temperature and measurement offset for one grid day, strided.
// One request per day: all 12 days in one CSV blows NOAA's ~20 s gateway
// timeout (502) — sst_dtime alone costs ~3 s per day.
export function sstDayURL(day: string): string {
  const sub = `%5B${sstTime(day)}%5D` + region(10);
  return SST_BASE + SST_DS + `.csv?sea_surface_temperature${sub},sst_dtime${sub}`;
}

// Glues same-shape ERDDAP CSVs under one copy of the 2 header rows.
export function joinCsv(csvs: string[]): string {
  const parts = csvs.filter(Boolean).map((c) => c.trim().split("\n"));
  return parts.length ? [...parts[0].slice(0, 2), ...parts.flatMap((p) => p.slice(2))].join("\n") : "";
}

// A day's regional median SST must sit within this much of the 12-day window
// median, on at least this many retrievals, or the scan is flagged. Sep 2 2026
// came through at 16.7 degC against a 13.7-14.9 band on every other day in the
// window (warm-biased L3S composite: contaminated retrievals, not a cloud gap
// — its coverage was a normal 39%). Real day-to-day drift here is under 1 degC.
const BAD_DEV = 1.5;
const MIN_CELLS = 50;

const median = (v: number[]) => v.sort((a, b) => a - b)[Math.floor(v.length / 2)];

// Median measurement time per day from the sst_dtime column, as Melbourne local
// strings keyed by day ("2026-07-17" -> "1:14 am"), plus a QC pass over the
// window: `bad` lists days whose SST is out of family (see BAD_DEV), and
// `latestGood` is the newest day that passed — the anchor for any "current"
// read, so a flagged scan never becomes a dive-card temperature. The L3S blend
// favours the overnight JPSS passes here, so one median time per day reads
// honestly; days whose cells are all NaN (full cloud) are simply absent.
export function sstDaysFromCsv(csv: string): {
  times: Record<string, string>;
  bad: string[];
  latestGood?: string;
} {
  const sst: Record<string, number[]> = {};
  const offs: Record<string, number[]> = {};
  for (const line of csv.trim().split("\n").slice(2)) {
    const [t, , , v, dt] = line.split(",");
    const day = t.slice(0, 10);
    if (Number.isFinite(Number(v))) (sst[day] ??= []).push(Number(v));
    if (Number.isFinite(Number(dt))) (offs[day] ??= []).push(Number(dt));
  }

  const times = Object.fromEntries(
    Object.entries(offs).map(([day, vals]) => {
      const ms = Date.parse(`${day}T12:00:00Z`) + median(vals) * 1000;
      const s = new Date(ms)
        .toLocaleTimeString("en-AU", { timeZone: "Australia/Melbourne", hour: "numeric", minute: "2-digit" })
        .replace(/\s/g, " "); // some ICUs put narrow NBSP before am/pm
      return [day, s];
    }),
  );

  // Median of the daily medians: a robust centre that half the window would
  // have to be bad to shift.
  const meds = Object.fromEntries(Object.entries(sst).map(([day, vals]) => [day, median(vals)]));
  const mid = median(Object.values(meds));
  const days = Object.keys(meds).sort();
  const bad = days.filter((d) => sst[d].length < MIN_CELLS || Math.abs(meds[d] - mid) > BAD_DEV);
  const latestGood = days.reverse().find((d) => !bad.includes(d));
  return { times, bad, latestGood };
}

// The 12-day gallery window, newest first, anchored on the latest published
// grid time (checked hourly), plus sstDaysFromCsv's QC over it. Each day's CSV
// is an absolute-date URL cached forever (only 200s are stored), so a NOAA
// publish costs one new day upstream, not twelve. A failed day is just absent,
// like a fully cloudy one, and is retried on the next regen.
// ponytail: forever-cache assumes NOAA never reprocesses a published day; drop
// to a daily revalidate if a stale day ever shows up.
export async function sstDays() {
  let latest: string | undefined;
  try {
    const j = await (await erddapFetch(`${SST_BASE}${SST_DS}.json?time%5B(last)%5D`)).json();
    latest = j?.table?.rows?.[0]?.[0];
  } catch {}
  // 2 days behind now clears the ~1-day publication lag
  latest ??= new Date(Date.now() - 2 * 864e5).toISOString();
  const days = Array.from({ length: 12 }, (_, i) =>
    new Date(Date.parse(latest) - i * 864e5).toISOString().slice(0, 10),
  );
  // One at a time: NOAA serves these near-serially anyway (12 in parallel →
  // ~half 502 at its 20 s gateway, and Node's connect race drops the rest).
  // Cached days return instantly; the budget only bounds a cold cache (~4 s
  // a day), keeping the render (plus warmSstThumbs) under Next's 60 s prerender
  // limit even when the last request in flight hangs to NOAA's 20 s 502.
  // ponytail: a cold start renders the newest days only; the next hourly
  // regen fills the rest from where this one stopped.
  const deadline = Date.now() + 15e3;
  const csvs: string[] = [];
  for (const d of days) {
    if (Date.now() > deadline) break;
    csvs.push(
      await erddapFetch(sstDayURL(d), false)
        .then((r) => (r.ok ? r.text() : ""))
        .catch(() => ""),
    );
  }
  return { latest, days, ...sstDaysFromCsv(joinCsv(csvs)) };
}

// Pre-renders the gallery thumbs into the fetch cache /api/sst-thumb reads, so
// the first visitor after a NOAA publish doesn't wait on ERDDAP's ~2.5 s
// renders. Sequential for the same reason as sstDays; cached thumbs are free.
// The build awaits after() work too, hence the budget.
export async function warmSstThumbs(stretch: Stretch, days: string[]) {
  const deadline = Date.now() + 10e3;
  for (const d of days) {
    if (Date.now() > deadline) break;
    await erddapFetch(sstThumbURL(stretch, d), false).catch(() => {});
  }
}

// Latest grid day that passed QC, for the server routes that otherwise read
// (last). undefined on any failure — callers fall back to (last).
export async function latestGoodDay(): Promise<string | undefined> {
  return (await sstDays()).latestGood;
}

// Gallery colour stretch off the latest good day (absolute date, cached
// forever); a flagged scan's blown-out range would stretch all 12 thumbs wrong.
export async function sstStretch(day?: string): Promise<{ min?: number; max?: number }> {
  try {
    const r = await erddapFetch(sstStretchURL(10, day), day ? false : 3600);
    return (r.ok && stretchFromCsv(await r.text())) || {};
  } catch {
    return {};
  }
}

// Detected thermal-front cells at stride 2 (~4 km): full res over this
// region is a ~10 MB CSV; stride 2 is ~2.7 MB and front lines still read
// clearly as dotted traces. Fetched server-side, cached hourly.
export function sstFrontsURL(day?: string): string {
  return (
    SST_BASE + SST_DS + `.csv?sst_front_position%5B${sstTime(day)}%5D` + region(2)
  );
}

// Extracts [lat, lon] of cells flagged 1 from the sst_front_position CSV
// (2 header rows, then time,latitude,longitude,value; 0 = no front, NaN = cloud).
export function frontsFromCsv(csv: string): [number, number][] {
  const pts: [number, number][] = [];
  for (const line of csv.trim().split("\n").slice(2)) {
    const [, lat, lon, v] = line.split(",");
    if (v?.trim() === "1") pts.push([Number(lat), Number(lon)]);
  }
  return pts;
}

// noaacw* datasets live on the main CoastWatch host; pfeg doesn't know them
// all (the blended currents 404 there), so route by id prefix.
export const hostFor = (ds: string) => (ds.startsWith("noaacw") ? SST_BASE : BASE);

export const graphLink = (ds = SST_DS) => hostFor(ds) + ds + ".graph";

export function fmtDataDate(t: string | null): string {
  if (!t) return "unavailable";
  return new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
