import { useState } from 'react';
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

  return (
    <div
      id="skill-bars"
      className="expertize-bar skill-bars in-viewport"
      style={extended ? { maxHeight: 'none' } : undefined}
    >
      {visible.map((skill) => (
        <div className="bar" key={skill.skill_id}>
          <div className="info">
            <span>{skill.name}</span>
          </div>
          <div className="progress-line">
            <span
              style={{ width: skill.percentage + '%' }}
              data-value={getExpertiseLevel(skill.percentage)}
            ></span>
          </div>
        </div>
      ))}
    </div>
  );
}
