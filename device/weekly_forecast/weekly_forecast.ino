// Dive forecast display — 7.5" Waveshare panel, ESP32 e-Paper Driver Board
//
// The screen is drawn by the site, not here: /api/eink-screen returns the whole
// 800x480 frame as raw 1-bit pixels (48000 bytes, row-major, MSB first,
// 1 = black), which is exactly what drawBitmap() takes. A layout change is a
// deploy, not a reflash. To preview what the panel will show, open the same URL
// with &format=png in a browser.

#include <GxEPD2_BW.h>
#include <Fonts/FreeSansBold12pt7b.h>
#include <Fonts/FreeSans9pt7b.h>
#include <WiFi.h>
#include <WiFiManager.h>
#include <Preferences.h>
#include <HTTPClient.h>
#include "time.h"

// ---- Waveshare ESP32 Driver Board pins (confirmed working) ----
#define CS   15
#define DC   27
#define RST  26
#define BUSY 25

#if defined(ESP32)
#define USE_HSPI_FOR_EPD
#include <SPI.h>
static SPIClass hspi(HSPI);
#endif

// Swap for GxEPD2_750_GDEY075T7 if that's what your demo test confirmed instead
GxEPD2_BW<GxEPD2_750_T7, GxEPD2_750_T7::HEIGHT> display(
  GxEPD2_750_T7(/*CS=*/ CS, /*DC=*/ DC, /*RST=*/ RST, /*BUSY=*/ BUSY));

// ---- Config ----
// WiFi credentials and the spot live in NVS, set through the setup portal —
// nothing to hardcode, nothing to reflash when a customer moves the display.
const char* relayBaseUrl = "https://gimmiesickvis.com/api/eink-screen";
const char* ntpServer    = "pool.ntp.org";
const char* ntpServer2    = "time.google.com";   // pool.ntp.org needs DNS; these are backups
const char* ntpServer3    = "time.cloudflare.com";
const int NTP_TIMEOUT_MS  = 30000;               // first sync after a cold boot can be slow
const char* tzMelbourne  = "AEST-10AEDT,M10.1.0,M4.1.0/3";
const char* portalName   = "GimmieSickVis";
const char* brandText    = "gimmiesickvis.com";
// Sent with every fetch and printed at the footer's left by the server, so a
// panel on the wall can say which build it is running. Bump it when you flash.
// Keep it URL-safe apart from the space, which fetchScreen() encodes.
const char* FW_VERSION   = "v7.2 2026-10-23";

// ---- Setup portal copy ----
// The portal runs in AP mode with no internet, so the spot list has to ship in
// the firmware. Source of truth is lib/data/regions.ts in gimmie-SICK-vis-vic;
// regenerate it from that file's `id`/`name` pairs as <option> tags (see
// the plan notes, or just grep regions.ts) when the site gains a spot.
// Drift is harmless: the API validates the id and falls back to Diamond Bay.
static const char PORTAL_INTRO[] =
  "<div id='gsvintro' style='background:#FFFAEF;border:2px solid #161310;box-shadow:4px 4px 0 #161310;padding:12px;margin-bottom:18px'>"
  "<h3 style='margin:0 0 8px;font-size:1.1rem'>Dive forecast display</h3>"
  "<p style='margin:0 0 8px'>This panel shows 7 days of dive conditions for one spot on the "
  "Victorian coast, and refreshes itself every hour.</p>"
  "<p style='margin:0'>Tap your network in the list below, enter its password, choose a dive "
  "spot, then press <b>Update</b>.</p>"
  "</div>";

