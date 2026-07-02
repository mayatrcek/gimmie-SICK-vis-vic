import { NextResponse } from "next/server";
import { habFromFeatures } from "@/lib/data/geoGroups";

// Seamap Australia WMS GetFeatureInfo proxy — the client passes the projected
// bbox + pixel x/y for the current map view; we fetch and classify server-side.
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const bbox = sp.get("bbox");
  const width = sp.get("width");
  const height = sp.get("height");
  const x = sp.get("x");
  const y = sp.get("y");
  if (!bbox || !width || !height || x == null || y == null) {
    return NextResponse.json({ raw: null }, { status: 400 });
  }
  const url =
    "https://geoserver.imas.utas.edu.au/geoserver/seamap/wms?service=WMS&version=1.1.1&request=GetFeatureInfo" +
    "&layers=SeamapAus_National_Benthic_Habitat_Layer&query_layers=SeamapAus_National_Benthic_Habitat_Layer" +
    `&feature_count=10&buffer=3&srs=EPSG:3857&width=${width}&height=${height}&bbox=${bbox}&x=${x}&y=${y}` +
    "&info_format=application/json";
  try {
    const r = await fetch(url);
    const j = await r.json();
    return NextResponse.json({ raw: habFromFeatures(j?.features || []) });
  } catch {
    return NextResponse.json({ raw: null });
  }
}
