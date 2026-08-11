"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { REGIONS, SPOTS, DEFAULTS, STATES } from "@/lib/data/regions";
import MapLoading from "@/components/MapLoading";
import { fetchSite } from "@/lib/api/openMeteo";
import { todayRating, todayRow, visNotes } from "@/lib/logic/rating";
import type { Hourly, Row, Spot } from "@/lib/types";
import { dotIcon } from "@/lib/leaflet/icons";
import { pixelBasemap, pixelBaseOverlay } from "@/lib/leaflet/pixelTiles";
import { reducedMotion, scrollToEl } from "@/lib/smoothScroll";
import ForecastTable from "./ForecastTable";

type St = { rows: Row[] | null; hourly: Hourly | null; loading: boolean; expanded: boolean; sst?: number | null };
type SelMap = Record<string, St>;

const fmt = (n: number | null, d = 1) => (n == null || isNaN(n) ? "—" : Number(n).toFixed(d));

// How long a card body takes to roll open or shut (see useRoll), and so how long
// the page waits before riding down to a card it has just opened.
const SLIDE_MS = 300;
// Opening snaps out and settles; shutting has to accelerate away instead, or the
// last sliver sits on screen while the eye has already called it closed.
const ROLL_OPEN = "cubic-bezier(.22,1,.36,1)";
const ROLL_SHUT = "cubic-bezier(.65,0,.35,1)";

// Roll a card body open and shut over its own height.
//
// This used to be CSS: grid-template-rows 0fr -> 1fr, which sizes the roll to the
// content without needing a magic number. The catch is that it only animates if
// the browser interpolates grid tracks. Where it doesn't, the change is discrete
// — the track holds its old size and then flips — so the body's top, in practice
// a vis advisory, stayed on screen after the card was shut and then vanished. A
// timing function can't fix that, because a discrete flip ignores it, which is
// exactly what we saw. Animating a measured pixel height runs everywhere.
//
// `mounted` covers the shut roll, which needs the body in the DOM to have
// anything to shrink; onShut is what takes it back out, fired off the animation
// itself rather than a timer set to guess at its length.
function useRoll(el: React.RefObject<HTMLDivElement | null>, mounted: boolean, open: boolean, onShut: () => void) {
  const anim = useRef<Animation | null>(null);
  // Layout, not effect: the body is in the DOM at full height by now, and a
  // passive effect would let that paint for a frame before the roll starts.
  useLayoutEffect(() => {
    const node = el.current;
    if (!node) return;
    if (!mounted) {
      anim.current?.cancel();
      anim.current = null;
      return;
    }
    // Interrupted mid-roll (reopened while shutting), so carry on from wherever
    // it got to. Otherwise a shut starts at full height and an open at nothing.
    const from = anim.current || !open ? node.getBoundingClientRect().height : 0;
    anim.current?.cancel();
    anim.current = null;
    // Cancelling first: with no animation on it the box is back to its auto
    // height, which is what the open roll is aiming at.
    const to = open ? node.getBoundingClientRect().height : 0;
    if (reducedMotion()) {
      if (!open) onShut();
      return;
    }
    const a = node.animate([{ height: `${from}px` }, { height: `${to}px` }], {
      duration: SLIDE_MS,
      easing: open ? ROLL_OPEN : ROLL_SHUT,
      // Shutting holds at zero after it lands. Without it the box springs back to
      // its auto height for the frame between the roll ending and React taking
      // the body out — the whole forecast, flashed back up on the way out.
      // Opening must NOT hold: the height it measured is only right until the
      // forecast arrives and the body grows.
      fill: open ? "none" : "forwards",
    });
    anim.current = a;
    a.finished
      .then(() => {
        // Left in anim.current, not nulled: a filled roll is still pinning the
        // height, so the next one has to cancel it before it can measure.
        if (anim.current === a && !open) onShut();
      })
      .catch(() => {}); // cancelled — whatever replaced it owns the box now
    // No cleanup cancelling this: React runs the old cleanup before the new
    // effect, so tearing the roll down there would snap the box back to its auto
    // height before the next run could read where the roll had actually got to,
    // and reopening mid-shut would jump instead of turning around. The run above
    // cancels its predecessor itself, once it has taken that measurement.
  }, [el, mounted, open, onShut]);
}

// This device's saved locations, as [id, expanded][] — an array, not an object,
// so card order survives. Bump the version suffix if the shape changes.
const KEY = "gsv:locations:v1";

