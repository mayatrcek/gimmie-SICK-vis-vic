"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import MapLoading from "@/components/MapLoading";
import MapRecall from "@/components/MapRecall";
import CoordCopy from "@/components/geo/CoordCopy";
import { RENDER_V, VIC_COAST_BOUNDS, landBackdropMercatorURL } from "@/lib/api/sentinel";

// Two layers under the satellite tiles:
//
//  - the land/sea silhouette, showing through swath gaps instead of solid black
//    (tiles carry real alpha there — see TRUE_COLOR_EVALSCRIPT's dataMask band).
//    Projected to Web Mercator meters via the map's own CRS so it lines up with
//    Leaflet's tile grid.
//  - the gallery card's own thumbnail, stretched over the identical bbox. It is
//    already in the browser cache (the card just showed it), so it paints
//    immediately and gives a blurry preview of the real scan while the tiles
//    render, instead of a blank map. Same evalscript, so its no-data alpha lines
//    up with the tiles' and the land mask still shows through the gaps.
function Backdrop({ date }: { date: string }) {
  const map = useMap();
  useEffect(() => {
    const sw = map.options.crs!.project(L.latLng(VIC_COAST_BOUNDS[0][0], VIC_COAST_BOUNDS[0][1]));
    const ne = map.options.crs!.project(L.latLng(VIC_COAST_BOUNDS[1][0], VIC_COAST_BOUNDS[1][1]));
    const land = L.imageOverlay(landBackdropMercatorURL(`${sw.x},${sw.y},${ne.x},${ne.y}`), VIC_COAST_BOUNDS, {
      pane: "tilePane",
      className: "compmask",
      interactive: false,
      attribution: "",
    }).addTo(map);
    land.setZIndex(50);
    const preview = L.imageOverlay(`/api/satellite/thumbnail?date=${date}&v=${RENDER_V}`, VIC_COAST_BOUNDS, {
      pane: "tilePane",
      className: "satpreview",
      interactive: false,
      attribution: "",
    }).addTo(map);
    preview.setZIndex(100);
    return () => {
      map.removeLayer(land);
      map.removeLayer(preview);
    };
  }, [map, date]);
  return null;
}

// Locked, zoomable true-colour detail view for one date — a plain XYZ tile
// layer against our own tile proxy, over the land-mask backdrop.
export default function SatelliteMap({ date }: { date: string }) {
  return (
    <MapContainer
      id="satmap"
      bounds={VIC_COAST_BOUNDS}
      maxBounds={VIC_COAST_BOUNDS}
      maxBoundsViscosity={1.0}
      minZoom={7}
      maxZoom={16}
      attributionControl={false}
    >
      <MapLoading />
      <MapRecall name="satellite" />
      <Backdrop date={date} />
      {/* Sentinel-2's RGB bands are 10m, which runs out at about z14 — past that
          Copernicus would bill us Processing Units to render tiles carrying no
          more detail than the z14 ones. maxNativeZoom stops at the real limit
          and lets Leaflet upscale from there, so the extra zoom is free. */}
      <TileLayer
        url={`/api/satellite/tile/${date}/{z}/{x}/{y}?v=${RENDER_V}`}
        attribution="Imagery: Copernicus Sentinel-2 (ESA)"
        noWrap
        maxNativeZoom={14}
        zIndex={200}
      />
      <CoordCopy />
    </MapContainer>
  );
}
