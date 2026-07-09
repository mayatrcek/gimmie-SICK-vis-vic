"use client";

import { useEffect, useState } from "react";
import { fmtDataDate, graphLink, sstLegendURL, sstURL } from "@/lib/api/erddap";

export default function SstView() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [date, setDate] = useState("…");
  const [stretch, setStretch] = useState<{ min?: number; max?: number } | null>(null);

  useEffect(() => {
    fetch("/api/timestamp?ds=jplMURSST41")
      .then((r) => r.json())
      .then((j) => setDate(fmtDataDate(j.time)))
      .catch(() => setDate("unavailable"));

    fetch("/api/sst-mean")
      .then((r) => r.json())
      .then((j) => {
        const mean = j.mean != null ? Math.round(j.mean * 10) / 10 : null;
        setStretch(mean != null ? { min: mean - 1, max: mean + 1 } : {});
      })
      .catch(() => setStretch({}));
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
        {stretch && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            id="sst"
            alt="SST map"
            src={sstURL(stretch)}
            style={{ display: status === "ok" ? "block" : "none" }}
            onLoad={() => setStatus("ok")}
            onError={() => setStatus("error")}
          />
        )}
      </div>
      {stretch && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="sstlegend" alt="SST colour scale" src={sstLegendURL(stretch)} />
      )}
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
