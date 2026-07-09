import LiveFrame from "@/components/LiveFrame";

export const metadata = { title: "Point Nepean wave buoy — DIVEBYTE" };

const DASH =
  "https://portweather-public.omcinternational.com/d/f28ef6a7-b2b9-4906-82b2-d48264b69f35/point-nepean";

export default function Nepean() {
  return (
    <div className="panel">
      <div className="panel-hd">
        <span className="panel-ttl">Point Nepean — live waves</span>
        <span className="panel-meta">Ports Victoria / OMC</span>
      </div>
      <div className="panel-bd">
        <div className="desc" style={{ padding: "0 0 8px" }}>
          <a href={DASH} target="_blank" rel="noopener">
            Open full dashboard &#8599;
          </a>{" "}
          &middot; Source: Ports Victoria / OMC International. If the panel below is blank, the site is
          blocking embedding — use the link.
        </div>
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
