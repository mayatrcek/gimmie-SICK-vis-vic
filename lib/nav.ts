// Shared so the header dropdown (components/Nav.tsx) and the home page's
// Live Data card list the same pages.
export type NavItem = { label: string; href: string };

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