function loadSaved(): [string, boolean][] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY)!);
    // [] is a real state (user removed every card) — only a missing or corrupt
    // entry falls back to DEFAULTS.
    if (!Array.isArray(v)) throw 0;
    // Drop ids that no longer exist, in case a spot is renamed out of regions.ts.
    return v.filter((e) => Array.isArray(e) && SPOTS[e[0]]).map((e) => [e[0], !!e[1]]);
  } catch {
    return DEFAULTS.map((id) => [id, false]); // first visit, or storage blocked
  }
}

// Week-box labels: "Mo" on phones, "Monday" on wider screens (CSS swaps them)
const wd = (ds: string) => new Date(ds + "T00:00:00").toLocaleDateString("en-AU", { weekday: "short" }).slice(0, 2);
const wdFull = (ds: string) => new Date(ds + "T00:00:00").toLocaleDateString("en-AU", { weekday: "long" });

const ICON = {
  temp: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d97757" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14V5a2 2 0 0 0-4 0v9a4 4 0 1 0 4 0z"/></svg>',
};

function Tag({ svg, children }: { svg: string; children: React.ReactNode }) {
  return (
    <span className="tg">
      <span dangerouslySetInnerHTML={{ __html: svg }} /> {children}
    </span>
  );
}

// OVERWORLD-recoloured basemap (imperative leaflet layer, so not a react-leaflet child).
function PixelBasemap() {
  const map = useMap();
  useEffect(() => {
    const base = pixelBaseOverlay().addTo(map); // repo PNG, paints instantly
    const layer = pixelBasemap().addTo(map); // live tiles cover it as they arrive
    return () => {
      map.removeLayer(base);
      map.removeLayer(layer);
    };
  }, [map]);
  return null;
}

