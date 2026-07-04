"use client";
import { useState } from "react";
import { MONTH_LBL, SPECIES, SVG, type Species } from "@/lib/data/species";

// Pixel sprite PNGs where drawn so far; species without one fall back to the inline SVG.
const SPRITE: Record<string, string> = {
  snapper: "/assets/fih_sprites/snapper-cartoon-64.png",
  kingfish: "/assets/fih_sprites/kingfish-cartoon-64.png",
  trevally: "/assets/fih_sprites/trevally-cartoon-64.png",
  boarfish: "/assets/fih_sprites/boarfish-cartoon-64.png",
  tuna: "/assets/fih_sprites/tuna-cartoon-64.png",
  flathead: "/assets/fih_sprites/flathead-cartoon-64.png",
  cray: "/assets/fih_sprites/crayfish-cartoon-64.png",
};

const PAGE_SIZE = 6;

// Cray season badge by calendar date (ported from crayStatus()).
function crayStatus(): { t: string; c: string } {
  const d = new Date();
  const md = (d.getMonth() + 1) * 100 + d.getDate();
  if (md >= 1116 || md <= 531) return { t: "Open", c: "in" };
  if (md >= 601 && md <= 914) return { t: "Males only", c: "mid" };
  return { t: "Closed", c: "off" };
}

function MonthBar({ good }: { good: number[] }) {
  return (
    <div className="mbar">
      {MONTH_LBL.map((m, i) => (
        <span key={i} className={good.includes(i + 1) ? "on" : ""}>
          {m}
        </span>
      ))}
    </div>
  );
}

function FishCard({ s, cur }: { s: Species; cur: number }) {
  const badge = s.reg
    ? crayStatus()
    : s.good.includes(cur)
      ? { t: "In Season", c: "in" }
      : { t: "Off-peak", c: "off" };
  return (
    <article className="fish2">
      <span className={`f2badge ${badge.c}`}>{badge.t}</span>
      <div className="f2img">
        {SPRITE[s.id] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="f2sprite" src={SPRITE[s.id]} alt={s.name} />
        ) : (
          <div className="f2svg" dangerouslySetInnerHTML={{ __html: SVG[s.id] || "" }} />
        )}
      </div>
      <h3 className="f2name">{s.name}</h3>
      <p className="f2sci">{s.sci}</p>
      <div className="f2row">
        <span className="material-symbols-outlined">calendar_today</span>
        {s.peak}
      </div>
      <div className="f2row hab">
        <span className="material-symbols-outlined">map</span>
        {s.env.join(" / ")}
      </div>
      <MonthBar good={s.good} />
    </article>
  );
}

export default function FishCards() {
  const cur = new Date().getMonth() + 1;
  const [page, setPage] = useState(0);
  const pages = Math.ceil(SPECIES.length / PAGE_SIZE);
  return (
    <>
      <div className="fishgrid">
        {SPECIES.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((s) => (
          <FishCard key={s.id} s={s} cur={cur} />
        ))}
      </div>
      <div className="fgpager">
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>
          &lt; Prev
        </button>
        {Array.from({ length: pages }, (_, i) => (
          <button key={i} className={i === page ? "cur" : ""} onClick={() => setPage(i)}>
            {i + 1}
          </button>
        ))}
        <button disabled={page === pages - 1} onClick={() => setPage(page + 1)}>
          Next &gt;
        </button>
      </div>
    </>
  );
}
