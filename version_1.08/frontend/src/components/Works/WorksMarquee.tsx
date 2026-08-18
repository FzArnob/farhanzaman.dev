import { useEffect, useRef } from 'react';
import { scroll } from 'motion';
import { prefersReducedMotion } from '../../lib/motion/tokens';
import { useWindowSize } from '../../hooks/useWindowSize';
import type { Project } from '../../types/profile';
import { WorkCard } from './WorkCard';

function columnsFor(width: number): number {
  switch (true) {
    case width >= 600 && width < 1200:
      return 2;
    case width >= 1200:
      return 3;
    default:
      return 2;
  }
}

/** Degrees of skew at full scroll speed. */
const MAX_SKEW = 3;

/**
 * The endlessly scrolling strip on the home page: pairs of cards stacked in holders,
 * with the whole run duplicated into a second span so the CSS animation can loop.
 *
 * Scroll velocity leans the strip — the faster you move, the more it skews and the
 * faster it runs, then it springs back to rest. One transform on one wrapper.
 */
export function WorksMarquee({ projects }: { projects: Project[] }) {
  const { width } = useWindowSize();
  const skewRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const numColumn = columnsFor(width);
  const buff = 2 * (numColumn + 1);
  const workCardWidth = Math.round(width / numColumn - buff / numColumn);
  const length = (numColumn + 1) * 2;
  const parentWidth = workCardWidth * (numColumn + 1) + buff;

  useEffect(() => {
    const skewLayer = skewRef.current;
    const inner = innerRef.current;
    if (!skewLayer || !inner || prefersReducedMotion()) return;

    let resetTimer = 0;

    return scroll((_progress: number, info: { y: { velocity: number } }) => {
      const velocity = info?.y?.velocity ?? 0;
      // 1500 px/s of scrolling ≈ full lean.
      const skew = Math.max(Math.min(velocity / 500, MAX_SKEW), -MAX_SKEW);
      skewLayer.style.transform = `skewX(${skew.toFixed(2)}deg)`;
      inner.style.animationDuration =
        (45 / (1 + Math.min(Math.abs(velocity) / 2500, 0.6))).toFixed(1) + 's';

      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        skewLayer.style.transform = 'skewX(0deg)';
        inner.style.animationDuration = '45s';
      }, 120);
    });
  }, []);

  const holders = [];
  for (let i = 0; i < length; i += 2) {
    holders.push(
      <div className="work-card-holder" key={i}>
        <WorkCard work={projects[i]} width={workCardWidth} index={i} />
        <WorkCard work={projects[i + 1]} width={workCardWidth} index={i + 1} noBottomBorder />
      </div>
    );
  }

  return (
    <div className="marquee-skew" ref={skewRef}>
      <div className="marquee" id="works" style={{ width: parentWidth + 'px' }}>
        <div className="marquee-inner" ref={innerRef} style={{ width: parentWidth * 2 + 'px' }}>
          <span>{holders}</span>
          <span>{holders}</span>
        </div>
      </div>
    </div>
  );
}
