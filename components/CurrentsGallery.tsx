"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { CUR_DS, curThumbURL, fmtDataDate, graphLink } from "@/lib/api/erddap";
import { THUMB_LAND } from "@/components/geo/gibs";

const CurrentsMap = dynamic(() => import("./geo/CurrentsMap"), {
  ssr: false,
  loading: () => <div className="pad loadgif" style={{ height: "100%" }} />,
});

// Skeleton shimmer on the thumb until its ERDDAP image arrives.
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
      <img className="thumbland" loading="lazy" src={`/api/cur-speed?day=${day}`} alt="" aria-hidden />
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
  // Latest available grid time — anchors the 12-day window so the newest
  // card is never an unpublished (broken) day. undefined = still loading.
  const [latest, setLatest] = useState<string | undefined>(undefined);
  // if the timestamp query fails: 2 days behind now, past the publication lag
  const fallback = () => new Date(Date.now() - 2 * 864e5).toISOString();

  useEffect(() => {
    fetch(`/api/timestamp?ds=${CUR_DS}`)
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

  if (!days) return null;

  if (selected) {
    return (
      // fixed full-viewport overlay: covers the footer, nav (z 1300) stays on top
      <div className="chlfull sstfull">
        <CurrentsMap day={selected} />
        {/* overlaid chrome — above leaflet panes/controls (z ~1000) */}
        <div className="chlover">
          <button onClick={() => setSelected(null)}>&lt; Gallery</button>
        </div>
        <span className="chldate">{fmtDataDate(selected)} &middot; NOAA altimetry blend</span>
      </div>
    );
  }

  return (
    <>
      <div className="panel">
        <div className="panel-hd">
          <span className="panel-ttl">Surface current scans</span>
        </div>
        <div className="panel-bd flush">
          <div className="desc" style={{ padding: "14px 16px 8px" }}>
            Open-ocean surface currents from satellite altimetry (NOAA blend, ~25&nbsp;km) for
            the last 12 days. Arrows point where the water&apos;s going — longer means faster.
            This shows the big movers (East Australian Current, Tasman eddies, Bass Strait
            through-flow), not local tidal streams: for those check the tide graph on the
            forecast page. Tap a card to explore that day.
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
                  <Thumb day={day} />
                  <h3 className="f2name">{fmtDataDate(day)}</h3>
                  <p className="f2sci">NOAA altimetry &middot; 25 km</p>
                </article>
              ))}
            </div>
          </div>
          <div className="foot">
            <span>
              NOAA altimetry blend &middot; latest: <span>{fmtDataDate(latest ?? null)}</span>
            </span>
            <a href={graphLink(CUR_DS)} target="_blank" rel="noopener">
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
