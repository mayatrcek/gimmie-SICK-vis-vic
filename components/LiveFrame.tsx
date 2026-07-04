"use client";
import { useEffect, useState } from "react";

// .liveframe iframe with the loading gif overlaid while the embed loads.
// ponytail: cross-origin embeds (Grafana) fire load for the shell before panels
// draw, and inner readiness is unobservable — so hold the gif ~3s past load,
// and drop it after 15s no matter what (blocked embeds show the fallback note).
export default function LiveFrame(props: React.IframeHTMLAttributes<HTMLIFrameElement>) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const safety = setTimeout(() => setLoaded(true), 15000);
    return () => clearTimeout(safety);
  }, []);
  return (
    <div className="liveframe" style={{ position: "relative" }}>
      {!loaded && <div className="maploader loadgif" />}
      <iframe {...props} onLoad={() => setTimeout(() => setLoaded(true), 3000)} />
    </div>
  );
}
