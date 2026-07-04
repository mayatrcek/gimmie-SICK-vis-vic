"use client";

import { useEffect, useState } from "react";
import { fmtDataDate, graphLink, sstLegendURL, sstURL } from "@/lib/api/erddap";

// ponytail: standalone SST page has no dive-spot SST average, so no ±1°C local
// stretch — the default auto colour bar is used (sstURL()/sstLegendURL() with no min/max).
export default function SstView() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [date, setDate] = useState("…");

  useEffect(() => {
    fetch("/api/timestamp?ds=jplMURSST41")
      .then((r) => r.json())
      .then((j) => setDate(fmtDataDate(j.time)))
      .catch(() => setDate("unavailable"));
  }, []);

  return (
    <>
      <div className="desc">
        MUR SST (NASA JPL, ~1&nbsp;km), colour-stretched so small temperature breaks pop.
      </div>
      <div className="imgbox">
        {status !== "ok" && (
          <div className={`ph${status === "loading" ? " loadgif loadgif-lg" : ""}`}>
            {status === "error" && "Could not load this layer — try again later."}
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          id="sst"
          alt="SST map"
          src={sstURL()}
          style={{ display: status === "ok" ? "block" : "none" }}
          onLoad={() => setStatus("ok")}
          onError={() => setStatus("error")}
        />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="sstlegend" alt="SST colour scale" src={sstLegendURL()} />
      <div className="foot">
        <span>
          NASA JPL MUR &middot; data: <span>{date}</span>
        </span>
        <a href={graphLink("jplMURSST41")} target="_blank" rel="noopener">
          Open data &#8599;
        </a>
      </div>
    </>
  );
}
