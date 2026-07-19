import { NextResponse } from "next/server";
import { erddapFetch, medianTimesFromCsv, sstDtimeURL } from "@/lib/api/erddap";

// Median measurement time per day for the last 12 SST grid days (Melbourne
// local strings keyed by day). erddapFetch caches the ~1 MB CSV for an hour.
export async function GET() {
  try {
    const r = await erddapFetch(sstDtimeURL());
    if (!r.ok) throw new Error(`${r.status}`);
    return NextResponse.json({ times: medianTimesFromCsv(await r.text()) });
  } catch {
    return NextResponse.json({ times: {} });
  }
}
