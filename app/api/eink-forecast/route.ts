import { NextResponse } from "next/server";
import { fetchSite } from "@/lib/api/openMeteo";
import { SPOTS } from "@/lib/data/regions";
import { KN } from "@/lib/data/thresholds";
import { compass, score10 } from "@/lib/logic/rating";

// 7 days of AM/PM readings for the e-ink display, 6 short lines a day:
//   ["AM", "R7 0.8m", "15 SW", "PM", "R5 1.1m", "17 SW"]
// Same data and score as the site's forecast table (score10, 1-10).

const SPOT = SPOTS.diamond;
const AM_HOUR = 10;
const PM_HOUR = 16;

export async function GET() {
  try {
    // One fetchSite call covers all 7 days (Open-Meteo is call-budget limited).
    const { rows, hourly } = await fetchSite(SPOT);
    const runoff: Record<string, number> = {};
    rows.forEach((r) => (runoff[r.date] = r.runoff));
    const wIdx: Record<string, number> = {};
    hourly.wtime.forEach((t, i) => (wIdx[t] = i));

    // ponytail: exact hour lookup — the API returns every hour, no nearest-slot search needed
    const slot = (date: string, hour: number, label: string) => {
      const t = `${date}T${String(hour).padStart(2, "0")}:00`;
      const i = hourly.mtime.indexOf(t);
      const wi = wIdx[t];
      if (i < 0 || wi == null) return [label, "-", "-"];
      const h = hourly.swellH[i] ?? null;
      const wind = hourly.wind[wi] ?? null;
      const wdir = hourly.wdir[wi] ?? null;
      const sc = score10(SPOT, h, wind, wdir, runoff[date] ?? null);
      return [
        label,
        `${sc != null ? `R${sc}` : ""} ${h != null ? `${h.toFixed(1)}m` : ""}`.trim() || "-",
        wind != null ? `${Math.round(wind / KN)} ${compass(wdir)}`.trim() : "-",
      ];
    };

    const week = rows.map((r) => ({
      date: r.date,
      lines: [...slot(r.date, AM_HOUR, "AM"), ...slot(r.date, PM_HOUR, "PM")],
    }));

    return NextResponse.json(
      { week },
      { headers: { "Cache-Control": "s-maxage=1800, stale-while-revalidate=3600" } },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to build forecast" }, { status: 500 });
  }
}
