export type Species = {
  id: string;
  name: string;
  sci: string;
  good: number[];
  peak: string;
  env: string[];
  spots: string;
  tech: string;
  reg?: boolean;
};

export const MONTH_LBL = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

// Stylised inline SVG fish/critter icons, keyed by species id.
export const SVG: Record<string, string> = {
  snapper:
    '<svg viewBox="0 0 120 64"><path d="M22 34 Q34 13 62 15 Q92 17 100 34 Q92 51 62 53 Q34 55 22 34Z" fill="#e07b7b"/><path d="M99 34 L118 23 L113 34 L118 45Z" fill="#d36a6a"/><path d="M44 17 Q60 7 76 16" stroke="#d36a6a" stroke-width="4" fill="none"/><circle cx="36" cy="30" r="3" fill="#22303a"/></svg>',
  kingfish:
    '<svg viewBox="0 0 120 64"><path d="M12 34 Q40 20 96 28 Q106 30 112 34 Q106 38 96 40 Q40 48 12 34Z" fill="#6f97b3"/><path d="M112 34 L122 26 L116 34 L122 42Z" fill="#e6c34a"/><rect x="22" y="32" width="82" height="3.4" fill="#e6c34a" opacity="0.85"/><circle cx="22" cy="33" r="2.6" fill="#1f2d36"/></svg>',
  tuna:
    '<svg viewBox="0 0 120 64"><path d="M14 34 Q44 16 92 28 Q103 30 108 34 Q103 38 92 40 Q44 52 14 34Z" fill="#3f6f9e"/><path d="M108 34 Q120 23 116 34 Q120 45 108 34Z" fill="#33597f"/><path d="M58 18 L70 12 L66 23Z" fill="#33597f"/><path d="M60 50 L72 56 L66 45Z" fill="#f0c33b"/><circle cx="26" cy="32" r="3" fill="#16242f"/></svg>',
  whiting:
    '<svg viewBox="0 0 120 64"><path d="M14 34 Q50 24 98 31 Q106 32 110 34 Q106 36 98 37 Q50 44 14 34Z" fill="#cdb98c"/><path d="M110 34 L120 29 L116 34 L120 39Z" fill="#b8a071"/><circle cx="24" cy="33" r="2.4" fill="#3a3320"/><g fill="#9c8650"><circle cx="42" cy="33" r="1.6"/><circle cx="58" cy="33" r="1.6"/><circle cx="74" cy="33" r="1.6"/></g></svg>',
  flathead:
    '<svg viewBox="0 0 120 64"><path d="M30 30 Q70 28 100 33 Q108 34 112 36 Q108 38 100 39 Q70 42 40 40 L30 38Z" fill="#9a8b6a"/><path d="M8 36 L30 26 L40 31 L40 39 L30 46Z" fill="#8a7c5d"/><path d="M112 36 L120 31 L120 41Z" fill="#8a7c5d"/><circle cx="22" cy="31" r="2.2" fill="#2b2719"/><circle cx="30" cy="31" r="2.2" fill="#2b2719"/></svg>',
  squid:
    '<svg viewBox="0 0 120 64"><path d="M60 5 Q78 5 78 30 L74 44 Q60 50 46 44 L42 30 Q42 5 60 5Z" fill="#e0a0a8"/><path d="M42 13 L29 9 L44 22Z" fill="#cf8d96"/><path d="M78 13 L91 9 L76 22Z" fill="#cf8d96"/><g stroke="#cf8d96" stroke-width="3" fill="none" stroke-linecap="round"><path d="M50 46 Q48 58 44 62"/><path d="M57 48 Q56 60 54 63"/><path d="M64 48 Q64 60 66 63"/><path d="M70 46 Q72 58 76 62"/></g><circle cx="53" cy="29" r="3" fill="#3a2530"/><circle cx="67" cy="29" r="3" fill="#3a2530"/></svg>',
  cray:
    '<svg viewBox="0 0 120 64"><ellipse cx="62" cy="34" rx="26" ry="13" fill="#c0563f"/><path d="M88 26 L106 34 L88 42Z" fill="#a8472f"/><g stroke="#9b3f29" stroke-width="2.6" fill="none" stroke-linecap="round"><path d="M40 30 Q20 18 7 12"/><path d="M40 38 Q20 50 7 56"/></g><g stroke="#a8472f" stroke-width="3" stroke-linecap="round"><path d="M52 46 L48 58"/><path d="M62 47 L60 59"/><path d="M72 46 L76 58"/></g><circle cx="44" cy="30" r="2" fill="#2b1410"/></svg>',
};

