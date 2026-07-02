"use client";

import dynamic from "next/dynamic";

const ChlorophyllMap = dynamic(() => import("./ChlorophyllMap"), {
  ssr: false,
  loading: () => <div className="pad loadgif" style={{ height: 420 }} />,
});

export default function ChlorophyllClient() {
  return <ChlorophyllMap />;
}
