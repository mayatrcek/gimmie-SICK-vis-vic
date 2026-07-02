"use client";

import { Line } from "react-chartjs-2";
import { metaPlugin } from "@/lib/chart/plugins";
import { classify } from "@/lib/logic/rating";
import { SPOTS } from "@/lib/data/regions";
import { DIVE_SCORE, FIELDS } from "@/lib/windmap/config";
import { colorAt } from "@/lib/windmap/field";
import {
  exactTidePeaks,
  weatherIcon,
  wmFcAxis,
  wmFcOpts,
  wmMetreAxis,
  wmTidePeaks,
  fmt,
} from "@/lib/windmap/forecast";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OMResp = any;

function nearestSpot(lat: number, lon: number) {
  let best = null;
  let bd = 1e9;
  for (const id in SPOTS) {
    const s = SPOTS[id];
    const dx = s.lat - lat;
    const dy = s.lon - lon;
    const d = dx * dx + dy * dy;
    if (d < bd) {
      bd = d;
      best = s;
    }
  }
  return best;
}

const relDay = (d: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dd = new Date(d);
  dd.setHours(0, 0, 0, 0);
  const diff = Math.round((dd.getTime() - today.getTime()) / 86400000);
  return diff === 0 ? "Today" : d.toLocaleDateString(undefined, { weekday: "short" });
};

function WindArrow({ speed, dir }: { speed: number | null; dir: number | null }) {
  if (speed == null || isNaN(speed)) return <>—</>;
  const rgb = colorAt(FIELDS.wind.colorScale, speed / FIELDS.wind.maxVelocity);
  const col = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
  const rot = dir != null && !isNaN(dir) ? (dir + 180) % 360 : 0;
  return (
    <div className="wmf-windcell">
      <svg className="wmf-arrow" viewBox="0 0 24 24" style={{ transform: `rotate(${rot}deg)`, color: col }}>
        <path d="M12 21 V4 M6 10 L12 3 L18 10" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="wmf-ws">{fmt(speed, 0)}</span>
    </div>
  );
}

