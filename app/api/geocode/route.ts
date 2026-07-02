import { NextResponse } from "next/server";

// Server proxy for Nominatim reverse geocoding (replaces the old client JSONP).
// Cached so we respect Nominatim's usage policy under load.
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const lat = Number(sp.get("lat"));
  const lon = Number(sp.get("lon"));
  if (!isFinite(lat) || !isFinite(lon)) return NextResponse.json({ name: null }, { status: 400 });
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&zoom=10&addressdetails=1&lat=${lat}&lon=${lon}`,
      { headers: { "User-Agent": "DIVEBYTE/1.0 (dive conditions dashboard)" }, next: { revalidate: 86400 } },
    );
    const d = await r.json();
    const a = d?.address || {};
    const name = a.hamlet || a.village || a.town || a.suburb || a.city || a.county || a.state || null;
    return NextResponse.json({ name });
  } catch {
    return NextResponse.json({ name: null });
  }
}
