import { NextResponse } from "next/server";
import { erddapFetch, sstDaysFromCsv, sstDaysURL } from "@/lib/api/erddap";

// Per-day metadata for the last 12 SST grid days: median measurement time
// (Melbourne local, keyed by day) and `bad`, the days whose scan failed the
// out-of-family check. erddapFetch caches the ~1.3 MB CSV for an hour.
export async function GET() {
  try {
    const r = await erddapFetch(sstDaysURL());
    if (!r.ok) throw new Error(`${r.status}`);
    const { times, bad } = sstDaysFromCsv(await r.text());
    return NextResponse.json({ times, bad });
  } catch {
    return NextResponse.json({ times: {}, bad: [] });
  }
}
