import { after } from "next/server";
import SstGallery from "@/components/SstGallery";
import { sstDays, sstStretch, warmSstThumbs } from "@/lib/api/erddap";

export const metadata = {
  title: "Sea temperature — GIMMIE SICK VIS",
  description:
    "Live sea-surface temperature for Victorian waters from NOAA ACSPO satellite passes, with the sharp thermal fronts picked out.",
};
// Re-prerender hourly so "latest" tracks NOAA publishing (~1-day latency);
// regeneration runs in the background, so visitors always get a stored page.
export const revalidate = 3600;

export default async function Sst() {
  const { latest, days, times, bad, latestGood } = await sstDays();
  const stretch = await sstStretch(latestGood);
  after(() => warmSstThumbs(stretch, days));
  return <SstGallery latest={latest} days={days} times={times} bad={bad} stretch={stretch} />;
}
