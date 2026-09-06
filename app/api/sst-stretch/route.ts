import { NextResponse } from "next/server";
import { erddapFetch, latestGoodDay, stretchFromCsv, sstStretchURL } from "@/lib/api/erddap";

// Server proxy for the regional colour stretch (2nd–98th percentile SST;
// avoids CORS). Read off the latest day that passed QC — a flagged scan's
// blown-out range would stretch all 12 thumbs wrong. Cached hourly, same
// cadence as /api/timestamp.
export async function GET() {
  try {
    const r = await erddapFetch(sstStretchURL(10, await latestGoodDay()));
    return NextResponse.json(stretchFromCsv(await r.text()) ?? { min: null, max: null });
  } catch {
    return NextResponse.json({ min: null, max: null });
  }
}
