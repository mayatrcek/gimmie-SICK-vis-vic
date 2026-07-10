import L from "leaflet";

// OVERWORLD-quantised basemap: draws each CARTO Voyager tile to a canvas and
// snaps every pixel to the kit palette. Water is shaded by real depth from the
// AWS Terrarium elevation tiles (satellite-derived ETOPO1/GEBCO bathymetry,
// elevation = R*256 + G + B/256 - 32768), quantised into four cobalt bands so
// the sea reads like game-map depth contours. Leaflet CSS-stretches the 256px
// canvas to tileSize and #map's image-rendering:pixelated keeps it chunky.
const SEAS: [number, number[]][] = [
  // [min elevation (m), colour] — parchment→cobalt mixes, deeper = more cobalt.
  // The -200m step is the continental shelf break: past it the colour drops to a
  // cobalt-ink abyss, so the shelf edge reads as a hard contour line.
  [-10, [164, 178, 214]],
  [-35, [134, 156, 214]],
  [-90, [105, 135, 214]],
  [-200, [75, 114, 214]],
  [-Infinity, [39, 71, 155]],
];
const MOSS = [145, 172, 147]; // pine-moss mixed toward parchment
const PARCH = [242, 234, 214]; // --paper
const TAN = [217, 205, 179]; // --line
const INK_SOFT = [58, 51, 42]; // --muted

function seaShade(elev: number): number[] {
  for (const [min, col] of SEAS) if (elev >= min) return col;
  return SEAS[SEAS.length - 1][1];
}

function themedLand(r: number, g: number, b: number): number[] {
  if (g > r + 8 && g > b + 8) return MOSS;
  const lum = (3 * r + 4 * g + b) / 8;
  if (lum > 200) return PARCH;
  if (lum > 130) return TAN;
  return INK_SOFT;
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

const TERRARIUM_MAX = 15; // deepest zoom the elevation tileset serves

// 256px canvas of the terrarium tile covering (z,x,y), cropping an ancestor
// tile when z exceeds the tileset's native max.
async function depthPixels(z: number, x: number, y: number): Promise<Uint8ClampedArray> {
  const dz = Math.max(0, z - TERRARIUM_MAX);
  const f = 1 << dz;
  // proxied via /api/depth-tile — the S3 bucket has no CORS headers
  const img = await loadImg(`/api/depth-tile?z=${z - dz}&x=${x >> dz}&y=${y >> dz}`);
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const s = 256 / f;
  ctx.drawImage(img, (x & (f - 1)) * s, (y & (f - 1)) * s, s, s, 0, 0, 256, 256);
  return ctx.getImageData(0, 0, 256, 256).data;
}

const QuantisedTiles = L.TileLayer.extend({
  createTile(coords: L.Coords, done: L.DoneCallback) {
    const tile = document.createElement("canvas");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const self = this as any;
    const ze = coords.z + self.options.zoomOffset;
    Promise.all([
      loadImg(self.getTileUrl(coords)),
      depthPixels(ze, coords.x, coords.y).catch(() => null), // no depth → flat sea
    ])
      .then(([img, dep]) => {
        tile.width = img.naturalWidth;
        tile.height = img.naturalHeight;
        const ctx = tile.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const id = ctx.getImageData(0, 0, tile.width, tile.height);
        const d = id.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2];
          let c: number[];
          if (b > r + 8 && b >= g) {
            const elev = dep ? dep[i] * 256 + dep[i + 1] + dep[i + 2] / 256 - 32768 : -20;
            c = seaShade(Math.min(elev, -1)); // inland water with elev>=0 → shallowest band
          } else {
            c = themedLand(r, g, b);
          }
          d[i] = c[0];
          d[i + 1] = c[1];
          d[i + 2] = c[2];
        }
        ctx.putImageData(id, 0, 0);
        done(undefined, tile);
      })
      .catch((e) => done(e, tile));
    return tile;
  },
});

// Pre-baked copy of this rendering for the whole map extent, committed to the
// repo (tools/prerender-pixelmap.js). Sits under the live tiles so the map
// paints instantly; live tiles cover it as they finish quantising.
// Bounds MUST match the script's printed output.
const PIXELMAP_BOUNDS: L.LatLngBoundsExpression = [
  [-45.08903556483102, 135],
  [-31.952162238024968, 151.875],
];

export function pixelBaseOverlay(): L.ImageOverlay {
  return L.imageOverlay("/assets/geo/pixelmap.png", PIXELMAP_BOUNDS, {
    pane: "tilePane",
    zIndex: 0,
    interactive: false,
  });
}

export function pixelBasemap(): L.TileLayer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (QuantisedTiles as any)(
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      tileSize: 1024,
      zoomOffset: -2,
      attribution:
        "&copy; OpenStreetMap contributors &copy; CARTO &middot; bathymetry: Mapzen/ETOPO1",
    },
  );
}
