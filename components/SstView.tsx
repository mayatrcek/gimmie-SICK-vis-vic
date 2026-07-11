"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { fmtDataDate, graphLink, sstLegendURL } from "@/lib/api/erddap";

const SstMap = dynamic(() => import("./geo/SstMap"), {
  ssr: false,
  loading: () => <div className="pad loadgif" style={{ height: "min(72vh, 560px)" }} />,
});

export default function SstView() {
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
        Pan/zoom to explore; the overlay is today&apos;s analysed temperature.
      </div>
      {stretch && <SstMap stretch={stretch} />}
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
