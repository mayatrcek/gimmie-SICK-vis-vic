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

function hexToRgb(h: string): [number, number, number] | null {
  h = (h || "").replace("#", "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (h.length < 6) return null;
  const n = parseInt(h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export type LegendColor = { rgb: [number, number, number]; title: string };

// Fetch the Seamap legend as JSON and map each class title to its fill colour,
// so a colour sampled from the rendered tile can be matched to a class name.
export async function buildLegendColors(): Promise<LegendColor[] | null> {
  try {
    const r = await fetch(
      "https://geoserver.imas.utas.edu.au/geoserver/seamap/wms?service=WMS&version=1.1.1&request=GetLegendGraphic&format=application/json&layer=SeamapAus_National_Benthic_Habitat_Layer",
    );
    const j = await r.json();
    const rules = j?.Legend?.[0]?.rules || [];
    const out: LegendColor[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const ru of rules as any[]) {
      const t = ru.title || ru.name;
      if (!t) continue;
      let col: string | null = null;
      const sy = ru.symbolizers || [];
      for (const s of sy) {
        const g = s.Polygon || s.Point || s.Line || s.Raster;
        if (g) {
          col = g.fill || g.stroke || (g.graphic && g.graphic.fill);
          if (col) break;
        }
      }
      const rgb = col ? hexToRgb(col) : null;
      if (rgb) out.push({ rgb, title: t });
    }
    return out.length ? out : null;
  } catch {
    return null;
  }
}

export function nearestClass(legend: LegendColor[] | null, rgb: [number, number, number]): string | null {
  if (!legend) return null;
  let best: LegendColor | null = null;
  let bd = 1e9;
  for (const c of legend) {
    const dr = rgb[0] - c.rgb[0];
    const dg = rgb[1] - c.rgb[1];
    const db = rgb[2] - c.rgb[2];
    const d = dr * dr + dg * dg + db * db;
    if (d < bd) {
      bd = d;
      best = c;
    }
  }
  return bd < 2600 && best ? best.title : null;
}

// Read the habitat WMS tile colour under a container point by drawing the tile
// image to a canvas (needs crossOrigin tiles). Returns [r,g,b], null for
// transparent (open water), or false if unreadable (tainted / off-tile).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function readHabitatColor(map: L.Map, habitatLayer: any, cp: L.Point): [number, number, number] | null | false {
  if (!habitatLayer) return false;
  const cont = habitatLayer.getContainer ? habitatLayer.getContainer() : habitatLayer._container || null;
  if (!cont) return false;
  const imgs = cont.getElementsByTagName("img");
  const mr = map.getContainer().getBoundingClientRect();
  const px = mr.left + cp.x;
  const py = mr.top + cp.y;
  let found = false;
  for (let i = imgs.length - 1; i >= 0; i--) {
    const img = imgs[i];
    if (!img.complete || !img.naturalWidth) continue;
    const r = img.getBoundingClientRect();
    if (px >= r.left && px < r.right && py >= r.top && py < r.bottom) {
      found = true;
      try {
        const cv = document.createElement("canvas");
        cv.width = img.naturalWidth;
        cv.height = img.naturalHeight;
        const x2 = cv.getContext("2d")!;
        x2.drawImage(img, 0, 0);
        const sx = Math.floor((px - r.left) * (img.naturalWidth / r.width));
        const sy = Math.floor((py - r.top) * (img.naturalHeight / r.height));
        const d = x2.getImageData(sx, sy, 1, 1).data;
        if (d[3] < 25) return null;
        return [d[0], d[1], d[2]];
      } catch {
        return false;
      }
    }
  }
  return found ? false : null;
}
