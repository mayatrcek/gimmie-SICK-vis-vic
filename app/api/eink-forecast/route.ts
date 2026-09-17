import { NextResponse } from "next/server";
import { fetchSite } from "@/lib/api/openMeteo";
import { SPOTS } from "@/lib/data/regions";
import { compass, score10 } from "@/lib/logic/rating";

// 7 days of 10am/1pm/4pm slots for Diamond Bay, for the ESP32 e-ink display:
//   {"time":"10 AM","rating":7,"heightDir":"2.1m SW","energy":"1234 kJ","windDir":"15 kmh SW"}
// Same numbers as the site's forecast table (score10, swell, energy, wind km/h).

const SPOT = SPOTS.diamond;
const SLOTS: [number, string][] = [
  [10, "10 AM"],
  [13, "1 PM"],
  [16, "4 PM"],
];

export async function GET() {
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
        heightDir: h == null ? "-" : `${h.toFixed(1)}m ${compass(sd)}`.trim(),
        // same pseudo-kJ as ForecastTable's Energy row
        energy: h == null || p == null ? "-" : `${Math.round(28 * h * h * p)} kJ`,
        windDir: wind == null ? "-" : `${Math.round(wind)} kmh ${compass(wdir)}`.trim(),
      };
    };

    const days = rows.map((r) => ({
      date: r.date,
      slots: SLOTS.map(([hour, time]) => slot(r.date, hour, time)),
    }));

    return NextResponse.json(
      { days },
      { headers: { "Cache-Control": "s-maxage=1800, stale-while-revalidate=3600" } },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to build forecast" }, { status: 500 });
  }
}
