import ChlorophyllGallery from "@/components/geo/ChlorophyllGallery";
import { latestDays, SATS } from "@/components/geo/gibs";

export const metadata = { title: "Chlorophyll — GIMMIE SICK VIS" };
// Re-prerender hourly so "latest" tracks GIBS publishing (~1-day latency).
export const revalidate = 3600;

export default async function Chlorophyll() {
  const lists = await Promise.all(SATS.map((s) => latestDays(s)));
  const daysBySat = Object.fromEntries(SATS.map((s, i) => [s.id, lists[i]]));
  return <ChlorophyllGallery daysBySat={daysBySat} />;
}
