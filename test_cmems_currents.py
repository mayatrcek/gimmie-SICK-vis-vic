"""Self-check for the pure rasterization logic in api/cmems-currents.py
(ramp/render_speed/render_vectors). Doesn't touch the network or CMEMS
credentials — fetch_uv is exercised for real only once live creds exist
(see the plan's Phase 0.3 verification step). Run: python test_cmems_currents.py
"""

import importlib.util
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from io import BytesIO

spec = importlib.util.spec_from_file_location(
    "cmems_currents_route", Path(__file__).parent / "api" / "cmems-currents.py"
)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


def test_ramp_endpoints():
    assert mod.ramp(0.0) == (0x16, 0x34, 0x4A)
    assert mod.ramp(1.0) == (0xA8, 0x20, 0x0D)
    assert mod.ramp(5.0) == mod.ramp(1.0)  # clamps, doesn't extrapolate


def test_render_speed_transparent_on_nan():
    lat = np.array([-40.0, -39.0])
    lon = np.array([140.0, 141.0])
    u = np.array([[0.1, np.nan], [0.2, 0.3]])
    v = np.array([[0.1, np.nan], [0.0, 0.1]])
    png = mod.render_speed(u, v, lat, lon)
    img = Image.open(BytesIO(png))
    assert img.size == (2, 2)
    # nan is at lat[0] (min lat) which renders as the bottom image row
    assert img.getpixel((1, 1))[3] == 0  # NaN cell -> alpha 0
    assert img.getpixel((0, 0))[3] == 255


def test_render_vectors_produces_requested_size():
    lat = np.linspace(-44, -34, 10)
    lon = np.linspace(140, 150, 10)
    u = np.full((10, 10), 0.3)
    v = np.full((10, 10), 0.1)
    png = mod.render_vectors(u, v, lat, lon, (64, 48))
    img = Image.open(BytesIO(png))
    assert img.size == (64, 48)
    assert img.getbands() == ("R", "G", "B", "A")


if __name__ == "__main__":
    tests = [v for k, v in list(globals().items()) if k.startswith("test_")]
    for t in tests:
        t()
        print(f"ok  {t.__name__}")
    print(f"{len(tests)} passed")
