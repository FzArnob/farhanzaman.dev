/**
 * Shared-element (FLIP) transitions.
 *
 * Used when a gallery thumbnail opens into the photo viewer: the big image starts
 * life sitting exactly on top of the thumbnail the visitor clicked, then travels to
 * its final place. One transform, no layout animation, so it stays on the compositor.
 */

import { animate } from 'motion/mini';
import { D, EASE, prefersReducedMotion } from './tokens';

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Snapshots an element's viewport box — the "First" half of FLIP. */
export function captureRect(element: Element | null): Rect | null {
  if (!element) return null;
  const box = element.getBoundingClientRect();
  return { top: box.top, left: box.left, width: box.width, height: box.height };
}

/**
 * Plays `target` in from where `from` used to be. Call once the target is in its
 * final position — this measures it, inverts the difference, and animates back to
 * identity. Returns a promise that settles when the travel finishes.
 */
export function flipFrom(target: HTMLElement, from: Rect | null): Promise<void> {
  if (!from || prefersReducedMotion()) return Promise.resolve();

  const to = target.getBoundingClientRect();
  if (to.width === 0 || to.height === 0) return Promise.resolve();

  const scaleX = from.width / to.width;
  const scaleY = from.height / to.height;
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height / 2 - (to.top + to.height / 2);

  // Sub-pixel differences aren't worth a frame of work.
  if (Math.abs(dx) < 2 && Math.abs(dy) < 2 && Math.abs(scaleX - 1) < 0.02) {
    return Promise.resolve();
  }

  const animation = animate(
    target,
    {
      transform: [
        `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`,
        'translate(0px, 0px) scale(1, 1)',
      ],
      opacity: [0.6, 1],
    },
    { duration: D.slow, ease: EASE.enter }
  );

  return animation.finished.then(() => {
    // Hand the element back to CSS — the viewer's own zoom/drag writes transform.
    target.style.transform = '';
    target.style.opacity = '';
  });
}
