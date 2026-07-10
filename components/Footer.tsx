import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="foot-grid">
        <Link className="foot-brand" href="/">
          GIMMIE SICK VIS
        </Link>
        <div className="foot-links">
          <a href="#">PROTOCOL_VO_1</a>
          <a href="#">SATELLITE_LINK</a>
          <a href="#">GRID_COORD_REF</a>
        </div>
        <div className="foot-meta">&copy;2024 OVERWORLD_DYNAMICS // QUEST_STAR_SYSTEM</div>
      </div>
      <div className="foot-note">
        Forecasts:{" "}
        <a href="https://open-meteo.com" target="_blank" rel="noopener">
          Open-Meteo
        </a>{" "}
        (marine + weather models). SST: NASA JPL MUR. Chlorophyll: NOAA NESDIS CoastWatch (VIIRS), via{" "}
        <a href="https://coastwatch.pfeg.noaa.gov/erddap/" target="_blank" rel="noopener">
          NOAA ERDDAP
        </a>
        . Free public data, a planning aid, not for navigation or safety-of-life decisions. Built for
        Maya.
      </div>
    </footer>
  );
}