// The spot menu. WiFiManager only renders <input>, so the real control is this
// raw-HTML block and the saved field is a hidden input it writes into; the
// script seeds the menu from whatever is stored. With JS off nothing moves and
// the stored spot survives, which is the safe failure.
static const char SPOT_PICKER[] =
  "<p style='font-size:13px;color:#3A332A;margin:2px 0 16px'>"
  "Needed the first time this display joins a network. Already set up? Pick no network "
  "and leave this blank: it stays on the network it is using.</p>"
  "<p id='gsvneedpass' style='display:none;font-size:13px;color:#A8200D;margin:2px 0 16px'>"
  "<b>Password needed.</b> Type the password for the network you picked, or tap that "
  "network again to stay on the one this display already uses.</p>"
  "<label for='spotsel' style='display:block;margin-bottom:4px'><b>3. Dive spot</b></label>"
  "<select id='spotsel' onchange=\"document.getElementById('spot').value=this.value\">"
  "<optgroup label='Surf Coast'><option value='bells'>Bells Beach</option><option value='winki'>Winkipop</option><option value='janjuc'>Jan Juc</option><option value='torquay'>Torquay Point</option><option value='roadknight'>Point Roadknight</option><option value='anglesea'>Anglesea</option><option value='lorne'>Lorne</option><option value='apollo'>Apollo Bay</option></optgroup><optgroup label='Bellarine'><option value='13th'>13th Beach</option><option value='barwon'>Barwon Heads</option><option value='oceangrove'>Ocean Grove</option><option value='lonsdale'>Point Lonsdale</option></optgroup><optgroup label='Mornington Peninsula'><option value='pointnepean'>Point Nepean (buoy)</option><option value='portsea'>Portsea Back Beach</option><option value='diamond'>Diamond Bay</option><option value='sorrento'>Sorrento Back Beach</option><option value='rye'>Rye Back Beach</option><option value='gunnamatta'>Gunnamatta</option><option value='schanck'>Cape Schanck</option><option value='flinders'>Flinders</option><option value='pointleo'>Point Leo</option></optgroup><optgroup label='Phillip Island'><option value='woolamai'>Cape Woolamai</option><option value='smiths'>Smiths Beach</option><option value='surfbeach'>Surf Beach</option><option value='pyramid'>Pyramid Rock</option><option value='express'>Express Point</option><option value='summerland'>Summerland</option><option value='ycw'>YCW / Cat Bay</option></optgroup><optgroup label='East Coast / Gippsland'><option value='capepat'>Cape Paterson</option><option value='inverloch'>Inverloch</option><option value='venus'>Venus Bay</option><option value='waratah'>Waratah Bay</option><option value='sandypt'>Sandy Point</option><option value='walkerville'>Walkerville</option></optgroup><optgroup label='Wilsons Promontory'><option value='tonguept'>Tongue Point</option><option value='whiskybay'>Whisky Bay</option><option value='squeaky'>Squeaky Beach</option><option value='normanbay'>Norman Bay (Tidal River)</option><option value='shellback'>Shellback Island</option><option value='oberon'>Oberon Bay</option><option value='glennie'>Great Glennie Island</option><option value='cleft'>Cleft Island (Skull Rock)</option><option value='anser'>Anser Island</option><option value='kanowna'>Kanowna Island</option><option value='rodondo'>Rodondo Island</option><option value='waterloobay'>Waterloo Bay</option><option value='refugecove'>Refuge Cove</option><option value='sealerscove'>Sealers Cove</option></optgroup><optgroup label='Far West / Shipwreck Coast'><option value='portcampbell'>Port Campbell</option><option value='princetown'>Princetown</option><option value='warrnambool'>Warrnambool (Logans)</option><option value='portfairy'>Port Fairy</option><option value='portland'>Portland</option></optgroup><optgroup label='Port Phillip'><option value='fort'>South Channel Fort</option><option value='blairgowrie'>Blairgowrie (bay)</option><option value='ryepier'>Rye Pier</option><option value='sorrentopier'>Sorrento Pier</option><option value='portseapier'>Portsea Pier</option><option value='portseahole'>Portsea Hole</option><option value='popeseye'>Popes Eye</option><option value='chinamans'>Chinaman's Hat</option><option value='lonsdalewall'>Lonsdale Wall</option><option value='queenscliffpier'>Queenscliff Pier</option><option value='stleonards'>St Leonards Pier</option><option value='portarlington'>Portarlington Pier</option><option value='morningtonpier'>Mornington Pier</option><option value='ricketts'>Ricketts Point</option><option value='cerberus'>HMVS Cerberus (Black Rock)</option><option value='williamstown'>Williamstown (The Dell)</option></optgroup><optgroup label='Western Port'><option value='flinderspier'>Flinders Pier</option><option value='cowes'>Cowes Jetty</option><option value='stonypoint'>Stony Point Pier</option><option value='crawfish'>Crawfish Rock</option><option value='rhyll'>Rhyll Jetty</option><option value='newhaven'>Newhaven Pier (San Remo)</option><option value='tortoise'>Tortoise Head (French Is.)</option><option value='corinella'>Corinella Pier</option></optgroup>"
  "</select>"
  // Seed on DOM ready, not inline: the hidden input renders after this block, so
  // seeding at parse time finds nothing and the menu opens on the first spot.
  "<script>document.addEventListener('DOMContentLoaded',function(){"
  "var h=document.getElementById('spot'),s=document.getElementById('spotsel');"
  "if(h&&s)s.value=h.value;"
  // the intro renders inside the form, below the password; lift it above the network list
  "var i=document.getElementById('gsvintro'),w=document.querySelector('.wrap'),t=w?w.querySelector('h3'):null;"
  "if(i&&w)w.insertBefore(i,t?t.nextSibling:w.firstChild);"
  // A network tapped with no password is the one combination that breaks a working
  // panel: it sends WiFiManager down its connect-to-new-AP branch, where
  // WiFi.persistent(true) + WiFi.begin(ssid, "") writes the blank password over
  // the stored one (WiFiManager.cpp:1104). The join fails, the page says "Not
  // connected", and the panel is left holding credentials it can't use. So the
  // button is disabled for exactly that combination. An untouched network box
  // still means "keep what I'm on", which is the spot-only path.
  // Attribute selector is a suffix match: the form renders as action='wifisave',
  // with no leading slash (WiFiManager.cpp:1371).
  "var f=document.querySelector(\"form[action$='wifisave']\");"
  "var n=document.getElementById('s'),q=document.getElementById('p');"
  "var b=f?f.querySelector(\"button[type='submit']\"):null;"
  "var m=document.getElementById('gsvneedpass');"
  // An open network disables the password box (WiFiManager's c()), so blank is
  // fine there.
  "function g(){var bad=!!(n.value&&!q.disabled&&!q.value);b.disabled=bad;"
  "if(m)m.style.display=bad?'block':'none';}"
  "if(!(f&&n&&q&&b))return;"
  "q.addEventListener('input',g);"
  // The network list. Each scan result is <div><a data-ssid onclick=c(this)>
  // then the signal icon, rendered above the form (WiFiManager.cpp:1366). The
  // whole row becomes the tap target and the SSID text box is hidden (CSS), so
  // nobody types a network name. Tapping the picked row again unpicks it, which
  // is the "keep the current network" path. The box's placeholder is the stored
  // SSID (WiFiManager.cpp:1375), which is how the status line can name it.
  // Names go in through textContent: an SSID is anyone's broadcast.
  "var rows=[].slice.call(document.querySelectorAll('a[data-ssid]'));"
  "var cur=n.getAttribute('placeholder')||'';"
  "var hd=document.createElement('div');hd.className='gsvh';hd.textContent='1. WiFi network';"
  "var st=document.createElement('p');st.id='gsvsel';"
  "function show(){var t=n.value?'Picked: ':cur?'Nothing picked. Staying on: ':"
  "rows.length?'Nothing picked yet. Tap your network.':'No networks found. Press Refresh to scan again.';"
  "st.textContent=t;if(n.value||cur){var e=document.createElement('b');e.textContent=n.value||cur;st.appendChild(e);}}"
  "var at=rows.length?rows[0].parentNode:f;at.parentNode.insertBefore(hd,at);"
  "var last=rows.length?rows[rows.length-1].parentNode:hd;last.parentNode.insertBefore(st,last.nextSibling);"
  "rows.forEach(function(a){var r=a.parentNode;a.removeAttribute('onclick');r.classList.add('gsvnet');"
  "r.addEventListener('click',function(ev){ev.preventDefault();"
  "if(n.value&&n.value===a.getAttribute('data-ssid')){n.value='';q.value='';q.disabled=false;}else{q.value='';c(a);}"
  "rows.forEach(function(x){x.parentNode.classList.toggle('sel',!!n.value&&x.getAttribute('data-ssid')===n.value);});"
  "show();g();if(n.value&&!q.disabled)q.focus();});});"
  "show();g();"
  "});</script>";

