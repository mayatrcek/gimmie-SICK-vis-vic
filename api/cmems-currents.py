"""Copernicus Marine (CMEMS) surface currents, rendered as PNGs.

Replaces NOAA ERDDAP's `.transparentPng&.draw=vectors` (which CMEMS has no
equivalent for since it retired OPeNDAP/ERDDAP/WMS in 2024) and ports the
speed-gradient rasterizer from app/api/cur-speed/route.ts to Python, since
this data can only be pulled via the `copernicusmarine` Python package.

Query params:
  day   YYYY-MM-DD, defaults to yesterday (product publishes ~1 day behind)
  frame "card" (thumbnail box) or "map" (full overlay box)
  kind  "speed" (native-res gradient PNG, browser upscales) or
        "vectors" (fixed-size arrow PNG at the display resolution)
"""

import math
import re
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler
from io import BytesIO
from urllib.parse import parse_qs, urlparse

import numpy as np
from PIL import Image, ImageDraw

DATASET_ID = "cmems_mod_glo_phy-cur_anfc_0.083deg_P1D-m"

# Same two boxes as lib/api/erddap.ts's curSpeedCsvURL/curThumbURL/curURL.
BOXES = {
    "card": {"lat": (-44.2, -33.8), "lon": (139.5, 150.8)},
    "map": {"lat": (-41.2, -33.8), "lon": (139.5, 150.8)},
}
# Fixed display sizes the old ERDDAP vector images were rendered at.
VECTOR_SIZE = {"card": (512, 610), "map": (2260, 1480)}

# OVERWORLD ramp: sea navy (calm) -> accent blue -> warm -> red. Ported
# verbatim from app/api/cur-speed/route.ts's STOPS/ramp.
STOPS = [
    (0.0, (0x16, 0x34, 0x4A)),
    (0.35, (0x2E, 0x5D, 0xD6)),
    (0.7, (0xE2, 0x52, 0x2E)),
    (1.0, (0xA8, 0x20, 0x0D)),
]


def ramp(v: float) -> tuple[int, int, int]:
    x = min(v, 1.0)
    for i in range(1, len(STOPS)):
        a, ca = STOPS[i - 1]
        b, cb = STOPS[i]
        if x <= b:
            f = (x - a) / (b - a)
            return tuple(round(ca[k] + (cb[k] - ca[k]) * f) for k in range(3))
    return STOPS[-1][1]


def fetch_uv(day: str, frame: str):
    import copernicusmarine

    box = BOXES[frame]
    ds = copernicusmarine.open_dataset(
        dataset_id=DATASET_ID,
        variables=["uo", "vo"],
        minimum_longitude=box["lon"][0],
        maximum_longitude=box["lon"][1],
        minimum_latitude=box["lat"][0],
        maximum_latitude=box["lat"][1],
        minimum_depth=0,
        maximum_depth=1,
        start_datetime=f"{day}T00:00:00",
        end_datetime=f"{day}T00:00:00",
    )
    ds = ds.isel(time=0, depth=0)
    # ascending lat/lon, matching ERDDAP's CSV row order in cur-speed/route.ts
    ds = ds.sortby(["latitude", "longitude"])
    return (
        ds["uo"].values,
        ds["vo"].values,
        ds["latitude"].values,
        ds["longitude"].values,
    )


def render_speed(u, v, lat, lon) -> bytes:
    h, w = len(lat), len(lon)
    speed = np.hypot(u, v)
    finite = speed[np.isfinite(speed)]
    # ERDDAP's cur-speed hard-codes no normalization ceiling either — the
    # ramp already clamps at 1 m/s via STOPS' last stop.
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    px = img.load()
    for y in range(h):
        row_y = h - 1 - y  # top row = max latitude
        for x in range(w):
            s = speed[row_y, x]
            if not np.isfinite(s):
                continue
            r, g, b = ramp(float(s))
            px[x, y] = (r, g, b, 255)
    buf = BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def render_vectors(u, v, lat, lon, size: tuple[int, int]) -> bytes:
    w, h = size
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    lat0, lat1 = lat.min(), lat.max()
    lon0, lon1 = lon.min(), lon.max()
    color = (0xFF, 0xFA, 0xEF, 255)
    # CMEMS's 0.083 deg grid is ~3x denser than NOAA's 0.25 deg one; stride
    # so arrow spacing on screen roughly matches the old rendering's density
    # rather than drawing 9x as many arrows into the same canvas.
    stride = 3
    max_len = 9.0
    for yi in range(0, len(lat), stride):
        py = (lat1 - lat[yi]) / (lat1 - lat0) * h
        for xi in range(0, len(lon), stride):
            uu, vv = float(u[yi, xi]), float(v[yi, xi])
            if not (np.isfinite(uu) and np.isfinite(vv)):
                continue
            speed = math.hypot(uu, vv)
            if speed == 0:
                continue
            px = (lon[xi] - lon0) / (lon1 - lon0) * w
            length = min(2.0 + speed * 6.0, max_len)
            dx = uu / speed * length
            dy = -vv / speed * length  # image y grows downward, north is up
            x0, y0 = px - dx / 2, py - dy / 2
            x1, y1 = px + dx / 2, py + dy / 2
            draw.line([(x0, y0), (x1, y1)], fill=color, width=1)
            ang = math.atan2(dy, dx)
            head = 2.5
            for side in (0.5, -0.5):
                a = ang + math.pi + side
                draw.line(
                    [(x1, y1), (x1 + head * math.cos(a), y1 + head * math.sin(a))],
                    fill=color,
                    width=1,
                )
    buf = BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        q = parse_qs(urlparse(self.path).query)
        day = (q.get("day") or [None])[0]
        frame = (q.get("frame") or ["card"])[0]
        kind = (q.get("kind") or ["speed"])[0]

        if day and not re.match(r"^\d{4}-\d{2}-\d{2}$", day):
            self.send_response(400)
            self.end_headers()
            return
        if frame not in BOXES or kind not in ("speed", "vectors"):
            self.send_response(400)
            self.end_headers()
            return
        if not day:
            day = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")

        try:
            u, v, lat, lon = fetch_uv(day, frame)
            png = (
                render_speed(u, v, lat, lon)
                if kind == "speed"
                else render_vectors(u, v, lat, lon, VECTOR_SIZE[frame])
            )
            self.send_response(200)
            self.send_header("Content-Type", "image/png")
            self.send_header("Cache-Control", "public, max-age=3600")
            self.end_headers()
            self.wfile.write(png)
        except Exception:
            # 1x1 transparent PNG, matching cur-speed/route.ts's failure mode
            empty = Image.new("RGBA", (1, 1), (0, 0, 0, 0))
            buf = BytesIO()
            empty.save(buf, format="PNG")
            self.send_response(200)
            self.send_header("Content-Type", "image/png")
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(buf.getvalue())
