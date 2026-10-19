"use client";

import { useEffect, useState } from "react";

const KEY = "gsv:store-toast";

// OVERWORLD "achievement" toast pointing at the store. Shows 5s after load,
// once per visitor: closing it, following the link or letting the timer run
// out remembers that.
export default function StoreToast() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY)) return;
    } catch {}
    const t = setTimeout(() => setOpen(true), 5000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setOpen(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
  };

  if (!open) return null;
  return (
    <aside className="ow-toast" role="status">
      <div className="ow-toast__sticker" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
          <path d="M3 9 4.5 4h15L21 9M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M5 11.5V20h14v-8.5M10 20v-5h4v5" />
        </svg>
      </div>
      <div>
        <p className="ow-toast__eyebrow">New ▸ Store</p>
        <p className="ow-toast__title">Art by Maya</p>
        <p className="ow-toast__body">
          Prints and originals, now open.{" "}
          <a href="/store" onClick={dismiss}>Visit the store</a>
        </p>
      </div>
      <button className="ow-toast__close" aria-label="Close" onClick={dismiss}>×</button>
      {/* runs for a minute (see .ow-toast__progress), then closes the toast */}
      <div className="ow-toast__progress" aria-hidden="true" onAnimationEnd={dismiss} />
    </aside>
  );
}
