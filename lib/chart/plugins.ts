// Chart.js setup + custom plugins ported from app.js (baseOpts, axisExtras, windArrows).
// Shared by the dive-sites outlook charts and the wind-map point forecast.
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type Plugin,
} from "chart.js";
import { compass } from "@/lib/logic/rating";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// Per-chart metadata (ISO time strings + optional wind directions) is passed via
// options.plugins.meta and copied onto the chart instance for the draw plugins.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyChart = any;

export const metaPlugin: Plugin = {
  id: "meta",
  beforeDraw(chart: AnyChart) {
    const m = chart.options?.plugins?.meta;
    chart.$times = m?.times || null;
    chart.$dirs = m?.dirs || null;
    chart.$peaks = m?.peaks || null;
  },
};

// Keep only samples from today 00:00 to +3 days. Returns aligned labels + values.
export function fromToday(times: string[], vals: number[] | null): { L: string[]; V: (number | null)[] } {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const end = new Date(t.getTime() + 3 * 86400000);
  const L: string[] = [];
  const V: (number | null)[] = [];
  for (let i = 0; i < times.length; i++) {
    const d = new Date(times[i]);
    if (d >= t && d < end) {
      L.push(times[i]);
      V.push(vals ? vals[i] : null);
    }
  }
  return { L, V };
}

// Fractional index of "now" within the times array (for the red now-line).
export function nearestFrac(times: string[]): number | null {
  if (!times.length) return null;
  const n = Date.now();
  for (let i = 0; i < times.length - 1; i++) {
    const a = new Date(times[i]).getTime();
    const b = new Date(times[i + 1]).getTime();
    if (n >= a && n <= b) return i + (n - a) / (b - a);
  }
  if (n < new Date(times[0]).getTime()) return 0;
  return times.length - 1;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function baseOpts(): any {
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { bottom: 18 } },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          title(items: any) {
            const c = items[0].chart;
            const t = c.$times ? c.$times[items[0].dataIndex] : null;
            if (!t) return "";
            const d = new Date(t);
            return (
              d.toLocaleDateString(undefined, { weekday: "short" }) +
              " " +
              d.toLocaleTimeString(undefined, { hour: "numeric" })
            );
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          font: { size: 9 },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          callback(this: any, _v: unknown, i: number) {
            const t = this.chart.$times;
            if (!t || !t[i]) return "";
            const d = new Date(t[i]);
            if (d.getHours() % 3 !== 0) return "";
            const h = d.getHours();
            const ap = h < 12 ? "a" : "p";
            let h12 = h % 12;
            if (h12 === 0) h12 = 12;
            return h12 + ap;
          },
        },
        grid: { display: false },
      },
      y: { ticks: { font: { size: 10 } }, grid: { color: "#eef2f6" } },
    },
  };
}

// Wind-direction barbs along the top of the wind chart.
export const windArrows: Plugin = {
  id: "windArrows",
  afterDatasetsDraw(chart: AnyChart) {
    const dirs = chart.$dirs;
    if (!dirs || !dirs.length) return;
    const ctx = chart.ctx;
    const meta = chart.getDatasetMeta(0);
    const area = chart.chartArea;
    const step = Math.max(1, Math.round(dirs.length / 12));
    ctx.save();
    ctx.strokeStyle = "#1b6ca8";
    ctx.fillStyle = "#1b6ca8";
    ctx.lineWidth = 1.4;
    for (let i = 0; i < dirs.length; i += step) {
      const pt = meta.data[i];
      if (!pt || dirs[i] == null) continue;
      const x = pt.x;
      const y = area.top + 9;
      const rad = ((dirs[i] + 180) * Math.PI) / 180;
      const dx = Math.sin(rad);
      const dy = -Math.cos(rad);
      const len = 7;
      ctx.beginPath();
      ctx.moveTo(x - dx * len, y - dy * len);
      ctx.lineTo(x + dx * len, y + dy * len);
      ctx.stroke();
      const tx = x + dx * len;
      const ty = y + dy * len;
      const bx = x + dx * (len - 4);
      const by = y + dy * (len - 4);
      const px = -dy * 3;
      const py = dx * 3;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(bx + px, by + py);
      ctx.lineTo(bx - px, by - py);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  },
};

// Red "now" line + per-day weekday labels and separators along the bottom.
export const axisExtras: Plugin = {
  id: "axisExtras",
  afterDraw(chart: AnyChart) {
    const times = chart.$times;
    if (!times || !times.length) return;
    const ctx = chart.ctx;
    const area = chart.chartArea;
    const pts = chart.getDatasetMeta(0).data;
    if (!pts || !pts.length) return;
    const f = nearestFrac(times);
    if (f != null) {
      const lo = Math.floor(f);
      const hi = Math.min(lo + 1, pts.length - 1);
      const x = pts[lo].x + (f - lo) * (pts[hi].x - pts[lo].x);
      ctx.save();
      ctx.strokeStyle = "#d9534f";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(x, area.top);
      ctx.lineTo(x, area.bottom);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#d9534f";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("now", x, area.top - 1);
      ctx.restore();
    }
    const groups: Record<string, { i0: number; i1: number; wd: string }> = {};
    const order: string[] = [];
    for (let i = 0; i < times.length; i++) {
      const d = new Date(times[i]);
      const k = d.getMonth() + "-" + d.getDate();
      if (!groups[k]) {
        groups[k] = { i0: i, i1: i, wd: d.toLocaleDateString(undefined, { weekday: "short" }) };
        order.push(k);
      }
      groups[k].i1 = i;
    }
    ctx.save();
    ctx.fillStyle = "#5b6b7b";
    ctx.font = "600 11px sans-serif";
    ctx.textAlign = "center";
    const y = chart.height - 3;
    order.forEach((k, gi) => {
      const g = groups[k];
      if (!pts[g.i0] || !pts[g.i1]) return;
      const xc = (pts[g.i0].x + pts[g.i1].x) / 2;
      ctx.fillText(g.wd, xc, y);
      if (gi > 0) {
        ctx.strokeStyle = "#dce3ea";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pts[g.i0].x, area.top);
        ctx.lineTo(pts[g.i0].x, area.bottom);
        ctx.stroke();
      }
    });
    ctx.restore();
  },
};

export { compass };
