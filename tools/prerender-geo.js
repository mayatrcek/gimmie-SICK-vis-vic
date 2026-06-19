/*
 * Pre-render the Underwater-geography map layers to static images.
 *
 * WHY: the habitat (Seamap) and depth/contour (DEECA CoastKit) layers are rendered
 * on-demand by government servers, which is slow. This data never changes, so we bake
 * each layer into a single image served from the repo (GitHub's CDN) as an instant base.
 * The live tiles still load on top for sharp zoom.
 *
 * RUN (from the repo root, your machine can reach the gov servers — the build sandbox can't):
 *     node tools/prerender-geo.js
 *
 * Then commit the generated assets/geo/*.png files. Re-run any time to refresh.
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets', 'geo');
fs.mkdirSync(OUT, { recursive: true });

// Map maxBounds [[-44.2,139.5],[-33.8,150.8]] expressed in EPSG:3857 (Web Mercator) metres.
const BBOX = '15529069,-5496679,16786978,-4001005';
const W = 1600, H = 1902; // matches the bbox aspect ratio (no distortion)

const DEECA = 'https://biod-gis.mapshare.vic.gov.au/arcgis/rest/services/CoastKit';
const layers = {
  'habitat.png':
    'https://geoserver.imas.utas.edu.au/geoserver/seamap/wms?service=WMS&version=1.1.1&request=GetMap' +
    '&layers=SeamapAus_National_Benthic_Habitat_Layer&bbox=' + BBOX +
    '&srs=EPSG:3857&width=' + W + '&height=' + H + '&format=image/png&transparent=true',
  'depth.png':
    DEECA + '/Bathymetry/MapServer/export?f=image&format=png32&transparent=true&bbox=' + BBOX +
    '&bboxSR=3857&imageSR=3857&size=' + W + ',' + H +
    '&layers=show:10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25',
  'contours.png':
    DEECA + '/BathyContours/MapServer/export?f=image&format=png32&transparent=true&bbox=' + BBOX +
    '&bboxSR=3857&imageSR=3857&size=' + W + ',' + H +
    '&layers=show:1,2,4,5,7,8,10,11,13,14,15,17,18'
};

function get(url, depth) {
  return new Promise((resolve, reject) => {
    if ((depth || 0) > 5) return reject(new Error('too many redirects'));
    https.get(url, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return get(res.headers.location, (depth || 0) + 1).then(resolve, reject);
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode)); }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

(async () => {
  for (const [file, url] of Object.entries(layers)) {
    process.stdout.write('Fetching ' + file + ' ... ');
    try {
      const buf = await get(url);
      fs.writeFileSync(path.join(OUT, file), buf);
      console.log((buf.length / 1024).toFixed(0) + ' KB');
    } catch (e) {
      console.log('FAILED: ' + e.message);
    }
  }
  console.log('Done -> ' + OUT);
})();