// Portal styling. Injected after WiFiManager's own <style> (WiFiManager.cpp:1281),
// so these win. Palette is OVERWORLD from the site's app/overworld.css; the fonts
// are its system fallbacks, because the portal serves an AP with no internet and
// no webfont can load. Button labels are rewritten here rather than in the
// library — that ties them to WiFiManager 2.0.17's markup (wm_strings_en.h:45),
// and a markup change blanks them rather than making them wrong.
static const char PORTAL_CSS[] =
  // Straight to the form: the menu page is one tap of nothing.
  "<script>if(location.pathname=='/')location.replace('/wifi');</script>"
  "<style>"
  "body{background:#F2EAD6;color:#161310;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;font-size:16px}"
  ".wrap{width:100%;max-width:520px;padding:0 16px;box-sizing:border-box}"
  "h1{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase;letter-spacing:.04em;font-size:1.6rem;margin:18px 0 2px}"
  ".wrap>h3{color:#3A332A;font-weight:400;font-size:1rem;margin:0 0 18px}"
  "button,input[type='submit']{background:#2E5DD6;color:#FFFAEF;border:2px solid #161310;border-radius:0;"
  "box-shadow:4px 4px 0 #161310;min-height:48px;font-weight:700;font-size:1.1rem;line-height:1.3}"
  "button:active,input[type='submit']:active{transform:translate(2px,2px);box-shadow:2px 2px 0 #161310;opacity:1 !important}"
  "input,select{background:#FFFAEF;color:#161310;border:2px solid #161310;border-radius:0;min-height:44px;font-size:16px;width:100%}"
  "select{padding-right:28px}"
  "input[type='checkbox']{width:auto;min-height:0;margin-right:6px}"
  "label[for='showpass']{font-size:.9rem}"
  "input:focus-visible,select:focus-visible,button:focus-visible{outline:0;box-shadow:0 0 0 3px #2E5DD6}"
  ".msg{background:#FFFAEF;border:2px solid #161310;border-left-width:5px;border-left-color:#2E5DD6;border-radius:0}"
  "a{color:#161310}a:hover{color:#2E5DD6}"
  // Field labels and the submit button are library strings, so they get rewritten
  // here; see the note above about this tying us to 2.0.17's markup.
  // The SSID box stays in the form (it is what gets submitted) but out of sight:
  // the network list above fills it. See SPOT_PICKER's script.
  "#s,label[for='s']{display:none}"
  "label[for='p']{font-size:0;display:block;margin-top:14px}"
  "label[for='p']::before{content:'2. WiFi password ';font-size:1rem;font-weight:700}"
  "label[for='p']::after{content:'*';font-size:1rem;font-weight:700;color:#A8200D}"
  "input:disabled{opacity:.45}"
  // Network rows: card buttons, filled blue once picked.
  ".gsvh{font-weight:700;margin:4px 0 8px}"
  ".gsvnet{display:flex;align-items:center;gap:8px;background:#FFFAEF;border:2px solid #161310;"
  "box-shadow:3px 3px 0 #161310;margin:0 0 10px;padding:0 10px;min-height:52px;cursor:pointer}"
  ".gsvnet a{flex:1;color:#161310;font-size:1.05rem;padding:14px 0;text-decoration:none;overflow-wrap:anywhere}"
  ".gsvnet a:hover{color:#161310;text-decoration:none}"
  ".gsvnet::after{content:'Pick';font-weight:700;font-size:.9rem;color:#2E5DD6}"
  ".gsvnet .q{float:none;min-width:0;padding:0}"
  ".gsvnet.sel{background:#2E5DD6;box-shadow:none;transform:translate(3px,3px)}"
  ".gsvnet.sel a,.gsvnet.sel::after{color:#FFFAEF}"
  ".gsvnet.sel::after{content:'Picked'}"
  ".gsvnet.sel .q{filter:invert(1)}"
  "#gsvsel{font-size:14px;margin:4px 0 6px}"
  "form[action$='wifisave'] button[type='submit']{font-size:0;margin-top:18px}"
  "form[action$='wifisave'] button[type='submit']::after{content:'Update';font-size:1.1rem}"
  "button[disabled]{opacity:.45;box-shadow:2px 2px 0 #161310;transform:translate(2px,2px)}"
  // only reachable if the redirect above doesn't run
  "form[action='/wifi'] button{font-size:0}"
  "form[action='/wifi'] button::after{content:'Set up the display';font-size:1.1rem}"
  "</style>";

