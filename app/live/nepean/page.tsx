import LiveFrame from "@/components/LiveFrame";
import SnaggleInfo from "@/components/SnaggleInfo";

export const metadata = { title: "Point Nepean wave buoy — GIMMIE SICK VIS" };

const DASH =
  "https://portweather-public.omcinternational.com/d/f28ef6a7-b2b9-4906-82b2-d48264b69f35/point-nepean";

const NOTE =
  "Open full dashboard ↗ · Live from the Point Nepean wave buoy (Ports Victoria / OMC International). If the panel below is blank, their site’s refusing to embed — use the link instead.";

export default function Nepean() {
  return (
    <div className="panel">
      <div className="panel-hd">
        <span className="panel-ttl">Point Nepean — live waves</span>
        <span className="panel-meta">Ports Victoria / OMC</span>
        <SnaggleInfo text={NOTE}>
          <a href={DASH} target="_blank" rel="noopener">
            Open full dashboard &#8599;
          </a>{" "}
          &middot; Live from the Point Nepean wave buoy (Ports Victoria / OMC International). If the
          panel below is blank, their site&rsquo;s refusing to embed — use the link instead.
        </SnaggleInfo>
      </div>
      <div className="panel-bd">
        <LiveFrame
          src={`${DASH}?kiosk&theme=light`}
          loading="lazy"
          referrerPolicy="no-referrer"
          title="Point Nepean live wave data"
        />
      </div>
    </div>
  );
}
