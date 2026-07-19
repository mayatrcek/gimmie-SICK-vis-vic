"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { fmtDataDate, graphLink, SST_DS, sstThumbURL } from "@/lib/api/erddap";
import { BBOX, GIBS } from "@/components/geo/gibs";
import SstScale from "@/components/SstScale";

const SstMap = dynamic(() => import("./geo/SstMap"), {
  ssr: false,
  loading: () => <div className="pad loadgif" style={{ height: "100%" }} />,
});

type Stretch = { min?: number; max?: number };

// Cream land mask over the thumb — same GIBS layer and bbox the chlorophyll
// cards composite in, so both galleries' cards share one frame.
const THUMB_LAND =
  `${GIBS}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=OSM_Land_Mask&CRS=EPSG:3857` +
  `&BBOX=${BBOX}&WIDTH=256&HEIGHT=305&FORMAT=image/png&TRANSPARENT=true`;

// Skeleton shimmer on the thumb until its ERDDAP image arrives.
function Thumb({ day, stretch }: { day: string; stretch: Stretch }) {
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
        src={sstThumbURL(stretch, day)}
        alt={`SST scan ${fmtDataDate(day)}`}
        onLoad={() => setLoaded(true)}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="compmask thumbland" loading="lazy" src={THUMB_LAND} alt="" aria-hidden />
    </div>
  );
}

const PAGE_SIZE = 6;

export default function SstGallery() {
  const [selected, setSelected] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  // ponytail: latest day's colour stretch reused for all 12 days; per-day
  // stretches via /api/sst-stretch?day= if the drift ever clips older days
  const [stretch, setStretch] = useState<Stretch | null>(null);
  // Latest available grid time — anchors the 12-day window so the newest
  // card is never an unpublished (broken) day. undefined = still loading.
  const [latest, setLatest] = useState<string | undefined>(undefined);
  // Median measurement time per day ("1:14 am"), keyed by day; {} until loaded
  const [times, setTimes] = useState<Record<string, string>>({});
  // if the timestamp query fails: 2 days behind now, past the ~1-day publication lag
  const fallback = () => new Date(Date.now() - 2 * 864e5).toISOString();

  useEffect(() => {
    fetch("/api/sst-stretch")
      .then((r) => r.json())
      .then((j) => setStretch(j.min != null && j.max != null ? j : {}))
      .catch(() => setStretch({}));

    fetch("/api/sst-times")
      .then((r) => r.json())
      .then((j) => setTimes(j.times ?? {}))
      .catch(() => {});

    fetch(`/api/timestamp?ds=${SST_DS}`)
      .then((r) => r.json())
      .then((j) => setLatest(j.time ?? fallback()))
      .catch(() => setLatest(fallback()));
  }, []);

  // 12 days newest-first from the latest grid.
  const days = latest
    ? Array.from({ length: 12 }, (_, i) =>
        new Date(Date.parse(latest) - i * 864e5).toISOString().slice(0, 10),
      )
    : null;
  const pages = days ? Math.ceil(days.length / PAGE_SIZE) : 0;

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

  if (!stretch || !days) return null;

  if (selected) {
    return (
      // fixed full-viewport overlay: covers the footer, nav (z 1300) stays on top
      <div className="chlfull sstfull">
        <SstMap stretch={stretch} day={selected} />
        {/* overlaid chrome — above leaflet panes/controls (z ~1000) */}
        <div className="chlover">
          <button onClick={() => setSelected(null)}>&lt; Gallery</button>
        </div>
        {stretch.min != null && stretch.max != null && (
          <div className="sstscale-float">
            <SstScale min={stretch.min} max={stretch.max} />
          </div>
        )}
        <span className="chldate">
          {fmtDataDate(selected)} &middot; NOAA ACSPO{times[selected] ? ` · ${times[selected]}` : ""}
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="panel">
        <div className="panel-hd">
          <span className="panel-ttl">Sea temperature scans</span>
        </div>
        <div className="panel-bd flush">
          <div className="desc" style={{ padding: "14px 16px 8px" }}>
            Sea temperature straight off the satellite (NOAA ACSPO, ~2&nbsp;km) for the last
            12 days. It&apos;s actual readings, not a smoothed model, so the temperature fronts
            stay sharp — blank patches were under cloud. Tap a card to explore that day&apos;s
            scan; the white dots are detected thermal fronts.
          </div>
          <div style={{ padding: "8px 16px 16px" }}>
            <div className="fishgrid chlgrid">
              {days.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((day) => (
                <article
                  key={day}
                  className="fish2 chlcard"
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelected(day)}
                  onKeyDown={(e) => e.key === "Enter" && setSelected(day)}
                >
                  <Thumb day={day} stretch={stretch} />
                  <h3 className="f2name">{fmtDataDate(day)}</h3>
                  <p className="f2sci">NOAA ACSPO &middot; 2 km{times[day] ? ` · ${times[day]}` : ""}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="foot">
            <span>
              NOAA ACSPO &middot; latest: <span>{fmtDataDate(latest ?? null)}</span>
            </span>
            <a href={graphLink()} target="_blank" rel="noopener">
              Open data &#8599;
            </a>
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
