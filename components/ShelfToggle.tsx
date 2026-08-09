"use client";

import { reducedMotion, scrollToEl } from "@/lib/smoothScroll";

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
        const card = document.querySelector(`[for="${id}"]`);
        const shelf = document.querySelector(`[data-shelf="${id}"]`);
        if (!card || !shelf) return;
        // One shelf at a time.
        const others = [...document.querySelectorAll<HTMLInputElement>(".shelf-toggle")].filter(
          (t) => t !== input && t.checked,
        );
        // Swapping shelves with the cards side by side needs no scroll at all:
        // every shelf sits below the whole row there, so the one closing and the
        // one opening trade height over the same 0.3s and the section — cards,
        // panel, everything — stays exactly where it is. Just let CSS run.
        if (others.length && window.matchMedia("(min-width: 768px)").matches) {
          others.forEach((t) => (t.checked = false));
          return;
        }
        // Stacked, the shelf being replaced sits above this card, so closing it
        // moves the card. Snap it shut rather than animating it away under a
        // scroll that is already running.
        const wasAt = card.getBoundingClientRect().top;
        others.forEach((t) => {
          const other = document.querySelector<HTMLElement>(`[data-shelf="${t.id}"]`);
          if (other) other.style.transition = "none";
          t.checked = false;
          if (!other) return;
          void other.offsetHeight;
          requestAnimationFrame(() => {
            other.style.transition = "";
          });
        });
        // Closing a shelf above this card pulls everything below it up by that
        // shelf's height — the jump the reader sees before the scroll even
        // starts. Take the same amount off the scroll position so the card
        // doesn't move at all, and the only motion left is the one we animate.
        const jumped = card.getBoundingClientRect().top - wasAt;
        if (jumped) window.scrollBy({ top: jumped, behavior: "instant" });
        // scrollToEl rather than behavior:"smooth" — native smooth is a silent
        // no-op in Chrome with smooth scrolling switched off, which left this
        // scroll doing nothing at all on those machines.
        const animating = !reducedMotion();
        // Aim at the card, not the shelf: the shelf drops in underneath it, so
        // this keeps the card the reader just tapped on screen above its books.
        const aim = () => scrollToEl(card);
        // A shelf is the last thing on the page, so until it has grown there
        // isn't enough page below the card to scroll it to the top — the scroll
        // would clamp short and need a second leg. Stand in for the shelf with a
        // spacer that is its full height from the start and shrinks on the same
        // curve as the shelf grows: the page is its final height throughout, so
        // one scroll reaches its mark, and nothing snaps when the spacer goes.
        if (animating) {
          // Books are laid out even while the shelf is collapsed, so its open
          // height is known: tallest spine + plank and padding + open margin.
          const spines = [...shelf.querySelectorAll(".book")].map(
            (b) => b.getBoundingClientRect().height,
          );
          const grow = Math.max(...spines) + 28 + 24;
          const stand = document.createElement("div");
          stand.setAttribute("aria-hidden", "true");
          stand.style.height = `${grow}px`;
          document.body.append(stand);
          // Measured each frame rather than transitioned to match: the shelf
          // stops growing once its content height is reached, a little before
          // its max-height animation ends, and a spacer running to its own clock
          // would give back that last slice as a twitch.
          const track = () => {
            // Shut again mid-drop: the shelf is on its way back to nothing and
            // will never claim the space, so stop holding it.
            if (!input.checked) return stand.remove();
            const grown =
              shelf.getBoundingClientRect().height +
              parseFloat(getComputedStyle(shelf).marginTop);
            const left = grow - grown;
            stand.style.height = `${Math.max(0, left)}px`;
            if (left > 0.5) requestAnimationFrame(track);
            else stand.remove();
          };
          requestAnimationFrame(track);
          // Backstop: frames stop coming in a hidden tab, and a spacer left
          // standing would hold the page taller than it is.
          window.setTimeout(() => stand.remove(), 1000);
        }
        aim();
      }}
    />
  );
}
