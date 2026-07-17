import FishCards from "@/components/FishCards";

export const metadata = { title: "Fish guide — GIMMIE SICK VIS" };

export default function Fish() {
  return (
    <div className="panel">
      <div className="panel-hd">
        <span className="panel-ttl">What&rsquo;s biting</span>
      </div>
      <div className="panel-bd">
        <div className="sub">
          Fish worth chasing around Victoria right now, from the shore or the boat. Green tags
          mean it&rsquo;s a good time to go. Always check current{" "}
          <a
            href="https://vfa.vic.gov.au/recreational-fishing/recreational-fishing-guide"
            target="_blank"
            rel="noopener"
          >
            VFA size &amp; bag limits
          </a>{" "}
          before you keep anything — pics are stylised, not real photos.
        </div>
        <FishCards />
      </div>
    </div>
  );
}
