import type { Spot } from "@/lib/types";

// sites: marker/weather at the headland; marine pulled just offshore.
// onshore = compass bearing the open ocean faces (also the dir onshore wind blows FROM).
// Explicit `null` = no shore to be relative to (mid-bay pinnacles, wrecks, walls).
type RawSpot = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  onshore?: number | null;
  sheltered?: boolean;
  murky?: "river" | "bay" | "silt";
  tidal?: boolean;
};
type Region = { state: string; region: string; onshore: number; spots: RawSpot[] };

export const REGIONS: Region[] = [
  {
    state: "Victoria",
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
    state: "Victoria",
    region: "Bellarine",
    onshore: 200,
    spots: [
      { id: "13th", name: "13th Beach", lat: -38.276, lon: 144.47 },
      { id: "barwon", name: "Barwon Heads", lat: -38.278, lon: 144.49, murky: "river" },
      { id: "oceangrove", name: "Ocean Grove", lat: -38.272, lon: 144.53 },
      { id: "lonsdale", name: "Point Lonsdale", lat: -38.293, lon: 144.61 },
    ],
  },
  {
    state: "Victoria",
    region: "Mornington Peninsula",
    onshore: 185,
    spots: [
      { id: "pointnepean", name: "Point Nepean (buoy)", lat: -38.36, lon: 144.687, onshore: 190 },
      { id: "portsea", name: "Portsea Back Beach", lat: -38.355, lon: 144.7 },
      { id: "diamond", name: "Diamond Bay", lat: -38.351, lon: 144.756 },
      { id: "sorrento", name: "Sorrento Back Beach", lat: -38.355, lon: 144.74 },
      { id: "rye", name: "Rye Back Beach", lat: -38.404, lon: 144.82 },
      { id: "gunnamatta", name: "Gunnamatta", lat: -38.435, lon: 144.876 },
      { id: "schanck", name: "Cape Schanck", lat: -38.488, lon: 144.891, onshore: 180 },
      { id: "flinders", name: "Flinders", lat: -38.48, lon: 145.02, onshore: 170 },
      { id: "pointleo", name: "Point Leo", lat: -38.413, lon: 145.073, onshore: 170 },
    ],
  },
  {
    state: "Victoria",
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
    state: "Victoria",
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
    // Granite, sponge gardens and the offshore island groups. Everything here
    // is open Bass Strait — the east-coast coves face away from the prevailing
    // swell but still read as ocean sites, not bay water.
    state: "Victoria",
    region: "Wilsons Promontory",
    onshore: 225,
    spots: [
      { id: "tonguept", name: "Tongue Point", lat: -38.9345, lon: 146.3095, onshore: 270 },
      { id: "whiskybay", name: "Whisky Bay", lat: -38.9955, lon: 146.2965, onshore: 260 },
      { id: "squeaky", name: "Squeaky Beach", lat: -39.0075, lon: 146.3025, onshore: 260 },
      { id: "normanbay", name: "Norman Bay (Tidal River)", lat: -39.0325, lon: 146.3155, onshore: 250 },
      { id: "shellback", name: "Shellback Island", lat: -39.0475, lon: 146.3005 },
      { id: "oberon", name: "Oberon Bay", lat: -39.0765, lon: 146.3305, onshore: 240 },
      { id: "glennie", name: "Great Glennie Island", lat: -39.0705, lon: 146.2385 },
      { id: "cleft", name: "Cleft Island (Skull Rock)", lat: -39.1015, lon: 146.2205 },
      { id: "anser", name: "Anser Island", lat: -39.1385, lon: 146.2905 },
      { id: "kanowna", name: "Kanowna Island", lat: -39.1555, lon: 146.3105 },
      { id: "rodondo", name: "Rodondo Island", lat: -39.2335, lon: 146.3905 },
      // East side — tucked in behind the Prom, so onshore is an easterly here
      { id: "waterloobay", name: "Waterloo Bay", lat: -39.0825, lon: 146.3965, onshore: 100 },
      { id: "refugecove", name: "Refuge Cove", lat: -39.0285, lon: 146.4155, onshore: 90 },
      { id: "sealerscove", name: "Sealers Cove", lat: -38.9555, lon: 146.4375, onshore: 80 },
    ],
  },
  {
    state: "Victoria",
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
    state: "Victoria",
    region: "Port Phillip",
    // south-shore default: the piers along this stretch all face north into the bay
    onshore: 0,
    spots: [
      { id: "fort", name: "South Channel Fort", lat: -38.296, lon: 144.717, sheltered: true, tidal: true, onshore: null },
      { id: "blairgowrie", name: "Blairgowrie (bay)", lat: -38.357, lon: 144.776, sheltered: true },
      { id: "ryepier", name: "Rye Pier", lat: -38.3745, lon: 144.8225, sheltered: true },
      { id: "sorrentopier", name: "Sorrento Pier", lat: -38.3385, lon: 144.743, sheltered: true },
      { id: "portseapier", name: "Portsea Pier", lat: -38.3235, lon: 144.712, sheltered: true },
      // Entrance sites — slack-water dives with no shore to shelter behind
      { id: "portseahole", name: "Portsea Hole", lat: -38.312, lon: 144.716, sheltered: true, tidal: true, onshore: null },
      { id: "popeseye", name: "Popes Eye", lat: -38.2772, lon: 144.6983, sheltered: true, tidal: true, onshore: null },
      { id: "chinamans", name: "Chinaman's Hat", lat: -38.29, lon: 144.722, sheltered: true, tidal: true, onshore: null },
      { id: "lonsdalewall", name: "Lonsdale Wall", lat: -38.2925, lon: 144.612, sheltered: true, tidal: true, onshore: null },
      { id: "queenscliffpier", name: "Queenscliff Pier", lat: -38.268, lon: 144.661, sheltered: true, onshore: 45 },
      { id: "stleonards", name: "St Leonards Pier", lat: -38.169, lon: 144.72, sheltered: true, onshore: 90 },
      { id: "portarlington", name: "Portarlington Pier", lat: -38.11, lon: 144.654, sheltered: true, onshore: 30 },
      { id: "morningtonpier", name: "Mornington Pier", lat: -38.223, lon: 145.039, sheltered: true, onshore: 315 },
      { id: "ricketts", name: "Ricketts Point", lat: -37.986, lon: 145.03, sheltered: true, onshore: 270 },
      { id: "cerberus", name: "HMVS Cerberus (Black Rock)", lat: -37.975, lon: 145.013, sheltered: true, onshore: 270 },
      { id: "williamstown", name: "Williamstown (The Dell)", lat: -37.868, lon: 144.894, sheltered: true, onshore: 200 },
    ],
  },
  {
    // Silty by nature — a huge tidal exchange over mudflats and mangroves, so
    // every spot here carries the standing murk warning.
    state: "Victoria",
    region: "Western Port",
    onshore: 0,
    spots: [
      { id: "flinderspier", name: "Flinders Pier", lat: -38.477, lon: 145.025, sheltered: true, murky: "silt", onshore: 45 },
      { id: "cowes", name: "Cowes Jetty", lat: -38.447, lon: 145.239, sheltered: true, murky: "silt" },
      { id: "stonypoint", name: "Stony Point Pier", lat: -38.3755, lon: 145.2245, sheltered: true, tidal: true, murky: "silt", onshore: 90 },
      { id: "crawfish", name: "Crawfish Rock", lat: -38.359, lon: 145.317, sheltered: true, tidal: true, murky: "silt", onshore: null },
      { id: "rhyll", name: "Rhyll Jetty", lat: -38.464, lon: 145.299, sheltered: true, tidal: true, murky: "silt", onshore: 45 },
      { id: "newhaven", name: "Newhaven Pier (San Remo)", lat: -38.516, lon: 145.356, sheltered: true, tidal: true, murky: "silt", onshore: 340 },
      { id: "tortoise", name: "Tortoise Head (French Is.)", lat: -38.423, lon: 145.313, sheltered: true, tidal: true, murky: "silt", onshore: 180 },
      { id: "corinella", name: "Corinella Pier", lat: -38.406, lon: 145.423, sheltered: true, tidal: true, murky: "silt", onshore: 210 },
    ],
  },
];

export const SPOTS: Record<string, Spot> = {};
for (const rg of REGIONS) {
  for (const s of rg.spots) {
    const sheltered = s.sheltered ?? false;
    SPOTS[s.id] = {
      ...s,
      region: rg.region,
      // `??` would be wrong here: an explicit null means "shoreless", not "use the region's"
      onshore: s.onshore === undefined ? rg.onshore : s.onshore,
      sheltered,
      // Anything sheltered north of Mud Islands is the silty top half of Port
      // Phillip (Yarra/Werribee outflow) — dirty as a rule, so flag it here
      // rather than remembering to tag each spot added up that end.
      murky: s.murky ?? (sheltered && s.lat > -38.15 ? "bay" : undefined),
    };
  }
}

// ponytail: only VIC today — the picker reads this, so adding a state is a data-only change
export const STATES = [...new Set(REGIONS.map((r) => r.state))];

export const DEFAULTS = ["sorrento", "bells", "woolamai", "schanck"];

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
  diamond: "Portsea-Back-Beach",
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
