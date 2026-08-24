import DiveSitesClient from "@/components/dive/DiveSitesClient";
import SnaggleInfo from "@/components/SnaggleInfo";
import { REGIONS } from "@/lib/data/regions";

export const metadata = {
  title: "Dive Forecast — Melbourne & Victorian Dive Sites",
  description:
    "Swell, wind and tide forecasts for dive and fishing sites around Melbourne — Port Phillip Bay, Western Port, the Mornington Peninsula back beaches and the Surf Coast. See which spots will have vis today.",
};

// Plain-text mirror of the note below — the shark types this, then swaps in the
// rich version (links + the site index).
const INTRO =
  "A daily diving and fishing forecast for the water around Melbourne. Every site below is scored out of 10 from live swell, wind, tide and rainfall data, so you can see at a glance which spots are worth the drive and which ones will be a washing machine. Coverage runs from the sheltered piers and wrecks inside Port Phillip Bay and the silty tide-run of Western Port, out through the Mornington Peninsula back beaches at Portsea, Sorrento, Rye and Gunnamatta, and along the open coast — the Bellarine, the Surf Coast, Phillip Island, Gippsland, Wilsons Promontory and the Shipwreck Coast.";

export default function DiveSites() {
  return (
    <>
      <div className="panel">
        <div className="panel-hd">
          <h1 className="panel-ttl">Dive forecast &mdash; Melbourne &amp; Victoria</h1>
          <SnaggleInfo text={INTRO}>
            <div className="guide">
              <p>
                A daily diving and fishing forecast for the water around Melbourne. Every site
                below is scored out of 10 from live swell, wind, tide and rainfall data, so you
                can see at a glance which spots are worth the drive and which ones will be a
                washing machine.
              </p>
              <p>
                Coverage runs from the sheltered piers and wrecks inside <b>Port Phillip Bay</b>{" "}
                and the silty tide-run of <b>Western Port</b>, out through the{" "}
                <b>Mornington Peninsula back beaches</b>{" "}
                at Portsea, Sorrento, Rye and Gunnamatta, and
                along the open coast &mdash; the Bellarine, the Surf Coast, Phillip Island,
                Gippsland, Wilsons Promontory and the Shipwreck Coast.
              </p>
              <p>
                New to reading a forecast? Start with the{" "}
                <a href="/back-beach">back beach forecasting guide</a>, which explains how swell
                height, period, wind and tide combine into a diveable day.
              </p>
              <h2>All dive sites</h2>
              <p>
                Every spot currently forecast, grouped by region. Pick one from the site selector
                below to see its 7-day outlook.
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
          </SnaggleInfo>
        </div>
      </div>

      <DiveSitesClient />
    </>
  );
}
