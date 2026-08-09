// Animated scroll that doesn't depend on the browser's native smooth scrolling.
// Chrome silently ignores behavior:"smooth" when smooth scrolling is switched
// off (a flag, and some OS animation settings) — the page simply doesn't move,
// which reads as a broken feature rather than a missing animation. So: tween it
// ourselves in rAF, which behaves the same everywhere.

const DUR = 420;
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let running = 0; // rAF id of the scroll in flight, so a new one supersedes it

// Scrolls `el` to the top of the viewport, honouring its CSS scroll-margin-top
// (that's what keeps cards clear of the sticky nav).
export function scrollToEl(el: Element) {
  cancelAnimationFrame(running);
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const from = window.scrollY;
  const to = Math.max(0, Math.min(max, from + el.getBoundingClientRect().top - margin));
  if (reducedMotion() || Math.abs(to - from) < 2) {
    window.scrollTo(0, to);
    return;
  }

  // Any real input wins — never fight the reader's own scroll.
  let cancelled = false;
  const stop = () => {
    cancelled = true;
  };
  const events = ["wheel", "touchstart", "keydown"] as const;
  events.forEach((e) => window.addEventListener(e, stop, { passive: true }));
  const cleanup = () => events.forEach((e) => window.removeEventListener(e, stop));

  const t0 = performance.now();
  const step = (now: number) => {
    if (cancelled) return cleanup();
    const t = Math.min(1, (now - t0) / DUR);
    window.scrollTo(0, from + (to - from) * easeOutCubic(t));
    if (t < 1) running = requestAnimationFrame(step);
    else cleanup();
  };
  running = requestAnimationFrame(step);
}
