import L from "leaflet";

// Minimal ArcGIS dynamic-export layer: requests a reprojected PNG per map tile
// (works for services without WMS/tile cache, any source CRS). 512px tiles = ~1/4
// as many on-demand export requests.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EsriExport = (L.TileLayer as any).extend({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getTileUrl(coords: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const self = this as any;
    const b = self._tileCoordsToBounds(coords);
    const sw = L.CRS.EPSG3857.project(b.getSouthWest());
    const ne = L.CRS.EPSG3857.project(b.getNorthEast());
    const sz = self.getTileSize();
    return (
      self.options.baseUrl +
      "/export?f=image&format=png32&transparent=true&dpi=96" +
      "&bbox=" +
      [sw.x, sw.y, ne.x, ne.y].join(",") +
      "&bboxSR=3857&imageSR=3857&size=" +
      sz.x +
      "," +
      sz.y +
      "&layers=show:" +
      self.options.layerIds
    );
  },
});

export function esriExport(opts: { baseUrl: string; layerIds: string; opacity?: number; attribution?: string }) {
  return new EsriExport("", L.extend({ tileSize: 512 }, opts));
}
