"use client";

import dynamic from "next/dynamic";

const DepthMap = dynamic(() => import("./DepthMap"), {
  ssr: false,
  loading: () => <div className="pad loadgif" style={{ minHeight: 560 }} />,
});

export default function DepthClient() {
  return <DepthMap />;
}
