import DepthClient from "@/components/geo/DepthClient";

export const metadata = { title: "Depth detail — GIMMIE SICK VIS" };

export default function Depth() {
  return (
    <div className="panel">
      <div className="panel-hd">
        <span className="panel-ttl">Depth detail</span>
      </div>
      <div className="panel-bd">
        <div className="sub" style={{ margin: "0 0 10px" }}>
          How deep is it, exactly — fine-grained depth contours from DEECA CoastKit. Click
          anywhere on the map to get a depth reading.
        </div>
        <DepthClient />
      </div>
    </div>
  );
}
