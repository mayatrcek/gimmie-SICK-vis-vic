"use client";

import "leaflet/dist/leaflet.css";
import { useState } from "react";
import { MapContainer, TileLayer, ScaleControl } from "react-leaflet";
import { fetchPointForecast } from "@/lib/api/openMeteo";
import { FIELDS, WM_BOUNDS, WM_HOME, WM_HOME_ZOOM, type FieldKey } from "@/lib/windmap/config";
import WindField from "./WindField";
import MapLoading from "@/components/MapLoading";
import PointForecast from "./PointForecast";

const FIELD_ICONS: Record<FieldKey, string> = {
  wind: '<path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/><path d="M17.7 7.7A2.5 2.5 0 1 1 19.5 12H2"/>',
  swell: '<path d="M2 12c2.5-5 5.5-5 8 0s5.5 5 8 0"/>',
  waves: '<path d="M2 9c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/><path d="M2 15c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/>',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Forecast = { lat: number; lng: number; name: string; wRes: any; mRes: any } | null;

function Legend({ field }: { field: FieldKey }) {
  const f = FIELDS[field];
  return (
    <div className="wm-legend" id="wmlegend">
      <div className="wm-leg-label">
        {f.label} ({f.unit})
      </div>
      <div className="wm-leg-bar" style={{ background: `linear-gradient(90deg,${f.colorScale.join(",")})` }} />
      <div className="wm-leg-ticks">
        {f.legend.map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>
      <div className="wm-leg-note">
        <span className="wm-leg-ring" /> models disagree &middot; avg of {f.src}
      </div>
    </div>
  );
}

function stepLabel(times: string[], idx: number): string {
  const t = times[idx];
  if (!t) return "—";
  const d = new Date(t);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dd = new Date(d);
  dd.setHours(0, 0, 0, 0);
  const diff = Math.round((dd.getTime() - today.getTime()) / 86400000);
  const day =
    diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
  const h = d.getHours();
  const ap = h < 12 ? "am" : "pm";
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return `${day} · ${h12} ${ap}`;
}

export default function WindMap() {
  const [field, setField] = useState<FieldKey>("wind");
  const [times, setTimes] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [forecast, setForecast] = useState<Forecast>(null);
  const [reqId, setReqId] = useState(0);

  function onPick(lat: number, lng: number) {
    const id = reqId + 1;
    setReqId(id);
    setForecast({ lat, lng, name: "Loading…", wRes: null, mRes: null });
    fetch(`/api/geocode?lat=${lat}&lon=${lng}`)
      .then((r) => r.json())
      .then((j) => setForecast((f) => (f && f.lat === lat && f.lng === lng ? { ...f, name: j.name || "Offshore Victoria" } : f)))
      .catch(() => {});
    fetchPointForecast(lat, lng)
      .then(([wRes, mRes]) => setForecast((f) => (f && f.lat === lat && f.lng === lng ? { ...f, wRes, mRes } : f)))
      .catch(() => setForecast((f) => (f ? { ...f, wRes: "error" } : f)));
  }

  function closeForecast() {
    setForecast(null);
    setReqId((n) => n + 1);
  }

  return (
    <div id="sub-windmap">
      <div className={`wm-mapwrap wm-full${forecast ? " wmf-open" : ""}`}>
        <MapContainer
          id="windmap"
          center={WM_HOME}
          zoom={WM_HOME_ZOOM}
          scrollWheelZoom
          minZoom={6}
          maxZoom={14}
          maxBounds={WM_BOUNDS}
          maxBoundsViscosity={1.0}
        >
          <MapLoading />
          {/* flat land/ocean canvas so only water gets colour-coded for marine fields */}
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            attribution="Basemap &copy; Esri; Wind/wave data: Open-Meteo"
            maxZoom={16}
          />
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
            opacity={0.9}
            zIndex={650}
          />
          {/* land shade over the colour field (multiply leaves ocean colours, greys land) */}
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            maxZoom={16}
            className="wm-landshade"
            zIndex={300}
          />
          <ScaleControl metric imperial={false} position="bottomright" />
          <WindField activeField={field} hourIdx={step} onReady={(t, s) => { setTimes(t); setStep(s); }} onError={setErr} onPick={onPick} />
        </MapContainer>

        <div className="wm-toggle" role="tablist" aria-label="Map field">
          {(Object.keys(FIELDS) as FieldKey[]).map((k) => (
            <button key={k} className={`wm-tab${field === k ? " active" : ""}`} onClick={() => setField(k)}>
              <span className="wm-tab-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: FIELD_ICONS[k] }} />
              </span>
              <span className="wm-tab-label">{FIELDS[k].label}</span>
            </button>
          ))}
        </div>

        <Legend field={field} />

        <div className="wm-timebar">
          <div className="wm-time-track">
            <input
              type="range"
              id="wmTime"
              className="wm-time-range"
              min={0}
              max={Math.max(0, times.length - 1)}
              value={step}
              step={1}
              onChange={(e) => setStep(+e.target.value)}
              aria-label="Forecast time"
              disabled={!times.length}
            />
          </div>
          <span className="wm-timelabel">
            <span id="wmTimeLabel">{times.length ? stepLabel(times, step) : err || "Loading…"}</span>
          </span>
        </div>

        {forecast && (
          <div id="wmforecast">
            <div className="wmf-head">
              <div className="wmf-htext">
                <div className="wmf-title">
                  Point forecast — <span>{forecast.name}</span>
                </div>
                <div className="wmf-coord">
                  {forecast.lat.toFixed(3)}, {forecast.lng.toFixed(3)} · 48-hour outlook, 3-hourly
                </div>
              </div>
              <button className="wmf-close" onClick={closeForecast} title="Close point forecast" aria-label="Close point forecast">
                ×
              </button>
            </div>
            <div className="wmf-wrap">
              <div id="wmfBody">
                {forecast.wRes === "error" ? (
                  <div className="pad" style={{ padding: 14, color: "var(--muted)", fontSize: 13 }}>
                    Couldn’t load the forecast for this point — try another cell.
                  </div>
                ) : forecast.wRes && forecast.mRes ? (
                  <PointForecast lat={forecast.lat} lng={forecast.lng} wRes={forecast.wRes} mRes={forecast.mRes} />
                ) : (
                  <div className="pad loadgif" style={{ padding: 14 }} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
