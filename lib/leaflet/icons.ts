import L from "leaflet";

// Coloured square marker for a dive spot (colour = today's rating).
// OVERWORLD chrome: square, 2px ink border, hard offset block shadow.
export function dotIcon(col: string): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;background:${col};border:2px solid #161310;box-shadow:2px 2px 0 0 #161310"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  });
}

// Google-Maps-style pin dropped where the user clicks (geo/depth maps).
export function pinIcon(): L.DivIcon {
  return L.divIcon({
    className: "gmpin",
    html:
      '<svg width="26" height="38" viewBox="0 0 26 38" xmlns="http://www.w3.org/2000/svg"><path d="M13 1C6.4 1 1 6.4 1 13c0 8.7 12 24 12 24s12-15.3 12-24C25 6.4 19.6 1 13 1z" fill="#ea4335" stroke="#ffffff" stroke-width="1.4"/><circle cx="13" cy="13" r="4.4" fill="#8b1a0e"/></svg>',
    iconSize: [26, 38],
    iconAnchor: [13, 37],
    popupAnchor: [0, -34],
  });
}
