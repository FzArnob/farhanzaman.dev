import { useEffect, useRef } from 'react';
import { useScrollRig } from '../stage/ScrollRig';
import { copyOwner, smooth, type ActId } from '../stage/timeline';

/**
 * Plays an act's copy in and out — on a clock, not on the scroll wheel.
 *
 * Scroll still decides WHOSE turn it is (`copyOwner`), but it no longer scrubs the
 * fade. It used to: opacity was a ramp over the first quarter of an act's window, so
 * arriving at a section put its headline on screen at a few percent and left it there
 * until you scrolled further. Stopping to read meant reading something half-drawn.
 *
 * Now reaching an act is the trigger and the animation runs itself. Park at the top of
 * Background and the block still fades up and settles in about half a second.
 *
 * The no-overlap rule survives, and is now structural rather than a matter of window
 * arithmetic: exactly one act is `showing` at a time, and the incoming block does not
 * start until the outgoing one has actually reached zero.
 *
 * Writes straight onto the element from a single rAF loop rather than through React
 * state — sixty re-renders a second of the whole overlay would dominate the frame
 * budget.
 */

interface Entry {
  el: HTMLElement;
  actId: ActId;
  /** Pixels the block rises through as it comes in. */
  drift: number;
  /** 0 → 1 animation progress, advanced by elapsed time. */
  p: number;
}

/** Milliseconds for the entrance, and for the quicker exit. */
const IN_MS = 520;
const OUT_MS = 240;

const entries = new Set<Entry>();
let running = false;
let getT: (() => number) | null = null;
let showing: ActId | null = null;
let last = 0;

function loop(now: number) {
  if (!getT) {
    running = false;
    return;
  }
  // Clamped so a backgrounded tab does not resume by snapping everything to its target.
  const dt = last ? Math.min(now - last, 64) : 16;
  last = now;

  const owner = copyOwner(getT());

  /*
    The handover. While the scroll owner differs from what is on screen, nothing is
    showing — which drives the outgoing block to zero — and the new act only takes
    over once that has actually finished. Scrolling fast through three acts therefore
    plays one exit and one entrance, not three of each.
  */
  if (owner !== showing) {
    let clear = true;
    entries.forEach((e) => {
      if (e.actId !== owner && e.p > 0.001) clear = false;
    });
    showing = clear ? owner : null;
  }

  entries.forEach((e) => {
    const entering = e.actId === showing;
    const step = dt / (entering ? IN_MS : OUT_MS);
    e.p = entering ? Math.min(1, e.p + step) : Math.max(0, e.p - step);

    const eased = smooth(e.p);
    e.el.style.opacity = eased.toFixed(3);
    /*
      Below a whisker of opacity the block leaves the layout entirely: it stops
      hit-testing, leaves the accessibility tree, and — the reason this matters —
      cannot overlap the incoming act even by a pixel of anti-aliased text.
    */
    e.el.style.visibility = eased < 0.015 ? 'hidden' : 'visible';
    if (e.drift) {
      // A custom property, not `transform`: the centred acts compose this with their
      // own translate() and overwriting the whole property breaks them.
      e.el.style.setProperty('--drift', `${((1 - eased) * e.drift).toFixed(2)}px`);
    }
  });

  requestAnimationFrame(loop);
}

export function useActFade(actId: ActId, drift = 0) {
  const ref = useRef<HTMLElement | null>(null);
  const rig = useScrollRig();

  useEffect(() => {
    getT = () => rig.state.current.t;
    if (!running) {
      running = true;
      last = 0;
      requestAnimationFrame(loop);
    }
  }, [rig]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const entry: Entry = { el, actId, drift, p: 0 };
    entries.add(entry);
    return () => {
      entries.delete(entry);
    };
  }, [actId, drift]);

  return ref;
}
