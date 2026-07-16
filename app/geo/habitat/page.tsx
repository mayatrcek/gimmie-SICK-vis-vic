import HabitatClient from "@/components/geo/HabitatClient";
import GeoLegend from "@/components/geo/GeoLegend";

export const metadata = { title: "Seabed habitat — GIMMIE SICK VIS" };

export default function Habitat() {
  return (
    <div className="panel">
      <div className="panel-hd">
        <span className="panel-ttl">Seabed habitat</span>
      </div>
      <div className="panel-bd">
        <div className="sub" style={{ margin: "0 0 10px" }}>
          What&rsquo;s actually down there — seabed habitat from Seamap Australia mapped over
          satellite imagery, with depth lines from DEECA. Tap the seabed to see what you&rsquo;re
          looking at.
        </div>
        <div className="geowrap" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <HabitatClient />
          <GeoLegend />
        </div>
      </div>
    </div>
  );
}
