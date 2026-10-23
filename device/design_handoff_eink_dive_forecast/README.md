# Handoff: E-ink Dive Forecast (Cape Schanck), v7 layout

## Overview
A redesigned screen for the existing Waveshare e-paper dive-forecast frame. The current firmware (v6) shows a 7-day × 3-time grid. v7 puts **today** first, with a large "now" summary, today's three forecast times and a compact 7-day strip at the bottom.

- **Hardware:** Waveshare ESP32 driver board + 7.5" e-paper panel, **800 × 480 px**, landscape.
- **Data source:** the owner's website, **gimmiesickvis.com**, which already supplies the v6 forecast.

## About the Design Files
`Dive Forecast.dc.html` is a **design reference made in HTML**. It shows the intended look; it is not code to ship. The job is to **recreate this screen in the ESP32 firmware**, using whatever library and patterns the existing v6 code uses (most likely GxEPD2 + Adafruit GFX). Open the HTML in Chrome to see it. The numbers in it are placeholder data.

### Two ways to build it (pick one)
1. **Draw it on the device (recommended if v6 already draws on-device).** The ESP32 fetches JSON from gimmiesickvis.com and draws the layout with GxEPD2 using the pixel specs below.
2. **Render it on the server.** gimmiesickvis.com renders this layout to an 800×480 1-bit (or 2-bit grey) bitmap, and the ESP32 just downloads and displays it. This makes later layout changes easier, because no reflash is needed.

## Fidelity
**High-fidelity.** Match positions, sizes and weights as closely as the panel and fonts allow. Pixel values below come from the HTML layout and are accurate to roughly ±2 px; text baselines will shift a little with bitmap fonts, which is fine.

