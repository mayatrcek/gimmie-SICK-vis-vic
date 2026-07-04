"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, LayersControl, WMSTileLayer, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { REGIONS, SPOTS, DEFAULTS } from "@/lib/data/regions";
import MapLoading from "@/components/MapLoading";
import { fetchSite } from "@/lib/api/openMeteo";
import { compass, todayRating, todayRow } from "@/lib/logic/rating";
import type { Hourly, Row, Spot } from "@/lib/types";
import { dotIcon } from "@/lib/leaflet/icons";
import SpotCharts from "./SpotCharts";

type St = { rows: Row[] | null; hourly: Hourly | null; loading: boolean; expanded: boolean };
type SelMap = Record<string, St>;

const fmt = (n: number | null, d = 1) => (n == null || isNaN(n) ? "—" : Number(n).toFixed(d));

function dnameShort(ds: string): string {
  const dt = new Date(ds + "T00:00:00");
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const diff = Math.round((dt.getTime() - t.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tmw";
  return dt.toLocaleDateString(undefined, { weekday: "short" });
}

const ICON = {
  wave: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2e7d6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12c-.8-4-4.6-6.3-8.4-4.6C9.3 8.8 8 12.4 9.2 15.4c.9 2.2 3.4 3.2 5.4 2 1.5-.9 1.9-2.9.8-4.3"/><path d="M2 18c2.6 0 3.7-1 4.8-2.8"/></svg>',
  wind: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1b6ca8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10a3 3 0 1 0-3-3"/><path d="M3 12h14a3 3 0 1 1-3 3"/><path d="M3 16h7"/></svg>',
  temp: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d97757" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14V5a2 2 0 0 0-4 0v9a4 4 0 1 0 4 0z"/></svg>',
};

function Tag({ svg, children }: { svg: string; children: React.ReactNode }) {
  return (
    <span className="tg">
      <span dangerouslySetInnerHTML={{ __html: svg }} /> {children}
    </span>
  );
}

function WeekStrip({ s, rows }: { s: Spot; rows: Row[] }) {
  return (
    <div className="weekstrip">
      {rows.map((r) => (
        <div className="wcell" key={r.date}>
          <div className="wd">{dnameShort(r.date)}</div>
          <div className="wbar" style={{ background: r.rating.col }} title={String(r.rating.label)} />
          <div className="wv">{s.sheltered ? "—" : fmt(r.h, 1) + "m"}</div>
          <div className="wv2">{fmt(r.wind, 0)}k</div>
        </div>
      ))}
    </div>
  );
}

// Fit the map to the selected markers whenever the set changes.
function FitBounds({ positions }: { positions: LatLngExpression[] }) {
  const map = useMap();
  const key = positions.map((p) => (p as [number, number]).join(",")).join("|");
  useEffect(() => {
    if (positions.length === 1) map.setView(positions[0], 9);
    else if (positions.length > 1) map.fitBounds(positions as [number, number][], { padding: [30, 30] });
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
  const tr = td ? td.rating : { label: st.loading ? "…" : "n/a", col: "#d7d4c8" };
  return (
    <div className="scard">
      <div className="schead" onClick={() => onToggle(id)}>
        <span className="chev">{st.expanded ? "▾" : "▸"}</span>
        <div className="smeta">
          <div className="sname">
            {s.name} <span className="sreg">{s.region}{s.sheltered ? " · sheltered" : ""}</span>
          </div>
          <div className="stoday">
            {td ? (
              <>
                <Tag svg={ICON.wave}>{s.sheltered ? "sheltered" : `${fmt(td.h, 1)} m / ${fmt(td.p, 0)} s`}</Tag>
                <Tag svg={ICON.wind}>
                  {fmt(td.wind, 0)} km/h{td.wdir != null ? " " + compass(td.wdir) : ""}
                </Tag>
                <Tag svg={ICON.temp}>{fmt(td.sst, 1)}°C</Tag>
              </>
            ) : st.loading ? (
              <span className="loadgif-sm">loading…</span>
            ) : (
              "unavailable"
            )}
          </div>
        </div>
        <span className="pill" style={{ background: tr.col }}>
          {tr.label}
        </span>
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
          <div className="sbtop">
            <button className="sbclose" onClick={() => onToggle(id)} title="Close outlook">
              × Close outlook
            </button>
          </div>
          {st.hourly ? (
            <>
              <SpotCharts hourly={st.hourly} />
              <div className="ctitle">The week ahead</div>
              {st.rows && <WeekStrip s={s} rows={st.rows} />}
            </>
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
        <span className="dot" style={{ background: "var(--accent)" }} />
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
        <span style={{ color: "var(--muted)", fontSize: 12 }}>
          Grouped by region (Surf-Forecast VIC). Click a card to expand its 7-day outlook.
        </span>
      </div>

      <div className="panel">
        <div className="panel-hd">
          <span className="dot" style={{ background: "var(--accent)" }} />
          <span className="panel-ttl">Dive sites map</span>
          <span className="panel-meta">Click a marker for today&rsquo;s rating</span>
        </div>
        <div className="panel-bd flush">
          <MapContainer
            id="map"
            center={[-38.75, 145.35]}
            zoom={7}
            scrollWheelZoom
            minZoom={6}
            maxBounds={[
              [-44.2, 139.5],
              [-33.8, 150.8],
            ]}
            maxBoundsViscosity={1.0}
          >
            <MapLoading />
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Imagery &copy; Esri, Maxar, Earthstar Geographics"
              maxZoom={19}
            />
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
              opacity={0.9}
            />
            <LayersControl position="topright" collapsed={false}>
              <LayersControl.Overlay name="SST overlay (NOAA)">
                <WMSTileLayer
                  url="https://coastwatch.pfeg.noaa.gov/erddap/wms/jplMURSST41/request?"
                  layers="jplMURSST41:analysed_sst"
                  format="image/png"
                  transparent
                  version="1.3.0"
                  opacity={0.55}
                  attribution="SST: NOAA CoastWatch"
                />
              </LayersControl.Overlay>
            </LayersControl>
            {ids.map((id) => {
              const st = selected[id];
              const s = SPOTS[id];
              const col = st.rows ? todayRating(st.rows).col : st.loading ? "#1b6ca8" : "#d7d4c8";
              const tr = st.rows ? todayRating(st.rows) : null;
              return (
                <Marker key={id} position={[s.lat, s.lon]} icon={dotIcon(col)}>
                  <Popup>
                    <b>{s.name}</b>
                    <br />
                    <span style={{ color: "#5b6b7b" }}>
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
      <div className="rules">
        <b>Amazing</b>: swell &lt;1&nbsp;m, good period (&lt;13&nbsp;s) &amp; light wind (&lt;15&nbsp;km/h). &nbsp;
        <b>Good</b>: swell &lt;1&nbsp;m but wind moderate or period a touch high. &nbsp;
        <b>Marginal</b>: swell 1&ndash;1.5&nbsp;m, <i>or</i> &lt;1&nbsp;m with very high period (&ge;14&nbsp;s), <i>or</i> strong onshore wind. &nbsp;
        <b>Poor</b>: swell &gt;1.5&nbsp;m. &nbsp; (Heavy recent rain knocks a tier off; sheltered bay sites ignore swell.)
      </div>
    </div>
  );
}
