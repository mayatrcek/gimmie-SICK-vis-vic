import SnaggleInfo from "@/components/SnaggleInfo";

export const metadata = {
  title: "Sea surface altimetry — GIMMIE SICK VIS",
  description: "Satellite sea-surface height for Victorian waters, showing eddies and current structure.",
  // Coming-soon stub: keep it out of the index until there is content here.
  // Drop the robots line and re-add the route to app/sitemap.ts when it ships.
  robots: { index: false, follow: false },
};

export default function Altimetry() {
  return (
    <div className="panel">
      <div className="panel-hd">
        <h1 className="panel-ttl">Sea surface altimetry</h1>
        <span className="panel-meta">Coming soon</span>
        <SnaggleInfo text="Nothing here yet — satellite sea-level (altimetry) data is on the roadmap. Check back soon." />
      </div>
    </div>
  );
}
