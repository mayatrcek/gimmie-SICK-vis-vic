import Image from "next/image";

export const metadata = { title: "About — GIMMIE SICK VIS" };

// framed-photo look shared by every image on this page — same 2px ink
// border + hard shadow as the site's map frames
const framed: React.CSSProperties = {
  width: "100%",
  height: "auto",
  display: "block",
  border: "2px solid var(--ink)",
  boxShadow: "var(--shadow-1)",
};

export default function About() {
  return (
    <div className="panel">
      <div className="panel-hd">
        <span className="panel-ttl">About this site</span>
      </div>
      <div className="panel-bd" style={{ padding: "18px 20px", lineHeight: 1.6 }}>
        <div className="grid2" style={{ marginTop: 0, alignItems: "center" }}>
          <div>
            <p style={{ margin: "0 0 16px" }}>
              This site you&rsquo;re on is a passion project. I designed it with the idea that
              you&rsquo;ll still need some idea about analysing the data, rather than having it
              somewhat spoon-fed like other sites and apps.
            </p>
            <p style={{ margin: "0 0 16px" }}>
              When diving the back beaches, I feel you should still understand the major
              components that drive it (swell, wind, and so on). The forecast section has been
              designed as an outlook for the next seven days, calculated on a scale of
              1&ndash;10. Combining this with live chlorophyll scans can give you an idea where
              ideal dive spots lie.
            </p>
            <p style={{ margin: "0 0 16px" }}>
              I&rsquo;ve added a <b>learn section</b>{" "}
              onto this site to help teach others. I&rsquo;m still learning on dive forecasting
              myself, so if you have any ideas for improvement please let me know! :D
            </p>
            <a href="/feedback" className="btn btn-vermillion">
              Send feedback
            </a>
          </div>
          <Image
            src="/assets/about/pier-feet.jpg"
            alt="Standing on a jetty looking down into clear Victorian coastal water"
            width={1283}
            height={1283}
            style={framed}
          />
        </div>

        <div style={{ marginTop: 48 }}>
          <p style={{ margin: "0 0 16px" }}>
            Anyways, a little bit extra about myself. I love my fishing and diving along the
            Victorian coast in my spare time. As a uni student currently studying Computer
            Science, I&rsquo;ve been able to apply some of my skills into building this site
            along with the help of various AI models. Mainly Claude Code in this case.
          </p>
          <a
            href="https://github.com/mayatrcek/gimmie-SICK-vis-vic"
            target="_blank"
            rel="noopener"
            className="btn"
          >
            View the GitHub repo
          </a>
        </div>

        <div className="grid2" style={{ marginTop: 48, alignItems: "center" }}>
          <Image
            src="/assets/about/fishing-licence-artwork.jpg"
            alt="Maya's illustration of Victorian fish and sea life, chosen as the new Victorian Recreational Fishing Licence design"
            width={1080}
            height={745}
            style={framed}
          />
          <div>
            <p style={{ margin: "0 0 16px" }}>
              I&rsquo;m also an artist as well?! Every now and then I do something. You might
              have seen one of my recent drawings being chosen as the new design for the
              Victorian Recreational Fishing Licence.
            </p>
            <p style={{ margin: "0 0 16px" }}>
              I&rsquo;ve got an official shop &ldquo;in the making&rdquo;, you can take a look at
              and support me if you wish!
            </p>
            <a href="/store" className="btn btn-primary">
              Visit the shop
            </a>
          </div>
        </div>

        <Image
          src="/assets/about/snapper-catch.jpg"
          alt="Maya freediving with a snapper catch off the Victorian coast"
          width={1066}
          height={581}
          style={{ ...framed, marginTop: 48 }}
        />

        <p style={{ margin: "48px 0 16px" }}>
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
        <p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}>
          Ratings and seabed labels are indicative and for planning only. Always check official
          forecasts, tides and safety information before entering the water.
        </p>
      </div>
    </div>
  );
}
