import { MONTH_LBL, SPECIES, SVG, type Species } from "@/lib/data/species";

// Cray season status by calendar date (ported from crayStatus()).
function crayStatus(): { t: string; c: string } {
  const d = new Date();
  const md = (d.getMonth() + 1) * 100 + d.getDate();
  if (md >= 1116 || md <= 531) return { t: "Open · males & females", c: "in" };
  if (md >= 601 && md <= 914) return { t: "Males only · females closed", c: "mid" };
  return { t: "Closed · season shut", c: "off" };
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

// Kingfish SST note. kfSST is only known on the dive-sites page; here it's null,
// so this renders the default "chance of fish" note. ponytail: no cross-page SST wiring.
function KingfishNote({ kfSST = null as number | null }) {
  if (kfSST == null)
    return (
      <div className="fnote" style={{ background: "#eef4f9", borderColor: "#cfe0ee", color: "#1c4a6b" }}>
        Chance of fish wherever water is &gt;16°C. Sighted late May off Pyramid &amp; Seal Rocks.
      </div>
    );
  if (kfSST > 16)
    return (
      <div className="fnote" style={{ background: "#eaf6ee", borderColor: "#cfe8da", color: "#15692f" }}>
        <b>Possible now</b> — Pyramid Rock {kfSST.toFixed(1)}° (&gt;16°). Sighted late May off Pyramid
        &amp; Seal Rocks.
      </div>
    );
  return (
    <div className="fnote">
      Quiet — Pyramid Rock {kfSST.toFixed(1)}° (&lt;16°). They turn up once it nudges past 16°;
      sighted late May off Pyramid &amp; Seal Rocks.
    </div>
  );
}

function FishCard({ s, cur }: { s: Species; cur: number }) {
  let badge;
  if (s.reg) {
    const cstat = crayStatus();
    badge = <span className={`badge ${cstat.c}`}>{cstat.t}</span>;
  } else {
    const on = s.good.includes(cur);
    badge = <span className={`badge ${on ? "in" : "off"}`}>{on ? "In season now" : "Off-peak now"}</span>;
  }
  return (
    <div className="fish">
      <div className="fishtop">
        <div className="ficon" dangerouslySetInnerHTML={{ __html: SVG[s.id] || "" }} />
        <div>
          <div className="fname">{s.name}</div>
          <div className="fsci">{s.sci}</div>
        </div>
        {badge}
      </div>
      <div className="frow">
        <b>Best:</b> {s.peak}
      </div>
      <MonthBar good={s.good} />
      <div className="chips">
        {s.env.map((e) => (
          <span key={e} className="chip2">
            {e}
          </span>
        ))}
      </div>
      <div className="frow">
        <b>Where:</b> {s.spots}
      </div>
      <div className="frow">
        <b>How:</b> {s.tech}
      </div>
      {s.reg && (
        <div className="fnote">
          Rock lobster has a closed season and strict rules — confirm current dates, sizes and bag
          limits with the VFA before taking.
        </div>
      )}
      {s.id === "kingfish" && <KingfishNote />}
    </div>
  );
}

export default function FishCards() {
  const cur = new Date().getMonth() + 1;
  return (
    <div className="fishgrid">
      {SPECIES.map((s) => (
        <FishCard key={s.id} s={s} cur={cur} />
      ))}
    </div>
  );
}
