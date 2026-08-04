"use client";

import { useState } from "react";
import LiveFrame from "@/components/LiveFrame";

const DASH =
  "https://portweather-public.omcinternational.com/d/f28ef6a7-b2b9-4906-82b2-d48264b69f35/point-nepean";

export default function NepeanClient() {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <div className="panel">
      <div className="panel-hd">
        <span className="panel-ttl">Point Nepean — live waves</span>
        <span className="panel-meta">Ports Victoria / OMC</span>
        <button
          type="button"
          className="snaggle-info-btn"
          aria-expanded={showInfo}
          aria-label={showInfo ? "Hide info" : "Show info"}
          onClick={() => setShowInfo((v) => !v)}
        >
          <img src="/assets/brand/Snaggletooth Hover.gif" alt="" />
        </button>
      </div>
      <div className="panel-bd">
        {showInfo && (
          <div className="desc" style={{ padding: "0 0 8px" }}>
            <a href={DASH} target="_blank" rel="noopener">
              Open full dashboard &#8599;
            </a>{" "}
            &middot; Live from the Point Nepean wave buoy (Ports Victoria / OMC International). If the
            panel below is blank, their site&rsquo;s refusing to embed — use the link instead.
          </div>
        )}
        <LiveFrame
          src={`${DASH}?kiosk&theme=light`}
          loading="lazy"
          referrerPolicy="no-referrer"
          title="Point Nepean live wave data"
        />
      </div>
    </div>
  );
}
