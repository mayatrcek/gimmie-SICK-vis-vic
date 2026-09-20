# E-ink dive forecast panel

`weekly_forecast/weekly_forecast.ino` — the firmware for the wall panel. It wakes
once an hour, pulls 7 days of dive conditions for one spot from
`gimmiesickvis.com/api/eink-forecast`, redraws the screen and goes back to sleep.

## Hardware

- Waveshare 7.5" e-paper panel (800 x 480), `GxEPD2_750_T7` in the driver
  declaration. If your demo test confirmed the GDEY075T7 instead, swap that one
  line.
- Waveshare ESP32 e-Paper Driver Board. Panel on HSPI: CS 15, DC 27, RST 26,
  BUSY 25, SCK 13, MISO 12, MOSI 14.

Libraries: GxEPD2, WiFiManager, ArduinoJson (v7 — the sketch uses `JsonDocument`,
not the deprecated `DynamicJsonDocument`). WiFi, HTTPClient and Preferences ship
with the ESP32 core.

## Buttons

The board has two buttons and neither is a general-purpose one.

| Press | What happens |
|---|---|
| **EN** once | Reload. EN is chip enable, so a press is a hardware reset, and a boot is a full run: fetch, redraw, sleep. |
| **EN** twice | Opens the setup portal. The first press restarts the panel, the second one lands while it is still awake. |
| **BOOT** | Nothing. Leave it alone. |

EN is not a GPIO, so nothing can read it — the double press is detected by a flag
in NVS (`portalpend`), set on every boot and cleared only when a run reaches
`goToSleep()`. Still set on the next boot means the last run never finished, i.e.
the button was pressed again mid-run. The flag lives in NVS rather than RTC
memory because EN cuts power to the RTC domain, which would wipe it and make the
second press look like the first.

BOOT is GPIO0, a strapping pin: held low at reset the chip enters the serial
bootloader and the sketch never runs, so it cannot be a wake button. It can be
read as an ordinary input once the board is already awake, which is the way in if
this ever needs a second gesture.

## Setup portal

Opens by itself when WiFi won't connect, or on the EN double press. Join the
`GimmieSickVis` network from a phone; the page should open on its own, otherwise
browse to `192.168.4.1`. Enter the WiFi network and password, pick a dive spot,
press Update. Both settings live in NVS, so a spot change on a working panel can
leave the network fields blank. The portal closes after 3 minutes
(`PORTAL_TIMEOUT_S`), or ~20 s after a save, then the panel redraws.

The spot menu is hardcoded in `SPOT_PICKER` because the portal runs an access
point with no internet. It mirrors the `id`/`name` pairs in
`lib/data/regions.ts`; a spot added to the site needs a reflash to appear here.
Drift is safe — the API validates the id and falls back to Diamond Bay.

## What it draws

Seven columns, today first and inverted, three rows per day (10 AM / 1 PM /
4 PM). Each slot shows the 0-10 rating in a filled badge (a second border at 8 or
above), swell height with a direction arrow, energy, and wind with its own arrow.
Arrows point where the swell or wind is *going*, which is the compass letter's
bearing plus 180.

Sheltered spots inside Port Phillip show `-` for height, direction and energy.
That is deliberate and matches the site: Open-Meteo has no marine cell inside the
heads, so those points get served the nearest ocean cell's swell. The rating and
the wind are real everywhere.

`drawError()` replaces the screen with one line when WiFi, the clock or the fetch
fails, and the panel tries again an hour later.

## API

```
GET https://gimmiesickvis.com/api/eink-forecast?spot=<id>
```

```json
{ "spot": "diamond", "name": "Diamond Bay", "days": [
  { "date": "2026-09-20", "slots": [
    { "time": "10 AM", "rating": 7, "height": "2.1m", "heightDirection": "SW",
      "energy": "1234 kJ", "wind": "15 kmh", "windDirection": "SW" }
  ] }
] }
```

Seven days, three slots each, strings already formatted for the screen so the
firmware does no maths. Field names come from `app/api/eink-forecast/route.ts`;
if they change, `parseForecast()` is the only function that needs editing.

## Timing

`SLEEP_SECONDS = 3600`. Time comes from NTP (`pool.ntp.org`, Google and
Cloudflare as backups) with the Melbourne DST rule set locally, so the panel
needs a router that allows outbound UDP 123. After the portal runs, the radio is
forced back to station-only before asking for the time — in AP+STA the request
can go out the AP interface and never get an answer.
