// Server proxy for AWS Terrarium elevation tiles (satellite-derived ETOPO1/GEBCO
// bathymetry). The S3 bucket sends no CORS headers, so the browser can't read
// the pixels onto a canvas directly — same-origin proxy fixes that. Depth data
// never changes; cache hard.
export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const z = Number(p.get("z")), x = Number(p.get("x")), y = Number(p.get("y"));
  const max = 1 << (Number.isInteger(z) ? z : 0);
  if (!Number.isInteger(z) || z < 0 || z > 15 || !Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x >= max || y >= max) {
    return new Response(null, { status: 400 });
  }
  const r = await fetch(`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`);
  if (!r.ok) return new Response(null, { status: r.status });
  return new Response(r.body, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
