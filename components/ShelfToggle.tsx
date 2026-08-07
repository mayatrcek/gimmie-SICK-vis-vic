"use client";

// The checkbox that drives a bookshelf card (see .shelf in home.css). A client
// island purely so opening one can scroll its shelf into view — the rest of the
// homepage stays a server component.
export default function ShelfToggle({ id }: { id: string }) {
  return (
    <input
      type="checkbox"
      id={id}
      className="shelf-toggle sr-only"
      onChange={(e) => {
        const input = e.currentTarget;
        if (!input.checked) return;
        // One shelf at a time — the others close (and animate shut) on the way.
        document.querySelectorAll<HTMLInputElement>(".shelf-toggle").forEach((t) => {
          if (t !== input) t.checked = false;
        });
        const shelf = document.querySelector(`[data-shelf="${id}"]`);
        if (!shelf) return;
        const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth";
        // Aim at the shelf's top rather than its middle: the box is still
        // collapsed here so its height is unknown, but its top only moves by the
        // margin that .shelf's scroll-margin already accounts for.
        const aim = () => shelf.scrollIntoView({ block: "start", behavior });
        // The scroll starts with the drop so the two read as one motion, then
        // finishes when it lands — a shelf is the last thing on the page, so
        // until it has grown there isn't enough page below to scroll that far
        // and the first pass gets clamped short.
        aim();
        shelf.addEventListener("transitionend", function done(ev) {
          if ((ev as TransitionEvent).propertyName !== "max-height") return;
          shelf.removeEventListener("transitionend", done);
          // Shut again mid-drop? Then this is the closing transition landing,
          // and scrolling to a shelf the reader just dismissed is rude.
          if (input.checked) aim();
        });
      }}
    />
  );
}
