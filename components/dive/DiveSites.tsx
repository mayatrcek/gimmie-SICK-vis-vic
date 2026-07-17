"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { REGIONS, SPOTS, DEFAULTS } from "@/lib/data/regions";
import MapLoading from "@/components/MapLoading";
import { fetchSite } from "@/lib/api/openMeteo";
import { todayRating, todayRow } from "@/lib/logic/rating";
import type { Hourly, Row, Spot } from "@/lib/types";
import { dotIcon } from "@/lib/leaflet/icons";
import { pixelBasemap, pixelBaseOverlay } from "@/lib/leaflet/pixelTiles";
import ForecastTable from "./ForecastTable";

type St = { rows: Row[] | null; hourly: Hourly | null; loading: boolean; expanded: boolean; sst?: number | null };
type SelMap = Record<string, St>;

const fmt = (n: number | null, d = 1) => (n == null || isNaN(n) ? "—" : Number(n).toFixed(d));

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

function SpotCard({
  id,
  s,
  st,
  onToggle,
  onRemove,
}: {
  id: string;
  s: Spot;
  st: St;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const td = st.rows ? todayRow(st.rows) : null;
  const sst = st.sst ?? td?.sst ?? null; // NOAA scan first, Open-Meteo fallback
  return (
    <div className="scard">
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
      {st.expanded && (
        <div className="sbody">
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
  );
}

export default function DiveSites() {
  const [selected, setSelected] = useState<SelMap>({});
  const didInit = useRef(false);

  function addSpot(id: string) {
    const s = SPOTS[id];
    if (!s) return;
    setSelected((prev) => {
      if (prev[id]) return prev;
      return { ...prev, [id]: { rows: null, hourly: null, loading: true, expanded: false } };
    });
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

  function removeSpot(id: string) {
    setSelected((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function toggleExpand(id: string) {
    setSelected((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], expanded: !prev[id].expanded } } : prev));
  }

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    DEFAULTS.forEach(addSpot);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ids = Object.keys(selected);
  const positions: LatLngExpression[] = ids.map((id) => [SPOTS[id].lat, SPOTS[id].lon]);

  return (
    <div id="sub-divesites">
      <h2 className="sec">
        Dive sites
      </h2>
      <div className="picker">
        <label htmlFor="spotSelect">Add a location</label>
        <select
          id="spotSelect"
          value=""
          onChange={(e) => {
            const id = e.target.value;
            if (id) addSpot(id);
          }}
        >
          <option value="">Choose a Victorian spot…</option>
          {REGIONS.map((rg) => (
            <optgroup key={rg.region} label={rg.region}>
              {rg.spots.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <span style={{ color: "var(--muted)" }}>
          Grouped by region (Surf-Forecast VIC). Click a card to expand its 7-day outlook.
        </span>
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

      <div className="sidepanel">
        {ids.length === 0 ? (
          <div className="empty">
            Pick a Victorian spot from the menu above to add it below. Each card shows today at a
            glance — click to expand wind, swell &amp; tide graphs and the week ahead.
          </div>
        ) : (
          ids.map((id) => (
            <SpotCard key={id} id={id} s={SPOTS[id]} st={selected[id]} onToggle={toggleExpand} onRemove={removeSpot} />
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
