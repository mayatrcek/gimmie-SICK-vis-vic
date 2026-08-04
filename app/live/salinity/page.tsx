import SnaggleInfo from "@/components/SnaggleInfo";

export const metadata = { title: "Salinity — GIMMIE SICK VIS" };

export default function Salinity() {
  return (
    <div className="panel">
      <div className="panel-hd">
        <span className="panel-ttl">Salinity</span>
        <span className="panel-meta">Coming soon</span>
        <SnaggleInfo text="Nothing here yet — ocean salinity data is on the roadmap. Check back soon." />
      </div>
    </div>
  );
}
