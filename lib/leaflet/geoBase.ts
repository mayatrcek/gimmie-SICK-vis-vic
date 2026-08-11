import L from "leaflet";

// Extent the pre-rendered geo basemaps cover (southern Port Phillip Bay).
// MUST match the bbox in tools/prerender-geo.js.
export const GEO_BASE_BOUNDS: [[number, number], [number, number]] = [
  [-38.6, 144.35],
  [-38.1, 145.15],
];

// Show a pre-rendered static PNG (public/assets/geo/*.png) instantly under a slow
// live gov layer, then drop it once the live layer has finished loading.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function addGeoBase(map: L.Map, file: string, liveLayer: any, opacity: number, z: number) {
  if (!map || !liveLayer) return;
  const base = L.imageOverlay("/assets/geo/" + file, GEO_BASE_BOUNDS, {
    opacity,
    pane: "tilePane",
    interactive: false,
  });
  base.setZIndex(z);
  base.addTo(map);
  liveLayer.once("load", () => {
    setTimeout(() => {
      try {
        map.removeLayer(base);
      } catch {
        /* already gone */
      }
    }, 200);
  });
}
