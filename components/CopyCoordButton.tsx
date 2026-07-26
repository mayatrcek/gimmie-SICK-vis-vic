"use client";

import { useState } from "react";
import { fmtLatLng } from "@/lib/coords";

export default function CopyCoordButton({ lat, lng }: { lat: number; lng: number }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={`coord-copy-btn${copied ? " is-copied" : ""}`}
      aria-label="Copy coordinates"
      onClick={() => {
        navigator.clipboard?.writeText(fmtLatLng(lat, lng));
        setCopied(true);
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    </button>
  );
}
