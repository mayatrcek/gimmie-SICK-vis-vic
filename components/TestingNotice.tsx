"use client";

import { useEffect, useState } from "react";

const KEY = "testing-notice-dismissed";

// One-time OVERWORLD modal: the site is in testing. Dismissal is remembered in
// localStorage so it only ever shows on a visitor's first load.
export default function TestingNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setOpen(true);
  }, []);

  function dismiss() {
    localStorage.setItem(KEY, "1");
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