## Colours
The panel is black and white (some 7.5" models also do 4 shades of grey).
- `#000000` black: all text, lines, rating boxes and arrows
- `#FFFFFF` white: background
- `#AAAAAA` light grey: only the thin lines between the hour blocks. **On a black-and-white-only panel**, draw these as a 1 px dotted black line (every other pixel).

## Typography
- **Font:** Atkinson Hyperlegible, Regular (400) and Bold (700). It's free on Google Fonts (OFL licence). Convert the TTFs to Adafruit GFX fonts with `fontconvert` (or to U8g2 fonts) at the sizes listed below. Only these characters are needed: `A–Z 0–9 . : m s k h - space`, plus `a p` if lower-case am/pm is ever wanted.
- **Sizes used (px):** 36 B, 30 B, 26 B, 24 B, 22 B, 22 R, 18 R, 16 B, 16 R, 15 B, 14 R, 12 R.
- Titles have slight extra letter-spacing: about 0.5 px on 24–26 px text and 0.6 px on 15–16 px text. This is optional.

## Screen layout (800 × 480, origin top-left)

```
y=0   ┌─────────────────────────────────────────────────────────────┐
      │ CAPE SCHANCK                                 UPDATED 17:00  │  Header 0–46
y=46  ├══════════════════════════════════════════════════════════════┤  2px line 46–48
      │        MON 26 OCTOBER        ┃ 10 AM [1]                     │
      │ ┌────┐  ≈ 1.5m 9s            ┃ 1.5m   9s   27 kmh ↓          │
      │ │    │  ↓ 27 kmh N           ┃ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │  Main 48–322
      │ │blank│                      ┃ 12 PM [1] …                   │
      │ │    │  Next high 2:52 PM 1.9m┃ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
      │ └────┘  Next low  9:08 PM 0.4m┃ 2 PM [2] …                   │
y=322 ├══════════════════════════════════════════════════════════════┤  2px line 322–324
      │          │MON│TUE│WED│THU│FRI│SAT│SUN│                        │  Week 324–458
y=458 ├══════════════════════════════════════════════════════════════┤  2px line 458–460
      │ v7 2026-10-26                              gimmiesickvis.com │  Footer 460–480
y=480 └─────────────────────────────────────────────────────────────┘
```

### 1. Header (y 0–46, then a 2 px black line full-width at y 46–48)
- `CAPE SCHANCK`: 26 px Bold, left x = 18, centred vertically in the header.
- `UPDATED HH:MM`: 16 px Regular, right edge at x = 782, centred vertically. Use the time of the last successful data fetch.

### 2. Main area (y 48–322, height 274)

**Left panel (x 0–340; padding 18 left, 16 right, 12 top, 12 bottom)**
- **Date:** e.g. `MON 26 OCTOBER`, 24 px Bold, centred horizontally across x 18–324, top at y ≈ 60. Format: `DDD D MONTH`, all caps.
- **Blank area:** x 18–114 (96 wide), y ≈ 100–310. **Leave it empty**, because the owner will add their own artwork here later (treat it as a bitmap slot).
- **Stats column:** x 130–324 (194 wide), starting at y ≈ 106. From the top:
  1. **Swell row:** a wave icon (44 × 30, black stroke ≈ 3.5 px; see the SVG in the HTML), then a 12 px gap, then the height `1.5m` in 36 px Bold, then a 6 px gap and the period `9s` in 18 px Regular. The two numbers share a baseline.
  2. 14 px gap.
  3. **Wind row:** a wind arrow (30 × 34, stroke 4 px, round caps) centred in a 44 px wide box, then a 12 px gap, then the speed `27` in 30 px Bold, then a 6 px gap and `kmh N` in 16 px Regular (the compass direction the wind comes from).
  4. **Tide block, pinned to the bottom of the column (bottom at y ≈ 310):** a 1 px black line across the column, 8 px space, then two 16 px rows with 2 px between them:
     - `Next high` (Regular) on the left, `2:52 PM 1.9m` (Bold) right-aligned at x 324
     - `Next low` (Regular) on the left, `9:08 PM 0.4m` (Bold) right-aligned

**Vertical divider:** a 2 px black line at x 340–342, y 62–308.

**Right panel (x 342–800; content x 362–782, y 58–312)**
Three hour blocks (10 AM, 12 PM, 2 PM), spread evenly down the panel with equal space between them. Each block has 4 px padding top and bottom and two rows set on a column grid. The columns start at x 362, x 438 (362 + 76) and x 482 (438 + 44):
- **Row 1:** the time `10 AM` (22 px Bold) at col 1. The **rating box** at col 2 is a 24 × 24 black square with the rating number (16 px Bold, white) centred in it.
- **Row 2 (22 px):** the swell `1.5m` (Bold) at col 1, the period `9s` (Regular) at col 2, then `27 kmh` (Regular) at col 3, followed 6 px later by a small wind arrow (18 × 20, stroke ≈ 3 px).
- Blocks 1 and 2 have a 1 px light-grey line (`#AAAAAA`) under them, across x 362–782. Block 3 has no line.
- **Keep x ≈ 590–800, y ≈ 230–322 visually clear.** The owner's artwork may spill over the 2 PM block and the week strip here, so put nothing past the wind arrow on the 2 PM row.

### 3. Week strip (2 px black line full-width at y 322–324; content y 324–458)
- A row of 7 cells, **590 px wide in total, centred horizontally** (x 105–695). Each cell is about 84.3 px wide.
- 1 px black line on the left edge (x 105) and on the right edge of every cell.
- Each cell's content is centred both ways, as a vertical stack with 5 px gaps:
  - the day `MON`: 15 px Bold
  - a rating box: 38 × 38 black square with the number (22 px Bold, white) centred in it
  - the swell height `1.5m`: 14 px Regular
- **The day being shown (today) is inverted:** a black cell with white text, and a white rating box with a black number.
- x 0–105 and x 695–800 stay blank.
- An earlier version put a 210 px artwork slot to the right of the strip. That's turned off for now, but it may come back: the strip would then sit at x 0–590 with the slot at x 590–800, and the slot's top and bottom lines would be removed.

### 4. Footer (2 px black line full-width at y 458–460; text area y 460–480)
- Left: firmware version and build date, e.g. `v7 2026-10-26`, 12 px Regular, x = 12.
- Right: `gimmiesickvis.com`, 12 px Regular, right edge at x = 788.

## Icons
- **Wind arrow:** a straight shaft with an open "V" arrowhead and round line ends. Its unrotated shape points **down**: path `M15 2 V30 M4 19 L15 31 L26 19` in a 30 × 34 box.
  - **Convention:** the arrow points the way the wind is blowing **to**. Rotate it clockwise by the wind's *from* bearing in degrees: N = 0° points down, E = 90° points left, S = 180° points up, W = 270° points right.
  - On the ESP32, either pre-draw 8 or 16 arrow bitmaps (one per compass point), or draw the three line segments rotated with `drawLine` / thick-line helpers.
- **Wave icon:** a single curling-wave stroke over a baseline, 44 × 30. Use the SVG path in the HTML as the reference, and convert it to a 1-bit bitmap (an XBM or a `PROGMEM` byte array).
- **Rating squares:** plain filled rectangles with a centred number. A higher number means better conditions. The scale is 1–3 in the mock; use the same scale as v6.

## Data needed per refresh (from gimmiesickvis.com)
A suggested JSON shape (adapt it to whatever the site already serves for v6):
```json
{
  "location": "CAPE SCHANCK",
  "updated": "17:00",
  "today": {
    "date": "2026-10-26",
    "swell_m": 1.5, "period_s": 9,
    "wind_kmh": 27, "wind_from_deg": 0, "wind_from": "N",
    "next_high": {"time": "14:52", "height_m": 1.9},
    "next_low":  {"time": "21:08", "height_m": 0.4},
    "hours": [
      {"time": "10:00", "rating": 1, "swell_m": 1.5, "period_s": 9, "wind_kmh": 27, "wind_from_deg": 0},
      {"time": "12:00", "rating": 1, "swell_m": 1.5, "period_s": 9, "wind_kmh": 29, "wind_from_deg": 315},
      {"time": "14:00", "rating": 2, "swell_m": 1.5, "period_s": 9, "wind_kmh": 23, "wind_from_deg": 270}
    ]
  },
  "week": [
    {"day": "MON", "rating": 1, "swell_m": 1.5},
    {"day": "TUE", "rating": 1, "swell_m": 1.7}
  ]
}
```
- `week` has 7 entries, starting with today.
- Show times as `10 AM`, `12 PM`, `2 PM` (12-hour, no minutes, upper case).
- Show tide times as `2:52 PM`.
- Show heights with one decimal place plus `m`; periods as whole numbers plus `s`; wind speed as a whole number.

## Behaviour
- Refresh on the same schedule as v6. Do a full refresh each time; partial refresh isn't needed.
- **If the fetch fails:** keep the last good data on screen and leave `UPDATED` showing the old time, so the screen shows how stale the data is.
- The screen is static, with no interaction.

## Files
- `reference-800x480.png` — exact 1:1 render of the screen (placeholder data). Use it as the visual target: render the firmware output to a buffer and compare pixel positions against this image.
- `Dive Forecast.dc.html`: the design reference (open it in Chrome, with `support.js` and `image-slot.js` in the same folder).
