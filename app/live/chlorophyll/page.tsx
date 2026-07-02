import ChlorophyllClient from "@/components/geo/ChlorophyllClient";

export const metadata = { title: "Chlorophyll — DIVEBYTE" };

export default function Chlorophyll() {
  const latest = new Date(Date.now() - 2 * 864e5).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return (
    <div className="panel">
      <div className="panel-hd">
        <span className="dot" style={{ background: "var(--green)" }} />
        <span className="panel-ttl">Chlorophyll composite</span>
        <span className="panel-meta">NOAA VIIRS &middot; ~4&nbsp;km</span>
      </div>
      <div className="panel-bd flush">
        <div className="desc" style={{ padding: "14px 16px 8px" }}>
          Recent chlorophyll from VIIRS (NOAA-20, via NASA GIBS, ~4&nbsp;km), with the last few days
          blended to fill cloud gaps. Greener = more plankton. &middot; <b>Latest day:</b> to {latest}
        </div>
        <ChlorophyllClient />
      </div>
    </div>
  );
}
