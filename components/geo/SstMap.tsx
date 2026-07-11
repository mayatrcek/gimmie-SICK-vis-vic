"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

import { sstURL } from "@/lib/api/erddap";
import MapRecall from "@/components/MapRecall";

type Stretch = { min?: number; max?: number };

// ERDDAP's data region (lat/lon of sstURL). The grid is equirectangular and
// leaflet stretches it linearly onto mercator, so mid-range features can sit
// ~2 km off the basemap coast. Invisible at these zooms for a planning viz.
// ponytail: single imageOverlay; per-latitude strip reproject if it matters
const B: [[number, number], [number, number]] = [
  [-39.7, 140.8],
  [-37.1, 150.2],
];

function SstLayer({ stretch, onLoaded }: { stretch: Stretch; onLoaded: () => void }) {
  const map = useMap();
  useEffect(() => {
    // NASA JPL MUR SST via NOAA ERDDAP — land cells are NaN → transparent.
    const safety = setTimeout(onLoaded, 12000);
    const lyr = L.imageOverlay(sstURL(stretch), B, {
      pane: "tilePane",
      attribution: "SST: NASA JPL MUR via NOAA ERDDAP",
    }).addTo(map);
    lyr.on("load", onLoaded);
    lyr.on("error", onLoaded);
    lyr.setZIndex(200);
    return () => {
      clearTimeout(safety);
      lyr.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export default function SstMap({ stretch }: { stretch: Stretch }) {
  const [loading, setLoading] = useState(true);
  return (
    <div style={{ position: "relative" }}>
      <MapContainer
        id="sstmap"
        center={[-38.4, 145.5]}
        zoom={7}
        scrollWheelZoom
        attributionControl={false}
        minZoom={6}
        maxBounds={[
          [-40.2, 140.3],
          [-36.6, 150.7],
        ]}
        maxBoundsViscosity={1.0}
      >
        <MapRecall name="sst" />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Imagery &copy; Esri, Maxar; SST: NASA JPL MUR via NOAA ERDDAP"
          maxZoom={19}
          zIndex={100}
        />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
          opacity={0.9}
          zIndex={650}
        />
        <SstLayer stretch={stretch} onLoaded={() => setLoading(false)} />
      </MapContainer>
      {loading && <div className="maploader loadgif" />}
    </div>
  );
}
