import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { PNG } from "pngjs";
import { fetchSite } from "@/lib/api/openMeteo";
import { SPOTS } from "@/lib/data/regions";
import { pack1bit } from "@/lib/eink";
import { score10, slotCells, tideExtremes } from "@/lib/logic/rating";

// The v7 e-ink screen, drawn here instead of on the ESP32 so a layout change is
// a deploy rather than a reflash. Default response is the panel's raw 1-bit
// framebuffer (800x480 = 48000 bytes, see pack1bit); ?format=png is the same
// render for a browser. Layout follows the design handoff in device/.
// The v6 JSON route (eink-forecast) stays up for panels still on that firmware.

const W = 800;
const H = 480;
const FALLBACK = "diamond";
const HOURS: [number, string][] = [
  [10, "10 AM"],
  [12, "12 PM"],
  [14, "2 PM"],
];
const CACHE = { "Cache-Control": "s-maxage=600, stale-while-revalidate=3600" };

// Literal paths off process.cwd(), the shape Next's file tracing picks up, so
// the fonts ship with the deployed function.
const regular = await readFile(join(process.cwd(), "app/api/eink-screen/AtkinsonHyperlegible-Regular.ttf"));
const bold = await readFile(join(process.cwd(), "app/api/eink-screen/AtkinsonHyperlegible-Bold.ttf"));

