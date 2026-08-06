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

// Blocky pixel-art circle, centred exactly on the clicked point — the click
// probe marker on every geo map (coord-copy, depth).
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
