import type { Spot } from "@/lib/types";

// sites: marker/weather at the headland; marine pulled just offshore.
// onshore = compass bearing the open ocean faces (also the dir onshore wind blows FROM).
type RawSpot = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  onshore?: number;
  sheltered?: boolean;
};
type Region = { region: string; onshore: number; spots: RawSpot[] };

export const REGIONS: Region[] = [
  {
    region: "Surf Coast",
    onshore: 200,
    spots: [
      { id: "bells", name: "Bells Beach", lat: -38.368, lon: 144.283 },
      { id: "winki", name: "Winkipop", lat: -38.367, lon: 144.286 },
      { id: "janjuc", name: "Jan Juc", lat: -38.345, lon: 144.3 },
      { id: "torquay", name: "Torquay Point", lat: -38.333, lon: 144.323 },
      { id: "roadknight", name: "Point Roadknight", lat: -38.428, lon: 144.18 },
      { id: "anglesea", name: "Anglesea", lat: -38.418, lon: 144.183 },
      { id: "lorne", name: "Lorne", lat: -38.54, lon: 143.978 },
      { id: "apollo", name: "Apollo Bay", lat: -38.755, lon: 143.668 },
    ],
  },
  {
    region: "Bellarine",
    onshore: 200,
    spots: [
      { id: "13th", name: "13th Beach", lat: -38.276, lon: 144.47 },
      { id: "barwon", name: "Barwon Heads", lat: -38.278, lon: 144.49 },
      { id: "oceangrove", name: "Ocean Grove", lat: -38.272, lon: 144.53 },
      { id: "lonsdale", name: "Point Lonsdale", lat: -38.293, lon: 144.61 },
    ],
  },
  {
    region: "Mornington Peninsula",
    onshore: 185,
    spots: [
      { id: "pointnepean", name: "Point Nepean (buoy)", lat: -38.36, lon: 144.687, onshore: 190 },
      { id: "portsea", name: "Portsea Back Beach", lat: -38.355, lon: 144.7 },
      { id: "sorrento", name: "Sorrento Back Beach", lat: -38.355, lon: 144.74 },
      { id: "rye", name: "Rye Back Beach", lat: -38.404, lon: 144.82 },
      { id: "gunnamatta", name: "Gunnamatta", lat: -38.435, lon: 144.876 },
      { id: "schanck", name: "Cape Schanck", lat: -38.488, lon: 144.891, onshore: 180 },
      { id: "flinders", name: "Flinders", lat: -38.48, lon: 145.02, onshore: 170 },
      { id: "pointleo", name: "Point Leo", lat: -38.413, lon: 145.073, onshore: 170 },
    ],
  },
  {
    region: "Phillip Island",
    onshore: 185,
    spots: [
      { id: "woolamai", name: "Cape Woolamai", lat: -38.56, lon: 145.35, onshore: 180 },
      { id: "smiths", name: "Smiths Beach", lat: -38.51, lon: 145.265 },
      { id: "surfbeach", name: "Surf Beach", lat: -38.512, lon: 145.245 },
      { id: "pyramid", name: "Pyramid Rock", lat: -38.506, lon: 145.236 },
      { id: "express", name: "Express Point", lat: -38.498, lon: 145.205 },
      { id: "summerland", name: "Summerland", lat: -38.51, lon: 145.1 },
      { id: "ycw", name: "YCW / Cat Bay", lat: -38.505, lon: 145.13, onshore: 200 },
    ],
  },
  {
    region: "East Coast / Gippsland",
    onshore: 200,
    spots: [
      { id: "capepat", name: "Cape Paterson", lat: -38.68, lon: 145.61 },
      { id: "inverloch", name: "Inverloch", lat: -38.64, lon: 145.73 },
      { id: "venus", name: "Venus Bay", lat: -38.68, lon: 145.77 },
      { id: "waratah", name: "Waratah Bay", lat: -38.8, lon: 146.07 },
      { id: "sandypt", name: "Sandy Point", lat: -38.8, lon: 146.15 },
      { id: "walkerville", name: "Walkerville", lat: -38.88, lon: 146.13 },
    ],
  },
  {
    region: "Far West / Shipwreck Coast",
    onshore: 200,
    spots: [
      { id: "portcampbell", name: "Port Campbell", lat: -38.62, lon: 142.997 },
      { id: "princetown", name: "Princetown", lat: -38.69, lon: 143.15 },
      { id: "warrnambool", name: "Warrnambool (Logans)", lat: -38.4, lon: 142.52 },
      { id: "portfairy", name: "Port Fairy", lat: -38.39, lon: 142.24 },
      { id: "portland", name: "Portland", lat: -38.35, lon: 141.6 },
    ],
  },
  {
    region: "Port Phillip (sheltered)",
    onshore: 0,
    spots: [
      { id: "fort", name: "South Channel Fort", lat: -38.296, lon: 144.717, sheltered: true },
      { id: "blairgowrie", name: "Blairgowrie (bay)", lat: -38.357, lon: 144.776, sheltered: true },
    ],
  },
];

export const SPOTS: Record<string, Spot> = {};
for (const rg of REGIONS) {
  for (const s of rg.spots) {
    SPOTS[s.id] = {
      ...s,
      region: rg.region,
      onshore: s.onshore ?? rg.onshore,
      sheltered: s.sheltered ?? false,
    };
  }
}

export const DEFAULTS = ["pointnepean", "bells", "woolamai", "schanck"];

// Surf-Forecast.com break slug for each spot. Spots without their own page
// map to the nearest listed break.
export const SF_BREAK: Record<string, string> = {
  bells: "Bells-Beach",
  winki: "Winki-Pop-V-I-C",
  janjuc: "Jan-Juc",
  torquay: "Torquay-Point-and-Beach",
  roadknight: "Point-Roadnight",
  anglesea: "Anglesea",
  lorne: "Lorne-Point",
  apollo: "Apollo-Bay",
  "13th": "Thirteenth-Beach_The-Beacon",
  barwon: "Thirteenth-Beach_The-Bluff",
  oceangrove: "Bancoora",
  lonsdale: "Point-Lonsdale",
  pointnepean: "Quarantine",
  portsea: "Portsea-Back-Beach",
  sorrento: "St-Andrews-Beach",
  rye: "Rye-Ocean-Beach",
  gunnamatta: "Gunnamatta-Beach",
  schanck: "Cape-Schanck",
  flinders: "Gunnery",
  pointleo: "Point-Leo",
  woolamai: "Woolamai",
  smiths: "Smiths-Beach",
  surfbeach: "Surf-Beach",
  pyramid: "Pyramid-Rock_1",
  express: "Express-Point",
  summerland: "Summerland-Bay",
  ycw: "Cat-Bay",
  capepat: "Cape-Patterson",
  inverloch: "Eagles-Nest",
  venus: "Cape-Liptrap",
  waratah: "Walkerville",
  sandypt: "Sandy-Point",
  walkerville: "Walkerville",
  portcampbell: "Gibson-Steps",
  princetown: "Point-Ronald",
  warrnambool: "Warnambool-Surf-Beach",
  portfairy: "Port-Fairy",
  portland: "Portland",
  fort: "Portsea-Back-Beach",
  blairgowrie: "Pearses-Beach",
};
