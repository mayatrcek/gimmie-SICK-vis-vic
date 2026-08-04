"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { coordPopupContent } from "@/lib/coords";
import { pixelDotIcon } from "@/lib/leaflet/icons";

// Click anywhere on the map → pin + OVERWORLD popup with the coordinate and
// a copy button. Drop into maps that don't already have their own click
// handler (SstMap/DepthMap build the coord+copy row into their
// existing click popups/readouts instead).
export default function CoordCopy() {
  const map = useMap();
  const pin = useRef<L.Marker | null>(null);
  useEffect(() => {
    const handler = (e: L.LeafletMouseEvent) => {
      pin.current?.remove();
      pin.current = L.marker(e.latlng, { icon: pixelDotIcon(), keyboard: false }).addTo(map);
      L.popup({ className: "coord-popup", closeButton: false, autoPan: false })
        .setLatLng(e.latlng)
        .setContent(coordPopupContent(e.latlng.lat, e.latlng.lng))
        .openOn(map);
    };
    map.on("click", handler);
    return () => {
      map.off("click", handler);
      pin.current?.remove();
    };
  }, [map]);
  return null;
}
