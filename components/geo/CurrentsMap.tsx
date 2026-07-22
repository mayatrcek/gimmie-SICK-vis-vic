"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

import { SST_REGION } from "@/lib/api/erddap";
import { curSpeedURL, curURL } from "@/lib/api/cmems";
import MapRecall from "@/components/MapRecall";

// One image overlay, no latitude strips (unlike SstMap): at 0.083° data cells
// the equirect-on-mercator error (<8 km) is under a cell, and strips would
// clip arrows at their seams.
// Arrow density scales with zoom: coarse (stride 3) at the default zoom-out
// view, down to stride 1 (every native 0.083° cell) once zoomed in far
// enough to actually resolve individual arrows.
function strideForZoom(zoom: number): number {
  if (zoom >= 10) return 1;
  if (zoom >= 8) return 2;
  return 3;
}

function CurrentsLayer({ day, onLoaded }: { day: string; onLoaded: () => void }) {
  const map = useMap();
  useEffect(() => {
    const safety = setTimeout(onLoaded, 12000);
    // speed gradient (native-res PNG, browser-stretched) under the arrows
    const speed = L.imageOverlay(curSpeedURL(day, "map"), SST_REGION, {
      pane: "tilePane",
      opacity: 0.7,
    }).addTo(map);
    speed.setZIndex(150);
    let stride = strideForZoom(map.getZoom());
    const lyr = L.imageOverlay(curURL(day, stride), SST_REGION, {
      pane: "tilePane",
      attribution: "currents: Copernicus Marine global ocean forecast",
    }).addTo(map);
    lyr.on("load", onLoaded);
    lyr.on("error", onLoaded);
    lyr.setZIndex(200);
    // re-render the arrow overlay at finer stride as the user zooms in
    const onZoom = () => {
      const next = strideForZoom(map.getZoom());
      if (next !== stride) {
        stride = next;
        lyr.setUrl(curURL(day, stride));
      }
    };
    map.on("zoomend", onZoom);
    return () => {
      clearTimeout(safety);
      map.off("zoomend", onZoom);
      speed.remove();
      lyr.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export default function CurrentsMap({ day }: { day: string }) {
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
          attribution="Imagery &copy; Esri, Maxar; currents: Copernicus Marine"
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
