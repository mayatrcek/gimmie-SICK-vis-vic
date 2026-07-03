import FishCards from "@/components/FishCards";
import FishViewSwitch from "@/components/FishViewSwitch";

export const metadata = { title: "Fish guide — DIVEBYTE" };

export default function Fish() {
  return (
    <>
      <FishViewSwitch
        intro={
          <div className="sub" style={{ marginTop: 6, maxWidth: "none" }}>
            Species worth targeting around Victoria, shore or boat. Green = likely worth a go around
            now. Always check current{" "}
            <a
              href="https://vfa.vic.gov.au/recreational-fishing/recreational-fishing-guide"
              target="_blank"
              rel="noopener"
            >
              VFA size &amp; bag limits and closed seasons
            </a>{" "}
            before keeping anything — the illustrations are stylised, not photos.
          </div>
        }
        list={
          <div className="panel">
            <div className="panel-hd">
              <span className="dot" style={{ background: "var(--accent)" }} />
              <span className="panel-ttl">Target species</span>
            </div>
            <div className="panel-bd">
              <FishCards />
            </div>
          </div>
        }
      />
    </>
  );
}
