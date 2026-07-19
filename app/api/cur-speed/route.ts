import { NextResponse } from "next/server";
import { PNG } from "pngjs";
import { curSpeedCsvURL, erddapFetch } from "@/lib/api/erddap";

// Current speed |u,v| as a native-resolution PNG (one pixel per 0.25° cell,
// ~46×42) — the browser's smooth upscale turns it into the gradient behind
// the arrows. OVERWORLD ramp: sea navy (calm) → accent blue → warm → red.
const STOPS: [number, [number, number, number]][] = [
  [0.0, [0x16, 0x34, 0x4a]],
  [0.35, [0x2e, 0x5d, 0xd6]],
  [0.7, [0xe2, 0x52, 0x2e]],
  [1.0, [0xa8, 0x20, 0x0d]],
];

function ramp(v: number): [number, number, number] {
  const x = Math.min(v, 1);
  for (let i = 1; i < STOPS.length; i++) {
    if (x <= STOPS[i][0]) {
      const [a, ca] = STOPS[i - 1];
      const [b, cb] = STOPS[i];
      const f = (x - a) / (b - a);
      return [0, 1, 2].map((k) => Math.round(ca[k] + (cb[k] - ca[k]) * f)) as [number, number, number];
    }
  }
  return STOPS[STOPS.length - 1][1];
}

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const day = p.get("day") ?? undefined;
  const frame = p.get("frame") === "map" ? "map" : "card";
  if (day && !/^\d{4}-\d{2}-\d{2}$/.test(day)) return new NextResponse(null, { status: 400 });
  try {
    const r = await erddapFetch(curSpeedCsvURL(day, frame));
    if (!r.ok) throw new Error(`${r.status}`);
    // rows: time,lat,lon,u,v — lat/lon ascending from ERDDAP
    const speeds = new Map<string, number>();
    const lats = new Set<number>();
    const lons = new Set<number>();
    for (const line of (await r.text()).trim().split("\n").slice(2)) {
      const [, lat, lon, u, v] = line.split(",");
      lats.add(Number(lat));
      lons.add(Number(lon));
      speeds.set(`${lat},${lon}`, Math.hypot(Number(u), Number(v)));
    }
    const la = [...lats], lo = [...lons];
    const png = new PNG({ width: lo.length, height: la.length });
    for (let y = 0; y < la.length; y++) {
      const lat = la[la.length - 1 - y]; // top row = max latitude
      for (let x = 0; x < lo.length; x++) {
        const s = speeds.get(`${lat},${lo[x]}`);
        const j = (y * lo.length + x) * 4;
        if (s == null || !Number.isFinite(s)) continue; // land → transparent
        const [cr, cg, cb] = ramp(s);
        png.data[j] = cr;
        png.data[j + 1] = cg;
        png.data[j + 2] = cb;
        png.data[j + 3] = 255;
      }
    }
    return new NextResponse(new Uint8Array(PNG.sync.write(png)), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    // 1x1 transparent png — layers simply show nothing
    const empty = new PNG({ width: 1, height: 1 });
    return new NextResponse(new Uint8Array(PNG.sync.write(empty)), {
      headers: { "Content-Type": "image/png", "Cache-Control": "no-store" },
    });
  }
}
