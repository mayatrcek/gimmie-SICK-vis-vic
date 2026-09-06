import { NextResponse } from "next/server";
import { erddapFetch, latestGoodDay, meanFromCsv, sstPointURL } from "@/lib/api/erddap";

// Server proxy for the SST map's click probe: nearest-cell temperature at
// lat/lon (optionally for a past ?day=). Coordinates are rounded to 0.01°
// so repeat clicks share the hourly fetch cache. Outside the data region
// (or under cloud/land) the reading is null.
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const lat = Math.round(Number(q.get("lat")) * 100) / 100;
  const lon = Math.round(Number(q.get("lon")) * 100) / 100;
  const day = q.get("day") ?? undefined;
  // ?box=1 averages a ~±0.06° box — used by dive cards, whose shoreline
  // coordinates usually have a land/cloud cell as their nearest neighbour.
  const box = q.get("box") ? 0.06 : 0;
  if (day && !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    return NextResponse.json({ sst: null }, { status: 400 });
  }
  if (!(lat >= -41.2 && lat <= -33.8 && lon >= 139.5 && lon <= 150.8)) {
    return NextResponse.json({ sst: null });
  }
  try {
    // No explicit day = "current", which must not land on a flagged scan;
    // undefined (QC fetch failed) falls back to ERDDAP's (last).
    const d = day ?? (await latestGoodDay());
    const r = await erddapFetch(sstPointURL(lat, lon, d, box));
    return NextResponse.json({ sst: meanFromCsv(await r.text()) });
  } catch {
    return NextResponse.json({ sst: null });
  }
}
