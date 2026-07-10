export const metadata = { title: "About — GIMMIE SICK VIS" };

export default function About() {
  return (
    <div className="panel">
      <div className="panel-hd">
        <span className="panel-ttl">About this site</span>
      </div>
      <div className="panel-bd" style={{ padding: "18px 20px", lineHeight: 1.6 }}>
        <p style={{ margin: "0 0 12px" }}>
          This is a personal dive- and fishing-conditions dashboard for the Victorian coast — from the
          Surf Coast and Port Phillip Heads across to Wilsons Promontory. It brings swell, wind,
          rainfall, sea-surface temperature, chlorophyll and seabed information together for the spots
          I actually dive, so I can tell at a glance whether tomorrow is worth an early start.
        </p>
        <p style={{ margin: "0 0 12px" }}>
          Everything here runs on free, public data: marine and weather forecasts from{" "}
          <a href="https://open-meteo.com" target="_blank" rel="noopener">
            Open-Meteo
          </a>
          , sea-surface temperature from NASA JPL MUR, chlorophyll from NOAA CoastWatch, seabed
          habitat from{" "}
          <a href="https://seamapaustralia.org" target="_blank" rel="noopener">
            Seamap Australia
          </a>
          , and high-resolution bathymetry and depth contours from{" "}
          <a href="https://www.marineandcoasts.vic.gov.au/" target="_blank" rel="noopener">
            DEECA CoastKit (Victoria)
          </a>
          , with open basemaps and bathymetry from OpenStreetMap, CARTO and Mapzen. The whole
          thing is a single web app — no account, no tracking, no servers of mine.
        </p>
        <p style={{ margin: "0 0 12px" }}>
          <b>Testing status:</b> this site is still in testing, so some features may not work yet
          (or may change without warning).{" "}
          <a href="/feedback">Feedback</a> is highly valuable — if something looks broken or
          plain wrong, please say so.
        </p>
        <p style={{ margin: "0 0 12px" }}>
          <b>Who&rsquo;s &ldquo;us&rdquo;:</b> built by Maya — a first-year computer-science student
          who dives and fishes the Victorian coast — together with Anthropic&rsquo;s Claude (model{" "}
          <code>claude-opus-4-8</code>), which helped write and wire up the maps, data feeds and
          conditions logic.
        </p>
        <p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}>
          Ratings and seabed labels are indicative and for planning only. Always check official
          forecasts, tides and safety information before entering the water.
        </p>
      </div>
    </div>
  );
}
