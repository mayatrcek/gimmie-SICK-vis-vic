// Fits harmonic tide constituents from years of observed sea level and writes
// lib/data/tides/<station>.json. Offline, run by hand:
//
//   node tools/fit-tides.ts
//
// Sources (both free, both attributed on /forecast):
//   * BOM Australian Baseline Sea Level Monitoring Project — hourly gauge data,
//     www.bom.gov.au/ntc/<id>/<id>_<year>.csv (Lorne, Stony Point, Portland).
//   * CSIRO "Williamstown tide gauge data" (CC BY 4.0), GESLA format, hourly,
//     for inside Port Phillip. Ends 2019 — constituents don't age, the nodal
//     terms in harmonics.ts carry the 18.6-year cycle forward.
//
// Each station is fitted on several whole years and then checked against a year
// that was NOT in the fit; the printed hold-out RMS is the number that matters.
import fs from "node:fs";
import path from "node:path";
import { basis, CONSTITUENTS, type TideModel } from "../lib/tides/harmonics.ts";

const CACHE = path.join(import.meta.dirname, ".cache");
const OUT = path.join(import.meta.dirname, "..", "lib", "data", "tides");

type Sample = { t: number; v: number };

async function cached(name: string, url: string): Promise<string> {
  fs.mkdirSync(CACHE, { recursive: true });
  const f = path.join(CACHE, name);
  if (fs.existsSync(f)) return fs.readFileSync(f, "utf8");
  process.stdout.write(`  fetching ${name}… `);
  const r = await fetch(url, { headers: { "User-Agent": "gimmie-sick-vis/tide-fit" } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  const txt = await r.text();
  fs.writeFileSync(f, txt);
  console.log(`${(txt.length / 1e6).toFixed(1)} MB`);
  return txt;
}

// ---- parsers -------------------------------------------------------------

const MON: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

// ABSLMP: " Date & UTC Time,Sea Level,…,Residuals,…" with -9999 for gaps.
// `col` picks the column; the residual column lets us reconstruct the Bureau's
// own prediction (sea level − residual) for the hold-out check.
function parseABSLMP(csv: string, col: number): Sample[] {
  const out: Sample[] = [];
  for (const line of csv.split("\n").slice(1)) {
    const c = line.split(",");
    if (c.length <= col) continue;
    const m = c[0].trim().match(/^(\d{2})-(\w{3})-(\d{4}) (\d{2}):(\d{2})/);
    if (!m) continue;
    const v = +c[col];
    if (!isFinite(v) || v < -999) continue;
    out.push({ t: Date.UTC(+m[3], MON[m[2]], +m[1], +m[4], +m[5]), v });
  }
  return out;
}

// GESLA v2: "yyyy/mm/dd hh:mm:ss value qcflag …", UTC, QC flag 1 = good.
function parseGESLA(txt: string): Sample[] {
  const out: Sample[] = [];
  for (const line of txt.split("\n")) {
    if (!line || line[0] === "#") continue;
    const c = line.trim().split(/\s+/);
    if (c.length < 4 || c[3] !== "1") continue;
    const d = c[0].split("/");
    const h = c[1].split(":");
    const v = +c[2];
    if (!isFinite(v) || v < -99) continue;
    out.push({ t: Date.UTC(+d[0], +d[1] - 1, +d[2], +h[0], +h[1]), v });
  }
  return out;
}

// ---- least squares -------------------------------------------------------

// Solves the normal equations by Gauss-Jordan with partial pivoting. n is ~83
// here, so nothing cleverer is warranted.
function solve(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-12) throw new Error(`singular at column ${c}`);
    [M[c], M[p]] = [M[p], M[c]];
    const piv = M[c][c];
    for (let j = c; j <= n; j++) M[c][j] /= piv;
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c];
      if (!f) continue;
      for (let j = c; j <= n; j++) M[r][j] -= f * M[c][j];
    }
  }
  return M.map((row) => row[n]);
}

// z0 + [a, b] per constituent, in CONSTITUENTS order.
function fit(samples: Sample[]): { z0: number; coef: [number, number][] } {
  const n = CONSTITUENTS.length * 2 + 1;
  const AtA: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const Atb = new Array(n).fill(0);
  for (const s of samples) {
    const row = [1, ...basis(s.t)]; // the 1 fits the mean level (z0)
    for (let i = 0; i < n; i++) {
      const ri = row[i];
      if (!ri) continue;
      for (let j = i; j < n; j++) AtA[i][j] += ri * row[j];
      Atb[i] += ri * s.v;
    }
  }
  for (let i = 0; i < n; i++) for (let j = 0; j < i; j++) AtA[i][j] = AtA[j][i];
  const x = solve(AtA, Atb);
  const coef: [number, number][] = [];
  for (let i = 0; i < CONSTITUENTS.length; i++) coef.push([x[1 + 2 * i], x[2 + 2 * i]]);
  return { z0: x[0], coef };
}

