# Feature brief: Live Copernicus true-colour satellite scans

**Project:** Gimmie Sick Vis (gimmie-sick-vis-vic.vercel.app)
**Goal:** Add a new "Live data" section showing true-colour Sentinel-2 imagery for the Victorian coast, in a selectable-card layout matching the existing `/live/chlorophyll` page, but limited to dates with low cloud cover. Clicking a card opens a locked, zoomable interactive map (not a flat image) so users get full ~10m resolution detail.

Before writing any code, **read `app/live/chlorophyll` (or wherever that route lives) in full** — component structure, styling, pagination, and the caption/card conventions — and match it. Don't invent a new pattern where the existing one already works.

---

## 0. Prerequisites (done by the human, not Claude Code)

These need a real account and can't be scripted:

1. Create a free account at the Copernicus Data Space Ecosystem.
2. Go to the Sentinel Hub Dashboard → User Settings → OAuth clients → create a new client.
3. Copy the `client_id` and `client_secret` immediately — the secret is only shown once.
4. Add both as environment variables:
   - Locally: `.env.local` at the repo root — confirm it's gitignored before committing anything.
   - On Vercel: Project → Settings → Environment Variables, added to **Production, Preview, and Development** (missing Preview causes preview/PR deploys to 500 while main works fine).

```
CDSE_CLIENT_ID=xxxxx
CDSE_CLIENT_SECRET=xxxxx
```

Claude Code should assume these already exist and just reference `process.env.CDSE_CLIENT_ID` / `process.env.CDSE_CLIENT_SECRET`. Never hardcode them, never expose them to client-side code.

---

## 1. Why this isn't a flat `<img>` like the chlorophyll page

The chlorophyll cards hit NASA GIBS' public WMS directly — no auth, no cost. Copernicus/Sentinel Hub is different:

- Every render costs "Processing Units" (PUs), billed to the account (10,000 free/month). Auth is required (OAuth2 client-credentials), so **the secret can never sit in client-side code or a public `<img src>`** — every request has to go through our own server, which then adds the bearer token.
- Sentinel Hub's synchronous Process API caps a single image at **2500×2500px**. Victoria's coastline is ~2000km; at native Sentinel-2 resolution (10m/px) that's ~200,000px across — nowhere close to fitting in one request. So the detail view can't be a single flat image the way the chlorophyll cards are — it has to be a tiled, zoomable map, with each tile requested only as the user pans/zooms into it.
- Sentinel-2 revisit over Victoria is ~3–5 days (not daily like VIIRS), so expect a sparser card list than the chlorophyll page.

Two-tier design that solves this:
- **Card thumbnails** — cheap, small, wide static PNGs covering the whole locked coast bbox (one Process API call per date).
- **Detail view** — a real Leaflet map, bounded/locked to the Victorian coast, with a custom XYZ tile layer that proxies each tile through our own auth'd Process API route. Tiles are cached forever (imagery for a past date never changes), so cost is a one-off per tile the first time anyone looks at it.

---

## 2. Locked AOI

```js
// lib/copernicus/constants.js
export const VIC_COAST_BOUNDS = [
  [-39.3, 140.9], // SW — near the SA border, south of Discovery Bay
  [-37.2, 150.0], // NE — near Mallacoota/NSW border
];
export const VIC_COAST_BBOX = [140.9, -39.3, 150.0, -37.2]; // [minLon, minLat, maxLon, maxLat]
```

Treat these as a first pass — render it, eyeball it against the actual coastline, and nudge the corners in if the framing looks off before shipping.

---

## 3. Auth helper

```js
// lib/copernicus/auth.js
export async function getToken() {
  const res = await fetch(
    "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.CDSE_CLIENT_ID,
        client_secret: process.env.CDSE_CLIENT_SECRET,
      }),
    }
  );
  if (!res.ok) throw new Error(`CDSE auth failed: ${res.status}`);
  const data = await res.json();
  return data.access_token; // short-lived (~10 min) — fetch fresh per server-side call, don't cache client-side
}
```

---

## 4. Catalog route — find viable (low-cloud) dates

```js
// app/api/satellite/scenes/route.js
import { getToken } from "@/lib/copernicus/auth";
import { VIC_COAST_BBOX } from "@/lib/copernicus/constants";

const CLOUD_THRESHOLD = 30; // % — tune this against real results

export async function GET() {
  const token = await getToken();
  const [minLon, minLat, maxLon, maxLat] = VIC_COAST_BBOX;
  const wkt = `POLYGON((${minLon} ${minLat},${maxLon} ${minLat},${maxLon} ${maxLat},${minLon} ${maxLat},${minLon} ${minLat}))`;
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const filter = [
    `Collection/Name eq 'SENTINEL-2'`,
    `OData.CSC.Intersects(area=geography'SRID=4326;${wkt}')`,
    `ContentDate/Start gt ${since}`,
    `Attributes/OData.CSC.DoubleAttribute/any(att:att/Name eq 'cloudCover' and att/OData.CSC.DoubleAttribute/Value lt ${CLOUD_THRESHOLD})`,
  ].join(" and ");

  const url = `https://catalogue.dataspace.copernicus.eu/odata/v1/Products?$filter=${encodeURIComponent(
    filter
  )}&$orderby=ContentDate/Start desc`;

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const { value } = await res.json();

  const scenes = value.map((p) => ({
    id: p.Id,
    date: p.ContentDate.Start.slice(0, 10),
    cloudCover: p.Attributes?.find((a) => a.Name === "cloudCover")?.Value ?? null,
  }));

  return Response.json(scenes, {
    headers: { "Cache-Control": "public, max-age=3600" }, // recheck hourly, not on every load
  });
}
```

