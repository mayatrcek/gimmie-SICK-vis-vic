# E-ink dive forecast panel

`weekly_forecast/weekly_forecast.ino` — the firmware for the wall panel. It wakes
once an hour, downloads the finished screen for one spot from
`gimmiesickvis.com/api/eink-screen` as a 1-bit bitmap, blits it and goes back to
sleep. The layout lives on the server (`app/api/eink-screen/route.tsx`), so
changing it is a deploy, not a reflash.

## Hardware

- Waveshare 7.5" e-paper panel (800 x 480), `GxEPD2_750_T7` in the driver
  declaration. If your demo test confirmed the GDEY075T7 instead, swap that one
  line.
- Waveshare ESP32 e-Paper Driver Board. Panel on HSPI: CS 15, DC 27, RST 26,
  BUSY 25, SCK 13, MISO 12, MOSI 14.

Libraries: GxEPD2, WiFiManager. WiFi, HTTPClient and Preferences ship with the
ESP32 core. ArduinoJson is no longer needed; only v6 used it.

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
press Update. The portal closes after 3 minutes (`PORTAL_TIMEOUT_S`), or ~20 s
after a save, then the panel redraws.

**Changing only the spot needs no password.** Leave the network box alone, pick
a spot, press Update. The saved credentials are not touched.

**Tapping a network means you must type its password.** Update greys out until
you do, with a line saying so. That one combination — a network selected, the
password blank — is what breaks a working panel: it sends WiFiManager down its
connect-to-new-AP branch, where `WiFi.persistent(true); WiFi.begin(ssid, "")`
writes the blank password over the stored one (`WiFiManager.cpp:1104`). The join
then fails, the page says "Not connected", and the panel is left holding
credentials it cannot use. Clear the network box to get Update back.

After you press Update the portal closes and **the panel reboots itself**, then
comes back on the new spot about half a minute later. That is deliberate: the
portal leaves the radio in AP mode with the station switched off
(`WiFiManager.cpp:720-730`), and a cold boot walks the ordinary `autoConnect()`
path instead of trying to rebuild that state by hand. It is also why
`WiFi.SSID()` reads empty straight after the portal even though the credentials
are still in flash — a trap worth remembering, since the old reconnect fallback
was gated on that check and so never ran, leaving "No WiFi" on a panel whose
network was fine.

Both rules live in the injected script in `SPOT_PICKER`. Note the selector:
the form renders as `action='wifisave'`, with **no leading slash**
(`WiFiManager.cpp:1371`), so anything matching it needs `form[action$='wifisave']`.
An exact `'/wifisave'` match silently does nothing — that bug shipped once, and
it is also why the button read "Save" instead of "Update".

## What it draws

The v7 layout from the design handoff in `design_handoff_eink_dive_forecast/`
(`reference-800x480.png` is the target). Header with the spot name and
`UPDATED HH:MM`; a left panel with today's date, the current hour's swell,
period and wind, and the next high and low tide; today's 10 AM / 12 PM / 2 PM
blocks on the right, each with its 1-10 rating; a 7-day strip below, today
inverted. A day's rating in the strip is the best of its three blocks.

Two areas are left blank on purpose for artwork: x 18-114 / y 100-310 on the
left, and x 590-800 / y 230-322 over the 2 PM block and the strip.

Wind arrows point where the wind is *going*: the unrotated arrow points down (a
northerly) and is turned clockwise by the from-bearing.

Sheltered spots inside Port Phillip show `-` for swell height, period and the
strip's swell. That is deliberate and matches the site: Open-Meteo has no marine
cell inside the heads, so those points get served the nearest ocean cell's
swell. The rating, wind and tides are real everywhere.

Preview what a panel will show by opening
`/api/eink-screen?spot=<id>&format=png` in a browser.

## When something fails

A failed run leaves the last forecast on the wall rather than replacing it with
an error line — e-ink holds its image with no power, and the screen's own
`UPDATED HH:MM` stamp is what tells you it is old. The failure goes to serial
only. A panel that has never drawn a forecast has nothing to lose, so it still
shows the message; the `drawn` flag in NVS is the difference.

Recovery is automatic. A dropout that ends while the panel sleeps costs nothing:
the next hourly wake joins with the stored credentials and redraws. A router
that is still down at wake time means a failed connect, a stale screen, and
another try an hour later, on and on until it works. Nothing needs pressing.

`setEnableConfigPortal(!drawnOnce)` is what keeps a router reboot from turning
into three minutes of setup screen: on a panel that has drawn before, a failed
connect fails fast instead of holding the AP open. A brand-new panel still opens
the portal by itself, and the EN double press always does.

The one case that overrides all of this: no saved network at all. Then nothing
can refresh the screen unattended, so the panel covers the forecast with
`No WiFi - press EN twice to set up`.

## API

```
GET https://gimmiesickvis.com/api/eink-screen?spot=<id>&fw=<FW_VERSION>
```

The body is the whole screen, 48000 bytes: 800 x 480 pixels, row-major, 8 per
byte, MSB first, 1 = black. That is the layout `drawBitmap()` reads, so the
firmware passes the buffer straight through. `fw` is printed at the footer's
left. `&format=png` returns the same render as an image.

The server renders with `next/og` and packs with `pack1bit()` in `lib/eink.ts`
(self-check: `node lib/eink.test.ts`). The fetch uses HTTP/1.0 so the response
can't arrive chunked, which would put chunk headers into the pixels.

v6 panels call the old JSON route, `/api/eink-forecast`, which is still up. It
can go once every panel runs v7.

## Timing

Refreshes land on the top of the hour: `sleepSeconds()` counts to the next hour
boundary rather than an hour from whenever the last run finished, which used to
let them drift into :12, then :25. Hours from `QUIET_START_H` (22) to
`QUIET_END_H` (5) are skipped, so the last refresh of the evening is 21:00 and
the first of the morning is 05:00 — seven wakes a night that nobody was there to
read. A failed run with no trustworthy clock falls back to `RETRY_SECONDS`.

`test_sleep_schedule.py` mirrors that arithmetic in Python and asserts the
boundaries (`python device/test_sleep_schedule.py`). It is a hand-kept copy, so
change it when the C changes.

The clock is synced at most once a day. The RTC keeps running through deep
sleep, so an ordinary wake already knows the time; syncing every hour cost up to
30 s of radio and carried a failure path for nothing. `lastNtpSync` lives in RTC
memory, which survives sleep but not an EN press — a reset re-syncs, which is
the cheap direction to be wrong in. The zone is set with `setenv("TZ", ...)` on
every boot regardless, since the environment does not survive sleep.

NTP is `pool.ntp.org` with Google and Cloudflare as backups, so the panel needs
a router that allows outbound UDP 123. After the portal runs, the radio is
forced back to station-only before asking for the time — in AP+STA the request
can go out the AP interface and never get an answer.

## Failure handling

`fetchScreen()` makes two attempts 3 s apart with explicit 8 s connect and
read timeouts, so one blip does not cost an hour of stale screen. Anything short
of exactly 48000 bytes counts as a failure and the screen is left alone, so a
dropped connection can't paint half a forecast over a good one.

The footer's left carries `FW_VERSION` (sent as `fw`), so a panel on the wall
can say which build it is running. Bump it when you flash.
