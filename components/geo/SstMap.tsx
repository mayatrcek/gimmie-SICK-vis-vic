"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

import { SST_REGION, sstURL } from "@/lib/api/erddap";
import { dotIcon } from "@/lib/leaflet/icons";
import MapRecall from "@/components/MapRecall";

type Stretch = { min?: number; max?: number };

// ERDDAP's data region (lat/lon of sstURL).
const B = SST_REGION;

// The ERDDAP grid is equirectangular but leaflet stretches images linearly
// onto mercator — one image over 7.4° of latitude lands mid-map features
// ~5-8 km north of the coast. Drawing the overlay as latitude strips, each
// with exact bounds, cuts the residual error to a couple hundred metres.
const STRIPS = 8;

function SstLayer({ stretch, day, onLoaded }: { stretch: Stretch; day?: string; onLoaded: () => void }) {
  const map = useMap();
  useEffect(() => {
    // NOAA ACSPO 2 km SST via CoastWatch ERDDAP — land and cloud cells are
    // NaN → transparent.
    const safety = setTimeout(onLoaded, 12000);
    const [[s, w], [n, e]] = B;
    let left = STRIPS;
    const done = () => --left === 0 && onLoaded();
    const lyrs = Array.from({ length: STRIPS }, (_, i) => {
      const lat0 = Math.round((s + ((n - s) * i) / STRIPS) * 100) / 100;
      const lat1 = i === STRIPS - 1 ? n : Math.round((s + ((n - s) * (i + 1)) / STRIPS) * 100) / 100;
      const lyr = L.imageOverlay(
        sstURL(stretch, day, [lat0, lat1]),
        [
          [lat0, w],
          [lat1, e],
        ],
        { pane: "tilePane", attribution: "SST: NOAA ACSPO via NOAA CoastWatch ERDDAP" },
      ).addTo(map);
      lyr.on("load", done);
      lyr.on("error", done);
      lyr.setZIndex(200);
      return lyr;
    });
    return () => {
      clearTimeout(safety);
      lyrs.forEach((l) => l.remove());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

// Detected thermal-front cells (~1k/day) drawn as small dots on one shared
// canvas. Always on — ponytail: add a layers-control toggle if it clutters.
function FrontsLayer({ day }: { day?: string }) {
  const map = useMap();
  useEffect(() => {
    const grp = L.layerGroup([], { attribution: "fronts: NOAA ACSPO" }).addTo(map);
    const canvas = L.canvas();
    fetch(`/api/sst-fronts${day ? `?day=${day}` : ""}`)
      .then((r) => r.json())
      .then((j) =>
        (j.pts as [number, number][]).forEach((pt) =>
          grp.addLayer(
            L.circleMarker(pt, {
              renderer: canvas,
              radius: 1.5,
              stroke: false,
              fillColor: "#fff",
              fillOpacity: 0.9,
            }),
          ),
        ),
      )
      .catch(() => {});
    return () => {
      grp.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

// Click probe: pin dropped on the clicked point, OVERWORLD popup above it
// showing just that cell's temperature.
function Probe({ day }: { day?: string }) {
  const map = useMap();
  useEffect(() => {
    let pin: L.Marker | null = null;
    let seq = 0; // ignore reads from superseded clicks
    const handler = (e: L.LeafletMouseEvent) => {
      const my = ++seq;
      pin?.remove();
      // OVERWORLD square dot — white with ink frame + block shadow keeps it
      // visible over any overlay colour
      pin = L.marker(e.latlng, { icon: dotIcon("#FFFAEF"), keyboard: false })
        .addTo(map)
        .bindPopup("…", { maxWidth: 220, autoPan: false, closeButton: false })
        .openPopup();
      const q = `lat=${e.latlng.lat.toFixed(2)}&lon=${e.latlng.lng.toFixed(2)}${day ? `&day=${day}` : ""}`;
      fetch(`/api/sst-point?${q}`)
        .then((r) => r.json())
        .then((j) => {
          if (my !== seq) return;
          pin?.setPopupContent(j.sst != null ? `<b>${j.sst.toFixed(1)}&nbsp;&deg;C</b>` : "no data");
        })
        .catch(() => {
          if (my === seq) pin?.setPopupContent("retry");
        });
    };
    map.on("click", handler);
    return () => {
      map.off("click", handler);
      pin?.remove();
    };
  }, [map, day]);
  return null;
}

export default function SstMap({ stretch, day }: { stretch: Stretch; day?: string }) {
  const [loading, setLoading] = useState(true);
  return (
    <div style={{ position: "relative", height: "100%" }}>
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
        <MapRecall name="sst" />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Imagery &copy; Esri, Maxar; SST: NOAA ACSPO via NOAA CoastWatch ERDDAP"
          maxZoom={19}
          zIndex={100}
        />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
          opacity={0.9}
          zIndex={650}
        />
        <SstLayer stretch={stretch} day={day} onLoaded={() => setLoading(false)} />
        <FrontsLayer day={day} />
        <Probe day={day} />
      </MapContainer>
      {loading && <div className="maploader loadgif" />}
    </div>
  );
}
