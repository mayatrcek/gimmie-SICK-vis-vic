import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="foot-grid">
        <Link className="foot-brand" href="/">
          GIMMIE SICK VIS
        </Link>
        <div className="foot-links">
          <Link href="/">Links</Link>
          <Link href="/about">Data sources</Link>
          <Link href="/feedback">Contact</Link>
        </div>
        <div className="foot-meta">&copy; 2026 Built by Maya, in the water more than at the desk</div>
      </div>
      <div className="foot-note">
        Forecasts:{" "}
        <a href="https://open-meteo.com" target="_blank" rel="noopener">
          Open-Meteo
        </a>{" "}
        (marine + weather models). SST: NOAA ACSPO. Chlorophyll: NOAA NESDIS CoastWatch (VIIRS), via{" "}
        <a href="https://coastwatch.pfeg.noaa.gov/erddap/" target="_blank" rel="noopener">
          NOAA ERDDAP
        </a>
        . Free public data, a planning aid, not for navigation or safety-of-life decisions. Built for
        Maya.
      </div>
    </footer>
  );
}
