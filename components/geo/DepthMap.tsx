"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { esriExport } from "@/lib/leaflet/EsriExport";
import { pinIcon } from "@/lib/leaflet/icons";
import MapLoading from "@/components/MapLoading";
import { addGeoBase } from "@/lib/leaflet/geoBase";

function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const l2 = dx * dx + dy * dy;
  let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.sqrt((px - cx) * (px - cx) + (py - cy) * (py - cy));
}

// DEECA bathymetry + contours as on-demand ArcGIS export layers.
function BathyLayers() {
  const map = useMap();
  useEffect(() => {
    const bathy = esriExport({
      baseUrl: "https://biod-gis.mapshare.vic.gov.au/arcgis/rest/services/CoastKit/Bathymetry/MapServer",
      layerIds: "10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25",
      opacity: 0.85,
      attribution: "Bathymetry &copy; DEECA Victoria (CoastKit)",
    });
    bathy.setZIndex(300);
    bathy.addTo(map);
    const con = esriExport({
      baseUrl: "https://biod-gis.mapshare.vic.gov.au/arcgis/rest/services/CoastKit/BathyContours/MapServer",
      layerIds: "1,2,4,5,7,8,10,11,13,14,15,17,18",
      opacity: 0.95,
      attribution: "Depth contours &copy; DEECA Victoria (CoastKit)",
    });
    con.setZIndex(500);
    con.addTo(map);
    // Instant pre-rendered basemaps under the slow live layers, dropped on live load.
    addGeoBase(map, "depth.png", bathy, 0.85, 250);
    addGeoBase(map, "contours.png", con, 0.95, 255);
    return () => {
      map.removeLayer(bathy);
      map.removeLayer(con);
    };
  }, [map]);
  return null;
}

function Clicks({ onDepth }: { onDepth: (html: string) => void }) {
  const map = useMap();
  const pin = useRef<L.Marker | null>(null);
  const cb = useRef(onDepth);
  cb.current = onDepth;
  useEffect(() => {
    const handler = (e: L.LeafletMouseEvent) => {
      if (pin.current) map.removeLayer(pin.current);
      pin.current = L.marker(e.latlng, { icon: pinIcon(), keyboard: false }).addTo(map);
      cb.current("reading…");
      const P = L.CRS.EPSG3857;
      const p = P.project(e.latlng);
      const b = map.getBounds();
      const sw = P.project(b.getSouthWest());
      const ne = P.project(b.getNorthEast());
      const sz = map.getSize();
      const mpp = (ne.x - sw.x) / sz.x;
      const geometry = `${Math.round(p.x)},${Math.round(p.y)}`;
      const mapExtent = [Math.round(sw.x), Math.round(sw.y), Math.round(ne.x), Math.round(ne.y)].join(",");
      const imageDisplay = `${sz.x},${sz.y},96`;
      fetch(`/api/depth?geometry=${geometry}&mapExtent=${mapExtent}&imageDisplay=${imageDisplay}`)
        .then((r) => r.json())
        .then((j) => {
          const arr: { d: number; dist: number }[] = [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (j.results || []).forEach((r: any) => {
            const n = parseFloat((r.attributes || {}).DEPTH);
            if (isNaN(n)) return;
            const g = r.geometry;
            let best = Infinity;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (g && g.paths) g.paths.forEach((path: any) => {
              for (let i = 0; i < path.length - 1; i++) {
                const d = segDist(p.x, p.y, path[i][0], path[i][1], path[i + 1][0], path[i + 1][1]);
                if (d < best) best = d;
              }
            });
            arr.push({ d: Math.abs(n), dist: best });
          });
          if (!arr.length) return cb.current("no depth contour near here");
          arr.sort((a, b2) => a.dist - b2.dist);
          if (arr[0].dist < mpp * 4) return cb.current(`&asymp; <b>${arr[0].d} m</b> (on contour)`);
          const ds: number[] = [];
          for (let i = 0; i < arr.length && ds.length < 2; i++) if (ds.indexOf(arr[i].d) < 0) ds.push(arr[i].d);
          ds.sort((a, b2) => a - b2);
          cb.current(ds.length < 2 ? `&asymp; <b>${ds[0]} m</b>` : `between <b>${ds[0]} &amp; ${ds[1]} m</b>`);
        })
        .catch(() => cb.current("server slow — try again"));
    };
    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [map]);
  return null;
}

export default function DepthMap() {
  const [depth, setDepth] = useState<string | null>(null);
  return (
    <div style={{ position: "relative" }}>
      <MapContainer
        id="bathymap"
        center={[-38.29, 144.66]}
        zoom={12}
        scrollWheelZoom
        minZoom={6}
        maxBounds={[
          [-44.2, 139.5],
          [-33.8, 150.8],
        ]}
        maxBoundsViscosity={1.0}
        style={{ height: 560, width: "100%" }}
      >
        <MapLoading />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Imagery &copy; Esri, Maxar; Depth &copy; DEECA Victoria (CoastKit)"
          maxZoom={19}
        />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
          opacity={0.9}
          zIndex={650}
        />
        <BathyLayers />
        <Clicks onDepth={setDepth} />
      </MapContainer>
      <div className="geoinfo">
        {depth == null ? (
          <span className="gi-hint">Click the map to read the depth here</span>
        ) : (
          <span>
            <b>Depth</b>
            <br />
            <span dangerouslySetInnerHTML={{ __html: depth }} />
          </span>
        )}
      </div>
    </div>
  );
}
