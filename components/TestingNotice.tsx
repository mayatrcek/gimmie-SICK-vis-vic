"use client";

import { useEffect, useState } from "react";

// bump the version suffix to show the notice again to everyone who dismissed it
const KEY = "gsv:testing-notice:v1";

// OVERWORLD modal: the site is in testing. Shows once — dismissing it is
// remembered in localStorage, so it never comes back on later loads.
export default function TestingNotice() {
  // starts closed and opens after mount: localStorage doesn't exist during SSR,
  // and this way a returning visitor never sees the modal flash up before the
  // stored dismissal is read.
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setOpen(true);
    } catch {
      setOpen(true); // storage blocked (private mode) → fall back to showing it
    }
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {} // dismissal just won't persist
  }

  if (!open) return null;
  return (
    <div className="tnote-scrim" onClick={dismiss}>
      <div className="tnote" role="dialog" aria-label="Testing notice" onClick={(e) => e.stopPropagation()}>
        <span className="tnote-badge">TESTING</span>
        <h3 className="tnote-ttl">Work in progress</h3>
        <p className="tnote-body">
          GIMMIE SICK VIS is still in testing — some features may not work yet or may change without
          warning. If something looks broken, <a href="/feedback">feedback</a> is highly valuable.
        </p>
        <button className="tnote-btn" onClick={dismiss} autoFocus>
          GOT IT
        </button>
      </div>
    </div>
  );
}
