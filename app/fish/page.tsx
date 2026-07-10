import FishCards from "@/components/FishCards";
import FishViewSwitch from "@/components/FishViewSwitch";

export const metadata = { title: "Fish guide — GIMMIE SICK VIS" };

export default function Fish() {
  return (
    <>
      <FishViewSwitch
        list={
          <div className="panel">
            <div className="panel-hd">
              <span className="panel-ttl">Target species</span>
            </div>
            <div className="panel-bd">
              <div className="sub">
                Species worth targeting around Victoria, shore or boat. Green = likely worth a go
                around now. Always check current{" "}
                <a
                  href="https://vfa.vic.gov.au/recreational-fishing/recreational-fishing-guide"
                  target="_blank"
                  rel="noopener"
                >
                  VFA size &amp; bag limits and closed seasons
                </a>{" "}
                before keeping anything — the illustrations are stylised, not photos.
              </div>
              <FishCards />
            </div>
          </div>
        }
      />
    </>
  );
}