function rms(model: { z0: number; coef: [number, number][] }, samples: Sample[]): number {
  let s = 0;
  for (const p of samples) {
    const b = basis(p.t);
    let h = model.z0;
    for (let i = 0; i < model.coef.length; i++) h += model.coef[i][0] * b[2 * i] + model.coef[i][1] * b[2 * i + 1];
    s += (h - p.v) ** 2;
  }
  return Math.sqrt(s / samples.length);
}

// ---- stations ------------------------------------------------------------

const YEAR = (t: number) => new Date(t).getUTCFullYear();

type StationSpec = {
  id: string;
  station: string;
  source: string;
  lat: number;
  lon: number;
  fitYears: number[];
  holdOut: number;
  load: (years: number[]) => Promise<{ obs: Sample[]; ref?: Sample[] }>;
};

// ABSLMP CSVs: sea level in column 1, residuals in the column that varies by
// station (Portland's file carries the met columns too).
function abslmp(id: string, station: string, lat: number, lon: number, bomId: string, resCol: number): StationSpec {
  return {
    id,
    station,
    source: `BOM ABSLMP ${bomId}`,
    lat,
    lon,
    fitYears: [2022, 2023, 2024, 2025],
    holdOut: 2026,
    async load(years) {
      const obs: Sample[] = [];
      const ref: Sample[] = [];
      for (const y of years) {
        const csv = await cached(`${bomId}_${y}.csv`, `https://www.bom.gov.au/ntc/${bomId}/${bomId}_${y}.csv`);
        obs.push(...parseABSLMP(csv, 1));
        // sea level − residual = the Bureau's own predicted tide, the yardstick
        // the hold-out year is scored against.
        for (const line of csv.split("\n").slice(1)) {
          const c = line.split(",");
          if (c.length <= resCol) continue;
          const m = c[0].trim().match(/^(\d{2})-(\w{3})-(\d{4}) (\d{2}):(\d{2})/);
          if (!m) continue;
          const lvl = +c[1];
          const res = +c[resCol];
          if (!isFinite(lvl) || !isFinite(res) || lvl < -999 || res < -999) continue;
          ref.push({ t: Date.UTC(+m[3], MON[m[2]], +m[1], +m[4], +m[5]), v: lvl - res });
        }
      }
      return { obs, ref };
    },
  };
}

const STATIONS: StationSpec[] = [
  abslmp("lorne", "Lorne", -38.5417, 143.9833, "IDO71006", 2),
  abslmp("stony-point", "Stony Point", -38.3742, 145.2233, "IDO71004", 2),
  abslmp("portland", "Portland", -38.3433, 141.6133, "IDO71008", 5),
  {
    id: "williamstown",
    station: "Williamstown",
    source: "CSIRO Williamstown tide gauge data (CC BY 4.0)",
    lat: -37.8569,
    lon: 144.8977,
    fitYears: [2014, 2015, 2016, 2017, 2018],
    holdOut: 2019,
    async load() {
      const meta = JSON.parse(
        await cached("csiro-dap.json", "https://data.csiro.au/dap/ws/v2/collections/csiro:55471/data"),
      );
      const file = meta.file.find((f: { filename: string }) => f.filename.startsWith("Williamstown-registers"));
      const txt = await cached("williamstown.txt", file.presignedLink.href);
      return { obs: parseGESLA(txt) };
    },
  },
];

// ---- run -----------------------------------------------------------------

fs.mkdirSync(OUT, { recursive: true });
for (const st of STATIONS) {
  console.log(`\n${st.station}`);
  const { obs, ref } = await st.load([...st.fitYears, st.holdOut]);
  const fitSet = obs.filter((s) => st.fitYears.includes(YEAR(s.t)));
  const testSet = (ref ?? obs).filter((s) => YEAR(s.t) === st.holdOut);
  if (fitSet.length < 8000) throw new Error(`${st.id}: only ${fitSet.length} samples to fit`);
  const m = fit(fitSet);
  console.log(`  fit    ${fitSet.length} h over ${st.fitYears[0]}–${st.fitYears.at(-1)}, RMS ${rms(m, fitSet).toFixed(3)} m`);
  console.log(
    `  check  ${testSet.length} h of ${st.holdOut} (${ref ? "BOM's own predictions" : "observed"}), RMS ${rms(m, testSet).toFixed(3)} m`,
  );
  const model: TideModel = {
    station: st.station,
    source: st.source,
    lat: st.lat,
    lon: st.lon,
    fitted: `${st.fitYears[0]}–${st.fitYears.at(-1)}`,
    z0: +m.z0.toFixed(4),
    coef: m.coef.map(([a, b]) => [+a.toFixed(5), +b.toFixed(5)]),
  };
  fs.writeFileSync(path.join(OUT, `${st.id}.json`), JSON.stringify(model) + "\n");
  console.log(`  wrote  lib/data/tides/${st.id}.json`);
}
