import ChlorophyllGallery from "@/components/geo/ChlorophyllGallery";
import { latestDays, SATS, scanTimes } from "@/components/geo/gibs";

export const metadata = {
  title: "Chlorophyll — GIMMIE SICK VIS",
  description:
    "Daily satellite chlorophyll scans (NOAA-20, NOAA-21, Suomi NPP) for the Victorian coast — plankton blooms are what kill your visibility.",
};
// Re-prerender hourly so "latest" tracks GIBS publishing (~1-day latency).
export const revalidate = 3600;

export default async function Chlorophyll() {
  const [lists, times] = await Promise.all([
    Promise.all(SATS.map((s) => latestDays(s))),
    Promise.all(SATS.map((s) => scanTimes(s))),
  ]);
  const daysBySat = Object.fromEntries(SATS.map((s, i) => [s.id, lists[i]]));
  const timesBySat = Object.fromEntries(SATS.map((s, i) => [s.id, times[i]]));
  return <ChlorophyllGallery daysBySat={daysBySat} timesBySat={timesBySat} />;
}
