"use client";

import dynamic from "next/dynamic";

const HabitatMap = dynamic(() => import("./HabitatMap"), {
  ssr: false,
  loading: () => <div className="pad loadgif" style={{ flex: 1, minHeight: 560 }} />,
});

export default function HabitatClient() {
  return <HabitatMap />;
}
