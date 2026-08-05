import DiveSitesClient from "@/components/dive/DiveSitesClient";

export const metadata = {
  title: "Dive sites — GIMMIE SICK VIS",
  description:
    "Swell, wind and tide forecasts for Victorian dive and fishing sites, from Port Phillip Heads to the Surf Coast — see which spots will have vis today.",
};

export default function DiveSites() {
  return <DiveSitesClient />;
}
