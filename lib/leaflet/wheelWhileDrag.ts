import L from "leaflet";

// Wheel-zoom during an active drag fights Draggable's stale pane transforms —
// the map lurches instead of zooming. On the first wheel tick we end the drag
// (no inertia) so the built-in scrollWheelZoom takes over cleanly, then, while
// the button stays held, restart the drag on the next mousemove so panning
// continues in the same hold. _onDown ignores the restart while the zoom
// animation runs (leaflet-zoom-anim on the pane), so we retry per mousemove
// until it takes or the button is released.
// ponytail: touches leaflet's private _draggable — recheck on leaflet upgrades
type FakeDown = { type: string; which: number; button: number; shiftKey: boolean; clientX: number; clientY: number };
type Draggable = { finishDrag: (noInertia?: boolean) => void; _onDown: (e: FakeDown) => void };
type Drag = L.Handler & { moving?: () => boolean; _draggable?: Draggable };

L.Map.addInitHook(function (this: L.Map) {
  this.getContainer().addEventListener(
    "wheel",
    () => {
      const drag = this.dragging as Drag;
      const d = drag?._draggable;
      if (!d || !drag.moving?.()) return;
      d.finishDrag(true);

      const done = () => {
        document.removeEventListener("mousemove", rearm, true);
        document.removeEventListener("mouseup", done, true);
      };
      const rearm = (e: MouseEvent) => {
        if (!(e.buttons & 1)) return done();
        const dragging = (L.Draggable as unknown as { _dragging?: unknown })._dragging;
        if (dragging) return done(); // drag re-established (or another began)
        d._onDown({ type: "mousedown", which: 1, button: 0, shiftKey: false, clientX: e.clientX, clientY: e.clientY });
      };
      document.addEventListener("mousemove", rearm, true);
      document.addEventListener("mouseup", done, true);
    },
    { capture: true, passive: true },
  );
});
