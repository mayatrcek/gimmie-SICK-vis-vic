// Harmonic tide prediction: h(t) = Z0 + Σ f_i(t)·[a_i·cos θ_i(t) + b_i·sin θ_i(t)],
// θ_i(t) = ω_i·(t − T0) + u_i(t).
//
// The same basis functions fit the constituents offline (tools/fit-tides.ts, from
// years of observed sea level) and predict them here, so any convention slip
// cancels instead of showing up as a phase error. Only the 18.6-year nodal
// modulation (f, u) has to be right in absolute terms, and that rides on one
// number: N, the longitude of the Moon's ascending node.
//
// Amplitudes/phases live in lib/data/tides/*.json — see tools/fit-tides.ts.

// Epoch for the phase reference. Arbitrary, but the fitter and this file must agree.
export const T0 = Date.UTC(2000, 0, 1);

// Speeds in degrees per solar hour, and the nodal rule each constituent follows
// as [rule, power] pairs (a compound tide inherits the product of its parents:
// M4 = M2², MK3 = M2·K1, 2SM2 = M2⁻¹).
type Rule = "m2" | "k1" | "o1" | "k2" | "j1" | "oo1" | "mf" | "mm";
type Con = { name: string; speed: number; nodal: [Rule, number][] };

// prettier-ignore
export const CONSTITUENTS: Con[] = [
  // long period
  { name: "SA",    speed:  0.0410686, nodal: [] },
  { name: "SSA",   speed:  0.0821373, nodal: [] },
  { name: "MM",    speed:  0.5443747, nodal: [["mm", 1]] },
  { name: "MSF",   speed:  1.0158958, nodal: [["m2", 1]] },
  { name: "MF",    speed:  1.0980331, nodal: [["mf", 1]] },
  // diurnal
  { name: "2Q1",   speed: 12.8542862, nodal: [["o1", 1]] },
  { name: "SIG1",  speed: 12.9271398, nodal: [["o1", 1]] },
  { name: "Q1",    speed: 13.3986609, nodal: [["o1", 1]] },
  { name: "RHO1",  speed: 13.4715145, nodal: [["o1", 1]] },
  { name: "O1",    speed: 13.9430356, nodal: [["o1", 1]] },
  { name: "P1",    speed: 14.9589314, nodal: [] },
  { name: "S1",    speed: 15.0000000, nodal: [] },
  { name: "K1",    speed: 15.0410686, nodal: [["k1", 1]] },
  { name: "J1",    speed: 15.5854433, nodal: [["j1", 1]] },
  { name: "OO1",   speed: 16.1391017, nodal: [["oo1", 1]] },
  // semidiurnal
  { name: "2N2",   speed: 27.8953548, nodal: [["m2", 1]] },
  { name: "MU2",   speed: 27.9682084, nodal: [["m2", 1]] },
  { name: "N2",    speed: 28.4397295, nodal: [["m2", 1]] },
  { name: "NU2",   speed: 28.5125831, nodal: [["m2", 1]] },
  { name: "M2",    speed: 28.9841042, nodal: [["m2", 1]] },
  { name: "LDA2",  speed: 29.4556253, nodal: [["m2", 1]] },
  { name: "L2",    speed: 29.5284789, nodal: [["m2", 1]] },
  { name: "T2",    speed: 29.9589333, nodal: [] },
  { name: "S2",    speed: 30.0000000, nodal: [] },
  { name: "K2",    speed: 30.0821373, nodal: [["k2", 1]] },
  { name: "2SM2",  speed: 31.0158958, nodal: [["m2", -1]] },
  // terdiurnal + shallow-water overtides: these are what make a bay's tide
  // lopsided (double highs in Western Port), so they matter more here than
  // their size suggests.
  { name: "MO3",   speed: 42.9271398, nodal: [["m2", 1], ["o1", 1]] },
  { name: "M3",    speed: 43.4761563, nodal: [["m2", 1.5]] },
  { name: "MK3",   speed: 44.0251729, nodal: [["m2", 1], ["k1", 1]] },
  { name: "SK3",   speed: 45.0410686, nodal: [["k1", 1]] },
  { name: "MN4",   speed: 57.4238337, nodal: [["m2", 2]] },
  { name: "M4",    speed: 57.9682084, nodal: [["m2", 2]] },
  { name: "SN4",   speed: 58.4397295, nodal: [["m2", 1]] },
  { name: "MS4",   speed: 58.9841042, nodal: [["m2", 1]] },
  { name: "MK4",   speed: 59.0662415, nodal: [["m2", 1], ["k2", 1]] },
  { name: "S4",    speed: 60.0000000, nodal: [] },
  { name: "2MN6",  speed: 86.4079380, nodal: [["m2", 3]] },
  { name: "M6",    speed: 86.9523127, nodal: [["m2", 3]] },
  { name: "MSN6",  speed: 87.4238337, nodal: [["m2", 2]] },
  { name: "2MS6",  speed: 87.9682084, nodal: [["m2", 2]] },
  { name: "2SM6",  speed: 88.9841042, nodal: [["m2", 1]] },
];

