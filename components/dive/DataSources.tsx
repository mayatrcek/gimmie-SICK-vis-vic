// Where every number on this page comes from. Server-rendered on purpose: the
// rest of /forecast is client-only, so this doubles as something a crawler can
// read. Keep it honest — if a feed changes, change it here too.
const A = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener">
    {children}
  </a>
);

export default function DataSources() {
  return (
    <div className="panel" id="sources">
      <div className="panel-hd">
        <h2 className="panel-ttl">Where the data comes from</h2>
      </div>
      <div className="panel-bd guide" style={{ padding: "18px 20px" }}>
        <p className="sub">
          Everything here is free, public data. Nothing is scraped, nothing is behind a login, and
          no reading is invented — where a forecast is a model rather than a measurement, it says
          so.
        </p>

        <h3>The rating, and the swell / wind / rain rows</h3>
        <ul>
          <li>
            <b>Swell height, period and direction; water temperature</b> —{" "}
            <A href="https://open-meteo.com/en/docs/marine-weather-api">Open-Meteo Marine API</A>,
            hourly, seven days out.
          </li>
          <li>
            <b>Wind speed and direction, rainfall</b> —{" "}
            <A href="https://open-meteo.com/en/docs">Open-Meteo Forecast API</A>. Rain is also
            pulled for the week just gone, because yesterday&rsquo;s runoff is still in the water.
          </li>
          <li>
            The 1&ndash;10 score is ours, not theirs: it combines those three with each site&rsquo;s
            aspect and how dirty it goes after rain.
          </li>
        </ul>

        <h3>Tides</h3>
        <ul>
          <li>
            Predicted from <b>harmonic constituents we fitted ourselves</b> to years of measured sea
            level — the same maths tide tables use, so the times are turning points rather than
            hourly samples.
          </li>
          <li>
            <b>Lorne, Stony Point and Portland</b> gauges:{" "}
            <A href="http://www.bom.gov.au/oceanography/projects/abslmp/data/">
              Bureau of Meteorology, Australian Baseline Sea Level Monitoring Project
            </A>{" "}
            (hourly, 2022&ndash;2025 fitted). Checked against the Bureau&rsquo;s own 2026
            predictions, which were not part of the fit: within 1&ndash;4 cm.
          </li>
          <li>
            <b>Williamstown</b>, for the top and east of Port Phillip:{" "}
            <A href="https://data.csiro.au/collection/csiro:55471">
              CSIRO, Williamstown tide gauge data
            </A>{" "}
            (CC BY 4.0).
          </li>
          <li>
            Each site borrows the gauge that matches its tidal regime, named in the tide row.
            Inside Port Phillip the tide is a wave crawling in through the Heads and dying as it
            goes &mdash; 20 minutes behind the open coast at Point Lonsdale, an hour at Portsea,
            three and a half in the South Channel, with the range falling away too &mdash; so bay
            sites carry the offset and damping their own spot has, worked out against published
            tide predictions. Heights are drawn against the week&rsquo;s lowest tide rather than
            chart datum, so they read lower than a tide table&rsquo;s.
            Wilsons Prom, Gippsland, the Mornington back beaches and the Phillip Island surf coast
            have no public gauge nearby, so they fall back to Open-Meteo&rsquo;s global tide model,
            delay-corrected and labelled <i>modelled</i>.
          </li>
        </ul>

        <h3>The maps under Live data</h3>
        <ul>
          <li>
            <b>Sea-surface temperature</b> — NOAA ACSPO L3S 2 km, via{" "}
            <A href="https://coastwatch.noaa.gov/erddap/">NOAA CoastWatch ERDDAP</A>.
          </li>
          <li>
            <b>Chlorophyll</b> — VIIRS on NOAA-20, NOAA-21 and Suomi NPP, via{" "}
            <A href="https://nasa-gibs.github.io/gibs-api-docs/">NASA GIBS</A>. Roughly a day
            behind, and cloud eats the scans.
          </li>
          <li>
            <b>True-colour satellite</b> — Sentinel-2 through the{" "}
            <A href="https://dataspace.copernicus.eu/">Copernicus Data Space Ecosystem</A>.
          </li>
          <li>
            <b>Point Nepean waves</b> — the public{" "}
            <A href="https://portweather-public.omcinternational.com/">OMC International</A> buoy
            dashboard, embedded as-is.
          </li>
        </ul>

        <h3>Maps and seabed</h3>
        <ul>
          <li>
            <b>Depth and contours</b> —{" "}
            <A href="https://www.marineandcoasts.vic.gov.au/">DEECA CoastKit (Victoria)</A>, with
            Mapzen/ETOPO1 terrarium tiles behind the pixel map.
          </li>
          <li>
            <b>Basemaps</b> — Esri (Ocean Base, World Imagery), GEBCO and NOAA.
          </li>
        </ul>

        <p className="note">
          Ratings and seabed labels are indicative and for planning only. Always check official
          forecasts, tides and safety information before you get in the water.
        </p>
      </div>
    </div>
  );
}
