// Wind-map configuration, ported from app.js.
// Sampling grid runs wide (W of SA to the Tasman) so the particle field reaches
// the map edges; the visible/pannable area is locked to WM_BOUNDS.
export const WINDMAP = { lonMin: 132.0, lonMax: 159.0, latMin: -42.9, latMax: -33.0, step: 1.5 };
export const WM_BOUNDS: [[number, number], [number, number]] = [
  [-41.7, 140.6],
  [-34.0, 150.4],
];
export const WM_HOME: [number, number] = [-38.1, 144.83];
export const WM_HOME_ZOOM = 8;
export const DIVE_SCORE: Record<string, number> = { Amazing: 5, Good: 4, Marginal: 2, Poor: 1 };

export type FieldKey = "wind" | "swell" | "waves";
export type Field = {
  label: string;
  unit: string;
  maxVelocity: number;
  velocityScale: number;
  spreadHi: number;
  src: string;
  colorScale: string[];
  legend: string[];
  api: "weather" | "marine";
  mag: string;
  dir: string;
};

export const FIELDS: Record<FieldKey, Field> = {
  wind: {
    label: "Wind",
    unit: "km/h",
    maxVelocity: 65,
    velocityScale: 0.0035,
    spreadHi: 8,
    src: "GFS · ECMWF",
    colorScale: ["#1b3a6b", "#4a7fb5", "#5cc6c9", "#7ed957", "#f4e04d", "#f0a93b", "#e8553a", "#b23aa8"],
    legend: ["0", "15", "30", "45", "60+"],
    api: "weather",
    mag: "wind_speed_10m",
    dir: "wind_direction_10m",
  },
  swell: {
    label: "Swell",
    unit: "m",
    maxVelocity: 4,
    velocityScale: 0.03,
    spreadHi: 0.6,
    src: "gwam · Météo-France",
    colorScale: ["#3b6fb0", "#4aa9d8", "#5cc6a8", "#a8d96b", "#f4d24d", "#f0923b"],
    legend: ["0", "1", "2", "3", "4+"],
    api: "marine",
    mag: "swell_wave_height",
    dir: "swell_wave_direction",
  },
  waves: {
    label: "Waves",
    unit: "m",
    maxVelocity: 5,
    velocityScale: 0.025,
    spreadHi: 0.7,
    src: "gwam · Météo-France",
    colorScale: ["#2c7fb8", "#41b6c4", "#7fcdbb", "#c7e9b4", "#f4e04d", "#f0a93b", "#e8553a"],
    legend: ["0", "1", "2", "3", "4", "5+"],
    api: "marine",
    mag: "wave_height",
    dir: "wave_direction",
  },
};

// each field is averaged across a couple of forecast models (a multi-source ensemble).
// kept to 2 models + a coarse grid to stay within Open-Meteo's free daily call budget.
export const WIND_MODELS = ["gfs_seamless", "ecmwf_ifs025"];
export const MARINE_MODELS = ["gwam", "meteofrance_wave"];
