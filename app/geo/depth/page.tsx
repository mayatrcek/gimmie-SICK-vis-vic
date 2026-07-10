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
          High-resolution bathymetry and depth contours from DEECA CoastKit. Click the map to read
          the depth at a point.
        </div>
        <DepthClient />
      </div>
    </div>
  );
}
