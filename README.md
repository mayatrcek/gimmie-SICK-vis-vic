# DIVEBYTE — Gimme SICK vis

A daily dive- and fishing-conditions dashboard for the Victorian coast: swell, wind,
sea-surface temperature, chlorophyll, seabed habitat and bathymetry, from free public
marine/satellite feeds.

**Live:** https://gimmie-sick-vis-vic.vercel.app (Vercel, auto-deploys from `main`)

Built with **Next.js (App Router) + React + TypeScript + Tailwind v4**, react-leaflet,
leaflet-velocity and Chart.js. (Ported from the original single-file static site.)

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm test           # rating-logic self-check
```

## Structure

- `app/` — routes (App Router). Home is SSG; each section is its own route
  (`/forecast/*`, `/live/*`, `/geo/*`, `/fish`, …). Maps are client components
  dynamically imported with `ssr:false`.
- `app/api/*` — server route handlers that proxy the gov feeds that used to be
  called via JSONP (ERDDAP timestamp, Nominatim geocode, Seamap habitat, DEECA depth).
- `components/` — UI + map/chart components.
- `lib/` — data (`data/`), pure logic (`logic/`), API clients (`api/`), chart plugins
  (`chart/`), wind-map math (`windmap/`), Leaflet helpers (`leaflet/`).
- `app/overworld.css` — the OVERWORLD pixel design system (see `ui_design/overworld/`);
  `app/globals.css` wires Tailwind v4 (no preflight) + the homepage `@theme` tokens.
- `public/assets/` — brand, loading anims, pre-rendered geo basemaps.
- `tools/prerender-geo.js` — offline helper to refresh `assets/geo/*.png` (run manually).

## Data sources

Open-Meteo (marine + weather), NASA JPL MUR SST via NOAA ERDDAP, NASA GIBS VIIRS
chlorophyll, Seamap Australia benthic habitat, DEECA CoastKit bathymetry/contours,
Esri basemaps. All free/public; a planning aid, not for navigation or safety-of-life use.

> **Open-Meteo call budget:** the wind map issues one bulk request per API (2 models,
> coarse grid) to stay within the free tier — keep it that way.
