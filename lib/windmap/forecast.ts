import type { Plugin } from "chart.js";

export const fmt = (n: number | null, d = 1) => (n == null || isNaN(n) ? "—" : Number(n).toFixed(d));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyChart = any;
export type TidePeak = { t: number; type: "H" | "L"; val: number; label: string };

const tideClock = (ms: number) => {
  const d = new Date(ms);
  const h = d.getHours();
  const mn = d.getMinutes();
  const ap = h < 12 ? "a" : "p";
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return h12 + ":" + String(mn).padStart(2, "0") + ap;
};

// Exact high/low tides: scan the full hourly series over the window and
// parabolic-interpolate each peak. t = fractional column index (cols are 3-hourly).
export function exactTidePeaks(
  times: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mh: any,
  mIdx: Record<string, number>,
  cols: number[],
): TidePeak[] {
  const s = cols[0];
  const e = cols[cols.length - 1];
  const peaks: TidePeak[] = [];
  const val = (k: number) => {
    const mk = mIdx[times[k]];
    return mk != null ? mh.sea_level_height_msl[mk] : null;
  };
  for (let k = s + 1; k < e; k++) {
    const a = val(k - 1);
    const b = val(k);
    const c = val(k + 1);
    if (a == null || b == null || c == null) continue;
    const isH = b > a && b >= c;
    const isL = b < a && b <= c;
    if (!isH && !isL) continue;
    const den = a - 2 * b + c;
    let off = den !== 0 ? (0.5 * (a - c)) / den : 0;
    if (off > 0.5) off = 0.5;
    if (off < -0.5) off = -0.5;
    const A = (a + c) / 2 - b;
    const B = (c - a) / 2;
    const pv = A * off * off + B * off + b;
    peaks.push({
      t: (k + off - cols[0]) / 3,
      type: isH ? "H" : "L",
      val: pv,
      label: tideClock(new Date(times[k]).getTime() + off * 3600000),
    });
  }
  return peaks;
}

// WMO weather code -> glyph.
export function weatherIcon(c: number | null, isDay = 1): string {
  if (c == null || isNaN(c)) return "·";
  const night = isDay === 0;
  if (c === 0) return night ? "🌙" : "☀️";
  if (c <= 2) return night ? "🌙" : "🌤️";
  if (c === 3) return "☁️";
  if (c <= 48) return "🌫️";
  if (c <= 57) return "🌧️";
  if (c <= 67) return "🌧️";
  if (c <= 77) return "🌨️";
  if (c <= 82) return night ? "🌧️" : "🌦️";
  if (c <= 86) return "🌨️";
  return "⛈️";
}

// Tide peak dots + H/L labels on the tide chart.
export const wmTidePeaks: Plugin = {
  id: "wmTidePeaks",
  afterDatasetsDraw(chart: AnyChart) {
    const peaks: TidePeak[] = chart.$peaks;
    if (!peaks || !peaks.length) return;
    const pts = chart.getDatasetMeta(0).data;
    const ctx = chart.ctx;
    const area = chart.chartArea;
    const ys = chart.scales.y;
    if (!pts.length) return;
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = "bold 9px sans-serif";
    peaks.forEach((p) => {
      const j = Math.floor(p.t);
      if (j < 0 || j >= pts.length) return;
      const p1 = pts[Math.min(j + 1, pts.length - 1)];
      const x = pts[j].x + (p1.x - pts[j].x) * (p.t - j);
      const y = ys ? ys.getPixelForValue(p.val) : pts[j].y;
      const isH = p.type === "H";
      const c = isH ? "#1b6ca8" : "#c47f2e";
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
      const above = y - 9;
      const below = y + 9;
      let ly: number;
      let base: CanvasTextBaseline;
      if (isH) {
        if (above - 9 >= area.top) {
          ly = above;
          base = "bottom";
        } else {
          ly = below;
          base = "top";
        }
      } else {
        if (below + 9 <= area.bottom) {
          ly = below;
          base = "top";
        } else {
          ly = above;
          base = "bottom";
        }
      }
      ctx.textBaseline = base;
      ctx.fillText((isH ? "H " : "L ") + p.label, x, ly);
    });
    ctx.restore();
  },
};

// Corner max/min labels (tide chart).
export const wmFcAxis: Plugin = {
  id: "wmFcAxis",
  afterDraw(chart: AnyChart) {
    const ctx = chart.ctx;
    const area = chart.chartArea;
    let mx = -Infinity;
    let mn = Infinity;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chart.data.datasets.forEach((ds: any) =>
      ds.data.forEach((v: number | null) => {
        if (v != null && !isNaN(v)) {
          if (v > mx) mx = v;
          if (v < mn) mn = v;
        }
      }),
    );
    if (mx > -Infinity) {
      ctx.save();
      ctx.fillStyle = "#9aa6b4";
      ctx.font = "9px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(fmt(mx, 1), area.left + 2, area.top + 1);
      ctx.textBaseline = "bottom";
      ctx.fillText(fmt(mn, 1), area.left + 2, area.bottom - 1);
      ctx.restore();
    }
  },
};

// Faint whole-metre gridlines + labels (swell/waves chart, no real y-axis).
export const wmMetreAxis: Plugin = {
  id: "wmMetreAxis",
  beforeDatasetsDraw(chart: AnyChart) {
    const ctx = chart.ctx;
    const area = chart.chartArea;
    const ys = chart.scales.y;
    if (!ys) return;
    ctx.save();
    ctx.strokeStyle = "#e6ebf1";
    ctx.lineWidth = 1;
    for (let m = 0; m <= Math.ceil(ys.max); m++) {
      const y = ys.getPixelForValue(m);
      if (y < area.top - 0.5 || y > area.bottom + 0.5) continue;
      const yy = Math.round(y) + 0.5;
      ctx.beginPath();
      ctx.moveTo(area.left, yy);
      ctx.lineTo(area.right, yy);
      ctx.stroke();
    }
    ctx.restore();
  },
  afterDraw(chart: AnyChart) {
    const ctx = chart.ctx;
    const area = chart.chartArea;
    const ys = chart.scales.y;
    if (!ys) return;
    ctx.save();
    ctx.fillStyle = "#9aa6b4";
    ctx.font = "9px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    for (let m = 0; m <= Math.ceil(ys.max); m++) {
      const y = ys.getPixelForValue(m);
      if (y < area.top + 4 || y > area.bottom + 0.5) continue;
      ctx.fillText(m + "m", area.left + 2, y - 1.5);
    }
    ctx.restore();
  },
};

// y-axis hidden so the plot fills the canvas and lines up with the table columns.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function wmFcOpts(p1?: (number | null)[], p2?: (number | null)[], yMin?: number): any {
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 3, right: 1, bottom: 3, left: 0 } },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          title(items: any) {
            const t = items[0].chart.$times[items[0].dataIndex];
            const d = new Date(t);
            return (
              d.toLocaleDateString(undefined, { weekday: "short" }) +
              " " +
              d.toLocaleTimeString(undefined, { hour: "numeric" })
            );
          },
          afterLabel: p1
            ? (ctx: { datasetIndex: number; dataIndex: number }) => {
                const p = (ctx.datasetIndex === 0 ? p1 : p2!)[ctx.dataIndex];
                return p == null ? "" : "period " + fmt(p, 0) + " s";
              }
            : undefined,
        },
      },
    },
    scales: {
      x: { type: "category", offset: true, ticks: { display: false }, grid: { display: false }, border: { display: false } },
      y: { display: false, grace: "8%", min: yMin != null ? yMin : undefined },
    },
  };
}
