export const metadata = {
  title: "Privacy Policy — GIMMIE SICK VIS",
  description:
    "What gimmiesickvis.com collects, the third-party services involved, and how to ask for your data to be corrected or deleted.",
};

export default function Privacy() {
  return (
    <div className="panel">
      <div className="panel-hd">
        <h1 className="panel-ttl">Privacy Policy</h1>
        <span className="panel-meta">Last updated: 8 August 2026</span>
      </div>
      <div className="panel-bd guide">
        <p>
          Gimmie Sick Vis (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;the site&rdquo;) is run by
          Maya, based in Victoria, Australia. This policy explains what data gimmiesickvis.com
          collects, how it&rsquo;s used, and your options.
        </p>

        <h2>What we collect</h2>
        <h3>Information you give us directly</h3>
        <ul>
          <li>
            Contact and Feedback form submissions: your name, email address, and message content
          </li>
          <li>Anything you choose to include in those messages</li>
        </ul>

        <h3>Information collected automatically</h3>
        <ul>
          <li>
            Standard technical data: IP address, approximate location (derived from IP), browser
            and device type, pages visited, and referring site
          </li>
          <li>
            Collected via our hosting provider (Vercel) and, where enabled, analytics tools
          </li>
        </ul>

        <h3>Cookies</h3>
        <ul>
          <li>Essential cookies required for the site to function</li>
          <li>
            If ads are shown on this site, Google and its advertising partners may use cookies
            (including the DoubleClick cookie) to serve ads based on your visits here and to other
            sites. You can opt out of personalised ads via{" "}
            <a href="https://adssettings.google.com" target="_blank" rel="noopener">
              Google Ads Settings
            </a>{" "}
            or{" "}
            <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener">
              aboutads.info
            </a>
            .
          </li>
        </ul>

        <h2>What we don&rsquo;t collect</h2>
        <ul>
          <li>
            We don&rsquo;t currently have user accounts or logins, so we hold no passwords or
            account data
          </li>
          <li>
            We don&rsquo;t store payment details. Purchases through the Store are processed
            directly by our payment/print-on-demand provider, who has its own privacy policy
          </li>
        </ul>

        <h2>Third-party services we use</h2>
        <ul>
          <li>
            <b>Vercel</b>{" "}&mdash; hosting
          </li>
          <li>
            <b>Resend</b>{" "}&mdash; delivering emails from the contact and feedback forms
          </li>
          <li>
            <b>Google AdSense</b> <i>(once enabled)</i>{" "}&mdash; displaying ads, using cookies as
            described above
          </li>
          <li>
            <b>Anthropic (Claude API)</b>{" "}&mdash; powers the site&rsquo;s AI conditions summary;
            the data sent is ocean/weather data, not personal information
          </li>
          <li>
            <b>Copernicus/Sentinel-2, NASA, IMOS and other public data providers</b>{" "}&mdash;
            supply the environmental data shown on the site; this is publicly available data, not
            personal information
          </li>
        </ul>

        <h2>How we use your data</h2>
        <ul>
          <li>To respond to contact and feedback messages</li>
          <li>To understand site usage and improve it</li>
          <li>To serve relevant ads once AdSense is live</li>
          <li>We do not sell your personal information to anyone</li>
        </ul>

        <h2>Your rights</h2>
        <p>
          We handle personal information consistent with the Australian Privacy Principles where
          they apply to us. You can ask what data we hold about you, ask us to correct it, or ask
          us to delete it, by contacting us at{" "}
          <a href="mailto:maddog.mayaa@gmail.com">maddog.mayaa@gmail.com</a>.
        </p>

        <h2>Children</h2>
        <p>
          This site isn&rsquo;t directed at children, and we don&rsquo;t knowingly collect data
          from children.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We may update this policy from time to time. Updates will be posted on this page with a
          new &ldquo;last updated&rdquo; date.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy:{" "}
          <a href="mailto:maddog.mayaa@gmail.com">maddog.mayaa@gmail.com</a>
        </p>
      </div>
    </div>
  );
}
