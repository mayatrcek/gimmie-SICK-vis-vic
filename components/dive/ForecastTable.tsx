"use client";

import type { Hourly, Row, Spot } from "@/lib/types";
import { compass, dname, score10, scoreCol, tideExtremes } from "@/lib/logic/rating";
import type { TideMark } from "@/lib/logic/rating";

// 3-hourly slots matching the classic surf-forecast layout (1am–10pm).
const SLOT_HOURS = new Set([1, 4, 7, 10, 13, 16, 19, 22]);

// Fixed column widths so the tide graph's x-axis lines up with the day columns.
const SLOTW = 46;
const LABW = 110;

const fmt = (n: number | null, d = 1) => (n == null || isNaN(n) ? "—" : Number(n).toFixed(d));

const hlabel = (hour: number) => `${((hour + 11) % 12) + 1}${hour < 12 ? "am" : "pm"}`;

// Arrow pointing in the direction of travel ("from" bearing + 180).
function Arrow({ from }: { from: number | null }) {
  if (from == null || isNaN(from)) return null;
  return (
    <span className="fcarrow" style={{ transform: `rotate(${(from + 180) % 360}deg)` }} aria-hidden="true">
      ↑
    </span>
  );
}

// Hourly sea-level curve across the whole week, dots + time/height labels on
// each high/low. Plain inline SVG — x maps hours onto the table's slot grid.
function TideGraph({ hourly, days }: { hourly: Hourly; days: { date: string; n: number }[] }) {
  const H = 96;
  const PT = 30; // room for high-tide labels
  const PB = 32; // room for low-tide labels
  const dayW = 8 * SLOTW;
  const W = days.length * dayW;
  const dayX: Record<string, number> = {};
  days.forEach((d, i) => (dayX[d.date] = i * dayW));

  const xFor = (t: string): number | null => {
    const x0 = dayX[t.slice(0, 10)];
    if (x0 == null) return null;
    const hour = +t.slice(11, 13) + +t.slice(14, 16) / 60;
    // slot columns are centred on hours 1,4,…,22 → hour h sits at column (h-1)/3
    const x = x0 + ((hour - 1) / 3) * SLOTW + SLOTW / 2;
    return Math.max(x0, Math.min(x0 + dayW, x));
  };

  const vals = hourly.tide.filter((v) => v != null && !isNaN(v));
  if (!vals.length) return null;
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  const yFor = (v: number) => PT + ((hi - v) / (hi - lo || 1)) * (H - PT - PB);

  let path = "";
  hourly.mtime.forEach((t, i) => {
    const v = hourly.tide[i];
    const x = xFor(t);
    if (v == null || isNaN(v) || x == null) return;
    path += `${path ? "L" : "M"}${x.toFixed(1)} ${yFor(v).toFixed(1)}`;
  });

  const marks = tideExtremes(hourly.mtime, hourly.tide)
    .map((m: TideMark) => ({ ...m, x: xFor(`${m.date}T${m.time}`) }))
    .filter((m) => m.x != null) as (TideMark & { x: number })[];

  return (
    <svg width={W} height={H} className="fctidesvg" role="img" aria-label="Tide curve with high and low tide times">
      <path className="fcline" d={path} />
      {marks.map((m) => {
        const y = yFor(m.height);
        const hi2 = m.kind === "H";
        return (
          <g key={m.date + m.time}>
            <circle className="fcdot" cx={m.x} cy={y} r={3.5} />
            {/* heights shown against the week's lowest tide as 0m datum, not MSL */}
            <text className="fclbl fclbl-b" x={m.x} y={hi2 ? y - 17 : y + 16} textAnchor="middle">
              {(m.height - lo).toFixed(1)}m
            </text>
            <text className="fclbl" x={m.x} y={hi2 ? y - 6 : y + 27} textAnchor="middle">
              {m.time}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

type Slot = {
  date: string;
  hour: number;
  first: boolean; // first slot of its day (gets the day divider border)
  h: number | null;
  p: number | null;
  sd: number | null;
  wind: number | null;
  wdir: number | null;
  score: number | null;
};

export default function ForecastTable({ s, hourly, rows }: { s: Spot; hourly: Hourly; rows: Row[] }) {
  const wIdx: Record<string, number> = {};
  hourly.wtime.forEach((t, i) => (wIdx[t] = i));
  const rainByDate: Record<string, number> = {};
  rows.forEach((r) => (rainByDate[r.date] = r.rainEff));

  const slots: Slot[] = [];
  hourly.mtime.forEach((t, i) => {
    const hour = +t.slice(11, 13);
    if (!SLOT_HOURS.has(hour)) return;
    const date = t.slice(0, 10);
    const wi = wIdx[t];
    const h = hourly.swellH[i] ?? null;
    const p = hourly.swellP[i] ?? null;
    const wind = wi != null ? (hourly.wind[wi] ?? null) : null;
    const wdir = wi != null ? (hourly.wdir[wi] ?? null) : null;
    slots.push({
      date,
      hour,
      first: slots.length === 0 || slots[slots.length - 1].date !== date,
      h,
      p,
      sd: hourly.swellD[i] ?? null,
      wind,
      wdir,
      score: score10(h, p, wind, wdir, s.onshore, rainByDate[date] ?? null, s.sheltered),
    });
  });
  if (!slots.length) return <div className="pad">Forecast unavailable.</div>;

  const days: { date: string; n: number }[] = [];
  slots.forEach((sl) => {
    const last = days[days.length - 1];
    if (last && last.date === sl.date) last.n++;
    else days.push({ date: sl.date, n: 1 });
  });

  const td = (sl: Slot, body: React.ReactNode, cls = "") => (
    <td key={sl.date + sl.hour} className={`${cls}${sl.first ? " fcd0" : ""}`}>
      {body}
    </td>
  );

  return (
    <div className="fcwrap">
      <table className="fctable" style={{ width: LABW + slots.length * SLOTW }}>
        <colgroup>
          <col style={{ width: LABW }} />
          {slots.map((sl) => (
            <col key={sl.date + sl.hour} style={{ width: SLOTW }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th className="fclab" />
            {days.map((d) => (
              <th key={d.date} colSpan={d.n} className="fcday fcd0">
                {dname(d.date)}
              </th>
            ))}
          </tr>
          <tr>
            <th className="fclab" />
            {slots.map((sl) =>
              <th key={sl.date + sl.hour} className={`fctime${sl.first ? " fcd0" : ""}`}>{hlabel(sl.hour)}</th>,
            )}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className="fclab">Rating (10 max)</th>
            {slots.map((sl) =>
              td(sl, <span className="fcscore" style={{ background: scoreCol(sl.score) }}>{sl.score ?? "—"}</span>),
            )}
          </tr>
          <tr>
            <th className="fclab">Height (m)</th>
            {slots.map((sl) => td(sl, s.sheltered ? "—" : fmt(sl.h, 1)))}
          </tr>
          <tr>
            <th className="fclab">Direction</th>
            {slots.map((sl) =>
              td(
                sl,
                s.sheltered ? "—" : (
                  <>
                    <Arrow from={sl.sd} />
                    <div>{compass(sl.sd)}</div>
                  </>
                ),
              ),
            )}
          </tr>
          <tr>
            <th className="fclab">Period (s)</th>
            {slots.map((sl) => td(sl, s.sheltered ? "—" : fmt(sl.p, 0)))}
          </tr>
          <tr>
            <th className="fclab">Energy (kJ)</th>
            {/* ponytail: h²·p·28 pseudo-kJ, scaled to read like surf-forecast's column */}
            {slots.map((sl) =>
              td(sl, s.sheltered || sl.h == null || sl.p == null ? "—" : Math.round(28 * sl.h * sl.h * sl.p)),
            )}
          </tr>
          <tr>
            <th className="fclab">Wind (km/h)</th>
            {slots.map((sl) =>
              td(
                sl,
                <>
                  <Arrow from={sl.wdir} /> {fmt(sl.wind, 0)}
                  <div>{compass(sl.wdir)}</div>
                </>,
              ),
            )}
          </tr>
          <tr>
            <th className="fclab">Tide (m)</th>
            <td colSpan={slots.length} className="fcgraph fcd0">
              <TideGraph hourly={hourly} days={days} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
