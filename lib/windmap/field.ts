import { WINDMAP, FIELDS, type FieldKey } from "./config";

export type Grid = { nx: number; ny: number; pts: [number, number][] };
export type Cell = { u: number; v: number; mag: number | null; dir: number | null; n: number; spread: number };
// wmRaw[key] = [model][cell]{mag:[hourly], dir:[hourly]}
export type RawField = { mag: number[]; dir: number[] }[][];

export function wmGrid(): Grid {
  const W = WINDMAP;
  const nx = Math.round((W.lonMax - W.lonMin) / W.step) + 1;
  const ny = Math.round((W.latMax - W.latMin) / W.step) + 1;
  const pts: [number, number][] = [];
  for (let r = 0; r < ny; r++) {
    const lat = +(W.latMax - r * W.step).toFixed(4);
    for (let c = 0; c < nx; c++) pts.push([lat, +(W.lonMin + c * W.step).toFixed(4)]);
  }
  return { nx, ny, pts };
}

export const asArr = <T,>(x: T | T[]): T[] => (Array.isArray(x) ? x : [x]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildHourly(arr: any[], models: string[], magKey: string, dirKey: string): RawField {
  return models.map((m) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    arr.map((el: any) => {
      const h = (el && el.hourly) || {};
      return { mag: h[magKey + "_" + m] || [], dir: h[dirKey + "_" + m] || [] };
    }),
  );
}

export function modelsAtStep(raw: RawField, hourIdx: number) {
  return (raw || []).map((modelCells) =>
    modelCells.map((cell) => ({ mag: cell.mag[hourIdx], dir: cell.dir[hourIdx] })),
  );
}

// Average several models per cell on U/V vectors (handles direction wrap-around),
// and measure disagreement as the RMS vector spread between models.
export function averageModels(modelLists: { mag: number; dir: number }[][]): Cell[] {
  const valid = modelLists.filter((a) => a && a.length);
  const ncells = valid.length ? valid[0].length : 0;
  const out = new Array<Cell>(ncells);
  for (let i = 0; i < ncells; i++) {
    const us: number[] = [];
    const vs: number[] = [];
    for (let m = 0; m < valid.length; m++) {
      const s = valid[m][i];
      if (!s) continue;
      const mag = s.mag;
      const dir = s.dir;
      if (mag == null || dir == null || isNaN(mag) || isNaN(dir)) continue;
      const rad = (dir * Math.PI) / 180;
      us.push(-mag * Math.sin(rad));
      vs.push(-mag * Math.cos(rad));
    }
    const n = us.length;
    if (!n) {
      out[i] = { u: 0, v: 0, mag: null, dir: null, n: 0, spread: 0 };
      continue;
    }
    let ub = 0;
    let vb = 0;
    for (let k = 0; k < n; k++) {
      ub += us[k];
      vb += vs[k];
    }
    ub /= n;
    vb /= n;
    let sd = 0;
    for (let k = 0; k < n; k++) {
      const du = us[k] - ub;
      const dv = vs[k] - vb;
      sd += du * du + dv * dv;
    }
    out[i] = {
      u: ub,
      v: vb,
      mag: Math.sqrt(ub * ub + vb * vb),
      dir: (Math.atan2(-ub, -vb) * 180) / Math.PI + 360,
      n,
      spread: Math.sqrt(sd / n),
    };
    out[i].dir = (out[i].dir as number) % 360;
  }
  return out;
}

// Averaged U/V components per cell straight into the leaflet-velocity grid format.
export function toVelocityData(cells: Cell[], nx: number, ny: number) {
  const W = WINDMAP;
  const u: number[] = [];
  const v: number[] = [];
  for (let i = 0; i < cells.length; i++) {
    const c = cells[i] || ({} as Cell);
    u.push(c.u || 0);
    v.push(c.v || 0);
  }
  const la2 = +(W.latMax - (ny - 1) * W.step).toFixed(4);
  const lo2 = +(W.lonMin + (nx - 1) * W.step).toFixed(4);
  const rec = (num: number, data: number[]) => ({
    header: {
      parameterCategory: 2,
      parameterNumber: num,
      parameterUnit: "m.s-1",
      nx,
      ny,
      lo1: W.lonMin,
      la1: W.latMax,
      lo2,
      la2,
      dx: W.step,
      dy: W.step,
      refTime: new Date().toISOString(),
      forecastTime: 0,
    },
    data,
  });
  return [rec(2, u), rec(3, v)]; // 2 = U, 3 = V
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function colorAt(scale: string[], t: number): [number, number, number] {
  if (t < 0) t = 0;
  if (t > 1) t = 1;
  const n = scale.length - 1;
  const f = t * n;
  const i = Math.floor(f);
  const frac = f - i;
  if (i >= n) return hexToRgb(scale[n]);
  const a = hexToRgb(scale[i]);
  const b = hexToRgb(scale[i + 1]);
  return [
    Math.round(a[0] + (b[0] - a[0]) * frac),
    Math.round(a[1] + (b[1] - a[1]) * frac),
    Math.round(a[2] + (b[2] - a[2]) * frac),
  ];
}

// bounds expanded by 1.5 cells so the padded image's data pixels centre on the
// sample points and the field feathers out at the edges.
export function wmFieldBounds(g: Grid): [[number, number], [number, number]] {
  const W = WINDMAP;
  const hb = W.step * 1.5;
  const la2 = W.latMax - (g.ny - 1) * W.step;
  const lo2 = W.lonMin + (g.nx - 1) * W.step;
  return [
    [W.latMax + hb, W.lonMin - hb],
    [la2 - hb, lo2 + hb],
  ];
}

// fill null grid cells with the nearest valid cell's value (sparse field -> reaches coast)
function fillNulls(arr: (number | null)[], nx: number): (number | null)[] {
  const out = arr.slice();
  const valid: number[] = [];
  for (let i = 0; i < arr.length; i++) if (arr[i] != null) valid.push(i);
  if (!valid.length) return out;
  for (let i = 0; i < arr.length; i++) {
    if (out[i] != null) continue;
    const r = Math.floor(i / nx);
    const c = i % nx;
    let best = valid[0];
    let bd = Infinity;
    for (let k = 0; k < valid.length; k++) {
      const j = valid[k];
      const dr = Math.floor(j / nx) - r;
      const dc = (j % nx) - c;
      const d = dr * dr + dc * dc;
      if (d < bd) {
        bd = d;
        best = j;
      }
    }
    out[i] = arr[best];
  }
  return out;
}

// Paint an (nx+2)x(ny+2) magnitude-coloured PNG with a transparent border ring,
// smoothed by the browser across the bounds -> a Windy-style shaded field.
export function buildFieldImage(key: FieldKey, g: Grid, data: Cell[]): string | null {
  const f = FIELDS[key];
  if (!g || !data) return null;
  let mags: (number | null)[] = new Array(data.length);
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    mags[i] = d && d.mag != null && !isNaN(d.mag) ? d.mag : null;
  }
  if (f.api === "marine") mags = fillNulls(mags, g.nx);
  const w = g.nx + 2;
  const h = g.ny + 2;
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext("2d")!;
  const im = ctx.createImageData(w, h);
  const px = im.data;
  for (let r = 0; r < g.ny; r++) {
    for (let c = 0; c < g.nx; c++) {
      const m = mags[r * g.nx + c];
      if (m == null) continue;
      const rgb = colorAt(f.colorScale, m / f.maxVelocity);
      const o = ((r + 1) * w + (c + 1)) * 4;
      px[o] = rgb[0];
      px[o + 1] = rgb[1];
      px[o + 2] = rgb[2];
      px[o + 3] = 255;
    }
  }
  ctx.putImageData(im, 0, 0);
  return cv.toDataURL("image/png");
}

// 16-point compass from a meteorological "from" bearing.
export function wmCompass(deg: number | null): string {
  if (deg == null || isNaN(deg)) return "";
  const n = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return n[Math.round(deg / 22.5) % 16];
}

// sample a field's averaged value at the current hour, for the grid cell nearest ll.
export function sampleAt(raw: RawField, g: Grid, hourIdx: number, lat: number, lng: number) {
  if (!raw || !g) return null;
  const cells = averageModels(modelsAtStep(raw, hourIdx));
  const W = WINDMAP;
  const col = Math.round((lng - W.lonMin) / W.step);
  const row = Math.round((W.latMax - lat) / W.step);
  if (col >= 0 && col < g.nx && row >= 0 && row < g.ny) {
    const cell = cells[row * g.nx + col];
    if (cell && cell.mag != null && !isNaN(cell.mag)) return { mag: cell.mag as number, dir: cell.dir };
  }
  let best: Cell | null = null;
  let bd = Infinity;
  for (let r = 0; r < g.ny; r++)
    for (let c = 0; c < g.nx; c++) {
      const cc = cells[r * g.nx + c];
      if (!cc || cc.mag == null || isNaN(cc.mag)) continue;
      const dr = r - row;
      const dc = c - col;
      const d = dr * dr + dc * dc;
      if (d < bd) {
        bd = d;
        best = cc;
      }
    }
  return best ? { mag: best.mag as number, dir: best.dir } : null;
}
