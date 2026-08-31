import { useState } from 'react';
import type { Achievement } from '../../types/profile';

function AchievementNode({ data }: { data: Achievement }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={data.certification_url}
      className="achievement-node tooltip"
      target="_blank"
      rel="noreferrer"
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
    >
      <img className="achievement-node-image" src={data.certification_logo} data-tooltip={data.name} />
      <span
        className="tooltip-text"
        style={{ visibility: hovered ? 'visible' : 'hidden', opacity: hovered ? 1 : 0 }}
      >
        {data.name}
      </span>
    </a>
  );
}

export function Achievements({ achievements }: { achievements: Achievement[] }) {
  return (
    <div className="row" id="achievements">
      <div className="achievement-preview">
        {achievements.map((data) => (
          <AchievementNode key={data.achievement_id} data={data} />
        ))}
      </div>
    </div>
  );
}
