import { useEffect, useRef, useState } from 'react';

/**
 * Watches a value that the render loop owns.
 *
 * The acts publish their live index into a plain module object — which blade is at the
 * readout, which core is at the front, which tile is hovered — because the render loop
 * must not touch React state. The overlay still needs to know, so it samples that
 * object once a frame and re-renders only when the value actually changes. A cheap
 * comparison per frame, and a render only at human speed.
 */
export function usePolled<T>(read: () => T): T {
  const [value, setValue] = useState<T>(read);
  const last = useRef(value);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const next = read();
      if (next !== last.current) {
        last.current = next;
        setValue(next);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // `read` is expected to be a stable module-state getter.
  }, [read]);

  return value;
}
