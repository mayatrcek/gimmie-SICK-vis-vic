import type { Hourly, Row, SiteData, Spot } from "@/lib/types";
import { dayRating, runoffIndex, score10, windRel } from "@/lib/logic/rating";
import { tideSeries } from "@/lib/tides/series";
import { RAIN_DAYS } from "@/lib/data/thresholds";

export const MARINE = "https://marine-api.open-meteo.com/v1/marine";
export const WEATHER = "https://api.open-meteo.com/v1/forecast";
export const TZ = "Australia/Melbourne";

// 7-day daily + hourly marine/weather for one spot.
// ponytail: keep the two-request-per-spot shape from app.js — Open-Meteo's free
// tier is call-budget limited, and this matches the original's discipline.
export async function fetchSite(s: Spot): Promise<SiteData> {
  const lat = s.seaLat ?? s.lat;
  const lon = s.seaLon ?? s.lon;
  const m =
    `${MARINE}?latitude=${lat}&longitude=${lon}` +
    "&daily=swell_wave_height_max,swell_wave_period_max,wave_height_max,wave_period_max" +
    "&hourly=sea_surface_temperature,swell_wave_height,swell_wave_period,swell_wave_direction,sea_level_height_msl" +
    `&timezone=${TZ}&forecast_days=7`;
  const w =
    `${WEATHER}?latitude=${s.lat}&longitude=${s.lon}` +
    "&daily=precipitation_sum,rain_sum,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant" +
    "&hourly=wind_speed_10m,wind_direction_10m" +
    // past_days covers the runoff window — same one request, just more rows.
    `&timezone=${TZ}&forecast_days=7&past_days=${RAIN_DAYS}`;

  const [marine, weather] = await Promise.all([
    fetch(m).then((r) => r.json()),
    fetch(w).then((r) => r.json()),
  ]);

  const md = marine.daily;
  const mh = marine.hourly || {};
  const wd = weather.daily;
  const wIdx: Record<string, number> = {};
  wd.time.forEach((d: string, i: number) => {
    wIdx[d] = i;
  });

  const sstSum: Record<string, number> = {};
  const sstN: Record<string, number> = {};
  if (mh.time) {
    mh.time.forEach((t: string, k: number) => {
      const d = t.slice(0, 10);
      const v = mh.sea_surface_temperature ? mh.sea_surface_temperature[k] : null;
      if (v != null) {
        sstSum[d] = (sstSum[d] || 0) + v;
        sstN[d] = (sstN[d] || 0) + 1;
      }
    });
  }

  // Runoff index per day (that day's rain plus the decayed week before it),
  // needed both per-row and per-hour below, so compute it once.
  const runoffByDate: Record<string, number> = {};
  wd.time.forEach((date: string, i: number) => {
    runoffByDate[date] = runoffIndex(wd.precipitation_sum, i);
  });

  // Day "rough guide" = mode of that day's hourly score10 buckets, restricted
  // to daylight hours (6am-8pm — nobody's rating a 1am reading), so the tab
  // agrees with what the hourly table underneath actually shows during the
  // hours people are in the water, instead of a separate max-based calc.
  const whIdx: Record<string, number> = {};
  (weather.hourly?.time || []).forEach((t: string, i: number) => {
    whIdx[t] = i;
  });
  const scoresByDate: Record<string, (number | null)[]> = {};
  if (mh.time) {
    mh.time.forEach((t: string, k: number) => {
      const hour = +t.slice(11, 13);
      if (hour < 6 || hour > 20) return;
      const date = t.slice(0, 10);
      const h = mh.swell_wave_height ? mh.swell_wave_height[k] : null;
      const wi = whIdx[t];
      const wind = wi != null ? weather.hourly.wind_speed_10m[wi] : null;
      const wdir = wi != null ? weather.hourly.wind_direction_10m[wi] : null;
      const sc = score10(s, h, wind, wdir, runoffByDate[date] ?? null);
      if (sc != null) (scoresByDate[date] ??= []).push(sc);
    });
  }

  const rows: Row[] = [];
  md.time.forEach((date: string, i: number) => {
    const h =
      md.swell_wave_height_max && md.swell_wave_height_max[i] != null
        ? md.swell_wave_height_max[i]
        : md.wave_height_max
          ? md.wave_height_max[i]
          : null;
    const p =
      md.swell_wave_period_max && md.swell_wave_period_max[i] != null
        ? md.swell_wave_period_max[i]
        : md.wave_period_max
          ? md.wave_period_max[i]
          : null;
    const wi = wIdx[date];
    const wind = wi != null ? wd.wind_speed_10m_max[wi] : null;
    const wdir = wi != null ? wd.wind_direction_10m_dominant[wi] : null;
    const rToday = wi != null ? wd.precipitation_sum[wi] || 0 : 0;
    const sst = sstN[date] ? sstSum[date] / sstN[date] : null;
    rows.push({
      date,
      h,
      p,
      sst,
      wind,
      wdir,
      rel: windRel(wdir, s.onshore),
      rainToday: rToday,
      runoff: runoffByDate[date] ?? 0,
      rating: dayRating(scoresByDate[date] ?? []),
    });
  });

  // Tides come from harmonic constituents fitted to gauge records, not from the
  // marine model — see lib/tides/series.ts.
  const tides = tideSeries(s.id, mh.time || [], mh.sea_level_height_msl || []);

  const hourly: Hourly = {
    mtime: mh.time || [],
    swellH: mh.swell_wave_height || [],
    swellP: mh.swell_wave_period || [],
    swellD: mh.swell_wave_direction || [],
    tide: tides.tide,
    tideRef: tides.ref,
    wtime: weather.hourly ? weather.hourly.time : [],
    wind: weather.hourly ? weather.hourly.wind_speed_10m : [],
    wdir: weather.hourly ? weather.hourly.wind_direction_10m : [],
  };

  return { rows, hourly };
}