Preferences prefs;
String spotId   = "diamond"; // slug the API knows; unknown ones fall back to Diamond Bay
bool drawnOnce  = false;     // a forecast is already on the screen (see DRAWN_FLAG)
// Survives deep sleep but not an EN press, so a reset re-syncs the clock. That
// is the cheap direction to be wrong in.
RTC_DATA_ATTR time_t lastNtpSync = 0;

// The portal opens on its own when WiFi won't connect. To reach it on a working
// unit: press EN (reset) twice — once to restart it, again while it's awake.
// The flag lives in NVS, not RTC memory: EN cuts power to the RTC domain, so
// anything kept there reads back empty and the second press looks like the first.
// GPIO0/BOOT can't do this either, as a wake on it boots with the pin still low,
// which is the ESP32's serial-bootloader strap.
const char* PORTAL_FLAG = "portalpend";
// Set once a forecast has been drawn. It answers two questions: whether there's
// a screen worth keeping when a run fails, and whether this unit has ever been
// set up (it can't have drawn one without credentials).
const char* DRAWN_FLAG = "drawn";
const int PORTAL_TIMEOUT_S = 180;         // don't hold a battery unit open forever

// Refreshes land on the top of the hour rather than an hour after the last run
// finished, which used to let them drift into :12, :25 and so on. Nothing is
// drawn between QUIET_START_H and QUIET_END_H: nobody reads a dive panel at 3am,
// and on a battery those eight wakes are a third of the day's runs.
// Hours from QUIET_START_H to QUIET_END_H-1 are skipped, so the last refresh of
// the evening is 21:00 and the first of the morning is 05:00.
const int QUIET_START_H = 22;
const int QUIET_END_H   = 5;
// Fallback when the clock can't be trusted, i.e. WiFi or NTP failed.
const uint64_t RETRY_SECONDS = 3600;

