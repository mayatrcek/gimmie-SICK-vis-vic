import SnaggleInfo from "@/components/SnaggleInfo";
import { FISH_WIP } from "@/lib/nav";
import FishCards from "@/components/FishCards";

export const metadata = {
  title: "Fish guide — GIMMIE SICK VIS",
  description:
    "Identify the fish you'll meet on Victorian dives and fishing trips — habitat, depth range and season for each species.",
  // nothing to index while the guide is gated (it's out of the sitemap too)
  robots: FISH_WIP ? { index: false, follow: false } : undefined,
};

export default function Fish() {
  // Gated at the page, not just in the nav — the URL is guessable, and it's
  // been linked and indexed before. Same stub the other unfinished pages use.
  if (FISH_WIP) {
    return (
      <div className="panel">
        <div className="panel-hd">
          <span className="panel-ttl">What&rsquo;s biting</span>
          <span className="panel-meta">Work in progress</span>
          <SnaggleInfo text="The fish guide is being reworked and is off the menu for now. Check back soon." />
        </div>
      </div>
    );
  }

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
