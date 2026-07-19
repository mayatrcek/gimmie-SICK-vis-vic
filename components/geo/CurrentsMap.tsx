"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

import { curURL, SST_REGION } from "@/lib/api/erddap";
import MapRecall from "@/components/MapRecall";

// One image overlay, no latitude strips (unlike SstMap): at 0.25° data cells
// the equirect-on-mercator error (<8 km) is under a cell, and strips would
// clip arrows at their seams.
function CurrentsLayer({ day, onLoaded }: { day?: string; onLoaded: () => void }) {
  const map = useMap();
  useEffect(() => {
    const safety = setTimeout(onLoaded, 12000);
    // speed gradient (native-res PNG, browser-stretched) under the arrows
    const speed = L.imageOverlay(`/api/cur-speed?frame=map${day ? `&day=${day}` : ""}`, SST_REGION, {
      pane: "tilePane",
      opacity: 0.7,
    }).addTo(map);
    speed.setZIndex(150);
    const lyr = L.imageOverlay(curURL(day), SST_REGION, {
      pane: "tilePane",
      attribution: "currents: NOAA altimetry blend via NOAA CoastWatch ERDDAP",
    }).addTo(map);
    lyr.on("load", onLoaded);
    lyr.on("error", onLoaded);
    lyr.setZIndex(200);
    return () => {
      clearTimeout(safety);
      speed.remove();
      lyr.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export default function CurrentsMap({ day }: { day?: string }) {
  const [loading, setLoading] = useState(true);
  return (
    <div style={{ position: "relative", height: "100%" }}>
      {/* sstmap id on purpose: pulls the existing height/full-screen CSS;
          the two maps never render at once */}
      <MapContainer
        id="sstmap"
        center={[-38.5, 145.6]}
        zoom={7}
        scrollWheelZoom
        attributionControl={false}
        minZoom={6}
        maxBounds={SST_REGION}
        maxBoundsViscosity={1.0}
      >
        <MapRecall name="cur" />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Imagery &copy; Esri, Maxar; currents: NOAA via NOAA CoastWatch ERDDAP"
          maxZoom={19}
          zIndex={100}
        />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
          opacity={0.9}
          zIndex={650}
        />
        <CurrentsLayer day={day} onLoaded={() => setLoading(false)} />
      </MapContainer>
      {loading && <div className="maploader loadgif" />}
    </div>
  );
}
