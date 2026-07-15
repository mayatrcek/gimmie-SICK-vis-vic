import { NextResponse } from "next/server";
import { erddapFetch, frontsFromCsv, sstFrontsURL } from "@/lib/api/erddap";

// Server proxy for detected thermal-front cells (avoids CORS and keeps the
// ~2 MB source CSV off the client — the response is ~20 KB of [lat, lon]).
// Cached hourly, same cadence as /api/sst-mean. Optional ?day=YYYY-MM-DD
// for the gallery's daily maps; no day = latest.
export async function GET(req: Request) {
  const day = new URL(req.url).searchParams.get("day") ?? undefined;
  if (day && !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    return NextResponse.json({ pts: [] }, { status: 400 });
  }
  try {
    const r = await erddapFetch(sstFrontsURL(day));
    return NextResponse.json({ pts: frontsFromCsv(await r.text()) });
  } catch {
    return NextResponse.json({ pts: [] });
  }
}
