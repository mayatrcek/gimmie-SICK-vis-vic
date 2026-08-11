// Shared so the header dropdowns (components/Nav.tsx) and the home page's
// bookshelf cards list the same pages.
// `wip` entries are listed but not linked — the page behind them isn't ready.
// `blurb` is only read by the /live hub; the nav and shelf show labels alone.
export type NavItem = { label: string; href: string; wip?: boolean; blurb?: string };

// The one switch for the fish guide's WIP gate: greys out the nav and shelf
// entries, stubs the page and drops it from the sitemap. Flip to false to ship.
export const FISH_WIP = true;

// The hub leads the list so it picks up a link from the nav dropdown and the
// homepage shelf both — app/live/page.tsx drops it before listing the rest.
export const LIVE_HREF = "/live";

// blurbs: shortened from each page's own metadata.description.
export const LIVE_ITEMS: NavItem[] = [
  { label: "All live data", href: LIVE_HREF },
  {
    label: "Point Nepean wave buoy",
    href: "/live/nepean",
    blurb: "Live wave height, period and direction from the entrance to Port Phillip Bay.",
  },
  {
    label: "Chlorophyll",
    href: "/live/chlorophyll",
    blurb: "Daily satellite scans — plankton blooms are what kill your visibility.",
  },
  {
    label: "Sea temperature",
    href: "/live/sst",
    blurb: "NOAA ACSPO passes with the sharp thermal fronts picked out.",
  },
  {
    label: "Currents",
    href: "/live/currents",
    blurb: "Modelled surface current speed and direction across the Victorian coast.",
  },
  {
    label: "Altimetry",
    href: "/live/altimetry",
    blurb: "Satellite sea-surface height, showing eddies and current structure.",
  },
  {
    label: "Salinity",
    href: "/live/salinity",
    blurb: "Sea-surface salinity — a marker for freshwater runoff after rain.",
  },
  {
    label: "Bathymetry",
    href: "/live/bathymetry",
    blurb: "Seabed shape and depth contours around the coast and Port Phillip Bay.",
  },
  {
    label: "Satellite imagery",
    href: "/live/satellite",
    blurb: "True-colour passes — spot sediment plumes and runoff before you plan a dive.",
  },
];

export const LEARN_ITEMS: NavItem[] = [
  { label: "Fish guide", href: "/fish", wip: FISH_WIP },
  { label: "Back beach forecasting", href: "/back-beach" },
];
