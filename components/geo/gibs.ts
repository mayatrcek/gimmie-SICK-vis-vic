// Shared GIBS WMS endpoint + Victoria bbox (EPSG:3857) — SSR-safe, no leaflet.
export const BBOX = "15529069,-5496679,16786978,-4001005";
export const GIBS = "https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi";

// VIIRS chlorophyll satellites on GIBS. lag = days behind today for the newest
// reliable scan (SNPP publishes ~4 days behind; its archive also has occasional
// gap days, which render like cloud cover).
export const SATS = [
  { id: "noaa20", label: "NOAA-20", layer: "VIIRS_NOAA20_Chlorophyll_A", lag: 2, note: "the dependable daily workhorse" },
  { id: "noaa21", label: "NOAA-21", layer: "VIIRS_NOAA21_Chlorophyll_a", lag: 2, note: "newest sensor, sharpest scans" },
  { id: "snpp", label: "SUOMI NPP", layer: "VIIRS_SNPP_L2_Chlorophyll_A", lag: 4, note: "longest record, ~4-day delay" },
] as const;
export type Sat = (typeof SATS)[number];