Note: `cloudCover` here is typically for the whole Sentinel-2 tile, not clipped to the AOI — good enough to start, revisit with the Statistics API later if it's giving false positives/negatives over the actual coast.

---

## 5. Card thumbnail route — cheap wide preview

```js
// app/api/satellite/thumbnail/route.js
import { getToken } from "@/lib/copernicus/auth";
import { VIC_COAST_BBOX } from "@/lib/copernicus/constants";

const evalscriptTrueColor = `
//VERSION=3
function setup() { return { input: ["B02","B03","B04"], output: { bands: 3 } }; }
function evaluatePixel(s) { return [s.B04*2.5, s.B03*2.5, s.B02*2.5]; }`;

export async function GET(req) {
  const date = new URL(req.url).searchParams.get("date");
  if (!date) return new Response("Missing date", { status: 400 });

  const token = await getToken();

  const res = await fetch("https://sh.dataspace.copernicus.eu/api/v1/process", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      input: {
        bounds: { bbox: VIC_COAST_BBOX },
        data: [
          {
            type: "sentinel-2-l2a",
            dataFilter: { timeRange: { from: `${date}T00:00:00Z`, to: `${date}T23:59:59Z` } },
          },
        ],
      },
      output: { width: 400, height: 160, responses: [{ identifier: "default", format: { type: "image/png" } }] },
      evalscript: evalscriptTrueColor,
    }),
  });

  return new Response(res.body, {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
```

---

## 6. Tile proxy route — powers the detail map

```js
// app/api/satellite/tile/[date]/[z]/[x]/[y]/route.js
import { getToken } from "@/lib/copernicus/auth";

const evalscriptTrueColor = `
//VERSION=3
function setup() { return { input: ["B02","B03","B04"], output: { bands: 3 } }; }
function evaluatePixel(s) { return [s.B04*2.5, s.B03*2.5, s.B02*2.5]; }`;

function tileToBBox(z, x, y) {
  const n = 2 ** z;
  const lon1 = (x / n) * 360 - 180;
  const lon2 = ((x + 1) / n) * 360 - 180;
  const lat1 = (Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n))) * 180) / Math.PI;
  const lat2 = (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI;
  return [lon1, lat1, lon2, lat2];
}

export async function GET(req, { params }) {
  const { date, z, x, y } = params;
  const token = await getToken();
  const bbox = tileToBBox(+z, +x, +y);

  const res = await fetch("https://sh.dataspace.copernicus.eu/api/v1/process", {
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
      output: { width: 256, height: 256, responses: [{ identifier: "default", format: { type: "image/png" } }] },
      evalscript: evalscriptTrueColor,
    }),
  });

  return new Response(res.body, {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
```

The `immutable` cache header matters: once a tile for a given date/z/x/y is rendered once, the CDN serves it forever at zero further PU cost.

---

## 7. Detail map component

```jsx
// components/satellite/SatelliteDetailMap.jsx
"use client";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { VIC_COAST_BOUNDS } from "@/lib/copernicus/constants";

export default function SatelliteDetailMap({ date }) {
  return (
    <MapContainer
      bounds={VIC_COAST_BOUNDS}
      maxBounds={VIC_COAST_BOUNDS}
      maxBoundsViscosity={1.0}
      minZoom={7}
      maxZoom={14}
      style={{ height: "80vh", width: "100%" }}
    >
      <TileLayer url={`/api/satellite/tile/${date}/{z}/{x}/{y}`} />
    </MapContainer>
  );
}
```

Must be dynamically imported with `ssr: false` wherever it's used (react-leaflet breaks under SSR):

```jsx
import dynamic from "next/dynamic";
const SatelliteDetailMap = dynamic(() => import("@/components/satellite/SatelliteDetailMap"), { ssr: false });
```

Install: `npm install leaflet react-leaflet`

---

## 8. Card list page

Route: `app/live/satellite/page.jsx` — mirror `app/live/chlorophyll/page.jsx` for card markup, spacing, and pagination. Fetch `/api/satellite/scenes`, render one card per date with `<img src="/api/satellite/thumbnail?date=..." />`, and link each card to `/live/satellite/[date]`, which renders `SatelliteDetailMap`.

Add the nav entry into the existing "Live data" dropdown (alongside Chlorophyll, Sea temperature, Currents, Altimetry, Salinity) — not as a new top-level menu item.

---

## 9. Build order

Build and verify each stage before moving to the next:

1. **Auth helper** — log the token, confirm it's non-empty.
2. **Catalog route** — hit `/api/satellite/scenes` directly in the browser, confirm real dates + cloud cover come back.
3. **Tile proxy** — load one tile URL directly (e.g. `/api/satellite/tile/2026-07-23/8/230/145`) directly in the browser, confirm a real satellite image renders, not an error PNG.
4. **Map component** — wire the confirmed-working tile route into `SatelliteDetailMap`, confirm bounds are locked and zoom feels right.
5. **Thumbnail route + card list** — build last, once everything under it is proven.

## 10. Known gotchas to flag up front

- `react-leaflet` needs `ssr: false` on dynamic import, and `leaflet/dist/leaflet.css` imported somewhere — skip either and it fails silently or renders with broken tile positioning.
- The Process API's synchronous limit is 2500×2500px — never build a route that tries to render the whole coast bbox at high resolution in one call.
- `cloudCover` from the catalog is tile-level, not AOI-clipped — treat the `CLOUD_THRESHOLD` as a rough filter, not gospel.
- Token lifetime is ~10 minutes — fetch fresh per server-side request rather than trying to cache/reuse it across requests.
