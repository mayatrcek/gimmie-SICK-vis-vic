export const metadata = { title: "About — GIMMIE SICK VIS" };

export default function About() {
  return (
    <div className="panel">
      <div className="panel-hd">
        <span className="panel-ttl">About this site</span>
      </div>
      <div className="panel-bd" style={{ padding: "18px 20px", lineHeight: 1.6 }}>
        <p style={{ margin: "0 0 12px" }}>
          This site is a passion project. I designed it with the idea that you&rsquo;ll still need
          some idea of how to read the data yourself, rather than having it spoon-fed to you like a
          lot of other sites and apps. If you&rsquo;re diving the back beaches, you&rsquo;ll still
          need to understand the major factors that make or break a dive day — but you do get a
          rough 7-day forecast rating diveable days on a 1&ndash;10 scale, and combining that with
          the live chlorophyll scans can give you a good idea of where the clearest water is. I&rsquo;ve
          added a <a href="/back-beach">Learn section</a> to help teach that side of it.
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
          I&rsquo;m still learning dive forecasting myself — if you&rsquo;ve got ideas for
          improvement, let me know via <a href="/feedback">feedback</a>! :D
        </p>
        <p style={{ margin: "0 0 12px" }}>
          A little bit about me: I love fishing and diving along the Victorian coast in my spare
          time. I&rsquo;m a uni student studying Computer Science, and I&rsquo;ve been able to put
          some of that to use building this site — with a lot of help from various AI models,
          mainly Claude Code.{" "}
          <a
            href="https://github.com/mayatrcek/gimmie-SICK-vis-vic"
            target="_blank"
            rel="noopener"
          >
            Check out the code
          </a>
          .
        </p>
        <p style={{ margin: "0 0 12px" }}>
          I&rsquo;m also an artist, believe it or not — every now and then I put something together.
          You might&rsquo;ve seen one of my drawings picked as the new design for the Victorian
          Recreational Fishing Licence. I&rsquo;ve got an official shop in the making —{" "}
          <a href="/store">take a look and support me</a>{" "}
          if you&rsquo;re keen!
        </p>
        <p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}>
          Ratings and seabed labels are indicative and for planning only. Always check official
          forecasts, tides and safety information before entering the water.
        </p>
      </div>
    </div>
  );
}
