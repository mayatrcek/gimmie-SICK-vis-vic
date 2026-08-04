"use client";

import { useEffect, useState } from "react";
import LiveFrame from "@/components/LiveFrame";

const DASH =
  "https://portweather-public.omcinternational.com/d/f28ef6a7-b2b9-4906-82b2-d48264b69f35/point-nepean";

const NOTE_TEXT =
  "Open full dashboard ↗ · Live from the Point Nepean wave buoy (Ports Victoria / OMC International). If the panel below is blank, their site’s refusing to embed — use the link instead.";

// Slow typewriter reveal, left-to-right.
function useReveal(text: string, active: boolean) {
  const [reveal, setReveal] = useState(0);
  useEffect(() => {
    if (!active) {
      setReveal(0);
      return;
    }
    const id = setInterval(() => {
      setReveal((r) => {
        if (r >= text.length) {
          clearInterval(id);
          return r;
        }
        return r + 3;
      });
    }, 30);
    return () => clearInterval(id);
  }, [active, text]);
  return { out: text.slice(0, reveal), done: reveal >= text.length };
}

export default function NepeanClient() {
  const [showInfo, setShowInfo] = useState(false);
  const { out, done } = useReveal(NOTE_TEXT, showInfo);
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
          <div className="snaggle-note">
            {done ? (
              <>
                <a href={DASH} target="_blank" rel="noopener">
                  Open full dashboard &#8599;
                </a>{" "}
                &middot; Live from the Point Nepean wave buoy (Ports Victoria / OMC International).
                If the panel below is blank, their site&rsquo;s refusing to embed — use the link
                instead.
              </>
            ) : (
              <span aria-hidden="true">{out}</span>
            )}
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
