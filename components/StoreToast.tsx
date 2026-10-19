"use client";

import { useEffect, useState } from "react";

const KEY = "gsv:store-toast";

// OVERWORLD "achievement" toast pointing at the store. Shows 5s after load,
// once per visitor: closing it or following the link remembers that.
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
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
          <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
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
    </aside>
  );
}
