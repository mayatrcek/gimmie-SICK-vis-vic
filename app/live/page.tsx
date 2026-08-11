import Link from "next/link";
import { LIVE_HREF, LIVE_ITEMS } from "@/lib/nav";

export const metadata = {
  title: "Live data — GIMMIE SICK VIS",
  description:
    "Every live feed for the Victorian coast in one place: wave buoy, sea temperature, chlorophyll, currents, salinity, altimetry and satellite passes.",
};

export default function Live() {
  return (
    <div className="panel">
      <div className="panel-hd">
        <span className="panel-ttl">Live data</span>
        <span className="panel-meta">
          Satellite and buoy feeds for the Victorian coast, updated as the data lands.
        </span>
      </div>
      <div className="panel-bd">
        <ul className="hublist">
          {LIVE_ITEMS.filter((i) => i.href !== LIVE_HREF).map((i) => (
            <li key={i.href}>
              {i.wip ? (
                <span className="hub-item wip" aria-disabled="true">
                  <b>
                    {i.label} <em className="wip-tag">WIP</em>
                  </b>
                  <span>{i.blurb}</span>
                </span>
              ) : (
                <Link href={i.href} className="hub-item">
                  <b>{i.label}</b>
                  <span>{i.blurb}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
