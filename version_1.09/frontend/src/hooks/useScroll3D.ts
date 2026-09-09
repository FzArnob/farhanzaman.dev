import { useEffect } from 'react';
import { clamp01, smooth } from '../stage/timeline';

/**
 * Scroll-driven 3D entrances for a flat page.
 *
 * The About page is v1.07's design, unchanged in structure — the same "Get To Know
 * Me" block, the same zig-zag qualification timeline, the same contact panel. What
 * v1.09 adds is depth: every block starts a few hundred pixels behind the screen,
 * tipped away from the reader, and rides forward into place as it enters the
 * viewport. It is the Prism world's language applied to a document.
 *
 * The perspective lives in each element's own `transform` (`perspective(...)` as a
 * transform function) rather than on a `perspective` property somewhere up the tree.
 * That matters here: the targets sit at four different depths of the existing markup,
 * and a parent `perspective` only reaches its direct children unless every element in
 * between opts into `preserve-3d`. Doing it per element means this hook can animate
 * anything on the page without the surrounding layout having to know about it.
 *
 * One rAF loop writes custom properties straight onto the nodes. No React state, no
 * IntersectionObserver thresholds: the transform is a continuous function of where
 * the element is, so it is correct at any scroll position including a mid-page reload.
 */

interface Spec {
  /** How far behind the screen the block starts, in px. */
  depth: number;
  /** How far below its resting place it starts, in px. */
  lift: number;
  /** Degrees of tip-back on the way in. */
  tiltX: number;
  /** Degrees of swing, signed — the timeline cards swing in from their own side. */
  tiltY: number;
}

const SPECS: Record<string, Spec> = {
  rise: { depth: 220, lift: 40, tiltX: 8, tiltY: 0 },
  // The hero comes from further out; it is the first thing seen and has the room.
  hero: { depth: 420, lift: 26, tiltX: 6, tiltY: 0 },
  swingLeft: { depth: 300, lift: 44, tiltX: 7, tiltY: 15 },
  swingRight: { depth: 300, lift: 44, tiltX: 7, tiltY: -15 },
};

interface Target extends Spec {
  el: HTMLElement;
}

/**
 * Where an element is in its entrance.
 *
 * 0 while its top edge is still at the bottom of the viewport, 1 once it has risen
 * through the lower 45% of the screen. Anything above that stays at 1 — this is an
 * entrance, not a scrubbing animation, so scrolling back past a block must not take
 * it apart again.
 */
function progress(el: HTMLElement): number {
  const top = el.getBoundingClientRect().top;
  const vh = window.innerHeight || 1;
  return clamp01((vh - top) / (vh * 0.45));
}

export function useScroll3D(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const targets: Target[] = [];

    const add = (el: Element, spec: Spec) => {
      const node = el as HTMLElement;
      node.classList.add('a3d');
      targets.push({ el: node, ...spec });
    };

    document.querySelectorAll('[data-a3d]').forEach((el) => {
      add(el, SPECS[(el as HTMLElement).dataset.a3d || 'rise'] ?? SPECS.rise);
    });

    if (!targets.length) return;

    let frame = 0;
    const tick = () => {
      for (const { el, depth, lift, tiltX, tiltY } of targets) {
        const eased = smooth(progress(el));
        const away = 1 - eased;
        const style = el.style;
        style.setProperty('--a3-z', (-depth * away).toFixed(1) + 'px');
        style.setProperty('--a3-y', (lift * away).toFixed(1) + 'px');
        style.setProperty('--a3-rx', (tiltX * away).toFixed(2) + 'deg');
        style.setProperty('--a3-ry', (tiltY * away).toFixed(2) + 'deg');
        // Never all the way to zero: a block that is completely invisible until it
        // is nearly in place reads as a loading failure on a slow scroll.
        style.setProperty('--a3-o', (0.12 + eased * 0.88).toFixed(3));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      for (const { el } of targets) {
        el.classList.remove('a3d');
        // Only the properties this hook set — some of these nodes carry inline
        // styles of their own from the v1.07 markup.
        for (const prop of ['--a3-z', '--a3-y', '--a3-rx', '--a3-ry', '--a3-o']) {
          el.style.removeProperty(prop);
        }
      }
    };
  }, [active]);
}
