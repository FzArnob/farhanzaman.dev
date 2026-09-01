/**
 * State the render loop owns, in a module that imports nothing.
 *
 * Two rules meet here. The render loop must never touch React state, so which blade is
 * at the readout and which core is at the front live in plain mutable objects. And the
 * DOM overlay has to read those values — but the overlay is in the app shell, which
 * must be bundled *without* three.js so it can paint before the 3D chunk has even been
 * requested.
 *
 * Both are satisfied by keeping this file dependency-free. The acts write to it, the
 * overlay polls it, and neither drags the other's bundle along.
 */

/** Act 01 — which designation beam is lit, and pointer parallax. -1 = none. */
export const prismFocus = { beam: -1, pointerX: 0, pointerY: 0 };

/** Act 02 — the qualification slab the overlay is hovering, by `kind-id`. */
export const spineFocus = { id: '' };

/** Act 03 — expertise node selection, hover, and drag momentum. */
export const latticeState = {
  selected: -1,
  hovered: -1,
  spin: 0,
  spinVelocity: 0,
};

/** Act 04 — the blade at the readout position. */
export const turbineState = { index: 0, frozen: false };

/** Act 05 — the core at the front of the ring, and how mid-handoff we are. */
export const forgeState = { index: 0, handoff: 0 };

/** Act 05b — how far the camera is into the opened chamber, 0..1. */
export const coreOpenState = { progress: 0 };

/** Act 06 — the certificate tile under the pointer. */
export const constellationState = { hovered: -1 };

/** Act 07 — the artwork under the pointer. */
export const galleryState = { hovered: -1 };

/** Act 07b — the clip tile under the pointer. */
export const arcadeState = { hovered: -1 };

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
