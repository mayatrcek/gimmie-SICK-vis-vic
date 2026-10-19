import { erddapFetch, sstThumbURL } from "@/lib/api/erddap";

// Gallery card PNG, proxied so each day+stretch is rendered by ERDDAP once
// (~2.5 s) and then served from Vercel's CDN. A past day's render never
// changes, so it's cached forever at both layers.
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const day = q.get("day");
  const min = q.get("min") ? Number(q.get("min")) : undefined;
  const max = q.get("max") ? Number(q.get("max")) : undefined;
  if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day) || [min, max].some((v) => v != null && !Number.isFinite(v))) {
    return new Response(null, { status: 400 });
  }
  const r = await erddapFetch(sstThumbURL({ min, max }, day), false);
  if (!r.ok) return new Response(null, { status: r.status });
  return new Response(r.body, {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
