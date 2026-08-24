import SnaggleInfo from "@/components/SnaggleInfo";

export const metadata = {
  title: "Salinity — GIMMIE SICK VIS",
  description: "Sea-surface salinity across the Victorian coast — a marker for freshwater runoff after rain.",
  // Coming-soon stub: keep it out of the index until there is content here.
  // Drop the robots line and re-add the route to app/sitemap.ts when it ships.
  robots: { index: false, follow: false },
};

export default function Salinity() {
  return (
    <div className="panel">
      <div className="panel-hd">
        <h1 className="panel-ttl">Salinity</h1>
        <span className="panel-meta">Coming soon</span>
        <SnaggleInfo text="Nothing here yet — ocean salinity data is on the roadmap. Check back soon." />
      </div>
    </div>
  );
}
