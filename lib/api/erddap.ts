// NOAA CoastWatch ERDDAP griddap image + metadata helpers (ported from app.js).
export const BASE = "https://coastwatch.pfeg.noaa.gov/erddap/griddap/";
export const LAT = "(-44):(-37.5)";
export const LAT_DESC = "(-37.5):(-44)";
export const LON = "(140):(151)";

type Stretch = { min?: number | null; max?: number | null; bump?: number };

// Colour bar: stretched to a local min/max when known, else auto (Rainbow).
function colorBar({ min, max }: Stretch): string {
  return min != null && max != null
    ? `Rainbow%7C%7C%7C${min}%7C${max}%7C`
    : "Rainbow%7C%7C%7C%7C%7C";
}

// MUR SST as a transparent PNG data grid (no axes/legend), for a map overlay.
export function sstURL(s: Stretch = {}): string {
  return (
    BASE +
    "jplMURSST41.transparentPng?analysed_sst%5B(last)%5D%5B(-39.7):(-37.1)%5D%5B(140.8):(150.2)%5D" +
    "&.draw=surface&.vars=longitude%7Clatitude%7Canalysed_sst&.colorBar=" +
    colorBar(s) +
    "&.land=over&.size=1560%7C" +
    (432 + (s.bump || 0))
  );
}

// SST colour-scale legend only.
export function sstLegendURL(s: Stretch = {}): string {
  return (
    BASE +
    "jplMURSST41.png?analysed_sst%5B(last)%5D%5B(-39.7):(-37.1)%5D%5B(140.8):(150.2)%5D" +
    "&.draw=surface&.vars=longitude%7Clatitude%7Canalysed_sst&.colorBar=" +
    colorBar(s) +
    "&.legend=Only"
  );
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

export const graphLink = (ds = "jplMURSST41") => BASE + ds + ".graph";

export function fmtDataDate(t: string | null): string {
  if (!t) return "unavailable";
  return new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
