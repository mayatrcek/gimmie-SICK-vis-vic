// Copernicus Marine (CMEMS) surface currents — replaces the NOAA ERDDAP
// blend for the currents gallery. Real forecast-model currents (uo/vo) at
// 0.083 deg (~9 km) vs NOAA's 25 km altimetry blend. Rendered by our own
// api/cmems-currents.py, since CMEMS retired OPeNDAP/ERDDAP/WMS in 2024 and
// only ships a Python client (no free-form HTTP image rendering like ERDDAP).

export const CMEMS_PRODUCT_URL =
  "https://data.marine.copernicus.eu/product/GLOBAL_ANALYSISFORECAST_PHY_001_024/description";

// No live "latest available time" metadata endpoint exists for this source
// (unlike ERDDAP's .json?time[(last)]) — the product publishes on a known
// ~1 day lag, so anchor the gallery on a fixed lag instead of a live check.
export function latestCurDay(): string {
  return new Date(Date.now() - 864e5).toISOString().slice(0, 10);
}

const speedURL = (day: string, frame: "card" | "map") =>
  `/api/cmems-currents?day=${day}&frame=${frame}&kind=speed`;

const vectorsURL = (day: string, frame: "card" | "map", stride?: number) =>
  `/api/cmems-currents?day=${day}&frame=${frame}&kind=vectors` +
  (stride ? `&stride=${stride}` : "");

export const curSpeedURL = speedURL;
export const curThumbURL = (day: string) => vectorsURL(day, "card");
// stride: grid-point spacing for the map's arrow density (lower = finer);
// the map requests a smaller stride as the user zooms in.
export const curURL = (day: string, stride?: number) => vectorsURL(day, "map", stride);