// ---- Panel geometry ----
const int PANEL_W = 800;
const int PANEL_H = 480;
const int TITLE_H = 55;
const int FOOTER_H = 20;
const size_t FRAME_BYTES = PANEL_W / 8 * PANEL_H; // 48000, the server's frame

void setup() {
  Serial.begin(115200);
  Serial.println("setup");

#if defined(ESP32) && defined(USE_HSPI_FOR_EPD)
  hspi.begin(13, 12, 14, 15);
  display.epd2.selectSPI(hspi, SPISettings(4000000, MSBFIRST, SPI_MODE0));
#endif

  display.init(115200);

  prefs.begin("gsv", false);
  spotId = prefs.getString("spot", spotId);

  // Set on every boot, cleared once a run finishes. Still set = the last boot
  // never reached sleep, i.e. EN was pressed again mid-run.
  bool portalRequested = prefs.getBool(PORTAL_FLAG, false);
  prefs.putBool(PORTAL_FLAG, true);
  drawnOnce = prefs.getBool(DRAWN_FLAG, false);
  Serial.print("wake cause: ");
  Serial.print(esp_sleep_get_wakeup_cause());
  Serial.print("  portal requested: ");
  Serial.println(portalRequested ? "yes" : "no");

  // The 5th argument lands inside the <input> tag: the saved field is hidden and
  // the <select> in SPOT_PICKER writes into it.
  WiFiManagerParameter spotParam("spot", "", spotId.c_str(), 24, "type='hidden'");
  WiFiManagerParameter introBlock(PORTAL_INTRO);
  WiFiManagerParameter spotPicker(SPOT_PICKER);

  WiFiManager wm;
  wm.setTitle("Gimmie Sick Vis");
  wm.setCustomHeadElement(PORTAL_CSS);
  wm.addParameter(&introBlock); // first, so it renders above the fields
  wm.addParameter(&spotPicker); // the menu, then the hidden field it feeds
  wm.addParameter(&spotParam);
  wm.setConfigPortalTimeout(PORTAL_TIMEOUT_S);
  // Everything on one page: setMenu() moves params onto their own page whenever
  // "param" is listed, so leaving it out keeps them under the WiFi fields.
  std::vector<const char*> menu = {"wifi"};
  wm.setMenu(menu); // takes a non-const reference, so it needs a named vector
  // A router reboot shouldn't cost the wall three minutes of setup screen: on a
  // unit that has drawn before, a failed connect fails fast and the last
  // forecast stays up. A brand-new one still needs the portal to open by
  // itself, which is the only way in before anyone knows the AP exists.
  wm.setEnableConfigPortal(!drawnOnce);
  // Save on the portal's Save button, not on a clean exit: a customer who
  // changes the spot and wanders off would otherwise lose it to the timeout.
  // A blank SSID means WiFiManager skips the wifi save (keeping the stored
  // network), so nothing closes the portal. Shorten the timeout on save instead:
  // ~20s after the last page load it closes and the panel redraws.
  bool portalSaved = false;
  wm.setSaveParamsCallback([&]() {
    saveSpot(spotParam.getValue());
    portalSaved = true;
    wm.setConfigPortalTimeout(20);
  });
  wm.setAPCallback([](WiFiManager *) { drawSetupScreen(); });

  bool connected = portalRequested ? wm.startConfigPortal(portalName)
                                   : wm.autoConnect(portalName);

  // Someone pressed Update. The portal leaves the radio in AP mode with the
  // station switched off (WiFiManager.cpp:720-730), so rather than coax it back
  // by hand, start the boot over: a cold boot is the ordinary autoConnect path,
  // the one that works every other hour of the day. Clear the double-press flag
  // first or the fresh boot reopens the portal. Only a human pressing Update
  // gets here, so this can't turn into a reboot loop.
  if (!connected && portalSaved) {
    Serial.println("saved from portal - restarting into a normal run");
    prefs.putBool(PORTAL_FLAG, false);
    prefs.end();
    delay(100); // let the serial line and the portal's last response drain
    ESP.restart();
  }

  // Portal timed out with nobody touching it. Join with whatever is stored
  // rather than burning an hour on an error screen. The station has to be
  // switched back on before asking: with STA down, WiFi.SSID() reads empty on
  // the ESP32 core even though the credentials are still in flash — which is
  // what used to make this block get skipped.
  if (!connected) {
    WiFi.mode(WIFI_STA);
    if (WiFi.SSID().length() > 0) {
      WiFi.begin();
      unsigned long start = millis();
      while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) {
        delay(250);
      }
      connected = (WiFi.status() == WL_CONNECTED);
    }
  }

  if (!connected) {
    // No network saved either, so nothing is going to refresh this screen on its
    // own: the message wins, even over a forecast.
    if (WiFi.SSID().length() == 0) drawnOnce = false;
    reportFailure("No WiFi - press EN twice to set up");
    goToSleep(RETRY_SECONDS);
    return;
  }

  saveSpot(spotParam.getValue());

  // The portal leaves the radio in AP+STA. SNTP can pick the AP interface and
  // never hear a reply, so drop back to station-only before asking for time.
  WiFi.mode(WIFI_STA);
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  // The RTC keeps running through deep sleep, so an ordinary wake already knows
  // the time and can skip the sync — which is up to 30 seconds of radio and one
  // of the three ways a run can fail. The zone has to be set every boot either
  // way, since the environment doesn't survive sleep.
  setenv("TZ", tzMelbourne, 1);
  tzset();
  struct tm timeinfo;
  bool clockSet = getLocalTime(&timeinfo, 100);
  bool stale = !clockSet || (time(nullptr) - lastNtpSync) > 86400 || lastNtpSync == 0;
  if (stale) {
    Serial.println("syncing clock");
    configTzTime(tzMelbourne, ntpServer, ntpServer2, ntpServer3);
    if (!getLocalTime(&timeinfo, NTP_TIMEOUT_MS)) {
      Serial.println("NTP failed - no reply on UDP 123 within timeout");
      reportFailure("No time sync - check the router allows NTP");
      goToSleep(RETRY_SECONDS);
      return;
    }
    lastNtpSync = time(nullptr);
  }
  Serial.println(&timeinfo, "time: %Y-%m-%d %H:%M:%S");

  uint8_t* frame = (uint8_t*)malloc(FRAME_BYTES);
  if (!frame) {
    reportFailure("Out of memory");
  } else if (!fetchScreen(frame)) {
    reportFailure("Fetch failed");
  } else {
    drawScreen(frame);
    if (!drawnOnce) {
      drawnOnce = true;
      prefs.putBool(DRAWN_FLAG, true);
    }
  }
  free(frame);

  WiFi.disconnect(true);

  // Re-read the clock rather than scheduling off timeinfo: the fetch and the
  // e-ink refresh have eaten half a minute since then, and that is exactly the
  // error that would land the next wake just before the hour instead of after.
  struct tm now;
  goToSleep(getLocalTime(&now, 100) ? sleepSeconds(now) : RETRY_SECONDS);
}

