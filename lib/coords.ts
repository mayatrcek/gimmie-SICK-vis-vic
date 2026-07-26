export function fmtLatLng(lat: number, lng: number) {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

const COPY_ICON =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

// Builds a "lat, lng + copy icon" DOM node for a Leaflet popup (real nodes,
// not an HTML string, so the click listener stays alive after Leaflet
// inserts it into the map).
export function coordPopupContent(lat: number, lng: number): HTMLElement {
  const row = document.createElement("div");
  row.className = "coord-popup-body";
  const text = document.createElement("span");
  text.textContent = fmtLatLng(lat, lng);
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "coord-copy-btn";
  btn.setAttribute("aria-label", "Copy coordinates");
  btn.innerHTML = COPY_ICON;
  btn.onclick = () => {
    navigator.clipboard?.writeText(fmtLatLng(lat, lng));
    btn.classList.add("is-copied");
  };
  row.append(text, btn);
  return row;
}
