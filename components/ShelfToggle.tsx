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
        const card = document.querySelector(`[for="${id}"]`);
        if (!card) return;
        // One shelf at a time. The one being replaced closes instantly rather
        // than over the same 0.3s as this one opens — animating it would drag
        // the page along under a scroll that is already running.
        const wasAt = card.getBoundingClientRect().top;
        document.querySelectorAll<HTMLInputElement>(".shelf-toggle").forEach((t) => {
          if (t === input || !t.checked) return;
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
        const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth";
        // Aim at the card, not the shelf: the shelf drops in underneath it, so
        // this keeps the card the reader just tapped on screen above its books.
        const aim = () => card.scrollIntoView({ block: "start", behavior });
        // A shelf is the last thing on the page, so until it has grown there
        // isn't enough page below the card to scroll it to the top — the scroll
        // clamps short and has to finish in a second leg once the drop lands,
        // which reads as a stutter. Borrow the height up front instead, so one
        // smooth scroll runs alongside the drop, and give it back at the end.
        // ponytail: any reserve past the tallest shelf does; it's off-screen and
        // gone within the transition.
        const reserve = document.createElement("div");
        reserve.style.height = "400px";
        reserve.setAttribute("aria-hidden", "true");
        document.body.append(reserve);
        aim();
        // Give it back once the scroll has stopped, not when the drop ends: the
        // glide outlasts the 0.3s transition, and shortening the page under a
        // scroll still in flight makes it catch. scrollend is the honest signal;
        // the timeout covers engines that don't fire it.
        const done = () => {
          clearTimeout(timer);
          window.removeEventListener("scrollend", done);
          reserve.remove();
        };
        const timer = window.setTimeout(done, 1200);
        window.addEventListener("scrollend", done, { once: true });
      }}
    />
  );
}
