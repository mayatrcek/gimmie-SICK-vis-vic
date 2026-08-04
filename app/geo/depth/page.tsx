import DepthClient from "@/components/geo/DepthClient";
import SnaggleInfo from "@/components/SnaggleInfo";

export const metadata = { title: "Depth detail — GIMMIE SICK VIS" };

export default function Depth() {
  return (
    <div className="panel">
      <div className="panel-hd">
        <span className="panel-ttl">Depth detail</span>
        <SnaggleInfo text="How deep is it, exactly — fine-grained depth contours from DEECA CoastKit. Click anywhere on the map to get a depth reading." />
      </div>
      <div className="panel-bd">
        <DepthClient />
      </div>
    </div>
  );
}
