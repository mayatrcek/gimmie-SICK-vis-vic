import SnaggleInfo from "@/components/SnaggleInfo";

export const metadata = {
  title: "Bathymetry — GIMMIE SICK VIS",
  description: "Seabed shape and depth contours around the Victorian coast and Port Phillip Bay.",
  // Coming-soon stub: keep it out of the index until there is content here.
  // Drop the robots line and re-add the route to app/sitemap.ts when it ships.
  robots: { index: false, follow: false },
};

export default function Bathymetry() {
  return (
    <div className="panel">
      <div className="panel-hd">
        <h1 className="panel-ttl">Bathymetry</h1>
        <span className="panel-meta">Coming soon</span>
        <SnaggleInfo text="Nothing here yet — bathymetry data is on the roadmap. Check back soon." />
      </div>
    </div>
  );
}
