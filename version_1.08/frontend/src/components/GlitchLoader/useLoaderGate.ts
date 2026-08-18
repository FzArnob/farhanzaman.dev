import { useEffect, useRef, useState } from 'react';

/** Nothing appears for this long — a fast load should never flash a loader. */
const GRACE = 140;
/** Once it has appeared, hold it long enough for the glitch to actually read. */
const MIN_VISIBLE = 700;
/** Matches the loader-out keyframe in 24-motion.css. */
const EXIT = 320;

export interface LoaderGate {
  visible: boolean;
  exiting: boolean;
}

/**
 * Decides whether the loader is worth showing at all.
 *
 * The old behaviour was a mandatory one-second hold on every page view. Now the
 * loader only mounts if the page is still waiting after a short grace period, and
 * if it does mount it stays long enough not to flicker.
 */
export function useLoaderGate(ready: boolean): LoaderGate {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const shownAt = useRef(0);

  useEffect(() => {
    if (ready || visible) return;
    const timer = window.setTimeout(() => {
      shownAt.current = performance.now();
      setVisible(true);
    }, GRACE);
    return () => window.clearTimeout(timer);
  }, [ready, visible]);

  useEffect(() => {
    if (!ready || !visible) return;
    const held = performance.now() - shownAt.current;
    const wait = Math.max(MIN_VISIBLE - held, 0);

    const startExit = window.setTimeout(() => setExiting(true), wait);
    const unmount = window.setTimeout(() => {
      setVisible(false);
      setExiting(false);
    }, wait + EXIT);

    return () => {
      window.clearTimeout(startExit);
      window.clearTimeout(unmount);
    };
  }, [ready, visible]);

  return { visible, exiting };
}
