// Shared domain types for the dive/forecast data model (ported from app.js).

export type Spot = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  region: string;
  onshore: number;
  sheltered: boolean;
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
  rainEff: number;
  rating: Rating;
};

export type Hourly = {
  mtime: string[];
  swellH: number[];
  swellP: number[];
  tide: number[];
  wtime: string[];
  wind: number[];
  wdir: number[];
};

export type SiteData = { rows: Row[]; hourly: Hourly };
