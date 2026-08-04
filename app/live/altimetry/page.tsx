import SnaggleInfo from "@/components/SnaggleInfo";

export const metadata = { title: "Sea surface altimetry — GIMMIE SICK VIS" };

export default function Altimetry() {
  return (
    <div className="panel">
      <div className="panel-hd">
        <span className="panel-ttl">Sea surface altimetry</span>
        <span className="panel-meta">Coming soon</span>
        <SnaggleInfo text="Nothing here yet — satellite sea-level (altimetry) data is on the roadmap. Check back soon." />
      </div>
    </div>
  );
}
