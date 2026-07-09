import { NextResponse } from "next/server";
import { meanFromCsv, sstMeanURL } from "@/lib/api/erddap";

// Server proxy for the regional SST mean (avoids CORS; feeds the
// map's colour-bar stretch). Cached hourly, same cadence as /api/timestamp.
export async function GET() {
  try {
    const r = await fetch(sstMeanURL(), { next: { revalidate: 3600 } });
    const mean = meanFromCsv(await r.text());
    return NextResponse.json({ mean });
  } catch {
    return NextResponse.json({ mean: null });
  }
}
