import LiveFrame from "@/components/LiveFrame";
import SnaggleInfo from "@/components/SnaggleInfo";

export const metadata = {
  title: "Point Nepean wave buoy — GIMMIE SICK VIS",
  description:
    "Live wave height, period and direction from the Point Nepean buoy at the entrance to Port Phillip Bay.",
};

const DASH =
  "https://portweather-public.omcinternational.com/d/f28ef6a7-b2b9-4906-82b2-d48264b69f35/point-nepean";

const NOTE =
  "This is a buoy situated past the Port Phillip Heads. It collects live data and displays the last three days. It’s an amazing “sanity check” to see what the swell is actually doing. I always check this in the morning before I drive down. What you want to look for is ideally a swell less than one metre and the period less than ~13 seconds (higher periods are still diveable, but the water becomes pretty surge-y). Open full dashboard ↗";

export default function Nepean() {
  return (
    <div className="panel">
      <div className="panel-hd">
        <h1 className="panel-ttl">Point Nepean — live waves</h1>
        <span className="panel-meta">Ports Victoria / OMC</span>
        <SnaggleInfo text={NOTE}>
          This is a buoy situated past the Port Phillip Heads. It collects live data and displays
          the last three days. It&rsquo;s an amazing &ldquo;sanity check&rdquo; to see what the
          swell is actually doing. I always check this in the morning before I drive down. What you
          want to look for is ideally a swell <em>less than one metre</em> and the period{" "}
          <em>less than ~13 seconds</em> (higher periods are still diveable, but the water becomes
          pretty surge-y).{" "}
          <a href={DASH} target="_blank" rel="noopener">
            Open full dashboard &#8599;
          </a>
        </SnaggleInfo>
      </div>
      <div className="panel-bd flush">
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
