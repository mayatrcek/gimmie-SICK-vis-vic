import type { Hourly, Row, SiteData, Spot } from "@/lib/types";
import { classify, windRel } from "@/lib/logic/rating";

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
    `&timezone=${TZ}&forecast_days=7&past_days=1`;

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
    const rYest = wi != null && wi > 0 ? wd.precipitation_sum[wi - 1] || 0 : 0;
    const rEff = rToday + 0.5 * rYest;
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
      rainEff: rEff,
      rating: classify(h, p, wind, wdir, s.onshore, rEff, s.sheltered),
    });
  });

  const hourly: Hourly = {
    mtime: mh.time || [],
    swellH: mh.swell_wave_height || [],
    swellP: mh.swell_wave_period || [],
    swellD: mh.swell_wave_direction || [],
    tide: mh.sea_level_height_msl || [],
    wtime: weather.hourly ? weather.hourly.time : [],
    wind: weather.hourly ? weather.hourly.wind_speed_10m : [],
    wdir: weather.hourly ? weather.hourly.wind_direction_10m : [],
  };

  return { rows, hourly };
}

// 3-day hourly point forecast for the wind-map click-to-forecast panel.
// Returns [weatherResponse, marineResponse].
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchPointForecast(lat: number, lon: number): Promise<[any, any]> {
  const w =
    `${WEATHER}?latitude=${lat}&longitude=${lon}` +
    `&hourly=weather_code,wind_speed_10m,wind_direction_10m,is_day&timezone=${TZ}&forecast_days=3`;
  const m =
    `${MARINE}?latitude=${lat}&longitude=${lon}` +
    `&hourly=wave_height,wave_period,swell_wave_height,swell_wave_period,sea_level_height_msl&timezone=${TZ}&forecast_days=3`;
  return Promise.all([fetch(w).then((r) => r.json()), fetch(m).then((r) => r.json())]);
}
