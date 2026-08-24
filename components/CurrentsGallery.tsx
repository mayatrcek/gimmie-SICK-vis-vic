"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useEffect } from "react";
import { fmtDataDate } from "@/lib/api/erddap";
import { CMEMS_PRODUCT_URL, curSpeedURL, curThumbURL, latestCurDay } from "@/lib/api/cmems";
import { THUMB_LAND } from "@/components/geo/gibs";
import SnaggleInfo from "@/components/SnaggleInfo";

const CurrentsMap = dynamic(() => import("./geo/CurrentsMap"), {
  ssr: false,
  loading: () => <div className="pad loadgif" style={{ height: "100%" }} />,
});

// Skeleton shimmer on the thumb until its currents image arrives.
function Thumb({ day }: { day: string }) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // cached images can fire load before hydration — catch them here
  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, []);
  return (
    <div className={`f2img chlthumb${loaded ? "" : " chlskel"}`}>
      {/* stacked: speed gradient under the arrows, land mask on top — all
          .thumbland (absolute inset-0) so paint order follows DOM order */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="thumbland" loading="lazy" src={curSpeedURL(day, "card")} alt="" aria-hidden />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={ref}
        className="thumbland"
        loading="lazy"
        src={curThumbURL(day)}
        alt={`Surface currents ${fmtDataDate(day)}`}
        onLoad={() => setLoaded(true)}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="compmask thumbland" loading="lazy" src={THUMB_LAND} alt="" aria-hidden />
    </div>
  );
}

const PAGE_SIZE = 6;

export default function CurrentsGallery() {
  const [selected, setSelected] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  // No live "latest available time" metadata exists for CMEMS (unlike
  // ERDDAP) — the product publishes on a known ~1 day lag, so anchor the
  // 12-day window on that fixed lag instead of a live check.
  const latest = latestCurDay();

  // 12 days newest-first from the latest grid.
  const days = Array.from({ length: 12 }, (_, i) =>
    new Date(Date.parse(latest) - i * 864e5).toISOString().slice(0, 10),
  );
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

  if (selected) {
    return (
      // fixed full-viewport overlay: covers the footer, nav (z 1300) stays on top
      <div className="chlfull sstfull">
        <CurrentsMap day={selected} />
        {/* overlaid chrome — above leaflet panes/controls (z ~1000) */}
        <div className="chlover">
          <button onClick={() => setSelected(null)}>&lt; Gallery</button>
        </div>
        <span className="chldate">{fmtDataDate(selected)} &middot; Copernicus Marine forecast</span>
      </div>
    );
  }

  return (
    <>
      <div className="panel">
        <div className="panel-hd">
          <h1 className="panel-ttl">Surface current scans</h1>
          <SnaggleInfo text="Large scale currents, good for tracking down pelagics." />
        </div>
        <div className="panel-bd flush">
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
                  <Thumb day={day} />
                  <h3 className="f2name">{fmtDataDate(day)}</h3>
                  <p className="f2sci">Copernicus Marine &middot; 9 km</p>
                </article>
              ))}
            </div>
          </div>
          <div className="foot">
            <span>
              Copernicus Marine forecast &middot; latest: <span>{fmtDataDate(latest)}</span>
            </span>
            <a href={CMEMS_PRODUCT_URL} target="_blank" rel="noopener">
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
