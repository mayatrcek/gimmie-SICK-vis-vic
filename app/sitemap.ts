import type { MetadataRoute } from "next";

// ponytail: hand-listed. 19 static routes, no dynamic segments — globbing the app
// dir would be more code than the list. Add a route here when you add a page.
const ROUTES: Array<[path: string, priority: number]> = [
  ["/", 1],
  ["/forecast", 0.9],
  ["/live/chlorophyll", 0.9],
  ["/live/sst", 0.9],
  ["/live/nepean", 0.8],
  ["/fish", 0.8],
  ["/geo/depth", 0.8],
  ["/back-beach", 0.7],
  ["/live/currents", 0.6],
  ["/live/altimetry", 0.6],
  ["/live/salinity", 0.6],
  ["/live/bathymetry", 0.6],
  ["/live/satellite", 0.6],
  ["/about", 0.5],
  ["/contact", 0.4],
  ["/store", 0.4],
  ["/feedback", 0.3],
  ["/privacy", 0.2],
  ["/terms", 0.2],
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map(([path, priority]) => ({
    url: `https://gimmiesickvis.com${path}`,
    lastModified,
    priority,
  }));
}
