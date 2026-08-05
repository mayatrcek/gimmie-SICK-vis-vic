import SnaggleInfo from "@/components/SnaggleInfo";

export const metadata = {
  title: "Bathymetry — GIMMIE SICK VIS",
  description: "Seabed shape and depth contours around the Victorian coast and Port Phillip Bay.",
};

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
