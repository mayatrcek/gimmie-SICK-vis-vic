"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { esriExport } from "@/lib/leaflet/EsriExport";
import { pinIcon } from "@/lib/leaflet/icons";
import MapLoading from "@/components/MapLoading";
import { classifyHab, type GeoGroup } from "@/lib/data/geoGroups";
import { addGeoBase, buildLegendColors, nearestClass, readHabitatColor, type LegendColor } from "@/lib/leaflet/geoBase";

type Detail = { lat: number; lng: number; name: string | null; group: GeoGroup | null; raw: string | null | false } | null;
// hover: a habitat group, "open" (open water), or null (nothing under cursor yet)
type Hover = GeoGroup | "open" | null;

const SEAMAP_WMS = "https://geoserver.imas.utas.edu.au/geoserver/seamap/wms";
const CONTOURS = "https://biod-gis.mapshare.vic.gov.au/arcgis/rest/services/CoastKit/BathyContours/MapServer";

function GeoLayers({ onHover, onDetail }: { onHover: (h: Hover) => void; onDetail: (d: Detail | ((prev: Detail) => Detail)) => void }) {
  const map = useMap();
  useEffect(() => {
    // Live gov layers (habitat WMS needs crossOrigin so its tiles can be pixel-read).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const habitat = (L.tileLayer.wms as any)(SEAMAP_WMS, {
      layers: "SeamapAus_National_Benthic_Habitat_Layer",
      format: "image/png",
      transparent: true,
      version: "1.1.1",
      opacity: 0.62,
      crossOrigin: true,
      attribution: "Seamap Australia",
    });
    habitat.setZIndex(400);
    habitat.addTo(map);
    const contour = esriExport({ baseUrl: CONTOURS, layerIds: "1,2,4,5,7,8,10,11,13,14,15,17,18", opacity: 0.9, attribution: "Depth contours &copy; DEECA Victoria (CoastKit)" });
    contour.setZIndex(500);
    contour.addTo(map);
    const control = L.control.layers(undefined, { "Seabed habitat (Seamap Australia)": habitat, "Depth contours (DEECA)": contour }, { collapsed: false }).addTo(map);

    // Instant pre-rendered basemaps under the slow live layers, dropped on live load.
    addGeoBase(map, "habitat.png", habitat, 0.62, 380);
    addGeoBase(map, "contours.png", contour, 0.9, 385);

    let legend: LegendColor[] | null = null;
    buildLegendColors().then((l) => (legend = l));

    // Colour from the rendered tile first (free/instant); server GetFeatureInfo as fallback.
    function geoQuery(ll: L.LatLng, cp: L.Point, cb: (raw: string | null) => void) {
      const px = readHabitatColor(map, habitat, cp);
      if (px === null) return cb(null); // transparent = open water
      if (px && legend) {
        const t = nearestClass(legend, px);
        if (t) return cb(t);
      }
      const size = map.getSize();
      const b = map.getBounds();
      const sw = map.options.crs!.project(b.getSouthWest());
      const ne = map.options.crs!.project(b.getNorthEast());
      fetch(`/api/habitat?bbox=${sw.x},${sw.y},${ne.x},${ne.y}&width=${size.x}&height=${size.y}&x=${Math.round(cp.x)}&y=${Math.round(cp.y)}`)
        .then((r) => r.json())
        .then((j) => cb(j.raw || null))
        .catch(() => cb(null));
    }

    let hTimer: ReturnType<typeof setTimeout> | null = null;
    function onMove(ev: L.LeafletMouseEvent) {
      if (hTimer) clearTimeout(hTimer);
      const cp = ev.containerPoint;
      const ll = ev.latlng;
      hTimer = setTimeout(() => geoQuery(ll, cp, (raw) => onHover(raw ? classifyHab(raw) : "open")), 200);
    }
    map.on("mousemove", onMove);

    let pin: L.Marker | null = null;
    function onClick(e: L.LeafletMouseEvent) {
      if (pin) map.removeLayer(pin);
      pin = L.marker(e.latlng, { icon: pinIcon(), keyboard: false }).addTo(map);
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      onDetail({ lat, lng, name: null, group: null, raw: null });
      fetch(`/api/geocode?lat=${lat}&lon=${lng}`)
        .then((r) => r.json())
        .then((j) => onDetail((d) => (d && d.lat === lat && d.lng === lng ? { ...d, name: j.name || "Offshore Victoria" } : d)))
        .catch(() => {});
      geoQuery(e.latlng, e.containerPoint, (raw) =>
        onDetail((d) => (d && d.lat === lat && d.lng === lng ? { ...d, raw: raw ?? false, group: raw ? classifyHab(raw) : null } : d)),
      );
    }
    map.on("click", onClick);

    return () => {
      map.off("mousemove", onMove);
      map.off("click", onClick);
      if (hTimer) clearTimeout(hTimer);
      try {
        map.removeControl(control);
        map.removeLayer(habitat);
        map.removeLayer(contour);
        if (pin) map.removeLayer(pin);
      } catch {
        /* teardown */
      }
    };
  }, [map, onHover, onDetail]);
  return null;
}

export default function HabitatMap() {
  const [hover, setHover] = useState<Hover>(null);
  const [detail, setDetail] = useState<Detail>(null);

  return (
    <div style={{ position: "relative", flex: 1, minWidth: 0, display: "flex" }}>
      <MapContainer
        id="geomap"
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
          attribution="Imagery &copy; Esri, Maxar; Habitat &copy; Seamap Australia (IMAS/UTAS); Depth &copy; DEECA"
          maxZoom={19}
        />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
          opacity={0.9}
          zIndex={650}
        />
        <GeoLayers onHover={setHover} onDetail={setDetail} />
      </MapContainer>

      <div className="geoinfo">
        <div className="gi-hover">
          {hover === null ? (
            <span className="gi-hint">Hover the seabed to identify it &middot; click for detail</span>
          ) : hover === "open" ? (
            "Under cursor: Open water"
          ) : (
            <>
              <span style={{ display: "inline-block", width: 11, height: 11, borderRadius: 3, background: hover.col, verticalAlign: -1, marginRight: 5 }} />
              Under cursor: <b>{hover.name}</b>
            </>
          )}
        </div>
        {detail && (
          <div className="gi-detail" style={{ borderTop: "1px solid var(--line)", marginTop: 8, paddingTop: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{detail.name || "Selected point"}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", margin: "2px 0 6px" }}>
              {detail.lat.toFixed(3)}, {detail.lng.toFixed(3)}
            </div>
            {detail.group ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                  <span style={{ width: 13, height: 13, borderRadius: 3, background: detail.group.col, flex: "0 0 13px" }} />
                  <b>{detail.group.name}</b>
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.4 }}>{detail.group.desc}</div>
                {detail.raw && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 5 }}>Seamap class: {detail.raw}</div>}
              </>
            ) : detail.raw === false ? (
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Open water — no seabed habitat here.</div>
            ) : (
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Reading…</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
