import HabitatClient from "@/components/geo/HabitatClient";
import GeoLegend from "@/components/geo/GeoLegend";
import SnaggleInfo from "@/components/SnaggleInfo";

export const metadata = { title: "Seabed habitat — GIMMIE SICK VIS" };

export default function Habitat() {
  return (
    <div className="panel">
      <div className="panel-hd">
        <span className="panel-ttl">Seabed habitat</span>
        <SnaggleInfo text="What’s actually down there — seabed habitat from Seamap Australia mapped over satellite imagery, with depth lines from DEECA. Tap the seabed to see what you’re looking at." />
      </div>
      <div className="panel-bd">
        <div className="geowrap" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <HabitatClient />
          <GeoLegend />
        </div>
      </div>
    </div>
  );
}
