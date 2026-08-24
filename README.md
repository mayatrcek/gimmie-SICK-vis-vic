# GIMMIE SICK VIS

A daily dive- and fishing-conditions dashboard for the Victorian coast: swell, wind,
sea-surface temperature, chlorophyll and bathymetry, from free public
marine/satellite feeds.

**Live:** https://gimmiesickvis.com (Vercel, auto-deploys from `main`; the
`gimmie-sick-vis-vic.vercel.app` host should 301 here). The canonical host is
hardcoded in `app/layout.tsx` (`metadataBase`), `app/sitemap.ts`, `app/robots.ts`
and the JSON-LD in `app/page.tsx` — change all four together if the domain moves.

Search appearance: every route exports its own `title`/`description`;
`alternates: { canonical: "./" }` in the layout makes each page canonical itself;
the homepage carries `WebSite` + `Organization` JSON-LD (this is what sets the
site name shown above the result) and `/back-beach` carries `Article`. The sitemap
ships `priority` but deliberately no `lastmod` — see the note in `app/sitemap.ts`.
Sitelinks themselves are Google's call — no markup produces them, so the lever is
section hubs and clean internal links.

**A page behind `ssr:false` (or behind a client-fetch gate) is invisible to
crawlers** — this is the trap to watch when adding a route. `/forecast` shipped
16 KB of nav and an empty loading div for months: no headings, none of the ~77
spot names. The SST and satellite galleries hoist their header above the data
gate for the same reason, and every `SnaggleInfo` note now renders into the server
HTML (`hidden` until you click) rather than only existing after one — content
behind a toggle the visitor can open, not text hidden only from humans.
`/forecast` deliberately stays minimal: it carries only an `sr-only` `<h1>`, since
its visible heading is inside the `ssr:false` client. The intro copy and the
77-name site index that briefly lived here were cut as page clutter — if those
keywords need a home, put them somewhere a visitor actually reads them (the
homepage SUMMARY, `/back-beach`), not off-screen. If you add a page, check
the built HTML, not the browser:
`grep -o '<h1[^>]*>[^<]*' .next/server/app/<route>.html`.

Every page has exactly one `<h1>` (`.panel-ttl`, which carries `margin:0` because
Tailwind runs with no preflight). Coming-soon stubs (`/store`, `/live/altimetry`,
`/live/bathymetry`, `/live/salinity`) carry `robots:{index:false}` and are absent
from the sitemap — thin pages drag the whole domain. Re-add them when they ship.