// A failed run leaves the last forecast on the wall instead of replacing it with
// an error line: e-ink holds its image with no power, and the screen carries its
// own UPDATED stamp, so a stale panel reads as stale rather than broken. Only a
// unit that has never drawn one has nothing to lose by showing the message.
void reportFailure(const char* msg) {
  Serial.println(msg);
  if (!drawnOnce) drawError(msg);
}

// Persist a spot only when it's a real change — NVS writes are finite.
void saveSpot(const char* value) {
  if (value == nullptr || strlen(value) == 0) return; // field left blank: keep what's stored
  if (spotId == value) return;
  spotId = value;
  prefs.putString("spot", spotId);
  Serial.print("spot -> ");
  Serial.println(spotId);
}

void loop() {
  // never reached — ESP32 restarts from setup() after each deep sleep wake
}

// Fills frame with the server-drawn screen. False means nothing usable came
// back, so the caller leaves the last good screen up; a short body is a failure,
// not a partial draw, or a dropped connection would paint half a forecast.
bool fetchScreen(uint8_t* frame) {
  String fw = FW_VERSION;
  fw.replace(" ", "%20");
  String url = String(relayBaseUrl) + "?spot=" + spotId + "&fw=" + fw;

  // Two goes, because the alternative to a 3 second retry is an hour of stale
  // screen. Both timeouts are set explicitly: a stalled TLS handshake would
  // otherwise hold the radio on with nothing to show for it.
  for (int attempt = 1; attempt <= 2; attempt++) {
    if (attempt > 1) delay(3000);
    HTTPClient http;
    http.setConnectTimeout(8000);
    http.setTimeout(8000);
    // HTTP/1.0 rules out chunked encoding, so the raw stream below is the body
    // and nothing else.
    http.useHTTP10(true);
    http.begin(url);
    int code = http.GET();
    size_t got = 0;
    if (code == 200) {
      // Looped, not one readBytes(): the ESP32 core's client overrides it with a
      // single read() that returns whatever TLS has decrypted so far (2358 bytes
      // on the first try), not the count asked for. A stall of 8 s gives up.
      Stream* stream = http.getStreamPtr(); // NetworkClient on core 3.x, WiFiClient on 2.x
      unsigned long last = millis();
      while (got < FRAME_BYTES && millis() - last < 8000) {
        if (stream->available()) {
          got += stream->readBytes(frame + got, FRAME_BYTES - got);
          last = millis();
        } else if (!http.connected()) {
          break;
        } else {
          delay(5);
        }
      }
    }
    http.end();
    if (code == 200 && got == FRAME_BYTES) return true;
    Serial.printf("fetch attempt %d failed: HTTP %d, %u of %u bytes\n",
                  attempt, code, (unsigned)got, (unsigned)FRAME_BYTES);
  }
  return false;
}

