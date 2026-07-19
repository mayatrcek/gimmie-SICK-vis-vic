// Shared GIBS WMS endpoint + Victoria bbox (EPSG:3857) — SSR-safe, no leaflet.
export const BBOX = "15529069,-5496679,16786978,-4001005";
export const GIBS = "https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi";

// VIIRS chlorophyll satellites on GIBS. layer ids are canonical WMTS case —
// the Domains endpoint is case-sensitive (WMS tolerates either). lag = fallback
// days behind today, used only when the Domains query fails.
export const SATS = [
  { id: "noaa20", label: "NOAA-20", layer: "VIIRS_NOAA20_Chlorophyll_a", cmr: "VIIRSJ1_L2_OC", lag: 2, note: "the dependable daily workhorse" },
  { id: "noaa21", label: "NOAA-21", layer: "VIIRS_NOAA21_Chlorophyll_a", cmr: "VIIRSJ2_L2_OC", lag: 2, note: "newest sensor, sharpest scans" },
  { id: "snpp", label: "SUOMI NPP", layer: "VIIRS_SNPP_L2_Chlorophyll_A", cmr: "VIIRSN_L2_OC", lag: 4, note: "longest record, occasional gaps" },
] as const;
export type Sat = (typeof SATS)[number];

const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

// Lag-based day list (newest first) — the pre-Domains behaviour, kept as the
// fallback when GIBS can't tell us what's actually published.
export const fallbackDays = (lag: number, n = 12) =>
  Array.from({ length: n }, (_, i) => iso(Date.now() - (i + lag) * 864e5));

// Days available in a GIBS Domains response, newest first. The <Domain> is a
// comma list of "start/end/P1D" periods (or a bare date for a single day).
export function parseDomain(xml: string): string[] {
  const m = xml.match(/<Domain>([^<]*)<\/Domain>/);
  if (!m) return [];
  const out: string[] = [];
  for (const period of m[1].split(",")) {
    const [start, end] = period.split("/");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) continue;
    for (let t = Date.parse(start); t <= Date.parse(end || start); t += 864e5) out.push(iso(t));
  }
  return out.reverse();
}

// Newest n published days for a satellite, straight from GIBS's per-layer
// Domains endpoint (~400 B XML, cached hourly). Window is 25 days so n days
// survive SNPP-style gap runs; any failure falls back to the lag guess.
// A day's pass times as Melbourne local strings ("1:48 pm"), from sorted ISO
// granule starts. Adjacent ~6-min granules of one swath sit minutes apart —
// collapse starts <30 min after the previous into the same pass.
export function passTimes(starts: string[]): string[] {
  const out: string[] = [];
  let last = -Infinity;
  for (const s of starts) {
    const t = Date.parse(s);
    if (!Number.isFinite(t)) continue;
    if (t - last >= 30 * 60e3)
      out.push(
        new Date(t)
          .toLocaleTimeString("en-AU", { timeZone: "Australia/Melbourne", hour: "numeric", minute: "2-digit" })
          .replace(/\s/g, " "), // some ICUs put narrow NBSP before am/pm
      );
    last = t;
  }
  return out;
}

// Melbourne pass times per composite day, from CMR granule metadata (standard
// + NRT collections OR'd; CSV column 3 = Start Time). Afternoon passes here
// are 02:00–06:00 UTC, so UTC date == GIBS composite date == local date.
// Any failure → {} and cards just show no time.
export async function scanTimes(sat: Sat): Promise<Record<string, string[]>> {
  const url =
    `https://cmr.earthdata.nasa.gov/search/granules.csv?short_name=${sat.cmr}&short_name=${sat.cmr}_NRT` +
    `&bounding_box=140,-41,151,-34&temporal=${iso(Date.now() - 24 * 864e5)}T00:00:00Z,${new Date().toISOString()}` +
    `&page_size=100&sort_key=start_date`;
  try {
    const r = await fetch(url, { next: { revalidate: 3600 } });
    if (!r.ok) throw new Error(`${r.status}`);
    const byDay: Record<string, string[]> = {};
    for (const line of (await r.text()).trim().split("\n").slice(1)) {
      const start = line.split(",")[2];
      if (start) (byDay[start.slice(0, 10)] ??= []).push(start);
    }
    return Object.fromEntries(Object.entries(byDay).map(([d, s]) => [d, passTimes(s)]));
  } catch {
    return {};
  }
}

export async function latestDays(sat: Sat, n = 12): Promise<string[]> {
  const url =
    `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/${sat.layer}` +
    `/default/GoogleMapsCompatible_Level7/all/${iso(Date.now() - 24 * 864e5)}--${iso(Date.now())}.xml`;
  try {
    const r = await fetch(url, { next: { revalidate: 3600 } });
    if (!r.ok) throw new Error(`${r.status}`);
    const days = parseDomain(await r.text()).slice(0, n);
    if (days.length) return days;
  } catch {}
  return fallbackDays(sat.lag, n);
}
