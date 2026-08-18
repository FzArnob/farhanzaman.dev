import { useEffect, useRef, useState } from 'react';
import { inView } from 'motion';
import { countUp } from '../../lib/motion/reveal';
import { getExpertiseLevel } from '../../lib/expertise';
import type { Skill } from '../../types/profile';

/**
 * How many bars fit: the full list on the expertise page, otherwise as many as the
 * column width allows. Measured once on mount, like the original.
 */
function barCount(skills: Skill[], extended: boolean): number {
  if (extended) return skills.length;
  return window.innerWidth <= 800
    ? Math.floor(window.innerWidth / 72)
    : Math.floor(window.innerWidth / 4 / 72);
}

export function SkillBars({ skills, extended }: { skills: Skill[]; extended: boolean }) {
  const [count] = useState(() => barCount(skills, extended));
  const visible = skills.slice(0, count);
  const containerRef = useRef<HTMLDivElement>(null);

  // The fill is CSS (driven by data-revealed); only the number needs JS.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const cancels: (() => void)[] = [];

    const stop = inView(
      container,
      () => {
        container.querySelectorAll<HTMLElement>('.bar-value').forEach((node, index) => {
          const target = Number(node.dataset.target || 0);
          cancels.push(countUp(node, target, 900 + index * 40, '%'));
        });
      },
      { amount: 0.2 }
    );

    return () => {
      stop();
      for (const cancel of cancels) cancel();
    };
  }, [visible.length]);

  return (
    <div
      id="skill-bars"
      ref={containerRef}
      className="expertize-bar skill-bars in-viewport"
      style={extended ? { maxHeight: 'none' } : undefined}
    >
      {visible.map((skill, index) => (
        <div
          className="bar"
          key={skill.skill_id}
          data-reveal="rise"
          data-reveal-delay={index * 40}
        >
          <div className="info">
            <span>{skill.name}</span>
            <span className="bar-meta">
              <span className="bar-level">{getExpertiseLevel(skill.percentage)}</span>
              <span className="bar-value" data-target={skill.percentage}>
                0%
              </span>
            </span>
          </div>
          <div className="progress-line">
            <span style={{ width: skill.percentage + '%' }}></span>
          </div>
        </div>
      ))}
    </div>
  );
}