// Fit the map to the selected markers whenever the set changes.
function FitBounds({ positions }: { positions: LatLngExpression[] }) {
  const map = useMap();
  const key = positions.map((p) => (p as [number, number]).join(",")).join("|");
  useEffect(() => {
    if (positions.length === 1) map.setView(positions[0], 9);
    else if (positions.length > 1) map.fitBounds(positions as [number, number][], { padding: [30, 30] });
    else map.setView([-38.75, 145.35], 7); // no selection → default VIC view
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return null;
}

// One picker field. A native <select> renders its options in an OS popup we
// can't touch, so this is a plain disclosure button over a list of buttons —
// no faked listbox roles, keyboard works through Tab/Enter/Escape, and the
// items can cascade in the way the nav's tab-menu does.
function PickerMenu({
  id,
  label,
  value,
  options,
  placeholder,
  onPick,
}: {
  id: string;
  label: string;
  value: string;
  options: { id: string; name: string }[];
  placeholder?: string;
  onPick: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  // Set when a pick closes the menu while the pointer is still on the field:
  // :hover would otherwise reopen it straight away, since CSS doesn't know
  // anything was chosen. Cleared when the pointer leaves.
  const [noHover, setNoHover] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const cur = options.find((o) => o.id === value);
  return (
    <div className="pk-field" ref={ref}>
      <label htmlFor={id}>{label}</label>
      <div
        className={`pk-dd${open ? " open" : ""}${noHover ? " nohover" : ""}`}
        onMouseLeave={() => setNoHover(false)}
      >
        <button
          id={id}
          type="button"
          className="pk-trigger"
          aria-haspopup="true"
          aria-expanded={open}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
        >
          <span className="pk-value">{cur ? cur.name : placeholder}</span>
          <span className="pk-caret" aria-hidden>
            ▾
          </span>
        </button>
        <div className="pk-menu" role="menu" aria-label={label}>
          {options.map((o, i) => (
            <button
              key={o.id}
              type="button"
              role="menuitem"
              className={`pk-menu-item${o.id === value ? " active" : ""}`}
              // The item's place in the queue. CSS spends it only while the
              // menu is open or hovered, so the way out isn't staggered too —
              // it can't be an inline transition-delay, because hover opens the
              // menu without React knowing. Capped so a 16-spot region doesn't
              // take a second and a half to finish arriving.
              style={{ "--i": `${Math.min(i, 11) * 45}ms` } as React.CSSProperties}
              onClick={() => {
                onPick(o.id);
                setOpen(false);
                setNoHover(true);
              }}
            >
              {o.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SpotCard({
  id,
  s,
  st,
  closing,
  onToggle,
  onRemove,
  onShut,
}: {
  id: string;
  s: Spot;
  st: St;
  // Mid-roll-up: the body stays mounted until the shut roll finishes.
  closing: boolean;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onShut: (id: string) => void;
}) {
  const td = st.rows ? todayRow(st.rows) : null;
  const sst = st.sst ?? td?.sst ?? null; // NOAA scan first, Open-Meteo fallback
  const wrap = useRef<HTMLDivElement>(null);
  const mounted = st.expanded || closing;
  // Stable, or useRoll would tear down and restart the roll on every render.
  const shut = useCallback(() => onShut(id), [onShut, id]);
  useRoll(wrap, mounted, st.expanded, shut);
  return (
    <div className="scard" id={`spot-${id}`}>
      <div className="schead" onClick={() => onToggle(id)}>
        <span className="chev">{st.expanded ? "▾" : "▸"}</span>
        <div className="smeta">
          <div className="sname">
            {s.name} <span className="sreg">{s.region}{s.sheltered ? " · sheltered" : ""}</span>
          </div>
          <div className="sweek">
            {st.rows ? (
              st.rows.slice(0, 7).map((r) => (
                <span
                  key={r.date}
                  className="sday"
                  style={{ background: r.rating.col }}
                  title={`${wdFull(r.date)}: ${r.rating.label}`}
                >
                  <span className="sday-abbr">{wd(r.date)}</span>
                  <span className="sday-full">{wdFull(r.date)}</span>
                </span>
              ))
            ) : st.loading ? (
              <span className="loadgif-sm">loading…</span>
            ) : (
              "unavailable"
            )}
            {sst != null && (
              <span className="sday stempbox" title="Water temperature (latest NOAA satellite scan)">
                <Tag svg={ICON.temp}>{fmt(sst, 1)}°C</Tag>
              </span>
            )}
          </div>
        </div>
        <button
          className="rm"
          title="Remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(id);
          }}
        >
          ×
        </button>
      </div>
      {/* .open rides `mounted`, not `expanded`: the grid track has to stay at the
          content's height for the whole shut roll, because what animates the box
          down is useRoll's explicit height, not the track. */}
      <div ref={wrap} className={`sbody-wrap${mounted ? " open" : ""}`}>
        {mounted && (
          <div className="sbody">
            {td && (
              <ul className="visnotes">
                {visNotes(s, td.runoff).map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            )}
            {st.hourly && st.rows ? (
              <ForecastTable s={s} hourly={st.hourly} rows={st.rows} />
            ) : st.loading ? (
              <div className="pad loadgif">Loading forecast…</div>
            ) : (
              <div className="pad">Forecast unavailable.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DiveSites() {
  // Restored synchronously: this component is only ever loaded with ssr:false
  // (DiveSitesClient), so localStorage is available and nothing can hydrate
  // against an empty list.
  const [selected, setSelected] = useState<SelMap>(() =>
    Object.fromEntries(
      loadSaved().map(([id, expanded]) => [id, { rows: null, hourly: null, loading: true, expanded }]),
    ),
  );
  const [state, setState] = useState(STATES[0]);
  const [region, setRegion] = useState(REGIONS[0].region);
  const [pick, setPick] = useState("");
  // The card rolling shut — kept mounted until useRoll says its roll has ended.
  const [closing, setClosing] = useState("");
  // The picker starts folded behind the heading's Add site button.
  const [pickerOpen, setPickerOpen] = useState(false);
  // Set once the roll-open has finished, which is when the wrapper can stop
  // clipping — otherwise overflow:hidden (needed for the roll) eats the field
  // menus, which hang below the strip.
  const [pickerSettled, setPickerSettled] = useState(false);
  const settleTimer = useRef<number | undefined>(undefined);
  const didInit = useRef(false);

  function closePicker() {
    clearTimeout(settleTimer.current); // a pending settle would un-clip mid-fold
    setPickerSettled(false);
    setPickerOpen(false);
  }

  function togglePicker() {
    if (pickerOpen) return closePicker();
    setPickerOpen(true);
    settleTimer.current = window.setTimeout(() => setPickerSettled(true), SLIDE_MS);
  }

  const openNow = (m: SelMap) => Object.keys(m).find((k) => m[k].expanded) ?? "";
  // Guarded by id: a card that was superseded by a newer close shouldn't be the
  // one to clear it.
  const clearClosing = useCallback((id: string) => setClosing((c) => (c === id ? "" : c)), []);

  function fetchFor(id: string) {
    const s = SPOTS[id];
    if (!s) return;
    // Water temp from the latest NOAA ACSPO scan (same source as the SST page)
    fetch(`/api/sst-point?lat=${s.lat}&lon=${s.lon}&box=1`)
      .then((r) => r.json())
      .then((j) =>
        setSelected((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], sst: j.sst } } : prev)),
      )
      .catch(() => {}); // card falls back to Open-Meteo sst
    fetchSite(s)
      .then((res) =>
        setSelected((prev) =>
          prev[id] ? { ...prev, [id]: { ...prev[id], rows: res.rows, hourly: res.hourly, loading: false } } : prev,
        ),
      )
      .catch(() =>
        setSelected((prev) =>
          prev[id] ? { ...prev, [id]: { ...prev[id], loading: false, rows: null } } : prev,
        ),
      );
  }

  // `open` is only set when the user adds a spot themselves — the card opens and
  // the page rides down to it. Cards restored on load come in as they were left.
  function addSpot(id: string, open = false) {
    if (!SPOTS[id] || selected[id]) return; // re-picking a shown spot: don't refetch
    if (open) setClosing(openNow(selected)); // sibling rolls up as the new one rolls down
    setSelected((prev) => {
      const next: SelMap = open
        ? Object.fromEntries(Object.entries(prev).map(([k, st]) => [k, { ...st, expanded: false }]))
        : { ...prev };
      next[id] = { rows: null, hourly: null, loading: true, expanded: open };
      return next;
    });
    fetchFor(id);
  }

  function removeSpot(id: string) {
    setSelected((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  // Accordion: opening a card closes the others, so an expanded 7-day table
  // never buries the rest of the list.
  function toggleExpand(id: string) {
    setClosing(openNow(selected)); // whichever was open is the one rolling up
    setSelected((prev) => {
      if (!prev[id]) return prev;
      const open = !prev[id].expanded;
      return Object.fromEntries(
        Object.entries(prev).map(([k, st]) => [k, { ...st, expanded: k === id && open }]),
      ) as SelMap;
    });
  }

  useEffect(() => {
    if (didInit.current) return; // StrictMode remounts in dev; fetch each spot once
    didInit.current = true;
    Object.keys(selected).forEach(fetchFor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save on change only: the payload doubles as the dep, so forecast fetches
  // resolving (which also touch `selected`) don't trigger a write. The first run
  // rewrites exactly what loadSaved() read, so it can't clobber anything.
  const payload = JSON.stringify(Object.entries(selected).map(([id, st]) => [id, st.expanded]));
  useEffect(() => {
    try {
      localStorage.setItem(KEY, payload);
    } catch {} // storage blocked (private mode) → the list just won't persist
  }, [payload]);

  const ids = Object.keys(selected);
  const openId = ids.find((id) => selected[id].expanded) ?? "";

  // A card restored from storage is already open on the first render, and
  // landing on the page shouldn't yank you past the map — only cards opened in
  // this session get scrolled to.
  const skipScroll = useRef(openId !== "");

  // Whichever card is open gets scrolled to — covers both clicking one open and
  // adding one from the picker.
  // Once per opened card, and only once: the loading body reserves a loaded
  // card's height (see .sbody .loadgif), so the page is already its final size
  // when this runs and the forecast landing doesn't move anything.
  //
  // Waits out the roll-open first (SLIDE_MS matches .sbody-wrap's transition).
  // Scrolling during it would aim at a target still on the move — the sibling
  // above is shrinking at the same time — and overshoot by its height.
  useEffect(() => {
    if (skipScroll.current) {
      skipScroll.current = false;
      return;
    }
    if (!openId) return;
    const t = setTimeout(() => {
      const el = document.getElementById(`spot-${openId}`);
      if (el) scrollToEl(el);
    }, SLIDE_MS);
    return () => clearTimeout(t);
  }, [openId]);

  const positions: LatLngExpression[] = ids.map((id) => [SPOTS[id].lat, SPOTS[id].lon]);

  const inState = REGIONS.filter((r) => r.state === state);
  const spots = inState.find((r) => r.region === region)?.spots ?? [];

  return (
    <div id="sub-divesites">
      <h2 className="sec">
        Dive sites
        <button
          className={`pk-toggle${pickerOpen ? " open" : ""}`}
          aria-expanded={pickerOpen}
          aria-controls="site-picker"
          onClick={togglePicker}
        >
          Add site{" "}
          <span className="plus" aria-hidden>
            +
          </span>
        </button>
      </h2>
      <div
        id="site-picker"
        className={`pk-collapse${pickerOpen ? " open" : ""}${pickerSettled ? " settled" : ""}`}
      >
        <div className="picker">
        <PickerMenu
          id="stateSelect"
          label="State"
          value={state}
          options={STATES.map((st) => ({ id: st, name: st }))}
          onPick={(v) => {
            setState(v);
            setRegion(REGIONS.find((r) => r.state === v)!.region);
            setPick("");
          }}
        />

        <span className="pk-arrow" aria-hidden>
          ▶
        </span>

        <PickerMenu
          id="regionSelect"
          label="Region"
          value={region}
          options={inState.map((rg) => ({ id: rg.region, name: rg.region }))}
          onPick={(v) => {
            setRegion(v);
            setPick("");
          }}
        />

        <span className="pk-arrow" aria-hidden>
          ▶
        </span>

        <PickerMenu
          id="spotSelect"
          label="Dive site"
          value={pick}
          placeholder="Choose a spot…"
          options={spots.map((sp) => ({ id: sp.id, name: sp.name }))}
          onPick={setPick}
        />

          <button
            disabled={!pick || !!selected[pick]}
            onClick={() => {
              addSpot(pick, true);
              setPick("");
              closePicker(); // the strip has done its job; fold it away
            }}
          >
            + Add
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-bd flush">
          <MapContainer
            id="map"
            center={[-38.75, 145.35]}
            zoom={7}
            attributionControl={false}
            zoomSnap={0.25}
            zoomControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            touchZoom={false}
            boxZoom={false}
            keyboard={false}
          >
            <MapLoading />
            {/* Base tiles are canvas-recoloured to the OVERWORLD palette (lib/leaflet/
                pixelTiles.ts) and 4x-stretched; labels ride on top at 2x. */}
            <PixelBasemap />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png"
              maxZoom={19}
              opacity={0.9}
              tileSize={512}
              zoomOffset={-1}
            />
            {ids.map((id) => {
              const st = selected[id];
              const s = SPOTS[id];
              const col = st.rows ? todayRating(st.rows).col : st.loading ? "#1b6ca8" : "#d7d4c8";
              const tr = st.rows ? todayRating(st.rows) : null;
              return (
                <Marker
                  key={id}
                  position={[s.lat, s.lon]}
                  icon={dotIcon(col)}
                  eventHandlers={{
                    mouseover: (e) => e.target.openPopup(),
                    mouseout: (e) => e.target.closePopup(),
                  }}
                >
                  <Popup closeButton={false}>
                    <b>{s.name}</b>
                    <br />
                    <span style={{ color: "var(--muted)" }}>
                      {s.region}
                      {s.sheltered ? " · sheltered" : ""}
                    </span>
                    <br />
                    {tr ? (
                      <span>
                        Today:{" "}
                        <span style={{ color: tr.col, fontWeight: 700 }}>{tr.label}</span>
                      </span>
                    ) : (
                      <span className="loadgif-sm">loading…</span>
                    )}
                  </Popup>
                </Marker>
              );
            })}
            <FitBounds positions={positions} />
          </MapContainer>
        </div>
      </div>
      <span className="list-hint">Click a card to expand its 7-day outlook.</span>

      <div className="sidepanel">
        {ids.length === 0 ? (
          <div className="empty">
            Hit <b>Add site</b> up in the heading to pick a spot. Each card shows today at a
            glance — click to expand wind, swell &amp; tide graphs and the week ahead.
          </div>
        ) : (
          ids.map((id) => (
            <SpotCard
              key={id}
              id={id}
              s={SPOTS[id]}
              st={selected[id]}
              closing={closing === id}
              onToggle={toggleExpand}
              onRemove={removeSpot}
              onShut={clearClosing}
            />
          ))
        )}
      </div>

      <div className="legend">
        <span><i className="chip" style={{ background: "var(--amazing)" }} />Amazing</span>
        <span><i className="chip" style={{ background: "var(--good)" }} />Good</span>
        <span><i className="chip" style={{ background: "var(--marg)" }} />Marginal</span>
        <span><i className="chip" style={{ background: "var(--poor)" }} />Poor</span>
      </div>
    </div>
  );
}
