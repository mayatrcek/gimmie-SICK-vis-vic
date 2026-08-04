import SnaggleInfo from "@/components/SnaggleInfo";

export const metadata = { title: "Bathymetry — GIMMIE SICK VIS" };

export default function Bathymetry() {
  return (
    <div className="panel">
      <div className="panel-hd">
        <span className="panel-ttl">Bathymetry</span>
        <span className="panel-meta">Coming soon</span>
        <SnaggleInfo text="Nothing here yet — bathymetry data is on the roadmap. Check back soon." />
      </div>
    </div>
  );
}
