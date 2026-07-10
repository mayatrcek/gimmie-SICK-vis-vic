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
          Benthic habitat from Seamap Australia over satellite imagery, with DEECA depth contours.
          Click the seabed to identify the habitat type.
        </div>
        <div className="geowrap" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <HabitatClient />
          <GeoLegend />
        </div>
      </div>
    </div>
  );
}