// "14:52" -> "2:52 PM"
const clock12 = (hm: string) => {
  const [h, m] = hm.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

const dayLabel = (date: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(date + "T12:00Z").toLocaleDateString("en-AU", { ...opts, timeZone: "UTC" }).toUpperCase();

// Unrotated it points down, i.e. a wind from the north; rotating clockwise by
// the from-bearing makes it point where the wind is going.
function Arrow({ deg, w, h, stroke }: { deg: number | null; w: number; h: number; stroke: number }) {
  if (deg == null) return <div style={{ width: w, height: h }} />;
  return (
    <svg width={w} height={h} viewBox="0 0 30 34" style={{ transform: `rotate(${Math.round(deg)}deg)` }}>
      <path d="M15 2 V30 M4 19 L15 31 L26 19" fill="none" stroke="#000" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Rating({ n, size, font, invert }: { n: number | null; size: number; font: number; invert?: boolean }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: invert ? "#fff" : "#000",
        color: invert ? "#000" : "#fff",
        fontSize: font,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {n == null ? "-" : String(n)}
    </div>
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("spot");
  // Object.hasOwn, not a truthiness check: "constructor" would otherwise pass.
  const SPOT = id && Object.hasOwn(SPOTS, id) ? SPOTS[id] : SPOTS[FALLBACK];
  const fw = (url.searchParams.get("fw") || "").slice(0, 24);

  try {
    // One fetchSite call covers everything (Open-Meteo is call-budget limited).
    const { rows, hourly } = await fetchSite(SPOT);
    const wIdx: Record<string, number> = {};
    hourly.wtime.forEach((t, i) => (wIdx[t] = i));
    const runoff: Record<string, number> = {};
    rows.forEach((r) => (runoff[r.date] = r.runoff));

    // Open-Meteo is asked for Melbourne time, so "now" has to be too.
    const now = new Date().toLocaleString("sv-SE", { timeZone: "Australia/Melbourne" }).slice(0, 16).replace(" ", "T");
    const today = now.slice(0, 10);

    const at = (date: string, hour: number) => {
      const t = `${date}T${String(hour).padStart(2, "0")}:00`;
      const i = hourly.mtime.indexOf(t);
      const wi = wIdx[t];
      const h = i < 0 ? null : (hourly.swellH[i] ?? null);
      const p = i < 0 ? null : (hourly.swellP[i] ?? null);
      const sd = i < 0 ? null : (hourly.swellD[i] ?? null);
      const wind = wi == null ? null : (hourly.wind[wi] ?? null);
      const wdir = wi == null ? null : (hourly.wdir[wi] ?? null);
      return {
        rating: score10(SPOT, h, wind, wdir, runoff[date] ?? null),
        period: SPOT.sheltered || p == null ? "-" : `${Math.round(p)}s`,
        wdir,
        ...slotCells(SPOT, { h, p, sd, wind, wdir }),
      };
    };

    const cur = at(today, +now.slice(11, 13));
    const hours = HOURS.map(([hr, label]) => ({ label, ...at(today, hr) }));

    const marks = tideExtremes(hourly.mtime, hourly.tide).filter((m) => `${m.date}T${m.time}` > now);
    const tide = (kind: "H" | "L") => {
      const m = marks.find((x) => x.kind === kind);
      return m ? `${clock12(m.time)} ${m.height.toFixed(1)}m` : "-";
    };

    const start = Math.max(0, rows.findIndex((r) => r.date === today));
    const week = rows.slice(start, start + 7).map((r) => {
      // ponytail: day rating = best of the three slots shown; swap for dayRating's mode if it reads too rosy
      const scores = HOURS.map(([hr]) => at(r.date, hr).rating).filter((n): n is number => n != null);
      return {
        date: r.date,
        day: dayLabel(r.date, { weekday: "short" }),
        rating: scores.length ? Math.max(...scores) : null,
        swell: SPOT.sheltered || r.h == null ? "-" : `${r.h.toFixed(1)}m`,
      };
    });

    const rule = (y: number) => <div style={{ position: "absolute", left: 0, top: y, width: W, height: 2, background: "#000" }} />;

    const img = new ImageResponse(
      (
        <div style={{ width: W, height: H, display: "flex", position: "relative", background: "#fff", color: "#000", fontFamily: "Atkinson" }}>
          {/* Header 0-46 */}
          <div style={{ position: "absolute", left: 18, top: 0, height: 46, display: "flex", alignItems: "center", fontSize: 26, fontWeight: 700, letterSpacing: 0.5 }}>
            {SPOT.name.toUpperCase()}
          </div>
          <div style={{ position: "absolute", right: 18, top: 0, height: 46, display: "flex", alignItems: "center", fontSize: 16, letterSpacing: 0.6 }}>
            {`UPDATED ${now.slice(11, 16)}`}
          </div>
          {rule(46)}

          {/* Left panel: date, artwork slot (blank), now stats, tides */}
          <div style={{ position: "absolute", left: 18, top: 58, width: 306, display: "flex", justifyContent: "center", fontSize: 24, fontWeight: 700, letterSpacing: 0.5 }}>
            {`${dayLabel(today, { weekday: "short" })} ${+today.slice(8)} ${dayLabel(today, { month: "long" })}`}
          </div>
          <div style={{ position: "absolute", left: 130, top: 106, width: 194, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <svg width="44" height="30" viewBox="0 0 44 30">
                <path d="M2 24 C8 24 10 6 22 6 C30 6 33 13 29 17 C26 20 21 17 23 13 C16 14 16 24 26 24 C32 24 36 20 42 22" fill="none" stroke="#000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 28 H42" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <div style={{ display: "flex", alignItems: "baseline", marginLeft: 12 }}>
                <span style={{ fontSize: 36, fontWeight: 700, lineHeight: 1 }}>{cur.height}</span>
                <span style={{ fontSize: 18, marginLeft: 6 }}>{cur.period}</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", marginTop: 14 }}>
              <div style={{ width: 44, display: "flex", justifyContent: "center" }}>
                <Arrow deg={cur.wdir} w={30} h={34} stroke={4} />
              </div>
              <div style={{ display: "flex", alignItems: "baseline", marginLeft: 12 }}>
                <span style={{ fontSize: 30, fontWeight: 700, lineHeight: 1 }}>{cur.wind.replace(" kmh", "")}</span>
                <span style={{ fontSize: 16, marginLeft: 6 }}>{`kmh ${cur.windDirection}`}</span>
              </div>
            </div>
          </div>
          <div style={{ position: "absolute", left: 130, top: 244, width: 194, paddingTop: 8, display: "flex", flexDirection: "column", borderTop: "1px solid #000", fontSize: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Next high</span>
              <span style={{ fontWeight: 700 }}>{tide("H")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
              <span>Next low</span>
              <span style={{ fontWeight: 700 }}>{tide("L")}</span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ position: "absolute", left: 340, top: 62, width: 2, height: 246, background: "#000" }} />

          {/* Right panel: today's three hours */}
          <div style={{ position: "absolute", left: 362, top: 58, width: 420, height: 254, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            {hours.map((h, i) => (
              <div key={h.label} style={{ display: "flex", flexDirection: "column", padding: "4px 0", position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", fontSize: 22, fontWeight: 700 }}>
                  <span style={{ width: 76 }}>{h.label}</span>
                  <Rating n={h.rating} size={24} font={16} />
                </div>
                <div style={{ display: "flex", alignItems: "center", fontSize: 22, marginTop: 2 }}>
                  <span style={{ width: 76, fontWeight: 700 }}>{h.height}</span>
                  <span style={{ width: 44 }}>{h.period}</span>
                  <span>{h.wind}</span>
                  <div style={{ display: "flex", marginLeft: 8 }}>
                    <Arrow deg={h.wdir} w={18} h={20} stroke={5} />
                  </div>
                </div>
                {i < 2 && (
                  // #AAAAAA in the design; a B/W panel gets every other pixel black instead
                  <svg width="420" height="1" style={{ position: "absolute", left: 0, bottom: 0 }}>
                    <line x1="0" y1="0.5" x2="420" y2="0.5" stroke="#000" strokeWidth="1" strokeDasharray="1 1" />
                  </svg>
                )}
              </div>
            ))}
          </div>

          {/* Week strip 324-458, 590 wide, centred */}
          {rule(322)}
          <div style={{ position: "absolute", left: 105, top: 324, width: 590, height: 134, display: "flex", borderLeft: "1px solid #000" }}>
            {week.map((d) => {
              const on = d.date === today;
              return (
                <div
                  key={d.date}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRight: "1px solid #000",
                    background: on ? "#000" : "#fff",
                    color: on ? "#fff" : "#000",
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.6 }}>{d.day}</span>
                  <div style={{ display: "flex", margin: "5px 0" }}>
                    <Rating n={d.rating} size={38} font={22} invert={on} />
                  </div>
                  <span style={{ fontSize: 14 }}>{d.swell}</span>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          {rule(458)}
          <div style={{ position: "absolute", left: 12, top: 461, height: 19, display: "flex", alignItems: "center", fontSize: 12 }}>{fw}</div>
          <div style={{ position: "absolute", right: 12, top: 461, height: 19, display: "flex", alignItems: "center", fontSize: 12 }}>gimmiesickvis.com</div>
        </div>
      ),
      {
        width: W,
        height: H,
        fonts: [
          { name: "Atkinson", data: regular, weight: 400, style: "normal" },
          { name: "Atkinson", data: bold, weight: 700, style: "normal" },
        ],
        headers: CACHE,
      },
    );

    if (url.searchParams.get("format") === "png") return img;
    const png = PNG.sync.read(Buffer.from(await img.arrayBuffer()));
    return new Response(Buffer.from(pack1bit(png.data, W, H)), {
      headers: { ...CACHE, "Content-Type": "application/octet-stream" },
    });
  } catch (err) {
    console.error(err);
    return new Response("Failed to build screen", { status: 500 });
  }
}
