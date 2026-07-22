export const metadata = { title: "Back Beach Forecasting — GIMMIE SICK VIS" };

export default function BackBeach() {
  return (
    <div className="panel">
      <div className="panel-hd">
        <span className="panel-ttl">Back Beach Forecasting</span>
      </div>
      <div className="panel-bd guide">
        <p>
          The Victorian back beaches are a huge step up from diving the bays. Swim-through caves,
          resident crays, fish that don&rsquo;t see much pressure, and huge tiered reefs dropping
          away into blue, on the right day it doesn&rsquo;t feel like the same state you dive in
          Port Phillip.
        </p>
        <p>
          The catch is that &ldquo;the right day&rdquo; doesn&rsquo;t come around often. The back
          beaches face the open Southern Ocean with nothing between them and Antarctica, so most
          of the year they&rsquo;re unrunnable. Learning to read a forecast properly is the
          difference between scoring a handful of world-class days a season and driving two hours
          to look at a washing machine.
        </p>
        <p>
          This page covers what actually matters: swell, wind, tide, and the visibility factors
          that catch people out even on a calm day.
        </p>

        <h2>Swell</h2>
        <p>
          <b>Swell is the main factor.</b>{" "}
          Get this call wrong and nothing else matters, wind, tide and water clarity are
          irrelevant if you can&rsquo;t safely get in and out.
        </p>

        <h3>Height</h3>
        <p>
          As a rough working rule, <b>under 1m is diveable</b>. Above that you&rsquo;re into
          territory where entries and exits get sketchy, surge starts throwing you around inside
          the reef, and the odds of a session being worth the drive drop fast.
        </p>
        <p>
          That number is a starting point, not a law. Sheltered corners and spots sitting in the
          swell shadow of a point or reef will handle more; fully exposed stretches will be a mess
          well before 1m.
        </p>

        <h3>Period, the number most people ignore</h3>
        <p>
          Height tells you how big the waves are. <b>Period tells you how much energy is behind
          them and how deep that energy reaches.</b>
        </p>
        <p>
          An 8-second swell is mint. A 16-second swell at the same height is a completely
          different animal, extremely surge-y, and it&rsquo;ll churn the water dirty even when
          the surface looks manageable from the car park.
        </p>
        <p>
          The reason is physics: a wave&rsquo;s orbital motion extends down through the water
          column to roughly half its wavelength. Long-period swell has a much longer wavelength,
          so its energy reaches far deeper. Short-period wind chop is a surface annoyance.
          Long-period ground swell moves water <i>at depth</i>, which is exactly where you are.
        </p>
        <ul>
          <li><b>Long period = more surge on the reef</b>, more back-and-forth throwing you into things you&rsquo;d rather not be thrown into.</li>
          <li><b>Long period = dirtier water</b>, because that deep water movement stirs sand and sediment off the bottom.</li>
          <li><b>Long period is worse for scuba than for a breath-hold dive</b>, since you&rsquo;re spending sustained time down where the surge is strongest rather than passing through it.</li>
        </ul>
        <div className="note">
          A forecast reading 0.8m @ 15sec can be a harder day than 1.1m @ 8sec. Always read both
          numbers together, never height on its own.
        </div>

        <h2>Wind</h2>
        <p>
          What you want is <b>offshore</b>, wind blowing from the land out to sea. It holds the
          swell up clean, flattens the surface texture, and doesn&rsquo;t push anything nasty into
          the water. Failing that, <b>light onshore or cross winds</b> are workable.
        </p>
        <p>Strong onshore is the problem. It does two things:</p>
        <ul>
          <li>
            <b>Surface chop</b>, the snorkel fillers. Miserable on the swim out, miserable on the
            surface interval, and it makes spotting your exit harder.
          </li>
          <li>
            <b>Secondary swell</b>, if it blows hard enough for long enough, the wind generates its
            own short-period swell on top of whatever ground swell is already running. Now
            you&rsquo;ve got two swell trains arriving from different directions, which is both
            messier and more unpredictable than a single clean swell.
          </li>
        </ul>
        <p>
          Worth checking morning and afternoon separately rather than looking at a daily average.
          Victoria typically runs lighter winds overnight and early morning, with a sea breeze
          filling in as the land heats up through the day, especially in summer. An early start
          often gets you the good window before it turns on.
        </p>

        <h2>Tide</h2>
        <p>
          Tide is pretty chill on the back beaches compared to somewhere like the Rip, where
          it&rsquo;s the whole ball game.
        </p>
        <p>
          <b>Low tide sometimes offers easier access</b>, more exposed platform to walk out on, a
          shorter swim, and a better read on what the water&rsquo;s doing before you commit.
        </p>
        <p>
          The one real thing to watch: <b>mini caves and holes in the low tide platforms.</b>{" "}
          They&rsquo;re easy to walk straight into when you&rsquo;re focused on the water, moving
          in fins, or scrambling with a full kit. Take your time crossing the platform and
          actually look at where you&rsquo;re putting your feet.
        </p>

        <h2>Other visibility factors</h2>
        <p>
          These are the ones that catch people out, because they&rsquo;re completely independent
          of swell and wind. You can drive down to a glassy, offshore-wind, sub-1m day and find
          the water green.
        </p>

        <h3>Chlorophyll</h3>
        <p>
          <a href="/live/chlorophyll">Chlorophyll scans</a> show plankton concentration across the
          coast. High chlorophyll means a bloom, and a bloom means green, low-vis water{" "}
          <b>even on a perfect weather day.</b>
        </p>
        <p>
          This is one of the most useful tools available if you&rsquo;re travelling any real
          distance to dive. Swell and wind forecasts tell you whether you can get in the water;
          chlorophyll tells you whether it&rsquo;s worth looking at once you&rsquo;re there.
          Checking it before a long drive has saved plenty of wasted fuel.
        </p>

        <h3>Rainfall</h3>
        <p>
          Heavy rain dirties water near river and creek mouths, and it can hang around{" "}
          <b>for days at a time</b>{" "}
          after the rain itself has stopped. Runoff carries sediment and tannin out into the
          nearshore water, and it doesn&rsquo;t clear until the system flushes.
        </p>
        <p>If a spot sits near an outflow, factor in the last few days of rain, not just today&rsquo;s forecast.</p>

        <h2>Putting it together</h2>
        <p>Before you commit to a back beach session, run the list:</p>
        <ol>
          <li><b>Swell height</b>, under 1m, adjusted for how exposed the spot is?</li>
          <li><b>Swell period</b>, short and gentle, or long and surge-y?</li>
          <li><b>Wind</b>, offshore or light? Checked for the specific time window you&rsquo;ll be in the water, not the daily average?</li>
          <li><b>Tide</b>, does low tide help access here, and are you across the platform hazards?</li>
          <li><b>Chlorophyll</b>, any bloom sitting on the area?</li>
          <li><b>Recent rain</b>, anything that could still have runoff dirtying the nearshore?</li>
        </ol>
        <p>If all six line up, you&rsquo;ve got a back beach day. They&rsquo;re rare. When one shows up, go.</p>

        <p style={{ marginTop: 24, color: "var(--muted)", fontSize: 13, fontStyle: "italic" }}>
          Conditions on the back beaches can change fast, and forecasts are a guide, not a
          guarantee. Always make your own assessment at the water&rsquo;s edge before entering,
          and never dive alone.
        </p>
      </div>
    </div>
  );
}
