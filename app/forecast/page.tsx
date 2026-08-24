import DiveSitesClient from "@/components/dive/DiveSitesClient";
import { REGIONS } from "@/lib/data/regions";

export const metadata = {
  title: "Dive Forecast — Melbourne & Victorian Dive Sites",
  description:
    "Swell, wind and tide forecasts for dive and fishing sites around Melbourne — Port Phillip Bay, Western Port, the Mornington Peninsula back beaches and the Surf Coast. See which spots will have vis today.",
};

export default function DiveSites() {
  return (
    <>
      <div className="panel">
        <div className="panel-hd">
          <h1 className="panel-ttl">Dive forecast &mdash; Melbourne &amp; Victoria</h1>
        </div>
        <div className="panel-bd guide">
          <p>
            A daily diving and fishing forecast for the water around Melbourne. Every site below
            is scored out of 10 from live swell, wind, tide and rainfall data, so you can see at a
            glance which spots are worth the drive and which ones will be a washing machine.
          </p>
          <p>
            Coverage runs from the sheltered piers and wrecks inside <b>Port Phillip Bay</b> and
            the silty tide-run of <b>Western Port</b>, out through the{" "}
            <b>Mornington Peninsula back beaches</b>{" "}
            at Portsea, Sorrento, Rye and Gunnamatta, and
            along the open coast &mdash; the Bellarine, the Surf Coast, Phillip Island, Gippsland,
            Wilsons Promontory and the Shipwreck Coast.
          </p>
          <p>
            New to reading a forecast? Start with the{" "}
            <a href="/back-beach">back beach forecasting guide</a>, which explains how swell
            height, period, wind and tide combine into a diveable day.
          </p>
        </div>
      </div>

      <DiveSitesClient />

      <div className="panel">
        <div className="panel-hd">
          <h2 className="panel-ttl">All dive sites</h2>
        </div>
        <div className="panel-bd guide">
          <p>
            Every spot currently forecast, grouped by region. Pick one from the site selector
            above to see its 7-day outlook.
          </p>
          <div className="sitedex">
            {REGIONS.map((r) => (
              <section key={r.region}>
                <h3>{r.region}</h3>
                <ul>
                  {r.spots.map((s) => (
                    <li key={s.id}>{s.name}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
