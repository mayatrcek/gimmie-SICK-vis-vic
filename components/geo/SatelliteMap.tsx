"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import MapLoading from "@/components/MapLoading";
import MapRecall from "@/components/MapRecall";
import { VIC_COAST_BOUNDS, landBackdropMercatorURL } from "@/lib/api/sentinel";

// Simple land/sea silhouette under the satellite tiles, showing through
// swath gaps instead of solid black (tiles now carry real alpha there — see
// TRUE_COLOR_EVALSCRIPT's dataMask band). Projected to Web Mercator meters
// via the map's own CRS so it lines up with Leaflet's tile grid.
function LandBackdrop() {
  const map = useMap();
  useEffect(() => {
    const sw = map.options.crs!.project(L.latLng(VIC_COAST_BOUNDS[0][0], VIC_COAST_BOUNDS[0][1]));
    const ne = map.options.crs!.project(L.latLng(VIC_COAST_BOUNDS[1][0], VIC_COAST_BOUNDS[1][1]));
    const url = landBackdropMercatorURL(`${sw.x},${sw.y},${ne.x},${ne.y}`);
    const layer = L.imageOverlay(url, VIC_COAST_BOUNDS, {
      pane: "tilePane",
      className: "compmask",
      interactive: false,
      attribution: "",
    }).addTo(map);
    layer.setZIndex(50);
    return () => {
      map.removeLayer(layer);
    };
  }, [map]);
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
      maxZoom={14}
      attributionControl={false}
    >
      <MapLoading />
      <MapRecall name="satellite" />
      <LandBackdrop />
      <TileLayer
        url={`/api/satellite/tile/${date}/{z}/{x}/{y}`}
        attribution="Imagery: Copernicus Sentinel-2 (ESA)"
        noWrap
        zIndex={200}
      />
    </MapContainer>
  );
}
