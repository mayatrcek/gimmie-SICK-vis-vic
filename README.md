# GIMMIE SICK VIS

A daily dive- and fishing-conditions dashboard for the Victorian coast: swell, wind,
sea-surface temperature, chlorophyll, seabed habitat and bathymetry, from free public
marine/satellite feeds.

**Live:** https://gimmie-sick-vis-vic.vercel.app (Vercel, auto-deploys from `main`)

Built with **Next.js (App Router) + React + TypeScript + Tailwind v4** and
react-leaflet. (Ported from the original single-file static site.)

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm test           # rating-logic + ERDDAP-client self-checks
```

## Structure

- `app/` — routes (App Router). Home is SSG; each section is its own route.
  Maps are client components dynamically imported with `ssr:false`.
  - `/forecast` — dive-site ratings; each expanded spot card shows a 3-hourly
    week table (0–10 score, wave height/direction/period, energy, wind,
    high/low tides) from Open-Meteo hourly data; card water temp comes from
    the latest NOAA ACSPO scan via `sst-point?box=1` (Open-Meteo fallback)
  - `/live/*` — SST (12-day daily-scan gallery), chlorophyll (daily-scan
    gallery), currents, altimetry, salinity, Nepean cam
  - `/geo/*` — seabed habitat, depth/bathymetry
  - `/fish` — species guide (OVERWORLD sprite cards)
- `app/api/*` — server route handlers proxying the gov feeds that used to be
  called via JSONP: ERDDAP `timestamp`, `sst-stretch` (regional percentiles that
  drive the SST colour stretch), `sst-fronts` (detected thermal-front cells for
  the SST map overlay), `sst-point` (click-probe temperature readout),
  Nominatim `geocode`, Seamap `habitat`, DEECA `depth`,
  and `depth-tile` (Terrarium elevation PNGs for the dive-map water shading).
- `components/` — UI + map/chart components. `MapRecall` persists each map's
  last-viewed center/zoom to localStorage (`gsv:mapview:<name>`).
- `lib/` — data (`data/`), pure logic (`logic/`), API clients (`api/`),
  Leaflet helpers (`leaflet/`).
- `app/overworld.css` — the OVERWORLD pixel design system (see `ui_design/overworld/`);
  `app/globals.css` wires Tailwind v4 (no preflight) + the homepage `@theme` tokens.
- `public/assets/` — brand, loading anims, pre-rendered geo basemaps.
- `tools/prerender-geo.js` — offline helper to refresh `assets/geo/*.png` (run manually).
- `tools/prerender-pixelmap.js` — bakes the dive-sites OVERWORLD basemap to
  `assets/geo/pixelmap.png` (instant under-layer; re-run when the palette changes).
- `sources/`, `docs/` — reference material and planning notes; not part of the build.

## Data sources

Open-Meteo (marine + weather), NOAA ACSPO L3S 2 km SST + thermal fronts via NOAA
CoastWatch ERDDAP, NASA GIBS VIIRS
chlorophyll (NOAA-20, NOAA-21, Suomi NPP), Seamap Australia benthic habitat,
DEECA CoastKit bathymetry/contours,
Esri basemaps, CARTO basemap + AWS Terrarium bathymetry (dive-sites pixel map).
All free/public; a planning aid, not for navigation or safety-of-life use.

## Known quirks

- **Full-screen overlays vs the fixed nav:** the chlorophyll scan view (`.chlfull`)
  is a fixed overlay offset by `--tabh` (60px) so map controls aren't hidden behind
  the tab bar, and it must stay below the tabs' z-index (1300). The phone tab bar
  (≤560px) is hardcoded to 56px, not `--tabh`, so there's a 4px mismatch — harmless
  now, but a bug waiting if either height changes. Any future full-screen overlay
  needs the same offset.
