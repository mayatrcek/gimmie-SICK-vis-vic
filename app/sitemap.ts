import type { MetadataRoute } from "next";
import { FISH_WIP } from "@/lib/nav";

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

// ponytail: no lastmod. It was build time on every URL, which claims the whole site
// changed on every deploy — Google ignores a lastmod it can't trust, and a wrong one
// is worse than none. Vercel's shallow clone rules out deriving it from git history.
// Add real per-route dates here if pages ever get an edited-on date of their own.
export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.filter(([path]) => !(FISH_WIP && path === "/fish")).map(([path, priority]) => ({
    url: `https://gimmiesickvis.com${path}`,
    priority,
  }));
}
