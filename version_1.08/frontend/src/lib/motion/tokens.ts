/**
 * The one place motion numbers are written.
 *
 * Everything on the site shares this rhythm — durations by distance/complexity,
 * exits at ~60% of enters, one stagger step. The CSS half of the same table lives
 * in `styles/24-motion.css`; keep the two in sync.
 */

/** Seconds — Motion's `animate()` takes seconds, CSS takes ms. */
export const D = {
  instant: 0.09,
  fast: 0.16,
  base: 0.32,
  slow: 0.56,
  glitch: 0.22,
} as const;

type Bezier = [number, number, number, number];

export const EASE: Record<'enter' | 'exit' | 'soft' | 'back', Bezier> = {
  /** decelerate on arrival (≈ expo.out) */
  enter: [0.16, 1, 0.3, 1],
  /** accelerate on departure (≈ expo.in) */
  exit: [0.7, 0, 0.84, 0],
  /** colour + opacity */
  soft: [0.4, 0, 0.2, 1],
  /** slight overshoot for pop-ins */
  back: [0.34, 1.56, 0.64, 1],
};

/** Per-item stagger step, seconds. */
export const STAGGER = 0.04;
/** Items past this index share the last delay, so a long list never crawls in. */
export const STAGGER_CAP = 8;

/** Travel distances, px. Kept small — a reveal should read as a settle, not a slide. */
export const RISE = 16;
export const RISE_CARD = 24;
/** Maximum channel separation for the decode/glitch effect. */
export const SPLIT_MAX = 8;

/** Delay for the nth item in a staggered group, seconds. */
export function staggerDelay(index: number, step = STAGGER): number {
  return Math.min(index, STAGGER_CAP) * step;
}

let reducedMotion: boolean | null = null;

/**
 * True when the visitor asked for less motion. Cached after the first read and
 * kept live, because a system-level change should take effect without a reload.
 */
export function prefersReducedMotion(): boolean {
  if (reducedMotion === null) {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion = query.matches;
    query.addEventListener('change', (event) => {
      reducedMotion = event.matches;
    });
  }
  return reducedMotion;
}

/** True on touch/pen — the custom cursor and the sphere both stand down here. */
export function isCoarsePointer(): boolean {
  return window.matchMedia('(pointer: coarse)').matches;
}