Built with **Next.js (App Router) + React + TypeScript + Tailwind v4** and
react-leaflet. (Ported from the original single-file static site.)

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm test           # rating-logic + ERDDAP-client self-checks
python test_cmems_currents.py  # currents rasterizer self-check (no CMEMS creds needed)
```

## Structure

- `app/` — routes (App Router). Home is SSG; each section is its own route.
  Maps are client components dynamically imported with `ssr:false`.
  - `/forecast` — dive-site ratings; each expanded spot card shows vis notes
    (runoff, standing dirty-water and tidal warnings) plus a 3-hourly week table
    (0–10 score, wave height/direction/period, energy, wind, runoff, high/low
    tides) from Open-Meteo hourly data; card water temp comes from the latest
    NOAA ACSPO scan via `sst-point?box=1` (Open-Meteo fallback)
  - `/live/*` — SST (12-day daily-scan gallery), chlorophyll (daily-scan
    gallery), currents (12-day vector-arrow gallery), altimetry, salinity,
    Nepean cam
  - `/geo/*` — depth/bathymetry
  - `/fish` — species guide (OVERWORLD sprite cards). Currently behind a WIP
    gate: `FISH_WIP` in `lib/nav.ts` is the single switch — it greys the nav and
    home-shelf entries, stubs the page, noindexes it and drops it from the
    sitemap. Set it to `false` to put the guide back.
- `app/api/*` — server route handlers proxying the gov feeds that used to be
  called via JSONP: ERDDAP `timestamp`, `sst-stretch` (regional percentiles that
  drive the SST colour stretch), `sst-fronts` (detected thermal-front cells for
  the SST map overlay), `sst-point` (click-probe temperature readout),
  Nominatim `geocode`,
  and `depth-tile` (Terrarium elevation PNGs for the dive-map water shading).
- `components/` — UI + map/chart components. `MapRecall` persists each map's
  last-viewed center/zoom to localStorage (`gsv:mapview:<name>`); `DiveSites`
  persists this device's chosen spots and which card is open
  (`gsv:locations:v1`, falling back to `DEFAULTS` in `lib/data/regions.ts`).
- `lib/` — data (`data/`), pure logic (`logic/`), API clients (`api/`),
  Leaflet helpers (`leaflet/`).
  - `lib/data/thresholds.ts` — every rating knob, calibrated (in knots) against
    the 22 hand-rated scenarios in
    `sources/docs/gimmie_sick_vis_rating_examples.xlsx`. `lib/logic/rating.test.ts`
    replays all 22, so a threshold change that drifts off Maya's calls fails
    `npm test`. Retune here, not in `rating.ts`.
  - `lib/data/regions.ts` — every region carries a `state`, and the dive-site
    picker cascades state › region › site off `REGIONS`/`STATES`, so adding a
    state or region is a data-only change.
  - Spots can carry `murky: "river" | "bay" | "silt"` (regularly dirty water —
    the score stops docking them for rain and they get a standing warning
    instead; `"silt"` is Western Port's tide-stirred mudflat water) and `tidal`
    (slack-water-only). Sheltered spots north of −38.15 are auto-flagged
    `"bay"` for the silty top half of Port Phillip.
  - `onshore` is the bearing the site's open water lies in; `null` means
    shoreless (mid-bay pinnacles, wrecks, channel walls), and the expanded
    card's "Vs land" row shows `—` rather than guessing on/off/cross.
  - `sheltered` spots score on wind alone — nothing else may deduct from them.
    Runoff and tidal race are warnings, not points. `SHELTER_KMH` is the one
    ladder in km/h rather than knots (15 km/h is a 7, 20 km/h a 4, 46 km/h a 1 —
    the fall-off just past the hinge is steep on purpose); it supersedes the
    spreadsheet's five sheltered rows.
- `app/overworld.css` — the OVERWORLD pixel design system (see `ui_design/overworld/`);
  `app/globals.css` wires Tailwind v4 (no preflight) + the homepage `@theme` tokens.
- `public/assets/` — brand, loading anims, pre-rendered geo basemaps.
- `tools/prerender-geo.js` — offline helper to refresh `assets/geo/*.png` (run manually).
- `tools/prerender-pixelmap.js` — bakes the dive-sites OVERWORLD basemap to
  `assets/geo/pixelmap.png` (instant under-layer; re-run when the palette changes).
- `sources/`, `docs/` — reference material and planning notes; not part of the build.

## Data sources

Open-Meteo (marine + weather), NOAA ACSPO L3S 2 km SST + thermal fronts via NOAA
CoastWatch ERDDAP, Copernicus Marine global ocean forecast surface currents
(0.083°, `uo`/`vo`) via the `copernicusmarine` Python client, NASA GIBS VIIRS
chlorophyll (NOAA-20, NOAA-21, Suomi NPP), DEECA CoastKit bathymetry/contours,
Esri basemaps, CARTO basemap + AWS Terrarium bathymetry (dive-sites pixel map).
All free/public; a planning aid, not for navigation or safety-of-life use.

Currents needs a free Copernicus Marine account (register at
data.marine.copernicus.eu) with `COPERNICUSMARINE_SERVICE_USERNAME` /
`COPERNICUSMARINE_SERVICE_PASSWORD` set as Vercel env vars — see
`api/cmems-currents.py`, a Python serverless function (requires the Python
runtime; deps in the root `requirements.txt`) since Copernicus retired
OPeNDAP/ERDDAP/WMS in 2024 and only ships a Python client.

## Known quirks

- **Full-screen overlays vs the fixed nav:** the chlorophyll scan view (`.chlfull`)
  is a fixed overlay offset by `--tabh` (60px) so map controls aren't hidden behind
  the tab bar, and it must stay below the tabs' z-index (1300). The phone tab bar
  (≤560px) is hardcoded to 56px, not `--tabh`, so there's a 4px mismatch — harmless
  now, but a bug waiting if either height changes. Any future full-screen overlay
  needs the same offset.

## Extra notes
- Ask Maya is she is happy to commit and push to testing after every siginifant change