export default function PointForecast({ lat, lng, wRes, mRes }: { lat: number; lng: number; wRes: OMResp; mRes: OMResp }) {
  const wh = wRes.hourly || {};
  const mh = mRes.hourly || {};
  const times: string[] = wh.time || [];
  if (!times.length) return <div className="pad" style={{ padding: "14px", color: "var(--muted)", fontSize: 13 }}>No forecast available here.</div>;

  const mIdx: Record<string, number> = {};
  (mh.time || []).forEach((t: string, k: number) => (mIdx[t] = k));
  const now = Date.now();
  let start = 0;
  for (let i = 0; i < times.length; i++) {
    if (new Date(times[i]).getTime() >= now - 3600000) {
      start = i;
      break;
    }
  }
  const cols: number[] = [];
  for (let i = start; i < times.length && cols.length < 16; i += 3) cols.push(i);

  const spot = nearestSpot(lat, lng);
  const onshore = spot ? spot.onshore : 200;

  // day groups + day-start separator columns
  const dayGroups: { label: string; span: number; ab: string }[] = [];
  cols.forEach((k) => {
    const d = new Date(times[k]);
    const key = d.toDateString();
    const last = dayGroups[dayGroups.length - 1];
    if (!dayGroups.length || (last as unknown as { key?: string }).key !== key) {
      dayGroups.push({ label: relDay(d), span: 1, ab: dayGroups.length % 2 ? "wmf-day-b" : "wmf-day-a" });
      (dayGroups[dayGroups.length - 1] as unknown as { key: string }).key = key;
    } else last.span++;
  });
  const sepCols: Record<number, boolean> = {};
  let pdn: number | null = null;
  cols.forEach((k, idx) => {
    const dn = new Date(times[k]).getDate();
    if (idx > 0 && dn !== pdn) sepCols[k] = true;
    pdn = dn;
  });
  const sepCls = (k: number, extra?: string) => {
    let c = sepCols[k] ? "wmf-sep" : "";
    if (extra) c += (c ? " " : "") + extra;
    return c || undefined;
  };

  // chart series
  const L: string[] = [];
  const swH: (number | null)[] = [];
  const wvH: (number | null)[] = [];
  const swP: (number | null)[] = [];
  const wvP: (number | null)[] = [];
  const tide: (number | null)[] = [];
  cols.forEach((k) => {
    const mk = mIdx[times[k]];
    L.push(times[k]);
    swH.push(mk != null ? mh.swell_wave_height[mk] : null);
    wvH.push(mk != null ? mh.wave_height[mk] : null);
    swP.push(mk != null ? mh.swell_wave_period[mk] : null);
    wvP.push(mk != null ? mh.wave_period[mk] : null);
    tide.push(mk != null ? mh.sea_level_height_msl[mk] : null);
  });

  const swOpts = wmFcOpts(swP, wvP, 0);
  swOpts.plugins.meta = { times: L };
  const tideOpts = wmFcOpts();
  tideOpts.plugins.meta = { times: L, peaks: exactTidePeaks(times, mh, mIdx, cols) };

  return (
    <div className="wmf-grid">
      <table className="wmf-table">
        <tbody>
          <tr className="wmf-dayrow">
            <th />
            {dayGroups.map((g, i) => (
              <td key={i} colSpan={g.span} className={`wmf-daybox ${g.ab}`}>
                <span>{g.label}</span>
              </td>
            ))}
          </tr>
          <tr className="wmf-time">
            <th>Time</th>
            {cols.map((k) => (
              <td key={k} className={sepCls(k)}>
                {new Date(times[k]).getHours()}:00
              </td>
            ))}
          </tr>
          <tr>
            <th>Dive</th>
            {cols.map((k) => {
              const mk = mIdx[times[k]];
              const sh = mk != null ? mh.swell_wave_height[mk] : null;
              const sp = mk != null ? mh.swell_wave_period[mk] : null;
              const wind = wh.wind_speed_10m ? wh.wind_speed_10m[k] : null;
              const wdir = wh.wind_direction_10m ? wh.wind_direction_10m[k] : null;
              const rt = classify(sh, sp, wind, wdir, onshore, null, false);
              const sc = DIVE_SCORE[rt.label as string] || 0;
              return (
                <td key={k} className={sepCls(k)}>
                  <span className="wmf-rate" style={{ background: rt.col }} title={String(rt.label)}>
                    {sc}
                  </span>
                </td>
              );
            })}
          </tr>
          <tr>
            <th>Sky</th>
            {cols.map((k) => (
              <td key={k} className={sepCls(k, "wmf-sky")}>
                {weatherIcon(wh.weather_code ? wh.weather_code[k] : null, wh.is_day ? wh.is_day[k] : 1)}
              </td>
            ))}
          </tr>
          <tr className="wmf-windrow">
            <th>Wind</th>
            {cols.map((k) => (
              <td key={k} className={sepCls(k)}>
                <WindArrow
                  speed={wh.wind_speed_10m ? wh.wind_speed_10m[k] : null}
                  dir={wh.wind_direction_10m ? wh.wind_direction_10m[k] : null}
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <div className="wmf-crow">
        <div className="wmf-clabel">
          <span className="wmf-leg" style={{ color: "#3b6fb0" }}>
            <i style={{ background: "#3b6fb0" }} />Swell
          </span>
          <span className="wmf-leg" style={{ color: "#2e7d6b" }}>
            <i style={{ background: "#2e7d6b" }} />Waves
          </span>
        </div>
        <div className="wmf-cbox">
          <Line
            options={swOpts}
            plugins={[metaPlugin, wmMetreAxis]}
            data={{
              labels: L,
              datasets: [
                { label: "Swell", data: swH, borderColor: "#3b6fb0", backgroundColor: "#3b6fb022", borderWidth: 2, pointRadius: 0, tension: 0.35, fill: true },
                { label: "Waves", data: wvH, borderColor: "#2e7d6b", borderWidth: 2, pointRadius: 0, tension: 0.35 },
              ],
            }}
          />
        </div>
      </div>
      <div className="wmf-crow">
        <div className="wmf-clabel">Tide</div>
        <div className="wmf-cbox">
          <Line
            options={tideOpts}
            plugins={[metaPlugin, wmFcAxis, wmTidePeaks]}
            data={{
              labels: L,
              datasets: [
                { label: "Tide", data: tide, borderColor: "#6a9bcc", backgroundColor: "#6a9bcc22", borderWidth: 2, pointRadius: 0, tension: 0.4, fill: true },
              ],
            }}
          />
        </div>
      </div>
    </div>
  );
}
