// NOAA CoastWatch ERDDAP griddap image + metadata helpers (ported from app.js).
export const BASE = "https://coastwatch.pfeg.noaa.gov/erddap/griddap/";
// ACSPO L3S lives on the main CoastWatch host (pfeg only 302-redirects to it).
export const SST_BASE = "https://coastwatch.noaa.gov/erddap/griddap/";
export const SST_DS = "noaacwLEOACSPOSSTL3SnrtCDaily";
export const LAT = "(-44):(-37.5)";
export const LAT_DESC = "(-37.5):(-44)";
export const LON = "(140):(151)";

type Stretch = { min?: number | null; max?: number | null; bump?: number };

// NOAA 403s UA-less requests (Node's fetch sends no User-Agent; browsers and
// curl do). Server routes must fetch ERDDAP through this. Cached hourly.
export const erddapFetch = (url: string) =>
  fetch(url, {
    headers: { "User-Agent": "gimmie-sick-vis" },
    next: { revalidate: 3600 },
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
// stretch.
export function sstStretchURL(stride = 10): string {
  return (
    SST_BASE + SST_DS + `.csv?sea_surface_temperature%5B(last)%5D` + region(stride)
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

// Per-cell measurement offsets for the last 12 grid days in one strided CSV
// (~1 MB, cached hourly). (last-n) arithmetic is in axis units — seconds.
export function sstDtimeURL(): string {
  return SST_BASE + SST_DS + `.csv?sst_dtime%5B(last-950400):(last)%5D` + region(10);
}

// Median measurement time per day from the sst_dtime CSV, as Melbourne local
// strings keyed by day ("2026-07-17" → "1:14 am"). The L3S blend favours the
// overnight JPSS passes here, so one median per day reads honestly; days
// whose cells are all NaN (full cloud) are simply absent.
export function medianTimesFromCsv(csv: string): Record<string, string> {
  const byDay: Record<string, number[]> = {};
  for (const line of csv.trim().split("\n").slice(2)) {
    const [t, , , v] = line.split(",");
    const dt = Number(v);
    if (Number.isFinite(dt)) (byDay[t.slice(0, 10)] ??= []).push(dt);
  }
  return Object.fromEntries(
    Object.entries(byDay).map(([day, vals]) => {
      vals.sort((a, b) => a - b);
      const ms = Date.parse(`${day}T12:00:00Z`) + vals[Math.floor(vals.length / 2)] * 1000;
      const s = new Date(ms)
        .toLocaleTimeString("en-AU", { timeZone: "Australia/Melbourne", hour: "numeric", minute: "2-digit" })
        .replace(/\s/g, " "); // some ICUs put narrow NBSP before am/pm
      return [day, s];
    }),
  );
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

export function chlURL(bump = 0): string {
  return (
    BASE +
    "nesdisVHNchlaDaily.png?chlor_a%5B(last)%5D%5B(0.0)%5D%5B" +
    LAT_DESC +
    "%5D%5B" +
    LON +
    "%5D&.draw=surface&.vars=longitude%7Clatitude%7Cchlor_a&.colorBar=%7C%7C%7C%7C%7C&.land=over&.size=720%7C" +
    (600 + bump)
  );
}

// noaacw* datasets live on the main CoastWatch host; pfeg doesn't know them
// all (the blended currents 404 there), so route by id prefix.
export const hostFor = (ds: string) => (ds.startsWith("noaacw") ? SST_BASE : BASE);

export const graphLink = (ds = SST_DS) => hostFor(ds) + ds + ".graph";

// Blended altimetry geostrophic surface currents, global 0.25°, daily at
// 00:00Z, ~2 days behind. Coarse: open-ocean flow only, no tidal streams.
export const CUR_DS = "noaacwBLENDEDNRTcurrentsDaily";
const curTime = (day?: string) => (day ? `(${day}T00:00:00Z)` : "(last)");

// One day of u/v at native 0.25° for the speed-gradient PNG (/api/cur-speed).
// "card" matches the thumb frame, "map" the leaflet overlay region.
export function curSpeedCsvURL(day?: string, frame: "card" | "map" = "card"): string {
  const box =
    frame === "map"
      ? `%5B(-41.2):(-33.8)%5D%5B(139.5):(150.8)%5D`
      : `%5B(-44.2):(-33.8)%5D%5B(139.5):(150.8)%5D`;
  return (
    SST_BASE + CUR_DS + `.csv?u_current%5B${curTime(day)}%5D${box},v_current%5B${curTime(day)}%5D${box}`
  );
}

// Card thumb: full-grid arrows, same frame as the SST/chl cards. Cream — the
// card's sea background (.chlthumb) is dark navy, ink arrows vanish on it.
export function curThumbURL(day?: string): string {
  const box = `%5B(-44.2):(-33.8)%5D%5B(139.5):(150.8)%5D`;
  return (
    SST_BASE + CUR_DS + `.transparentPng?u_current%5B${curTime(day)}%5D${box},v_current%5B${curTime(day)}%5D${box}` +
    // 2x the display size: ERDDAP draws aliased 1px arrows; browser downscale smooths them
    "&.draw=vectors&.vars=longitude%7Clatitude%7Cu_current%7Cv_current&.color=0xFFFAEF&.vec=0.3&.size=512%7C610"
  );
}

// Full-map overlay: cream arrows over satellite imagery, one image across
// SST_REGION. No latitude strips — at 0.25° cells the equirect-on-mercator
// placement error (<8 km) is well under one data cell, and strips would clip
// arrows at their seams.
export function curURL(day?: string): string {
  const box = `%5B(-41.2):(-33.8)%5D%5B(139.5):(150.8)%5D`;
  return (
    SST_BASE + CUR_DS + `.transparentPng?u_current%5B${curTime(day)}%5D${box},v_current%5B${curTime(day)}%5D${box}` +
    // 2x for the same anti-aliasing-by-downscale as the thumbs
    "&.draw=vectors&.vars=longitude%7Clatitude%7Cu_current%7Cv_current&.color=0xFFFAEF&.vec=0.3&.size=2260%7C1480"
  );
}

export function fmtDataDate(t: string | null): string {
  if (!t) return "unavailable";
  return new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
