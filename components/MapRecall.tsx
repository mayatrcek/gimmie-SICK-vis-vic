"use client";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import "@/lib/leaflet/wheelWhileDrag";

// Drop inside a MapContainer: restores the last-viewed center/zoom for this
// map from localStorage, then saves it on every pan/zoom. Stale values are
// safe — every map sets maxBounds/min/maxZoom and Leaflet clamps setView.
export default function MapRecall({ name }: { name: string }) {
  const map = useMap();
  useEffect(() => {
    const key = `gsv:mapview:${name}`;
    try {
      const s = JSON.parse(localStorage.getItem(key)!);
      map.setView([s.lat, s.lng], s.z, { animate: false });
    } catch {} // no/corrupt entry (or storage blocked) → default view
    const save = () => {
      const c = map.getCenter();
      try {
        localStorage.setItem(key, JSON.stringify({ lat: c.lat, lng: c.lng, z: map.getZoom() }));
      } catch {}
    };
    map.on("moveend", save); // moveend also fires after every zoomend
    return () => void map.off("moveend", save);
  }, [map, name]);
  return null;
}
