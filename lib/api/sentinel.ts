// Copernicus Data Space Ecosystem (CDSE) / Sentinel Hub — true-colour
// Sentinel-2 scans for the Victorian coast. Every render costs Processing
// Units billed to the account, so unlike the free GIBS/ERDDAP sources, every
// call needs a bearer token and must run server-side only.

import { GIBS } from "@/components/geo/gibs";

// Narrower than the SST/chlorophyll region (SST_REGION in erddap.ts) — this
// tracks just the mainland Victorian coastline strip, not the open ocean
// either side, since Sentinel-2's 2500x2500px synchronous render cap makes a
// wide bbox expensive per pixel. First pass from the feature brief; nudge the
// corners once real tiles render if the framing looks off against the coast.
export const VIC_COAST_BOUNDS: [[number, number], [number, number]] = [
  [-39.3, 140.9], // SW — near the SA border, south of Discovery Bay
  [-37.2, 150.0], // NE — near Mallacoota/NSW border
];
export const VIC_COAST_BBOX = [140.9, -39.3, 150.0, -37.2]; // [minLon, minLat, maxLon, maxLat]

// dataMask is Sentinel Hub's built-in "is this pixel real data" band (0
// outside the swath/collection footprint) — carried through as alpha so the
// land-mask backdrop shows through gaps instead of solid black.
const TRUE_COLOR_EVALSCRIPT = `
//VERSION=3
function setup() { return { input: ["B02","B03","B04","dataMask"], output: { bands: 4 } }; }
function evaluatePixel(s) { return [s.B04*2.5, s.B03*2.5, s.B02*2.5, s.dataMask]; }`;

// Simple land/sea silhouette to show through no-data gaps — GIBS OSM_Land_Mask
// (free, no auth), same trick as gibs.ts's THUMB_LAND, cropped to our
// narrower coast bbox. Flat card thumbs use plain lon/lat (EPSG:4326, "WMS
// 1.3.0 puts latitude first in BBOX" per gibs.ts); the Leaflet detail map
// needs its own Web Mercator (EPSG:3857) bbox in meters, built at request
// time from the map's own CRS since Leaflet's projection isn't available here.
const [MIN_LON, MIN_LAT, MAX_LON, MAX_LAT] = VIC_COAST_BBOX;
export const SATELLITE_LAND_BACKDROP =
  `${GIBS.replace("epsg3857", "epsg4326")}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=OSM_Land_Mask` +
  `&CRS=EPSG:4326&BBOX=${MIN_LAT},${MIN_LON},${MAX_LAT},${MAX_LON}&WIDTH=640&HEIGHT=256&FORMAT=image/png&TRANSPARENT=true`;

export function landBackdropMercatorURL(bboxMeters: string, width = 1024, height = 1024): string {
  return `${GIBS}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=OSM_Land_Mask&CRS=EPSG:3857&BBOX=${bboxMeters}&WIDTH=${width}&HEIGHT=${height}&FORMAT=image/png&TRANSPARENT=true`;
}

// Short-lived (~10 min). Cached in module scope for its stated lifetime, minus
// a 60s safety margin: without this, every tile request paid a full OAuth round
// trip before its Process call, so one detail map (8 tiles at z7, 21 at z8) meant
// 8-21 extra sequential round trips to Copernicus. Server-only — never sent to
// the client. Cache is per serverless instance, which is all we need.
let cached: { token: string; expires: number } | null = null;

export async function getToken(): Promise<string> {
  if (cached && Date.now() < cached.expires) return cached.token;
  const res = await fetch(
    "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.CDSE_CLIENT_ID!,
        client_secret: process.env.CDSE_CLIENT_SECRET!,
      }),
    },
  );
  if (!res.ok) throw new Error(`CDSE auth failed: ${res.status}`);
  const data = await res.json();
  cached = {
    token: data.access_token,
    expires: Date.now() + Math.max(0, (data.expires_in ?? 600) - 60) * 1000,
  };
  return cached.token;
}

// Shared Process API call — thumbnail and tile routes only differ in bbox
// and output size.
export async function sentinelProcess(
  bbox: number[],
  date: string,
  width: number,
  height: number,
): Promise<Response> {
  const token = await getToken();
  return fetch("https://sh.dataspace.copernicus.eu/api/v1/process", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      input: {
        bounds: { bbox },
        data: [
          {
            type: "sentinel-2-l2a",
            dataFilter: { timeRange: { from: `${date}T00:00:00Z`, to: `${date}T23:59:59Z` } },
          },
        ],
      },
      output: { width, height, responses: [{ identifier: "default", format: { type: "image/png" } }] },
      evalscript: TRUE_COLOR_EVALSCRIPT,
    }),
  });
}

// Slippy-map tile (z,x,y) -> [minLon, minLat, maxLon, maxLat].
export function tileToBBox(z: number, x: number, y: number): number[] {
  const n = 2 ** z;
  const lon1 = (x / n) * 360 - 180;
  const lon2 = ((x + 1) / n) * 360 - 180;
  const lat1 = (Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n))) * 180) / Math.PI;
  const lat2 = (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI;
  return [lon1, lat1, lon2, lat2];
}
