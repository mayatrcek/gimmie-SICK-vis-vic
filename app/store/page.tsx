"use client";

import { useEffect } from "react";

const SHOP = "https://www.madart.shop";

// Interstitial for /store: an ink panel slides down, square dots blink, then we
// hand off. ?to=/products/... deep-links; anything off madart.shop falls back to
// the shop root so this can't be used as an open redirect.
export default function Store() {
  useEffect(() => {
    let dest = SHOP;
    try {
      const u = new URL(new URLSearchParams(location.search).get("to") ?? "/", SHOP);
      if (u.origin === SHOP) dest = u.href;
    } catch {}
    // ponytail: fixed 900ms = 400 slide + a beat of dots; madart's own load can't be covered
    const t = setTimeout(() => location.replace(dest), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="store-go" role="status">
      <h1 className="sr-only">Heading to madart.shop</h1>
      <span /><span /><span />
    </div>
  );
}
