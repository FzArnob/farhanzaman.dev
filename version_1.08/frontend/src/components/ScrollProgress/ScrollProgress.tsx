import { useEffect, useRef } from 'react';
import { scroll } from 'motion';

/**
 * Document read-out along the top edge.
 *
 * `scroll()` binds to a ScrollTimeline where the browser supports one, so the bar
 * is driven off the main thread and costs nothing per frame.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = ref.current;
    if (!bar) return;
    return scroll((progress: number) => {
      bar.style.transform = `scaleX(${progress})`;
    });
  }, []);

  return <div id="scroll-progress" ref={ref} aria-hidden="true"></div>;
}
