"use client";

import { useEffect, useState } from "react";

// Snaggletooth corner mascot: tap to reveal the page's info text with a slow
// typewriter effect. Render inside .panel-hd — the button anchors to the
// header's corner and the note joins the header's flex flow as its own
// full-width row (see .snaggle-note in overworld.css).
// `children` is optional rich content (links etc.) swapped in once the plain
// `text` finishes typing; it should read identically to `text`.
export default function SnaggleInfo({
  text,
  children,
}: {
  text: string;
  children?: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  const [reveal, setReveal] = useState(0);
  useEffect(() => {
    if (!show) return;
    const id = setInterval(() => {
      setReveal((r) => {
        if (r >= text.length) {
          clearInterval(id);
          return r;
        }
        return r + 3;
      });
    }, 30);
    return () => clearInterval(id);
  }, [show, text]);
  const done = reveal >= text.length;
  return (
    <>
      <button
        type="button"
        className="snaggle-info-btn"
        aria-expanded={show}
        aria-label={show ? "Hide info" : "Show info"}
        onClick={() => {
          setShow((v) => !v);
          setReveal(0); // replay the reveal from the top on each open
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/brand/Snaggletooth Hover.gif" alt="" />
      </button>
      {show && (
        <div className="snaggle-note">
          <span className="snaggle-note-txt">
            {done ? (children ?? text) : <span aria-hidden="true">{text.slice(0, reveal)}</span>}
          </span>
        </div>
      )}
    </>
  );
}
