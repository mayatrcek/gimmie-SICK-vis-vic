"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { BBOX, GIBS } from "./gibs";

const ChlorophyllMap = dynamic(() => import("./ChlorophyllMap"), {
  ssr: false,
  loading: () => <div className="pad loadgif" style={{ height: "100%" }} />,
});

// GIBS NOAA-20 lags ~2 days; last 12 available scans.
const DAYS = Array.from({ length: 12 }, (_, i) =>
  new Date(Date.now() - (i + 2) * 864e5).toISOString().slice(0, 10),
);

// One GetMap composites the scan + land mask (later layer draws on top).
const thumb = (day: string) =>
  `${GIBS}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=VIIRS_NOAA20_Chlorophyll_A,OSM_Land_Mask&CRS=EPSG:3857&BBOX=${BBOX}&WIDTH=256&HEIGHT=305&FORMAT=image/png&TRANSPARENT=true&TIME=${day}`;

const fmt = (day: string) =>
  new Date(day).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

// Skeleton shimmer on the thumb until its GIBS image arrives.
function Thumb({ day }: { day: string }) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // cached images can fire load before hydration — catch them here
  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, []);
  return (
    <div className={`f2img chlthumb${loaded ? "" : " chlskel"}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={ref}
        loading="lazy"
        src={thumb(day)}
        alt={`Chlorophyll scan ${fmt(day)}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

const PAGE_SIZE = 6;

export default function ChlorophyllGallery() {
  const [selected, setSelected] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const pages = Math.ceil(DAYS.length / PAGE_SIZE);
  const open = (day: string) => setSelected(day);
  // back to the top so the new page's cards start in view
  const go = (p: number) => {
    setPage(p);
    window.scrollTo(0, 0);
  };
  // no page scroll while the full-screen map is up
  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected]);

  if (selected) {
    return (
      // fixed full-viewport overlay: covers the footer, nav (z 1300) stays on top
      <div className="chlfull">
        <ChlorophyllMap day={selected} />
        {/* overlaid chrome — above leaflet panes/controls (z ~1000) */}
        <div className="chlover">
          <button onClick={() => setSelected(null)}>&lt; Gallery</button>
        </div>
        <span className="chldate">
          {fmt(selected)} &middot; NOAA-20 VIIRS
        </span>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-hd">
        <span className="panel-ttl">CHLOROPHYLL SCANS</span>
      </div>
      <div className="panel-bd flush">
        <div className="desc" style={{ padding: "14px 16px 8px" }}>
          Daily chlorophyll scans from VIIRS (NOAA-20, via NASA GIBS, ~4&nbsp;km) over the last two
          weeks. Greener = more plankton; sparse days are cloud cover, not missing data. Select a
          card to explore that day&apos;s scan.
        </div>
        <div style={{ padding: "8px 16px 16px" }}>
          <div className="fishgrid chlgrid">
            {DAYS.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((day) => (
              <article
                key={day}
                className="fish2 chlcard"
                role="button"
                tabIndex={0}
                onClick={() => open(day)}
                onKeyDown={(e) => e.key === "Enter" && open(day)}
              >
                <Thumb day={day} />
                <h3 className="f2name">{fmt(day)}</h3>
                <p className="f2sci">NOAA-20 &middot; VIIRS</p>
              </article>
            ))}
          </div>
          {/* same OVERWORLD pixel pager as the fish guide */}
          <div className="fgpager">
            <button disabled={page === 0} onClick={() => go(page - 1)}>
              &lt; Prev
            </button>
            {Array.from({ length: pages }, (_, i) => (
              <button key={i} className={i === page ? "cur" : ""} onClick={() => go(i)}>
                {i + 1}
              </button>
            ))}
            <button disabled={page === pages - 1} onClick={() => go(page + 1)}>
              Next &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
