import { sentinelProcess, tileToBBox } from "@/lib/api/sentinel";

// Per-tile Process API proxy — powers the locked detail map. Imagery for a
// past date never changes, so cache tiles forever once rendered (same as
// depth-tile/route.ts): zero further Processing Unit cost after the first look.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ date: string; z: string; x: string; y: string }> },
) {
  const { date, z, x, y } = await params;
  const zN = Number(z), xN = Number(x), yN = Number(y);
  const max = 1 << (Number.isInteger(zN) ? zN : 0);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isInteger(zN) || zN < 0 || zN > 20 ||
    !Number.isInteger(xN) || xN < 0 || xN >= max ||
    !Number.isInteger(yN) || yN < 0 || yN >= max
  ) {
    return new Response(null, { status: 400 });
  }

  const bbox = tileToBBox(zN, xN, yN);
  const res = await sentinelProcess(bbox, date, 256, 256);
  if (!res.ok) return new Response(null, { status: res.status });

  return new Response(res.body, {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
