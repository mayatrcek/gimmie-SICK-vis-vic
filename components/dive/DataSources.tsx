// Where every number on this page comes from, one line each. Server-rendered on
// purpose: the rest of /forecast is client-only, so this is what a crawler reads.
// Keep it honest and keep it short: if a feed changes, change it here too.
const SOURCES: [string, string, string?][] = [
  ["Swell height", "Open-Meteo Marine", "https://open-meteo.com/en/docs/marine-weather-api"],
  ["Swell period", "Open-Meteo Marine", "https://open-meteo.com/en/docs/marine-weather-api"],
  ["Swell direction", "Open-Meteo Marine", "https://open-meteo.com/en/docs/marine-weather-api"],
  ["Water temperature", "Open-Meteo Marine", "https://open-meteo.com/en/docs/marine-weather-api"],
  ["Wind speed", "Open-Meteo Forecast", "https://open-meteo.com/en/docs"],
  ["Wind direction", "Open-Meteo Forecast", "https://open-meteo.com/en/docs"],
  ["Rainfall", "Open-Meteo Forecast", "https://open-meteo.com/en/docs"],
  ["Tides", "Bureau of Meteorology sea level gauges", "http://www.bom.gov.au/oceanography/projects/abslmp/data/"],
  ["Tides, Port Phillip", "CSIRO Williamstown gauge", "https://data.csiro.au/collection/csiro:55471"],
  ["Tides, sites with no gauge", "Open-Meteo", "https://open-meteo.com/en/docs/marine-weather-api"],
  ["Sea temperature", "NOAA ACSPO", "https://coastwatch.noaa.gov/erddap/"],
  ["Chlorophyll", "NASA GIBS", "https://nasa-gibs.github.io/gibs-api-docs/"],
  ["Satellite imagery", "Copernicus Sentinel-2", "https://dataspace.copernicus.eu/"],
  ["Wave buoy", "OMC International", "https://portweather-public.omcinternational.com/"],
  ["Depth and contours", "DEECA CoastKit", "https://www.marineandcoasts.vic.gov.au/"],
  ["Basemaps", "Esri", "https://www.esri.com/"],
];

export default function DataSources() {
  return (
    <div className="panel" id="sources">
      <div className="panel-hd">
        <h2 className="panel-ttl">Where the data comes from</h2>
      </div>
      <div className="panel-bd">
        <p className="srcs-rating">
          1&ndash;10 rating: subjective to the reader. Below 5 is not recommended. Above 7 implies
          comfortable dive conditions.
        </p>
        <dl className="srcs">
          {SOURCES.map(([what, source, href]) => (
            <div key={what}>
              <dt>{what}:</dt>
              <dd>
                {href ? (
                  <a href={href} target="_blank" rel="noopener">
                    {source}
                  </a>
                ) : (
                  source
                )}
              </dd>
            </div>
          ))}
        </dl>
        <p className="srcs-note">
          For planning only. Check official forecasts and tides before you get in the water.
        </p>
      </div>
    </div>
  );
}
