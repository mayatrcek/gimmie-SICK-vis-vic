"use client";

import dynamic from "next/dynamic";

const WindMap = dynamic(() => import("./WindMap"), {
  ssr: false,
  loading: () => <div className="pad loadgif">Loading wind map…</div>,
});

export default function WindMapClient() {
  return <WindMap />;
}
