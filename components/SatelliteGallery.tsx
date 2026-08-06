"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { fmtDataDate } from "@/lib/api/erddap";
import { SATELLITE_LAND_BACKDROP } from "@/lib/api/sentinel";
import SnaggleInfo from "@/components/SnaggleInfo";

const SatelliteMap = dynamic(() => import("./geo/SatelliteMap"), {
  ssr: false,
  loading: () => <div className="pad loadgif" style={{ height: "100%" }} />,
});

type Scene = { id: string; date: string; cloudCover: number | null };

// Skeleton shimmer on the thumb until its Sentinel Hub image arrives.
function Thumb({ date }: { date: string }) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // cached images can fire load before hydration — catch them here
  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, []);
  return (
    <div className={`f2img chlthumb${loaded ? "" : " chlskel"}`}>
      {/* land/sea silhouette behind the scan, showing through swath gaps */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="compmask" loading="lazy" src={SATELLITE_LAND_BACKDROP} alt="" aria-hidden />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={ref}
        loading="lazy"
        className="satdata"
        src={`/api/satellite/thumbnail?date=${date}`}
        alt={`Satellite scan ${fmtDataDate(date)}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

const PAGE_SIZE = 6;

export default function SatelliteGallery() {
  const [scenes, setScenes] = useState<Scene[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetch("/api/satellite/scenes")
      .then((r) => r.json())
      .then((j) => setScenes(j.scenes ?? []))
      .catch(() => setScenes([]));
  }, []);

  const pages = scenes ? Math.ceil(scenes.length / PAGE_SIZE) : 0;

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

  if (!scenes) return <div className="pad loadgif loadgif-lg" />;

  if (selected) {
    return (
      // fixed full-viewport overlay: covers the footer, nav (z 1300) stays on top
      <div className="chlfull satfull">
        <SatelliteMap date={selected} />
        {/* overlaid chrome — above leaflet panes/controls (z ~1000) */}
        <div className="chlover">
          <button onClick={() => setSelected(null)}>&lt; Gallery</button>
        </div>
        <span className="chldate">{fmtDataDate(selected)} &middot; Sentinel-2 true colour</span>
      </div>
    );
  }

  return (
    <>
      <div className="panel">
        <div className="panel-hd">
          <span className="panel-ttl">Satellite imagery</span>
          <SnaggleInfo text="Live scans from Copernicus. You can checkout the visibility on some spots by looking for patches of reef (dark spots) over shallow water." />
        </div>
        <div className="panel-bd flush">
          <div style={{ padding: "8px 16px 16px" }}>
            {scenes.length === 0 ? (
              <p className="desc">No scans in the last 30 days — check back soon.</p>
            ) : (
              <div className="fishgrid chlgrid">
                {scenes.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((scene) => (
                  <article
                    key={scene.id}
                    className="fish2 chlcard"
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelected(scene.date)}
                    onKeyDown={(e) => e.key === "Enter" && setSelected(scene.date)}
                  >
                    <Thumb date={scene.date} />
                    <h3 className="f2name">{fmtDataDate(scene.date)}</h3>
                    <p className="f2sci">
                      Sentinel-2{scene.cloudCover != null ? ` · ${Math.round(scene.cloudCover)}% cloud` : ""}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
          <div className="foot">
            <span>
              Copernicus Sentinel-2 &middot; latest:{" "}
              <span>{scenes.length ? fmtDataDate(scenes[0].date) : "unavailable"}</span>
            </span>
            <a href="https://browser.dataspace.copernicus.eu/" target="_blank" rel="noopener">
              Open data &#8599;
            </a>
          </div>
        </div>
      </div>
      {/* same OVERWORLD pixel pager as the fish guide — outside the panel */}
      {scenes.length > 0 && (
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
      )}
    </>
  );
}
