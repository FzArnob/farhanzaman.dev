import { useEffect, useRef } from 'react';
import { useScrollRig } from '../three/ScrollRig';
import { ACT_BY_ID, copyPresence, type ActId } from '../three/timeline';

/**
 * Fades an act's copy in and out in step with the scroll.
 *
 * Uses `copyPresence`, not `actPresence`: the copy windows do not overlap. An act's
 * text reaches zero before the next act's text leaves zero, so two headlines can
 * never be legible at once. Geometry still crossfades — a room should dissolve into
 * the next one — but text does not, because two paragraphs on top of each other is
 * unreadable no matter how pretty the transition is.
 *
 * Writes straight onto the element from a single rAF loop rather than through React
 * state. Sixty re-renders a second of the whole overlay would dominate the frame
 * budget, and it would break the rule that scroll is the only clock.
 */

interface Entry {
  el: HTMLElement;
  actId: ActId;
  /** Pixels of upward drift across the act. */
  drift: number;
}

const entries = new Set<Entry>();
let running = false;
let getT: (() => number) | null = null;

function loop() {
  if (!getT) {
    running = false;
    return;
  }
  const t = getT();
  entries.forEach(({ el, actId, drift }) => {
    const act = ACT_BY_ID[actId];
    const presence = copyPresence(t, act);
    el.style.opacity = presence.toFixed(3);
    /*
      Below a whisker of opacity the block leaves the layout entirely: it stops
      hit-testing, leaves the accessibility tree, and — the reason this matters —
      cannot overlap the incoming act even by a pixel of anti-aliased text.
    */
    el.style.visibility = presence < 0.015 ? 'hidden' : 'visible';
    if (drift) {
      const progress = (t - act.t0) / (act.t1 - act.t0);
      // A custom property, not `transform`: the centred acts compose this with their
      // own translate() and overwriting the whole property breaks them.
      el.style.setProperty('--drift', `${((0.5 - progress) * drift).toFixed(2)}px`);
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
      requestAnimationFrame(loop);
    }
  }, [rig]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const entry: Entry = { el, actId, drift };
    entries.add(entry);
    return () => {
      entries.delete(entry);
    };
  }, [actId, drift]);

  return ref;
}
