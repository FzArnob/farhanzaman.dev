/**
 * Scroll reveal engine.
 *
 * Markup declares intent (`data-reveal="rise"`), CSS owns the actual transition,
 * and this file only decides *when* to flip the switch. That keeps every reveal on
 * the compositor and keeps the JS side to one IntersectionObserver per page.
 *
 *   <p  data-reveal="rise">…                       fade + 16px settle
 *   <h2 data-reveal="decode">…                     channel split resolving
 *   <ul data-reveal="stagger" data-reveal-from="center">…   children in sequence
 *
 * Extra knobs: `data-reveal-delay` (ms) and, on a stagger group,
 * `data-reveal-step` (ms per child).
 */

import { inView } from 'motion';
import { STAGGER_CAP, prefersReducedMotion } from './tokens';

/** Marks an element as already wired, so a re-scan is idempotent. */
const BOUND = 'revealBound';

function prepare(element: HTMLElement): void {
  const variant = element.dataset.reveal;
  if (variant !== 'stagger' && variant !== 'pop') return;

  // Children carry their own index; CSS turns it into a transition-delay so the
  // sequence costs nothing at runtime.
  const from = element.dataset.revealFrom;
  const children = Array.from(element.children) as HTMLElement[];
  const middle = (children.length - 1) / 2;

  children.forEach((child, index) => {
    const order =
      from === 'center'
        ? Math.round(Math.abs(index - middle))
        : from === 'end'
          ? children.length - 1 - index
          : index;
    child.style.setProperty('--rv-i', String(Math.min(order, STAGGER_CAP)));
  });
}

function show(element: HTMLElement): void {
  if (element.dataset.revealed === 'true') return;
  const delay = Number(element.dataset.revealDelay || 0);
  if (delay > 0) element.style.setProperty('--rv-delay', delay + 'ms');
  const step = Number(element.dataset.revealStep || 0);
  if (step > 0) element.style.setProperty('--rv-step', step + 'ms');
  element.dataset.revealed = 'true';
}

/**
 * Wires every `[data-reveal]` in the document that isn't wired yet.
 * Safe to call repeatedly — pages call it once revealed, and again after
 * appending content. Returns a teardown for the observer.
 */
export function initReveal(): () => void {
  const pending = Array.from(
    document.querySelectorAll<HTMLElement>('[data-reveal]')
  ).filter((element) => element.dataset[BOUND] !== 'true');

  if (pending.length === 0) return () => {};
  for (const element of pending) {
    element.dataset[BOUND] = 'true';
    prepare(element);
  }

  // Reduced motion still needs the end state applied — never leave content at
  // opacity 0 because the animation was skipped.
  if (prefersReducedMotion()) {
    for (const element of pending) {
      element.dataset.revealInstant = 'true';
      show(element);
    }
    return () => {};
  }

  // Anything already inside the viewport on load fires straight away, so
  // above-the-fold content never waits for a scroll that may not come.
  // No leave handler is returned: a reveal plays once and stays played.
  const stopObserver = inView(pending, (element) => show(element as HTMLElement), {
    amount: 0.15,
    margin: '0px 0px -48px 0px',
  });

  /**
   * Safety net. An observer can miss an element for reasons that have nothing to
   * do with the design — a container that scrolls instead of the document, a
   * layout that shifts as async content lands, an element sitting in the last few
   * pixels of the page. Content must never be left invisible because of that, so
   * a debounced sweep reveals anything whose box has entered the viewport. It
   * detaches itself once every element is accounted for.
   */
  let remaining = pending;
  let debounce = 0;

  const sweep = () => {
    remaining = remaining.filter((element) => {
      if (element.dataset.revealed === 'true') return false;
      if (!element.isConnected) return false;
      const box = element.getBoundingClientRect();
      const inside = box.top < window.innerHeight && box.bottom > 0;
      if (inside) {
        show(element);
        return false;
      }
      return true;
    });
    if (remaining.length === 0) detachSweep();
  };

  const onScroll = () => {
    window.clearTimeout(debounce);
    debounce = window.setTimeout(sweep, 160);
  };

  function detachSweep(): void {
    window.clearTimeout(debounce);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  // Once after layout settles, for content that was never scrolled past.
  debounce = window.setTimeout(sweep, 400);

  return () => {
    stopObserver();
    detachSweep();
  };
}

/**
 * Counts a number up while its element is on screen. Used by the skill meters
 * and the stat readouts; driven by the reveal state so it stays in step.
 */
export function countUp(
  element: HTMLElement,
  to: number,
  duration = 900,
  suffix = ''
): () => void {
  if (prefersReducedMotion()) {
    element.textContent = to + suffix;
    return () => {};
  }

  let raf = 0;
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min((now - start) / duration, 1);
    // easeOutExpo — lands softly on the final value
    const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    element.textContent = Math.round(to * eased) + suffix;
    if (t < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}
