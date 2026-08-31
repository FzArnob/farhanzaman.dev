import { useEffect, useState } from 'react';

export interface WindowSize {
  width: number;
  height: number;
}

/**
 * Tracks the viewport size. Several sections size themselves from window.innerWidth
 * and were regenerated on resize in the original app, so they re-render from this.
 */
export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));

  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return size;
}

/** The viewport height captured on first render — used for the full-screen intro spacer. */
export function useInitialViewportHeight(): number {
  const [height] = useState(() => window.innerHeight);
  return height;
}
