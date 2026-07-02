"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

const B: [[number, number], [number, number]] = [
  [-44.2, 139.5],
  [-33.8, 150.8],
];
const BBOX = "15529069,-5496679,16786978,-4001005";
const GIBS = "https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi";

// Build the ocean clip mask once: invert the alpha of GIBS OSM_Land_Mask on a
// canvas and expose it as a CSS mask (.chlclip), so chlorophyll is clipped to sea.
function buildOceanClip(onFail: () => void) {
  if (document.getElementById("chlclip-style")) return;
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    try {
      const cv = document.createElement("canvas");
      cv.width = img.width;
      cv.height = img.height;
      const cx = cv.getContext("2d")!;
      cx.drawImage(img, 0, 0);
      const id = cx.getImageData(0, 0, cv.width, cv.height);
      const d = id.data;
      for (let i = 0; i < d.length; i += 4) {
        d[i] = d[i + 1] = d[i + 2] = 255;
        d[i + 3] = 255 - d[i + 3];
      }
      cx.putImageData(id, 0, 0);
      const u = cv.toDataURL("image/png");
      const s = document.createElement("style");
      s.id = "chlclip-style";
      s.textContent = `.chlclip{-webkit-mask-image:url(${u});mask-image:url(${u});-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;}`;
      document.head.appendChild(s);
    } catch {
      onFail();
    }
  };
  img.onerror = onFail;
  img.src = `${GIBS}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=OSM_Land_Mask&CRS=EPSG:3857&BBOX=15529069,-5496679,16786978,-4001005&WIDTH=1280&HEIGHT=1523&FORMAT=image/png&TRANSPARENT=true`;
}

function CompLayers({ onLoaded }: { onLoaded: () => void }) {
  const map = useMap();
  useEffect(() => {
    buildOceanClip(() => {
      // fallback: opaque cream land mask if the clip couldn't be built (CORS)
      L.imageOverlay(
        `${GIBS}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=OSM_Land_Mask&CRS=EPSG:3857&BBOX=15529069,-5496679,16786978,-4001005&WIDTH=2048&HEIGHT=2436&FORMAT=image/png&TRANSPARENT=true`,
        B,
        { pane: "tilePane", className: "compmask", attribution: "", interactive: false },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ).addTo(map as any).setZIndex(600);
    });

    // NASA GIBS VIIRS NOAA-20 chlorophyll — last few days stacked to fill cloud gaps.
    const offsets = [4, 3, 2];
    let got = 0;
    const done = () => {
      if (++got >= offsets.length) onLoaded();
    };
    const safety = setTimeout(onLoaded, 12000);
    offsets.forEach((off, i) => {
      const d = new Date(Date.now() - off * 864e5);
      const ymd = d.toISOString().slice(0, 10);
      const url = `${GIBS}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=VIIRS_NOAA20_Chlorophyll_A&CRS=EPSG:3857&BBOX=${BBOX}&WIDTH=1024&HEIGHT=1218&FORMAT=image/png&TRANSPARENT=true&TIME=${ymd}`;
      const lyr = L.imageOverlay(url, B, {
        pane: "tilePane",
        className: "chlclip",
        opacity: 1,
        attribution: "Chlorophyll: NASA GIBS (VIIRS NOAA-20)",
      }).addTo(map);
      lyr.on("load", done);
      lyr.on("error", done);
      lyr.setZIndex(200 + i);
    });
    return () => clearTimeout(safety);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export default function ChlorophyllMap() {
  const [loading, setLoading] = useState(true);
  return (
    <div style={{ position: "relative" }}>
      <MapContainer
        id="compmap"
        center={[-39.0, 145.6]}
        zoom={7}
        scrollWheelZoom
        minZoom={6}
        maxBounds={[
          [-44.2, 139.5],
          [-33.8, 150.8],
        ]}
        maxBoundsViscosity={1.0}
        style={{ height: 420, borderTop: "1px solid var(--line)" }}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Imagery &copy; Esri, Maxar; Chlorophyll: NASA GIBS (VIIRS NOAA-20)"
          maxZoom={19}
          zIndex={100}
        />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
          opacity={0.9}
          zIndex={650}
        />
        <CompLayers onLoaded={() => setLoading(false)} />
      </MapContainer>
      {loading && <div className="maploader loadgif" />}
    </div>
  );
}
