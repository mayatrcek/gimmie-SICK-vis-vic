"use client";

import { useEffect } from "react";
import { AttributionControl, MapContainer, TileLayer, useMap } from "react-leaflet";
import { esriExport } from "@/lib/leaflet/EsriExport";
import MapLoading from "@/components/MapLoading";
import MapRecall from "@/components/MapRecall";
import CoordCopy from "@/components/geo/CoordCopy";
import { addGeoBase } from "@/lib/leaflet/geoBase";

// DEECA bathymetry + contours as on-demand ArcGIS export layers.
function BathyLayers() {
  const map = useMap();
  useEffect(() => {
    const bathy = esriExport({
      baseUrl: "https://biod-gis.mapshare.vic.gov.au/arcgis/rest/services/CoastKit/Bathymetry/MapServer",
      layerIds: "10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25",
      opacity: 0.85,
    });
    bathy.setZIndex(300);
    bathy.addTo(map);
    const con = esriExport({
      baseUrl: "https://biod-gis.mapshare.vic.gov.au/arcgis/rest/services/CoastKit/BathyContours/MapServer",
      layerIds: "1,2,4,5,7,8,10,11,13,14,15,17,18",
      opacity: 0.95,
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

export default function DepthMap() {
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
        attributionControl={false}
        style={{ height: 560, width: "100%" }}
      >
        {/* leaflet's "Leaflet" prefix dropped — the credits are the caption */}
        <AttributionControl prefix={false} />
        <MapLoading />
        <MapRecall name="depth" />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="DEECA Victoria (CoastKit) &middot; Esri, Maxar"
          maxZoom={19}
        />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
          opacity={0.9}
          zIndex={650}
        />
        <BathyLayers />
        <CoordCopy />
      </MapContainer>
    </div>
  );
}
