import { useEffect, useRef } from 'react';
import TagCloud from 'TagCloud';
import { useWindowSize } from '../../hooks/useWindowSize';
import type { Expertise } from '../../types/profile';

/** Rotating 3D sphere of expertise names. Rebuilt on resize, as in the original. */
export function SkillCloud({ expertises }: { expertises: Expertise[] }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { width } = useWindowSize();

  useEffect(() => {
    const target = ref.current;
    if (!target) return;
    target.innerHTML = '';

    let radius: number;
    if (window.innerWidth <= 800) {
      radius = window.innerWidth / 2;
    } else {
      radius = window.innerWidth / 4;
      if (radius > 400) radius = 400;
    }

    const skillTags = expertises.map((item) => item.name);
    TagCloud('.skillTags', skillTags, {
      radius: radius,
      maxSpeed: 'normal',
      initSpeed: 'normal',
      direction: 135,
      keep: true,
    });

    const textSize =
      window.innerWidth <= 1400
        ? Math.floor((27 * radius) / 300)
        : Math.floor((22 * radius) / 300);
    const first = target.firstChild as HTMLElement | null;
    if (first) first.style.fontSize = textSize + 'px';

    return () => {
      target.innerHTML = '';
    };
  }, [expertises, width]);

  return <span id="skill-canvas" className="skillTags" ref={ref}></span>;
}
