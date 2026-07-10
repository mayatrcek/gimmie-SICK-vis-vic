"use client";

import { useState } from "react";

// OVERWORLD modal: the site is in testing. Shows on every full page load /
// refresh (state survives client-side route changes, so in-app navigation
// doesn't re-trigger it).
export default function TestingNotice() {
  const [open, setOpen] = useState(true);

  function dismiss() {
    setOpen(false);
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