void drawScreen(const uint8_t* frame) {
  display.setFullWindow();
  display.firstPage();
  do {
    display.fillScreen(GxEPD_WHITE);
    display.drawBitmap(0, 0, frame, PANEL_W, PANEL_H, GxEPD_BLACK);
  } while (display.nextPage());
  display.powerOff();
}

// Shown while the setup portal is open. drawError() stays the one-line path.
void drawSetupScreen() {
  const char* steps[] = {
    "1.  On a phone or laptop, join the WiFi network:  GimmieSickVis",
    "2.  A setup page opens by itself. If it doesn't, browse to  192.168.4.1",
    "3.  Pick your WiFi network, type its password, then choose a dive spot.",
    "4.  Press Update. This panel redraws within a minute, then updates hourly.",
  };

  display.setFullWindow();
  display.firstPage();
  do {
    display.fillScreen(GxEPD_WHITE);

    display.setFont(&FreeSansBold12pt7b);
    display.setTextColor(GxEPD_BLACK);
    display.setCursor(15, 35);
    display.print("DISPLAY SETUP");
    display.drawLine(0, TITLE_H, PANEL_W, TITLE_H, GxEPD_BLACK);

    display.setFont(&FreeSans9pt7b);
    display.setCursor(15, TITLE_H + 40);
    display.print("This display needs a WiFi network and a dive spot before it can show a forecast.");

    int y = TITLE_H + 90;
    for (int i = 0; i < 4; i++) {
      display.setCursor(30, y);
      display.print(steps[i]);
      y += 34;
    }

    display.setCursor(15, y + 20);
    display.print("Showing: ");
    display.print(spotId);

    int contentBottom = PANEL_H - FOOTER_H;
    display.drawLine(0, contentBottom, PANEL_W, contentBottom, GxEPD_BLACK);
    display.setCursor(15, PANEL_H - 5);
    display.print("This page closes after 3 minutes. Press EN twice to reopen it.");

    int16_t bx, by; uint16_t bw, bh;
    display.getTextBounds(brandText, 0, 0, &bx, &by, &bw, &bh);
    display.setCursor(PANEL_W - bw - 15, PANEL_H - 5);
    display.print(brandText);
  } while (display.nextPage());

  display.powerOff();
}

