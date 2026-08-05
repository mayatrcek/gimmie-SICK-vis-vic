import SnaggleInfo from "@/components/SnaggleInfo";

export const metadata = {
  title: "Salinity — GIMMIE SICK VIS",
  description: "Sea-surface salinity across the Victorian coast — a marker for freshwater runoff after rain.",
};

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
