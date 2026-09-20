import { NextResponse } from "next/server";
import { fetchSite } from "@/lib/api/openMeteo";
import { SPOTS } from "@/lib/data/regions";
import { score10, slotCells } from "@/lib/logic/rating";

// 7 days of 10am/1pm/4pm slots for the ESP32 e-ink display:
//   {"time":"10 AM","rating":7,"height":"2.1m","heightDirection":"SW","energy":"1234 kJ","wind":"15 kmh","windDirection":"SW"}
// Same numbers as the site's forecast table (score10, swell, energy, wind km/h).

// ?spot=<id> from the device's own config (its captive portal); unknown or
// missing falls back to Diamond Bay so an unconfigured unit still shows something.
const FALLBACK = "diamond";
const SLOTS: [number, string][] = [
  [10, "10 AM"],
  [13, "1 PM"],
  [16, "4 PM"],
];

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("spot");
  // Object.hasOwn, not a truthiness check: "constructor" would otherwise pass.
  const SPOT = id && Object.hasOwn(SPOTS, id) ? SPOTS[id] : SPOTS[FALLBACK];
  try {
    // One fetchSite call covers all 7 days (Open-Meteo is call-budget limited).
    const { rows, hourly } = await fetchSite(SPOT);
    const runoff: Record<string, number> = {};
    rows.forEach((r) => (runoff[r.date] = r.runoff));
    const wIdx: Record<string, number> = {};
    hourly.wtime.forEach((t, i) => (wIdx[t] = i));

    const slot = (date: string, hour: number, time: string) => {
      const t = `${date}T${String(hour).padStart(2, "0")}:00`;
      const i = hourly.mtime.indexOf(t);
      const wi = wIdx[t];
      const h = i < 0 ? null : (hourly.swellH[i] ?? null);
      const p = i < 0 ? null : (hourly.swellP[i] ?? null);
      const sd = i < 0 ? null : (hourly.swellD[i] ?? null);
      const wind = wi == null ? null : (hourly.wind[wi] ?? null);
      const wdir = wi == null ? null : (hourly.wdir[wi] ?? null);
      return {
        time,
        rating: score10(SPOT, h, wind, wdir, runoff[date] ?? null),
        // Same strings the site's table shows, blanked the same way on
        // sheltered water — see slotCells().
        ...slotCells(SPOT, { h, p, sd, wind, wdir }),
      };
    };

    const days = rows.map((r) => ({
      date: r.date,
      slots: SLOTS.map(([hour, time]) => slot(r.date, hour, time)),
    }));

    return NextResponse.json(
      { spot: SPOT.id, name: SPOT.name, days },
      { headers: { "Cache-Control": "s-maxage=600, stale-while-revalidate=3600" } },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to build forecast" }, { status: 500 });
  }
}