export const SPECIES: Species[] = [
  {
    id: "snapper",
    name: "Snapper",
    sci: "Chrysophrys auratus",
    good: [10, 11, 12, 1, 2, 3, 4, 5],
    peak: "Oct–Nov & Apr–May runs (water 15–19°C)",
    env: ["Bay reef edges", "Channels", "Sand/mud"],
    spots:
      "Port Phillip Bay — Fawkner Beacon, Mornington, Hampton–Black Rock, Altona–Pt Wilson; Western Port.",
    tech: "Berley and bait on reef edges and channel drop-offs; best at dawn/dusk and tide change.",
  },
  {
    id: "kingfish",
    name: "Yellowtail Kingfish",
    sci: "Seriola lalandi",
    good: [11, 12, 1, 2, 3, 4],
    peak: "Late Dec–Mar (inshore Oct–Apr)",
    env: ["Bommies/pinnacles", "Breaking reefs", "Headlands"],
    spots: "Pyramid Rock, The Pinnacle (Cape Woolamai), Seal Rocks; Port Phillip kingfish reefs.",
    tech: "Live bait, jigs or stickbaits in current around bommies; fish the wash on a moving tide.",
  },
  {
    id: "tuna",
    name: "Southern Bluefin Tuna (schoolies)",
    sci: "Thunnus maccoyii",
    good: [2, 3, 4, 5, 6, 7, 8],
    peak: "Warmer months — schoolies push inshore; Portland run Apr–Jul",
    env: ["Inshore off Barwon Heads", "Open ocean / shelf", "Current lines"],
    spots:
      "Schoolies run into Barwon Heads through the warmer months; also Portland, outside the Heads, east to the Prom.",
    tech:
      "Troll skirts/divers along temp breaks and bait schools. Best on glassed-out, calm days — watch for working birds.",
  },
  {
    id: "squid",
    name: "Southern Calamari",
    sci: "Sepioteuthis australis",
    good: [4, 5, 6, 7, 8],
    peak: "Apr–Aug (clear, cool water); big spawners in spring",
    env: ["Seagrass meadows", "Shallow reef/weed", "Piers"],
    spots: "Southern Port Phillip — Lonsdale Bight, Pt Nepean, Queenscliff, St Leonards; Western Port.",
    tech: "Egi jigs over weed beds and reef in 1–6 m; dawn and dusk are prime.",
  },
  {
    id: "whiting",
    name: "King George Whiting",
    sci: "Sillaginodes punctata",
    good: [5, 6, 7, 8, 9],
    peak: "May–Sep (good all year)",
    env: ["Broken ground", "Sand + weed patches", "Channels"],
    spots: "Southern Port Phillip Bay, Western Port, Anderson/Corner/Shallow Inlets, Portland.",
    tech: "Bait on broken ground in 3–6 m; fish the two hours after high tide, dawn/dusk.",
  },
  {
    id: "flathead",
    name: "Southern Sand Flathead",
    sci: "Platycephalus bassensis",
    good: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    peak: "Year-round; best summer–autumn",
    env: ["Sand bottom", "Mud/shell grit", "10–30 m"],
    spots: "Port Phillip Bay (the main fishery); coastal waters and estuaries statewide.",
    tech: "Drift baits or soft plastics across sand and shell-grit flats.",
  },
  {
    id: "cray",
    name: "Southern Rock Lobster",
    sci: "Jasus edwardsii",
    good: [11, 12, 1, 2, 3, 4, 5],
    peak: "Season opens ~16 Nov",
    env: ["Rocky reef <5 m", "Cracks & holes", "Granite/basalt/limestone"],
    spots: "Coastal reef statewide — Prom granite, Phillip Island basalt, Portland limestone.",
    tech: "Dive/loop reef ledges and holes. Bag limit 2; return berried & soft-shell lobster.",
    reg: true,
  },
  // ponytail: mock entries to exercise pagination — flesh out details before shipping
  {
    id: "trevally",
    name: "Trevally",
    sci: "Pseudocaranx dentex",
    good: [11, 12, 1, 2, 3, 4],
    peak: "Variable — warmer months",
    env: ["Estuaries", "Reefs"],
    spots: "Estuaries and inshore reefs statewide.",
    tech: "Soft plastics, baits and metals around structure and current.",
  },
  {
    id: "boarfish",
    name: "Boarfish",
    sci: "Pentacerotidae",
    good: [5, 6, 7, 8, 9],
    peak: "Deep water — cooler months",
    env: ["Offshore reefs", "Deep water"],
    spots: "Deeper offshore reef grounds.",
    tech: "Baits fished hard on the bottom over deep reef.",
  },
];
