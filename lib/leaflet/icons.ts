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

// Blocky pixel-art circle, centred exactly on the clicked point (coord-copy popups).
const PIXEL_CIRCLE = ["..XXX..", ".XOOOX.", "XOOOOOX", "XOOOOOX", "XOOOOOX", ".XOOOX.", "..XXX.."];

export function pixelDotIcon(fill = "#FFFAEF"): L.DivIcon {
  const px = 3;
  const size = PIXEL_CIRCLE.length * px;
  let rects = "";
  PIXEL_CIRCLE.forEach((row, y) => {
    [...row].forEach((c, x) => {
      if (c === ".") return;
      rects += `<rect x="${x * px}" y="${y * px}" width="${px}" height="${px}" fill="${c === "X" ? "#161310" : fill}"/>`;
    });
  });
  return L.divIcon({
    className: "",
    html: `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">${rects}</svg>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}
