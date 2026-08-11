export const metadata = {
  title: "Terms of Use — GIMMIE SICK VIS",
  description:
    "The terms you agree to by using gimmiesickvis.com, including what the data is and isn't good for.",
};

export default function Terms() {
  return (
    <div className="panel">
      <div className="panel-hd">
        <span className="panel-ttl">Terms of Use</span>
        <span className="panel-meta">Last updated: 8 August 2026</span>
      </div>
      <div className="panel-bd guide">
        <p>
          By using gimmiesickvis.com you agree to these terms. If you don&rsquo;t agree, please
          don&rsquo;t use the site.
        </p>

        <h2>What this site is</h2>
        <p>
          Gimmie Sick Vis is a marine conditions dashboard for the Victorian coast, aggregating
          swell, wind, sea surface temperature, chlorophyll, currents, salinity and satellite
          imagery from public data sources, alongside original guides on diving and fishing
          conditions.
        </p>

        <h2>Not a safety authority &mdash; read this bit</h2>
        <p>
          The data and forecasts on this site are for general informational and planning purposes
          only. They are <b>not a substitute for</b>:
        </p>
        <ul>
          <li>Official Bureau of Meteorology forecasts and marine warnings</li>
          <li>Your own on-the-day assessment of conditions</li>
          <li>
            Sound judgement and appropriate training for diving, spearfishing, and boating
          </li>
        </ul>
        <p>
          Satellite and third-party data can be delayed, incomplete, or wrong. Ocean and weather
          conditions change quickly and can differ from what&rsquo;s shown here.{" "}
          <b>You are responsible for your own safety decisions.</b>{" "}Never dive, spearfish, or head
          out on the water based solely on this site.
        </p>

        <h2>No warranty</h2>
        <p>
          This site and its data are provided &ldquo;as is&rdquo;, without warranties of any kind,
          express or implied, including as to accuracy, availability, or fitness for a particular
          purpose.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, Gimmie Sick Vis and its operator are not liable
          for any loss, injury, or damage arising from your use of this site or reliance on its
          data &mdash; including personal injury or death arising from diving, fishing, or boating
          activities.
        </p>

        <h2>Your use of the site</h2>
        <p>You agree not to:</p>
        <ul>
          <li>
            Scrape, republish, or resell data or content from this site without permission
          </li>
          <li>
            Use the contact or feedback forms to send spam, abusive content, or unlawful material
          </li>
          <li>Attempt to disrupt or interfere with the site&rsquo;s operation</li>
        </ul>

        <h2>Content and intellectual property</h2>
        <p>
          Original artwork, illustrations, guides, and written content on this site belong to Maya
          unless stated otherwise. Third-party satellite and environmental data belongs to its
          respective providers (Copernicus/Sentinel-2, NASA, IMOS, and others) and is used under
          their applicable terms.
        </p>

        <h2>Store</h2>
        <p>
          Purchases made through the Store are subject to a separate returns policy shown at
          checkout.
        </p>

        <h2>Advertising</h2>
        <p>
          This site may display ads served by Google AdSense and other third parties. We are not
          responsible for the content of third-party ads.
        </p>

        <h2>Changes to these terms</h2>
        <p>
          We may update these terms at any time. Continued use of the site after changes means you
          accept the updated terms.
        </p>

        <h2>Governing law</h2>
        <p>These terms are governed by the laws of Victoria, Australia.</p>

        <h2>Contact</h2>
        <p>
          <a href="mailto:maddog.mayaa@gmail.com">maddog.mayaa@gmail.com</a>
        </p>
      </div>
    </div>
  );
}