const RAD = Math.PI / 180;

// Longitude of the Moon's ascending node (degrees), Meeus ch. 47.
function nodeLon(ms: number): number {
  const T = (ms - Date.UTC(2000, 0, 1, 12)) / 86400000 / 36525;
  return 125.0445479 - 1934.1362891 * T + 0.0020754 * T * T;
}

// Schureman's nodal factor/angle approximations, keyed by rule name.
// f scales the amplitude, u (degrees) shifts the phase.
function nodalRules(N: number): Record<Rule, { f: number; u: number }> {
  const c = (k: number) => Math.cos(k * N * RAD);
  const s = (k: number) => Math.sin(k * N * RAD);
  return {
    m2: { f: 1.0004 - 0.0373 * c(1) + 0.0002 * c(2), u: -2.14 * s(1) },
    k1: {
      f: 1.006 + 0.115 * c(1) - 0.0088 * c(2) + 0.0006 * c(3),
      u: -8.86 * s(1) + 0.68 * s(2) - 0.07 * s(3),
    },
    o1: {
      f: 1.0089 + 0.1871 * c(1) - 0.0147 * c(2) + 0.0014 * c(3),
      u: 10.8 * s(1) - 1.34 * s(2) + 0.19 * s(3),
    },
    k2: {
      f: 1.0241 + 0.2863 * c(1) + 0.0083 * c(2) - 0.0015 * c(3),
      u: -17.74 * s(1) + 0.68 * s(2) - 0.04 * s(3),
    },
    j1: {
      f: 1.0129 + 0.1676 * c(1) - 0.017 * c(2) + 0.0016 * c(3),
      u: -12.94 * s(1) + 1.34 * s(2) - 0.19 * s(3),
    },
    oo1: {
      f: 1.1027 + 0.6504 * c(1) + 0.0317 * c(2) - 0.0014 * c(3),
      u: -36.68 * s(1) + 4.02 * s(2) - 0.57 * s(3),
    },
    mf: { f: 1.0429 + 0.4135 * c(1) - 0.004 * c(2), u: -23.74 * s(1) + 2.68 * s(2) - 0.38 * s(3) },
    mm: { f: 1.0 - 0.13 * c(1) + 0.0013 * c(2), u: 0 },
  };
}

// [cos, sin] basis pair for every constituent at time `ms`, nodal factors folded
// in. Shared by the fitter (as the design matrix row) and predict() below.
export function basis(ms: number): number[] {
  const rules = nodalRules(nodeLon(ms));
  const hours = (ms - T0) / 3600000;
  const out: number[] = [];
  for (const con of CONSTITUENTS) {
    let f = 1;
    let u = 0;
    for (const [rule, pow] of con.nodal) {
      f *= Math.pow(rules[rule].f, pow);
      u += rules[rule].u * pow;
    }
    const th = (con.speed * hours + u) * RAD;
    out.push(f * Math.cos(th), f * Math.sin(th));
  }
  return out;
}

// A fitted station: z0 plus [a, b] per constituent, in CONSTITUENTS order.
export type TideModel = {
  station: string;
  source: string;
  lat: number;
  lon: number;
  fitted: string; // data window the coefficients came from
  z0: number;
  coef: [number, number][];
};

export function predict(model: TideModel, ms: number): number {
  const b = basis(ms);
  let h = model.z0;
  for (let i = 0; i < model.coef.length; i++) h += model.coef[i][0] * b[2 * i] + model.coef[i][1] * b[2 * i + 1];
  return h;
}

// Heights at each of `times` (epoch ms). One basis build per timestamp.
export function predictAt(model: TideModel, times: number[]): number[] {
  return times.map((t) => predict(model, t));
}
