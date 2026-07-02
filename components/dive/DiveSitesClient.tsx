"use client";

import dynamic from "next/dynamic";

// Leaflet touches window, so this must never SSR.
const DiveSites = dynamic(() => import("./DiveSites"), {
  ssr: false,
  loading: () => <div className="pad loadgif">Loading map…</div>,
});

export default function DiveSitesClient() {
  return <DiveSites />;
}
