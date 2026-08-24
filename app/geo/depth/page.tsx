import DepthClient from "@/components/geo/DepthClient";
import SnaggleInfo from "@/components/SnaggleInfo";

export const metadata = {
  title: "Depth detail — GIMMIE SICK VIS",
  description:
    "Interactive seabed depth map of the Victorian coast — shaded bathymetry and 10 m contours, click anywhere to copy that point's coordinates.",
};

export default function Depth() {
  return (
    <div className="panel">
      <div className="panel-hd">
        <h1 className="panel-ttl">Depth detail</h1>
        <SnaggleInfo text="A rough depth map in intervals of 10m." />
      </div>
      <div className="panel-bd flush">
        <DepthClient />
      </div>
    </div>
  );
}
