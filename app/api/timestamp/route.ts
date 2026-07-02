import { NextResponse } from "next/server";
import { BASE } from "@/lib/api/erddap";

// Server proxy for the ERDDAP "latest data time" query. Replaces the old
// client-side JSONP (fetchLastTime) — no CORS/JSONP hack needed server-side.
// Cached for an hour so we don't hammer ERDDAP per visitor.
export async function GET(req: Request) {
  const ds = new URL(req.url).searchParams.get("ds") || "jplMURSST41";
  // Only allow known dataset ids (avoid an open proxy).
  if (!/^[A-Za-z0-9_]+$/.test(ds)) {
    return NextResponse.json({ time: null }, { status: 400 });
  }
  try {
    const r = await fetch(`${BASE}${ds}.json?time%5B(last)%5D`, {
      next: { revalidate: 3600 },
    });
    const j = await r.json();
    const time = j?.table?.rows?.[0]?.[0] ?? null;
    return NextResponse.json({ time });
  } catch {
    return NextResponse.json({ time: null });
  }
}
