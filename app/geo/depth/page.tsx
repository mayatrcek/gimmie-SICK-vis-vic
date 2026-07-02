import DepthClient from "@/components/geo/DepthClient";

export const metadata = { title: "Depth detail — DIVEBYTE" };

export default function Depth() {
  return (
    <>
      <h2 className="sec">
        <span className="dot" style={{ background: "var(--accent)" }} />
        Depth detail
      </h2>
      <div className="sub" style={{ margin: "0 0 10px" }}>
        High-resolution bathymetry and depth contours from DEECA CoastKit. Click the map to read the
        depth at a point.
      </div>
      <DepthClient />
    </>
  );
}
