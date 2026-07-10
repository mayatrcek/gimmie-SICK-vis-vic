import { NextResponse } from "next/server";

// DEECA CoastKit bathy-contour identify proxy (replaces the old client JSONP).
// Client passes the projected click point, map extent and pixel size; we return
// the raw identify results and the client picks the nearest contour.
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const geometry = sp.get("geometry"); // "x,y" in EPSG:3857
  const mapExtent = sp.get("mapExtent"); // "swx,swy,nex,ney"
  const imageDisplay = sp.get("imageDisplay"); // "w,h,96"
  if (!geometry || !mapExtent || !imageDisplay) {
    return NextResponse.json({ results: [] }, { status: 400 });
  }
  const url =
    "https://biod-gis.mapshare.vic.gov.au/arcgis/rest/services/CoastKit/BathyContours/MapServer/identify" +
    "?f=json&geometryType=esriGeometryPoint&sr=3857&returnGeometry=true&tolerance=200" +
    `&geometry=${geometry}&mapExtent=${mapExtent}&imageDisplay=${imageDisplay}&layers=all`;
  try {
    const r = await fetch(url, { headers: { "User-Agent": "GIMMIE SICK VIS/1.0" } });
    const j = await r.json();
    return NextResponse.json({ results: j?.results || [] });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
