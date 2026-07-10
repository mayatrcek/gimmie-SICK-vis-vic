/*
 * Pre-render the dive-sites OVERWORLD pixel basemap to one static PNG.
 *
 * WHY: the live map quantises CARTO + Terrarium depth tiles per-pixel in the
 * browser (lib/leaflet/pixelTiles.ts), which takes a beat per tile. This bakes
 * the same rendering for the whole map extent at fetch-zoom Z into
 * public/assets/geo/pixelmap.png, shown instantly under the live tiles.
 *
 * RUN (repo root):  node tools/prerender-pixelmap.js
 * Then commit the PNG. Re-run if the palette/bands in pixelTiles.ts change —
 * the colour tables below are a copy and must be kept in sync.
 * PIXELMAP_BOUNDS in lib/leaflet/pixelTiles.ts must match the printed bounds.
 */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const Z = 6; // fetch zoom — the live layer fetches mapzoom-2, so this matches mapzoom 8
const EXTENT = { w: 139.5, s: -44.2, e: 150.8, n: -33.8 }; // map maxBounds in DiveSites.tsx

// ---- colour tables: keep in sync with lib/leaflet/pixelTiles.ts ----
const SEAS = [
  [-10, [164, 178, 214]],
  [-35, [134, 156, 214]],
  [-90, [105, 135, 214]],
  [-200, [75, 114, 214]],
  [-Infinity, [39, 71, 155]],
];
const MOSS = [145, 172, 147], PARCH = [242, 234, 214], TAN = [217, 205, 179], INK_SOFT = [58, 51, 42];
const seaShade = (e) => SEAS.find(([min]) => e >= min)[1];
function themedLand(r, g, b) {
  if (g > r + 8 && g > b + 8) return MOSS;
  const lum = (3 * r + 4 * g + b) / 8;
  return lum > 200 ? PARCH : lum > 130 ? TAN : INK_SOFT;
}

// ---- slippy-tile maths ----
const n = 2 ** Z;
const lon2x = (lon) => ((lon + 180) / 360) * n;
const lat2y = (lat) => ((1 - Math.asinh(Math.tan((lat * Math.PI) / 180)) / Math.PI) / 2) * n;
const x2lon = (x) => (x / n) * 360 - 180;
const y2lat = (y) => (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI;

const x0 = Math.floor(lon2x(EXTENT.w)), x1 = Math.floor(lon2x(EXTENT.e));
const y0 = Math.floor(lat2y(EXTENT.n)), y1 = Math.floor(lat2y(EXTENT.s));

async function tile(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return PNG.sync.read(Buffer.from(await r.arrayBuffer()));
}

(async () => {
  const W = (x1 - x0 + 1) * 256, H = (y1 - y0 + 1) * 256;
  const out = new PNG({ width: W, height: H });
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      const [map, dep] = await Promise.all([
        tile(`https://a.basemaps.cartocdn.com/rastertiles/voyager_nolabels/${Z}/${tx}/${ty}.png`),
        tile(`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${Z}/${tx}/${ty}.png`),
      ]);
      for (let p = 0; p < 256 * 256; p++) {
        const i = p * 4;
        const r = map.data[i], g = map.data[i + 1], b = map.data[i + 2];
        let c;
        if (b > r + 8 && b >= g) {
          const elev = dep.data[i] * 256 + dep.data[i + 1] + dep.data[i + 2] / 256 - 32768;
          c = seaShade(Math.min(elev, -1));
        } else {
          c = themedLand(r, g, b);
        }
        const o = (((ty - y0) * 256 + (p >> 8)) * W + (tx - x0) * 256 + (p & 255)) * 4;
        out.data[o] = c[0]; out.data[o + 1] = c[1]; out.data[o + 2] = c[2]; out.data[o + 3] = 255;
      }
      console.log(`tile ${tx},${ty} done`);
    }
  }
  const file = path.join(__dirname, '..', 'public', 'assets', 'geo', 'pixelmap.png');
  fs.writeFileSync(file, PNG.sync.write(out));
  console.log(`wrote ${file} (${W}x${H})`);
  console.log(`bounds: [[${y2lat(y1 + 1)}, ${x2lon(x0)}], [${y2lat(y0)}, ${x2lon(x1 + 1)}]]`);
})();
