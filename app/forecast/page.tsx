import DiveSitesClient from "@/components/dive/DiveSitesClient";

export const metadata = {
  title: "Dive Forecast — Melbourne & Victorian Dive Sites",
  description:
    "Swell, wind and tide forecasts for dive and fishing sites around Melbourne — Port Phillip Bay, Western Port, the Mornington Peninsula back beaches and the Surf Coast. See which spots will have vis today.",
};

export default function DiveSites() {
  return (
    <>
      {/* The page's only server-rendered heading: the visible "Dive sites" h2 lives
          inside DiveSitesClient, which is ssr:false, so a crawler would otherwise
          land on a page with no heading at all. */}
      <h1 className="sr-only">Dive forecast — Melbourne &amp; Victoria</h1>
      <DiveSitesClient />
    </>
  );
}
