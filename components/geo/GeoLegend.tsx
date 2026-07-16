"use client";

import { useState } from "react";
import { GEO_GROUPS } from "@/lib/data/geoGroups";

const FULL_LEGEND =
  "https://geoserver.imas.utas.edu.au/geoserver/seamap/wms?service=WMS&version=1.1.1&request=GetLegendGraphic&format=image%2Fpng&transparent=true&layer=SeamapAus_National_Benthic_Habitat_Layer&legend_options=fontSize:11;fontColor:0x444444;dpi:96";

export default function GeoLegend() {
  const [full, setFull] = useState(false);
  return (
    <div id="geolegend">
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
        The seabed, decoded
      </div>
      {GEO_GROUPS.map((g) => (
        <div key={g.name} style={{ display: "flex", gap: 8, margin: "8px 0" }}>
          <span style={{ width: 16, height: 16, borderRadius: 4, background: g.col, border: "1px solid rgba(0,0,0,.15)", flex: "0 0 16px", marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{g.name}</div>
            <div style={{ fontSize: 11.5, color: "var(--muted)", lineHeight: 1.35 }}>{g.desc}</div>
          </div>
        </div>
      ))}
      <div style={{ fontSize: 11, color: "var(--muted)", margin: "8px 0", lineHeight: 1.4 }}>
        Simplified from{" "}
        <a href="https://seamapaustralia.org/" target="_blank" rel="noopener">
          Seamap Australia
        </a>
        . Map colours show finer detail.
      </div>
      <button
        onClick={() => setFull((v) => !v)}
        style={{ font: "inherit", fontSize: 12, background: "none", border: "1px solid var(--line)", borderRadius: 8, padding: "6px 10px", color: "var(--accent)", cursor: "pointer" }}
      >
        {full ? "Hide full Seamap classes" : "Show full Seamap classes"}
      </button>
      {full && (
        <div style={{ marginTop: 8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={FULL_LEGEND} alt="Seamap habitat classes" style={{ maxWidth: "100%", background: "#fff", border: "1px solid var(--line)", borderRadius: 8, padding: 6 }} />
        </div>
      )}
    </div>
  );
}
