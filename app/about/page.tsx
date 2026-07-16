export const metadata = { title: "About — GIMMIE SICK VIS" };

export default function About() {
  return (
    <div className="panel">
      <div className="panel-hd">
        <span className="panel-ttl">About this site</span>
      </div>
      <div className="panel-bd" style={{ padding: "18px 20px", lineHeight: 1.6 }}>
        <p style={{ margin: "0 0 12px" }}>
          A weekend project turned obsession — pulling swell, wind, sea temp, chlorophyll and seabed
          data into one spot so I can tell if tomorrow&rsquo;s worth the early start.
        </p>
        <p style={{ margin: "0 0 12px" }}>
          Everything here runs on free, public data: marine and weather forecasts from{" "}
          <a href="https://open-meteo.com" target="_blank" rel="noopener">
            Open-Meteo
          </a>
          , sea-surface temperature from NOAA ACSPO, chlorophyll from NOAA CoastWatch, seabed
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
          <b>Still cooking:</b> this thing&rsquo;s a work in progress — some bits might be broken or
          change without warning. <a href="/feedback">Feedback</a> welcome if something&rsquo;s
          acting up.
        </p>
        <p style={{ margin: "0 0 12px" }}>
          <b>Who built this:</b> just Maya — first-year comp-sci student, diver, and fisherman on
          the Victorian coast — with a hand from Claude (Anthropic&rsquo;s AI) to get the maps and
          data feeds talking to each other.
        </p>
        <p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}>
          Ratings and seabed labels are indicative and for planning only. Always check official
          forecasts, tides and safety information before entering the water.
        </p>
      </div>
    </div>
  );
}
