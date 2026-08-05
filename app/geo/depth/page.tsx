import DepthClient from "@/components/geo/DepthClient";
import SnaggleInfo from "@/components/SnaggleInfo";

export const metadata = {
  title: "Depth detail — GIMMIE SICK VIS",
  description:
    "Interactive seabed depth map of the Victorian coast — click anywhere for the depth reading under that point.",
};

export default function Depth() {
  return (
    <div className="panel">
      <div className="panel-hd">
        <span className="panel-ttl">Depth detail</span>
        <SnaggleInfo text="A rough depth map in intervals of 10m." />
      </div>
      <div className="panel-bd">
        <DepthClient />
      </div>
    </div>
  );
}
