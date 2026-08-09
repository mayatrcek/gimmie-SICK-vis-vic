// Shared domain types for the dive/forecast data model (ported from app.js).

export type Spot = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  region: string;
  onshore: number;
  sheltered: boolean;
  // Water that's dirty as a rule, not just after rain: "river" = river mouth /
  // estuary / inlet (tannic, tea-coloured), "bay" = top of Port Phillip (silty).
  // These spots keep their wind-based score and get a standing vis warning.
  murky?: "river" | "bay";
  // Tidal race — only diveable at slack water.
  tidal?: boolean;
  // Optional offshore sampling point for the marine API (rarely set).
  seaLat?: number;
  seaLon?: number;
};

export type RatingLabel = "Amazing" | "Good" | "Marginal" | "Poor";
export type Rating = { label: RatingLabel | "—"; col: string; rank: number };

export type WindRel = { kind: "on" | "off" | "cross" | ""; label: string };

export type Row = {
  date: string;
  h: number | null;
  p: number | null;
  sst: number | null;
  wind: number | null;
  wdir: number | null;
  rel: WindRel;
  rainToday: number;
  // Decayed sum of the past week's rain — see runoffIndex().
  runoff: number;
  rating: Rating;
};

export type Hourly = {
  mtime: string[];
  swellH: number[];
  swellP: number[];
  swellD: number[];
  tide: number[];
  wtime: string[];
  wind: number[];
  wdir: number[];
};

export type SiteData = { rows: Row[]; hourly: Hourly };
