import FishCards from "@/components/FishCards";

export const metadata = { title: "Fish guide — DIVEBYTE" };

export default function Fish() {
  return (
    <>
      <div className="sub" style={{ marginTop: 6 }}>
        Species worth targeting around Victoria, shore or boat. Green = likely worth a go around now.
        Always check current{" "}
        <a
          href="https://vfa.vic.gov.au/recreational-fishing/recreational-fishing-guide"
          target="_blank"
          rel="noopener"
        >
          VFA size &amp; bag limits and closed seasons
        </a>{" "}
        before keeping anything — the illustrations are stylised, not photos.
      </div>

      <div className="panel">
        <div className="panel-hd">
          <span className="dot" style={{ background: "var(--accent)" }} />
          <span className="panel-ttl">Target species</span>
        </div>
        <div className="panel-bd">
          <FishCards />
          <p className="sub" style={{ margin: "12px 0 0" }}>
            Each pinned site on the <b>Forecast</b> map now carries its habitat (reef type) and what to
            target — click a marker to see it.
          </p>
        </div>
      </div>
    </>
  );
}
