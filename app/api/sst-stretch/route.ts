import { NextResponse } from "next/server";
import { erddapFetch, stretchFromCsv, sstStretchURL } from "@/lib/api/erddap";

// Server proxy for the regional colour stretch (2nd–98th percentile SST;
// avoids CORS). Cached hourly, same cadence as /api/timestamp.
export async function GET() {
  try {
    const r = await erddapFetch(sstStretchURL());
    return NextResponse.json(stretchFromCsv(await r.text()) ?? { min: null, max: null });
  } catch {
    return NextResponse.json({ min: null, max: null });
  }
}
