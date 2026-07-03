"use client";
import { useEffect } from "react";

// Quick-scroll: a single wheel-down while sitting at the top of the page
// flicks smoothly down to the target section instead of inching through the hero.
// ponytail: wheel-only — trackpad/mouse. Touch swipes keep native scrolling.
export default function QuickScroll({ to }: { to: string }) {
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0 && window.scrollY < 40) {
        e.preventDefault();
        document.getElementById(to)?.scrollIntoView({ behavior: "smooth" });
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [to]);
  return null;
}
