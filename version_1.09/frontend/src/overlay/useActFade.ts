import { useEffect, useRef } from 'react';
import { useScrollRig } from '../three/ScrollRig';
import { ACT_BY_ID, actPresence, type ActId } from '../three/timeline';

/**
 * Fades a DOM block in step with its act.
 *
 * Writes opacity and transform straight onto the element from a single rAF loop rather
 * than driving them through React state. Sixty re-renders a second of the whole
 * overlay would dominate the frame budget and would fight the invariant that scroll is
 * the only clock — this way the copy is a pure function of `t` exactly like the
 * geometry is.
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
    const presence = actPresence(t, act, 0.035, 0.035);
    el.style.opacity = String(presence);
    // Fully faded blocks stop hit-testing and leave the a11y tree.
    el.style.visibility = presence < 0.02 ? 'hidden' : 'visible';
    if (drift) {
      const progress = (t - act.t0) / (act.t1 - act.t0);
      // A custom property, not `transform` — the centred act composes this with its
      // own translate(-50%,-50%) and overwriting the whole property broke that.
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
