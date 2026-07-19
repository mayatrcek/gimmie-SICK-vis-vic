// Shared GIBS WMS endpoint + Victoria bbox (EPSG:3857) — SSR-safe, no leaflet.
export const BBOX = "15529069,-5496679,16786978,-4001005";
export const GIBS = "https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi";

// VIIRS chlorophyll satellites on GIBS. layer ids are canonical WMTS case —
// the Domains endpoint is case-sensitive (WMS tolerates either). lag = fallback
// days behind today, used only when the Domains query fails.
export const SATS = [
  { id: "noaa20", label: "NOAA-20", layer: "VIIRS_NOAA20_Chlorophyll_a", lag: 2, note: "the dependable daily workhorse" },
  { id: "noaa21", label: "NOAA-21", layer: "VIIRS_NOAA21_Chlorophyll_a", lag: 2, note: "newest sensor, sharpest scans" },
  { id: "snpp", label: "SUOMI NPP", layer: "VIIRS_SNPP_L2_Chlorophyll_A", lag: 4, note: "longest record, occasional gaps" },
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