void drawError(const char* msg) {
  display.setFullWindow();
  display.firstPage();
  do {
    display.fillScreen(GxEPD_WHITE);
    display.setFont(&FreeSansBold12pt7b);
    display.setTextColor(GxEPD_BLACK);
    display.setCursor(15, 40);
    display.print(msg);
  } while (display.nextPage());
  display.powerOff();
}

// Seconds from now to the next refresh: the top of the next hour, then forward
// over any hour inside the quiet block. Pure arithmetic on the local clock.
uint64_t sleepSeconds(const struct tm &t) {
  uint64_t s = 3600 - (t.tm_min * 60 + t.tm_sec);
  int hour = (t.tm_hour + 1) % 24;
  // The cap matters: QUIET_START_H == QUIET_END_H would otherwise never exit.
  for (int i = 0; i < 24 && (hour >= QUIET_START_H || hour < QUIET_END_H); i++) {
    s += 3600;
    hour = (hour + 1) % 24;
  }
  return s;
}

void goToSleep(uint64_t seconds) {
  // A completed run means the next boot isn't a double-press.
  prefs.putBool(PORTAL_FLAG, false);
  Serial.print("sleeping for ");
  Serial.print((uint32_t)seconds);
  Serial.println("s");
  esp_sleep_enable_timer_wakeup(seconds * 1000000ULL);
  esp_deep_sleep_start();
}
