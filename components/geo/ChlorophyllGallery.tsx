"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { BBOX, GIBS, SATS, type Sat } from "./gibs";

const ChlorophyllMap = dynamic(() => import("./ChlorophyllMap"), {
  ssr: false,
  loading: () => <div className="pad loadgif" style={{ height: "100%" }} />,
});

// Last 12 scans per satellite, starting `lag` days back (each publishes on its
// own delay), merged into one list: newest day first, satellites in SATS order.
const days = (lag: number) =>
  Array.from({ length: 12 }, (_, i) =>
    new Date(Date.now() - (i + lag) * 864e5).toISOString().slice(0, 10),
  );
const SCANS = SATS.flatMap((sat) => days(sat.lag).map((day) => ({ day, sat })))
  .sort((a, b) => b.day.localeCompare(a.day)); // stable: keeps SATS order within a day

// One GetMap composites the scan + land mask (later layer draws on top).
const thumb = (day: string, layer: string) =>
  `${GIBS}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=${layer},OSM_Land_Mask&CRS=EPSG:3857&BBOX=${BBOX}&WIDTH=256&HEIGHT=305&FORMAT=image/png&TRANSPARENT=true&TIME=${day}`;

const fmt = (day: string) =>
  new Date(day).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

// Skeleton shimmer on the thumb until its GIBS image arrives.
function Thumb({ day, layer }: { day: string; layer: string }) {
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
        src={thumb(day, layer)}
        alt={`Chlorophyll scan ${fmt(day)}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

const PAGE_SIZE = 6;

type Scan = { day: string; sat: Sat };

export default function ChlorophyllGallery() {
  const [selected, setSelected] = useState<Scan | null>(null);
  const [page, setPage] = useState(0);
  const pages = Math.ceil(SCANS.length / PAGE_SIZE);
  const open = (scan: Scan) => setSelected(scan);
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
        <ChlorophyllMap day={selected.day} layer={selected.sat.layer} />
        {/* overlaid chrome — above leaflet panes/controls (z ~1000) */}
        <div className="chlover">
          <button onClick={() => setSelected(null)}>&lt; Gallery</button>
        </div>
        <span className="chldate">
          {fmt(selected.day)} &middot; {selected.sat.label} VIIRS
        </span>
      </div>
    );
  }

  return (
    <>
    <div className="panel">
      <div className="panel-hd">
        <span className="panel-ttl">Chlorophyll scans</span>
      </div>
      <div className="panel-bd flush">
        <div className="desc" style={{ padding: "14px 16px 8px" }}>
            Daily chlorophyll scans from three satellites — NOAA-20, NOAA-21 and Suomi NPP (VIIRS
            via NASA GIBS, ~4&nbsp;km). Greener means more plankton. Blank patches are just cloud,
            and each satellite misses different bits — flick between them if your day&apos;s empty.
            Tap a card to explore that day&apos;s scan.
          </div>
          {/* one-time satellite legend — sticker badge + main difference, from SATS */}
          <div className="chllegend">
            {SATS.map((s, i) => (
              <span key={s.id} className="chlleg">
                <span className={`chlbadge chlbadge-${i}`}>{s.label}</span> {s.note}
              </span>
            ))}
          </div>
        <div style={{ padding: "8px 16px 16px" }}>
          <div className="fishgrid chlgrid">
            {SCANS.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((scan) => (
              <article
                key={`${scan.sat.id}-${scan.day}`}
                className="fish2 chlcard"
                role="button"
                tabIndex={0}
                onClick={() => open(scan)}
                onKeyDown={(e) => e.key === "Enter" && open(scan)}
              >
                <Thumb day={scan.day} layer={scan.sat.layer} />
                <h3 className="f2name">{fmt(scan.day)}</h3>
                <p className="f2sci">{scan.sat.label} &middot; VIIRS</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
    {/* same OVERWORLD pixel pager as the fish guide — outside the panel */}
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
    </>
  );
}
