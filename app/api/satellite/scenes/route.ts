import { NextResponse } from "next/server";
import { CLOUD_THRESHOLD, VIC_COAST_BBOX, getToken } from "@/lib/api/sentinel";

// Low-cloud Sentinel-2 dates over the VIC coast from the last 30 days, newest
// first. Server proxy: the catalog needs the CDSE bearer token, same as the
// tile/thumbnail routes. Rechecked hourly, not on every load.
export async function GET() {
  try {
    const token = await getToken();
    const [minLon, minLat, maxLon, maxLat] = VIC_COAST_BBOX;
    const wkt = `POLYGON((${minLon} ${minLat},${maxLon} ${minLat},${maxLon} ${maxLat},${minLon} ${maxLat},${minLon} ${minLat}))`;
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const filter = [
      `Collection/Name eq 'SENTINEL-2'`,
      `OData.CSC.Intersects(area=geography'SRID=4326;${wkt}')`,
      `ContentDate/Start gt ${since}`,
      `Attributes/OData.CSC.DoubleAttribute/any(att:att/Name eq 'cloudCover' and att/OData.CSC.DoubleAttribute/Value lt ${CLOUD_THRESHOLD})`,
    ].join(" and ");

    // $expand=Attributes: the filter above can test Attributes without it, but
    // the response only includes the Attributes nav property (cloudCover) when
    // it's explicitly expanded.
    const url = `https://catalogue.dataspace.copernicus.eu/odata/v1/Products?$filter=${encodeURIComponent(
      filter,
    )}&$expand=Attributes&$orderby=ContentDate/Start desc`;

    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`${res.status}`);
    const { value } = await res.json();

    type Product = { Id: string; ContentDate: { Start: string }; Attributes?: { Name: string; Value: number }[] };
    // The AOI spans several Sentinel-2 MGRS tiles, so one pass yields many
    // granule products per day — collapse to the lowest-cloud granule per date
    // so the gallery shows one card per date, per the feature brief.
    const byDate = new Map<string, Product>();
    for (const p of value as Product[]) {
      const date = p.ContentDate.Start.slice(0, 10);
      const cover = p.Attributes?.find((a) => a.Name === "cloudCover")?.Value ?? Infinity;
      const existing = byDate.get(date);
      const existingCover = existing?.Attributes?.find((a) => a.Name === "cloudCover")?.Value ?? Infinity;
      if (!existing || cover < existingCover) byDate.set(date, p);
    }
    const scenes = Array.from(byDate.values())
      .sort((a, b) => b.ContentDate.Start.localeCompare(a.ContentDate.Start))
      .map((p) => ({
        id: p.Id,
        date: p.ContentDate.Start.slice(0, 10),
        cloudCover: p.Attributes?.find((a) => a.Name === "cloudCover")?.Value ?? null,
      }));

    return NextResponse.json(
      { scenes },
      { headers: { "Cache-Control": "public, max-age=3600" } },
    );
  } catch {
    return NextResponse.json({ scenes: [] });
  }
}
