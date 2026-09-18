/**
 * State the render loop owns, in a module that imports nothing.
 *
 * Two rules meet here. The render loop must never touch React state, so which word is
 * hovered and which crystal is at the front live in plain mutable objects. And the DOM
 * overlay has to read those values — but the overlay is in the app shell, which must
 * be bundled *without* three.js so it can paint before the 3D chunk is even requested.
 *
 * Both are satisfied by keeping this file dependency-free. The acts write to it, the
 * overlay polls it, and neither drags the other's bundle along.
 */

/** Act 01 — which designation beam is lit, and pointer parallax. -1 = none. */
export const prismFocus = { beam: -1, pointerX: 0, pointerY: 0 };

/*
  Act 02 has no entry here any more. It used to carry `spineFocus` so hovering an
  institute in the overlay could light its slab in the corridor; the overlay no longer
  lists the institutes at all — the blocks carry their own text and /about carries the
  full history — so there is nothing left on either end of that wire.
*/

/** Act 03 — the expertise tag sphere: hover, selection and drag momentum. */
export const cloudState = {
  /** The word under the pointer, or the last one tapped. -1 = none. */
  hovered: -1,
  spin: 0,
  spinVelocity: 0,
  count: 0,
};

/** Act 04 — the skill crystal swung to the front of the orbit, which the copy reads out. */
export const skillsState = { index: 0 };

/** Act 05 — the certificate tile under the pointer. */
export const constellationState = { hovered: -1 };

/**
 * Act 06 — the works ring.
 *
 * `expanded` is the "view all projects" state: the home view shows the five most
 * recent, and expanding opens the same ring up to every project rather than
 * navigating anywhere.
 */
export const worksState = {
  index: 0,
  handoff: 0,
  expanded: false,
  shown: 5,
  total: 0,
};

/** Act 05b — how far the camera is into an opened case study, 0..1. */
export const caseOpenState = { progress: 0 };

/** Act 07 — the artwork under the pointer, and whether the hall shows everything. */
export const galleryState = { hovered: -1, expanded: false, shown: 6, total: 0 };

/** Act 08 — the clip tile under the pointer. */
export const arcadeState = { hovered: -1, loaded: 0 };

/**
 * Act 09 — where the closing mark hangs this frame, so the shards can ring it rather
 * than gather at a fixed point the copy might be covering.
 */
export const contactMark = { x: 0, y: 0, z: -216, scale: 1 };

/**
 * The overlay's layout, as laid out — the one thing the stage reads back from the DOM.
 *
 * On a narrow screen the copy runs along the bottom of the frame, and the stage frames
 * each act's subject into the space above it (stage/framing.ts). ActSection and the
 * masthead write these whenever they change size; nothing here is polled per frame.
 * Positions are CSS px from the top left of the viewport, with the fade's drift left
 * out, so a block that is still easing in reports where it is going to be.
 */
export const layoutState = {
  /** The masthead row's bottom edge. 0 until measured. */
  ceiling: 0,
  copy: {} as Record<string, { top: number; left: number; right: number }>,
};

/**
 * Act 00 — the calibration clock. `progress` drives the curtain and the aberration
 * offset; `ready` shortens it once profile data is in hand; `skip` ends it now.
 */
export const boot = {
  progress: 0,
  done: false,
  ready: false,
  skipped: false,
  skip(): void {
    boot.skipped = true;
  },
};

/** Hot reload must not leave the boot clock parked at 1 with the curtain gone. */
if (import.meta.hot) {
  boot.progress = 0;
  boot.done = false;
  boot.skipped = false;
}
