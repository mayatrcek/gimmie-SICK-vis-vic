"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { fmtDataDate, graphLink, sstThumbSrc } from "@/lib/api/erddap";
import { THUMB_LAND } from "@/components/geo/gibs";
import SstScale from "@/components/SstScale";
import SnaggleInfo from "@/components/SnaggleInfo";

const SstMap = dynamic(() => import("./geo/SstMap"), {
  ssr: false,
  loading: () => <div className="pad loadgif" style={{ height: "100%" }} />,
});

type Stretch = { min?: number; max?: number };

// Skeleton shimmer on the thumb until its ERDDAP image arrives.
function Thumb({ day, stretch, flagged }: { day: string; stretch: Stretch; flagged?: boolean }) {
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
        src={sstThumbSrc(stretch, day)}
        alt={`SST scan ${fmtDataDate(day)}`}
        onLoad={() => setLoaded(true)}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="compmask thumbland" loading="lazy" src={THUMB_LAND} alt="" aria-hidden />
      {flagged && (
        <span className="chlbadge chlflag" title="Flagged scan" aria-label="Flagged scan">
          !
        </span>
      )}
    </div>
  );
}

const PAGE_SIZE = 6;

// Everything arrives as props from the server page (app/live/sst/page.tsx),
// which reads it once per NOAA publish and caches it.
export default function SstGallery({
  latest,
  days,
  times,
  bad,
  stretch,
}: {
  latest: string; // latest published grid time
  days: string[]; // 12 days newest-first, anchored on latest
  times: Record<string, string>; // median measurement time per day ("1:14 am")
  bad: string[]; // days that failed the out-of-family check (see sstDaysFromCsv)
  stretch: Stretch; // latest good day's colour stretch, reused for all 12 days
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const pages = Math.ceil(days.length / PAGE_SIZE);

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

  const header = (
    <div className="panel-hd">
      <h1 className="panel-ttl">Sea temperature scans</h1>
      <SnaggleInfo text="Sea surface temps are good for tracking seasonal fish and finding those temperature breaks. And also if you’re just curious about the water temp haha. You can select a point and copy coordinates if you’re planning a trip offshore." />
    </div>
  );

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
          {bad.includes(selected) ? " · flagged scan" : ""}
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="panel">
        {header}
        <div className="panel-bd flush">
          <div style={{ padding: "8px 16px 16px" }}>
            <div className="fishgrid chlgrid">
              {days.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((day) => (
                <article
                  key={day}
                  className={`fish2 chlcard${bad.includes(day) ? " chlbad" : ""}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelected(day)}
                  onKeyDown={(e) => e.key === "Enter" && setSelected(day)}
                >
                  <Thumb day={day} stretch={stretch} flagged={bad.includes(day)} />
                  <h3 className="f2name">{fmtDataDate(day)}</h3>
                  <p className="f2sci">
                    NOAA ACSPO &middot; 2 km{times[day] ? ` · ${times[day]}` : ""}
                    {bad.includes(day) ? " · flagged scan" : ""}
                  </p>
                </article>
              ))}
            </div>
          </div>
          <div className="foot">
            <span>
              NOAA ACSPO &middot; latest: <span>{fmtDataDate(latest)}</span>
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
