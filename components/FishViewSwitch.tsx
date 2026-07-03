"use client";
import { useState } from "react";

const VIEWS = ["list", "aquarium"] as const;

export default function FishViewSwitch({
  intro,
  list,
}: {
  intro: React.ReactNode;
  list: React.ReactNode;
}) {
  const [view, setView] = useState<(typeof VIEWS)[number]>("list");
  return (
    <>
      <div className="fg-switch" role="tablist" aria-label="Fish guide view">
        {VIEWS.map((v) => (
          <button
            key={v}
            role="tab"
            aria-selected={view === v}
            className={`fg-tab${view === v ? " active" : ""}`}
            onClick={() => setView(v)}
          >
            {v}
          </button>
        ))}
      </div>
      {intro}
      {/* ponytail: aquarium view intentionally blank for now */}
      {view === "list" && list}
    </>
  );
}
