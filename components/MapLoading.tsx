"use client";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "@/lib/leaflet/wheelWhileDrag";

// Drop inside a MapContainer: overlays the loading gif on the map until the
// first tile layer finishes loading (same look as the chlorophyll maploader).
export default function MapLoading() {
  const map = useMap();
  useEffect(() => {
    const el = document.createElement("div");
    el.className = "maploader loadgif";
    map.getContainer().appendChild(el);
    let pending = 0;
    const done = () => {
      el.remove();
      map.off("layeradd", onAdd);
      clearTimeout(safety);
    };
    const dec = () => {
      if (--pending <= 0) done();
    };
    const arm = (lyr: L.Layer) => {
      // invisible layers (e.g. the wind map's opacity-0 land mask) don't gate visual readiness
      if (lyr instanceof L.TileLayer && (lyr.options.opacity ?? 1) > 0) {
        pending++;
        lyr.once("load", dec);
      }
    };
    const onAdd = (e: L.LayerEvent) => arm(e.layer);
    // ponytail: hide anyway after 15s so a dead tile server can't wedge the gif
    const safety = setTimeout(done, 15000);
    map.eachLayer(arm);
    map.on("layeradd", onAdd);
    return done;
  }, [map]);
  return null;
}
