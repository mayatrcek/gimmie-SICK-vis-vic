"use client";

import { useEffect, useRef } from "react";
import { useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-velocity";
import "leaflet-velocity/dist/leaflet-velocity.css";
import { WEATHER, MARINE, TZ } from "@/lib/api/openMeteo";
import {
  FIELDS,
  WINDMAP,
  WIND_MODELS,
  MARINE_MODELS,
  type FieldKey,
} from "@/lib/windmap/config";
import {
  wmGrid,
  asArr,
  buildHourly,
  modelsAtStep,
  averageModels,
  toVelocityData,
  buildFieldImage,
  wmFieldBounds,
  wmCompass,
  sampleAt,
  type Grid,
  type RawField,
  type Cell,
} from "@/lib/windmap/field";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LV = L as any;
const WM_CL_ICONS: Record<FieldKey, string> = {
  wind: '<path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/><path d="M17.7 7.7A2.5 2.5 0 1 1 19.5 12H2"/>',
  swell: '<path d="M2 12c2.5-5 5.5-5 8 0s5.5 5 8 0"/>',
  waves: '<path d="M2 9c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/><path d="M2 15c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/>',
};

export default function WindField({
  activeField,
  hourIdx,
  onReady,
  onError,
  onPick,
}: {
  activeField: FieldKey;
  hourIdx: number;
  onReady: (times: string[], initialStep: number) => void;
  onError: (msg: string) => void;
  onPick: (lat: number, lng: number) => void;
}) {
  const map = useMap();
  const raw = useRef<Partial<Record<FieldKey, RawField>>>({});
  const grid = useRef<Grid | null>(null);
  const dataAt = useRef<Partial<Record<FieldKey, Cell[]>>>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vel = useRef<Record<string, any>>({});
  const color = useRef<Record<string, L.ImageOverlay>>({});
  const spread = useRef<Record<string, L.LayerGroup>>({});
  const built = useRef<Record<string, number>>({});
  const times = useRef<string[]>([]);
  const landMask = useRef<L.TileLayer.WMS | null>(null);
  const selDot = useRef<L.Marker | null>(null);
  const callout = useRef<L.Popup | null>(null);
  const selLL = useRef<L.LatLng | null>(null);
  const ready = useRef(false);

  // ---- one-time data load + land mask ----
  useEffect(() => {
    landMask.current = LV.tileLayer.wms("https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi", {
      layers: "OSM_Land_Mask",
      format: "image/png",
      transparent: true,
      version: "1.3.0",
      opacity: 0,
      className: "wm-landmask",
      attribution: "",
    });
    landMask.current!.addTo(map).setZIndex(400);

    const g = wmGrid();
    grid.current = g;
    const lats = g.pts.map((p) => p[0]);
    const lons = g.pts.map((p) => p[1]);
    const ll = "latitude=" + lats.join(",") + "&longitude=" + lons.join(",");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getJson = (url: string) => fetch(url).then((r) => r.json()).catch(() => null as any);
    // one request per API, both models in it — 7 days stays in the cheap call tier.
    const wUrl = `${WEATHER}?${ll}&hourly=wind_speed_10m,wind_direction_10m&models=${WIND_MODELS.join(",")}&forecast_days=7&timezone=${TZ}`;
    const mUrl = `${MARINE}?${ll}&hourly=wave_height,wave_direction,swell_wave_height,swell_wave_direction&models=${MARINE_MODELS.join(",")}&forecast_days=7&timezone=${TZ}`;

    Promise.all([getJson(wUrl), getJson(mUrl)])
      .then(([wRes, mRes]) => {
        const wArr = wRes && asArr(wRes);
        const mArr = mRes && asArr(mRes);
        if (!wArr || !wArr.length || !wArr[0].hourly) {
          onError("Couldn’t load the wind field — try again later.");
          return;
        }
        raw.current.wind = buildHourly(wArr, WIND_MODELS, "wind_speed_10m", "wind_direction_10m");
        if (mArr && mArr.length && mArr[0].hourly) {
          raw.current.waves = buildHourly(mArr, MARINE_MODELS, "wave_height", "wave_direction");
          raw.current.swell = buildHourly(mArr, MARINE_MODELS, "swell_wave_height", "swell_wave_direction");
        }
        times.current = wArr[0].hourly.time || [];
        // pick the step nearest "now"
        const now = Date.now();
        let best = 0;
        let bd = Infinity;
        for (let s = 0; s < times.current.length; s++) {
          const dd = Math.abs(new Date(times.current[s]).getTime() - now);
          if (dd < bd) {
            bd = dd;
            best = s;
          }
        }
        ready.current = true;
        onReady(times.current, best);
      })
      .catch(() => onError("Couldn’t load the wind field — try again later."));

    return () => {
      if (landMask.current) map.removeLayer(landMask.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buildSpread(key: FieldKey): L.LayerGroup | null {
    const g = grid.current;
    const data = dataAt.current[key];
    const f = FIELDS[key];
    if (!g || !data) return null;
    const hi = f.spreadHi || 1;
    const grp = L.layerGroup();
    for (let r = 0; r < g.ny; r++)
      for (let c = 0; c < g.nx; c++) {
        const i = r * g.nx + c;
        const cell = data[i];
        if (!cell || cell.mag == null || cell.n < 2 || cell.spread < hi) continue;
        const rad = Math.min(9, 4 + (cell.spread / hi - 1) * 4);
        L.circleMarker(g.pts[i], {
          radius: rad,
          color: "#ffffff",
          weight: 1.4,
          opacity: 0.75,
          fillColor: "#0d1b2a",
          fillOpacity: 0.12,
          interactive: false,
        }).addTo(grp);
      }
    return grp;
  }

  function rebuild(key: FieldKey) {
    const g = grid.current;
    if (!g || !raw.current[key]) return;
    dataAt.current[key] = averageModels(modelsAtStep(raw.current[key]!, hourIdx));
    const d = toVelocityData(dataAt.current[key]!, g.nx, g.ny);
    if (vel.current[key]) vel.current[key].setData(d);
    else {
      const f = FIELDS[key];
      vel.current[key] = LV.velocityLayer({
        displayValues: false,
        data: d,
        maxVelocity: f.maxVelocity,
        velocityScale: f.velocityScale * 0.75,
        colorScale: f.colorScale,
        particleAge: 90,
        lineWidth: 1.4,
        particleMultiplier: 1 / 600,
        frameRate: 18,
      });
    }
    const url = buildFieldImage(key, g, dataAt.current[key]!);
    const bounds = wmFieldBounds(g);
    if (url) {
      if (color.current[key]) {
        color.current[key].setBounds(L.latLngBounds(bounds));
        color.current[key].setUrl(url);
      } else {
        color.current[key] = L.imageOverlay(url, bounds, { opacity: 1, pane: "tilePane", interactive: false });
        color.current[key].setZIndex(200);
      }
    }
    const wasOn = spread.current[key] && map.hasLayer(spread.current[key]);
    if (wasOn) map.removeLayer(spread.current[key]);
    const sp = buildSpread(key);
    if (sp) spread.current[key] = sp;
    if (wasOn && spread.current[key]) spread.current[key].addTo(map);
    built.current[key] = hourIdx;
  }

  function calloutHtml(lat: number, lng: number): string {
    const g = grid.current!;
    const sample = (key: FieldKey) => (raw.current[key] ? sampleAt(raw.current[key]!, g, hourIdx, lat, lng) : null);
    const wind = sample("wind");
    const swell = sample("swell");
    const waves = sample("waves");
    const row = (key: FieldKey, label: string, val: string) =>
      `<div class="wm-cl-row"><span class="wm-cl-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${WM_CL_ICONS[key]}</svg></span><span class="wm-cl-lbl">${label}</span><span class="wm-cl-val">${val}</span></div>`;
    const w = wind ? `${Math.round(wind.mag)} km/h ${wmCompass(wind.dir)}` : "—";
    const s = swell ? `${swell.mag.toFixed(1)} m ${wmCompass(swell.dir)}` : "—";
    const v = waves ? `${waves.mag.toFixed(1)} m ${wmCompass(waves.dir)}` : "—";
    return `<div class="wm-cl">${row("wind", "Wind", w)}${row("swell", "Swell", s)}${row("waves", "Waves", v)}</div>`;
  }

  function showReadout(latlng: L.LatLng) {
    selLL.current = latlng;
    if (!selDot.current) {
      selDot.current = L.marker(latlng, {
        icon: L.divIcon({ className: "wm-seldot-wrap", html: '<span class="wm-seldot"></span>', iconSize: [24, 24], iconAnchor: [12, 12] }),
        interactive: false,
        keyboard: false,
        zIndexOffset: 1000,
      }).addTo(map);
    } else selDot.current.setLatLng(latlng);
    if (!callout.current)
      callout.current = L.popup({ closeButton: false, autoClose: false, closeOnClick: false, autoPan: false, className: "wm-callout", offset: [0, -12] });
    callout.current.setLatLng(latlng).setContent(calloutHtml(latlng.lat, latlng.lng));
    if (!map.hasLayer(callout.current)) callout.current.openOn(map);
  }

  // ---- react to field / step changes ----
  useEffect(() => {
    if (!ready.current) return;
    // build the active field if the slider moved while it was hidden
    if (raw.current[activeField] && built.current[activeField] !== hourIdx) rebuild(activeField);
    // hide the others
    (Object.keys(FIELDS) as FieldKey[]).forEach((k) => {
      if (k === activeField) return;
      if (vel.current[k] && map.hasLayer(vel.current[k])) map.removeLayer(vel.current[k]);
      if (color.current[k] && map.hasLayer(color.current[k])) map.removeLayer(color.current[k]);
      if (spread.current[k] && map.hasLayer(spread.current[k])) map.removeLayer(spread.current[k]);
    });
    if (color.current[activeField] && !map.hasLayer(color.current[activeField])) {
      color.current[activeField].addTo(map);
      color.current[activeField].setZIndex(200);
    }
    if (vel.current[activeField] && !map.hasLayer(vel.current[activeField])) vel.current[activeField].addTo(map);
    if (spread.current[activeField] && !map.hasLayer(spread.current[activeField])) spread.current[activeField].addTo(map);
    landMask.current?.setOpacity(FIELDS[activeField].api === "marine" ? 1 : 0);
    if (callout.current && selLL.current && map.hasLayer(callout.current))
      callout.current.setContent(calloutHtml(selLL.current.lat, selLL.current.lng));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeField, hourIdx]);

  useMapEvents({
    click(e) {
      if (!ready.current) return;
      showReadout(e.latlng);
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}
