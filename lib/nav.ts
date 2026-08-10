// Shared so the header dropdowns (components/Nav.tsx) and the home page's
// bookshelf cards list the same pages.
// `wip` entries are listed but not linked — the page behind them isn't ready.
export type NavItem = { label: string; href: string; wip?: boolean };

// The one switch for the fish guide's WIP gate: greys out the nav and shelf
// entries, stubs the page and drops it from the sitemap. Flip to false to ship.
export const FISH_WIP = true;

export const LIVE_ITEMS: NavItem[] = [
  { label: "Point Nepean wave buoy", href: "/live/nepean" },
  { label: "Chlorophyll", href: "/live/chlorophyll" },
  { label: "Sea temperature", href: "/live/sst" },
  { label: "Currents", href: "/live/currents" },
  { label: "Altimetry", href: "/live/altimetry" },
  { label: "Salinity", href: "/live/salinity" },
  { label: "Bathymetry", href: "/live/bathymetry" },
  { label: "Satellite imagery", href: "/live/satellite" },
];

export const LEARN_ITEMS: NavItem[] = [
  { label: "Fish guide", href: "/fish", wip: FISH_WIP },
  { label: "Back beach forecasting", href: "/back-beach" },
];
