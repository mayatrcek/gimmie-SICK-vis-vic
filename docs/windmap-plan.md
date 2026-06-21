# Plan: Custom "Windy"-style wind + swell map (replaces the Windy embed)

## Context
The Conditions tab embedded a third-party Windy.com iframe for wind. This replaces it with an
in-house lightweight version animated over the Victorian coast using the free Open-Meteo data the
site already uses, with three switchable fields mirroring Windy: Wind, Swell, and Waves (combined
sea-state) — the last two carrying period.

## Approach
A gridded vector-field animation: sample a lattice of points over the coast from Open-Meteo, convert
each to U/V components, and animate particles with leaflet-velocity. Three fields, one shown at a time.
- Wind — wind_speed_10m + wind_direction_10m
- Swell — swell_wave_height + swell_wave_direction (period from swell_wave_period)
- Waves — wave_height + wave_direction (period from wave_period)

## Data pipeline (reuse MARINE/WEATHER/TZ)
- Grid: bbox lon 143.3–146.6, lat -39.3 → -38.0, step ~0.22° (~112 points), row-major from the NW
  corner so arrays line up with leaflet-velocity's expected order.
- One multi-coordinate request per source (WEATHER for wind; MARINE for swell+waves). Response is a
  JSON array, one element per point, in input order; read el.current.<var>.
- mag+dir → U/V (meteorological "from"): u = -mag*sin(dir), v = -mag*cos(dir). Null cells → 0.

## Map / toggle / legend / readout (initWindMap)
- Esri World_Imagery + World_Boundaries base, same as initMap; view ~[-38.6,145.0],7.
- windLayer/swellLayer/wavesLayer as L.velocityLayer; only the active one on the map; FIELDS config
  holds each field's colorScale/maxVelocity/legend stops.
- Wind|Swell|Waves segmented toggle in the panel header; legend reflects the active scale.
- Click → nearest grid cell "now" readout (.geoinfo box) + opens the forecast table.

## Forecast table on click (3-hourly, 48h)
- Hidden panel after #windmap (mirrors .surfbox); header shows nearest spot + coords; ✕ to dismiss.
- fetchPointForecast(lat,lon): WEATHER hourly weather_code/wind; MARINE hourly wave/swell/tide.
  Start at current hour, every 3rd step, ~16 columns.
- Rows: time, dive rating (0–5 via classify + DIVE_SCORE {Amazing:5,Good:4,Marginal:2,Poor:1}),
  weather icon (WMO code→glyph), wind, waves, wave period, swell, tide. "—" for null cells.

## Files changed
- index.html — leaflet-velocity CDN tags; replace Windy iframe with #windmap + toggle + legend +
  hidden forecast-table panel.
- styles.css — #windmap sizing, toggle buttons, legend swatches, forecast-table styles.
- app.js — WINDMAP/FIELDS/DIVE_SCORE, fetchFieldGrid, toVelocityData, initWindMap,
  fetchPointForecast, weatherIcon, forecast table render; wiring into init/showTab/reloadAll.
  Reuses classify, rate, compass, windRel, fmt, dname.

## Caveats
- Nearshore/Port Phillip cells return null marine data (coarse model) and show no particles —
  expected, noted in the caption.
- Dive rating off-spot uses the nearest known dive-site's onshore bearing — an approximation.