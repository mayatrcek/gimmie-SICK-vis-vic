import { VIC_COAST_BBOX, sentinelProcess } from "@/lib/api/sentinel";

// Card thumbnail — one wide preview PNG covering the whole coast bbox per
// date. Cached forever like the tile route: a past date's imagery never changes.
export async function GET(req: Request) {
  const date = new URL(req.url).searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Response(null, { status: 400 });
  }

  // 640x256 (not the brief's 400x160): S2L2A caps requests at 1500 m/px, and
  // the ~800km-wide coast bbox at 400px works out to ~1987 m/px — over the
  // limit. 640px keeps every direction under it with some margin.
  const res = await sentinelProcess(VIC_COAST_BBOX, date, 640, 256);
  if (!res.ok) return new Response(null, { status: res.status });

  return new Response(res.body, {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
